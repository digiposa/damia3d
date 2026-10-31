import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

import { softDotTexture } from "./atmosphere";
import { LIGHTING_PRESETS } from "./lighting";
import { mulberry32, pixelTexture, rgb } from "./paint";
import { fromUV as kitFromUV, toUV as kitToUV } from "./kit/frame";
import { barkTexture, bushSource, fernSource, grassSource, leafTexture, rockSource, saplingSource } from "./kit/flora";
import { gradeColors, gridMesh, jitter, limb, matte, mergeSource, place } from "./kit/mesh";
import { chestProp } from "./kit/chest";
import { hash01, noise2 } from "./kit/noise";
import { Obstacles } from "./kit/obstacles";
import { GROUND_PPU } from "./kit/texels";
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

/**
 * The village past the yard below the fence runs off to the LEFT of the screen (PS1). Its layout
 * was first drafted running down the screen: {@link vil} turns a point of that draft — rotated a
 * quarter turn about the yard's exit — into its place on the map. Provisional, until each part of
 * the village is rebuilt after its own PS1 screens.
 */
const VIL_FROM = { u: -3, v: 1.5 };
const VIL_TO = { u: 0, v: -13 };
function vil(u: number, v: number): { u: number; v: number } {
  return { u: VIL_TO.u - (v - VIL_FROM.v), v: VIL_TO.v - (u - VIL_FROM.u) };
}
const vilPoint = (u: number, v: number): Vector3 => {
  const q = vil(u, v);
  return fromUV(q.u, q.v);
};

/** Story spots (u, v), for the map's script. */
export const SELES_SPOTS = {
  start: { u: -29, v: -6.9 }, // the top of the steep path, under the ledge Dart jumps from
  slideTo: { u: -22, v: -5.4 }, // where his slide down the loose earth stops
  slopeFoot: { u: -14, v: -4 },
  fence: { u: -11.5, v: -3.5 },
  // The yard below the fence (PS1 "Acquired Burn Out"): the chest by the gap, the Save Point to
  // the left, the collapsed timber house to the right, rubble along the bottom.
  battle1: { u: -8.5, v: -4.5 },
  villager: { u: -7.6, v: -1 },
  savePoint: { u: -9.4, v: -9.2 },
  chest: { u: -10.7, v: -1.6 },
  plos: vil(3, -4.5), // lying in front of the burned house
  plosHouse: vil(4, -8.5),
  commanderFrom: vil(13, 0),
  kids: vil(3.2, -9.6),
  well: vil(7, 1),
  church: vil(10, 9),
  tasman: vil(15, 4.5),
  tomb3: vil(19.6, -6.2), // the Stardust tomb: 3rd from the left, before the tree
  exitForest: vil(31, 1), // the road out past the cemetery, off the left of the screen
  fromForest: vil(28, 1),
};

const knot = (u: number, v: number, w: number): Knot => ({ ...vil(u, v), w });

const TRAILS: Knot[][] = [
  // Down the hillside, through the gap in the fence, along the dirt path to the square.
  [
    { u: -30, v: -7.2, w: 2.2 }, // the foot of the ledge Dart jumps from (no way back up)
    { u: -25, v: -6.1, w: 2.6 },
    { u: -19, v: -4.9, w: 2.8 }, // down from the north, drifting a little to the right (PS1)
    { u: -14, v: -4, w: 2.6 },
    { u: -11.5, v: -3.5, w: 2.4 }, // the gap in the fence
    { u: -9, v: -4.6, w: 4.6 }, // the yard — first fight
    { u: -6.2, v: -8.6, w: 4.2 }, // out of the yard, to the left
    knot(-3, 1.5, 4.2),
    knot(3, 0, 7.5), // the square
    knot(9, 0.5, 7.5),
    knot(15, 0.5, 6),
    knot(21, 0.5, 4),
    knot(28, 1, 3),
    knot(36, 1.5, 3), // the road out, to the Forest
  ],
  // The cemetery, under the dead tree.
  [knot(14, 0, 3.5), knot(18, -4.5, 4.5), knot(20.5, -8, 3.5)],
  // Round to the church.
  [knot(7, 3, 3.5), knot(9, 7, 3)],
];

const NET = new TrailNet(TRAILS.map((t) => t.map((k) => ({ ...k, u: -k.u }))));

/**
 * How far (u, v) lies up the hillside, past the fence line (< 0: the village side). The hill is
 * wooded and grassy; the village below is scorched earth.
 */
function hillDepth(u: number, v: number): number {
  return fenceU(v) - u + 0.6 * Math.sin(v * 0.45); // a little wavy for the grass edge
}

/** The fence along the hill's foot: rising a little to the right across the yard (PS1), level
 *  along the village to the left. */
function fenceU(v: number): number {
  return -11.5 - 0.18 * (Math.max(-12, Math.min(9, v)) + 3.5);
}

const SLOPE_H = 7; // the top of the steep path
const LEDGE_H = 10.5; // the grassy ledge above it, out of reach: Dart jumps down from it
const LEDGE_D = 19; // how far up the hill (depth) the ledge's edge stands

const smooth = (a: number, b: number, x: number): number => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * Ground height: the village is flat; behind the fence the ground climbs steeply to the clifftop
 * (PS1: a steep earth slope Dart comes down). The path is a groove worn into it, the scrub either
 * side stands on banks, and away from the path the hill breaks into rocky shoulders.
 */
function selesHeight(x: number, z: number): number {
  const { u, v } = selesUV(new Vector3(x, 0, z));
  const depth = hillDepth(u, v);
  if (depth <= 0) return 0;
  const n = NET.nearest(x, z);
  const edge = n.d - n.w;
  const rise = smooth(0, 3, depth);
  const ledge = smooth(LEDGE_D - 0.6, LEDGE_D + 0.6, depth); // a short rocky drop
  const banks = rise * (1 - ledge) * (1.4 * smooth(0.1, 2.6, edge) + 1.6 * smooth(6, 13, edge));
  return SLOPE_H * smooth(0.4, LEDGE_D - 0.5, depth) + (LEDGE_H - SLOPE_H) * ledge + banks + ledge * 0.4 * Math.sin(u * 0.8 + v * 0.6);
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

/** The Seles world, and its chest(s) (the map's script opens them). */
export interface SelesWorld extends World {
  openChest(id: string): void;
}

/** The Seles world. */
export function selesWorld(scene: Scene): SelesWorld {
  obstacles = new Obstacles();
  const rand = mulberry32(0x5e1e5);
  const root = new TransformNode("seles", scene);

  const ground = buildGround(scene, root, rand);
  const stone = stoneMaterial(scene, rand);
  const charred = matte("selesCharred", scene, undefined, new Color3(0.16, 0.11, 0.08));
  const wood = matte("selesWood", scene, undefined, new Color3(0.38, 0.27, 0.18));

  // The yard below the fence.
  buildYard(scene, root, rand, charred, wood);
  // The burned house at the centre (Plos lies in front of it; the kids hide inside).
  ruinHouse(scene, root, rand, stone, charred, SELES_SPOTS.plosHouse, 5, 4, 0.2, 3.2);
  // The stone church, roofless, its belfry half standing.
  ruinHouse(scene, root, rand, stone, charred, SELES_SPOTS.church, 7, 5, -0.15, 5.5);
  belfry(scene, root, rand, stone, vilPoint(12.5, 5.8));
  // More ruins round the square and along the path.
  ruinHouse(scene, root, rand, stone, charred, vil(0, 8), 4.5, 3.5, 0.35, 2.4);
  ruinHouse(scene, root, rand, stone, charred, vil(-1, -6), 4, 3.5, -0.3, 2.2);
  burnedWoodHouse(scene, root, rand, charred, vil(14, -10), 0.4);
  burnedWoodHouse(scene, root, rand, charred, vil(-2, 8.5), -0.2);
  burnedWoodHouse(scene, root, rand, charred, vil(22, 6), 0.1);
  burnedWoodHouse(scene, root, rand, charred, vil(9, -7), 0.9);

  buildWell(scene, root, stone, wood, selesPoint(SELES_SPOTS.well));
  buildCemetery(scene, root, rand, stone);
  buildFences(scene, root, rand, wood);
  const hill = buildHillside(scene, root, rand);
  buildDeadTrees(scene, root, rand);
  buildRubble(scene, root, rand, stone, charred);
  buildSmoke(scene, rand);
  const chestAt = selesPoint(SELES_SPOTS.chest);
  const chests = new Map([["burnOut", chestProp(scene, root, "seles_burnOut", chestAt)]]);
  obstacles.add(chestAt.x, chestAt.z, 0.6);

  obstacles.index();
  for (const m of root.getChildMeshes()) {
    m.isPickable = false;
    m.freezeWorldMatrix();
  }
  return {
    clamp: clampToSeles,
    preset: LIGHTING_PRESETS.selesRuins,
    framing: 2,
    shadowReceivers: [ground, hill],
    heightAt: selesHeight,
    ownFill: [],
    update: (_focus, dt) => chests.forEach((c) => c.tick(dt)),
    openChest: (id) => chests.get(id)?.open(),
  };
}

// --- Ground ------------------------------------------------------------------------------------

function buildGround(scene: Scene, root: TransformNode, rand: () => number): Mesh {
  // One tile of scorched earth at the standard ground density (128 px over 6.4 units = GROUND_PPU).
  const TILE = 128;
  const tex = pixelTexture("selesDirtTex", scene, TILE, TILE, (ctx, w, h) => {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const k = 0.84 + rand() * 0.22;
        ctx.fillStyle = rgb(122 * k, 92 * k, 64 * k);
        ctx.fillRect(x, y, 1, 1);
      }
    for (let i = 0; i < 520; i++) {
      const roll = rand();
      ctx.fillStyle = roll < 0.45 ? rgb(70, 52, 38) : roll < 0.8 ? rgb(150, 120, 88) : rgb(46, 40, 36); // clod, pebble, ash
      ctx.fillRect((rand() * w) | 0, (rand() * h) | 0, 1 + ((rand() * 2) | 0), 1 + ((rand() * 1.4) | 0));
    }
  });
  const tileU = TILE / GROUND_PPU;
  const ground = gridMesh("selesGround", scene, 64, 64, (i, j) => {
    const u = -40 + (72 * j) / 64;
    const v = -66 + (96 * i) / 64;
    const p = fromUV(u, v);
    return { x: p.x, y: 0, z: p.z, tu: u / tileU, tv: v / tileU };
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

// --- The yard below the fence (PS1 "Acquired Burn Out") ----------------------------------------

/**
 * The yard at the foot of the hill: open trodden earth with sticks strewn about, the Save Point's
 * column of light on the left, a timber house collapsed in on itself on the right (its roof lying
 * in one charred slab), heaps of burned debris along the bottom, a broken cart and a sack.
 */
function buildYard(scene: Scene, root: TransformNode, rand: () => number, charred: StandardMaterial, wood: StandardMaterial): void {
  const planks = planksMaterial(scene, rand);
  collapsedHouse(scene, root, rand, planks, charred, fromUV(-6.4, 3.6), -0.5);
  saveColumn(scene, root, selesPoint(SELES_SPOTS.savePoint));

  // Debris heaps along the bottom of the yard.
  for (const [u, v, s] of [[-2.4, -2.6, 1], [-2.0, 0.6, 1.3], [-2.6, 3.6, 1.1], [-1.6, 6.4, 1.2], [-3.4, 8.6, 0.9]] as const) {
    debrisHeap(scene, root, rand, planks, charred, fromUV(u, v), s);
  }
  brokenCart(scene, root, rand, wood, charred, fromUV(-3.6, -4.6));
  // A sack dropped in the flight (canvas, half spilled).
  const sackAt = fromUV(-3.3, 1.9);
  const sack = MeshBuilder.CreateCapsule("selesSack", { height: 1.1, radius: 0.32, tessellation: 8 }, scene);
  sack.rotation.set(Math.PI / 2, 0.7, 0);
  sack.scaling.set(1, 1, 0.75);
  sack.position.set(sackAt.x, 0.26, sackAt.z);
  jitter(sack, 0.05, rand);
  sack.material = matte("selesSackMat", scene, undefined, new Color3(0.34, 0.36, 0.26));
  sack.parent = root;

  // Sticks and splinters strewn over the trodden earth, a few stakes still standing.
  const stick = matte("selesStick", scene, undefined, new Color3(0.2, 0.14, 0.1));
  for (let k = 0; k < 46; k++) {
    const u = -10.2 + rand() * 6.4;
    const v = -9.5 + rand() * 10;
    if (hillDepth(u, v) > -0.3) continue;
    const p = fromUV(u, v);
    const len = 0.35 + rand() * 0.6;
    const st = MeshBuilder.CreateBox("selesStickM", { width: 0.05, height: 0.05, depth: len }, scene);
    const stake = rand() < 0.2;
    st.rotation.set(stake ? 0.9 + rand() * 0.4 : 0, rand() * Math.PI, 0);
    st.position.set(p.x, stake ? len * 0.3 : 0.03, p.z);
    st.material = stick;
    st.parent = root;
  }
}

/** Charred timber planks (roof and walls of the burned houses), embers still glowing in the cracks. */
function planksMaterial(scene: Scene, rand: () => number): StandardMaterial {
  const tex = pixelTexture("selesPlanksTex", scene, 64, 64, (ctx, w, h) => {
    for (let y = 0; y < h; y += 8) {
      const base = 0.6 + rand() * 0.5;
      for (let x = 0; x < w; x++)
        for (let r = 1; r < 8; r++) {
          const k = base * (0.8 + rand() * 0.3) * (r === 1 ? 1.25 : 1); // lit upper edge
          ctx.fillStyle = rgb(62 * k, 44 * k, 32 * k);
          ctx.fillRect(x, y + r, 1, 1);
        }
      ctx.fillStyle = rgb(14, 10, 8); // the gap between boards
      ctx.fillRect(0, y, w, 1);
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = rand() < 0.5 ? rgb(214, 96, 32) : rgb(150, 54, 20); // embers in the char
        ctx.fillRect((rand() * w) | 0, y + 1 + ((rand() * 6) | 0), 1 + ((rand() * 2) | 0), 1);
      }
    }
  });
  return matte("selesPlanks", scene, tex);
}

/**
 * A timber house collapsed in on itself: its roof down in one slab leaning on the stumps of the
 * walls, a second piece broken off, posts still standing at the corners, beams fallen across.
 */
function collapsedHouse(scene: Scene, root: TransformNode, rand: () => number, planks: StandardMaterial, charred: StandardMaterial, at: Vector3, rot: number): void {
  const node = new TransformNode("selesCollapsed", scene);
  node.parent = root;
  node.position.copyFrom(at);
  node.rotation.y = rot;
  const W = 7.5;
  const D = 5.5;
  const part = (m: Mesh): Mesh => {
    m.parent = node;
    return m;
  };
  // Wall stumps (low, broken).
  for (const [x, z, len, ry] of [[0, D / 2, W, 0], [-W / 2, 0, D, Math.PI / 2], [W / 2, 0.8, D * 0.6, Math.PI / 2]] as const) {
    const segs = Math.round(len / 0.8);
    for (let k = 0; k < segs; k++) {
      const f = (k + 0.5) / segs - 0.5;
      const hgt = 0.4 + rand() * 1.4;
      const seg = part(MeshBuilder.CreateBox("selesStump", { width: len / segs + 0.02, height: hgt, depth: 0.22 }, scene));
      seg.position.set(x + Math.cos(ry) * f * len, hgt / 2, z - Math.sin(ry) * f * len);
      seg.rotation.y = ry;
      seg.material = planks;
    }
  }
  // The roof, down in one slab: high on the back wall, its front edge on the ground.
  const roof = part(MeshBuilder.CreateBox("selesRoofSlab", { width: W * 0.95, height: 0.22, depth: D * 0.8 }, scene));
  roof.position.set(-0.4, 1.1, 0.2);
  roof.rotation.set(-0.36, 0, 0.08);
  roof.material = planks;
  // A piece broken off, tipped the other way.
  const piece = part(MeshBuilder.CreateBox("selesRoofPiece", { width: 3, height: 0.2, depth: 2.2 }, scene));
  piece.position.set(2.6, 0.7, -1.4);
  piece.rotation.set(0.3, 0.5, -0.25);
  piece.material = planks;
  // Corner posts, burned to different heights.
  for (const [x, z] of [[-W / 2, D / 2], [W / 2, D / 2], [-W / 2, -D / 2], [W / 2, -D / 2]] as const) {
    const hgt = 1 + rand() * 2.4;
    const post = part(MeshBuilder.CreateBox("selesCornerPost", { width: 0.3, height: hgt, depth: 0.3 }, scene));
    post.position.set(x, hgt / 2, z);
    post.rotation.z = (rand() - 0.5) * 0.25;
    post.material = charred;
  }
  // Beams fallen across the wreck.
  for (let k = 0; k < 5; k++) {
    const beam = part(MeshBuilder.CreateBox("selesWreckBeam", { width: 3 + rand() * 2.5, height: 0.22, depth: 0.22 }, scene));
    beam.position.set((rand() - 0.5) * W * 0.8, 0.4 + rand() * 1.2, (rand() - 0.5) * D * 0.8);
    beam.rotation.set((rand() - 0.5) * 0.4, rand() * Math.PI, (rand() - 0.5) * 0.6);
    beam.material = charred;
  }
  // Ash and splinters spread round it.
  const ash = part(MeshBuilder.CreateDisc("selesWreckAsh", { radius: 4.6, tessellation: 12 }, scene));
  ash.rotation.x = Math.PI / 2;
  ash.scaling.y = 0.8;
  ash.position.y = 0.025;
  ash.material = matte("selesWreckAshMat", scene, undefined, new Color3(0.13, 0.1, 0.08));
  obstacles.addBox(at.x, at.z, W / 2 + 0.2, D / 2 + 0.2, rot);
}

/** A heap of burned debris: charred lumps and planks sticking out of it. */
function debrisHeap(scene: Scene, root: TransformNode, rand: () => number, planks: StandardMaterial, charred: StandardMaterial, at: Vector3, s: number): void {
  for (let k = 0; k < 5; k++) {
    const lump = MeshBuilder.CreateIcoSphere("selesDebris", { radius: (0.5 + rand() * 0.5) * s, subdivisions: 1 }, scene);
    lump.scaling.y = 0.45 + rand() * 0.25;
    lump.position.set(at.x + (rand() - 0.5) * 1.6 * s, 0.1, at.z + (rand() - 0.5) * 1.6 * s);
    jitter(lump, 0.12 * s, rand);
    lump.material = charred;
    lump.parent = root;
  }
  for (let k = 0; k < 3; k++) {
    const board = MeshBuilder.CreateBox("selesDebrisBoard", { width: 0.3, height: 0.08, depth: (1.2 + rand()) * s }, scene);
    board.position.set(at.x + (rand() - 0.5) * 1.2 * s, 0.45 * s, at.z + (rand() - 0.5) * 1.2 * s);
    board.rotation.set(0.5 + rand() * 0.6, rand() * Math.PI, 0);
    board.material = planks;
    board.parent = root;
  }
  obstacles.add(at.x, at.z, 1.1 * s);
}

/** A cart tipped over in the flight: its box on its side, one wheel still on, the other leaning. */
function brokenCart(scene: Scene, root: TransformNode, rand: () => number, wood: StandardMaterial, charred: StandardMaterial, at: Vector3): void {
  const node = new TransformNode("selesCart", scene);
  node.parent = root;
  node.position.copyFrom(at);
  node.rotation.y = -Math.PI / 4 + 0.3; // shafts across the screen (pointing at the camera they read as legs)
  const box = MeshBuilder.CreateBox("selesCartBox", { width: 1.5, height: 0.7, depth: 1 }, scene);
  box.position.set(0, 0.5, 0);
  box.rotation.x = 1.25; // tipped onto its side
  box.material = wood;
  box.parent = node;
  gradeColors(box, [0.55, 0.5, 0.45], [1, 1, 1]);
  for (const s of [-1, 1]) {
    const shaft = MeshBuilder.CreateBox("selesCartShaft", { width: 1.8, height: 0.08, depth: 0.08 }, scene);
    shaft.position.set(1.4, 0.06, s * 0.35); // lying on the ground
    shaft.rotation.y = s * 0.15;
    shaft.material = wood;
    shaft.parent = node;
  }
  const wheel = (x: number, y: number, z: number, rx: number, rz: number): void => {
    const rim = MeshBuilder.CreateTorus("selesCartRim", { diameter: 1.2, thickness: 0.1, tessellation: 14 }, scene);
    rim.position.set(x, y, z);
    rim.rotation.set(rx, 0, rz);
    rim.material = charred;
    rim.parent = node;
    for (let k = 0; k < 4; k++) {
      const spoke = MeshBuilder.CreateBox("selesCartSpoke", { width: 1.1, height: 0.06, depth: 0.06 }, scene);
      spoke.position.set(x, y, z);
      spoke.rotation.set(rx, (k * Math.PI) / 4, rz);
      spoke.material = wood;
      spoke.parent = node;
    }
  };
  wheel(-0.2, 0.6, 0.6, Math.PI / 2 - 0.15, 0); // still on its axle, upright
  wheel(-1.2, 0.08, -0.6, 0.05, 0.05 + rand() * 0.1); // come off, lying flat
  obstacles.add(at.x, at.z, 1);
}

/** The Save Point: a column of pale light with a bright core, a glow on the ground, sparkles. */
function saveColumn(scene: Scene, root: TransformNode, at: Vector3): void {
  const tex = new DynamicTexture("selesSaveTex", { width: 4, height: 64 }, scene, false);
  const ctx = tex.getContext() as CanvasRenderingContext2D;
  const grad = ctx.createLinearGradient(0, 0, 0, 64);
  grad.addColorStop(0, "rgba(150,230,255,0)");
  grad.addColorStop(0.55, "rgba(170,236,255,0.7)");
  grad.addColorStop(1, "rgba(220,250,255,1)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 4, 64);
  tex.update();
  tex.hasAlpha = true;
  const mat = (name: string, alpha: number): StandardMaterial => {
    const m = new StandardMaterial(name, scene);
    m.disableLighting = true;
    m.emissiveTexture = tex;
    m.opacityTexture = tex;
    m.alpha = alpha;
    m.backFaceCulling = false;
    m.alphaMode = 1; // additive
    return m;
  };
  for (const [d, h, a] of [[1.1, 3.4, 0.45], [0.42, 3.8, 0.9]] as const) {
    const col = MeshBuilder.CreateCylinder("selesSaveColumn", { height: h, diameter: d, tessellation: 14, cap: 0 }, scene);
    col.position.set(at.x, h / 2, at.z);
    col.material = mat(`selesSaveMat${d}`, a);
    col.parent = root;
  }
  const glow = MeshBuilder.CreateDisc("selesSaveGlow", { radius: 1.3, tessellation: 20 }, scene);
  glow.rotation.x = Math.PI / 2;
  glow.position.set(at.x, 0.04, at.z);
  const gm = new StandardMaterial("selesSaveGlowMat", scene);
  gm.disableLighting = true;
  gm.emissiveColor = new Color3(0.45, 0.75, 0.9);
  gm.opacityTexture = softDotTexture(scene);
  gm.alphaMode = 1;
  glow.material = gm;
  glow.parent = root;

  const ps = new ParticleSystem("selesSaveSparkles", 40, scene);
  ps.particleTexture = softDotTexture(scene);
  ps.emitter = new Vector3(at.x, 0.2, at.z);
  ps.minEmitBox = new Vector3(-0.4, 0, -0.4);
  ps.maxEmitBox = new Vector3(0.4, 0.4, 0.4);
  ps.blendMode = ParticleSystem.BLENDMODE_ADD;
  ps.color1 = new Color4(0.7, 0.95, 1, 1);
  ps.color2 = new Color4(0.5, 0.85, 1, 1);
  ps.colorDead = new Color4(0.3, 0.6, 1, 0);
  ps.minSize = 0.06;
  ps.maxSize = 0.14;
  ps.minLifeTime = 1.2;
  ps.maxLifeTime = 2.2;
  ps.emitRate = 14;
  ps.direction1 = new Vector3(-0.1, 1.2, -0.1);
  ps.direction2 = new Vector3(0.1, 1.8, 0.1);
  ps.minEmitPower = 0.6;
  ps.maxEmitPower = 1;
  ps.gravity = new Vector3(0, 0, 0);
  ps.start();
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
    const p = vilPoint(19.6 + (rand() - 0.5) * 0.6, -8.2 + k * 1.0);
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
  deadTree(scene, root, rand, bark, vilPoint(21.5, -6.2), 1.2);
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
  for (const [u, v, s] of [[-6, 10, 1.1], [16, 9.5, 1.3], [25, -9, 1.2], [5, -14, 1.1]] as const) {
    deadTree(scene, root, rand, bark, vilPoint(u, v), s);
  }
  deadTree(scene, root, rand, bark, fromUV(-8.6, -14.5), 1); // the yard's left edge
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
  // Along the foot of the hillside: level along the village, rising across the yard to the right,
  // with the gap Dart comes through.
  run({ u: fenceU(-40), v: -40 }, { u: fenceU(-12), v: -12 });
  run({ u: fenceU(-12), v: -12 }, { u: fenceU(9), v: 9 }, 8.5 / 21);
  run({ u: fenceU(9), v: 9 }, { u: fenceU(9) - 0.4, v: 16 });
  const g0 = vil(24, -11);
  const g1 = vil(26, 9);
  run(g0, g1, 0.6); // the gate out
}

/**
 * The hillside Dart comes down (PS1: a steep earth path worn straight down between scrub, from
 * the foot of a grassy ledge to the fence): its own relief mesh, then brush, ferns and rocks either
 * side; up on the ledge (out of reach — Dart jumps down from it), tall golden grass and pines.
 * Nothing may hide the path.
 */
function buildHillside(scene: Scene, root: TransformNode, rand: () => number): Mesh {
  const U0 = -62;
  const U1 = -10;
  const V0 = -64;
  const V1 = 26;
  const STEP_M = 0.5;
  const cols = Math.round((U1 - U0) / STEP_M);
  const rows = Math.round((V1 - V0) / STEP_M);
  const hill = gridMesh("selesHill", scene, rows, cols, (i, j) => {
    const u = U0 + j * STEP_M;
    const v = V0 + i * STEP_M;
    const p = fromUV(u, v);
    return { x: p.x, y: selesHeight(p.x, p.z) + 0.03, z: p.z, tu: (u - U0) / (U1 - U0), tv: (v - V0) / (V1 - V0) };
  }, Vector3.Up());
  const mat = matte("selesHillMat", scene, paintHillside(scene, rand, U0, U1, V0, V1));
  mat.zOffset = -1;
  hill.material = mat;
  hill.parent = root;

  const bark = matte("selesBarkMat", scene, barkTexture(scene, rand));
  const leaves = matte("selesLeafMat", scene, leafTexture(scene, rand));
  leaves.diffuseColor = new Color3(0.62, 0.6, 0.42); // dusk scrub: browner than the Forest
  const sapling = saplingSource(scene, bark, leaves, rand);
  const bush = bushSource(scene, leaves, rand);
  const fern = fernSource(scene, rand);
  const grass = grassSource(scene, rand);
  const rock = rockSource(scene, rand);
  const pine = pineSource(scene, bark, rand);
  const at = (src: Mesh, x: number, z: number, s: number): void => {
    place(src, root, x, z, s, rand() * Math.PI * 2).position.y = selesHeight(x, z);
  };
  const STEP = 1.7;
  for (let gu = U0; gu < U1; gu += STEP)
    for (let gv = V0; gv < V1; gv += STEP) {
      const u = gu + (rand() - 0.5) * STEP * 0.9;
      const v = gv + (rand() - 0.5) * STEP * 0.9;
      const depth = hillDepth(u, v);
      if (depth < 0.5) continue;
      const { x, z } = fromUV(u, v);
      const near = NET.nearest(x, z);
      const edge = near.d - near.w;
      const roll = rand();
      if (depth > LEDGE_D + 1) {
        // Up on the ledge: tall grass everywhere, pines here and there (none over the path's top).
        if (roll < 0.12 && !NET.occludes(x, z, 12, 2.5)) {
          at(pine, x, z, 0.8 + rand() * 0.5);
        } else if (roll < 0.16) at(rock, x, z, 0.6 + rand() * 0.8);
        for (let k = 0; k < 3; k++) at(grass, x + (rand() - 0.5) * STEP, z + (rand() - 0.5) * STEP, 1 + rand() * 0.6);
        continue;
      }
      if (depth > LEDGE_D - 1.2) {
        if (roll < 0.5) at(rock, x, z, 0.8 + rand() * 0.9); // the ledge's broken edge
        continue;
      }
      if (edge > 0.5 && roll < 0.7 && !NET.occludes(x, z, 2.6, 1.2)) {
        // The scrub: clumps packed along the banks (knee-to-waist high at most).
        if (rand() < 0.15) at(sapling, x, z, 0.8 + rand() * 0.3);
        else at(bush, x, z, 1.1 + rand() * 0.7);
      } else if (edge > 0.3 && roll < 0.82) {
        at(rock, x, z, 0.4 + rand() * 0.6);
      }
      // Ferns and tufts everywhere off the trodden middle (walk-through).
      for (let k = 0; k < 3; k++) {
        const gx = x + (rand() - 0.5) * STEP;
        const gz = z + (rand() - 0.5) * STEP;
        const n = NET.nearest(gx, gz);
        if (n.d < n.w * 0.75) continue;
        at(rand() < 0.55 ? grass : fern, gx, gz, 0.7 + rand() * 0.5);
      }
    }
  return hill;
}

const HILL_PPU = GROUND_PPU;

/**
 * The hillside, painted pixel by pixel (PS1 reference: the steep path down to Seles). The path:
 * warm ochre earth ridged across where feet slid down it — each ridge lit on top, shadowed below —
 * with pebbles and clods, crumbling at its rim into dark crumbs. Around it, leaf litter under the
 * scrub; long shadows of the trees lying across it all; the ledge's rock drop; golden grass on top.
 * Near the fence the pixels thin out into the village ground.
 */
function paintHillside(scene: Scene, rand: () => number, U0: number, U1: number, V0: number, V1: number): DynamicTexture {
  const W = (U1 - U0) * HILL_PPU;
  const H = (V1 - V0) * HILL_PPU;
  const tex = new DynamicTexture("selesHillTex", { width: W, height: H }, scene, false, Texture.NEAREST_SAMPLINGMODE);
  tex.hasAlpha = true;
  tex.wrapU = tex.wrapV = Texture.CLAMP_ADDRESSMODE;
  const ctx = tex.getContext() as CanvasRenderingContext2D;
  const img = ctx.createImageData(W, H);
  const out = img.data;
  for (let y = 0; y < H; y++) {
    const v = V1 - (y + 0.5) / HILL_PPU; // canvas rows run from V1 down: the texture is flipped
    for (let x = 0; x < W; x++) {
      const u = U0 + (x + 0.5) / HILL_PPU;
      const o = (y * W + x) * 4;
      const depth = hillDepth(u, v);
      // Into the village ground at the fence: the pixels thin out.
      if (depth < 1.4 && rand() > clamp01((depth - 0.2) / 1.2)) continue;
      const p = fromUV(u, v);
      const n = NET.nearest(p.x, p.z);
      // A ragged path edge: noise pushes it in and out.
      const edge = n.d - n.w + (noise2(u * 1.3, v * 1.3) - 0.5) * 0.9;
      const grain = rand();
      let r: number;
      let g: number;
      let b: number;
      if (edge < -0.25) {
        // The path. Ridges across the slope: lit top, shadowed foot (sawtooth along u).
        const wob = (noise2(u * 0.6, v * 0.9) - 0.5) * 1.6 + v * 0.12;
        const ph = (u * 1.6 + wob) % 1;
        const ridge = ph < 0 ? ph + 1 : ph;
        const lit = ridge < 0.22 ? 1.18 : ridge < 0.4 ? 0.9 : 1;
        const mottle = 0.86 + 0.24 * noise2(u * 0.8 + 7, v * 0.8);
        const centre = 1.08 - 0.12 * clamp01((edge + n.w) / n.w); // the trodden middle catches the light
        const k = lit * mottle * centre * (0.93 + grain * 0.14);
        r = 176 * k;
        g = 118 * k;
        b = 78 * k;
        // Pebbles and clods a tenth of a unit across, whatever the texture's resolution.
        const speck = hash01(Math.floor(u * 10), Math.floor(v * 10));
        if (speck < 0.014) [r, g, b] = [222, 176, 128]; // pebble
        else if (speck < 0.03) [r, g, b] = [104, 66, 44]; // clod
      } else if (edge < 0.7) {
        // The crumbling rim: earth broken up by dark crumbs and the first tufts.
        const t = (edge + 0.25) / 0.95;
        const crumb = rand() < 0.25 + 0.4 * t;
        const k = 0.8 + grain * 0.2;
        if (crumb) [r, g, b] = rand() < 0.5 ? [70 * k, 52 * k, 32 * k] : [96 * k, 84 * k, 44 * k];
        else [r, g, b] = [152 * k, 102 * k, 68 * k];
      } else {
        // Under the scrub: leaf litter, in clumps, with sunlit flecks.
        const clump = noise2(u * 0.9, v * 0.9) * 0.6 + noise2(u * 3.1, v * 3.1) * 0.4;
        const k = 0.7 + 0.5 * clump;
        r = 92 * k;
        g = 82 * k;
        b = 44 * k;
        if (grain < 0.08) [r, g, b] = [146, 128, 66]; // a lit leaf
        else if (grain < 0.2) [r, g, b] = [52, 44, 26];
      }
      // The ledge: a short rock drop, then golden grass on top.
      const face = smooth(LEDGE_D - 1.2, LEDGE_D - 0.4, depth) * (1 - smooth(LEDGE_D + 0.4, LEDGE_D + 1, depth));
      const meadow = smooth(LEDGE_D + 0.4, LEDGE_D + 1, depth);
      if (face > 0.5) {
        const strata = 0.85 + 0.15 * Math.sin(depth * 9 + noise2(u, v) * 3);
        const k = strata * (0.8 + grain * 0.25);
        [r, g, b] = [128 * k, 112 * k, 92 * k];
      } else if (meadow > 0.5) {
        const k = (0.75 + 0.35 * noise2(u * 0.7, v * 0.7)) * (0.85 + grain * 0.25);
        [r, g, b] = grain < 0.1 ? [214, 186, 96] : [168 * k, 146 * k, 66 * k];
      }
      // Long tree shadows lying across the slope (the low dusk sun through the wood).
      const shade = noise2(u * 0.22 - v * 0.3 + 3, v * 0.12 + u * 0.05);
      const sh = 1 - 0.42 * smooth(0.5, 0.64, shade);
      out[o] = Math.min(255, r * sh);
      out[o + 1] = Math.min(255, g * sh);
      out[o + 2] = Math.min(255, b * sh);
      out[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  tex.update();
  return tex;
}

/** A dark pine (PS1 hilltop): a straight trunk under stacked, drooping cones. */
function pineSource(scene: Scene, bark: StandardMaterial, rand: () => number): Mesh {
  const needles = matte("selesPineMat", scene, undefined, new Color3(0.2, 0.26, 0.16));
  const parts: Mesh[] = [];
  const trunk = MeshBuilder.CreateCylinder("selesPineTrunk", { height: 9, diameterTop: 0.15, diameterBottom: 0.5, tessellation: 6 }, scene);
  trunk.position.y = 4.5;
  trunk.material = bark;
  gradeColors(trunk, [0.6, 0.57, 0.54], [1, 1, 1]);
  parts.push(trunk);
  for (let k = 0; k < 5; k++) {
    const y = 2.4 + k * 1.45;
    const r = 2.1 - k * 0.38;
    const cone = MeshBuilder.CreateCylinder("selesPineCone", { height: 2.4, diameterTop: 0, diameterBottom: r * 2, tessellation: 7 }, scene);
    cone.position.y = y + 1.2;
    jitter(cone, 0.15, rand);
    cone.material = needles;
    gradeColors(cone, [0.55, 0.55, 0.5], [1.15, 1.1, 0.9]);
    parts.push(cone);
  }
  return mergeSource("selesPine", parts, true);
}

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

/** Rubble, crates and barrels knocked about the square. */
function buildRubble(scene: Scene, root: TransformNode, rand: () => number, stone: StandardMaterial, charred: StandardMaterial): void {
  for (let k = 0; k < 40; k++) {
    const p = vilPoint(-2 + rand() * 26, -12 + rand() * 24);
    const n = NET.nearest(p.x, p.z);
    if (n.d < n.w - 1.5) continue; // keep the way clear
    const r = MeshBuilder.CreateIcoSphere("selesRubble", { radius: 0.2 + rand() * 0.35, subdivisions: 1 }, scene);
    r.scaling.y = 0.6;
    r.position.set(p.x, 0.1, p.z);
    r.material = rand() < 0.7 ? stone : charred;
    r.parent = root;
  }
  const barrel = matte("selesBarrel", scene, undefined, new Color3(0.32, 0.22, 0.14));
  for (const [u, v] of [[1, 5.6], [12, -4.8], [17, 4.6]] as const) {
    const p = vilPoint(u, v);
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
  const spots = [[4, -8.5], [10, 9], [-2, 8.5], [14, -10], [0, 8]].map(([u, v]) => vilPoint(u, v));
  spots.push(fromUV(-6.4, 3.6)); // the yard's collapsed house
  for (const at of spots) {
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
