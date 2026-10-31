import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

import { FWD } from "./frame";
import { matte } from "./mesh";

/** A placed chest: its lid swings open once {@link open} is called (animated by {@link tick}). */
export interface ChestProp {
  at: Vector3;
  open(): void;
  tick(dt: number): void;
}

/** A wooden chest with iron bands, its front to the camera; its lid swings open when looted. */
export function chestProp(scene: Scene, root: TransformNode, id: string, at: Vector3): ChestProp {
  const wood = matte(`chestWood_${id}`, scene, undefined, new Color3(0.5, 0.31, 0.17));
  const iron = matte(`chestIron_${id}`, scene, undefined, new Color3(0.34, 0.3, 0.26));
  const node = new TransformNode(`chest_${id}`, scene);
  node.parent = root;
  node.position.copyFrom(at);
  node.rotation.y = Math.atan2(-FWD.x, -FWD.z); // front faces the camera
  const body = MeshBuilder.CreateBox(`chestBody_${id}`, { width: 1.0, height: 0.55, depth: 0.65 }, scene);
  body.position.y = 0.28;
  body.material = wood;
  body.parent = node;
  for (const x of [-0.36, 0.36]) {
    const band = MeshBuilder.CreateBox(`chestBand_${id}${x}`, { width: 0.08, height: 0.57, depth: 0.67 }, scene);
    band.position.set(x, 0.28, 0);
    band.material = iron;
    band.parent = node;
  }
  // Lid on a hinge along the back edge.
  const hinge = new TransformNode(`chestHinge_${id}`, scene);
  hinge.parent = node;
  hinge.position.set(0, 0.55, -0.32);
  const lid = MeshBuilder.CreateCylinder(`chestLid_${id}`, { height: 1.0, diameter: 0.64, tessellation: 10, arc: 0.5 }, scene);
  lid.rotation.set(0, 0, Math.PI / 2);
  lid.position.set(0, 0, 0.32);
  lid.material = wood;
  lid.parent = hinge;
  let opening = false;
  return {
    at,
    open: () => {
      opening = true;
    },
    tick: (dt) => {
      if (opening && hinge.rotation.x > -1.9) hinge.rotation.x = Math.max(-1.9, hinge.rotation.x - dt * 5);
    },
  };
}
