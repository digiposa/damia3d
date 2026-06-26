import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

import { AtbGauge } from "../combat/AtbGauge";
import type { Brain } from "../combat/Brain";
import type { Bearer } from "../data/bearers";
import { projectToScreen } from "../world/project";
import { Player } from "./Player";

/**
 * One member of the party. Reuses the {@link Player} avatar for its model and stats, and
 * owns its own {@link AtbGauge} (FF12-style: it acts when the gauge fills, at a Speed-scaled
 * rate). A member is either player-controlled (driven by input + the timed AdditionRunner)
 * or AI-driven (its {@link Brain} chooses actions, auto-resolved). The controlled member
 * hides its floating gauge (the attack button shows its cooldown instead); AI members show
 * an ATB bar + name tag above the head so their cadence is visible.
 */
export class PartyMember {
  readonly avatar: Player;
  readonly gauge: AtbGauge;
  brain: Brain;
  controlled = false;

  private bar: HTMLDivElement;
  private barFill: HTMLDivElement;
  private nameTag: HTMLDivElement;

  constructor(scene: Scene, bearer: Bearer, spawn: Vector3, brain: Brain, level = 1) {
    this.avatar = new Player(scene, bearer, spawn, level);
    this.gauge = new AtbGauge(this.avatar.atbFillTime);
    this.brain = brain;

    // Floating ATB gauge (positioned each frame via syncHud), shown only for AI members.
    this.bar = document.createElement("div");
    Object.assign(this.bar.style, {
      position: "fixed",
      width: "46px",
      height: "5px",
      marginLeft: "-23px",
      borderRadius: "3px",
      background: "rgba(10,14,22,0.85)",
      border: "1px solid rgba(0,0,0,0.6)",
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: "12",
    } satisfies Partial<CSSStyleDeclaration>);
    this.barFill = document.createElement("div");
    Object.assign(this.barFill.style, {
      position: "absolute",
      inset: "0",
      transformOrigin: "left",
      background: "linear-gradient(90deg, #2f6dd0, #56b6ff)",
    } satisfies Partial<CSSStyleDeclaration>);
    this.bar.appendChild(this.barFill);

    this.nameTag = document.createElement("div");
    this.nameTag.textContent = bearer.name;
    Object.assign(this.nameTag.style, {
      position: "fixed",
      transform: "translate(-50%, -100%)",
      font: "700 11px/1 system-ui, sans-serif",
      color: "#dbe8ff",
      textShadow: "0 1px 2px rgba(0,0,0,0.9)",
      pointerEvents: "none",
      whiteSpace: "nowrap",
      zIndex: "12",
    } satisfies Partial<CSSStyleDeclaration>);

    document.body.appendChild(this.bar);
    document.body.appendChild(this.nameTag);
  }

  get position(): Vector3 {
    return this.avatar.position;
  }

  /** True when the ATB gauge is full and the member may act. */
  get ready(): boolean {
    return this.gauge.isReady;
  }

  /** Mark this member as the player-controlled one (or not), updating its HUD. */
  setControlled(flag: boolean): void {
    this.controlled = flag;
    if (flag) this.hideHud();
  }

  /** Advance the ATB gauge (use combat-scaled dt); keeps the fill rate in sync with Speed. */
  tickGauge(dt: number): void {
    this.gauge.fillTime = this.avatar.atbFillTime;
    this.gauge.tick(dt);
  }

  private get headPosition(): Vector3 {
    const s = this.avatar.bearer.scale ?? 1;
    return this.position.add(new Vector3(0, 2.4 * s, 0));
  }

  private hideHud(): void {
    this.bar.style.display = "none";
    this.nameTag.style.display = "none";
  }

  /** Position and fill the floating ATB bar + name tag each frame (AI members only). */
  syncHud(scene: Scene): void {
    if (this.controlled) {
      this.hideHud();
      return;
    }
    const p = projectToScreen(scene, this.headPosition);
    if (!p.visible) {
      this.hideHud();
      return;
    }
    this.bar.style.display = "block";
    this.nameTag.style.display = "block";
    this.bar.style.left = `${p.x}px`;
    this.bar.style.top = `${p.y}px`;
    this.barFill.style.transform = `scaleX(${this.gauge.fill})`;
    this.barFill.style.background = this.ready
      ? "linear-gradient(90deg, #d8a32a, #ffd86b)"
      : "linear-gradient(90deg, #2f6dd0, #56b6ff)";
    this.nameTag.style.left = `${p.x}px`;
    this.nameTag.style.top = `${p.y - 6}px`;
  }

  dispose(): void {
    this.bar.remove();
    this.nameTag.remove();
    this.avatar.dispose();
  }
}
