import { t } from "../core/i18n";

/**
 * Full-screen loading gate shown while a mode's models download and parse: dark backdrop in the
 * main-menu style, a slim byte-weighted progress bar and a percentage. Created visible; `close()`
 * fades it out and removes it. Sits above every HUD element so nothing half-built shows through.
 */
export class LoadingOverlay {
  private root: HTMLDivElement;
  private fill: HTMLDivElement;
  private pct: HTMLDivElement;

  constructor() {
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      inset: "0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "14px",
      background: "radial-gradient(120% 120% at 50% 30%, #141d2e 0%, #0b0d12 70%)",
      color: "#cfe3ff",
      zIndex: "46",
      opacity: "1",
      transition: "opacity 0.3s ease",
    } satisfies Partial<CSSStyleDeclaration>);

    const title = document.createElement("div");
    title.textContent = t("loading.assets");
    Object.assign(title.style, {
      font: "700 clamp(16px, 4vw, 22px)/1 system-ui, sans-serif",
      letterSpacing: "0.06em",
      textShadow: "0 2px 12px rgba(60,110,200,0.45)",
    } satisfies Partial<CSSStyleDeclaration>);

    const bar = document.createElement("div");
    Object.assign(bar.style, {
      width: "min(260px, 60vw)",
      height: "6px",
      borderRadius: "3px",
      background: "rgba(120,150,200,0.18)",
      border: "1px solid rgba(120,150,200,0.35)",
      overflow: "hidden",
    } satisfies Partial<CSSStyleDeclaration>);
    this.fill = document.createElement("div");
    Object.assign(this.fill.style, {
      height: "100%",
      width: "0%",
      borderRadius: "3px",
      background: "linear-gradient(90deg, #4a7dd6, #8fc2ff)",
      transition: "width 0.15s linear",
    } satisfies Partial<CSSStyleDeclaration>);
    bar.appendChild(this.fill);

    this.pct = document.createElement("div");
    this.pct.textContent = "0%";
    Object.assign(this.pct.style, {
      font: "600 12px/1 ui-monospace, monospace",
      opacity: "0.7",
    } satisfies Partial<CSSStyleDeclaration>);

    this.root.append(title, bar, this.pct);
    document.body.appendChild(this.root);
  }

  /** Update the bar/percentage from an aggregate 0..1 fraction. */
  setProgress(fraction: number): void {
    const pct = Math.max(0, Math.min(100, Math.round(fraction * 100)));
    this.fill.style.width = `${pct}%`;
    this.pct.textContent = `${pct}%`;
  }

  /** Fade out and remove. */
  close(): void {
    this.setProgress(1);
    this.root.style.opacity = "0";
    window.setTimeout(() => this.root.remove(), 320);
  }
}
