import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

import { dartStatsForLevel, dartLevelForExp, type DartLevel } from "../data/dart";
import { DART_ADDITIONS, type AdditionDef } from "../data/additions";

const SPEED = 6; // world units per second

/**
 * Dart — the player avatar. Placeholder capsule body with a "nose" marker so
 * facing direction is visible; swap for a rigged glTF model later. Carries the
 * party-leader battle state (level, EXP, HP) driven by the canonical stat table,
 * plus the currently equipped Addition used by the real-time combo system.
 */
export class Player {
  readonly root: TransformNode;

  level: number;
  exp: number;
  hp: number;
  stats: DartLevel;

  /** Equipped Addition performed by the melee combo system. */
  addition: AdditionDef = DART_ADDITIONS.doubleSlash;

  /** Dragoon Spirit Points accumulated from landing Addition hits. */
  sp = 0;

  /** Successful performances per Addition (drives leveling: 20 each, up to Lv 5). */
  private additionPerf = new Map<string, number>();

  constructor(scene: Scene, spawn = new Vector3(0, 0, 0), level = 1) {
    this.level = level;
    this.stats = dartStatsForLevel(level);
    this.exp = this.stats.exp;
    this.hp = this.stats.maxHp;

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
   * Award EXP and apply any resulting level-ups. Current HP grows by the Max HP
   * gained so a level-up never lowers effective health.
   */
  gainExp(amount: number): void {
    this.exp += Math.max(0, amount);
    const newLevel = dartLevelForExp(this.exp);
    if (newLevel === this.level) return;

    const prevMax = this.stats.maxHp;
    this.level = newLevel;
    this.stats = dartStatsForLevel(newLevel);
    this.hp = Math.min(this.hp + (this.stats.maxHp - prevMax), this.stats.maxHp);
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

  /** Turn to face a world-space ground direction (e.g. toward an attack target). */
  face(dir: Vector3): void {
    if (dir.lengthSquared() < 1e-4) return;
    this.root.rotation.y = Math.atan2(dir.x, dir.z);
  }

  /** Current level (1–5) of an Addition: +1 every 20 successful performances. */
  additionLevel(def: AdditionDef): number {
    const perf = this.additionPerf.get(def.name) ?? 0;
    return Math.min(5, 1 + Math.floor(perf / 20));
  }

  /** Record a completed (perfect) Addition toward its leveling. */
  recordAddition(def: AdditionDef): void {
    this.additionPerf.set(def.name, (this.additionPerf.get(def.name) ?? 0) + 1);
  }
}
