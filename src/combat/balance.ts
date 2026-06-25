import { additionAttack, type AttackerStats } from "./formula";
import {
  additionHitsPercent,
  additionMultiplier,
  additionPresses,
  type AdditionDef,
} from "../data/additions";
import { additionSightDuration, COMPLETE_RECOVERY, MISS_RECOVERY_MAX } from "./AdditionRunner";

/** A timed hit is assumed to land near the window centre (fraction of SIGHT_DURATION). */
const PRESS_AT = 0.95;

export interface DpsEstimate {
  /** Damage of a fully-landed Addition (sum of all hits). */
  fullDamage: number;
  /** Sustained DPS completing the Addition (timed hits + the short success recovery). */
  fullDps: number;
  /** Damage of the free, guaranteed hit 1 alone. */
  spamDamage: number;
  /** Sustained DPS spamming hit 1 and aborting (incurs the long whiff recovery each time). */
  spamDps: number;
  /** fullDps / spamDps — > 1 means completing the Addition out-DPSes spamming hit 1. */
  ratio: number;
}

/**
 * Theoretical DPS for an Addition at a given level vs the "spam hit 1 then abort"
 * exploit, against a reference defence. Mirrors {@link AdditionRunner}'s timing so the
 * Training balance readout tracks the live tuning. The ratio is the headline number
 * (it is roughly DF-independent); the absolute DPS scales with the chosen targetDf.
 */
export function estimateDps(
  atk: AttackerStats,
  def: AdditionDef,
  level: number,
  targetDf: number,
): DpsEstimate {
  const mult = additionMultiplier(def, level);
  const presses = additionPresses(def);

  // Canon per-execution damage (no ramp); adaptive timing keeps each Addition ~one
  // action long, so DPS tracks this canon damage.
  const fullDamage = additionAttack(atk, targetDf, additionHitsPercent(def), mult);
  const fullTime = presses * additionSightDuration(def) * PRESS_AT + COMPLETE_RECOVERY;
  const fullDps = fullDamage / fullTime;

  const spamDamage = additionAttack(atk, targetDf, additionHitsPercent(def, 1), mult);
  // Start the Addition (free hit 1) then abort immediately — the worst-case spam, which
  // eats the MAX whiff recovery. A press-less basic attack just completes (short recovery).
  const spamTime = presses > 0 ? MISS_RECOVERY_MAX : COMPLETE_RECOVERY;
  const spamDps = spamDamage / spamTime;

  return { fullDamage, fullDps, spamDamage, spamDps, ratio: spamDps > 0 ? fullDps / spamDps : 0 };
}
