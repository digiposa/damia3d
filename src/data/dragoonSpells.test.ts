import { describe, it, expect } from "vitest";

import { spellsForClass } from "./dragoonSpells";

describe("dragoon spells", () => {
  it("Dart (Red) learns Fire spells at D'Lv 1/2/3/5", () => {
    const s = spellsForClass("redEye");
    expect(s.map((x) => x.dLevel)).toEqual([1, 2, 3, 5]);
    expect(s.every((x) => x.element === "Fire")).toBe(true);
    expect(s[0]).toMatchObject({ name: "Flame Shot", mp: 10, multiplier: 200, target: "enemy" });
  });

  it("Kongol (Golden) has no D'Lv-2 spell (canon exception)", () => {
    const s = spellsForClass("golden");
    expect(s.map((x) => x.dLevel)).toEqual([1, 3, 5]);
    expect(s.some((x) => x.dLevel === 2)).toBe(false);
  });

  it("Shana (White-Silver) is a support kit: Moon Light heals/revives, no damage", () => {
    const moonLight = spellsForClass("whiteSilver").find((x) => x.id === "moonLight")!;
    expect(moonLight.multiplier).toBeUndefined();
    expect(moonLight).toMatchObject({ target: "ally", heal: 1, revive: 0.5, cure: true });
  });

  it("every other line learns four spells at D'Lv 1/2/3/5", () => {
    for (const id of ["jade", "whiteSilver", "darkness", "thunder", "blueSea"] as const) {
      expect(spellsForClass(id).map((x) => x.dLevel)).toEqual([1, 2, 3, 5]);
    }
  });

  it("the ultimate (D'Lv 5) spell always costs 80 MP", () => {
    for (const id of ["redEye", "jade", "whiteSilver", "darkness", "thunder", "blueSea", "golden"] as const) {
      const ult = spellsForClass(id).find((x) => x.dLevel === 5)!;
      expect(ult.mp).toBe(80);
    }
  });
});
