import { t } from "../core/i18n";
import { type Bearer, selectableBearers } from "../data/bearers";
import { dragoonClass } from "../data/dragoonClasses";

export interface CharacterCallbacks {
  onSelect: (bearer: Bearer) => void;
  onResume: () => void;
}

/**
 * Training/Survival character picker (pausing overlay). Lists the bearers whose
 * Dragoon class is implemented; selecting one re-skins the player to that
 * bearer (same stats/Additions/element as its class).
 */
export class CharacterMenu {
  private root: HTMLDivElement;
  private list: HTMLDivElement;

  constructor(private cb: CharacterCallbacks) {
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      inset: "0",
      display: "none",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      padding: "24px",
      boxSizing: "border-box",
      background: "radial-gradient(120% 120% at 50% 30%, #141d2ecc 0%, #0b0d12f2 70%)",
      color: "#cfe3ff",
      zIndex: "40",
    } satisfies Partial<CSSStyleDeclaration>);

    const title = document.createElement("div");
    title.textContent = t("char.title");
    Object.assign(title.style, {
      font: "800 clamp(24px, 7vw, 40px)/1 system-ui, sans-serif",
      marginBottom: "4px",
    } satisfies Partial<CSSStyleDeclaration>);

    this.list = document.createElement("div");
    Object.assign(this.list.style, {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      width: "min(360px, 88vw)",
      maxHeight: "62vh",
      overflowY: "auto",
    } satisfies Partial<CSSStyleDeclaration>);

    const resume = document.createElement("button");
    resume.textContent = `▶  ${t("common.resume")}`;
    Object.assign(resume.style, {
      font: "700 16px/1 system-ui, sans-serif",
      color: "#eaf2ff",
      background: "rgba(40,90,60,0.9)",
      border: "1px solid rgba(120,150,200,0.4)",
      borderRadius: "12px",
      padding: "14px 22px",
      width: "min(360px, 88vw)",
      cursor: "pointer",
      touchAction: "manipulation",
    } satisfies Partial<CSSStyleDeclaration>);
    resume.addEventListener("pointerup", (e) => {
      e.preventDefault();
      this.cb.onResume();
    });

    this.root.append(title, this.list, resume);
    document.body.appendChild(this.root);
  }

  show(currentId: string): void {
    this.list.replaceChildren(...selectableBearers().map((b) => this.row(b, b.id === currentId)));
    this.root.style.display = "flex";
  }

  private row(bearer: Bearer, current: boolean): HTMLElement {
    const cls = dragoonClass(bearer.classId);
    const el = document.createElement("button");
    Object.assign(el.style, {
      display: "flex",
      flexDirection: "column",
      gap: "3px",
      width: "100%",
      textAlign: "left",
      font: "700 16px/1.2 system-ui, sans-serif",
      color: "#eaf2ff",
      background: current ? "rgba(70,110,180,0.95)" : "rgba(30,42,66,0.85)",
      border: `1px solid ${current ? "rgba(170,200,255,0.85)" : "rgba(120,150,200,0.4)"}`,
      borderRadius: "10px",
      padding: "12px 16px",
      cursor: "pointer",
      touchAction: "manipulation",
    } satisfies Partial<CSSStyleDeclaration>);
    el.innerHTML =
      `<span>${bearer.name}${current ? "  ✓" : ""}</span>` +
      `<span style="font:400 12px/1.3 ui-monospace,monospace;opacity:0.8">${cls?.dragoonName ?? ""} · ${cls?.element ?? ""}${bearer.storyPlayable ? "" : " · skin"}</span>`;
    el.addEventListener("pointerup", (e) => {
      e.preventDefault();
      this.cb.onSelect(bearer);
    });
    return el;
  }

  get isOpen(): boolean {
    return this.root.style.display !== "none";
  }

  hide(): void {
    this.root.style.display = "none";
  }

  dispose(): void {
    this.root.remove();
  }
}
