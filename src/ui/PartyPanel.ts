import { t } from "../core/i18n";

/** One party member's row in the HUD panel. */
export interface PartyRowView {
  name: string;
  portrait?: string;
  level: number;
  hp: number;
  maxHp: number;
  /** ATB charge, 0 (just acted) → 1 (ready). */
  atb: number;
  /** The player-controlled member (highlighted, shows SP/MP/Addition detail). */
  controlled: boolean;
  // Controlled-member extras:
  sp?: number;
  maxSp?: number;
  mp?: number;
  maxMp?: number;
  exp?: number;
  nextExp?: number;
  gold?: number;
  additionName?: string;
  additionLevel?: number;
}

const MAX_ROWS = 3;

interface Gauge {
  track: HTMLDivElement;
  fill: HTMLDivElement;
  text: HTMLDivElement;
}

interface Row {
  root: HTMLDivElement;
  portrait: HTMLDivElement;
  portraitInitial: HTMLDivElement;
  lvBadge: HTMLDivElement;
  nameLabel: HTMLDivElement;
  hp: Gauge;
  atb: Gauge;
  extras: HTMLDivElement;
  sp: Gauge;
  mp: Gauge;
  line: HTMLDivElement;
  goldEl: HTMLDivElement;
  expEl: HTMLDivElement;
  addition: HTMLDivElement;
}

/**
 * Top-left party HUD (FF12-style): one row per member with portrait, HP and a prominent
 * ATB gauge that fills at the member's own rate and glows gold when ready. The controlled
 * member's row is highlighted and additionally shows SP/MP and the equipped Addition (the
 * access point to the Additions menu). Rows update in place so the gauges animate.
 */
export class PartyPanel {
  private root: HTMLDivElement;
  private rows: Row[] = [];

  constructor(onAddition?: () => void) {
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      top: "calc(env(safe-area-inset-top, 0px) + 8px)",
      left: "calc(env(safe-area-inset-left, 0px) + 8px)",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      width: "min(266px, 72vw)",
      pointerEvents: "none",
      zIndex: "13",
    } satisfies Partial<CSSStyleDeclaration>);

    for (let i = 0; i < MAX_ROWS; i++) this.rows.push(this.buildRow(onAddition));
    this.root.append(...this.rows.map((r) => r.root));
    document.body.appendChild(this.root);
  }

  private buildRow(onAddition?: () => void): Row {
    const root = document.createElement("div");
    Object.assign(root.style, {
      display: "flex",
      gap: "6px",
      padding: "4px",
      borderRadius: "7px",
      background: "rgba(8,11,17,0.72)",
      border: "1px solid rgba(120,150,200,0.22)",
    } satisfies Partial<CSSStyleDeclaration>);

    const portrait = document.createElement("div");
    Object.assign(portrait.style, {
      position: "relative",
      width: "36px",
      height: "36px",
      flex: "0 0 auto",
      borderRadius: "5px",
      border: "2px solid #caa24a",
      background: "radial-gradient(120% 120% at 50% 25%, #3a4a72 0%, #1b2236 60%, #0e1320 100%)",
      backgroundSize: "cover",
      backgroundPosition: "center top",
      overflow: "hidden",
    } satisfies Partial<CSSStyleDeclaration>);
    const portraitInitial = document.createElement("div");
    Object.assign(portraitInitial.style, {
      position: "absolute",
      inset: "0",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      font: "800 20px/1 system-ui, sans-serif",
      color: "rgba(207,227,255,0.85)",
    } satisfies Partial<CSSStyleDeclaration>);
    const lvBadge = document.createElement("div");
    Object.assign(lvBadge.style, {
      position: "absolute",
      top: "1px",
      left: "2px",
      font: "800 9px/1 system-ui, sans-serif",
      color: "#ffe08a",
      textShadow: "0 1px 2px #000",
    } satisfies Partial<CSSStyleDeclaration>);
    portrait.append(portraitInitial, lvBadge);

    const col = document.createElement("div");
    Object.assign(col.style, {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: "2px",
      flex: "1",
      minWidth: "0",
    } satisfies Partial<CSSStyleDeclaration>);

    const nameLabel = document.createElement("div");
    Object.assign(nameLabel.style, {
      font: "700 12px/1 system-ui, sans-serif",
      color: "#eaf2ff",
      textShadow: "0 1px 2px #000",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    } satisfies Partial<CSSStyleDeclaration>);

    const hp = gauge("#c0392b", "#ef6b5a", 13);
    const atb = gauge("#2f6dd0", "#56b6ff", 12);

    const extras = document.createElement("div");
    Object.assign(extras.style, {
      display: "none",
      flexDirection: "column",
      gap: "2px",
      marginTop: "1px",
    } satisfies Partial<CSSStyleDeclaration>);
    const sp = gauge("#1c3a63", "#3f6fb0", 11);
    const mp = gauge("#4a2370", "#8a4fb0", 11);
    const line = document.createElement("div");
    Object.assign(line.style, {
      display: "flex",
      justifyContent: "space-between",
      font: "800 11px/1.2 ui-monospace, monospace",
      color: "#e8c45a",
      textShadow: "0 1px 2px #000",
    } satisfies Partial<CSSStyleDeclaration>);
    const goldEl = document.createElement("div");
    const expEl = document.createElement("div");
    line.append(goldEl, expEl);

    const addition = document.createElement("div");
    Object.assign(addition.style, {
      font: "700 11px/1.2 system-ui, sans-serif",
      color: "#cfe3ff",
      background: "rgba(40,55,85,0.75)",
      border: "1px solid rgba(120,150,200,0.45)",
      borderRadius: "6px",
      padding: "3px 7px",
      textAlign: "center",
      cursor: "pointer",
      pointerEvents: "auto",
      touchAction: "manipulation",
    } satisfies Partial<CSSStyleDeclaration>);
    addition.style.setProperty("-webkit-tap-highlight-color", "transparent");
    if (onAddition) {
      addition.addEventListener("pointerup", (e) => {
        e.preventDefault();
        onAddition();
      });
    }

    extras.append(sp.track, mp.track, line, addition);
    col.append(nameLabel, hp.track, atb.track, extras);
    root.append(portrait, col);

    return { root, portrait, portraitInitial, lvBadge, nameLabel, hp, atb, extras, sp, mp, line, goldEl, expEl, addition };
  }

  set(views: PartyRowView[]): void {
    for (let i = 0; i < MAX_ROWS; i++) {
      const row = this.rows[i];
      const v = views[i];
      if (!v) {
        row.root.style.display = "none";
        continue;
      }
      row.root.style.display = "flex";
      row.root.style.border = v.controlled
        ? "1px solid #ffe08a"
        : "1px solid rgba(120,150,200,0.22)";
      row.root.style.background = v.controlled ? "rgba(26,22,8,0.78)" : "rgba(8,11,17,0.72)";

      row.lvBadge.textContent = `${v.level}`;
      row.nameLabel.textContent = v.name;
      if (v.portrait) {
        row.portrait.style.backgroundImage = `url(${v.portrait})`;
        row.portraitInitial.style.display = "none";
      } else {
        row.portrait.style.backgroundImage = "none";
        row.portraitInitial.textContent = v.name.charAt(0);
        row.portraitInitial.style.display = "flex";
      }

      fillGauge(row.hp, v.hp, v.maxHp, t("stat.hp"));
      fillAtb(row.atb, v.atb);

      if (v.controlled) {
        row.extras.style.display = "flex";
        fillGauge(row.sp, v.sp ?? 0, v.maxSp ?? 0, t("stat.sp"));
        fillGauge(row.mp, v.mp ?? 0, v.maxMp ?? 0, t("stat.mp"));
        row.goldEl.textContent = `${v.gold ?? 0} G`;
        row.expEl.textContent = `EXP ${v.exp ?? 0} / ${v.nextExp ?? 0}`;
        row.addition.textContent = `⚔ ${v.additionName ?? "—"}  Lv ${v.additionLevel ?? 1} ▸`;
      } else {
        row.extras.style.display = "none";
      }
    }
  }

  dispose(): void {
    this.root.remove();
  }
}

/** Build a labeled gauge (track + colored fill + overlaid text) of the given height. */
function gauge(dark: string, light: string, height: number): Gauge {
  const track = document.createElement("div");
  Object.assign(track.style, {
    position: "relative",
    height: `${height}px`,
    borderRadius: "4px",
    background: "rgba(0,0,0,0.55)",
    border: "1px solid rgba(0,0,0,0.6)",
    overflow: "hidden",
  } satisfies Partial<CSSStyleDeclaration>);

  const fill = document.createElement("div");
  Object.assign(fill.style, {
    position: "absolute",
    inset: "0",
    transformOrigin: "left",
    background: `linear-gradient(90deg, ${dark}, ${light})`,
    transition: "transform 0.1s linear",
  } satisfies Partial<CSSStyleDeclaration>);

  const text = document.createElement("div");
  Object.assign(text.style, {
    position: "absolute",
    inset: "0",
    display: "flex",
    alignItems: "center",
    paddingLeft: "6px",
    font: "800 10px/1 ui-monospace, monospace",
    color: "#fff",
    textShadow: "0 1px 2px rgba(0,0,0,0.95)",
  } satisfies Partial<CSSStyleDeclaration>);

  track.append(fill, text);
  return { track, fill, text };
}

function fillGauge(g: Gauge, value: number, max: number, label: string): void {
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  g.fill.style.transform = `scaleX(${ratio})`;
  g.text.textContent = `${label} ${value} / ${max}`;
}

/** The ATB gauge: cyan while charging, gold + glow when full (ready to act). */
function fillAtb(g: Gauge, atb: number): void {
  const ratio = Math.max(0, Math.min(1, atb));
  g.fill.style.transform = `scaleX(${ratio})`;
  const ready = ratio >= 1;
  g.fill.style.background = ready
    ? "linear-gradient(90deg, #d8a32a, #ffe08a)"
    : "linear-gradient(90deg, #2f6dd0, #56b6ff)";
  g.track.style.boxShadow = ready ? "0 0 6px rgba(255,216,107,0.8)" : "none";
  g.text.textContent = ready ? "ATB ●" : "ATB";
}
