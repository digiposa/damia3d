import type { Stats } from "../combat/types";

/** One row of Dart's growth table: cumulative EXP and the stats at that level. */
export interface DartLevel extends Stats {
  level: number;
  /** Total cumulative EXP required to reach this level. */
  exp: number;
}

export const DART_MAX_LEVEL = 60;

/**
 * Dart's full level table (1–60) from *The Legend of Dragoon*.
 * Columns: level, cumulative EXP, Max HP, AT, DF, MAT, MDF.
 */
export const DART_LEVELS: DartLevel[] = [
  { level: 1, exp: 0, maxHp: 30, at: 2, df: 4, mat: 3, mdf: 4 },
  { level: 2, exp: 20, maxHp: 60, at: 4, df: 5, mat: 5, mdf: 5 },
  { level: 3, exp: 43, maxHp: 90, at: 6, df: 7, mat: 7, mdf: 7 },
  { level: 4, exp: 102, maxHp: 120, at: 8, df: 10, mat: 9, mdf: 9 },
  { level: 5, exp: 200, maxHp: 150, at: 11, df: 12, mat: 11, mdf: 11 },
  { level: 6, exp: 345, maxHp: 180, at: 13, df: 14, mat: 13, mdf: 13 },
  { level: 7, exp: 548, maxHp: 210, at: 15, df: 16, mat: 15, mdf: 15 },
  { level: 8, exp: 819, maxHp: 240, at: 18, df: 19, mat: 17, mdf: 17 },
  { level: 9, exp: 1166, maxHp: 270, at: 20, df: 21, mat: 19, mdf: 19 },
  { level: 10, exp: 1600, maxHp: 300, at: 22, df: 23, mat: 21, mdf: 21 },
  { level: 11, exp: 2129, maxHp: 330, at: 25, df: 26, mat: 24, mdf: 24 },
  { level: 12, exp: 2764, maxHp: 413, at: 27, df: 28, mat: 26, mdf: 26 },
  { level: 13, exp: 3515, maxHp: 496, at: 30, df: 31, mat: 29, mdf: 29 },
  { level: 14, exp: 4390, maxHp: 579, at: 32, df: 33, mat: 31, mdf: 32 },
  { level: 15, exp: 5400, maxHp: 662, at: 35, df: 36, mat: 34, mdf: 34 },
  { level: 16, exp: 6553, maxHp: 745, at: 37, df: 38, mat: 36, mdf: 37 },
  { level: 17, exp: 7860, maxHp: 828, at: 40, df: 41, mat: 39, mdf: 40 },
  { level: 18, exp: 9331, maxHp: 911, at: 42, df: 43, mat: 41, mdf: 42 },
  { level: 19, exp: 10974, maxHp: 994, at: 45, df: 46, mat: 44, mdf: 45 },
  { level: 20, exp: 12800, maxHp: 1077, at: 47, df: 48, mat: 46, mdf: 48 },
  { level: 21, exp: 14817, maxHp: 1160, at: 50, df: 51, mat: 49, mdf: 51 },
  { level: 22, exp: 17036, maxHp: 1272, at: 52, df: 53, mat: 51, mdf: 53 },
  { level: 23, exp: 19467, maxHp: 1384, at: 55, df: 56, mat: 54, mdf: 55 },
  { level: 24, exp: 22118, maxHp: 1496, at: 57, df: 58, mat: 56, mdf: 57 },
  { level: 25, exp: 25000, maxHp: 1608, at: 60, df: 61, mat: 59, mdf: 60 },
  { level: 26, exp: 28121, maxHp: 1720, at: 62, df: 63, mat: 61, mdf: 62 },
  { level: 27, exp: 31492, maxHp: 1832, at: 65, df: 66, mat: 64, mdf: 64 },
  { level: 28, exp: 35123, maxHp: 1944, at: 67, df: 68, mat: 66, mdf: 67 },
  { level: 29, exp: 39022, maxHp: 2056, at: 70, df: 71, mat: 69, mdf: 69 },
  { level: 30, exp: 43200, maxHp: 2168, at: 72, df: 73, mat: 71, mdf: 71 },
  { level: 31, exp: 47665, maxHp: 2280, at: 75, df: 76, mat: 74, mdf: 74 },
  { level: 32, exp: 52428, maxHp: 2399, at: 77, df: 78, mat: 76, mdf: 76 },
  { level: 33, exp: 57499, maxHp: 2518, at: 80, df: 81, mat: 79, mdf: 79 },
  { level: 34, exp: 62886, maxHp: 2637, at: 82, df: 83, mat: 81, mdf: 82 },
  { level: 35, exp: 68600, maxHp: 2756, at: 85, df: 86, mat: 84, mdf: 84 },
  { level: 36, exp: 74649, maxHp: 2875, at: 87, df: 88, mat: 86, mdf: 87 },
  { level: 37, exp: 81044, maxHp: 2994, at: 90, df: 91, mat: 89, mdf: 90 },
  { level: 38, exp: 87795, maxHp: 3113, at: 92, df: 93, mat: 91, mdf: 92 },
  { level: 39, exp: 94910, maxHp: 3232, at: 95, df: 96, mat: 94, mdf: 95 },
  { level: 40, exp: 102400, maxHp: 3351, at: 97, df: 98, mat: 96, mdf: 98 },
  { level: 41, exp: 110273, maxHp: 3470, at: 100, df: 101, mat: 99, mdf: 101 },
  { level: 42, exp: 118540, maxHp: 3729, at: 102, df: 103, mat: 101, mdf: 103 },
  { level: 43, exp: 127211, maxHp: 3988, at: 105, df: 105, mat: 104, mdf: 105 },
  { level: 44, exp: 136294, maxHp: 4247, at: 107, df: 108, mat: 106, mdf: 107 },
  { level: 45, exp: 145800, maxHp: 4506, at: 110, df: 110, mat: 109, mdf: 110 },
  { level: 46, exp: 155737, maxHp: 4765, at: 112, df: 113, mat: 111, mdf: 112 },
  { level: 47, exp: 166116, maxHp: 5024, at: 115, df: 115, mat: 114, mdf: 114 },
  { level: 48, exp: 176947, maxHp: 5283, at: 117, df: 118, mat: 116, mdf: 117 },
  { level: 49, exp: 188238, maxHp: 5542, at: 120, df: 120, mat: 119, mdf: 119 },
  { level: 50, exp: 200000, maxHp: 5801, at: 122, df: 123, mat: 121, mdf: 121 },
  { level: 51, exp: 215302, maxHp: 6060, at: 125, df: 125, mat: 124, mdf: 124 },
  { level: 52, exp: 231216, maxHp: 6220, at: 127, df: 128, mat: 126, mdf: 126 },
  { level: 53, exp: 247754, maxHp: 6380, at: 130, df: 131, mat: 129, mdf: 129 },
  { level: 54, exp: 264928, maxHp: 6540, at: 133, df: 133, mat: 132, mdf: 132 },
  { level: 55, exp: 282750, maxHp: 6700, at: 136, df: 136, mat: 135, mdf: 135 },
  { level: 56, exp: 301232, maxHp: 6860, at: 138, df: 139, mat: 138, mdf: 138 },
  { level: 57, exp: 320386, maxHp: 7020, at: 141, df: 141, mat: 141, mdf: 141 },
  { level: 58, exp: 340224, maxHp: 7180, at: 144, df: 144, mat: 144, mdf: 144 },
  { level: 59, exp: 360758, maxHp: 7340, at: 147, df: 147, mat: 147, mdf: 147 },
  { level: 60, exp: 382000, maxHp: 7500, at: 150, df: 150, mat: 150, mdf: 150 },
];

/** Stats for a given level, clamped to the valid 1–60 range. */
export function dartStatsForLevel(level: number): DartLevel {
  const clamped = Math.min(Math.max(Math.floor(level), 1), DART_MAX_LEVEL);
  return DART_LEVELS[clamped - 1];
}

/** Highest level whose cumulative EXP requirement is met by `exp`. */
export function dartLevelForExp(exp: number): number {
  let level = 1;
  for (const row of DART_LEVELS) {
    if (exp >= row.exp) level = row.level;
    else break;
  }
  return level;
}

/** Cumulative EXP needed to reach the next level (capped at the max level). */
export function dartNextLevelExp(level: number): number {
  if (level >= DART_MAX_LEVEL) return DART_LEVELS[DART_MAX_LEVEL - 1].exp;
  return DART_LEVELS[level].exp; // row index `level` is the (level+1)th entry
}
