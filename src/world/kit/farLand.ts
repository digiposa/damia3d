import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Scene } from "@babylonjs/core/scene";
import { gridMesh } from "./mesh";
import { noise2 } from "./noise";

/** The land beyond a map (kit): see {@link farLand}. */
export interface FarLandOptions {
  /** Centre of the map (world, on the ground). */
  center: Vector3;
  /** Where the ring starts (hidden under the map's own ground) and where it ends. */
  inner: number;
  outer: number;
  /** Flat out to here, then rolling up into hills towards the horizon. */
  flat: number;
  /** Hill height at the far edge. */
  height: number;
  /** Ground colour near and far (vertex colours over a matte material). */
  near: Color3;
  far: Color3;
  /** Lowest the ring sits (just under the map's ground, so the map's own edge never shows a seam). */
  y?: number;
  seed?: number;
  /** Where there is land at all, 0..1 (default everywhere): elsewhere it sinks to {@link sink}. */
  land?: (x: number, z: number) => number;
  sink?: number;
  /** How many rings / segments (default 28 × 72). */
  rings?: number;
  segments?: number;
}

/**
 * The land beyond a map: a ring of rolling ground from under the map's own ground out to the
 * horizon, rising into low hills that the fog melts into the sky. What a free third-person camera
 * sees when it looks up past the map's edge, in place of the end of the ground plate.
 * Cheap: one low-res mesh, no texture.
 */
export function farLand(scene: Scene, parent: TransformNode, o: FarLandOptions): Mesh {
  const RINGS = o.rings ?? 28;
  const SEGS = o.segments ?? 72;
  const seed = o.seed ?? 0;
  const y0 = o.y ?? -0.12;
  const col: number[] = [];
  const ring = gridMesh("kitFarLand", scene, RINGS, SEGS, (i, j) => {
    const t = i / RINGS;
    const r = o.inner + (o.outer - o.inner) * t * t; // denser near the map
    const a = (j / SEGS) * Math.PI * 2;
    const x = o.center.x + Math.cos(a) * r;
    const z = o.center.z + Math.sin(a) * r;
    const k = Math.max(0, Math.min(1, (r - o.flat) / (o.outer * 0.5 - o.flat)));
    const rise = k * k * (3 - 2 * k);
    const hills = 0.55 * noise2(x * 0.012 + seed, z * 0.012) + 0.45 * noise2(x * 0.035, z * 0.035 + seed);
    const l = o.land ? o.land(x, z) : 1;
    const y = (y0 + rise * o.height * (0.35 + hills)) * l + (o.sink ?? y0) * (1 - l);
    const m = Math.min(1, t * 1.6);
    col.push(...[o.near.r + (o.far.r - o.near.r) * m, o.near.g + (o.far.g - o.near.g) * m, o.near.b + (o.far.b - o.near.b) * m].map((c) => c * (0.85 + 0.3 * hills)), 1);
    return { x, y, z, tu: 0, tv: 0 };
  }, Vector3.Up());
  ring.setVerticesData("color", col);
  const mat = new StandardMaterial("kitFarLandMat", scene);
  mat.diffuseColor = Color3.White();
  mat.specularColor = Color3.Black();
  ring.material = mat;
  ring.parent = parent;
  ring.isPickable = false;
  ring.freezeWorldMatrix();
  return ring;
}
