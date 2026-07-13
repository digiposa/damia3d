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
  attack?: {
    element: Element;
    bid: number;
    target: "enemy" | "allEnemies";
    /** "Multi" items carry the mashing QTE (spam to raise a Multiplier%); "Powerful" items,
     *  Detonate Rock and Psyche Bomb X do NOT — different formula (see combat/formula). */
    multi: boolean;
  };
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

/** Mashing QTE bounds for "Multi" items: no mash = 100%, full mash caps at 268% (wiki Items page). */
export const ITEM_MULTIPLIER_MIN = 100;
export const ITEM_MULTIPLIER_MAX = 268;

function attackItem(
  id: string,
  element: Element,
  bid: number,
  target: "enemy" | "allEnemies",
  multi: boolean,
): ItemDef {
  return { id, nameKey: `item.${id}`, healFraction: 0, attack: { element, bid, target, multi } };
}
/** Single-target Multi item (BID 150, has the mashing QTE). */
const single = (id: string, el: Element) => attackItem(id, el, BID_SINGLE, "enemy", true);
/** All-target Multi item (BID 100, has the mashing QTE). */
const all = (id: string, el: Element) => attackItem(id, el, BID_ALL, "allEnemies", true);
/** All-target Powerful item (BID 300, NO QTE). */
const powerful = (id: string, el: Element) => attackItem(id, el, BID_POWERFUL, "allEnemies", false);

/** Every attack item, grouped by element (single / all / powerful), then the Non-Elemental set. */
export const ATTACK_ITEMS: ItemDef[] = [
  single("burnOut", "Fire"), all("gushingMagma", "Fire"), powerful("burningWave", "Fire"),
  single("pellet", "Earth"), all("meteorFall", "Earth"), powerful("gravityGrabber", "Earth"),
  single("sparkNet", "Thunder"), all("thunderbolt", "Thunder"), powerful("flashHall", "Thunder"),
  single("spinningGale", "Wind"), all("raveTwister", "Wind"), powerful("downBurst", "Wind"),
  single("spearFrost", "Water"), all("fatalBlizzard", "Water"), powerful("frozenJet", "Water"),
  single("darkMist", "Darkness"), all("blackRain", "Darkness"), powerful("nightRaid", "Darkness"),
  single("transLight", "Light"), all("dancingRay", "Light"), powerful("spectralFlash", "Light"),
  // Non-Elemental (per the wiki Items page): Detonate Rock hits ALL, no mashing (BID 100). Both
  // Psyche Bombs hit ALL, DO have the mashing QTE, and share the highest BID (400) — so at max mash
  // they out-damage every other item.
  attackItem("detonateRock", "Non-Elemental", 100, "allEnemies", false),
  attackItem("psychedelicBomb", "Non-Elemental", 400, "allEnemies", true),
  attackItem("psychedelicBombX", "Non-Elemental", 400, "allEnemies", true),
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
