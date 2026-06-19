/**
 * Battle damage modifiers from *The Legend of Dragoon*. Each is a plain
 * multiplier applied (with truncation) as the final steps of a damage formula.
 * A value of 1 is neutral / "not active". See {@link NEUTRAL_MODIFIERS}.
 *
 * Reference values:
 * - targetFear:    2 if the target has Fear, else 1
 * - attackerFear:  1/2 if the attacker has Fear, else 1
 * - power:         1 + (attackerPower + targetPower), each ±1/2 when up/down
 * - field:         1 + attackElement (±1/2 vs the special field), else 1
 * - element:       1 + targetElement (−1/2 match, +1/2 opposite vs attack), else 1
 * - guard:         1/2 if the target guarded last action, else 1
 * - destroyerMace: 1 (blue HP), 3/2 (yellow), 2 (red) — Haschel only
 */
export interface Modifiers {
  targetFear: number;
  attackerFear: number;
  power: number;
  field: number;
  element: number;
  guard: number;
  destroyerMace: number;
}

export const NEUTRAL_MODIFIERS: Modifiers = {
  targetFear: 1,
  attackerFear: 1,
  power: 1,
  field: 1,
  element: 1,
  guard: 1,
  destroyerMace: 1,
};

/** Merge partial overrides onto the neutral (all-1) modifier set. */
export function modifiers(overrides: Partial<Modifiers> = {}): Modifiers {
  return { ...NEUTRAL_MODIFIERS, ...overrides };
}
