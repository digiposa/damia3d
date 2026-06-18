import type { Scene } from "@babylonjs/core/scene";
import type { Input } from "./Input";

/**
 * A self-contained game mode (Story, Survival, Training). Each mode owns the
 * content it builds into its Scene and is responsible for cleaning it up.
 */
export abstract class GameMode {
  abstract readonly name: string;

  constructor(
    protected scene: Scene,
    protected input: Input,
  ) {}

  /** Build the scene contents. Called once when the mode becomes active. */
  abstract enter(): void;

  /** Called every frame. `dt` is seconds since the last frame. */
  update(_dt: number): void {}

  /** Free any non-scene resources (DOM overlays, listeners). The Scene itself is disposed by the ModeManager. */
  dispose(): void {}
}

export type ModeFactory = (scene: Scene, input: Input) => GameMode;
