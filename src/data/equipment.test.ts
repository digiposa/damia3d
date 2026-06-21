import { describe, it, expect } from "vitest";

import { equipById, equipmentForSlot, canEquip, equipSummary } from "./equipment";

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

  it("summarises bonuses and effects", () => {
    expect(equipSummary(equipById("heat_blade")!)).toContain("+18 AT");
    expect(equipSummary(equipById("heat_blade")!)).toContain("Fire");
    expect(equipSummary(equipById("physical_ring")!)).toContain("+50% HP");
  });
});
