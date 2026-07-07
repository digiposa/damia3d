import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";

import type { EnemyDef } from "../data/enemies";
import type { Element } from "../combat/element";
import { projectToScreen } from "../world/project";
import { importModel } from "../world/props";

/** Movement speed (world units / second) while chasing. */
const SPEED = 3.2;
/** Distance within which the enemy stops to attack. */
const ATTACK_RANGE = 1.7;
/** Seconds between the enemy's attacks. */
const ATTACK_INTERVAL = 1.4;

/** A resolved enemy action for the mode to apply against the player (or itself). */
export type EnemyAction =
  | { kind: "physical"; name: string; multiplier: number }
  | { kind: "magical"; name: string; multiplier: number; element?: Element }
  | { kind: "heal"; name: string; amount: number };

/** Per-frame context the AI needs for conditional behaviour. */
export interface EnemyContext {
  /** Living Knights of Sandora in the arena (drives the Commander's Power Up). */
  knightsAlive: number;
}

/**
 * A spawned enemy: a placeholder armored figure, live HP, chase-and-act AI, and a
 * floating health bar (with a name plate for bosses). Static numbers come from
 * its {@link EnemyDef}; the AI returns an {@link EnemyAction} for the mode to
 * resolve with the LoD damage formulas.
 */
export class Enemy {
  readonly root: TransformNode;
  readonly def: EnemyDef;
  hp: number;

  private scale: number;
  private attackCooldown = 0;
  private poweredUp = false;
  private escortsSeen = false;
  private bodyMat: StandardMaterial;

  /** Resolves once the optional rigged model has loaded (or immediately if there's none). */
  readonly ready: Promise<void>;
  /** Placeholder meshes (capsule/helm/crown), hidden when a rigged model loads. */
  private placeholder: AbstractMesh[] = [];
  private anims: { idle?: AnimationGroup; walk?: AnimationGroup; attack?: AnimationGroup } = {};
  private currentAnim?: AnimationGroup;
  private attacking = false;

  private bar: HTMLDivElement;
  private barFill: HTMLDivElement;
  private nameTag?: HTMLDivElement;

  constructor(scene: Scene, def: EnemyDef, spawn = new Vector3(0, 0, 0)) {
    this.def = def;
    this.hp = def.stats.maxHp;
    this.scale = def.scale ?? 1;

    this.root = new TransformNode(`enemy:${def.id}`, scene);
    this.root.position = spawn.clone();
    this.root.scaling.setAll(this.scale);

    const [r, g, b] = def.bodyColor ?? [0.45, 0.5, 0.6];
    const body = MeshBuilder.CreateCapsule("enemyBody", { height: 1.7, radius: 0.42 }, scene);
    body.position.y = 0.85;
    this.bodyMat = new StandardMaterial("enemyMat", scene);
    this.bodyMat.diffuseColor = new Color3(r, g, b);
    this.bodyMat.specularColor = new Color3(0.6, 0.65, 0.75);
    body.material = this.bodyMat;
    body.parent = this.root;
    body.metadata = this;
    this.placeholder.push(body);

    const helm = MeshBuilder.CreateBox("enemyHelm", { width: 0.5, height: 0.4, depth: 0.5 }, scene);
    helm.position = new Vector3(0, 1.75, 0);
    const helmMat = new StandardMaterial("enemyHelmMat", scene);
    helmMat.diffuseColor = new Color3(r * 0.7, g * 0.7, b * 0.7);
    helm.material = helmMat;
    helm.parent = this.root;
    helm.metadata = this;
    this.placeholder.push(helm);

    if (def.isBoss) {
      const crown = MeshBuilder.CreateBox("bossCrown", { width: 0.55, height: 0.18, depth: 0.55 }, scene);
      crown.position = new Vector3(0, 2.05, 0);
      const crownMat = new StandardMaterial("bossCrownMat", scene);
      crownMat.diffuseColor = new Color3(0.85, 0.72, 0.25);
      crownMat.emissiveColor = new Color3(0.25, 0.2, 0.05);
      crown.material = crownMat;
      crown.parent = this.root;
      crown.metadata = this;
    }

    // Floating health bar (positioned each frame via syncHud).
    this.bar = document.createElement("div");
    Object.assign(this.bar.style, {
      position: "fixed",
      width: `${def.isBoss ? 96 : 46}px`,
      height: `${def.isBoss ? 8 : 6}px`,
      marginLeft: `${def.isBoss ? -48 : -23}px`,
      marginTop: "-3px",
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
      background: def.isBoss
        ? "linear-gradient(90deg, #b14, #f73)"
        : "linear-gradient(90deg, #6ab04c, #c0392b)",
    } satisfies Partial<CSSStyleDeclaration>);
    this.bar.appendChild(this.barFill);
    document.body.appendChild(this.bar);

    if (def.isBoss) {
      this.nameTag = document.createElement("div");
      this.nameTag.textContent = def.name;
      Object.assign(this.nameTag.style, {
        position: "fixed",
        transform: "translate(-50%, -100%)",
        font: "700 12px/1 system-ui, sans-serif",
        color: "#ffd9d9",
        textShadow: "0 1px 2px rgba(0,0,0,0.9)",
        pointerEvents: "none",
        whiteSpace: "nowrap",
        zIndex: "12",
      } satisfies Partial<CSSStyleDeclaration>);
      document.body.appendChild(this.nameTag);
    }

    // Swap the placeholder for a rigged GLB model (with idle/walk/attack) when the def has one.
    this.ready = def.model ? this.loadModel(scene, def.model) : Promise.resolve();
  }

  /** Load the rigged model, hide the placeholder, and start the idle animation. Best-effort:
   *  a missing/failed model keeps the placeholder capsule. */
  private async loadModel(scene: Scene, name: string): Promise<void> {
    const res = await importModel(scene, name).catch(() => undefined);
    if (!res) return;
    for (const mesh of this.placeholder) mesh.setEnabled(false); // hide the capsule/helm
    for (const mesh of res.meshes) {
      if (!mesh.parent) mesh.parent = this.root; // keep the glTF __root__ (handedness fix)
      mesh.metadata = this; // so clicks / the hover cursor still target this enemy
    }
    const clip = (suffix: string) => res.animationGroups.find((a) => a.name.endsWith(suffix));
    this.anims.idle = clip("|Idle") ?? res.animationGroups[0];
    this.anims.walk = clip("|Walking") ?? clip("|Run");
    this.anims.attack = clip("|Run_swordAttack") ?? clip("|swordAttackJump");
    for (const g of res.animationGroups) g.stop(); // ImportMesh auto-plays the first — stop all
    this.play(this.anims.idle);
  }

  /** Loop a locomotion/idle animation, replacing whatever is playing (no-op if already it). */
  private play(group?: AnimationGroup): void {
    if (!group || group === this.currentAnim) return;
    this.currentAnim?.stop();
    this.currentAnim = group;
    group.start(true, 1.0, group.from, group.to);
  }

  /** Set the walking vs idle loop (ignored mid-attack so the swing isn't cut short). */
  private setMoving(moving: boolean): void {
    if (this.attacking || !this.anims.idle) return;
    this.play(moving ? this.anims.walk ?? this.anims.idle : this.anims.idle);
  }

  /** Play the attack swing once, then fall back to idle/walk on the next frame. */
  private playAttack(): void {
    const a = this.anims.attack;
    if (!a) return;
    this.attacking = true;
    this.currentAnim?.stop();
    this.currentAnim = a;
    a.start(false, 1.2, a.from, a.to);
    a.onAnimationGroupEndObservable.addOnce(() => {
      this.attacking = false;
    });
  }

  get position(): Vector3 {
    return this.root.position;
  }

  /** World position above the enemy's head (for HUD / floating text). */
  get headPosition(): Vector3 {
    return this.position.add(new Vector3(0, 2.4 * this.scale, 0));
  }

  get alive(): boolean {
    return this.hp > 0;
  }

  takeDamage(amount: number): void {
    // Immortal targets (the training dummy) clamp at 1 HP so they never die.
    this.hp = Math.max(this.def.immortal ? 1 : 0, this.hp - amount);
  }

  heal(amount: number): void {
    this.hp = Math.min(this.def.stats.maxHp, this.hp + amount);
  }

  // --- Status ailments (Dragoon Magic) --------------------------------------

  private fearTimer = 0;
  private stunTimer = 0;

  /** Feared targets take double damage (the Target Fear ×2 modifier). */
  get feared(): boolean {
    return this.fearTimer > 0;
  }
  /** Stunned targets can't move or act. */
  get stunned(): boolean {
    return this.stunTimer > 0;
  }
  inflictFear(seconds: number): void {
    this.fearTimer = Math.max(this.fearTimer, seconds);
  }
  inflictStun(seconds: number): void {
    this.stunTimer = Math.max(this.stunTimer, seconds);
  }
  /** Instant Death: kills a normal foe outright. Bosses and the immortal dummy resist. */
  kill(): boolean {
    if (this.def.immortal || this.def.isBoss) return false;
    this.hp = 0;
    return true;
  }
  /** Tick status timers and refresh their glow — call once per frame for every enemy. */
  tickStatus(dt: number): void {
    if (this.fearTimer > 0) this.fearTimer = Math.max(0, this.fearTimer - dt);
    if (this.stunTimer > 0) this.stunTimer = Math.max(0, this.stunTimer - dt);
    this.bodyMat.emissiveColor = this.stunned
      ? new Color3(0.5, 0.42, 0.06) // amber = stunned
      : this.feared
        ? new Color3(0.34, 0.1, 0.46) // violet = feared
        : Color3.Black();
  }

  /**
   * Chase the target and, when in range and off cooldown, return the action to
   * perform this turn (or null when just moving / waiting).
   */
  aiUpdate(dt: number, targetPos: Vector3, ctx: EnemyContext): EnemyAction | null {
    // The training dummy just stands there: no chasing, no attacks.
    if (this.def.behavior === "dummy") return null;
    // Stunned: frozen — no chase, no attack (cooldown still thaws).
    if (this.stunned) {
      this.attackCooldown = Math.max(0, this.attackCooldown - dt);
      return null;
    }

    this.attackCooldown = Math.max(0, this.attackCooldown - dt);

    const to = targetPos.subtract(this.position);
    to.y = 0;
    const dist = to.length();
    if (dist > 1e-3) this.root.rotation.y = Math.atan2(to.x, to.z);

    if (dist > ATTACK_RANGE * this.scale) {
      this.root.position.addInPlace(to.normalize().scale(Math.min(SPEED * dt, dist)));
      this.setMoving(true);
      return null;
    }
    this.setMoving(false);
    if (this.attackCooldown > 0) return null;
    this.attackCooldown = ATTACK_INTERVAL;
    this.playAttack();
    return this.chooseAction(ctx);
  }

  private chooseAction(ctx: EnemyContext): EnemyAction {
    if (this.def.behavior === "commander") return this.commanderAction(ctx);
    const a = this.def.attacks[0];
    return { kind: a.kind, name: a.name, multiplier: a.multiplier };
  }

  /** The Seles Commander's "if → then" script. */
  private commanderAction(ctx: EnemyContext): EnemyAction {
    const max = this.def.stats.maxHp;
    if (ctx.knightsAlive > 0) this.escortsSeen = true;

    // Power Up once the escorting Knights are defeated (single use).
    if (!this.poweredUp && this.escortsSeen && ctx.knightsAlive === 0) {
      this.poweredUp = true;
      this.markPowered();
      return { kind: "physical", name: "Slash Twice", multiplier: 2 };
    }

    // Recover 30% HP when below 51%.
    if (this.hp < 0.51 * max && Math.random() < 0.35) {
      return { kind: "heal", name: "HP recovers", amount: Math.max(1, Math.floor(0.3 * max)) };
    }

    // Burn Out (Fire magic; 1.5× once powered up) or a melee strike.
    if (Math.random() < 0.4) {
      return { kind: "magical", name: "Burn Out", multiplier: this.poweredUp ? 1.5 : 1.2, element: "Fire" };
    }
    return this.poweredUp
      ? { kind: "physical", name: "Slash Twice", multiplier: 2 }
      : { kind: "physical", name: "Sword Slash", multiplier: 1 };
  }

  private markPowered(): void {
    this.bodyMat.emissiveColor = new Color3(0.4, 0.05, 0.08);
  }

  /** Position and fill the floating health bar (and name plate) each frame. */
  syncHud(scene: Scene): void {
    const p = projectToScreen(scene, this.headPosition);
    if (!p.visible) {
      this.bar.style.display = "none";
      if (this.nameTag) this.nameTag.style.display = "none";
      return;
    }
    this.bar.style.display = "block";
    this.bar.style.left = `${p.x}px`;
    this.bar.style.top = `${p.y}px`;
    this.barFill.style.transform = `scaleX(${this.hp / this.def.stats.maxHp})`;

    if (this.nameTag) {
      this.nameTag.style.display = "block";
      this.nameTag.style.left = `${p.x}px`;
      this.nameTag.style.top = `${p.y - 6}px`;
    }
  }

  dispose(): void {
    this.bar.remove();
    this.nameTag?.remove();
    this.root.dispose();
  }
}
