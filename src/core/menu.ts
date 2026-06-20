import type { AdditionDef } from "../data/additions";

/** Character status shown in the System menu's Status tab. */
export interface StatusView {
  name: string;
  level: number;
  exp: number;
  nextExp: number;
  hp: number;
  maxHp: number;
  sp: number;
  maxSp: number;
  mp: number;
  maxMp: number;
  at: number;
  df: number;
  mat: number;
  mdf: number;
  gold: number;
}

/** One Addition row in the System menu, with the player's unlock/level state. */
export interface AdditionEntry {
  def: AdditionDef;
  unlocked: boolean;
  level: number;
  equipped: boolean;
}

/** Per-mode data the System menu reads to populate the Status / Addition tabs. */
export interface ModeMenuData {
  status: StatusView;
  additions: AdditionEntry[];
  equipAddition: (def: AdditionDef) => void;
}

/** Services the running game exposes to its modes (e.g. opening the System menu). */
export interface GameHost {
  /** Open the in-game System menu (pauses the game). */
  openSystemMenu(): void;
}
