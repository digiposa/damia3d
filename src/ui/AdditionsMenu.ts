import {
  type AdditionDef,
  additionPresses,
  additionHitsPercent,
  additionMultiplier,
} from "../data/additions";

/** One row in the Additions menu, with the player's unlock/level state. */
export interface AdditionEntry {
  def: AdditionDef;
  unlocked: boolean;
  level: number;
  equipped: boolean;
}

export interface AdditionsMenuCallbacks {
  onEquip: (def: AdditionDef) => void;
  onResume: () => void;
}

/**
 * Pausing overlay to equip an Addition — faithful to LoD, where Additions are
 * changed in a menu rather than mid-action. Lists every Addition with its press
 * count, level and perfect Dmg%; locked ones show the level they unlock at.
 */
export class AdditionsMenu {
  private root: HTMLDivElement;
  private list: HTMLDivElement;

  constructor(private cb: AdditionsMenuCallbacks) {
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      inset: "0",
      display: "none",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      padding: "24px",
      boxSizing: "border-box",
      background: "radial-gradient(120% 120% at 50% 30%, #141d2ecc 0%, #0b0d12f2 70%)",
      color: "#cfe3ff",
      zIndex: "31",
    } satisfies Partial<CSSStyleDeclaration>);

    const title = document.createElement("div");
    title.textContent = "Additions";
    Object.assign(title.style, {
      font: "800 clamp(24px, 7vw, 40px)/1 system-ui, sans-serif",
      marginBottom: "4px",
    } satisfies Partial<CSSStyleDeclaration>);

    this.list = document.createElement("div");
    Object.assign(this.list.style, {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      width: "min(380px, 88vw)",
      maxHeight: "62vh",
      overflowY: "auto",
    } satisfies Partial<CSSStyleDeclaration>);

    const resume = document.createElement("button");
    resume.textContent = "▶  Reprendre";
    Object.assign(resume.style, {
      font: "700 16px/1 system-ui, sans-serif",
      color: "#eaf2ff",
      background: "rgba(40,90,60,0.9)",
      border: "1px solid rgba(120,150,200,0.4)",
      borderRadius: "12px",
      padding: "14px 22px",
      width: "min(380px, 88vw)",
      cursor: "pointer",
      touchAction: "manipulation",
    } satisfies Partial<CSSStyleDeclaration>);
    resume.addEventListener("pointerup", (e) => {
      e.preventDefault();
      this.cb.onResume();
    });

    this.root.append(title, this.list, resume);
    document.body.appendChild(this.root);
  }

  /** Rebuild the list and show the menu. */
  show(entries: AdditionEntry[]): void {
    this.list.replaceChildren(...entries.map((e) => this.row(e)));
    this.root.style.display = "flex";
  }

  private row(entry: AdditionEntry): HTMLElement {
    const { def, unlocked, level, equipped } = entry;
    const el = document.createElement("button");
    el.disabled = !unlocked;
    Object.assign(el.style, {
      display: "flex",
      flexDirection: "column",
      gap: "3px",
      textAlign: "left",
      font: "700 16px/1.2 system-ui, sans-serif",
      color: unlocked ? "#eaf2ff" : "#7e8aa0",
      background: equipped ? "rgba(70,110,180,0.95)" : "rgba(30,42,66,0.85)",
      border: `1px solid ${equipped ? "rgba(170,200,255,0.85)" : "rgba(120,150,200,0.4)"}`,
      borderRadius: "10px",
      padding: "12px 16px",
      cursor: unlocked ? "pointer" : "default",
      opacity: unlocked ? "1" : "0.6",
      touchAction: "manipulation",
    } satisfies Partial<CSSStyleDeclaration>);

    const presses = additionPresses(def);
    const dam = Math.floor((additionHitsPercent(def) * additionMultiplier(def, level)) / 100);
    const sub = unlocked
      ? `${presses} press · Lv ${level}/5 · ${dam}% · SP ${def.spMax}`
      : `🔒 Niveau ${def.acquireLevel}`;

    el.innerHTML =
      `<span>${def.name}${equipped ? "  ✓" : ""}</span>` +
      `<span style="font:400 12px/1.3 ui-monospace,monospace;opacity:0.8">${sub}</span>`;

    if (unlocked) {
      el.addEventListener("pointerup", (e) => {
        e.preventDefault();
        this.cb.onEquip(def);
      });
    }
    return el;
  }

  get isOpen(): boolean {
    return this.root.style.display !== "none";
  }

  hide(): void {
    this.root.style.display = "none";
  }

  dispose(): void {
    this.root.remove();
  }
}
