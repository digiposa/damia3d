import { t } from "../core/i18n";
import { ITEM_MULTIPLIER_MIN, ITEM_MULTIPLIER_MAX } from "../data/items";

/**
 * The attack-item mashing QTE (Legend of Dragoon): when a "Multi" item is thrown, time slows and
 * this meter appears. Every X press (desktop) or screen tap (mobile) raises a damage multiplier
 * from {@link ITEM_MULTIPLIER_MIN}% toward {@link ITEM_MULTIPLIER_MAX}%. The whole overlay is one
 * big tap target so mobile players can mash anywhere; `onTap` fires on each press.
 *
 * Purely presentational — TrainingMode owns the timer, the percentage and when to resolve damage.
 */
export class MashMeter {
  private root: HTMLDivElement;
  private fill: HTMLDivElement;
  private value: HTMLDivElement;
  private prompt: HTMLDivElement;
  private title: HTMLDivElement;
  private open = false;
  private lastPct = -1;

  constructor(private onTap: () => void) {
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      inset: "0",
      display: "none",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingBottom: "22vh",
      gap: "10px",
      zIndex: "34",
      touchAction: "manipulation",
      userSelect: "none",
      cursor: "pointer",
    } satisfies Partial<CSSStyleDeclaration>);
    // Whole screen is a tap target so mobile players can mash anywhere.
    this.root.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      if (this.open) this.onTap();
    });

    this.title = document.createElement("div");
    Object.assign(this.title.style, {
      font: "800 18px/1 system-ui, sans-serif",
      color: "#eafaef",
      textShadow: "0 2px 6px rgba(0,0,0,0.8)",
    } satisfies Partial<CSSStyleDeclaration>);

    this.value = document.createElement("div");
    Object.assign(this.value.style, {
      font: "900 52px/1 ui-monospace, monospace",
      color: "#ffe27a",
      textShadow: "0 3px 10px rgba(0,0,0,0.85)",
    } satisfies Partial<CSSStyleDeclaration>);

    const track = document.createElement("div");
    Object.assign(track.style, {
      width: "min(72vw, 360px)",
      height: "18px",
      borderRadius: "9px",
      background: "rgba(0,0,0,0.55)",
      border: "1px solid rgba(255,255,255,0.25)",
      overflow: "hidden",
    } satisfies Partial<CSSStyleDeclaration>);
    this.fill = document.createElement("div");
    Object.assign(this.fill.style, {
      height: "100%",
      width: "0%",
      borderRadius: "9px",
      background: "linear-gradient(90deg, #ff9a3c, #ffe27a)",
      transition: "width 60ms linear",
    } satisfies Partial<CSSStyleDeclaration>);
    track.appendChild(this.fill);

    this.prompt = document.createElement("div");
    Object.assign(this.prompt.style, {
      font: "800 20px/1 system-ui, sans-serif",
      color: "#9ad0ff",
      textShadow: "0 2px 6px rgba(0,0,0,0.8)",
      animation: "none",
    } satisfies Partial<CSSStyleDeclaration>);

    this.root.append(this.title, this.value, track, this.prompt);
    document.body.appendChild(this.root);
  }

  get isOpen(): boolean {
    return this.open;
  }

  /** Show the meter for a thrown item. `isTouch` picks the "tap" vs "mash X" prompt. */
  show(itemName: string, color: string, isTouch: boolean): void {
    this.title.textContent = itemName;
    this.title.style.color = color;
    this.prompt.textContent = isTouch ? t("combat.mashTap") : t("combat.mash");
    this.lastPct = -1;
    this.setPct(ITEM_MULTIPLIER_MIN);
    this.root.style.display = "flex";
    this.open = true;
  }

  /** Update the gauge (idempotent — no DOM writes when the integer % is unchanged). */
  setPct(pct: number): void {
    const p = Math.round(pct);
    if (p === this.lastPct) return;
    this.lastPct = p;
    this.value.textContent = `${p}%`;
    const span = ITEM_MULTIPLIER_MAX - ITEM_MULTIPLIER_MIN;
    const frac = span > 0 ? (p - ITEM_MULTIPLIER_MIN) / span : 0;
    this.fill.style.width = `${Math.max(0, Math.min(1, frac)) * 100}%`;
    if (p >= ITEM_MULTIPLIER_MAX) this.value.style.color = "#ff6a6a"; // maxed out
    else this.value.style.color = "#ffe27a";
  }

  close(): void {
    this.root.style.display = "none";
    this.open = false;
  }

  dispose(): void {
    this.root.remove();
  }
}
