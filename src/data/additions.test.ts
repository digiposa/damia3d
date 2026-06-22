import { describe, it, expect } from "vitest";

import {
  DART_ADDITIONS,
  DART_ADDITION_LIST,
  ADDITION_LISTS,
  additionPresses,
  additionHitsPercent,
  additionMultiplier,
  type AdditionDef,
} from "./additions";

describe("Volcano", () => {
  it("has 3 timed presses (4 hits)", () => {
    expect(additionPresses(DART_ADDITIONS.volcano)).toBe(3);
  });

  it("sums to a perfect 200%", () => {
    expect(additionHitsPercent(DART_ADDITIONS.volcano)).toBe(200);
  });

  it("max-level multiplier is 125", () => {
    expect(additionMultiplier(DART_ADDITIONS.volcano, 5)).toBe(125);
  });

  it("is learned at Dart level 2", () => {
    expect(DART_ADDITIONS.volcano.acquireLevel).toBe(2);
  });
});

describe("Dart Addition list", () => {
  it("is ordered by acquisition level", () => {
    const levels = DART_ADDITION_LIST.map((a) => a.acquireLevel);
    expect(levels).toEqual([...levels].sort((a, b) => a - b));
  });
});

/**
 * Canonical cross-check against the Wiki Project "Party Member Additions" tables:
 * for each Addition, the menu "Dmg% (Maxed)" = floor(perfect hits × Lv5 multiplier
 * / 100), plus its documented press count and SP. Guards every character's data.
 */
describe("canonical Addition tables (all characters)", () => {
  // [name, presses, Dmg% maxed, SP maxed]
  const EXPECTED: Record<string, [string, number, number, number][]> = {
    dart: [
      ["Double Slash", 1, 202, 35],
      ["Volcano", 3, 250, 36],
      ["Burning Rush", 2, 150, 102],
      ["Crush Dance", 4, 250, 100],
      ["Madness Hero", 5, 100, 204],
      ["Moon Strike", 6, 350, 20],
      ["Blazing Dynamo", 7, 450, 150],
    ],
    lavitz: [
      ["Harpoon", 1, 150, 50],
      ["Spinning Cane", 2, 200, 35],
      ["Rod Typhoon", 4, 202, 100],
      ["Gust of Wind Dance", 6, 350, 35],
      ["Flower Storm", 7, 405, 202],
    ],
    rose: [
      ["Whip Smack", 1, 200, 35],
      ["More & More", 2, 150, 102],
      ["Hard Blade", 5, 300, 35],
      ["Demon's Dance", 7, 500, 100],
    ],
    haschel: [
      ["Double Punch", 1, 150, 50],
      ["Flurry of Styx", 2, 202, 20],
      ["Summon 4 Gods", 3, 100, 100],
      ["5 Ring Shattering", 4, 300, 50],
      ["Hex Hammer", 6, 400, 15],
      ["Omni-Sweep", 7, 501, 150],
    ],
    meru: [
      ["Double Smack", 1, 150, 34],
      ["Hammer Spin", 3, 202, 70],
      ["Cool Boogie", 4, 100, 200],
      ["Cat's Cradle", 6, 351, 20],
      ["Perky Step", 7, 600, 100],
    ],
    kongol: [
      ["Pursuit", 1, 150, 50],
      ["Inferno", 3, 200, 20],
      ["Bone Crush", 5, 300, 100],
    ],
  };

  const dmgMaxed = (def: AdditionDef): number =>
    Math.floor((additionHitsPercent(def) * additionMultiplier(def, 5)) / 100);

  for (const [char, rows] of Object.entries(EXPECTED)) {
    describe(char, () => {
      const list = ADDITION_LISTS[char as keyof typeof ADDITION_LISTS];

      it("has exactly the documented Additions, in order", () => {
        expect(list.map((a) => a.name)).toEqual(rows.map(([name]) => name));
      });

      for (const [name, presses, dmg, sp] of rows) {
        it(`${name}: ${presses} press · ${dmg}% maxed · ${sp} SP`, () => {
          const def = list.find((a) => a.name === name)!;
          expect(additionPresses(def)).toBe(presses);
          expect(dmgMaxed(def)).toBe(dmg);
          expect(def.spMax).toBe(sp);
        });
      }

      it("is ordered by acquisition level", () => {
        const levels = list.map((a) => a.acquireLevel);
        expect(levels).toEqual([...levels].sort((a, b) => a - b));
      });
    });
  }
});
