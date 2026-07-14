import { t } from "../core/i18n";
import type { Bearer } from "../data/bearers";

const MAX_PARTY = 3;

/** rgba() string from a bearer's 0–1 colour triplet. */
function rgba(c: [number, number, number], a = 1): string {
  return `rgba(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)}, ${a})`;
}

/**
 * Full-screen party picker shown before a Survival run: tap up to {@link MAX_PARTY} characters
 * (first tapped = the leader you control), then Start. Purely presentational — `onStart` gets the
 * chosen bearers in selection order. Reuses each bearer's portrait + accent colour.
 */
export class PartySelect {
  private backdrop: HTMLDivElement;
  private grid: HTMLDivElement;
  private startBtn: HTMLButtonElement;
  private cards = new Map<string, HTMLButtonElement>();
  private badges = new Map<string, HTMLDivElement>();
  private chosen: Bearer[] = [];

  constructor(
    private roster: Bearer[],
    private onStart: (party: Bearer[]) => void,
  ) {
    this.backdrop = document.createElement("div");
    Object.assign(this.backdrop.style, {
      position: "fixed",
      inset: "0",
      display: "none",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "14px",
      padding: "18px",
      background: "linear-gradient(180deg, rgba(8,12,18,0.96), rgba(4,6,10,0.98))",
      zIndex: "40",
      touchAction: "manipulation",
      color: "#eafaef",
      font: "600 15px/1.2 system-ui, sans-serif",
    } satisfies Partial<CSSStyleDeclaration>);

    const title = document.createElement("div");
    title.textContent = t("survival.selectTitle");
    Object.assign(title.style, { font: "800 20px/1.2 system-ui, sans-serif", textAlign: "center" });

    const hint = document.createElement("div");
    hint.textContent = t("survival.selectHint");
    Object.assign(hint.style, { opacity: "0.7", font: "600 13px/1.3 system-ui, sans-serif", textAlign: "center" });

    this.grid = document.createElement("div");
    Object.assign(this.grid.style, {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
      gap: "10px",
      width: "min(92vw, 560px)",
      maxHeight: "62vh",
      overflowY: "auto",
      padding: "4px",
    } satisfies Partial<CSSStyleDeclaration>);
    for (const b of this.roster) this.grid.appendChild(this.card(b));

    this.startBtn = document.createElement("button");
    Object.assign(this.startBtn.style, {
      width: "min(92vw, 560px)",
      padding: "13px",
      borderRadius: "12px",
      border: "1px solid rgba(150,220,170,0.5)",
      background: "rgba(40,120,70,0.35)",
      color: "#eafaef",
      font: "800 17px/1 system-ui, sans-serif",
      cursor: "pointer",
    } satisfies Partial<CSSStyleDeclaration>);
    this.startBtn.addEventListener("pointerup", () => {
      if (this.chosen.length > 0) this.onStart([...this.chosen]);
    });

    this.backdrop.append(title, hint, this.grid, this.startBtn);
    document.body.appendChild(this.backdrop);
    this.refresh();
  }

  show(): void {
    this.backdrop.style.display = "flex";
  }

  close(): void {
    this.backdrop.style.display = "none";
  }

  private card(b: Bearer): HTMLButtonElement {
    const btn = document.createElement("button");
    Object.assign(btn.style, {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "6px",
      padding: "8px 6px",
      borderRadius: "12px",
      border: "2px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.04)",
      color: "#eafaef",
      cursor: "pointer",
      font: "700 13px/1.1 system-ui, sans-serif",
    } satisfies Partial<CSSStyleDeclaration>);

    const avatar = document.createElement("div");
    Object.assign(avatar.style, {
      width: "68px",
      height: "68px",
      borderRadius: "50%",
      overflow: "hidden",
      background: rgba(b.color, 0.28),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      font: "800 26px/1 system-ui, sans-serif",
      color: rgba(b.color, 1),
    } satisfies Partial<CSSStyleDeclaration>);
    if (b.portrait) {
      const img = document.createElement("img");
      img.src = b.portrait;
      Object.assign(img.style, { width: "100%", height: "100%", objectFit: "cover" });
      avatar.appendChild(img);
    } else {
      avatar.textContent = b.name.charAt(0);
    }

    const name = document.createElement("div");
    name.textContent = b.name;

    // Selection-order badge (hidden until picked).
    const badge = document.createElement("div");
    Object.assign(badge.style, {
      position: "absolute",
      top: "4px",
      right: "4px",
      width: "22px",
      height: "22px",
      borderRadius: "50%",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(40,140,80,0.95)",
      color: "#fff",
      font: "800 13px/1 ui-monospace, monospace",
    } satisfies Partial<CSSStyleDeclaration>);
    this.badges.set(b.id, badge);

    btn.append(avatar, name, badge);
    btn.addEventListener("pointerup", () => this.toggle(b));
    this.cards.set(b.id, btn);
    return btn;
  }

  private toggle(b: Bearer): void {
    const i = this.chosen.findIndex((x) => x.id === b.id);
    if (i >= 0) this.chosen.splice(i, 1);
    else if (this.chosen.length < MAX_PARTY) this.chosen.push(b);
    this.refresh();
  }

  private refresh(): void {
    for (const b of this.roster) {
      const order = this.chosen.findIndex((x) => x.id === b.id);
      const picked = order >= 0;
      const card = this.cards.get(b.id)!;
      const badge = this.badges.get(b.id)!;
      card.style.borderColor = picked ? rgba(b.color, 0.95) : "rgba(255,255,255,0.12)";
      card.style.background = picked ? rgba(b.color, 0.18) : "rgba(255,255,255,0.04)";
      badge.style.display = picked ? "flex" : "none";
      // First pick = the leader (marked "★"); the rest show their join order.
      if (picked) badge.textContent = order === 0 ? "★" : `${order + 1}`;
    }
    const n = this.chosen.length;
    this.startBtn.disabled = n === 0;
    this.startBtn.style.opacity = n === 0 ? "0.45" : "1";
    this.startBtn.textContent = n === 0 ? t("survival.selectEmpty") : `${t("survival.start")} (${n})`;
  }

  dispose(): void {
    this.backdrop.remove();
  }
}
