import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import type { WeaponKind } from "../data/bearers";

export interface HumanoidOptions {
  /** Primary body colour (RGB 0–1). */
  color: [number, number, number];
  /** Weapon silhouette to carry (default "sword"). */
  weapon?: WeaponKind;
  /** Uniform scale (default 1). */
  scale?: number;
}

/** How long one strike animation lasts (seconds). */
const STRIKE_DUR = 0.42;

/** Melee weapons swing overhead; spear/fist jab forward; the bow draws back. */
type StrikeStyle = "swing" | "thrust" | "draw";

const STRIKE_STYLE: Record<WeaponKind, StrikeStyle> = {
  sword: "swing",
  rapier: "thrust",
  hammer: "swing",
  axe: "swing",
  spear: "thrust",
  fist: "thrust",
  bow: "draw",
};

/**
 * A low-poly humanoid built from primitives — a clear stand-in figure (head with
 * eyes, torso, arms, legs) carrying a weapon, until rigged glTF art is dropped in.
 * Reads as a person rather than a capsule, tints to the bearer's colour, and runs
 * a light procedural walk/idle animation plus a one-shot {@link strike}. Pure
 * transforms; no skeleton. Faces +Z (the owner rotates the parent to steer).
 */
export class Humanoid {
  /** Visual root — parent this under the entity's node. */
  readonly rig: TransformNode;

  private body: TransformNode; // torso/head/arms group (bobs)
  private leftArm: TransformNode;
  private rightArm: TransformNode;
  private leftLeg: TransformNode;
  private rightLeg: TransformNode;
  /** The arm that performs the strike (right for melee, right draws the bow). */
  private strikeArm: TransformNode;
  private style: StrikeStyle;
  private phase = 0;
  private strikeT = 0;

  constructor(scene: Scene, opts: HumanoidOptions) {
    const [r, g, b] = opts.color;
    const weapon = opts.weapon ?? "sword";
    this.style = STRIKE_STYLE[weapon];

    this.rig = new TransformNode("humanoid", scene);
    this.rig.scaling.setAll(opts.scale ?? 1);

    const main = mat("hMain", r, g, b, scene);
    const dark = mat("hDark", r * 0.55, g * 0.55, b * 0.55, scene);
    const light = mat("hLight", 0.5 + r * 0.5, 0.5 + g * 0.5, 0.5 + b * 0.5, scene);
    const eyeMat = mat("hEye", 0.08, 0.08, 0.1, scene);

    // Torso / head / arms bob together; legs stay planted on the rig.
    this.body = new TransformNode("hBody", scene);
    this.body.parent = this.rig;

    const pelvis = box("hPelvis", 0.44, 0.22, 0.28, dark, scene);
    pelvis.position.y = 0.78;
    pelvis.parent = this.body;

    const torso = box("hTorso", 0.46, 0.62, 0.28, main, scene);
    torso.position.y = 1.12;
    torso.parent = this.body;

    const head = box("hHead", 0.34, 0.34, 0.32, light, scene);
    head.position.y = 1.6;
    head.parent = this.body;

    // Two eyes on the +Z face so facing — and personality — read at a glance.
    for (const dx of [-0.08, 0.08]) {
      const eye = box("hEye", 0.06, 0.07, 0.04, eyeMat, scene);
      eye.position = new Vector3(dx, 1.63, 0.17);
      eye.parent = this.body;
    }

    this.leftArm = limb("hArmL", 0.6, 0.16, main, scene);
    this.leftArm.position = new Vector3(-0.32, 1.36, 0);
    this.leftArm.parent = this.body;

    this.rightArm = limb("hArmR", 0.6, 0.16, main, scene);
    this.rightArm.position = new Vector3(0.32, 1.36, 0);
    this.rightArm.parent = this.body;

    this.leftLeg = limb("hLegL", 0.78, 0.18, dark, scene);
    this.leftLeg.position = new Vector3(-0.13, 0.78, 0);
    this.leftLeg.parent = this.rig;

    this.rightLeg = limb("hLegR", 0.78, 0.18, dark, scene);
    this.rightLeg.position = new Vector3(0.13, 0.78, 0);
    this.rightLeg.parent = this.rig;

    // The bow is held in the off (left) hand and drawn with the right; every other
    // weapon is wielded in the right hand. Attach it at the hand (bottom of the arm).
    const wieldArm = weapon === "bow" ? this.leftArm : this.rightArm;
    this.strikeArm = this.rightArm;
    const weaponNode = buildWeapon(weapon, main, scene);
    weaponNode.position = new Vector3(0, -0.58, 0.06); // hand, just forward
    weaponNode.parent = wieldArm;
  }

  /** Hide/show the figure (e.g. when a loaded glTF model replaces it). */
  setEnabled(on: boolean): void {
    this.rig.setEnabled(on);
  }

  /** Trigger a one-shot strike animation (call when a blow lands). */
  strike(): void {
    this.strikeT = STRIKE_DUR;
  }

  /** Advance the procedural animation: a walk cycle when moving, a gentle idle otherwise, plus any active strike. */
  update(dt: number, moving: boolean): void {
    if (moving) {
      this.phase += dt * 9;
      const s = Math.sin(this.phase) * 0.6;
      this.leftArm.rotation.x = s;
      this.rightArm.rotation.x = -s;
      this.leftLeg.rotation.x = -s;
      this.rightLeg.rotation.x = s;
      this.body.position.y = Math.abs(Math.sin(this.phase)) * 0.05;
    } else {
      this.phase += dt * 2.2;
      const decay = Math.max(0, 1 - dt * 6); // relax limbs back to rest
      this.leftArm.rotation.x *= decay;
      this.rightArm.rotation.x *= decay;
      this.leftLeg.rotation.x *= decay;
      this.rightLeg.rotation.x *= decay;
      this.body.position.y = 0.02 + Math.sin(this.phase) * 0.015;
    }

    // A strike overrides the wielding arm for its duration (player is usually
    // stationary mid-attack, so the legs keep their idle/walk pose).
    if (this.strikeT > 0) {
      this.strikeT = Math.max(0, this.strikeT - dt);
      const p = 1 - this.strikeT / STRIKE_DUR; // 0 → 1 progress
      this.strikeArm.rotation.x = strikeAngle(this.style, p);
    }
  }

  dispose(): void {
    this.rig.dispose();
  }
}

/**
 * Strike rotation (radians about X) over progress `p` ∈ [0,1]. Positive swings the
 * arm forward (+Z). Flip the signs here if a weapon visually arcs the wrong way.
 */
function strikeAngle(style: StrikeStyle, p: number): number {
  switch (style) {
    case "swing": // wind up behind, slam down in front, recover
      if (p < 0.22) return lerp(0, -1.4, p / 0.22);
      if (p < 0.5) return lerp(-1.4, 1.1, (p - 0.22) / 0.28);
      return lerp(1.1, 0, (p - 0.5) / 0.5);
    case "thrust": // quick forward jab, then retract
      if (p < 0.35) return lerp(0, 1.2, p / 0.35);
      return lerp(1.2, 0, (p - 0.35) / 0.65);
    case "draw": // pull the string back, then release forward
      if (p < 0.55) return lerp(0, -0.7, p / 0.55);
      return lerp(-0.7, 0, (p - 0.55) / 0.45);
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

// --- builders ---------------------------------------------------------------

function mat(name: string, r: number, g: number, b: number, scene: Scene): StandardMaterial {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = new Color3(r, g, b);
  m.specularColor = new Color3(0.08, 0.08, 0.08);
  return m;
}

function box(
  name: string,
  w: number,
  h: number,
  d: number,
  material: StandardMaterial,
  scene: Scene,
) {
  const m = MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
  m.material = material;
  m.isPickable = false;
  return m;
}

/** A limb: a pivot node at the joint with a segment hanging below it (rotates from the joint). */
function limb(name: string, length: number, thick: number, material: StandardMaterial, scene: Scene): TransformNode {
  const pivot = new TransformNode(name, scene);
  const seg = MeshBuilder.CreateBox(name + "Seg", { width: thick, height: length, depth: thick }, scene);
  seg.position.y = -length / 2;
  seg.material = material;
  seg.isPickable = false;
  seg.parent = pivot;
  return pivot;
}

/**
 * A weapon held at the hand, geometry laid out along +Z (the grip at the origin,
 * the business end forward) so it points ahead of a hanging arm and arcs naturally
 * during a strike. `accent` tints character-coloured parts (e.g. the bow grip).
 */
function buildWeapon(kind: WeaponKind, accent: StandardMaterial, scene: Scene): TransformNode {
  const group = new TransformNode(`weapon_${kind}`, scene);
  const steel = mat("wSteel", 0.72, 0.74, 0.8, scene);
  const wood = mat("wWood", 0.34, 0.22, 0.12, scene);

  const part = (
    name: string,
    w: number,
    h: number,
    d: number,
    z: number,
    material: StandardMaterial,
  ) => {
    const m = box(name, w, h, d, material, scene);
    m.position.z = z;
    m.parent = group;
    return m;
  };

  switch (kind) {
    case "sword":
      part("blade", 0.07, 0.07, 0.9, 0.5, steel);
      part("guard", 0.3, 0.07, 0.07, 0.08, accent);
      part("grip", 0.06, 0.06, 0.2, -0.08, wood);
      break;
    case "rapier": // thinner, longer, small guard
      part("blade", 0.04, 0.04, 1.05, 0.55, steel);
      part("guard", 0.18, 0.05, 0.06, 0.05, accent);
      part("grip", 0.05, 0.05, 0.18, -0.07, wood);
      break;
    case "spear":
      part("shaft", 0.05, 0.05, 1.6, 0.5, wood);
      part("head", 0.1, 0.1, 0.26, 1.4, steel);
      break;
    case "hammer":
      part("shaft", 0.06, 0.06, 0.9, 0.35, wood);
      part("head", 0.3, 0.3, 0.32, 0.85, accent);
      break;
    case "axe":
      part("shaft", 0.06, 0.06, 1.0, 0.4, wood);
      part("head", 0.08, 0.42, 0.34, 0.9, steel);
      break;
    case "bow": {
      // A vertical stave (along Y) with a thin string in front of it.
      const stave = box("bowStave", 0.05, 1.1, 0.12, accent, scene);
      stave.parent = group;
      const string = box("bowString", 0.02, 1.0, 0.02, steel, scene);
      string.position.z = 0.07;
      string.parent = group;
      break;
    }
    case "fist":
      // Bare-handed: a slightly chunkier knuckle so the punch reads.
      part("fist", 0.2, 0.2, 0.2, 0.02, accent);
      break;
  }
  return group;
}
