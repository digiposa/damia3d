/**
 * Elemental damage rules (Wiki Project canon).
 *
 * Eight elements; each combatant and magical attack has one fixed element, and
 * elemental weapons give physical attacks an element. Fire↔Water, Wind↔Earth,
 * Light↔Darkness are opposites; Thunder and Non-Elemental have none.
 */
export type Element =
  | "Fire"
  | "Water"
  | "Wind"
  | "Earth"
  | "Light"
  | "Darkness"
  | "Thunder"
  | "Non-Elemental";

const OPPOSITE: Partial<Record<Element, Element>> = {
  Fire: "Water",
  Water: "Fire",
  Wind: "Earth",
  Earth: "Wind",
  Light: "Darkness",
  Darkness: "Light",
};

export function oppositeOf(element: Element): Element | undefined {
  return OPPOSITE[element];
}

/**
 * "Element" damage modifier — attack element vs target element:
 * - opposite → ×1.5
 * - same (Non-Elemental excluded) → ×0.5
 * - otherwise → ×1
 */
export function elementMultiplier(attack: Element, target: Element): number {
  if (attack === "Non-Elemental" || target === "Non-Elemental") return 1;
  if (attack === target) return 0.5;
  return OPPOSITE[attack] === target ? 1.5 : 1;
}
