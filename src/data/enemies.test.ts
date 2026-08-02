import { describe, it, expect } from "vitest";

import { COMMANDER_SELES, COMMANDER_MARSHLAND, KNIGHT_OF_SANDORA_SELES, BERSERK_MOUSE } from "./enemies";

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

describe("Berserk Mouse — Forest minor enemy", () => {
  it("uses the Japanese PS1 stats", () => {
    expect(BERSERK_MOUSE.stats).toEqual({ maxHp: 4, at: 2, df: 80, mat: 2, mdf: 120 });
    expect(BERSERK_MOUSE.spd).toBe(50);
    expect(BERSERK_MOUSE.expReward).toBe(1);
    expect(BERSERK_MOUSE.goldReward).toBe(1);
  });

  it("is a Darkness critter that counters Additions", () => {
    expect(BERSERK_MOUSE.element).toBe("Darkness");
    expect(BERSERK_MOUSE.countersAdditions).toBe(true);
  });

  it("knows Bite (1×, active) and Chisel (2×)", () => {
    expect(BERSERK_MOUSE.attacks.map((a) => a.name)).toEqual(["Bite", "Chisel"]);
    expect(BERSERK_MOUSE.attacks[0]).toMatchObject({ kind: "physical", multiplier: 1 });
  });
});
