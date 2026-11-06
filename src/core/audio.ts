import { settings } from "./settings";

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

/** Resolve an effect's bundled URL from its base filename (no extension). */
export function sfxUrl(name: string): string | undefined {
  return SFX_URLS[`../assets/audio/sfx/${name}.mp3`];
}

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
  private load(name: string): Promise<AudioBuffer | undefined> {
    let p = this.buffers.get(name);
    if (!p) {
      const url = sfxUrl(name);
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
      this.buffers.set(name, p);
    }
    return p;
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
