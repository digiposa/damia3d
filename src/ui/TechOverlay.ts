/**
 * Small, always-on technical overlay pinned to the very top of the screen:
 * "fps · backend · build" on the first line (set by the Game every frame), and
 * an optional mode / combat status line the active mode pushes. Discreet and
 * non-interactive so it stays out of the way everywhere.
 */
export class TechOverlay {
  private el: HTMLDivElement;
  private head: HTMLDivElement;
  private status: HTMLDivElement;

  constructor() {
    this.el = document.createElement("div");
    Object.assign(this.el.style, {
      position: "fixed",
      top: "calc(env(safe-area-inset-top, 0px) + 4px)",
      left: "50%",
      transform: "translateX(-50%)",
      maxWidth: "92vw",
      padding: "3px 9px",
      borderRadius: "7px",
      background: "rgba(0,0,0,0.4)",
      textAlign: "center",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      pointerEvents: "none",
      zIndex: "50",
    } satisfies Partial<CSSStyleDeclaration>);

    this.head = document.createElement("div");
    Object.assign(this.head.style, {
      font: "10px/1.4 ui-monospace, monospace",
      color: "rgba(185,205,235,0.7)",
    } satisfies Partial<CSSStyleDeclaration>);

    this.status = document.createElement("div");
    Object.assign(this.status.style, {
      font: "10px/1.4 ui-monospace, monospace",
      color: "rgba(255,224,138,0.85)",
      display: "none",
    } satisfies Partial<CSSStyleDeclaration>);

    this.el.append(this.head, this.status);
    document.body.appendChild(this.el);
  }

  /** Update the always-on line (fps · backend · build). */
  setHead(fps: number, engine: string, build: string): void {
    this.head.textContent = `${fps} fps · ${engine} · ${build}`;
  }

  /** Set the optional mode/combat status line (empty hides it). */
  setStatus(text: string): void {
    this.status.textContent = text;
    this.status.style.display = text ? "block" : "none";
  }

  dispose(): void {
    this.el.remove();
  }
}
