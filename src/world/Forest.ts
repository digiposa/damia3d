import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { VertexBuffer } from "@babylonjs/core/Buffers/buffer";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { Constants } from "@babylonjs/core/Engines/constants";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Scene } from "@babylonjs/core/scene";
import "@babylonjs/core/Meshes/instancedMesh";

import { softDotTexture } from "./atmosphere";
import { buildForestLife } from "./forestLife";
import { LIGHTING_PRESETS, type LightingPreset } from "./lighting";
import { AreaLight } from "./kit/areaLight";
import { FWD, SIDE, TAN_BETA, fromUV, toUV } from "./kit/frame";
import { Obstacles } from "./kit/obstacles";
import { TrailNet, type Knot, type TrailSample } from "./kit/trails";
import { WalkMask, type Canopy } from "./kit/walkMask";
import { mulberry32, pixelTexture, rgb } from "./paint";
import { LEAF_SHADE, LEAF_SUN, PLAIN, cardSource, gradeColors, gridMesh, jitter, limb, matte, mergeSource, place } from "./kit/mesh";
import { barkTexture, bushSource, fernSource, flowerSource, grassSource, groveSource, leafTexture, rockSource, saplingSource, treeSource } from "./kit/flora";

import type { World } from "./World";

/**
 * The Forest east of Seles, after the PS1 screens: the merchant's cart track (624) winding up
 * through bushes, trunks and shafts of sunlight, the deeper wood, then a ravine crossed on a fallen
 * tree and a cliff top looking out over the sunset. Built entirely in code, like the Lohan arena:
 * no model, no image file.
 *
 * One continuous map: the five areas of the console's Forest ({@link FOREST_ZONES}) follow each
 * other along a single seamless track.
 *
 * The camera never rotates, so the set is dressed FOR it:
 *  - the track runs "up the screen" (towards -x/+z), the way the PS1 field screens scroll;
 *  - tall trees only stand where they cannot hide anyone on the track — behind it and to its
 *    sides. Between the track and the camera, only low growth (ferns, bushes, rocks, saplings).
 *    That rule is computed per tree ({@link occludesTrack}), not hand-placed;
 *  - the canopy is mostly off the top of the frame: what you see are trunks, roots and the light.
 *
 * Coordinates: the track is authored in a local (u, v) frame — u "up the screen", v sideways —
 * and {@link forestPoint} maps it to the world.
 */

/**
 * The main track, start to end: control points (u, v) and the walkable half-width there (clearings
 * are wider, the fallen-tree bridges narrow). It ends at the fork; {@link BRANCHES} carry on.
 */
const TRACK: Knot[] = [
  // (the road in from Seles, running on out of sight behind the camera — not walkable that far)
  { u: -34, v: 2.5, w: 3.4 },
  { u: -20, v: 1.2, w: 3.4 },
  // 1 — the merchant's cart track (624)
  { u: -9, v: 0.5, w: 3.4 },
  { u: 0, v: 0, w: 3.8 },
  { u: 8, v: 2.6, w: 3.6 },
  { u: 16, v: 0.8, w: 6.2 }, // clearing — first encounter
  { u: 24, v: -2.8, w: 3.6 },
  { u: 32, v: -2.2, w: 4.0 },
  // 2 — the first ravine: a fallen tree across it, the cliff and the sea on the right
  { u: 40, v: -0.6, w: 3.4 },
  { u: 44.8, v: -0.4, w: 1.0 }, // onto the trunk…
  { u: 48, v: -0.3, w: 0.7 },
  { u: 51.4, v: -0.2, w: 1.0 }, // …and off it
  { u: 55, v: 0.6, w: 3.2 },
  { u: 60, v: 1.2, w: 4.6 }, // cliff-top clearing
  // 3 — the maze: crossing trails in dense wood ({@link BRANCHES} are its dead ends)
  { u: 68, v: -1, w: 3.2 },
  { u: 73, v: -4, w: 3.4 },
  { u: 79, v: -2, w: 3.2 },
  { u: 85, v: 3, w: 3.6 },
  { u: 91, v: 1, w: 3.2 },
  { u: 97, v: -2, w: 3.4 },
  // 4 — the gorge: the second fallen tree ("leave Shana alone")
  { u: 103, v: -0.4, w: 3.4 },
  { u: 108.6, v: 0.2, w: 1.0 },
  { u: 112, v: 0.2, w: 0.7 },
  { u: 115.4, v: 0.3, w: 1.0 },
  { u: 119, v: 0.5, w: 3.2 },
  // 5 — the last stretch: open, grassy, forking towards Hellena and the Prairie
  { u: 126, v: -0.5, w: 3.6 },
  { u: 133, v: 0.4, w: 4.6 },
];

/** Side trails: the maze's dead ends, and the two roads out at the fork. Each starts on the main track. */
const BRANCHES: Knot[][] = [
  [{ u: 73, v: -4, w: 3.0 }, { u: 76, v: -10, w: 2.8 }, { u: 80, v: -13, w: 3.2 }],
  [{ u: 85, v: 3, w: 3.0 }, { u: 86, v: 9, w: 2.8 }, { u: 82, v: 14, w: 3.2 }],
  [{ u: 91, v: 1, w: 3.0 }, { u: 94, v: -7, w: 2.8 }, { u: 99, v: -11, w: 3.2 }],
  [{ u: 79, v: -2, w: 2.8 }, { u: 82, v: 2.5, w: 2.6 }], // a short cut between two trails
  // The two roads out, running on past the end of the map until they leave the screen.
  [{ u: 133, v: 0.4, w: 3.4 }, { u: 140, v: -4.5, w: 3.2 }, { u: 150, v: -8, w: 3.0 }, { u: 162, v: -10, w: 3.0 }, { u: 178, v: -11, w: 3.0 }], // → Hellena
  [{ u: 133, v: 0.4, w: 3.4 }, { u: 140, v: 5.5, w: 3.2 }, { u: 150, v: 9, w: 3.0 }, { u: 162, v: 11, w: 3.0 }, { u: 178, v: 12, w: 3.0 }], // → the Prairie
  // Footpaths to the chests off the main track (the wiki's "upper path" by the merchant, and the
  // one hidden in the trees past the first bridge) — narrow, but always walkable.
  [{ u: 10, v: 1.6, w: 1.6 }, { u: 10.6, v: -4, w: 1.5 }, { u: 11, v: -7.4, w: 2.2 }],
  [{ u: 56, v: 0.8, w: 1.6 }, { u: 56.6, v: -4, w: 1.5 }, { u: 57, v: -6.9, w: 2.2 }],
];

/** A stretch of the Forest: one of the console's screens, here an area of the seamless map. */
export interface ForestZone {
  id: string;
  u0: number;
  u1: number;
}

/** The areas of the Forest, in walking order (u ranges along the track). */
export const FOREST_ZONES: ForestZone[] = [
  { id: "merchant", u0: -9, u1: 36 }, // the merchant's path
  { id: "ravine", u0: 36, u1: 65 }, // the first fallen tree, the sea in the distance
  { id: "maze", u0: 65, u1: 100 },
  { id: "gorge", u0: 100, u1: 122 }, // the second fallen tree
  { id: "fork", u0: 122, u1: 150 }, // the roads to Hellena and the Prairie
];

/** The Forest's four chests (wiki: Healing Potion on the merchant's upper path, Charm Potion behind
 *  the trees past the first bridge, 20 G and Burn Out at the maze's right and left lower edges). */
export const FOREST_CHESTS: { id: string; u: number; v: number }[] = [
  { id: "healingPotion", u: 11, v: -8.5 },
  { id: "charmPotion", u: 57, v: -8 },
  { id: "gold20", u: 82.6, v: 14.8 },
  { id: "burnOut", u: 80.6, v: -13.8 },
];

/** Where the travelling merchant stands, by his cart (submap 624). */
export const MERCHANT_SPOT = { u: 6, v: -3.4 };

/** Where Dart's "leave Shana alone" memory plays, just past the gorge (scene to come). */
export const SHANA_SCENE_SPOT = { u: 118, v: 0.5 };

/** Spots the vegetation must leave clear (chests, the merchant). */
const CLEARINGS = [...FOREST_CHESTS, MERCHANT_SPOT].map((c) => forestPoint(c.u, c.v));

// --- Ravines and cliff (in the local u, v frame) --------------------------------------

/** A ravine cutting across the whole wood: centre line u = c + amp·sin(0.15·v), half-width ≈ h. */
interface Ravine {
  c: number;
  amp: number;
  h: number;
  /** v where the track crosses it (on a fallen trunk). */
  bridgeV: number;
}

const RAVINES: Ravine[] = [
  { c: 48, amp: 1.5, h: 2.8, bridgeV: -0.3 },
  { c: 112, amp: 1.2, h: 2.6, bridgeV: 0.2 },
];

const ravineC = (r: Ravine, v: number): number => r.c + r.amp * Math.sin(0.15 * v);

const ravineH = (r: Ravine, v: number): number => r.h + 0.6 * Math.sin(0.3 * v + r.c);

/**
 * The cliff edge (v) on the first ravine's screen: past it the ground drops away to the sea. Away
 * from that screen the edge swings off the map (no cliff).
 */
const cliffE = (u: number): number =>
  6.8 + 1.2 * Math.sin(0.4 * u) + 1.2 * Math.max(0, 42 - u) ** 2 + 1.2 * Math.max(0, u - 64) ** 2;

/** Depth of the ravine floors. */
const RAVINE_DEPTH = 16;

/** Local (u, v) of a world position: u along the wood, v sideways. */
export function forestUV(p: Vector3): { u: number; v: number } {
  return toUV(p.x, p.z);
}

/** No ground here: inside a ravine, or over the cliff edge. */
function inVoid(u: number, v: number, margin = 0): boolean {
  for (const r of RAVINES) if (Math.abs(u - ravineC(r, v)) < ravineH(r, v) + margin) return true;
  return v > cliffE(u) - margin;
}

/** Half-width of the beaten dirt itself (the walkable corridor is wider: grass on both sides). */
const DIRT_HALF = 2.3; // the reference track is broad: a cart road, not a footpath

/** World position of the local track coordinates (u along the screen's up, v sideways). */
/** Where the main track crosses `u` (entry points, spawns). */
export function trackPointAt(u: number): Vector3 {
  let best = TRAILS[0][0];
  let bestD = Infinity;
  for (const s of TRAILS[0]) {
    const d = Math.abs(toUV(s.p.x, s.p.z).u - u);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best.p.clone();
}

export function forestPoint(u: number, v: number): Vector3 {
  return fromUV(u, v); // a function declaration (hoisted): module-level data below already uses it
}

/** Every trail: the main track first, then the branches. */
const NET = new TrailNet([TRACK, ...BRANCHES]);
const TRAILS = NET.trails;
const nearestOnTrack = (x: number, z: number): ReturnType<TrailNet["nearest"]> => NET.nearest(x, z);
const occludesTrack = (x: number, z: number, height: number, crown: number, minUp?: number): boolean =>
  NET.occludes(x, z, height, crown, minUp);

/** Solid things standing in (or at the edge of) the walkable corridor (rebuilt per visit). */
let obstacles = new Obstacles();
/** What each tree takes back from the walkable ground (rebuilt per visit). */
const canopies: Canopy[] = [];

/**
 * Where you may walk: the trails, plus the flat open grass around them that no tree stands over —
 * not under a crown, and not where a crown would hide you from the camera. The wood is scenery.
 */
let mask = new WalkMask({ u0: -20, u1: 170, v0: -45, v1: 45 });

/** Fill the walk mask once the set is dressed (trails, open grass, minus what the trees hold). */
function buildMask(): void {
  mask.fill((u, v) => {
    if (inVoid(u, v, 0.3) || u < MAP_START_U || u > MAP_END_U) return 0;
    const { x, z } = forestPoint(u, v);
    const n = nearestOnTrack(x, z);
    // In the maze only the trails themselves are walkable: its hedges are the walls.
    const reach = u > MAZE_U0 && u < MAZE_U1 ? 0.6 : OPEN_REACH;
    return n.d <= n.w ? 2 : n.d <= n.w + reach ? 1 : 0;
  });
  for (const c of canopies) mask.removeCanopy(c);
}

/** Half-width of a fallen trunk's walkable top. */
const LOG_HALF = 0.45;

/** How far off the trails the open, tree-free grass stays walkable. */
const OPEN_REACH = 12;

/** The maze's stretch (u): hedged trails, nothing walkable between them. */
const MAZE_U0 = 66;

const MAZE_U1 = 100;

/** The walkable stretch of the map (u): the roads in and out run on past these ends, out of
 *  reach — that is where the transitions to Seles / Hellena / the Prairie will go. */
export const MAP_START_U = -12;

export const MAP_END_U = 152;

/**
 * Keep a ground position walkable (mutates `p`): on a trail or the open grass beside it (see the
 * walk mask), across a ravine only along a fallen trunk, never over the cliff, never through a
 * trunk, rock or prop.
 */
export function clampToForest(p: Vector3, margin = 0.4): void {
  let { u, v } = toUV(p.x, p.z);
  let onBridge = false;
  // Ravines: on a bridge you stay on the trunk; anywhere else you are held at the nearer lip.
  for (const r of RAVINES) {
    const c = ravineC(r, v);
    const h = ravineH(r, v) + margin;
    if (Math.abs(u - c) >= h) continue;
    if (Math.abs(v - r.bridgeV) < LOG_HALF + 0.35) {
      v = Math.min(r.bridgeV + LOG_HALF, Math.max(r.bridgeV - LOG_HALF, v));
      onBridge = true;
    } else {
      u = u < c ? c - h : c + h;
    }
  }
  const edge = cliffE(u) - margin;
  if (v > edge) v = edge;

  // Off the walkable ground: step back onto the nearest walkable cell.
  if (!onBridge && !mask.walkable(u, v)) {
    const best = mask.nearestWalkable(u, v);
    if (best) {
      u = best.u;
      v = best.v;
    } else {
      // Lost far off (shouldn't happen): back to the nearest trail.
      const at = forestPoint(u, v);
      const n = nearestOnTrack(at.x, at.z);
      ({ u, v } = toUV(n.px, n.pz));
    }
  }
  const back = forestPoint(u, v);
  p.x = back.x;
  p.z = back.z;

  // Trunks, rocks and props: slide round them.
  obstacles.pushOut(p, margin);
}

/** The Forest as a combat world, plus its interactive bits for the Story mode. */
export interface ForestWorld extends World {
  /** World position of each chest, by id. */
  chests: Map<string, Vector3>;
  /** Swing a chest's lid open (once). */
  openChest(id: string): void;
  /** The merchant's head height point, to anchor his speech bubble. */
  merchantHead: Vector3;
}

export function forestWorld(scene: Scene): ForestWorld {
  obstacles = new Obstacles();
  canopies.length = 0;
  mask = new WalkMask({ u0: -20, u1: 170, v0: -45, v1: 45 });
  const light = new AreaLight(LIGHT_KEYS, LIGHTING_PRESETS.forestDay);
  const root = new TransformNode("forest", scene); // decor
  const fixed = new TransformNode("forestFixed", scene); // floor, track, rock walls, sea
  const rand = mulberry32(0x0f0e57); // fixed seed: the same forest every visit

  const floors = buildTerrain(scene, fixed, rand);
  const track = buildTrack(scene, fixed, rand);
  const trees = buildVegetation(scene, root, rand);
  buildCart(scene, root);
  buildFallenLog(scene, root);
  RAVINES.forEach((r, k) => buildBridge(scene, root, r, k, rand));
  buildGorgeVines(scene, root, rand);
  buildSignpost(scene, root);
  const chests = buildChests(scene, root);
  const merchantHead = buildMerchant(scene, root);
  buildDeadTree(scene, root, rand);
  buildCliffRim(scene, root, rand);
  buildMeadow(scene, root, rand);
  buildUndergrowth(scene, root, rand);
  shadeGround([...floors, track], trees);
  buildSunShafts(scene, root, rand);
  buildSky(scene, fixed);
  buildRavineMist(scene, fixed);
  buildPollen(scene);

  obstacles.index();
  buildMask();
  buildForestLife(scene, (x, z) => {
    const { u, v } = toUV(x, z);
    return mask.walkable(u, v);
  });
  for (const m of [...root.getChildMeshes(), ...fixed.getChildMeshes()]) {
    m.isPickable = false; // decor never swallows clicks
    if (!m.name.startsWith("forestChestLid")) m.freezeWorldMatrix();
  }
  return {
    clamp: clampToForest,
    preset: LIGHTING_PRESETS.forestDay,
    framing: 2.5,
    shadowReceivers: [...floors, track],
    ownFill: [],
    presetAt: (p) => light.at(toUV(p.x, p.z).u),
    shotAt: (p) => forestShotAt(toUV(p.x, p.z)),
    update: (_focus, dt) => {
      for (const c of chests.values()) c.tick(dt);
    },
    chests: new Map([...chests].map(([id, c]) => [id, c.at])),
    openChest: (id) => chests.get(id)?.open(),
    merchantHead,
  };
}

/**
 * The light along the wood, area by area — golden on the merchant's path, rose and open on the
 * cliff, deep and green in the maze, full sun on the meadow — blended as you walk (no cut).
 */
const LIGHT_KEYS: [number, LightingPreset][] = [
  [-50, LIGHTING_PRESETS.forestDay],
  [32, LIGHTING_PRESETS.forestDay],
  [44, LIGHTING_PRESETS.forestCliff],
  [62, LIGHTING_PRESETS.forestCliff],
  [71, LIGHTING_PRESETS.forestDeep],
  [96, LIGHTING_PRESETS.forestDeep],
  [104, LIGHTING_PRESETS.forestDay],
  [120, LIGHTING_PRESETS.forestDay],
  [129, LIGHTING_PRESETS.forestMeadow],
];

/**
 * The Forest's framed moments — the iso view, just recomposed for a beat: pulled back and looking
 * out to sea at the cliff edge, closer on the fallen-tree bridges, and opened up on the fork with
 * the two roads ahead. Zones are soft (the zoom blends in over ~1 s as you walk in).
 */
function forestShotAt({ u, v }: { u: number; v: number }): { zoom: number; offset?: Vector3 } | null {
  // On a bridge: closer, the drop on both sides.
  for (const r of RAVINES) if (Math.abs(u - ravineC(r, v)) < ravineH(r, v) + 1.5 && Math.abs(v - r.bridgeV) < 2) return { zoom: 1.18 };
  // The cliff top: wider, the view shifted out over the sea.
  if (u > 50 && u < 64 && v > 0) return { zoom: 0.82, offset: SIDE.scale(4).addInPlace(FWD.scale(1)) };
  // The fork: wider, looking up both roads.
  if (u > 129 && u < 140) return { zoom: 0.85, offset: FWD.scale(4) };
  return null;
}

/** Extent of the terrain in the local frame (well past what the camera can see). */
const U_MIN = -50;

const U_MAX = 200;

const V_MIN = -60;

const V_MAX = 60;

/**
 * The ground: the wood's floor up to the ravine, the floor beyond it up to the cliff edge, the
 * ravine's bottom, and its sandstone walls. The grids are laid out per row so the ravine's edges
 * are exact, smooth curves — no staircase where a regular grid would cut them. Past the cliff edge
 * the far floor's vertices fold onto the edge line (zero-area triangles): nothing there but sky.
 */
function buildTerrain(scene: Scene, parent: TransformNode, rand: () => number): Mesh[] {
  const tex = pixelTexture("forestGrassTex", scene, 128, 128, (ctx, w, h) => {
    // Moss and short grass: a mottled base, then blades, then the odd flower and twig.
    for (let y = 0; y < h; y += 4)
      for (let x = 0; x < w; x += 4) {
        const k = 0.82 + rand() * 0.3;
        ctx.fillStyle = rgb(76 * k, 82 * k, 38 * k); // olive, warm — never a cold lawn green
        ctx.fillRect(x, y, 4, 4);
      }
    for (let i = 0; i < 900; i++) {
      const x = (rand() * w) | 0;
      const y = (rand() * h) | 0;
      const k = 0.7 + rand() * 0.7;
      ctx.fillStyle = rgb(108 * k, 108 * k, 46 * k);
      ctx.fillRect(x, y, 1, 2 + ((rand() * 3) | 0));
    }
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = rgb(44 + rand() * 20, 40 + rand() * 14, 22);
      ctx.fillRect((rand() * w) | 0, (rand() * h) | 0, 2, 1); // dead leaves, twigs
    }
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = rand() < 0.5 ? "rgb(210,196,92)" : "rgb(206,206,190)";
      ctx.fillRect((rand() * w) | 0, (rand() * h) | 0, 1, 1); // tiny flowers
    }
  });
  const grass = matte("forestFloorMat", scene, tex);

  const rows = V_MAX - V_MIN;
  const rowV = (i: number): number => V_MIN + i;
  const ground = (u: number, v: number, y: number) => {
    const p = forestPoint(u, v);
    return { x: p.x, y, z: p.z, tu: u / 6, tv: v / 6 };
  };

  // Floors between the ravines: start → first near lip, far lip → next near lip, … → end. Past the
  // cliff edge the vertices fold onto the edge line.
  const floors: Mesh[] = [];
  const edges: ((v: number) => number)[] = [
    () => U_MIN,
    ...RAVINES.flatMap((r) => [(v: number) => ravineC(r, v) - ravineH(r, v), (v: number) => ravineC(r, v) + ravineH(r, v)]),
    () => U_MAX,
  ];
  for (let f = 0; f + 1 < edges.length; f += 2) {
    const from = edges[f];
    const to = edges[f + 1];
    const cols = 60;
    floors.push(
      gridMesh(`forestFloor${f / 2}`, scene, rows, cols, (i, j) => {
        const v = rowV(i);
        const u = from(v) + (to(v) - from(v)) * (j / cols);
        return ground(u, Math.min(v, cliffE(u)), 0);
      }, Vector3.Up()),
    );
  }
  // Ravine floors, folded the same way where a ravine opens over the cliff.
  RAVINES.forEach((r, k) => {
    floors.push(
      gridMesh(`forestRavineFloor${k}`, scene, rows, 4, (i, j) => {
        const v = rowV(i);
        const u = ravineC(r, v) - ravineH(r, v) + 2 * ravineH(r, v) * (j / 4);
        return ground(u, Math.min(v, cliffE(u) + 2), -RAVINE_DEPTH);
      }, Vector3.Up()),
    );
  });
  for (const m of floors) {
    m.material = grass;
    m.parent = parent;
  }

  // Walls: layered red sandstone, the strata of the cliff screens.
  const strata = pixelTexture("forestStrataTex", scene, 64, 128, (ctx, w, h) => {
    // Wavy sediment bands, each its own shade of red-orange sandstone, edges eroded column by
    // column so they read as rock layers rather than courses of brick.
    const bands: { y: number; k: number }[] = [];
    for (let y = 0; y < h; y += 4 + ((rand() * 10) | 0)) bands.push({ y, k: 0.68 + rand() * 0.45 });
    const phase = rand() * 6;
    for (let x = 0; x < w; x++) {
      const wave = Math.sin((x / w) * Math.PI * 2 + phase) * 2;
      for (let y = 0; y < h; y++) {
        const yy = y + wave + (rand() < 0.15 ? 1 : 0);
        let k = bands[0].k;
        for (const b of bands) if (b.y <= yy) k = b.k;
        const n = 0.92 + rand() * 0.14;
        ctx.fillStyle = rgb(168 * k * n, 100 * k * n, 68 * k * n);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    for (let i = 0; i < 18; i++) {
      ctx.fillStyle = rgb(92, 52, 36); // a few fissures
      ctx.fillRect((rand() * w) | 0, (rand() * h) | 0, 1, 2 + ((rand() * 5) | 0));
    }
  });
  const stone = matte("forestStrataMat", scene, strata);
  const wall = (name: string, r: Ravine, side: 1 | -1, facing: Vector3): Mesh => {
    const m = gridMesh(name, scene, rows, 1, (i, j) => {
      const v = rowV(i);
      const u = ravineC(r, v) + side * ravineH(r, v);
      const p = forestPoint(u, Math.min(v, cliffE(u) + 2));
      return { x: p.x, y: j === 0 ? 0.02 : -RAVINE_DEPTH, z: p.z, tu: v / 4, tv: j === 0 ? 0 : RAVINE_DEPTH / 8 };
    }, facing);
    // Darker the deeper it goes: the gorge's depth is in this gradient.
    const pos = m.getVerticesData(VertexBuffer.PositionKind)!;
    const col: number[] = [];
    for (let q = 1; q < pos.length; q += 3) {
      const t = Math.max(0, -pos[q] / RAVINE_DEPTH);
      const k = 1 - 0.85 * Math.sqrt(t);
      col.push(k, k * 0.95, k * 0.92, 1);
    }
    m.setVerticesData(VertexBuffer.ColorKind, col);
    m.material = stone;
    m.parent = parent;
    return m;
  };
  // The cliff face down to the sea: a steep slope rather than a sheer drop, so the iso camera (which
  // looks straight along the edge) actually sees its strata.
  // It runs along the WHOLE edge — including where the edge curves away inland at both ends, until
  // it leaves the terrain — and always falls away perpendicular to the edge, so it never stops on a
  // straight cut with the sea showing past it.
  let cu0 = 52;
  while (cu0 > U_MIN && cliffE(cu0) < V_MAX + 2) cu0 -= 0.5;
  let cu1 = 52;
  while (cu1 < U_MAX && cliffE(cu1) < V_MAX + 2) cu1 += 0.5;
  const cliffCols = 120;
  const cliff = gridMesh("forestCliffFace", scene, 4, cliffCols, (i, j) => {
    const u = cu0 + (cu1 - cu0) * (j / cliffCols);
    const e = cliffE(u);
    // Outward normal of the edge curve v = e(u), in the local (u, v) plane.
    const de = (cliffE(u + 0.05) - cliffE(u - 0.05)) / 0.1;
    const len = Math.hypot(de, 1);
    const nu = -de / len;
    const nv = 1 / len;
    const f = i / 4; // 0 = the lip … 1 = the foot, in the sea
    const out = 9 * Math.pow(f, 0.8);
    const p = forestPoint(u + nu * out, Math.min(V_MAX + 4, e) + nv * out);
    return { x: p.x, y: f === 0 ? 0.02 : -26 * f, z: p.z, tu: u / 4, tv: f * 3.4 };
  }, new Vector3(SIDE.x, 1, SIDE.z));
  cliff.material = stone;
  cliff.parent = parent;
  RAVINES.forEach((r, k) => {
    wall(`forestRavineFarWall${k}`, r, 1, FWD.scale(-1)); // faces the camera: the one you see
    wall(`forestRavineNearWall${k}`, r, -1, FWD);
  });
  return floors;
}

/**
 * Light and shade painted into the floor's vertex colours: sun patches where the canopy opens,
 * a darker floor deep in the wood and under each tree. (Trees don't cast real shadows — the shadow
 * map is kept tight on the fighters, where it matters.)
 */
function shadeGround(meshes: Mesh[], trees: { x: number; z: number; r: number }[]): void {
  for (const mesh of meshes) {
    const pos = mesh.getVerticesData(VertexBuffer.PositionKind);
    if (!pos) continue;
    const colors = new Float32Array((pos.length / 3) * 4);
    for (let i = 0, c = 0; i < pos.length; i += 3, c += 4) {
      const x = pos[i] + mesh.position.x;
      const z = pos[i + 2] + mesh.position.z;
      // Dapple: two slanted sine fields → irregular, fairly crisp blobs of sun (0 shade … 1 lit).
      const n = Math.sin(x * 0.37 + Math.sin(z * 0.23) * 1.7) * Math.cos(z * 0.31 - Math.sin(x * 0.19) * 1.3);
      const sun = Math.min(1, Math.max(0, n * 2.6 + 0.3));
      const d = nearestOnTrack(x, z).d;
      const deep = Math.min(1, Math.max(0, (d - 7) / 14)); // the wood darkens away from the track
      let k = (0.58 + 0.5 * sun) * (1 - 0.5 * deep);
      const lu = toUV(x, z).u;
      if (lu > 50 && lu < 64) k = Math.min(1.15, k * 1.25 + 0.12); // open sky: brighter
      if (lu > 122) k = Math.min(1.3, k * 1.35 + 0.25 * Math.min(1, (lu - 122) / 6)); // the meadow, in full sun
      if (pos[i + 1] < -1) k = 0.18; // the ravine's bottom, in deep shade
      for (const t of trees) {
        const td = Math.hypot(x - t.x, z - t.z);
        if (td < t.r) k *= 0.7 + 0.3 * (td / t.r);
      }
      // Past the ravine the ground dries out under the open sky: warmer, more golden.
      const dry = Math.min(1, Math.max(0, (toUV(x, z).u - 74) / 10));
      colors[c] = k * (1 + 0.18 * dry);
      colors[c + 1] = k * (0.97 + 0.02 * dry);
      colors[c + 2] = k * (0.9 - 0.15 * dry);
      colors[c + 3] = 1;
    }
    mesh.setVerticesData(VertexBuffer.ColorKind, colors, false, 4);
  }
}

// --- The track -------------------------------------------------------------------

/** Extent and resolution of the painted dirt layer (local u, v; pixels per unit). */
const DIRT_U0 = -42;

const DIRT_U1 = 186;

const DIRT_V0 = -20;

const DIRT_V1 = 20;

const DIRT_PPU = 10;

/**
 * The beaten earth of every trail, painted as ONE texture over the whole map rather than a ribbon
 * per trail: each trail stamps discs of dirt along its length into a shared mask, so where trails
 * meet they simply merge — one rounded junction with one ragged edge, instead of overlapping
 * strips with crossing borders. The cart ruts follow the main track. The layer is a flat mesh just
 * above the floor, alpha-tested on the painted mask (crisp pixel edges, like the rest of the set).
 */
function buildTrack(scene: Scene, root: TransformNode, rand: () => number): Mesh {
  const W = (DIRT_U1 - DIRT_U0) * DIRT_PPU;
  const H = (DIRT_V1 - DIRT_V0) * DIRT_PPU;
  // Texture pixel of a local point (canvas rows run from v = DIRT_V1 down: the texture is flipped).
  const px = (u: number): number => (u - DIRT_U0) * DIRT_PPU;
  const py = (v: number): number => (DIRT_V1 - v) * DIRT_PPU;

  const mask = document.createElement("canvas");
  mask.width = W;
  mask.height = H;
  const m = mask.getContext("2d")!;
  m.fillStyle = "#fff";
  const ruts = document.createElement("canvas");
  ruts.width = W;
  ruts.height = H;
  const r = ruts.getContext("2d")!;
  r.strokeStyle = "#fff";
  r.lineCap = "round";

  TRAILS.forEach((trail, ti) => {
    const head = trail[0];
    const last = trail[trail.length - 1];
    // Extension points every half unit past the open ends, so the taper has room.
    const extend = (from: TrailSample, dir: number, len: number): { p: Vector3; t: Vector3 }[] =>
      Array.from({ length: Math.ceil(len / 0.5) }, (_, k) => ({ p: from.p.add(from.t.scale(dir * 0.5 * (k + 1))), t: from.t }));
    const pts = [
      ...(ti === 0 ? extend(head, -1, 6).reverse() : []),
      ...trail,
      ...extend(last, 1, ti === 0 ? 2 : head.w < 2 ? 1 : 5), // a footpath ends just past its chest
    ];
    // Open ends taper off (the main track's start, every branch's far end), so a trail peters out
    // into the grass. The main track's far end vanishes into the fork, a branch's start into the
    // track it leaves.
    let total = 0;
    for (let i = 1; i < pts.length; i++) total += Vector3.Distance(pts[i - 1].p, pts[i].p);
    const TAPER = ti === 0 ? 6 : head.w < 2 ? 1.5 : 5;
    // Branches are narrower; a footpath's dirt never runs wider than its walkable corridor.
    const base = ti === 0 ? DIRT_HALF : Math.min(DIRT_HALF * 0.8, head.w * 0.75);
    let along = 0;
    let rutL: { u: number; v: number }[] = [];
    let rutR: { u: number; v: number }[] = [];
    const flushRuts = (): void => {
      for (const line of [rutL, rutR]) {
        if (line.length < 2) continue;
        r.lineWidth = 0.32 * DIRT_PPU;
        r.beginPath();
        r.moveTo(px(line[0].u), py(line[0].v));
        for (const q of line) r.lineTo(px(q.u), py(q.v));
        r.stroke();
      }
      rutL = [];
      rutR = [];
    };
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1].p;
      const b = pts[i].p;
      const seg = Vector3.Distance(a, b);
      const steps = Math.max(1, Math.ceil(seg / 0.2));
      for (let k = 0; k < steps; k++) {
        const f = k / steps;
        const p = Vector3.Lerp(a, b, f);
        const d = along + seg * f;
        const fromStart = ti === 0 ? d / TAPER : 1;
        const toEnd = ti === 0 ? 1 : (total - d) / TAPER;
        const taper = Math.sqrt(Math.max(0, Math.min(1, fromStart, toEnd))); // rounded, not pointed
        const half = base * taper * (0.92 + (0.16 + 0.3 * (1 - taper)) * Math.sin(d * 0.7 + rand() * 3));
        if (half <= 0.05) continue;
        const { u, v } = toUV(p.x, p.z);
        m.beginPath();
        m.arc(px(u), py(v), half * DIRT_PPU, 0, Math.PI * 2);
        m.fill();
        // Ruts: two wheel tracks along the main track, where it is at full width.
        if (ti === 0 && taper > 0.9 && !inVoid(u, v, 0.8)) {
          const t = pts[i].t;
          const off = half * 0.36;
          // Sideways (in u, v) of the track's direction.
          const nu = -(t.x * SIDE.x + t.z * SIDE.z);
          const nv = t.x * FWD.x + t.z * FWD.z;
          if (k % 2 === 0) {
            rutL.push({ u: u + nu * off, v: v + nv * off });
            rutR.push({ u: u - nu * off, v: v - nv * off });
          }
        } else if (ti === 0) {
          flushRuts();
        }
      }
      along += seg;
    }
    flushRuts();
  });

  // Colour it: terracotta earth, darker at the ragged rim and in the ruts, a few pebbles and clods.
  const maskPx = m.getImageData(0, 0, W, H).data;
  const rutPx = r.getImageData(0, 0, W, H).data;
  const tex = new DynamicTexture("forestTrackTex", { width: W, height: H }, scene, false, Texture.NEAREST_SAMPLINGMODE);
  tex.hasAlpha = true;
  tex.wrapU = tex.wrapV = Texture.CLAMP_ADDRESSMODE;
  const ctx = tex.getContext() as CanvasRenderingContext2D;
  const img = ctx.createImageData(W, H);
  const out = img.data;
  const inside = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H && maskPx[(y * W + x) * 4] > 127;
  for (let y = 0; y < H; y++) {
    const v = DIRT_V1 - (y + 0.5) / DIRT_PPU;
    for (let x = 0; x < W; x++) {
      const o = (y * W + x) * 4;
      if (maskPx[o] <= 127) continue;
      const u = DIRT_U0 + (x + 0.5) / DIRT_PPU;
      if (inVoid(u, v, 0.15)) continue; // never over a ravine or the cliff
      // Grass nibbling at the edge: rim pixels drop out at random, the next ring darkens.
      const rim = !inside(x - 2, y) || !inside(x + 2, y) || !inside(x, y - 2) || !inside(x, y + 2);
      if (rim && rand() < 0.35) continue;
      let k = 0.86 + rand() * 0.22;
      if (rim) k *= 0.88;
      if (rutPx[o] > 127) k *= 0.86;
      let cr = 178 * k;
      let cg = 120 * k;
      let cb = 92 * k;
      const speck = rand();
      if (speck < 0.012) [cr, cg, cb] = [206, 150, 116]; // pebble
      else if (speck < 0.02) [cr, cg, cb] = [118, 74, 52]; // clod
      out[o] = cr;
      out[o + 1] = cg;
      out[o + 2] = cb;
      out[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  tex.update();

  const mesh = gridMesh(
    "forestTrack",
    scene,
    DIRT_V1 - DIRT_V0,
    DIRT_U1 - DIRT_U0,
    (i, j) => {
      const u = DIRT_U0 + j;
      const v = DIRT_V0 + i;
      const p = forestPoint(u, v);
      return { x: p.x, y: 0.02, z: p.z, tu: (u - DIRT_U0) / (DIRT_U1 - DIRT_U0), tv: (v - DIRT_V0) / (DIRT_V1 - DIRT_V0) };
    },
    Vector3.Up(),
  );
  const mat = matte("forestTrackMat", scene, tex);
  mat.zOffset = -2; // sit on the floor without z-fighting
  mesh.material = mat;
  mesh.parent = root;
  return mesh;
}

// --- Vegetation ------------------------------------------------------------------

/**
 * Scatter the wood on a jittered grid around the track. Each spot gets the biggest thing that
 * fits: a tall tree where it hides nothing, else a sapling, else a bush, fern or rock. Returns the
 * trees' shade circles for {@link shadeGround}.
 */
function buildVegetation(scene: Scene, root: TransformNode, rand: () => number): { x: number; z: number; r: number }[] {
  const bark = matte("forestBarkMat", scene, barkTexture(scene, rand));
  const leaves = matte("forestLeafMat", scene, leafTexture(scene, rand));
  const trees = [0, 1, 2, 3].map((i) => treeSource(i, scene, bark, leaves, rand));
  const sapling = saplingSource(scene, bark, leaves, rand);
  const grove = groveSource(scene, bark, leaves, rand);
  const bush = bushSource(scene, leaves, rand);
  const rock = rockSource(scene, rand);
  const fern = fernSource(scene, rand);
  grassSource(scene, rand); // used by the meadow and the cliff rim (looked up by name)
  flowerSource(scene, rand);

  const shade: { x: number; z: number; r: number }[] = [];
  const STEP = 3.1;
  const REACH = 24; // how far from the track the wood is dressed
  for (let gu = -48; gu < 196; gu += STEP)
    for (let gv = -40; gv < 40; gv += STEP) {
      const lu = gu + (rand() - 0.5) * STEP * 0.9;
      const lv = gv + (rand() - 0.5) * STEP * 0.9;
      if (inVoid(lu, lv, 0.9)) continue; // nothing grows in thin air
      const { x, z } = forestPoint(lu, lv);
      if (CLEARINGS.some((c) => Math.hypot(c.x - x, c.z - z) < 3.2)) continue; // keep chests/NPCs free
      const near = nearestOnTrack(x, z);
      // Open ground — scattered trees, more rock and grass: the cliff top past the first ravine,
      // and the last stretch before the fork (the reference screens).
      const r0 = RAVINES[0];
      const open = (lu > ravineC(r0, lv) + ravineH(r0, lv) && lu < 64) || lu > 124;
      const meadow = lu > 124; // the last stretch: open grassland, a few trees
      // The maze is the opposite: wood packed tight between its trails.
      const dense = lu > MAZE_U0 && lu < MAZE_U1;
      const edge = near.d - near.w; // < 0: inside the walkable corridor
      if (near.d > REACH + near.w) continue;
      const rot = rand() * Math.PI * 2;
      const roll = rand();

      // Trees never hide a trail: a crown may not cover one on screen (a thin trunk may cross it).
      // The open grass they leave is walkable; what they stand over or hide is not (see buildMask).
      if (dense && edge > 1.4 && roll < 0.85 && !occludesTrack(x, z, 5, 2.8, 2.4 * TAN_BETA - 2.8)) {
        // The maze: low, broad groves packed between the trails — the hedges of the labyrinth
        // (the reference shows round clumps of trees from above).
        const s = 0.85 + rand() * 0.35;
        place(grove, root, x, z, s, rot);
        shade.push({ x, z, r: 3 * s });
        obstacles.add(x, z, 1.7 * s);
        canopies.push({ x, z, under: 2 * s, coverFrom: 2.4 * s * TAN_BETA - 2 * s, coverTo: 5 * s * TAN_BETA + 2 * s + 1, coverHalf: 2 * s });
      } else if (dense && edge > 0.9) {
        // Maze hedges: big low clumps, packed — they wall the trails in (knee-to-waist high: at
        // most they hide your feet, never you).
        const s = 1.5 + rand() * 0.6;
        place(bush, root, x, z, s, rot);
        place(bush, root, x + (rand() - 0.5) * 2.2, z + (rand() - 0.5) * 2.2, s * (0.8 + rand() * 0.3), rand() * 6);
      } else if (edge > 0.9 && roll < (meadow ? 0.15 : open ? 0.4 : 0.85) && !occludesTrack(x, z, 15, 4.4, 9 * TAN_BETA - 4.4)) {
        const s = 0.85 + rand() * 0.4;
        const src = trees[(rand() * trees.length) | 0];
        const height = ((src.metadata?.height as number) ?? 13) * s;
        place(src, root, x, z, s, rot);
        shade.push({ x, z, r: 3.2 * s });
        obstacles.add(x, z, 0.75 * s); // every trunk is solid
        // You may walk right up to the trunk; only where the crown would truly hide you is off-limits.
        canopies.push({ x, z, under: 1.3 * s, coverFrom: (height - 2.5 * s) * TAN_BETA - 3 * s, coverTo: (height + 1 * s) * TAN_BETA + 3 * s + 1, coverHalf: 3 * s });
      } else if (edge > 0.4 && roll < 0.5 && !occludesTrack(x, z, 2.2, 1)) {
        const s = 0.8 + rand() * 0.5;
        place(sapling, root, x, z, s, rot);
        obstacles.add(x, z, 0.2 * s);
        canopies.push({ x, z, under: 0.5 * s, coverFrom: 1.2 * TAN_BETA, coverTo: 2.4 * s * TAN_BETA + 1, coverHalf: 0.7 * s });
      } else if (edge > -0.6) {
        // Low growth: a clump of ferns, a bush, or a mossy rock — never more than knee-high.
        const what = rand();
        if (what < 0.35) {
          for (let k = 0; k < 3; k++)
            place(fern, root, x + (rand() - 0.5) * 2, z + (rand() - 0.5) * 2, 0.8 + rand() * 0.6, rand() * Math.PI);
        } else if (what < (open ? 0.6 : 0.85)) {
          // Big rounded clumps where they hide nothing (the reference screens are packed with them),
          // knee-high ones right at the verge.
          if (edge > 0.6 && !occludesTrack(x, z, 2, 1.8)) {
            const s = 1.4 + rand() * 0.9;
            place(bush, root, x, z, s, rot);
            canopies.push({ x, z, under: 0.65 * s, coverFrom: 0, coverTo: 0, coverHalf: 0 }); // a big clump is in the way
          }
          else if (edge > 0.3) place(bush, root, x, z, 0.7 + rand() * 0.4, rot);
        } else if (edge > 0.2) {
          const s = 0.6 + rand() * 0.8;
          place(rock, root, x, z, s, rot);
          obstacles.add(x, z, 0.75 * s);
        }
      }
      // Ferns along the corridor's own grass verge too (walk-through, no collision).
      if (edge > -1.6 && edge < 0 && rand() < 0.35) place(fern, root, x, z, 0.6 + rand() * 0.4, rot);
    }
  return shade;
}

// --- Props --------------------------------------------------------------------------

/** The travelling merchant's cart, pulled off the track (submap 624's merchant). */
function buildCart(scene: Scene, root: TransformNode): void {
  const at = forestPoint(4, -4.6);
  const node = new TransformNode("forestCart", scene);
  node.parent = root;
  node.position.copyFrom(at);
  node.rotation.y = Math.atan2(FWD.x, FWD.z) + 0.25;
  const wood = matte("cartWoodMat", scene, undefined, new Color3(0.42, 0.28, 0.17));
  const cloth = matte("cartClothMat", scene, undefined, new Color3(0.6, 0.52, 0.4));
  const body = MeshBuilder.CreateBox("cartBody", { width: 1.6, height: 0.7, depth: 2.6 }, scene);
  body.position.y = 0.85;
  body.material = wood;
  const cover = MeshBuilder.CreateCylinder("cartCover", { height: 2.4, diameter: 1.6, tessellation: 8, arc: 0.5 }, scene);
  cover.rotation.set(Math.PI / 2, 0, Math.PI / 2);
  cover.position.y = 1.2;
  cover.material = cloth;
  const parts: Mesh[] = [body, cover];
  for (const side of [-1, 1]) {
    const wheel = MeshBuilder.CreateCylinder(`cartWheel${side}`, { height: 0.12, diameter: 1.05, tessellation: 10 }, scene);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(side * 0.86, 0.52, 0.2);
    wheel.material = wood;
    const shaft = MeshBuilder.CreateBox(`cartShaft${side}`, { width: 0.08, height: 0.08, depth: 1.8 }, scene);
    shaft.position.set(side * 0.45, 0.6, 2.1);
    shaft.rotation.x = 0.3;
    shaft.material = wood;
    parts.push(wheel, shaft);
  }
  const crate = MeshBuilder.CreateBox("cartCrate", { size: 0.55 }, scene);
  crate.position.set(1.25, 0.28, -0.8);
  crate.rotation.y = 0.4;
  crate.material = wood;
  parts.push(crate);
  for (const p of parts) p.parent = node;
  obstacles.add(at.x, at.z, 1.6);
}

/** A moss-covered fallen trunk lying beside the track. */
function buildFallenLog(scene: Scene, root: TransformNode): void {
  const at = forestPoint(27, 3.4);
  const log = MeshBuilder.CreateCylinder("forestLog", { height: 5, diameter: 0.9, tessellation: 8 }, scene);
  log.rotation.z = Math.PI / 2;
  log.rotation.y = Math.atan2(FWD.x, FWD.z) + 1.1;
  log.position.set(at.x, 0.4, at.z);
  const mat = scene.getMaterialByName("forestBarkMat");
  if (mat) log.material = mat;
  log.parent = root;
  obstacles.add(at.x, at.z, 1.2);
}

/**
 * The fallen tree bridging the ravine — the walkway of the cliff screen. Its top sits flush with
 * the ground (the walkable plane is y = 0), roots torn up on the near lip, a stub of crown beyond.
 */
function buildBridge(scene: Scene, root: TransformNode, r: Ravine, k: number, rand: () => number): void {
  const bark = scene.getMaterialByName("forestBarkMat") as StandardMaterial;
  const leaves = scene.getMaterialByName("forestLeafMat") as StandardMaterial;
  const v = r.bridgeV;
  const from = ravineC(r, v) - ravineH(r, v) - 2.4;
  const to = ravineC(r, v) + ravineH(r, v) + 3;

  // The trunk: a thick, slightly wandering tube, its top flush with the ground (y = 0 is where
  // feet go), sagging a touch over the void. Its foot (near end) is the wide end.
  const path: Vector3[] = [];
  for (let t = 0; t <= 1.0001; t += 0.125) {
    const p = forestPoint(from + (to - from) * t, v + Math.sin(t * 5 + k) * 0.12);
    const radius = 0.75 - 0.2 * t;
    path.push(new Vector3(p.x, 0.08 - radius - 0.12 * Math.sin(Math.PI * t), p.z));
  }
  const log = limb(`forestBridgeLog${k}`, scene, path, 0.75, 0.55, rand);
  log.material = bark;
  log.parent = root;

  // Moss along its back: a strip of small soft lumps (and what tells you this is the way across).
  for (let t = 0.08; t < 0.95; t += 0.07 + rand() * 0.08) {
    const p = path[Math.round(t * (path.length - 1))];
    const side = (rand() - 0.5) * 0.9;
    const at = forestPoint(from + (to - from) * t, v + side);
    const m = MeshBuilder.CreateIcoSphere(`forestBridgeMoss${k}_${t.toFixed(2)}`, { radius: 0.18 + rand() * 0.18, subdivisions: 1 }, scene);
    m.scaling.y = 0.4;
    m.position.set(at.x, p.y + 0.62 - Math.abs(side) * 0.5, at.z);
    m.material = leaves;
    m.parent = root;
  }

  // Torn-up roots at the foot, sticking out round the trunk's end.
  const foot = forestPoint(from - 0.3, v);
  for (let q = 0; q < 5; q++) {
    const a = (q / 5) * Math.PI * 2 + rand();
    const dir = SIDE.scale(Math.cos(a));
    const pts = [0, 1].map((t) => new Vector3(foot.x + dir.x * (1.1 + 0.6 * t) - FWD.x * 0.4 * t, 0.5 + Math.sin(a) * (1.1 + 0.6 * t), foot.z + dir.z * (1.1 + 0.6 * t) - FWD.z * 0.4 * t));
    const stub = limb(`forestBridgeRoot${k}_${q}`, scene, pts, 0.16, 0.04, rand);
    stub.material = bark;
    stub.parent = root;
  }

  // Snapped-off branches sticking out sideways (reads across the screen, so the trunk reads as lying).
  for (const [f, side, len] of [[0.3, 1, 1.8], [0.5, -1, 1.4], [0.72, 1, 2.2], [0.86, -1, 1.6]] as const) {
    const p = path[Math.round(f * (path.length - 1))];
    const dir = SIDE.scale(side);
    const pts = [0, 0.5, 1].map((t) => new Vector3(p.x + dir.x * len * t, p.y + 0.4 + 0.8 * t, p.z + dir.z * len * t));
    const br = limb(`forestBridgeBranch${k}_${f}`, scene, pts, 0.14, 0.03, rand);
    br.material = bark;
    br.parent = root;
  }
}

/** The bare, gnarled tree leaning out over the cliff edge (the cliff screen's silhouette). */
function buildDeadTree(scene: Scene, root: TransformNode, rand: () => number): void {
  const bark = scene.getMaterialByName("forestBarkMat") as StandardMaterial;
  const u = 58;
  const base = forestPoint(u, cliffE(u) - 1.2);
  const out = SIDE; // towards the drop
  const along = (t: number, lean: number, rise: number): Vector3 =>
    new Vector3(base.x + out.x * lean * t, rise * t, base.z + out.z * lean * t);
  const trunk = [0, 0.33, 0.66, 1].map((t) => along(t, 2.6 * t, 4.2));
  const parts = [limb("deadTrunk", scene, trunk, 0.4, 0.16, rand)];
  for (const [from, a, len, rise] of [[2, 0.6, 3.2, 1.2], [3, -0.7, 2.4, 1.6], [2, -1.4, 1.8, 0.4]] as const) {
    const p0 = trunk[from];
    const dir = new Vector3(Math.cos(a) * out.x - Math.sin(a) * out.z, 0, Math.sin(a) * out.x + Math.cos(a) * out.z);
    const pts = [0, 0.5, 1].map((t) => new Vector3(p0.x + dir.x * len * t, p0.y + rise * t + 0.3 * Math.sin(t * 3), p0.z + dir.z * len * t));
    parts.push(limb(`deadLimb${from}${a}`, scene, pts, 0.16, 0.03, rand));
  }
  for (const m of parts) {
    m.material = bark;
    m.parent = root;
  }
  obstacles.add(base.x, base.z, 0.5);
}

/** The cliff's lip: grass tufts, ferns and rocks along the edge, so it reads as a brink, not a cut. */
function buildCliffRim(scene: Scene, root: TransformNode, rand: () => number): void {
  const fern = scene.getMeshByName("forestFern") as Mesh | null;
  const rock = scene.getMeshByName("forestRock") as Mesh | null;
  const grass = scene.getMeshByName("forestGrass") as Mesh | null;
  for (let u = 42; u < 64; u += 0.7 + rand() * 0.9) {
    const v = cliffE(u) - 0.3 - rand() * 0.6;
    const { x, z } = forestPoint(u, v);
    const pick = rand();
    if (pick < 0.45 && grass) place(grass, root, x, z, 0.8 + rand() * 0.5, rand() * Math.PI);
    else if (pick < 0.75 && fern) place(fern, root, x, z, 0.7 + rand() * 0.4, rand() * Math.PI);
    else if (rock) {
      const s = 0.5 + rand() * 0.6;
      place(rock, root, x, z, s, rand() * Math.PI);
      obstacles.add(x, z, 0.7 * s);
    }
  }
}

/** Ivy spilling over the gorge's far lip and trailing down its wall (the second ravine's screen). */
function buildGorgeVines(scene: Scene, root: TransformNode, rand: () => number): void {
  const r = RAVINES[1];
  // A curtain of leaves on an alpha-tested card: dense at the top, trailing off in strands.
  const tex = pixelTexture("forestIvyTex", scene, 32, 64, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    for (let strand = 0; strand < 7; strand++) {
      let x = 2 + rand() * (w - 4);
      const len = h * (0.35 + rand() * 0.65);
      for (let y = 0; y < len; y += 1) {
        x += (rand() - 0.5) * 1.2;
        const thick = Math.max(1, Math.round((1 - y / len) * 4 + rand() * 2));
        const k = 0.7 + rand() * 0.6;
        ctx.fillStyle = k > 1.15 ? rgb(150, 150, 70) : rgb(66 * k, 92 * k, 36 * k);
        ctx.fillRect((x - thick / 2) | 0, y, thick, 1);
      }
    }
  });
  tex.hasAlpha = true;
  tex.wrapU = tex.wrapV = Texture.CLAMP_ADDRESSMODE;
  const mat = matte("forestIvyMat", scene, tex);
  mat.backFaceCulling = false;
  for (let v = -18; v < 18; v += 0.8 + rand() * 1.4) {
    const u = ravineC(r, v) + ravineH(r, v);
    const lip = forestPoint(u, v);
    const w = 1 + rand() * 1.4;
    const h = rand() < 0.4 ? 4 + rand() * 7 : 1.5 + rand() * 2;
    const card = MeshBuilder.CreatePlane(`forestIvy${v.toFixed(1)}`, { width: w, height: h }, scene);
    card.rotation.y = Math.atan2(FWD.x, FWD.z); // flat on the wall, facing the camera
    card.position.set(lip.x - FWD.x * 0.06, 0.25 - h / 2, lip.z - FWD.z * 0.06);
    card.material = mat;
    card.parent = root;
  }
}

/**
 * Tall grass and white wild flowers: the open ground of the cliff top and the last stretch to the
 * fork (the fifth reference screen), and a sprinkling in the wood's clearings.
 */
function buildMeadow(scene: Scene, root: TransformNode, rand: () => number): void {
  const grass = scene.getMeshByName("forestGrass") as Mesh;
  const flowers = scene.getMeshByName("forestFlowers") as Mesh;
  for (let u = -30; u < 185; u += 0.9) {
    const open = (u > 50 && u < 64) || u > 120;
    const tries = u > 120 ? 9 : open ? 4 : 1;
    for (let k = 0; k < tries; k++) {
      const v = (rand() - 0.5) * 34;
      if (inVoid(u, v, 0.6)) continue;
      const { x, z } = forestPoint(u + rand() * 0.9, v);
      if (nearestOnTrack(x, z).d < DIRT_HALF + 0.2) continue; // not on the beaten dirt
      if (!open && rand() < 0.6) continue;
      if (rand() < (open ? 0.35 : 0.15)) place(flowers, root, x, z, 0.7 + rand() * 0.5, rand() * Math.PI);
      else place(grass, root, x, z, 0.7 + rand() * 0.7, rand() * Math.PI);
    }
  }
}

/**
 * The odds and ends that make a wood look lived-in rather than tiled: clusters of red-capped and
 * pale mushrooms, mossy stumps, fallen trunks lying in the undergrowth, and patches of colourful
 * wild flowers in the clearings. Scenery only, off the trails, never where a chest or NPC stands.
 */
function buildUndergrowth(scene: Scene, root: TransformNode, rand: () => number): void {
  const bark = scene.getMaterialByName("forestBarkMat") as StandardMaterial;
  const leaves = scene.getMaterialByName("forestLeafMat") as StandardMaterial;
  const capRed = matte("forestCapRedMat", scene, undefined, new Color3(0.72, 0.16, 0.1));
  const capPale = matte("forestCapPaleMat", scene, undefined, new Color3(0.86, 0.74, 0.56));
  const stem = matte("forestStemMat", scene, undefined, new Color3(0.9, 0.86, 0.76));
  const spot = matte("forestSpotMat", scene, undefined, new Color3(0.95, 0.93, 0.88));

  // Mushroom clusters (two kinds), merged sources so they instance cheaply.
  const mushroom = (name: string, cap: StandardMaterial, spotted: boolean): Mesh => {
    const parts: Mesh[] = [];
    for (let k = 0; k < 4; k++) {
      const h = 0.12 + rand() * 0.14;
      const a = rand() * Math.PI * 2;
      const d = k === 0 ? 0 : 0.1 + rand() * 0.14;
      const st = MeshBuilder.CreateCylinder(`${name}Stem${k}`, { height: h, diameterTop: 0.035, diameterBottom: 0.05, tessellation: 6 }, scene);
      st.position.set(Math.cos(a) * d, h / 2, Math.sin(a) * d);
      st.material = stem;
      const c = MeshBuilder.CreateSphere(`${name}Cap${k}`, { diameter: 0.13 + rand() * 0.1, segments: 6, slice: 0.5 }, scene);
      c.position.set(Math.cos(a) * d, h - 0.01, Math.sin(a) * d);
      c.scaling.y = 0.7;
      c.material = cap;
      parts.push(st, c);
      if (spotted)
        for (let q = 0; q < 3; q++) {
          const sp = MeshBuilder.CreateSphere(`${name}Spot${k}${q}`, { diameter: 0.022, segments: 3 }, scene);
          const b = rand() * Math.PI * 2;
          sp.position.set(Math.cos(a) * d + Math.cos(b) * 0.04, h + 0.02, Math.sin(a) * d + Math.sin(b) * 0.04);
          sp.material = spot;
          parts.push(sp);
        }
    }
    return mergeSource(name, parts, false);
  };
  const redShrooms = mushroom("forestShroomRed", capRed, true);
  const paleShrooms = mushroom("forestShroomPale", capPale, false);

  // A mossy stump: a short, flared trunk, a lighter cut top and a cushion of moss.
  const stumpParts: Mesh[] = [];
  const stumpBody = MeshBuilder.CreateCylinder("forestStumpBody", { height: 0.55, diameterTop: 0.62, diameterBottom: 0.9, tessellation: 9, subdivisions: 2 }, scene);
  jitter(stumpBody, 0.06, rand);
  stumpBody.position.y = 0.27;
  stumpBody.material = bark;
  const ring = matte("forestStumpTopMat", scene, undefined, new Color3(0.62, 0.48, 0.3));
  const stumpTop = MeshBuilder.CreateCylinder("forestStumpTop", { height: 0.02, diameter: 0.58, tessellation: 9 }, scene);
  stumpTop.position.y = 0.55;
  stumpTop.material = ring;
  const moss = MeshBuilder.CreateIcoSphere("forestStumpMoss", { radius: 0.25, subdivisions: 1 }, scene);
  moss.position.set(0.2, 0.5, 0.05);
  moss.scaling.y = 0.4;
  moss.material = leaves;
  gradeColors(stumpBody, [0.6, 0.56, 0.5], PLAIN);
  gradeColors(stumpTop, PLAIN, PLAIN);
  gradeColors(moss, LEAF_SHADE, LEAF_SUN);
  stumpParts.push(stumpBody, stumpTop, moss);
  const stump = mergeSource("forestStump", stumpParts, false);

  // Flower patches: red, violet and yellow blooms on a card, like the white ones.
  const bloom = (name: string, petal: [number, number, number]): Mesh => {
    const tex = pixelTexture(`${name}Tex`, scene, 32, 32, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      for (let f = 0; f < 7; f++) {
        const x = 3 + ((rand() * (w - 6)) | 0);
        const top = 8 + ((rand() * 14) | 0);
        ctx.fillStyle = rgb(74, 104, 40);
        ctx.fillRect(x, top, 1, h - top);
        ctx.fillStyle = rgb(petal[0], petal[1], petal[2]);
        ctx.fillRect(x - 1, top - 1, 3, 3);
        ctx.fillStyle = rgb(240, 214, 90);
        ctx.fillRect(x, top, 1, 1);
      }
    });
    tex.hasAlpha = true;
    tex.wrapU = tex.wrapV = Texture.CLAMP_ADDRESSMODE;
    return cardSource(name, scene, tex, 0.8, 0.6);
  };
  const blooms = [bloom("forestBloomRed", [210, 60, 50]), bloom("forestBloomViolet", [150, 90, 200]), bloom("forestBloomYellow", [236, 196, 60])];

  for (let u = -30; u < 175; u += 2.2) {
    for (let k = 0; k < 3; k++) {
      const v = (rand() - 0.5) * 36;
      if (inVoid(u, v, 1)) continue;
      const { x, z } = forestPoint(u + rand() * 2, v);
      const n = nearestOnTrack(x, z);
      if (n.d < n.w + 0.3) continue; // off the trails and their verges
      if (CLEARINGS.some((c) => Math.hypot(c.x - x, c.z - z) < 2.5)) continue;
      const open = (u > 50 && u < 64) || u > 120;
      const roll = rand();
      if (roll < 0.22) place(rand() < 0.5 ? redShrooms : paleShrooms, root, x, z, 0.8 + rand() * 0.6, rand() * 6);
      else if (roll < 0.3 && !open) place(stump, root, x, z, 0.8 + rand() * 0.5, rand() * 6);
      else if (roll < (open ? 0.6 : 0.4)) {
        const b = blooms[(rand() * blooms.length) | 0];
        for (let q = 0; q < 3; q++) place(b, root, x + (rand() - 0.5) * 1.2, z + (rand() - 0.5) * 1.2, 0.7 + rand() * 0.4, rand() * 3);
      }
    }
  }

  // A few fallen trunks lying in the undergrowth, off the trails (not on a walkable line).
  for (const [u, v, len, turn] of [[6, 11, 4.5, 0.5], [22, -12, 5, -0.4], [88, 12, 4, 1.1], [116, -9, 5.5, 0.2], [142, 14, 4, -0.8]] as const) {
    if (inVoid(u, v, 1)) continue;
    const at = forestPoint(u, v);
    const dir = new Vector3(Math.cos(turn) * FWD.x - Math.sin(turn) * SIDE.x, 0, Math.cos(turn) * FWD.z - Math.sin(turn) * SIDE.z);
    const pts = [-0.5, 0, 0.5].map((t) => new Vector3(at.x + dir.x * len * t, 0.32 + 0.05 * Math.sin(t * 6), at.z + dir.z * len * t));
    const log = limb(`forestFallen${u}`, scene, pts, 0.4, 0.3, rand);
    log.material = bark;
    log.parent = root;
    for (let q = 0; q < 4; q++) {
      const f = (q + 0.5) / 4 - 0.5;
      const m = MeshBuilder.CreateIcoSphere(`forestFallenMoss${u}${q}`, { radius: 0.18 + rand() * 0.12, subdivisions: 1 }, scene);
      m.scaling.y = 0.45;
      m.position.set(at.x + dir.x * len * f, 0.66, at.z + dir.z * len * f);
      m.material = leaves;
      m.parent = root;
    }
    place(redShrooms, root, at.x + dir.x * len * 0.4 + 0.4, at.z + dir.z * len * 0.4, 0.9, 0);
  }
}

/** A wooden chest with iron bands; its lid swings open when looted. */
function buildChests(scene: Scene, root: TransformNode): Map<string, { at: Vector3; open(): void; tick(dt: number): void }> {
  const wood = matte("forestChestWoodMat", scene, undefined, new Color3(0.5, 0.31, 0.17));
  const iron = matte("forestChestIronMat", scene, undefined, new Color3(0.34, 0.3, 0.26));
  const out = new Map<string, { at: Vector3; open(): void; tick(dt: number): void }>();
  for (const c of FOREST_CHESTS) {
    const at = forestPoint(c.u, c.v);
    const node = new TransformNode(`forestChest_${c.id}`, scene);
    node.parent = root;
    node.position.copyFrom(at);
    node.rotation.y = Math.atan2(-FWD.x, -FWD.z); // front faces the camera
    const body = MeshBuilder.CreateBox(`forestChestBody_${c.id}`, { width: 1.0, height: 0.55, depth: 0.65 }, scene);
    body.position.y = 0.28;
    body.material = wood;
    body.parent = node;
    for (const x of [-0.36, 0.36]) {
      const band = MeshBuilder.CreateBox(`forestChestBand_${c.id}${x}`, { width: 0.08, height: 0.57, depth: 0.67 }, scene);
      band.position.set(x, 0.28, 0);
      band.material = iron;
      band.parent = node;
    }
    // Lid on a hinge along the back edge.
    const hinge = new TransformNode(`forestChestHinge_${c.id}`, scene);
    hinge.parent = node;
    hinge.position.set(0, 0.55, -0.32);
    const lid = MeshBuilder.CreateCylinder(`forestChestLid_${c.id}`, { height: 1.0, diameter: 0.64, tessellation: 10, arc: 0.5 }, scene);
    lid.rotation.set(0, 0, Math.PI / 2);
    lid.position.set(0, 0, 0.32);
    lid.material = wood;
    lid.parent = hinge;
    obstacles.add(at.x, at.z, 0.6);
    let opening = false;
    out.set(c.id, {
      at,
      open: () => {
        opening = true;
      },
      tick: (dt) => {
        if (opening && hinge.rotation.x > -1.9) hinge.rotation.x = Math.max(-1.9, hinge.rotation.x - dt * 5);
      },
    });
  }
  return out;
}

/**
 * The travelling merchant, by his cart: a stocky figure in a long coat, wide-brimmed hat and a
 * pack on his back. Returns the point above his head (for his speech bubble).
 */
function buildMerchant(scene: Scene, root: TransformNode): Vector3 {
  const at = forestPoint(MERCHANT_SPOT.u, MERCHANT_SPOT.v);
  const node = new TransformNode("forestMerchant", scene);
  node.parent = root;
  node.position.copyFrom(at);
  node.rotation.y = Math.atan2(SIDE.x, SIDE.z) + 0.6; // facing the track
  const coat = matte("merchantCoatMat", scene, undefined, new Color3(0.36, 0.42, 0.22));
  const skin = matte("merchantSkinMat", scene, undefined, new Color3(0.86, 0.66, 0.5));
  const hatMat = matte("merchantHatMat", scene, undefined, new Color3(0.42, 0.3, 0.18));
  const pack = matte("merchantPackMat", scene, undefined, new Color3(0.55, 0.42, 0.26));
  const part = (m: Mesh, mat: StandardMaterial, x: number, y: number, z: number): Mesh => {
    m.position.set(x, y, z);
    m.material = mat;
    m.parent = node;
    return m;
  };
  part(MeshBuilder.CreateCylinder("merchantCoat", { height: 1.15, diameterTop: 0.5, diameterBottom: 0.85, tessellation: 10 }, scene), coat, 0, 0.58, 0);
  part(MeshBuilder.CreateSphere("merchantHead", { diameter: 0.4, segments: 8 }, scene), skin, 0, 1.38, 0);
  part(MeshBuilder.CreateCylinder("merchantBrim", { height: 0.05, diameter: 0.85, tessellation: 14 }, scene), hatMat, 0, 1.56, 0);
  part(MeshBuilder.CreateCylinder("merchantCrown", { height: 0.3, diameterTop: 0.28, diameterBottom: 0.42, tessellation: 10 }, scene), hatMat, 0, 1.72, 0);
  part(MeshBuilder.CreateBox("merchantPack", { width: 0.55, height: 0.7, depth: 0.35 }, scene), pack, 0, 0.95, -0.38);
  obstacles.add(at.x, at.z, 0.5);
  return new Vector3(at.x, 2.1, at.z);
}

/** The fork's signpost: one board towards Hellena, one towards the Prairie. */
function buildSignpost(scene: Scene, root: TransformNode): void {
  const at = forestPoint(136.5, 0.4);
  const wood = scene.getMaterialByName("cartWoodMat") as StandardMaterial | null;
  const post = MeshBuilder.CreateBox("forestSignPost", { width: 0.16, height: 2.2, depth: 0.16 }, scene);
  post.position.set(at.x, 1.1, at.z);
  post.material = wood;
  post.parent = root;
  for (const [dv, y] of [[-1, 1.85], [1, 1.5]] as const) {
    const dir = forestPoint(6, dv * 5).normalize(); // along the branch it names
    const board = MeshBuilder.CreateBox(`forestSign${dv}`, { width: 1.1, height: 0.26, depth: 0.06 }, scene);
    board.position.set(at.x + dir.x * 0.5, y, at.z + dir.z * 0.5);
    board.rotation.y = Math.atan2(dir.x, dir.z) + Math.PI / 2;
    board.material = wood;
    board.parent = root;
  }
  obstacles.add(at.x, at.z, 0.35);
}

/**
 * The sea below the cliff, seen over the first ravine's edge. The iso camera looks down too steeply
 * to ever see a horizon, so the "view out to sea" is the water itself, far below: lavender-blue
 * catching the sunset, a band of sun glitter, slow swell. It lies under the whole map, so only
 * lines of sight that drop over the edge reach it — solid ground hides it everywhere else.
 */
function buildSky(scene: Scene, parent: TransformNode): void {
  const rand = mulberry32(0x5ea);
  const tex = pixelTexture("forestSeaTex", scene, 64, 64, (ctx, w, h) => {
    // Deep evening water: blue-violet, in long slow bands (texture x runs up the screen once laid
    // on the map, so a swell — sideways on screen — is a vertical band here).
    for (let x = 0; x < w; x++) {
      const band = 0.88 + 0.12 * Math.sin((x / w) * Math.PI * 6);
      for (let y = 0; y < h; y++) {
        const k = band * (0.94 + rand() * 0.08);
        ctx.fillStyle = rgb(52 * k, 66 * k, 112 * k);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    for (let i = 0; i < 70; i++) {
      // Swell crests: long pale strokes catching the sunset, a dark trough line beside each.
      const x = (rand() * w) | 0;
      const y = (rand() * h) | 0;
      const len = 4 + ((rand() * 8) | 0);
      ctx.fillStyle = rand() < 0.4 ? rgb(196, 150, 160) : rgb(120, 136, 186);
      ctx.fillRect(x, y, 1, len);
      ctx.fillStyle = rgb(34, 42, 80);
      ctx.fillRect(x + 1, y + 1, 1, len - 1);
    }
  });
  // Sun glitter: a warm streak across the water, in its own (additive) layer over the swell.
  const glitter = pixelTexture("forestGlitterTex", scene, 64, 64, (ctx, w, h) => {
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) {
      const x = (rand() * w) | 0;
      const y = (rand() * h) | 0;
      ctx.fillStyle = rand() < 0.6 ? rgb(255, 196, 130) : rgb(255, 236, 200);
      ctx.fillRect(x, y, 1, 2 + ((rand() * 3) | 0));
    }
  });
  const mat = new StandardMaterial("forestSeaMat", scene);
  mat.emissiveTexture = tex;
  mat.diffuseColor = Color3.Black();
  mat.specularColor = Color3.Black();
  mat.disableLighting = true;
  mat.fogEnabled = false;
  const SEA_Y = -26;
  const centre = forestPoint(100, 60);
  const sea = MeshBuilder.CreateGround("forestSea", { width: 160, height: 120 }, scene);
  sea.rotation.y = Math.atan2(FWD.x, FWD.z) - Math.PI / 2; // width along u, depth along v
  sea.position.set(centre.x, SEA_Y, centre.z);
  sea.material = mat;
  sea.parent = parent;
  tex.uScale = 14;
  tex.vScale = 11;

  const gmat = new StandardMaterial("forestGlitterMat", scene);
  gmat.emissiveTexture = glitter;
  gmat.diffuseColor = Color3.Black();
  gmat.specularColor = Color3.Black();
  gmat.disableLighting = true;
  gmat.fogEnabled = false;
  gmat.alphaMode = Constants.ALPHA_ADD;
  gmat.alpha = 0.8;
  const glint = MeshBuilder.CreateGround("forestGlitter", { width: 160, height: 120 }, scene);
  glint.rotation.y = sea.rotation.y;
  glint.position.set(centre.x, SEA_Y + 0.05, centre.z);
  glint.material = gmat;
  glint.parent = parent;
  glitter.uScale = 14;
  glitter.vScale = 11;

  // Surf breaking along the cliff's foot: a ragged white band where rock meets water.
  const foamTex = pixelTexture("forestFoamTex", scene, 64, 16, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    for (let x = 0; x < w; x++) {
      const depth = 4 + ((rand() * 10) | 0);
      for (let y = 0; y < depth; y++) {
        if (rand() < y / depth) continue;
        const k = 0.85 + rand() * 0.15;
        ctx.fillStyle = rgb(236 * k, 226 * k, 230 * k);
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });
  foamTex.hasAlpha = true;
  const foamMat = new StandardMaterial("forestFoamMat", scene);
  foamMat.emissiveTexture = foamTex;
  foamMat.diffuseTexture = foamTex;
  foamMat.diffuseColor = Color3.Black();
  foamMat.disableLighting = true;
  foamMat.fogEnabled = false;
  const foam = gridMesh("forestFoam", scene, 1, 60, (i, j) => {
    const u = 36 + (68 - 36) * (j / 60);
    const de = (cliffE(u + 0.05) - cliffE(u - 0.05)) / 0.1;
    const len = Math.hypot(de, 1);
    const out = 9 + i * 2.2;
    const p = forestPoint(u - (de / len) * out, Math.min(V_MAX + 4, cliffE(u)) + out / len);
    return { x: p.x, y: SEA_Y + 0.08, z: p.z, tu: u / 4, tv: i };
  }, Vector3.Up());
  foam.material = foamMat;
  foam.parent = parent;
  foamTex.uScale = 1;

  // The sunset on the water: an additive wash, dark at the cliff's foot and burning rose-orange
  // towards the open sea — the horizon the camera can't see, felt through its reflection.
  const glowTex = new DynamicTexture("forestSeaGlowTex", { width: 4, height: 256 }, scene, false);
  const gctx = glowTex.getContext();
  for (let y = 0; y < 256; y++) {
    const f = y / 255; // 0 = at the cliff … 1 = far out
    const a = Math.pow(f, 1.6);
    gctx.fillStyle = `rgb(${Math.round(255 * a)},${Math.round(130 * a)},${Math.round(90 * a)})`;
    gctx.fillRect(0, y, 4, 1);
  }
  glowTex.update();
  const glowMat = new StandardMaterial("forestSeaGlowMat", scene);
  glowMat.emissiveTexture = glowTex;
  glowMat.diffuseColor = Color3.Black();
  glowMat.specularColor = Color3.Black();
  glowMat.disableLighting = true;
  glowMat.fogEnabled = false;
  glowMat.alphaMode = Constants.ALPHA_ADD;
  const SEA_V0 = 8;
  const SEA_V1 = 70;
  const seaGlow = gridMesh("forestSeaGlow", scene, 8, 8, (i, j) => {
    const v = SEA_V0 + (SEA_V1 - SEA_V0) * (i / 8);
    const p = forestPoint(20 + 120 * (j / 8), v);
    return { x: p.x, y: SEA_Y + 0.12, z: p.z, tu: 0.5, tv: i / 8 };
  }, Vector3.Up());
  seaGlow.material = glowMat;
  seaGlow.parent = parent;

  // Sea stacks off the coast: dark rock pillars with surf at their feet, for scale and distance.
  const stackMat = scene.getMaterialByName("forestStrataMat") as StandardMaterial | null;
  const stackRand = mulberry32(0x57ac);
  for (const [u, v, h, r] of [[44, 22, 9, 2.2], [58, 30, 13, 3], [70, 24, 7, 1.6], [50, 38, 10, 2.6]] as const) {
    const at = forestPoint(u, v);
    const stack = MeshBuilder.CreateCylinder(`forestSeaStack${u}`, { height: h, diameterTop: r * 0.9, diameterBottom: r * 2, tessellation: 8, subdivisions: 4 }, scene);
    jitter(stack, 0.5, stackRand);
    stack.position.set(at.x, SEA_Y + h / 2 - 0.5, at.z);
    if (stackMat) stack.material = stackMat;
    stack.parent = parent;
    const cap = MeshBuilder.CreateIcoSphere(`forestSeaStackCap${u}`, { radius: r * 0.6, subdivisions: 2, flat: false }, scene);
    cap.scaling.y = 0.5;
    cap.position.set(at.x, SEA_Y + h - 0.3, at.z);
    cap.material = scene.getMaterialByName("forestLeafMat");
    cap.parent = parent;
    const surf = MeshBuilder.CreateTorus(`forestSeaStackSurf${u}`, { diameter: r * 2.3, thickness: 0.35, tessellation: 20 }, scene);
    surf.position.set(at.x, SEA_Y + 0.1, at.z);
    surf.scaling.y = 0.2;
    surf.material = foamMat;
    surf.parent = parent;
  }

  // Emissive, so keep both out of the mode's glow layer (created after the world: first frame),
  // then let the swell drift and the glitter shimmer.
  let t = 0;
  let excluded = false;
  scene.onBeforeRenderObservable.add(() => {
    if (!excluded) {
      excluded = true;
      for (const layer of scene.effectLayers) if (layer instanceof GlowLayer) for (const m of [sea, glint, foam, seaGlow]) layer.addExcludedMesh(m);
    }
    t += scene.getEngine().getDeltaTime() / 1000;
    tex.vOffset = t * 0.01;
    glitter.vOffset = Math.floor(t * 3) * 0.37; // jumps, like light flickering on water
    foamTex.uOffset = Math.sin(t * 0.6) * 0.03; // the surf washing in and out
  });
}

/**
 * Haze hanging in the ravines: two pale layers part-way down, so the drop reads as DEPTH (the floor
 * fades into mist) instead of a dark slab at the bottom.
 */
function buildRavineMist(scene: Scene, parent: TransformNode): void {
  const rand = mulberry32(0x3157);
  const tex = new DynamicTexture("forestRavineMistTex", { width: 64, height: 64 }, scene, true);
  const ctx = tex.getContext() as CanvasRenderingContext2D;
  ctx.clearRect(0, 0, 64, 64);
  for (let i = 0; i < 26; i++) {
    const x = rand() * 64;
    const y = rand() * 64;
    const r = 8 + rand() * 16;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(255,255,255,0.5)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    // Wrap the blobs so the texture tiles without seams.
    for (const dx of [-64, 0, 64]) for (const dy of [-64, 0, 64]) ctx.fillRect(x - r + dx, y - r + dy, r * 2, r * 2);
  }
  tex.hasAlpha = true;
  tex.update();
  tex.wrapU = tex.wrapV = Texture.WRAP_ADDRESSMODE;
  const layers: { mat: StandardMaterial; tex: Texture; speed: number }[] = [];
  // One layer (each full-width transparent layer costs a screen's worth of pixels on a phone).
  for (const [k, depth, alpha, tint] of [[0, 7, 0.7, [0.72, 0.65, 0.65]]] as const) {
    const lt = tex.clone() as Texture;
    lt.uScale = lt.vScale = 0.12;
    const mat = new StandardMaterial(`forestRavineMistMat${k}`, scene);
    mat.diffuseTexture = lt;
    mat.useAlphaFromDiffuseTexture = true;
    mat.emissiveColor = new Color3(tint[0], tint[1], tint[2]);
    mat.diffuseColor = Color3.Black();
    mat.specularColor = Color3.Black();
    mat.disableLighting = true;
    mat.alpha = alpha;
    mat.backFaceCulling = false;
    RAVINES.forEach((r, ri) => {
      // Only as wide as the wood beside the trails (the camera never sees further out).
      const m = gridMesh(`forestRavineMist${ri}_${k}`, scene, 50, 2, (i, j) => {
        const v = -25 + i;
        const u = ravineC(r, v) + ravineH(r, v) * (j - 1) * 0.98;
        const p = forestPoint(u, Math.min(v, cliffE(u) + 2));
        return { x: p.x, y: -depth, z: p.z, tu: p.x, tv: p.z };
      }, Vector3.Up());
      m.material = mat;
      m.parent = parent;
      m.alphaIndex = 5;
    });
    layers.push({ mat, tex: lt, speed: 0.01 + k * 0.006 });
  }
  scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000;
    for (const l of layers) l.tex.uOffset += dt * l.speed;
  });
}

// --- Light -----------------------------------------------------------------------------

/**
 * Shafts of sunlight slanting down through gaps in the canopy, along the sun's own direction.
 * Each is a long additive card turned to face the camera as far as its axis allows. Unlit, so its
 * colour is emissive — and it is kept out of the glow layer, where a shaft would bloom into a slab.
 */
function buildSunShafts(scene: Scene, root: TransformNode, rand: () => number): void {
  const tex = new DynamicTexture("forestShaftTex", { width: 32, height: 128 }, scene, false);
  const ctx = tex.getContext();
  for (let y = 0; y < 128; y++) {
    const along = y / 127; // 0 = ground end … 1 = sky end
    const fade = Math.min(1, along / 0.25) * Math.min(1, (1 - along) / 0.35);
    for (let x = 0; x < 32; x++) {
      const across = 1 - Math.abs(x - 15.5) / 16;
      const a = fade * across * across;
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  tex.hasAlpha = true;
  tex.update();

  const mat = new StandardMaterial("forestShaftMat", scene);
  mat.diffuseTexture = tex;
  mat.useAlphaFromDiffuseTexture = true;
  mat.diffuseColor = Color3.Black();
  mat.emissiveColor = new Color3(1.0, 0.8, 0.55); // late-afternoon gold
  mat.specularColor = Color3.Black();
  mat.disableLighting = true;
  mat.backFaceCulling = false;
  mat.alphaMode = Constants.ALPHA_ADD;
  mat.alpha = 0.3;
  mat.fogEnabled = false;

  const axis = new Vector3(0.5, 1, 0.4).normalize(); // towards the sun (opposite its light direction)
  const toCam = new Vector3(0.577, 0.577, -0.577);
  const normal = toCam.subtract(axis.scale(Vector3.Dot(toCam, axis))).normalize();
  const across = Vector3.Cross(axis, normal).normalize();

  const shafts: Mesh[] = [];
  for (let u = -4; u < 150; u += 5 + rand() * 4) {
    const v = (rand() - 0.5) * 9;
    if (inVoid(u, v, 1)) continue;
    const base = forestPoint(u, v);
    const width = 1.2 + rand() * 1.8;
    const len = 18;
    const corners = [
      base.add(across.scale(-width / 2)),
      base.add(across.scale(width / 2)),
      base.add(across.scale(width / 2)).addInPlace(axis.scale(len)),
      base.add(across.scale(-width / 2)).addInPlace(axis.scale(len)),
    ];
    const vd = new VertexData();
    vd.positions = corners.flatMap((c) => [c.x, c.y, c.z]);
    vd.uvs = [0, 0, 1, 0, 1, 1, 0, 1];
    vd.indices = [0, 1, 2, 0, 2, 3];
    vd.normals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
    const m = new Mesh(`forestShaft${shafts.length}`, scene);
    vd.applyToMesh(m);
    m.material = mat;
    m.parent = root;
    m.alphaIndex = 10;
    m.visibility = 0.7 + rand() * 0.3;
    shafts.push(m);
  }
  // A slow breathing of the light, as leaves move across the gap.
  const phase = shafts.map(() => rand() * Math.PI * 2);
  let time = 0;
  let glowChecked = false;
  scene.onBeforeRenderObservable.add(() => {
    if (!glowChecked) {
      // The mode's glow layer is created after the world: exclude the shafts on the first frame.
      glowChecked = true;
      for (const layer of scene.effectLayers)
        if (layer instanceof GlowLayer) for (const m of shafts) layer.addExcludedMesh(m);
    }
    time += scene.getEngine().getDeltaTime() / 1000;
    shafts.forEach((m, i) => {
      m.visibility = 0.65 + 0.35 * (0.5 + 0.5 * Math.sin(time * 0.35 + phase[i]));
    });
  });
}

/** Pollen and seed fluff drifting in the warm air, around wherever the camera looks. */
function buildPollen(scene: Scene): void {
  const ps = new ParticleSystem("forestPollen", 160, scene);
  ps.particleTexture = softDotTexture(scene);
  const emitter = Vector3.Zero();
  ps.emitter = emitter;
  ps.minEmitBox = new Vector3(-13, 0.3, -13);
  ps.maxEmitBox = new Vector3(13, 5, 13);
  ps.blendMode = ParticleSystem.BLENDMODE_ADD;
  ps.color1 = new Color4(1.0, 0.92, 0.6, 0.55);
  ps.color2 = new Color4(0.85, 1.0, 0.65, 0.4);
  ps.colorDead = new Color4(1.0, 0.9, 0.6, 0);
  ps.minSize = 0.04;
  ps.maxSize = 0.09;
  ps.minLifeTime = 6;
  ps.maxLifeTime = 11;
  ps.emitRate = 16;
  ps.gravity = new Vector3(0, -0.012, 0);
  ps.direction1 = new Vector3(-0.25, -0.05, -0.15);
  ps.direction2 = new Vector3(0.25, 0.12, 0.3);
  ps.minEmitPower = 0.05;
  ps.maxEmitPower = 0.18;
  ps.updateSpeed = 0.02;
  ps.preWarmCycles = 200;
  ps.start();
  scene.onBeforeRenderObservable.add(() => {
    const cam = scene.activeCamera as { target?: Vector3 } | null;
    if (cam?.target) emitter.set(cam.target.x, 0, cam.target.z);
  });
}

export type { AbstractMesh };

