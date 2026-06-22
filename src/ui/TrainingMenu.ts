import { hasTouch } from "../core/device";
import { t } from "../core/i18n";
import { type Bearer, selectableBearers } from "../data/bearers";
import { dragoonClass } from "../data/dragoonClasses";

/** Live state the menu reads to render the current selection. */
export interface TrainingState {
  bearerId: string;
  level: number;
  maxLevel: number;
}

export interface TrainingCallbacks {
  state: () => TrainingState;
  onSelectBearer: (bearer: Bearer) => void;
  onSetLevel: (level: number) => void;
  onSpawnDummy: () => void;
  onSpawnKnight: () => void;
  onSpawnCommander: () => void;
  onResume: () => void;
}

type Tab = "character" | "level" | "spawn";

const TABS: { id: Tab; labelKey: string; icon: string }[] = [
  { id: "character", labelKey: "char.title", icon: "👤" },
  { id: "level", labelKey: "debug.level", icon: "📈" },
  { id: "spawn", labelKey: "debug.spawn", icon: "👾" },
];

/**
 * Training-only debug menu (a pausing overlay) in the System-menu style: a left
 * tab rail (Character / Level / Spawn) and a single content panel — no long
 * scroll. Merges character switching, instant level changes and enemy spawning.
 * Rebuilt on each render so it follows the current language. Selecting a
 * character or Resume closes it; level tweaks and spawns keep it open.
 */
export class TrainingMenu {
  private root: HTMLDivElement;
  private nav: HTMLDivElement;
  private content: HTMLDivElement;
  private tab: Tab = "character";
  private compact = hasTouch();

  constructor(private cb: TrainingCallbacks) {
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
      width: "min(620px, 94vw)",
      height: "min(460px, 84vh)",
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
      padding: "14px 16px",
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
    this.render();
    this.root.style.display = "flex";
  }

  hide(): void {
    this.root.style.display = "none";
  }

  dispose(): void {
    this.root.remove();
  }

  // --- Rendering ------------------------------------------------------------

  private render(): void {
    this.renderNav();
    this.content.replaceChildren(
      this.tab === "character"
        ? this.renderCharacter()
        : this.tab === "level"
          ? this.renderLevel()
          : this.renderSpawn(),
    );
  }

  private renderNav(): void {
    const items: HTMLElement[] = TABS.map((tb) =>
      navButton(
        tb.icon,
        t(tb.labelKey),
        this.compact,
        () => {
          this.tab = tb.id;
          this.render();
        },
        tb.id === this.tab ? "rgba(200,162,74,0.92)" : undefined,
        tb.id === this.tab,
      ),
    );
    const spacer = document.createElement("div");
    spacer.style.flex = "1";
    items.push(
      spacer,
      navButton("▶", t("common.resume"), this.compact, () => this.cb.onResume(), "#2f6b3e"),
    );
    this.nav.replaceChildren(...items);
  }

  private renderCharacter(): HTMLElement {
    const box = section(t("char.title"));
    const grid = document.createElement("div");
    Object.assign(grid.style, {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "8px",
    } satisfies Partial<CSSStyleDeclaration>);
    const s = this.cb.state();
    for (const b of selectableBearers()) grid.appendChild(this.bearerCard(b, b.id === s.bearerId));
    box.appendChild(grid);
    return box;
  }

  private bearerCard(bearer: Bearer, current: boolean): HTMLElement {
    const cls = dragoonClass(bearer.classId);
    const el = document.createElement("button");
    Object.assign(el.style, {
      display: "flex",
      alignItems: "center",
      gap: "9px",
      textAlign: "left",
      font: "700 15px/1.2 system-ui, sans-serif",
      color: current ? "#1a1608" : "#f0e6cf",
      background: current ? "rgba(200,162,74,0.9)" : "rgba(40,34,16,0.8)",
      border: `1px solid ${current ? "#ffe08a" : "#6b551f"}`,
      borderRadius: "9px",
      padding: "10px 12px",
      cursor: "pointer",
      touchAction: "manipulation",
    } satisfies Partial<CSSStyleDeclaration>);
    const [r, g, b] = bearer.color;
    el.innerHTML =
      `<span style="flex:0 0 auto;width:14px;height:14px;border-radius:50%;` +
      `background:rgb(${(r * 255) | 0},${(g * 255) | 0},${(b * 255) | 0});` +
      `border:1px solid rgba(0,0,0,0.5);box-shadow:0 0 4px rgba(0,0,0,0.4)"></span>` +
      `<span style="display:flex;flex-direction:column;gap:2px;min-width:0">` +
      `<span>${bearer.name}${current ? "  ✓" : ""}</span>` +
      `<span style="font:400 11px/1.3 ui-monospace,monospace;opacity:0.8">${cls?.element ?? ""}${bearer.storyPlayable ? "" : " · skin"}</span>` +
      `</span>`;
    tap(el, () => this.cb.onSelectBearer(bearer));
    return el;
  }

  private renderLevel(): HTMLElement {
    const box = section(t("debug.level"));
    const s = this.cb.state();

    const value = document.createElement("div");
    Object.assign(value.style, {
      textAlign: "center",
      font: "800 34px/1 ui-monospace, monospace",
      color: "#ffe08a",
      textShadow: "0 1px 2px #000",
      margin: "8px 0 14px",
    } satisfies Partial<CSSStyleDeclaration>);
    value.textContent = `LV ${s.level}`;
    const maxNote = document.createElement("span");
    maxNote.textContent = ` / ${s.maxLevel}`;
    Object.assign(maxNote.style, { font: "700 16px/1 ui-monospace, monospace", opacity: "0.6" });
    value.appendChild(maxNote);

    const setTo = (lv: number): void => {
      const cur = this.cb.state();
      this.cb.onSetLevel(Math.min(Math.max(lv, 1), cur.maxLevel));
      this.render(); // keep menu open, refresh readout
    };
    const step = (d: number): void => setTo(this.cb.state().level + d);

    const steps = document.createElement("div");
    Object.assign(steps.style, { display: "flex", gap: "6px", marginBottom: "10px" } satisfies Partial<CSSStyleDeclaration>);
    steps.append(
      stepBtn("−10", () => step(-10)),
      stepBtn("−1", () => step(-1)),
      stepBtn("+1", () => step(1)),
      stepBtn("+10", () => step(10)),
    );

    box.append(value, steps, label(t("debug.preset")));

    const presets = document.createElement("div");
    Object.assign(presets.style, { display: "flex", gap: "6px" } satisfies Partial<CSSStyleDeclaration>);
    for (const lv of [1, 20, 40, s.maxLevel]) presets.appendChild(stepBtn(`${lv}`, () => setTo(lv)));
    box.append(presets);
    return box;
  }

  private renderSpawn(): HTMLElement {
    const box = section(t("debug.spawn"));
    box.append(
      bigButton(t("spawn.dummy"), "rgba(90,72,40,0.92)", this.cb.onSpawnDummy),
      bigButton(t("spawn.knight"), "rgba(40,70,110,0.9)", this.cb.onSpawnKnight),
      bigButton(t("spawn.commander"), "rgba(90,55,120,0.9)", this.cb.onSpawnCommander),
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
  tap(btn, onClick);
  return btn;
}

function section(titleText: string): HTMLDivElement {
  const box = document.createElement("div");
  const h = document.createElement("div");
  h.textContent = titleText;
  Object.assign(h.style, {
    font: "800 18px/1 system-ui, sans-serif",
    color: "#ffe08a",
    marginBottom: "12px",
    borderBottom: "1px solid #6b551f",
    paddingBottom: "8px",
  } satisfies Partial<CSSStyleDeclaration>);
  box.appendChild(h);
  return box;
}

function label(text: string): HTMLDivElement {
  const el = document.createElement("div");
  el.textContent = text;
  Object.assign(el.style, {
    font: "700 11px/1 ui-monospace, monospace",
    letterSpacing: "0.06em",
    color: "#8fb0d8",
    margin: "4px 0",
  } satisfies Partial<CSSStyleDeclaration>);
  return el;
}

function bigButton(labelText: string, bg: string, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.textContent = labelText;
  Object.assign(btn.style, {
    display: "block",
    font: "700 15px/1 system-ui, sans-serif",
    color: "#f0e6cf",
    background: bg,
    border: "1px solid #6b551f",
    borderRadius: "10px",
    padding: "14px 16px",
    width: "100%",
    marginBottom: "9px",
    cursor: "pointer",
    touchAction: "manipulation",
  } satisfies Partial<CSSStyleDeclaration>);
  tap(btn, onClick);
  return btn;
}

function stepBtn(labelText: string, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.textContent = labelText;
  Object.assign(btn.style, {
    flex: "1",
    font: "800 15px/1 ui-monospace, monospace",
    color: "#f0e6cf",
    background: "rgba(40,34,16,0.85)",
    border: "1px solid #6b551f",
    borderRadius: "9px",
    padding: "12px 0",
    cursor: "pointer",
    touchAction: "manipulation",
  } satisfies Partial<CSSStyleDeclaration>);
  tap(btn, onClick);
  return btn;
}

function tap(el: HTMLElement, onClick: () => void): void {
  el.style.setProperty("-webkit-tap-highlight-color", "transparent");
  el.addEventListener("pointerup", (e) => {
    e.preventDefault();
    onClick();
  });
}
