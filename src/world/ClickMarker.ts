import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";

/** Seconds the click's ring takes to spread and fade. */
const PING_SECONDS = 0.7;

/**
 * Where a click-to-move click landed (desktop): a ring that spreads and fades on the ground at the
 * spot, and a small ring that stays there, pulsing, while the hero walks to it. Flat on the
 * ground at the picked point (which already carries the map's relief), unlit, never pickable.
 */
export class ClickMarker {
  private readonly ping: Mesh;
  private readonly goal: Mesh;
  private readonly pingMat: StandardMaterial;
  private readonly goalMat: StandardMaterial;
  private t = Infinity;
  private pulse = 0;

  constructor(scene: Scene) {
    const mat = (name: string): StandardMaterial => {
      const m = new StandardMaterial(name, scene);
      m.emissiveColor = new Color3(0.6, 1, 0.8);
      m.diffuseColor = Color3.Black();
      m.specularColor = Color3.Black();
      m.disableLighting = true;
      m.alpha = 0;
      m.backFaceCulling = false;
      return m;
    };
    this.pingMat = mat("clickPing");
    this.goalMat = mat("clickGoal");
    this.ping = MeshBuilder.CreateTorus("clickPing", { diameter: 0.8, thickness: 0.07, tessellation: 40 }, scene);
    this.goal = MeshBuilder.CreateTorus("clickGoal", { diameter: 0.5, thickness: 0.06, tessellation: 32 }, scene);
    for (const m of [this.ping, this.goal]) {
      m.isPickable = false;
      m.receiveShadows = false;
      m.setEnabled(false);
    }
    this.ping.material = this.pingMat;
    this.goal.material = this.goalMat;
  }

  /** A click landed here: ring out, and mark the spot until the hero gets there. */
  show(at: Vector3): void {
    const p = at.add(new Vector3(0, 0.03, 0));
    this.ping.position.copyFrom(p);
    this.goal.position.copyFrom(p);
    this.t = 0;
    this.pulse = 0;
    this.ping.setEnabled(true);
    this.goal.setEnabled(true);
  }

  /** Advance the ring (real seconds); `walking` keeps the goal marker up. */
  update(dt: number, walking: boolean): void {
    if (this.t < PING_SECONDS) {
      this.t += dt;
      const k = Math.min(1, this.t / PING_SECONDS);
      const s = 0.6 + 2.4 * k;
      this.ping.scaling.set(s, 1, s);
      this.pingMat.alpha = (1 - k) * (1 - k);
      if (k >= 1) this.ping.setEnabled(false);
    }
    if (walking) {
      this.pulse += dt;
      const b = 0.5 + 0.5 * Math.sin(this.pulse * 7);
      this.goalMat.alpha = 0.6 + 0.4 * b;
      const s = 1 + 0.12 * b;
      this.goal.scaling.set(s, 1, s);
    } else if (this.goal.isEnabled()) this.goal.setEnabled(false);
  }

  dispose(): void {
    this.ping.dispose();
    this.goal.dispose();
    this.pingMat.dispose();
    this.goalMat.dispose();
  }
}
