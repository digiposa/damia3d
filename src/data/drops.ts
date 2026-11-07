import { EQUIPMENT, type EquipDef } from "./equipment";
import { ATTACK_ITEMS, CHARM_POTION, HEALING_POTION, SPIRIT_POTION, SUN_RHAPSODY, type ItemDef } from "./items";

/**
 * What an enemy can leave behind when it falls: one roll per entry, at the canon drop rate (PS1 —
 * the tables in docs/damia2D/features/locations: Seles, Forest, Hellena Prison). `item` is a
 * consumable id (items.ts) or an equipment id (equipment.ts).
 */
export interface EnemyDrop {
  item: string;
  /** Chance of the drop, 0..1 (PS1: 100% for the scripted fights, 2–10% for most minor enemies). */
  chance: number;
}

/** A drop resolved to what it is: a consumable for the shared item pool, or a piece of gear. */
export type DropThing = { kind: "item"; def: ItemDef } | { kind: "equip"; def: EquipDef };

const CONSUMABLES = new Map<string, ItemDef>(
  [HEALING_POTION, CHARM_POTION, SPIRIT_POTION, SUN_RHAPSODY, ...ATTACK_ITEMS].map((d) => [d.id, d]),
);
const GEAR = new Map<string, EquipDef>(EQUIPMENT.map((d) => [d.id, d]));

/** What a drop id names (undefined: unknown id — a data error the tests catch). */
export function resolveDrop(id: string): DropThing | undefined {
  const item = CONSUMABLES.get(id);
  if (item) return { kind: "item", def: item };
  const gear = GEAR.get(id);
  return gear ? { kind: "equip", def: gear } : undefined;
}

/** Roll an enemy's drop table: everything that drops this time. */
export function rollDrops(drops: readonly EnemyDrop[] | undefined, rand: () => number = Math.random): DropThing[] {
  const out: DropThing[] = [];
  for (const d of drops ?? []) {
    if (rand() >= d.chance) continue;
    const thing = resolveDrop(d.item);
    if (thing) out.push(thing);
  }
  return out;
}
