import { settings } from "../core/settings";

const SPEEDS = [0.5, 1, 1.5, 2];

export interface OptionsCallbacks {
  /** Close the menu and resume play. */
  onResume: () => void;
  /** Leave the current mode and return to the main menu. */
  onMainMenu: () => void;
}

/**
 * In-game pause / Options overlay. Edits the shared {@link settings} (sound and
 * combat speed) and is the only way back to the main menu — switching modes
 * always goes through here. Sound controls are placeholders until audio exists.
 */
export class OptionsMenu {
  private root: HTMLDivElement;
  private speedButtons = new Map<number, HTMLButtonElement>();
  private soundBtn!: HTMLButtonElement;

  constructor(cb: OptionsCallbacks) {
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      inset: "0",
      display: "none",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "18px",
      padding: "24px",
      boxSizing: "border-box",
      background: "radial-gradient(120% 120% at 50% 30%, #141d2ecc 0%, #0b0d12f2 70%)",
      color: "#cfe3ff",
      zIndex: "31",
    } satisfies Partial<CSSStyleDeclaration>);

    const title = document.createElement("div");
    title.textContent = "Options";
    Object.assign(title.style, {
      font: "800 clamp(28px, 8vw, 44px)/1 system-ui, sans-serif",
      marginBottom: "4px",
    } satisfies Partial<CSSStyleDeclaration>);
    this.root.appendChild(title);

    this.root.appendChild(this.buildSoundSection());
    this.root.appendChild(this.buildSpeedSection());

    this.root.appendChild(
      this.actionButton("▶  Reprendre", "rgba(40,90,60,0.9)", cb.onResume),
    );
    this.root.appendChild(
      this.actionButton("⌂  Menu principal", "rgba(90,50,60,0.9)", cb.onMainMenu),
    );

    document.body.appendChild(this.root);
    this.refresh();
  }

  // --- Sections ------------------------------------------------------------

  private buildSoundSection(): HTMLElement {
    const card = this.card("Son");

    this.soundBtn = document.createElement("button");
    Object.assign(this.soundBtn.style, this.pillStyle());
    this.soundBtn.addEventListener("pointerup", (e) => {
      e.preventDefault();
      settings.soundEnabled = !settings.soundEnabled;
      this.refresh();
    });
    card.appendChild(this.soundBtn);

    card.appendChild(
      this.slider("Musique", settings.musicVolume, (v) => (settings.musicVolume = v)),
    );
    card.appendChild(
      this.slider("Effets", settings.sfxVolume, (v) => (settings.sfxVolume = v)),
    );

    const note = document.createElement("div");
    note.textContent = "(aucun son pour l'instant — réglages prêts)";
    Object.assign(note.style, {
      font: "12px/1.4 ui-monospace, monospace",
      opacity: "0.5",
    } satisfies Partial<CSSStyleDeclaration>);
    card.appendChild(note);
    return card;
  }

  private buildSpeedSection(): HTMLElement {
    const card = this.card("Vitesse de combat");
    const row = document.createElement("div");
    Object.assign(row.style, { display: "flex", gap: "8px" } satisfies Partial<CSSStyleDeclaration>);
    for (const speed of SPEEDS) {
      const btn = document.createElement("button");
      btn.textContent = `${speed}×`;
      Object.assign(btn.style, this.pillStyle());
      btn.addEventListener("pointerup", (e) => {
        e.preventDefault();
        settings.combatSpeed = speed;
        this.refresh();
      });
      this.speedButtons.set(speed, btn);
      row.appendChild(btn);
    }
    card.appendChild(row);

    const note = document.createElement("div");
    note.textContent = "La vitesse de déplacement n'est pas affectée.";
    Object.assign(note.style, {
      font: "12px/1.4 ui-monospace, monospace",
      opacity: "0.5",
    } satisfies Partial<CSSStyleDeclaration>);
    card.appendChild(note);
    return card;
  }

  // --- Helpers -------------------------------------------------------------

  private card(label: string): HTMLDivElement {
    const card = document.createElement("div");
    Object.assign(card.style, {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      alignItems: "center",
      width: "min(360px, 86vw)",
      padding: "16px",
      borderRadius: "12px",
      background: "rgba(20,28,44,0.7)",
      border: "1px solid rgba(120,150,200,0.3)",
    } satisfies Partial<CSSStyleDeclaration>);
    const h = document.createElement("div");
    h.textContent = label;
    Object.assign(h.style, {
      font: "700 15px/1 system-ui, sans-serif",
      opacity: "0.85",
    } satisfies Partial<CSSStyleDeclaration>);
    card.appendChild(h);
    return card;
  }

  private slider(label: string, value: number, onChange: (v: number) => void): HTMLElement {
    const row = document.createElement("label");
    Object.assign(row.style, {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      width: "100%",
      font: "13px/1 system-ui, sans-serif",
    } satisfies Partial<CSSStyleDeclaration>);
    const name = document.createElement("span");
    name.textContent = label;
    name.style.width = "64px";
    const input = document.createElement("input");
    input.type = "range";
    input.min = "0";
    input.max = "100";
    input.value = String(Math.round(value * 100));
    input.style.flex = "1";
    input.style.touchAction = "manipulation";
    input.addEventListener("input", () => onChange(Number(input.value) / 100));
    row.append(name, input);
    return row;
  }

  private actionButton(label: string, bg: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.textContent = label;
    Object.assign(btn.style, {
      ...this.pillStyle(),
      background: bg,
      font: "700 16px/1 system-ui, sans-serif",
      padding: "14px 22px",
      width: "min(360px, 86vw)",
    } satisfies Partial<CSSStyleDeclaration>);
    btn.addEventListener("pointerup", (e) => {
      e.preventDefault();
      onClick();
    });
    return btn;
  }

  private pillStyle(): Partial<CSSStyleDeclaration> {
    return {
      font: "600 14px/1 system-ui, sans-serif",
      color: "#eaf2ff",
      background: "rgba(30,42,66,0.85)",
      border: "1px solid rgba(120,150,200,0.4)",
      borderRadius: "10px",
      padding: "10px 16px",
      cursor: "pointer",
      touchAction: "manipulation",
    };
  }

  private refresh(): void {
    this.soundBtn.textContent = settings.soundEnabled ? "🔊 Son : Activé" : "🔇 Son : Coupé";
    for (const [speed, btn] of this.speedButtons) {
      const on = settings.combatSpeed === speed;
      btn.style.background = on ? "rgba(70,110,180,0.95)" : "rgba(30,42,66,0.85)";
      btn.style.borderColor = on ? "rgba(170,200,255,0.85)" : "rgba(120,150,200,0.4)";
    }
  }

  get isOpen(): boolean {
    return this.root.style.display !== "none";
  }

  show(): void {
    this.refresh();
    this.root.style.display = "flex";
  }

  hide(): void {
    this.root.style.display = "none";
  }

  dispose(): void {
    this.root.remove();
  }
}
