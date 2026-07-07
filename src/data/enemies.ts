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
  /** Whether the enemy can counter the player's Additions. */
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
  model: "knight",
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
  model: "knight",
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
  scale: 1.6,
  bodyColor: [0.28, 0.18, 0.42],
  model: "knight",
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
  model: "knight",
};
