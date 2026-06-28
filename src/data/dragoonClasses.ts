import type { Element } from "../combat/element";
import type { Member, EquipSlot } from "./equipment";
import type { CharacterLevel } from "./dart";
import { DART_LEVELS } from "./dart";
import { LAVITZ_LEVELS } from "./lavitz";
import { SHANA_LEVELS } from "./shana";
import { ROSE_LEVELS } from "./rose";
import { HASCHEL_LEVELS } from "./haschel";
import { MERU_LEVELS } from "./meru";
import { KONGOL_LEVELS } from "./kongol";
import {
  DART_ADDITION_LIST,
  LAVITZ_ADDITION_LIST,
  ROSE_ADDITION_LIST,
  HASCHEL_ADDITION_LIST,
  MERU_ADDITION_LIST,
  KONGOL_ADDITION_LIST,
  type AdditionDef,
} from "./additions";

/** A Dragoon line's mechanical identity (stats / element / Additions / gear). */
export type DragoonClassId =
  | "redEye"
  | "darkness"
  | "jade"
  | "whiteSilver"
  | "thunder"
  | "blueSea"
  | "golden";

/** Dragoon-form stat multiplier (%) for one D'Level (e.g. at: 160 → ×1.6). */
export interface DragoonStatMult {
  at: number;
  df: number;
  mat: number;
  mdf: number;
}

/** DF & MDF multipliers (%) by D'Level 1→5 — identical across every Dragoon line. */
const DEF_SERIES = [200, 210, 220, 230, 250];
/** Build a class's 5-entry D'level table from its AT and MAT base (150- or 200-series). */
function dragoonStatTable(atBase: number, matBase: number): DragoonStatMult[] {
  const ramp = (b: number): number[] => [b, b + 5, b + 10, b + 15, b + 20];
  const at = ramp(atBase);
  const mat = ramp(matBase);
  return DEF_SERIES.map((df, i) => ({ at: at[i], df, mat: mat[i], mdf: df }));
}
/** Cumulative SP to reach D'Lv 2/3/4/5. Standard for most; Dart & Rose start at 1,200. */
const TH_STD = [1000, 6000, 12000, 20000];
const TH_DART = [1200, 6000, 12000, 20000];

export interface DragoonClass {
  id: DragoonClassId;
  dragoonName: string;
  element: Element;
  /** Base Speed (canon, fixed — drives ATB cadence). Equipment SPD adds on top. */
  baseSpeed: number;
  /** Which equipment `users` tag this line draws from (the base character). */
  equipmentUser: Member;
  levels: CharacterLevel[];
  additions: AdditionDef[];
  /** Default equipment loadout (item ids per slot). */
  loadout: Partial<Record<EquipSlot, string>>;
  /** Dragoon-form AT/DF/MAT/MDF multipliers (%) per D'Level 1→5. */
  dragoonStats: DragoonStatMult[];
  /** Cumulative SP thresholds to reach D'Lv 2/3/4/5 (raises D'level when accrued). */
  dLevelThresholds: number[];
}

export const RED_EYE: DragoonClass = {
  id: "redEye",
  dragoonName: "Red-Eye Dragoon",
  element: "Fire",
  baseSpeed: 50,
  equipmentUser: "Dart",
  levels: DART_LEVELS,
  additions: DART_ADDITION_LIST,
  loadout: { weapon: "broad_sword", head: "bandana", body: "leather_armor", feet: "leather_boots", accessory: "bracelet" },
  dragoonStats: dragoonStatTable(150,150),
  dLevelThresholds: TH_DART,
};

export const JADE: DragoonClass = {
  id: "jade",
  dragoonName: "Jade Dragoon",
  element: "Wind",
  baseSpeed: 40,
  equipmentUser: "Lavitz",
  levels: LAVITZ_LEVELS,
  additions: LAVITZ_ADDITION_LIST,
  loadout: { weapon: "spear", head: "sallet", body: "scale_armor", feet: "leather_boots", accessory: "bracelet" },
  dragoonStats: dragoonStatTable(150,200),
  dLevelThresholds: TH_STD,
};

export const WHITE_SILVER: DragoonClass = {
  id: "whiteSilver",
  dragoonName: "White-Silver Dragoon",
  element: "Light",
  baseSpeed: 65,
  equipmentUser: "Shana",
  levels: SHANA_LEVELS,
  // Shana / Miranda have no Additions — they fight with a plain bow attack.
  additions: [],
  loadout: { weapon: "short_bow", head: "felt_hat", body: "leather_jacket", feet: "leather_shoes", accessory: "bracelet" },
  dragoonStats: dragoonStatTable(200,150),
  dLevelThresholds: TH_STD,
};

export const DARKNESS: DragoonClass = {
  id: "darkness",
  dragoonName: "Darkness Dragoon",
  element: "Darkness",
  baseSpeed: 55,
  equipmentUser: "Rose",
  levels: ROSE_LEVELS,
  additions: ROSE_ADDITION_LIST,
  loadout: { weapon: "rapier", head: "felt_hat", body: "leather_jacket", feet: "leather_shoes", accessory: "bracelet" },
  dragoonStats: dragoonStatTable(150,150),
  dLevelThresholds: TH_DART,
};

export const VIOLET: DragoonClass = {
  id: "thunder",
  dragoonName: "Violet Dragoon",
  element: "Thunder",
  baseSpeed: 60,
  equipmentUser: "Haschel",
  levels: HASCHEL_LEVELS,
  additions: HASCHEL_ADDITION_LIST,
  loadout: { weapon: "iron_knuckle", head: "bandana", body: "disciple_vest", feet: "leather_boots", accessory: "bracelet" },
  dragoonStats: dragoonStatTable(150,200),
  dLevelThresholds: TH_STD,
};

export const BLUE_SEA: DragoonClass = {
  id: "blueSea",
  dragoonName: "Blue-Sea Dragoon",
  element: "Water",
  baseSpeed: 70,
  equipmentUser: "Meru",
  levels: MERU_LEVELS,
  additions: MERU_ADDITION_LIST,
  loadout: { weapon: "mace", head: "felt_hat", body: "clothes", feet: "leather_shoes", accessory: "bracelet" },
  dragoonStats: dragoonStatTable(200,150),
  dLevelThresholds: TH_STD,
};

export const GOLDEN: DragoonClass = {
  id: "golden",
  dragoonName: "Golden Dragoon",
  element: "Earth",
  baseSpeed: 30,
  equipmentUser: "Kongol",
  levels: KONGOL_LEVELS,
  additions: KONGOL_ADDITION_LIST,
  loadout: { weapon: "axe", head: "bandana", body: "lion_fur", feet: "leather_boots", accessory: "bracelet" },
  dragoonStats: dragoonStatTable(150,200),
  dLevelThresholds: TH_STD,
};

/** Implemented Dragoon classes (all eight party archetypes). */
const CLASSES: Partial<Record<DragoonClassId, DragoonClass>> = {
  redEye: RED_EYE,
  jade: JADE,
  whiteSilver: WHITE_SILVER,
  darkness: DARKNESS,
  thunder: VIOLET,
  blueSea: BLUE_SEA,
  golden: GOLDEN,
};

export function dragoonClass(id: DragoonClassId): DragoonClass | undefined {
  return CLASSES[id];
}

export function isClassImplemented(id: DragoonClassId): boolean {
  return CLASSES[id] !== undefined;
}
