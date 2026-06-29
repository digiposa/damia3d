import { describe, it, expect } from "vitest";

import { elementMultiplier, fieldMultiplier, oppositeOf } from "./element";

describe("elementMultiplier", () => {
  it("boosts opposites ×1.5", () => {
    expect(elementMultiplier("Fire", "Water")).toBe(1.5);
    expect(elementMultiplier("Wind", "Earth")).toBe(1.5);
    expect(elementMultiplier("Light", "Darkness")).toBe(1.5);
  });

  it("reduces same element ×0.5", () => {
    expect(elementMultiplier("Fire", "Fire")).toBe(0.5);
    expect(elementMultiplier("Thunder", "Thunder")).toBe(0.5);
  });

  it("is neutral otherwise", () => {
    expect(elementMultiplier("Fire", "Wind")).toBe(1);
    expect(elementMultiplier("Thunder", "Fire")).toBe(1); // Thunder has no opposite
  });

  it("ignores Non-Elemental entirely", () => {
    expect(elementMultiplier("Non-Elemental", "Non-Elemental")).toBe(1);
    expect(elementMultiplier("Fire", "Non-Elemental")).toBe(1);
    expect(elementMultiplier("Non-Elemental", "Water")).toBe(1);
  });

  it("knows opposites (Thunder/Non-Elemental have none)", () => {
    expect(oppositeOf("Fire")).toBe("Water");
    expect(oppositeOf("Thunder")).toBeUndefined();
    expect(oppositeOf("Non-Elemental")).toBeUndefined();
  });
});

describe("fieldMultiplier (Dragoon Space)", () => {
  it("boosts matching element ×1.5, weakens the opposite ×0.5", () => {
    expect(fieldMultiplier("Fire", "Fire")).toBe(1.5);
    expect(fieldMultiplier("Fire", "Water")).toBe(0.5);
  });

  it("is neutral for unrelated elements or no active Space", () => {
    expect(fieldMultiplier("Fire", "Wind")).toBe(1);
    expect(fieldMultiplier(undefined, "Fire")).toBe(1);
    expect(fieldMultiplier("Thunder", "Thunder")).toBe(1.5);
  });
});
