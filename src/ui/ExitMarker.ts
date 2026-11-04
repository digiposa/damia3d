import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

import { projectToScreen } from "../world/project";

/**
 * Where a map changes to the next (PS1): a small green triangle, the encounter meter's shape but
 * smaller, spinning over the spot. DOM, pinned every frame; hidden when far or off screen.
 */
export class ExitMarker {
  private readonly el: HTMLDivElement;
  private spin = Math.random() * 6;

  constructor(private readonly scene: Scene, private readonly at: Vector3) {
    this.el = document.createElement("div");
    Object.assign(this.el.style, {
      position: "fixed",
      width: "0",
      height: "0",
      borderLeft: "6px solid transparent",
      borderRight: "6px solid transparent",
      borderTop: "9px solid #3dff6a",
      filter: "drop-shadow(0 0 2px rgba(0,0,0,0.9))",
      pointerEvents: "none",
      zIndex: "16",
      display: "none",
    } satisfies Partial<CSSStyleDeclaration>);
    document.body.appendChild(this.el);
  }

  /** `near`: the hero is close enough for it to show. */
  update(dt: number, near: boolean): void {
    const p = near ? projectToScreen(this.scene, this.at) : undefined;
    if (!p?.visible) {
      this.el.style.display = "none";
      return;
    }
    this.spin += dt * 3;
    this.el.style.display = "block";
    this.el.style.left = `${p.x}px`;
    this.el.style.top = `${p.y}px`;
    this.el.style.transform = `translate(-50%, -100%) perspective(40px) rotateY(${this.spin.toFixed(3)}rad)`;
  }

  dispose(): void {
    this.el.remove();
  }
}
