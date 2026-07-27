import { describe, it, expect } from "vitest";
import { lootCandidates } from "./loot";
import { EquipInventory } from "./inventory";
import { bearerById } from "./bearers";

const dart = bearerById("dart")!; // redEye — sword ladder
const zieg = bearerById("zieg")!; // redEye — shares Dart's ladder
const shana = bearerById("shana")!; // whiteSilver — bow ladder

/** Grant a fresh party its starting loadout, the way the mode does on build. */
function stashFor(...party: typeof dart[]): EquipInventory {
  const inv = new EquipInventory();
  for (const b of party) inv.grantLoadout(b);
  return inv;
}

describe("lootCandidates", () => {
  it("offers the next unowned weapon up the canon curve (not one already owned)", () => {
    const inv = stashFor(dart);
    const weapons = lootCandidates([dart], inv).filter((d) => d.slot === "weapon");
    expect(weapons.map((d) => d.id)).toEqual(["bastard_sword"]); // broad_sword (loadout) is owned → next rung
  });

  it("climbs rung by rung as loot is banked", () => {
    const inv = stashFor(dart);
    inv.add("bastard_sword"); // now owned → the curve advances to the next weapon
    const weapon = lootCandidates([dart], inv).find((d) => d.slot === "weapon");
    expect(weapon?.id).toBe("heat_blade");
  });

  it("only offers gear the party can actually equip (class-filtered)", () => {
    const inv = stashFor(shana);
    const ids = lootCandidates([shana], inv).map((d) => d.id);
    // Shana uses bows — never a sword, spear, axe, etc.
    expect(ids).toContain("sparkle_arrow"); // next bow after the Short Bow loadout
    expect(ids).not.toContain("bastard_sword");
  });

  it("collapses shared ladders for same-class members to one candidate", () => {
    const inv = stashFor(dart, zieg); // both redEye
    const weapons = lootCandidates([dart, zieg], inv).filter((d) => d.slot === "weapon");
    expect(weapons).toHaveLength(1);
    expect(weapons[0].id).toBe("bastard_sword");
  });

  it("covers every gear slot for a member", () => {
    const inv = stashFor(dart);
    const slots = new Set(lootCandidates([dart], inv).map((d) => d.slot));
    expect(slots).toEqual(new Set(["weapon", "head", "body", "feet", "accessory"]));
  });

  it("returns nothing once a ladder is exhausted", () => {
    const inv = new EquipInventory();
    inv.grantLoadout(dart);
    // Own every sword so the weapon ladder is maxed; other slots may still have rungs.
    for (const w of ["bastard_sword", "heat_blade", "falchion", "mind_crush", "fairy_sword", "claymore", "soul_eater"]) {
      inv.add(w);
    }
    const weapons = lootCandidates([dart], inv).filter((d) => d.slot === "weapon");
    expect(weapons).toHaveLength(0);
  });
});
