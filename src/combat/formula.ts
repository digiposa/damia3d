import { modifiers, type Modifiers } from "./modifiers";
import { oppositeOf, type Element } from "./element";

/**
 * Faithful re-implementation of *The Legend of Dragoon*'s damage formulas.
 *
 * Two engine quirks drive everything here:
 *  - The game truncates decimals after every operation (it cannot hold floats),
 *    modelled with {@link Math.floor} applied at each documented step.
 *  - When the game explicitly "rounds" a division it uses (x + y/2) / y then
 *    truncates — see {@link lodRound}.
 *
 * Each formula reproduces the documented "modifier wrapper": the exact nesting
 * of floors and the order in which Target Fear, Attacker Fear, Power, Field,
 * Element, Guard and Destroyer Mace are multiplied in. Modifiers default to 1
 * (neutral), so callers only pass the ones that are active.
 */

const f = Math.floor;

/** LoD's rounded integer division: floor((numerator + divisor/2) / divisor). The divisor (always
 *  a target's DF/MDF here) is clamped to ≥1 so a 0-defence target can't yield Infinity/NaN damage. */
export function lodRound(numerator: number, divisor: number): number {
  const d = Math.max(1, divisor);
  return f((numerator + d / 2) / d);
}

// ---------------------------------------------------------------------------
// Player formulas
// ---------------------------------------------------------------------------

export interface AttackerStats {
  at: number;
  lv: number;
}

/**
 * Basic physical ("Archer") attack:
 *   round{AT * (LV + 5) * 5 / DF}
 * then floors for (Target Fear · Attacker Fear), Power, Field, Element.
 * Guard and Destroyer Mace do not apply.
 */
export function physicalAttack(
  attacker: AttackerStats,
  targetDf: number,
  mods: Partial<Modifiers> = {},
): number {
  const m = modifiers(mods);
  const base = lodRound(attacker.at * (attacker.lv + 5) * 5, targetDf);
  let d = f(base * m.targetFear * m.attackerFear);
  d = f(d * m.power);
  d = f(d * m.field);
  d = f(d * m.element);
  return d;
}

/**
 * Player Addition damage:
 *   round{ floor[ floor{ Σhits * Multiplier / 100 } * AT / 100 ] * (LV+5) * 5 / DF }
 * then floors for (Target Fear · Attacker Fear), Power, Field, Element, Destroyer Mace.
 * Guard does not apply.
 *
 * @param hitsPercent  sum of the landed hits' percentages (see addition data)
 * @param multiplier   the Addition's level multiplier (100, 105, …)
 */
export function additionAttack(
  attacker: AttackerStats,
  targetDf: number,
  hitsPercent: number,
  multiplier: number,
  mods: Partial<Modifiers> = {},
): number {
  const m = modifiers(mods);
  const inner = f((hitsPercent * multiplier) / 100);
  const scaled = f((inner * attacker.at) / 100);
  const base = lodRound(scaled * (attacker.lv + 5) * 5, targetDf);
  let d = f(base * m.targetFear * m.attackerFear);
  d = f(d * m.power);
  d = f(d * m.field);
  d = f(d * m.element);
  d = f(d * m.destroyerMace);
  return d;
}

/** D'Attack damage multiplier (Output) by number of successful inputs (1→5). The wiki's
 *  `0.05·n² − 0.05·n + 1` term ×100, as the documented lookup. */
export const DRAGOON_OUTPUT = [100, 110, 130, 160, 200];

/**
 * Dragoon D'Attack damage.
 *   Non-archers: round{ floor[ floor{Output · DRGNAT%/100} · AT/100 ] · (LV+5)·5 / DF }
 *   Archers:     round{ floor[ AT · DRGNAT%/100 ] · (LV+5)·5 / DF }
 * then floors for (Target Fear · Power), Field, Element. `AT` is the status-screen total
 * (NOT pre-multiplied by DRGNAT% — the formula applies it). `dragoonAtPct` is the line's
 * DRGNAT% at the current D'Level.
 */
export function dragoonAttack(
  attacker: AttackerStats,
  targetDf: number,
  output: number,
  dragoonAtPct: number,
  mods: Partial<Modifiers> = {},
  archer = false,
): number {
  const m = modifiers(mods);
  const scaled = archer
    ? f((attacker.at * dragoonAtPct) / 100)
    : f((f((output * dragoonAtPct) / 100) * attacker.at) / 100);
  const base = lodRound(scaled * (attacker.lv + 5) * 5, targetDf);
  let d = f(base * m.targetFear * m.power);
  d = f(d * m.field);
  d = f(d * m.element);
  return d;
}

/**
 * Dragoon Magic damage.
 *   floor{ floor[ floor{ floor[ floor{ floor[MAT · DRGNMAT%/100] · (LV+5)·5 / MDF } · Multiplier/100 ] · Fear · Power } · Field ] · Element }
 * `mat` is the caster's status-screen MAT (NOT pre-multiplied by DRGNMAT% — the formula
 * applies it); `targetMdf` is the target's Magic Defense; `dragoonMatPct` is the line's
 * DRGNMAT% at the current D'Level; `multiplier` is the spell's.
 */
export function magicAttack(
  casterMat: number,
  targetMdf: number,
  dragoonMatPct: number,
  multiplier: number,
  lv: number,
  mods: Partial<Modifiers> = {},
): number {
  const m = modifiers(mods);
  const a = f((casterMat * dragoonMatPct) / 100);
  const b = f((a * (lv + 5) * 5) / Math.max(1, targetMdf));
  const c = f((b * multiplier) / 100);
  let d = f(c * m.targetFear * m.power);
  d = f(d * m.field);
  d = f(d * m.element);
  return d;
}

// ---------------------------------------------------------------------------
// Enemy formulas
// ---------------------------------------------------------------------------

/**
 * Enemy physical attack:
 *   floor[AT^2 * 5 / DF] * Attack Multiplier
 * then floors for (AttackMultiplier · Target Fear · Attacker Fear), Power, Guard.
 * Field, Element and Destroyer Mace do not apply.
 *
 * @param attackMultiplier hidden per-ability multiplier (e.g. Sword Slash = 1, Throw Dagger = 0.5)
 */
export function enemyPhysicalAttack(
  attackerAt: number,
  targetDf: number,
  attackMultiplier: number,
  mods: Partial<Modifiers> = {},
): number {
  const m = modifiers(mods);
  const base = f((attackerAt * attackerAt * 5) / Math.max(1, targetDf));
  let d = f(base * attackMultiplier * m.targetFear * m.attackerFear);
  d = f(d * m.power);
  d = f(d * m.guard);
  return d;
}

/**
 * Enemy magical attack:
 *   floor[MAT^2 * 5 / MDF] * Attack Multiplier
 * then floors for (AttackMultiplier · Target Fear · Attacker Fear), Power, Field, Element, Guard.
 * Destroyer Mace does not apply.
 */
export function enemyMagicalAttack(
  attackerMat: number,
  targetMdf: number,
  attackMultiplier: number,
  mods: Partial<Modifiers> = {},
): number {
  const m = modifiers(mods);
  const base = f((attackerMat * attackerMat * 5) / Math.max(1, targetMdf));
  let d = f(base * attackMultiplier * m.targetFear * m.attackerFear);
  d = f(d * m.power);
  d = f(d * m.field);
  d = f(d * m.element);
  d = f(d * m.guard);
  return d;
}

// ---------------------------------------------------------------------------
// Percentage / fixed attacks (Target Fear and Guard apply where noted)
// ---------------------------------------------------------------------------

/** Ghost Commander's Haunting Bolt: floor(target current HP / 2). */
export function hauntingBolt(
  targetCurrentHp: number,
  mods: Partial<Modifiers> = {},
): number {
  const m = modifiers(mods);
  let d = f(targetCurrentHp / 2);
  d = f(d * m.targetFear);
  d = f(d * m.guard);
  return d;
}

/** Rare Monster basic attack: floor(target Max HP / 10). */
export function rareMonsterBasic(
  targetMaxHp: number,
  mods: Partial<Modifiers> = {},
): number {
  const m = modifiers(mods);
  let d = f(targetMaxHp / 10);
  d = f(d * m.targetFear);
  d = f(d * m.guard);
  return d;
}

/** Addition Counter: floor{ floor[AT^2 * 250 / DF] / 100 }, then Fear pair & Power. */
export function additionCounter(
  attackerAt: number,
  targetDf: number,
  mods: Partial<Modifiers> = {},
): number {
  const m = modifiers(mods);
  const base = f(f((attackerAt * attackerAt * 250) / Math.max(1, targetDf)) / 100);
  let d = f(base * m.targetFear * m.attackerFear);
  d = f(d * m.power);
  return d;
}

/** Drake's Wire: floor(1000 / DF), then Target Fear & Power. */
export function drakeWire(
  targetDf: number,
  mods: Partial<Modifiers> = {},
): number {
  const m = modifiers(mods);
  let d = f(1000 / Math.max(1, targetDf));
  d = f(d * m.targetFear);
  d = f(d * m.power);
  return d;
}

/**
 * Magical attack-item damage. Unlike spells, attack items deal a FIXED power independent of the
 * user's stats (anyone can use them). The user's element is irrelevant; only the ITEM's element vs
 * the target's matters, and — per the items doc — the elemental swing is stronger than for spells:
 * ×2 versus the opposing element, ×0.5 versus the same element, ×1 otherwise (Non-Elemental never
 * scales). Clamped to ≥1.
 */
export function itemAttackDamage(power: number, itemElement: Element, targetElement: Element): number {
  let mult = 1;
  if (itemElement !== "Non-Elemental" && targetElement !== "Non-Elemental") {
    if (itemElement === targetElement) mult = 0.5;
    else if (oppositeOf(itemElement) === targetElement) mult = 2;
  }
  return Math.max(1, f(power * mult));
}

// ---------------------------------------------------------------------------
// Status damage (no modifiers except where noted)
// ---------------------------------------------------------------------------

/** Confusion / Bewitchment self-hit: floor(attacker Max HP / 5); Target Fear & Guard apply. */
export function confusionDamage(
  attackerMaxHp: number,
  mods: Partial<Modifiers> = {},
): number {
  const m = modifiers(mods);
  let d = f(attackerMaxHp / 5);
  d = f(d * m.targetFear);
  d = f(d * m.guard);
  return d;
}

/** Poison tick: floor(target Max HP / 10). No modifiers apply. */
export function poisonDamage(targetMaxHp: number): number {
  return f(targetMaxHp / 10);
}
