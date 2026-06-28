import { t } from "../core/i18n";

/** One selectable spell row. */
export interface SpellEntry {
  id: string;
  name: string;
  mp: number;
  /** Affordable + unlocked (tappable). Unaffordable rows show greyed out. */
  enabled: boolean;
  /** Short effect tag, e.g. "Fire · 200%" or "Heal 50%". */
  detail: string;
  /** Accent colour (element/effect). */
  color: string;
}

/**
 * Transient Dragoon-Magic spell picker. Opened by the Magic button while transformed;
 * combat is paused behind it. Picking a spell fires `onPick(id)` and closes; the backdrop
 * or Cancel fires `onCancel`. Plain DOM, mounted on demand.
 */
export class SpellMenu {
  private backdrop: HTMLDivElement;
  private panel: HTMLDivElement;
  private list: HTMLDivElement;
  private mpLabel: HTMLDivElement;
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

    this.panel = document.createElement("div");
    Object.assign(this.panel.style, {
      width: "min(86vw, 340px)",
      maxHeight: "70vh",
      overflowY: "auto",
      background: "linear-gradient(180deg, rgba(28,24,46,0.97), rgba(16,14,28,0.97))",
      border: "1px solid rgba(180,160,255,0.5)",
      borderRadius: "14px",
      boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
      padding: "12px",
      color: "#efeaff",
      font: "600 15px/1.2 system-ui, sans-serif",
    } satisfies Partial<CSSStyleDeclaration>);

    const header = document.createElement("div");
    Object.assign(header.style, {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      marginBottom: "10px",
    } satisfies Partial<CSSStyleDeclaration>);
    const title = document.createElement("div");
    title.textContent = t("action.magic");
    Object.assign(title.style, { font: "800 18px/1 system-ui, sans-serif" });
    this.mpLabel = document.createElement("div");
    Object.assign(this.mpLabel.style, { font: "700 13px/1 ui-monospace, monospace", color: "#9ad0ff" });
    header.append(title, this.mpLabel);

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
      color: "#cfc8e6",
      font: "700 14px/1 system-ui, sans-serif",
      cursor: "pointer",
    } satisfies Partial<CSSStyleDeclaration>);
    cancel.addEventListener("pointerup", () => this.cancel());

    this.panel.append(header, this.list, cancel);
    this.backdrop.appendChild(this.panel);
    document.body.appendChild(this.backdrop);
  }

  get isOpen(): boolean {
    return this.open;
  }

  show(spells: SpellEntry[], mp: number, maxMp: number): void {
    this.mpLabel.textContent = `${t("stat.mp")} ${mp}/${maxMp}`;
    this.list.replaceChildren(...spells.map((s) => this.row(s)));
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

  private row(s: SpellEntry): HTMLButtonElement {
    const b = document.createElement("button");
    Object.assign(b.style, {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      width: "100%",
      padding: "9px 11px",
      borderRadius: "10px",
      border: `1px solid ${s.enabled ? s.color : "rgba(255,255,255,0.12)"}`,
      background: s.enabled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
      color: s.enabled ? "#efeaff" : "rgba(239,234,255,0.4)",
      font: "600 15px/1.2 system-ui, sans-serif",
      textAlign: "left",
      cursor: s.enabled ? "pointer" : "default",
    } satisfies Partial<CSSStyleDeclaration>);
    const dot = document.createElement("div");
    Object.assign(dot.style, {
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      background: s.color,
      flex: "0 0 auto",
      opacity: s.enabled ? "1" : "0.4",
    } satisfies Partial<CSSStyleDeclaration>);
    const name = document.createElement("div");
    name.textContent = s.name;
    Object.assign(name.style, { flex: "1 1 auto" });
    const detail = document.createElement("div");
    detail.textContent = s.detail;
    Object.assign(detail.style, { font: "600 12px/1.2 system-ui, sans-serif", opacity: "0.7" });
    const cost = document.createElement("div");
    cost.textContent = `${s.mp} ${t("stat.mp")}`;
    Object.assign(cost.style, { font: "700 12px/1 ui-monospace, monospace", color: "#9ad0ff", flex: "0 0 auto" });
    b.append(dot, name, detail, cost);
    if (s.enabled) {
      b.addEventListener("pointerup", () => {
        this.close();
        this.onPick(s.id);
      });
    }
    return b;
  }

  dispose(): void {
    this.backdrop.remove();
  }
}
