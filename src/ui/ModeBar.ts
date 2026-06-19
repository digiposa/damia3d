export type ModeId = "Training" | "Story" | "Survival";

const MODES: ModeId[] = ["Training", "Story", "Survival"];

/**
 * On-screen mode switcher. Mirrors the F1/F2/F3 hotkeys with tappable buttons so
 * the game is fully playable on touch devices, while staying handy on desktop.
 * Pinned top-right (clear of the top-left debug overlay).
 */
export class ModeBar {
  private bar: HTMLDivElement;
  private buttons = new Map<ModeId, HTMLButtonElement>();

  constructor(private onSelect: (mode: ModeId) => void) {
    this.bar = document.createElement("div");
    Object.assign(this.bar.style, {
      position: "fixed",
      top: "calc(env(safe-area-inset-top, 0px) + 10px)",
      right: "calc(env(safe-area-inset-right, 0px) + 10px)",
      display: "flex",
      gap: "6px",
      zIndex: "16",
    } satisfies Partial<CSSStyleDeclaration>);

    for (const mode of MODES) {
      const btn = document.createElement("button");
      btn.textContent = mode;
      Object.assign(btn.style, {
        font: "600 13px/1 system-ui, sans-serif",
        color: "#cfe3ff",
        background: "rgba(10,14,22,0.72)",
        border: "1px solid rgba(120,150,200,0.35)",
        borderRadius: "8px",
        padding: "10px 14px",
        cursor: "pointer",
        touchAction: "manipulation",
      } satisfies Partial<CSSStyleDeclaration>);
      btn.style.setProperty("-webkit-tap-highlight-color", "transparent");
      // Pointer (not click) keeps touch latency low and avoids ghost clicks.
      btn.addEventListener("pointerup", (e) => {
        e.preventDefault();
        this.onSelect(mode);
      });
      this.bar.appendChild(btn);
      this.buttons.set(mode, btn);
    }

    document.body.appendChild(this.bar);
  }

  /** Show or hide the whole bar (e.g. while the main menu is open). */
  setVisible(visible: boolean): void {
    this.bar.style.display = visible ? "flex" : "none";
  }

  /** Highlight the button matching the active mode. */
  setActive(mode: ModeId): void {
    for (const [id, btn] of this.buttons) {
      const on = id === mode;
      btn.style.background = on ? "rgba(70,110,180,0.9)" : "rgba(10,14,22,0.72)";
      btn.style.borderColor = on
        ? "rgba(170,200,255,0.8)"
        : "rgba(120,150,200,0.35)";
    }
  }

  dispose(): void {
    this.bar.remove();
  }
}
