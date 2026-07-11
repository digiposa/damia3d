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
  /** SP awarded at max level for a perfect performance (Dragoon gauge). */
  spMax: number;
  /** Character level at which the Addition is learned. The final Addition of each
   *  character instead requires performing all prior ones 80 times; we gate it
   *  high (99) until that progression rule is implemented. */
  acquireLevel: number;
}

/**
 * Fallback "attack" for party members with no Additions (Shana / Miranda — the
 * White-Silver line). A single guaranteed hit with no timed presses: the runner
 * completes it instantly, and the Addition formula at hit 1 / multiplier 100
 * reduces to LoD's archer attack. Never shown in the Additions menu.
 */
export const BASIC_ATTACK: AdditionDef = {
  name: "Attack",
  hits: [100],
  multiplier: [100, 100, 100, 100, 100],
  spMax: 0,
  acquireLevel: 1,
};

export const DART_ADDITIONS = {
  doubleSlash: {
    name: "Double Slash",
    hits: [100, 50],
    multiplier: [100, 105, 110, 120, 135],
    spMax: 35,
    acquireLevel: 1,
  },
  volcano: {
    name: "Volcano",
    hits: [50, 50, 50, 50],
    multiplier: [100, 105, 110, 115, 125],
    spMax: 36,
    acquireLevel: 2,
  },
  burningRush: {
    name: "Burning Rush",
    hits: [50, 50, 50],
    multiplier: [100, 100, 100, 100, 100],
    spMax: 102,
    acquireLevel: 8,
  },
  crushDance: {
    name: "Crush Dance",
    hits: [30, 30, 30, 30, 30],
    multiplier: [100, 115, 130, 145, 167],
    spMax: 100,
    acquireLevel: 15,
  },
  madnessHero: {
    name: "Madness Hero",
    hits: [20, 20, 20, 20, 10, 10],
    multiplier: [100, 100, 100, 100, 100],
    spMax: 204,
    acquireLevel: 22,
  },
  moonStrike: {
    name: "Moon Strike",
    hits: [30, 30, 30, 30, 30, 30, 20],
    multiplier: [100, 120, 140, 160, 175],
    spMax: 20,
    acquireLevel: 29,
  },
  blazingDynamo: {
    name: "Blazing Dynamo",
    hits: [40, 30, 30, 30, 30, 30, 30, 30],
    multiplier: [100, 120, 140, 160, 180],
    spMax: 150,
    // Real condition: perform all prior Additions 80 times (TODO); for now a high
    // level gate so the ultimate is reachable (e.g. in Training) instead of locked off.
    acquireLevel: 40,
  },
} satisfies Record<string, AdditionDef>;

/** Lavitz / Albert Additions (Jade line). */
export const LAVITZ_ADDITIONS = {
  harpoon: {
    name: "Harpoon",
    hits: [75, 25],
    multiplier: [100, 110, 120, 130, 150],
    spMax: 50,
    acquireLevel: 1,
  },
  spinningCane: {
    name: "Spinning Cane",
    hits: [50, 25, 25],
    multiplier: [100, 125, 150, 175, 200],
    spMax: 35,
    acquireLevel: 5,
  },
  rodTyphoon: {
    name: "Rod Typhoon",
    hits: [30, 30, 30, 30, 30],
    multiplier: [100, 108, 116, 124, 135],
    spMax: 100,
    acquireLevel: 7,
  },
  gustOfWindDance: {
    name: "Gust of Wind Dance",
    hits: [30, 30, 30, 30, 30, 30, 20],
    multiplier: [100, 120, 140, 160, 175],
    spMax: 35,
    acquireLevel: 11,
  },
  flowerStorm: {
    name: "Flower Storm",
    hits: [30, 30, 30, 40, 40, 40, 40, 50],
    multiplier: [100, 108, 116, 124, 135],
    spMax: 202,
    // Real condition: perform all prior Additions 80 times (TODO); for now a high
    // level gate so the ultimate is reachable (e.g. in Training) instead of locked off.
    acquireLevel: 40,
  },
} satisfies Record<string, AdditionDef>;

/** Rose Additions (Darkness line). */
export const ROSE_ADDITIONS = {
  whipSmack: {
    name: "Whip Smack",
    hits: [75, 25],
    multiplier: [100, 125, 150, 175, 200],
    spMax: 35,
    acquireLevel: 1,
  },
  moreAndMore: {
    name: "More & More",
    hits: [50, 50, 50],
    multiplier: [100, 100, 100, 100, 100],
    spMax: 102,
    acquireLevel: 14,
  },
  hardBlade: {
    name: "Hard Blade",
    hits: [20, 20, 20, 20, 10, 10],
    multiplier: [100, 150, 200, 250, 300],
    spMax: 35,
    acquireLevel: 19,
  },
  demonsDance: {
    name: "Demon's Dance",
    hits: [30, 30, 30, 30, 20, 20, 20, 20],
    multiplier: [100, 140, 180, 220, 250],
    spMax: 100,
    // Real condition: perform all prior Additions 80 times (TODO); for now a high
    // level gate so the ultimate is reachable (e.g. in Training) instead of locked off.
    acquireLevel: 40,
  },
} satisfies Record<string, AdditionDef>;

/** Haschel Additions (Violet line). */
export const HASCHEL_ADDITIONS = {
  doublePunch: {
    name: "Double Punch",
    hits: [75, 25],
    multiplier: [100, 110, 120, 130, 150],
    spMax: 50,
    acquireLevel: 1,
  },
  flurryOfStyx: {
    name: "Flurry of Styx",
    hits: [100, 25, 25],
    multiplier: [100, 108, 116, 124, 135],
    spMax: 20,
    acquireLevel: 14,
  },
  summon4Gods: {
    name: "Summon 4 Gods",
    hits: [25, 25, 25, 25],
    multiplier: [100, 100, 100, 100, 100],
    spMax: 100,
    acquireLevel: 18,
  },
  fiveRingShattering: {
    name: "5 Ring Shattering",
    hits: [30, 30, 30, 30, 30],
    multiplier: [100, 125, 150, 175, 200],
    spMax: 50,
    acquireLevel: 22,
  },
  hexHammer: {
    name: "Hex Hammer",
    hits: [30, 30, 30, 30, 30, 30, 20],
    multiplier: [100, 125, 150, 175, 200],
    spMax: 15,
    acquireLevel: 27,
  },
  omniSweep: {
    name: "Omni-Sweep",
    hits: [30, 30, 30, 40, 40, 40, 40, 50],
    multiplier: [100, 115, 130, 145, 167],
    spMax: 150,
    // Real condition: perform all prior Additions 80 times (TODO); for now a high
    // level gate so the ultimate is reachable (e.g. in Training) instead of locked off.
    acquireLevel: 40,
  },
} satisfies Record<string, AdditionDef>;

/** Meru Additions (Blue-Sea line). */
export const MERU_ADDITIONS = {
  doubleSmack: {
    name: "Double Smack",
    hits: [75, 25],
    multiplier: [100, 110, 120, 130, 150],
    spMax: 34,
    acquireLevel: 1,
  },
  hammerSpin: {
    name: "Hammer Spin",
    hits: [50, 50, 25, 25],
    multiplier: [100, 108, 116, 124, 135],
    spMax: 70,
    acquireLevel: 21,
  },
  coolBoogie: {
    name: "Cool Boogie",
    hits: [20, 20, 20, 20, 20],
    multiplier: [100, 100, 100, 100, 100],
    spMax: 200,
    acquireLevel: 26,
  },
  catsCradle: {
    name: "Cat's Cradle",
    hits: [30, 20, 20, 20, 20, 20, 20],
    multiplier: [100, 130, 160, 190, 234],
    spMax: 20,
    acquireLevel: 30,
  },
  perkyStep: {
    name: "Perky Step",
    hits: [30, 30, 30, 30, 20, 20, 20, 20],
    multiplier: [100, 150, 200, 250, 300],
    spMax: 100,
    // Real condition: perform all prior Additions 80 times (TODO); for now a high
    // level gate so the ultimate is reachable (e.g. in Training) instead of locked off.
    acquireLevel: 40,
  },
} satisfies Record<string, AdditionDef>;

/** Kongol Additions (Golden line). */
export const KONGOL_ADDITIONS = {
  pursuit: {
    name: "Pursuit",
    hits: [75, 25],
    multiplier: [100, 110, 120, 130, 150],
    spMax: 50,
    acquireLevel: 1,
  },
  inferno: {
    name: "Inferno",
    hits: [40, 20, 20, 20],
    multiplier: [100, 125, 150, 175, 200],
    spMax: 20,
    acquireLevel: 23,
  },
  boneCrush: {
    name: "Bone Crush",
    hits: [50, 30, 30, 30, 30, 30],
    multiplier: [100, 110, 120, 130, 150],
    spMax: 100,
    // Real condition: perform all prior Additions 80 times (TODO); for now a high
    // level gate so the ultimate is reachable (e.g. in Training) instead of locked off.
    acquireLevel: 40,
  },
} satisfies Record<string, AdditionDef>;

/** Dart's Additions in acquisition order. */
export const DART_ADDITION_LIST: AdditionDef[] = [
  DART_ADDITIONS.doubleSlash,
  DART_ADDITIONS.volcano,
  DART_ADDITIONS.burningRush,
  DART_ADDITIONS.crushDance,
  DART_ADDITIONS.madnessHero,
  DART_ADDITIONS.moonStrike,
  DART_ADDITIONS.blazingDynamo,
];

/** Lavitz / Albert Additions in acquisition order. */
export const LAVITZ_ADDITION_LIST: AdditionDef[] = [
  LAVITZ_ADDITIONS.harpoon,
  LAVITZ_ADDITIONS.spinningCane,
  LAVITZ_ADDITIONS.rodTyphoon,
  LAVITZ_ADDITIONS.gustOfWindDance,
  LAVITZ_ADDITIONS.flowerStorm,
];

/** Rose Additions in acquisition order. */
export const ROSE_ADDITION_LIST: AdditionDef[] = [
  ROSE_ADDITIONS.whipSmack,
  ROSE_ADDITIONS.moreAndMore,
  ROSE_ADDITIONS.hardBlade,
  ROSE_ADDITIONS.demonsDance,
];

/** Haschel Additions in acquisition order. */
export const HASCHEL_ADDITION_LIST: AdditionDef[] = [
  HASCHEL_ADDITIONS.doublePunch,
  HASCHEL_ADDITIONS.flurryOfStyx,
  HASCHEL_ADDITIONS.summon4Gods,
  HASCHEL_ADDITIONS.fiveRingShattering,
  HASCHEL_ADDITIONS.hexHammer,
  HASCHEL_ADDITIONS.omniSweep,
];

/** Meru Additions in acquisition order. */
export const MERU_ADDITION_LIST: AdditionDef[] = [
  MERU_ADDITIONS.doubleSmack,
  MERU_ADDITIONS.hammerSpin,
  MERU_ADDITIONS.coolBoogie,
  MERU_ADDITIONS.catsCradle,
  MERU_ADDITIONS.perkyStep,
];

/** Kongol Additions in acquisition order. */
export const KONGOL_ADDITION_LIST: AdditionDef[] = [
  KONGOL_ADDITIONS.pursuit,
  KONGOL_ADDITIONS.inferno,
  KONGOL_ADDITIONS.boneCrush,
];

/** Every character's Addition list, keyed for lookup/iteration. */
export const ADDITION_LISTS = {
  dart: DART_ADDITION_LIST,
  lavitz: LAVITZ_ADDITION_LIST,
  rose: ROSE_ADDITION_LIST,
  haschel: HASCHEL_ADDITION_LIST,
  meru: MERU_ADDITION_LIST,
  kongol: KONGOL_ADDITION_LIST,
} as const;

/**
 * Number of timed button presses an Addition needs. Hit 1 is free (the Attack
 * command), so presses = hits − 1. Double Slash has 1 press.
 */
export function additionPresses(def: AdditionDef): number {
  return Math.max(0, def.hits.length - 1);
}

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
