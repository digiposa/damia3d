import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

import { softDotTexture } from "./atmosphere";
import { LIGHTING_PRESETS } from "./lighting";
import { mulberry32, pixelTexture, rgb } from "./paint";
import { TAN_BETA, fromUV as kitFromUV, toUV as kitToUV } from "./kit/frame";
import { barkTexture, bushSource, fernSource, grassSource, leafTexture, rockSource, saplingSource, treeSource } from "./kit/flora";
import { gradeColors, gridMesh, jitter, limb, matte, place } from "./kit/mesh";
import { Obstacles } from "./kit/obstacles";
import { TrailNet, type Knot } from "./kit/trails";
import type { World } from "./World";

/**
 * Seles in ruins — Dart's home village the evening after the raid (canon:
 * docs/damia2D/features/locations/Seles.md). Built in code with the map kit, laid out after the
 * PS1 screens: the wooded hillside Dart comes down from the top of the screen (the road back to
 * the Forest), the fence and the dirt path where the first knights wait, the village square with
 * its well, the burned house at the centre where Plos lies, the stone church in ruins, the
 * cemetery under a dead tree. Sepia dusk, smoke still rising.
 *
 * Authored in a mirrored iso frame: u runs DOWN the screen (the hillside at low u is at the top),
 * v sideways. {@link fromUV} / {@link selesUV} do the flip.
 */

function fromUV(u: number, v: number): Vector3 {
  return kitFromUV(-u, v);
}

/** Story spots (u, v), for the map's script. */
export const SELES_SPOTS = {
  start: { u: -21, v: -13.5 }, // up the hillside (top of the screen)
  slopeFoot: { u: -14, v: -8 },
  fence: { u: -11.5, v: -3.5 },
  battle1: { u: -8, v: 1 }, // the dirt path past the fence
  villager: { u: -6.5, v: 3.2 },
  savePoint: { u: -10, v: 3.5 },
  chest: { u: -11, v: 5.2 },
  plos: { u: 3, v: -4.5 }, // lying in front of the burned house
  plosHouse: { u: 4, v: -8.5 },
  commanderFrom: { u: 13, v: 0 },
  kids: { u: 3.2, v: -9.6 },
  well: { u: 7, v: 1 },
  church: { u: 10, v: 9 },
  tasman: { u: 15, v: 4.5 },
  tomb3: { u: 19.6, v: -6.2 }, // the Stardust tomb: 3rd from the left, before the tree
  exitForest: { u: -27, v: -16.5 }, // back up the hillside, off the top of the screen
  fromForest: { u: -22, v: -14 },
};

const TRAILS: Knot[][] = [
  // Down the hillside, through the gap in the fence, along the dirt path to the square.
  [
    { u: -34, v: -20, w: 2.2 }, // off the top of the screen: the road to the Forest
    { u: -27, v: -16.5, w: 2.4 },
    { u: -22, v: -14, w: 2.4 },
    { u: -17, v: -11, w: 2.6 },
    { u: -13.5, v: -7.5, w: 2.8 },
    { u: -11.5, v: -3.5, w: 2.4 }, // the gap in the fence
    { u: -8.5, v: 1, w: 4.2 }, // the dirt path — first fight
    { u: -3, v: 1.5, w: 4.2 },
    { u: 3, v: 0, w: 7.5 }, // the square
    { u: 9, v: 0.5, w: 7.5 },
    { u: 15, v: 0.5, w: 6 },
    { u: 20, v: 0.5, w: 4 },
  ],
  // The cemetery, under the dead tree.
  [{ u: 14, v: 0, w: 3.5 }, { u: 18, v: -4.5, w: 4.5 }, { u: 20.5, v: -8, w: 3.5 }],
  // Round to the church.
  [{ u: 7, v: 3, w: 3.5 }, { u: 9, v: 7, w: 3 }],
];

const NET = new TrailNet(TRAILS.map((t) => t.map((k) => ({ ...k, u: -k.u }))));

/**
 * How far (u, v) lies up the hillside, past the fence line (< 0: the village side). The hill is
 * wooded and grassy; the village below is scorched earth.
 */
function hillDepth(u: number, v: number): number {
  // The fence runs straight across the screen at u = -11.5 (a little wavy for the grass edge).
  return -11.5 - u + 0.6 * Math.sin(v * 0.45);
}

/** Where you can walk: the trails, a little give either side. */
let obstacles = new Obstacles();
function clampToSeles(p: Vector3, margin = 0.4): void {
  const n = NET.nearest(p.x, p.z);
  const max = n.w - margin;
  if (n.d > max) {
    const k = max / n.d;
    p.x = n.px + (p.x - n.px) * k;
    p.z = n.pz + (p.z - n.pz) * k;
  }
  obstacles.pushOut(p, margin);
}

export function selesPoint(spot: { u: number; v: number }): Vector3 {
  return fromUV(spot.u, spot.v);
}

/** The Seles world. */
export function selesWorld(scene: Scene): World {
  obstacles = new Obstacles();
  const rand = mulberry32(0x5e1e5);
  const root = new TransformNode("seles", scene);

  const ground = buildGround(scene, root, rand);
  const stone = stoneMaterial(scene, rand);
  const charred = matte("selesCharred", scene, undefined, new Color3(0.16, 0.11, 0.08));
  const wood = matte("selesWood", scene, undefined, new Color3(0.38, 0.27, 0.18));

  // The burned house at the centre (Plos lies in front of it; the kids hide inside).
  ruinHouse(scene, root, rand, stone, charred, SELES_SPOTS.plosHouse, 5, 4, 0.2, 3.2);
  // The stone church, roofless, its belfry half standing.
  ruinHouse(scene, root, rand, stone, charred, SELES_SPOTS.church, 7, 5, -0.15, 5.5);
  belfry(scene, root, rand, stone, fromUV(SELES_SPOTS.church.u + 2.5, SELES_SPOTS.church.v + 3.2));
  // More ruins round the square and along the path.
  ruinHouse(scene, root, rand, stone, charred, { u: 0, v: 8 }, 4.5, 3.5, 0.35, 2.4);
  ruinHouse(scene, root, rand, stone, charred, { u: -4, v: -6 }, 4, 3.5, -0.3, 2.2);
  burnedWoodHouse(scene, root, rand, charred, { u: 14, v: -10 }, 0.4);
  burnedWoodHouse(scene, root, rand, charred, { u: -2, v: 8.5 }, -0.2);
  burnedWoodHouse(scene, root, rand, charred, { u: 22, v: 6 }, 0.1);
  burnedWoodHouse(scene, root, rand, charred, { u: 9, v: -7 }, 0.9);

  buildWell(scene, root, stone, wood, selesPoint(SELES_SPOTS.well));
  buildCemetery(scene, root, rand, stone);
  buildFences(scene, root, rand, wood);
  buildHillside(scene, root, rand);
  buildDeadTrees(scene, root, rand);
  buildRubble(scene, root, rand, stone, charred);
  buildSmoke(scene, rand);

  obstacles.index();
  for (const m of root.getChildMeshes()) {
    m.isPickable = false;
    m.freezeWorldMatrix();
  }
  return {
    clamp: clampToSeles,
    preset: LIGHTING_PRESETS.selesRuins,
    framing: 2,
    shadowReceivers: [ground],
    ownFill: [],
  };
}

// --- Ground ------------------------------------------------------------------------------------

function buildGround(scene: Scene, root: TransformNode, rand: () => number): Mesh {
  const tex = pixelTexture("selesDirtTex", scene, 128, 128, (ctx, w, h) => {
    for (let y = 0; y < h; y += 2)
      for (let x = 0; x < w; x += 2) {
        const k = 0.8 + rand() * 0.3;
        ctx.fillStyle = rgb(122 * k, 92 * k, 64 * k);
        ctx.fillRect(x, y, 2, 2);
      }
    for (let i = 0; i < 160; i++) {
      ctx.fillStyle = rand() < 0.5 ? rgb(70, 52, 38) : rgb(150, 120, 88);
      ctx.fillRect((rand() * w) | 0, (rand() * h) | 0, 1 + ((rand() * 2) | 0), 1);
    }
  });
  tex.uScale = tex.vScale = 12;
  const ground = gridMesh("selesGround", scene, 60, 60, (i, j) => {
    const u = -40 + (90 * j) / 60;
    const v = -40 + (80 * i) / 60;
    const p = fromUV(u, v);
    return { x: p.x, y: 0, z: p.z, tu: u / 7.5, tv: v / 7.5 };
  }, Vector3.Up());
  ground.material = matte("selesGroundMat", scene, tex);
  ground.parent = root;
  // Scorch: darker where the fire raged, the trails a little lighter (trodden), all fading out.
  const pos = ground.getVerticesData("position")!;
  const col: number[] = [];
  for (let k = 0; k < pos.length; k += 3) {
    const n = NET.nearest(pos[k], pos[k + 2]);
    const scorch = 0.5 + 0.5 * Math.sin(pos[k] * 0.31 + Math.cos(pos[k + 2] * 0.27) * 2);
    const { u, v } = selesUV(new Vector3(pos[k], 0, pos[k + 2]));
    // Grass up the hillside (the trodden path stays bare), scorched earth below.
    const grass = clamp01((hillDepth(u, v) + 0.4) / 2.2) * clamp01((n.d - n.w * 0.6) / 1.6);
    let c = 0.75 + 0.2 * (1 - grass) * scorch;
    if (n.d < n.w) c += 0.1;
    if (grass === 0) c *= 1 - Math.min(0.6, Math.max(0, (n.d - n.w - 4) / 18));
    const g = grass * (0.85 + 0.25 * scorch);
    col.push(c * (1 - 0.45 * g), c * (0.95 + 0.05 * g), c * (0.88 - 0.45 * g), 1);
  }
  ground.setVerticesData("color", col);
  return ground;
}

function stoneMaterial(scene: Scene, rand: () => number): StandardMaterial {
  const tex = pixelTexture("selesStoneTex", scene, 64, 64, (ctx, w, h) => {
    // Rough courses of grey-brown stone, soot-blackened towards the top.
    for (let y = 0; y < h; y += 8) {
      const off = (y / 8) % 2 ? 6 : 0;
      for (let x = -off; x < w; x += 12) {
        const k = 0.75 + rand() * 0.3;
        const soot = 1 - (1 - y / h) * 0.45;
        ctx.fillStyle = rgb(128 * k * soot, 112 * k * soot, 94 * k * soot);
        ctx.fillRect(x + 1, y + 1, 11, 7);
      }
      ctx.fillStyle = rgb(48, 40, 34);
      ctx.fillRect(0, y, w, 1);
    }
  });
  return matte("selesStone", scene, tex);
}

// --- Buildings ---------------------------------------------------------------------------------

/**
 * A roofless stone house: four walls with jagged, broken tops (the fire and the artillery), a
 * doorway on the side facing the camera, a couple of charred beams across. Solid.
 */
function ruinHouse(
  scene: Scene,
  root: TransformNode,
  rand: () => number,
  stone: StandardMaterial,
  charred: StandardMaterial,
  spot: { u: number; v: number },
  w: number,
  d: number,
  rot: number,
  height: number,
): void {
  const node = new TransformNode("selesRuin", scene);
  node.parent = root;
  const at = fromUV(spot.u, spot.v);
  node.position.copyFrom(at);
  node.rotation.y = Math.atan2(-1, 1) + rot; // square to the iso frame, then turned a little
  const T = 0.4;
  const wall = (name: string, len: number, x: number, z: number, ry: number, door: boolean): void => {
    // In segments, each its own height: a broken top.
    const segs = Math.max(3, Math.round(len / 0.9));
    for (let k = 0; k < segs; k++) {
      const f = (k + 0.5) / segs - 0.5;
      if (door && Math.abs(f) < 0.14) continue; // the doorway
      const hgt = height * (0.45 + rand() * 0.55);
      const seg = MeshBuilder.CreateBox(`${name}${k}`, { width: len / segs + 0.02, height: hgt, depth: T }, scene);
      seg.position.set(x + Math.cos(ry) * f * len, hgt / 2, z - Math.sin(ry) * f * len);
      seg.rotation.y = ry;
      seg.material = stone;
      seg.parent = node;
    }
  };
  wall("selesWallS", w, 0, -d / 2, 0, true);
  wall("selesWallN", w, 0, d / 2, 0, false);
  wall("selesWallW", d, -w / 2, 0, Math.PI / 2, false);
  wall("selesWallE", d, w / 2, 0, Math.PI / 2, rand() < 0.5);
  for (let k = 0; k < 2; k++) {
    const beam = MeshBuilder.CreateBox("selesBeam", { width: w * 0.9, height: 0.22, depth: 0.22 }, scene);
    beam.position.set((rand() - 0.5) * 0.6, height * (0.35 + rand() * 0.3), (k - 0.5) * d * 0.5);
    beam.rotation.z = (rand() - 0.5) * 0.6;
    beam.material = charred;
    beam.parent = node;
  }
  obstacles.addBox(at.x, at.z, w / 2 + 0.2, d / 2 + 0.2, node.rotation.y);
}

/** The church's broken belfry: a taller stone stump with an empty arch. */
function belfry(scene: Scene, root: TransformNode, rand: () => number, stone: StandardMaterial, at: Vector3): void {
  const tower = MeshBuilder.CreateBox("selesBelfry", { width: 2, height: 7.5, depth: 2 }, scene);
  tower.position.set(at.x, 3.75, at.z);
  tower.rotation.y = Math.atan2(-1, 1);
  jitter(tower, 0.08, rand);
  tower.material = stone;
  tower.parent = root;
  obstacles.add(at.x, at.z, 1.5);
}

/** A burned timber house: a few blackened posts and fallen beams, ash and rubble between. */
function burnedWoodHouse(scene: Scene, root: TransformNode, rand: () => number, charred: StandardMaterial, spot: { u: number; v: number }, rot: number): void {
  const at = fromUV(spot.u, spot.v);
  const node = new TransformNode("selesBurned", scene);
  node.parent = root;
  node.position.copyFrom(at);
  node.rotation.y = rot;
  for (const [x, z] of [[-1.8, -1.4], [1.8, -1.4], [-1.8, 1.4], [1.8, 1.4], [0, 1.4]] as const) {
    const h = 1.2 + rand() * 2.2;
    const post = MeshBuilder.CreateBox("selesPost", { width: 0.28, height: h, depth: 0.28 }, scene);
    post.position.set(x, h / 2, z);
    post.rotation.z = (rand() - 0.5) * 0.3;
    post.material = charred;
    post.parent = node;
  }
  for (let k = 0; k < 3; k++) {
    const beam = MeshBuilder.CreateBox("selesFallenBeam", { width: 3.6, height: 0.24, depth: 0.24 }, scene);
    beam.position.set((rand() - 0.5) * 1.5, 0.2 + rand() * 0.9, (rand() - 0.5) * 2);
    beam.rotation.set(0, rand() * Math.PI, (rand() - 0.5) * 0.7);
    beam.material = charred;
    beam.parent = node;
  }
  const ash = MeshBuilder.CreateDisc("selesAsh", { radius: 2.6, tessellation: 10 }, scene);
  ash.rotation.x = Math.PI / 2;
  ash.position.y = 0.03;
  ash.material = matte("selesAshMat", scene, undefined, new Color3(0.12, 0.1, 0.09));
  ash.parent = node;
  obstacles.addBox(at.x, at.z, 2.1, 1.7, rot);
}

/** The village well: a stone ring, a little roof frame and its bucket. */
function buildWell(scene: Scene, root: TransformNode, stone: StandardMaterial, wood: StandardMaterial, at: Vector3): void {
  const ring = MeshBuilder.CreateCylinder("selesWell", { height: 0.9, diameter: 1.8, tessellation: 14 }, scene);
  ring.position.set(at.x, 0.45, at.z);
  ring.material = stone;
  ring.parent = root;
  const water = MeshBuilder.CreateDisc("selesWellHole", { radius: 0.7, tessellation: 14 }, scene);
  water.rotation.x = Math.PI / 2;
  water.position.set(at.x, 0.88, at.z);
  water.material = matte("selesWellDark", scene, undefined, new Color3(0.03, 0.03, 0.04));
  water.parent = root;
  for (const s of [-1, 1]) {
    const post = MeshBuilder.CreateBox("selesWellPost", { width: 0.14, height: 2, depth: 0.14 }, scene);
    post.position.set(at.x + s * 0.8, 1, at.z);
    post.material = wood;
    post.parent = root;
  }
  const bar = MeshBuilder.CreateCylinder("selesWellBar", { height: 1.7, diameter: 0.1, tessellation: 6 }, scene);
  bar.rotation.z = Math.PI / 2;
  bar.position.set(at.x, 1.85, at.z);
  bar.material = wood;
  bar.parent = root;
  obstacles.add(at.x, at.z, 1.1);
}

/** The cemetery: a row of rounded tombstones under a dead tree. */
function buildCemetery(scene: Scene, root: TransformNode, rand: () => number, stone: StandardMaterial): void {
  for (let k = 0; k < 5; k++) {
    const p = fromUV(19.6 + (rand() - 0.5) * 0.6, -8.2 + k * 1.0);
    const tomb = MeshBuilder.CreateCapsule("selesTomb", { height: 1.2, radius: 0.32, tessellation: 10 }, scene);
    tomb.scaling.z = 0.35;
    tomb.position.set(p.x, 0.45, p.z);
    tomb.rotation.y = Math.atan2(-1, 1) + (rand() - 0.5) * 0.2;
    tomb.rotation.z = (rand() - 0.5) * 0.15;
    tomb.material = stone;
    tomb.parent = root;
    obstacles.add(p.x, p.z, 0.35);
  }
  // The dead tree behind them (the Stardust tomb is "directly in front of the tree").
  const bark = matte("selesDeadBark", scene, undefined, new Color3(0.24, 0.18, 0.14));
  deadTree(scene, root, rand, bark, fromUV(21.5, -6.2), 1.2);
}

function deadTree(scene: Scene, root: TransformNode, rand: () => number, bark: StandardMaterial, at: Vector3, s: number): void {
  const trunkPts = [0, 1, 2].map((k) => new Vector3(at.x + (rand() - 0.5) * 0.4 * k, k * 1.8 * s, at.z + (rand() - 0.5) * 0.4 * k));
  const trunk = limb("selesDeadTrunk", scene, trunkPts, 0.35 * s, 0.14 * s, rand);
  trunk.material = bark;
  trunk.parent = root;
  for (let k = 0; k < 5; k++) {
    const from = trunkPts[1 + (k % 2)];
    const a = rand() * Math.PI * 2;
    const len = (1.4 + rand() * 1.6) * s;
    const pts = [0, 0.5, 1].map((f) => new Vector3(from.x + Math.cos(a) * len * f, from.y + len * 0.6 * f + 0.4 * Math.sin(f * 3), from.z + Math.sin(a) * len * f));
    const br = limb("selesDeadBranch", scene, pts, 0.12 * s, 0.02, rand);
    br.material = bark;
    br.parent = root;
  }
  obstacles.add(at.x, at.z, 0.5 * s);
}

function buildDeadTrees(scene: Scene, root: TransformNode, rand: () => number): void {
  const bark = matte("selesDeadBark2", scene, undefined, new Color3(0.22, 0.16, 0.12));
  for (const [u, v, s] of [[-6, 10, 1.1], [16, 11, 1.3], [-8, -14, 1], [25, -9, 1.2], [5, -14, 1.1]] as const) {
    deadTree(scene, root, rand, bark, fromUV(u, v), s);
  }
}

/** Split-rail fences: along the slope's foot (the gap Dart takes) and round the square. */
function buildFences(scene: Scene, root: TransformNode, rand: () => number, wood: StandardMaterial): void {
  const run = (from: { u: number; v: number }, to: { u: number; v: number }, gapAt?: number): void => {
    const a = fromUV(from.u, from.v);
    const b = fromUV(to.u, to.v);
    const len = Vector3.Distance(a, b);
    const n = Math.max(2, Math.round(len / 1.6));
    const gapHalf = 1.5 / len;
    for (let k = 0; k <= n; k++) {
      const f = k / n;
      if (gapAt !== undefined && Math.abs(f - gapAt) < gapHalf) continue;
      const p = Vector3.Lerp(a, b, f);
      const post = MeshBuilder.CreateBox("selesFencePost", { width: 0.14, height: 1.1, depth: 0.14 }, scene);
      post.position.set(p.x, 0.55, p.z);
      post.rotation.z = (rand() - 0.5) * 0.2;
      post.material = wood;
      post.parent = root;
      if (k < n && !(gapAt !== undefined && Math.abs((k + 0.5) / n - gapAt) < gapHalf) && rand() > 0.15) {
        const q = Vector3.Lerp(a, b, (k + 0.5) / n);
        for (const y of [0.45, 0.85]) {
          const rail = MeshBuilder.CreateBox("selesFenceRail", { width: len / n, height: 0.08, depth: 0.08 }, scene);
          rail.position.set(q.x, y, q.z);
          rail.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x);
          rail.material = wood;
          rail.parent = root;
        }
      }
    }
  };
  // Across the foot of the hillside, with the gap Dart comes through.
  run({ u: -11.5, v: -24 }, { u: -11.5, v: 10 }, 20.5 / 34);
  run({ u: -4, v: 12 }, { u: 12, v: 13 });
}

/**
 * The hillside Dart comes down (PS1: a dirt path through the wood, down to the fence): grass,
 * trees either side of the path, bushes and ferns at its verges. No crown may hide the path.
 */
function buildHillside(scene: Scene, root: TransformNode, rand: () => number): void {
  const bark = matte("selesBarkMat", scene, barkTexture(scene, rand));
  const leaves = matte("selesLeafMat", scene, leafTexture(scene, rand));
  const trees = [0, 1, 2].map((i) => treeSource(i, scene, bark, leaves, rand));
  const sapling = saplingSource(scene, bark, leaves, rand);
  const bush = bushSource(scene, leaves, rand);
  const fern = fernSource(scene, rand);
  const grass = grassSource(scene, rand);
  const rock = rockSource(scene, rand);
  const STEP = 2.8;
  for (let gu = -44; gu < -2; gu += STEP)
    for (let gv = -34; gv < 16; gv += STEP) {
      const u = gu + (rand() - 0.5) * STEP * 0.9;
      const v = gv + (rand() - 0.5) * STEP * 0.9;
      const depth = hillDepth(u, v);
      if (depth < 0.6) continue;
      const { x, z } = fromUV(u, v);
      const near = NET.nearest(x, z);
      const edge = near.d - near.w;
      const rot = rand() * Math.PI * 2;
      const roll = rand();
      if (depth > 2.5 && edge > 1.2 && roll < 0.7 && !NET.occludes(x, z, 15, 4.4, 9 * TAN_BETA - 4.4)) {
        const s = 0.8 + rand() * 0.35;
        place(trees[(rand() * trees.length) | 0], root, x, z, s, rot);
        obstacles.add(x, z, 0.75 * s);
      } else if (edge > 0.6 && roll < 0.8 && !NET.occludes(x, z, 2.2, 1)) {
        const s = 0.8 + rand() * 0.4;
        if (rand() < 0.4) place(sapling, root, x, z, s, rot);
        else place(bush, root, x, z, 1.1 + rand() * 0.6, rot);
        obstacles.add(x, z, 0.4 * s);
      } else if (edge > 0.2 && roll < 0.9) {
        place(rock, root, x, z, 0.5 + rand() * 0.5, rot);
      }
      // Grass and ferns everywhere on the hill, the path's verges included (walk-through).
      for (let k = 0; k < 2; k++) {
        const gx = x + (rand() - 0.5) * STEP;
        const gz = z + (rand() - 0.5) * STEP;
        const n = NET.nearest(gx, gz);
        if (n.d < n.w * 0.7) continue;
        place(rand() < 0.6 ? grass : fern, root, gx, gz, 0.7 + rand() * 0.5, rand() * Math.PI);
      }
    }
}

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

/** Rubble, crates and barrels knocked about the square. */
function buildRubble(scene: Scene, root: TransformNode, rand: () => number, stone: StandardMaterial, charred: StandardMaterial): void {
  for (let k = 0; k < 40; k++) {
    const u = -12 + rand() * 36;
    const v = -12 + rand() * 24;
    const p = fromUV(u, v);
    const n = NET.nearest(p.x, p.z);
    if (n.d < n.w - 1.5) continue; // keep the way clear
    const r = MeshBuilder.CreateIcoSphere("selesRubble", { radius: 0.2 + rand() * 0.35, subdivisions: 1 }, scene);
    r.scaling.y = 0.6;
    r.position.set(p.x, 0.1, p.z);
    r.material = rand() < 0.7 ? stone : charred;
    r.parent = root;
  }
  const barrel = matte("selesBarrel", scene, undefined, new Color3(0.32, 0.22, 0.14));
  for (const [u, v] of [[-7, 5.5], [1, 5.6], [12, -4.8], [17, 4.6]] as const) {
    const p = fromUV(u, v);
    const b = MeshBuilder.CreateCylinder("selesBarrelM", { height: 0.9, diameter: 0.7, tessellation: 10 }, scene);
    b.position.set(p.x, 0.45, p.z);
    b.material = barrel;
    b.parent = root;
    gradeColors(b, [0.6, 0.6, 0.6], [1, 1, 1]);
    obstacles.add(p.x, p.z, 0.45);
  }
}

/** Smoke still rising from the ruins, and embers drifting up. */
function buildSmoke(scene: Scene, rand: () => number): void {
  const dot = softDotTexture(scene);
  for (const [u, v] of [[4, -8.5], [10, 9], [-2, 8.5], [14, -10], [0, 8]] as const) {
    const at = fromUV(u, v);
    const ps = new ParticleSystem("selesSmoke", 60, scene);
    ps.particleTexture = dot;
    ps.emitter = new Vector3(at.x, 1.5, at.z);
    ps.minEmitBox = new Vector3(-1, 0, -1);
    ps.maxEmitBox = new Vector3(1, 0.5, 1);
    ps.blendMode = ParticleSystem.BLENDMODE_STANDARD;
    ps.color1 = new Color4(0.24, 0.21, 0.19, 0.4);
    ps.color2 = new Color4(0.32, 0.28, 0.25, 0.3);
    ps.colorDead = new Color4(0.3, 0.27, 0.25, 0);
    ps.minSize = 1.2;
    ps.maxSize = 2.6;
    ps.minLifeTime = 4;
    ps.maxLifeTime = 7;
    ps.emitRate = 6 + rand() * 4;
    ps.gravity = new Vector3(0.15, 0.35, 0.1);
    ps.direction1 = new Vector3(-0.1, 0.5, -0.1);
    ps.direction2 = new Vector3(0.1, 0.8, 0.1);
    ps.minEmitPower = 0.3;
    ps.maxEmitPower = 0.6;
    ps.updateSpeed = 0.02;
    ps.preWarmCycles = 200;
    ps.start();

    const embers = new ParticleSystem("selesEmbers", 20, scene);
    embers.particleTexture = dot;
    embers.emitter = new Vector3(at.x, 0.4, at.z);
    embers.minEmitBox = new Vector3(-1.2, 0, -1.2);
    embers.maxEmitBox = new Vector3(1.2, 0.3, 1.2);
    embers.blendMode = ParticleSystem.BLENDMODE_ADD;
    embers.color1 = new Color4(1, 0.55, 0.2, 1);
    embers.color2 = new Color4(1, 0.35, 0.1, 1);
    embers.colorDead = new Color4(0.4, 0.1, 0, 0);
    embers.minSize = 0.05;
    embers.maxSize = 0.12;
    embers.minLifeTime = 1.5;
    embers.maxLifeTime = 3;
    embers.emitRate = 4;
    embers.gravity = new Vector3(0, 0.6, 0);
    embers.direction1 = new Vector3(-0.2, 0.6, -0.2);
    embers.direction2 = new Vector3(0.2, 1, 0.2);
    embers.minEmitPower = 0.2;
    embers.maxEmitPower = 0.5;
    embers.updateSpeed = 0.02;
    embers.start();
  }
}

/** Local (u, v) of a world point. */
export function selesUV(p: Vector3): { u: number; v: number } {
  const { u, v } = kitToUV(p.x, p.z);
  return { u: -u, v };
}
