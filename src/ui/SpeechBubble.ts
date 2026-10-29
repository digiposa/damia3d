import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

import { clampToScreen, projectToScreen } from "../world/project";

/**
 * A speech bubble pinned over a point of the world (an NPC's head): a speaker line and a short
 * text. DOM, so it stays crisp; re-pinned every frame by {@link update}, so it follows the camera.
 */
export class SpeechBubble {
  private readonly el: HTMLDivElement;
  private readonly who: HTMLDivElement;
  private readonly body: HTMLDivElement;
  private anchor?: Vector3;

  constructor(private readonly scene: Scene) {
    this.el = document.createElement("div");
    Object.assign(this.el.style, {
      position: "fixed",
      transform: "translate(-50%, -100%)",
      maxWidth: "min(320px, 80vw)",
      padding: "8px 12px",
      background: "rgba(20, 14, 10, 0.86)",
      border: "1px solid rgba(232, 196, 120, 0.7)",
      borderRadius: "8px",
      color: "#f3e6cc",
      font: "500 14px/1.35 system-ui, sans-serif",
      pointerEvents: "none",
      opacity: "0",
      transition: "opacity 0.25s ease",
      zIndex: "30",
    } satisfies Partial<CSSStyleDeclaration>);
    this.who = document.createElement("div");
    Object.assign(this.who.style, { font: "700 12px/1.2 system-ui, sans-serif", color: "#e8c478", marginBottom: "3px" });
    this.body = document.createElement("div");
    this.el.append(this.who, this.body);
    document.body.appendChild(this.el);
  }

  /** Show `text` from `who`, over `anchor`. */
  show(anchor: Vector3, who: string, text: string): void {
    this.anchor = anchor;
    this.who.textContent = who;
    this.body.textContent = text;
    this.el.style.opacity = "1";
    this.update();
  }

  hide(): void {
    this.anchor = undefined;
    this.el.style.opacity = "0";
  }

  get visible(): boolean {
    return !!this.anchor;
  }

  /** Re-pin over the anchor (call every frame while shown). */
  update(): void {
    if (!this.anchor) return;
    const raw = projectToScreen(this.scene, this.anchor);
    if (!raw.visible) return;
    const p = clampToScreen(this.scene, raw, 60);
    this.el.style.left = `${p.x}px`;
    this.el.style.top = `${p.y - 8}px`;
  }

  dispose(): void {
    this.el.remove();
  }
}
