import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import type { WeaponKind, WeaponVariant, HairStyle, OutfitStyle } from "../data/bearers";

export interface HumanoidOptions {
  /** Primary body colour (RGB 0–1) — the bearer's archetype colour, used for the body unless overridden. */
  color: [number, number, number];
  /** Optional body tint override (when the costume should differ from the archetype colour). */
  bodyColor?: [number, number, number];
  /** Optional skin tone (RGB 0–1) for face and bare skin. Default a light human tone. */
  skinTone?: [number, number, number];
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
  /** Cape pivot (if any) — swayed by motion from the shoulders. */
  private cape?: TransformNode;
  private style: StrikeStyle;
  private phase = 0;
  private strikeT = 0;

  constructor(scene: Scene, opts: HumanoidOptions) {
    const [r, g, b] = opts.bodyColor ?? opts.color;
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
      opts.outfit === "valkyrie" ||
      opts.outfit === "brawler" ||
      opts.outfit === "gigantos" ||
      opts.outfit === "martialist" ||
      opts.outfit === "siren" ||
      opts.outfit === "enforcer";
    // Skin tone (face + bare skin) — defaults to a light human tone; shaded/highlighted
    // variants keep the original ratios so existing characters are unchanged.
    const [sr, sg, sb] = opts.skinTone ?? [0.94, 0.79, 0.67];
    const skinMain = mat("hSkin", sr, sg, sb, scene);
    const skinDark = mat("hSkinDk", sr * 0.89, sg * 0.86, sb * 0.84, scene);
    const skinLight = mat("hSkinHi", Math.min(1, sr * 1.02), Math.min(1, sg * 1.05), Math.min(1, sb * 1.07), scene);
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

    // A foot at the bottom of each leg, extended forward (+Z) so the figure has a real
    // foot shape (a sole/toe) under whatever boot an outfit adds — a neutral dark
    // "shoe" tone reads for bare and booted bearers alike. Swings with the leg.
    const shoe = mat("hShoe", 0.22, 0.19, 0.16, scene);
    for (const leg of [this.leftLeg, this.rightLeg]) {
      const foot = box("hFoot", 0.19, 0.11, 0.34, shoe, scene);
      foot.position = new Vector3(0, -0.73, 0.08);
      foot.parent = leg;
    }

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
    else if (opts.outfit === "darkknight") this.addDarkKnightOutfit(scene);
    else if (opts.outfit === "scholar") this.addScholarOutfit(scene);
    else if (opts.outfit === "priestess") this.addPriestessOutfit(scene);
    else if (opts.outfit === "brawler") this.addBrawlerOutfit(scene);
    else if (opts.outfit === "gigantos") this.addGigantosOutfit(scene);
    else if (opts.outfit === "martialist") this.addMartialistOutfit(scene, opts.color);
    else if (opts.outfit === "siren") this.addSirenOutfit(scene);
    else if (opts.outfit === "enforcer") this.addEnforcerOutfit(scene, opts.color);
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
    } else if (opts.hair === "banded") {
      buildBandedHair(scene).parent = this.body;
    } else if (opts.hair === "neat") {
      buildNeatHair(scene).parent = this.body;
    } else if (opts.hair === "wavy") {
      buildWavyHair(scene).parent = this.body;
    } else if (opts.hair === "wrap") {
      buildWrapHair(scene).parent = this.body;
    } else if (opts.hair === "topknot") {
      buildTopknotHair(scene).parent = this.body;
    } else if (opts.hair === "mane") {
      buildManeHair(scene).parent = this.body;
    } else if (opts.hair === "elder") {
      buildElderHair(scene).parent = this.body;
    } else if (opts.hair === "siren") {
      buildSirenHair(scene).parent = this.body;
    } else if (opts.hair === "firebrand") {
      buildFirebrandHair(scene).parent = this.body;
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
    const capeMat = mat("nbCape", 0.32, 0.46, 0.24, scene); // green cloak
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

    // Green cloak on a shoulder pivot so it can sway with motion: a collar wrapping
    // the shoulders, then a draped back panel that widens toward a flared hem.
    const cape = new TransformNode("nbCapePivot", scene);
    cape.position = new Vector3(0, 1.46, -0.05);
    cape.parent = this.body;
    this.cape = cape;
    const capeCollar = box("nbCapeCollar", 0.54, 0.16, 0.36, capeMat, scene);
    capeCollar.position = new Vector3(0, -0.06, 0.01);
    capeCollar.parent = cape;
    const capeTop = box("nbCapeTop", 0.5, 0.5, 0.05, capeMat, scene);
    capeTop.rotation.x = -0.08;
    capeTop.position = new Vector3(0, -0.24, -0.15);
    capeTop.parent = cape;
    const capeMid = box("nbCapeMid", 0.56, 0.5, 0.05, capeMat, scene);
    capeMid.rotation.x = -0.05;
    capeMid.position = new Vector3(0, -0.72, -0.19);
    capeMid.parent = cape;
    const capeHem = box("nbCapeHem", 0.64, 0.34, 0.05, capeMat, scene);
    capeHem.position = new Vector3(0, -1.08, -0.22);
    capeHem.parent = cape;

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

  /**
   * Greham's dark-knight outfit: dark-brown plate with ornate gold filigree, gold-rimmed
   * pauldrons, a dark belt with a round gold buckle over gold-hemmed green tassets, dark
   * gauntlets and gold-trimmed greaves/boots, and a swaying red cape clasped at his right
   * shoulder. A scar crosses his right eye. Built over the (dark-brown) bearer-coloured
   * body; his hair/bandana come from the "banded" style and he wields a spear.
   */
  private addDarkKnightOutfit(scene: Scene): void {
    const dark = mat("dkkDark", 0.26, 0.18, 0.12, scene); // dark brown plate
    const gold = mat("dkkGold", 0.8, 0.66, 0.3, scene);
    const red = mat("dkkRed", 0.6, 0.12, 0.12, scene);
    const green = mat("dkkGreen", 0.22, 0.4, 0.24, scene);

    // Dark high collar and chest plate with a gold filigree centre.
    const collar = box("dkkCollar", 0.3, 0.2, 0.27, dark, scene);
    collar.position.y = 1.42;
    collar.parent = this.body;
    const chest = box("dkkChest", 0.46, 0.48, 0.12, dark, scene);
    chest.position = new Vector3(0, 1.14, 0.13);
    chest.parent = this.body;
    // Ornate gold filigree across the chest: a central band, two angled side scrolls,
    // and a round emblem near the collar.
    const filiCenter = box("dkkFiliC", 0.08, 0.4, 0.04, gold, scene);
    filiCenter.position = new Vector3(0, 1.14, 0.2);
    filiCenter.parent = this.body;
    for (const sx of [-1, 1]) {
      const scroll = box("dkkFiliS", 0.06, 0.3, 0.04, gold, scene);
      scroll.position = new Vector3(sx * 0.13, 1.16, 0.2);
      scroll.rotation.z = sx * 0.28;
      scroll.parent = this.body;
    }
    const emblem = MeshBuilder.CreateCylinder("dkkEmblem", { height: 0.04, diameter: 0.16, tessellation: 10 }, scene);
    emblem.material = gold;
    emblem.isPickable = false;
    emblem.rotation.x = Math.PI / 2;
    emblem.position = new Vector3(0, 1.3, 0.21);
    emblem.parent = this.body;

    // Pointed pauldrons with a gold rim.
    for (const sx of [-1, 1]) {
      const pauldron = box("dkkPauldron", 0.27, 0.2, 0.4, dark, scene);
      pauldron.position = new Vector3(sx * 0.35, 1.46, 0);
      pauldron.parent = this.body;
      const rim = box("dkkPauldronRim", 0.29, 0.05, 0.42, gold, scene);
      rim.position = new Vector3(sx * 0.35, 1.36, 0);
      rim.parent = this.body;
    }

    // Dark belt with a prominent round gold buckle, over a flared green tasset skirt.
    const belt = box("dkkBelt", 0.48, 0.1, 0.32, dark, scene);
    belt.position.y = 0.86;
    belt.parent = this.body;
    const buckle = MeshBuilder.CreateCylinder("dkkBuckle", { height: 0.05, diameter: 0.17, tessellation: 10 }, scene);
    buckle.material = gold;
    buckle.isPickable = false;
    buckle.rotation.x = Math.PI / 2;
    buckle.position = new Vector3(0, 0.86, 0.18);
    buckle.parent = this.body;
    const tassets = MeshBuilder.CreateCylinder(
      "dkkTassets",
      { height: 0.34, diameterTop: 0.46, diameterBottom: 0.6, tessellation: 12 },
      scene,
    );
    tassets.material = green;
    tassets.isPickable = false;
    tassets.position.y = 0.7;
    tassets.parent = this.body;
    const tassetHem = MeshBuilder.CreateTorus("dkkTassetHem", { diameter: 0.6, thickness: 0.04, tessellation: 16 }, scene);
    tassetHem.material = gold;
    tassetHem.isPickable = false;
    tassetHem.position.y = 0.54;
    tassetHem.parent = this.body;

    // Swaying red cape, clasped at and draping from his right shoulder (offset to one
    // side rather than centred on the back). Driven in update().
    const clasp = box("dkkClasp", 0.1, 0.1, 0.12, gold, scene);
    clasp.position = new Vector3(0.32, 1.5, 0.02);
    clasp.parent = this.body;
    const cape = new TransformNode("dkkCapePivot", scene);
    cape.position = new Vector3(0.16, 1.5, -0.07);
    cape.parent = this.body;
    this.cape = cape;
    const capeTop = box("dkkCapeTop", 0.52, 0.5, 0.05, red, scene);
    capeTop.position = new Vector3(0, -0.24, -0.14);
    capeTop.rotation.x = -0.08;
    capeTop.parent = cape;
    const capeMid = box("dkkCapeMid", 0.58, 0.5, 0.05, red, scene);
    capeMid.position = new Vector3(0, -0.72, -0.18);
    capeMid.parent = cape;
    const capeHem = box("dkkCapeHem", 0.62, 0.3, 0.05, red, scene);
    capeHem.position = new Vector3(0, -1.04, -0.21);
    capeHem.parent = cape;

    // Dark gauntlets with a gold cuff (swing with the arms).
    for (const arm of [this.leftArm, this.rightArm]) {
      const gauntlet = box("dkkGauntlet", 0.2, 0.3, 0.2, dark, scene);
      gauntlet.position.y = -0.45;
      gauntlet.parent = arm;
      const cuff = box("dkkCuff", 0.22, 0.08, 0.22, gold, scene);
      cuff.position.y = -0.31;
      cuff.parent = arm;
    }

    // Dark greaves and boots with a gold knee guard (swing with the legs).
    for (const leg of [this.leftLeg, this.rightLeg]) {
      const greave = box("dkkGreave", 0.21, 0.4, 0.22, dark, scene);
      greave.position.y = -0.42;
      greave.parent = leg;
      const greaveTrim = box("dkkGreaveTrim", 0.22, 0.04, 0.23, gold, scene);
      greaveTrim.position.y = -0.24;
      greaveTrim.parent = leg;
      const boot = box("dkkBoot", 0.22, 0.3, 0.26, dark, scene);
      boot.position = new Vector3(0, -0.62, 0.02);
      boot.parent = leg;
      const knee = box("dkkKnee", 0.21, 0.1, 0.23, gold, scene);
      knee.position.y = -0.34;
      knee.parent = leg;
    }

    // Scar across his right eye (the +X eye, from the front).
    const scarMat = mat("dkkScar", 0.62, 0.3, 0.26, scene);
    const scar = box("dkkScar", 0.02, 0.18, 0.02, scarMat, scene);
    scar.position = new Vector3(0.08, 1.63, 0.18);
    scar.rotation.z = 0.22;
    scar.parent = this.body;
  }

  /**
   * Syuveil's scholar outfit: a long white tunic (the body colour carries the
   * tunic/sleeves) with black filigree on the collar, front and hem, a green waist
   * sash, dark-green breeches, and brown boots. Built over the (white) bearer-coloured
   * body; his glasses come from the "neat" hairstyle and he wields a spear.
   */
  private addScholarOutfit(scene: Scene): void {
    const white = mat("scWhite", 0.88, 0.89, 0.92, scene);
    const black = mat("scBlack", 0.1, 0.1, 0.13, scene);
    const green = mat("scGreen", 0.2, 0.46, 0.28, scene); // sash
    const pants = mat("scPants", 0.16, 0.3, 0.22, scene); // dark-green breeches
    const brown = mat("scBoot", 0.4, 0.28, 0.16, scene);

    // Black filigree high collar and a front placket down the tunic.
    const collar = box("scCollar", 0.42, 0.12, 0.31, black, scene);
    collar.position.y = 1.4;
    collar.parent = this.body;
    const placket = box("scPlacket", 0.05, 0.5, 0.02, black, scene);
    placket.position = new Vector3(0, 1.14, 0.16);
    placket.parent = this.body;
    for (const sx of [-1, 1]) {
      const scroll = box("scScroll", 0.16, 0.06, 0.02, black, scene);
      scroll.position = new Vector3(sx * 0.12, 1.3, 0.16);
      scroll.rotation.z = sx * 0.4;
      scroll.parent = this.body;
    }

    // Long white tunic skirt over the hips with a black filigree hem.
    const skirt = box("scSkirt", 0.46, 0.4, 0.33, white, scene);
    skirt.position.y = 0.66;
    skirt.parent = this.body;
    const hem = box("scHem", 0.47, 0.05, 0.34, black, scene);
    hem.position.y = 0.47;
    hem.parent = this.body;

    // Green waist sash with a knotted tail at the side.
    const sash = box("scSash", 0.48, 0.12, 0.33, green, scene);
    sash.position.y = 0.86;
    sash.parent = this.body;
    const tail = box("scSashTail", 0.1, 0.3, 0.06, green, scene);
    tail.position = new Vector3(0.22, 0.72, 0.12);
    tail.parent = this.body;

    // Dark-green breeches on the upper legs + brown boots (swing with the legs).
    for (const leg of [this.leftLeg, this.rightLeg]) {
      const breech = box("scBreech", 0.2, 0.46, 0.2, pants, scene);
      breech.position.y = -0.24;
      breech.parent = leg;
      const boot = box("scBoot", 0.22, 0.3, 0.26, brown, scene);
      boot.position = new Vector3(0, -0.62, 0.02);
      boot.parent = leg;
      const cuff = box("scBootCuff", 0.23, 0.07, 0.27, brown, scene);
      cuff.position.y = -0.48;
      cuff.parent = leg;
    }
  }

  /**
   * Shirley's mage robe (her extrapolated human form — the Light Dragoon), from her
   * portrait: an icy-blue robe with heavy gold trim studded with ruby-pink cabochon
   * gems, worn over a white high-necked blouse; a tall standing gold-edged collar
   * rising behind the neck with a navy back-cape; gold shoulder plates and wrist cuffs
   * each set with a pink gem; a gold waist clasp with a large oval pink gem; and a
   * floor-length flared gown with a gold hem. Built over the (cream) body; carries a bow.
   */
  private addPriestessOutfit(scene: Scene): void {
    const cloth = mat("prCloth", 0.72, 0.82, 0.9, scene); // icy blue robe
    const navy = mat("prNavy", 0.16, 0.24, 0.4, scene); // dark cape outer / robe shadow
    const white = mat("prWhite", 0.92, 0.93, 0.95, scene); // inner blouse
    const gold = mat("prGold", 0.83, 0.67, 0.3, scene);
    const gem = mat("prGem", 0.42, 0.08, 0.2, scene); // ruby-pink cabochon
    gem.emissiveColor = new Color3(0.5, 0.1, 0.25); // faint inner glow

    const pinkGem = (name: string, d: number, pos: Vector3, parent: TransformNode) => {
      const g = MeshBuilder.CreateSphere(name, { diameter: d, segments: 10 }, scene);
      g.material = gem;
      g.isPickable = false;
      g.scaling.z = 0.5; // flattened cabochon, sitting proud of its gold mount
      g.position = pos;
      g.parent = parent;
      return g;
    };

    // White high-necked blouse under the robe (shows at the open chest V and the throat).
    const blouse = box("prBlouse", 0.4, 0.52, 0.3, white, scene);
    blouse.position.y = 1.2;
    blouse.parent = this.body;
    const neck = box("prNeck", 0.22, 0.16, 0.24, white, scene);
    neck.position.y = 1.44;
    neck.parent = this.body;

    // Icy-blue robe front (open over the blouse) with gold trim converging into a
    // pointed V-bib down the chest, studded with ruby-pink gems along the trim.
    const robe = box("prRobe", 0.5, 0.54, 0.32, cloth, scene);
    robe.position.y = 1.18;
    robe.parent = this.body;
    for (const sx of [-1, 1]) {
      // Gold lapel running from the shoulder down to the sternum (the V of the bib).
      const lapel = box("prLapel", 0.06, 0.5, 0.02, gold, scene);
      lapel.position = new Vector3(sx * 0.12, 1.2, 0.17);
      lapel.rotation.z = sx * 0.28;
      lapel.parent = this.body;
      pinkGem("prLapelGem", 0.09, new Vector3(sx * 0.17, 1.34, 0.18), this.body);
    }
    // Pointed gold tip of the bib at the sternum, with a central gem.
    const bibTip = box("prBibTip", 0.1, 0.16, 0.03, gold, scene);
    bibTip.position = new Vector3(0, 1.0, 0.18);
    bibTip.rotation.z = Math.PI / 4;
    bibTip.parent = this.body;
    pinkGem("prBibGem", 0.09, new Vector3(0, 1.08, 0.18), this.body);

    // Tall standing collar rising behind the neck: two icy-blue panels flaring up-and-out
    // with a gold leading edge, plus a navy back-cape draping from the shoulders (sways).
    for (const sx of [-1, 1]) {
      const wing = box("prCollar", 0.12, 0.36, 0.06, cloth, scene);
      wing.position = new Vector3(sx * 0.17, 1.66, -0.12);
      wing.rotation.z = sx * 0.3;
      wing.rotation.x = -0.35; // lean back behind the head
      wing.parent = this.body;
      const edge = box("prCollarEdge", 0.03, 0.36, 0.07, gold, scene);
      edge.position = new Vector3(sx * 0.23, 1.66, -0.12);
      edge.rotation.z = sx * 0.3;
      edge.rotation.x = -0.35;
      edge.parent = this.body;
    }
    const cape = new TransformNode("prCapePivot", scene);
    cape.position = new Vector3(0, 1.46, -0.14);
    cape.parent = this.body;
    this.cape = cape;
    const capeTop = box("prCapeTop", 0.5, 0.5, 0.05, navy, scene);
    capeTop.position = new Vector3(0, -0.24, -0.02);
    capeTop.rotation.x = -0.06;
    capeTop.parent = cape;
    const capeHem = box("prCapeHem", 0.6, 0.6, 0.05, navy, scene);
    capeHem.position = new Vector3(0, -0.74, -0.06);
    capeHem.parent = cape;

    // Gold brow circlet with a pink gem.
    const circlet = MeshBuilder.CreateTorus("prCirclet", { diameter: 0.37, thickness: 0.022, tessellation: 18 }, scene);
    circlet.material = gold;
    circlet.isPickable = false;
    circlet.position.y = 1.69; // around the brow
    circlet.parent = this.body;
    pinkGem("prBrowGem", 0.06, new Vector3(0, 1.69, 0.19), this.body);

    // Gold shoulder plates each set with a pink gem.
    for (const sx of [-1, 1]) {
      const plate = box("prShoulder", 0.22, 0.12, 0.34, gold, scene);
      plate.position = new Vector3(sx * 0.3, 1.44, 0);
      plate.parent = this.body;
      pinkGem("prShoulderGem", 0.11, new Vector3(sx * 0.3, 1.46, 0.16), this.body);
    }

    // Gold waist clasp with a large oval pink gem at the centre.
    const waist = box("prWaist", 0.48, 0.1, 0.34, gold, scene);
    waist.position.y = 0.9;
    waist.parent = this.body;
    const clasp = MeshBuilder.CreateSphere("prClasp", { diameter: 0.2, segments: 12 }, scene);
    clasp.material = gem;
    clasp.isPickable = false;
    clasp.scaling = new Vector3(0.8, 1.15, 0.45); // tall oval cabochon
    clasp.position = new Vector3(0, 0.9, 0.18);
    clasp.parent = this.body;

    // Floor-length flared gown with a gold hem.
    const gown = MeshBuilder.CreateCylinder(
      "prGown",
      { height: 1.05, diameterTop: 0.44, diameterBottom: 0.96, tessellation: 16 },
      scene,
    );
    gown.material = cloth;
    gown.isPickable = false;
    gown.position.y = 0.52;
    gown.parent = this.body;
    const hem = MeshBuilder.CreateTorus("prGownHem", { diameter: 0.96, thickness: 0.04, tessellation: 20 }, scene);
    hem.material = gold;
    hem.isPickable = false;
    hem.position.y = 0.02;
    hem.parent = this.body;

    // Long bell sleeves (flaring at the wrist) with a gold cuff + a pink gem (swing with arms).
    for (const arm of [this.leftArm, this.rightArm]) {
      const sleeve = box("prSleeve", 0.21, 0.5, 0.21, cloth, scene);
      sleeve.position.y = -0.26;
      sleeve.parent = arm;
      const bell = box("prBell", 0.29, 0.2, 0.29, cloth, scene);
      bell.position.y = -0.54;
      bell.parent = arm;
      const cuff = box("prCuff", 0.3, 0.07, 0.3, gold, scene);
      cuff.position.y = -0.63;
      cuff.parent = arm;
      pinkGem("prCuffGem", 0.08, new Vector3(0, -0.63, 0.16), arm);
    }
  }

  /**
   * Belzac's brawler outfit (his extrapolated human form — the giant Earth Dragoon):
   * a sleeveless brown leather vest with crossed straps over a bare muscular torso,
   * leather pauldrons, a thick belt with a gold buckle, brown trousers and boots, and
   * leather forearm bracers with gold bands. Built over the skin-toned body; he wields
   * an axe and is scaled up to read as a giant.
   */
  private addBrawlerOutfit(scene: Scene): void {
    const leather = mat("bzLeather", 0.42, 0.3, 0.18, scene);
    const vestMat = mat("bzVestMat", 0.3, 0.3, 0.33, scene); // dark grey upper garment
    const pants = mat("bzPants", 0.3, 0.26, 0.22, scene);
    const gold = mat("bzGold", 0.78, 0.62, 0.28, scene);
    const boot = mat("bzBoot", 0.34, 0.24, 0.14, scene);

    // Sleeveless dark-grey vest (arms left bare) with a gold clasp and crossed straps.
    const vest = box("bzVest", 0.48, 0.5, 0.32, vestMat, scene);
    vest.position.y = 1.18;
    vest.parent = this.body;
    const clasp = box("bzClasp", 0.1, 0.44, 0.04, gold, scene);
    clasp.position = new Vector3(0, 1.16, 0.17);
    clasp.parent = this.body;
    for (const sx of [-1, 1]) {
      const strap = box("bzStrap", 0.05, 0.56, 0.02, leather, scene);
      strap.position = new Vector3(0, 1.18, 0.18);
      strap.rotation.z = sx * 0.5;
      strap.parent = this.body;
    }

    // Leather pauldrons (broad shoulders).
    for (const sx of [-1, 1]) {
      const pauldron = box("bzPauldron", 0.22, 0.16, 0.36, leather, scene);
      pauldron.position = new Vector3(sx * 0.34, 1.45, 0);
      pauldron.parent = this.body;
    }

    // Thick belt with a gold buckle.
    const belt = box("bzBelt", 0.5, 0.14, 0.34, leather, scene);
    belt.position.y = 0.84;
    belt.parent = this.body;
    const buckle = box("bzBuckle", 0.14, 0.12, 0.04, gold, scene);
    buckle.position = new Vector3(0, 0.84, 0.18);
    buckle.parent = this.body;

    // Brown trousers + boots (swing with the legs).
    for (const leg of [this.leftLeg, this.rightLeg]) {
      const pant = box("bzPant", 0.21, 0.62, 0.21, pants, scene);
      pant.position.y = -0.3;
      pant.parent = leg;
      const bootMesh = box("bzBootM", 0.23, 0.3, 0.27, boot, scene);
      bootMesh.position = new Vector3(0, -0.62, 0.02);
      bootMesh.parent = leg;
    }

    // Leather forearm bracers with a gold band (upper arms bare; swing with the arms).
    for (const arm of [this.leftArm, this.rightArm]) {
      const bracer = box("bzBracer", 0.21, 0.24, 0.21, leather, scene);
      bracer.position.y = -0.46;
      bracer.parent = arm;
      const band = box("bzBracerBand", 0.22, 0.05, 0.22, gold, scene);
      band.position.y = -0.55;
      band.parent = arm;
    }
  }

  /**
   * Kongol's gigantos outfit: tribal armour over a bare tan torso — large tan/gold
   * pauldrons, crossed chest straps with a gold emblem, a thick belt and a fur kilt,
   * big pale armoured boots, and tan/gold forearm bracers. Built over the skin-toned
   * (tan) body; he wields an axe and is scaled up large.
   */
  private addGigantosOutfit(scene: Scene): void {
    const gold = mat("kgGold", 0.82, 0.66, 0.3, scene);
    const fur = mat("kgFur", 0.5, 0.42, 0.28, scene);
    const wrapCloth = mat("kgWrap", 0.78, 0.7, 0.5, scene);
    const dark = mat("kgDark", 0.34, 0.26, 0.18, scene); // dark leather straps
    const pale = mat("kgBoot", 0.82, 0.8, 0.72, scene);
    const silver = mat("kgSilver", 0.72, 0.74, 0.78, scene);

    // Rounded golden pauldrons — flattened domes seated on the shoulders (not floating
    // balls out to the sides).
    for (const sx of [-1, 1]) {
      const pauldron = MeshBuilder.CreateSphere("kgPauldron", { diameter: 0.4, segments: 10 }, scene);
      pauldron.material = gold;
      pauldron.isPickable = false;
      pauldron.scaling = new Vector3(1.05, 0.58, 1.0);
      pauldron.position = new Vector3(sx * 0.32, 1.45, 0);
      pauldron.parent = this.body;
    }

    // Crossed leather straps over the bare torso, front and back, with a silver
    // medallion at the front cross.
    for (const sx of [-1, 1]) {
      const strap = box("kgStrap", 0.07, 0.62, 0.02, dark, scene);
      strap.position = new Vector3(0, 1.16, 0.18);
      strap.rotation.z = sx * 0.5;
      strap.parent = this.body;
      const back = box("kgStrapBack", 0.07, 0.62, 0.02, dark, scene);
      back.position = new Vector3(0, 1.16, -0.18);
      back.rotation.z = sx * 0.5;
      back.parent = this.body;
      // a shoulder link joining front and back over the top of each shoulder
      const link = box("kgStrapLink", 0.07, 0.02, 0.4, dark, scene);
      link.position = new Vector3(sx * 0.16, 1.42, 0);
      link.parent = this.body;
    }
    const emblem = MeshBuilder.CreateCylinder("kgEmblem", { height: 0.04, diameter: 0.16, tessellation: 12 }, scene);
    emblem.material = silver;
    emblem.isPickable = false;
    emblem.rotation.x = Math.PI / 2;
    emblem.position = new Vector3(0, 1.14, 0.19);
    emblem.parent = this.body;

    // Thick belt + a flared fur kilt over the hips.
    const belt = box("kgBelt", 0.52, 0.14, 0.36, dark, scene);
    belt.position.y = 0.84;
    belt.parent = this.body;
    const kilt = MeshBuilder.CreateCylinder(
      "kgKilt",
      { height: 0.28, diameterTop: 0.5, diameterBottom: 0.62, tessellation: 12 },
      scene,
    );
    kilt.material = fur;
    kilt.isPickable = false;
    kilt.position.y = 0.72; // short, sitting at the hips (not draping to the legs)
    kilt.parent = this.body;
    // Short hanging fur/leather strips just below the kilt.
    for (const a of [-0.7, -0.35, 0, 0.35, 0.7]) {
      const strip = new TransformNode("kgStripPivot", scene);
      strip.position = new Vector3(0, 0.66, 0);
      strip.rotation.y = a;
      strip.parent = this.body;
      const s = box("kgStrip", 0.12, 0.22, 0.04, a === 0 ? dark : fur, scene);
      s.position = new Vector3(0, -0.1, 0.31);
      s.parent = strip;
    }

    // Big pale armoured boots (knee-down, leaving the thigh bare) with a dark cuff,
    // and a pale foot cap so the toe matches the iron boots (over the neutral foot).
    for (const leg of [this.leftLeg, this.rightLeg]) {
      const boot = box("kgBootM", 0.27, 0.4, 0.31, pale, scene);
      boot.position.y = -0.56;
      boot.parent = leg;
      const cuff = box("kgBootCuff", 0.29, 0.08, 0.33, dark, scene);
      cuff.position.y = -0.37;
      cuff.parent = leg;
      const footCap = box("kgFoot", 0.23, 0.14, 0.38, pale, scene);
      footCap.position = new Vector3(0, -0.73, 0.09);
      footCap.parent = leg;
    }

    // Cloth bandage wraps down the forearms, bound by a couple of darker lines.
    for (const arm of [this.leftArm, this.rightArm]) {
      const wrap = box("kgWrapM", 0.23, 0.42, 0.23, wrapCloth, scene);
      wrap.position.y = -0.44;
      wrap.parent = arm;
      for (const y of [-0.32, -0.46, -0.6]) {
        const bind = box("kgBind", 0.24, 0.03, 0.24, dark, scene);
        bind.position.y = y;
        bind.parent = arm;
      }
    }

    // Red tribal war paint: a vertical streak over each eye and a band across the brow.
    const paint = mat("kgPaint", 0.72, 0.12, 0.1, scene);
    for (const sx of [-1, 1]) {
      const streak = box("kgPaintEye", 0.05, 0.22, 0.02, paint, scene);
      streak.position = new Vector3(sx * 0.09, 1.61, 0.18);
      streak.parent = this.body;
    }
    const brow = box("kgPaintBrow", 0.22, 0.03, 0.02, paint, scene);
    brow.position = new Vector3(0, 1.71, 0.18);
    brow.parent = this.body;
  }

  /**
   * Haschel's martial-artist outfit (his human form — the Violet/Thunder Dragoon), from
   * the canon PS1 art: a short sleeveless purple vest with tone-on-tone violet scrollwork
   * (cropped high, leaving the muscular midriff BARE), bare arms, a thin reddish-brown
   * belt low on the hips, baggy purple trousers with pale violet swirls at the thighs,
   * steel-grey ankle boots with a red band, and dark fingerless fist-gloves with red
   * wrist wraps. Built over the skin-toned body; he fights bare-fisted.
   */
  private addMartialistOutfit(scene: Scene, color: [number, number, number]): void {
    const [r, g, b] = color;
    const purple = mat("mtPurple", r, g, b, scene); // his violet vest
    const purpleDk = mat("mtPurpleDk", r * 0.55, g * 0.5, b * 0.6, scene); // baggy trousers (darker)
    const swirl = mat("mtSwirl", Math.min(1, r * 1.25), Math.min(1, g * 1.3), Math.min(1, b * 1.15), scene); // pale violet scrollwork (tone-on-tone)
    const steel = mat("mtSteel", 0.6, 0.62, 0.68, scene); // grey armoured boots
    const dark = mat("mtDark", 0.15, 0.13, 0.17, scene); // fist-gloves
    const belt = mat("mtBelt", 0.5, 0.24, 0.2, scene); // reddish-brown belt
    const red = mat("mtRed", 0.66, 0.15, 0.15, scene); // wrist wraps / boot & belt trim

    // Purple vest covering the whole torso down to the waist (no bare midriff — it
    // overlaps the trunks below), with a darker V-neck opening and pale violet trim.
    const vest = box("mtVest", 0.5, 0.56, 0.33, purple, scene);
    vest.position.y = 1.18;
    vest.parent = this.body;
    const vNeck = box("mtVNeck", 0.13, 0.22, 0.02, purpleDk, scene);
    vNeck.position = new Vector3(0, 1.34, 0.17);
    vNeck.parent = this.body;
    // Pale violet scrollwork curling on each side of the vest front + a lower rim.
    for (const sx of [-1, 1]) {
      const scroll = box("mtScroll", 0.05, 0.28, 0.02, swirl, scene);
      scroll.position = new Vector3(sx * 0.16, 1.26, 0.17);
      scroll.rotation.z = sx * 0.4;
      scroll.parent = this.body;
    }
    const rim = box("mtVestRim", 0.51, 0.04, 0.34, swirl, scene);
    rim.position.y = 0.94;
    rim.parent = this.body;

    // Purple trunks over the pelvis/hips so the waist reads fully clothed (the bare skin
    // of the revealing body would otherwise show through at the hips and crotch); shares
    // the trouser colour so it flows straight into the legs. Overlaps the vest above.
    const trunks = box("mtTrunks", 0.47, 0.3, 0.33, purpleDk, scene);
    trunks.position.y = 0.8;
    trunks.parent = this.body;

    // Rolled purple collar over the shoulders (a little heftier on the left, as in the
    // art), suggesting the vest's raised, ornate shoulder line — no metal, all cloth.
    const collar = box("mtCollar", 0.56, 0.13, 0.36, purple, scene);
    collar.position.y = 1.44;
    collar.parent = this.body;
    const shoulderRoll = MeshBuilder.CreateSphere("mtShoulder", { diameter: 0.26, segments: 8 }, scene);
    shoulderRoll.material = purple;
    shoulderRoll.isPickable = false;
    shoulderRoll.scaling = new Vector3(1.1, 0.7, 1.1);
    shoulderRoll.position = new Vector3(-0.3, 1.46, 0);
    shoulderRoll.parent = this.body;

    // Thin reddish-brown belt sitting low on the hips (no big sash), with a small buckle;
    // a touch deeper than the trunks so it reads proud (no coplanar z-fighting).
    const beltMesh = box("mtBeltMesh", 0.49, 0.09, 0.35, belt, scene);
    beltMesh.position.y = 0.9;
    beltMesh.parent = this.body;
    const buckle = box("mtBuckle", 0.1, 0.08, 0.03, steel, scene);
    buckle.position = new Vector3(0, 0.86, 0.17);
    buckle.parent = this.body;

    // Baggy purple trousers down the legs, with a pale violet swirl at the outer thigh.
    for (const leg of [this.leftLeg, this.rightLeg]) {
      const pant = box("mtPant", 0.24, 0.62, 0.24, purpleDk, scene);
      pant.position.y = -0.3;
      pant.parent = leg;
      const thighSwirl = box("mtThighSwirl", 0.03, 0.2, 0.1, swirl, scene);
      thighSwirl.position = new Vector3(0.12, -0.16, 0.06);
      thighSwirl.rotation.z = 0.4;
      thighSwirl.parent = leg;
      // Steel-grey ankle boot with a red band + a grey toe cap (over the neutral foot).
      const boot = box("mtBoot", 0.23, 0.24, 0.25, steel, scene);
      boot.position.y = -0.62;
      boot.parent = leg;
      const bootBand = box("mtBootBand", 0.24, 0.05, 0.26, red, scene);
      bootBand.position.y = -0.52;
      bootBand.parent = leg;
      const toe = box("mtToe", 0.2, 0.11, 0.16, steel, scene);
      toe.position = new Vector3(0, -0.73, 0.18);
      toe.parent = leg;
    }

    // Dark fingerless fist-gloves with a red wrist wrap (upper arms bare; swing with arms).
    for (const arm of [this.leftArm, this.rightArm]) {
      const glove = box("mtGlove", 0.22, 0.24, 0.22, dark, scene);
      glove.position.y = -0.52;
      glove.parent = arm;
      const wrap = box("mtWrap", 0.23, 0.08, 0.23, red, scene);
      wrap.position.y = -0.38;
      wrap.parent = arm;
    }
  }

  /**
   * Damia's siren outfit (her human form — the Blue-Sea/Water Dragoon), from her portrait:
   * a sleeveless blue-grey gown with a high collar and silver flame-like filigree branching
   * up the chest, deep-blue dragon-scale pauldrons, silver upper-arm bands set with a blue
   * gem, and a floor-length flared gown with a silver hem. Built over the blue-skinned body
   * (bare arms read as her scaled skin); she wields a hammer.
   */
  private addSirenOutfit(scene: Scene): void {
    const dress = mat("snDress", 0.42, 0.52, 0.62, scene); // muted blue-grey gown
    const scale = mat("snScale", 0.13, 0.19, 0.42, scene); // deep dragon-scale blue
    const silver = mat("snSilver", 0.78, 0.8, 0.86, scene);
    const gold = mat("snGold", 0.83, 0.67, 0.3, scene);
    const gem = mat("snGem", 0.2, 0.42, 0.82, scene); // sea-blue gem
    gem.emissiveColor = new Color3(0.1, 0.22, 0.5);

    // High-collared sleeveless bodice.
    const bodice = box("snBodice", 0.46, 0.56, 0.31, dress, scene);
    bodice.position.y = 1.16;
    bodice.parent = this.body;
    const collar = box("snCollar", 0.26, 0.16, 0.28, dress, scene);
    collar.position.y = 1.46;
    collar.parent = this.body;

    // Silver flame filigree branching up the chest from a central stem: a vertical spine
    // and, each side, two upswept prongs (long low, short high) — the portrait's tribal flame.
    const stem = box("snStem", 0.05, 0.5, 0.02, silver, scene);
    stem.position = new Vector3(0, 1.14, 0.17);
    stem.parent = this.body;
    for (const sx of [-1, 1]) {
      const prongLo = box("snProngLo", 0.04, 0.26, 0.02, silver, scene);
      prongLo.position = new Vector3(sx * 0.1, 1.1, 0.17);
      prongLo.rotation.z = sx * 0.7;
      prongLo.parent = this.body;
      const prongHi = box("snProngHi", 0.035, 0.18, 0.02, silver, scene);
      prongHi.position = new Vector3(sx * 0.11, 1.28, 0.17);
      prongHi.rotation.z = sx * 0.5;
      prongHi.parent = this.body;
    }

    // Deep-blue scaled pauldrons capping the shoulders (flattened domes).
    for (const sx of [-1, 1]) {
      const pauldron = MeshBuilder.CreateSphere("snPauldron", { diameter: 0.32, segments: 8 }, scene);
      pauldron.material = scale;
      pauldron.isPickable = false;
      pauldron.scaling = new Vector3(1.1, 0.7, 1.0);
      pauldron.position = new Vector3(sx * 0.32, 1.44, 0);
      pauldron.parent = this.body;
    }

    // Silver upper-arm bands set with a blue gem (swing with the arms).
    for (const arm of [this.leftArm, this.rightArm]) {
      const band = box("snArmband", 0.2, 0.1, 0.2, silver, scene);
      band.position.y = -0.28;
      band.parent = arm;
      const armGem = MeshBuilder.CreateSphere("snArmGem", { diameter: 0.09, segments: 8 }, scene);
      armGem.material = gem;
      armGem.isPickable = false;
      armGem.scaling.z = 0.5;
      armGem.position = new Vector3(0, -0.28, 0.11);
      armGem.parent = arm;
    }

    // Floor-length flared gown with a silver hem.
    const gown = MeshBuilder.CreateCylinder(
      "snGown",
      { height: 1.05, diameterTop: 0.44, diameterBottom: 0.92, tessellation: 16 },
      scene,
    );
    gown.material = dress;
    gown.isPickable = false;
    gown.position.y = 0.52;
    gown.parent = this.body;
    const hem = MeshBuilder.CreateTorus("snGownHem", { diameter: 0.92, thickness: 0.04, tessellation: 20 }, scene);
    hem.material = silver;
    hem.isPickable = false;
    hem.position.y = 0.02;
    hem.parent = this.body;
    // A slim gold waist band closing the bodice over the gown.
    const waist = box("snWaist", 0.47, 0.07, 0.33, gold, scene);
    waist.position.y = 0.88;
    waist.parent = this.body;
  }

  /**
   * Kanzas's enforcer outfit (his human form — the Violet/Thunder Dragoon), from his portrait:
   * a sleeveless purple vest with a high silver-edged collar and two studded strap clasps across
   * the chest, over a black leather waist cincher laced up the front; a studded leather bicep
   * band and wrapped forearms on the bare muscular arms; dark trousers and boots. Built over the
   * skin-toned body; he fights bare-fisted.
   */
  private addEnforcerOutfit(scene: Scene, color: [number, number, number]): void {
    const [r, g, b] = color;
    const purple = mat("enPurple", r, g, b, scene); // his violet vest
    const black = mat("enBlack", 0.13, 0.12, 0.16, scene); // leather cincher / collar inner / boots
    const silver = mat("enSilver", 0.74, 0.77, 0.83, scene); // studs / collar edge / lacing
    const wrap = mat("enWrap", 0.68, 0.64, 0.56, scene); // forearm bandages
    const pants = mat("enPants", 0.22, 0.19, 0.26, scene); // dark trousers

    // High collar: black inner with a silver top edge, standing at the neck.
    const collar = box("enCollar", 0.3, 0.18, 0.28, black, scene);
    collar.position.y = 1.46;
    collar.parent = this.body;
    const collarEdge = box("enCollarEdge", 0.31, 0.04, 0.29, silver, scene);
    collarEdge.position.y = 1.55;
    collarEdge.parent = this.body;

    // Sleeveless purple vest covering the chest down to the cincher (bare arms/shoulders).
    const vest = box("enVest", 0.46, 0.5, 0.31, purple, scene);
    vest.position.y = 1.22;
    vest.parent = this.body;
    // Two horizontal strap clasps across the upper chest, each with a pair of silver studs.
    for (const y of [1.34, 1.2]) {
      const strap = box("enStrap", 0.3, 0.07, 0.03, purple, scene);
      strap.position = new Vector3(0, y, 0.17);
      strap.parent = this.body;
      for (const dx of [-0.1, 0.1]) {
        const stud = box("enStud", 0.04, 0.04, 0.03, silver, scene);
        stud.position = new Vector3(dx, y, 0.19);
        stud.parent = this.body;
      }
    }

    // Black leather waist cincher laced up the front (X-crossed silver laces).
    const cincher = box("enCincher", 0.44, 0.26, 0.32, black, scene);
    cincher.position.y = 0.92;
    cincher.parent = this.body;
    for (const sx of [-1, 1]) {
      const lace = box("enLace", 0.02, 0.26, 0.02, silver, scene);
      lace.position = new Vector3(0, 0.92, 0.17);
      lace.rotation.z = sx * 0.5;
      lace.parent = this.body;
    }

    // Studded leather bicep band + wrapped forearm on each (bare upper arm; swing with arms).
    for (const arm of [this.leftArm, this.rightArm]) {
      const band = box("enBand", 0.2, 0.09, 0.2, black, scene);
      band.position.y = -0.2;
      band.parent = arm;
      const stud = box("enBandStud", 0.04, 0.04, 0.03, silver, scene);
      stud.position = new Vector3(0, -0.2, 0.11);
      stud.parent = arm;
      const forearm = box("enWrapArm", 0.2, 0.24, 0.2, wrap, scene);
      forearm.position.y = -0.5;
      forearm.parent = arm;
      for (const y of [-0.42, -0.5, -0.58]) {
        const bind = box("enBind", 0.21, 0.02, 0.21, black, scene);
        bind.position.y = y;
        bind.parent = arm;
      }
    }

    // Dark trousers + boots (swing with the legs).
    for (const leg of [this.leftLeg, this.rightLeg]) {
      const pant = box("enPant", 0.22, 0.6, 0.22, pants, scene);
      pant.position.y = -0.3;
      pant.parent = leg;
      const boot = box("enBoot", 0.23, 0.28, 0.27, black, scene);
      boot.position = new Vector3(0, -0.62, 0.02);
      boot.parent = leg;
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

    // The cape lifts and sways from the shoulders — trailing back while moving,
    // a faint drift at rest. Phase-lagged so it follows the body.
    if (this.cape) {
      const amp = moving ? 0.16 : 0.035;
      const bias = moving ? 0.2 : 0.02;
      this.cape.rotation.x = bias + Math.sin(this.phase - 0.4) * amp;
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

  // Long straight tail down the back, ending around the lower back, in tapering segments.
  const t1 = box("hairLong1", 0.34, 0.6, 0.16, black, scene);
  t1.position = new Vector3(0, 1.4, -0.18);
  t1.parent = group;
  const t2 = box("hairLong2", 0.28, 0.55, 0.12, black, scene);
  t2.position = new Vector3(0, 0.85, -0.2);
  t2.parent = group;
  return group;
}

/**
 * Kongol's hair: bald head (the tan scalp shows) with just a small dark mohawk — a
 * narrow ridge down the centreline topped by a few short spikes. Rigid.
 */
function buildTopknotHair(scene: Scene): TransformNode {
  const group = new TransformNode("hairTopknot", scene);
  const dark = mat("hairKongol", 0.16, 0.13, 0.12, scene);

  const ridge = box("mohawkRidge", 0.09, 0.1, 0.34, dark, scene);
  ridge.position = new Vector3(0, 1.8, -0.02);
  ridge.parent = group;
  for (const z of [0.11, 0, -0.11]) {
    coneSpike(scene, dark, new Vector3(0, 1.83, z), 0, 0, 0.16, 0.09).parent = group;
  }
  return group;
}

/**
 * Belzac's head: bald under a yellow bandana worn do-rag style — a cloth cap over the
 * crown, a band across the brow, and a knot with two tails at the back. Rigid.
 */
function buildWrapHair(scene: Scene): TransformNode {
  const group = new TransformNode("hairWrap", scene);
  const yellow = mat("bandanaYellow", 0.85, 0.72, 0.2, scene);

  const cap = box("wrapCap", 0.37, 0.2, 0.4, yellow, scene);
  cap.position.y = 1.76;
  cap.parent = group;
  const band = box("wrapBand", 0.38, 0.06, 0.41, yellow, scene);
  band.position.y = 1.66;
  band.parent = group;
  const knot = box("wrapKnot", 0.1, 0.1, 0.1, yellow, scene);
  knot.position = new Vector3(0, 1.66, -0.2);
  knot.parent = group;
  for (const dx of [-0.05, 0.05]) {
    const tail = box("wrapTail", 0.05, 0.3, 0.04, yellow, scene);
    tail.position = new Vector3(dx, 1.5, -0.22);
    tail.rotation.x = -0.2;
    tail.parent = group;
  }
  return group;
}

/**
 * Shirley's hair: long auburn/red — a crown cap, locks framing the face to the chest,
 * and a long tail down the back in two tapering segments. Rigid.
 */
function buildWavyHair(scene: Scene): TransformNode {
  const group = new TransformNode("hairWavy", scene);
  const auburn = mat("hairAuburnShirley", 0.62, 0.16, 0.12, scene); // deep crimson-red (portrait)

  const cap = box("hairCap", 0.4, 0.22, 0.4, auburn, scene);
  cap.position.y = 1.78;
  cap.parent = group;

  for (const dx of [-0.21, 0.21]) {
    const side = box("hairSide", 0.1, 0.46, 0.34, auburn, scene);
    side.position = new Vector3(dx, 1.43, 0.02);
    side.parent = group;
  }

  const t1 = box("hairWavy1", 0.36, 0.6, 0.18, auburn, scene);
  t1.position = new Vector3(0, 1.38, -0.17);
  t1.parent = group;
  const t2 = box("hairWavy2", 0.3, 0.5, 0.13, auburn, scene);
  t2.position = new Vector3(0, 0.9, -0.2);
  t2.parent = group;

  // A lock falling forward over the (left) shoulder, across the front.
  const lock = box("hairWavyLock", 0.11, 0.5, 0.1, auburn, scene);
  lock.position = new Vector3(0.18, 1.28, 0.13);
  lock.parent = group;
  return group;
}

/**
 * Syuveil's hair: neat short brown, side-parted, with round wire glasses over the
 * eyes (two ring frames + a bridge). A crown cap, soft fringe, and side framing. Rigid.
 */
function buildNeatHair(scene: Scene): TransformNode {
  const group = new TransformNode("hairNeat", scene);
  const brown = mat("hairNeatBrown", 0.34, 0.24, 0.15, scene);
  const frame = mat("glassFrame", 0.24, 0.24, 0.27, scene);

  const cap = box("hairCap", 0.37, 0.16, 0.39, brown, scene);
  cap.position.y = 1.75;
  cap.parent = group;
  const fringe = box("hairFringe", 0.37, 0.07, 0.08, brown, scene);
  fringe.position = new Vector3(0.02, 1.71, 0.16);
  fringe.parent = group;
  for (const dx of [-0.19, 0.19]) {
    const side = box("hairSide", 0.06, 0.16, 0.34, brown, scene);
    side.position = new Vector3(dx, 1.63, -0.02);
    side.parent = group;
  }

  // Round wire glasses over the eyes.
  for (const dx of [-0.08, 0.08]) {
    const lens = MeshBuilder.CreateTorus("glassLens", { diameter: 0.11, thickness: 0.016, tessellation: 12 }, scene);
    lens.material = frame;
    lens.isPickable = false;
    lens.rotation.x = Math.PI / 2; // ring faces forward (+Z)
    lens.position = new Vector3(dx, 1.63, 0.18);
    lens.parent = group;
  }
  const bridge = box("glassBridge", 0.06, 0.015, 0.015, frame, scene);
  bridge.position = new Vector3(0, 1.63, 0.18);
  bridge.parent = group;
  return group;
}

/**
 * Greham's hair: dark brown, with a red bandana across the brow (a knot and short
 * tails at the back). A crown cap, side framing, and a short nape. Rigid.
 */
function buildBandedHair(scene: Scene): TransformNode {
  const group = new TransformNode("hairBanded", scene);
  const hair = mat("hairDarkBrown", 0.26, 0.19, 0.13, scene);
  const red = mat("bandanaGreham", 0.62, 0.12, 0.12, scene);

  const cap = box("hairCap", 0.39, 0.24, 0.41, hair, scene);
  cap.position.y = 1.76;
  cap.parent = group;
  const nape = box("hairNape", 0.34, 0.22, 0.18, hair, scene);
  nape.position = new Vector3(0, 1.55, -0.16);
  nape.parent = group;
  for (const dx of [-0.2, 0.2]) {
    const side = box("hairSide", 0.08, 0.26, 0.38, hair, scene);
    side.position = new Vector3(dx, 1.6, -0.02);
    side.parent = group;
  }

  // Red bandana across the forehead with a knot and short tails at the back.
  const band = MeshBuilder.CreateTorus("bandana", { diameter: 0.4, thickness: 0.07, tessellation: 10 }, scene);
  band.material = red;
  band.isPickable = false;
  band.position.y = 1.67;
  band.parent = group;
  const knot = box("bandanaKnot", 0.1, 0.1, 0.1, red, scene);
  knot.position = new Vector3(0, 1.66, -0.2);
  knot.parent = group;
  for (const dx of [-0.05, 0.05]) {
    const tail = box("bandanaTail", 0.05, 0.26, 0.04, red, scene);
    tail.position = new Vector3(dx, 1.5, -0.22);
    tail.rotation.x = -0.2;
    tail.parent = group;
  }
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
    const side = box("hairSide", 0.1, 0.42, 0.34, blonde, scene);
    side.position = new Vector3(dx, 1.45, 0.02);
    side.parent = group;
  }

  const t1 = box("hairFlow1", 0.36, 0.46, 0.18, blonde, scene);
  t1.position = new Vector3(0, 1.44, -0.17);
  t1.parent = group;
  const t2 = box("hairFlow2", 0.28, 0.32, 0.13, blonde, scene);
  t2.position = new Vector3(0, 1.12, -0.2);
  t2.parent = group;
  return group;
}

/**
 * Albert's hair: warm strawberry-blond, swept back and a little tousled — a crown
 * cap, a side-swept fringe kept above the eyes, side volume framing the face, and a
 * medium nape with two soft back-swept locks. Rigid; bobs with the head.
 */
function buildSweptHair(scene: Scene): TransformNode {
  const group = new TransformNode("hairSwept", scene);
  const blond = mat("hairBlondAlbert", 0.8, 0.62, 0.3, scene);

  const cap = box("hairCap", 0.4, 0.24, 0.42, blond, scene);
  cap.position.y = 1.77;
  cap.parent = group;

  // Side-swept fringe over the brow (above the eye line).
  const fringe = box("hairFringe", 0.42, 0.12, 0.12, blond, scene);
  fringe.position = new Vector3(0.03, 1.73, 0.16);
  fringe.rotation.z = -0.15;
  fringe.parent = group;

  // Volume framing the upper sides of the face.
  for (const dx of [-0.21, 0.21]) {
    const side = box("hairSide", 0.08, 0.3, 0.4, blond, scene);
    side.position = new Vector3(dx, 1.62, -0.02);
    side.parent = group;
  }

  // Medium nape mass with two soft back-swept locks (no sharp spikes).
  const nape = box("hairNape", 0.36, 0.34, 0.2, blond, scene);
  nape.position = new Vector3(0, 1.5, -0.17);
  nape.parent = group;
  for (const dx of [-0.1, 0.1]) {
    const lock = box("hairLock", 0.14, 0.34, 0.1, blond, scene);
    lock.position = new Vector3(dx, 1.52, -0.2);
    lock.rotation.x = -0.5;
    lock.parent = group;
  }
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
 * Zieg's hair: a blond MULLET — slicked flat back over the crown and sides, with a tapering
 * tail gathered at the nape that falls DOWN the back of the neck (not up), ending in a
 * pointed flare. Thin sideburns frame the face; stern angled eyebrows give the mature, hard
 * look of his art. Rigid; bobs with the head.
 */
function buildManeHair(scene: Scene): TransformNode {
  const group = new TransformNode("hairMane", scene);
  const blond = mat("hairBlondZieg", 0.9, 0.78, 0.32, scene);

  // Slim cap hugging the crown, swept back (low — the top is slicked, not voluminous).
  const cap = box("hairCap", 0.37, 0.14, 0.42, blond, scene);
  cap.position = new Vector3(0, 1.75, -0.03);
  cap.parent = group;

  // A couple of short strands at the hairline.
  const bang = box("hairBang", 0.12, 0.08, 0.1, blond, scene);
  bang.position = new Vector3(-0.05, 1.73, 0.16);
  bang.rotation.x = 0.35;
  bang.parent = group;

  // Thin sideburns framing the face.
  for (const dx of [-0.19, 0.19]) {
    const side = box("hairSide", 0.06, 0.3, 0.36, blond, scene);
    side.position = new Vector3(dx, 1.6, -0.04);
    side.parent = group;
  }

  // Mullet: a mass at the nape feeding a short tail that hangs DOWN the back, tapering.
  const nape = box("hairNape", 0.32, 0.2, 0.18, blond, scene);
  nape.position = new Vector3(0, 1.57, -0.17);
  nape.parent = group;
  const t1 = box("hairTail", 0.24, 0.2, 0.13, blond, scene);
  t1.position = new Vector3(0, 1.43, -0.2);
  t1.rotation.x = -0.12; // leans slightly back
  t1.parent = group;
  // Pointed flared end of the tail (cone tip pointing down and slightly back).
  coneSpike(scene, blond, new Vector3(0, 1.33, -0.21), Math.PI + 0.15, 0, 0.2, 0.18).parent = group;

  // Stern angled eyebrows (the hard look of his art), on the +Z face above the eyes.
  for (const dx of [-0.09, 0.09]) {
    const brow = box("hairBrow", 0.1, 0.03, 0.03, blond, scene);
    brow.position = new Vector3(dx, 1.68, 0.17);
    brow.rotation.z = dx < 0 ? -0.25 : 0.25; // angled down toward the nose
    brow.parent = group;
  }
  return group;
}

/**
 * Haschel's head: long black hair swept straight back into a low tail, a red headband
 * across the brow with two long cords trailing down behind, stern angled brows, and his
 * signature drooping fu-manchu moustache. Rigid; bobs with the head.
 */
function buildElderHair(scene: Scene): TransformNode {
  const group = new TransformNode("hairElder", scene);
  const black = mat("hairElderBlack", 0.11, 0.1, 0.13, scene);
  const grey = mat("hairElderGrey", 0.28, 0.26, 0.28, scene); // slight grey at the temples
  const red = mat("headbandHaschel", 0.66, 0.13, 0.13, scene);

  // Crown cap swept back (sits back off the brow so the headband reads in front).
  const cap = box("hairCap", 0.38, 0.2, 0.42, black, scene);
  cap.position = new Vector3(0, 1.77, -0.04);
  cap.parent = group;

  // Thin greying temples framing the upper sides of the face.
  for (const dx of [-0.2, 0.2]) {
    const side = box("hairSide", 0.06, 0.28, 0.38, grey, scene);
    side.position = new Vector3(dx, 1.6, -0.04);
    side.parent = group;
  }

  // Medium nape mass swept back, ending in a short flared tail at the neck (not long).
  const nape = box("hairNape", 0.34, 0.26, 0.18, black, scene);
  nape.position = new Vector3(0, 1.54, -0.18);
  nape.parent = group;
  const tail = box("hairElderTail", 0.26, 0.22, 0.13, black, scene);
  tail.position = new Vector3(0, 1.33, -0.21);
  tail.rotation.x = -0.15; // flicks back
  tail.parent = group;

  // Red headband across the forehead with a knot and two long cords trailing behind.
  const band = MeshBuilder.CreateTorus("headband", { diameter: 0.39, thickness: 0.06, tessellation: 12 }, scene);
  band.material = red;
  band.isPickable = false;
  band.position.y = 1.69;
  band.parent = group;
  const knot = box("headbandKnot", 0.09, 0.09, 0.1, red, scene);
  knot.position = new Vector3(-0.16, 1.69, -0.06);
  knot.parent = group;
  for (const dx of [-0.2, -0.13]) {
    const cord = box("headbandCord", 0.035, 0.4, 0.035, red, scene);
    cord.position = new Vector3(dx, 1.5, -0.14);
    cord.rotation.x = -0.3; // trailing back and down
    cord.rotation.z = 0.12;
    cord.parent = group;
  }

  // Stern angled eyebrows on the +Z face above the eyes.
  for (const dx of [-0.09, 0.09]) {
    const brow = box("hairBrow", 0.11, 0.03, 0.03, black, scene);
    brow.position = new Vector3(dx, 1.69, 0.17);
    brow.rotation.z = dx < 0 ? -0.2 : 0.2; // angled down toward the nose
    brow.parent = group;
  }

  // Signature fu-manchu moustache: a strip under the nose and two long tapering arms
  // drooping down past the mouth, angled outward.
  const lip = box("moustacheLip", 0.16, 0.04, 0.05, black, scene);
  lip.position = new Vector3(0, 1.55, 0.18);
  lip.parent = group;
  for (const sx of [-1, 1]) {
    const arm = box("moustacheArm", 0.05, 0.24, 0.05, black, scene);
    arm.position = new Vector3(sx * 0.1, 1.45, 0.18);
    arm.rotation.z = sx * 0.28; // splay outward as they droop
    arm.parent = group;
    const tip = coneSpike(scene, black, new Vector3(sx * 0.15, 1.34, 0.18), Math.PI - sx * 0.3, 0, 0.12, 0.05);
    tip.parent = group;
  }
  return group;
}

/**
 * Damia's head: turquoise wavy hair (crown cap, side locks, a back mass), large webbed
 * fin-ears fanning up-and-out from the sides (pale membrane on blue spines), and a gold
 * beaded brow circlet with a teardrop pendant. Rigid; bobs with the head.
 */
function buildSirenHair(scene: Scene): TransformNode {
  const group = new TransformNode("hairSiren", scene);
  const teal = mat("hairTeal", 0.16, 0.62, 0.72, scene); // turquoise
  const finBlue = mat("finBlue", 0.22, 0.4, 0.62, scene); // fin spines
  const gold = mat("sirenGold", 0.83, 0.67, 0.3, scene);
  const web = mat("finWeb", 0.82, 0.87, 0.92, scene); // pale membrane
  web.alpha = 0.72;
  web.backFaceCulling = false;

  // Turquoise wavy hair: crown, side framing to the jaw, and a fuller back mass.
  const cap = box("hairCap", 0.4, 0.22, 0.4, teal, scene);
  cap.position.y = 1.78;
  cap.parent = group;
  for (const dx of [-0.21, 0.21]) {
    const side = box("hairSide", 0.1, 0.44, 0.34, teal, scene);
    side.position = new Vector3(dx, 1.44, 0.02);
    side.parent = group;
  }
  const back = box("hairBack", 0.38, 0.4, 0.2, teal, scene);
  back.position = new Vector3(0, 1.5, -0.17);
  back.parent = group;

  // Large webbed fin-ears: a pale membrane panel on a fan of blue spines, leaning out
  // and swept back from each side of the head.
  for (const sx of [-1, 1]) {
    const ear = new TransformNode("finEar", scene);
    ear.position = new Vector3(sx * 0.19, 1.62, -0.03);
    ear.rotation.z = sx * -0.6; // lean outward
    ear.rotation.y = sx * 0.5; // sweep back
    ear.parent = group;
    const membrane = box("finWebPanel", 0.02, 0.34, 0.22, web, scene);
    membrane.position = new Vector3(0, 0.15, 0);
    membrane.parent = ear;
    for (const z of [0.1, 0, -0.1]) {
      const len = 0.4 - Math.abs(z) * 0.9; // longest spine at the front
      coneSpike(scene, finBlue, new Vector3(0, 0.02, z), 0, 0, len, 0.06).parent = ear;
    }
  }

  // Gold beaded brow circlet + a teardrop pendant at the centre of the forehead.
  const circlet = MeshBuilder.CreateTorus("sirenCirclet", { diameter: 0.38, thickness: 0.02, tessellation: 18 }, scene);
  circlet.material = gold;
  circlet.isPickable = false;
  circlet.position.y = 1.66;
  circlet.parent = group;
  for (const dx of [-0.12, -0.06, 0, 0.06, 0.12]) {
    const bead = MeshBuilder.CreateSphere("sirenBead", { diameter: 0.035, segments: 6 }, scene);
    bead.material = gold;
    bead.isPickable = false;
    bead.position = new Vector3(dx, 1.63, 0.19);
    bead.parent = group;
  }
  const drop = MeshBuilder.CreateSphere("sirenDrop", { diameter: 0.06, segments: 8 }, scene);
  drop.material = gold;
  drop.isPickable = false;
  drop.scaling = new Vector3(1, 1.5, 0.6); // teardrop
  drop.position = new Vector3(0, 1.58, 0.19);
  drop.parent = group;
  return group;
}

/**
 * Kanzas's head: dark-red hair in back-swept spikes, a full red beard framing the jaw,
 * and a scar across the left cheek. Rigid; bobs with the head.
 */
function buildFirebrandHair(scene: Scene): TransformNode {
  const group = new TransformNode("hairFirebrand", scene);
  const red = mat("hairFireRed", 0.46, 0.13, 0.1, scene); // dark auburn-red
  const scarMat = mat("hairScar", 0.7, 0.5, 0.46, scene);

  // Low cap so the scalp reads as hair under the spikes.
  const cap = box("hairCap", 0.37, 0.16, 0.36, red, scene);
  cap.position.y = 1.75;
  cap.parent = group;

  // Back-swept spikes fanning up and rearward from the crown (no bandana — swept mane).
  const spike = (x: number, y: number, z: number, rotX: number, rotZ: number, len = 0.26) =>
    (coneSpike(scene, red, new Vector3(x, y, z), rotX, rotZ, len).parent = group);
  spike(0, 1.84, -0.02, -0.5, 0, 0.34);
  spike(-0.1, 1.82, -0.04, -0.5, -0.25, 0.3);
  spike(0.1, 1.82, -0.04, -0.5, 0.25, 0.3);
  spike(-0.17, 1.76, -0.02, -0.4, -0.7, 0.26);
  spike(0.17, 1.76, -0.02, -0.4, 0.7, 0.26);
  spike(0, 1.86, 0.06, -0.9, 0, 0.28); // a forelock kicking up at the front

  // Full red beard: cheeks, jawline and a chin tuft framing the lower face.
  for (const dx of [-0.15, 0.15]) {
    const cheek = box("beardCheek", 0.07, 0.2, 0.16, red, scene);
    cheek.position = new Vector3(dx, 1.54, 0.1);
    cheek.parent = group;
  }
  const jaw = box("beardJaw", 0.3, 0.1, 0.24, red, scene);
  jaw.position = new Vector3(0, 1.46, 0.09);
  jaw.parent = group;
  const chin = box("beardChin", 0.16, 0.14, 0.16, red, scene);
  chin.position = new Vector3(0, 1.42, 0.13);
  chin.parent = group;

  // Scar slanting across the left cheek (the −X side from the front).
  const scar = box("faceScar", 0.02, 0.16, 0.02, scarMat, scene);
  scar.position = new Vector3(-0.1, 1.63, 0.17);
  scar.rotation.z = 0.3;
  scar.parent = group;
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
        // A proper blade: flat (wide, thin) with a bevelled point, a crossguard,
        // a wrapped grip and a pommel.
        part("blade", 0.11, 0.04, 0.82, 0.46, steel);
        const tip = MeshBuilder.CreateCylinder(
          "swordTip",
          { height: 0.22, diameterTop: 0, diameterBottom: 0.11, tessellation: 4 },
          scene,
        );
        tip.material = steel;
        tip.isPickable = false;
        tip.rotation.x = Math.PI / 2; // point toward +Z
        tip.scaling.z = 0.36; // flatten the point to the blade's thickness
        tip.position.z = 0.98;
        tip.parent = group;
        part("guard", 0.28, 0.08, 0.08, 0.04, accent);
        part("grip", 0.05, 0.05, 0.2, -0.1, wood);
        part("pommel", 0.09, 0.09, 0.08, -0.22, accent);
      }
      break;
    case "rapier": {
      // A slender blade with a fine point, a ring/cup guard and a quillon, a wrapped
      // grip and a pommel.
      part("blade", 0.035, 0.035, 1.0, 0.55, steel);
      const tip = MeshBuilder.CreateCylinder(
        "rapierTip",
        { height: 0.16, diameterTop: 0, diameterBottom: 0.035, tessellation: 6 },
        scene,
      );
      tip.material = steel;
      tip.isPickable = false;
      tip.rotation.x = Math.PI / 2; // point toward +Z
      tip.position.z = 1.13;
      tip.parent = group;
      const guard = MeshBuilder.CreateTorus("rapierGuard", { diameter: 0.17, thickness: 0.025, tessellation: 14 }, scene);
      guard.material = accent;
      guard.isPickable = false;
      guard.rotation.x = Math.PI / 2; // ring encircling the blade
      guard.position.z = 0.06;
      guard.parent = group;
      part("quillon", 0.22, 0.025, 0.04, 0.06, accent);
      part("grip", 0.045, 0.045, 0.2, -0.08, wood);
      part("pommel", 0.07, 0.07, 0.07, -0.2, accent);
      break;
    }
    case "spear": {
      part("shaft", 0.05, 0.05, 1.5, 0.45, wood);
      part("ferrule", 0.08, 0.08, 0.14, 1.22, steel); // metal collar where the blade meets the shaft
      // Leaf-shaped blade: a long 4-sided pyramid pointing forward (+Z).
      const head = MeshBuilder.CreateCylinder(
        "spearHead",
        { height: 0.44, diameterTop: 0, diameterBottom: 0.14, tessellation: 4 },
        scene,
      );
      head.material = steel;
      head.isPickable = false;
      head.rotation.x = Math.PI / 2; // tip toward +Z
      head.position.z = 1.46;
      head.parent = group;
      break;
    }
    case "hammer":
      part("shaft", 0.06, 0.06, 0.9, 0.35, wood);
      part("head", 0.3, 0.3, 0.32, 0.85, accent);
      break;
    case "axe": {
      part("shaft", 0.055, 0.055, 1.2, 0.45, wood);
      part("axeButt", 0.07, 0.07, 0.07, -0.12, steel);
      // Single-bit head hanging below the haft near the front, its broad faces to the
      // sides (so it reads from the iso camera), widening into a longer cutting edge.
      const head = box("axeHead", 0.07, 0.34, 0.32, steel, scene);
      head.position = new Vector3(0, -0.16, 0.82);
      head.parent = group;
      const edge = box("axeEdge", 0.05, 0.13, 0.44, steel, scene);
      edge.position = new Vector3(0, -0.33, 0.82);
      edge.parent = group;
      break;
    }
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
