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
import { type DragoonClass, type DragoonStatMult, dragoonClass } from "../data/dragoonClasses";
import { type DragoonSpell, spellsForClass } from "../data/dragoonSpells";
import type { Bearer } from "../data/bearers";
import type { Element } from "../combat/element";
import { atbFillTime } from "../combat/AtbGauge";
import { Humanoid } from "./humanoid";
import { DragoonForm } from "./DragoonForm";
import { importModel, flattenCellShaded, tuneWeapon } from "../world/props";
import type { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import type { Skeleton } from "@babylonjs/core/Bones/skeleton";

const WALK_SPEED = 3.2; // world units per second (gentle joystick / combat pace)
const RUN_SPEED = 6.5; // world units per second (full joystick / desktop click-to-move)
/** Yaw applied to a loaded bearer model so its native forward faces the rig's +Z (Meru's AccuRIG
 *  export already faces +Z, so 0). Adjust here if a future model is authored facing another axis. */
const MODEL_YAW = 0;
/** Target on-screen height (world units) any imported bearer model is auto-fit to. */
const MODEL_TARGET_H = 1.8;
/** Right-hand bone name (weapon attach point), by rig: AccuRIG/Character-Creator first, then
 *  Mixamo. A bearer's model may come from either pipeline, so we try each in order. */
const HAND_BONES = ["CC_Base_R_Hand", "mixamorig:RightHand", "RightHand"];
/** Uniform world scale of a hand-attached weapon model. */
const WEAPON_SCALE = 0.9;
/** Height (0–1 up the weapon mesh) of the grip seated in the fist — Meru's hammer grip ≈ 0.6. */
const WEAPON_GRIP_Y = 0.6;
const MP_PER_DRAGOON_LEVEL = 20; // canon: max MP = D'Lv × 20 (20 at D'Lv1 … 100 at D'Lv5)

/** Defense (Guard): stand firm, heal, halve incoming damage for a short time. */
const GUARD_DURATION = 2; // seconds the stance lasts
const GUARD_COOLDOWN = 6; // seconds before it can be used again (from activation)
const GUARD_HEAL_FRACTION = 0.1; // 10% of max HP restored on activation

/** Highest Dragoon Level (D'Lv) a Spirit reaches. */
export const MAX_DRAGOON_LEVEL = 5;
/** SP gained per basic attack (no Addition), indexed by Dragoon Level 1–5. Canon: bow
 *  users (Shana / Miranda) charge their gauge entirely from this — the higher their D'Lv,
 *  the faster they can re-transform. Addition users charge from their Additions instead. */
const SP_PER_BASIC_ATTACK = [35, 50, 75, 100, 150];

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

  /** Dragoon Spirit Points in the gauge: charge in human form, remaining turns×100 in Dragoon form. */
  sp = 0;
  /** Lifetime SP earned — drives Dragoon-Level progression (never spent). */
  lifetimeSp = 0;
  /** Dragoon Level (D'Lv, 1–{@link MAX_DRAGOON_LEVEL}): SP gauge size, per-attack SP, stat multipliers. */
  dragoonLevel = 1;
  /** Whether this member has obtained their Dragoon Spirit. Until then there's no SP, no MP,
   *  and no transform/magic (Training unlocks it on spawn; Story/Survival award it later). */
  dragoonUnlocked = false;

  /** Grant the Dragoon Spirit: the member begins at D'Lv 1 with a full MP pool. */
  unlockDragoon(): void {
    this.dragoonUnlocked = true;
    this.mp = this.maxMp;
  }

  /** SP gauge cap = one full level (100) per Dragoon Level (0 until the Dragoon is unlocked). */
  get maxSp(): number {
    return this.dragoonUnlocked ? this.dragoonLevel * 100 : 0;
  }
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
  /** Remaining actions of the active Dragoon transformation (0 = human form). */
  private dragoonTurns = 0;
  private dragoonAura!: Mesh;
  private humanoid: Humanoid;
  /** Procedural Dragoon-form model, shown while transformed (currently Dart's Red-Eye only). */
  private dragoonForm?: DragoonForm;
  /** Rigged glTF model container (when the bearer supplies one), replacing the placeholder. */
  private modelRoot?: TransformNode;
  private modelAnims: {
    idle?: AnimationGroup;
    walk?: AnimationGroup;
    run?: AnimationGroup;
    attack?: AnimationGroup;
    idleCombat?: AnimationGroup;
    walkCombat?: AnimationGroup;
    runCombat?: AnimationGroup;
  } = {};
  private modelCurrent?: AnimationGroup;
  private modelAttacking = false;
  /** Combat stance: swaps to the combat idle/walk clips when the party is engaged (falls back to
   *  the peaceful clips when a character has no combat variant yet). Set by the mode each frame. */
  private combat = false;

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

    // Low-poly humanoid placeholder, tinted to the bearer. Replaced by a glTF
    // model if the bearer supplies one (loaded asynchronously below).
    this.humanoid = new Humanoid(scene, {
      color: bearer.color,
      bodyColor: bearer.bodyColor,
      weapon: bearer.weapon,
      weaponVariant: bearer.weaponVariant,
      hair: bearer.hair,
      outfit: bearer.outfit,
      scale: bearer.scale,
      skinTone: bearer.skinTone,
    });
    this.humanoid.rig.parent = this.root;
    if (bearer.model) void this.loadModel(bearer.model, scene);

    // Dragoon-form model, shown while transformed (the human figure is hidden). Classes with
    // a built form select its variant; the rest still use the glow aura until theirs exist.
    const formVariant = cls.id === "redEye" ? "redEye" : cls.id === "blueSea" ? "blueSea" : undefined;
    if (formVariant) {
      this.dragoonForm = new DragoonForm(scene, { variant: formVariant, scale: bearer.scale });
      this.dragoonForm.rig.parent = this.root;
      this.dragoonForm.setEnabled(false);
    }

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

    // Golden aura shown while transformed into Dragoon form.
    this.dragoonAura = MeshBuilder.CreateSphere("dragoonAura", { diameter: 2.6, segments: 12 }, scene);
    this.dragoonAura.position.y = 1;
    const auraMat = new StandardMaterial("dragoonAuraMat", scene);
    auraMat.diffuseColor = new Color3(1, 0.85, 0.4);
    auraMat.emissiveColor = new Color3(0.9, 0.7, 0.2);
    auraMat.alpha = 0.16;
    auraMat.backFaceCulling = false;
    this.dragoonAura.material = auraMat;
    this.dragoonAura.isVisible = false;
    this.dragoonAura.isPickable = false;
    this.dragoonAura.parent = this.root;

    // Start with a full MP pool so Dragoon magic is usable straight away in training.
    this.mp = this.maxMp;
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

  /** SP granted at the start of each turn by equipment (Spirit Ring). */
  get spPerTurn(): number {
    return this.equipped.reduce((sum, e) => sum + (e.spPerTurn ?? 0), 0);
  }

  /** Multiplier on SP earned from Additions (Wargod's Sash → 1.5). */
  get additionSpMultiplier(): number {
    return 1 + this.equipped.reduce((sum, e) => sum + (e.additionSpPct ?? 0), 0) / 100;
  }

  /**
   * Action speed: reference base + equipment Speed bonuses. Drives the ATB gauge
   * recharge rate (the future party will each have their own). At base speed with no
   * Speed gear this leaves the cadence unchanged.
   */
  get speed(): number {
    return this.cls.baseSpeed + this.gearTotal("spd");
  }

  /** Seconds to refill this character's ATB gauge — shorter with higher Speed. */
  get atbFillTime(): number {
    return atbFillTime(this.speed);
  }

  get maxHp(): number {
    return Math.floor(this.stats.maxHp * (1 + this.bonusPct("hpPct")));
  }
  /** Max MP = Dragoon Level × 20 (canon), 0 until the Dragoon is unlocked. Some gear doubles
   *  it via mpPct (mpPct 1 → ×2). */
  get maxMp(): number {
    if (!this.dragoonUnlocked) return 0;
    const base = Math.min(Math.max(this.dragoonLevel, 1), MAX_DRAGOON_LEVEL) * MP_PER_DRAGOON_LEVEL;
    return Math.floor(base * (1 + this.bonusPct("mpPct")));
  }
  get atk(): number {
    return this.withDragoon(this.stats.at + this.bonus("at"), "at");
  }
  get def(): number {
    return this.withDragoon(this.stats.df + this.bonus("df"), "df");
  }
  get matk(): number {
    return this.withDragoon(this.stats.mat + this.bonus("mat"), "mat");
  }
  get mdef(): number {
    return this.withDragoon(this.stats.mdf + this.bonus("mdf"), "mdf");
  }

  /** Apply the Dragoon-form stat multiplier (% by D'Level) when transformed, else identity. */
  private withDragoon(base: number, key: keyof DragoonStatMult): number {
    if (!this.transformed) return base;
    const i = Math.min(Math.max(this.dragoonLevel, 1), MAX_DRAGOON_LEVEL) - 1;
    return Math.floor((base * this.cls.dragoonStats[i][key]) / 100);
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

  /** Combat-time seconds left in the active guard stance. */
  get guardRemaining(): number {
    return this.guardTimer;
  }

  /** Active guard stance remaining as a fraction of its full duration (1 → 0). */
  get guardFraction(): number {
    return GUARD_DURATION > 0 ? Math.max(0, this.guardTimer / GUARD_DURATION) : 0;
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

  /** Rose/Blossom Storm: while active, incoming damage is halved (the Power-Up modifier). */
  private damageHalveTimer = 0;
  get damageHalved(): boolean {
    return this.damageHalveTimer > 0;
  }
  applyDamageHalve(seconds: number): void {
    this.damageHalveTimer = Math.max(this.damageHalveTimer, seconds);
  }

  /** Advance guard + buff timers (use combat-scaled dt). */
  tickGuard(dt: number): void {
    if (this.guardTimer > 0) {
      this.guardTimer = Math.max(0, this.guardTimer - dt);
      if (this.guardTimer === 0) this.guardShield.isVisible = false;
    }
    if (this.guardCdTimer > 0) this.guardCdTimer = Math.max(0, this.guardCdTimer - dt);
    if (this.damageHalveTimer > 0) this.damageHalveTimer = Math.max(0, this.damageHalveTimer - dt);
  }

  // --- Dragoon transformation ----------------------------------------------

  /** True for members with no Additions (Shana / Miranda): they use the basic attack and
   *  charge SP per attack instead of through Addition combos. */
  get usesBasicAttack(): boolean {
    return this.cls.additions.length === 0;
  }

  /** SP this member gains per basic attack, by current Dragoon Level (canon table). */
  get spPerBasicAttack(): number {
    const i = Math.min(Math.max(this.dragoonLevel, 1), MAX_DRAGOON_LEVEL) - 1;
    return SP_PER_BASIC_ATTACK[i];
  }

  /** Archers (Shana / Miranda): no D'Attack timing minigame — a single ranged strike. */
  get isArcher(): boolean {
    return this.bearer.weapon === "bow";
  }

  /** Max D'Attack strikes: archers 1, Kongol (Golden) 4, everyone else 5. */
  get dragoonStrikes(): number {
    if (this.isArcher) return 1;
    return this.cls.id === "golden" ? 4 : 5;
  }

  /** Base AT (Body + Gear, no Dragoon multiplier) — the D'Attack/Magic formulas apply the
   *  Dragoon % themselves, so they take this rather than the boosted {@link atk}. */
  get baseAtk(): number {
    return this.stats.at + this.bonus("at");
  }

  /** Dragoon-form AT multiplier (%) at the current D'Level (DRGNAT% in the canon formula). */
  get dragoonAtPct(): number {
    return this.dragoonStatAt("at");
  }

  /** Base MAT (Body + Gear, no Dragoon multiplier) — the Magic formula applies the % itself. */
  get baseMat(): number {
    return this.stats.mat + this.bonus("mat");
  }

  /** Dragoon-form MAT multiplier (%) at the current D'Level (DRGNMAT% in the Magic formula). */
  get dragoonMatPct(): number {
    return this.dragoonStatAt("mat");
  }

  private dragoonStatAt(key: "at" | "mat"): number {
    const i = Math.min(Math.max(this.dragoonLevel, 1), MAX_DRAGOON_LEVEL) - 1;
    return this.cls.dragoonStats[i][key];
  }

  /** Dragoon spells this member could ever learn (full list, in learn order). */
  get spells(): DragoonSpell[] {
    return spellsForClass(this.cls.id);
  }

  /** Spells castable right now: learned by the current D'Level and affordable in MP. */
  castableSpells(): DragoonSpell[] {
    return this.spells.filter((s) => s.dLevel <= this.dragoonLevel && s.mp <= this.mp);
  }

  /** Synthetic combo for the D'Attack: drives the timing runner (only its length matters —
   *  the damage uses {@link dragoonAttack}, not the hit %s). Length = {@link dragoonStrikes}. */
  get dragoonAttackDef(): AdditionDef {
    const n = this.dragoonStrikes;
    if (!this._dragoonDef || this._dragoonDef.hits.length !== n) {
      this._dragoonDef = {
        name: "D'Attack",
        hits: Array.from({ length: n }, () => 100),
        multiplier: [100, 100, 100, 100, 100],
        spMax: 0,
        acquireLevel: 1,
      };
    }
    return this._dragoonDef;
  }
  private _dragoonDef?: AdditionDef;

  /** Award SP, clamped to the gauge. */
  /** Award SP: fills the gauge (capped) and accrues toward the next Dragoon Level. SP keeps
   *  counting toward level-up even when the gauge is full, so D'level can rise without ever
   *  transforming. */
  gainSp(amount: number): void {
    if (!this.dragoonUnlocked) return; // no SP until the Dragoon Spirit is obtained
    const amt = Math.max(0, amount);
    this.sp = Math.min(this.maxSp, this.sp + amt);
    this.lifetimeSp += amt;
    const th = this.cls.dLevelThresholds;
    let lvl = 1;
    while (lvl - 1 < th.length && this.lifetimeSp >= th[lvl - 1]) lvl += 1;
    if (lvl > this.dragoonLevel) this.dragoonLevel = Math.min(lvl, MAX_DRAGOON_LEVEL);
  }

  /** Set the Dragoon Level (clamped 1–{@link MAX_DRAGOON_LEVEL}). Debug/training override —
   *  refills MP to the new max (max MP scales with D'Lv). */
  setDragoonLevel(level: number): void {
    this.dragoonLevel = Math.min(Math.max(Math.floor(level), 1), MAX_DRAGOON_LEVEL);
    this.mp = this.maxMp;
  }

  /** Whether the Dragoon form is currently active. Kept distinct from {@link dragoonTurns} so the
   *  form (and its boosted DEF/MDF) persists through the whole of an action — the revert happens
   *  at the action's END once the last turn is spent (see {@link dragoonSpent}), not at its start. */
  private dragoonActive = false;

  /** True while in Dragoon form (boosted stats, D'Attack + Magic available). */
  get transformed(): boolean {
    return this.dragoonActive;
  }

  /** True when the Dragoon is unlocked, the SP gauge holds ≥1 full level (100), and we're not
   *  already transformed. */
  get canTransform(): boolean {
    return this.dragoonUnlocked && !this.dragoonActive && this.sp >= 100;
  }

  /** Enter Dragoon form. Each full 100-SP block becomes one turn; any remainder is lost
   *  (180 → 100). The gauge then drains 100 per action until it empties. */
  transform(): void {
    if (!this.canTransform) return;
    this.dragoonActive = true;
    this.dragoonTurns = Math.floor(this.sp / 100);
    this.sp = this.dragoonTurns * 100;
    if (this.dragoonForm) {
      // Swap the human figure for the Dragoon model (it carries its own glow — no aura).
      this.setFigureEnabled(false);
      this.dragoonForm.setEnabled(true);
    } else {
      this.dragoonAura.isVisible = true;
    }
  }

  /** Spend one 100-SP block when an action begins. The form stays active (boosted) through the
   *  action; call {@link revert} at the action's end if {@link dragoonSpent} is then true. */
  tickDragoon(): void {
    if (this.dragoonTurns > 0) {
      this.dragoonTurns -= 1;
      this.sp = this.dragoonTurns * 100;
    }
  }

  /** True once the form has spent its last turn — the member should revert when the current
   *  action finishes (so the boosted stats covered the whole action). */
  get dragoonSpent(): boolean {
    return this.dragoonActive && this.dragoonTurns === 0;
  }

  /** Return to human form: at an action's end once SP runs out, or forced on death (HP 0). */
  revert(): void {
    this.dragoonActive = false;
    this.dragoonTurns = 0;
    this.sp = 0;
    this.dragoonAura.isVisible = false;
    if (this.dragoonForm) {
      this.dragoonForm.setEnabled(false);
      this.setFigureEnabled(true);
    }
  }

  /** Show/hide the active human figure — the loaded model if there is one, else the placeholder. */
  private setFigureEnabled(on: boolean): void {
    if (this.modelRoot) this.modelRoot.setEnabled(on);
    else this.humanoid.setEnabled(on);
  }

  // --- Magic / healing ------------------------------------------------------

  /** True when Dragoon magic can be cast: in Dragoon form with at least one castable spell. */
  get canCastMagic(): boolean {
    return this.transformed && this.castableSpells().length > 0;
  }

  /** Restore HP (clamped to Max HP). Returns the amount actually healed. */
  heal(amount: number): number {
    const before = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + Math.max(0, amount));
    return this.hp - before;
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
  move(dir: Vector3, dt: number, running = true): void {
    if (dir.lengthSquared() < 1e-4) return;
    const step = dir.normalize().scale((running ? RUN_SPEED : WALK_SPEED) * dt);
    this.root.position.addInPlace(step);
    // Face the direction of travel.
    this.root.rotation.y = Math.atan2(step.x, step.z);
  }

  /** Turn to face a world-space ground direction (e.g. toward an attack target). */
  face(dir: Vector3): void {
    if (dir.lengthSquared() < 1e-4) return;
    this.root.rotation.y = Math.atan2(dir.x, dir.z);
  }

  /** Advance the active figure's idle/walk/run animation (visual only). `running` selects the run
   *  clip over the walk clip while moving (gauged by joystick magnitude / desktop click-to-move). */
  animate(dt: number, moving: boolean, running = false): void {
    if (this.dragoonActive && this.dragoonForm) {
      this.dragoonForm.update(dt, moving);
      return;
    }
    if (this.modelRoot) {
      if (!this.modelAttacking) {
        const idle = (this.combat && this.modelAnims.idleCombat) || this.modelAnims.idle;
        const walk = (this.combat && this.modelAnims.walkCombat) || this.modelAnims.walk;
        const run = (this.combat && this.modelAnims.runCombat) || this.modelAnims.run;
        // Run clip if running (fall back to walk when a character has no run clip yet).
        const locomotion = (running ? run ?? walk : walk) ?? idle;
        this.playModel(moving ? locomotion : idle, true);
      }
      return;
    }
    this.humanoid.update(dt, moving);
  }

  /** Enter/leave the combat stance (the mode sets this from enemy proximity). Swaps to the combat
   *  idle/walk clips when available; a no-op figure-wise for placeholder/procedural bearers. */
  setCombat(on: boolean): void {
    this.combat = on;
  }

  /** Play a one-shot strike animation (call when a blow lands). */
  strike(): void {
    if (this.dragoonActive && this.dragoonForm) {
      this.dragoonForm.strike();
      return;
    }
    if (this.modelRoot) {
      const a = this.modelAnims.attack;
      if (!a) return; // no attack clip yet — stay in the current loop
      this.modelAttacking = true;
      this.modelCurrent?.stop();
      this.modelCurrent = a;
      a.start(false, 1.2, a.from, a.to);
      a.onAnimationGroupEndObservable.addOnce(() => {
        this.modelAttacking = false;
      });
      return;
    }
    this.humanoid.strike();
  }

  /** Loop/replace the model's current animation group (no-op if already playing it). */
  private playModel(group: AnimationGroup | undefined, loop: boolean): void {
    if (!group || group === this.modelCurrent) return;
    this.modelCurrent?.stop();
    this.modelCurrent = group;
    group.start(loop, 1, group.from, group.to);
  }

  /**
   * Load a rigged glTF/GLB model (base filename in src/assets/models/) for the bearer and swap out
   * the procedural placeholder: auto-fit to {@link MODEL_TARGET_H}, orient to face forward, flatten
   * its painted materials, and map idle/walk/attack clips driven by {@link animate}/{@link strike}.
   * Best-effort — any failure keeps the placeholder.
   */
  private async loadModel(name: string, scene: Scene): Promise<void> {
    const res = await importModel(scene, name).catch(() => undefined);
    if (!res) return;
    if (this.root.isDisposed()) {
      for (const m of res.meshes) m.dispose();
      return;
    }

    const modelRoot = new TransformNode(`playerModel:${this.bearer.id}`, scene);
    for (const mesh of res.meshes) {
      if (!mesh.parent) mesh.parent = modelRoot;
      mesh.isPickable = false;
    }
    flattenCellShaded(res.meshes); // painted textures read flat-diffuse in the dim scene

    // Auto-fit to a fixed height with feet at y=0 (AI/AccuRIG exports arrive at arbitrary scale).
    let lo = Infinity;
    let hi = -Infinity;
    for (const mesh of res.meshes) {
      if (mesh.getTotalVertices() === 0) continue;
      mesh.computeWorldMatrix(true);
      const bb = mesh.getBoundingInfo().boundingBox;
      lo = Math.min(lo, bb.minimumWorld.y);
      hi = Math.max(hi, bb.maximumWorld.y);
    }
    if (hi > lo) {
      const f = MODEL_TARGET_H / (hi - lo);
      modelRoot.scaling.setAll(f);
      modelRoot.position.y = -lo * f;
    }
    modelRoot.rotation.y = MODEL_YAW;
    modelRoot.parent = this.root;
    this.modelRoot = modelRoot;
    this.humanoid.setEnabled(false); // the model replaces the placeholder

    const g = res.animationGroups;
    const has = (a: AnimationGroup, ...k: string[]) => k.some((s) => a.name.toLowerCase().includes(s));
    const combatOf = (a: AnimationGroup) => has(a, "combat", "fight", "battle");
    this.modelAnims.attack = g.find((a) => has(a, "slash", "attack", "swing", "punch", "kick"));
    // Peaceful (exploration) vs combat sets for idle / walk / run — combat clips are tagged in the name.
    this.modelAnims.idleCombat = g.find((a) => has(a, "idle") && combatOf(a));
    this.modelAnims.walkCombat = g.find((a) => has(a, "walk") && combatOf(a));
    this.modelAnims.runCombat = g.find((a) => has(a, "run") && combatOf(a));
    this.modelAnims.idle = g.find((a) => has(a, "idle") && !combatOf(a)) ?? g.find((a) => has(a, "idle")) ?? g[0];
    this.modelAnims.walk = g.find((a) => has(a, "walk") && !combatOf(a)) ?? g.find((a) => has(a, "walk"));
    this.modelAnims.run = g.find((a) => has(a, "run") && !combatOf(a)) ?? g.find((a) => has(a, "run"));
    for (const grp of g) grp.stop(); // ImportMesh auto-plays the first — stop all
    this.playModel(this.modelAnims.idle, true);

    if (this.bearer.weaponModel) await this.attachWeapon(this.bearer.weaponModel, scene, res.skeletons[0]);
  }

  /** Attach a weapon GLB to the model's right-hand bone so it follows every animation. The bone's
   *  (large, mirrored) world scale is cancelled by a socket, then the weapon is sized in world units;
   *  the mesh is flipped and grip-aligned so the haft seats in the fist and the head points up. */
  private async attachWeapon(name: string, scene: Scene, skeleton?: Skeleton): Promise<void> {
    const hand = HAND_BONES.map((n) => skeleton?.bones.find((b) => b.name === n)?.getTransformNode()).find(
      (n): n is NonNullable<typeof n> => !!n,
    );
    if (!hand) return;
    const res = await importModel(scene, name).catch(() => undefined);
    if (!res || this.root.isDisposed()) {
      if (res) for (const m of res.meshes) m.dispose();
      return;
    }
    tuneWeapon(res.meshes); // glint + self-illumination so it reads in the dim scene

    hand.computeWorldMatrix(true);
    const s = hand.absoluteScaling;
    const scale = this.bearer.scale ?? 1;
    const socket = new TransformNode(`weaponSocket:${this.bearer.id}`, scene);
    socket.parent = hand;
    socket.scaling = new Vector3(scale / s.x, scale / s.y, scale / s.z);

    const weapon = new TransformNode(`weapon:${this.bearer.id}`, scene);
    weapon.parent = socket;
    weapon.rotation.z = -Math.PI / 2; // haft axis out of the fist
    weapon.scaling.setAll(WEAPON_SCALE);

    const align = new TransformNode(`weaponAlign:${this.bearer.id}`, scene);
    align.parent = weapon;
    align.rotation.x = Math.PI; // flip so the head points up
    align.position.y = WEAPON_GRIP_Y; // seat the grip on the socket origin (the fist)
    for (const mesh of res.meshes) {
      if (!mesh.parent) mesh.parent = align;
      mesh.isPickable = false;
    }
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
