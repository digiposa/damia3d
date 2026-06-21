import { t } from "../core/i18n";

export interface SpawnCallbacks {
  onKnight: () => void;
  onCommander: () => void;
  onResume: () => void;
}

/**
 * Training-only spawn menu. A pausing overlay (like the System menu) that lets
 * the developer drop enemies into the arena one kind at a time. Stays open after
 * a spawn so several can be added; Resume closes it. Rebuilt on each open so it
 * follows the current language.
 */
export class SpawnMenu {
  private root: HTMLDivElement;
  private title: HTMLDivElement;
  private knightBtn: HTMLButtonElement;
  private commanderBtn: HTMLButtonElement;
  private resumeBtn: HTMLButtonElement;

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
      zIndex: "40",
    } satisfies Partial<CSSStyleDeclaration>);

    this.title = document.createElement("div");
    Object.assign(this.title.style, {
      font: "800 clamp(24px, 7vw, 40px)/1 system-ui, sans-serif",
      marginBottom: "6px",
    } satisfies Partial<CSSStyleDeclaration>);

    this.knightBtn = this.button("rgba(40,70,110,0.9)", cb.onKnight);
    this.commanderBtn = this.button("rgba(90,55,120,0.9)", cb.onCommander);
    this.resumeBtn = this.button("rgba(40,90,60,0.9)", cb.onResume);

    this.root.append(this.title, this.knightBtn, this.commanderBtn, this.resumeBtn);
    document.body.appendChild(this.root);
  }

  private button(bg: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement("button");
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
    this.title.textContent = t("spawn.title");
    this.knightBtn.textContent = t("spawn.knight");
    this.commanderBtn.textContent = t("spawn.commander");
    this.resumeBtn.textContent = `▶  ${t("common.resume")}`;
    this.root.style.display = "flex";
  }

  hide(): void {
    this.root.style.display = "none";
  }

  dispose(): void {
    this.root.remove();
  }
}

