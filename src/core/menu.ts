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

/** One character's per-member sheet (Stats / Equipment / Additions). */
export interface CharacterSheet {
  status: StatusView;
  additions: AdditionEntry[];
  equipAddition: (def: AdditionDef) => void;
  equipment: EquipView;
}

/** One row in the roster list. */
export interface CharacterListEntry {
  id: string;
  name: string;
  portrait?: string;
  /** Dragoon element (for grouping). */
  element: string;
  /** Element/archetype colour (0–1 RGB), for the row accent. */
  color: [number, number, number];
  /** In the active party. */
  active: boolean;
  /** The player-controlled member. */
  controlled: boolean;
}

/** The whole manageable roster + per-character sheets, for the System menu's Characters tab. */
export interface CharacterRosterView {
  list: CharacterListEntry[];
  /** Per-character sheet by bearer id. */
  sheet: (bearerId: string) => CharacterSheet;
  /** Bearer id of the controlled member (the default focus). */
  controlledId: string;
}

/** One slot of the party-composition view. */
export interface PartySlotView {
  /** Bearer id currently in the slot. */
  id: string;
  name: string;
  /** The player-controlled member. */
  controlled: boolean;
}

/** Party composition (pick the 3 members) exposed to the System menu's Party tab. */
export interface PartyComposeView {
  slots: PartySlotView[];
  /** The slot currently being edited. */
  activeSlot: number;
  /** Choose which slot to edit. */
  selectSlot: (slot: number) => void;
  /** Assign a roster bearer (by id) to the active slot. */
  assign: (bearerId: string) => void;
}

/** Per-mode data the System menu reads. */
export interface ModeMenuData {
  /** Shared party wallet (gold) — a game-wide resource, shown globally in the menu. */
  gold?: number;
  /** The manageable character roster + per-character sheets (party modes only). */
  characters?: CharacterRosterView;
  /** Party composition (Training/party modes only; absent elsewhere). */
  party?: PartyComposeView;
  /** AI party gambits (Training/party modes only; absent elsewhere). */
  gambits?: GambitsView;
}

/** A section of the in-game System menu. */
export type SystemSection = "characters" | "party" | "gambits" | "config";

/** Services the running game exposes to its modes (e.g. opening the System menu). */
export interface GameHost {
  /** Open the in-game System menu (pauses the game), optionally on a section. */
  openSystemMenu(section?: SystemSection): void;
}
