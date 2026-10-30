import { toUV } from "./frame";

/**
 * Map kit — where you may walk, as a grid over the local (u, v) frame. A map fills it (trails,
 * open ground), then the trees take back what they stand over or would hide (see {@link Canopy}).
 * Cells: 0 blocked · 1 open ground · 2 trail (kept walkable whatever stands near).
 */

/** A tree's hold on the ground: the circle under its crown, and the band its crown covers on screen. */
export interface Canopy {
  x: number;
  z: number;
  /** Radius of ground under the crown. */
  under: number;
  /** Crown cover on screen, in local up-screen offsets from the foot, and its half-width. */
  coverFrom: number;
  coverTo: number;
  coverHalf: number;
}

export class WalkMask {
  readonly res: number;
  private readonly u0: number;
  private readonly v0: number;
  private readonly nu: number;
  private readonly nv: number;
  private readonly cells: Uint8Array;

  constructor(area: { u0: number; u1: number; v0: number; v1: number; res?: number }) {
    this.res = area.res ?? 0.5;
    this.u0 = area.u0;
    this.v0 = area.v0;
    this.nu = Math.ceil((area.u1 - area.u0) / this.res);
    this.nv = Math.ceil((area.v1 - area.v0) / this.res);
    this.cells = new Uint8Array(this.nu * this.nv);
  }

  private index(u: number, v: number): number {
    const i = Math.floor((u - this.u0) / this.res);
    const j = Math.floor((v - this.v0) / this.res);
    if (i < 0 || j < 0 || i >= this.nu || j >= this.nv) return -1;
    return j * this.nu + i;
  }

  /** Set every cell from `value(u, v)` (evaluated at cell centres). */
  fill(value: (u: number, v: number) => number): void {
    for (let j = 0; j < this.nv; j++)
      for (let i = 0; i < this.nu; i++) this.cells[j * this.nu + i] = value(this.u0 + (i + 0.5) * this.res, this.v0 + (j + 0.5) * this.res);
  }

  walkable(u: number, v: number): boolean {
    const k = this.index(u, v);
    return k >= 0 && this.cells[k] > 0;
  }

  /** Block open ground (never a trail) at (u, v). */
  private clearOpen(u: number, v: number): void {
    const k = this.index(u, v);
    if (k >= 0 && this.cells[k] === 1) this.cells[k] = 0;
  }

  /** Take back the ground a tree stands over and the band its crown would hide. */
  removeCanopy(c: Canopy): void {
    const { u: cu, v: cv } = toUV(c.x, c.z);
    for (let u = cu - c.under; u <= cu + c.under; u += this.res)
      for (let v = cv - c.under; v <= cv + c.under; v += this.res)
        if ((u - cu) ** 2 + (v - cv) ** 2 <= c.under ** 2) this.clearOpen(u, v);
    for (let u = cu + c.coverFrom; u <= cu + c.coverTo; u += this.res)
      for (let v = cv - c.coverHalf; v <= cv + c.coverHalf; v += this.res) this.clearOpen(u, v);
  }

  /** The nearest walkable point to (u, v) within a few cells, or null if none. */
  nearestWalkable(u: number, v: number): { u: number; v: number } | null {
    let best: { u: number; v: number; d: number } | null = null;
    const ci = Math.floor((u - this.u0) / this.res);
    const cj = Math.floor((v - this.v0) / this.res);
    for (let ring = 1; ring <= 8 && !best; ring++)
      for (let dj = -ring; dj <= ring; dj++)
        for (let di = -ring; di <= ring; di++) {
          if (Math.max(Math.abs(di), Math.abs(dj)) !== ring) continue;
          const i = ci + di;
          const j = cj + dj;
          if (i < 0 || j < 0 || i >= this.nu || j >= this.nv || !this.cells[j * this.nu + i]) continue;
          // Nearest point of that cell (just inside it).
          const cu0 = this.u0 + i * this.res;
          const cv0 = this.v0 + j * this.res;
          const nu = Math.min(cu0 + this.res * 0.98, Math.max(cu0 + this.res * 0.02, u));
          const nv = Math.min(cv0 + this.res * 0.98, Math.max(cv0 + this.res * 0.02, v));
          const d = (nu - u) ** 2 + (nv - v) ** 2;
          if (!best || d < best.d) best = { u: nu, v: nv, d };
        }
    return best && { u: best.u, v: best.v };
  }
}
