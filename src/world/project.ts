import { Vector3, Matrix } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

export interface ScreenPoint {
  /** CSS-pixel coordinates relative to the canvas. */
  x: number;
  y: number;
  /** False when the point is behind the camera / off the depth range. */
  visible: boolean;
}

/**
 * Project a world position to canvas-relative CSS pixels, for placing DOM
 * overlays (health bars, damage numbers) on top of the 3D scene. Uses the
 * canvas client rect so coordinates stay in CSS px regardless of device ratio.
 */
export function projectToScreen(scene: Scene, world: Vector3): ScreenPoint {
  const engine = scene.getEngine();
  const cam = scene.activeCamera;
  const rect = engine.getRenderingCanvasClientRect();
  if (!cam || !rect) return { x: 0, y: 0, visible: false };

  const p = Vector3.Project(
    world,
    Matrix.Identity(),
    scene.getTransformMatrix(),
    cam.viewport.toGlobal(rect.width, rect.height),
  );
  return { x: p.x, y: p.y, visible: p.z >= 0 && p.z <= 1 };
}
