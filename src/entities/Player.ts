import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";

import { statsForLevel, levelForExp, nextLevelExp, type CharacterLevel } from "../data/dart";
import { BASIC_ATTACK, type AdditionDef } from "../data/additions";
import { type EquipDef, type EquipSlot, type Member, equipById } from "../data/equipment";
import { type DragoonClass, dragoonClass } from "../data/dragoonClasses";
import type { Bearer } from "../data/bearers";
import type { Element } from "../combat/element";

const SPEED = 6; // world units per second
const BASE_MAX_MP = 60; // base MP before equipment % bonuses (placeholder)

/** Defense (Guard): stand firm, heal, halve incoming damage for a short time. */
const GUARD_DURATION = 2; // seconds the stance lasts
const GUARD_COOLDOWN = 6; // seconds before it can be used again (from activation)
const GUARD_HEAL_FRACTION = 0.1; // 10% of max HP restored on activation

/**
 * The player avatar. Placeholder capsule body with a "nose" marker so facing is
 * visible; swap for a rigged glTF model later. Driven by a {@link Bearer} (the
 * identity/skin) which resolves to a Dragoon class providing the stat table,
 * element, Additions and equipment line. Carries the live battle state.
 */
export class Player {
  readonly root: TransformNode;
  readonly bearer: Bearer;
  private cls: DragoonClass;

  level: number;
  exp: number;
  hp: number;
  stats: CharacterLevel;

  /** Dragoon element — the target element for incoming attacks. */
  readonly element: Element;

  /** Equipped Addition performed by the real-time combo system. */
  addition: AdditionDef;

  /** Dragoon Spirit Points accumulated from landing Addition hits. */
  sp = 0;
  /** SP gauge cap (one Dragoon level early on; rises later). */
  readonly maxSp = 100;
  /** Magic points (placeholder — uses items/SP in LoD; tune later). */
  mp = 0;
  /** Gold carried (awarded from defeated enemies). */
  gold = 0;

  /** Equipped item per slot. */
  readonly equipment: Record<EquipSlot, EquipDef | undefined>;

  /** Successful performances per Addition (drives leveling: 20 each, up to Lv 5). */
  private additionPerf = new Map<string, number>();

  private guardTimer = 0;
  private guardCdTimer = 0;
  private guardShield!: Mesh;

  constructor(scene: Scene, bearer: Bearer, spawn = new Vector3(0, 0, 0), level = 1) {
    const cls = dragoonClass(bearer.classId);
    if (!cls) throw new Error(`Dragoon class not implemented: ${bearer.classId}`);
    this.bearer = bearer;
    this.cls = cls;
    this.element = cls.element;
    // Members with no Additions (Shana / Miranda) fight with the basic attack.
    this.addition = cls.additions[0] ?? BASIC_ATTACK;
    this.equipment = {
      weapon: cls.loadout.weapon ? equipById(cls.loadout.weapon) : undefined,
      head: cls.loadout.head ? equipById(cls.loadout.head) : undefined,
      body: cls.loadout.body ? equipById(cls.loadout.body) : undefined,
      feet: cls.loadout.feet ? equipById(cls.loadout.feet) : undefined,
      accessory: cls.loadout.accessory ? equipById(cls.loadout.accessory) : undefined,
    };

    this.level = level;
    this.stats = statsForLevel(cls.levels, level);
    this.exp = this.stats.exp;
    this.hp = this.stats.maxHp;

    this.root = new TransformNode("player", scene);
    this.root.position = spawn.clone();

    const body = MeshBuilder.CreateCapsule("playerBody", { height: 1.6, radius: 0.4 }, scene);
    body.position.y = 0.8;
    const bodyMat = new StandardMaterial("playerMat", scene);
    const [cr, cg, cb] = bearer.color;
    bodyMat.diffuseColor = new Color3(cr, cg, cb);
    bodyMat.specularColor = new Color3(0.1, 0.1, 0.1);
    body.material = bodyMat;
    body.parent = this.root;

    const nose = MeshBuilder.CreateBox("playerNose", { width: 0.25, height: 0.25, depth: 0.4 }, scene);
    nose.position = new Vector3(0, 0.9, 0.45);
    const noseMat = new StandardMaterial("noseMat", scene);
    // A lightened tint of the body colour so facing is visible on any skin.
    noseMat.diffuseColor = new Color3(0.5 + cr * 0.5, 0.5 + cg * 0.5, 0.5 + cb * 0.5);
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

  /** Equipment `users` tag this character draws from. */
  get equipmentUser(): Member {
    return this.cls.equipmentUser;
  }

  /** Cumulative EXP needed to reach the next level. */
  get nextExp(): number {
    return nextLevelExp(this.cls.levels, this.level);
  }

  /** Remove the avatar's meshes (e.g. when switching bearer). */
  dispose(): void {
    this.root.dispose();
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

  /** Total of a flat equipment-only stat across equipped gear (0 if none). */
  gearTotal(key: "spd" | "aHit" | "mHit" | "aAv" | "mAv"): number {
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

  /** Combat-time seconds left before guard is ready again. */
  get guardCooldownRemaining(): number {
    return this.guardCdTimer;
  }

  /** Cooldown remaining as a fraction of the full cooldown (1 → 0). */
  get guardCooldownFraction(): number {
    return GUARD_COOLDOWN > 0 ? Math.max(0, this.guardCdTimer / GUARD_COOLDOWN) : 0;
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

  /** Jump straight to a level (debug/training): set stats & EXP and fully heal. */
  setLevel(level: number): void {
    const clamped = Math.min(Math.max(Math.floor(level), 1), this.cls.levels.length);
    this.level = clamped;
    this.stats = statsForLevel(this.cls.levels, clamped);
    this.exp = this.stats.exp;
    this.hp = this.maxHp;
  }

  /** Highest level in this class's growth table. */
  get maxLevel(): number {
    return this.cls.levels.length;
  }

  /**
   * Award EXP and apply any resulting level-ups. Current HP grows by the Max HP
   * gained so a level-up never lowers effective health.
   */
  gainExp(amount: number): void {
    this.exp += Math.max(0, amount);
    const newLevel = levelForExp(this.cls.levels, this.exp);
    if (newLevel === this.level) return;

    const prevMax = this.stats.maxHp;
    this.level = newLevel;
    this.stats = statsForLevel(this.cls.levels, newLevel);
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

  /** Every Addition in this Dragoon class's repertoire (locked or not). */
  get additions(): AdditionDef[] {
    return this.cls.additions;
  }

  /** Additions learned at the current level, in acquisition order. */
  unlockedAdditions(): AdditionDef[] {
    return this.cls.additions.filter((a) => a.acquireLevel <= this.level);
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
