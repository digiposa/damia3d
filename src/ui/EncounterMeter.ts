import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

import { clampToScreen, projectToScreen } from "../world/project";

/**
 * The danger indicator of the original: a small triangle over the hero's head that shifts from
 * blue to yellow to red as a random encounter draws near (red pulses: it is about to happen).
 * DOM, pinned over the head every frame. `level` is 0 (just reset) … 1 (encounter now).
 */
export class EncounterMeter {
  private readonly el: HTMLDivElement;
  private t = 0;

  constructor(private readonly scene: Scene) {
    this.el = document.createElement("div");
    Object.assign(this.el.style, {
      position: "fixed",
      width: "0",
      height: "0",
      borderLeft: "9px solid transparent",
      borderRight: "9px solid transparent",
      borderTop: "14px solid #3d7cff", // pointing down at the hero
      transform: "translate(-50%, -100%)",
      filter: "drop-shadow(0 0 2px rgba(0,0,0,0.9))",
      pointerEvents: "none",
      zIndex: "17",
      display: "none",
    } satisfies Partial<CSSStyleDeclaration>);
    document.body.appendChild(this.el);
  }

  /** Show the meter at `level` over `head`, or hide it (`level` null). */
  update(dt: number, head: Vector3, level: number | null): void {
    if (level === null) {
      this.el.style.display = "none";
      return;
    }
    this.t += dt;
    const raw = projectToScreen(this.scene, head);
    if (!raw.visible) return;
    const p = clampToScreen(this.scene, raw, 20);
    // Blue → yellow → red, in three clear bands like the original (no muddy in-between).
    const color = level < 0.5 ? "#3d7cff" : level < 0.8 ? "#ffd23d" : "#ff3d3d";
    const pulse = level >= 0.8 ? 1 + 0.18 * Math.abs(Math.sin(this.t * 7)) : 1;
    this.el.style.display = "block";
    this.el.style.borderTopColor = color;
    this.el.style.left = `${p.x}px`;
    this.el.style.top = `${p.y - 4}px`;
    this.el.style.transform = `translate(-50%, -100%) scale(${pulse.toFixed(3)})`;
  }

  dispose(): void {
    this.el.remove();
  }
}

/** Point over a figure's head where the meter sits. */
export function meterAnchor(feet: Vector3, height = 2.35): Vector3 {
  return new Vector3(feet.x, feet.y + height, feet.z);
}
