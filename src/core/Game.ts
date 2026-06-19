import { Engine } from "@babylonjs/core/Engines/engine";

import { Input } from "./Input";
import { ModeManager } from "./ModeManager";
import { hasTouch } from "./device";
import { TrainingMode } from "../modes/TrainingMode";
import { StoryMode } from "../modes/StoryMode";
import { SurvivalMode } from "../modes/SurvivalMode";
import { VirtualJoystick } from "../ui/VirtualJoystick";
import { MainMenu, type ModeId } from "../ui/MainMenu";
import { OptionsMenu } from "../ui/OptionsMenu";
import { Button } from "../ui/Button";

/**
 * Top-level application: owns the Babylon engine and the mode manager, runs the
 * render loop, and wires up navigation. Flow: the main menu picks a mode; in
 * game an Options (⚙) button / Escape opens the pause menu, which is the only
 * way back to the main menu — so changing modes always goes through the menu.
 */
export class Game {
  private engine: Engine;
  private input: Input;
  private modes: ModeManager;
  private joystick?: VirtualJoystick;
  private menu: MainMenu;
  private options: OptionsMenu;
  private optionsBtn: Button;
  private paused = false;

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

    if (hasTouch()) this.joystick = new VirtualJoystick(this.input);
    this.menu = new MainMenu((mode) => this.startMode(mode));
    this.options = new OptionsMenu({
      onResume: () => this.closeOptions(),
      onMainMenu: () => this.openMainMenu(),
    });
    this.optionsBtn = new Button({
      label: "⚙",
      onClick: () => this.openOptions(),
      style: {
        top: "calc(env(safe-area-inset-top, 0px) + 10px)",
        right: "calc(env(safe-area-inset-right, 0px) + 10px)",
        font: "600 18px/1 system-ui, sans-serif",
        padding: "10px 14px",
      },
    });

    const resize = () => this.engine.resize();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    window.addEventListener("keydown", (e) => this.handleHotkeys(e));
  }

  start(): void {
    this.openMainMenu();

    this.engine.runRenderLoop(() => {
      const dt = this.engine.getDeltaTime() / 1000;
      if (!this.paused) this.modes.update(dt);
      this.input.endFrame();
      this.modes.currentScene?.render();
    });
  }

  /** Show the title screen, tearing down any running mode. */
  private openMainMenu(): void {
    this.options.hide();
    this.modes.clear();
    this.paused = true;
    this.setHudVisible(false);
    this.menu.show();
  }

  private startMode(mode: ModeId): void {
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
    this.options.hide();
    this.paused = false;
    this.setHudVisible(true);
  }

  private openOptions(): void {
    if (this.paused) return; // already in a menu
    this.paused = true;
    this.setHudVisible(false);
    this.options.show();
  }

  private closeOptions(): void {
    this.options.hide();
    this.paused = false;
    this.setHudVisible(true);
  }

  private setHudVisible(visible: boolean): void {
    this.optionsBtn.setVisible(visible);
    this.joystick?.setVisible(visible);
  }

  private handleHotkeys(e: KeyboardEvent): void {
    if (e.code !== "Escape") return;
    e.preventDefault();
    if (this.menu.isOpen) return;
    if (this.options.isOpen) this.closeOptions();
    else this.openOptions();
  }
}
