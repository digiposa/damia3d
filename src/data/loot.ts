import { EQUIPMENT, canEquip, type EquipDef, type EquipSlot, type Member } from "./equipment";
import type { EquipInventory } from "./inventory";
import type { Bearer } from "./bearers";
import { dragoonClass } from "./dragoonClasses";

/** Slots boss loot can drop, in preference order for a tie-break in the deduped candidate list. */
const LOOT_SLOTS: EquipSlot[] = ["weapon", "body", "head", "feet", "accessory"];

/**
 * Where an item sits on its slot's progression ladder — candidates are climbed low→high, so a boss
 * drop is always the *next* rung the party doesn't yet own. Weapons follow the canon AT curve (the
 * exact order the source game hands them out); armour climbs its defensive tier; accessories rank by
 * their headline stat so plain stat trinkets come before the many niche zero-stat guards.
 */
function ladderScore(def: EquipDef): number {
  switch (def.slot) {
    case "weapon":
      return def.at ?? 0;
    case "head":
      return def.mat ?? 0;
    case "body":
      return def.df ?? 0;
    case "feet":
      return (def.df ?? 0) * 10 + (def.spd ?? 0);
    default: // accessory
      return (def.at ?? 0) + (def.df ?? 0) + (def.mat ?? 0) + (def.mdf ?? 0);
  }
}

/** The distinct equip-user Member tags the party draws gear from (Dart & Zieg share "Dart", etc.). */
function partyMembers(party: Bearer[]): Member[] {
  const tags = new Set<Member>();
  for (const b of party) {
    const cls = dragoonClass(b.classId);
    if (cls) tags.add(cls.equipmentUser);
  }
  return [...tags];
}

/** The next item to acquire on `member`'s ladder for `slot`: the lowest-tier item they can equip
 *  that the party doesn't own yet (count 0). Undefined once the whole ladder is owned. */
function nextOnLadder(slot: EquipSlot, member: Member, inv: EquipInventory): EquipDef | undefined {
  return EQUIPMENT.filter((e) => e.slot === slot && canEquip(e, member) && inv.count(e.id) === 0).sort(
    (a, b) => ladderScore(a) - ladderScore(b),
  )[0];
}

/**
 * Boss-loot candidates for the current party: the next unowned upgrade on every member×slot ladder,
 * deduped (shared items collapse to one). Class-filtered and tier-scaled, so what drops always fits
 * someone in the party and rises with their progression. Empty only when every ladder is maxed —
 * the caller then simply skips the loot screen.
 */
export function lootCandidates(party: Bearer[], inv: EquipInventory): EquipDef[] {
  const seen = new Set<string>();
  const out: EquipDef[] = [];
  for (const m of partyMembers(party)) {
    for (const slot of LOOT_SLOTS) {
      const def = nextOnLadder(slot, m, inv);
      if (def && !seen.has(def.id)) {
        seen.add(def.id);
        out.push(def);
      }
    }
  }
  return out;
}
