import { Color4 } from "@babylonjs/core/Maths/math.color";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { GameMode } from "../core/GameMode";
import { IsoCamera } from "../world/IsoCamera";

/**
 * Placeholder for a mode that isn't built yet. Shows a centered banner so the
 * mode switch is visibly working while we focus on Training first.
 */
export abstract class StubMode extends GameMode {
  protected abstract title: string;
  protected abstract subtitle: string;
  private banner?: HTMLDivElement;

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
    this.banner.innerHTML =
      `<div>${this.title}</div>` +
      `<div style="font:14px/1.4 system-ui;opacity:0.7">${this.subtitle}</div>` +
      `<div style="font:12px/1.4 ui-monospace,monospace;opacity:0.55;margin-top:16px">` +
      `F1 Training&nbsp;&nbsp;&nbsp;F2 Story&nbsp;&nbsp;&nbsp;F3 Survival</div>`;
    document.body.appendChild(this.banner);
  }

  dispose(): void {
    this.banner?.remove();
  }
}
