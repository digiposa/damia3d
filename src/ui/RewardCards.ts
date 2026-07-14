/** One pickable reward card. `apply` runs when the player chooses it. */
export interface RewardCard {
  id: string;
  title: string;
  desc: string;
  icon: string; // emoji
  color: string; // accent (hex/rgba)
  apply: () => void;
}

/**
 * Roguelite level-up reward screen (Magic Survival / Vampire Survivors style): the game pauses and
 * 2–3 cards fan out; the player taps one to apply it and resume. Purely presentational — the caller
 * supplies the cards (each with its own `apply`) and an `onClosed` to unpause.
 */
export class RewardCards {
  private backdrop: HTMLDivElement;
  private row: HTMLDivElement;
  private title: HTMLDivElement;

  constructor(private onClosed: () => void) {
    this.backdrop = document.createElement("div");
    Object.assign(this.backdrop.style, {
      position: "fixed",
      inset: "0",
      display: "none",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "18px",
      padding: "18px",
      background: "linear-gradient(180deg, rgba(10,14,22,0.82), rgba(6,8,14,0.9))",
      backdropFilter: "blur(2px)",
      zIndex: "41",
      touchAction: "manipulation",
      color: "#eafaef",
    } satisfies Partial<CSSStyleDeclaration>);

    this.title = document.createElement("div");
    Object.assign(this.title.style, {
      font: "900 22px/1 system-ui, sans-serif",
      color: "#ffe27a",
      textShadow: "0 2px 8px rgba(0,0,0,0.8)",
    } satisfies Partial<CSSStyleDeclaration>);

    this.row = document.createElement("div");
    Object.assign(this.row.style, {
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
      justifyContent: "center",
      width: "min(94vw, 620px)",
    } satisfies Partial<CSSStyleDeclaration>);

    this.backdrop.append(this.title, this.row);
    document.body.appendChild(this.backdrop);
  }

  get isOpen(): boolean {
    return this.backdrop.style.display !== "none";
  }

  /** Show the given cards under `heading`. Picking one applies it, closes, and calls onClosed. */
  show(heading: string, cards: RewardCard[]): void {
    this.title.textContent = heading;
    this.row.replaceChildren(...cards.map((c) => this.card(c)));
    this.backdrop.style.display = "flex";
  }

  private close(): void {
    this.backdrop.style.display = "none";
    this.onClosed();
  }

  private card(c: RewardCard): HTMLButtonElement {
    const btn = document.createElement("button");
    Object.assign(btn.style, {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8px",
      width: "150px",
      minHeight: "180px",
      padding: "16px 12px",
      borderRadius: "16px",
      border: `2px solid ${c.color}`,
      background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
      color: "#eafaef",
      cursor: "pointer",
      textAlign: "center",
      boxShadow: `0 6px 22px rgba(0,0,0,0.5)`,
    } satisfies Partial<CSSStyleDeclaration>);

    const icon = document.createElement("div");
    icon.textContent = c.icon;
    Object.assign(icon.style, { font: "42px/1 system-ui, sans-serif", marginTop: "6px" });

    const title = document.createElement("div");
    title.textContent = c.title;
    Object.assign(title.style, { font: "800 16px/1.15 system-ui, sans-serif", color: c.color });

    const desc = document.createElement("div");
    desc.textContent = c.desc;
    Object.assign(desc.style, { font: "600 12.5px/1.35 system-ui, sans-serif", opacity: "0.85" });

    btn.append(icon, title, desc);
    btn.addEventListener("pointerup", () => {
      this.close();
      c.apply();
    });
    return btn;
  }

  dispose(): void {
    this.backdrop.remove();
  }
}
