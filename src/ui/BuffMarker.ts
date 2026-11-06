import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

import { projectToScreen } from "../world/project";

/**
 * The little bubble over an ally under Rose Storm (PS1: a small sphere hangs over whoever has the
 * damage-halving buff): a pink-tinted glass bead inside a thin ring that empties as the buff runs
 * out (like the guard read-out), one per buffed ally, pinned every frame; gone when the buff is
 * over or the ally leaves the screen.
 */
export class BuffMarker {
  private readonly els: HTMLDivElement[] = [];

  constructor(private readonly scene: Scene) {}

  /** `buffed`: one entry per buffed ally — the point over its head (world) and how much of the
   *  buff is left (1 → 0); none hides every bubble. */
  update(buffed: { head: Vector3; left: number }[]): void {
    while (this.els.length < buffed.length) {
      // The same read-out as the guard's (GuardMarker): a 30 px ring whose conic fill is driven
      // by --left (1 = full) over a dim track, a dark 22 px disc inside; here in pink, with the
      // PS1 bubble on the disc instead of an icon.
      const el = document.createElement("div");
      Object.assign(el.style, {
        position: "fixed",
        width: "30px",
        height: "30px",
        borderRadius: "50%",
        background: "conic-gradient(rgba(255,170,220,0.95) calc(var(--left, 1) * 360deg), rgba(110,50,90,0.45) 0)",
        display: "none",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 8px rgba(255,160,220,0.5)",
        pointerEvents: "none",
        zIndex: "16",
      } satisfies Partial<CSSStyleDeclaration>);
      const disc = document.createElement("div");
      Object.assign(disc.style, {
        width: "22px",
        height: "22px",
        borderRadius: "50%",
        background: "rgba(20,35,60,0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      } satisfies Partial<CSSStyleDeclaration>);
      const bead = document.createElement("div");
      Object.assign(bead.style, {
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(255,190,225,0.85) 40%, rgba(200,90,160,0.8) 100%)",
      } satisfies Partial<CSSStyleDeclaration>);
      disc.appendChild(bead);
      el.appendChild(disc);
      document.body.appendChild(el);
      this.els.push(el);
    }
    this.els.forEach((el, i) => {
      const b = i < buffed.length ? buffed[i] : undefined;
      const p = b && b.left > 0 ? projectToScreen(this.scene, b.head) : undefined;
      if (!p?.visible || !b) {
        el.style.display = "none";
        return;
      }
      el.style.display = "flex";
      el.style.left = `${p.x}px`;
      el.style.top = `${p.y}px`;
      el.style.transform = "translate(-50%, -100%)";
      el.style.setProperty("--left", b.left.toFixed(3));
    });
  }

  dispose(): void {
    for (const el of this.els) el.remove();
    this.els.length = 0;
  }
}
