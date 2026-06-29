// Consumable items (a minimal starting set). Healing items restore a fraction of the user's
// Max HP; Spirit items restore SP toward Dragoon transformation. The party shares one pool in
// the Training sandbox; using one is an ATB action (see TrainingMode). More item kinds (cure,
// revive) and a proper inventory screen can extend this later.

export interface ItemDef {
  id: string;
  nameKey: string;
  /** HP restored, as a fraction of the user's Max HP (0 = not a healing item). */
  healFraction: number;
  /** Flat SP restored to the Dragoon gauge (0 = not a spirit item). */
  spRestore?: number;
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

/** The Training sandbox's starting item pool (shared by the party). */
export function startingItems(): { def: ItemDef; count: number }[] {
  return [
    { def: HEALING_POTION, count: 5 },
    { def: SPIRIT_POTION, count: 3 },
  ];
}
