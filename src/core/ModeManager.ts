import { Scene } from "@babylonjs/core/scene";
import type { Engine } from "@babylonjs/core/Engines/engine";
import type { GameMode, ModeFactory } from "./GameMode";
import type { Input } from "./Input";

/**
 * Owns the active game mode and its Scene. Switching modes disposes the old
 * scene entirely and builds a fresh one, keeping modes fully isolated.
 */
export class ModeManager {
  private mode?: GameMode;
  private scene?: Scene;

  constructor(
    private engine: Engine,
    private input: Input,
  ) {}

  get currentScene(): Scene | undefined {
    return this.scene;
  }

  get currentName(): string {
    return this.mode?.name ?? "—";
  }

  switchTo(factory: ModeFactory): void {
    this.mode?.dispose();
    this.scene?.dispose();

    const scene = new Scene(this.engine);
    this.scene = scene;
    this.mode = factory(scene, this.input);
    this.mode.enter();
  }

  update(dt: number): void {
    this.mode?.update(dt);
  }

  /** Tear down the active mode and its scene (e.g. when returning to the menu). */
  clear(): void {
    this.mode?.dispose();
    this.scene?.dispose();
    this.mode = undefined;
    this.scene = undefined;
  }
}
