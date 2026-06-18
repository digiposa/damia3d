import { Engine } from "@babylonjs/core/Engines/engine";

import { Input } from "./Input";
import { ModeManager } from "./ModeManager";
import { TrainingMode } from "../modes/TrainingMode";
import { StoryMode } from "../modes/StoryMode";
import { SurvivalMode } from "../modes/SurvivalMode";

/**
 * Top-level application: owns the Babylon engine and the mode manager, runs the
 * render loop, and maps F1/F2/F3 to the three game modes.
 */
export class Game {
  private engine: Engine;
  private input: Input;
  private modes: ModeManager;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.input = new Input();
    this.modes = new ModeManager(this.engine, this.input);

    window.addEventListener("resize", () => this.engine.resize());
    window.addEventListener("keydown", (e) => this.handleHotkeys(e));
  }

  start(): void {
    this.modes.switchTo((scene, input) => new TrainingMode(scene, input));

    this.engine.runRenderLoop(() => {
      const dt = this.engine.getDeltaTime() / 1000;
      this.modes.update(dt);
      this.input.endFrame();
      this.modes.currentScene?.render();
    });
  }

  private handleHotkeys(e: KeyboardEvent): void {
    switch (e.code) {
      case "F1":
        e.preventDefault();
        this.modes.switchTo((s, i) => new TrainingMode(s, i));
        break;
      case "F2":
        e.preventDefault();
        this.modes.switchTo((s, i) => new StoryMode(s, i));
        break;
      case "F3":
        e.preventDefault();
        this.modes.switchTo((s, i) => new SurvivalMode(s, i));
        break;
    }
  }
}
