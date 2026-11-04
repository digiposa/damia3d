import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Scene } from "@babylonjs/core/scene";
import { gradeColors, jitter } from "./mesh";

/** A line of peaks, from one point to another (world, on the ground). */
export interface Ridge {
  from: Vector3;
  to: Vector3;
  /** How many peaks, and their height (each 55–115 % of it). */
  n: number;
  h: number;
}

/** How the range is coloured: at its foot and at the top (unlit), and the base height. */
export interface MountainOptions {
  foot: Color3;
  top: Color3;
  /** Height over which the colour goes from foot to top. */
  span?: number;
  /** Where the peaks stand (y of their base). */
  y?: number;
  /** World-unit scatter of each peak about its ridge line. */
  scatter?: number;
}

/**
 * A far mountain range (kit): low-poly peaks along ridges, merged into one unlit mesh out of the
 * fog, hazy colours from foot to top, lit faces a touch lighter. Kept out of the glow layer.
 */
export function mountainRange(scene: Scene, root: TransformNode, rand: () => number, ridges: Ridge[], o: MountainOptions): Mesh | null {
  const parts: Mesh[] = [];
  const scatter = o.scatter ?? 30;
  for (const r of ridges) {
    for (let k = 0; k < r.n; k++) {
      const f = k / (r.n - 1);
      const x = r.from.x + (r.to.x - r.from.x) * f + (rand() - 0.5) * scatter;
      const z = r.from.z + (r.to.z - r.from.z) * f + (rand() - 0.5) * scatter;
      const hh = r.h * (0.55 + rand() * 0.6);
      const peak = MeshBuilder.CreateCylinder("kitPeak", { height: hh, diameterTop: hh * 0.08, diameterBottom: hh * (1.6 + rand()), tessellation: 7, subdivisions: 3 }, scene);
      jitter(peak, hh * 0.06, rand);
      peak.position.set(x, hh / 2 + (o.y ?? -4), z);
      peak.rotation.y = rand() * 6;
      gradeColors(peak, [0.42, 0.4, 0.48], [1.15, 1.1, 1.15]);
      parts.push(peak);
    }
  }
  const range = Mesh.MergeMeshes(parts, true, true);
  if (!range) return null;
  range.name = "kitMountains";
  const m = new StandardMaterial("kitMountainMat", scene);
  m.disableLighting = true;
  m.fogEnabled = false;
  m.diffuseColor = Color3.Black();
  m.specularColor = Color3.Black();
  m.emissiveColor = Color3.White();
  range.material = m;
  range.convertToFlatShadedMesh();
  const p = range.getVerticesData("position")!;
  const n = range.getVerticesData("normal")!;
  const c: number[] = [];
  const span = o.span ?? 90;
  for (let k = 0; k < p.length; k += 3) {
    const t = Math.min(1, Math.max(0, p[k + 1] / span));
    const lit = 0.06 * Math.max(0, n[k + 1]) + 0.05 * Math.max(0, -n[k]);
    c.push(o.foot.r + (o.top.r - o.foot.r) * t + lit, o.foot.g + (o.top.g - o.foot.g) * t + lit, o.foot.b + (o.top.b - o.foot.b) * t + lit, 1);
  }
  range.setVerticesData("color", c);
  range.parent = root;
  range.isPickable = false;
  // Unlit: keep it out of the mode's glow layer (made after the world), or it blooms white.
  const once = scene.onBeforeRenderObservable.add(() => {
    for (const layer of scene.effectLayers) if (layer instanceof GlowLayer) layer.addExcludedMesh(range);
    scene.onBeforeRenderObservable.remove(once);
  });
  return range;
}
