import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

/** Tunable look of a Dragoon form. Defaults below are Dart's Red-Eye Dragoon (canon). */
export interface DragoonFormOptions {
  /** Main armour colour (RGB 0–1) — Red-Eye red. */
  primary?: [number, number, number];
  /** Metal edge / rib colour (steel grey). */
  accent?: [number, number, number];
  /** Glowing chest + headband gem colour (green). */
  gem?: [number, number, number];
  /** Wing membrane colour (jade green, rendered as flat unlit PS1-style panels). */
  wing?: [number, number, number];
  /** Hair colour (Dart's tan/blond). */
  hair?: [number, number, number];
  /** Skin tone for the exposed face. */
  skin?: [number, number, number];
  /** Uniform scale (default 1). */
  scale?: number;
}

const FLAP_SPEED = 2.2; // wing-beat rate (rad/s base)
const STRIKE_DUR = 0.42;

/**
 * Procedural **Dragoon form**, modelled on Dart's Red-Eye Dragoon (canon reference): ornate
 * copper-orange plate with dark filigree, a glowing green chest gem, huge rib-fanned pauldrons,
 * a green-gemmed headband under Dart's spiky blond hair (face exposed — no helm), dark teal
 * under-suit legs in orange boots, and — like the PS1 model — one large jade-green bat-wing
 * per side: an orange spar sweeping up-out with a continuous angular membrane hanging from it,
 * its trailing edge scalloped into long pointed lobes. Shown while transformed (the human
 * {@link Humanoid} is hidden);
 * proportioned to stand where the human stood. Faces +Z. Tune via {@link DragoonFormOptions}.
 */
export class DragoonForm {
  readonly rig: TransformNode;

  private body: TransformNode; // torso/head/arms (hovers)
  private leftArm: TransformNode;
  private rightArm: TransformNode;
  private leftWing: TransformNode;
  private rightWing: TransformNode;
  private phase = 0;
  private strikeT = 0;

  constructor(scene: Scene, opts: DragoonFormOptions = {}) {
    const [pr, pg, pb] = opts.primary ?? [0.82, 0.3, 0.1]; // Red-Eye copper-orange
    const [mr, mg, mb] = opts.accent ?? [0.7, 0.72, 0.78]; // steel grey
    const [er, eg, eb] = opts.gem ?? [0.22, 0.95, 0.4]; // green gem
    const [wr, wg, wb] = opts.wing ?? [0.34, 0.58, 0.33]; // jade-green membrane (PS1)
    const [hr, hg, hb] = opts.hair ?? [0.84, 0.62, 0.3]; // tan/blond
    const [sr, sg, sb] = opts.skin ?? [0.94, 0.79, 0.67];

    const red = mat("dgRed", pr, pg, pb, scene);
    const redDk = mat("dgRedDk", pr * 0.45, pg * 0.4, pb * 0.4, scene); // filigree / engraving
    const steel = mat("dgSteel", mr, mg, mb, scene);
    const dark = mat("dgDark", 0.12, 0.1, 0.13, scene); // deep shadow / fists
    const teal = mat("dgTeal", 0.13, 0.38, 0.36, scene); // dark teal under-suit (canon)
    const tealDk = mat("dgTealDk", 0.09, 0.27, 0.26, scene); // shin/greave shade
    const blond = mat("dgHair", hr, hg, hb, scene);
    const skin = mat("dgSkin", sr, sg, sb, scene);
    const eyeMat = mat("dgEye", 0.08, 0.08, 0.1, scene);
    const gem = mat("dgGem", er * 0.35, eg * 0.35, eb * 0.35, scene);
    gem.emissiveColor = new Color3(er, eg, eb); // self-lit green
    // Unlit membranes: the custom triangle meshes render black under lights because their
    // averaged (opposite-wound) normals kill diffuse lighting — so drive the colour purely
    // from emissive with lighting disabled. Flat unlit panels are exactly the PS1 look.
    // The lower blade is a shade darker so the two wings per side read separately.
    const wingUp = mat("dgWingUp", 0, 0, 0, scene);
    wingUp.emissiveColor = new Color3(wr, wg, wb);
    wingUp.disableLighting = true;
    wingUp.backFaceCulling = false;
    const wingLo = mat("dgWingLo", 0, 0, 0, scene);
    wingLo.emissiveColor = new Color3(wr * 0.68, wg * 0.72, wb * 0.68);
    wingLo.disableLighting = true;
    wingLo.backFaceCulling = false;

    this.rig = new TransformNode("dragoonForm", scene);
    this.rig.scaling.setAll(opts.scale ?? 1);

    // --- Legs: dark teal under-suit down the whole leg, orange knee cop + big orange boots
    // (PS1: the legs stay dark, only the joints and feet flash Red-Eye orange). ---
    for (const sx of [-1, 1]) {
      box("dgThigh", 0.2, 0.42, 0.22, teal, scene, new Vector3(sx * 0.13, 0.56, 0), this.rig);
      box("dgGreave", 0.21, 0.44, 0.22, tealDk, scene, new Vector3(sx * 0.13, 0.2, 0.01), this.rig);
      box("dgKnee", 0.24, 0.12, 0.25, red, scene, new Vector3(sx * 0.13, 0.4, 0.01), this.rig);
      box("dgFoot", 0.22, 0.15, 0.38, red, scene, new Vector3(sx * 0.13, 0.07, 0.09), this.rig);
    }

    // --- Body group (torso/head/arms) — hovers gently in update(). ---
    this.body = new TransformNode("dgBody", scene);
    this.body.parent = this.rig;

    box("dgHips", 0.46, 0.2, 0.3, redDk, scene, new Vector3(0, 0.82, 0), this.body);
    // Dark recessed vent at the lower belly (between the breastplate and the tasset).
    box("dgVent", 0.26, 0.13, 0.06, dark, scene, new Vector3(0, 0.92, 0.2), this.body);
    // Segmented tasset plates (abdomen / front skirt).
    box("dgTasset", 0.5, 0.16, 0.16, red, scene, new Vector3(0, 0.74, 0.16), this.body);
    box("dgTasset2", 0.42, 0.14, 0.14, redDk, scene, new Vector3(0, 0.62, 0.17), this.body);

    box("dgTorso", 0.46, 0.6, 0.3, teal, scene, new Vector3(0, 1.14, 0), this.body);
    box("dgChest", 0.5, 0.52, 0.14, red, scene, new Vector3(0, 1.2, 0.14), this.body); // breastplate, proud
    // Dark-red engraved filigree on the chest: a flame-fan at the top + side scrolls.
    box("dgFiliTop", 0.34, 0.1, 0.04, redDk, scene, new Vector3(0, 1.4, 0.22), this.body);
    for (const sx of [-1, 1]) {
      const scroll = box("dgFiliS", 0.06, 0.3, 0.04, redDk, scene, new Vector3(sx * 0.14, 1.22, 0.22), this.body);
      scroll.rotation.z = sx * 0.4;
    }
    box("dgCollar", 0.34, 0.14, 0.3, steel, scene, new Vector3(0, 1.46, 0), this.body);
    // Big glowing GREEN dragon-eye gem at the sternum (set in a steel ring).
    const ring = MeshBuilder.CreateTorus("dgGemRing", { diameter: 0.26, thickness: 0.05, tessellation: 16 }, scene);
    ring.material = steel;
    ring.isPickable = false;
    ring.rotation.x = Math.PI / 2;
    ring.position = new Vector3(0, 1.12, 0.21);
    ring.parent = this.body;
    const gemMesh = MeshBuilder.CreateSphere("dgGem", { diameter: 0.2, segments: 12 }, scene);
    gemMesh.material = gem;
    gemMesh.isPickable = false;
    gemMesh.scaling = new Vector3(0.9, 1.35, 0.7); // tall oval, like the PS1 sternum gem
    gemMesh.position = new Vector3(0, 1.12, 0.23);
    gemMesh.parent = this.body;

    // --- Head: exposed face + Dart's spiky blond hair + a green-gemmed headband (no helm). ---
    box("dgHead", 0.32, 0.34, 0.3, skin, scene, new Vector3(0, 1.66, 0), this.body);
    for (const dx of [-0.08, 0.08]) {
      box("dgEyeM", 0.06, 0.07, 0.04, eyeMat, scene, new Vector3(dx, 1.67, 0.16), this.body);
    }
    // Headband across the brow with five green gems.
    box("dgBand", 0.34, 0.07, 0.32, redDk, scene, new Vector3(0, 1.74, 0.02), this.body);
    for (const dx of [-0.13, -0.065, 0, 0.065, 0.13]) {
      const bandGem = box("dgBandGem", 0.05, 0.05, 0.04, gem, scene, new Vector3(dx, 1.74, 0.17), this.body);
      void bandGem;
    }
    // Spiky tan/blond hair — modest spikes swept back over the head (not a tall crown).
    const spikes: [number, number, number][] = [
      [0, 0.32, 0],
      [-0.11, 0.28, 0.18],
      [0.11, 0.28, -0.18],
      [-0.18, 0.22, 0.34],
      [0.18, 0.22, -0.34],
    ];
    for (const [dx, len, rz] of spikes) {
      const spike = cone("dgHair", len, 0.1, blond, scene);
      spike.position = new Vector3(dx, 1.8, -0.05);
      spike.rotation.x = -1.5; // sweep strongly back over the crown
      spike.rotation.z = rz;
      spike.parent = this.body;
    }

    // --- Pauldrons: huge ribbed plates fanning outward & up (steel-edged red ribs). ---
    this.buildPauldron(scene, -1, red, steel, this.body);
    this.buildPauldron(scene, 1, red, steel, this.body);

    // --- Arms: ribbed red vambraces down to dark fists (right arm strikes). ---
    this.leftArm = limb("dgArmL", red, scene);
    this.leftArm.position = new Vector3(-0.36, 1.4, 0);
    this.leftArm.parent = this.body;
    this.rightArm = limb("dgArmR", red, scene);
    this.rightArm.position = new Vector3(0.36, 1.4, 0);
    this.rightArm.parent = this.body;
    for (const arm of [this.leftArm, this.rightArm]) {
      box("dgSleeve", 0.21, 0.26, 0.21, teal, scene, new Vector3(0, -0.08, 0), arm); // teal upper arm
      for (const y of [-0.26, -0.4, -0.52]) box("dgRib", 0.22, 0.04, 0.22, steel, scene, new Vector3(0, y, 0), arm);
      box("dgFist", 0.2, 0.18, 0.22, dark, scene, new Vector3(0, -0.62, 0), arm);
    }

    // Sword in the right hand: silver blade, steel cross-guard, red grip — held tipped
    // well forward, close to horizontal, like the PS1 flight pose.
    const sword = new TransformNode("dgSword", scene);
    sword.position = new Vector3(0, -0.64, 0.12);
    sword.rotation.x = 1.15;
    sword.parent = this.rightArm;
    box("dgBlade", 0.07, 1.2, 0.14, steel, scene, new Vector3(0, 0.62, 0), sword);
    box("dgGuard", 0.32, 0.07, 0.16, steel, scene, new Vector3(0, 0.04, 0), sword);
    box("dgGrip", 0.07, 0.2, 0.1, red, scene, new Vector3(0, -0.12, 0), sword);

    // --- Wings: one big jade bat-wing per side — orange spar up-out, continuous membrane
    // hanging below it with pointed trailing lobes (the PS1 silhouette). ---
    this.leftWing = this.buildWing(scene, -1, wingUp, wingLo, red);
    this.rightWing = this.buildWing(scene, 1, wingUp, wingLo, red);
    for (const w of [this.leftWing, this.rightWing]) w.parent = this.body;
  }

  /** One pauldron: a compact rounded shoulder guard (flattened dome) with two short layered
   *  ridge plates on top and a pale ribbed fan flaring out-down beneath it — the PS1 model's
   *  big shoulders read as orange plates over a fan of light ribs. */
  private buildPauldron(scene: Scene, sx: number, red: StandardMaterial, steel: StandardMaterial, parent: TransformNode): void {
    const dome = MeshBuilder.CreateSphere("dgPauldron", { diameter: 0.42, segments: 8 }, scene);
    dome.material = red;
    dome.isPickable = false;
    dome.scaling = new Vector3(1.2, 0.72, 1.05);
    dome.position = new Vector3(sx * 0.4, 1.5, 0);
    dome.parent = parent;
    for (let i = 0; i < 2; i++) {
      const plate = box("dgPauldronRidge", 0.28 - i * 0.07, 0.06, 0.42 - i * 0.08, red, scene, new Vector3(sx * (0.38 + i * 0.05), 1.6 + i * 0.09, 0), parent);
      plate.rotation.z = sx * (0.35 + i * 0.25);
      const rim = box("dgPauldronRim", 0.29 - i * 0.07, 0.03, 0.44 - i * 0.08, steel, scene, new Vector3(sx * (0.38 + i * 0.05), 1.55 + i * 0.09, 0), parent);
      rim.rotation.z = sx * (0.35 + i * 0.25);
    }
    // Ribbed fan under the dome: three steel slats flaring outward-down over the arm.
    for (let i = 0; i < 3; i++) {
      const rib = box("dgPauldronFan", 0.26, 0.035, 0.26 - i * 0.04, steel, scene, new Vector3(sx * (0.44 + i * 0.04), 1.44 - i * 0.075, 0), parent);
      rib.rotation.z = sx * (0.55 + i * 0.3);
    }
  }

  /** One wing (PS1 style): the orange leading-edge band ("membrane rouge") sweeps up-out
   *  from the shoulder — shoulder → kink → tip — and the jade membrane hangs from its OUTER
   *  edge as three large obtuse triangles: each tooth's base covers a stretch of the band
   *  and its point hangs down leaning outward (apex pushed toward the wing tip), with deep
   *  notches between teeth. Built in the XY plane (span along ±X), then raised ~45° and
   *  swept back; teeth alternate the two jade shades. Pivot is animated (flap). */
  private buildWing(
    scene: Scene,
    sx: number,
    upper: StandardMaterial,
    lower: StandardMaterial,
    rib: StandardMaterial,
  ): TransformNode {
    const pivot = new TransformNode("dgWingPivot", scene); // animated by update()
    pivot.position = new Vector3(sx * 0.12, 1.46, -0.17); // upper back
    const blade = new TransformNode("dgWingBlade", scene);
    blade.parent = pivot;
    blade.rotation = new Vector3(0, sx * 0.45, sx * 0.8); // raised ~45°, swept back

    const len = 1.9; // span along the band
    const P = (x: number, y: number): Vector3 => new Vector3(sx * x * len, y, 0);
    const L0 = P(0.03, 0); // root at the shoulder
    const L1 = P(0.62, 0.05); // band kink (wing "wrist")
    const L2 = P(1.0, -0.06); // wing tip

    // The orange leading-edge band, in two kinked segments.
    for (const [a, b] of [
      [L0, L1],
      [L1, L2],
    ] as [Vector3, Vector3][]) {
      const d = b.subtract(a);
      const seg = box("dgWingSpar", d.length() + 0.05, 0.09, 0.05, rib, scene, a.add(b).scale(0.5), blade);
      seg.rotation.z = Math.atan2(d.y, d.x);
    }

    // A point a fraction `f` of the way along the kinked band polyline.
    const l1 = L1.subtract(L0).length();
    const l2 = L2.subtract(L1).length();
    const along = (f: number): Vector3 => {
      const d = f * (l1 + l2);
      return d <= l1 ? Vector3.Lerp(L0, L1, d / l1) : Vector3.Lerp(L1, L2, (d - l1) / l2);
    };

    // Three big membrane teeth hanging from the band's outer edge: base along the band,
    // apex dropped below and leaned outward (obtuse inner corner), deepest mid-wing.
    const teeth: { f0: number; f1: number; drop: number; shade: StandardMaterial }[] = [
      { f0: 0.02, f1: 0.36, drop: 0.72, shade: upper },
      { f0: 0.36, f1: 0.68, drop: 0.95, shade: lower },
      { f0: 0.68, f1: 1.0, drop: 0.78, shade: upper },
    ];
    for (const t of teeth) {
      const a = along(t.f0);
      const b = along(t.f1);
      const apex = new Vector3(a.x + (b.x - a.x) * 0.72, Math.min(a.y, b.y) - t.drop, 0);
      triangle("dgWingTooth", a, b, apex, t.shade, scene).parent = blade;
    }
    return pivot;
  }

  setEnabled(on: boolean): void {
    this.rig.setEnabled(on);
  }

  /** Trigger a one-shot strike (right-arm swing). */
  strike(): void {
    this.strikeT = STRIKE_DUR;
  }

  /** Wings beat, the body hovers; a strike swings the right arm. `moving` widens the beat. */
  update(dt: number, moving: boolean): void {
    this.phase += dt * FLAP_SPEED * (moving ? 1.5 : 1);
    const beat = Math.sin(this.phase);
    const amp = moving ? 0.22 : 0.1; // gentle sway of the flat fan
    this.leftWing.rotation.z = -amp * beat;
    this.rightWing.rotation.z = amp * beat;
    this.body.position.y = 0.05 + beat * 0.035; // gentle hover

    if (this.strikeT > 0) {
      this.strikeT = Math.max(0, this.strikeT - dt);
      const p = 1 - this.strikeT / STRIKE_DUR;
      this.rightArm.rotation.x = p < 0.3 ? lerp(0, -1.4, p / 0.3) : lerp(-1.4, 0, (p - 0.3) / 0.7);
    }
  }

  dispose(): void {
    this.rig.dispose();
  }
}

// --- local primitives (kept self-contained) --------------------------------

function mat(name: string, r: number, g: number, b: number, scene: Scene): StandardMaterial {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = new Color3(r, g, b);
  m.specularColor = new Color3(0.12, 0.12, 0.12);
  return m;
}

function box(
  name: string,
  w: number,
  h: number,
  d: number,
  material: StandardMaterial,
  scene: Scene,
  pos: Vector3,
  parent: TransformNode,
) {
  const m = MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
  m.material = material;
  m.isPickable = false;
  m.position = pos;
  m.parent = parent;
  return m;
}

/** An arm segment hanging from a pivot at the shoulder (length 0.6, thickness 0.18). */
function limb(name: string, material: StandardMaterial, scene: Scene): TransformNode {
  const pivot = new TransformNode(name, scene);
  const seg = MeshBuilder.CreateBox(name + "Seg", { width: 0.18, height: 0.6, depth: 0.18 }, scene);
  seg.position.y = -0.3;
  seg.material = material;
  seg.isPickable = false;
  seg.parent = pivot;
  return pivot;
}

/** A 4-sided cone (spike) on a pivot at its base; tip points +Y before rotation. */
function cone(name: string, len: number, baseD: number, material: StandardMaterial, scene: Scene): TransformNode {
  const pivot = new TransformNode(name + "Pivot", scene);
  const c = MeshBuilder.CreateCylinder(name, { height: len, diameterTop: 0, diameterBottom: baseD, tessellation: 4 }, scene);
  c.position.y = len / 2;
  c.material = material;
  c.isPickable = false;
  c.parent = pivot;
  return pivot;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** A flat, double-sided triangle from three local-space points (for wing membranes). */
function triangle(name: string, a: Vector3, b: Vector3, c: Vector3, material: StandardMaterial, scene: Scene): Mesh {
  const m = new Mesh(name, scene);
  const vd = new VertexData();
  vd.positions = [a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z];
  vd.indices = [0, 1, 2, 0, 2, 1]; // both windings → visible from both sides
  const normals: number[] = [];
  VertexData.ComputeNormals(vd.positions, vd.indices, normals);
  vd.normals = normals;
  vd.applyToMesh(m);
  m.material = material;
  m.isPickable = false;
  return m;
}
