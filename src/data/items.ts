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
   * Offensive ("magic") item: elemental magic damage to one enemy (`"enemy"`) or all
   * (`"allEnemies"`). Per the LoD formula doc, item magic uses the USER's MAT + level and the
   * target's MDF, scaled by the item's `bid` (Base Item Damage): floor{floor[(LV+5)·MAT·5/MDF]·
   * BID/100}, then the standard element modifier (×1.5 vs opposite, ×0.5 vs same). See
   * combat/formula.magicAttack, which is exactly this formula with dragoonMatPct=100, multiplier=bid.
   */
  attack?: { element: Element; bid: number; target: "enemy" | "allEnemies" };
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
// Canon layout: 8 elements × 3 tiers — Single-target, All-target, All-target "Powerful" — plus the
// Non-Elemental set. `bid` (Base Item Damage) values are from the formula doc's BID chart.
const BID_SINGLE = 150; // Single Target Multi
const BID_ALL = 100; // All Target Multi
const BID_POWERFUL = 300; // All Target Powerful

function attackItem(id: string, element: Element, bid: number, target: "enemy" | "allEnemies"): ItemDef {
  return { id, nameKey: `item.${id}`, healFraction: 0, attack: { element, bid, target } };
}

/** Every attack item, grouped by element (single / all / powerful), then the Non-Elemental set. */
export const ATTACK_ITEMS: ItemDef[] = [
  attackItem("burnOut", "Fire", BID_SINGLE, "enemy"),
  attackItem("gushingMagma", "Fire", BID_ALL, "allEnemies"),
  attackItem("burningWave", "Fire", BID_POWERFUL, "allEnemies"),
  attackItem("pellet", "Earth", BID_SINGLE, "enemy"),
  attackItem("meteorFall", "Earth", BID_ALL, "allEnemies"),
  attackItem("gravityGrabber", "Earth", BID_POWERFUL, "allEnemies"),
  attackItem("sparkNet", "Thunder", BID_SINGLE, "enemy"),
  attackItem("thunderbolt", "Thunder", BID_ALL, "allEnemies"),
  attackItem("flashHall", "Thunder", BID_POWERFUL, "allEnemies"),
  attackItem("spinningGale", "Wind", BID_SINGLE, "enemy"),
  attackItem("raveTwister", "Wind", BID_ALL, "allEnemies"),
  attackItem("downBurst", "Wind", BID_POWERFUL, "allEnemies"),
  attackItem("spearFrost", "Water", BID_SINGLE, "enemy"),
  attackItem("fatalBlizzard", "Water", BID_ALL, "allEnemies"),
  attackItem("frozenJet", "Water", BID_POWERFUL, "allEnemies"),
  attackItem("darkMist", "Darkness", BID_SINGLE, "enemy"),
  attackItem("blackRain", "Darkness", BID_ALL, "allEnemies"),
  attackItem("nightRaid", "Darkness", BID_POWERFUL, "allEnemies"),
  attackItem("transLight", "Light", BID_SINGLE, "enemy"),
  attackItem("dancingRay", "Light", BID_ALL, "allEnemies"),
  attackItem("spectralFlash", "Light", BID_POWERFUL, "allEnemies"),
  // Non-Elemental — BID chart: Detonate Rock 100, Psyche Bomb X 400. Psyche Bomb (non-X) isn't in
  // the chart; slotted at the Powerful tier (300) pending its exact BID.
  attackItem("detonateRock", "Non-Elemental", 100, "enemy"),
  attackItem("psychedelicBomb", "Non-Elemental", BID_POWERFUL, "allEnemies"),
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
