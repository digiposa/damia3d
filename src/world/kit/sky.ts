import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Scene } from "@babylonjs/core/scene";

/** A sky (kit): what the third-person camera sees over the horizon. */
export interface SkyOptions {
  zenith: Color3;
  horizon: Color3;
  /** The sun's glow low on the horizon: its colour and the direction towards it (any length). */
  glow: Color3;
  sun: Vector3;
}

/**
 * A sky dome: a gradient from the horizon to the zenith, burning towards the sun along the horizon.
 * Unlit, out of the fog, drawn at infinite distance. Keep it out of the glow layer (returned mesh).
 */
export function skyDome(scene: Scene, parent: TransformNode, o: SkyOptions): Mesh {
  const sky = MeshBuilder.CreateSphere("kitSky", { diameter: 1600, segments: 24, sideOrientation: Mesh.BACKSIDE }, scene);
  sky.infiniteDistance = true;
  const m = new StandardMaterial("kitSkyMat", scene);
  m.disableLighting = true;
  m.fogEnabled = false;
  m.diffuseColor = Color3.Black();
  m.specularColor = Color3.Black();
  m.emissiveColor = Color3.White();
  sky.material = m;
  const toSun = new Vector3(o.sun.x, 0, o.sun.z).normalize();
  const p = sky.getVerticesData("position")!;
  const c: number[] = [];
  for (let k = 0; k < p.length; k += 3) {
    const d = new Vector3(p[k], p[k + 1], p[k + 2]).normalize();
    const e = Math.max(0, d.y);
    const sun = Math.max(0, d.x * toSun.x + d.z * toSun.z);
    const low = 1 - Math.min(1, e / 0.35);
    const g = low * low * (0.35 + 0.65 * sun * sun);
    const h = Math.pow(1 - e, 3);
    for (const ch of ["r", "g", "b"] as const) c.push(o.zenith[ch] + (o.horizon[ch] - o.zenith[ch]) * h + o.glow[ch] * g);
    c.push(1);
  }
  sky.setVerticesData("color", c);
  sky.parent = parent;
  sky.isPickable = false;
  return sky;
}
