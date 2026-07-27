import { describe, it, expect } from "vitest";
import { EquipInventory } from "./inventory";
import { bearerById } from "./bearers";
import { dragoonClass } from "./dragoonClasses";

const dart = bearerById("dart")!; // redEye
const zieg = bearerById("zieg")!; // redEye — shares Dart's loadout/weapons
const meru = bearerById("meru")!; // blueSea

describe("EquipInventory", () => {
  it("grants a member their class starting loadout", () => {
    const inv = new EquipInventory();
    inv.grantLoadout(dart);
    const loadout = dragoonClass(dart.classId)!.loadout;
    for (const id of Object.values(loadout)) expect(inv.count(id!)).toBe(1);
    expect(inv.count("bastard_sword")).toBe(0); // upgrades aren't owned until looted
  });

  it("stacks copies when two same-class members each bring the shared loadout item", () => {
    const inv = new EquipInventory();
    inv.grantLoadout(dart);
    inv.grantLoadout(zieg); // same redEye loadout → a second copy of each item
    const weapon = dragoonClass(dart.classId)!.loadout.weapon!;
    expect(inv.count(weapon)).toBe(2);
  });

  it("does not re-grant the same bearer on a rebuild", () => {
    const inv = new EquipInventory();
    inv.grantLoadout(meru);
    inv.grantLoadout(meru); // party rebuild — must not double-count
    const weapon = dragoonClass(meru.classId)!.loadout.weapon!;
    expect(inv.count(weapon)).toBe(1);
  });

  it("adds looted copies on top of the loadout", () => {
    const inv = new EquipInventory();
    inv.grantLoadout(dart);
    inv.add("bastard_sword");
    inv.add("bastard_sword", 2);
    expect(inv.count("bastard_sword")).toBe(3);
  });
});
