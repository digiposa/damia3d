import { Engine } from "@babylonjs/core/Engines/engine";

import { Input } from "./Input";
import { ModeManager } from "./ModeManager";
import { hasTouch } from "./device";
import type { GameHost } from "./menu";
import { TrainingMode } from "../modes/TrainingMode";
import { StoryMode } from "../modes/StoryMode";
import { SurvivalMode } from "../modes/SurvivalMode";
import { VirtualJoystick } from "../ui/VirtualJoystick";
import { MainMenu, type ModeId } from "../ui/MainMenu";
import { SystemMenu } from "../ui/SystemMenu";
import { Button } from "../ui/Button";

/**
 * Top-level application: owns the Babylon engine and the mode manager, runs the
 * render loop, and wires up navigation. Flow: the main menu picks a mode; in
 * game a System (⚙) button / Escape opens the PS1-style system menu (Status,
 * Équipement, Addition, Config), which is the only way back to the main menu.
 */
export class Game implements GameHost {
  private engine: Engine;
  private input: Input;
  private modes: ModeManager;
  private joystick?: VirtualJoystick;
  private menu: MainMenu;
  private system: SystemMenu;
  private systemBtn: Button;
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
    this.modes = new ModeManager(this.engine, this.input, this);

    if (hasTouch()) this.joystick = new VirtualJoystick(this.input);
    this.menu = new MainMenu((mode) => this.startMode(mode));
    this.system = new SystemMenu({
      data: () => this.modes.current?.menuData?.(),
      onResume: () => this.closeSystemMenu(),
      onMainMenu: () => this.openMainMenu(),
    });
    this.systemBtn = new Button({
      label: "⚙",
      onClick: () => this.openSystemMenu(),
      style: {
        top: "calc(env(safe-area-inset-top, 0px) + 10px)",
        right: "calc(env(safe-area-inset-right, 0px) + 10px)",
        font: "600 18px/1 system-ui, sans-serif",
        padding: "10px 14px",
        // Above the main menu (z30) so it's reachable on the title screen, but
        // below the system/spawn overlays (z40) which cover it when open.
        zIndex: "32",
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
    this.system.hide();
    this.modes.clear();
    this.paused = true;
    this.systemBtn.setVisible(true); // gear stays available on the title screen (Config only)
    this.joystick?.setVisible(false);
    this.menu.show();
  }

  private startMode(mode: ModeId): void {
    switch (mode) {
      case "Training":
        this.modes.switchTo((s, i, h) => new TrainingMode(s, i, h));
        break;
      case "Story":
        this.modes.switchTo((s, i, h) => new StoryMode(s, i, h));
        break;
      case "Survival":
        this.modes.switchTo((s, i, h) => new SurvivalMode(s, i, h));
        break;
    }
    this.menu.hide();
    this.system.hide();
    this.paused = false;
    this.systemBtn.setVisible(true);
    this.joystick?.setVisible(true);
  }

  /** GameHost: open the System menu (also used by the ⚙ button and Escape). */
  openSystemMenu(): void {
    if (this.system.isOpen) return;
    const atMainMenu = this.menu.isOpen;
    if (!atMainMenu) this.paused = true; // pause gameplay (nothing runs at the title)
    this.systemBtn.setVisible(false);
    this.joystick?.setVisible(false);
    this.system.show(atMainMenu);
  }

  private closeSystemMenu(): void {
    this.system.hide();
    this.systemBtn.setVisible(true);
    // Returning to the title leaves the main menu (still shown) paused.
    if (!this.menu.isOpen) {
      this.paused = false;
      this.joystick?.setVisible(true);
    }
  }

  private handleHotkeys(e: KeyboardEvent): void {
    if (e.code !== "Escape") return;
    e.preventDefault();
    if (this.system.isOpen) this.closeSystemMenu();
    else this.openSystemMenu();
  }
}
