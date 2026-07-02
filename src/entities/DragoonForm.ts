import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

/** Which canon Dragoon this form models (selects the body build; wings are shared). */
export type DragoonVariant = "redEye" | "blueSea";

/** Tunable look of a Dragoon form. Defaults below are Dart's Red-Eye Dragoon (canon). */
export interface DragoonFormOptions {
  /** Which Dragoon body to build (default "redEye" — Dart). */
  variant?: DragoonVariant;
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

  private body!: TransformNode; // torso/head/arms (hovers)
  private leftArm!: TransformNode;
  private rightArm!: TransformNode;
  private leftWing!: TransformNode;
  private rightWing!: TransformNode;
  private phase = 0;
  private strikeT = 0;

  constructor(scene: Scene, opts: DragoonFormOptions = {}) {
    this.rig = new TransformNode("dragoonForm", scene);
    this.rig.scaling.setAll(opts.scale ?? 1);
    if ((opts.variant ?? "redEye") === "blueSea") this.buildBlueSea(scene, opts);
    else this.buildRedEye(scene, opts);
  }

  /** Dart's Red-Eye Dragoon body (copper-orange plate, spiky blond hair, sword). */
  private buildRedEye(scene: Scene, opts: DragoonFormOptions): void {
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
    const gold = mat("dgGold", 0.85, 0.62, 0.22, scene); // headband / gem mount / trim
    const paleRib = mat("dgPaleRib", 0.76, 0.84, 0.82, scene); // pale fluted pauldron ribs
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
    // Bright red centre tabard hanging over the dark fauld (PS1 front cloth).
    box("dgTabardTrim", 0.24, 0.42, 0.02, redDk, scene, new Vector3(0, 0.52, 0.185), this.body);
    box("dgTabard", 0.19, 0.36, 0.03, red, scene, new Vector3(0, 0.5, 0.2), this.body);

    box("dgTorso", 0.46, 0.6, 0.3, teal, scene, new Vector3(0, 1.14, 0), this.body);
    box("dgChest", 0.56, 0.54, 0.14, red, scene, new Vector3(0, 1.2, 0.14), this.body); // breastplate, broad
    // Dark-red engraved filigree on the chest: a flame-fan at the top + side scrolls.
    box("dgFiliTop", 0.38, 0.1, 0.04, redDk, scene, new Vector3(0, 1.42, 0.22), this.body);
    for (const sx of [-1, 1]) {
      const scroll = box("dgFiliS", 0.06, 0.32, 0.04, redDk, scene, new Vector3(sx * 0.17, 1.2, 0.22), this.body);
      scroll.rotation.z = sx * 0.4;
      // Gold V-collar plates converging from the shoulders down to the sternum gem.
      const v = box("dgVCollar", 0.3, 0.08, 0.05, gold, scene, new Vector3(sx * 0.13, 1.33, 0.21), this.body);
      v.rotation.z = -sx * 0.5;
    }
    box("dgCollar", 0.34, 0.14, 0.3, redDk, scene, new Vector3(0, 1.46, 0), this.body);
    // Back armour: a broad engraved backplate the wing bones socket into, with a dark
    // spine ridge + upper trim, and a rear tasset closing the fauld.
    box("dgBackPlate", 0.52, 0.52, 0.12, red, scene, new Vector3(0, 1.19, -0.15), this.body);
    box("dgBackTrim", 0.4, 0.1, 0.04, redDk, scene, new Vector3(0, 1.42, -0.22), this.body);
    box("dgSpine", 0.09, 0.44, 0.04, redDk, scene, new Vector3(0, 1.14, -0.22), this.body);
    box("dgBackTasset", 0.44, 0.15, 0.12, red, scene, new Vector3(0, 0.72, -0.14), this.body);
    // Big glowing GREEN dragon-eye gem at the sternum, set in an ornate diamond mount.
    const mount = box("dgGemMount", 0.3, 0.3, 0.04, redDk, scene, new Vector3(0, 1.12, 0.19), this.body);
    mount.rotation.z = Math.PI / 4;
    const mountRim = box("dgGemMountRim", 0.22, 0.22, 0.05, gold, scene, new Vector3(0, 1.12, 0.195), this.body);
    mountRim.rotation.z = Math.PI / 4;
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
    // Gold headband/tiara across the brow with five green gems.
    box("dgBand", 0.34, 0.07, 0.32, gold, scene, new Vector3(0, 1.74, 0.02), this.body);
    for (const dx of [-0.13, -0.065, 0, 0.065, 0.13]) {
      const bandGem = box("dgBandGem", 0.05, 0.05, 0.04, gem, scene, new Vector3(dx, 1.74, 0.17), this.body);
      void bandGem;
    }
    // Big blocky blond hair (PS1: wide angular wedges): a volume cap + chunky spikes
    // swept back over the crown, flaring wider at the sides.
    box("dgHairCap", 0.34, 0.14, 0.3, blond, scene, new Vector3(0, 1.85, -0.03), this.body);
    const spikes: [number, number, number, number][] = [
      [0, 0.42, 0, 0.2],
      [-0.12, 0.38, 0.25, 0.18],
      [0.12, 0.38, -0.25, 0.18],
      [-0.2, 0.3, 0.55, 0.16],
      [0.2, 0.3, -0.55, 0.16],
      [-0.24, 0.24, 0.9, 0.14],
      [0.24, 0.24, -0.9, 0.14],
    ];
    for (const [dx, len, rz, baseD] of spikes) {
      const spike = cone("dgHair", len, baseD, blond, scene);
      spike.position = new Vector3(dx, 1.84, -0.05);
      spike.rotation.x = -1.5; // sweep strongly back over the crown
      spike.rotation.z = rz;
      spike.parent = this.body;
    }

    // --- Pauldrons: huge PS1 clamshells — stacked copper plates over a pale rib fan. ---
    this.buildPauldron(scene, -1, red, redDk, paleRib, this.body);
    this.buildPauldron(scene, 1, red, redDk, paleRib, this.body);

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
      box("dgFist", 0.23, 0.2, 0.25, red, scene, new Vector3(0, -0.64, 0), arm); // big red gauntlet fist
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

  /**
   * Damia's Blue-Sea Dragoon body (canon reference): deep-sapphire dragon-scale plate with
   * glowing cyan filigree and a gold sternum gem, layered pointed scale pauldrons, a scaled
   * face with red eyes + a pointed brow crest and gold brow gems, long teal hair with big
   * webbed fin-ears, and a hammer. Wings reuse Dart's builder (pale iridescent membrane on a
   * blue spar). Same proportions/animation as Red-Eye so it stands and beats identically.
   */
  private buildBlueSea(scene: Scene, opts: DragoonFormOptions): void {
    const [pr, pg, pb] = opts.primary ?? [0.16, 0.3, 0.62]; // deep sapphire scale
    const [mr, mg, mb] = opts.accent ?? [0.74, 0.78, 0.85]; // silver
    const [er, eg, eb] = opts.gem ?? [0.95, 0.72, 0.28]; // gold gem
    const [wr, wg, wb] = opts.wing ?? [0.74, 0.82, 0.92]; // pale iridescent membrane
    const [hr, hg, hb] = opts.hair ?? [0.16, 0.62, 0.72]; // teal
    const [sr, sg, sb] = opts.skin ?? [0.56, 0.76, 0.86]; // blue scaled skin

    const blue = mat("dgBlue", pr, pg, pb, scene);
    const blueDk = mat("dgBlueDk", pr * 0.55, pg * 0.55, pb * 0.62, scene);
    const blueLt = mat("dgBlueLt", Math.min(1, pr * 1.7), Math.min(1, pg * 1.5), Math.min(1, pb * 1.2), scene);
    const silver = mat("dgSilver", mr, mg, mb, scene);
    const skin = mat("dgSkinBlue", sr, sg, sb, scene);
    const teal = mat("dgTealHair", hr, hg, hb, scene);
    const web = mat("dgFinWeb", 0.8, 0.86, 0.92, scene);
    const cyan = mat("dgCyan", 0.05, 0.18, 0.22, scene);
    cyan.emissiveColor = new Color3(0.18, 0.72, 0.88); // glowing filigree
    const eyeMat = mat("dgEyeRed", 0.7, 0.08, 0.1, scene);
    eyeMat.emissiveColor = new Color3(0.55, 0.05, 0.06); // red eyes
    const gem = mat("dgGemGold", er * 0.4, eg * 0.4, eb * 0.35, scene);
    gem.emissiveColor = new Color3(er, eg, eb); // self-lit gold
    // Unlit pale membranes (see Red-Eye note): lower blade a shade darker.
    const wingUp = mat("dgWingUp", 0, 0, 0, scene);
    wingUp.emissiveColor = new Color3(wr, wg, wb);
    wingUp.disableLighting = true;
    wingUp.backFaceCulling = false;
    const wingLo = mat("dgWingLo", 0, 0, 0, scene);
    wingLo.emissiveColor = new Color3(wr * 0.78, wg * 0.8, wb * 0.86);
    wingLo.disableLighting = true;
    wingLo.backFaceCulling = false;

    // --- Legs: sapphire scale, silver knee cop, dark boots. ---
    for (const sx of [-1, 1]) {
      box("dgThigh", 0.2, 0.42, 0.22, blueDk, scene, new Vector3(sx * 0.13, 0.56, 0), this.rig);
      box("dgShin", 0.21, 0.44, 0.22, blue, scene, new Vector3(sx * 0.13, 0.2, 0.01), this.rig);
      box("dgKnee", 0.24, 0.12, 0.25, silver, scene, new Vector3(sx * 0.13, 0.4, 0.01), this.rig);
      box("dgFoot", 0.22, 0.15, 0.38, blueDk, scene, new Vector3(sx * 0.13, 0.07, 0.09), this.rig);
    }

    // --- Body group (torso/head/arms) — hovers gently in update(). ---
    this.body = new TransformNode("dgBody", scene);
    this.body.parent = this.rig;

    box("dgHips", 0.46, 0.2, 0.3, blueDk, scene, new Vector3(0, 0.82, 0), this.body);
    box("dgTasset", 0.5, 0.16, 0.16, blue, scene, new Vector3(0, 0.74, 0.16), this.body);
    box("dgTassetB", 0.44, 0.15, 0.12, blue, scene, new Vector3(0, 0.72, -0.14), this.body);

    box("dgTorso", 0.44, 0.6, 0.3, blue, scene, new Vector3(0, 1.14, 0), this.body);
    box("dgChest", 0.5, 0.54, 0.14, blueLt, scene, new Vector3(0, 1.2, 0.14), this.body); // scaled breastplate
    // Glowing cyan filigree branching up the chest (stem + upswept prongs).
    box("dgFili", 0.05, 0.5, 0.03, cyan, scene, new Vector3(0, 1.16, 0.21), this.body);
    for (const sx of [-1, 1]) {
      const prong = box("dgFiliP", 0.04, 0.26, 0.03, cyan, scene, new Vector3(sx * 0.1, 1.12, 0.21), this.body);
      prong.rotation.z = sx * 0.7;
    }
    box("dgCollar", 0.32, 0.14, 0.3, blueDk, scene, new Vector3(0, 1.46, 0), this.body);
    // Back armour the wing bones socket into.
    box("dgBackPlate", 0.5, 0.5, 0.12, blue, scene, new Vector3(0, 1.19, -0.15), this.body);
    box("dgSpine", 0.09, 0.44, 0.04, blueDk, scene, new Vector3(0, 1.14, -0.22), this.body);
    // Gold sternum gem (tall oval) in a diamond scale mount.
    const mount = box("dgGemMount", 0.28, 0.28, 0.04, blueDk, scene, new Vector3(0, 1.12, 0.19), this.body);
    mount.rotation.z = Math.PI / 4;
    const gemMesh = MeshBuilder.CreateSphere("dgGem", { diameter: 0.2, segments: 12 }, scene);
    gemMesh.material = gem;
    gemMesh.isPickable = false;
    gemMesh.scaling = new Vector3(0.85, 1.3, 0.7);
    gemMesh.position = new Vector3(0, 1.12, 0.23);
    gemMesh.parent = this.body;

    // --- Head: blue scaled face, red eyes, scale cheek/brow markings, a pointed brow crest,
    // gold brow gems, long teal hair and big webbed fin-ears. ---
    box("dgHead", 0.32, 0.34, 0.3, skin, scene, new Vector3(0, 1.66, 0), this.body);
    for (const dx of [-0.08, 0.08]) {
      box("dgEye", 0.06, 0.07, 0.04, eyeMat, scene, new Vector3(dx, 1.67, 0.16), this.body);
      box("dgCheek", 0.05, 0.12, 0.03, blueDk, scene, new Vector3(dx * 1.5, 1.62, 0.15), this.body); // scale mask
    }
    box("dgBrowMark", 0.14, 0.06, 0.03, blueDk, scene, new Vector3(0, 1.76, 0.15), this.body);
    // Pointed scale crest rising from the brow (dragon helm crest).
    const crest = cone("dgCrest", 0.28, 0.15, blueLt, scene);
    crest.position = new Vector3(0, 1.82, 0.04);
    crest.rotation.x = -0.25;
    crest.parent = this.body;
    // Row of gold gems down the forehead centreline.
    for (const y of [1.8, 1.73, 1.67]) {
      box("dgBrowGem", 0.05, 0.05, 0.04, gem, scene, new Vector3(0, y, 0.17), this.body);
    }
    // Long teal hair: crown cap, side locks to the jaw, a fuller back mass.
    box("dgHairCap", 0.35, 0.16, 0.35, teal, scene, new Vector3(0, 1.8, -0.02), this.body);
    for (const dx of [-0.2, 0.2]) {
      box("dgHairSide", 0.1, 0.42, 0.32, teal, scene, new Vector3(dx, 1.5, 0), this.body);
    }
    box("dgHairBack", 0.36, 0.44, 0.2, teal, scene, new Vector3(0, 1.5, -0.16), this.body);
    // Webbed fin-ears: pale membrane on blue spines, leaning out and swept back.
    for (const sx of [-1, 1]) {
      const ear = new TransformNode("dgFinEar", scene);
      ear.position = new Vector3(sx * 0.2, 1.66, -0.02);
      ear.rotation.z = sx * -0.6;
      ear.rotation.y = sx * 0.5;
      ear.parent = this.body;
      box("dgFinWeb", 0.02, 0.34, 0.22, web, scene, new Vector3(0, 0.15, 0), ear);
      for (const z of [0.1, 0, -0.1]) {
        const spine = cone("dgFinSpine", 0.4 - Math.abs(z) * 0.9, 0.06, blue, scene);
        spine.position = new Vector3(0, 0.02, z);
        spine.parent = ear;
      }
    }

    // --- Pauldrons: layered pointed scale plates (silver-trimmed) rising off each shoulder. ---
    for (const sx of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const trim = box("dgPauldronTrim", 0.36 - i * 0.07, 0.03, 0.46 - i * 0.09, silver, scene, new Vector3(sx * (0.4 - i * 0.02), 1.48 + i * 0.1, 0), this.body);
        trim.rotation.z = sx * (0.32 + i * 0.2);
        const plate = box("dgPauldronPlate", 0.34 - i * 0.07, 0.08, 0.44 - i * 0.09, blueLt, scene, new Vector3(sx * (0.4 - i * 0.02), 1.52 + i * 0.1, 0), this.body);
        plate.rotation.z = sx * (0.32 + i * 0.2);
      }
    }

    // --- Arms: sapphire scale with silver ribs down to blue fists (right arm strikes). ---
    this.leftArm = limb("dgArmL", blue, scene);
    this.leftArm.position = new Vector3(-0.36, 1.4, 0);
    this.leftArm.parent = this.body;
    this.rightArm = limb("dgArmR", blue, scene);
    this.rightArm.position = new Vector3(0.36, 1.4, 0);
    this.rightArm.parent = this.body;
    for (const arm of [this.leftArm, this.rightArm]) {
      box("dgSleeve", 0.21, 0.26, 0.21, blueDk, scene, new Vector3(0, -0.08, 0), arm);
      for (const y of [-0.26, -0.4, -0.52]) box("dgRib", 0.22, 0.04, 0.22, silver, scene, new Vector3(0, y, 0), arm);
      box("dgFist", 0.23, 0.2, 0.25, blue, scene, new Vector3(0, -0.64, 0), arm);
    }

    // War hammer in the right hand: silver haft, big scaled head — tipped forward (flight pose).
    const hammer = new TransformNode("dgHammer", scene);
    hammer.position = new Vector3(0, -0.64, 0.12);
    hammer.rotation.x = 1.15;
    hammer.parent = this.rightArm;
    box("dgHaft", 0.06, 1.0, 0.06, silver, scene, new Vector3(0, 0.45, 0), hammer);
    box("dgHammerHead", 0.3, 0.32, 0.36, blueLt, scene, new Vector3(0, 0.95, 0), hammer);
    box("dgHammerBand", 0.32, 0.09, 0.38, silver, scene, new Vector3(0, 0.95, 0), hammer);

    // --- Wings: Dart's builder, pale iridescent membrane on a blue spar. ---
    this.leftWing = this.buildWing(scene, -1, wingUp, wingLo, blue);
    this.rightWing = this.buildWing(scene, 1, wingUp, wingLo, blue);
    for (const w of [this.leftWing, this.rightWing]) w.parent = this.body;
  }

  /** One pauldron: the PS1 clamshell — a copper dome crowned by three stacked shell plates
   *  tilting up toward the neck (dark trim under each), over a fan of four pale fluted ribs
   *  flaring out-down across the upper arm. Rises proud of the shoulder line. */
  private buildPauldron(
    scene: Scene,
    sx: number,
    red: StandardMaterial,
    redDk: StandardMaterial,
    paleRib: StandardMaterial,
    parent: TransformNode,
  ): void {
    // Pale fluted rib fan first — it sits beneath the shell plates, sweeping over the arm.
    for (let i = 0; i < 4; i++) {
      const rib = box("dgPauldronFan", 0.3, 0.05, 0.36 - i * 0.05, paleRib, scene, new Vector3(sx * (0.42 + i * 0.05), 1.5 - i * 0.09, 0), parent);
      rib.rotation.z = sx * (0.45 + i * 0.28);
    }
    const dome = MeshBuilder.CreateSphere("dgPauldron", { diameter: 0.46, segments: 8 }, scene);
    dome.material = red;
    dome.isPickable = false;
    dome.scaling = new Vector3(1.3, 0.75, 1.1);
    dome.position = new Vector3(sx * 0.42, 1.52, 0);
    dome.parent = parent;
    // Three stacked shell plates, biggest at the base, tilting up-in toward the neck.
    for (let i = 0; i < 3; i++) {
      const trim = box("dgPauldronTrim", 0.42 - i * 0.08, 0.04, 0.54 - i * 0.1, redDk, scene, new Vector3(sx * (0.42 - i * 0.015), 1.56 + i * 0.1, 0), parent);
      trim.rotation.z = sx * (0.3 + i * 0.18);
      const plate = box("dgPauldronPlate", 0.4 - i * 0.08, 0.08, 0.52 - i * 0.1, red, scene, new Vector3(sx * (0.42 - i * 0.015), 1.6 + i * 0.1, 0), parent);
      plate.rotation.z = sx * (0.3 + i * 0.18);
    }
  }

  /** One wing (PS1 reference, annotated): ONE thick orange bone sweeps up-out from the
   *  shoulder in a wide V, protruding past the membrane — and the membrane is a FAN of
   *  long thin triangles all converging at a point high on the bone's OUTER stretch.
   *  From that top anchor the panels drape DOWNWARD, the innermost reaching down beside
   *  the body, the outer ones shorter; adjacent panels share their radiating edges, each
   *  one a single flat obtuse triangle with a straight rim between tips. Built in the
   *  XY plane, then swept back a touch and opened into the V; panels alternate the two
   *  jade shades. Pivot is animated (flap). */
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
    blade.rotation = new Vector3(0, sx * 0.35, sx * 0.38); // swept back a touch, wide-open V

    const P = (x: number, y: number): Vector3 => new Vector3(sx * x, y, 0);
    const root = P(0.03, 0);
    // The single bone, angled up-out within the blade plane.
    const BONE_ANG = 0.55;
    const BONE_LEN = 1.3; // shortened 30% (was 1.85)
    const boneTip = root.add(P(Math.cos(BONE_ANG) * BONE_LEN, Math.sin(BONE_ANG) * BONE_LEN));
    const boneDelta = boneTip.subtract(root);
    const bone = box("dgWingBone", boneDelta.length() + 0.1, 0.1, 0.08, rib, scene, root.add(boneTip).scale(0.5), blade);
    bone.rotation.z = Math.atan2(boneDelta.y, boneDelta.x);

    // The fan's anchor: the bone's outer tip.
    const anchor = boneTip;
    // Panel rays, OUTER → INNER: polar angle from straight-down (positive = outward)
    // and length. The outer panels are the longest and most obtuse; moving inward each
    // ray shortens and steepens, so every triangle gets a smaller hypotenuse and a less
    // obtuse angle than its outer neighbour.
    const rays: { ang: number; len: number }[] = [
      { ang: 0.75, len: 1.35 },
      { ang: 0.4, len: 1.22 },
      { ang: 0.05, len: 1.08 },
      { ang: -0.3, len: 0.92 },
      { ang: -0.62, len: 0.78 },
      { ang: -0.92, len: 0.66 },
    ];
    const WEB_SCALE = 1.6; // global membrane size (ratios between panels preserved)
    const tips = rays.map(
      (r) =>
        new Vector3(
          anchor.x + sx * Math.sin(r.ang) * r.len * WEB_SCALE,
          anchor.y - Math.cos(r.ang) * r.len * WEB_SCALE,
          0,
        ),
    );
    for (let i = 0; i < tips.length - 1; i++) {
      // Sawtooth panels (5): each tooth's OUTER radiating edge runs the full ray (the
      // long side), while its inner edge stops partway down the shared ray — the lower
      // rim slants down-outward then steps back up at every ray, a saw-blade zigzag.
      const inner = Vector3.Lerp(anchor, tips[i + 1], 0.78);
      const shade = i % 2 === 0 ? upper : lower;
      triangle("dgWingWeb", anchor, tips[i], inner, shade, scene).parent = blade;
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
