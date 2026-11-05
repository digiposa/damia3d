import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

import { projectToScreen } from "../world/project";

/**
 * "Guarding" tag over a character's head: the shield icon inside a thin ring that empties as the
 * stance runs out. DOM, pinned every frame; hidden when not guarding or off screen. The stance
 * itself is the character's animation — this is just the read-out of how long it has left.
 */
export class GuardMarker {
  private readonly el: HTMLDivElement;
  private readonly icon: HTMLImageElement;
  private shown = false;

  constructor(private readonly scene: Scene, iconUrl: string) {
    this.el = document.createElement("div");
    Object.assign(this.el.style, {
      position: "fixed",
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      // The ring: a conic fill driven by --left (1 = full), over a dim track.
      background: "conic-gradient(rgba(150,220,255,0.95) calc(var(--left, 1) * 360deg), rgba(40,70,110,0.45) 0)",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 0 8px rgba(120,200,255,0.5)",
      pointerEvents: "none",
      zIndex: "16",
    } satisfies Partial<CSSStyleDeclaration>);
    this.icon = document.createElement("img");
    this.icon.src = iconUrl;
    this.icon.alt = "";
    Object.assign(this.icon.style, {
      width: "22px",
      height: "22px",
      borderRadius: "50%",
      background: "rgba(20,35,60,0.9)",
      imageRendering: "pixelated",
    } satisfies Partial<CSSStyleDeclaration>);
    this.el.appendChild(this.icon);
    document.body.appendChild(this.el);
  }

  /** `left`: the stance's remaining fraction (1 → 0); ≤ 0 or no `head` hides it. */
  update(head: Vector3 | undefined, left: number): void {
    const p = head && left > 0 ? projectToScreen(this.scene, head) : undefined;
    if (!p?.visible) {
      if (this.shown) {
        this.el.style.display = "none";
        this.shown = false;
      }
      return;
    }
    if (!this.shown) {
      this.el.style.display = "flex";
      this.shown = true;
    }
    this.el.style.left = `${p.x}px`;
    this.el.style.top = `${p.y}px`;
    this.el.style.transform = "translate(-50%, -100%)";
    this.el.style.setProperty("--left", left.toFixed(3));
  }

  dispose(): void {
    this.el.remove();
  }
}
