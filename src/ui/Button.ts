import { scaleHud } from "../core/device";

export interface ButtonOptions {
  label: string;
  onClick: () => void;
  /** Extra inline styles merged over the default pill look. */
  style?: Partial<CSSStyleDeclaration>;
}

/**
 * Reusable pill-style HUD button. Fixed-positioned via `style` overrides, uses
 * pointer-up so touch latency stays low. Append-on-construct, `dispose()` to
 * remove.
 */
export class Button {
  readonly el: HTMLButtonElement;

  constructor(opts: ButtonOptions) {
    this.el = document.createElement("button");
    this.el.textContent = opts.label;
    Object.assign(this.el.style, {
      position: "fixed",
      font: "600 14px/1 system-ui, sans-serif",
      color: "#cfe3ff",
      background: "rgba(10,14,22,0.78)",
      border: "1px solid rgba(120,150,200,0.4)",
      borderRadius: "10px",
      padding: "12px 16px",
      cursor: "pointer",
      touchAction: "manipulation",
      zIndex: "16",
    } satisfies Partial<CSSStyleDeclaration>);
    Object.assign(this.el.style, opts.style ?? {});
    this.el.style.setProperty("-webkit-tap-highlight-color", "transparent");
    this.el.addEventListener("pointerup", (e) => {
      e.preventDefault();
      opts.onClick();
    });
    scaleHud(this.el); // desktop: enlarge the phone-tuned HUD (scales size + corner offset)
    document.body.appendChild(this.el);
  }

  setVisible(visible: boolean): void {
    this.el.style.display = visible ? "block" : "none";
  }

  setLabel(label: string): void {
    this.el.textContent = label;
  }

  dispose(): void {
    this.el.remove();
  }
}
