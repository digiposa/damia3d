import { t } from "../core/i18n";
import { scaleHud } from "../core/device";

/** One line of the shop: what it is, what it costs, and whether it can be sold yet. */
export interface ShopLine {
  id: string;
  name: string;
  /** What it does, in one line. */
  blurb: string;
  price: number;
  /** How many the party already carries. */
  owned: number;
  /** Not in the game yet: listed (it is canon) but not for sale. */
  soon?: boolean;
}

/**
 * The travelling merchant's shop: his line (the element tutorial), the wares with their price,
 * the party's gold, and a Buy button per line. A modal over the paused game.
 */
export class ShopPanel {
  private readonly root: HTMLDivElement;
  private readonly list: HTMLDivElement;
  private readonly goldEl: HTMLDivElement;
  private open = false;

  constructor(
    private readonly src: { lines: () => ShopLine[]; gold: () => number; buy: (id: string) => boolean },
    private readonly onClose: () => void,
  ) {
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      width: "min(420px, 92vw)",
      maxHeight: "86vh",
      overflowY: "auto",
      background: "rgba(22, 15, 10, 0.96)",
      border: "1px solid rgba(232, 196, 120, 0.8)",
      borderRadius: "12px",
      padding: "16px",
      color: "#f3e6cc",
      font: "500 14px/1.4 system-ui, sans-serif",
      zIndex: "40",
      display: "none",
      boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
    } satisfies Partial<CSSStyleDeclaration>);
    this.root.addEventListener("pointerdown", (e) => e.stopPropagation());

    const head = document.createElement("div");
    Object.assign(head.style, { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" });
    const title = document.createElement("div");
    title.textContent = t("story.merchant");
    Object.assign(title.style, { font: "700 18px/1.2 system-ui, sans-serif", color: "#e8c478" });
    this.goldEl = document.createElement("div");
    Object.assign(this.goldEl.style, { font: "700 15px/1 system-ui, sans-serif", color: "#f0d070" });
    head.append(title, this.goldEl);

    const line = document.createElement("div");
    line.textContent = t("story.merchant.shopLine");
    Object.assign(line.style, { opacity: "0.85", marginBottom: "12px", fontStyle: "italic" });

    this.list = document.createElement("div");
    Object.assign(this.list.style, { display: "flex", flexDirection: "column", gap: "8px" });

    const close = document.createElement("button");
    close.textContent = t("story.shop.leave");
    Object.assign(close.style, {
      marginTop: "14px",
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid rgba(232,196,120,0.5)",
      background: "rgba(60,40,24,0.9)",
      color: "#f3e6cc",
      font: "600 15px/1 system-ui, sans-serif",
      cursor: "pointer",
    } satisfies Partial<CSSStyleDeclaration>);
    close.addEventListener("pointerup", (e) => {
      e.preventDefault();
      this.close();
    });

    this.root.append(head, line, this.list, close);
    scaleHud(this.root);
    document.body.appendChild(this.root);
  }

  get isOpen(): boolean {
    return this.open;
  }

  show(): void {
    this.open = true;
    this.render();
    this.root.style.display = "block";
  }

  close(): void {
    if (!this.open) return;
    this.open = false;
    this.root.style.display = "none";
    this.onClose();
  }

  private render(): void {
    const gold = this.src.gold();
    this.goldEl.textContent = `${gold} G`;
    this.list.replaceChildren();
    for (const l of this.src.lines()) {
      const row = document.createElement("div");
      Object.assign(row.style, {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 10px",
        borderRadius: "8px",
        background: "rgba(255,255,255,0.05)",
        opacity: l.soon ? "0.55" : "1",
      } satisfies Partial<CSSStyleDeclaration>);
      const info = document.createElement("div");
      Object.assign(info.style, { flex: "1" });
      const name = document.createElement("div");
      name.textContent = l.soon ? `${l.name} · ${t("story.shop.soon")}` : `${l.name}  ×${l.owned}`;
      Object.assign(name.style, { font: "700 14px/1.2 system-ui, sans-serif" });
      const blurb = document.createElement("div");
      blurb.textContent = l.blurb;
      Object.assign(blurb.style, { fontSize: "12px", opacity: "0.75" });
      info.append(name, blurb);
      const buy = document.createElement("button");
      buy.textContent = `${l.price} G`;
      const can = !l.soon && gold >= l.price;
      Object.assign(buy.style, {
        minWidth: "64px",
        padding: "8px 10px",
        borderRadius: "8px",
        border: "1px solid rgba(232,196,120,0.6)",
        background: can ? "#e8c478" : "rgba(80,70,60,0.6)",
        color: can ? "#2a1c0e" : "#a89a88",
        font: "800 13px/1 system-ui, sans-serif",
        cursor: can ? "pointer" : "default",
      } satisfies Partial<CSSStyleDeclaration>);
      buy.disabled = !can;
      buy.addEventListener("pointerup", (e) => {
        e.preventDefault();
        if (can && this.src.buy(l.id)) this.render();
      });
      row.append(info, buy);
      this.list.append(row);
    }
  }

  dispose(): void {
    this.root.remove();
  }
}
