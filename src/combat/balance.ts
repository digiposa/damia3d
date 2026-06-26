import { additionAttack, type AttackerStats } from "./formula";
import {
  additionHitsPercent,
  additionMultiplier,
  additionPresses,
  type AdditionDef,
} from "../data/additions";
import { SIGHT_DURATION, ATTACK_INTERVAL } from "./AdditionRunner";

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
  fillTime = ATTACK_INTERVAL,
): DpsEstimate {
  const mult = additionMultiplier(def, level);
  const presses = additionPresses(def);

  // Canon per-execution damage. Each attack spends the ATB gauge at its start and the
  // gauge refills over `fillTime` (the character's Speed-scaled cadence); a long combo
  // that overruns the fill costs its own length instead. So DPS tracks the canon damage.
  const fullDamage = additionAttack(atk, targetDf, additionHitsPercent(def), mult);
  const comboTime = presses * SIGHT_DURATION * PRESS_AT;
  const fullTime = Math.max(fillTime, comboTime);
  const fullDps = fullDamage / fullTime;

  // Spam: start the Addition (free hit 1) then abort — that still burns a whole gauge
  // refill for just hit 1's damage (a pure opportunity cost).
  const spamDamage = additionAttack(atk, targetDf, additionHitsPercent(def, 1), mult);
  const spamTime = presses > 0 ? fillTime : fullTime;
  const spamDps = spamDamage / spamTime;

  return { fullDamage, fullDps, spamDamage, spamDps, ratio: spamDps > 0 ? fullDps / spamDps : 0 };
}
