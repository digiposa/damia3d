import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import type { WeaponKind, HairStyle, OutfitStyle } from "../data/bearers";

export interface HumanoidOptions {
  /** Primary body colour (RGB 0–1). */
  color: [number, number, number];
  /** Weapon silhouette to carry (default "sword"). */
  weapon?: WeaponKind;
  /** Distinctive hairstyle (e.g. Meru's high ponytail). */
  hair?: HairStyle;
  /** Outfit overlaid on the figure (e.g. Dart's red adventuring armour — human form). */
  outfit?: OutfitStyle;
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
  /** Long ponytail (if any) — swayed by motion. */
  private ponytail?: TransformNode;
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

    if (opts.outfit) this.addArmor(scene, opts.color, opts.outfit);

    if (opts.hair === "ponytail") {
      this.ponytail = buildPonytail(scene);
      this.ponytail.parent = this.body; // bobs with the head
    } else if (opts.hair === "spiky") {
      buildSpikyHair(scene).parent = this.body; // rigid, just bobs with the head
    } else if (opts.hair === "short") {
      buildShortHair(scene).parent = this.body;
    }
  }

  /**
   * Overlay armour on the figure: pauldrons, a chest plate, a dark high collar, a
   * belt with a buckle, gauntlets/vambraces, and boots with knee guards. Pieces
   * parent to the body (static) or to a limb (so they swing with it). Three styles:
   * "armored"   — Dart: bearer-coloured plates, strongly asymmetric shoulders,
   *               leather gauntlets, cloth showing.
   * "knight"    — Lavitz: steel plates over bearer-coloured clothing, symmetric
   *               shoulders, steel vambraces.
   * "fullplate" — Zieg: heavy bearer-coloured plate covering the whole body —
   *               symmetric, large pauldrons, plated arms, thighs and boots.
   */
  private addArmor(scene: Scene, color: [number, number, number], style: OutfitStyle): void {
    const [r, g, b] = color;
    const knight = style === "knight";
    const full = style === "fullplate";
    const symmetric = knight || full;
    const steel = mat("armSteel", 0.76, 0.78, 0.84, scene);
    const plate = knight ? steel : mat("armPlate", r, g, b, scene);
    const strap = mat("armStrap", r * 0.3, g * 0.3, b * 0.3, scene); // near-black undersuit
    const boot = mat("armBoot", 0.32, 0.22, 0.12, scene);
    const metal = mat("armMetal", 0.72, 0.74, 0.8, scene);

    const piece = (
      name: string,
      w: number,
      h: number,
      d: number,
      pos: Vector3,
      material: StandardMaterial,
      parent: TransformNode,
    ) => {
      const m = box(name, w, h, d, material, scene);
      m.position = pos;
      m.parent = parent;
      return m;
    };

    // Dark high collar / undersuit at the neck.
    piece("collar", 0.3, 0.22, 0.26, new Vector3(0, 1.42, 0), strap, this.body);
    // Chest plate, slightly proud of the torso (taller for full plate).
    piece("chestplate", 0.42, full ? 0.6 : 0.46, 0.08, new Vector3(0, full ? 1.06 : 1.12, 0.15), plate, this.body);

    if (symmetric) {
      const [pw, ph, pd] = full ? [0.3, 0.24, 0.44] : [0.27, 0.2, 0.38];
      const px = full ? 0.37 : 0.36;
      piece("pauldronL", pw, ph, pd, new Vector3(-px, 1.45, 0), plate, this.body);
      piece("pauldronR", pw, ph, pd, new Vector3(px, 1.45, 0), plate, this.body);
    } else {
      // Dart's signature: a big two-tier pauldron on the left (non-sword) shoulder,
      // just a thin guard on the right.
      piece("pauldronL", 0.34, 0.22, 0.44, new Vector3(-0.38, 1.44, 0), plate, this.body);
      piece("pauldronLTop", 0.28, 0.16, 0.36, new Vector3(-0.36, 1.6, 0), plate, this.body);
      piece("pauldronR", 0.16, 0.1, 0.26, new Vector3(0.33, 1.4, 0), plate, this.body);
    }

    // Belt with a metal buckle.
    piece("belt", 0.47, 0.11, 0.31, new Vector3(0, 0.82, 0), strap, this.body);
    piece("buckle", 0.1, 0.09, 0.04, new Vector3(0, 0.82, 0.16), metal, this.body);

    // Gauntlets/vambraces swing with the arms; full plate runs the length of the
    // forearm in the bearer's colour, a knight's are steel, else leather.
    const gauntletMat = full ? plate : knight ? steel : strap;
    for (const arm of [this.leftArm, this.rightArm]) {
      piece("gauntlet", 0.2, full ? 0.5 : 0.24, 0.2, new Vector3(0, full ? -0.4 : -0.48, 0), gauntletMat, arm);
    }

    // Boots + knee guards swing with the legs; full plate adds plated thighs and
    // armoured boots for head-to-toe coverage.
    for (const leg of [this.leftLeg, this.rightLeg]) {
      if (full) piece("thigh", 0.22, 0.42, 0.26, new Vector3(0, -0.2, 0.01), plate, leg);
      piece("boot", 0.22, 0.34, 0.27, new Vector3(0, -0.62, 0.02), full ? plate : boot, leg);
      piece("knee", 0.21, 0.13, 0.23, new Vector3(0, -0.34, 0.01), plate, leg);
    }
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

    // The ponytail lags the body's motion — a wider sway on the move, a faint one at rest.
    if (this.ponytail) {
      const amp = moving ? 0.2 : 0.05;
      this.ponytail.rotation.x = 0.12 + Math.sin(this.phase) * amp;
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

/** A 4-sided cone "hair spike" on a pivot at its base, so it can lean outward. */
function coneSpike(
  scene: Scene,
  material: StandardMaterial,
  pos: Vector3,
  rotX: number,
  rotZ: number,
  len: number,
  baseD = 0.13,
): TransformNode {
  const pivot = new TransformNode("hairSpikePivot", scene);
  pivot.position = pos;
  pivot.rotation.x = rotX;
  pivot.rotation.z = rotZ;
  const cone = MeshBuilder.CreateCylinder(
    "hairSpike",
    { height: len, diameterTop: 0, diameterBottom: baseD, tessellation: 4 },
    scene,
  );
  cone.position.y = len / 2; // base at the pivot, tip outward
  cone.material = material;
  cone.isPickable = false;
  cone.parent = pivot;
  return pivot;
}

/**
 * Lavitz's hair: short swept-back blond — a snug cap with a few short spikes
 * sweeping up and forward over the brow. Rigid; bobs with the head.
 */
function buildShortHair(scene: Scene): TransformNode {
  const group = new TransformNode("hairShort", scene);
  const blond = mat("hairBlond", 0.74, 0.56, 0.24, scene);

  const cap = box("hairCap", 0.37, 0.2, 0.37, blond, scene);
  cap.position.y = 1.72;
  cap.parent = group;

  coneSpike(scene, blond, new Vector3(0, 1.8, 0.13), 0.9, 0, 0.2, 0.11).parent = group;
  coneSpike(scene, blond, new Vector3(-0.1, 1.8, 0.11), 0.8, -0.2, 0.18, 0.1).parent = group;
  coneSpike(scene, blond, new Vector3(0.1, 1.8, 0.11), 0.8, 0.2, 0.18, 0.1).parent = group;
  coneSpike(scene, blond, new Vector3(0, 1.83, -0.02), 0.1, 0, 0.18, 0.1).parent = group;
  return group;
}

/**
 * Meru's signature: a high silver ponytail with a blue bow, gathered at the back
 * of the crown and falling down the back (−Z). Built around a pivot at the crown
 * so the whole tail can sway from {@link Humanoid.update}.
 */
function buildPonytail(scene: Scene): TransformNode {
  const pivot = new TransformNode("ponytail", scene);
  pivot.position = new Vector3(0, 1.74, -0.13); // back-top of the head
  const silver = mat("hairSilver", 0.84, 0.86, 0.93, scene);
  const bow = mat("hairBow", 0.18, 0.26, 0.62, scene);

  // Hair gathered at the crown, then a long tail in two tapering segments.
  const gather = box("hairGather", 0.18, 0.2, 0.18, silver, scene);
  gather.position = new Vector3(0, 0.05, 0);
  gather.parent = pivot;

  const tail1 = box("hairTail1", 0.18, 0.6, 0.15, silver, scene);
  tail1.position = new Vector3(0, -0.28, -0.06);
  tail1.parent = pivot;

  const tail2 = box("hairTail2", 0.13, 0.55, 0.11, silver, scene);
  tail2.position = new Vector3(0, -0.78, -0.1);
  tail2.parent = pivot;

  // Blue bow flanking the tie.
  for (const dx of [-0.12, 0.12]) {
    const loop = box("hairBow", 0.12, 0.16, 0.1, bow, scene);
    loop.position = new Vector3(dx, 0.13, 0.0);
    loop.parent = pivot;
  }
  return pivot;
}

/**
 * Dart's signature: a head of spiky auburn hair — a thin scalp cap plus a fan of
 * low-poly 4-sided spikes radiating up and outward from the crown, for that PS1
 * "anime spike" silhouette. Rigid (no sway); just bobs with the head.
 */
function buildSpikyHair(scene: Scene): TransformNode {
  const group = new TransformNode("hairSpiky", scene);
  const hair = mat("hairAuburn", 0.46, 0.3, 0.16, scene);

  // A low cap so the scalp reads as hair, not skin, under the spikes.
  const cap = box("hairCap", 0.37, 0.16, 0.36, hair, scene);
  cap.position.y = 1.74;
  cap.parent = group;

  // Dart's red bandana: a band around the forehead with a knot and two tails
  // trailing down the back.
  const red = mat("bandana", 0.72, 0.12, 0.12, scene);
  const band = MeshBuilder.CreateTorus("bandana", { diameter: 0.37, thickness: 0.08, tessellation: 10 }, scene);
  band.position.y = 1.66; // forehead, just above the eyes
  band.material = red;
  band.isPickable = false;
  band.parent = group;
  const knot = box("bandanaKnot", 0.11, 0.11, 0.1, red, scene);
  knot.position = new Vector3(0, 1.66, -0.2);
  knot.parent = group;
  for (const dx of [-0.04, 0.05]) {
    const tail = box("bandanaTail", 0.05, 0.28, 0.04, red, scene);
    tail.position = new Vector3(dx, 1.52, -0.22);
    tail.rotation.x = -0.25;
    tail.parent = group;
  }

  const spike = (x: number, y: number, z: number, rotX: number, rotZ: number, len = 0.28) =>
    (coneSpike(scene, hair, new Vector3(x, y, z), rotX, rotZ, len).parent = group);

  // Front (sweeping forward), top, back, and sides — a messy radiating fan.
  spike(0, 1.78, 0.15, 0.8, 0);
  spike(-0.11, 1.76, 0.13, 0.6, -0.25);
  spike(0.11, 1.76, 0.13, 0.6, 0.25);
  spike(-0.08, 1.82, 0, 0, -0.3);
  spike(0.08, 1.82, 0, 0, 0.3);
  spike(0, 1.83, -0.04, -0.15, 0, 0.3);
  spike(-0.11, 1.77, -0.14, -0.6, -0.25);
  spike(0.11, 1.77, -0.14, -0.6, 0.25);
  spike(-0.17, 1.72, 0, 0, -0.9, 0.24);
  spike(0.17, 1.72, 0, 0, 0.9, 0.24);
  return group;
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
