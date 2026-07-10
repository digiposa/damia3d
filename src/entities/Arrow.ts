import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

/**
 * A flying arrow projectile: a thin shaft + steel head + fletching, oriented along
 * its flight path. Travels in a straight line from `from` to `to`; on arrival it
 * fires `onHit` once and disposes itself. Purely visual — the mode owns the damage.
 */
export class Arrow {
  private readonly root: TransformNode;
  private readonly target: Vector3;
  private done = false;

  constructor(
    scene: Scene,
    from: Vector3,
    to: Vector3,
    private speed: number,
    private onHit: () => void,
    private delay = 0,
    /** Optional live target: when set, the projectile re-aims at it each frame (homing) so it
     *  reaches a moving target — the hit always connects (turn-based combat, no live dodging). */
    private follow?: () => Vector3,
  ) {
    this.root = new TransformNode("arrow", scene);
    this.root.position = from.clone();
    if (delay > 0) this.root.setEnabled(false); // hidden while the archer draws

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

    this.target = to.clone();
    this.root.lookAt(to);
  }

  /** Advance the arrow; returns false once it has landed (and disposed). Re-aims at a live target
   *  each frame when {@link follow} is set, so a homing projectile always reaches a moving target. */
  update(dt: number): boolean {
    if (this.done) return false;
    if (this.delay > 0) {
      this.delay -= dt;
      if (this.delay > 0) return true; // still drawing — hold at the hand, hidden
      this.root.setEnabled(true); // released: appear and fly
    }
    const target = this.follow ? this.follow() : this.target;
    const delta = target.subtract(this.root.position);
    const dist = delta.length();
    const step = this.speed * dt;
    if (step >= dist) {
      this.done = true;
      this.onHit();
      this.root.dispose();
      return false;
    }
    this.root.position.addInPlace(delta.scaleInPlace(step / dist));
    this.root.lookAt(target);
    return true;
  }

  dispose(): void {
    if (this.done) return;
    this.done = true;
    this.root.dispose();
  }
}
