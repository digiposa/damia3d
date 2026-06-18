import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import "@babylonjs/core/Meshes/meshBuilder";

import { GameMode } from "../core/GameMode";
import { IsoCamera } from "../world/IsoCamera";
import { createGround } from "../world/Ground";
import { Player } from "../entities/Player";
import { DebugOverlay } from "../ui/DebugOverlay";

/**
 * Sandbox mode for development and debugging. Currently: an isometric grid the
 * player walks around on, with a live debug overlay. This is where new systems
 * (combat, Additions, abilities) get wired up and tested before they reach the
 * Story and Survival modes.
 */
export class TrainingMode extends GameMode {
  readonly name = "Training";

  private camera!: IsoCamera;
  private player!: Player;
  private overlay!: DebugOverlay;

  enter(): void {
    this.scene.clearColor = new Color4(0.043, 0.051, 0.071, 1);

    const ambient = new HemisphericLight("ambient", new Vector3(0, 1, 0), this.scene);
    ambient.intensity = 0.65;
    ambient.groundColor = new Color3(0.1, 0.12, 0.18);

    const sun = new DirectionalLight("sun", new Vector3(-0.5, -1, -0.4), this.scene);
    sun.intensity = 0.85;

    createGround(this.scene, 40);

    this.player = new Player(this.scene, new Vector3(0, 0, 0));
    this.camera = new IsoCamera(this.scene, this.player.position.clone());

    this.overlay = new DebugOverlay();
  }

  update(dt: number): void {
    const { x, y } = this.input.axis();
    // Screen-relative movement: combine camera forward/right by the input axis.
    const dir = this.camera.groundForward
      .scale(y)
      .add(this.camera.groundRight.scale(x));
    this.player.move(dir, dt);
    this.camera.follow(this.player.position);

    const fps = Math.round(this.scene.getEngine().getFps());
    const p = this.player.position;
    this.overlay.set({
      mode: this.name,
      fps: String(fps),
      pos: `${p.x.toFixed(1)}, ${p.z.toFixed(1)}`,
    });
  }

  dispose(): void {
    this.overlay.dispose();
  }
}
