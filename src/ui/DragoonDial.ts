/**
 * The Dragoon Spirit Time-Dial (Legend of Dragoon's D'Attack): a light runs round a dial, and the
 * player presses when it passes the mark at the top — once per turn, each turn faster than the
 * last. The count in the middle is the blows earned so far. Purely presentational: TrainingMode
 * owns the light's angle, the timing and what the presses earn. The whole screen is a tap target
 * so mobile players can press anywhere (`onPress`).
 */
export class DragoonDial {
  private readonly root: HTMLDivElement;
  private readonly ring: HTMLDivElement;
  private readonly light: HTMLDivElement;
  private readonly count: HTMLDivElement;
  private readonly total: HTMLDivElement;
  private readonly word: HTMLDivElement;
  private open = false;
  private fadeTimer?: number;

  constructor(private readonly onPress: () => void) {
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      inset: "0",
      display: "none",
      alignItems: "flex-start",
      justifyContent: "center",
      paddingTop: "16vh",
      zIndex: "34",
      touchAction: "manipulation",
      userSelect: "none",
      cursor: "pointer",
      opacity: "0",
      transition: "opacity 0.15s",
    } satisfies Partial<CSSStyleDeclaration>);
    this.root.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      if (this.open) this.onPress();
    });

    const dial = document.createElement("div");
    Object.assign(dial.style, { position: "relative", width: "150px", height: "150px" } satisfies Partial<CSSStyleDeclaration>);

    this.ring = document.createElement("div");
    Object.assign(this.ring.style, {
      position: "absolute",
      inset: "0",
      borderRadius: "50%",
      border: "5px solid #ff9a4a",
      boxShadow: "0 0 18px rgba(255,150,70,0.6), inset 0 0 22px rgba(0,0,0,0.6)",
      background: "radial-gradient(circle at 50% 45%, rgba(40,30,60,0.75), rgba(10,8,20,0.9))",
      transition: "box-shadow 0.12s, border-color 0.12s",
    } satisfies Partial<CSSStyleDeclaration>);

    // The mark at the top: a notch the light must pass under.
    const mark = document.createElement("div");
    Object.assign(mark.style, {
      position: "absolute",
      left: "50%",
      top: "-14px",
      width: "0",
      height: "0",
      transform: "translateX(-50%)",
      borderLeft: "9px solid transparent",
      borderRight: "9px solid transparent",
      borderTop: "16px solid #ffe27a",
      filter: "drop-shadow(0 0 6px rgba(255,226,122,0.9))",
    } satisfies Partial<CSSStyleDeclaration>);

    // The light: a glowing dot on the rim, rotated about the centre.
    this.light = document.createElement("div");
    Object.assign(this.light.style, {
      position: "absolute",
      left: "50%",
      top: "50%",
      width: "0",
      height: "0",
      transform: "rotate(0deg)",
    } satisfies Partial<CSSStyleDeclaration>);
    const dot = document.createElement("div");
    Object.assign(dot.style, {
      position: "absolute",
      left: "-9px",
      top: "-84px", // on the rim, straight up from the centre (rotation carries it round)
      width: "18px",
      height: "18px",
      borderRadius: "50%",
      background: "radial-gradient(circle, #fff 0%, #ffe27a 45%, rgba(255,160,60,0) 75%)",
      boxShadow: "0 0 14px 4px rgba(255,220,120,0.8)",
    } satisfies Partial<CSSStyleDeclaration>);
    this.light.appendChild(dot);

    this.count = document.createElement("div");
    Object.assign(this.count.style, {
      position: "absolute",
      inset: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      font: "900 58px/1 ui-monospace, Menlo, Consolas, monospace",
      color: "#fff6d6",
      textShadow: "0 2px 6px rgba(0,0,0,0.9)",
      paddingBottom: "6px",
    } satisfies Partial<CSSStyleDeclaration>);
    this.total = document.createElement("div");
    Object.assign(this.total.style, {
      position: "absolute",
      left: "0",
      right: "0",
      bottom: "22px",
      textAlign: "center",
      font: "800 13px/1 ui-monospace, Menlo, Consolas, monospace",
      color: "#d9d2c0",
      letterSpacing: "0.1em",
      textShadow: "0 2px 4px rgba(0,0,0,0.9)",
    } satisfies Partial<CSSStyleDeclaration>);
    // The verdict below the dial ("PERFECT", the miss word).
    this.word = document.createElement("div");
    Object.assign(this.word.style, {
      position: "absolute",
      left: "50%",
      top: "100%",
      transform: "translateX(-50%)",
      marginTop: "14px",
      font: "900 24px/1 ui-monospace, Menlo, Consolas, monospace",
      color: "#ffffff",
      whiteSpace: "nowrap",
      textShadow: "0 2px 6px rgba(0,0,0,0.9)",
      opacity: "0",
      transition: "opacity 0.1s",
    } satisfies Partial<CSSStyleDeclaration>);

    dial.append(this.ring, mark, this.light, this.count, this.total, this.word);
    this.root.appendChild(dial);
    document.body.appendChild(this.root);
  }

  /** Show the dial for `total` turns, rimmed in the Dragoon's element colour. */
  show(total: number, color: string): void {
    if (this.fadeTimer !== undefined) {
      window.clearTimeout(this.fadeTimer);
      this.fadeTimer = undefined;
    }
    this.ring.style.borderColor = color;
    this.ring.style.boxShadow = `0 0 18px ${color}99, inset 0 0 22px rgba(0,0,0,0.6)`;
    this.count.textContent = "0";
    this.total.textContent = `/ ${total}`;
    this.word.style.opacity = "0";
    this.light.style.transform = "rotate(0deg)";
    this.root.style.display = "flex";
    this.open = true;
    requestAnimationFrame(() => (this.root.style.opacity = "1"));
  }

  /** The light's position: `turn` in turns (0 = at the mark, clockwise). */
  update(turn: number): void {
    this.light.style.transform = `rotate(${(turn % 1) * 360}deg)`;
  }

  /** A press landed on the mark: the n-th blow earned. */
  hit(n: number): void {
    this.count.textContent = String(n);
    this.ring.style.boxShadow = "0 0 34px 8px rgba(255,255,255,0.9), inset 0 0 22px rgba(0,0,0,0.6)";
    window.setTimeout(() => (this.ring.style.boxShadow = `0 0 18px ${this.ring.style.borderColor}99, inset 0 0 22px rgba(0,0,0,0.6)`), 120);
  }

  /** The dial is over: the verdict word, then fade. */
  finish(word: string, color: string): void {
    this.open = false;
    this.word.textContent = word;
    this.word.style.color = color;
    this.word.style.opacity = "1";
    this.fadeTimer = window.setTimeout(() => {
      this.root.style.opacity = "0";
      this.fadeTimer = window.setTimeout(() => {
        this.root.style.display = "none";
        this.fadeTimer = undefined;
      }, 200);
    }, 650);
  }

  dispose(): void {
    if (this.fadeTimer !== undefined) window.clearTimeout(this.fadeTimer);
    this.root.remove();
  }
}
