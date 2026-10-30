import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { FWD, SIDE, TAN_BETA, fromUV } from "./frame";

/**
 * Map kit — trails: paths authored as a few knots (u, v, half-width) and sampled into dense
 * polylines. The net answers "how far from a trail is this point" (walkable corridors, shading,
 * scatter) and "would something this tall standing here hide a trail from the camera" (placement).
 */

/** A trail control point: local (u, v) and the walkable half-width there. */
export type Knot = { u: number; v: number; w: number };

export interface TrailSample {
  p: Vector3;
  /** Walkable half-width. */
  w: number;
  /** Unit tangent. */
  t: Vector3;
}

/** A trail as a dense polyline (Catmull-Rom through its knots, ~1 unit steps). */
export function sampleTrail(knots: Knot[]): TrailSample[] {
  const pts = knots.map((k) => ({ p: fromUV(k.u, k.v), w: k.w }));
  const out: TrailSample[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)].p;
    const p1 = pts[i].p;
    const p2 = pts[i + 1].p;
    const p3 = pts[Math.min(pts.length - 1, i + 2)].p;
    const steps = Math.ceil(Vector3.Distance(p1, p2));
    for (let s = 0; s < steps; s++) {
      const f = s / steps;
      const sm = f * f * (3 - 2 * f); // ease the width between control points
      out.push({ p: Vector3.CatmullRom(p0, p1, p2, p3, f), w: pts[i].w + (pts[i + 1].w - pts[i].w) * sm, t: Vector3.Zero() });
    }
  }
  const last = pts[pts.length - 1];
  out.push({ p: last.p.clone(), w: last.w, t: Vector3.Zero() });
  for (let i = 0; i < out.length; i++) {
    const a = out[Math.max(0, i - 1)].p;
    const b = out[Math.min(out.length - 1, i + 1)].p;
    out[i].t = b.subtract(a).normalize();
  }
  return out;
}

/** A map's trails: the main one first, then its branches. */
export class TrailNet {
  readonly trails: TrailSample[][];
  /** Every sample of every trail (for the occlusion test). */
  readonly all: TrailSample[];

  constructor(knotLists: Knot[][]) {
    this.trails = knotLists.map(sampleTrail);
    this.all = this.trails.flat();
  }

  /** Nearest point of any trail to `(x, z)`: distance, interpolated half-width, and the point. */
  nearest(x: number, z: number): { d: number; w: number; px: number; pz: number } {
    let best = { d: Infinity, w: 0, px: 0, pz: 0 };
    for (const trail of this.trails)
      for (let i = 0; i < trail.length - 1; i++) {
        const a = trail[i];
        const b = trail[i + 1];
        const abx = b.p.x - a.p.x;
        const abz = b.p.z - a.p.z;
        const len2 = abx * abx + abz * abz || 1;
        const f = Math.min(1, Math.max(0, ((x - a.p.x) * abx + (z - a.p.z) * abz) / len2));
        const px = a.p.x + abx * f;
        const pz = a.p.z + abz * f;
        const d = Math.hypot(x - px, z - pz);
        if (d < best.d) best = { d, w: a.w + (b.w - a.w) * f, px, pz };
      }
    return best;
  }

  /**
   * Would something `height` tall with a crown `crown` wide, standing at (x, z), hide any part of
   * a trail from the iso camera? It does if the trail lies "above" it on screen within the reach of
   * its silhouette: up-screen distance ≤ height·tan(β), sideways within the crown. `minUp` ignores
   * the nearer part of that reach — for a tree, only its crown (not its thin trunk) must stay off.
   */
  occludes(x: number, z: number, height: number, crown: number, minUp = -Infinity): boolean {
    const reach = height * TAN_BETA + crown;
    for (const s of this.all) {
      const dx = s.p.x - x;
      const dz = s.p.z - z;
      const up = dx * FWD.x + dz * FWD.z; // > 0: the trail is above the object on screen
      if (up < Math.max(-s.w, minUp - s.w) || up > reach + s.w) continue;
      const side = Math.abs(dx * SIDE.x + dz * SIDE.z);
      if (side < crown + s.w) return true;
    }
    return false;
  }
}
