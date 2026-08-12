import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";

/** Radius of the ring around a normal-sized enemy, in world units. */
const BASE_RADIUS = 0.85;
/** Height above the ground, so it does not z-fight with the floor. */
const LIFT = 0.04;
/** Turns per second — a slow spin keeps it alive without pulling the eye. */
const SPIN = 0.35;
/** How long the acquisition pulse lasts. */
const PULSE_DUR = 0.35;
/** Peak extra size at the start of the pulse (× the resting radius). */
const PULSE_SWELL = 0.7;

/**
 * The ring on the ground under the enemy you are aiming at.
 *
 * Two jobs in one, and they are different: it must say **who you are about to hit** at any moment
 * (so it is persistent — a flash at click time answers nothing a second later), and it must
 * acknowledge a **change of target** (so it pulses when the lock moves). Rendered in 3D rather than
 * as a DOM overlay: it sits on the floor under the model, in the same perspective as everything else,
 * which reads far better in an iso view than a flat badge pasted over the scene.
 */
export class TargetMarker {
  private readonly ring: Mesh;
  private readonly inner: Mesh;
  private readonly mat: StandardMaterial;
  private readonly innerMat: StandardMaterial;
  private radius = BASE_RADIUS;
  private spin = 0;
  private pulse = 0;
  private visible = false;

  constructor(scene: Scene) {
    this.mat = new StandardMaterial("targetRingMat", scene);
    this.mat.disableLighting = true;
    this.mat.emissiveColor = new Color3(1, 0.82, 0.36);
    this.mat.alpha = 0.85;
    this.mat.backFaceCulling = false;

    this.ring = MeshBuilder.CreateTorus("targetRing", { diameter: 2, thickness: 0.07, tessellation: 40 }, scene);
    this.ring.material = this.mat;
    this.ring.isPickable = false;
    this.ring.setEnabled(false);

    // A second, thinner ring just inside: reads as a reticle rather than a plain circle, and gives
    // the spin something to be visible against.
    this.innerMat = new StandardMaterial("targetRingInnerMat", scene);
    this.innerMat.disableLighting = true;
    this.innerMat.emissiveColor = new Color3(1, 0.9, 0.62);
    this.innerMat.alpha = 0.45;
    this.innerMat.backFaceCulling = false;

    this.inner = MeshBuilder.CreateTorus("targetRingInner", { diameter: 1.5, thickness: 0.03, tessellation: 28 }, scene);
    this.inner.material = this.innerMat;
    this.inner.isPickable = false;
    this.inner.parent = this.ring;
  }

  /** Sit the ring under `feet`, sized for a model of `scale`. Call every frame while a target holds. */
  follow(feet: Vector3, scale = 1): void {
    this.radius = BASE_RADIUS * scale;
    this.ring.position.set(feet.x, feet.y + LIFT, feet.z);
    if (!this.visible) {
      this.visible = true;
      this.ring.setEnabled(true);
    }
  }

  /** Acknowledge a NEW target: a quick swell that settles into the resting ring. */
  flash(): void {
    this.pulse = PULSE_DUR;
  }

  hide(): void {
    if (!this.visible) return;
    this.visible = false;
    this.ring.setEnabled(false);
  }

  /** Advance the spin and the acquisition pulse. */
  update(dt: number): void {
    if (!this.visible) return;
    this.spin = (this.spin + dt * SPIN) % 1;
    this.ring.rotation.y = this.spin * Math.PI * 2;

    let s = this.radius;
    if (this.pulse > 0) {
      this.pulse = Math.max(0, this.pulse - dt);
      const k = this.pulse / PULSE_DUR; // 1 → 0
      s = this.radius * (1 + PULSE_SWELL * k * k);
      this.mat.alpha = 0.85 + 0.15 * k;
      this.innerMat.alpha = 0.45 + 0.4 * k;
    }
    this.ring.scaling.set(s, 1, s);
  }

  dispose(): void {
    this.inner.dispose();
    this.ring.dispose();
    this.mat.dispose();
    this.innerMat.dispose();
  }
}
