import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

export interface HumanoidOptions {
  /** Primary body colour (RGB 0–1). */
  color: [number, number, number];
  /** Uniform scale (default 1). */
  scale?: number;
}

/**
 * A low-poly humanoid built from primitives — a clear stand-in figure (head,
 * torso, arms, legs, a facing marker) until rigged glTF art is dropped in. Reads
 * as a person rather than a capsule, tints to the bearer's colour, and supports
 * a light procedural walk/idle animation via {@link update}. Pure transforms; no
 * skeleton. Faces +Z (the owner rotates the parent to steer).
 */
export class Humanoid {
  /** Visual root — parent this under the entity's node. */
  readonly rig: TransformNode;

  private body: TransformNode; // torso/head/arms group (bobs)
  private leftArm: TransformNode;
  private rightArm: TransformNode;
  private leftLeg: TransformNode;
  private rightLeg: TransformNode;
  private phase = 0;

  constructor(scene: Scene, opts: HumanoidOptions) {
    const [r, g, b] = opts.color;
    this.rig = new TransformNode("humanoid", scene);
    this.rig.scaling.setAll(opts.scale ?? 1);

    const main = mat("hMain", r, g, b, scene);
    const dark = mat("hDark", r * 0.55, g * 0.55, b * 0.55, scene);
    const light = mat("hLight", 0.5 + r * 0.5, 0.5 + g * 0.5, 0.5 + b * 0.5, scene);

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

    // Small nose marker on +Z so facing is unmistakable.
    const face = box("hFace", 0.16, 0.12, 0.1, main, scene);
    face.position = new Vector3(0, 1.58, 0.2);
    face.parent = this.body;

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
  }

  /** Hide/show the figure (e.g. when a loaded glTF model replaces it). */
  setEnabled(on: boolean): void {
    this.rig.setEnabled(on);
  }

  /** Advance the procedural animation: a walk cycle when moving, a gentle idle otherwise. */
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
  }

  dispose(): void {
    this.rig.dispose();
  }
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
