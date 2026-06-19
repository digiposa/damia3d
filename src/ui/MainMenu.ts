import { hasTouch } from "../core/device";

export type ModeId = "Training" | "Story" | "Survival";

interface MenuEntry {
  mode: ModeId;
  label: string;
  blurb: string;
}

const ENTRIES: MenuEntry[] = [
  { mode: "Training", label: "Training", blurb: "Bac à sable jouable" },
  { mode: "Story", label: "Story", blurb: "Campagne (bientôt)" },
  { mode: "Survival", label: "Survival", blurb: "Vagues d'ennemis (bientôt)" },
];

/**
 * Full-screen title screen shown at boot. Lets the player choose a mode to
 * start. Works with mouse and touch; the active game HUD is hidden while it is
 * visible (the Game toggles it).
 */
export class MainMenu {
  private root: HTMLDivElement;

  constructor(private onSelect: (mode: ModeId) => void) {
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      inset: "0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      padding: "24px",
      boxSizing: "border-box",
      background:
        "radial-gradient(120% 120% at 50% 30%, #141d2e 0%, #0b0d12 70%)",
      color: "#cfe3ff",
      textAlign: "center",
      zIndex: "30",
    } satisfies Partial<CSSStyleDeclaration>);

    const title = document.createElement("div");
    title.textContent = "damia3d";
    Object.assign(title.style, {
      font: "800 clamp(40px, 12vw, 84px)/1 system-ui, sans-serif",
      letterSpacing: "0.04em",
      textShadow: "0 4px 24px rgba(60,110,200,0.45)",
    } satisfies Partial<CSSStyleDeclaration>);

    const subtitle = document.createElement("div");
    subtitle.textContent = "Hommage à The Legend of Dragoon";
    Object.assign(subtitle.style, {
      font: "400 clamp(13px, 3.5vw, 16px)/1.4 system-ui, sans-serif",
      opacity: "0.7",
      marginBottom: "18px",
    } satisfies Partial<CSSStyleDeclaration>);

    this.root.append(title, subtitle);

    const list = document.createElement("div");
    Object.assign(list.style, {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      width: "min(320px, 80vw)",
    } satisfies Partial<CSSStyleDeclaration>);

    for (const entry of ENTRIES) {
      const btn = document.createElement("button");
      Object.assign(btn.style, {
        display: "flex",
        flexDirection: "column",
        gap: "3px",
        font: "600 18px/1.2 system-ui, sans-serif",
        color: "#eaf2ff",
        background: "rgba(30,42,66,0.85)",
        border: "1px solid rgba(120,150,200,0.4)",
        borderRadius: "12px",
        padding: "16px 18px",
        cursor: "pointer",
        touchAction: "manipulation",
        textAlign: "left",
      } satisfies Partial<CSSStyleDeclaration>);
      btn.style.setProperty("-webkit-tap-highlight-color", "transparent");
      btn.innerHTML =
        `<span>${entry.label}</span>` +
        `<span style="font:400 12px/1.3 system-ui;opacity:0.65">${entry.blurb}</span>`;
      btn.addEventListener("pointerup", (e) => {
        e.preventDefault();
        this.onSelect(entry.mode);
      });
      list.appendChild(btn);
    }
    this.root.appendChild(list);

    const hint = document.createElement("div");
    hint.textContent = hasTouch()
      ? "Touchez un mode pour commencer"
      : "Cliquez un mode — ou F1 / F2 / F3 · Échap pour rouvrir ce menu";
    Object.assign(hint.style, {
      font: "12px/1.4 ui-monospace, monospace",
      opacity: "0.5",
      marginTop: "20px",
    } satisfies Partial<CSSStyleDeclaration>);
    this.root.appendChild(hint);

    document.body.appendChild(this.root);
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
