import type { Element } from "../combat/element";
import type { Member, EquipSlot } from "./equipment";
import type { CharacterLevel } from "./dart";
import { DART_LEVELS } from "./dart";
import { LAVITZ_LEVELS } from "./lavitz";
import { SHANA_LEVELS } from "./shana";
import { ROSE_LEVELS } from "./rose";
import { HASCHEL_LEVELS } from "./haschel";
import {
  DART_ADDITION_LIST,
  LAVITZ_ADDITION_LIST,
  ROSE_ADDITION_LIST,
  HASCHEL_ADDITION_LIST,
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
  equipmentUser: "Dart",
  levels: DART_LEVELS,
  additions: DART_ADDITION_LIST,
  loadout: { weapon: "broad_sword", head: "bandana", body: "leather_armor", feet: "leather_boots", accessory: "bracelet" },
};

export const JADE: DragoonClass = {
  id: "jade",
  dragoonName: "Jade Dragoon",
  element: "Wind",
  equipmentUser: "Lavitz",
  levels: LAVITZ_LEVELS,
  additions: LAVITZ_ADDITION_LIST,
  loadout: { weapon: "spear", head: "sallet", body: "scale_armor", feet: "leather_boots", accessory: "bracelet" },
};

export const WHITE_SILVER: DragoonClass = {
  id: "whiteSilver",
  dragoonName: "White-Silver Dragoon",
  element: "Light",
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
  equipmentUser: "Rose",
  levels: ROSE_LEVELS,
  additions: ROSE_ADDITION_LIST,
  loadout: { weapon: "rapier", head: "felt_hat", body: "leather_jacket", feet: "leather_shoes", accessory: "bracelet" },
};

export const VIOLET: DragoonClass = {
  id: "thunder",
  dragoonName: "Violet Dragoon",
  element: "Thunder",
  equipmentUser: "Haschel",
  levels: HASCHEL_LEVELS,
  additions: HASCHEL_ADDITION_LIST,
  loadout: { weapon: "iron_knuckle", head: "bandana", body: "disciple_vest", feet: "leather_boots", accessory: "bracelet" },
};

/** Implemented Dragoon classes (others filled in as their data arrives). */
const CLASSES: Partial<Record<DragoonClassId, DragoonClass>> = {
  redEye: RED_EYE,
  jade: JADE,
  whiteSilver: WHITE_SILVER,
  darkness: DARKNESS,
  thunder: VIOLET,
};

export function dragoonClass(id: DragoonClassId): DragoonClass | undefined {
  return CLASSES[id];
}

export function isClassImplemented(id: DragoonClassId): boolean {
  return CLASSES[id] !== undefined;
}
