import { settings } from "../core/settings";
import { hasTouch } from "../core/device";
import { t, getLocale, setLocale, LOCALES } from "../core/i18n";
import type { ModeMenuData, AdditionEntry } from "../core/menu";
import {
  type AdditionDef,
  additionPresses,
  additionHitsPercent,
  additionMultiplier,
} from "../data/additions";

type Section = "status" | "equip" | "addition" | "config";

const SECTIONS: { id: Section; labelKey: string; icon: string }[] = [
  { id: "status", labelKey: "section.status", icon: "📊" },
  { id: "equip", labelKey: "section.equip", icon: "🛡️" },
  { id: "addition", labelKey: "section.addition", icon: "💥" },
  { id: "config", labelKey: "section.config", icon: "⚙" },
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
 * Equipment, Addition, Config) and a right content panel. It pauses the game and
 * is the single hub for character info, equipping Additions and settings. The
 * nav shows icons only on mobile. Nav and content are rebuilt on each render so
 * a language change applies live.
 */
export class SystemMenu {
  private root: HTMLDivElement;
  private nav: HTMLDivElement;
  private content: HTMLDivElement;
  private section: Section = "status";
  private compact = hasTouch();
  /** When opened from the title screen there is no mode: Config only, no "Main menu". */
  private atMainMenu = false;

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
      zIndex: "40",
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

    this.nav = document.createElement("div");
    Object.assign(this.nav.style, {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      width: this.compact ? "58px" : "168px",
      flex: "0 0 auto",
    } satisfies Partial<CSSStyleDeclaration>);

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

  show(atMainMenu = false): void {
    this.atMainMenu = atMainMenu;
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
    const data = this.cb.data();
    // Character tabs only exist once a mode has player state; otherwise Config only.
    const available = data ? SECTIONS : SECTIONS.filter((s) => s.id === "config");
    if (!available.some((s) => s.id === this.section)) this.section = available[0].id;

    this.renderNav(available);
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

  private renderNav(available: typeof SECTIONS): void {
    const items: HTMLElement[] = available.map((s) =>
      navButton(s.icon, t(s.labelKey), this.compact, () => {
        this.section = s.id;
        this.render();
      }, s.id === this.section ? "rgba(200,162,74,0.92)" : undefined, s.id === this.section),
    );

    const spacer = document.createElement("div");
    spacer.style.flex = "1";
    items.push(
      spacer,
      navButton("▶", t("common.resume"), this.compact, () => this.cb.onResume(), "#2f6b3e"),
    );
    if (!this.atMainMenu) {
      items.push(
        navButton("⌂", t("common.mainMenu"), this.compact, () => this.cb.onMainMenu(), "#6b3340"),
      );
    }
    this.nav.replaceChildren(...items);
  }

  private renderStatus(data?: ModeMenuData): HTMLElement {
    if (!data) return note(t("status.unavailable"));
    const s = data.status;
    const box = section(t("section.status"));
    box.appendChild(heading(`${s.name}   LV ${s.level}`));
    box.appendChild(statLines([
      [t("stat.hp"), `${s.hp} / ${s.maxHp}`],
      [t("stat.sp"), `${s.sp} / ${s.maxSp}`],
      [t("stat.mp"), `${s.mp} / ${s.maxMp}`],
      [t("stat.exp"), `${s.exp} / ${s.nextExp}`],
    ]));
    box.appendChild(divider());
    box.appendChild(statLines([
      [t("stat.at"), String(s.at)],
      [t("stat.df"), String(s.df)],
      [t("stat.mat"), String(s.mat)],
      [t("stat.mdf"), String(s.mdf)],
    ]));
    box.appendChild(divider());
    box.appendChild(statLines([[t("stat.gold"), `${s.gold} G`]]));
    return box;
  }

  private renderEquip(): HTMLElement {
    const box = section(t("section.equip"));
    box.appendChild(note(t("equip.placeholder")));
    return box;
  }

  private renderAddition(data?: ModeMenuData): HTMLElement {
    const box = section(t("section.addition"));
    if (!data) {
      box.appendChild(note(t("addition.unavailable")));
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
      ? t("addition.sub", { presses: additionPresses(def), level, dam, sp: def.spMax })
      : t("addition.locked", { level: def.acquireLevel });
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
    const box = section(t("section.config"));

    box.append(label(t("config.language")));
    box.append(
      choiceRow(
        LOCALES.map((l) => l.id),
        getLocale(),
        (id) => {
          setLocale(id);
          this.render();
        },
        (id) => LOCALES.find((l) => l.id === id)!.label,
      ),
    );

    box.append(divider(), label(t("config.sound")));
    box.append(
      pill(settings.soundEnabled ? t("config.sound.on") : t("config.sound.off"), () => {
        settings.soundEnabled = !settings.soundEnabled;
        this.render();
      }),
    );
    box.append(slider(t("config.music"), settings.musicVolume, (v) => (settings.musicVolume = v)));
    box.append(slider(t("config.sfx"), settings.sfxVolume, (v) => (settings.sfxVolume = v)));
    box.append(hint(t("config.sound.note")));

    box.append(divider(), label(t("config.combatSpeed")));
    box.append(
      choiceRow(COMBAT_SPEEDS, settings.combatSpeed, (v) => {
        settings.combatSpeed = v;
        this.render();
      }, (v) => `${v}×`),
    );
    box.append(hint(t("config.combatSpeed.note")));

    box.append(divider(), label(t("config.zoom")));
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
  labelText: string,
  compact: boolean,
  onClick: () => void,
  bg = "rgba(40,34,16,0.85)",
  active = false,
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.textContent = compact ? icon : `${icon}  ${labelText}`;
  btn.title = labelText;
  Object.assign(btn.style, {
    font: compact ? "20px/1 system-ui, sans-serif" : "700 15px/1 system-ui, sans-serif",
    color: active ? "#1a1608" : "#f0e6cf",
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

function choiceRow<T extends string | number>(
  values: T[],
  active: T,
  onPick: (v: T) => void,
  fmt: (v: T) => string,
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
