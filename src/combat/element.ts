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

/**
 * Dragoon-Space "Field" modifier — an attack's element vs the active Dragoon Space element:
 * - matches the Space → ×1.5 (the Space empowers its own element)
 * - opposes the Space → ×0.5
 * - otherwise (or no Space) → ×1
 */
export function fieldMultiplier(space: Element | undefined, attack: Element): number {
  if (!space || space === "Non-Elemental" || attack === "Non-Elemental") return 1;
  if (attack === space) return 1.5;
  return OPPOSITE[space] === attack ? 0.5 : 1;
}
