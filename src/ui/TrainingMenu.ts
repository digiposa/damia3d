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

/**
 * Training-only debug menu (a pausing overlay) merging character switching,
 * instant level changes, and enemy spawning. Stays open after spawns and level
 * tweaks so several can be made; selecting a character or Resume closes it.
 * Rebuilt on each open so it follows the current language.
 */
export class TrainingMenu {
  private root: HTMLDivElement;
  private body: HTMLDivElement;
  private levelValue?: HTMLDivElement;

  constructor(private cb: TrainingCallbacks) {
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      inset: "0",
      display: "none",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      boxSizing: "border-box",
      background: "radial-gradient(120% 120% at 50% 30%, #141d2ecc 0%, #0b0d12f2 70%)",
      color: "#cfe3ff",
      zIndex: "40",
    } satisfies Partial<CSSStyleDeclaration>);

    this.body = document.createElement("div");
    Object.assign(this.body.style, {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      width: "min(380px, 92vw)",
      maxHeight: "88vh",
      overflowY: "auto",
    } satisfies Partial<CSSStyleDeclaration>);

    this.root.appendChild(this.body);
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
    const s = this.cb.state();
    this.body.replaceChildren(
      title(t("debug.title")),
      heading(t("char.title")),
      ...selectableBearers().map((b) => this.bearerRow(b, b.id === s.bearerId)),
      heading(t("debug.level")),
      this.levelRow(s),
      heading(t("debug.spawn")),
      bigButton(t("spawn.dummy"), "rgba(90,72,40,0.92)", this.cb.onSpawnDummy),
      bigButton(t("spawn.knight"), "rgba(40,70,110,0.9)", this.cb.onSpawnKnight),
      bigButton(t("spawn.commander"), "rgba(90,55,120,0.9)", this.cb.onSpawnCommander),
      bigButton(`▶  ${t("common.resume")}`, "rgba(40,90,60,0.9)", this.cb.onResume),
    );
  }

  private bearerRow(bearer: Bearer, current: boolean): HTMLElement {
    const cls = dragoonClass(bearer.classId);
    const el = document.createElement("button");
    Object.assign(el.style, {
      display: "flex",
      flexDirection: "column",
      gap: "2px",
      width: "100%",
      textAlign: "left",
      font: "700 15px/1.2 system-ui, sans-serif",
      color: "#eaf2ff",
      background: current ? "rgba(70,110,180,0.95)" : "rgba(30,42,66,0.85)",
      border: `1px solid ${current ? "rgba(170,200,255,0.85)" : "rgba(120,150,200,0.4)"}`,
      borderRadius: "10px",
      padding: "10px 14px",
      cursor: "pointer",
      touchAction: "manipulation",
    } satisfies Partial<CSSStyleDeclaration>);
    el.innerHTML =
      `<span>${bearer.name}${current ? "  ✓" : ""}</span>` +
      `<span style="font:400 12px/1.3 ui-monospace,monospace;opacity:0.8">${cls?.dragoonName ?? ""} · ${cls?.element ?? ""}${bearer.storyPlayable ? "" : " · skin"}</span>`;
    tap(el, () => this.cb.onSelectBearer(bearer));
    return el;
  }

  private levelRow(s: TrainingState): HTMLElement {
    const row = document.createElement("div");
    Object.assign(row.style, {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      width: "100%",
    } satisfies Partial<CSSStyleDeclaration>);

    const value = document.createElement("div");
    this.levelValue = value;
    Object.assign(value.style, {
      flex: "1",
      textAlign: "center",
      font: "800 18px/1 ui-monospace, monospace",
      color: "#ffe08a",
    } satisfies Partial<CSSStyleDeclaration>);
    value.textContent = `LV ${s.level} / ${s.maxLevel}`;

    const step = (delta: number): void => {
      const cur = this.cb.state();
      const next = Math.min(Math.max(cur.level + delta, 1), cur.maxLevel);
      this.cb.onSetLevel(next);
      this.refreshLevel();
    };
    const setTo = (lv: number): void => {
      const cur = this.cb.state();
      this.cb.onSetLevel(Math.min(Math.max(lv, 1), cur.maxLevel));
      this.refreshLevel();
    };

    row.append(
      stepBtn("−10", () => step(-10)),
      stepBtn("−1", () => step(-1)),
      value,
      stepBtn("+1", () => step(1)),
      stepBtn("+10", () => step(10)),
    );

    const presets = document.createElement("div");
    Object.assign(presets.style, {
      display: "flex",
      gap: "6px",
      width: "100%",
    } satisfies Partial<CSSStyleDeclaration>);
    for (const lv of [1, 20, 40, s.maxLevel]) {
      presets.appendChild(stepBtn(`${lv}`, () => setTo(lv), true));
    }

    const wrap = document.createElement("div");
    Object.assign(wrap.style, {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      width: "100%",
    } satisfies Partial<CSSStyleDeclaration>);
    wrap.append(row, presets);
    return wrap;
  }

  /** Update only the level readout (level changes keep the menu open). */
  private refreshLevel(): void {
    if (this.levelValue) {
      const s = this.cb.state();
      this.levelValue.textContent = `LV ${s.level} / ${s.maxLevel}`;
    }
  }
}

// --- DOM helpers ------------------------------------------------------------

function title(text: string): HTMLElement {
  const el = document.createElement("div");
  el.textContent = text;
  Object.assign(el.style, {
    font: "800 clamp(22px, 6vw, 34px)/1 system-ui, sans-serif",
    textAlign: "center",
    marginBottom: "2px",
  } satisfies Partial<CSSStyleDeclaration>);
  return el;
}

function heading(text: string): HTMLElement {
  const el = document.createElement("div");
  el.textContent = text;
  Object.assign(el.style, {
    font: "700 12px/1 ui-monospace, monospace",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#8fb0d8",
    marginTop: "6px",
  } satisfies Partial<CSSStyleDeclaration>);
  return el;
}

function bigButton(label: string, bg: string, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.textContent = label;
  Object.assign(btn.style, {
    font: "700 15px/1 system-ui, sans-serif",
    color: "#eaf2ff",
    background: bg,
    border: "1px solid rgba(120,150,200,0.4)",
    borderRadius: "11px",
    padding: "13px 18px",
    width: "100%",
    cursor: "pointer",
    touchAction: "manipulation",
  } satisfies Partial<CSSStyleDeclaration>);
  tap(btn, onClick);
  return btn;
}

function stepBtn(label: string, onClick: () => void, grow = false): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.textContent = label;
  Object.assign(btn.style, {
    flex: grow ? "1" : "0 0 auto",
    minWidth: "44px",
    font: "800 14px/1 ui-monospace, monospace",
    color: "#eaf2ff",
    background: "rgba(40,55,85,0.9)",
    border: "1px solid rgba(120,150,200,0.45)",
    borderRadius: "9px",
    padding: "10px 10px",
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
