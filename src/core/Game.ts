import { Engine } from "@babylonjs/core/Engines/engine";

import { Input } from "./Input";
import { ModeManager } from "./ModeManager";
import { hasTouch } from "./device";
import { TrainingMode } from "../modes/TrainingMode";
import { StoryMode } from "../modes/StoryMode";
import { SurvivalMode } from "../modes/SurvivalMode";
import { ModeBar, type ModeId } from "../ui/ModeBar";
import { VirtualJoystick } from "../ui/VirtualJoystick";
import { MainMenu } from "../ui/MainMenu";

/**
 * Top-level application: owns the Babylon engine and the mode manager, runs the
 * render loop, and wires up the cross-device controls (main menu, F1/F2/F3
 * hotkeys, an on-screen mode bar, and a touch joystick).
 */
export class Game {
  private engine: Engine;
  private input: Input;
  private modes: ModeManager;
  private modeBar: ModeBar;
  private joystick?: VirtualJoystick;
  private menu: MainMenu;

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
    if (hasTouch()) this.joystick = new VirtualJoystick(this.input);
    this.menu = new MainMenu((mode) => this.switchMode(mode));

    const resize = () => this.engine.resize();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    window.addEventListener("keydown", (e) => this.handleHotkeys(e));
  }

  start(): void {
    // Boot into the title screen; the HUD stays hidden until a mode is chosen.
    this.openMenu();

    this.engine.runRenderLoop(() => {
      const dt = this.engine.getDeltaTime() / 1000;
      this.modes.update(dt);
      this.input.endFrame();
      this.modes.currentScene?.render();
    });
  }

  /** Show the main menu and hide the in-game HUD. */
  private openMenu(): void {
    this.menu.show();
    this.setHudVisible(false);
  }

  private setHudVisible(visible: boolean): void {
    this.modeBar.setVisible(visible);
    this.joystick?.setVisible(visible);
  }

  /** Single entry point for mode changes, shared by the menu, hotkeys and mode bar. */
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
    this.menu.hide();
    this.setHudVisible(true);
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
      case "Escape":
        e.preventDefault();
        this.openMenu();
        break;
    }
  }
}
