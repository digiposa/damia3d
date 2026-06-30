import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

/** Tunable look of a Dragoon form. Defaults below are Dart's Red-Eye Dragoon. */
export interface DragoonFormOptions {
  /** Main armour colour (RGB 0–1). */
  primary?: [number, number, number];
  /** Trim / accent colour (gold by default). */
  accent?: [number, number, number];
  /** Emissive glow colour for the visor, chest gem and wing edges. */
  glow?: [number, number, number];
  /** Uniform scale (default 1). */
  scale?: number;
}

const FLAP_SPEED = 2.4; // wing-beat rate (rad/s base)
const STRIKE_DUR = 0.42;

/**
 * Procedural **Dragoon form** — a winged, armoured figure shown while transformed (the human
 * {@link Humanoid} is hidden). First pass modelled on Dart's Red-Eye Dragoon: full plate over a
 * dark bodysuit, a horned/winged helm with a glowing visor, a glowing chest gem, and a pair of
 * membrane wings that beat gently. Proportioned to stand where the human stood. Faces +Z (the
 * owner rotates the parent). Pure transforms; tune via {@link DragoonFormOptions}.
 */
export class DragoonForm {
  /** Visual root — parent under the entity's node. */
  readonly rig: TransformNode;

  private body: TransformNode; // torso/head/arms (bobs/hovers)
  private leftArm: TransformNode;
  private rightArm: TransformNode;
  private leftWing: TransformNode;
  private rightWing: TransformNode;
  private phase = 0;
  private strikeT = 0;

  constructor(scene: Scene, opts: DragoonFormOptions = {}) {
    const [pr, pg, pb] = opts.primary ?? [0.78, 0.13, 0.1]; // Red-Eye red
    const [ar, ag, ab] = opts.accent ?? [0.85, 0.68, 0.26]; // gold
    const [gr, gg, gb] = opts.glow ?? [1.0, 0.46, 0.12]; // ember glow

    const red = mat("dgRed", pr, pg, pb, scene);
    const redDark = mat("dgRedDk", pr * 0.55, pg * 0.5, pb * 0.5, scene);
    const gold = mat("dgGold", ar, ag, ab, scene);
    const dark = mat("dgDark", 0.12, 0.1, 0.13, scene); // bodysuit / joints
    const glow = mat("dgGlow", gr * 0.4, gg * 0.4, gb * 0.4, scene);
    glow.emissiveColor = new Color3(gr, gg, gb); // self-lit gem / visor / wing edges

    this.rig = new TransformNode("dragoonForm", scene);
    this.rig.scaling.setAll(opts.scale ?? 1);

    // --- Legs: dark thighs into red greaves with a gold knee, planted on the rig. ---
    for (const sx of [-1, 1]) {
      const thigh = box("dgThigh", 0.2, 0.42, 0.22, dark, scene);
      thigh.position = new Vector3(sx * 0.13, 0.56, 0);
      thigh.parent = this.rig;
      const greave = box("dgGreave", 0.23, 0.42, 0.24, red, scene);
      greave.position = new Vector3(sx * 0.13, 0.2, 0.01);
      greave.parent = this.rig;
      const knee = box("dgKnee", 0.24, 0.1, 0.25, gold, scene);
      knee.position = new Vector3(sx * 0.13, 0.4, 0.01);
      knee.parent = this.rig;
      const foot = box("dgFoot", 0.21, 0.13, 0.36, redDark, scene);
      foot.position = new Vector3(sx * 0.13, 0.06, 0.08);
      foot.parent = this.rig;
    }

    // --- Body group (torso/head/arms) — hovers gently in update(). ---
    this.body = new TransformNode("dgBody", scene);
    this.body.parent = this.rig;

    const hips = box("dgHips", 0.46, 0.2, 0.3, redDark, scene);
    hips.position.y = 0.82;
    hips.parent = this.body;
    const tasset = box("dgTasset", 0.5, 0.22, 0.16, red, scene); // front skirt plate
    tasset.position = new Vector3(0, 0.74, 0.16);
    tasset.parent = this.body;

    const torso = box("dgTorso", 0.46, 0.6, 0.3, dark, scene);
    torso.position.y = 1.14;
    torso.parent = this.body;
    const chest = box("dgChest", 0.48, 0.5, 0.12, red, scene); // breastplate, proud
    chest.position = new Vector3(0, 1.18, 0.15);
    chest.parent = this.body;
    const collar = box("dgCollar", 0.34, 0.14, 0.3, gold, scene);
    collar.position.y = 1.46;
    collar.parent = this.body;
    // Glowing dragon-eye gem at the sternum.
    const gem = MeshBuilder.CreateSphere("dgGem", { diameter: 0.16, segments: 10 }, scene);
    gem.material = glow;
    gem.isPickable = false;
    gem.position = new Vector3(0, 1.22, 0.22);
    gem.parent = this.body;

    // --- Helm: red shell over a dark head, a glowing visor slit, two swept-back horns. ---
    const head = box("dgHeadCore", 0.3, 0.32, 0.3, dark, scene);
    head.position.y = 1.66;
    head.parent = this.body;
    const helm = box("dgHelm", 0.36, 0.26, 0.34, red, scene);
    helm.position.y = 1.72;
    helm.parent = this.body;
    const visor = box("dgVisor", 0.3, 0.05, 0.02, glow, scene);
    visor.position = new Vector3(0, 1.64, 0.18);
    visor.parent = this.body;
    for (const sx of [-1, 1]) {
      const horn = cone("dgHorn", 0.42, 0.1, gold, scene);
      horn.position = new Vector3(sx * 0.14, 1.8, -0.05);
      horn.rotation.x = -2.4; // sweep back and up
      horn.rotation.z = sx * 0.3;
      horn.parent = this.body;
    }

    // --- Pauldrons: big red dragon plates with a gold rim and an upward spike. ---
    for (const sx of [-1, 1]) {
      const pauldron = box("dgPauldron", 0.3, 0.22, 0.4, red, scene);
      pauldron.position = new Vector3(sx * 0.36, 1.46, 0);
      pauldron.parent = this.body;
      const rim = box("dgPauldronRim", 0.32, 0.05, 0.42, gold, scene);
      rim.position = new Vector3(sx * 0.36, 1.35, 0);
      rim.parent = this.body;
      const spike = cone("dgPauldronSpike", 0.28, 0.12, gold, scene);
      spike.position = new Vector3(sx * 0.4, 1.56, 0);
      spike.rotation.z = sx * 0.5;
      spike.parent = this.body;
    }

    // --- Arms: red vambraces down to dark fists (right arm strikes). ---
    this.leftArm = limb("dgArmL", red, scene);
    this.leftArm.position = new Vector3(-0.34, 1.4, 0);
    this.leftArm.parent = this.body;
    this.rightArm = limb("dgArmR", red, scene);
    this.rightArm.position = new Vector3(0.34, 1.4, 0);
    this.rightArm.parent = this.body;
    for (const arm of [this.leftArm, this.rightArm]) {
      const fist = box("dgFist", 0.2, 0.18, 0.22, dark, scene);
      fist.position.y = -0.62;
      fist.parent = arm;
    }

    // --- Wings: a pivot per side at the upper back; a bone, gold ribs and red membranes. ---
    this.leftWing = this.buildWing(scene, -1, red, gold, glow);
    this.rightWing = this.buildWing(scene, 1, red, gold, glow);
    for (const w of [this.leftWing, this.rightWing]) w.parent = this.body;
  }

  /** One wing: a leading-edge bone angled up/out, three membrane panels and gold rib tips. */
  private buildWing(
    scene: Scene,
    sx: number,
    membrane: StandardMaterial,
    rib: StandardMaterial,
    edge: StandardMaterial,
  ): TransformNode {
    const pivot = new TransformNode("dgWingPivot", scene);
    pivot.position = new Vector3(sx * 0.18, 1.36, -0.16);

    const bone = box("dgWingBone", 0.06, 0.06, 1.0, rib, scene);
    bone.position = new Vector3(sx * 0.45, 0.35, -0.45);
    bone.rotation.x = 0.9;
    bone.rotation.z = sx * -0.5;
    bone.parent = pivot;

    // Three membrane panels fanning out and back, with a gold rib tip on each.
    const panels: [number, number, number][] = [
      [0.55, 0.55, 0.2],
      [0.75, 0.7, -0.15],
      [0.9, 0.5, -0.55],
    ];
    panels.forEach(([dist, span, back], i) => {
      const panel = box(`dgWingMem${i}`, 0.04, span, 0.5, membrane, scene);
      panel.position = new Vector3(sx * dist, 0.25 + i * 0.02, -0.3 + back);
      panel.rotation.x = 0.8;
      panel.rotation.z = sx * -0.6;
      panel.parent = pivot;
      const tip = cone("dgWingTip", 0.3, 0.07, edge, scene);
      tip.position = new Vector3(sx * (dist + 0.08), 0.25 + span / 2, -0.3 + back);
      tip.rotation.z = sx * -1.4;
      tip.parent = pivot;
    });
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
    const amp = moving ? 0.5 : 0.32;
    // Wings sweep up/down (z) with a little fore/aft (y) — mirrored per side.
    this.leftWing.rotation.z = -amp * beat - 0.1;
    this.rightWing.rotation.z = amp * beat + 0.1;
    this.leftWing.rotation.y = -0.15 + beat * 0.1;
    this.rightWing.rotation.y = 0.15 - beat * 0.1;
    // Gentle hover bob.
    this.body.position.y = 0.06 + beat * 0.04;

    if (this.strikeT > 0) {
      this.strikeT = Math.max(0, this.strikeT - dt);
      const p = 1 - this.strikeT / STRIKE_DUR;
      // Wind up behind, slam down in front, recover.
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

function box(name: string, w: number, h: number, d: number, material: StandardMaterial, scene: Scene) {
  const m = MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
  m.material = material;
  m.isPickable = false;
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

/** A 4-sided cone (spike/horn) on a pivot at its base; tip points +Y before rotation. */
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
