import { hasTouch } from "../core/device";
import { t, onLocaleChange } from "../core/i18n";
import { EXPLORE } from "../story/maps";

export type ModeId = "Training" | "Story" | "StoryNew" | "Explore" | "Survival";

const ENTRIES: { mode: ModeId; labelKey: string; blurbKey: string }[] = [
  { mode: "Training", labelKey: "mode.training", blurbKey: "mode.training.blurb" },
  { mode: "Story", labelKey: "mode.story", blurbKey: "mode.story.blurb" },
  { mode: "StoryNew", labelKey: "mode.storyNew", blurbKey: "mode.storyNew.blurb" },
  { mode: "Explore", labelKey: "mode.explore", blurbKey: "mode.explore.blurb" },
  { mode: "Survival", labelKey: "mode.survival", blurbKey: "mode.survival.blurb" },
];

/**
 * Full-screen title screen shown at boot. Lets the player choose a mode to
 * start. Works with mouse and touch; the active game HUD is hidden while it is
 * visible (the Game toggles it). Refreshes its text on a language change.
 */
export class MainMenu {
  private root: HTMLDivElement;
  private subtitle: HTMLDivElement;
  private hint: HTMLDivElement;
  private entryNodes: { label: HTMLSpanElement; blurb: HTMLSpanElement; labelKey: string; blurbKey: string }[] = [];
  private list!: HTMLDivElement;
  private picker!: HTMLDivElement;

  constructor(private onSelect: (mode: ModeId, at?: { map: string; entry: string }) => void) {
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      inset: "0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      padding: "24px",
      boxSizing: "border-box",
      background: "radial-gradient(120% 120% at 50% 30%, #141d2e 0%, #0b0d12 70%)",
      color: "#cfe3ff",
      textAlign: "center",
      zIndex: "30",
    } satisfies Partial<CSSStyleDeclaration>);

    const title = document.createElement("div");
    title.textContent = "damia3d";
    Object.assign(title.style, {
      font: "800 clamp(40px, 12vw, 84px)/1 system-ui, sans-serif",
      letterSpacing: "0.04em",
      textShadow: "0 4px 24px rgba(60,110,200,0.45)",
    } satisfies Partial<CSSStyleDeclaration>);

    this.subtitle = document.createElement("div");
    Object.assign(this.subtitle.style, {
      font: "400 clamp(13px, 3.5vw, 16px)/1.4 system-ui, sans-serif",
      opacity: "0.7",
      marginBottom: "18px",
    } satisfies Partial<CSSStyleDeclaration>);

    this.root.append(title, this.subtitle);

    const list = document.createElement("div");
    Object.assign(list.style, {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      width: "min(320px, 80vw)",
    } satisfies Partial<CSSStyleDeclaration>);
    this.list = list;

    for (const entry of ENTRIES) {
      const btn = this.button();
      const label = document.createElement("span");
      const blurb = document.createElement("span");
      Object.assign(blurb.style, { font: "400 12px/1.3 system-ui", opacity: "0.65" } satisfies Partial<CSSStyleDeclaration>);
      btn.append(label, blurb);
      this.entryNodes.push({ label, blurb, labelKey: entry.labelKey, blurbKey: entry.blurbKey });

      btn.addEventListener("pointerup", (e) => {
        e.preventDefault();
        if (entry.mode === "Explore") this.showPicker(true);
        else this.onSelect(entry.mode);
      });
      list.appendChild(btn);
    }
    this.root.appendChild(list);

    // "Explore a map": every Story map and where to start on it (scenes off: free exploration).
    this.picker = document.createElement("div");
    Object.assign(this.picker.style, {
      display: "none",
      flexDirection: "column",
      gap: "10px",
      width: "min(320px, 80vw)",
      maxHeight: "60vh",
      overflowY: "auto",
    } satisfies Partial<CSSStyleDeclaration>);
    this.root.appendChild(this.picker);

    this.hint = document.createElement("div");
    Object.assign(this.hint.style, {
      font: "12px/1.4 ui-monospace, monospace",
      opacity: "0.5",
      marginTop: "20px",
    } satisfies Partial<CSSStyleDeclaration>);
    this.root.appendChild(this.hint);

    document.body.appendChild(this.root);
    this.applyTexts();
    onLocaleChange(() => this.applyTexts());
  }

  /** A menu button (the title screen's look). */
  private button(): HTMLButtonElement {
    const btn = document.createElement("button");
    Object.assign(btn.style, {
      display: "flex",
      flexDirection: "column",
      gap: "3px",
      font: "600 18px/1.2 system-ui, sans-serif",
      color: "#eaf2ff",
      background: "rgba(30,42,66,0.85)",
      border: "1px solid rgba(120,150,200,0.4)",
      borderRadius: "12px",
      padding: "16px 18px",
      cursor: "pointer",
      touchAction: "manipulation",
      textAlign: "left",
    } satisfies Partial<CSSStyleDeclaration>);
    btn.style.setProperty("-webkit-tap-highlight-color", "transparent");
    return btn;
  }

  /** Swap the mode list for the map picker (rebuilt each time: texts follow the language). */
  private showPicker(on: boolean): void {
    this.list.style.display = on ? "none" : "flex";
    this.picker.style.display = on ? "flex" : "none";
    if (!on) return;
    this.picker.replaceChildren();
    for (const { map, entries } of EXPLORE) {
      for (const entry of entries) {
        const btn = this.button();
        const label = document.createElement("span");
        label.textContent = t(`explore.${map}`);
        const blurb = document.createElement("span");
        blurb.textContent = t(`explore.${map}.${entry}`);
        Object.assign(blurb.style, { font: "400 12px/1.3 system-ui", opacity: "0.65" } satisfies Partial<CSSStyleDeclaration>);
        btn.append(label, blurb);
        btn.addEventListener("pointerup", (e) => {
          e.preventDefault();
          this.onSelect("Explore", { map, entry });
        });
        this.picker.appendChild(btn);
      }
    }
    const back = this.button();
    back.textContent = t("explore.back");
    back.style.alignItems = "center";
    back.addEventListener("pointerup", (e) => {
      e.preventDefault();
      this.showPicker(false);
    });
    this.picker.appendChild(back);
  }

  private applyTexts(): void {
    this.subtitle.textContent = t("menu.subtitle");
    this.hint.textContent = hasTouch() ? t("menu.hint.touch") : t("menu.hint.desktop");
    for (const e of this.entryNodes) {
      e.label.textContent = t(e.labelKey);
      e.blurb.textContent = t(e.blurbKey);
    }
  }

  get isOpen(): boolean {
    return this.root.style.display !== "none";
  }

  show(): void {
    this.applyTexts();
    this.showPicker(false);
    this.root.style.display = "flex";
  }

  hide(): void {
    this.root.style.display = "none";
  }

  dispose(): void {
    this.root.remove();
  }
}
