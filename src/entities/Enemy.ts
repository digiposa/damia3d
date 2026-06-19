import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

import type { EnemyDef } from "../data/enemies";
import { projectToScreen } from "../world/project";

/** Movement speed (world units / second) while chasing. */
const SPEED = 3.2;
/** Distance within which the enemy stops to attack. */
const ATTACK_RANGE = 1.7;
/** Seconds between the enemy's attacks. */
const ATTACK_INTERVAL = 1.4;

/**
 * A spawned enemy: a placeholder armored figure, live HP, simple chase-and-strike
 * AI, and a floating health bar. Static numbers come from its {@link EnemyDef};
 * combat code reads `def` for damage math.
 */
export class Enemy {
  readonly root: TransformNode;
  readonly def: EnemyDef;
  hp: number;

  private attackCooldown = 0;
  private bar: HTMLDivElement;
  private barFill: HTMLDivElement;

  constructor(scene: Scene, def: EnemyDef, spawn = new Vector3(0, 0, 0)) {
    this.def = def;
    this.hp = def.stats.maxHp;

    this.root = new TransformNode(`enemy:${def.id}`, scene);
    this.root.position = spawn.clone();

    const body = MeshBuilder.CreateCapsule("enemyBody", { height: 1.7, radius: 0.42 }, scene);
    body.position.y = 0.85;
    const bodyMat = new StandardMaterial("enemyMat", scene);
    bodyMat.diffuseColor = new Color3(0.45, 0.5, 0.6);
    bodyMat.specularColor = new Color3(0.6, 0.65, 0.75);
    body.material = bodyMat;
    body.parent = this.root;

    const helm = MeshBuilder.CreateBox("enemyHelm", { width: 0.5, height: 0.4, depth: 0.5 }, scene);
    helm.position = new Vector3(0, 1.75, 0);
    const helmMat = new StandardMaterial("enemyHelmMat", scene);
    helmMat.diffuseColor = new Color3(0.3, 0.34, 0.42);
    helm.material = helmMat;
    helm.parent = this.root;

    // Floating health bar (positioned each frame via syncHud).
    this.bar = document.createElement("div");
    Object.assign(this.bar.style, {
      position: "fixed",
      width: "46px",
      height: "6px",
      marginLeft: "-23px",
      marginTop: "-3px",
      borderRadius: "3px",
      background: "rgba(10,14,22,0.85)",
      border: "1px solid rgba(0,0,0,0.6)",
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: "12",
    } satisfies Partial<CSSStyleDeclaration>);
    this.barFill = document.createElement("div");
    Object.assign(this.barFill.style, {
      position: "absolute",
      inset: "0",
      transformOrigin: "left",
      background: "linear-gradient(90deg, #6ab04c, #c0392b)",
    } satisfies Partial<CSSStyleDeclaration>);
    this.bar.appendChild(this.barFill);
    document.body.appendChild(this.bar);
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

  /**
   * Chase the target and strike when in range. Returns true on the frame the
   * enemy lands an attack (the caller resolves damage against the player).
   */
  aiUpdate(dt: number, targetPos: Vector3): boolean {
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);

    const to = targetPos.subtract(this.position);
    to.y = 0;
    const dist = to.length();
    if (dist > 1e-3) this.root.rotation.y = Math.atan2(to.x, to.z);

    if (dist > ATTACK_RANGE) {
      this.root.position.addInPlace(to.normalize().scale(Math.min(SPEED * dt, dist)));
      return false;
    }
    if (this.attackCooldown === 0) {
      this.attackCooldown = ATTACK_INTERVAL;
      return true;
    }
    return false;
  }

  /** Position and fill the floating health bar above the enemy's head. */
  syncHud(scene: Scene): void {
    const head = this.position.add(new Vector3(0, 2.4, 0));
    const p = projectToScreen(scene, head);
    if (!p.visible) {
      this.bar.style.display = "none";
      return;
    }
    this.bar.style.display = "block";
    this.bar.style.left = `${p.x}px`;
    this.bar.style.top = `${p.y}px`;
    this.barFill.style.transform = `scaleX(${this.hp / this.def.stats.maxHp})`;
  }

  dispose(): void {
    this.bar.remove();
    this.root.dispose();
  }
}
