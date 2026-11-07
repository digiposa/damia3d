import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import { ELEMENT_COLOR } from "../combat/element";
import type { DropThing } from "../data/drops";

/** Seconds the drop takes to pop out of the fallen enemy and land. */
const POP_SECONDS = 0.5;
/** Walk within this distance (world units) to pick it up. */
const PICKUP_RANGE = 1.1;
/** Seconds the picked-up gem takes to rise and fade. */
const COLLECT_SECONDS = 0.35;

/** The colour a drop shines in: green for a healing item, its element's for an attack item, gold
 *  for a piece of gear. */
export function dropColor(thing: DropThing): Color3 {
  if (thing.kind === "equip") return Color3.FromHexString("#ffd75e");
  const d = thing.def;
  if (d.attack) return Color3.FromHexString(ELEMENT_COLOR[d.attack.element]);
  if (d.mpRestore) return Color3.FromHexString("#8f7bff");
  if (d.spRestore) return Color3.FromHexString("#6fe3c0");
  return Color3.FromHexString("#7ee08a");
}

/**
 * An item left on the ground by a fallen enemy: it pops out of the body in a little arc, then waits
 * — a small spinning gem bobbing over a ring on the ground, under a faint column of light, in the
 * colour of what it is — until the hero walks over it. Then it rises and fades, and the mode puts
 * the thing in the party's stock.
 */
export class GroundDrop {
  readonly thing: DropThing;
  private readonly root: TransformNode;
  private readonly gem: Mesh;
  private readonly mats: StandardMaterial[] = [];
  private readonly from: Vector3;
  private readonly to: Vector3;
  private t = 0;
  private collecting = -1;
  private done = false;

  constructor(scene: Scene, thing: DropThing, from: Vector3, to: Vector3) {
    this.thing = thing;
    this.from = from.clone();
    this.to = to.clone();
    const tint = dropColor(thing);
    const glow = (name: string, alpha: number, k = 1): StandardMaterial => {
      const m = new StandardMaterial(name, scene);
      m.diffuseColor = Color3.Black();
      m.specularColor = Color3.Black();
      m.emissiveColor = tint.scale(k);
      m.disableLighting = true;
      m.alpha = alpha;
      m.backFaceCulling = false;
      this.mats.push(m);
      return m;
    };
    this.root = new TransformNode("groundDrop", scene);
    this.root.position.copyFrom(from);

    this.gem = MeshBuilder.CreatePolyhedron("dropGem", { type: 1, size: 0.13 }, scene); // an octahedron
    this.gem.scaling.y = 1.5;
    this.gem.material = glow("dropGemMat", 1, 1.1);
    this.gem.parent = this.root;

    const beam = MeshBuilder.CreateCylinder("dropBeam", { height: 1.8, diameterTop: 0.04, diameterBottom: 0.18, tessellation: 10 }, scene);
    beam.position.y = 0.9;
    beam.material = glow("dropBeamMat", 0.22);
    beam.parent = this.root;
    beam.setEnabled(false); // lit once it has landed

    const ring = MeshBuilder.CreateTorus("dropRing", { diameter: 0.6, thickness: 0.04, tessellation: 28 }, scene);
    ring.position.y = 0.03;
    ring.material = glow("dropRingMat", 0.7);
    ring.parent = this.root;
    ring.setEnabled(false);

    for (const m of [this.gem, beam, ring]) m.isPickable = false;
    this.landed = [beam, ring];
  }

  private readonly landed: Mesh[];

  /** Advance it; `near` is the hero's position. Calls `pick` once when walked over. Returns false
   *  once it is gone (picked up and faded). */
  update(dt: number, near: Vector3, pick: (thing: DropThing) => void): boolean {
    if (this.done) return false;
    this.t += dt;
    if (this.collecting >= 0) {
      this.collecting += dt;
      const k = Math.min(1, this.collecting / COLLECT_SECONDS);
      this.gem.position.y += dt * 2.5;
      this.root.scaling.setAll(1 - 0.6 * k);
      for (const m of this.mats) m.alpha *= 1 - k;
      if (k >= 1) this.dispose();
      return !this.done;
    }
    if (this.t < POP_SECONDS) {
      // Out of the body in a little arc to its spot on the ground.
      const k = this.t / POP_SECONDS;
      Vector3.LerpToRef(this.from, this.to, k, this.root.position);
      this.root.position.y = this.from.y * (1 - k) + this.to.y * k + 1.2 * 4 * k * (1 - k);
      this.gem.rotation.y += dt * 12;
      return true;
    }
    if (!this.landed[0].isEnabled()) {
      this.root.position.copyFrom(this.to);
      for (const m of this.landed) m.setEnabled(true);
    }
    this.gem.rotation.y += dt * 2.2;
    this.gem.position.y = 0.5 + 0.08 * Math.sin(this.t * 3);
    this.landed[1].scaling.setAll(1 + 0.12 * Math.sin(this.t * 4));
    const dx = near.x - this.to.x;
    const dz = near.z - this.to.z;
    if (dx * dx + dz * dz <= PICKUP_RANGE * PICKUP_RANGE) {
      this.collecting = 0;
      pick(this.thing);
    }
    return true;
  }

  dispose(): void {
    if (this.done) return;
    this.done = true;
    this.root.dispose();
    for (const m of this.mats) m.dispose();
  }
}
