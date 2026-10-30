import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

import { hasTouch } from "../core/device";
import { clampToScreen, projectToScreen } from "../world/project";

/**
 * The "you can do something here" chip: floats over a chest or an NPC when you are close enough,
 * names the action ("Open", "Talk"), and shows its key on desktop. Tap / click it, or press the key,
 * to act. One prompt at a time — the nearest interactable wins.
 */
export class InteractPrompt {
  private readonly el: HTMLButtonElement;
  private readonly key: HTMLSpanElement;
  private readonly label: HTMLSpanElement;
  private anchor?: Vector3;
  private pulse = 0;

  constructor(private readonly scene: Scene, onActivate: () => void) {
    this.el = document.createElement("button");
    Object.assign(this.el.style, {
      position: "fixed",
      transform: "translate(-50%, -100%)",
      display: "none",
      alignItems: "center",
      gap: "6px",
      padding: "6px 12px 6px 6px",
      background: "rgba(20, 14, 10, 0.86)",
      border: "1px solid rgba(232, 196, 120, 0.8)",
      borderRadius: "999px",
      color: "#f3e6cc",
      font: "600 14px/1 system-ui, sans-serif",
      cursor: "pointer",
      touchAction: "manipulation",
      zIndex: "18",
    } satisfies Partial<CSSStyleDeclaration>);
    this.el.style.setProperty("-webkit-tap-highlight-color", "transparent");
    this.key = document.createElement("span");
    Object.assign(this.key.style, {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "22px",
      height: "22px",
      borderRadius: "999px",
      background: "#e8c478",
      color: "#2a1c0e",
      font: "800 12px/1 system-ui, sans-serif",
    } satisfies Partial<CSSStyleDeclaration>);
    this.key.textContent = hasTouch() ? "✋" : "E";
    this.label = document.createElement("span");
    this.el.append(this.key, this.label);
    this.el.addEventListener("pointerup", (e) => {
      e.preventDefault();
      e.stopPropagation();
      onActivate();
    });
    this.el.addEventListener("pointerdown", (e) => e.stopPropagation()); // not a click-to-move
    document.body.appendChild(this.el);
  }

  /** Offer `label` over `anchor` (call every frame while it applies). */
  show(anchor: Vector3, label: string): void {
    if (!this.anchor) this.pulse = 0;
    this.anchor = anchor;
    if (this.label.textContent !== label) this.label.textContent = label;
    this.el.style.display = "inline-flex";
  }

  hide(): void {
    this.anchor = undefined;
    this.el.style.display = "none";
  }

  /** Re-pin over the anchor and bob gently. */
  update(dt: number): void {
    if (!this.anchor) return;
    this.pulse += dt;
    const raw = projectToScreen(this.scene, this.anchor);
    if (!raw.visible) return;
    const p = clampToScreen(this.scene, raw, 40);
    this.el.style.left = `${p.x}px`;
    this.el.style.top = `${p.y - 6 - Math.abs(Math.sin(this.pulse * 3)) * 5}px`;
  }

  dispose(): void {
    this.el.remove();
  }
}
