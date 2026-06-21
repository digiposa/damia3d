/**
 * Round on-screen action button, anchored bottom-right by default (clear of the
 * build tag). Primarily for touch, but also clickable with a mouse. Fires
 * `onPress` on pointer-up. {@link setCooldown} shows a depleting radial overlay
 * and a seconds countdown so cooldowns (e.g. Defense) are readable.
 */
export class ActionButton {
  private el: HTMLButtonElement;
  private label: HTMLSpanElement;
  private overlay: HTMLDivElement;
  private count: HTMLSpanElement;

  constructor(label: string, onPress: () => void, style?: Partial<CSSStyleDeclaration>) {
    this.el = document.createElement("button");
    Object.assign(this.el.style, {
      position: "fixed",
      right: "calc(env(safe-area-inset-right, 0px) + 26px)",
      bottom: "calc(env(safe-area-inset-bottom, 0px) + 40px)",
      width: "84px",
      height: "84px",
      borderRadius: "50%",
      font: "700 16px/1 system-ui, sans-serif",
      color: "#ffe6e6",
      background: "rgba(150,40,50,0.8)",
      border: "1px solid rgba(255,160,160,0.6)",
      boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
      cursor: "pointer",
      touchAction: "manipulation",
      overflow: "hidden",
      zIndex: "16",
    } satisfies Partial<CSSStyleDeclaration>);
    Object.assign(this.el.style, style ?? {});
    this.el.style.setProperty("-webkit-tap-highlight-color", "transparent");

    this.label = document.createElement("span");
    this.label.textContent = label;
    Object.assign(this.label.style, {
      position: "relative",
      zIndex: "1",
    } satisfies Partial<CSSStyleDeclaration>);

    // Depleting radial overlay (a dark wedge that shrinks as the cooldown ends).
    this.overlay = document.createElement("div");
    Object.assign(this.overlay.style, {
      position: "absolute",
      inset: "0",
      borderRadius: "50%",
      display: "none",
      pointerEvents: "none",
    } satisfies Partial<CSSStyleDeclaration>);

    this.count = document.createElement("span");
    Object.assign(this.count.style, {
      position: "absolute",
      inset: "0",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      font: "800 26px/1 system-ui, sans-serif",
      color: "#fff",
      textShadow: "0 1px 3px rgba(0,0,0,0.9)",
      zIndex: "2",
      pointerEvents: "none",
    } satisfies Partial<CSSStyleDeclaration>);

    this.el.append(this.overlay, this.label, this.count);
    this.el.addEventListener("pointerup", (e) => {
      e.preventDefault();
      onPress();
    });
    document.body.appendChild(this.el);
  }

  /**
   * Show the cooldown state: `remaining` seconds and `fraction` of the cooldown
   * still to go (1 → 0). Pass fraction ≤ 0 when ready.
   */
  setCooldown(remaining: number, fraction: number): void {
    if (fraction <= 0) {
      this.overlay.style.display = "none";
      this.count.style.display = "none";
      this.el.style.opacity = "1";
      return;
    }
    const deg = Math.max(0, Math.min(1, fraction)) * 360;
    this.overlay.style.display = "block";
    this.overlay.style.background = `conic-gradient(rgba(0,0,0,0.55) ${deg}deg, rgba(0,0,0,0) 0deg)`;
    this.count.style.display = "flex";
    this.count.textContent = String(Math.ceil(remaining));
    this.el.style.opacity = "0.85";
  }

  dispose(): void {
    this.el.remove();
  }
}
