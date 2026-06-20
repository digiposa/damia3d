import type { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { projectToScreen } from "../world/project";

/** Pixel size of the stationary inner square. */
const INNER = 34;
/** Extra reach of the outer square at progress 0 (collapses to INNER at 1). */
const MAX_EXTRA = 72;

/**
 * The LoD "timing sight": a stationary inner square on the target and a larger
 * rotating square that collapses toward it. The player presses when the two
 * overlap. Driven each frame from an {@link AdditionRunner}'s sight progress;
 * the border turns bright while a press would land (the success window).
 */
export class TimingSight {
  private root: HTMLDivElement;
  private inner: HTMLDivElement;
  private outer: HTMLDivElement;

  constructor() {
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      width: "0",
      height: "0",
      display: "none",
      pointerEvents: "none",
      zIndex: "13",
    } satisfies Partial<CSSStyleDeclaration>);

    this.inner = square(INNER, "rgba(120,180,255,0.95)");
    this.outer = square(INNER, "rgba(150,200,255,0.95)");
    this.root.append(this.inner, this.outer);
    document.body.appendChild(this.root);
  }

  /** Position and shape the sight for the current frame; pass the runner state. */
  update(scene: Scene, world: Vector3, progress: number, inWindow: boolean): void {
    const p = projectToScreen(scene, world);
    if (!p.visible) {
      this.hide();
      return;
    }
    this.root.style.display = "block";
    this.root.style.left = `${p.x}px`;
    this.root.style.top = `${p.y}px`;

    // Outer square collapses from INNER+MAX_EXTRA down to INNER as progress→1.
    const t = Math.min(Math.max(progress, 0), 1);
    const size = INNER + MAX_EXTRA * (1 - t);
    const angle = progress * 180;
    this.outer.style.width = `${size}px`;
    this.outer.style.height = `${size}px`;
    this.outer.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

    const color = inWindow ? "rgba(255,255,255,0.98)" : "rgba(150,200,255,0.9)";
    this.outer.style.borderColor = color;
    this.outer.style.boxShadow = inWindow ? "0 0 12px rgba(255,255,255,0.7)" : "none";
  }

  hide(): void {
    this.root.style.display = "none";
  }

  dispose(): void {
    this.root.remove();
  }
}

function square(size: number, color: string): HTMLDivElement {
  const el = document.createElement("div");
  Object.assign(el.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: `${size}px`,
    height: `${size}px`,
    border: `2px solid ${color}`,
    borderRadius: "3px",
    transform: "translate(-50%, -50%)",
    boxSizing: "border-box",
  } satisfies Partial<CSSStyleDeclaration>);
  return el;
}
