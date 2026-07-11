import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import type { Skeleton } from "@babylonjs/core/Bones/skeleton";

import type { EnemyDef } from "../data/enemies";
import type { Element } from "../combat/element";
import { projectToScreen } from "../world/project";
import { importModel, tuneImportedMetal, flattenCellShaded, tuneWeapon, fitHeight } from "../world/props";

/** Movement speed (world units / second) while chasing. */
const SPEED = 3.2;
/** Distance within which the enemy stops to attack. */
const ATTACK_RANGE = 1.7;
/** Max distance a ranged attacker throws a dagger/knife (beyond melee, it closes in between throws). */
const THROW_RANGE = 10;
/** Seconds between the enemy's attacks. */
const ATTACK_INTERVAL = 1.4;
/** Uniform world-space scale of a hand-attached weapon model (blade length ≈ this × mesh height). */
const WEAPON_SCALE = 1.3;
/** Height (0–1, up the weapon mesh) of the grip that seats in the fist — KoS sword grip ≈ 0.87. */
const WEAPON_GRIP_Y = 0.87;

// Shared status-glow colours (hoisted so tickStatus allocates nothing per frame).
const STATUS_STUN = new Color3(0.5, 0.42, 0.06); // amber = stunned
const STATUS_FEAR = new Color3(0.34, 0.1, 0.46); // violet = feared
const STATUS_NONE = Color3.Black();

/** A resolved enemy action for the mode to apply against the player (or itself). `ranged` marks a
 *  thrown attack (dagger/knife) the mode should deliver as a flying projectile from a distance. */
export type EnemyAction =
  | { kind: "physical"; name: string; multiplier: number; ranged?: boolean }
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
  private anims: {
    idle?: AnimationGroup;
    walk?: AnimationGroup;
    attack?: AnimationGroup;
    slashTwice?: AnimationGroup;
    powerUp?: AnimationGroup;
    throw?: AnimationGroup;
    death?: AnimationGroup;
  } = {};
  private currentAnim?: AnimationGroup;
  private attacking = false;
  private dead = false;
  /** Currently-applied status glow, so tickStatus only writes the material on a transition. */
  private statusColor?: Color3;
  /** Scene-level objects from imported GLBs (animation groups, skeletons) — not children of root,
   *  so dispose() must clean them up or they (and their observers) leak on every despawn. */
  private modelDisposables: { dispose(): void }[] = [];
  /** Pending death-despawn timer id, cleared on dispose. */
  private deathTimer?: number;

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
      this.placeholder.push(crown); // hidden with the rest of the placeholder once a rigged model loads
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
    if (this.root.isDisposed()) {
      for (const m of res.meshes) m.dispose();
      return;
    }
    this.modelDisposables.push(...res.animationGroups, ...res.skeletons);
    for (const mesh of this.placeholder) mesh.setEnabled(false); // hide the capsule/helm

    // Gather the model under one container so we can normalize its size: source packs come in
    // wildly different units (this FBX knight is ~3× too tall). Auto-fit to a target height and
    // drop its feet to y=0, so any model lands at the right scale without hand-tuning.
    const modelRoot = new TransformNode(`enemyModel:${this.def.id}`, scene);
    for (const mesh of res.meshes) {
      if (!mesh.parent) mesh.parent = modelRoot; // the glTF __root__ (handedness fix)
      mesh.metadata = this; // so clicks / the hover cursor still target this enemy
    }
    // Cell-shaded AI models: render flat-diffuse (painted shading). Metallic PBR assets: cap
    // metalness/roughness so they stay visible and glinty.
    if (this.def.cellShaded) flattenCellShaded(res.meshes);
    else tuneImportedMetal(res.meshes);

    fitHeight(res.meshes, modelRoot, 1.8); // ≈ our characters' height; exports arrive at any scale
    modelRoot.parent = this.root;

    // Attach the enemy's weapon model to the right-hand bone (our AI models are rigged weaponless),
    // so it follows every animation with no baked-in bending.
    if (this.def.weaponModel) await this.attachWeapon(this.def.weaponModel, scene, res.skeletons[0]);

    // Match clips by keyword so both our Mixamo names (Idle/Walking/Slash) and the Quaternius
    // convention (…|Idle, …|Run, …|Run_swordAttack) resolve without per-pack special-casing.
    const groups = res.animationGroups;
    const has = (a: AnimationGroup, ...keys: string[]) => keys.some((k) => a.name.toLowerCase().includes(k));
    this.anims.attack = groups.find((a) => has(a, "slash", "attack"));
    this.anims.walk = groups.find((a) => has(a, "walk")) ?? groups.find((a) => has(a, "run") && !has(a, "attack", "slash"));
    this.anims.idle = groups.find((a) => has(a, "idle")) ?? groups[0];
    this.anims.slashTwice = groups.find((a) => has(a, "twice", "double", "multi"));
    this.anims.powerUp = groups.find((a) => has(a, "power"));
    this.anims.throw = groups.find((a) => has(a, "throw", "dagger", "knife"));
    this.anims.death = groups.find((a) => has(a, "death") || has(a, "die"));
    for (const g of groups) g.stop(); // ImportMesh auto-plays the first — stop all
    this.play(this.anims.idle);
  }

  /** Load a weapon GLB and parent it to the model's right-hand bone so it follows every animation.
   *  fbx2gltf leaves the skeleton bones ~200× the mesh scale (and the glTF import adds a mirror), so
   *  a socket node cancels the hand's world scale — the weapon is then sized in world units and
   *  scales with the character (def.scale). The mesh's grip is seated in the fist and the blade
   *  pointed out of it (tip up at rest, overhead in the slash). */
  private async attachWeapon(name: string, scene: Scene, skeleton?: Skeleton): Promise<void> {
    const hand = skeleton?.bones.find((b) => b.name === "mixamorig:RightHand")?.getTransformNode();
    if (!hand) return;
    const res = await importModel(scene, name).catch(() => undefined);
    if (!res || this.root.isDisposed()) {
      if (res) for (const m of res.meshes) m.dispose();
      return;
    }
    this.modelDisposables.push(...res.animationGroups, ...res.skeletons);
    tuneWeapon(res.meshes); // glint + self-illumination so the blade reads in the dim scene

    hand.computeWorldMatrix(true);
    const s = hand.absoluteScaling;
    // Cancel the hand bone's (huge, mirrored) world scale → a clean rigid frame in world units.
    const socket = new TransformNode(`weaponSocket:${this.def.id}`, scene);
    socket.parent = hand;
    socket.scaling = new Vector3(this.scale / s.x, this.scale / s.y, this.scale / s.z);

    const sword = new TransformNode(`weapon:${this.def.id}`, scene);
    sword.parent = socket;
    sword.rotation.z = -Math.PI / 2; // orient the grip-to-blade axis out of the fist
    sword.scaling.setAll(WEAPON_SCALE);

    // The KoS sword mesh runs tip(y=0)→grip(y≈GRIP_Y)→pommel(y=1); flip so the blade points +Y and
    // slide the grip onto the socket origin (the fist).
    const align = new TransformNode(`weaponAlign:${this.def.id}`, scene);
    align.parent = sword;
    align.rotation.x = Math.PI;
    align.position.y = WEAPON_GRIP_Y;
    for (const mesh of res.meshes) {
      if (!mesh.parent) mesh.parent = align;
      mesh.isPickable = false;
    }
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

  /** Play a one-shot animation (attack/throw/power-up), flagging `attacking` until it ends so the
   *  enemy holds position and doesn't cut the motion with idle/walk. */
  private playOneShot(group?: AnimationGroup, speed = 1.2): void {
    if (!group) return;
    this.attacking = true;
    this.currentAnim?.stop();
    this.currentAnim = group;
    group.start(false, speed, group.from, group.to);
    group.onAnimationGroupEndObservable.addOnce(() => {
      this.attacking = false;
    });
  }

  /** Play the melee swing for the chosen action (Slash Twice uses its own clip when present). */
  private playAttack(name = ""): void {
    const twice = /twice|multi/i.test(name);
    this.playOneShot((twice && this.anims.slashTwice) || this.anims.attack);
  }

  /** Play the dagger-throw animation once. */
  private playThrow(): void {
    this.playOneShot(this.anims.throw, 1.0);
  }

  /** True once the death sequence has begun — the enemy is out of play (no AI, not targetable). */
  get dying(): boolean {
    return this.dead;
  }

  /**
   * Play the death animation once, then invoke {@link done} so the mode can despawn the body. Hides
   * the health bar and freezes on the final (fallen) frame. Falls back to an immediate despawn when
   * there's no death clip (placeholder enemies), so callers can always defer removal through here.
   */
  playDeath(done: () => void): void {
    if (this.dead) return;
    this.dead = true;
    this.attacking = false;
    this.bar.style.display = "none";
    if (this.nameTag) this.nameTag.style.display = "none";

    const a = this.anims.death;
    if (!a) {
      done();
      return;
    }
    this.currentAnim?.stop();
    this.currentAnim = a;
    a.start(false, 1.0, a.from, a.to); // once; holds the last frame when it ends
    a.onAnimationGroupEndObservable.addOnce(() => {
      this.deathTimer = window.setTimeout(done, 700); // linger a beat on the ground before despawning
    });
  }

  get position(): Vector3 {
    return this.root.position;
  }

  /** World position above the enemy's head (for HUD / floating text). */
  get headPosition(): Vector3 {
    return this.position.add(new Vector3(0, 2.4 * this.scale, 0));
  }

  /** Approx. throwing-hand height (projectile origin for thrown daggers). */
  get handPosition(): Vector3 {
    return this.position.add(new Vector3(0, 1.3 * this.scale, 0));
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
    // Shared constant colours (no per-frame allocation); only reassign when the state changes.
    const c = this.stunned ? STATUS_STUN : this.feared ? STATUS_FEAR : STATUS_NONE;
    if (this.statusColor !== c) {
      this.statusColor = c;
      this.bodyMat.emissiveColor = c;
    }
  }

  /**
   * Chase the target and, when in range and off cooldown, return the action to
   * perform this turn (or null when just moving / waiting).
   */
  aiUpdate(dt: number, targetPos: Vector3, ctx: EnemyContext): EnemyAction | null {
    // Dying: playing out the death animation — no chase, no attacks.
    if (this.dead) return null;
    // The training dummy just stands there: no chasing, no attacks.
    if (this.def.behavior === "dummy") return null;
    // Stunned: frozen — no chase, no attack (cooldown still thaws).
    if (this.stunned) {
      this.attackCooldown = Math.max(0, this.attackCooldown - dt);
      return null;
    }

    this.attackCooldown = Math.max(0, this.attackCooldown - dt);

    // Mid-attack (sword swing or dagger throw): stay planted and let the one-shot animation play out,
    // still turning to face the target — no sliding toward the player during the wind-up/throw.
    if (this.attacking) {
      const face = targetPos.subtract(this.position);
      if (face.x * face.x + face.z * face.z > 1e-6) this.root.rotation.y = Math.atan2(face.x, face.z);
      return null;
    }

    const to = targetPos.subtract(this.position);
    to.y = 0;
    const dist = to.length();
    if (dist > 1e-3) this.root.rotation.y = Math.atan2(to.x, to.z);

    if (dist > ATTACK_RANGE * this.scale) {
      // Out of melee range: throw a dagger if the enemy can, then keep closing in between throws.
      const ranged = this.rangedAttack();
      if (ranged && this.anims.throw && dist <= THROW_RANGE * this.scale && this.attackCooldown <= 0) {
        this.attackCooldown = ATTACK_INTERVAL;
        this.setMoving(false);
        this.playThrow();
        return { kind: "physical", name: ranged.name, multiplier: ranged.multiplier, ranged: true };
      }
      this.root.position.addInPlace(to.normalize().scale(Math.min(SPEED * dt, dist)));
      this.setMoving(true);
      return null;
    }
    this.setMoving(false);
    if (this.attackCooldown > 0) return null;
    this.attackCooldown = ATTACK_INTERVAL;
    // Decide the action first (it may flip the Commander into its powered-up stance), then match the
    // animation to it: the Power-Up instant plays its own clip; Slash Twice / Multi pick theirs.
    const wasPowered = this.poweredUp;
    const action = this.chooseAction(ctx);
    if (!wasPowered && this.poweredUp && this.anims.powerUp) this.playOneShot(this.anims.powerUp);
    else this.playAttack(action.name);
    return action;
  }

  /** The enemy's thrown (ranged) attack, if it has one — its name contains "Throw". */
  private rangedAttack() {
    return this.def.attacks.find((a) => /throw/i.test(a.name));
  }

  /** Seconds into the throw animation when the dagger leaves the hand (arm fully forward ≈ 50%),
   *  so the mode can release the projectile in sync. Falls back to a sensible default. */
  get throwReleaseDelay(): number {
    const a = this.anims.throw;
    return a ? ((a.to - a.from) / 60) * 0.5 : 0.4; // clip plays at speed 1.0, Babylon 60 fps
  }

  private chooseAction(ctx: EnemyContext): EnemyAction {
    if (this.def.behavior === "commander") return this.commanderAction(ctx);
    // Melee: the first non-thrown attack (a thrown one is reserved for range).
    const a = this.def.attacks.find((x) => !/throw/i.test(x.name)) ?? this.def.attacks[0];
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
    if (this.dead) return; // bar/name already hidden by playDeath; keep them hidden while dying
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
    if (this.deathTimer !== undefined) window.clearTimeout(this.deathTimer);
    for (const d of this.modelDisposables) d.dispose();
    this.bar.remove();
    this.nameTag?.remove();
    this.root.dispose();
  }
}
