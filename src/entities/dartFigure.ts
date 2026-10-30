import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { VertexBuffer } from "@babylonjs/core/Buffers/buffer";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

import type { Figure } from "./humanoid";

/**
 * Dart, built entirely in code after his CG render: spiky golden hair under a red headband, a
 * sculpted, glossy red cuirass (pecs and segmented abs) over a black turtleneck, a big layered
 * pauldron and fully plated left arm, a bare right arm with a leather bracer, a studded double belt,
 * dark trousers with red knee guards, brown cuffed boots — and his sword, long and slim, with a red
 * pointed guard and a gold pommel.
 *
 * A real joint hierarchy (hips → spine → chest → neck/head, shoulders → elbows → hands, hips →
 * knees → ankles) driven by a procedural animator: idle breathing, a walk with knees and elbows that
 * bend, counter-twisting shoulders, a headband that trails — and a two-handed-weight sword swing.
 *
 * Coordinates: feet at y = 0, facing +Z, character's right = +X (the sword hand).
 */

/** Seconds one strike lasts (matches the placeholder's cadence). */
const STRIKE_DUR = 0.42;

// --- Materials ------------------------------------------------------------------

interface Mats {
  armor: StandardMaterial;
  armorDark: StandardMaterial;
  skin: StandardMaterial;
  hair: StandardMaterial;
  shirt: StandardMaterial;
  pants: StandardMaterial;
  leather: StandardMaterial;
  leatherDark: StandardMaterial;
  silver: StandardMaterial;
  gold: StandardMaterial;
  band: StandardMaterial;
  eye: StandardMaterial;
  white: StandardMaterial;
  brow: StandardMaterial;
  lip: StandardMaterial;
  blade: StandardMaterial;
  grip: StandardMaterial;
}

function material(
  scene: Scene,
  name: string,
  diffuse: [number, number, number],
  specular: [number, number, number] = [0.05, 0.05, 0.05],
  power = 16,
): StandardMaterial {
  const m = new StandardMaterial(`dart_${name}`, scene);
  m.diffuseColor = new Color3(...diffuse);
  m.specularColor = new Color3(...specular);
  m.specularPower = power;
  return m;
}

function makeMats(scene: Scene): Mats {
  return {
    // Lacquered red armour: strong, warm highlights carry the sculpting.
    armor: material(scene, "armor", [0.6, 0.07, 0.05], [0.8, 0.45, 0.4], 30),
    armorDark: material(scene, "armorDark", [0.36, 0.04, 0.03], [0.4, 0.2, 0.18], 24),
    skin: material(scene, "skin", [0.96, 0.76, 0.6], [0.12, 0.09, 0.07], 12),
    hair: material(scene, "hair", [1, 1, 1], [0.35, 0.3, 0.15], 20), // tinted by vertex colours
    shirt: material(scene, "shirt", [0.07, 0.07, 0.09], [0.1, 0.1, 0.12], 10),
    pants: material(scene, "pants", [0.12, 0.12, 0.15], [0.18, 0.18, 0.22], 14),
    leather: material(scene, "leather", [0.47, 0.28, 0.14], [0.18, 0.12, 0.08], 14),
    leatherDark: material(scene, "leatherDark", [0.28, 0.17, 0.09], [0.1, 0.07, 0.05], 12),
    silver: material(scene, "silver", [0.74, 0.76, 0.8], [1, 1, 1], 64),
    gold: material(scene, "gold", [0.86, 0.62, 0.2], [1, 0.85, 0.5], 48),
    band: material(scene, "band", [0.78, 0.1, 0.1], [0.15, 0.06, 0.06], 10),
    eye: material(scene, "eye", [0.14, 0.32, 0.62], [0.6, 0.6, 0.7], 40),
    white: material(scene, "white", [0.95, 0.94, 0.92]),
    brow: material(scene, "brow", [0.42, 0.26, 0.1]),
    lip: material(scene, "lip", [0.66, 0.4, 0.34]),
    blade: material(scene, "blade", [0.82, 0.84, 0.9], [1, 1, 1], 90),
    grip: material(scene, "grip", [0.3, 0.06, 0.05], [0.2, 0.1, 0.1], 16),
  };
}

// --- Geometry helpers -------------------------------------------------------------

interface Ring {
  /** Height. */
  y: number;
  /** Half-width (x) and half-depth (z). */
  w: number;
  d: number;
  /** Forward offset of the ring's centre. */
  z?: number;
}

/**
 * A smooth closed shell through elliptical rings (torso, cuirass, hips, boots): the organic
 * volumes boxes can't give. Seamless (the ring wraps by index), capped top and bottom.
 */
function loft(name: string, rings: Ring[], scene: Scene, seg = 20): Mesh {
  const positions: number[] = [];
  const indices: number[] = [];
  for (const r of rings)
    for (let s = 0; s < seg; s++) {
      const a = (s / seg) * Math.PI * 2;
      positions.push(Math.sin(a) * r.w, r.y, (r.z ?? 0) + Math.cos(a) * r.d);
    }
  for (let i = 0; i + 1 < rings.length; i++)
    for (let s = 0; s < seg; s++) {
      const a = i * seg + s;
      const b = i * seg + ((s + 1) % seg);
      const c = (i + 1) * seg + s;
      const d = (i + 1) * seg + ((s + 1) % seg);
      indices.push(a, b, c, b, d, c);
    }
  // Caps.
  const bottom = rings[0];
  const top = rings[rings.length - 1];
  const bi = positions.length / 3;
  positions.push(0, bottom.y, bottom.z ?? 0);
  const ti = bi + 1;
  positions.push(0, top.y, top.z ?? 0);
  const last = (rings.length - 1) * seg;
  for (let s = 0; s < seg; s++) {
    indices.push(bi, s, (s + 1) % seg);
    indices.push(ti, last + ((s + 1) % seg), last + s);
  }
  const normals: number[] = [];
  VertexData.ComputeNormals(positions, indices, normals);
  const vd = new VertexData();
  vd.positions = positions;
  vd.indices = indices;
  vd.normals = normals;
  const mesh = new Mesh(name, scene);
  vd.applyToMesh(mesh);
  // Wound the wrong way for Babylon's front faces? Make the shell double-sided-proof by flipping
  // if the normals point inward (checked on a side vertex).
  const n = mesh.getVerticesData(VertexBuffer.NormalKind)!;
  if (n[0] * positions[0] + n[2] * (positions[2] - (rings[0].z ?? 0)) < 0) {
    mesh.flipFaces(true);
  }
  return mesh;
}

/** A tapered limb segment hanging from its joint (rounded ends). */
function segment(name: string, len: number, r0: number, r1: number, scene: Scene, tess = 14): Mesh {
  const m = MeshBuilder.CreateCapsule(
    name,
    { height: len + r0 + r1, radiusTop: r0, radiusBottom: r1, tessellation: tess, subdivisions: 2, capSubdivisions: 4 },
    scene,
  );
  m.position.y = -len / 2;
  return m;
}

/** An ellipsoid (radii x, y, z). */
function blob(name: string, rx: number, ry: number, rz: number, scene: Scene, seg = 14): Mesh {
  const m = MeshBuilder.CreateSphere(name, { diameterX: rx * 2, diameterY: ry * 2, diameterZ: rz * 2, segments: seg }, scene);
  return m;
}

/** Orient a node so its local +Y points along `dir` (expressed in the parent's space). */
function aim(node: TransformNode, dir: Vector3): void {
  const q = new Quaternion();
  Quaternion.FromUnitVectorsToRef(Vector3.Up(), dir.normalizeToNew(), q);
  node.rotationQuaternion = q;
}

/** Vertex colours graded along the mesh's local Y: `lo` at its lowest point, `hi` at its highest. */
function gradeY(mesh: Mesh, lo: [number, number, number], hi: [number, number, number]): void {
  const pos = mesh.getVerticesData(VertexBuffer.PositionKind)!;
  let min = Infinity;
  let max = -Infinity;
  for (let i = 1; i < pos.length; i += 3) {
    min = Math.min(min, pos[i]);
    max = Math.max(max, pos[i]);
  }
  const c: number[] = [];
  for (let i = 1; i < pos.length; i += 3) {
    const t = (pos[i] - min) / (max - min || 1);
    c.push(lo[0] + (hi[0] - lo[0]) * t, lo[1] + (hi[1] - lo[1]) * t, lo[2] + (hi[2] - lo[2]) * t, 1);
  }
  mesh.setVerticesData(VertexBuffer.ColorKind, c);
}

// --- The figure ----------------------------------------------------------------------

export class DartFigure implements Figure {
  readonly rig: TransformNode;

  private readonly hips: TransformNode;
  private readonly chest: TransformNode;
  private readonly neck: TransformNode;
  private readonly head: TransformNode;
  private readonly shoulder: { L: TransformNode; R: TransformNode };
  private readonly elbow: { L: TransformNode; R: TransformNode };
  private readonly hand: { L: TransformNode; R: TransformNode };
  private readonly thigh: { L: TransformNode; R: TransformNode };
  private readonly knee: { L: TransformNode; R: TransformNode };
  private readonly ankle: { L: TransformNode; R: TransformNode };
  private readonly tails: TransformNode[] = [];

  private phase = 0;
  private time = 0;
  /** 0 standing … 1 walking, eased so starts and stops blend. */
  private gait = 0;
  private strikeT = 0;

  constructor(scene: Scene, opts: { scale?: number } = {}) {
    const m = makeMats(scene);
    const node = (name: string, parent: TransformNode, x = 0, y = 0, z = 0): TransformNode => {
      const n = new TransformNode(`dart_${name}`, scene);
      n.parent = parent;
      n.position.set(x, y, z);
      return n;
    };
    const put = <T extends Mesh>(mesh: T, mat: StandardMaterial, parent: TransformNode, x = 0, y = 0, z = 0): T => {
      mesh.material = mat;
      mesh.parent = parent;
      mesh.position.addInPlace(new Vector3(x, y, z));
      mesh.isPickable = false;
      return mesh;
    };

    this.rig = new TransformNode("dartFigure", scene);
    this.rig.scaling.setAll(opts.scale ?? 1);

    // Skeleton.
    this.hips = node("hips", this.rig, 0, 0.98, 0);
    const spine = node("spine", this.hips, 0, 0.08, 0);
    this.chest = node("chest", spine, 0, 0.22, 0);
    this.neck = node("neck", this.chest, 0, 0.215, -0.005);
    this.head = node("head", this.neck, 0, 0.065, 0.005);
    this.shoulder = { L: node("shoulderL", this.chest, -0.205, 0.15, -0.005), R: node("shoulderR", this.chest, 0.205, 0.15, -0.005) };
    this.elbow = { L: node("elbowL", this.shoulder.L, 0, -0.29, 0), R: node("elbowR", this.shoulder.R, 0, -0.29, 0) };
    this.hand = { L: node("handL", this.elbow.L, 0, -0.265, 0), R: node("handR", this.elbow.R, 0, -0.265, 0) };
    this.thigh = { L: node("thighL", this.hips, -0.098, -0.06, 0), R: node("thighR", this.hips, 0.098, -0.06, 0) };
    this.knee = { L: node("kneeL", this.thigh.L, 0, -0.45, 0), R: node("kneeR", this.thigh.R, 0, -0.45, 0) };
    this.ankle = { L: node("ankleL", this.knee.L, 0, -0.41, 0), R: node("ankleR", this.knee.R, 0, -0.41, 0) };

    this.buildTorso(scene, m, put);
    this.buildHead(scene, m, put, node);
    this.buildArms(scene, m, put);
    this.buildLegs(scene, m, put);
    this.buildSword(scene, m, put, node);
  }

  // --- Body -------------------------------------------------------------------------

  private buildTorso(scene: Scene, m: Mats, put: PutFn): void {
    // Black turtleneck body, waist to neck.
    put(
      loft("dart_shirt", [
        { y: -0.31, w: 0.13, d: 0.095 },
        { y: -0.16, w: 0.135, d: 0.1 },
        { y: 0.0, w: 0.155, d: 0.11 },
        { y: 0.12, w: 0.18, d: 0.115 },
        { y: 0.19, w: 0.165, d: 0.105 },
        { y: 0.225, w: 0.07, d: 0.065 },
      ], scene),
      m.shirt,
      this.chest,
    );
    // Turtleneck collar and neck.
    put(segment("dart_collar", 0.07, 0.058, 0.064, scene), m.shirt, this.neck, 0, 0.05, 0);
    put(segment("dart_neckSkin", 0.06, 0.046, 0.046, scene), m.skin, this.neck, 0, 0.1, 0.004);

    // The cuirass: a shell a little proud of the shirt, chest to the bottom of the ribs.
    put(
      loft("dart_cuirass", [
        { y: -0.21, w: 0.148, d: 0.116, z: 0.006 },
        { y: -0.12, w: 0.152, d: 0.12, z: 0.008 },
        { y: -0.02, w: 0.165, d: 0.128, z: 0.01 },
        { y: 0.08, w: 0.188, d: 0.134, z: 0.012 },
        { y: 0.16, w: 0.19, d: 0.126, z: 0.006 },
        { y: 0.205, w: 0.135, d: 0.1 },
        { y: 0.215, w: 0.085, d: 0.075 },
      ], scene),
      m.armor,
      this.chest,
    );
    // A darker lip along its bottom edge.
    const rim = put(MeshBuilder.CreateTorus("dart_cuirassRim", { diameter: 1, thickness: 0.05, tessellation: 24 }, scene), m.armorDark, this.chest, 0, -0.205, 0.006);
    rim.scaling.set(0.3, 0.35, 0.235);
    // Sculpted pecs and abs — what makes the CG cuirass read.
    for (const sx of [-1, 1]) {
      const pec = put(blob(`dart_pec${sx}`, 0.074, 0.056, 0.03, scene), m.armor, this.chest, sx * 0.074, 0.095, 0.124);
      pec.rotation.z = sx * -0.15;
      for (let row = 0; row < 3; row++) {
        const ab = put(blob(`dart_ab${sx}${row}`, 0.05, 0.034, 0.016, scene, 12), m.armor, this.chest, sx * 0.047, 0.008 - row * 0.06, 0.122 - row * 0.004);
        ab.rotation.z = sx * 0.08;
      }
      // Side plates over the ribs.
      const rib = put(blob(`dart_rib${sx}`, 0.04, 0.075, 0.05, scene, 10), m.armor, this.chest, sx * 0.135, -0.02, 0.06);
      rib.rotation.y = sx * 0.6;
    }
    // Back plate ridges.
    for (const sx of [-1, 1]) put(blob(`dart_shoulderBlade${sx}`, 0.07, 0.08, 0.02, scene), m.armor, this.chest, sx * 0.07, 0.09, -0.122);

    // Hips: dark trousers.
    put(
      loft("dart_hipsPants", [
        { y: -0.13, w: 0.115, d: 0.09 },
        { y: -0.06, w: 0.14, d: 0.1 },
        { y: 0.04, w: 0.138, d: 0.1 },
        { y: 0.1, w: 0.13, d: 0.095 },
      ], scene),
      m.pants,
      this.hips,
    );
    // Double belt: a broad studded one, and a thinner one slung lower on the hip.
    const belt = put(MeshBuilder.CreateTorus("dart_belt", { diameter: 1, thickness: 0.06, tessellation: 28 }, scene), m.leather, this.hips, 0, 0.04, 0);
    belt.scaling.set(0.285, 0.9, 0.205);
    const belt2 = put(MeshBuilder.CreateTorus("dart_belt2", { diameter: 1, thickness: 0.035, tessellation: 28 }, scene), m.leatherDark, this.hips, 0, -0.02, 0);
    belt2.scaling.set(0.3, 0.9, 0.215);
    belt2.rotation.z = 0.14;
    // Buckles and studs.
    put(MeshBuilder.CreateBox("dart_buckle", { width: 0.05, height: 0.042, depth: 0.012 }, scene), m.silver, this.hips, 0, 0.04, 0.104);
    for (const sx of [-1, 1]) {
      put(MeshBuilder.CreateBox(`dart_stud${sx}`, { width: 0.03, height: 0.03, depth: 0.012 }, scene), m.silver, this.hips, sx * 0.085, 0.04, 0.088).rotation.y = sx * 0.6;
      put(MeshBuilder.CreateBox(`dart_stud2${sx}`, { width: 0.022, height: 0.022, depth: 0.012 }, scene), m.silver, this.hips, sx * 0.13, 0.04, 0.03).rotation.y = sx * 1.2;
    }
    // A ring and a small knife hanging at the front-left of the belt.
    const ring = put(MeshBuilder.CreateTorus("dart_ring", { diameter: 0.04, thickness: 0.008, tessellation: 14 }, scene), m.silver, this.hips, -0.05, -0.02, 0.1);
    ring.rotation.x = Math.PI / 2;
    put(MeshBuilder.CreateBox("dart_knife", { width: 0.014, height: 0.08, depth: 0.008 }, scene), m.silver, this.hips, 0.055, -0.045, 0.104).rotation.z = 0.2;
    put(MeshBuilder.CreateBox("dart_knifeGrip", { width: 0.018, height: 0.035, depth: 0.014 }, scene), m.leatherDark, this.hips, 0.05, -0.0, 0.104);
  }

  private buildHead(scene: Scene, m: Mats, put: PutFn, node: NodeFn): void {
    const h = this.head;
    // Skull and jaw: a long, lean face with a firm chin.
    // One smooth shell from chin to crown: a long, lean face with a firm chin (no seams between parts).
    put(
      loft("dart_headShell", [
        { y: 0.012, w: 0.018, d: 0.016, z: 0.052 },
        { y: 0.026, w: 0.04, d: 0.042, z: 0.04 },
        { y: 0.05, w: 0.06, d: 0.068, z: 0.024 },
        { y: 0.08, w: 0.076, d: 0.086, z: 0.012 },
        { y: 0.115, w: 0.089, d: 0.099, z: 0.004 },
        { y: 0.15, w: 0.093, d: 0.103, z: 0.0 },
        { y: 0.19, w: 0.087, d: 0.098, z: -0.006 },
        { y: 0.222, w: 0.066, d: 0.078, z: -0.01 },
        { y: 0.24, w: 0.03, d: 0.038, z: -0.01 },
      ], scene, 24),
      m.skin,
      h,
    );
    for (const sx of [-1, 1]) {
      put(blob(`dart_ear${sx}`, 0.012, 0.026, 0.018, scene, 8), m.skin, h, sx * 0.092, 0.11, -0.005);
    }
    // Eyes: whites, blue irises, a dark upper lid line; level, serious brows.
    for (const sx of [-1, 1]) {
      const ex = sx * 0.038;
      put(blob(`dart_eyeWhite${sx}`, 0.021, 0.011, 0.008, scene, 10), m.white, h, ex, 0.122, 0.092);
      put(blob(`dart_iris${sx}`, 0.009, 0.0095, 0.006, scene, 8), m.eye, h, ex - sx * 0.002, 0.122, 0.0985);
      const lid = put(MeshBuilder.CreateBox(`dart_lid${sx}`, { width: 0.046, height: 0.006, depth: 0.008 }, scene), m.brow, h, ex, 0.133, 0.096);
      lid.rotation.z = sx * 0.12;
      const brow = put(MeshBuilder.CreateBox(`dart_brow${sx}`, { width: 0.046, height: 0.008, depth: 0.01 }, scene), m.brow, h, ex + sx * 0.002, 0.15, 0.096);
      brow.rotation.z = sx * 0.2; // inner ends low: the determined frown
    }
    // Nose and mouth.
    const nose = put(blob("dart_nose", 0.011, 0.024, 0.014, scene, 8), m.skin, h, 0, 0.1, 0.1);
    nose.rotation.x = -0.25;
    put(MeshBuilder.CreateBox("dart_mouth", { width: 0.03, height: 0.005, depth: 0.006 }, scene), m.lip, h, 0, 0.062, 0.1);

    // Headband: a red band round the brow, knotted at the back, two tails trailing.
    const band = put(MeshBuilder.CreateTorus("dart_band", { diameter: 1, thickness: 0.036, tessellation: 30 }, scene), m.band, h, 0, 0.168, -0.004);
    band.scaling.set(0.198, 0.85, 0.222);
    band.rotation.x = -0.12;
    put(blob("dart_knot", 0.024, 0.022, 0.02, scene, 8), m.band, h, 0, 0.17, -0.112);
    for (const sx of [-1, 1]) {
      const pivot = node(`tail${sx}`, h, sx * 0.012, 0.17, -0.118);
      const tail = put(MeshBuilder.CreateBox(`dart_tail${sx}`, { width: 0.03, height: 0.2, depth: 0.006 }, scene), m.band, pivot, 0, -0.1, 0);
      tail.rotation.z = sx * 0.12;
      pivot.rotation.x = 0.5;
      this.tails.push(pivot);
    }

    // Hair: a cap over the crown, then the spikes — big ones sweeping up and back, side flicks,
    // two rising off the front, and bangs falling over the band. Darker at the roots.
    const ROOT: [number, number, number] = [0.66, 0.42, 0.16];
    const TIP: [number, number, number] = [1.0, 0.86, 0.46];
    const cap = put(blob("dart_hairCap", 0.103, 0.09, 0.112, scene, 16), m.hair, h, 0, 0.165, -0.014);
    gradeY(cap, [0.72, 0.5, 0.2], [0.95, 0.76, 0.36]);
    const spike = (x: number, y: number, z: number, dir: [number, number, number], len: number, base: number): void => {
      const pivot = node("spike", h, x, y, z);
      aim(pivot, new Vector3(...dir));
      const cone = put(MeshBuilder.CreateCylinder("dart_spike", { height: len, diameterTop: 0, diameterBottom: base, tessellation: 6 }, scene), m.hair, pivot, 0, len / 2, 0);
      cone.scaling.z = 0.55; // flattened: locks, not cones
      gradeY(cone, ROOT, TIP);
    };
    // Big, blade-like locks sweeping up and back like a flame, a few framing the temples, and bangs
    // falling over the band — fewer, fuller spikes than a hedgehog.
    spike(0.0, 0.2, 0.0, [0.05, 1, -0.45], 0.27, 0.12);
    spike(0.05, 0.19, -0.02, [0.55, 1, -0.6], 0.24, 0.11);
    spike(-0.05, 0.19, -0.02, [-0.5, 1, -0.65], 0.25, 0.11);
    spike(0.07, 0.17, -0.06, [0.9, 0.55, -0.7], 0.2, 0.1);
    spike(-0.07, 0.17, -0.06, [-0.9, 0.5, -0.7], 0.2, 0.1);
    spike(0.0, 0.16, -0.08, [0.1, 0.5, -1], 0.2, 0.11);
    spike(0.035, 0.215, 0.04, [0.3, 1, 0.15], 0.2, 0.1);
    spike(-0.03, 0.21, 0.035, [-0.4, 1, 0.05], 0.17, 0.095);
    for (const sx of [-1, 1]) spike(sx * 0.085, 0.16, 0.0, [sx, 0.35, -0.25], 0.13, 0.075);
    for (const [x, len, lean] of [[-0.062, 0.075, -0.6], [-0.025, 0.085, -0.25], [0.018, 0.08, 0.2], [0.055, 0.07, 0.55]] as const) {
      spike(x, 0.205, 0.08, [lean, -1, 0.7], len, 0.05);
    }
    // Two longer strands framing the face.
    for (const sx of [-1, 1]) spike(sx * 0.082, 0.17, 0.06, [sx * 0.2, -1, 0.15], 0.11, 0.04);
  }

  private buildArms(scene: Scene, m: Mats, put: PutFn): void {
    // Right (sword) arm: bare and muscled, leather bracer and glove; a small two-plate pauldron.
    const sR = this.shoulder.R;
    put(blob("dart_delt", 0.06, 0.062, 0.062, scene), m.skin, sR, 0.005, -0.03, 0);
    put(segment("dart_upperArmR", 0.25, 0.053, 0.043, scene), m.skin, sR, 0, -0.01, 0);
    put(blob("dart_bicep", 0.04, 0.06, 0.04, scene, 10), m.skin, sR, 0, -0.13, 0.02);
    const pR1 = put(blob("dart_pauldR1", 0.085, 0.05, 0.085, scene), m.armor, sR, 0.02, 0.025, 0);
    pR1.rotation.z = -0.35;
    const pR2 = put(blob("dart_pauldR2", 0.07, 0.04, 0.075, scene), m.armor, sR, 0.045, -0.025, 0);
    pR2.rotation.z = -0.6;
    const eR = this.elbow.R;
    put(segment("dart_forearmR", 0.24, 0.044, 0.034, scene), m.skin, eR);
    put(
      loft("dart_bracerR", [
        { y: -0.235, w: 0.04, d: 0.038 },
        { y: -0.15, w: 0.048, d: 0.045 },
        { y: -0.06, w: 0.05, d: 0.047 },
      ], scene, 14),
      m.leather,
      eR,
    );
    for (let k = 0; k < 3; k++) {
      const link = put(MeshBuilder.CreateTorus(`dart_chain${k}`, { diameter: 0.022, thickness: 0.005, tessellation: 8 }, scene), m.silver, eR, 0.04, -0.2 + k * 0.022, 0.025);
      link.rotation.set(Math.PI / 2, k * 0.8, 0);
    }
    const hR = this.hand.R;
    put(blob("dart_gloveR", 0.034, 0.05, 0.042, scene, 10), m.leatherDark, hR, 0, -0.035, 0.008);
    put(blob("dart_thumbR", 0.013, 0.025, 0.013, scene, 8), m.leatherDark, hR, -0.03, -0.03, 0.03);

    // Left arm: plated from the big layered pauldron to the gauntleted fist.
    const sL = this.shoulder.L;
    put(segment("dart_upperArmL", 0.25, 0.052, 0.044, scene), m.shirt, sL, 0, -0.01, 0);
    const layers: [number, number, number, number, number, number][] = [
      // rx, ry, rz, x, y, roll
      [0.12, 0.07, 0.115, -0.015, 0.035, 0.3],
      [0.105, 0.06, 0.105, -0.045, -0.02, 0.55],
      [0.09, 0.05, 0.095, -0.06, -0.07, 0.75],
    ];
    layers.forEach(([rx, ry, rz, x, y, roll], i) => {
      const p = put(blob(`dart_pauldL${i}`, rx, ry, rz, scene), m.armor, sL, x, y, 0);
      p.rotation.z = roll;
    });
    // Upper-arm bands, overlapping like a lobster tail.
    for (let i = 0; i < 3; i++) {
      const band = put(MeshBuilder.CreateCylinder(`dart_armBandL${i}`, { height: 0.075, diameterTop: 0.112, diameterBottom: 0.124, tessellation: 16 }, scene), m.armor, sL, 0, -0.1 - i * 0.06, 0);
      band.rotation.x = 0.1;
    }
    put(blob("dart_elbowCop", 0.055, 0.05, 0.05, scene), m.armorDark, this.elbow.L, 0, 0, -0.02);
    const eL = this.elbow.L;
    put(segment("dart_forearmL", 0.24, 0.045, 0.036, scene), m.shirt, eL);
    for (let i = 0; i < 2; i++) {
      put(MeshBuilder.CreateCylinder(`dart_foreBandL${i}`, { height: 0.07, diameterTop: 0.104, diameterBottom: 0.11, tessellation: 16 }, scene), m.armor, eL, 0, -0.06 - i * 0.06, 0);
    }
    put(MeshBuilder.CreateCylinder("dart_gauntletL", { height: 0.09, diameterTop: 0.1, diameterBottom: 0.124, tessellation: 16 }, scene), m.armor, eL, 0, -0.2, 0);
    const hL = this.hand.L;
    put(blob("dart_fistL", 0.04, 0.052, 0.047, scene, 12), m.armor, hL, 0, -0.035, 0.006);
    put(MeshBuilder.CreateBox("dart_knucklesL", { width: 0.07, height: 0.025, depth: 0.03 }, scene), m.armorDark, hL, 0, -0.06, 0.03);
  }

  private buildLegs(scene: Scene, m: Mats, put: PutFn): void {
    for (const side of ["L", "R"] as const) {
      const sx = side === "L" ? -1 : 1;
      const t = this.thigh[side];
      put(segment(`dart_thigh${side}`, 0.42, 0.074, 0.056, scene), m.pants, t, 0, -0.01, 0);
      const k = this.knee[side];
      // The knee guard: a red shield with a point below.
      // Knee guard: a broad, flattish shield over the kneecap, tapering to a point below.
      const guard = put(blob(`dart_kneeGuard${side}`, 0.066, 0.06, 0.03, scene), m.armor, k, 0, 0.015, 0.052);
      guard.rotation.x = 0.12;
      const point = put(MeshBuilder.CreateCylinder(`dart_kneePoint${side}`, { height: 0.07, diameterTop: 0.11, diameterBottom: 0, tessellation: 8 }, scene), m.armor, k, 0, -0.04, 0.052);
      point.scaling.z = 0.32;
      put(segment(`dart_shin${side}`, 0.37, 0.052, 0.042, scene), m.pants, k);
      // Boot shaft with a folded, flared cuff and a buckled strap.
      put(
        loft(`dart_boot${side}`, [
          { y: -0.42, w: 0.05, d: 0.056, z: 0.005 },
          { y: -0.3, w: 0.054, d: 0.058 },
          { y: -0.2, w: 0.058, d: 0.06 },
        ], scene, 14),
        m.leather,
        k,
      );
      const cuff = put(MeshBuilder.CreateCylinder(`dart_cuff${side}`, { height: 0.08, diameterTop: 0.16, diameterBottom: 0.118, tessellation: 7 }, scene), m.leather, k, 0, -0.17, 0);
      cuff.rotation.y = sx * 0.3;
      for (let i = 0; i < 3; i++) {
        const flap = put(MeshBuilder.CreateCylinder(`dart_flap${side}${i}`, { height: 0.07, diameterTop: 0.05, diameterBottom: 0, tessellation: 4 }, scene), m.leatherDark, k, sx * (0.03 + i * 0.02), -0.17, 0.05 - i * 0.05);
        flap.rotation.set(0.3, 0, sx * -0.4);
        flap.scaling.z = 0.4;
      }
      const strap = put(MeshBuilder.CreateTorus(`dart_strap${side}`, { diameter: 0.118, thickness: 0.016, tessellation: 18 }, scene), m.leatherDark, k, 0, -0.33, 0.002);
      strap.scaling.z = 1.05;
      put(MeshBuilder.CreateBox(`dart_strapBuckle${side}`, { width: 0.024, height: 0.024, depth: 0.01 }, scene), m.silver, k, sx * 0.035, -0.33, 0.052);
      // Foot.
      const a = this.ankle[side];
      const foot = put(MeshBuilder.CreateCapsule(`dart_foot${side}`, { height: 0.21, radius: 0.046, tessellation: 12, capSubdivisions: 4 }, scene), m.leather, a, 0, -0.03, 0.05);
      foot.rotation.x = Math.PI / 2;
      foot.scaling.x = 1.1;
      put(MeshBuilder.CreateBox(`dart_sole${side}`, { width: 0.1, height: 0.022, depth: 0.22 }, scene), m.leatherDark, a, 0, -0.068, 0.05);
    }
  }

  /** The sword in the right hand: a long, slim blade, red pointed guard with gold bands, gold pommel. */
  private buildSword(scene: Scene, m: Mats, put: PutFn, node: NodeFn): void {
    const sword = node("sword", this.hand.R, 0, -0.045, 0.01);
    // Gripped across the fist; the blade leads forward and a little down, as on the artwork.
    aim(sword, new Vector3(0, -0.35, 1));
    put(MeshBuilder.CreateCylinder("dart_grip", { height: 0.17, diameter: 0.03, tessellation: 10 }, scene), m.grip, sword, 0, 0.0, 0);
    const pommel = put(MeshBuilder.CreateCylinder("dart_pommel", { height: 0.045, diameterTop: 0.03, diameterBottom: 0.048, tessellation: 8 }, scene), m.gold, sword, 0, -0.105, 0);
    pommel.rotation.x = Math.PI;
    // Guard: a red block with pointed ends, gold bands, flat across the blade.
    put(MeshBuilder.CreateBox("dart_guard", { width: 0.12, height: 0.04, depth: 0.04 }, scene), m.armor, sword, 0, 0.1, 0);
    for (const sx of [-1, 1]) {
      const tip = put(MeshBuilder.CreateCylinder(`dart_guardTip${sx}`, { height: 0.08, diameterTop: 0, diameterBottom: 0.04, tessellation: 4 }, scene), m.armor, sword, sx * 0.1, 0.1, 0);
      tip.rotation.z = -sx * Math.PI / 2;
      put(MeshBuilder.CreateBox(`dart_guardBand${sx}`, { width: 0.008, height: 0.044, depth: 0.044 }, scene), m.gold, sword, sx * 0.03, 0.1, 0);
    }
    // Blade: flat, slim, a gold motif at its base, a long tapering point.
    put(MeshBuilder.CreateBox("dart_blade", { width: 0.05, height: 0.72, depth: 0.012 }, scene), m.blade, sword, 0, 0.48, 0);
    const point = put(MeshBuilder.CreateCylinder("dart_bladeTip", { height: 0.12, diameterTop: 0, diameterBottom: 0.071, tessellation: 4 }, scene), m.blade, sword, 0, 0.895, 0);
    point.rotation.y = Math.PI / 4;
    point.scaling.z = 0.17;
    put(MeshBuilder.CreateBox("dart_bladeMotif", { width: 0.03, height: 0.07, depth: 0.014 }, scene), m.gold, sword, 0, 0.165, 0);
  }

  // --- Animation ------------------------------------------------------------------

  setEnabled(on: boolean): void {
    this.rig.setEnabled(on);
  }

  strike(): void {
    this.strikeT = STRIKE_DUR;
  }

  update(dt: number, moving: boolean): void {
    // Rotation convention: a positive X rotation swings a hanging limb BACKWARD (−Z). So knees fold
    // with +X, elbows with −X, and "forward" for a thigh or an arm is −X.
    this.time += dt;
    this.gait += ((moving ? 1 : 0) - this.gait) * Math.min(1, dt * 8);
    const g = this.gait;
    this.phase += dt * (2 + 7 * g);
    const s = Math.sin(this.phase);
    const c = Math.cos(this.phase);
    const breath = Math.sin(this.time * 1.7);

    // Legs: thighs swing, knees fold on the forward swing, feet stay roughly level.
    const swing = 0.5 * g;
    this.thigh.L.rotation.x = -s * swing;
    this.thigh.R.rotation.x = s * swing;
    this.knee.L.rotation.x = (0.06 + 0.8 * Math.max(0, -c)) * g + 0.04;
    this.knee.R.rotation.x = (0.06 + 0.8 * Math.max(0, c)) * g + 0.04;
    this.ankle.L.rotation.x = -(this.thigh.L.rotation.x + this.knee.L.rotation.x) * 0.6;
    this.ankle.R.rotation.x = -(this.thigh.R.rotation.x + this.knee.R.rotation.x) * 0.6;
    // Stance: feet a touch apart.
    this.thigh.L.rotation.z = -0.05;
    this.thigh.R.rotation.z = 0.05;

    // Hips bob and roll; the chest counter-twists and leans into the walk; breathing at rest.
    this.hips.position.y = 0.98 - 0.012 + Math.abs(c) * 0.03 * g + breath * 0.004 * (1 - g);
    this.hips.rotation.y = s * 0.09 * g;
    this.hips.rotation.z = c * 0.03 * g;
    this.chest.rotation.y = -s * 0.15 * g;
    this.chest.rotation.x = 0.05 * g - breath * 0.012 * (1 - g);
    this.head.rotation.y = s * 0.06 * g;
    this.head.rotation.x = -0.03 * g;

    // Arms swing opposite the legs, elbows soft; the sword arm swings less (it carries the blade).
    this.shoulder.L.rotation.x = s * 0.42 * g - breath * 0.02 * (1 - g);
    this.shoulder.R.rotation.x = -s * 0.25 * g - 0.08;
    this.shoulder.L.rotation.z = -0.14;
    this.shoulder.R.rotation.z = 0.12;
    this.elbow.L.rotation.x = -0.22 - 0.25 * Math.max(0, s) * g;
    this.elbow.R.rotation.x = -0.45 - 0.15 * Math.max(0, -s) * g;

    // Headband tails trail behind, flicking with each step.
    this.tails.forEach((t, i) => {
      t.rotation.x = 0.35 + 0.5 * g + Math.sin(this.phase * 2 + i) * (0.06 + 0.12 * g);
    });

    // The strike: wind the sword up and back over the shoulder with the torso turned away, then
    // whip it forward and down, the body uncoiling into the blow, and recover.
    if (this.strikeT > 0) {
      this.strikeT = Math.max(0, this.strikeT - dt);
      const p = 1 - this.strikeT / STRIKE_DUR;
      const k = p < 0.22 ? ease(p / 0.22) : p < 0.48 ? 1 : 1 - ease((p - 0.48) / 0.52);
      let sh: number; // shoulder pitch
      let el: number; // elbow
      let tw: number; // chest twist
      if (p < 0.22) {
        const f = ease(p / 0.22);
        sh = lerp(-0.08, 2.5, f);
        el = lerp(-0.45, -1.2, f);
        tw = lerp(0, 0.55, f);
      } else if (p < 0.48) {
        const f = ease((p - 0.22) / 0.26);
        sh = lerp(2.5, -1.0, f);
        el = lerp(-1.2, -0.15, f);
        tw = lerp(0.55, -0.5, f);
      } else {
        const f = ease((p - 0.48) / 0.52);
        sh = lerp(-1.0, -0.08, f);
        el = lerp(-0.15, -0.45, f);
        tw = lerp(-0.5, 0, f);
      }
      this.shoulder.R.rotation.x = sh;
      this.shoulder.R.rotation.z = 0.12 + 0.25 * k;
      this.elbow.R.rotation.x = el;
      this.chest.rotation.y = tw;
      this.hips.rotation.y = tw * 0.35;
      // The off arm counter-balances, the front knee bends into the lunge.
      this.shoulder.L.rotation.x = 0.4 * k;
      this.shoulder.L.rotation.z = -0.14 - 0.3 * k;
      this.knee.L.rotation.x += 0.3 * k;
      this.thigh.L.rotation.x -= 0.3 * k;
      this.knee.R.rotation.x += 0.15 * k;
      this.hips.position.y -= 0.035 * k;
    }
  }

  dispose(): void {
    this.rig.dispose(false, true);
  }
}

type PutFn = <T extends Mesh>(mesh: T, mat: StandardMaterial, parent: TransformNode, x?: number, y?: number, z?: number) => T;
type NodeFn = (name: string, parent: TransformNode, x?: number, y?: number, z?: number) => TransformNode;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function ease(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}
