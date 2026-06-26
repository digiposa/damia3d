import type { EquipSlot } from "./equipment";
import type { Bearer } from "./bearers";
import { dragoonClass } from "./dragoonClasses";
import { BASIC_ATTACK } from "./additions";

/** The equipment slots, in display order. */
export const EQUIP_SLOTS: EquipSlot[] = ["weapon", "head", "body", "feet", "accessory"];

/**
 * Persistent per-character config — the source of truth for a character's gear and equipped
 * Addition, whether or not they are currently in the active party. Active party avatars are
 * built from (and write back to) these records, so edits survive party rebuilds / control
 * switches; reserve characters keep their config with no 3D avatar at all. Level is NOT
 * stored here in Training (it's a global debug setting); per-mode level can be added later.
 */
export interface CharacterConfig {
  /** Equip id per slot (undefined = empty). */
  equipment: Record<EquipSlot, string | undefined>;
  /** Equipped Addition, by name (BASIC_ATTACK's name when the class has none). */
  additionName: string;
}

/**
 * A mode's roster store: per-character {@link CharacterConfig}, lazily defaulted from each
 * bearer's Dragoon-class loadout. Mode-agnostic — a mode decides which bearers it exposes and
 * its party-composition rules; the store just holds their configs.
 */
export class RosterStore {
  private configs = new Map<string, CharacterConfig>();

  /** Config for a bearer, creating it from class defaults on first access. */
  get(bearer: Bearer): CharacterConfig {
    let c = this.configs.get(bearer.id);
    if (!c) {
      c = defaultConfig(bearer);
      this.configs.set(bearer.id, c);
    }
    return c;
  }
}

function defaultConfig(bearer: Bearer): CharacterConfig {
  const cls = dragoonClass(bearer.classId);
  const loadout = cls?.loadout ?? {};
  const equipment = {} as Record<EquipSlot, string | undefined>;
  for (const s of EQUIP_SLOTS) equipment[s] = loadout[s];
  return { equipment, additionName: cls?.additions[0]?.name ?? BASIC_ATTACK.name };
}
