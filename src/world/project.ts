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
    Matrix.IdentityReadOnly, // shared identity — avoids allocating a matrix per call (per floating label/frame)
    scene.getTransformMatrix(),
    cam.viewport.toGlobal(rect.width, rect.height),
  );
  return { x: p.x, y: p.y, visible: p.z >= 0 && p.z <= 1 };
}

/**
 * Pull a projected point back inside the render canvas, keeping `margin` CSS px of breathing room.
 *
 * {@link projectToScreen}'s `visible` only means "in front of the camera" — a point can be in front
 * and still land outside the viewport (an enemy knocked toward the horizon, a caster at the screen
 * edge). Combat feedback anchored there would be silently lost off-screen, so clamp it: better a
 * number pinned to the edge than no number at all.
 */
export function clampToScreen(scene: Scene, p: ScreenPoint, margin = 28): ScreenPoint {
  const rect = scene.getEngine().getRenderingCanvasClientRect();
  if (!rect) return p;
  const clamp = (v: number, max: number): number => Math.min(Math.max(v, margin), Math.max(margin, max - margin));
  return { x: clamp(p.x, rect.width), y: clamp(p.y, rect.height), visible: p.visible };
}
