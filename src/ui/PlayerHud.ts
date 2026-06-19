/**
 * Bottom-centre player HUD: a health bar and a combo readout (the in-progress
 * Addition and how many hits have chained). Plain DOM, fixed to the viewport.
 */
export class PlayerHud {
  private root: HTMLDivElement;
  private hpFill: HTMLDivElement;
  private hpText: HTMLDivElement;
  private combo: HTMLDivElement;

  constructor() {
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      left: "50%",
      bottom: "calc(env(safe-area-inset-bottom, 0px) + 18px)",
      transform: "translateX(-50%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "6px",
      pointerEvents: "none",
      zIndex: "13",
    } satisfies Partial<CSSStyleDeclaration>);

    this.combo = document.createElement("div");
    Object.assign(this.combo.style, {
      font: "800 16px/1 system-ui, sans-serif",
      color: "#ffe08a",
      textShadow: "0 2px 3px rgba(0,0,0,0.8)",
      minHeight: "16px",
      opacity: "0",
      transition: "opacity 0.15s ease",
    } satisfies Partial<CSSStyleDeclaration>);

    const bar = document.createElement("div");
    Object.assign(bar.style, {
      position: "relative",
      width: "min(340px, 70vw)",
      height: "16px",
      borderRadius: "8px",
      background: "rgba(10,14,22,0.8)",
      border: "1px solid rgba(120,150,200,0.4)",
      overflow: "hidden",
    } satisfies Partial<CSSStyleDeclaration>);

    this.hpFill = document.createElement("div");
    Object.assign(this.hpFill.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      transformOrigin: "left",
      background: "linear-gradient(90deg, #c33 0%, #e85 100%)",
      transition: "transform 0.12s ease-out",
    } satisfies Partial<CSSStyleDeclaration>);

    this.hpText = document.createElement("div");
    Object.assign(this.hpText.style, {
      position: "absolute",
      inset: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      font: "700 11px/1 ui-monospace, monospace",
      color: "#fff",
      textShadow: "0 1px 2px rgba(0,0,0,0.9)",
    } satisfies Partial<CSSStyleDeclaration>);

    bar.append(this.hpFill, this.hpText);
    this.root.append(this.combo, bar);
    document.body.appendChild(this.root);
  }

  set(hp: number, maxHp: number, comboText: string): void {
    const ratio = maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 0;
    this.hpFill.style.transform = `scaleX(${ratio})`;
    this.hpText.textContent = `${hp} / ${maxHp}`;
    this.combo.textContent = comboText;
    this.combo.style.opacity = comboText ? "1" : "0";
  }

  dispose(): void {
    this.root.remove();
  }
}
