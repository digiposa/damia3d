import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
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
  /** A thrown attack item (a flask): lobbed in an arc, bursts into its spell on landing. */
  | "flask";

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
  /** Body tint (a flask takes its spell's element colour). */
  color?: Color3;
}

/**
 * A flying projectile: an arrow/dagger, a thrown rock, or a lobbed item flask. Travels from `from`
 * to `to` — flat, or on a parabolic arc when {@link ProjectileOptions.arc} is set — and on arrival
 * fires `onHit` once and disposes itself. Purely visual: the caller owns the damage.
 */
export class Arrow {
  private readonly root: TransformNode;
  private readonly origin: Vector3;
  private readonly target: Vector3;
  private readonly speed: number;
  private readonly onHit: () => void;
  private readonly follow?: () => Vector3;
  private readonly arc: number;
  private readonly spin: boolean;
  private delay: number;
  /** Distance covered so far — drives the arc's parabola (0 → total). */
  private travelled = 0;
  private done = false;

  constructor(scene: Scene, opts: ProjectileOptions) {
    const { from, to, speed, onHit, delay = 0, follow, kind = "arrow", arc = 0, color } = opts;
    this.speed = speed;
    this.onHit = onHit;
    this.follow = follow;
    this.arc = arc;
    this.delay = delay;
    this.spin = kind !== "arrow"; // a rock or flask tumbles; an arrow keeps its heading

    this.root = new TransformNode("projectile", scene);
    this.root.position = from.clone();
    this.origin = from.clone();
    if (delay > 0) this.root.setEnabled(false); // hidden while the thrower winds up

    if (kind === "flask") {
      // A small glass flask: a tinted glowing body with a stopper — the item that carries the spell.
      const tint = color ?? new Color3(1, 0.5, 0.15);
      const glassMat = new StandardMaterial("flaskMat", scene);
      glassMat.diffuseColor = tint.scale(0.6);
      glassMat.emissiveColor = tint.scale(0.85); // reads as "charged" even in the dim arena
      glassMat.specularColor = new Color3(0.4, 0.4, 0.4);
      glassMat.alpha = 0.92;
      const body = MeshBuilder.CreateSphere("flaskBody", { diameter: 0.26, segments: 8 }, scene);
      body.scaling = new Vector3(1, 1.15, 1);
      body.material = glassMat;
      body.isPickable = false;
      body.parent = this.root;

      const corkMat = new StandardMaterial("flaskCorkMat", scene);
      corkMat.diffuseColor = new Color3(0.42, 0.3, 0.16);
      const cork = MeshBuilder.CreateCylinder("flaskCork", { height: 0.1, diameter: 0.09 }, scene);
      cork.position.y = 0.17;
      cork.material = corkMat;
      cork.isPickable = false;
      cork.parent = this.root;
    } else if (kind === "stone") {
      const rockMat = new StandardMaterial("rockMat", scene);
      rockMat.diffuseColor = color ?? new Color3(0.42, 0.4, 0.37);
      rockMat.specularColor = new Color3(0.05, 0.05, 0.05);
      const rock = MeshBuilder.CreateSphere("stone", { diameter: 0.16, segments: 5 }, scene);
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
    if (!this.spin) this.root.lookAt(to);
  }

  /** Advance the projectile; returns false once it has landed (and disposed). Re-aims at a live
   *  target each frame when {@link ProjectileOptions.follow} is set. */
  update(dt: number): boolean {
    if (this.done) return false;
    if (this.delay > 0) {
      this.delay -= dt;
      if (this.delay > 0) return true; // still winding up — hold at the hand, hidden
      this.root.setEnabled(true); // released: appear and fly
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
      return false;
    }
    this.travelled += step;
    this.root.position.addInPlace(flat.scaleInPlace(step / dist));
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
  }
}
