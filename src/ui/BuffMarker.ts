import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

import { projectToScreen } from "../world/project";

/**
 * The little bubble over an ally under Rose Storm (PS1: a small sphere hangs over whoever has the
 * damage-halving buff): a pink-tinted glass bead, one per buffed ally, pinned every frame; gone
 * when the buff runs out or the ally leaves the screen.
 */
export class BuffMarker {
  private readonly els: HTMLDivElement[] = [];
  private t = 0;

  constructor(private readonly scene: Scene) {}

  /** `heads`: one point per buffed ally (world); none hides every bubble. */
  update(dt: number, heads: Vector3[]): void {
    this.t += dt;
    while (this.els.length < heads.length) {
      const el = document.createElement("div");
      Object.assign(el.style, {
        position: "fixed",
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(255,190,225,0.75) 35%, rgba(230,120,190,0.35) 70%, rgba(200,80,160,0.1) 100%)",
        boxShadow: "0 0 8px rgba(255,160,220,0.6), inset 0 0 4px rgba(255,255,255,0.6)",
        pointerEvents: "none",
        zIndex: "16",
        display: "none",
      } satisfies Partial<CSSStyleDeclaration>);
      document.body.appendChild(el);
      this.els.push(el);
    }
    this.els.forEach((el, i) => {
      const p = i < heads.length ? projectToScreen(this.scene, heads[i]) : undefined;
      if (!p?.visible) {
        el.style.display = "none";
        return;
      }
      el.style.display = "block";
      el.style.left = `${p.x}px`;
      el.style.top = `${p.y - 4 * Math.sin(this.t * 2.2 + i)}px`; // a slow bob
      el.style.transform = "translate(-50%, -100%)";
    });
  }

  dispose(): void {
    for (const el of this.els) el.remove();
    this.els.length = 0;
  }
}
