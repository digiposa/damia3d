/**
 * Synthesized sound effects (WebAudio, no files): the percussive and abstract sounds a fight
 * needs, in one retro-leaning style. Each effect is a short recipe of noise bursts and tones. The
 * audio engine plays one of these when no MP3 of the same name exists, so a real recording
 * dropped into `src/assets/audio/sfx/` under that name replaces it with no code change.
 */

export interface SynthOptions {
  /** Pitch multiplier (1 = as designed). */
  rate: number;
  /** Linear gain multiplier. */
  volume: number;
}

type Recipe = (ctx: AudioContext, out: AudioNode, o: SynthOptions) => void;

let noiseBuffer: AudioBuffer | undefined;
function noise(ctx: AudioContext): AudioBuffer {
  if (!noiseBuffer || noiseBuffer.sampleRate !== ctx.sampleRate) {
    const n = ctx.sampleRate; // one second of white noise, looped as needed
    noiseBuffer = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = noiseBuffer.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

interface Env {
  /** Seconds to peak and total length. */
  attack?: number;
  dur: number;
  gain: number;
}

/** A gain envelope: quick attack, exponential decay to silence over `dur`. */
function envelope(ctx: AudioContext, out: AudioNode, e: Env, volume: number): GainNode {
  const g = ctx.createGain();
  const t = ctx.currentTime;
  const a = e.attack ?? 0.005;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(e.gain * volume, t + a);
  // A body, then a tail: down to a tenth over the first two thirds, then out.
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, e.gain * volume * 0.1), t + a + (e.dur - a) * 0.66);
  g.gain.linearRampToValueAtTime(0.0001, t + e.dur);
  g.connect(out);
  return g;
}

/** A burst of filtered noise whose filter sweeps from `f0` to `f1`. */
function noiseBurst(ctx: AudioContext, out: AudioNode, o: SynthOptions, p: { type: BiquadFilterType; f0: number; f1: number; q?: number } & Env): void {
  const src = ctx.createBufferSource();
  src.buffer = noise(ctx);
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = p.type;
  f.Q.value = p.q ?? 1;
  const t = ctx.currentTime;
  f.frequency.setValueAtTime(Math.max(20, p.f0 * o.rate), t);
  f.frequency.exponentialRampToValueAtTime(Math.max(20, p.f1 * o.rate), t + p.dur);
  src.connect(f);
  f.connect(envelope(ctx, out, p, o.volume));
  src.start(t);
  src.stop(t + p.dur + 0.05);
}

/** A tone sweeping from `f0` to `f1` Hz. */
function tone(ctx: AudioContext, out: AudioNode, o: SynthOptions, p: { type: OscillatorType; f0: number; f1?: number; delay?: number } & Env): void {
  const osc = ctx.createOscillator();
  osc.type = p.type;
  const t = ctx.currentTime + (p.delay ?? 0);
  osc.frequency.setValueAtTime(p.f0 * o.rate, t);
  if (p.f1) osc.frequency.exponentialRampToValueAtTime(p.f1 * o.rate, t + p.dur);
  const g = ctx.createGain();
  const a = p.attack ?? 0.005;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(p.gain * o.volume, t + a);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, p.gain * o.volume * 0.1), t + a + (p.dur - a) * 0.66);
  g.gain.linearRampToValueAtTime(0.0001, t + p.dur);
  osc.connect(g);
  g.connect(out);
  osc.start(t);
  osc.stop(t + p.dur + 0.05);
}

/** A few notes in a row (an arpeggio), each a short sine. */
function notes(ctx: AudioContext, out: AudioNode, o: SynthOptions, freqs: number[], step: number, dur: number, gain: number, type: OscillatorType = "sine"): void {
  freqs.forEach((f, i) => tone(ctx, out, o, { type, f0: f, dur, gain, delay: i * step }));
}

export const RECIPES: Record<string, Recipe> = {
  // --- Blades and blows ---
  sword_swing: (ctx, out, o) => noiseBurst(ctx, out, o, { type: "bandpass", f0: 1800, f1: 350, q: 1.2, dur: 0.2, gain: 0.45, attack: 0.02 }),
  hit_flesh: (ctx, out, o) => {
    noiseBurst(ctx, out, o, { type: "lowpass", f0: 1400, f1: 200, dur: 0.14, gain: 0.5 });
    tone(ctx, out, o, { type: "sine", f0: 140, f1: 45, dur: 0.16, gain: 0.6 });
  },
  hit_heavy: (ctx, out, o) => {
    noiseBurst(ctx, out, o, { type: "lowpass", f0: 1200, f1: 120, dur: 0.3, gain: 0.5 });
    tone(ctx, out, o, { type: "sine", f0: 110, f1: 30, dur: 0.32, gain: 0.6 });
  },
  guard_block: (ctx, out, o) => {
    tone(ctx, out, o, { type: "triangle", f0: 2600, f1: 2200, dur: 0.14, gain: 0.3 });
    tone(ctx, out, o, { type: "sine", f0: 3900, f1: 3500, dur: 0.1, gain: 0.15 });
    noiseBurst(ctx, out, o, { type: "highpass", f0: 3000, f1: 5000, dur: 0.08, gain: 0.25 });
  },
  hurt: (ctx, out, o) => {
    noiseBurst(ctx, out, o, { type: "lowpass", f0: 900, f1: 150, dur: 0.22, gain: 0.45 });
    tone(ctx, out, o, { type: "sine", f0: 200, f1: 60, dur: 0.2, gain: 0.5 });
  },
  // --- Timing ---
  timing_ok: (ctx, out, o) => notes(ctx, out, o, [660, 990], 0.06, 0.09, 0.25),
  timing_perfect: (ctx, out, o) => notes(ctx, out, o, [660, 990, 1320, 1760], 0.055, 0.12, 0.25),
  timing_miss: (ctx, out, o) => tone(ctx, out, o, { type: "square", f0: 220, f1: 90, dur: 0.28, gain: 0.18 }),
  dial_tick: (ctx, out, o) => tone(ctx, out, o, { type: "sine", f0: 880, f1: 1000, dur: 0.07, gain: 0.3 }),
  // --- Dragoon ---
  transform: (ctx, out, o) => {
    tone(ctx, out, o, { type: "sawtooth", f0: 180, f1: 1500, dur: 0.7, gain: 0.18, attack: 0.1 });
    tone(ctx, out, o, { type: "sine", f0: 360, f1: 3000, dur: 0.7, gain: 0.15, attack: 0.1 });
    noiseBurst(ctx, out, o, { type: "bandpass", f0: 600, f1: 6000, q: 0.8, dur: 0.8, gain: 0.25, attack: 0.2 });
    notes(ctx, out, o, [523, 659, 784, 1047], 0.12, 0.3, 0.12);
  },
  revert: (ctx, out, o) => {
    tone(ctx, out, o, { type: "sine", f0: 1600, f1: 200, dur: 0.5, gain: 0.15, attack: 0.05 });
    noiseBurst(ctx, out, o, { type: "bandpass", f0: 3000, f1: 300, q: 0.8, dur: 0.5, gain: 0.15, attack: 0.05 });
  },
  fire_shot: (ctx, out, o) => {
    noiseBurst(ctx, out, o, { type: "bandpass", f0: 300, f1: 1800, q: 0.9, dur: 0.35, gain: 0.4, attack: 0.03 });
    tone(ctx, out, o, { type: "sine", f0: 90, f1: 260, dur: 0.3, gain: 0.25, attack: 0.03 });
  },
  fire_burst: (ctx, out, o) => {
    noiseBurst(ctx, out, o, { type: "lowpass", f0: 3000, f1: 150, dur: 0.6, gain: 0.5, attack: 0.01 });
    tone(ctx, out, o, { type: "sine", f0: 80, f1: 28, dur: 0.5, gain: 0.5 });
  },
  fire_trail: (ctx, out, o) => {
    noiseBurst(ctx, out, o, { type: "lowpass", f0: 400, f1: 900, dur: 0.9, gain: 0.4, attack: 0.1 });
    tone(ctx, out, o, { type: "sawtooth", f0: 55, f1: 70, dur: 0.9, gain: 0.12, attack: 0.1 });
  },
  fire_shell: (ctx, out, o) => {
    noiseBurst(ctx, out, o, { type: "bandpass", f0: 250, f1: 1200, q: 0.7, dur: 0.6, gain: 0.35, attack: 0.05 });
    tone(ctx, out, o, { type: "sine", f0: 60, f1: 160, dur: 0.6, gain: 0.3, attack: 0.05 });
  },
  dragon_roar: (ctx, out, o) => {
    tone(ctx, out, o, { type: "sawtooth", f0: 60, f1: 130, dur: 1.3, gain: 0.3, attack: 0.15 });
    tone(ctx, out, o, { type: "square", f0: 92, f1: 70, dur: 1.2, gain: 0.12, attack: 0.2 });
    noiseBurst(ctx, out, o, { type: "lowpass", f0: 500, f1: 1500, dur: 1.3, gain: 0.3, attack: 0.2 });
  },
  magic_burst: (ctx, out, o) => {
    noiseBurst(ctx, out, o, { type: "bandpass", f0: 1500, f1: 300, q: 0.8, dur: 0.45, gain: 0.45 });
    notes(ctx, out, o, [392, 523, 659], 0.04, 0.35, 0.15, "triangle");
  },
  wind_charge: (ctx, out, o) => {
    noiseBurst(ctx, out, o, { type: "bandpass", f0: 500, f1: 2400, q: 0.6, dur: 1.4, gain: 0.3, attack: 0.4 });
    tone(ctx, out, o, { type: "sine", f0: 220, f1: 660, dur: 1.4, gain: 0.08, attack: 0.4 });
  },
  wind_rush: (ctx, out, o) => {
    noiseBurst(ctx, out, o, { type: "highpass", f0: 900, f1: 300, q: 0.7, dur: 0.6, gain: 0.5, attack: 0.03 });
    noiseBurst(ctx, out, o, { type: "bandpass", f0: 3000, f1: 800, q: 1.5, dur: 0.5, gain: 0.3, attack: 0.02 });
  },
  // --- Items and interface ---
  throw: (ctx, out, o) => noiseBurst(ctx, out, o, { type: "highpass", f0: 800, f1: 2500, dur: 0.16, gain: 0.3, attack: 0.02 }),
  heal: (ctx, out, o) => notes(ctx, out, o, [523, 659, 784, 1047], 0.09, 0.45, 0.16),
  menu_open: (ctx, out, o) => tone(ctx, out, o, { type: "sine", f0: 520, f1: 780, dur: 0.09, gain: 0.2 }),
  menu_close: (ctx, out, o) => tone(ctx, out, o, { type: "sine", f0: 780, f1: 520, dur: 0.09, gain: 0.2 }),
  confirm: (ctx, out, o) => notes(ctx, out, o, [880, 1320], 0.05, 0.08, 0.2),
  cancel: (ctx, out, o) => tone(ctx, out, o, { type: "square", f0: 320, f1: 240, dur: 0.1, gain: 0.12 }),
  switch: (ctx, out, o) => notes(ctx, out, o, [700, 700], 0.06, 0.04, 0.2, "triangle"),
};

/** Play a synthesized effect into `out`; false when no recipe has that name. */
export function playSynth(name: string, ctx: AudioContext, out: AudioNode, o: SynthOptions): boolean {
  const r = RECIPES[name];
  if (!r) return false;
  r(ctx, out, o);
  return true;
}
