// Consumable items (a minimal starting set). Healing items restore a fraction of the
// user's Max HP. The party shares one pool of items in the Training sandbox; using one is
// an ATB action (see TrainingMode). More item kinds (MP/SP restore, cure, revive) and a
// proper inventory screen can extend this later.

export interface ItemDef {
  id: string;
  nameKey: string;
  /** HP restored, as a fraction of the user's Max HP. */
  healFraction: number;
}

export const HEALING_POTION: ItemDef = {
  id: "healingPotion",
  nameKey: "item.healingPotion",
  healFraction: 0.5,
};

/** The Training sandbox's starting item pool (shared by the party). */
export function startingItems(): { def: ItemDef; count: number }[] {
  return [{ def: HEALING_POTION, count: 5 }];
}
