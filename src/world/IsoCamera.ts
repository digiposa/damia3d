import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Camera } from "@babylonjs/core/Cameras/camera";
import type { Scene } from "@babylonjs/core/scene";

import { settings } from "../core/settings";

/** Base vertical span (world units) the orthographic camera shows, before zoom. */
const VIEW_HEIGHT = 16;

/** True isometric tilt: ~54.74° from vertical. */
const ISO_BETA = Math.atan(Math.SQRT2);
const ISO_ALPHA = -Math.PI / 4;

/**
 * Orthographic camera locked to an isometric angle. It does not orbit on user
 * input; gameplay code moves its target to follow the player.
 */
export class IsoCamera {
  readonly camera: ArcRotateCamera;

  constructor(scene: Scene, target = Vector3.Zero()) {
    this.camera = new ArcRotateCamera("iso", ISO_ALPHA, ISO_BETA, 40, target, scene);
    this.camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    this.applyOrtho(scene);

    scene.onBeforeRenderObservable.add(() => this.applyOrtho(scene));
  }

  /** Recompute orthographic bounds from the current aspect ratio. */
  private applyOrtho(scene: Scene): void {
    const aspect = scene.getEngine().getAspectRatio(this.camera);
    const half = VIEW_HEIGHT / settings.cameraZoom / 2;
    this.camera.orthoTop = half;
    this.camera.orthoBottom = -half;
    this.camera.orthoLeft = -half * aspect;
    this.camera.orthoRight = half * aspect;
  }

  /** Smoothly follow a world position on the ground. */
  follow(position: Vector3, lerp = 0.15): void {
    Vector3.LerpToRef(this.camera.target, position, lerp, this.camera.target);
  }

  /** Forward direction (into the screen) projected onto the ground plane. */
  get groundForward(): Vector3 {
    const fwd = this.camera.target.subtract(this.camera.position);
    fwd.y = 0;
    return fwd.normalize();
  }

  /** Right direction relative to the screen, on the ground plane. */
  get groundRight(): Vector3 {
    const f = this.groundForward;
    return new Vector3(f.z, 0, -f.x);
  }
}
