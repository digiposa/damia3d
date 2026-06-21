import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";

import { dartStatsForLevel, dartLevelForExp, type DartLevel } from "../data/dart";
import { DART_ADDITIONS, DART_ADDITION_LIST, type AdditionDef } from "../data/additions";
import { type EquipDef, type EquipSlot, equipById } from "../data/equipment";
import type { Element } from "../combat/element";

const SPEED = 6; // world units per second
const BASE_MAX_MP = 60; // base MP before equipment % bonuses (placeholder)

/** Defense (Guard): stand firm, heal, halve incoming damage for a short time. */
const GUARD_DURATION = 2; // seconds the stance lasts
const GUARD_COOLDOWN = 6; // seconds before it can be used again (from activation)
const GUARD_HEAL_FRACTION = 0.1; // 10% of max HP restored on activation

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

  /** Dart's own element (Red-Eye / Fire Dragoon) — the target element for incoming attacks. */
  readonly element: Element = "Fire";

  /** Equipped Addition performed by the melee combo system. */
  addition: AdditionDef = DART_ADDITIONS.doubleSlash;

  /** Dragoon Spirit Points accumulated from landing Addition hits. */
  sp = 0;
  /** SP gauge cap (one Dragoon level early on; rises later). */
  readonly maxSp = 100;
  /** Magic points (placeholder — Dart uses items/SP in LoD; tune later). */
  mp = 0;
  /** Gold carried (awarded from defeated enemies). */
  gold = 0;

  /** Equipped item per slot (Dart's initial loadout). */
  readonly equipment: Record<EquipSlot, EquipDef | undefined> = {
    weapon: equipById("broad_sword"),
    head: equipById("bandana"),
    body: equipById("leather_armor"),
    feet: equipById("leather_boots"),
    accessory: equipById("bracelet"),
  };

  /** Successful performances per Addition (drives leveling: 20 each, up to Lv 5). */
  private additionPerf = new Map<string, number>();

  private guardTimer = 0;
  private guardCdTimer = 0;
  private guardShield!: Mesh;

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

    // Translucent barrier shown while guarding.
    this.guardShield = MeshBuilder.CreateSphere("guardShield", { diameter: 2.3, segments: 12 }, scene);
    this.guardShield.position.y = 0.9;
    const shieldMat = new StandardMaterial("guardShieldMat", scene);
    shieldMat.diffuseColor = new Color3(0.4, 0.7, 1);
    shieldMat.emissiveColor = new Color3(0.2, 0.5, 0.9);
    shieldMat.alpha = 0.22;
    shieldMat.backFaceCulling = false;
    this.guardShield.material = shieldMat;
    this.guardShield.isVisible = false;
    this.guardShield.isPickable = false;
    this.guardShield.parent = this.root;
  }

  get position(): Vector3 {
    return this.root.position;
  }

  // --- Effective stats (base table + equipment) -----------------------------

  private get equipped(): EquipDef[] {
    return Object.values(this.equipment).filter((e): e is EquipDef => !!e);
  }

  private bonus(key: "at" | "df" | "mat" | "mdf"): number {
    return this.equipped.reduce((sum, e) => sum + (e[key] ?? 0), 0);
  }

  private bonusPct(key: "hpPct" | "mpPct"): number {
    return this.equipped.reduce((sum, e) => sum + (e[key] ?? 0), 0);
  }

  get maxHp(): number {
    return Math.floor(this.stats.maxHp * (1 + this.bonusPct("hpPct")));
  }
  get maxMp(): number {
    return Math.floor(BASE_MAX_MP * (1 + this.bonusPct("mpPct")));
  }
  get atk(): number {
    return this.stats.at + this.bonus("at");
  }
  get def(): number {
    return this.stats.df + this.bonus("df");
  }
  get matk(): number {
    return this.stats.mat + this.bonus("mat");
  }
  get mdef(): number {
    return this.stats.mdf + this.bonus("mdf");
  }

  /** Element imbued on physical attacks by the equipped weapon (Non-Elemental if none). */
  get attackElement(): Element {
    return this.equipment.weapon?.element ?? "Non-Elemental";
  }

  /** Incoming-damage multiplier from damage-reduction gear (1 = no reduction). */
  incomingMultiplier(kind: "phys" | "magic"): number {
    let m = 1;
    for (const e of this.equipped) {
      const r = e.dmgReduce?.[kind];
      if (r) m *= 1 - r;
    }
    return m;
  }

  /** Equip an item into its slot (re-clamping HP to the new maximum). */
  equip(def: EquipDef): void {
    this.equipment[def.slot] = def;
    this.hp = Math.min(this.hp, this.maxHp);
  }

  /** Remove the item in a slot. */
  unequip(slot: EquipSlot): void {
    this.equipment[slot] = undefined;
    this.hp = Math.min(this.hp, this.maxHp);
  }

  // --- Defense (Guard) ------------------------------------------------------

  /** True while the guard stance is active (movement blocked, damage halved). */
  get guardActive(): boolean {
    return this.guardTimer > 0;
  }

  /** True when guard can be triggered (not active and off cooldown). */
  get guardReady(): boolean {
    return this.guardTimer <= 0 && this.guardCdTimer <= 0;
  }

  /** Begin guarding: heal 10% max HP and halve incoming damage for the duration. Returns HP healed. */
  startGuard(): number {
    this.guardTimer = GUARD_DURATION;
    this.guardCdTimer = GUARD_COOLDOWN;
    this.guardShield.isVisible = true;
    const heal = Math.floor(this.maxHp * GUARD_HEAL_FRACTION);
    this.hp = Math.min(this.maxHp, this.hp + heal);
    return heal;
  }

  /** Advance guard timers (use combat-scaled dt). */
  tickGuard(dt: number): void {
    if (this.guardTimer > 0) {
      this.guardTimer = Math.max(0, this.guardTimer - dt);
      if (this.guardTimer === 0) this.guardShield.isVisible = false;
    }
    if (this.guardCdTimer > 0) this.guardCdTimer = Math.max(0, this.guardCdTimer - dt);
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
    this.hp = Math.min(this.hp + (this.stats.maxHp - prevMax), this.maxHp);
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

  /** Additions Dart has learned at his current level, in acquisition order. */
  unlockedAdditions(): AdditionDef[] {
    return DART_ADDITION_LIST.filter((a) => a.acquireLevel <= this.level);
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
