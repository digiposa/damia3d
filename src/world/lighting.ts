/**
 * Lighting / mood presets. All the knobs that make a zone read bright or dark live here, so a
 * scene's ambiance is data, not code duplicated per mode. {@link Atmosphere} applies a preset
 * (and can transition between them), so a bright town and a pitch-black cave are the same
 * renderer with different numbers — nothing is baked into geometry.
 */
export interface LightingPreset {
  /** Backdrop colour behind the world (RGB 0–1). */
  clearColor: [number, number, number];
  /** Hemispheric fill light intensity + its ground (upward-facing) tint. */
  ambientIntensity: number;
  ambientGround: [number, number, number];
  /** Directional "sun/key" light intensity, colour and direction. */
  sunIntensity: number;
  sunColor: [number, number, number];
  sunDirection: [number, number, number];
  /** Post-process: film exposure, contrast, dark-edge vignette weight (0 = none), bloom weight. */
  exposure: number;
  contrast: number;
  vignetteWeight: number;
  bloomWeight: number;
  /** Linear distance fog: near clear distance, far fully-fogged distance, and its colour. */
  fogStart: number;
  fogEnd: number;
  fogColor: [number, number, number];
}

/**
 * Named presets. `arenaNight` is the current dark-fantasy look; the others are ready-made
 * starting points for future zones — tune them when those zones actually exist.
 */
export const LIGHTING_PRESETS = {
  /** Training arena — the dark-fantasy palette but clearly lit and readable (more fill, softer
   *  vignette/fog, less crushed shadows) so you can see the fight and the decor. */
  trainingArena: {
    clearColor: [0.07, 0.08, 0.11],
    ambientIntensity: 0.78,
    ambientGround: [0.12, 0.14, 0.2],
    sunIntensity: 1.3,
    sunColor: [1.0, 0.92, 0.8],
    sunDirection: [-0.5, -1, -0.4],
    exposure: 1.25,
    contrast: 1.22,
    vignetteWeight: 1.1,
    bloomWeight: 0.4,
    fogStart: 36,
    fogEnd: 95,
    fogColor: [0.07, 0.08, 0.12],
  },
  /** The torch-lit night arena — deep, contrasty, heavy vignette (dramatic dark version). */
  arenaNight: {
    clearColor: [0.043, 0.051, 0.071],
    ambientIntensity: 0.42,
    ambientGround: [0.06, 0.08, 0.14],
    sunIntensity: 1.15,
    sunColor: [1.0, 0.9, 0.74],
    sunDirection: [-0.5, -1, -0.4],
    exposure: 1.1,
    contrast: 1.45,
    vignetteWeight: 2.6,
    bloomWeight: 0.5,
    fogStart: 24,
    fogEnd: 62,
    fogColor: [0.035, 0.043, 0.06],
  },
  /** Daylight town/overworld — bright, airy, minimal vignette, distant pale fog. */
  townDay: {
    clearColor: [0.5, 0.55, 0.62],
    ambientIntensity: 0.9,
    ambientGround: [0.4, 0.42, 0.4],
    sunIntensity: 1.3,
    sunColor: [1.0, 0.97, 0.9],
    sunDirection: [-0.4, -1, -0.35],
    exposure: 1.3,
    contrast: 1.12,
    vignetteWeight: 0.6,
    bloomWeight: 0.3,
    fogStart: 40,
    fogEnd: 140,
    fogColor: [0.6, 0.66, 0.74],
  },
  /** Underground cave/dungeon — near-black, cold, tight fog and a strong vignette. */
  cave: {
    clearColor: [0.02, 0.02, 0.03],
    ambientIntensity: 0.25,
    ambientGround: [0.03, 0.04, 0.06],
    sunIntensity: 0.5,
    sunColor: [0.6, 0.7, 0.9],
    sunDirection: [-0.3, -1, -0.25],
    exposure: 1.0,
    contrast: 1.55,
    vignetteWeight: 3.2,
    bloomWeight: 0.6,
    fogStart: 10,
    fogEnd: 40,
    fogColor: [0.02, 0.03, 0.05],
  },
} satisfies Record<string, LightingPreset>;

export type LightingPresetName = keyof typeof LIGHTING_PRESETS;

/** Linear blend of two presets (used for smooth zone-to-zone transitions). */
export function lerpPreset(a: LightingPreset, b: LightingPreset, t: number): LightingPreset {
  const n = (x: number, y: number) => x + (y - x) * t;
  const c = (x: [number, number, number], y: [number, number, number]): [number, number, number] => [
    n(x[0], y[0]),
    n(x[1], y[1]),
    n(x[2], y[2]),
  ];
  return {
    clearColor: c(a.clearColor, b.clearColor),
    ambientIntensity: n(a.ambientIntensity, b.ambientIntensity),
    ambientGround: c(a.ambientGround, b.ambientGround),
    sunIntensity: n(a.sunIntensity, b.sunIntensity),
    sunColor: c(a.sunColor, b.sunColor),
    sunDirection: c(a.sunDirection, b.sunDirection),
    exposure: n(a.exposure, b.exposure),
    contrast: n(a.contrast, b.contrast),
    vignetteWeight: n(a.vignetteWeight, b.vignetteWeight),
    bloomWeight: n(a.bloomWeight, b.bloomWeight),
    fogStart: n(a.fogStart, b.fogStart),
    fogEnd: n(a.fogEnd, b.fogEnd),
    fogColor: c(a.fogColor, b.fogColor),
  };
}
