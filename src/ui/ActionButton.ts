/**
 * Round on-screen action button, anchored bottom-right (clear of the version
 * tag). Primarily for touch, but also clickable with a mouse. Fires `onPress`
 * on pointer-up.
 */
export class ActionButton {
  private el: HTMLButtonElement;

  constructor(label: string, onPress: () => void) {
    this.el = document.createElement("button");
    this.el.textContent = label;
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
      zIndex: "16",
    } satisfies Partial<CSSStyleDeclaration>);
    this.el.style.setProperty("-webkit-tap-highlight-color", "transparent");
    this.el.addEventListener("pointerup", (e) => {
      e.preventDefault();
      onPress();
    });
    document.body.appendChild(this.el);
  }

  dispose(): void {
    this.el.remove();
  }
}
