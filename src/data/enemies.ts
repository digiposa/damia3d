import type { Stats } from "../combat/types";
import type { Element } from "../combat/element";

export type { Element };

/**
 * An enemy action. `multiplier` is the hidden Attack Multiplier fed to the
 * damage formula (e.g. Sword Slash = 1× physical, Throw Dagger = 0.5×).
 * `element` applies to magical attacks (e.g. Burn Out = Fire).
 */
export interface EnemyAttack {
  name: string;
  kind: "physical" | "magical";
  multiplier: number;
  element?: Element;
}

/** AI profile: "basic" uses attacks[0]; "commander" runs the Seles boss script; "dummy" never acts. */
export type EnemyBehavior = "basic" | "commander" | "dummy";

/** Static definition of an enemy: identity, element, stats and battle yield. */
export interface EnemyDef {
  id: string;
  name: string;
  element: Element;
  stats: Stats;
  /** Speed (turn order). */
  spd: number;
  /** Physical / magical avoidance, as a percentage (0–100). */
  aAv: number;
  mAv: number;
  /** Whether the enemy can counter the player's Additions. TODO: dormant — not yet read by combat.
   *  The counter damage formula (`additionCounter` in combat/formula.ts) exists + is tested; what's
   *  missing is the trigger in the combat flow. See the Backlog in docs/WIP.md. */
  countersAdditions: boolean;
  /** Actions the enemy can take. The first is its default basic attack. */
  attacks: EnemyAttack[];
  /** EXP awarded on defeat. */
  expReward: number;
  /** Gold awarded on defeat. */
  goldReward: number;
  /** AI profile (defaults to "basic"). */
  behavior?: EnemyBehavior;
  /** Visual scale of the placeholder mesh (bosses are larger). */
  scale?: number;
  /** Body colour as RGB 0–1 (defaults to the knight's grey-blue). */
  bodyColor?: [number, number, number];
  /**
   * Optional rigged GLB model (base filename in src/assets/models/) replacing the placeholder
   * capsule, with animations (idle / walk / attack). Falls back to the capsule if absent.
   */
  model?: string;
  /**
   * The model's shading is painted into its texture (AI cartoon/cell-shaded exports). Render it
   * flat-diffuse (metallic 0, roughness 1, no env) so the painted look shows, instead of the
   * metallic PBR tuning used for genuinely metal assets.
   */
  cellShaded?: boolean;
  /** Yaw (degrees) spinning the model so its front faces the enemy's forward (+Z, toward the target).
   *  Needed for exports whose authored facing isn't +Z — e.g. a Tripo creature that looks backward. */
  modelYaw?: number;
  /** Optional weapon GLB (base filename in src/assets/models/) attached to the model's right-hand
   *  bone (mixamorig:RightHand). The blade is authored along the mesh's own axis; the engine seats
   *  the grip in the fist and points it out. */
  weaponModel?: string;
  /** Marks a boss: wider health bar + name plate. */
  isBoss?: boolean;
  /** Cannot be killed (clamped at 1 HP) — for the training dummy. */
  immortal?: boolean;
}

/**
 * Training Dummy — a non-canon practice target. Does not move or attack and
 * cannot be killed (HP clamps at 1), so it stays put as a damage/Addition test
 * bag. Non-elemental and moderate DF for clean baseline numbers.
 */
export const TRAINING_DUMMY: EnemyDef = {
  id: "training_dummy",
  name: "Training Dummy",
  element: "Non-Elemental",
  stats: { maxHp: 999999, at: 0, df: 50, mat: 0, mdf: 50 },
  spd: 1,
  aAv: 0,
  mAv: 0,
  countersAdditions: false,
  attacks: [{ name: "—", kind: "physical", multiplier: 0 }],
  expReward: 0,
  goldReward: 0,
  behavior: "dummy",
  immortal: true,
  bodyColor: [0.72, 0.58, 0.32],
};

/**
 * Knight of Sandora — Seles variant. First encountered occupying Seles; a weak,
 * scripted tutorial-tier foe (tiny HP, high DF) that does not counter Additions.
 */
export const KNIGHT_OF_SANDORA_SELES: EnemyDef = {
  id: "knight_of_sandora_seles",
  name: "Knight of Sandora",
  element: "Fire",
  stats: { maxHp: 4, at: 2, df: 40, mat: 2, mdf: 50 },
  spd: 40,
  aAv: 0,
  mAv: 0,
  countersAdditions: false,
  attacks: [
    { name: "Sword Slash", kind: "physical", multiplier: 1 },
    { name: "Throw Dagger", kind: "physical", multiplier: 0.5 },
  ],
  expReward: 2,
  goldReward: 3,
  model: "knight_sandora",
  cellShaded: true,
  weaponModel: "kos_sword",
};

/**
 * Knight of Sandora — Black Castle variant. A far tougher version patrolling the
 * Black Castle in Kazas: high HP/DF, self-heals, and counters Additions.
 */
export const KNIGHT_OF_SANDORA_BLACK_CASTLE: EnemyDef = {
  id: "knight_of_sandora_black_castle",
  name: "Knight of Sandora",
  element: "Fire",
  stats: { maxHp: 180, at: 21, df: 100, mat: 21, mdf: 100 },
  spd: 50,
  aAv: 0,
  mAv: 0,
  countersAdditions: true,
  attacks: [
    { name: "Throw Knife", kind: "physical", multiplier: 1 },
    { name: "Sword Slash", kind: "physical", multiplier: 2 },
  ],
  expReward: 24,
  goldReward: 15,
  model: "knight_sandora",
  cellShaded: true,
  weaponModel: "kos_sword",
};

/** Default Knight of Sandora used in the sandbox (the first-encountered Seles squad member). */
export const KNIGHT_OF_SANDORA = KNIGHT_OF_SANDORA_SELES;

/**
 * Commander — Seles Boss. Confronts Dart in Seles alongside two Knights of
 * Sandora. Once the Knights fall it uses Power Up (single use): Sword Slash is
 * replaced by Slash Twice (2×) and Burn Out rises to 1.5×. Recovers 30% HP when
 * below 51%. Darkness element; does not counter Additions.
 */
export const COMMANDER_SELES: EnemyDef = {
  id: "commander_seles",
  name: "Commander",
  element: "Darkness",
  stats: { maxHp: 14, at: 2, df: 40, mat: 4, mdf: 40 },
  spd: 40,
  aAv: 0,
  mAv: 0,
  countersAdditions: false,
  attacks: [
    { name: "Sword Slash", kind: "physical", multiplier: 1 },
    { name: "Burn Out", kind: "magical", multiplier: 1.2, element: "Fire" },
    { name: "Slash Twice", kind: "physical", multiplier: 2 },
  ],
  expReward: 20,
  goldReward: 20,
  behavior: "commander",
  isBoss: true,
  scale: 1.3,
  bodyColor: [0.28, 0.18, 0.42],
  model: "commander",
  cellShaded: true,
  weaponModel: "commander_sword",
};

/**
 * Commander — Marshland minor enemy. A much tougher field version that counters
 * Additions. Its full kit (Multi Slash at ≤50% HP, Stunning Hammer) awaits a
 * status-effect system; for now it uses Sword Slash.
 */
export const COMMANDER_MARSHLAND: EnemyDef = {
  id: "commander_marshland",
  name: "Commander",
  element: "Darkness",
  stats: { maxHp: 128, at: 11, df: 120, mat: 9, mdf: 80 },
  spd: 70,
  aAv: 0,
  mAv: 0,
  countersAdditions: true,
  attacks: [
    { name: "Sword Slash", kind: "physical", multiplier: 1 },
    { name: "Multi Slash", kind: "physical", multiplier: 2 },
    { name: "Stunning Hammer", kind: "physical", multiplier: 0 },
  ],
  expReward: 17,
  goldReward: 9,
  scale: 1.3,
  bodyColor: [0.3, 0.2, 0.4],
  model: "commander",
  cellShaded: true,
  weaponModel: "commander_sword",
};

/* ============================================================================
 * Forest — Disc 1, area #2 (Seles → Forest → Hellena Prison). Four minor enemies,
 * one per element: Berserk Mouse (Darkness), Assassin Cock (Wind), Trent (Earth),
 * Goblin (Fire). Added in canonical order of appearance.
 *
 * STAT CONVENTION: we use the Japanese PS1 values when known (they usually differ
 * from — and are often higher than — the EU/US numbers on thelegendofdragoon.org).
 * The fandom wiki lists JP figures in parentheses. When only EU/US stats exist, we
 * use those and flag the gap. Movesets/flags come from the tier-2 wiki (version-agnostic).
 * ========================================================================== */

/**
 * Berserk Mouse — Darkness critter, "quite large and aggressive". Counters Additions.
 * Canon moveset: ~Bite (1×) above 50% HP, Chisel (2×) at/below 50%, plus a "Run away!".
 * Under the basic AI it uses its first melee attack (Bite); Chisel is kept for a future
 * HP-threshold behaviour, and the flee action isn't modelled yet. Stats are the JP values
 * (HP/AT/MAT/SPD higher, EXP/Gold lower than EU/US). No model yet → placeholder capsule.
 */
export const BERSERK_MOUSE: EnemyDef = {
  id: "berserk_mouse",
  name: "Berserk Mouse",
  element: "Darkness",
  stats: { maxHp: 4, at: 2, df: 80, mat: 2, mdf: 120 }, // JP (EU/US: hp2 at1 mat1)
  spd: 50, // JP (EU/US: 45)
  aAv: 0,
  mAv: 0,
  countersAdditions: true,
  attacks: [
    { name: "Bite", kind: "physical", multiplier: 1 }, // >50% HP — the active melee attack
    { name: "Chisel", kind: "physical", multiplier: 2 }, // ≤50% HP — inactive under basic AI (v1)
  ],
  expReward: 1, // JP (EU/US: 3)
  goldReward: 1, // JP (EU/US: 3)
  model: "berserk_mouse", // Tripo quadruped, un-rigged → engine synthesises rigid idle/walk/attack
  cellShaded: true, // painted Tripo texture — render flat-diffuse
  // fitHeight normalises to 1.8 (human height); this flat, wide critter needs shrinking to a big-rat
  // size. scale multiplies the whole enemy (model + health bar). Tune in-game if too big/small.
  scale: 0.45,
  modelYaw: 0, // flip to 180 if it faces away from its target in-game
  bodyColor: [0.28, 0.24, 0.34], // fallback capsule tint if the model fails to load
};

/**
 * Trent — Earth, an ambulatory quadrupedal tree-creature. Counters Additions. Canon moveset:
 * ~Trunk Slap (1.5× physical) above 25% HP, Pellet (1.5× Earth-elemental magic) at/below 50%.
 * Under the basic AI it uses its first attack (Trunk Slap); Pellet — its Earth magic — is kept for a
 * future HP-threshold behaviour. JP stats (AT/MAT/MDF higher, Gold lower than EU/US). Non-humanoid
 * (un-rigged Tripo mesh) → rigid procedural animation, same as the Berserk Mouse.
 */
export const TRENT: EnemyDef = {
  id: "trent",
  name: "Trent",
  element: "Earth",
  stats: { maxHp: 6, at: 3, df: 160, mat: 3, mdf: 120 }, // JP (EU/US: hp5 at2 mat2 mdf40)
  spd: 30,
  aAv: 0,
  mAv: 0,
  countersAdditions: true,
  attacks: [
    { name: "Trunk Slap", kind: "physical", multiplier: 1.5 }, // >25% HP — the active attack
    { name: "Pellet", kind: "magical", multiplier: 1.5, element: "Earth" }, // ≤50% HP — inactive under basic AI (v1)
  ],
  expReward: 4,
  goldReward: 3, // JP (EU/US: 9)
  model: "trent", // Tripo quadruped, un-rigged → engine synthesises rigid idle/walk/attack
  cellShaded: true, // painted Tripo texture — render flat-diffuse
  scale: 1.4, // a looming treant — taller than the ~1.8 party (fitHeight normalises to 1.8, ×1.4 ≈ 2.5)
  modelYaw: 0, // flip to 180 if it faces away from its target in-game
  bodyColor: [0.3, 0.34, 0.22], // fallback capsule tint if the model fails to load
};

/**
 * Goblin — Fire, a small greenish humanoid swinging a large bone as a club. Counters Additions.
 * Canon moveset: ~Bone Club (1.5× physical) above 50% HP; at/below 50% either Throw Stone (3×) or
 * ~Kick (4×). Under the basic AI it melees with Bone Club and throws stones from range (Throw Stone
 * is picked up as the ranged attack once the rigged model brings a throw clip); Kick waits on a
 * future HP-threshold behaviour. JP stats (HP/MAT higher, Gold lower than EU/US).
 *
 * Humanoid, but Mixamo's auto-rig botched its shoulder/arm weights (squat proportions → the mesh
 * stretched on any arm motion). Instead we skin-transferred the Knight of Sandora's clean weights +
 * mixamorig skeleton onto the goblin mesh (proximity), reusing the Knight's clips
 * (Idle/Walking/Slash/Death/Throw). Deforms coherently (a bit stiff at the forearms). The bone club
 * rides mixamorig:RightHand; Throw Stone lobs a rock (Arrow's "stone" projectile).
 */
export const GOBLIN: EnemyDef = {
  id: "goblin",
  name: "Goblin",
  element: "Fire",
  stats: { maxHp: 5, at: 2, df: 120, mat: 3, mdf: 120 }, // JP (EU/US: hp4 mat1)
  spd: 40,
  aAv: 0,
  mAv: 0,
  countersAdditions: true,
  attacks: [
    { name: "Bone Club", kind: "physical", multiplier: 1.5 }, // >50% HP — the active melee attack
    { name: "Throw Stone", kind: "physical", multiplier: 3 }, // ≤50% HP — thrown, lands as a rock
    { name: "Kick", kind: "physical", multiplier: 4 }, // ≤50% HP — inactive under basic AI (v1)
  ],
  expReward: 4,
  goldReward: 2, // JP (EU/US: 6)
  model: "goblin", // goblin mesh on the Knight's skin-transferred rig (Idle/Walk/Slash/Death/Throw)
  weaponModel: "goblin_weapon", // the bone club, on mixamorig:RightHand
  cellShaded: true, // painted Tripo texture — render flat-diffuse
  scale: 0.7, // a small humanoid, shorter than the ~1.8 party. Tune in-game.
  modelYaw: 0, // mixamorig faces forward like the Knight; flip to 180 if needed
  bodyColor: [0.32, 0.4, 0.24], // fallback capsule tint if the model fails to load
};
