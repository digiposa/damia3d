import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TrailMesh } from "@babylonjs/core/Meshes/trailMesh";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

/** What the projectile looks like. */
export type ProjectileKind =
  /** A fletched arrow / thrown dagger — flies point-first along its path. */
  | "arrow"
  /** A thrown rock (the Goblin's Throw Stone). */
  | "stone"
  /** A thrown attack item's magic (PS1: a small glowing ball of its element): lobbed in an arc,
   *  bursts into its spell on landing. */
  | "orb"
  /** A ball of flame (a Dragoon's Flame Shot): a blazing core in a glowing halo, flickering. */
  | "fireball";

export interface ProjectileOptions {
  from: Vector3;
  to: Vector3;
  /** Travel speed in world units per second. */
  speed: number;
  /** Fired once on arrival (land the damage, burst the spell VFX…). */
  onHit: () => void;
  /** Seconds to hold at the thrower's hand before flying (sync with the release frame). */
  delay?: number;
  /** Live target: re-aimed every frame so a moving target is always reached (turn-based, no dodge). */
  follow?: () => Vector3;
  kind?: ProjectileKind;
  /** Peak height of a lobbed arc, in world units. 0 = flat, straight line. */
  arc?: number;
  /** Body tint (a thrown item's ball of magic takes its element's colour). */
  color?: Color3;
  /** Size multiplier of the body (a boss's boulder against a goblin's pebble). */
  size?: number;
  /** A ready-made body (a model of the thing thrown) instead of the built one; owned from now on. */
  body?: TransformNode;
  /** Where it really leaves the hand, read at the release (the boulder as last held). */
  launchFrom?: () => Vector3 | undefined;
}

/**
 * A flying projectile: an arrow/dagger, a thrown rock, or a thrown item's ball of magic. Travels from `from`
 * to `to` — flat, or on a parabolic arc when {@link ProjectileOptions.arc} is set — and on arrival
 * fires `onHit` once and disposes itself. Purely visual: the caller owns the damage.
 */
export class Arrow {
  private readonly root: TransformNode;
  private origin: Vector3;
  private readonly launchFrom?: () => Vector3 | undefined;
  private readonly target: Vector3;
  private readonly speed: number;
  private readonly onHit: () => void;
  private readonly follow?: () => Vector3;
  private readonly arc: number;
  private readonly spin: boolean;
  private delay: number;
  /** The fireball's halo, pulsed in {@link update}. */
  private halo?: TransformNode;
  /** A thrown item's streak of light (its element's colour), behind it in flight. */
  private trail?: TrailMesh;
  private age = 0;
  /** Distance covered so far — drives the arc's parabola (0 → total). */
  private travelled = 0;
  private done = false;

  constructor(scene: Scene, opts: ProjectileOptions) {
    const { from, to, speed, onHit, delay = 0, follow, kind = "arrow", arc = 0, color, size = 1, body } = opts;
    this.launchFrom = opts.launchFrom;
    this.speed = speed;
    this.onHit = onHit;
    this.follow = follow;
    this.arc = arc;
    this.delay = delay;
    this.spin = kind !== "arrow"; // a rock or orb tumbles; an arrow keeps its heading

    this.root = new TransformNode("projectile", scene);
    this.root.position = from.clone();
    this.origin = from.clone();
    if (delay > 0) this.root.setEnabled(false); // hidden while the thrower winds up

    if (body) {
      body.parent = this.root;
      body.position.setAll(0);
    } else if (kind === "orb") {
      // A thrown item's magic (PS1): a small glowing ball of its element — a bright heart in a
      // halo of the element's colour, a streak of it behind.
      const tint = color ?? new Color3(1, 0.5, 0.15);
      const orb = new TransformNode("orb", scene); // scaled as a whole by `size`
      orb.parent = this.root;
      orb.scaling.setAll(size);
      const coreMat = new StandardMaterial("orbCoreMat", scene);
      coreMat.diffuseColor = Color3.Black();
      coreMat.emissiveColor = Color3.Lerp(tint, Color3.White(), 0.55);
      coreMat.disableLighting = true;
      const core = MeshBuilder.CreateSphere("orbCore", { diameter: 0.16, segments: 8 }, scene);
      core.material = coreMat;
      core.isPickable = false;
      core.parent = orb;
      const haloMat = new StandardMaterial("orbHaloMat", scene);
      haloMat.diffuseColor = Color3.Black();
      haloMat.emissiveColor = tint;
      haloMat.disableLighting = true;
      haloMat.alpha = 0.45;
      haloMat.backFaceCulling = false;
      const halo = MeshBuilder.CreateSphere("orbHalo", { diameter: 0.42, segments: 8 }, scene);
      halo.material = haloMat;
      halo.isPickable = false;
      halo.parent = orb;
      this.halo = halo;
      this.trailTint = tint;
      this.trailWidth = 0.1 * size;
    } else if (kind === "fireball") {
      const tint = color ?? new Color3(1, 0.45, 0.1);
      const coreMat = new StandardMaterial("fireCoreMat", scene);
      coreMat.diffuseColor = Color3.Black();
      coreMat.emissiveColor = new Color3(1, 0.9, 0.55); // white-hot heart
      coreMat.disableLighting = true;
      const core = MeshBuilder.CreateSphere("fireCore", { diameter: 0.22, segments: 8 }, scene);
      core.material = coreMat;
      core.isPickable = false;
      core.parent = this.root;
      const haloMat = new StandardMaterial("fireHaloMat", scene);
      haloMat.diffuseColor = Color3.Black();
      haloMat.emissiveColor = tint;
      haloMat.disableLighting = true;
      haloMat.alpha = 0.55;
      haloMat.backFaceCulling = false;
      const halo = MeshBuilder.CreateSphere("fireHalo", { diameter: 0.5, segments: 8 }, scene);
      halo.material = haloMat;
      halo.isPickable = false;
      halo.parent = this.root;
      this.halo = halo;
    } else if (kind === "stone") {
      const rockMat = new StandardMaterial("rockMat", scene);
      rockMat.diffuseColor = color ?? new Color3(0.42, 0.4, 0.37);
      rockMat.specularColor = new Color3(0.05, 0.05, 0.05);
      const rock = MeshBuilder.CreateSphere("stone", { diameter: 0.16 * size, segments: size > 2 ? 7 : 5 }, scene);
      rock.scaling = new Vector3(1, 0.8, 1.1); // irregular, not a perfect ball
      rock.material = rockMat;
      rock.isPickable = false;
      rock.parent = this.root;
    } else {
      const shaftMat = new StandardMaterial("arrowShaftMat", scene);
      shaftMat.diffuseColor = new Color3(0.7, 0.58, 0.36);
      shaftMat.specularColor = new Color3(0.08, 0.08, 0.08);
      const headMat = new StandardMaterial("arrowHeadMat", scene);
      headMat.diffuseColor = new Color3(0.72, 0.74, 0.8);
      headMat.specularColor = new Color3(0.1, 0.1, 0.1);

      // Built pointing along +Z; lookAt() then aims the whole arrow at the target.
      const shaft = MeshBuilder.CreateBox("arrowShaft", { width: 0.03, height: 0.03, depth: 0.5 }, scene);
      shaft.material = shaftMat;
      shaft.isPickable = false;
      shaft.parent = this.root;

      const head = MeshBuilder.CreateCylinder("arrowHead", { height: 0.12, diameterTop: 0, diameterBottom: 0.06, tessellation: 6 }, scene);
      head.rotation.x = Math.PI / 2; // cone tip toward +Z
      head.position.z = 0.31;
      head.material = headMat;
      head.isPickable = false;
      head.parent = this.root;

      for (const dx of [-0.03, 0.03]) {
        const fletch = MeshBuilder.CreateBox("arrowFletch", { width: 0.005, height: 0.07, depth: 0.1 }, scene);
        fletch.position = new Vector3(dx, 0, -0.22);
        fletch.material = headMat;
        fletch.isPickable = false;
        fletch.parent = this.root;
      }
    }

    this.target = to.clone();
    if (delay <= 0) this.startTrail(); // thrown at once: streak from the hand
    if (!this.spin) this.root.lookAt(to);
  }

  private trailTint?: Color3;
  private trailWidth = 0.14;

  /** Start the light streak from where it now is (it would otherwise draw from the hidden hold). */
  private startTrail(): void {
    if (this.trail || !this.trailTint) return;
    const scene = this.root.getScene();
    this.root.computeWorldMatrix(true);
    const trail = new TrailMesh("orbTrail", this.root, scene, this.trailWidth, 22, true);
    const mat = new StandardMaterial("orbTrailMat", scene);
    mat.diffuseColor = Color3.Black();
    mat.emissiveColor = this.trailTint;
    mat.disableLighting = true;
    mat.alpha = 0.45;
    mat.backFaceCulling = false;
    trail.material = mat;
    trail.isPickable = false;
    this.trail = trail;
  }

  /** Advance the projectile; returns false once it has landed (and disposed). Re-aims at a live
   *  target each frame when {@link ProjectileOptions.follow} is set. */
  update(dt: number): boolean {
    if (this.done) return false;
    if (this.delay > 0) {
      this.delay -= dt;
      if (this.delay > 0) return true; // still winding up — hold at the hand, hidden
      const at = this.launchFrom?.();
      if (at) {
        this.root.position.copyFrom(at);
        this.origin = at.clone();
      }
      this.root.setEnabled(true); // released: appear and fly
      if (this.trailTint) this.startTrail();
    }
    const target = this.follow ? this.follow() : this.target;
    // Horizontal (ground) progress drives both the travel and the arc's parabola.
    const flat = target.subtract(this.root.position);
    if (this.arc > 0) flat.y = 0;
    const dist = flat.length();
    const step = this.speed * dt;
    if (step >= dist) {
      this.done = true;
      this.onHit();
      this.root.dispose();
      this.trail?.dispose(false, true);
      return false;
    }
    this.travelled += step;
    this.root.position.addInPlace(flat.scaleInPlace(step / dist));
    if (this.halo) {
      // A roaring flicker: the halo breathes fast and unevenly.
      this.age += dt;
      const k = 1 + 0.18 * Math.sin(this.age * 37) + 0.1 * Math.sin(this.age * 61 + 1);
      this.halo.scaling.setAll(k);
      this.halo.rotation.y += dt * 6;
    }
    if (this.arc > 0) {
      // Parabola over the WHOLE flight: peaks at mid-course, back to the target's height on landing.
      const total = this.travelled + dist;
      const t = total > 0 ? this.travelled / total : 1;
      const baseY = this.origin.y + (target.y - this.origin.y) * t;
      this.root.position.y = baseY + this.arc * 4 * t * (1 - t);
      this.root.rotation.x += dt * 7; // tumbling end over end
      this.root.rotation.z += dt * 4;
    } else if (this.spin) {
      this.root.rotation.x += dt * 9;
      this.root.rotation.z += dt * 5;
    } else {
      this.root.lookAt(target);
    }
    return true;
  }

  dispose(): void {
    if (this.done) return;
    this.done = true;
    this.root.dispose();
    this.trail?.dispose(false, true);
  }
}
