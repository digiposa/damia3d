import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { FresnelParameters } from "@babylonjs/core/Materials/fresnelParameters";
import { Vector3, Quaternion } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

/** Body segments behind the head, and the gap between two of them. */
const SEGMENTS = 11;
const GAP = 0.42;

/**
 * A dragon made of fire (the Red-Eye Dragon summon): a horned head with a snout and glowing eyes
 * that leads, a serpentine body of tapering segments with dorsal spines that follows it on a
 * chain and undulates, and two flapping wings behind the head. All emissive, no lighting — it IS
 * the light. The caller moves the head ({@link update}) and fades it out ({@link fade}).
 */
/** The beast's colours: the head's core, the body, the wings / spines / horns, the rim glow. */
export interface DragonPalette {
  hot: [number, number, number];
  body: [number, number, number];
  ember: [number, number, number];
  rim: [number, number, number];
}

/** Fire (the Red-Eye Dragon). */
export const FIRE_PALETTE: DragonPalette = { hot: [1, 0.86, 0.45], body: [1, 0.5, 0.12], ember: [0.9, 0.22, 0.04], rim: [1, 0.95, 0.7] };
/** Wind (the Jade Dragoon's feathered serpent): jade and pale green, a white rim. */
export const WIND_PALETTE: DragonPalette = { hot: [0.85, 1, 0.9], body: [0.4, 0.92, 0.62], ember: [0.2, 0.65, 0.48], rim: [0.95, 1, 0.98] };

export class FlameDragon {
  readonly head: TransformNode;
  private readonly body: Mesh[] = [];
  private readonly wingL: Mesh;
  private readonly wingR: Mesh;
  private readonly mats: StandardMaterial[] = [];
  private readonly alphas: number[] = [];
  private readonly prevHead: Vector3;
  private readonly heading = new Vector3(0, 0, 1);
  private t = 0;

  constructor(scene: Scene, at: Vector3, palette: DragonPalette = FIRE_PALETTE) {
    const mat = (name: string, r: number, g: number, b: number, alpha: number): StandardMaterial => {
      const m = new StandardMaterial(name, scene);
      m.disableLighting = true;
      m.emissiveColor = new Color3(r, g, b);
      // Rim glow: the silhouette burns white-hot, the middle keeps the body colour — a plasma look.
      m.emissiveFresnelParameters = new FresnelParameters();
      m.emissiveFresnelParameters.bias = 0.35;
      m.emissiveFresnelParameters.power = 2.2;
      m.emissiveFresnelParameters.leftColor = new Color3(...palette.rim);
      m.emissiveFresnelParameters.rightColor = new Color3(r, g, b);
      m.alpha = alpha;
      m.backFaceCulling = false;
      this.mats.push(m);
      this.alphas.push(alpha);
      return m;
    };
    const hot = mat("fxDragonHot", ...palette.hot, 0.95); // the head's core
    const flame = mat("fxDragonFlame", ...palette.body, 0.88); // the body
    const ember = mat("fxDragonEmber", ...palette.ember, 0.8); // wings, spines, horns
    const eye = mat("fxDragonEye", 1, 1, 0.7, 1);

    // --- Head: skull + snout along +z, horns swept back, eyes, lower jaw ---
    this.head = new TransformNode("fxDragonHead", scene);
    this.head.position.copyFrom(at);
    this.head.rotationQuaternion = Quaternion.Identity();
    const skull = MeshBuilder.CreateSphere("fxDragonSkull", { diameter: 0.8, segments: 10 }, scene);
    skull.scaling.set(1, 0.85, 1.1);
    skull.material = hot;
    skull.parent = this.head;
    const snout = MeshBuilder.CreateCylinder("fxDragonSnout", { height: 1.0, diameterTop: 0.28, diameterBottom: 0.62, tessellation: 10 }, scene);
    snout.rotation.x = Math.PI / 2; // cylinder's axis (+y) → +z: the snout points forward
    snout.position.z = 0.75;
    snout.scaling.set(1, 1, 0.75); // flatter than wide
    snout.material = hot;
    snout.parent = this.head;
    const jaw = MeshBuilder.CreateBox("fxDragonJaw", { width: 0.4, height: 0.1, depth: 0.9 }, scene);
    jaw.position.set(0, -0.24, 0.65);
    jaw.rotation.x = 0.18; // open a crack
    jaw.material = flame;
    jaw.parent = this.head;
    for (const side of [-1, 1]) {
      const horn = MeshBuilder.CreateCylinder("fxDragonHorn", { height: 0.75, diameterTop: 0.02, diameterBottom: 0.16, tessellation: 6 }, scene);
      horn.position.set(side * 0.26, 0.3, -0.2);
      horn.rotation.x = -0.9; // swept back and up
      horn.rotation.z = side * 0.35;
      horn.material = ember;
      horn.parent = this.head;
      const e = MeshBuilder.CreateSphere("fxDragonEye", { diameter: 0.14, segments: 6 }, scene);
      e.position.set(side * 0.24, 0.12, 0.34);
      e.material = eye;
      e.parent = this.head;
    }
    for (const n of this.head.getChildMeshes()) n.isPickable = false;

    // --- Body: tapering segments on a chain, a dorsal spine on every other one ---
    for (let i = 0; i < SEGMENTS; i++) {
      const k = i / (SEGMENTS - 1);
      const seg = MeshBuilder.CreateSphere(`fxDragonSeg${i}`, { diameter: 0.72 - 0.52 * k, segments: 8 }, scene);
      seg.scaling.set(1, 0.9, 1.3); // stretched along the chain
      seg.material = flame;
      seg.isPickable = false;
      seg.position.copyFrom(at);
      seg.rotationQuaternion = Quaternion.Identity();
      if (i % 2 === 0 && i < SEGMENTS - 2) {
        const spine = MeshBuilder.CreateCylinder("fxDragonSpine", { height: 0.4 - 0.2 * k, diameterTop: 0.02, diameterBottom: 0.12, tessellation: 5 }, scene);
        spine.position.y = 0.3 - 0.18 * k;
        spine.rotation.x = -0.5; // raked back
        spine.material = ember;
        spine.isPickable = false;
        spine.parent = seg;
      }
      this.body.push(seg);
    }

    // --- Wings: a swept triangle each, on the second segment, flapping about the body ---
    const wing = (side: number): Mesh => {
      const m = new Mesh("fxDragonWing", scene);
      const vd = new VertexData();
      const s = side;
      // root at the body, tip out and back, a trailing point: a bat-wing silhouette
      vd.positions = [0, 0, 0.1, s * 1.9, 0.5, -0.4, s * 1.5, 0.05, -1.3, s * 0.9, -0.1, -0.5, s * 1.1, 0.35, 0.3];
      vd.indices = [0, 1, 2, 0, 2, 3, 0, 4, 1];
      vd.normals = [];
      VertexData.ComputeNormals(vd.positions, vd.indices, vd.normals);
      vd.applyToMesh(m);
      m.material = ember;
      m.isPickable = false;
      m.parent = this.body[1];
      return m;
    };
    this.wingL = wing(-1);
    this.wingR = wing(1);
    this.prevHead = at.clone();
  }

  /** The way the head is flying (unit, world). */
  get direction(): Vector3 {
    return this.heading.clone();
  }

  /** Move the head to `pos` (the body trails, undulating); `dt` drives the flap and the ripple. */
  update(dt: number, pos: Vector3, look?: Vector3): void {
    this.t += dt;
    const v = pos.subtract(this.prevHead);
    if (look) {
      // Told where to look (hovering in place, facing the foes): ease the heading round to it.
      this.heading.addInPlace(look.subtract(this.heading).scaleInPlace(Math.min(1, dt * 6))).normalize();
      this.prevHead.copyFrom(pos);
    } else if (v.length() > 1e-3) {
      this.heading.copyFrom(v).normalize();
      this.prevHead.copyFrom(pos);
    }
    this.head.position.copyFrom(pos);
    this.head.lookAt(pos.add(this.heading));
    // The chain: each segment keeps its gap to the one ahead, then sways sideways in a wave that
    // runs down the body.
    let ahead = pos;
    let dirAhead = this.heading;
    for (let i = 0; i < this.body.length; i++) {
      const seg = this.body[i];
      const d = seg.position.subtract(ahead);
      const len = d.length();
      const dir = len > 1e-4 ? d.scale(1 / len) : dirAhead.scale(-1);
      seg.position.copyFrom(ahead.add(dir.scale(GAP)));
      const side = Vector3.Cross(dir, Vector3.Up()).normalize();
      seg.position.addInPlace(side.scale(Math.sin(this.t * 9 - i * 0.7) * 0.07 * (1 + i * 0.15)));
      seg.lookAt(ahead); // the stretched sphere points along the chain
      ahead = seg.position;
      dirAhead = dir.scale(-1);
    }
    const flap = Math.sin(this.t * 11) * 0.65;
    this.wingL.rotation.z = -flap;
    this.wingR.rotation.z = flap;
  }

  /** Somewhere on the body to spit flames from this frame (the caller moves a flame emitter here). */
  flamePoint(): Vector3 {
    const i = Math.floor(Math.random() * (this.body.length - 2));
    return this.body[i].position;
  }

  /** Fade the whole beast toward nothing (0 = full, 1 = gone). */
  fade(k: number): void {
    this.mats.forEach((m, i) => (m.alpha = this.alphas[i] * (1 - k)));
  }

  dispose(): void {
    this.head.dispose();
    for (const s of this.body) s.dispose();
    for (const m of this.mats) m.dispose();
  }
}
