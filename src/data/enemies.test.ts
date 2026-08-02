import { describe, it, expect } from "vitest";

import { COMMANDER_SELES, COMMANDER_MARSHLAND, KNIGHT_OF_SANDORA_SELES, BERSERK_MOUSE, TRENT, GOBLIN } from "./enemies";

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

describe("Trent — Forest minor enemy", () => {
  it("uses the Japanese PS1 stats", () => {
    expect(TRENT.stats).toEqual({ maxHp: 6, at: 3, df: 160, mat: 3, mdf: 120 });
    expect(TRENT.spd).toBe(30);
    expect(TRENT.expReward).toBe(4);
    expect(TRENT.goldReward).toBe(3);
  });

  it("is an Earth creature that counters Additions", () => {
    expect(TRENT.element).toBe("Earth");
    expect(TRENT.countersAdditions).toBe(true);
  });

  it("knows Trunk Slap (1.5× phys, active) and an Earth-magic Pellet (1.5×)", () => {
    expect(TRENT.attacks.map((a) => a.name)).toEqual(["Trunk Slap", "Pellet"]);
    expect(TRENT.attacks[0]).toMatchObject({ kind: "physical", multiplier: 1.5 });
    expect(TRENT.attacks[1]).toMatchObject({ kind: "magical", element: "Earth" });
  });
});

describe("Goblin — Forest minor enemy", () => {
  it("uses the Japanese PS1 stats", () => {
    expect(GOBLIN.stats).toEqual({ maxHp: 5, at: 2, df: 120, mat: 3, mdf: 120 });
    expect(GOBLIN.spd).toBe(40);
    expect(GOBLIN.expReward).toBe(4);
    expect(GOBLIN.goldReward).toBe(2);
  });

  it("is a Fire humanoid that counters Additions", () => {
    expect(GOBLIN.element).toBe("Fire");
    expect(GOBLIN.countersAdditions).toBe(true);
  });

  it("knows Bone Club (1.5×, active), a thrown stone (3×) and a Kick (4×)", () => {
    expect(GOBLIN.attacks.map((a) => a.name)).toEqual(["Bone Club", "Throw Stone", "Kick"]);
    expect(GOBLIN.attacks[0]).toMatchObject({ kind: "physical", multiplier: 1.5 });
    expect(GOBLIN.attacks[1].name).toMatch(/throw/i); // picked up as the ranged attack
  });
});
