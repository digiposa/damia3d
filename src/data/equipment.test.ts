import { describe, it, expect } from "vitest";

import { EQUIPMENT, equipById, equipmentForSlot, canEquip, equipSummary } from "./equipment";

describe("equipment data", () => {
  it("looks items up by id", () => {
    expect(equipById("heat_blade")?.at).toBe(18);
    expect(equipById("dragon_helm")?.hpPct).toBe(0.5);
  });

  it("lists the eight Dart weapons, all wieldable by Dart", () => {
    const weapons = equipmentForSlot("weapon", "Dart");
    expect(weapons).toHaveLength(8);
    expect(weapons.every((w) => canEquip(w, "Dart"))).toBe(true);
  });

  it("respects user restrictions (Bandit's Ring is men-only)", () => {
    const ring = equipById("bandit_ring")!;
    expect(canEquip(ring, "Dart")).toBe(true);
    expect(canEquip(ring, "Shana")).toBe(false);
  });

  it("filters gear per character (Dart can't wear female headwear)", () => {
    const dartHeads = equipmentForSlot("head", "Dart").map((d) => d.id);
    expect(dartHeads).toContain("dragon_helm");
    expect(dartHeads).not.toContain("felt_hat");
    expect(dartHeads).not.toContain("jeweled_crown");
  });

  it("has all 49 accessories; Dart gets all but the women-only Dancer's Ring", () => {
    const accessories = EQUIPMENT.filter((e) => e.slot === "accessory");
    expect(accessories).toHaveLength(49);
    const dart = equipmentForSlot("accessory", "Dart").map((d) => d.id);
    expect(dart).toHaveLength(48);
    expect(dart).not.toContain("dancers_ring");
    expect(dart).toContain("wargod_calling");
  });

  it("summarises bonuses and effects", () => {
    expect(equipSummary(equipById("heat_blade")!)).toContain("+18 AT");
    expect(equipSummary(equipById("heat_blade")!)).toContain("Fire");
    expect(equipSummary(equipById("physical_ring")!)).toContain("+50% HP");
  });
});
