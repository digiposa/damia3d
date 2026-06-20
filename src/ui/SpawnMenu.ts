export interface SpawnCallbacks {
  onKnight: () => void;
  onCommander: () => void;
  onResume: () => void;
}

/**
 * Training-only spawn menu. A pausing overlay (like the Options menu) that lets
 * the developer drop enemies into the arena one kind at a time. Stays open after
 * a spawn so several can be added; "Reprendre" closes it.
 */
export class SpawnMenu {
  private root: HTMLDivElement;

  constructor(cb: SpawnCallbacks) {
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      inset: "0",
      display: "none",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "14px",
      padding: "24px",
      boxSizing: "border-box",
      background: "radial-gradient(120% 120% at 50% 30%, #141d2ecc 0%, #0b0d12f2 70%)",
      color: "#cfe3ff",
      zIndex: "31",
    } satisfies Partial<CSSStyleDeclaration>);

    const title = document.createElement("div");
    title.textContent = "Apparition d'ennemis";
    Object.assign(title.style, {
      font: "800 clamp(24px, 7vw, 40px)/1 system-ui, sans-serif",
      marginBottom: "6px",
    } satisfies Partial<CSSStyleDeclaration>);
    this.root.appendChild(title);

    this.root.appendChild(this.button("🛡  Knight of Sandora", "rgba(40,70,110,0.9)", cb.onKnight));
    this.root.appendChild(this.button("👑  Commander (boss)", "rgba(90,55,120,0.9)", cb.onCommander));
    this.root.appendChild(this.button("▶  Reprendre", "rgba(40,90,60,0.9)", cb.onResume));

    document.body.appendChild(this.root);
  }

  private button(label: string, bg: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.textContent = label;
    Object.assign(btn.style, {
      font: "700 16px/1 system-ui, sans-serif",
      color: "#eaf2ff",
      background: bg,
      border: "1px solid rgba(120,150,200,0.4)",
      borderRadius: "12px",
      padding: "14px 22px",
      width: "min(360px, 86vw)",
      cursor: "pointer",
      touchAction: "manipulation",
    } satisfies Partial<CSSStyleDeclaration>);
    btn.style.setProperty("-webkit-tap-highlight-color", "transparent");
    btn.addEventListener("pointerup", (e) => {
      e.preventDefault();
      onClick();
    });
    return btn;
  }

  get isOpen(): boolean {
    return this.root.style.display !== "none";
  }

  show(): void {
    this.root.style.display = "flex";
  }

  hide(): void {
    this.root.style.display = "none";
  }

  dispose(): void {
    this.root.remove();
  }
}
