import { hasTouch } from "../core/device";

/**
 * Lightweight HTML overlay for the Training mode: live FPS, player position,
 * active mode and a control hint. Plain DOM keeps it dependency-free.
 */
export class DebugOverlay {
  private el: HTMLDivElement;
  private hint = hasTouch()
    ? "Joystick: move · ⚔ tap-in-rhythm: combo\nMode buttons (top-right) to switch"
    : "WASD/Arrows: move · Click/Space in rhythm: combo\nF1 Training   F2 Story   F3 Survival";

  constructor() {
    this.el = document.createElement("div");
    Object.assign(this.el.style, {
      position: "fixed",
      top: "10px",
      left: "10px",
      padding: "10px 12px",
      font: "12px/1.5 ui-monospace, monospace",
      color: "#cfe3ff",
      background: "rgba(10,14,22,0.72)",
      border: "1px solid rgba(120,150,200,0.35)",
      borderRadius: "6px",
      pointerEvents: "none",
      whiteSpace: "pre",
      zIndex: "10",
    } satisfies Partial<CSSStyleDeclaration>);
    document.body.appendChild(this.el);
  }

  set(lines: Record<string, string>): void {
    const body = Object.entries(lines)
      .map(([k, v]) => `${k.padEnd(8)} ${v}`)
      .join("\n");
    this.el.textContent = body + "\n\n" + this.hint;
  }

  dispose(): void {
    this.el.remove();
  }
}
