import type { Scene } from "@babylonjs/core/scene";
import type { Input } from "./Input";
import type { GameHost, ModeMenuData } from "./menu";

/**
 * A self-contained game mode (Story, Survival, Training). Each mode owns the
 * content it builds into its Scene and is responsible for cleaning it up.
 */
export abstract class GameMode {
  abstract readonly name: string;

  constructor(
    protected scene: Scene,
    protected input: Input,
    protected host: GameHost,
  ) {}

  /** Build the scene contents. Called once when the mode becomes active. */
  abstract enter(): void;

  /** Called every frame. `dt` is seconds since the last frame. */
  update(_dt: number): void {}

  /** Data for the System menu's Status/Addition tabs, when the mode has a player. */
  menuData?(): ModeMenuData | undefined;

  /** True when the mode has one of its own overlay menus open (debug/item/spell). The System
   *  menu is mutually exclusive with these — it won't open while one is up. */
  hasOpenMenu?(): boolean;

  /** Close the currently-open in-mode overlay, if any. Returns true when one was closed (so
   *  Escape can dismiss the current menu instead of opening the System menu on top of it). */
  closeTopMenu?(): boolean;

  /** Free any non-scene resources (DOM overlays, listeners). The Scene itself is disposed by the ModeManager. */
  dispose(): void {}
}

export type ModeFactory = (scene: Scene, input: Input, host: GameHost) => GameMode;
