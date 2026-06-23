import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import type { WeaponKind, WeaponVariant, HairStyle, OutfitStyle } from "../data/bearers";

export interface HumanoidOptions {
  /** Primary body colour (RGB 0–1). */
  color: [number, number, number];
  /** Weapon silhouette to carry (default "sword"). */
  weapon?: WeaponKind;
  /** Optional weapon variant for a signature look (e.g. Zieg's spiked broadsword). */
  weaponVariant?: WeaponVariant;
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
  /** For bow bearers: the off-hand arm that holds and presents the bow (left). */
  private bowArm?: TransformNode;
  /** The wielded weapon node (counter-rotated to keep the bow upright while aiming). */
  private weaponNode!: TransformNode;
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

    // Exposed skin (the face) always uses a neutral skin tone — the bearer's colour
    // belongs to their clothing/armour, not their skin (so Lavitz isn't green-faced).
    // Revealing outfits (the dancer) additionally skin the whole body; covered figures
    // keep the bearer's colour on the torso and limbs, where it reads as clothing.
    const revealing =
      opts.outfit === "dancer" ||
      opts.outfit === "archer" ||
      opts.outfit === "darkness" ||
      opts.outfit === "valkyrie";
    const skinMain = mat("hSkin", 0.94, 0.79, 0.67, scene);
    const skinDark = mat("hSkinDk", 0.84, 0.68, 0.56, scene);
    const skinLight = mat("hSkinHi", 0.96, 0.83, 0.72, scene);
    const main = revealing ? skinMain : mat("hMain", r, g, b, scene);
    const dark = revealing ? skinDark : mat("hDark", r * 0.55, g * 0.55, b * 0.55, scene);
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

    const head = box("hHead", 0.34, 0.34, 0.32, skinLight, scene);
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
    if (weapon === "bow") this.bowArm = this.leftArm;
    const weaponNode = buildWeapon(weapon, main, scene, opts.weaponVariant);
    weaponNode.position = new Vector3(0, -0.58, 0.06); // hand, just forward
    weaponNode.parent = wieldArm;
    this.weaponNode = weaponNode;

    if (opts.outfit === "dancer") this.addDancerOutfit(scene, opts.color);
    else if (opts.outfit === "archer") this.addArcherOutfit(scene);
    else if (opts.outfit === "noble") this.addNobleOutfit(scene);
    else if (opts.outfit === "darkness") this.addDarknessOutfit(scene);
    else if (opts.outfit === "valkyrie") this.addValkyrieOutfit(scene);
    else if (opts.outfit) this.addArmor(scene, opts.color, opts.outfit);

    if (opts.hair === "ponytail") {
      this.ponytail = buildPonytail(scene);
      this.ponytail.parent = this.body; // bobs with the head
    } else if (opts.hair === "spiky") {
      buildSpikyHair(scene).parent = this.body; // rigid, just bobs with the head
    } else if (opts.hair === "short") {
      buildShortHair(scene).parent = this.body;
    } else if (opts.hair === "bob") {
      buildBobHair(scene).parent = this.body;
    } else if (opts.hair === "swept") {
      buildSweptHair(scene).parent = this.body;
    } else if (opts.hair === "long") {
      buildLongHair(scene).parent = this.body;
    } else if (opts.hair === "flow") {
      buildFlowHair(scene).parent = this.body;
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
      const [pw, ph, pd] = full ? [0.25, 0.2, 0.36] : [0.27, 0.2, 0.38];
      const px = full ? 0.34 : 0.36;
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

    // Boots + knee guards swing with the legs; the knight and full plate wear steel
    // boots (matching the rest of their armour), while lighter outfits wear leather.
    for (const leg of [this.leftLeg, this.rightLeg]) {
      if (full) piece("thigh", 0.22, 0.42, 0.26, new Vector3(0, -0.2, 0.01), plate, leg);
      piece("boot", 0.22, 0.34, 0.27, new Vector3(0, -0.62, 0.02), full || knight ? plate : boot, leg);
      piece("knee", 0.21, 0.13, 0.23, new Vector3(0, -0.34, 0.01), plate, leg);
    }
  }

  /**
   * Meru's dancer outfit (blue + gold + cream): a bodice top covering the chest
   * (bare midriff between it and the skirt), a three-panel skirt (small front apron
   * + two big back panels sweeping left/right, like the artwork), a waist sash,
   * gold/blue wrist cuffs, and gold/blue calf greaves. Built over the skin-toned body.
   */
  private addDancerOutfit(scene: Scene, color: [number, number, number]): void {
    const [r, g, b] = color;
    const blue = mat("dnBlue", r, g, b, scene); // her blue
    const gold = mat("dnGold", 0.83, 0.68, 0.22, scene);
    const cream = mat("dnCream", 0.88, 0.9, 0.95, scene);

    // Bodice covering the chest, with a gold under-trim (midriff left bare).
    const top = box("dnTop", 0.44, 0.28, 0.31, blue, scene);
    top.position.y = 1.22;
    top.parent = this.body;
    const topTrim = box("dnTopTrim", 0.45, 0.06, 0.32, gold, scene);
    topTrim.position.y = 1.07;
    topTrim.parent = this.body;

    // Skirt: not a full ring — just three cloth panels like the artwork. A small
    // apron in front, and two large panels at the back that sweep out to the left
    // and right (the "butterfly" flare). Negative tilt flares them outward & down.
    const addPanel = (azimuthDeg: number, w: number, h: number, tiltX: number, radius: number, material: StandardMaterial) => {
      const pivot = new TransformNode("skirtPanelPivot", scene);
      pivot.position = new Vector3(0, 0.8, 0);
      pivot.rotation.y = (azimuthDeg * Math.PI) / 180;
      pivot.parent = this.rig;
      const panel = box("skirtPanel", w, h, 0.04, material, scene);
      panel.rotation.x = tiltX;
      panel.position = new Vector3(0, -0.2, radius);
      panel.parent = pivot;
    };
    addPanel(0, 0.22, 0.4, -0.4, 0.16, blue); // small front apron
    addPanel(125, 0.46, 0.62, -0.85, 0.24, cream); // big back-left panel, sweeping left
    addPanel(-125, 0.46, 0.62, -0.85, 0.24, cream); // big back-right panel, sweeping right

    // Blue waist sash capping the tops of the panels.
    const sash = box("sash", 0.44, 0.14, 0.34, blue, scene);
    sash.position.y = 0.82;
    sash.parent = this.body;

    // Gold wrist cuffs with a blue edge (swing with the arms).
    for (const arm of [this.leftArm, this.rightArm]) {
      const cuff = box("cuff", 0.21, 0.18, 0.21, gold, scene);
      cuff.position.y = -0.5;
      cuff.parent = arm;
    }
    // Gold calf greaves with a blue ribbon at the back (swing with the legs).
    for (const leg of [this.leftLeg, this.rightLeg]) {
      const greave = box("greave", 0.21, 0.3, 0.22, gold, scene);
      greave.position.y = -0.55;
      greave.parent = leg;
      const ribbon = box("ribbon", 0.07, 0.16, 0.07, blue, scene);
      ribbon.position = new Vector3(0, -0.4, -0.14);
      ribbon.parent = leg;
    }
  }

  /**
   * Shana's archer outfit: a white short top with blue collar/hem trim over a brown
   * leather waist corset, short blue shorts, brown wrist guards, a single leather
   * shoulder pauldron, cream socks with brown boots, and a quiver of arrows on the
   * back. Built over the skin-toned body (bare arms and legs) — she also carries a bow.
   */
  private addArcherOutfit(scene: Scene): void {
    const white = mat("arWhite", 0.9, 0.92, 0.95, scene);
    const blue = mat("arBlue", 0.42, 0.55, 0.75, scene);
    const brown = mat("arBrown", 0.42, 0.28, 0.16, scene);
    const tan = mat("arTan", 0.6, 0.44, 0.27, scene);
    const sockMat = mat("arSock", 0.9, 0.9, 0.86, scene);
    const gold = mat("arBuckle", 0.8, 0.66, 0.3, scene);

    // White top covering the chest to the waist, with blue collar, hem and a
    // centre placket.
    const top = box("arTop", 0.48, 0.5, 0.3, white, scene);
    top.position.y = 1.18;
    top.parent = this.body;
    const collar = box("arCollar", 0.49, 0.07, 0.31, blue, scene);
    collar.position.y = 1.4;
    collar.parent = this.body;
    const hem = box("arHem", 0.49, 0.06, 0.31, blue, scene);
    hem.position.y = 0.96;
    hem.parent = this.body;
    const placket = box("arPlacket", 0.06, 0.42, 0.02, blue, scene);
    placket.position = new Vector3(0, 1.18, 0.16);
    placket.parent = this.body;

    // Short white sleeve caps on the shoulders.
    for (const arm of [this.leftArm, this.rightArm]) {
      const sleeve = box("arSleeve", 0.2, 0.16, 0.22, white, scene);
      sleeve.position.y = -0.06;
      sleeve.parent = arm;
    }

    // Brown leather waist corset with a gold buckle.
    const corset = box("arCorset", 0.5, 0.22, 0.32, brown, scene);
    corset.position.y = 0.9;
    corset.parent = this.body;
    const buckle = box("arBuckleM", 0.14, 0.12, 0.04, gold, scene);
    buckle.position = new Vector3(0, 0.9, 0.17);
    buckle.parent = this.body;

    // Short blue shorts over the hips, with cuffs on the upper thighs.
    const shorts = box("arShorts", 0.47, 0.26, 0.31, blue, scene);
    shorts.position.y = 0.78;
    shorts.parent = this.body;
    for (const leg of [this.leftLeg, this.rightLeg]) {
      const cuff = box("arShortCuff", 0.2, 0.2, 0.2, blue, scene);
      cuff.position.y = -0.12;
      cuff.parent = leg;
    }

    // A single leather pauldron on the left shoulder.
    const pauldron = box("arPauldron", 0.24, 0.14, 0.3, tan, scene);
    pauldron.position = new Vector3(-0.34, 1.44, 0);
    pauldron.parent = this.body;

    // Brown wrist guards (swing with the arms).
    for (const arm of [this.leftArm, this.rightArm]) {
      const guard = box("arWrist", 0.19, 0.16, 0.19, brown, scene);
      guard.position.y = -0.46;
      guard.parent = arm;
    }

    // Cream socks topped over brown boots (swing with the legs).
    for (const leg of [this.leftLeg, this.rightLeg]) {
      const sock = box("arSockM", 0.2, 0.16, 0.2, sockMat, scene);
      sock.position.y = -0.5;
      sock.parent = leg;
      const boot = box("arBoot", 0.22, 0.26, 0.26, brown, scene);
      boot.position = new Vector3(0, -0.66, 0.02);
      boot.parent = leg;
    }

    // Quiver of arrows slung across the back.
    const quiver = MeshBuilder.CreateCylinder("arQuiver", { height: 0.5, diameter: 0.12, tessellation: 10 }, scene);
    quiver.material = tan;
    quiver.isPickable = false;
    quiver.rotation.x = 0.35;
    quiver.position = new Vector3(0.14, 1.18, -0.22);
    quiver.parent = this.body;
    for (const dx of [-0.04, 0, 0.04]) {
      const shaft = box("arArrow", 0.02, 0.26, 0.02, white, scene);
      shaft.rotation.x = 0.35;
      shaft.position = new Vector3(0.14 + dx, 1.46, -0.28);
      shaft.parent = this.body;
    }
  }

  /**
   * Albert's noble outfit: a white breastplate and an olive shoulder mantle over his
   * green tunic (the body colour carries the tunic/sleeves), a belt with a gold buckle,
   * a short tunic skirt, brown gloves, tan breeches with boots and gold disc knee
   * guards, and a long cape down the back. Built over the bearer-coloured body.
   */
  private addNobleOutfit(scene: Scene): void {
    const white = mat("nbWhite", 0.86, 0.85, 0.8, scene);
    const olive = mat("nbOlive", 0.3, 0.34, 0.2, scene);
    const brown = mat("nbBrown", 0.5, 0.36, 0.2, scene);
    const tan = mat("nbTan", 0.66, 0.5, 0.3, scene);
    const gold = mat("nbGold", 0.8, 0.66, 0.3, scene);
    const capeMat = mat("nbCape", 0.4, 0.42, 0.44, scene);
    const green = mat("nbGreen", 0.48, 0.54, 0.34, scene); // tunic skirt (darker than the body)

    // White breastplate over the chest.
    const plate = box("nbPlate", 0.44, 0.4, 0.1, white, scene);
    plate.position = new Vector3(0, 1.2, 0.12);
    plate.parent = this.body;

    // Olive shoulder mantle: a drape over both shoulders plus a short back panel.
    const mantle = box("nbMantle", 0.56, 0.16, 0.36, olive, scene);
    mantle.position.y = 1.42;
    mantle.parent = this.body;
    const mantleBack = box("nbMantleBack", 0.5, 0.34, 0.06, olive, scene);
    mantleBack.position = new Vector3(0, 1.24, -0.16);
    mantleBack.parent = this.body;

    // Belt with a gold buckle.
    const belt = box("nbBelt", 0.47, 0.1, 0.31, brown, scene);
    belt.position.y = 0.86;
    belt.parent = this.body;
    const buckle = box("nbBuckle", 0.12, 0.1, 0.04, gold, scene);
    buckle.position = new Vector3(0, 0.86, 0.17);
    buckle.parent = this.body;

    // Short green tunic skirt hanging over the hips.
    const skirt = box("nbSkirt", 0.46, 0.28, 0.33, green, scene);
    skirt.position.y = 0.68;
    skirt.parent = this.body;

    // Long cape hanging down the back from the shoulders.
    const cape = box("nbCapeMesh", 0.5, 1.0, 0.06, capeMat, scene);
    cape.rotation.x = -0.12;
    cape.position = new Vector3(0, 1.0, -0.2);
    cape.parent = this.body;

    // Brown gloves on the forearms (swing with the arms).
    for (const arm of [this.leftArm, this.rightArm]) {
      const glove = box("nbGlove", 0.18, 0.26, 0.18, brown, scene);
      glove.position.y = -0.46;
      glove.parent = arm;
    }

    // Tan breeches on the upper legs + boots and gold disc knee guards (swing with legs).
    for (const leg of [this.leftLeg, this.rightLeg]) {
      const breech = box("nbBreech", 0.2, 0.44, 0.2, tan, scene);
      breech.position.y = -0.22;
      breech.parent = leg;
      const boot = box("nbBoot", 0.22, 0.3, 0.26, brown, scene);
      boot.position = new Vector3(0, -0.62, 0.02);
      boot.parent = leg;
      const knee = box("nbKnee", 0.21, 0.12, 0.22, gold, scene);
      knee.position.y = -0.42;
      knee.parent = leg;
    }
  }

  /**
   * Rose's dark outfit: a near-black bodysuit with gold filigree trim, pointed
   * gold-rimmed pauldrons, a short skirt, full dark sleeves with gold cuffs, and
   * thigh-high boots with gold trim — the skin between the skirt and the boot tops
   * reads as her bare thighs. Built over the skin-toned body; she wields a rapier.
   */
  private addDarknessOutfit(scene: Scene): void {
    const dark = mat("dkDark", 0.16, 0.13, 0.22, scene);
    const gold = mat("dkGold", 0.82, 0.66, 0.28, scene);

    // Dark bodysuit over the torso, with a gold centre trim and collar.
    const torso = box("dkTorso", 0.48, 0.6, 0.31, dark, scene);
    torso.position.y = 1.12;
    torso.parent = this.body;
    const trim = box("dkTrim", 0.05, 0.5, 0.02, gold, scene);
    trim.position = new Vector3(0, 1.14, 0.16);
    trim.parent = this.body;
    const collar = box("dkCollar", 0.3, 0.1, 0.27, gold, scene);
    collar.position.y = 1.42;
    collar.parent = this.body;

    // Pointed pauldrons with a gold rim on both shoulders.
    for (const sx of [-1, 1]) {
      const pauldron = box("dkPauldron", 0.26, 0.2, 0.34, dark, scene);
      pauldron.position = new Vector3(sx * 0.34, 1.46, 0);
      pauldron.parent = this.body;
      const rim = box("dkPauldronRim", 0.28, 0.05, 0.36, gold, scene);
      rim.position = new Vector3(sx * 0.34, 1.36, 0);
      rim.parent = this.body;
    }

    // Short dark skirt over the hips with a gold hem.
    const skirt = box("dkSkirt", 0.48, 0.24, 0.35, dark, scene);
    skirt.position.y = 0.74;
    skirt.parent = this.body;
    const hem = box("dkSkirtHem", 0.49, 0.05, 0.36, gold, scene);
    hem.position.y = 0.63;
    hem.parent = this.body;

    // Full dark sleeves with a gold wrist cuff (swing with the arms).
    for (const arm of [this.leftArm, this.rightArm]) {
      const sleeve = box("dkSleeve", 0.19, 0.62, 0.19, dark, scene);
      sleeve.position.y = -0.3;
      sleeve.parent = arm;
      const cuff = box("dkCuff", 0.21, 0.1, 0.21, gold, scene);
      cuff.position.y = -0.54;
      cuff.parent = arm;
    }

    // Thigh-high boots: dark, from the foot up to mid-thigh, with gold trim at the
    // top and foot (the bare skin above each boot reads as her thigh).
    for (const leg of [this.leftLeg, this.rightLeg]) {
      const boot = box("dkBoot", 0.2, 0.48, 0.21, dark, scene);
      boot.position.y = -0.5;
      boot.parent = leg;
      const topTrim = box("dkBootTop", 0.22, 0.05, 0.23, gold, scene);
      topTrim.position.y = -0.27;
      topTrim.parent = leg;
      const footTrim = box("dkBootFoot", 0.22, 0.06, 0.24, gold, scene);
      footTrim.position.y = -0.7;
      footTrim.parent = leg;
    }
  }

  /**
   * Miranda's valkyrie archer outfit: a red bustier with silver trim, a white pleated
   * short skirt, a brown belt with leather pteruges, long elbow gloves with gold cuffs,
   * and dark thigh-high boots with folded tops over the skin-toned body (bare thighs).
   * Built over the skin-toned body; she also carries a bow.
   */
  private addValkyrieOutfit(scene: Scene): void {
    const red = mat("vkRed", 0.72, 0.2, 0.16, scene);
    const white = mat("vkWhite", 0.84, 0.85, 0.9, scene);
    const brown = mat("vkBrown", 0.46, 0.32, 0.18, scene);
    const dark = mat("vkBoot", 0.3, 0.22, 0.14, scene);
    const gold = mat("vkGold", 0.8, 0.66, 0.3, scene);

    // Red bustier over the chest with a silver under-trim and collar line.
    const bust = box("vkBust", 0.46, 0.42, 0.31, red, scene);
    bust.position.y = 1.2;
    bust.parent = this.body;
    const bustTrim = box("vkBustTrim", 0.47, 0.06, 0.32, white, scene);
    bustTrim.position.y = 1.0;
    bustTrim.parent = this.body;
    const collar = box("vkCollar", 0.48, 0.1, 0.3, white, scene);
    collar.position.y = 1.4;
    collar.parent = this.body;

    // White pleated short skirt flaring over the hips.
    const skirt = MeshBuilder.CreateCylinder(
      "vkSkirt",
      { height: 0.3, diameterTop: 0.42, diameterBottom: 0.62, tessellation: 12 },
      scene,
    );
    skirt.material = white;
    skirt.isPickable = false;
    skirt.position.y = 0.78;
    skirt.parent = this.body;

    // Brown belt with a gold buckle and a row of leather pteruges hanging in front.
    const belt = box("vkBelt", 0.5, 0.1, 0.34, brown, scene);
    belt.position.y = 0.92;
    belt.parent = this.body;
    const buckle = box("vkBuckle", 0.12, 0.1, 0.04, gold, scene);
    buckle.position = new Vector3(0, 0.92, 0.18);
    buckle.parent = this.body;
    for (const dx of [-0.18, -0.06, 0.06, 0.18]) {
      const strap = box("vkPteruge", 0.08, 0.18, 0.04, brown, scene);
      strap.position = new Vector3(dx, 0.72, 0.17);
      strap.parent = this.body;
    }

    // Long elbow gloves with a gold cuff (swing with the arms).
    for (const arm of [this.leftArm, this.rightArm]) {
      const glove = box("vkGlove", 0.19, 0.4, 0.19, brown, scene);
      glove.position.y = -0.4;
      glove.parent = arm;
      const cuff = box("vkCuff", 0.21, 0.08, 0.21, gold, scene);
      cuff.position.y = -0.56;
      cuff.parent = arm;
    }

    // Dark thigh-high boots with a folded top (bare skin above reads as her thighs).
    for (const leg of [this.leftLeg, this.rightLeg]) {
      const boot = box("vkBootMesh", 0.2, 0.5, 0.21, dark, scene);
      boot.position.y = -0.48;
      boot.parent = leg;
      const fold = box("vkBootFold", 0.23, 0.08, 0.24, dark, scene);
      fold.position.y = -0.24;
      fold.parent = leg;
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
      if (this.bowArm) {
        // Archery: the left arm presents the bow forward while the right hand draws
        // the string back and looses it. Counter-rotate the bow so it stays upright.
        const { bow, draw } = archeryArms(p);
        this.bowArm.rotation.x = bow;
        this.strikeArm.rotation.x = draw;
        this.weaponNode.rotation.x = -bow;
      } else {
        this.strikeArm.rotation.x = strikeAngle(this.style, p);
      }
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

/**
 * Two-arm archery pose over progress `p` ∈ [0,1] (rotations about X). The figure
 * faces the target along +Z, which is a NEGATIVE rotation here, so "aim forward"
 * is negative. The bow (left) arm extends forward to present the bow and holds it;
 * the draw (right) arm reaches to the string, pulls back toward the shoulder, snaps
 * forward on release, then relaxes.
 */
function archeryArms(p: number): { bow: number; draw: number } {
  let bow: number;
  if (p < 0.18) bow = lerp(0, -1.3, p / 0.18); // raise/extend forward to aim
  else if (p < 0.82) bow = -1.3; // hold steady
  else bow = lerp(-1.3, 0, (p - 0.82) / 0.18); // lower on recovery

  let draw: number;
  if (p < 0.18) draw = lerp(0, -1.2, p / 0.18); // reach forward to the string
  else if (p < 0.5) draw = lerp(-1.2, 0.1, (p - 0.18) / 0.32); // draw back toward the shoulder
  else if (p < 0.6) draw = lerp(0.1, -1.35, (p - 0.5) / 0.1); // release: snap forward
  else draw = lerp(-1.35, 0, (p - 0.6) / 0.4); // follow-through, relax

  return { bow, draw };
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
 * Shana's hair: a shoulder-length brown bob parted over the brow. A high crown cap
 * (kept above the eyes so the face reads), a fuller mass at the back/nape, and two
 * locks framing the sides of the face down to the shoulders. Rigid; bobs with the head.
 */
function buildBobHair(scene: Scene): TransformNode {
  const group = new TransformNode("hairBob", scene);
  const brown = mat("hairBrown", 0.42, 0.28, 0.15, scene);

  // Crown cap sitting high, its front edge above the eyes (the hairline / bangs).
  const cap = box("hairCap", 0.4, 0.2, 0.38, brown, scene);
  cap.position.y = 1.8;
  cap.parent = group;

  // Fuller mass covering the back of the head and nape.
  const back = box("hairBack", 0.38, 0.42, 0.2, brown, scene);
  back.position = new Vector3(0, 1.54, -0.17);
  back.parent = group;

  // Two short locks framing the sides of the face (beside it, not over it), ending
  // around the jaw rather than at the shoulders.
  for (const dx of [-0.22, 0.22]) {
    const side = box("hairSide", 0.1, 0.32, 0.34, brown, scene);
    side.position = new Vector3(dx, 1.5, 0);
    side.parent = group;
  }
  return group;
}

/**
 * Rose's hair: very long straight black hair with a pointed black headdress — a
 * crown cap, two horn-like tufts framing the top, side bangs to the jaw, and a long
 * tail falling down the back well past the waist (in tapering segments). Rigid.
 */
function buildLongHair(scene: Scene): TransformNode {
  const group = new TransformNode("hairLong", scene);
  const black = mat("hairBlack", 0.1, 0.09, 0.13, scene);

  const cap = box("hairCap", 0.4, 0.22, 0.4, black, scene);
  cap.position.y = 1.78;
  cap.parent = group;

  // Two pointed tufts framing the top of the head, pointing up and out.
  coneSpike(scene, black, new Vector3(-0.16, 1.86, 0.02), -0.2, -0.5, 0.3, 0.13).parent = group;
  coneSpike(scene, black, new Vector3(0.16, 1.86, 0.02), -0.2, 0.5, 0.3, 0.13).parent = group;

  // Side bangs framing the face to the jaw.
  for (const dx of [-0.21, 0.21]) {
    const side = box("hairSide", 0.09, 0.4, 0.34, black, scene);
    side.position = new Vector3(dx, 1.48, 0);
    side.parent = group;
  }

  // Long straight tail down the back, past the waist, in tapering segments.
  const t1 = box("hairLong1", 0.34, 0.7, 0.16, black, scene);
  t1.position = new Vector3(0, 1.35, -0.18);
  t1.parent = group;
  const t2 = box("hairLong2", 0.3, 0.7, 0.13, black, scene);
  t2.position = new Vector3(0, 0.75, -0.2);
  t2.parent = group;
  const t3 = box("hairLong3", 0.24, 0.5, 0.1, black, scene);
  t3.position = new Vector3(0, 0.25, -0.22);
  t3.parent = group;
  return group;
}

/**
 * Miranda's hair: long flowing blonde — a crown cap, side locks framing the face down
 * to the chest, and a long tail down the back in two tapering segments. Rigid.
 */
function buildFlowHair(scene: Scene): TransformNode {
  const group = new TransformNode("hairFlow", scene);
  const blonde = mat("hairGoldLong", 0.85, 0.72, 0.4, scene);

  const cap = box("hairCap", 0.4, 0.22, 0.4, blonde, scene);
  cap.position.y = 1.78;
  cap.parent = group;

  for (const dx of [-0.21, 0.21]) {
    const side = box("hairSide", 0.1, 0.52, 0.34, blonde, scene);
    side.position = new Vector3(dx, 1.4, 0.02);
    side.parent = group;
  }

  const t1 = box("hairFlow1", 0.36, 0.7, 0.18, blonde, scene);
  t1.position = new Vector3(0, 1.34, -0.17);
  t1.parent = group;
  const t2 = box("hairFlow2", 0.3, 0.62, 0.14, blonde, scene);
  t2.position = new Vector3(0, 0.82, -0.2);
  t2.parent = group;
  return group;
}

/**
 * Albert's hair: ash-silver swept straight back — a high crown cap (above the eyes),
 * a few back-swept strands off the top, and a medium mass at the nape. Rigid; bobs
 * with the head.
 */
function buildSweptHair(scene: Scene): TransformNode {
  const group = new TransformNode("hairSwept", scene);
  const ash = mat("hairAsh", 0.78, 0.78, 0.74, scene);

  const cap = box("hairCap", 0.38, 0.2, 0.4, ash, scene);
  cap.position.y = 1.78;
  cap.parent = group;

  const nape = box("hairNape", 0.32, 0.24, 0.16, ash, scene);
  nape.position = new Vector3(0, 1.5, -0.17);
  nape.parent = group;

  // Strands swept up and back off the crown (negative tilt points the tips back).
  coneSpike(scene, ash, new Vector3(0, 1.84, -0.02), -0.5, 0, 0.26, 0.12).parent = group;
  coneSpike(scene, ash, new Vector3(-0.11, 1.82, -0.03), -0.5, -0.2, 0.24, 0.1).parent = group;
  coneSpike(scene, ash, new Vector3(0.11, 1.82, -0.03), -0.5, 0.2, 0.24, 0.1).parent = group;
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
function buildWeapon(kind: WeaponKind, accent: StandardMaterial, scene: Scene, variant?: WeaponVariant): TransformNode {
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
      if (variant === "spiked") {
        // Zieg's heavy broadsword: a wider, longer flat blade with a coloured centre
        // ridge, tipped with a cluster of steel spikes — a forward point plus two
        // barbs flaring out near the tip.
        part("blade", 0.13, 0.05, 1.0, 0.55, steel);
        part("ridge", 0.035, 0.08, 0.92, 0.55, accent); // coloured fuller, stands proud
        part("guard", 0.36, 0.09, 0.09, 0.06, accent);
        part("grip", 0.06, 0.06, 0.22, -0.12, wood);
        const tipZ = 1.05;
        coneSpike(scene, steel, new Vector3(0, 0, tipZ), Math.PI / 2, 0, 0.28, 0.1).parent = group;
        for (const side of [-1, 1]) {
          coneSpike(scene, steel, new Vector3(side * 0.06, 0, tipZ - 0.12), 0.4, side * 1.15, 0.24, 0.09).parent = group;
        }
      } else {
        part("blade", 0.07, 0.07, 0.9, 0.5, steel);
        part("guard", 0.3, 0.07, 0.07, 0.08, accent);
        part("grip", 0.06, 0.06, 0.2, -0.08, wood);
      }
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
      // A recurve bow: a curved limb (a tube bowing toward the target at the grip)
      // with a straight string drawn across the tips on the archer's side.
      const path: Vector3[] = [];
      const segments = 10;
      for (let i = 0; i <= segments; i++) {
        const y = -0.55 + (i / segments) * 1.1; // tip to tip
        const z = 0.16 * (1 - (y / 0.55) ** 2); // grip bows forward (+Z), tips at z≈0
        path.push(new Vector3(0, y, z));
      }
      const limb = MeshBuilder.CreateTube("bowLimb", { path, radius: 0.022, tessellation: 6 }, scene);
      limb.material = accent;
      limb.isPickable = false;
      limb.parent = group;
      // String down the belly side, just behind the tips.
      const string = MeshBuilder.CreateCylinder("bowString", { height: 1.1, diameter: 0.012, tessellation: 5 }, scene);
      string.material = steel;
      string.isPickable = false;
      string.position.z = -0.01;
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
