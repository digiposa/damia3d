import { settings } from "./settings";
import { playSynth } from "./synth";

/**
 * Sound: a tiny WebAudio engine. Effects live in `src/assets/audio/sfx/` (MP3, mono, named by
 * what they are) and are fetched + decoded on first use, then kept. Everything hangs off one
 * master gain with a music bus and an effects bus, so the Options volumes and the mute apply
 * live. The browser only lets audio start after a user gesture: the engine arms itself on the
 * first pointer / key event and quietly drops anything asked for before that.
 */
const SFX_URLS = import.meta.glob("../assets/audio/sfx/*.mp3", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const MUSIC_URLS = import.meta.glob("../assets/audio/music/*.mp3", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

/** Resolve an effect's bundled URL from its base filename (no extension). */
export function sfxUrl(name: string): string | undefined {
  return SFX_URLS[`../assets/audio/sfx/${name}.mp3`];
}

/** Resolve a music track's bundled URL from its base filename (no extension). */
export function musicUrl(name: string): string | undefined {
  return MUSIC_URLS[`../assets/audio/music/${name}.mp3`];
}

/** Seconds a track takes to fade in / out when switching. */
const MUSIC_FADE = 1.2;

export interface PlayOptions {
  /** Linear gain on top of the effects volume (1 = as recorded). */
  volume?: number;
  /** Playback rate (1 = as recorded); a touch of random spread is added on top (`jitter`). */
  rate?: number;
  /** ± random spread of the playback rate, so a repeated effect doesn't sound stamped. */
  jitter?: number;
  /** World distance from the listener (the hero); far sounds fade (none = at the hero). */
  distance?: number;
}

class AudioEngine {
  private ctx?: AudioContext;
  private master?: GainNode;
  private musicBus?: GainNode;
  private sfxBus?: GainNode;
  private readonly buffers = new Map<string, Promise<AudioBuffer | undefined>>();
  /** Effects played so far (for tests and the tech overlay). */
  played = 0;
  /** The track playing (its name, source and own gain), and the one asked for before the engine
   *  could start (it starts on the first gesture). */
  private music?: { name: string; src: AudioBufferSourceNode; gain: GainNode; startedAt: number };
  private musicWanted?: string;
  private musicSerial = 0;
  /** A set of tracks played one after another at random (the arena), none looped. */
  private playlist?: string[];
  /** What played before {@link pushMusic} put the menu theme over it (restored by popMusic), and
   *  how far into the track it was, so it picks up where it left off. */
  private saved?: { name?: string; playlist?: string[]; offset: number };

  constructor() {
    if (typeof window === "undefined") return;
    const arm = (): void => {
      this.unlock();
    };
    window.addEventListener("pointerdown", arm, { passive: true });
    window.addEventListener("keydown", arm, { passive: true });
    window.addEventListener("touchstart", arm, { passive: true });
  }

  /** Create (or resume) the context — only valid inside a user gesture; safe to call any time. */
  unlock(): void {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.musicBus = this.ctx.createGain();
      this.sfxBus = this.ctx.createGain();
      this.musicBus.connect(this.master);
      this.sfxBus.connect(this.master);
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    this.applyVolumes();
    if (this.playlist && !this.music) this.playMusicList(this.playlist);
    else if (this.musicWanted && !this.music) this.playMusic(this.musicWanted);
  }

  /** True once the browser lets us make sound. */
  get ready(): boolean {
    return !!this.ctx && this.ctx.state === "running";
  }

  /** Push the Options volumes (and the mute) onto the buses; cheap, called on every play and
   *  whenever the settings screen changes them. */
  applyVolumes(): void {
    if (!this.ctx || !this.master || !this.musicBus || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(settings.soundEnabled ? 1 : 0, t, 0.02);
    this.musicBus.gain.setTargetAtTime(settings.musicVolume, t, 0.02);
    this.sfxBus.gain.setTargetAtTime(settings.sfxVolume, t, 0.02);
  }

  /** Fetch + decode an effect once (later calls share the promise). Needs the context. */
  private load(name: string, kind: "sfx" | "music" = "sfx"): Promise<AudioBuffer | undefined> {
    const key = `${kind}:${name}`;
    let p = this.buffers.get(key);
    if (!p) {
      const url = kind === "music" ? musicUrl(name) : sfxUrl(name);
      const ctx = this.ctx;
      p =
        url && ctx
          ? fetch(url)
              .then((r) => r.arrayBuffer())
              .then((data) => ctx.decodeAudioData(data))
              .catch((err: unknown) => {
                console.warn(`[audio] could not load ${name}`, err);
                return undefined;
              })
          : Promise.resolve(undefined);
      this.buffers.set(key, p);
    }
    return p;
  }

  /** The track now playing (its name), if any. */
  get musicPlaying(): string | undefined {
    return this.music?.name ?? this.musicWanted;
  }

  /**
   * Play a track (looped), fading the previous one out and this one in. The same track again is
   * left alone. Before the first gesture the request is kept and honoured once the engine starts.
   */
  playMusic(name: string): void {
    this.saved = undefined;
    this.playlist = undefined;
    this.startTrack(name, true);
  }

  /**
   * Play a track (looped) over whatever was playing, remembering it: the menu theme while the
   * System menu is open in a game. {@link popMusic} brings the previous music back.
   */
  pushMusic(name: string): void {
    if (this.saved) return; // already pushed: keep the music to come back to
    const cur = this.music;
    let offset = 0;
    if (cur && this.ctx) {
      offset = Math.max(0, this.ctx.currentTime - cur.startedAt);
      const dur = cur.src.buffer?.duration ?? 0;
      if (cur.src.loop && dur > 0) offset %= dur;
    }
    this.saved = { name: this.musicWanted, playlist: this.playlist, offset };
    this.playlist = undefined;
    this.startTrack(name, true);
  }

  /** Bring back what played before {@link pushMusic}: the same track from where it was (its list,
   *  if it came from one, goes on after it), or silence. */
  popMusic(): void {
    const s = this.saved;
    if (!s) return;
    this.saved = undefined;
    if (s.playlist) {
      this.playlist = s.playlist;
      if (s.name) this.startTrack(s.name, false, s.offset);
      else this.playMusicList(s.playlist);
    } else if (s.name) this.startTrack(s.name, true, s.offset);
    else this.stopMusic();
  }

  /**
   * Play the tracks of a list one after another, each drawn at random (never the same twice in a
   * row), none looped: when one ends the next starts. The arena's battle music.
   */
  playMusicList(names: string[]): void {
    this.saved = undefined;
    this.playlist = names;
    const cur = this.music?.name ?? this.musicWanted;
    const pool = names.length > 1 ? names.filter((n) => n !== cur) : names;
    this.startTrack(pool[Math.floor(Math.random() * pool.length)], false);
  }

  private startTrack(name: string, loop: boolean, offset = 0): void {
    this.musicWanted = name;
    if (!this.ctx || !this.musicBus) return;
    if (this.music?.name === name && this.music.src.loop === loop) return;
    const ctx = this.ctx;
    const bus = this.musicBus;
    const serial = ++this.musicSerial;
    this.fadeOutCurrent();
    void this.load(name, "music").then((buffer) => {
      if (!buffer || serial !== this.musicSerial) return; // superseded meanwhile
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = loop;
      src.onended = () => {
        // The track ran out (not faded out by a switch): the list goes on with another one.
        if (this.music?.src !== src || !this.playlist) return;
        this.music = undefined;
        this.playMusicList(this.playlist);
      };
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(1, ctx.currentTime + MUSIC_FADE);
      src.connect(gain);
      gain.connect(bus);
      const at = offset > 0 && offset < buffer.duration - 1 ? offset : 0;
      src.start(0, at);
      this.music = { name, src, gain, startedAt: ctx.currentTime - at };
    });
  }

  /** Fade the music out over `fade` seconds and stop it (leaving a map, back to the menu). */
  stopMusic(fade = MUSIC_FADE): void {
    this.saved = undefined;
    this.musicWanted = undefined;
    this.playlist = undefined;
    this.musicSerial += 1;
    this.fadeOutCurrent(fade);
  }

  private fadeOutCurrent(fade = MUSIC_FADE): void {
    const cur = this.music;
    if (!cur || !this.ctx) return;
    this.music = undefined;
    const t = this.ctx.currentTime;
    cur.gain.gain.cancelScheduledValues(t);
    cur.gain.gain.setValueAtTime(cur.gain.gain.value, t);
    cur.gain.gain.linearRampToValueAtTime(0, t + fade);
    cur.src.stop(t + fade + 0.05);
  }

  /** Warm the cache for effects a scene will need (no-op before the first gesture). */
  preload(names: string[]): void {
    if (!this.ctx) return;
    for (const n of names) void this.load(n);
  }

  /** Play an effect by name. Dropped silently before the first gesture or when muted. */
  playSfx(name: string, opts: PlayOptions = {}): void {
    if (!settings.soundEnabled || !this.ctx || !this.sfxBus) return;
    const ctx = this.ctx;
    const bus = this.sfxBus;
    const startedAt = ctx.currentTime;
    if (!sfxUrl(name)) {
      // No recording of that name: the synthesized recipe, if there is one (see synth.ts).
      this.applyVolumes();
      let v = opts.volume ?? 1;
      if (opts.distance !== undefined) v *= Math.max(0.15, Math.min(1, 1 - (opts.distance - 4) / 16));
      const jitter = opts.jitter ?? 0.04;
      const rate = (opts.rate ?? 1) * (1 + (Math.random() * 2 - 1) * jitter);
      if (playSynth(name, ctx, bus, { rate, volume: v })) this.played += 1;
      return;
    }
    void this.load(name).then((buffer) => {
      if (!buffer || ctx.currentTime - startedAt > 0.6) return; // too late to be the sound of that moment
      this.applyVolumes();
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const jitter = opts.jitter ?? 0.04;
      src.playbackRate.value = (opts.rate ?? 1) * (1 + (Math.random() * 2 - 1) * jitter);
      const gain = ctx.createGain();
      let v = opts.volume ?? 1;
      if (opts.distance !== undefined) v *= Math.max(0.15, Math.min(1, 1 - (opts.distance - 4) / 16));
      gain.gain.value = v;
      src.connect(gain);
      gain.connect(bus);
      src.start();
      this.played += 1;
    });
  }
}

/** The one engine (module singleton). */
export const audio = new AudioEngine();
