import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

import type { EnemyDef } from "../data/enemies";

/**
 * A spawned enemy: a placeholder armored figure plus live battle state (current
 * HP) backed by a static {@link EnemyDef}. Swap the mesh for a rigged model
 * later; the def is what combat code reads from.
 */
export class Enemy {
  readonly root: TransformNode;
  readonly def: EnemyDef;
  hp: number;

  constructor(scene: Scene, def: EnemyDef, spawn = new Vector3(0, 0, 0)) {
    this.def = def;
    this.hp = def.stats.maxHp;

    this.root = new TransformNode(`enemy:${def.id}`, scene);
    this.root.position = spawn.clone();

    // Steel-armored body in cold grey-blue to read clearly against the player.
    const body = MeshBuilder.CreateCapsule("enemyBody", { height: 1.7, radius: 0.42 }, scene);
    body.position.y = 0.85;
    const bodyMat = new StandardMaterial("enemyMat", scene);
    bodyMat.diffuseColor = new Color3(0.45, 0.5, 0.6);
    bodyMat.specularColor = new Color3(0.6, 0.65, 0.75);
    body.material = bodyMat;
    body.parent = this.root;

    // Helmet marker so facing is visible.
    const helm = MeshBuilder.CreateBox("enemyHelm", { width: 0.5, height: 0.4, depth: 0.5 }, scene);
    helm.position = new Vector3(0, 1.75, 0);
    const helmMat = new StandardMaterial("enemyHelmMat", scene);
    helmMat.diffuseColor = new Color3(0.3, 0.34, 0.42);
    helm.material = helmMat;
    helm.parent = this.root;
  }

  get position(): Vector3 {
    return this.root.position;
  }

  get alive(): boolean {
    return this.hp > 0;
  }

  /** Apply already-computed damage, clamped to zero. */
  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
  }

  dispose(): void {
    this.root.dispose();
  }
}
