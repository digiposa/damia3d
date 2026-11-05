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
  private fadeTimer?: number;

  constructor() {
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      left: "0",
      right: "0",
      // Above the touch controls (joystick / action arc), above the desktop action arc.
      bottom: hasTouch() ? "calc(env(safe-area-inset-bottom, 0px) + 37vh)" : "calc(env(safe-area-inset-bottom, 0px) + 150px)",
      display: "none",
      alignItems: "flex-end",
      justifyContent: "space-between",
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
    Object.assign(this.name.style, { font: "900 26px/1 ui-monospace, Menlo, Consolas, monospace", color: "#ffffff", whiteSpace: "nowrap", opacity: "0", transition: "opacity 0.15s, transform 0.15s", transform: "translateY(6px)" } satisfies Partial<CSSStyleDeclaration>);
    this.root.append(this.tally, this.name);
    document.body.appendChild(this.root);
  }

  /** A new chain begins (its first blow's SP, 0 when none yet); `showSp` false = no Dragoon Spirit. */
  start(sp: number, showSp = true): void {
    this.showSp = showSp;
    if (this.fadeTimer !== undefined) {
      window.clearTimeout(this.fadeTimer);
      this.fadeTimer = undefined;
    }
    this.terms = sp > 0 || !showSp ? [sp] : [];
    this.name.textContent = "";
    this.name.style.opacity = "0";
    this.name.style.transform = "translateY(6px)";
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
    this.name.style.color = completed ? "#ffffff" : "#ff6a1a";
    this.name.style.opacity = "1";
    this.name.style.transform = "translateY(0)";
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
        term.style.color = i === this.terms.length - 1 ? "#6fe3c0" : "#b9c5c0";
        if (i === 0) return [term];
        const plus = document.createElement("span");
        plus.textContent = " + ";
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
