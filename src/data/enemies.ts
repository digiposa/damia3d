import type { Stats } from "../combat/types";

export type Element =
  | "Fire"
  | "Water"
  | "Wind"
  | "Earth"
  | "Light"
  | "Darkness"
  | "Thunder"
  | "Non-Elemental";

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
  /** EXP awarded on defeat. */
  expReward: number;
  /** Gold awarded on defeat. */
  goldReward: number;
}

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
  expReward: 2,
  goldReward: 3,
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
  expReward: 24,
  goldReward: 15,
};

/** Default Knight of Sandora used in the sandbox (the first-encountered Seles squad member). */
export const KNIGHT_OF_SANDORA = KNIGHT_OF_SANDORA_SELES;
