import { settings } from "../core/settings";
import { hasTouch } from "../core/device";
import type { ModeMenuData, AdditionEntry } from "../core/menu";
import {
  type AdditionDef,
  additionPresses,
  additionHitsPercent,
  additionMultiplier,
} from "../data/additions";

type Section = "status" | "equip" | "addition" | "config";

const SECTIONS: { id: Section; label: string; icon: string }[] = [
  { id: "status", label: "Status", icon: "📊" },
  { id: "equip", label: "Équipement", icon: "🛡️" },
  { id: "addition", label: "Addition", icon: "💥" },
  { id: "config", label: "Config", icon: "⚙" },
];

const COMBAT_SPEEDS = [0.5, 1, 1.5, 2];
const ZOOM_LEVELS = [1, 1.25, 1.5, 2];

export interface SystemMenuCallbacks {
  /** Live data from the active mode (Status/Addition); undefined for stub modes. */
  data: () => ModeMenuData | undefined;
  onResume: () => void;
  onMainMenu: () => void;
}

/**
 * In-game System menu in the LoD PS1 style: a left section list (Status,
 * Équipement, Addition, Config) and a right content panel. It pauses the game
 * and is the single hub for character info, equipping Additions and settings.
 */
export class SystemMenu {
  private root: HTMLDivElement;
  private nav: HTMLDivElement;
  private content: HTMLDivElement;
  private section: Section = "status";
  private navButtons = new Map<Section, HTMLButtonElement>();
  /** On mobile the nav shows icons only to save width. */
  private compact = hasTouch();

  constructor(private cb: SystemMenuCallbacks) {
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      inset: "0",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      boxSizing: "border-box",
      background: "radial-gradient(120% 120% at 50% 30%, #161106e0 0%, #0b0d12f5 72%)",
      color: "#f0e6cf",
      zIndex: "31",
    } satisfies Partial<CSSStyleDeclaration>);

    const panel = document.createElement("div");
    Object.assign(panel.style, {
      display: "flex",
      gap: "14px",
      width: "min(720px, 94vw)",
      height: "min(520px, 84vh)",
      padding: "14px",
      borderRadius: "10px",
      background: "linear-gradient(180deg, #2a2310 0%, #1a1608 100%)",
      border: "2px solid #caa24a",
      boxShadow: "0 8px 40px rgba(0,0,0,0.6), inset 0 0 30px rgba(0,0,0,0.5)",
      boxSizing: "border-box",
    } satisfies Partial<CSSStyleDeclaration>);

    // --- Left nav -------------------------------------------------------
    this.nav = document.createElement("div");
    Object.assign(this.nav.style, {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      width: this.compact ? "58px" : "168px",
      flex: "0 0 auto",
    } satisfies Partial<CSSStyleDeclaration>);

    for (const s of SECTIONS) {
      const btn = navButton(s.icon, s.label, this.compact, () => {
        this.section = s.id;
        this.render();
      });
      this.navButtons.set(s.id, btn);
      this.nav.appendChild(btn);
    }

    const spacer = document.createElement("div");
    spacer.style.flex = "1";
    this.nav.appendChild(spacer);
    this.nav.appendChild(
      navButton("▶", "Reprendre", this.compact, () => this.cb.onResume(), "#2f6b3e"),
    );
    this.nav.appendChild(
      navButton("⌂", "Menu principal", this.compact, () => this.cb.onMainMenu(), "#6b3340"),
    );

    // --- Right content --------------------------------------------------
    this.content = document.createElement("div");
    Object.assign(this.content.style, {
      flex: "1",
      minWidth: "0",
      padding: "12px 14px",
      borderRadius: "8px",
      background: "rgba(12,10,5,0.6)",
      border: "1px solid #6b551f",
      overflowY: "auto",
    } satisfies Partial<CSSStyleDeclaration>);

    panel.append(this.nav, this.content);
    this.root.appendChild(panel);
    document.body.appendChild(this.root);
  }

  get isOpen(): boolean {
    return this.root.style.display !== "none";
  }

  show(): void {
    this.root.style.display = "flex";
    this.render();
  }

  hide(): void {
    this.root.style.display = "none";
  }

  dispose(): void {
    this.root.remove();
  }

  // --- Rendering ------------------------------------------------------------

  private render(): void {
    for (const [id, btn] of this.navButtons) {
      const on = id === this.section;
      btn.style.background = on ? "rgba(200,162,74,0.92)" : "rgba(40,34,16,0.85)";
      btn.style.color = on ? "#1a1608" : "#f0e6cf";
    }

    const data = this.cb.data();
    this.content.replaceChildren(
      this.section === "config"
        ? this.renderConfig()
        : this.section === "addition"
          ? this.renderAddition(data)
          : this.section === "equip"
            ? this.renderEquip()
            : this.renderStatus(data),
    );
  }

  private renderStatus(data?: ModeMenuData): HTMLElement {
    if (!data) return note("Status indisponible dans ce mode.");
    const s = data.status;
    const box = section("Status");
    box.appendChild(heading(`${s.name}   LV ${s.level}`));
    box.appendChild(statLines([
      ["HP", `${s.hp} / ${s.maxHp}`],
      ["SP", `${s.sp} / ${s.maxSp}`],
      ["MP", `${s.mp} / ${s.maxMp}`],
      ["EXP", `${s.exp} / ${s.nextExp}`],
    ]));
    box.appendChild(divider());
    box.appendChild(statLines([
      ["Attaque", String(s.at)],
      ["Défense", String(s.df)],
      ["Attaque M.", String(s.mat)],
      ["Défense M.", String(s.mdf)],
    ]));
    box.appendChild(divider());
    box.appendChild(statLines([["Gold", `${s.gold} G`]]));
    return box;
  }

  private renderEquip(): HTMLElement {
    const box = section("Équipement");
    box.appendChild(note("Aucun équipement pour l'instant — arme, armure et accessoires à venir."));
    return box;
  }

  private renderAddition(data?: ModeMenuData): HTMLElement {
    const box = section("Addition");
    if (!data) {
      box.appendChild(note("Additions indisponibles dans ce mode."));
      return box;
    }
    for (const entry of data.additions) {
      box.appendChild(this.additionRow(entry, data.equipAddition));
    }
    return box;
  }

  private additionRow(entry: AdditionEntry, equip: (def: AdditionDef) => void): HTMLElement {
    const { def, unlocked, level, equipped } = entry;
    const el = document.createElement("button");
    el.disabled = !unlocked;
    Object.assign(el.style, {
      display: "flex",
      flexDirection: "column",
      gap: "3px",
      width: "100%",
      textAlign: "left",
      font: "700 15px/1.2 system-ui, sans-serif",
      color: unlocked ? "#f0e6cf" : "#8a7f63",
      background: equipped ? "rgba(200,162,74,0.85)" : "rgba(40,34,16,0.7)",
      border: `1px solid ${equipped ? "#ffe08a" : "#6b551f"}`,
      borderRadius: "8px",
      padding: "10px 12px",
      marginBottom: "7px",
      cursor: unlocked ? "pointer" : "default",
      opacity: unlocked ? "1" : "0.7",
      touchAction: "manipulation",
    } satisfies Partial<CSSStyleDeclaration>);

    const dam = Math.floor((additionHitsPercent(def) * additionMultiplier(def, level)) / 100);
    const sub = unlocked
      ? `${additionPresses(def)} press · Lv ${level}/5 · ${dam}% · SP ${def.spMax}`
      : `🔒 Niveau ${def.acquireLevel}`;
    el.innerHTML =
      `<span>${def.name}${equipped ? "  ✓" : ""}</span>` +
      `<span style="font:400 12px/1.3 ui-monospace,monospace;opacity:0.85;color:${equipped ? "#2a2310" : "inherit"}">${sub}</span>`;

    if (unlocked) {
      el.addEventListener("pointerup", (e) => {
        e.preventDefault();
        equip(def);
        this.render();
      });
    }
    return el;
  }

  private renderConfig(): HTMLElement {
    const box = section("Config");

    const soundBtn = pill(
      settings.soundEnabled ? "🔊 Son : Activé" : "🔇 Son : Coupé",
      () => {
        settings.soundEnabled = !settings.soundEnabled;
        this.render();
      },
    );
    box.append(label("Son"), soundBtn);
    box.append(slider("Musique", settings.musicVolume, (v) => (settings.musicVolume = v)));
    box.append(slider("Effets", settings.sfxVolume, (v) => (settings.sfxVolume = v)));
    box.append(hint("(aucun son pour l'instant — réglages prêts)"));

    box.append(divider(), label("Vitesse de combat"));
    box.append(
      choiceRow(COMBAT_SPEEDS, settings.combatSpeed, (v) => {
        settings.combatSpeed = v;
        this.render();
      }, (v) => `${v}×`),
    );
    box.append(hint("La vitesse de déplacement n'est pas affectée."));

    box.append(divider(), label("Zoom caméra"));
    box.append(
      choiceRow(ZOOM_LEVELS, settings.cameraZoom, (v) => {
        settings.cameraZoom = v;
        this.render();
      }, (v) => `${v}×`),
    );
    return box;
  }
}

// --- DOM helpers ------------------------------------------------------------

function navButton(
  icon: string,
  label: string,
  compact: boolean,
  onClick: () => void,
  bg = "rgba(40,34,16,0.85)",
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.textContent = compact ? icon : `${icon}  ${label}`;
  btn.title = label;
  Object.assign(btn.style, {
    font: compact ? "20px/1 system-ui, sans-serif" : "700 15px/1 system-ui, sans-serif",
    color: "#f0e6cf",
    background: bg,
    border: "1px solid #6b551f",
    borderRadius: "8px",
    padding: compact ? "12px 0" : "11px 12px",
    textAlign: compact ? "center" : "left",
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

function section(title: string): HTMLDivElement {
  const box = document.createElement("div");
  const h = document.createElement("div");
  h.textContent = title;
  Object.assign(h.style, {
    font: "800 18px/1 system-ui, sans-serif",
    color: "#ffe08a",
    marginBottom: "12px",
  } satisfies Partial<CSSStyleDeclaration>);
  box.appendChild(h);
  return box;
}

function heading(text: string): HTMLDivElement {
  const el = document.createElement("div");
  el.textContent = text;
  Object.assign(el.style, {
    font: "800 17px/1.3 system-ui, sans-serif",
    marginBottom: "8px",
  } satisfies Partial<CSSStyleDeclaration>);
  return el;
}

function statLines(rows: [string, string][]): HTMLDivElement {
  const box = document.createElement("div");
  Object.assign(box.style, {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    rowGap: "5px",
    columnGap: "16px",
    font: "13px/1.3 ui-monospace, monospace",
  } satisfies Partial<CSSStyleDeclaration>);
  for (const [k, v] of rows) {
    const key = document.createElement("div");
    key.textContent = k;
    key.style.opacity = "0.8";
    const val = document.createElement("div");
    val.textContent = v;
    val.style.textAlign = "right";
    val.style.color = "#ffe08a";
    box.append(key, val);
  }
  return box;
}

function divider(): HTMLDivElement {
  const el = document.createElement("div");
  Object.assign(el.style, {
    height: "1px",
    background: "rgba(200,162,74,0.3)",
    margin: "12px 0",
  } satisfies Partial<CSSStyleDeclaration>);
  return el;
}

function label(text: string): HTMLDivElement {
  const el = document.createElement("div");
  el.textContent = text;
  Object.assign(el.style, {
    font: "700 14px/1 system-ui, sans-serif",
    color: "#ffe08a",
    margin: "0 0 8px",
  } satisfies Partial<CSSStyleDeclaration>);
  return el;
}

function note(text: string): HTMLDivElement {
  const el = document.createElement("div");
  el.textContent = text;
  Object.assign(el.style, {
    font: "14px/1.5 system-ui, sans-serif",
    opacity: "0.75",
  } satisfies Partial<CSSStyleDeclaration>);
  return el;
}

function hint(text: string): HTMLDivElement {
  const el = document.createElement("div");
  el.textContent = text;
  Object.assign(el.style, {
    font: "12px/1.4 ui-monospace, monospace",
    opacity: "0.55",
    margin: "8px 0 0",
  } satisfies Partial<CSSStyleDeclaration>);
  return el;
}

function pill(text: string, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.textContent = text;
  Object.assign(btn.style, {
    font: "600 14px/1 system-ui, sans-serif",
    color: "#f0e6cf",
    background: "rgba(40,34,16,0.85)",
    border: "1px solid #6b551f",
    borderRadius: "8px",
    padding: "9px 14px",
    cursor: "pointer",
    touchAction: "manipulation",
  } satisfies Partial<CSSStyleDeclaration>);
  btn.addEventListener("pointerup", (e) => {
    e.preventDefault();
    onClick();
  });
  return btn;
}

function choiceRow(
  values: number[],
  active: number,
  onPick: (v: number) => void,
  fmt: (v: number) => string,
): HTMLDivElement {
  const row = document.createElement("div");
  Object.assign(row.style, { display: "flex", gap: "8px", flexWrap: "wrap" } satisfies Partial<CSSStyleDeclaration>);
  for (const v of values) {
    const on = v === active;
    const btn = document.createElement("button");
    btn.textContent = fmt(v);
    Object.assign(btn.style, {
      font: "700 14px/1 system-ui, sans-serif",
      color: on ? "#1a1608" : "#f0e6cf",
      background: on ? "rgba(200,162,74,0.92)" : "rgba(40,34,16,0.85)",
      border: `1px solid ${on ? "#ffe08a" : "#6b551f"}`,
      borderRadius: "8px",
      padding: "9px 14px",
      cursor: "pointer",
      touchAction: "manipulation",
    } satisfies Partial<CSSStyleDeclaration>);
    btn.addEventListener("pointerup", (e) => {
      e.preventDefault();
      onPick(v);
    });
    row.appendChild(btn);
  }
  return row;
}

function slider(name: string, value: number, onChange: (v: number) => void): HTMLLabelElement {
  const row = document.createElement("label");
  Object.assign(row.style, {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "8px 0",
    font: "13px/1 system-ui, sans-serif",
  } satisfies Partial<CSSStyleDeclaration>);
  const span = document.createElement("span");
  span.textContent = name;
  span.style.width = "64px";
  const input = document.createElement("input");
  input.type = "range";
  input.min = "0";
  input.max = "100";
  input.value = String(Math.round(value * 100));
  input.style.flex = "1";
  input.style.touchAction = "manipulation";
  input.addEventListener("input", () => onChange(Number(input.value) / 100));
  row.append(span, input);
  return row;
}
