import { t } from "../core/i18n";
import { scaleHud } from "../core/device";

/** One party member's row in the HUD panel. */
export interface PartyRowView {
  name: string;
  portrait?: string;
  /** Alternate portrait used only while {@link transformed} (Dragoon form); falls back to {@link portrait}. */
  dragoonPortrait?: string;
  level: number;
  hp: number;
  maxHp: number;
  /** ATB charge, 0 (just acted) → 1 (ready). */
  atb: number;
  /** The player-controlled member (highlighted, shows SP/MP detail). */
  controlled: boolean;
  /** In Dragoon form (controlled row then also shows the MP gauge). */
  transformed?: boolean;
  // Controlled-member extras:
  /** Whether the Dragoon Spirit is unlocked — no SP/MP gauges until it is. */
  dragoonUnlocked?: boolean;
  sp?: number;
  maxSp?: number;
  /** Dragoon Level (D'Lv) — shown on the SP gauge. */
  dragoonLevel?: number;
  mp?: number;
  maxMp?: number;
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
  hp: Gauge;
  atb: Gauge;
  extras: HTMLDivElement;
  sp: Gauge;
  mp: Gauge;
}

/**
 * Compact top-left party HUD (FF12-style): one row per member with a mini portrait, an HP
 * gauge (the member's name is overlaid in it) and a prominent ATB gauge that fills at the
 * member's own rate and glows gold when ready. The controlled member's row is highlighted
 * and adds a thin SP gauge (and an MP gauge while transformed). EXP/Gold and the equipped
 * Addition live in the System menu (gear), keeping the in-combat footprint small. Rows
 * update in place so the gauges animate.
 */
export class PartyPanel {
  private root: HTMLDivElement;
  private rows: Row[] = [];

  /** @param onSelect tap a member's row to take control of it. */
  constructor(private onSelect?: (index: number) => void) {
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      top: "calc(env(safe-area-inset-top, 0px) + 8px)",
      left: "calc(env(safe-area-inset-left, 0px) + 8px)",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      width: "min(240px, 66vw)",
      pointerEvents: "none",
      zIndex: "13",
    } satisfies Partial<CSSStyleDeclaration>);

    for (let i = 0; i < MAX_ROWS; i++) this.rows.push(this.buildRow(i));
    this.root.append(...this.rows.map((r) => r.root));
    scaleHud(this.root); // desktop: enlarge the phone-tuned HUD
    document.body.appendChild(this.root);
  }

  private buildRow(index: number): Row {
    const root = document.createElement("div");
    Object.assign(root.style, {
      display: "flex",
      gap: "6px",
      padding: "4px",
      borderRadius: "7px",
      background: "rgba(8,11,17,0.72)",
      border: "1px solid rgba(120,150,200,0.22)",
    } satisfies Partial<CSSStyleDeclaration>);
    // Tapping a row takes control of that member.
    if (this.onSelect) {
      root.style.pointerEvents = "auto";
      root.style.cursor = "pointer";
      root.style.setProperty("-webkit-tap-highlight-color", "transparent");
      root.addEventListener("pointerup", (e) => {
        e.preventDefault();
        this.onSelect!(index);
      });
    }

    const portrait = document.createElement("div");
    Object.assign(portrait.style, {
      position: "relative",
      width: "28px",
      height: "28px",
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
      font: "800 14px/1 system-ui, sans-serif",
      color: "rgba(207,227,255,0.85)",
    } satisfies Partial<CSSStyleDeclaration>);
    const lvBadge = document.createElement("div");
    Object.assign(lvBadge.style, {
      position: "absolute",
      bottom: "0",
      right: "1px",
      font: "800 8px/1 system-ui, sans-serif",
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

    const hp = gauge("#c0392b", "#ef6b5a", 14);
    const atb = gauge("#2f6dd0", "#56b6ff", 11);

    const extras = document.createElement("div");
    Object.assign(extras.style, {
      display: "none",
      flexDirection: "column",
      gap: "2px",
    } satisfies Partial<CSSStyleDeclaration>);
    const sp = gauge("#1c3a63", "#3f6fb0", 9);
    const mp = gauge("#4a2370", "#8a4fb0", 9);
    extras.append(sp.track, mp.track);

    col.append(hp.track, atb.track, extras);
    root.append(portrait, col);

    return { root, portrait, portraitInitial, lvBadge, hp, atb, extras, sp, mp };
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
      row.root.style.border = v.controlled ? "1px solid #ffe08a" : "1px solid rgba(120,150,200,0.22)";
      row.root.style.background = v.controlled ? "rgba(26,22,8,0.78)" : "rgba(8,11,17,0.72)";

      row.lvBadge.textContent = `${v.level}`;
      // In Dragoon form the HUD swaps to the Dragoon portrait if the bearer has one
      // (menus keep the human portrait); otherwise the normal portrait is used.
      const portrait = (v.transformed && v.dragoonPortrait) || v.portrait;
      if (portrait) {
        row.portrait.style.backgroundImage = `url(${portrait})`;
        row.portraitInitial.style.display = "none";
      } else {
        row.portrait.style.backgroundImage = "none";
        row.portraitInitial.textContent = v.name.charAt(0);
        row.portraitInitial.style.display = "flex";
      }

      // The member's name is overlaid in the HP gauge to save a whole line.
      fillGauge(row.hp, v.hp, v.maxHp, v.name);
      fillAtb(row.atb, v.atb);

      // SP/MP gauges only for the controlled member, and only once the Dragoon is unlocked.
      if (v.controlled && v.dragoonUnlocked) {
        row.extras.style.display = "flex";
        // SP gauge: segmented into 100-SP blocks (each = one Dragoon turn); label carries D'Lv.
        fillSpGauge(row.sp, v.sp ?? 0, v.maxSp ?? 0, `D'${v.dragoonLevel ?? 1} · ${t("stat.sp")}`);
        // MP shown alongside SP once the Dragoon is unlocked (it powers Dragoon magic).
        row.mp.track.style.display = "block";
        fillGauge(row.mp, v.mp ?? 0, v.maxMp ?? 0, t("stat.mp"));
      } else {
        row.extras.style.display = "none";
      }
    }
  }

  dispose(): void {
    this.root.remove();
  }
}

/** Build a gauge (track + colored fill + overlaid text) of the given height. */
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
    justifyContent: "space-between",
    padding: "0 6px",
    font: "800 10px/1 ui-monospace, monospace",
    color: "#fff",
    textShadow: "0 1px 2px rgba(0,0,0,0.95)",
  } satisfies Partial<CSSStyleDeclaration>);

  track.append(fill, text);
  return { track, fill, text };
}

/** Fill a gauge and label it "<label>   <value>/<max>" (label left, value right). */
function fillGauge(g: Gauge, value: number, max: number, label: string): void {
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  g.fill.style.transform = `scaleX(${ratio})`;
  g.text.innerHTML = `<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${label}</span><span>${value}/${max}</span>`;
}

/**
 * The SP gauge, segmented into 100-SP blocks (each block = one Dragoon turn). Draws a divider
 * at every 100 boundary up to maxSp, and lights the track gold once at least one block is full
 * (transform becomes available). Dividers are rebuilt only when the block count changes.
 */
function fillSpGauge(g: Gauge, value: number, max: number, label: string): void {
  fillGauge(g, value, max, label);
  const ready = value >= 100;
  g.fill.style.background = ready
    ? "linear-gradient(90deg, #6a4bb0, #ffd86b)"
    : "linear-gradient(90deg, #3a2f73, #6f7fd0)";
  g.track.style.boxShadow = ready ? "0 0 5px rgba(255,216,107,0.55)" : "none";

  const segments = Math.max(1, Math.round(max / 100));
  if (g.track.dataset.segs !== String(segments)) {
    g.track.dataset.segs = String(segments);
    g.track.querySelectorAll(".sp-seg").forEach((e) => e.remove());
    for (let k = 1; k < segments; k++) {
      const d = document.createElement("div");
      d.className = "sp-seg";
      Object.assign(d.style, {
        position: "absolute",
        top: "0",
        bottom: "0",
        left: `${(k / segments) * 100}%`,
        width: "1px",
        background: "rgba(0,0,0,0.7)",
        boxShadow: "1px 0 0 rgba(255,255,255,0.18)",
        pointerEvents: "none",
      } satisfies Partial<CSSStyleDeclaration>);
      g.track.insertBefore(d, g.text);
    }
  }
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
  g.text.innerHTML = `<span>ATB</span><span>${ready ? "●" : ""}</span>`;
}
