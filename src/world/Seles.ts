import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector3, Vector4 } from "@babylonjs/core/Maths/math.vector";
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
 * cemetery under a dead tree. The morning after the raid: pale sun, smoke hanging over it all.
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

/** Per-frame upkeep of an animated prop (a flickering fire, a crow that takes off as Dart nears). */
type Tick = (dt: number, focus: Vector3) => void;

/** Story spots (u, v), for the map's script. */
export const SELES_SPOTS = {
  start: { u: -26, v: -6.3 }, // the top of the steep path, below the ledge Dart jumps from (clear of its lip: the third-person camera must see him)
  slideTo: { u: -22, v: -5.4 }, // where his slide down the loose earth stops
  slopeFoot: { u: -14, v: -4 },
  fence: { u: -11.5, v: -3.5 },
  // The yard below the fence (PS1 "Acquired Burn Out"): the chest by the gap, the Save Point to
  // the left, the collapsed timber house to the right, rubble along the bottom.
  battle1: { u: -6, v: -1 },
  villager: { u: -3.7, v: 1.4 }, // dying, on the right, in front of the debris (the knights over him)
  woman: { u: -2.5, v: -6.4 }, // dead, on the left a little lower, by the overturned cart
  savePoint: { u: -9.4, v: -9.2 },
  chest: { u: -10.7, v: -1.6 },
  // The ruined chapel (PS1: Plos lies before it, then the Commander comes): its front faces the
  // camera, the square's path running past it.
  chapel: { u: -5, v: -23 },
  plos: { u: -1.3, v: -23.4 }, // lying in front of the chapel
  plosHouse: { u: -2, v: -21 }, // the chapel's door (where he gets up to)
  burnedHouse: { u: 13.4, v: -20 }, // a gutted house below the square (the kids hide in it)
  commanderFrom: { u: 0.5, v: -31.5 }, // from the square, left of the chapel
  kids: { u: 12.4, v: -21.6 },
  well: { u: -0.5, v: -34.12 }, // in the middle of the square
  church: { u: -5, v: -23 }, // the chapel
  tasman: { u: -2.6, v: -29.55 },
  // The square left of the chapel (PS1): the well in the middle, the cemetery up on the left, the
  // road out going up the screen between the cemetery and the chapel.
  square: { u: -0.5, v: -33.75 },
  cemetery: { u: -14, v: -36.38 }, // above the square
  tomb3: { u: -14.4, v: -35.7 }, // the Stardust tomb: 3rd from the left, before the tree
  doll: { u: -5.6, v: -38.4 }, // by the overturned table: a rag doll, half burnt
  laundry: { u: 2.6, v: -39.6 }, // the washing line below the square
  exitForest: { u: -22, v: -30.15 }, // the road out, at the top of the screen
  fromForest: { u: -17, v: -30.0 },
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
    { u: 0.8, v: -18, w: 5.2 }, // past the chapel's front (Plos)
    { u: 0.4, v: -26, w: 5.6 },
    { u: -0.5, v: -31.5, w: 6.6 }, // the square
    { u: -0.5, v: -36.0, w: 6.6 },
    { u: 0.5, v: -39.75, w: 5.4 },
  ],
  // Up from the square to the cemetery above it.
  [{ u: -3, v: -35.25, w: 4.4 }, { u: -9, v: -36.0, w: 4.6 }, { u: -14, v: -36.38, w: 4.6 }],
  // The road out: up the screen between the cemetery and the chapel, off the top into the hills.
  [{ u: -3, v: -30.15, w: 3 }, { u: -10, v: -30.0, w: 2.8 }, { u: -17, v: -30.0, w: 2.6 }, { u: -24, v: -30.45, w: 2.4 }, { u: -36, v: -31.05, w: 2.2 }],
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
  // Left of the chapel the hill falls back up the screen: the village goes on upwards there (the
  // square, then the cemetery above it, then the road out at the top).
  const back = smooth(26, 30, -v);
  return -11.5 - 0.18 * (Math.max(-12, Math.min(9, v)) + 3.5) - 40 * back;
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
  if (depth <= 0 || v < -30) return 0;
  return (1 - smooth(25, 30, -v)) * hillHeight(x, z, u, v, depth); // left of the chapel it is all flat
}

function hillHeight(x: number, z: number, u: number, v: number, depth: number): number {
  const n = NET.nearest(x, z);
  const edge = n.d - n.w;
  const rise = smooth(0, 3, depth);
  const ledge = smooth(LEDGE_D - 0.6, LEDGE_D + 0.6, depth); // a short rocky drop
  const banks = rise * (1 - ledge) * (1.4 * smooth(0.1, 2.6, edge) + 1.6 * smooth(6, 13, edge));
  return SLOPE_H * smooth(0.4, LEDGE_D - 0.5, depth) + (LEDGE_H - SLOPE_H) * ledge + banks + ledge * 0.4 * Math.sin(u * 0.8 + v * 0.6);
}

/** The village's open ground (flat): walkable anywhere between its edges, round the ruins. */
const VILLAGE = { u0: -18.2, u1: 9, v0: -42.45, v1: 8 };

/** Where you can walk: anywhere on the village's flat ground; on the hill, the trails only. */
let obstacles = new Obstacles();
function clampToSeles(p: Vector3, margin = 0.4): void {
  const n = NET.nearest(p.x, p.z);
  const max = n.w - margin;
  if (n.d > max) {
    const { u, v } = selesUV(p);
    const cv = Math.min(VILLAGE.v1, Math.max(VILLAGE.v0, v));
    // The hill's foot (the fence) bounds the village up the screen.
    const top = Math.max(VILLAGE.u0, fenceU(cv) + 0.6 * Math.sin(cv * 0.45) + margin + 0.3);
    const cu = Math.min(VILLAGE.u1, Math.max(top, u));
    if (top < VILLAGE.u1 && hillDepth(u, v) < 0.3) { // up on the hill: back to its path instead
      const q = fromUV(cu, cv);
      p.x = q.x;
      p.z = q.z;
      obstacles.pushOut(p, margin);
      return;
    }
  }
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
  const ticks = buildYard(scene, root, rand, charred, wood, stone);
  // The ruined chapel, where Plos lies (and the Commander comes).
  ticks.push(...buildChapel(scene, root, rand, charred, wood, stone));
  // A gutted house off the square (the kids hide inside).
  ruinHouse(scene, root, rand, stone, charred, SELES_SPOTS.burnedHouse, 5, 4, 0.2, 3.2);
  // More ruins round the square and along the path.
  ruinHouse(scene, root, rand, stone, charred, { u: 12.6, v: -14 }, 4, 3.5, -0.3, 2.2);
  burnedWoodHouse(scene, root, rand, charred, vil(14, -10), 0.4);
  burnedWoodHouse(scene, root, rand, charred, vil(-2, 8.5), -0.2);
  burnedWoodHouse(scene, root, rand, charred, { u: 13.6, v: -27.5 }, 0.9);

  ticks.push(buildWell(scene, root, rand, wood, charred, selesPoint(SELES_SPOTS.well)));
  ticks.push(...buildCemetery(scene, root, rand, stone, wood));
  buildBackdrop(scene, root, rand);
  buildBrokenLife(scene, root, rand, wood);
  ticks.push(sunShafts(scene, root, rand));
  ticks.push(emberPulse(scene));
  // Ash and embers drifting over the square too, smoke from the chapel's tower.
  ticks.push(ashFall(scene, fromUV(-6, -32)));
  buildSquare(scene, root, rand, charred, wood, stone);
  buildFences(scene, root, rand, wood);
  const hill = buildHillside(scene, root, rand);
  const paths = buildVillagePaths(scene, root, rand);
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
    shadowReceivers: [ground, hill, paths],
    heightAt: selesHeight,
    // Walked down the screen: in third person the camera looks that way, and from higher up (it
    // would sit in the hilltop's tall grass behind the hero).
    thirdPerson: { heading: Math.PI, beta: 0.78, radius: 10, lift: 1.2 },
    ownFill: [],
    shotAt: chapelShot,
    update: (focus, dt) => {
      chests.forEach((c) => c.tick(dt));
      for (const tick of ticks) tick(dt, focus);
    },
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
    const u = -64 + (96 * j) / 64;
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
    // Long tree shadows across the ground (continuing the hill's), and the yard warm in the low sun.
    const shade = noise2(u * 0.22 - v * 0.3 + 3, v * 0.12 + u * 0.05);
    c *= 1 - 0.45 * smooth(0.52, 0.62, shade);
    c *= 1 + 0.16 * (1 - smooth(4, 9, Math.hypot(u + 6.5, v + 2.5)));
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
  // Fieldstone walls like the chapel's; `stone` (paler, dressed) frames the windows.
  const walls = fieldstoneMaterial(scene, rand);
  const node = new TransformNode("selesRuin", scene);
  node.parent = root;
  const at = fromUV(spot.u, spot.v);
  node.position.copyFrom(at);
  node.rotation.y = Math.atan2(-1, 1) + rot; // square to the iso frame, then turned a little
  const T = 0.4;
  const box = (len: number, h: number, x: number, y: number, z: number, ry: number, mat: StandardMaterial, depth = T): void => {
    const m = mat === walls ? tiledBox("selesRuinWall", scene, len, h, depth) : MeshBuilder.CreateBox("selesRuinTrim", { width: len, height: h, depth }, scene);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    m.material = mat;
    m.parent = node;
  };
  const wall = (len: number, x: number, z: number, ry: number, door: boolean, window: boolean): void => {
    // In segments, each its own height: a broken top.
    const segs = Math.max(3, Math.round(len / 0.9));
    const sw = len / segs;
    const along = (f: number): [number, number] => [x + Math.cos(ry) * f * len, z - Math.sin(ry) * f * len];
    for (let k = 0; k < segs; k++) {
      const f = (k + 0.5) / segs - 0.5;
      const [px, pz] = along(f);
      if (door && Math.abs(f) < 0.14) continue; // the doorway
      const hgt = height * (0.45 + rand() * 0.55);
      if (window && k === Math.floor(segs / 2) && hgt > 2.5) {
        // A window: the wall below and above, a pale sill and lintel.
        box(sw + 0.02, 1.1, px, 0.55, pz, ry, walls);
        box(sw + 0.02, hgt - 2.1, px, (2.1 + hgt) / 2, pz, ry, walls);
        box(sw + 0.2, 0.12, px, 1.12, pz, ry, stone, T + 0.1);
        box(sw + 0.2, 0.14, px, 2.08, pz, ry, stone, T + 0.1);
        continue;
      }
      box(sw + 0.02, hgt, px, hgt / 2, pz, ry, walls);
    }
    if (door) {
      // The doorway's charred timber frame.
      for (const sx of [-1, 1]) {
        const [px, pz] = along(sx * 0.14);
        box(0.16, 2.1, px, 1.05, pz, ry, charred, T + 0.08);
      }
      const [lx, lz] = along(0);
      box(0.28 * len + 0.4, 0.18, lx, 2.15, lz, ry, charred, T + 0.1);
    }
  };
  wall(w, 0, -d / 2, 0, true, false);
  wall(w, 0, d / 2, 0, false, true);
  wall(d, -w / 2, 0, Math.PI / 2, false, true);
  wall(d, w / 2, 0, Math.PI / 2, rand() < 0.5, false);
  for (let k = 0; k < 2; k++) {
    const beam = MeshBuilder.CreateBox("selesBeam", { width: w * 0.9, height: 0.22, depth: 0.22 }, scene);
    beam.position.set((rand() - 0.5) * 0.6, height * (0.35 + rand() * 0.3), (k - 0.5) * d * 0.5);
    beam.rotation.z = (rand() - 0.5) * 0.6;
    beam.material = charred;
    beam.parent = node;
  }
  // Fallen stones at the foot of the walls.
  for (let k = 0; k < 6; k++) {
    const r = MeshBuilder.CreateIcoSphere("selesRuinRubble", { radius: 0.15 + rand() * 0.25, subdivisions: 1 }, scene);
    const side = rand() < 0.5 ? -1 : 1;
    r.position.set((rand() - 0.5) * w, 0.08, side * (d / 2 + 0.35 + rand() * 0.3));
    r.scaling.y = 0.6;
    r.material = walls;
    r.parent = node;
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

/**
 * Before the chapel the view pulls back and up the screen, so its bell tower stands whole in the
 * frame (PS1: the tower over the chapel), easing in over a few units.
 */
function chapelShot(p: Vector3): { zoom: number; offset?: Vector3 } | null {
  const up = fromUV(-1, 0); // one unit up the screen
  const near = (spot: { u: number; v: number }, r0: number, r1: number): number => {
    const q = fromUV(spot.u, spot.v);
    return 1 - smooth(r0, r1, Math.hypot(p.x - q.x, p.z - q.z));
  };
  const chapel = near({ u: SELES_SPOTS.chapel.u + 4, v: SELES_SPOTS.chapel.v }, 6, 11);
  // On the square the view opens out (PS1: the wide shot of the village centre).
  const square = near(SELES_SPOTS.square, 7, 12);
  if (chapel <= 0 && square <= 0) return null;
  if (chapel >= square) return { zoom: 1 - 0.24 * chapel, offset: up.scale(3.2 * chapel) };
  return { zoom: 1 - 0.2 * square, offset: up.scale(2 * square) };
}

// --- The ruined chapel (PS1: Plos, then the Commander) --------------------------------------------

/** Rough fieldstone: rounded stones of uneven size in dark mortar, soot-darkened (GROUND_PPU). */
function fieldstoneMaterial(scene: Scene, rand: () => number): StandardMaterial {
  const made = scene.getMaterialByName("selesFieldstone");
  if (made) return made as StandardMaterial; // one material for every stone wall of the village
  const tex = pixelTexture("selesFieldstoneTex", scene, 64, 64, (ctx, w, h) => {
    ctx.fillStyle = rgb(30, 25, 21);
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; ) {
      const row = 6 + ((rand() * 5) | 0);
      for (let x = -((rand() * 6) | 0); x < w; ) {
        const len = 7 + ((rand() * 8) | 0);
        const k = 0.65 + rand() * 0.45;
        ctx.fillStyle = rgb(104 * k, 92 * k, 80 * k);
        ctx.fillRect(x + 1, y + 1, len - 1, row - 1);
        ctx.fillStyle = rgb(128 * k, 116 * k, 100 * k); // the lit top of each stone
        ctx.fillRect(x + 2, y + 1, len - 3, 1);
        ctx.fillStyle = rgb(30, 25, 21); // round the corners
        for (const [cx, cy] of [[x + 1, y + 1], [x + len - 1, y + 1], [x + 1, y + row - 1], [x + len - 1, y + row - 1]]) ctx.fillRect(cx, cy, 1, 1);
        x += len;
      }
      y += row;
    }
  });
  tex.wrapU = tex.wrapV = Texture.WRAP_ADDRESSMODE; // tiled over walls of any size (tiledBox)
  return matte("selesFieldstone", scene, tex);
}

/** A box whose faces tile `mat`'s texture at one repeat per `tile` units (walls of any size). */
function tiledBox(name: string, scene: Scene, w: number, h: number, d: number, tile = 3.2): Mesh {
  const f = (a: number, b: number): Vector4 => new Vector4(0, 0, a / tile, b / tile);
  // Babylon's box faces: back, front, right, left, top, bottom.
  return MeshBuilder.CreateBox(name, { width: w, height: h, depth: d, faceUV: [f(w, h), f(w, h), f(d, h), f(d, h), f(w, d), f(w, d)] }, scene);
}

/**
 * The little stone chapel, burned out (PS1): fieldstone walls broken off at uneven heights, the left
 * gable still standing high, an arched window and a timber door frame in the front wall (facing the
 * camera); charred beams fallen in and leaning against it, rubble at its foot, smoke still rising
 * inside. Behind: a great gnarled dead tree, the stumps of two chimneys, the fence. Before it: a
 * broken fence with a crow on a post, and flat stone blocks where Dart stands.
 */
function buildChapel(scene: Scene, root: TransformNode, rand: () => number, charred: StandardMaterial, wood: StandardMaterial, stone: StandardMaterial): Tick[] {
  const fieldstone = fieldstoneMaterial(scene, rand);
  const pale = matte("selesPaleStone", scene, undefined, new Color3(0.58, 0.52, 0.44));
  const C = SELES_SPOTS.chapel;
  const node = new TransformNode("selesChapel", scene);
  node.parent = root;
  const at = fromUV(C.u, C.v);
  node.position.copyFrom(at);
  node.rotation.y = -Math.PI / 4; // local +x: right on screen; local +z: up the screen (front at -z)
  const W = 8; // along the front
  const D = 5;
  const T = 0.55;
  const part = (m: Mesh, mat: StandardMaterial): Mesh => {
    m.material = mat;
    m.parent = node;
    return m;
  };
  // A wall as columns of stone, each broken off at its own height; `holes` cut openings
  // [from, to, bottom, top] along it (door, window).
  const wall = (len: number, x: number, z: number, ry: number, heights: (f: number) => number, holes: [number, number, number, number][] = []): void => {
    const segs = Math.round(len / 0.7);
    for (let k = 0; k < segs; k++) {
      const f = (k + 0.5) / segs; // 0..1 along the wall
      const top = heights(f) * (0.9 + rand() * 0.2);
      const pos = (f - 0.5) * len;
      const hole = holes.find(([a, b]) => pos >= a && pos <= b);
      const spans: [number, number][] = hole ? [[0, hole[2]], [hole[3], top]] : [[0, top]];
      for (const [lo, hi] of spans) {
        if (hi - lo < 0.15) continue;
        const seg = part(tiledBox("selesChapelWall", scene, len / segs + 0.03, hi - lo, T), fieldstone);
        seg.position.set(x + Math.cos(ry) * pos, (lo + hi) / 2, z - Math.sin(ry) * pos);
        seg.rotation.y = ry;
      }
    }
  };
  const DOOR: [number, number, number, number] = [1.6, 2.8, 0, 2.4];
  const WINDOW: [number, number, number, number] = [-1.6, -0.6, 1.3, 2.7];
  // Front (facing the camera): high at the left gable, broken low towards the right.
  wall(W, 0, -D / 2, 0, (f) => (f < 0.18 ? 5.4 - f * 6 : 3.6 - f * 1.4 + Math.sin(f * 17) * 0.5), [WINDOW, DOOR]);
  // Back: the other gable, standing.
  wall(W, 0, D / 2, 0, (f) => 3.4 + 2.2 * Math.max(0, 1 - Math.abs(f - 0.35) * 3.2));
  // Sides.
  wall(D, -W / 2, 0, Math.PI / 2, () => 4.6);
  wall(D, W / 2, 0, Math.PI / 2, (f) => 2.2 + f * 1.2);
  // The window: a pale stone frame with its round arch.
  const wx = (WINDOW[0] + WINDOW[1]) / 2;
  const ww = WINDOW[1] - WINDOW[0];
  for (const sx of [-1, 1]) {
    const jamb = part(MeshBuilder.CreateBox("selesWinJamb", { width: 0.16, height: WINDOW[3] - WINDOW[2], depth: T + 0.08 }, scene), pale);
    jamb.position.set(wx + (sx * ww) / 2, (WINDOW[2] + WINDOW[3]) / 2, -D / 2);
  }
  const sill = part(MeshBuilder.CreateBox("selesWinSill", { width: ww + 0.3, height: 0.14, depth: T + 0.12 }, scene), pale);
  sill.position.set(wx, WINDOW[2], -D / 2);
  for (let k = 0; k <= 6; k++) {
    const a = (k / 6) * Math.PI;
    const voussoir = part(MeshBuilder.CreateBox("selesWinArch", { width: 0.2, height: 0.16, depth: T + 0.08 }, scene), pale);
    voussoir.position.set(wx + Math.cos(a) * (ww / 2), WINDOW[3] + Math.sin(a) * (ww / 2) * 0.9, -D / 2);
    voussoir.rotation.z = a - Math.PI / 2;
  }
  // The door: a timber frame, its door gone (a plank or two lie in front).
  const dx = (DOOR[0] + DOOR[1]) / 2;
  const dw = DOOR[1] - DOOR[0];
  for (const sx of [-1, 1]) {
    const post = part(MeshBuilder.CreateBox("selesDoorPost", { width: 0.18, height: DOOR[3], depth: T + 0.1 }, scene), wood);
    post.position.set(dx + (sx * dw) / 2, DOOR[3] / 2, -D / 2);
  }
  const lintel = part(MeshBuilder.CreateBox("selesDoorLintel", { width: dw + 0.5, height: 0.2, depth: T + 0.12 }, scene), wood);
  lintel.position.set(dx, DOOR[3] + 0.1, -D / 2);
  for (let k = 0; k < 3; k++) {
    const plank = part(MeshBuilder.CreateBox("selesDoorPlank", { width: 0.28, height: 0.06, depth: 1.6 }, scene), charred);
    plank.position.set(dx - 0.6 + k * 0.5, 0.05, -D / 2 - 1.1);
    plank.rotation.y = 0.5 + rand() * 0.6;
  }
  // Charred beams: fallen in, and leaning against the left of the front.
  for (let k = 0; k < 4; k++) {
    const beam = part(MeshBuilder.CreateBox("selesChapelBeam", { width: 4 + rand() * 2.5, height: 0.24, depth: 0.24 }, scene), charred);
    beam.position.set((rand() - 0.5) * W * 0.7, 0.6 + rand() * 1.6, (rand() - 0.3) * D * 0.6);
    beam.rotation.set((rand() - 0.5) * 0.5, (rand() - 0.5) * 0.6, (rand() - 0.5) * 0.7);
  }
  for (let k = 0; k < 4; k++) {
    const lean = part(MeshBuilder.CreateBox("selesLeanBeam", { width: 0.2, height: 3 + rand(), depth: 0.2 }, scene), charred);
    lean.position.set(-W / 2 + 0.2 + k * 0.45, 1.3, -D / 2 - 1.1);
    lean.rotation.set(-0.5 - rand() * 0.2, 0, (rand() - 0.5) * 0.5);
  }
  // Rubble at the foot of the walls.
  for (let k = 0; k < 16; k++) {
    const r = part(MeshBuilder.CreateIcoSphere("selesChapelRubble", { radius: 0.15 + rand() * 0.3, subdivisions: 1 }, scene), rand() < 0.6 ? fieldstone : stone);
    const side = rand();
    r.position.set(side < 0.6 ? (rand() - 0.5) * W : (rand() < 0.5 ? -1 : 1) * (W / 2 + 0.5), 0.08, side < 0.6 ? -D / 2 - 0.5 - rand() * 0.6 : (rand() - 0.5) * D);
    r.scaling.y = 0.6;
  }
  obstacles.addBox(at.x, at.z, W / 2 + 0.3, D / 2 + 0.3, node.rotation.y);

  // The bell tower at the back (PS1: what is left of it, standing over the chapel): tall
  // fieldstone walls broken off high, a corner still taller, pairs of arched openings up where the
  // bells hung, a low arched doorway into the nave; the bell lies cracked at its foot.
  const TW = 3.4;
  const tx = 1.6;
  const tz = D / 2 + TW / 2 - 0.3;
  const arch = (x: number, y: number, z: number, w: number, ry: number): void => {
    for (let k = 0; k <= 6; k++) {
      const a = (k / 6) * Math.PI;
      const v = part(MeshBuilder.CreateBox("selesTowerArch", { width: 0.18, height: 0.14, depth: T + 0.08 }, scene), pale);
      const along = Math.cos(a) * (w / 2);
      v.position.set(x + Math.cos(ry) * along, y + Math.sin(a) * (w / 2) * 0.9, z - Math.sin(ry) * along);
      v.rotation.set(0, ry, a - Math.PI / 2);
    }
  };
  const top = (f: number, hi: number): number => hi - 1.6 * Math.abs(Math.sin(f * 7.3)) - (f > 0.7 ? (f - 0.7) * 6 : 0);
  const BELLS: [number, number, number, number][] = [[-1.1, -0.35, 6.2, 7.8], [0.35, 1.1, 6.2, 7.8]];
  wall(TW, tx, tz - TW / 2, 0, (f) => top(f, 10.5), [...BELLS, [-0.5, 0.5, 0, 2.2]]); // facing the camera
  wall(TW, tx, tz + TW / 2, 0, (f) => top(1 - f, 9.6), BELLS);
  wall(TW, tx - TW / 2, tz, Math.PI / 2, (f) => (f > 0.6 ? 11.6 : top(f, 10)), BELLS); // the taller corner
  wall(TW, tx + TW / 2, tz, Math.PI / 2, (f) => top(f, 8.4), [[-0.4, 0.4, 6.2, 7.8]]);
  for (const [a0, a1, , y1] of BELLS) arch(tx + (a0 + a1) / 2, y1, tz - TW / 2, a1 - a0, 0);
  arch(tx, 2.2, tz - TW / 2, 1, 0);
  for (const [a0, a1, , y1] of BELLS) arch(tx - TW / 2, y1, tz + (a0 + a1) / 2, a1 - a0, Math.PI / 2);
  // A string course of pale stone round the tower, and the bell floor's charred joists.
  for (const [x, z, w, d] of [[tx, tz - TW / 2, TW + 0.2, T + 0.1], [tx - TW / 2, tz, T + 0.1, TW + 0.2]] as const) {
    const band = part(MeshBuilder.CreateBox("selesTowerBand", { width: w, height: 0.16, depth: d }, scene), pale);
    band.position.set(x, 5.9, z);
  }
  for (let k = 0; k < 3; k++) {
    const joist = part(MeshBuilder.CreateBox("selesTowerJoist", { width: TW - 0.4, height: 0.2, depth: 0.2 }, scene), charred);
    joist.position.set(tx, 5.6 - k * 0.3, tz - 0.8 + k * 0.8);
    joist.rotation.z = (rand() - 0.5) * 0.5;
  }
  // The fallen bell, cracked, half sunk at the tower's foot (seen past the chapel's left).
  const bell = part(MeshBuilder.CreateCylinder("selesBell", { height: 1.1, diameterTop: 0.55, diameterBottom: 1.1, tessellation: 12 }, scene), matte("selesBronze", scene, undefined, new Color3(0.26, 0.3, 0.22)));
  bell.position.set(-W / 2 - 1.2, 0.42, D / 2 + 0.6);
  bell.rotation.set(1.3, 0.4, 0);
  node.computeWorldMatrix(true);
  const towerAt = Vector3.TransformCoordinates(new Vector3(tx, 0, tz), node.getWorldMatrix());
  obstacles.addBox(towerAt.x, towerAt.z, TW / 2 + 0.3, TW / 2 + 0.3, node.rotation.y);
  const bellAt = Vector3.TransformCoordinates(bell.position, node.getWorldMatrix());
  obstacles.add(bellAt.x, bellAt.z, 0.7);

  // Behind it: the great gnarled dead tree (right), two chimney stumps (left), the fence.
  const bark = matte("selesGnarlBark", scene, undefined, new Color3(0.26, 0.2, 0.15));
  deadTree(scene, root, rand, bark, fromUV(C.u - 3.6, C.v + 6), 1.9);
  belfry(scene, root, rand, fieldstone, fromUV(C.u - 4.4, C.v - 3.4)); // behind the chapel's left corner, clear of the road out
  const stump = MeshBuilder.CreateBox("selesChimney", { width: 0.9, height: 4.6, depth: 0.9 }, scene);
  const sAt = fromUV(C.u - 4.2, C.v - 2.4);
  stump.position.set(sAt.x, 2.3, sAt.z);
  stump.rotation.y = 0.4;
  jitter(stump, 0.06, rand);
  stump.material = fieldstone;
  stump.parent = root;
  obstacles.add(sAt.x, sAt.z, 0.7);

  // Before it: a broken fence with a crow on a post; flat stone blocks to the right.
  const crowTicks: Tick[] = [];
  const fenceFrom = fromUV(C.u + 9.6, C.v - 4.4);
  for (let k = 0; k < 3; k++) {
    const p = fromUV(C.u + 9.6 - k * 0.2, C.v - 4.4 + k * 1.7);
    const hgt = 0.9 + rand() * 0.5;
    const post = MeshBuilder.CreateBox("selesBrokenPost", { width: 0.22, height: hgt, depth: 0.22 }, scene);
    post.position.set(p.x, hgt / 2, p.z);
    post.rotation.z = (rand() - 0.5) * 0.25;
    post.material = wood;
    post.parent = root;
    obstacles.add(p.x, p.z, 0.25);
    if (k === 0) crowTicks.push(crow(scene, root, new Vector3(p.x, hgt, p.z), rand));
  }
  const rail = MeshBuilder.CreateBox("selesFallenRail", { width: 4.2, height: 0.16, depth: 0.16 }, scene);
  const rAt = fromUV(C.u + 9.3, C.v - 2.2);
  rail.position.set(rAt.x, 0.3, rAt.z);
  rail.rotation.set(0, -Math.PI / 4 + 0.2, 0.14);
  rail.material = wood;
  rail.parent = root;
  void fenceFrom;
  for (const [du, dv, w, h] of [[3.2, 5.2, 1.8, 0.5], [4.4, 6.2, 1.4, 0.35], [2.6, 6.6, 1.2, 0.3]] as const) {
    const block = tiledBox("selesStoneBlock", scene, w, h, w * 0.8, 1.6);
    const bAt = fromUV(C.u + du, C.v + dv);
    block.position.set(bAt.x, h / 2, bAt.z);
    block.rotation.y = -Math.PI / 4 + (rand() - 0.5) * 0.4;
    block.material = fieldstone;
    block.parent = root;
    obstacles.add(bAt.x, bAt.z, w * 0.5);
  }
  return crowTicks;
}

/** A crow perched on a post, a stone, a roof; it takes off, flapping, when Dart comes near. */
function crow(scene: Scene, root: TransformNode, at: Vector3, rand: () => number): Tick {
  const black = matte("selesCrow", scene, undefined, new Color3(0.06, 0.06, 0.07));
  const node = new TransformNode("selesCrowNode", scene);
  node.parent = root;
  node.position.copyFrom(at);
  node.rotation.y = rand() * Math.PI * 2;
  const body = MeshBuilder.CreateSphere("selesCrowBody", { diameter: 0.34, segments: 6 }, scene);
  body.scaling.set(0.8, 0.85, 1.3);
  body.position.y = 0.2;
  body.rotation.x = -0.4;
  const head = MeshBuilder.CreateSphere("selesCrowHead", { diameter: 0.18, segments: 6 }, scene);
  head.position.set(0, 0.38, 0.16);
  const beak = MeshBuilder.CreateCylinder("selesCrowBeak", { height: 0.14, diameterTop: 0, diameterBottom: 0.06, tessellation: 4 }, scene);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 0.36, 0.3);
  const tail = MeshBuilder.CreateBox("selesCrowTail", { width: 0.14, height: 0.03, depth: 0.26 }, scene);
  tail.position.set(0, 0.14, -0.24);
  tail.rotation.x = -0.5;
  const wings = [-1, 1].map((sx) => {
    const hinge = new TransformNode("selesCrowHinge", scene);
    hinge.parent = node;
    hinge.position.set(sx * 0.12, 0.26, 0);
    const wing = MeshBuilder.CreateBox("selesCrowWing", { width: 0.34, height: 0.02, depth: 0.2 }, scene);
    wing.position.x = sx * 0.17;
    wing.material = black;
    wing.parent = hinge;
    hinge.rotation.z = sx * 1.3; // folded against the body
    return { hinge, sx };
  });
  for (const m of [body, head, beak, tail]) {
    m.material = black;
    m.parent = node;
  }
  let flying = -1;
  let hop = rand() * 5;
  const away = new Vector3();
  return (dt, focus) => {
    if (flying < 0) {
      // Perched: now and then it turns its head the other way.
      hop -= dt;
      if (hop < 0) {
        node.rotation.y += (rand() - 0.5) * 1.6;
        hop = 2 + rand() * 4;
      }
      if (Math.hypot(focus.x - at.x, focus.z - at.z) < 3.2) {
        flying = 0;
        away.set(at.x - focus.x, 0, at.z - focus.z).normalize();
        node.rotation.y = Math.atan2(away.x, away.z);
      }
      return;
    }
    if (flying > 6) return;
    flying += dt;
    node.position.x += away.x * 4 * dt;
    node.position.z += away.z * 4 * dt;
    node.position.y += (2.6 - flying * 0.2) * dt;
    for (const w of wings) w.hinge.rotation.z = w.sx * (0.2 + 0.9 * Math.sin(flying * 22));
    if (flying > 6) node.setEnabled(false);
  };
}

// --- The yard below the fence (PS1 "Acquired Burn Out") ----------------------------------------

/**
 * The yard at the foot of the hill: open trodden earth with sticks strewn about, the Save Point's
 * column of light on the left, a timber house collapsed in on itself on the right (its roof lying
 * in one charred slab), heaps of burned debris along the bottom, a broken cart and a sack.
 */
function buildYard(scene: Scene, root: TransformNode, rand: () => number, charred: StandardMaterial, wood: StandardMaterial, stone: StandardMaterial): Tick[] {
  const planks = planksMaterial(scene, rand);
  collapsedHouse(scene, root, rand, planks, charred, fromUV(-6.4, 3.6), -0.5);
  saveColumn(scene, root, selesPoint(SELES_SPOTS.savePoint));

  // Debris heaps along the bottom of the yard (the villager lies in front of them, on the right).
  for (const [u, v, s] of [[-2.2, -2.4, 1], [-1.2, 1, 1.2], [-2.4, 4, 1.1], [-1.6, 6.6, 1.2], [-3.4, 8.8, 0.9]] as const) {
    debrisHeap(scene, root, rand, planks, charred, fromUV(u, v), s);
  }
  brokenCart(scene, root, rand, wood, charred, fromUV(-3.6, -4.6));

  // Just below: more of the village burned — stone houses gutted, timber ones fallen in.
  ruinHouse(scene, root, rand, stone, charred, { u: 3.4, v: 2.4 }, 5, 4, 0.25, 2.6);
  burnedWoodHouse(scene, root, rand, charred, { u: 2.2, v: -3.6 }, 0.5);
  collapsedHouse(scene, root, rand, planks, charred, fromUV(3.2, 9.6), 0.3, 0.7);
  ruinHouse(scene, root, rand, stone, charred, { u: 3.6, v: -8.4 }, 4.5, 3.6, -0.2, 2.2);
  ruinHouse(scene, root, rand, stone, charred, { u: 8.6, v: 5.4 }, 5.5, 4, 0.1, 3);
  burnedWoodHouse(scene, root, rand, charred, { u: 7.8, v: -1.8 }, -0.3);
  collapsedHouse(scene, root, rand, planks, charred, fromUV(8.4, -10.6), 1.2, 0.6);
  for (const [u, v, s] of [[5.4, -4.8, 1], [6, 1.6, 0.9], [5.6, 9, 1.1], [9.6, 1.4, 0.8]] as const) {
    debrisHeap(scene, root, rand, planks, charred, fromUV(u, v), s);
  }

  // Fires still burning in the wrecks: the yard's warm light, without a real light (mobile).
  return [
    fireSpot(scene, root, rand, fromUV(-6.8, 2.6), 1),
    fireSpot(scene, root, rand, fromUV(-4.9, 5.6), 0.7),
    fireSpot(scene, root, rand, fromUV(2.2, -3.6), 0.9),
    fireSpot(scene, root, rand, fromUV(3.4, 9.2), 0.8),
    fireSpot(scene, root, rand, fromUV(8.4, -10.4), 0.8),
    fireSpot(scene, root, rand, fromUV(7.8, -1.8), 0.7),
    ashFall(scene, fromUV(-6, -1)),
    smokeHaze(scene, fromUV(2, -2)),
  ];

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
  const made = scene.getMaterialByName("selesPlanks");
  if (made) return made as StandardMaterial;
  const embers: [number, number, number, string][] = [];
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
        const c = rand() < 0.5 ? rgb(214, 96, 32) : rgb(150, 54, 20); // embers in the char
        const e: [number, number, number, string] = [(rand() * w) | 0, y + 1 + ((rand() * 6) | 0), 1 + ((rand() * 2) | 0), c];
        ctx.fillStyle = c;
        ctx.fillRect(e[0], e[1], e[2], 1);
        embers.push(e);
      }
    }
  });
  const mat = matte("selesPlanks", scene, tex);
  // The embers glow on their own (an emissive layer of just them), pulsing slowly (see emberPulse).
  mat.emissiveTexture = pixelTexture("selesEmbersTex", scene, 64, 64, (ctx, w, h) => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    for (const [x, y, len, c] of embers) {
      ctx.fillStyle = c;
      ctx.fillRect(x, y, len, 1);
    }
  });
  return mat;
}

/** Glowing coals for the debris heaps: unlit orange, pulsing with the planks' embers. */
function emberMaterial(scene: Scene): StandardMaterial {
  const made = scene.getMaterialByName("selesEmberGlow");
  if (made) return made as StandardMaterial;
  const m = new StandardMaterial("selesEmberGlow", scene);
  m.disableLighting = true;
  m.emissiveColor = new Color3(1, 0.42, 0.12);
  return m;
}

/** The embers' slow breathing: every glowing plank and coal brightens and dims, out of step with
 *  the fires' quick flicker. Only material colours change (cheap: no shader rebuild). */
function emberPulse(scene: Scene): Tick {
  let t = 0;
  return (dt) => {
    t += dt;
    const k = 0.7 + 0.3 * Math.sin(t * 1.7) + 0.08 * Math.sin(t * 5.3);
    const planks = scene.getMaterialByName("selesPlanks") as StandardMaterial | null;
    if (planks) planks.emissiveColor.set(1.4 * k, 1.4 * k, 1.4 * k);
    const coal = scene.getMaterialByName("selesEmberGlow") as StandardMaterial | null;
    if (coal) coal.emissiveColor.set(1 * k, 0.42 * k, 0.12 * k);
  };
}

/**
 * A timber house collapsed in on itself: its roof down in one slab leaning on the stumps of the
 * walls, a second piece broken off, posts still standing at the corners, beams fallen across.
 */
function collapsedHouse(scene: Scene, root: TransformNode, rand: () => number, planks: StandardMaterial, charred: StandardMaterial, at: Vector3, rot: number, size = 1): void {
  const node = new TransformNode("selesCollapsed", scene);
  node.parent = root;
  node.position.copyFrom(at);
  node.rotation.y = rot;
  node.scaling.setAll(size);
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
  obstacles.addBox(at.x, at.z, (W / 2) * size + 0.2, (D / 2) * size + 0.2, rot);
}

/**
 * A fire still burning in a wreck: a few flames, and a pool of warm light on the ground under them
 * that flickers. No real light (each one would cost every material on a phone): the pool is an
 * additive disc, and only its own colour changes.
 */
function fireSpot(scene: Scene, root: TransformNode, rand: () => number, at: Vector3, s: number): (dt: number) => void {
  const dot = softDotTexture(scene);
  const flames = new ParticleSystem("selesFire", 26, scene);
  flames.particleTexture = dot;
  flames.emitter = new Vector3(at.x, 0.3, at.z);
  flames.minEmitBox = new Vector3(-0.5 * s, 0, -0.5 * s);
  flames.maxEmitBox = new Vector3(0.5 * s, 0.2, 0.5 * s);
  flames.blendMode = ParticleSystem.BLENDMODE_ADD;
  flames.color1 = new Color4(1, 0.62, 0.22, 1);
  flames.color2 = new Color4(1, 0.4, 0.12, 1);
  flames.colorDead = new Color4(0.5, 0.08, 0, 0);
  flames.minSize = 0.35 * s;
  flames.maxSize = 0.8 * s;
  flames.minLifeTime = 0.45;
  flames.maxLifeTime = 0.9;
  flames.emitRate = 28 * s;
  flames.direction1 = new Vector3(-0.15, 1, -0.15);
  flames.direction2 = new Vector3(0.15, 1.6, 0.15);
  flames.minEmitPower = 0.8;
  flames.maxEmitPower = 1.4;
  flames.gravity = new Vector3(0, 0.6, 0);
  flames.start();

  const pool = MeshBuilder.CreateDisc("selesFirePool", { radius: 3.2 * s, tessellation: 20 }, scene);
  pool.rotation.x = Math.PI / 2;
  pool.position.set(at.x, 0.06, at.z);
  const m = new StandardMaterial("selesFirePoolMat", scene);
  m.disableLighting = true;
  m.opacityTexture = dot;
  m.alphaMode = 1; // additive
  m.fogEnabled = false;
  const base = new Color3(0.42, 0.2, 0.06);
  m.emissiveColor = base.clone();
  pool.material = m;
  pool.parent = root;
  let t = rand() * 10;
  return (dt) => {
    t += dt;
    const k = 0.82 + 0.1 * Math.sin(t * 9.1) + 0.08 * Math.sin(t * 23.7 + 1.3);
    m.emissiveColor.set(base.r * k, base.g * k, base.b * k);
  };
}

/** Ash drifting down over the yard, a few embers among it. One small system, all of it. */
function ashFall(scene: Scene, at: Vector3): (dt: number) => void {
  const ps = new ParticleSystem("selesAsh", 60, scene);
  ps.particleTexture = softDotTexture(scene);
  ps.emitter = new Vector3(at.x, 6, at.z);
  ps.minEmitBox = new Vector3(-10, 0, -10);
  ps.maxEmitBox = new Vector3(10, 2, 10);
  ps.blendMode = ParticleSystem.BLENDMODE_STANDARD;
  ps.color1 = new Color4(0.62, 0.58, 0.55, 0.75);
  ps.color2 = new Color4(1, 0.5, 0.18, 0.9); // the odd ember
  ps.colorDead = new Color4(0.4, 0.38, 0.36, 0);
  ps.minSize = 0.05;
  ps.maxSize = 0.11;
  ps.minLifeTime = 5;
  ps.maxLifeTime = 8;
  ps.emitRate = 8;
  ps.direction1 = new Vector3(-0.3, -0.4, -0.2);
  ps.direction2 = new Vector3(0.3, -0.6, 0.3);
  ps.minEmitPower = 0.3;
  ps.maxEmitPower = 0.6;
  ps.gravity = new Vector3(0.1, -0.05, 0.05);
  ps.preWarmCycles = 300;
  ps.start();
  return () => undefined;
}

/**
 * The smoke of the night's fires still hanging low over the village: a few big, slow, faint puffs
 * drifting across. Kept to a handful (each puff is a large transparent quad: overdraw on a phone).
 */
function smokeHaze(scene: Scene, at: Vector3): (dt: number) => void {
  const ps = new ParticleSystem("selesHaze", 16, scene);
  ps.particleTexture = softDotTexture(scene);
  ps.emitter = new Vector3(at.x, 2.5, at.z);
  ps.minEmitBox = new Vector3(-14, 0, -14);
  ps.maxEmitBox = new Vector3(14, 2, 14);
  ps.blendMode = ParticleSystem.BLENDMODE_STANDARD;
  ps.color1 = new Color4(0.5, 0.47, 0.44, 0.16);
  ps.color2 = new Color4(0.42, 0.4, 0.38, 0.12);
  ps.colorDead = new Color4(0.45, 0.43, 0.4, 0);
  ps.minSize = 5;
  ps.maxSize = 9;
  ps.minLifeTime = 14;
  ps.maxLifeTime = 20;
  ps.emitRate = 1;
  ps.direction1 = new Vector3(0.3, 0.02, 0.1);
  ps.direction2 = new Vector3(0.5, 0.06, 0.25);
  ps.minEmitPower = 0.3;
  ps.maxEmitPower = 0.5;
  ps.gravity = new Vector3(0, 0, 0);
  ps.preWarmCycles = 400;
  ps.start();
  return () => undefined;
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
  // A few coals still glowing in the heap.
  for (let k = 0; k < 3; k++) {
    const coal = MeshBuilder.CreateIcoSphere("selesCoal", { radius: (0.1 + rand() * 0.08) * s, subdivisions: 1 }, scene);
    coal.position.set(at.x + (rand() - 0.5) * 1.4 * s, 0.12 + rand() * 0.25 * s, at.z + (rand() - 0.5) * 1.4 * s);
    coal.material = emberMaterial(scene);
    coal.parent = root;
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

/**
 * The morning sun breaking through the smoke in a few pale shafts over the yard and the square
 * (as the Forest's: long additive cards along the sun's direction, unlit, kept out of the glow
 * layer, breathing slowly as the smoke drifts across).
 */
function sunShafts(scene: Scene, root: TransformNode, rand: () => number): Tick {
  const tex = new DynamicTexture("selesShaftTex", { width: 32, height: 128 }, scene, false);
  const ctx = tex.getContext();
  for (let y = 0; y < 128; y++) {
    const along = y / 127;
    const fade = Math.min(1, along / 0.25) * Math.min(1, (1 - along) / 0.35);
    for (let x = 0; x < 32; x++) {
      const across = 1 - Math.abs(x - 15.5) / 16;
      ctx.fillStyle = `rgba(255,255,255,${(fade * across * across).toFixed(3)})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  tex.hasAlpha = true;
  tex.update();
  const mat = new StandardMaterial("selesShaftMat", scene);
  mat.diffuseTexture = tex;
  mat.useAlphaFromDiffuseTexture = true;
  mat.diffuseColor = Color3.Black();
  mat.emissiveColor = new Color3(1, 0.9, 0.7); // pale morning gold
  mat.specularColor = Color3.Black();
  mat.disableLighting = true;
  mat.backFaceCulling = false;
  mat.alphaMode = 1; // additive
  mat.alpha = 0.22;
  mat.fogEnabled = false;
  const axis = new Vector3(0.5, 1, 0.4).normalize(); // towards the sun
  const toCam = new Vector3(0.577, 0.577, -0.577);
  const normal = toCam.subtract(axis.scale(Vector3.Dot(toCam, axis))).normalize();
  const across = Vector3.Cross(axis, normal).normalize();
  const shafts: Mesh[] = [];
  for (const [u, v] of [[-7, -4], [-3.5, 3], [0.5, -16], [-1, -31], [2.5, -37], [-10, -36]] as const) {
    const base = fromUV(u, v);
    const width = 1.4 + rand() * 1.6;
    const corners = [
      base.add(across.scale(-width / 2)),
      base.add(across.scale(width / 2)),
      base.add(across.scale(width / 2)).addInPlace(axis.scale(18)),
      base.add(across.scale(-width / 2)).addInPlace(axis.scale(18)),
    ];
    const vd = new VertexData();
    vd.positions = corners.flatMap((c) => [c.x, c.y, c.z]);
    vd.uvs = [0, 0, 1, 0, 1, 1, 0, 1];
    vd.indices = [0, 1, 2, 0, 2, 3];
    vd.normals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
    const m = new Mesh(`selesShaft${shafts.length}`, scene);
    vd.applyToMesh(m);
    m.material = mat;
    m.parent = root;
    m.alphaIndex = 10;
    m.isPickable = false;
    shafts.push(m);
  }
  const phase = shafts.map(() => rand() * Math.PI * 2);
  let t = 0;
  let glowChecked = false;
  return (dt) => {
    if (!glowChecked) {
      glowChecked = true; // the mode's glow layer comes after the world: exclude the shafts now
      for (const layer of scene.effectLayers) if (layer instanceof GlowLayer) for (const m of shafts) layer.addExcludedMesh(m);
    }
    t += dt;
    shafts.forEach((m, i) => (m.visibility = 0.55 + 0.45 * Math.sin(t * 0.35 + phase[i])));
  };
}

/**
 * What the villagers left behind (the life the raid broke into): an overturned table and stool,
 * a rag doll, broken pots, laundry still on its line, a pitchfork and a bucket dropped in the flight.
 */
function buildBrokenLife(scene: Scene, root: TransformNode, rand: () => number, wood: StandardMaterial): void {
  const clay = matte("selesClay", scene, undefined, new Color3(0.56, 0.34, 0.22));
  const cloth = [new Color3(0.62, 0.6, 0.5), new Color3(0.42, 0.46, 0.56), new Color3(0.58, 0.44, 0.36)].map((c, i) => matte(`selesCloth${i}`, scene, undefined, c));
  const put = (m: Mesh, mat: StandardMaterial): Mesh => {
    m.material = mat;
    m.parent = root;
    return m;
  };
  // The overturned table, a stool, and the doll beside them.
  const T = fromUV(-6.2, -39.4);
  const top = put(MeshBuilder.CreateBox("selesTable", { width: 1.6, height: 0.1, depth: 0.9 }, scene), wood);
  top.position.set(T.x, 0.45, T.z);
  top.rotation.set(Math.PI / 2 - 0.1, 0.6, 0); // on its side
  for (const [dx, dz] of [[-0.65, 0.35], [0.65, 0.35], [-0.65, -0.35], [0.65, -0.35]]) {
    const leg = put(MeshBuilder.CreateBox("selesTableLeg", { width: 0.08, height: 0.08, depth: 0.7 }, scene), wood);
    leg.position.set(T.x + dx * 0.8, 0.3 + dz * 0.4, T.z + dx * 0.55);
    leg.rotation.y = 0.6;
  }
  obstacles.add(T.x, T.z, 0.8);
  const stool = put(MeshBuilder.CreateCylinder("selesStool", { height: 0.45, diameter: 0.5, tessellation: 8 }, scene), wood);
  const S2 = fromUV(-7.4, -37.6);
  stool.position.set(S2.x, 0.25, S2.z);
  stool.rotation.z = Math.PI / 2;
  const D = selesPoint(SELES_SPOTS.doll);
  const doll = new TransformNode("selesDoll", scene);
  doll.parent = root;
  doll.position.set(D.x, 0.06, D.z);
  doll.rotation.y = 1.1;
  const dollCloth = cloth[2];
  for (const [w, h, d, x, z, mat] of [[0.22, 0.08, 0.34, 0, 0, dollCloth], [0.16, 0.1, 0.16, 0, 0.24, cloth[0]], [0.07, 0.05, 0.22, 0.14, -0.02, dollCloth], [0.07, 0.05, 0.22, -0.14, -0.02, dollCloth]] as const) {
    const m = MeshBuilder.CreateBox("selesDollPart", { width: w, height: h, depth: d }, scene);
    m.position.set(x, 0, z);
    m.material = mat;
    m.parent = doll;
  }
  // Broken pots by the ruins.
  for (const [u, v] of [[-3.4, -42], [3.4, -36.2], [-4.4, 6.6], [6.8, -7.2], [-9.4, -21]] as const) {
    const p = fromUV(u, v);
    for (let k = 0; k < 2; k++) {
      const pot = put(MeshBuilder.CreateCylinder("selesPot", { height: 0.5, diameterTop: 0.26, diameterBottom: 0.34, tessellation: 8, arc: k === 0 ? 1 : 0.55 }, scene), clay);
      pot.position.set(p.x + k * 0.45, k === 0 ? 0.25 : 0.12, p.z + k * 0.2);
      pot.rotation.set(k === 0 ? 0 : Math.PI / 2, rand() * 3, 0);
      clay.backFaceCulling = false; // the broken pot shows its inside
    }
    for (let k = 0; k < 4; k++) {
      const shard = put(MeshBuilder.CreateBox("selesShard", { width: 0.14, height: 0.03, depth: 0.1 }, scene), clay);
      shard.position.set(p.x + (rand() - 0.5) * 0.9, 0.02, p.z + (rand() - 0.5) * 0.9);
      shard.rotation.y = rand() * 3;
    }
  }
  // The washing line, still hung with clothes.
  const L = selesPoint(SELES_SPOTS.laundry);
  const a = fromUV(SELES_SPOTS.laundry.u - 0.4, SELES_SPOTS.laundry.v - 1.6);
  const b = fromUV(SELES_SPOTS.laundry.u + 0.4, SELES_SPOTS.laundry.v + 1.6);
  for (const p of [a, b]) {
    const post = put(MeshBuilder.CreateBox("selesLinePost", { width: 0.1, height: 1.9, depth: 0.1 }, scene), wood);
    post.position.set(p.x, 0.95, p.z);
    obstacles.add(p.x, p.z, 0.15);
  }
  const yaw = -Math.atan2(b.z - a.z, b.x - a.x);
  const line = put(MeshBuilder.CreateBox("selesLine", { width: Vector3.Distance(a, b), height: 0.02, depth: 0.02 }, scene), matte("selesRopeMat", scene, undefined, new Color3(0.3, 0.26, 0.2)));
  line.position.set(L.x, 1.8, L.z);
  line.rotation.y = yaw;
  for (let k = 0; k < 4; k++) {
    const f = 0.15 + k * 0.23;
    const q = Vector3.Lerp(a, b, f);
    const sheet = put(MeshBuilder.CreatePlane("selesSheet", { width: 0.5 + rand() * 0.3, height: 0.6 + rand() * 0.4 }, scene), cloth[k % 3]);
    sheet.position.set(q.x, 1.45, q.z);
    sheet.rotation.set(0, yaw, (rand() - 0.5) * 0.15);
    cloth[k % 3].backFaceCulling = false;
  }
  // A pitchfork and a bucket dropped in the flight.
  const F = fromUV(-3.6, -11.8);
  const handle = put(MeshBuilder.CreateBox("selesForkHandle", { width: 0.06, height: 0.06, depth: 1.6 }, scene), wood);
  handle.position.set(F.x, 0.04, F.z);
  handle.rotation.y = 0.9;
  for (let k = -1; k <= 1; k++) {
    const tine = put(MeshBuilder.CreateBox("selesForkTine", { width: 0.03, height: 0.03, depth: 0.35 }, scene), matte("selesIron", scene, undefined, new Color3(0.3, 0.3, 0.32)));
    tine.position.set(F.x + Math.sin(0.9) * 0.95 + Math.cos(0.9) * k * 0.08, 0.04, F.z + Math.cos(0.9) * 0.95 - Math.sin(0.9) * k * 0.08);
    tine.rotation.y = 0.9;
  }
  const B = fromUV(-1.4, -13.6);
  const bucket = put(MeshBuilder.CreateCylinder("selesDroppedBucket", { height: 0.4, diameterTop: 0.42, diameterBottom: 0.32, tessellation: 10 }, scene), wood);
  bucket.position.set(B.x, 0.2, B.z);
  bucket.rotation.set(Math.PI / 2, 0.4, 0);
}

/**
 * The hills beyond the village (PS1: low brown hills on the horizon behind the cemetery and the
 * road out): a few great low mounds far up the screen, fading into the morning haze. Cheap: a
 * handful of plain meshes, no texture.
 */
function buildBackdrop(scene: Scene, root: TransformNode, rand: () => number): void {
  const earth = matte("selesFarHills", scene, undefined, new Color3(0.3, 0.25, 0.16)); // darker than the village earth: it reads as a slope, not a plate
  const grass = grassSource(scene, rand);
  // Just past the cemetery's fence (the camera sees a dozen units up the screen), either side of the
  // road out, and one closing the far end of the road.
  for (const [u, v, d, h] of [[-28, -47, 10, 0.6], [-32, -40, 9, 0.55], [-36, -52, 16, 0.5], [-45, -32, 18, 0.45], [-30, -58, 14, 0.5]] as const) {
    const hill = MeshBuilder.CreateSphere("selesFarHill", { diameter: d, segments: 10 }, scene);
    const p = fromUV(u, v);
    hill.position.set(p.x, -d * 0.08, p.z);
    hill.scaling.set(1.4, h, 1);
    hill.rotation.y = rand() * Math.PI;
    jitter(hill, 0.8, rand);
    gradeColors(hill, [0.45, 0.42, 0.38], [1, 1, 0.9]);
    hill.material = earth;
    hill.parent = root;
    // Dry grass on its slopes.
    for (let k = 0; k < 40; k++) {
      const a = rand() * Math.PI * 2;
      const r = rand() * d * 0.45;
      place(grass, root, p.x + Math.cos(a) * r, p.z + Math.sin(a) * r, 1 + rand() * 0.6, rand() * 3).position.y = d * h * 0.5 * (1 - (r / (d * 0.5)) ** 2) - d * 0.08;
    }
  }
}

/** The village well: a stone ring, a little roof frame and its bucket. */
function buildWell(scene: Scene, root: TransformNode, rand: () => number, wood: StandardMaterial, charred: StandardMaterial, at: Vector3): Tick {
  // A low ring of fieldstone (PS1), a dark hole, a wooden frame with its axle, crank, rope and
  // bucket, and a little plank roof.
  const fieldstone = fieldstoneMaterial(scene, rand);
  const R = 1.05;
  const N = 12;
  for (let k = 0; k < N; k++) {
    const a = (k / N) * Math.PI * 2;
    const seg = tiledBox("selesWellStone", scene, (2 * Math.PI * R) / N + 0.08, 0.85, 0.36, 2);
    seg.position.set(at.x + Math.cos(a) * R, 0.42, at.z + Math.sin(a) * R);
    seg.rotation.y = -a + Math.PI / 2;
    seg.material = fieldstone;
    seg.parent = root;
  }
  const hole = MeshBuilder.CreateDisc("selesWellHole", { radius: R - 0.1, tessellation: 16 }, scene);
  hole.rotation.x = Math.PI / 2;
  hole.position.set(at.x, 0.7, at.z);
  hole.material = matte("selesWellDark", scene, undefined, new Color3(0.03, 0.03, 0.04));
  hole.parent = root;
  const node = new TransformNode("selesWellFrame", scene);
  node.parent = root;
  node.position.copyFrom(at);
  node.rotation.y = 0.5;
  const part = (m: Mesh, mat: StandardMaterial, x: number, y: number, z: number): Mesh => {
    m.position.set(x, y, z);
    m.material = mat;
    m.parent = node;
    return m;
  };
  for (const sx of [-1, 1]) part(MeshBuilder.CreateBox("selesWellPost", { width: 0.16, height: 2.3, depth: 0.16 }, scene), wood, sx * (R + 0.1), 1.15, 0);
  const axle = part(MeshBuilder.CreateCylinder("selesWellAxle", { height: 2 * R + 0.5, diameter: 0.16, tessellation: 8 }, scene), wood, 0, 1.75, 0);
  axle.rotation.z = Math.PI / 2;
  // The crank on the right post.
  part(MeshBuilder.CreateBox("selesWellCrank", { width: 0.08, height: 0.45, depth: 0.08 }, scene), charred, R + 0.35, 1.58, 0);
  part(MeshBuilder.CreateBox("selesWellHandle", { width: 0.3, height: 0.07, depth: 0.07 }, scene), charred, R + 0.48, 1.38, 0);
  // Rope and bucket.
  part(MeshBuilder.CreateBox("selesWellRope", { width: 0.03, height: 0.7, depth: 0.03 }, scene), charred, 0.2, 1.35, 0);
  part(MeshBuilder.CreateCylinder("selesWellBucket", { height: 0.34, diameterTop: 0.36, diameterBottom: 0.28, tessellation: 10 }, scene), wood, 0.2, 0.95, 0);
  // The little pitched roof over the axle.
  for (const sz of [-1, 1]) {
    const plank = part(MeshBuilder.CreateBox("selesWellRoof", { width: 2 * R + 0.5, height: 0.06, depth: 0.55 }, scene), wood, 0, 2.38, sz * 0.22);
    plank.rotation.x = sz * 0.6;
  }
  obstacles.add(at.x, at.z, R + 0.25);
  // A crow on the roof ridge.
  return crow(scene, root, new Vector3(at.x, 2.55, at.z), rand);
}

/**
 * The square left of the chapel (PS1): open trodden earth round the well, a gallows-like frame of
 * poles at its top, a gutted stone house with its gable on the left, and along the bottom a border
 * of fallen-in timber houses and debris, an abandoned cart in the corner.
 */
function buildSquare(scene: Scene, root: TransformNode, rand: () => number, charred: StandardMaterial, wood: StandardMaterial, stone: StandardMaterial): void {
  // The poles at the top of the square: two posts, a crossbar, a rope with a bucket.
  const posts = [fromUV(-4.6, -32.4), fromUV(-4.2, -34.8)];
  for (const p of posts) {
    const post = MeshBuilder.CreateBox("selesPole", { width: 0.16, height: 2.6, depth: 0.16 }, scene);
    post.position.set(p.x, 1.3, p.z);
    post.rotation.z = (rand() - 0.5) * 0.12;
    post.material = wood;
    post.parent = root;
    obstacles.add(p.x, p.z, 0.2);
  }
  const mid = Vector3.Lerp(posts[0], posts[1], 0.5);
  const bar = MeshBuilder.CreateBox("selesPoleBar", { width: Vector3.Distance(posts[0], posts[1]) + 0.4, height: 0.12, depth: 0.12 }, scene);
  bar.position.set(mid.x, 2.5, mid.z);
  bar.rotation.y = -Math.atan2(posts[1].z - posts[0].z, posts[1].x - posts[0].x);
  bar.material = wood;
  bar.parent = root;
  const rope = MeshBuilder.CreateBox("selesRope", { width: 0.03, height: 1.1, depth: 0.03 }, scene);
  rope.position.set(mid.x, 1.95, mid.z);
  rope.material = charred;
  rope.parent = root;
  const bucket = MeshBuilder.CreateCylinder("selesBucket", { height: 0.4, diameterTop: 0.42, diameterBottom: 0.32, tessellation: 10 }, scene);
  bucket.position.set(mid.x, 1.25, mid.z);
  bucket.material = wood;
  bucket.parent = root;

  // A gutted stone house on the left, its gable still up.
  ruinHouse(scene, root, rand, stone, charred, { u: -1.6, v: -43.2 }, 5.5, 4.2, 0.1, 3.6);
  ruinHouse(scene, root, rand, stone, charred, { u: 3.6, v: -43.8 }, 3.4, 3, -0.25, 2);

  // Along the bottom: fallen-in timber houses and debris, the cart in the corner.
  const planks = planksMaterial(scene, rand);
  collapsedHouse(scene, root, rand, planks, charred, fromUV(8.6, -34.88), 0.15, 0.75);
  burnedWoodHouse(scene, root, rand, charred, { u: 8.4, v: -29.55 }, 0.2);
  burnedWoodHouse(scene, root, rand, charred, { u: 8.8, v: -40.5 }, -0.3);
  for (const [u, v, s] of [[5.6, -31.88, 1], [5.8, -37.95, 1.1], [6.2, -27.6, 0.9]] as const) {
    debrisHeap(scene, root, rand, planks, charred, fromUV(u, v), s);
  }
  brokenCart(scene, root, rand, wood, charred, fromUV(5, -41.55));
}

/**
 * The cemetery, up on the left of the square (PS1): rows of rounded headstones in the dead grass,
 * gnarled dead trees round it, a fence behind; a small ruin beside it.
 */
function buildCemetery(scene: Scene, root: TransformNode, rand: () => number, stone: StandardMaterial, wood: StandardMaterial): Tick[] {
  const C = SELES_SPOTS.cemetery;
  const T = SELES_SPOTS.tomb3;
  // Scattered headstones of every shape and age (PS1): rounded, slabs, crosses; some leaning, one
  // broken. The Stardust tomb first, where the script looks for it.
  const spots: [number, number][] = [[T.u - C.u, T.v - C.v]];
  for (let tries = 0; spots.length < 11 && tries < 200; tries++) {
    const du = -2.4 + rand() * 4;
    const dv = -3.4 + rand() * 6.6;
    if (spots.every(([a, b]) => Math.hypot(a - du, b - dv) > 1.1)) spots.push([du, dv]);
  }
  let tops: Vector3[] = [];
  spots.forEach(([du, dv], k) => {
    const p = fromUV(C.u + du, C.v + dv);
    const kind = k === 0 ? 0 : (rand() * 4) | 0;
    const node = new TransformNode("selesTombNode", scene);
    node.parent = root;
    node.position.set(p.x, 0, p.z);
    node.rotation.set((rand() - 0.5) * (k === 0 ? 0.08 : 0.35), Math.atan2(-1, 1) + (rand() - 0.5) * 0.4, (rand() - 0.5) * (k === 0 ? 0.08 : 0.3));
    const s = 0.8 + rand() * 0.45;
    const put = (m: Mesh, y: number): void => {
      m.position.y = y;
      m.material = stone;
      m.parent = node;
      gradeColors(m, [0.45, 0.43, 0.41], [1, 1, 1]);
    };
    let top = 1.2 * s;
    if (kind === 0 || kind === 1) {
      const tomb = MeshBuilder.CreateCapsule("selesTomb", { height: 1.25 * s, radius: 0.34 * s, tessellation: 10 }, scene);
      tomb.scaling.z = 0.35;
      put(tomb, 0.4 * s);
    } else if (kind === 2) {
      put(MeshBuilder.CreateBox("selesSlab", { width: 0.75 * s, height: 0.9 * s, depth: 0.2 }, scene), 0.45 * s);
      top = 0.9 * s;
    } else {
      put(MeshBuilder.CreateBox("selesCross", { width: 0.16, height: 1.25 * s, depth: 0.16 }, scene), 0.6 * s);
      put(MeshBuilder.CreateBox("selesCrossArm", { width: 0.62 * s, height: 0.15, depth: 0.15 }, scene), 0.85 * s);
    }
    if (k > 0 && rand() < 0.18) {
      // Broken: its top lies at its foot.
      node.scaling.y = 0.55;
      const piece = MeshBuilder.CreateBox("selesTombPiece", { width: 0.5 * s, height: 0.18, depth: 0.4 }, scene);
      piece.position.set(p.x + 0.4, 0.09, p.z + 0.3);
      piece.rotation.y = rand() * 3;
      piece.material = stone;
      piece.parent = root;
      top *= 0.55;
    }
    tops.push(new Vector3(p.x, top, p.z));
    obstacles.add(p.x, p.z, 0.35);
  });
  // Dry grass between the stones and along the fences.
  const grass = grassSource(scene, rand);
  for (let k = 0; k < 40; k++) {
    const p = fromUV(C.u - 4 + rand() * 7, C.v - 5.5 + rand() * 10);
    place(grass, root, p.x, p.z, 0.6 + rand() * 0.5, rand() * Math.PI);
  }
  // Gnarled dead trees round it (the Stardust tomb is "directly in front of the tree").
  const bark = matte("selesDeadBark", scene, undefined, new Color3(0.24, 0.18, 0.14));
  deadTree(scene, root, rand, bark, fromUV(T.u - 1.8, T.v + 0.2), 1.3);
  deadTree(scene, root, rand, bark, fromUV(C.u - 1.4, C.v - 3.9), 1.5);
  deadTree(scene, root, rand, bark, fromUV(C.u + 1.8, C.v + 3.3), 1);
  // The small ruin beside it, at the top of the square.
  ruinHouse(scene, root, rand, stone, matte("selesCharred2", scene, undefined, new Color3(0.16, 0.11, 0.08)), { u: -15.8, v: -32.85 }, 2.8, 2.4, 0.15, 1.8);
  // Crows: one on a headstone, one on the fence post at the corner.
  tops = tops.slice(1);
  const ticks = [crow(scene, root, tops[(rand() * tops.length) | 0], rand), crow(scene, root, fromUV(-18.6, -41.6).add(new Vector3(0, 1.1, 0)), rand)];
  void wood;
  return ticks;
}

/**
 * A gnarled dead tree (PS1: the great twisted trunks of Seles): a thick trunk flaring at the foot,
 * twisting up, roots gripping the ground, crooked branches that fork. Merged into one mesh.
 */
function deadTree(scene: Scene, root: TransformNode, rand: () => number, bark: StandardMaterial, at: Vector3, s: number): void {
  const parts: Mesh[] = [];
  const lean = rand() * Math.PI * 2;
  const trunkPts: Vector3[] = [];
  for (let k = 0; k <= 4; k++) {
    const t = k / 4;
    const sway = 0.5 * s * Math.sin(t * 2.6 + lean) * t;
    trunkPts.push(new Vector3(at.x + Math.cos(lean) * sway + (rand() - 0.5) * 0.25 * s, t * 4.2 * s, at.z + Math.sin(lean) * sway + (rand() - 0.5) * 0.25 * s));
  }
  parts.push(limb("selesDeadTrunk", scene, trunkPts, 0.62 * s, 0.16 * s, rand));
  // Roots gripping the ground.
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + rand() * 0.6;
    const len = (1 + rand() * 0.9) * s;
    const pts = [0, 0.5, 1].map((f) => new Vector3(at.x + Math.cos(a) * len * f, 0.55 * s * (1 - f) ** 1.6, at.z + Math.sin(a) * len * f));
    parts.push(limb("selesDeadRoot", scene, pts, 0.28 * s, 0.05 * s, rand));
  }
  // Crooked branches, each forking once.
  for (let k = 0; k < 6; k++) {
    const from = trunkPts[2 + (k % 3)];
    const a = rand() * Math.PI * 2;
    const len = (1.4 + rand() * 1.8) * s;
    const pts = [0, 0.35, 0.7, 1].map((f) => new Vector3(
      from.x + Math.cos(a + f * 0.6) * len * f,
      from.y + len * (0.25 + 0.5 * f) * f + 0.3 * Math.sin(f * 5) * s,
      from.z + Math.sin(a + f * 0.6) * len * f,
    ));
    parts.push(limb("selesDeadBranch", scene, pts, 0.16 * s, 0.03, rand));
    const mid = pts[2];
    const b = a + (rand() < 0.5 ? -1 : 1) * (0.6 + rand() * 0.5);
    const l2 = len * 0.5;
    parts.push(limb("selesDeadTwig", scene, [mid, new Vector3(mid.x + Math.cos(b) * l2 * 0.5, mid.y + l2 * 0.4, mid.z + Math.sin(b) * l2 * 0.5), new Vector3(mid.x + Math.cos(b) * l2, mid.y + l2 * 0.5, mid.z + Math.sin(b) * l2)], 0.07 * s, 0.015, rand));
  }
  const tree = Mesh.MergeMeshes(parts, true, true);
  if (tree) {
    tree.material = bark;
    tree.parent = root;
  }
  obstacles.add(at.x, at.z, 0.7 * s);
}

function buildDeadTrees(scene: Scene, root: TransformNode, rand: () => number): void {
  const bark = matte("selesDeadBark2", scene, undefined, new Color3(0.22, 0.16, 0.12));
  for (const [u, v, s] of [[-6, 10, 1.1], [25, -9, 1.2], [5, -14, 1.1]] as const) {
    deadTree(scene, root, rand, bark, vilPoint(u, v), s);
  }
  deadTree(scene, root, rand, bark, fromUV(-8.4, -17.5), 1); // the yard's left edge
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
  run({ u: fenceU(-26), v: -26 }, { u: fenceU(-12), v: -12 }); // behind the chapel
  run({ u: -18.2, v: -28.8 }, { u: fenceU(-26), v: -26 }); // from the road out round to it
  run({ u: -18.6, v: -42.0 }, { u: -18.2, v: -31.8 }); // behind the cemetery
  run({ u: -18.6, v: -42.0 }, { u: -5.4, v: -43.05 }); // down its left side, to the gutted house
  run({ u: fenceU(-12), v: -12 }, { u: fenceU(9), v: 9 }, 8.5 / 21);
  run({ u: fenceU(9), v: 9 }, { u: fenceU(9) - 0.4, v: 16 });
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
  const startAt = selesPoint(SELES_SPOTS.start);
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
        if (roll < 0.12 && !NET.occludes(x, z, 12, 2.5) && Math.hypot(x - startAt.x, z - startAt.z) > 12) {
          at(pine, x, z, 0.8 + rand() * 0.5);
        } else if (roll < 0.16) at(rock, x, z, 0.6 + rand() * 0.8);
        // Short grass just behind the path's top: the third-person camera looks down over it.
        const behind = Math.hypot(x - startAt.x, z - startAt.z) < 12;
        for (let k = 0; k < 3; k++) at(grass, x + (rand() - 0.5) * STEP, z + (rand() - 0.5) * STEP, behind ? 0.45 + rand() * 0.2 : 1 + rand() * 0.6);
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

/**
 * The village's trodden earth, painted (GROUND_PPU) as one layer over the flat ground, like the
 * Forest's trails: the yard, the way past the chapel, the square, the way up to the cemetery and the
 * road out at the top — lighter, worn earth with a ragged edge, footprints and pebbles, the long
 * tree shadows carried across it. Stops where the hill starts (the hill paints its own path).
 */
function buildVillagePaths(scene: Scene, root: TransformNode, rand: () => number): Mesh {
  const U0 = -40;
  const U1 = 12;
  const V0 = -52;
  const V1 = 2;
  const W = (U1 - U0) * GROUND_PPU;
  const H = (V1 - V0) * GROUND_PPU;
  const tex = new DynamicTexture("selesPathTex", { width: W, height: H }, scene, false, Texture.NEAREST_SAMPLINGMODE);
  tex.hasAlpha = true;
  tex.wrapU = tex.wrapV = Texture.CLAMP_ADDRESSMODE;
  const ctx = tex.getContext() as CanvasRenderingContext2D;
  const img = ctx.createImageData(W, H);
  const out = img.data;
  for (let y = 0; y < H; y++) {
    const v = V1 - (y + 0.5) / GROUND_PPU;
    for (let x = 0; x < W; x++) {
      const u = U0 + (x + 0.5) / GROUND_PPU;
      if (hillDepth(u, v) > 0.2) continue;
      const p = fromUV(u, v);
      const n = NET.nearest(p.x, p.z);
      const edge = n.d - n.w * 0.8 + (noise2(u * 1.1, v * 1.1) - 0.5) * 1.2;
      if (edge > 0) continue;
      if (edge > -0.5 && rand() < 0.4) continue; // ragged rim
      const mottle = 0.86 + 0.24 * noise2(u * 0.7 + 11, v * 0.7);
      let k = mottle * (0.92 + rand() * 0.16) * (edge > -0.5 ? 0.9 : 1);
      const shade = noise2(u * 0.22 - v * 0.3 + 3, v * 0.12 + u * 0.05);
      k *= 1 - 0.5 * smooth(0.53, 0.59, shade); // the long tree shadows across the square (PS1)
      let [r, g, b] = [146 * k, 110 * k, 76 * k];
      const speck = hash01(Math.floor(u * 10), Math.floor(v * 10));
      if (speck < 0.012) [r, g, b] = [178 * k, 146 * k, 108 * k]; // pebble
      else if (speck < 0.03) [r, g, b] = [96 * k, 70 * k, 48 * k]; // a clod
      // The raid's tracks: two cart ruts either side of each path's middle, and hoof prints
      // trampled along it (PS1: the knights rode through).
      if (Math.abs(n.d - 0.75) < 0.07 && noise2(u * 0.5, v * 0.5) > 0.3) [r, g, b] = [r * 0.84, g * 0.83, b * 0.82];
      const hoof = hash01(Math.floor(u * 3.2) + 17, Math.floor(v * 3.2));
      const frac = (x: number): number => x - Math.floor(x);
      const inCell = Math.hypot(frac(u * 3.2) - 0.5, frac(v * 3.2) - 0.5);
      if (n.d < 1.6 && hoof < 0.1 && inCell < 0.22) [r, g, b] = [r * 0.66, g * 0.64, b * 0.62];
      const o = (y * W + x) * 4;
      out[o] = r;
      out[o + 1] = g;
      out[o + 2] = b;
      out[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  tex.update();
  const mesh = gridMesh("selesPaths", scene, V1 - V0, U1 - U0, (i, j) => {
    const u = U0 + j;
    const v = V0 + i;
    const p = fromUV(u, v);
    return { x: p.x, y: 0.02, z: p.z, tu: (u - U0) / (U1 - U0), tv: (v - V0) / (V1 - V0) };
  }, Vector3.Up());
  const mat = matte("selesPathMat", scene, tex);
  mat.zOffset = -2; // on the ground without z-fighting
  mesh.material = mat;
  mesh.parent = root;
  return mesh;
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
  const spots = [[-2, 8.5], [14, -10]].map(([u, v]) => vilPoint(u, v));
  spots.push(fromUV(13.4, -20)); // the kids' house
  spots.push(fromUV(-5.4, -24.6), fromUV(-4.4, -20.6), fromUV(-8.8, -21.4)); // inside the chapel, its tower
  // The yard's wrecks, and the houses below it.
  spots.push(fromUV(-6.4, 3.6), fromUV(-4.6, 6), fromUV(2.2, -3.6), fromUV(3.4, 2.4), fromUV(3.6, -8.4), fromUV(8.6, 5.4), fromUV(7.8, -1.8), fromUV(8.4, -10.6));
  for (const at of spots) {
    const ps = new ParticleSystem("selesSmoke", 70, scene);
    ps.particleTexture = dot;
    ps.emitter = new Vector3(at.x, 1.5, at.z);
    ps.minEmitBox = new Vector3(-1, 0, -1);
    ps.maxEmitBox = new Vector3(1, 0.5, 1);
    ps.blendMode = ParticleSystem.BLENDMODE_STANDARD;
    // Morning smoke: grey, rising tall in the still air before it drifts off.
    ps.color1 = new Color4(0.4, 0.37, 0.35, 0.4);
    ps.color2 = new Color4(0.5, 0.47, 0.44, 0.3);
    ps.colorDead = new Color4(0.5, 0.48, 0.46, 0);
    ps.minSize = 1.2;
    ps.maxSize = 3;
    ps.minLifeTime = 6;
    ps.maxLifeTime = 10;
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
