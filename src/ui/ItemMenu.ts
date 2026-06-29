import { t } from "../core/i18n";

/** One selectable item row. */
export interface ItemEntry {
  id: string;
  name: string;
  count: number;
  /** Usable now (in stock and useful — e.g. not already full HP/SP). */
  enabled: boolean;
  /** Short effect tag, e.g. "Heal 50% HP" or "+100 SP". */
  detail: string;
  color: string;
}

/**
 * Transient item picker (mirrors {@link import("./SpellMenu").SpellMenu}). Opened by the Item
 * button while in human form; combat is paused behind it. Picking fires `onPick(id)`; the
 * backdrop or Cancel fires `onCancel`.
 */
export class ItemMenu {
  private backdrop: HTMLDivElement;
  private list: HTMLDivElement;
  private open = false;

  constructor(
    private onPick: (id: string) => void,
    private onCancel: () => void,
  ) {
    this.backdrop = document.createElement("div");
    Object.assign(this.backdrop.style, {
      position: "fixed",
      inset: "0",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.45)",
      zIndex: "30",
      touchAction: "manipulation",
    } satisfies Partial<CSSStyleDeclaration>);
    this.backdrop.addEventListener("pointerdown", (e) => {
      if (e.target === this.backdrop) this.cancel();
    });

    const panel = document.createElement("div");
    Object.assign(panel.style, {
      width: "min(86vw, 340px)",
      maxHeight: "70vh",
      overflowY: "auto",
      background: "linear-gradient(180deg, rgba(20,34,26,0.97), rgba(12,20,16,0.97))",
      border: "1px solid rgba(150,220,170,0.45)",
      borderRadius: "14px",
      boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
      padding: "12px",
      color: "#eafaef",
      font: "600 15px/1.2 system-ui, sans-serif",
    } satisfies Partial<CSSStyleDeclaration>);

    const title = document.createElement("div");
    title.textContent = t("action.item");
    Object.assign(title.style, { font: "800 18px/1 system-ui, sans-serif", marginBottom: "10px" });

    this.list = document.createElement("div");
    Object.assign(this.list.style, { display: "flex", flexDirection: "column", gap: "7px" });

    const cancel = document.createElement("button");
    cancel.textContent = t("common.back");
    Object.assign(cancel.style, {
      marginTop: "10px",
      width: "100%",
      padding: "9px",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.18)",
      background: "rgba(255,255,255,0.06)",
      color: "#cfe6d4",
      font: "700 14px/1 system-ui, sans-serif",
      cursor: "pointer",
    } satisfies Partial<CSSStyleDeclaration>);
    cancel.addEventListener("pointerup", () => this.cancel());

    panel.append(title, this.list, cancel);
    this.backdrop.appendChild(panel);
    document.body.appendChild(this.backdrop);
  }

  get isOpen(): boolean {
    return this.open;
  }

  show(items: ItemEntry[]): void {
    this.list.replaceChildren(...items.map((i) => this.row(i)));
    this.backdrop.style.display = "flex";
    this.open = true;
  }

  close(): void {
    this.backdrop.style.display = "none";
    this.open = false;
  }

  private cancel(): void {
    this.close();
    this.onCancel();
  }

  private row(it: ItemEntry): HTMLButtonElement {
    const b = document.createElement("button");
    Object.assign(b.style, {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      width: "100%",
      padding: "9px 11px",
      borderRadius: "10px",
      border: `1px solid ${it.enabled ? it.color : "rgba(255,255,255,0.12)"}`,
      background: it.enabled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
      color: it.enabled ? "#eafaef" : "rgba(234,250,239,0.4)",
      font: "600 15px/1.2 system-ui, sans-serif",
      textAlign: "left",
      cursor: it.enabled ? "pointer" : "default",
    } satisfies Partial<CSSStyleDeclaration>);
    const dot = document.createElement("div");
    Object.assign(dot.style, {
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      background: it.color,
      flex: "0 0 auto",
      opacity: it.enabled ? "1" : "0.4",
    } satisfies Partial<CSSStyleDeclaration>);
    const name = document.createElement("div");
    name.textContent = it.name;
    Object.assign(name.style, { flex: "1 1 auto" });
    const detail = document.createElement("div");
    detail.textContent = it.detail;
    Object.assign(detail.style, { font: "600 12px/1.2 system-ui, sans-serif", opacity: "0.7" });
    const count = document.createElement("div");
    count.textContent = `×${it.count}`;
    Object.assign(count.style, { font: "700 13px/1 ui-monospace, monospace", color: "#9ad0ff", flex: "0 0 auto" });
    b.append(dot, name, detail, count);
    if (it.enabled) {
      b.addEventListener("pointerup", () => {
        this.close();
        this.onPick(it.id);
      });
    }
    return b;
  }

  dispose(): void {
    this.backdrop.remove();
  }
}
