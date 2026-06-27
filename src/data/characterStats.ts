import { statsForLevel, nextLevelExp } from "./dart";
import { dragoonClass, type DragoonClassId } from "./dragoonClasses";
import { equipById, type EquipDef } from "./equipment";
import { EQUIP_SLOTS, type CharacterConfig } from "./roster";

/** MP pool before equipment % bonuses — mirrors Player's BASE_MAX_MP. */
const BASE_MAX_MP = 60;

/** One combat stat split into its base (class table) and gear (equipment) parts. */
export interface StatSplit {
  base: number;
  gear: number;
}

/**
 * Stats computed from a character's {@link CharacterConfig} alone (no live avatar) — the
 * class growth table at the given level plus equipment bonuses. Lets the menu show a
 * reserve character's stats without instantiating a 3D model. Mirrors Player's getters.
 */
export interface ComputedCharacterStats {
  maxHp: number;
  maxMp: number;
  exp: number;
  nextExp: number;
  /** Total Speed (class base + equipment SPD) — drives ATB cadence. */
  speed: number;
  at: StatSplit;
  df: StatSplit;
  mat: StatSplit;
  mdf: StatSplit;
  /** Equipment-only flat stats (any may be 0). */
  spd: number;
  aHit: number;
  mHit: number;
  aAv: number;
  mAv: number;
}

export function computeCharacterStats(
  config: CharacterConfig,
  classId: DragoonClassId,
  level: number,
): ComputedCharacterStats {
  const cls = dragoonClass(classId)!;
  const base = statsForLevel(cls.levels, level);

  const defs = EQUIP_SLOTS.map((s) => config.equipment[s])
    .map((id) => (id ? equipById(id) : undefined))
    .filter((d): d is EquipDef => !!d);
  const sum = (k: keyof EquipDef): number =>
    defs.reduce((a, e) => a + ((e[k] as number) ?? 0), 0);

  const maxHp = Math.floor(base.maxHp * (1 + sum("hpPct")));
  const maxMp = Math.floor(BASE_MAX_MP * (1 + sum("mpPct")));

  return {
    maxHp,
    maxMp,
    exp: base.exp,
    nextExp: nextLevelExp(cls.levels, level),
    speed: cls.baseSpeed + sum("spd"),
    at: { base: base.at, gear: sum("at") },
    df: { base: base.df, gear: sum("df") },
    mat: { base: base.mat, gear: sum("mat") },
    mdf: { base: base.mdf, gear: sum("mdf") },
    spd: sum("spd"),
    aHit: sum("aHit"),
    mHit: sum("mHit"),
    aAv: sum("aAv"),
    mAv: sum("mAv"),
  };
}
