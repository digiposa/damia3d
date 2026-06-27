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
