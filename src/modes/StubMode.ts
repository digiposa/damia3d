import { Color4 } from "@babylonjs/core/Maths/math.color";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { GameMode } from "../core/GameMode";
import { IsoCamera } from "../world/IsoCamera";
import { t, onLocaleChange } from "../core/i18n";

/**
 * Placeholder for a mode that isn't built yet. Shows a centered banner so the
 * mode switch is visibly working while we focus on Training first.
 */
export abstract class StubMode extends GameMode {
  protected abstract titleKey: string;
  protected abstract subtitleKey: string;
  private banner?: HTMLDivElement;
  private titleEl?: HTMLDivElement;
  private subtitleEl?: HTMLDivElement;
  private hintEl?: HTMLDivElement;
  private offLocale?: () => void;

  enter(): void {
    this.scene.clearColor = new Color4(0.03, 0.04, 0.06, 1);
    new HemisphericLight("ambient", new Vector3(0, 1, 0), this.scene);
    new IsoCamera(this.scene);

    this.banner = document.createElement("div");
    Object.assign(this.banner.style, {
      position: "fixed",
      inset: "0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      color: "#cfe3ff",
      font: "600 28px/1.2 system-ui, sans-serif",
      textAlign: "center",
      pointerEvents: "none",
      zIndex: "10",
    } satisfies Partial<CSSStyleDeclaration>);

    this.titleEl = document.createElement("div");
    this.subtitleEl = document.createElement("div");
    Object.assign(this.subtitleEl.style, { font: "14px/1.4 system-ui", opacity: "0.7" } satisfies Partial<CSSStyleDeclaration>);
    this.hintEl = document.createElement("div");
    Object.assign(this.hintEl.style, {
      font: "12px/1.4 ui-monospace,monospace",
      opacity: "0.55",
      marginTop: "16px",
    } satisfies Partial<CSSStyleDeclaration>);
    this.banner.append(this.titleEl, this.subtitleEl, this.hintEl);
    document.body.appendChild(this.banner);

    this.applyTexts();
    this.offLocale = onLocaleChange(() => this.applyTexts());
  }

  private applyTexts(): void {
    if (this.titleEl) this.titleEl.textContent = t(this.titleKey);
    if (this.subtitleEl) this.subtitleEl.textContent = t(this.subtitleKey);
    if (this.hintEl) this.hintEl.textContent = t("stub.hint");
  }

  dispose(): void {
    this.offLocale?.();
    this.banner?.remove();
  }
}
