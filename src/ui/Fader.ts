/** A full-screen black curtain for scene cuts and map changes. */
export class Fader {
  private readonly el: HTMLDivElement;

  constructor(opaque = false) {
    this.el = document.createElement("div");
    Object.assign(this.el.style, {
      position: "fixed",
      inset: "0",
      background: "#000",
      opacity: opaque ? "1" : "0",
      pointerEvents: "none",
      zIndex: "44",
    } satisfies Partial<CSSStyleDeclaration>);
    document.body.appendChild(this.el);
  }

  /** Fade to `to` (0 clear … 1 black) over `seconds`. */
  fade(to: number, seconds = 0.5): Promise<void> {
    this.el.style.transition = `opacity ${seconds}s ease`;
    // next frame, so the transition runs even right after creation
    return new Promise((resolve) =>
      requestAnimationFrame(() => {
        this.el.style.opacity = String(to);
        window.setTimeout(resolve, seconds * 1000 + 20);
      }),
    );
  }

  dispose(): void {
    this.el.remove();
  }
}
