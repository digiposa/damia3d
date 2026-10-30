import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

import { pixelTexture, rgb } from "../paint";
import { LEAF_SHADE, LEAF_SUN, PLAIN, cardSource, gradeColors, jitter, limb, matte, mergeSource, normalsUp } from "./mesh";

/**
 * Map kit — the flora: painted bark / leaf / fern textures and the instance sources for trees,
 * groves, saplings, bushes, rocks, ferns, tall grass and flowers. Every source is built once,
 * hidden, and placed by instances (see `place`). Seeded `rand` keeps a map identical every visit.
 */

export function barkTexture(scene: Scene, rand: () => number): DynamicTexture {
  return pixelTexture("forestBarkTex", scene, 32, 64, (ctx, w, h) => {
    for (let x = 0; x < w; x++) {
      const k = 0.75 + rand() * 0.4;
      ctx.fillStyle = rgb(96 * k, 82 * k, 66 * k); // grey-brown, gnarled
      ctx.fillRect(x, 0, 1, h);
    }
    for (let i = 0; i < 60; i++) {
      const x = (rand() * w) | 0;
      const y = (rand() * h) | 0;
      ctx.fillStyle = rgb(44, 34, 26); // deep furrows
      ctx.fillRect(x, y, 1, 4 + ((rand() * 10) | 0));
    }
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = rgb(70 + rand() * 20, 92 + rand() * 20, 40); // moss
      ctx.fillRect((rand() * w) | 0, (h * 0.6 + rand() * h * 0.4) | 0, 2, 2);
    }
  });
}

export function leafTexture(scene: Scene, rand: () => number): DynamicTexture {
  // Fine 1-px speckle of olive tones: at canopy scale it must read as foliage, not as a checker.
  // The sunlit/shaded read comes from the vertex grading ({@link gradeColors}), not from here.
  const tex = pixelTexture("forestLeafTex", scene, 64, 64, (ctx, w, h) => {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const k = 0.78 + rand() * 0.34;
        const lit = rand() < 0.12;
        ctx.fillStyle = lit ? rgb(150 * k, 150 * k, 70 * k) : rgb(112 * k, 124 * k, 58 * k);
        ctx.fillRect(x, y, 1, 1);
      }
  });
  tex.uScale = tex.vScale = 3;
  return tex;
}

/** A fern frond card: alpha-tested leaflets on a central rib. */
export function fernTexture(scene: Scene, rand: () => number): DynamicTexture {
  const tex = pixelTexture("forestFernTex", scene, 32, 32, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    for (let f = 0; f < 5; f++) {
      // Fronds fanning out from the bottom centre.
      const ang = -Math.PI / 2 + (f - 2) * 0.42;
      const len = 22 + rand() * 8;
      for (let s = 0; s < len; s++) {
        const x = w / 2 + Math.cos(ang) * s;
        const y = h - 1 + Math.sin(ang) * s;
        const leaf = Math.max(1, Math.round((1 - s / len) * 4));
        const k = 0.75 + rand() * 0.4;
        ctx.fillStyle = rgb(92 * k, 116 * k, 46 * k);
        ctx.fillRect((x - leaf) | 0, y | 0, leaf * 2, 1);
      }
    }
  });
  tex.hasAlpha = true;
  tex.wrapU = tex.wrapV = Texture.CLAMP_ADDRESSMODE;
  return tex;
}

/**
 * A big forest tree, after the reference screens: a thick, gnarled trunk that bends as it rises,
 * roots gripping the ground, two heavy limbs, and a high, lumpy crown — high enough that the iso
 * camera sees the trunks, which is what makes the wood read as a wood.
 */
export function treeSource(i: number, scene: Scene, bark: StandardMaterial, leaves: StandardMaterial, rand: () => number): Mesh {
  const height = 12 + rand() * 3;
  const r = 0.5 + rand() * 0.2;
  const parts: Mesh[] = [];
  const barkPart = (m: Mesh, lo: number): Mesh => {
    gradeColors(m, [lo, lo * 0.95, lo * 0.9], PLAIN);
    m.material = bark;
    parts.push(m);
    return m;
  };

  // Trunk: a wandering spine, thick at the foot.
  const spine: Vector3[] = [];
  let x = 0;
  let z = 0;
  for (let k = 0; k <= 6; k++) {
    spine.push(new Vector3(x, (height * 0.82 * k) / 6, z));
    x += (rand() - 0.5) * 0.7;
    z += (rand() - 0.5) * 0.7;
  }
  barkPart(limb(`t${i}trunk`, scene, spine, r * 1.9, r * 0.75, rand), 0.62);

  // Roots: flaring out and diving into the ground.
  const roots = 5;
  for (let k = 0; k < roots; k++) {
    const a = (k / roots) * Math.PI * 2 + rand() * 0.6;
    const out = 1.6 + rand() * 1.2;
    const path = [0, 0.35, 0.7, 1].map(
      (t) => new Vector3(Math.cos(a) * (r * 0.8 + out * t), 0.9 * (1 - t) * (1 - t) - 0.15 * t, Math.sin(a) * (r * 0.8 + out * t)),
    );
    barkPart(limb(`t${i}root${k}`, scene, path, r * 0.55, 0.06, rand), 0.55);
  }

  // Two heavy limbs leaving the trunk, each ending in its own clump of leaves.
  const ends: Vector3[] = [];
  for (let k = 0; k < 2; k++) {
    const from = spine[4 + k];
    const a = rand() * Math.PI * 2;
    const reach = 2.2 + rand() * 1.2;
    const path = [0, 0.5, 1].map((t) => new Vector3(from.x + Math.cos(a) * reach * t, from.y + 1.6 * t + 0.6 * t * t, from.z + Math.sin(a) * reach * t));
    barkPart(limb(`t${i}limb${k}`, scene, path, r * 0.45, 0.1, rand), 0.68);
    ends.push(path[2]);
  }

  // Crown: lumps around the top and the limb ends — each lit on top, dark underneath.
  const top = spine[6];
  const centres = [top, top, top, ...ends];
  const blobs = 9 + ((rand() * 3) | 0);
  for (let k = 0; k < blobs; k++) {
    const c = centres[k % centres.length];
    const b = MeshBuilder.CreateIcoSphere(`t${i}leaf${k}`, { radius: 1.2 + rand() * 0.7, subdivisions: 1, flat: false }, scene);
    const a = rand() * Math.PI * 2;
    const d = rand() * 1.8;
    b.position.set(c.x + Math.cos(a) * d, c.y + 0.6 + rand() * 1.2, c.z + Math.sin(a) * d);
    b.scaling.y = 0.78;
    jitter(b, 0.25, rand);
    gradeColors(b, LEAF_SHADE, LEAF_SUN);
    b.material = leaves;
    parts.push(b);
  }
  const tree = mergeSource(`forestTree${i}`, parts, false); // smooth: the reference foliage is soft
  tree.metadata = { height: height + 1 };
  return tree;
}

/** A low, broad clump of trees (the maze's hedges): short twisted trunks under one wide crown. */
export function groveSource(scene: Scene, bark: StandardMaterial, leaves: StandardMaterial, rand: () => number): Mesh {
  const parts: Mesh[] = [];
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + rand();
    const path = [0, 0.5, 1].map((t) => new Vector3(Math.cos(a) * (0.6 + t * 0.6), t * 2.6, Math.sin(a) * (0.6 + t * 0.6)));
    const trunk = limb(`groveTrunk${k}`, scene, path, 0.32, 0.14, rand);
    gradeColors(trunk, [0.6, 0.57, 0.52], PLAIN);
    trunk.material = bark;
    parts.push(trunk);
  }
  for (let k = 0; k < 9; k++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * 1.9;
    const b = MeshBuilder.CreateIcoSphere(`groveLeaf${k}`, { radius: 1.0 + rand() * 0.5, subdivisions: 1, flat: false }, scene);
    b.position.set(Math.cos(a) * d, 3 + (1 - d / 1.9) * 0.9 + rand() * 0.4, Math.sin(a) * d);
    b.scaling.y = 0.8;
    jitter(b, 0.2, rand);
    gradeColors(b, LEAF_SHADE, LEAF_SUN);
    b.material = leaves;
    parts.push(b);
  }
  return mergeSource("forestGrove", parts, false);
}

/** A sapling: thin trunk, small crown — short enough to stand nearer the camera. */
export function saplingSource(scene: Scene, bark: StandardMaterial, leaves: StandardMaterial, rand: () => number): Mesh {
  // A young tree: a slightly bent trunk under a soft, lumpy crown (not one faceted ball).
  const trunk = limb("sapTrunk", scene, [new Vector3(0, 0, 0), new Vector3(0.06, 0.9, 0.03), new Vector3(0, 1.7, 0)], 0.1, 0.05, rand);
  trunk.material = bark;
  gradeColors(trunk, [0.62, 0.58, 0.52], PLAIN);
  const parts: Mesh[] = [trunk];
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + rand();
    const d = k === 0 ? 0 : 0.35 + rand() * 0.2;
    const b = MeshBuilder.CreateIcoSphere(`sapCrown${k}`, { radius: 0.42 + rand() * 0.18, subdivisions: 2, flat: false }, scene);
    b.position.set(Math.cos(a) * d, 1.75 + (k === 0 ? 0.3 : rand() * 0.25), Math.sin(a) * d);
    b.scaling.y = 0.85;
    jitter(b, 0.12, rand);
    gradeColors(b, LEAF_SHADE, LEAF_SUN);
    b.material = leaves;
    parts.push(b);
  }
  return mergeSource("forestSapling", parts, false);
}

export function bushSource(scene: Scene, leaves: StandardMaterial, rand: () => number): Mesh {
  // A clump of small lumps (not three big ones): the rounded, bubbly bushes of the reference shots.
  const parts: Mesh[] = [];
  for (let k = 0; k < 7; k++) {
    const r = 0.32 + rand() * 0.22;
    const b = MeshBuilder.CreateIcoSphere(`bush${k}`, { radius: r, subdivisions: 1, flat: false }, scene);
    const a = rand() * Math.PI * 2;
    const d = k === 0 ? 0 : 0.35 + rand() * 0.4;
    b.position.set(Math.cos(a) * d, r * 0.8 + (k === 0 ? 0.25 : rand() * 0.15), Math.sin(a) * d);
    b.scaling.y = 0.85;
    jitter(b, 0.1, rand);
    gradeColors(b, LEAF_SHADE, LEAF_SUN);
    b.material = leaves;
    parts.push(b);
  }
  return mergeSource("forestBush", parts, false);
}

export function rockSource(scene: Scene, rand: () => number): Mesh {
  const tex = pixelTexture("forestRockTex", scene, 32, 32, (ctx, w, h) => {
    for (let y = 0; y < h; y += 2)
      for (let x = 0; x < w; x += 2) {
        const k = 0.75 + rand() * 0.35;
        const moss = y < h * 0.45 && rand() < 0.6;
        ctx.fillStyle = moss ? rgb(66 * k, 86 * k, 44 * k) : rgb(98 * k, 96 * k, 88 * k);
        ctx.fillRect(x, y, 2, 2);
      }
  });
  const rock = MeshBuilder.CreateIcoSphere("rock", { radius: 0.7, subdivisions: 1 }, scene);
  rock.scaling.set(1.2, 0.65, 1);
  rock.bakeCurrentTransformIntoVertices();
  jitter(rock, 0.3, rand);
  rock.material = matte("forestRockMat", scene, tex);
  return mergeSource("forestRock", [rock]);
}

export function fernSource(scene: Scene, rand: () => number): Mesh {
  const mat = matte("forestFernMat", scene, fernTexture(scene, rand));
  mat.backFaceCulling = false;
  const parts: Mesh[] = [];
  for (let k = 0; k < 3; k++) {
    const card = MeshBuilder.CreatePlane(`fern${k}`, { width: 1.3, height: 1.0 }, scene);
    card.position.y = 0.48;
    card.rotation.y = (k / 3) * Math.PI;
    card.rotation.x = 0.12;
    card.material = mat;
    parts.push(card);
  }
  const fern = mergeSource("forestFern", parts, false);
  normalsUp(fern);
  return fern;
}

/** Tall grass: a tuft of blades fanning up from the ground, olive to straw at the tips. */
export function grassSource(scene: Scene, rand: () => number): Mesh {
  const tex = pixelTexture("forestGrassTuftTex", scene, 32, 32, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    for (let b = 0; b < 16; b++) {
      const x0 = w / 2 + (rand() - 0.5) * 12;
      const lean = (rand() - 0.5) * 0.8;
      const len = 14 + rand() * 17;
      for (let s = 0; s < len; s++) {
        const t = s / len;
        ctx.fillStyle = rgb(70 + 90 * t, 92 + 70 * t, 34 + 30 * t);
        ctx.fillRect((x0 + lean * s) | 0, h - 1 - s, 1, 1);
      }
    }
  });
  tex.hasAlpha = true;
  tex.wrapU = tex.wrapV = Texture.CLAMP_ADDRESSMODE;
  return cardSource("forestGrass", scene, tex, 1.0, 0.9);
}

/** White wild flowers on thin stems (the last reference screen is dotted with them). */
export function flowerSource(scene: Scene, rand: () => number): Mesh {
  const tex = pixelTexture("forestFlowerTex", scene, 32, 32, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    for (let f = 0; f < 6; f++) {
      const x = 4 + ((rand() * (w - 8)) | 0);
      const top = 6 + ((rand() * 14) | 0);
      ctx.fillStyle = rgb(74, 104, 40);
      ctx.fillRect(x, top, 1, h - top); // stem
      ctx.fillRect(x - 2, top + 8 + ((rand() * 4) | 0), 2, 1); // a leaf
      ctx.fillStyle = rgb(236, 232, 214);
      ctx.fillRect(x - 1, top - 1, 3, 3); // petals
      ctx.fillStyle = rgb(226, 190, 70);
      ctx.fillRect(x, top, 1, 1); // heart
    }
  });
  tex.hasAlpha = true;
  tex.wrapU = tex.wrapV = Texture.CLAMP_ADDRESSMODE;
  return cardSource("forestFlowers", scene, tex, 0.9, 0.75);
}
