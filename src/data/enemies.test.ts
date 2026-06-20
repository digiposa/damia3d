import { describe, it, expect } from "vitest";

import { COMMANDER_SELES, COMMANDER_MARSHLAND, KNIGHT_OF_SANDORA_SELES } from "./enemies";

describe("Commander — Seles boss", () => {
  it("matches the wiki stats", () => {
    expect(COMMANDER_SELES.stats).toEqual({ maxHp: 14, at: 2, df: 40, mat: 4, mdf: 40 });
    expect(COMMANDER_SELES.element).toBe("Darkness");
    expect(COMMANDER_SELES.expReward).toBe(20);
    expect(COMMANDER_SELES.goldReward).toBe(20);
  });

  it("is a boss running the commander behaviour", () => {
    expect(COMMANDER_SELES.isBoss).toBe(true);
    expect(COMMANDER_SELES.behavior).toBe("commander");
    expect(COMMANDER_SELES.countersAdditions).toBe(false);
  });

  it("knows Sword Slash, Burn Out (magical) and Slash Twice", () => {
    const names = COMMANDER_SELES.attacks.map((a) => a.name);
    expect(names).toEqual(["Sword Slash", "Burn Out", "Slash Twice"]);
    const burnOut = COMMANDER_SELES.attacks.find((a) => a.name === "Burn Out");
    expect(burnOut?.kind).toBe("magical");
  });
});

describe("Commander — Marshland minor enemy", () => {
  it("is the tougher, counter-capable field version", () => {
    expect(COMMANDER_MARSHLAND.stats.maxHp).toBe(128);
    expect(COMMANDER_MARSHLAND.countersAdditions).toBe(true);
  });
});

describe("Knight of Sandora (Seles)", () => {
  it("does not counter Additions", () => {
    expect(KNIGHT_OF_SANDORA_SELES.countersAdditions).toBe(false);
  });
});
