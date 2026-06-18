import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

const SPEED = 6; // world units per second

/**
 * Placeholder player avatar: a capsule body with a "nose" marker so facing
 * direction is visible. Swap the mesh for a rigged glTF model later.
 */
export class Player {
  readonly root: TransformNode;

  constructor(scene: Scene, spawn = new Vector3(0, 0, 0)) {
    this.root = new TransformNode("player", scene);
    this.root.position = spawn.clone();

    const body = MeshBuilder.CreateCapsule("playerBody", { height: 1.6, radius: 0.4 }, scene);
    body.position.y = 0.8;
    const bodyMat = new StandardMaterial("playerMat", scene);
    bodyMat.diffuseColor = new Color3(0.85, 0.2, 0.25);
    bodyMat.specularColor = new Color3(0.1, 0.1, 0.1);
    body.material = bodyMat;
    body.parent = this.root;

    const nose = MeshBuilder.CreateBox("playerNose", { width: 0.25, height: 0.25, depth: 0.4 }, scene);
    nose.position = new Vector3(0, 0.9, 0.45);
    const noseMat = new StandardMaterial("noseMat", scene);
    noseMat.diffuseColor = new Color3(0.95, 0.85, 0.3);
    nose.material = noseMat;
    nose.parent = this.root;
  }

  get position(): Vector3 {
    return this.root.position;
  }

  /**
   * Move along a world-space ground direction (already screen-relative).
   * @param dir non-normalized desired direction on the XZ plane
   * @param dt  seconds since last frame
   */
  move(dir: Vector3, dt: number): void {
    if (dir.lengthSquared() < 1e-4) return;
    const step = dir.normalize().scale(SPEED * dt);
    this.root.position.addInPlace(step);
    // Face the direction of travel.
    this.root.rotation.y = Math.atan2(step.x, step.z);
  }
}
