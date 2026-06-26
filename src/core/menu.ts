import type { AdditionDef } from "../data/additions";
import type { EquipSlot } from "../data/equipment";

/** One combat stat broken down into its base (Body) and equipment (Gear) parts. */
export interface StatBreakdown {
  label: string;
  base: number;
  gear: number;
  total: number;
}

/** Character status shown in the System menu's Status tab. */
export interface StatusView {
  name: string;
  /** Portrait image URL; falls back to the name's initial when absent. */
  portrait?: string;
  level: number;
  exp: number;
  nextExp: number;
  hp: number;
  maxHp: number;
  sp: number;
  maxSp: number;
  mp: number;
  maxMp: number;
  gold: number;
  /** AT / DF / MAT / MDF with Body + Gear = Total. */
  combat: StatBreakdown[];
  /** Equipment-only stats that are non-zero (SPD, A-HIT, A-AV, M-AV). */
  gearExtras: { label: string; value: number }[];
}

/** One Addition row in the System menu, with the player's unlock/level state. */
export interface AdditionEntry {
  def: AdditionDef;
  unlocked: boolean;
  level: number;
  equipped: boolean;
}

/** State of one equipment slot for the Equipment tab. */
export interface EquipSlotState {
  slot: EquipSlot;
  equippedName?: string;
}

/** A selectable item when choosing equipment for a slot. */
export interface EquipOption {
  id: string;
  name: string;
  /** One-line bonuses / effect summary. */
  detail: string;
  equipped: boolean;
}

/** Equipment data + actions exposed to the System menu's Equipment tab. */
export interface EquipView {
  slots: EquipSlotState[];
  options: (slot: EquipSlot) => EquipOption[];
  /** Equip an item by id, or unequip the slot when id is omitted. */
  equip: (slot: EquipSlot, id?: string) => void;
}

/** One party member in the Gambits tab. */
export interface GambitMemberView {
  name: string;
  /** The player-controlled member (marked, listed first focus). */
  controlled: boolean;
  /** Ordered catalog ids for this member's rule slots. */
  rules: string[];
}

/** AI gambit rules + actions exposed to the System menu's Gambits tab. */
export interface GambitsView {
  members: GambitMemberView[];
  /** Cycle a member's rule slot to the next catalog entry. */
  cycle: (memberIndex: number, ruleIndex: number) => void;
}

/** Per-mode data the System menu reads to populate the Status / Addition / Equipment tabs. */
export interface ModeMenuData {
  status: StatusView;
  additions: AdditionEntry[];
  equipAddition: (def: AdditionDef) => void;
  equipment: EquipView;
  /** AI party gambits (Training/party modes only; absent elsewhere). */
  gambits?: GambitsView;
}

/** A section of the in-game System menu. */
export type SystemSection = "status" | "equip" | "addition" | "gambits" | "config";

/** Services the running game exposes to its modes (e.g. opening the System menu). */
export interface GameHost {
  /** Open the in-game System menu (pauses the game), optionally on a section. */
  openSystemMenu(section?: SystemSection): void;
}
