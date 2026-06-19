import { Engine } from "@babylonjs/core/Engines/engine";

import { Input } from "./Input";
import { ModeManager } from "./ModeManager";
import { hasTouch } from "./device";
import { TrainingMode } from "../modes/TrainingMode";
import { StoryMode } from "../modes/StoryMode";
import { SurvivalMode } from "../modes/SurvivalMode";
import { ModeBar, type ModeId } from "../ui/ModeBar";
import { VirtualJoystick } from "../ui/VirtualJoystick";

/**
 * Top-level application: owns the Babylon engine and the mode manager, runs the
 * render loop, and wires up the cross-device controls (F1/F2/F3 hotkeys, an
 * on-screen mode bar, and a touch joystick).
 */
export class Game {
  private engine: Engine;
  private input: Input;
  private modes: ModeManager;
  private modeBar: ModeBar;

  constructor(canvas: HTMLCanvasElement) {
    // 4th arg (adaptToDeviceRatio) keeps rendering crisp on high-DPI phones/tablets.
    this.engine = new Engine(
      canvas,
      true,
      { preserveDrawingBuffer: true, stencil: true },
      true,
    );
    this.input = new Input();
    this.modes = new ModeManager(this.engine, this.input);

    this.modeBar = new ModeBar((mode) => this.switchMode(mode));
    // The joystick wires itself to window/DOM listeners, so it stays alive for
    // the page lifetime without needing to be retained on the Game instance.
    if (hasTouch()) new VirtualJoystick(this.input);

    const resize = () => this.engine.resize();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    window.addEventListener("keydown", (e) => this.handleHotkeys(e));
  }

  start(): void {
    this.switchMode("Training");

    this.engine.runRenderLoop(() => {
      const dt = this.engine.getDeltaTime() / 1000;
      this.modes.update(dt);
      this.input.endFrame();
      this.modes.currentScene?.render();
    });
  }

  /** Single entry point for mode changes, shared by hotkeys and the mode bar. */
  private switchMode(mode: ModeId): void {
    switch (mode) {
      case "Training":
        this.modes.switchTo((s, i) => new TrainingMode(s, i));
        break;
      case "Story":
        this.modes.switchTo((s, i) => new StoryMode(s, i));
        break;
      case "Survival":
        this.modes.switchTo((s, i) => new SurvivalMode(s, i));
        break;
    }
    this.modeBar.setActive(mode);
  }

  private handleHotkeys(e: KeyboardEvent): void {
    switch (e.code) {
      case "F1":
        e.preventDefault();
        this.switchMode("Training");
        break;
      case "F2":
        e.preventDefault();
        this.switchMode("Story");
        break;
      case "F3":
        e.preventDefault();
        this.switchMode("Survival");
        break;
    }
  }
}
