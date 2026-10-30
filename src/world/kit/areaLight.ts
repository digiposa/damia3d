import { lerpPreset, type LightingPreset } from "../lighting";

/**
 * Map kit — lighting that changes area by area along a map, blended as you walk (no cut). Keys are
 * (u, preset) pairs in walking order.
 *
 * Exposure, contrast and vignette stay those of `base` everywhere: changing any of them makes
 * Babylon re-check every material, a visible hitch on phones. Areas differ through the lights, fog,
 * backdrop and bloom only — all free to change every frame.
 */
export class AreaLight {
  private lastU = NaN;
  private last: LightingPreset;

  constructor(
    private readonly keys: [number, LightingPreset][],
    private readonly base: LightingPreset,
  ) {
    this.last = base;
  }

  /** The lighting at `u` (same object back while you haven't moved a quarter unit). */
  at(u: number): LightingPreset {
    const q = Math.round(u * 4) / 4;
    if (q === this.lastU) return this.last;
    this.lastU = q;
    const keys = this.keys;
    let k = 0;
    while (k < keys.length - 2 && q > keys[k + 1][0]) k++;
    const [u0, a] = keys[k];
    const [u1, b] = keys[k + 1];
    const t = Math.min(1, Math.max(0, (q - u0) / (u1 - u0)));
    const s = t * t * (3 - 2 * t);
    this.last = {
      ...(a === b ? a : lerpPreset(a, b, s)),
      exposure: this.base.exposure,
      contrast: this.base.contrast,
      vignetteWeight: this.base.vignetteWeight,
    };
    return this.last;
  }
}
