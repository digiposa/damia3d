import { describe, it, expect } from "vitest";

import {
  DART_ADDITIONS,
  DART_ADDITION_LIST,
  additionPresses,
  additionHitsPercent,
  additionMultiplier,
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
