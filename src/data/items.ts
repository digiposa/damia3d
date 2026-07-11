// Consumable items. Healing items restore a fraction of the user's Max HP; Spirit items restore
// SP toward Dragoon transformation; Attack items deal fixed elemental magic damage usable by ANY
// member (no Dragoon form needed) — see {@link ItemDef.attack} and combat/formula.itemAttackDamage.
// The party shares one pool in the Training sandbox; using one is an ATB action (see TrainingMode).

import type { Element } from "../combat/element";

export interface ItemDef {
  id: string;
  nameKey: string;
  /** HP restored, as a fraction of the user's Max HP (0 = not a healing item). */
  healFraction: number;
  /** Flat SP restored to the Dragoon gauge (0 = not a spirit item). */
  spRestore?: number;
  /**
   * Offensive item: fixed magic damage of `element` dealt to one enemy (`"enemy"`) or all
   * (`"allEnemies"`). `power` is a flat value INDEPENDENT of the user's stats (canon: anyone can
   * throw a Burn Out for the same effect); the element scales ×2 vs the opposing element / ×0.5 vs
   * the same. Placeholder powers below — tune from the 2D project's formula doc.
   */
  attack?: { element: Element; power: number; target: "enemy" | "allEnemies" };
}

export const HEALING_POTION: ItemDef = {
  id: "healingPotion",
  nameKey: "item.healingPotion",
  healFraction: 0.5,
};

export const SPIRIT_POTION: ItemDef = {
  id: "spiritPotion",
  nameKey: "item.spiritPotion",
  healFraction: 0,
  spRestore: 100,
};

// --- Attack items (Legend of Dragoon magic items) --------------------------
// Canon layout: 8 elements × 3 tiers — Single-target, All-target, All-target "Powerful" — plus
// Non-Elemental variants. Powers are PLACEHOLDERS keyed by tier (single hits one, so it hits
// harder per target than the all-target tiers); replace with the exact values from the formula doc.
const TIER_SINGLE = 45; // single-target
const TIER_ALL = 35; // all-target
const TIER_POWERFUL = 80; // all-target, powerful (chest/drop tier)

function attackItem(id: string, element: Element, power: number, target: "enemy" | "allEnemies"): ItemDef {
  return { id, nameKey: `item.${id}`, healFraction: 0, attack: { element, power, target } };
}

/** Every attack item, grouped by element (single / all / powerful), then the Non-Elemental set. */
export const ATTACK_ITEMS: ItemDef[] = [
  attackItem("burnOut", "Fire", TIER_SINGLE, "enemy"),
  attackItem("gushingMagma", "Fire", TIER_ALL, "allEnemies"),
  attackItem("burningWave", "Fire", TIER_POWERFUL, "allEnemies"),
  attackItem("pellet", "Earth", TIER_SINGLE, "enemy"),
  attackItem("meteorFall", "Earth", TIER_ALL, "allEnemies"),
  attackItem("gravityGrabber", "Earth", TIER_POWERFUL, "allEnemies"),
  attackItem("sparkNet", "Thunder", TIER_SINGLE, "enemy"),
  attackItem("thunderbolt", "Thunder", TIER_ALL, "allEnemies"),
  attackItem("flashHall", "Thunder", TIER_POWERFUL, "allEnemies"),
  attackItem("spinningGale", "Wind", TIER_SINGLE, "enemy"),
  attackItem("raveTwister", "Wind", TIER_ALL, "allEnemies"),
  attackItem("downBurst", "Wind", TIER_POWERFUL, "allEnemies"),
  attackItem("spearFrost", "Water", TIER_SINGLE, "enemy"),
  attackItem("fatalBlizzard", "Water", TIER_ALL, "allEnemies"),
  attackItem("frozenJet", "Water", TIER_POWERFUL, "allEnemies"),
  attackItem("darkMist", "Darkness", TIER_SINGLE, "enemy"),
  attackItem("blackRain", "Darkness", TIER_ALL, "allEnemies"),
  attackItem("nightRaid", "Darkness", TIER_POWERFUL, "allEnemies"),
  attackItem("transLight", "Light", TIER_SINGLE, "enemy"),
  attackItem("dancingRay", "Light", TIER_ALL, "allEnemies"),
  attackItem("spectralFlash", "Light", TIER_POWERFUL, "allEnemies"),
  // Non-Elemental (fixed damage from the doc where known): Detonate Rock 100, Psyche Bomb X 400.
  attackItem("detonateRock", "Non-Elemental", 100, "enemy"),
  attackItem("psychedelicBomb", "Non-Elemental", 200, "allEnemies"),
  attackItem("psychedelicBombX", "Non-Elemental", 400, "allEnemies"),
];

/** Attack items keyed by id (for spawn menus / inventory lookup). */
export const ATTACK_ITEM_BY_ID = new Map(ATTACK_ITEMS.map((i) => [i.id, i]));

/** The Training sandbox's starting item pool (shared by the party). A sampler of attack items is
 *  included so the offensive-item flow is testable out of the box. */
export function startingItems(): { def: ItemDef; count: number }[] {
  return [
    { def: HEALING_POTION, count: 5 },
    { def: SPIRIT_POTION, count: 3 },
    { def: ATTACK_ITEM_BY_ID.get("burnOut")!, count: 5 },
    { def: ATTACK_ITEM_BY_ID.get("spinningGale")!, count: 3 },
    { def: ATTACK_ITEM_BY_ID.get("frozenJet")!, count: 2 },
  ];
}
