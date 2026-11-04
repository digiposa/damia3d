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
      // PS1: a translucent emerald-teal triangle, pale at the top and deep green at its point.
      width: "13px",
      height: "15px",
      clipPath: "polygon(0 0, 100% 0, 50% 100%)",
      background: "linear-gradient(180deg, #9ff2d2 0%, #2fc08a 45%, #0c7a52 100%)",
      opacity: "0.88",
      filter: "drop-shadow(0 0 3px rgba(60,230,170,0.55))",
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
