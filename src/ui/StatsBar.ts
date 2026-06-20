/** Snapshot of the values the stats bar renders. */
export interface StatsView {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  sp: number;
  maxSp: number;
  mp: number;
  maxMp: number;
  exp: number;
  nextExp: number;
  gold: number;
  additionName: string;
  additionLevel: number;
}

interface Gauge {
  fill: HTMLDivElement;
  text: HTMLDivElement;
}

/**
 * Top-left party-leader stats bar in the LoD-inspired style: a framed portrait
 * with a level badge, HP/SP/MP gauges, and a Gold / EXP line. Plain DOM. The
 * portrait is a styled placeholder until a character art asset is dropped in
 * (set `--portrait` to a url() to use one).
 */
export class StatsBar {
  private root: HTMLDivElement;
  private portrait: HTMLDivElement;
  private lvBadge: HTMLDivElement;
  private nameLabel: HTMLDivElement;
  private hp: Gauge;
  private sp: Gauge;
  private mp: Gauge;
  private goldEl: HTMLDivElement;
  private expEl: HTMLDivElement;
  private addition: HTMLDivElement;

  constructor(onAddition?: () => void) {
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      top: "calc(env(safe-area-inset-top, 0px) + 8px)",
      left: "calc(env(safe-area-inset-left, 0px) + 8px)",
      display: "flex",
      gap: "8px",
      padding: "7px",
      borderRadius: "8px",
      background: "rgba(8,11,17,0.72)",
      border: "1px solid rgba(120,150,200,0.28)",
      pointerEvents: "none",
      zIndex: "13",
    } satisfies Partial<CSSStyleDeclaration>);

    // --- Portrait -------------------------------------------------------
    this.portrait = document.createElement("div");
    Object.assign(this.portrait.style, {
      position: "relative",
      width: "76px",
      height: "76px",
      flex: "0 0 auto",
      borderRadius: "6px",
      border: "3px solid #caa24a",
      outline: "1px solid #6b551f",
      background:
        "radial-gradient(120% 120% at 50% 25%, #3a4a72 0%, #1b2236 60%, #0e1320 100%)",
      boxShadow: "inset 0 0 10px rgba(0,0,0,0.6)",
      overflow: "hidden",
    } satisfies Partial<CSSStyleDeclaration>);

    const glyph = document.createElement("div");
    glyph.textContent = "🗡️";
    Object.assign(glyph.style, {
      position: "absolute",
      inset: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "34px",
      opacity: "0.85",
    } satisfies Partial<CSSStyleDeclaration>);
    this.portrait.appendChild(glyph);

    this.lvBadge = document.createElement("div");
    Object.assign(this.lvBadge.style, {
      position: "absolute",
      top: "2px",
      left: "3px",
      font: "800 11px/1 system-ui, sans-serif",
      color: "#ffe08a",
      textShadow: "0 1px 2px #000",
    } satisfies Partial<CSSStyleDeclaration>);

    this.nameLabel = document.createElement("div");
    Object.assign(this.nameLabel.style, {
      position: "absolute",
      bottom: "0",
      left: "0",
      right: "0",
      textAlign: "center",
      font: "700 10px/1.4 system-ui, sans-serif",
      color: "#eaf2ff",
      background: "linear-gradient(0deg, rgba(0,0,0,0.7), rgba(0,0,0,0))",
      textShadow: "0 1px 2px #000",
    } satisfies Partial<CSSStyleDeclaration>);

    this.portrait.append(this.lvBadge, this.nameLabel);

    // --- Gauges + Gold/EXP ---------------------------------------------
    const col = document.createElement("div");
    Object.assign(col.style, {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: "4px",
      width: "min(230px, 52vw)",
    } satisfies Partial<CSSStyleDeclaration>);

    this.hp = gauge("#c0392b", "#ef6b5a");
    this.sp = gauge("#1c3a63", "#3f6fb0");
    this.mp = gauge("#4a2370", "#8a4fb0");

    const line = document.createElement("div");
    Object.assign(line.style, {
      display: "flex",
      justifyContent: "space-between",
      font: "800 12px/1.2 ui-monospace, monospace",
      color: "#e8c45a",
      textShadow: "0 1px 2px #000",
      marginTop: "1px",
    } satisfies Partial<CSSStyleDeclaration>);
    this.goldEl = document.createElement("div");
    this.expEl = document.createElement("div");
    line.append(this.goldEl, this.expEl);

    // Equipped-Addition chip — the access point to the Additions menu (clickable
    // even though the rest of the bar ignores pointer events).
    this.addition = document.createElement("div");
    Object.assign(this.addition.style, {
      marginTop: "2px",
      font: "700 11px/1.2 system-ui, sans-serif",
      color: "#cfe3ff",
      background: "rgba(40,55,85,0.75)",
      border: "1px solid rgba(120,150,200,0.45)",
      borderRadius: "6px",
      padding: "5px 8px",
      textAlign: "center",
      cursor: "pointer",
      pointerEvents: "auto",
      touchAction: "manipulation",
    } satisfies Partial<CSSStyleDeclaration>);
    this.addition.style.setProperty("-webkit-tap-highlight-color", "transparent");
    if (onAddition) {
      this.addition.addEventListener("pointerup", (e) => {
        e.preventDefault();
        onAddition();
      });
    }

    col.append(
      this.hp.text.parentElement!,
      this.sp.text.parentElement!,
      this.mp.text.parentElement!,
      line,
      this.addition,
    );
    this.root.append(this.portrait, col);
    document.body.appendChild(this.root);
  }

  set(v: StatsView): void {
    this.lvBadge.textContent = `LV ${v.level}`;
    this.nameLabel.textContent = v.name;
    fill(this.hp, v.hp, v.maxHp, "HP");
    fill(this.sp, v.sp, v.maxSp, "SP");
    fill(this.mp, v.mp, v.maxMp, "MP");
    this.goldEl.textContent = `${v.gold} G`;
    this.expEl.textContent = `EXP ${v.exp} / ${v.nextExp}`;
    this.addition.textContent = `⚔ ${v.additionName}  Lv ${v.additionLevel} ▸`;
  }

  dispose(): void {
    this.root.remove();
  }
}

/** Build a labeled gauge (a track with a colored fill and overlaid text). */
function gauge(dark: string, light: string): Gauge {
  const track = document.createElement("div");
  Object.assign(track.style, {
    position: "relative",
    height: "16px",
    borderRadius: "4px",
    background: "rgba(0,0,0,0.55)",
    border: "1px solid rgba(0,0,0,0.6)",
    overflow: "hidden",
  } satisfies Partial<CSSStyleDeclaration>);

  const fillEl = document.createElement("div");
  Object.assign(fillEl.style, {
    position: "absolute",
    inset: "0",
    transformOrigin: "left",
    background: `linear-gradient(90deg, ${dark}, ${light})`,
    transition: "transform 0.12s ease-out",
  } satisfies Partial<CSSStyleDeclaration>);

  const text = document.createElement("div");
  Object.assign(text.style, {
    position: "absolute",
    inset: "0",
    display: "flex",
    alignItems: "center",
    paddingLeft: "7px",
    font: "800 11px/1 ui-monospace, monospace",
    color: "#fff",
    textShadow: "0 1px 2px rgba(0,0,0,0.95)",
    letterSpacing: "0.02em",
  } satisfies Partial<CSSStyleDeclaration>);

  track.append(fillEl, text);
  return { fill: fillEl, text };
}

function fill(g: Gauge, value: number, max: number, label: string): void {
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  g.fill.style.transform = `scaleX(${ratio})`;
  g.text.textContent = `${label} ${value} / ${max}`;
}
