import { hasTouch } from "../core/device";

/**
 * PS1 Addition read-out, along the bottom of the screen: the SP tally grows blow by blow
 * ("8SP + 2SP + 2SP…", the newest term brightest), and when the chain completes its name lands
 * on the right; a broken chain shows the miss word instead. Fades out on its own.
 */
export class AdditionBanner {
  private readonly root: HTMLDivElement;
  private readonly tally: HTMLDivElement;
  private readonly name: HTMLDivElement;
  private terms: number[] = [];
  /** Without a Dragoon Spirit no SP is earned (canon): the tally then counts the blows instead. */
  private showSp = true;
  /** Colour of the newest term (the SP mint, or a Dragoon's element for its D'Attack). */
  private accent = "#6fe3c0";
  private fadeTimer?: number;

  constructor() {
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      left: "0",
      right: "0",
      // Above the touch controls (joystick / action arc). On desktop the action arc sits at the
      // bottom right, so the read-out is centred there (the name would land on the buttons).
      bottom: hasTouch() ? "calc(env(safe-area-inset-bottom, 0px) + 37vh)" : "calc(env(safe-area-inset-bottom, 0px) + 150px)",
      display: "none",
      flexDirection: hasTouch() ? "row" : "column",
      alignItems: hasTouch() ? "flex-end" : "center",
      justifyContent: hasTouch() ? "space-between" : "center",
      gap: "8px",
      padding: "0 14px",
      pointerEvents: "none",
      zIndex: "17",
      opacity: "0",
      transition: "opacity 0.25s",
      textShadow: "0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.6)",
      fontFamily: "ui-monospace, Menlo, Consolas, monospace",
      fontWeight: "900",
      letterSpacing: "0.04em",
    } satisfies Partial<CSSStyleDeclaration>);
    this.tally = document.createElement("div");
    Object.assign(this.tally.style, { font: "900 22px/1 ui-monospace, Menlo, Consolas, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "62vw" } satisfies Partial<CSSStyleDeclaration>);
    this.name = document.createElement("div");
    Object.assign(this.name.style, { font: `900 ${hasTouch() ? 26 : 34}px/1 ui-monospace, Menlo, Consolas, monospace`, color: "#ffffff", whiteSpace: "nowrap", opacity: "0", letterSpacing: "0.08em" } satisfies Partial<CSSStyleDeclaration>);
    this.root.append(this.tally, this.name);
    document.body.appendChild(this.root);
    if (!document.getElementById("addition-banner-style")) {
      const style = document.createElement("style");
      style.id = "addition-banner-style";
      // The name slams in (PS1: it pops up large and settles), then glows; the miss word shivers.
      style.textContent = `
@keyframes addition-name-in { 0% { opacity: 0; transform: scale(2.2); } 55% { opacity: 1; transform: scale(0.94); } 100% { opacity: 1; transform: scale(1); } }
@keyframes addition-name-glow { 0%, 100% { text-shadow: 0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.6), 0 0 14px rgba(255,214,96,0.55); } 50% { text-shadow: 0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.6), 0 0 26px rgba(255,214,96,0.95), 0 0 48px rgba(255,160,40,0.6); } }
@keyframes addition-miss-in { 0% { opacity: 0; transform: translateX(-10px) scale(1.4); } 25% { opacity: 1; transform: translateX(8px) scale(1.05); } 50% { transform: translateX(-6px) scale(1); } 75% { transform: translateX(4px); } 100% { opacity: 1; transform: translateX(0); } }
.addition-name-done { animation: addition-name-in 0.32s cubic-bezier(0.2, 0.9, 0.3, 1.2) both, addition-name-glow 1s ease-in-out 0.32s infinite; }
.addition-name-miss { animation: addition-miss-in 0.4s ease-out both; }`;
      document.head.appendChild(style);
    }
  }

  /** A new chain begins (its first blow's SP, 0 when none yet); `showSp` false = no Dragoon Spirit. */
  start(sp: number, showSp = true, accent = "#6fe3c0"): void {
    this.showSp = showSp;
    this.accent = accent;
    if (this.fadeTimer !== undefined) {
      window.clearTimeout(this.fadeTimer);
      this.fadeTimer = undefined;
    }
    this.terms = sp > 0 || !showSp ? [sp] : [];
    this.name.textContent = "";
    this.name.className = "";
    this.name.style.opacity = "0";
    this.render();
    this.root.style.display = "flex";
    requestAnimationFrame(() => (this.root.style.opacity = "1"));
  }

  /** Another blow landed, worth `sp`. */
  add(sp: number): void {
    this.terms.push(sp);
    this.render();
  }

  /** The chain is over: its name (completed) or the miss word (broken), then fade. */
  finish(label: string, completed: boolean): void {
    this.name.textContent = label;
    this.name.style.color = completed ? "#fff6d6" : "#ff6a1a";
    this.name.style.opacity = "1";
    this.name.className = completed ? "addition-name-done" : "addition-name-miss";
    this.fadeTimer = window.setTimeout(() => {
      this.root.style.opacity = "0";
      this.fadeTimer = window.setTimeout(() => {
        this.root.style.display = "none";
        this.fadeTimer = undefined;
      }, 300);
    }, completed ? 1600 : 1100);
  }

  private render(): void {
    // Older terms dim to grey, the newest in the SP mint; "+" in a soft white.
    this.tally.replaceChildren(
      ...this.terms.flatMap((sp, i) => {
        const term = document.createElement("span");
        term.textContent = this.showSp ? `${sp}SP` : `${i + 1}`;
        term.style.color = i === this.terms.length - 1 ? this.accent : "#b9c5c0";
        if (i === 0) return [term];
        const plus = document.createElement("span");
        plus.textContent = this.showSp ? " + " : " · ";
        plus.style.color = "#e8e8e8";
        return [plus, term];
      }),
    );
  }

  dispose(): void {
    if (this.fadeTimer !== undefined) window.clearTimeout(this.fadeTimer);
    this.root.remove();
  }
}
