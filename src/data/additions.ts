/**
 * Addition data from *The Legend of Dragoon*. `hits` holds each hit's percentage
 * contribution (Hit 1, then the documented "+x" increments); summing the first
 * N gives the landed total. `multiplier` is indexed by Addition level (1–5).
 *
 * Currently Dart's set; other party members can be added with the same shape.
 */
export interface AdditionDef {
  name: string;
  /** Per-hit percentages; summing all of them equals the "Perfect" column. */
  hits: number[];
  /** Damage multiplier per Addition level (index 0 = Lv 1 … index 4 = Lv 5). */
  multiplier: [number, number, number, number, number];
}

export const DART_ADDITIONS = {
  doubleSlash: {
    name: "Double Slash",
    hits: [100, 50],
    multiplier: [100, 105, 110, 120, 135],
  },
  volcano: {
    name: "Volcano",
    hits: [50, 50, 50, 50],
    multiplier: [100, 105, 110, 115, 125],
  },
  burningRush: {
    name: "Burning Rush",
    hits: [50, 50, 50],
    multiplier: [100, 100, 100, 100, 100],
  },
  crushDance: {
    name: "Crush Dance",
    hits: [30, 30, 30, 30, 30],
    multiplier: [100, 115, 130, 145, 167],
  },
  madnessHero: {
    name: "Madness Hero",
    hits: [20, 20, 20, 20, 10, 10],
    multiplier: [100, 100, 100, 100, 100],
  },
  moonStrike: {
    name: "Moon Strike",
    hits: [30, 30, 30, 30, 30, 30, 20],
    multiplier: [100, 120, 140, 160, 175],
  },
  blazingDynamo: {
    name: "Blazing Dynamo",
    hits: [40, 30, 30, 30, 30, 30, 30, 30],
    multiplier: [100, 120, 140, 160, 180],
  },
} satisfies Record<string, AdditionDef>;

/** Sum of the first `hitsLanded` hits (defaults to all = a perfect Addition). */
export function additionHitsPercent(def: AdditionDef, hitsLanded = def.hits.length): number {
  const n = Math.min(Math.max(hitsLanded, 0), def.hits.length);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += def.hits[i];
  return sum;
}

/** Multiplier for an Addition at the given level (1–5), clamped. */
export function additionMultiplier(def: AdditionDef, level: number): number {
  const i = Math.min(Math.max(Math.floor(level), 1), 5) - 1;
  return def.multiplier[i];
}
