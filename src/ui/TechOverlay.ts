/**
 * Tiny build tag pinned to the top-left corner: just the deployed commit hash,
 * so the running version is always identifiable. Discreet and non-interactive.
 */
export class TechOverlay {
  private el: HTMLDivElement;

  constructor(build: string) {
    this.el = document.createElement("div");
    this.el.textContent = `build ${build}`;
    Object.assign(this.el.style, {
      position: "fixed",
      top: "calc(env(safe-area-inset-top, 0px) + 4px)",
      left: "calc(env(safe-area-inset-left, 0px) + 6px)",
      font: "10px/1.4 ui-monospace, monospace",
      color: "rgba(185,205,235,0.6)",
      pointerEvents: "none",
      userSelect: "none",
      zIndex: "50",
    } satisfies Partial<CSSStyleDeclaration>);
    document.body.appendChild(this.el);
  }

  dispose(): void {
    this.el.remove();
  }
}
