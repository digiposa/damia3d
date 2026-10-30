import { scaleHud } from "../core/device";

/**
 * The story dialogue box, PS1 style: a blue panel along the top of the screen, the speaker's name
 * in yellow, the line typed out letter by letter, and the little red arrow when it is done.
 * Tap / click anywhere, or Space / Enter / E, to finish the line, then again to go on.
 */
export class DialogueBox {
  private readonly root: HTMLDivElement;
  private readonly nameEl: HTMLDivElement;
  private readonly textEl: HTMLDivElement;
  private readonly arrow: HTMLDivElement;
  private full = "";
  private shown = 0;
  private resolve?: () => void;
  private timer?: number;

  constructor() {
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      left: "50%",
      top: "calc(env(safe-area-inset-top, 0px) + 14px)",
      transform: "translateX(-50%)",
      width: "min(640px, 94vw)",
      minHeight: "86px",
      padding: "10px 16px 18px",
      boxSizing: "border-box",
      background: "linear-gradient(180deg, rgba(40,52,150,0.95), rgba(14,20,80,0.95))",
      border: "2px solid #c8ccd8",
      boxShadow: "inset 0 0 0 2px #2a2f58, 0 6px 24px rgba(0,0,0,0.6)",
      borderRadius: "4px",
      color: "#f2f2f2",
      font: "600 17px/1.35 'Courier New', ui-monospace, monospace",
      textShadow: "2px 2px 0 #000",
      zIndex: "45",
      display: "none",
      cursor: "pointer",
    } satisfies Partial<CSSStyleDeclaration>);
    this.nameEl = document.createElement("div");
    Object.assign(this.nameEl.style, { color: "#ffe14a", marginBottom: "2px" });
    this.textEl = document.createElement("div");
    this.textEl.style.whiteSpace = "pre-wrap";
    this.arrow = document.createElement("div");
    Object.assign(this.arrow.style, {
      position: "absolute",
      left: "50%",
      bottom: "4px",
      width: "0",
      height: "0",
      borderLeft: "7px solid transparent",
      borderRight: "7px solid transparent",
      borderTop: "9px solid #e0303a",
      transform: "translateX(-50%)",
      display: "none",
    } satisfies Partial<CSSStyleDeclaration>);
    this.root.append(this.nameEl, this.textEl, this.arrow);
    this.root.addEventListener("pointerup", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.advance();
    });
    this.root.addEventListener("pointerdown", (e) => e.stopPropagation());
    scaleHud(this.root);
    document.body.appendChild(this.root);
  }

  get isOpen(): boolean {
    return this.root.style.display !== "none";
  }

  /** Show one line; resolves when the player dismisses it. */
  say(name: string, text: string): Promise<void> {
    this.full = text;
    this.shown = 0;
    this.nameEl.textContent = name;
    this.nameEl.style.display = name ? "block" : "none";
    this.textEl.textContent = "";
    this.arrow.style.display = "none";
    this.root.style.display = "block";
    window.clearInterval(this.timer);
    this.timer = window.setInterval(() => {
      this.shown = Math.min(this.full.length, this.shown + 2);
      this.textEl.textContent = this.full.slice(0, this.shown);
      if (this.shown >= this.full.length) this.finishTyping();
    }, 30);
    return new Promise((r) => (this.resolve = r));
  }

  private finishTyping(): void {
    window.clearInterval(this.timer);
    this.shown = this.full.length;
    this.textEl.textContent = this.full;
    this.arrow.style.display = "block";
  }

  /** First press completes the line; the next one closes it. */
  advance(): void {
    if (!this.isOpen) return;
    if (this.shown < this.full.length) {
      this.finishTyping();
      return;
    }
    this.root.style.display = "none";
    const r = this.resolve;
    this.resolve = undefined;
    r?.();
  }

  dispose(): void {
    window.clearInterval(this.timer);
    this.root.remove();
  }
}
