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
import type { InstancedMesh } from "@babylonjs/core/Meshes/instancedMesh";

import { softDotTexture } from "./atmosphere";
import { LIGHTING_PRESETS } from "./lighting";
import { mulberry32, pixelTexture, rgb } from "./paint";
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

/** Ground direction that reads as "up the screen" in the iso view (away from the camera). */
const FWD = new Vector3(-Math.SQRT1_2, 0, Math.SQRT1_2);
/** Ground direction that reads as "sideways" on screen. */
const SIDE = new Vector3(Math.SQRT1_2, 0, Math.SQRT1_2);

/** Iso camera tilt: a point `h` high shows `h·tan(β)` ground units further up the screen. */
const TAN_BETA = Math.SQRT2;

type Knot = { u: number; v: number; w: number };

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

/** Local (u, v) of a world ground point. */
function toUV(x: number, z: number): { u: number; v: number } {
  return { u: x * FWD.x + z * FWD.z, v: x * SIDE.x + z * SIDE.z };
}

/** No ground here: inside a ravine, or over the cliff edge. */
function inVoid(u: number, v: number, margin = 0): boolean {
  for (const r of RAVINES) if (Math.abs(u - ravineC(r, v)) < ravineH(r, v) + margin) return true;
  return v > cliffE(u) - margin;
}

/** Half-width of the beaten dirt itself (the walkable corridor is wider: grass on both sides). */
const DIRT_HALF = 2.3; // the reference track is broad: a cart road, not a footpath

/** World position of the local track coordinates (u along the screen's up, v sideways). */
export function forestPoint(u: number, v: number): Vector3 {
  return FWD.scale(u).addInPlace(SIDE.scale(v));
}

interface Sample {
  p: Vector3;
  /** Walkable half-width. */
  w: number;
  /** Unit tangent. */
  t: Vector3;
}

/** A trail as a dense polyline (Catmull-Rom through its knots, ~1 unit steps). */
function sampleTrack(knots: Knot[]): Sample[] {
  const pts = knots.map((k) => ({ p: forestPoint(k.u, k.v), w: k.w }));
  const out: Sample[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)].p;
    const p1 = pts[i].p;
    const p2 = pts[i + 1].p;
    const p3 = pts[Math.min(pts.length - 1, i + 2)].p;
    const steps = Math.ceil(Vector3.Distance(p1, p2));
    for (let s = 0; s < steps; s++) {
      const f = s / steps;
      const sm = f * f * (3 - 2 * f); // ease the width between control points
      out.push({ p: Vector3.CatmullRom(p0, p1, p2, p3, f), w: pts[i].w + (pts[i + 1].w - pts[i].w) * sm, t: Vector3.Zero() });
    }
  }
  const last = pts[pts.length - 1];
  out.push({ p: last.p.clone(), w: last.w, t: Vector3.Zero() });
  for (let i = 0; i < out.length; i++) {
    const a = out[Math.max(0, i - 1)].p;
    const b = out[Math.min(out.length - 1, i + 1)].p;
    out[i].t = b.subtract(a).normalize();
  }
  return out;
}

/** Every trail: the main track first, then the branches. */
const TRAILS = [TRACK, ...BRANCHES].map(sampleTrack);
/** All trail samples together (for the occlusion test). */
const ALL_SAMPLES = TRAILS.flat();

/** Nearest point of any trail to `(x, z)`: distance, interpolated half-width, and the point. */
function nearestOnTrack(x: number, z: number): { d: number; w: number; px: number; pz: number } {
  let best = { d: Infinity, w: 0, px: 0, pz: 0 };
  for (const trail of TRAILS)
  for (let i = 0; i < trail.length - 1; i++) {
    const a = trail[i];
    const b = trail[i + 1];
    const abx = b.p.x - a.p.x;
    const abz = b.p.z - a.p.z;
    const len2 = abx * abx + abz * abz || 1;
    const f = Math.min(1, Math.max(0, ((x - a.p.x) * abx + (z - a.p.z) * abz) / len2));
    const px = a.p.x + abx * f;
    const pz = a.p.z + abz * f;
    const d = Math.hypot(x - px, z - pz);
    if (d < best.d) best = { d, w: a.w + (b.w - a.w) * f, px, pz };
  }
  return best;
}

/** Solid things standing in (or at the edge of) the walkable corridor. */
const obstacles: { x: number; z: number; r: number }[] = [];

/** Half-width of a fallen trunk's walkable top. */
const LOG_HALF = 0.45;
/** How far off the trails the open, tree-free grass stays walkable. */
const OPEN_REACH = 12;
/** The maze's stretch (u): hedged trails, nothing walkable between them. */
const MAZE_U0 = 66;
const MAZE_U1 = 100;

/** Spatial hash of the obstacles (4-unit cells), built once the set is dressed. */
const CELL = 4;
const grid = new Map<string, { x: number; z: number; r: number }[]>();
function indexObstacles(): void {
  grid.clear();
  for (const o of obstacles) {
    const key = `${Math.floor(o.x / CELL)},${Math.floor(o.z / CELL)}`;
    let list = grid.get(key);
    if (!list) grid.set(key, (list = []));
    list.push(o);
  }
}

/** The walkable stretch of the map (u): the roads in and out run on past these ends, out of
 *  reach — that is where the transitions to Seles / Hellena / the Prairie will go. */
export const MAP_START_U = -12;
export const MAP_END_U = 152;

/**
 * Where you may walk, as a grid over the local (u, v) frame: the trails, plus the flat open grass
 * around them that no tree stands over — not under a crown, and not where a crown would hide you
 * from the camera. The wood itself is scenery.
 */
const MASK_RES = 0.5;
const MASK_U0 = -20;
const MASK_V0 = -45;
const MASK_NU = Math.ceil((170 - MASK_U0) / MASK_RES);
const MASK_NV = Math.ceil((45 - MASK_V0) / MASK_RES);
/** 0 blocked · 1 open grass · 2 trail (kept walkable whatever stands near). */
const mask = new Uint8Array(MASK_NU * MASK_NV);

/** A tree's hold on the ground: the circle under its crown, and the band its crown covers on screen. */
interface Canopy {
  x: number;
  z: number;
  /** Radius of ground under the crown. */
  under: number;
  /** Crown cover on screen, in local up-screen offsets from the foot, and its half-width. */
  coverFrom: number;
  coverTo: number;
  coverHalf: number;
}
const canopies: Canopy[] = [];

function maskIndex(u: number, v: number): number {
  const i = Math.floor((u - MASK_U0) / MASK_RES);
  const j = Math.floor((v - MASK_V0) / MASK_RES);
  if (i < 0 || j < 0 || i >= MASK_NU || j >= MASK_NV) return -1;
  return j * MASK_NU + i;
}

function walkable(u: number, v: number): boolean {
  const k = maskIndex(u, v);
  return k >= 0 && mask[k] > 0;
}

/** Fill the walk mask once the set is dressed (trails, open grass, minus what the trees hold). */
function buildMask(): void {
  mask.fill(0);
  for (let j = 0; j < MASK_NV; j++)
    for (let i = 0; i < MASK_NU; i++) {
      const u = MASK_U0 + (i + 0.5) * MASK_RES;
      const v = MASK_V0 + (j + 0.5) * MASK_RES;
      if (inVoid(u, v, 0.3) || u < MAP_START_U || u > MAP_END_U) continue;
      const { x, z } = forestPoint(u, v);
      const n = nearestOnTrack(x, z);
      // In the maze only the trails themselves are walkable: its hedges are the walls.
      const reach = u > MAZE_U0 && u < MAZE_U1 ? 0.6 : OPEN_REACH;
      if (n.d <= n.w) mask[j * MASK_NU + i] = 2;
      else if (n.d <= n.w + reach) mask[j * MASK_NU + i] = 1;
    }
  const clear = (u: number, v: number): void => {
    const k = maskIndex(u, v);
    if (k >= 0 && mask[k] === 1) mask[k] = 0;
  };
  for (const c of canopies) {
    const { u: cu, v: cv } = toUV(c.x, c.z);
    // Under the crown.
    for (let u = cu - c.under; u <= cu + c.under; u += MASK_RES)
      for (let v = cv - c.under; v <= cv + c.under; v += MASK_RES)
        if ((u - cu) ** 2 + (v - cv) ** 2 <= c.under ** 2) clear(u, v);
    // Where the crown would hide you (up the screen from the foot).
    for (let u = cu + c.coverFrom; u <= cu + c.coverTo; u += MASK_RES)
      for (let v = cv - c.coverHalf; v <= cv + c.coverHalf; v += MASK_RES) clear(u, v);
  }
}

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
  if (!onBridge && !walkable(u, v)) {
    let best: { u: number; v: number; d: number } | null = null;
    const ci = Math.floor((u - MASK_U0) / MASK_RES);
    const cj = Math.floor((v - MASK_V0) / MASK_RES);
    for (let ring = 1; ring <= 8 && !best; ring++)
      for (let dj = -ring; dj <= ring; dj++)
        for (let di = -ring; di <= ring; di++) {
          if (Math.max(Math.abs(di), Math.abs(dj)) !== ring) continue;
          const i = ci + di;
          const j = cj + dj;
          if (i < 0 || j < 0 || i >= MASK_NU || j >= MASK_NV || !mask[j * MASK_NU + i]) continue;
          // Nearest point of that cell (just inside it).
          const u0 = MASK_U0 + i * MASK_RES;
          const v0 = MASK_V0 + j * MASK_RES;
          const nu = Math.min(u0 + MASK_RES * 0.98, Math.max(u0 + MASK_RES * 0.02, u));
          const nv = Math.min(v0 + MASK_RES * 0.98, Math.max(v0 + MASK_RES * 0.02, v));
          const d = (nu - u) ** 2 + (nv - v) ** 2;
          if (!best || d < best.d) best = { u: nu, v: nv, d };
        }
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
  const cx = Math.floor(p.x / CELL);
  const cz = Math.floor(p.z / CELL);
  for (let ix = cx - 1; ix <= cx + 1; ix++)
    for (let iz = cz - 1; iz <= cz + 1; iz++) {
      const list = grid.get(`${ix},${iz}`);
      if (!list) continue;
      for (const o of list) {
        const dx = p.x - o.x;
        const dz = p.z - o.z;
        const d = Math.hypot(dx, dz);
        const rr = o.r + margin * 0.5;
        if (d < rr && d > 1e-4) {
          p.x = o.x + (dx / d) * rr;
          p.z = o.z + (dz / d) * rr;
        }
      }
    }
}

/**
 * Would something `height` tall with a crown `crown` wide, standing at (x, z), hide any part of
 * a trail from the iso camera? It does if the trail lies "above" it on screen within the reach of
 * its silhouette: up-screen distance ≤ height·tan(β), sideways within the crown. `minUp` ignores
 * the nearer part of that reach — for a tree, only its crown (not its thin trunk) must stay off.
 */
function occludesTrack(x: number, z: number, height: number, crown: number, minUp = -Infinity): boolean {
  const reach = height * TAN_BETA + crown;
  for (const s of ALL_SAMPLES) {
    const dx = s.p.x - x;
    const dz = s.p.z - z;
    const up = dx * FWD.x + dz * FWD.z; // > 0: the trail is above the object on screen
    if (up < Math.max(-s.w, minUp - s.w) || up > reach + s.w) continue;
    const side = Math.abs(dx * SIDE.x + dz * SIDE.z);
    if (side < crown + s.w) return true;
  }
  return false;
}

// --- Build ---------------------------------------------------------------------

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
  obstacles.length = 0;
  canopies.length = 0;
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
  shadeGround([...floors, track], trees);
  buildSunShafts(scene, root, rand);
  buildSky(scene, fixed);
  buildPollen(scene);

  indexObstacles();
  buildMask();
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
    update: (_focus, dt) => {
      for (const c of chests.values()) c.tick(dt);
    },
    chests: new Map([...chests].map(([id, c]) => [id, c.at])),
    openChest: (id) => chests.get(id)?.open(),
    merchantHead,
  };
}

/** Matte material for the set (the PS1 had no specular to speak of). */
function matte(name: string, scene: Scene, tex?: Texture, color?: Color3): StandardMaterial {
  const m = new StandardMaterial(name, scene);
  if (tex) m.diffuseTexture = tex;
  if (color) m.diffuseColor = color;
  m.specularColor = Color3.Black();
  return m;
}

// --- Ground ----------------------------------------------------------------------

/** Extent of the terrain in the local frame (well past what the camera can see). */
const U_MIN = -50;
const U_MAX = 200;
const V_MIN = -60;
const V_MAX = 60;

/**
 * A grid mesh from a vertex function, rows along v and columns along u. Triangles are wound so
 * the face points towards `facing`.
 */
function gridMesh(
  name: string,
  scene: Scene,
  rows: number,
  cols: number,
  at: (i: number, j: number) => { x: number; y: number; z: number; tu: number; tv: number },
  facing: Vector3,
): Mesh {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= rows; i++)
    for (let j = 0; j <= cols; j++) {
      const p = at(i, j);
      positions.push(p.x, p.y, p.z);
      uvs.push(p.tu, p.tv);
    }
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) {
      const a = i * (cols + 1) + j;
      const b = a + cols + 1;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  let normals: number[] = [];
  VertexData.ComputeNormals(positions, indices, normals);
  // Wrong way round? Flip every triangle (and the normals with it).
  let dot = 0;
  for (let k = 0; k < normals.length; k += 3) dot += normals[k] * facing.x + normals[k + 1] * facing.y + normals[k + 2] * facing.z;
  if (dot < 0) {
    for (let k = 0; k < indices.length; k += 3) [indices[k + 1], indices[k + 2]] = [indices[k + 2], indices[k + 1]];
    normals = normals.map((n) => -n);
  }
  const vd = new VertexData();
  vd.positions = positions;
  vd.indices = indices;
  vd.uvs = uvs;
  vd.normals = normals;
  const mesh = new Mesh(name, scene);
  vd.applyToMesh(mesh, true);
  return mesh;
}

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
  const cliffCols = 70;
  const cliff = gridMesh("forestCliffFace", scene, 1, cliffCols, (i, j) => {
    const u = 40 + (66 - 40) * (j / cliffCols);
    const e = cliffE(u);
    const p = forestPoint(u, i === 0 ? e : e + 9);
    return { x: p.x, y: i === 0 ? 0.02 : -26, z: p.z, tu: u / 4, tv: i === 0 ? 0 : 3.4 };
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
    const extend = (from: Sample, dir: number, len: number): { p: Vector3; t: Vector3 }[] =>
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

/** Push every vertex a little, so primitives lose their machine-made regularity. */
function jitter(mesh: Mesh, amount: number, rand: () => number): void {
  const pos = mesh.getVerticesData(VertexBuffer.PositionKind);
  if (!pos) return;
  // Equal positions must move together or the surface tears: key the offset on the position.
  const moved = new Map<string, [number, number, number]>();
  for (let i = 0; i < pos.length; i += 3) {
    const key = `${pos[i].toFixed(3)},${pos[i + 1].toFixed(3)},${pos[i + 2].toFixed(3)}`;
    let o = moved.get(key);
    if (!o) {
      o = [(rand() - 0.5) * amount, (rand() - 0.5) * amount, (rand() - 0.5) * amount];
      moved.set(key, o);
    }
    pos[i] += o[0];
    pos[i + 1] += o[1];
    pos[i + 2] += o[2];
  }
  mesh.updateVerticesData(VertexBuffer.PositionKind, pos);
}

/**
 * Vertex colours graded by height within the part: shaded underside → sunlit top. That is the read
 * of every bush and crown on the reference screens — dark olive bellies, warm yellow-lit caps.
 * Every part of a merged source needs colours (MergeMeshes keeps only shared vertex kinds), so bark
 * gets a flat `lo = hi`.
 */
function gradeColors(mesh: Mesh, lo: [number, number, number], hi: [number, number, number]): void {
  const pos = mesh.getVerticesData(VertexBuffer.PositionKind);
  if (!pos) return;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 1; i < pos.length; i += 3) {
    minY = Math.min(minY, pos[i]);
    maxY = Math.max(maxY, pos[i]);
  }
  const span = maxY - minY || 1;
  const c = new Float32Array((pos.length / 3) * 4);
  for (let i = 0, j = 0; i < pos.length; i += 3, j += 4) {
    const t = Math.pow((pos[i + 1] - minY) / span, 1.4);
    c[j] = lo[0] + (hi[0] - lo[0]) * t;
    c[j + 1] = lo[1] + (hi[1] - lo[1]) * t;
    c[j + 2] = lo[2] + (hi[2] - lo[2]) * t;
    c[j + 3] = 1;
  }
  mesh.setVerticesData(VertexBuffer.ColorKind, c, false, 4);
}

const LEAF_SHADE: [number, number, number] = [0.26, 0.27, 0.2];
const LEAF_SUN: [number, number, number] = [1.4, 1.28, 0.74];
const PLAIN: [number, number, number] = [1, 1, 1];

/** Merge parts into one mesh (one sub-mesh per material), flat-shaded, hidden: a source for instances. */
function mergeSource(name: string, parts: Mesh[], flat = true): Mesh {
  const merged = Mesh.MergeMeshes(parts, true, true, undefined, false, true);
  if (!merged) throw new Error(`forest: could not merge ${name}`);
  merged.name = name;
  if (flat) merged.convertToFlatShadedMesh();
  else merged.createNormals(true); // jittered parts: recompute so the shading follows the lumps
  merged.setEnabled(false);
  return merged;
}

/** Point every normal straight up: foliage cards then light like the ground they grow from,
 *  instead of going black or white depending on which way the card happens to face. */
function normalsUp(mesh: Mesh): void {
  const n = mesh.getVerticesData(VertexBuffer.NormalKind);
  if (!n) return;
  for (let i = 0; i < n.length; i += 3) {
    n[i] = 0;
    n[i + 1] = 1;
    n[i + 2] = 0;
  }
  mesh.updateVerticesData(VertexBuffer.NormalKind, n);
}

function barkTexture(scene: Scene, rand: () => number): DynamicTexture {
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

function leafTexture(scene: Scene, rand: () => number): DynamicTexture {
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
function fernTexture(scene: Scene, rand: () => number): DynamicTexture {
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

/** Stretch a part's UVs (tubes come out with v in 0…1 over their whole length). */
function scaleUV(mesh: Mesh, su: number, sv: number): void {
  const uv = mesh.getVerticesData(VertexBuffer.UVKind);
  if (!uv) return;
  for (let i = 0; i < uv.length; i += 2) {
    uv[i] *= su;
    uv[i + 1] *= sv;
  }
  mesh.setVerticesData(VertexBuffer.UVKind, uv);
}

/** A bent, tapering limb along `path`, radius `r0` → `r1` with knotty bulges. */
function limb(name: string, scene: Scene, path: Vector3[], r0: number, r1: number, rand: () => number): Mesh {
  const knot = rand() * 10;
  const tube = MeshBuilder.CreateTube(
    name,
    {
      path,
      tessellation: 8,
      cap: Mesh.CAP_START,
      radiusFunction: (i, d) => {
        const t = i / (path.length - 1);
        return (r0 + (r1 - r0) * t) * (1 + 0.14 * Math.sin(d * 2.3 + knot));
      },
    },
    scene,
  );
  let len = 0;
  for (let k = 1; k < path.length; k++) len += Vector3.Distance(path[k - 1], path[k]);
  scaleUV(tube, 2, len / 3);
  return tube;
}

/**
 * A big forest tree, after the reference screens: a thick, gnarled trunk that bends as it rises,
 * roots gripping the ground, two heavy limbs, and a high, lumpy crown — high enough that the iso
 * camera sees the trunks, which is what makes the wood read as a wood.
 */
function treeSource(i: number, scene: Scene, bark: StandardMaterial, leaves: StandardMaterial, rand: () => number): Mesh {
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
    const b = MeshBuilder.CreateIcoSphere(`t${i}leaf${k}`, { radius: 1.2 + rand() * 0.7, subdivisions: 2, flat: false }, scene);
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
function groveSource(scene: Scene, bark: StandardMaterial, leaves: StandardMaterial, rand: () => number): Mesh {
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
    const b = MeshBuilder.CreateIcoSphere(`groveLeaf${k}`, { radius: 1.0 + rand() * 0.5, subdivisions: 2, flat: false }, scene);
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
function saplingSource(scene: Scene, bark: StandardMaterial, leaves: StandardMaterial, rand: () => number): Mesh {
  const trunk = MeshBuilder.CreateCylinder("sapTrunk", { height: 1.6, diameterTop: 0.08, diameterBottom: 0.16, tessellation: 5 }, scene);
  trunk.position.y = 0.8;
  trunk.material = bark;
  gradeColors(trunk, PLAIN, PLAIN);
  const crown = MeshBuilder.CreateIcoSphere("sapCrown", { radius: 0.75, subdivisions: 1 }, scene);
  crown.position.y = 1.75;
  crown.scaling.y = 0.85;
  jitter(crown, 0.3, rand);
  gradeColors(crown, LEAF_SHADE, LEAF_SUN);
  crown.material = leaves;
  return mergeSource("forestSapling", [trunk, crown]);
}

function bushSource(scene: Scene, leaves: StandardMaterial, rand: () => number): Mesh {
  // A clump of small lumps (not three big ones): the rounded, bubbly bushes of the reference shots.
  const parts: Mesh[] = [];
  for (let k = 0; k < 7; k++) {
    const r = 0.32 + rand() * 0.22;
    const b = MeshBuilder.CreateIcoSphere(`bush${k}`, { radius: r, subdivisions: 2, flat: false }, scene);
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

function rockSource(scene: Scene, rand: () => number): Mesh {
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

function fernSource(scene: Scene, rand: () => number): Mesh {
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

/** Crossed alpha-tested cards (three planes at 60°) carrying a painted plant. */
function cardSource(name: string, scene: Scene, tex: Texture, w: number, h: number): Mesh {
  const mat = matte(`${name}Mat`, scene, tex);
  mat.backFaceCulling = false;
  const parts: Mesh[] = [];
  for (let k = 0; k < 3; k++) {
    const card = MeshBuilder.CreatePlane(`${name}${k}`, { width: w, height: h }, scene);
    card.position.y = h / 2 - 0.02;
    card.rotation.y = (k / 3) * Math.PI;
    card.material = mat;
    parts.push(card);
  }
  const src = mergeSource(name, parts, false);
  normalsUp(src);
  return src;
}

/** Tall grass: a tuft of blades fanning up from the ground, olive to straw at the tips. */
function grassSource(scene: Scene, rand: () => number): Mesh {
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
function flowerSource(scene: Scene, rand: () => number): Mesh {
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

/** Place an instance of `src`, frozen in place. */
function place(src: Mesh, root: TransformNode, x: number, z: number, scale: number, rotY: number): InstancedMesh {
  const inst = src.createInstance(`${src.name}_${x.toFixed(1)}_${z.toFixed(1)}`);
  inst.parent = root;
  inst.position.set(x, 0, z);
  inst.scaling.setAll(scale);
  inst.rotation.y = rotY;
  return inst;
}

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
        obstacles.push({ x, z, r: 1.7 * s });
        canopies.push({ x, z, under: 2 * s, coverFrom: 2.4 * s * TAN_BETA - 2 * s, coverTo: 5 * s * TAN_BETA + 2 * s + 1, coverHalf: 2 * s });
      } else if (dense && edge > 0.9) {
        // Maze hedges: big low clumps, packed — they wall the trails in (knee-to-waist high: at
        // most they hide your feet, never you).
        const s = 1.5 + rand() * 0.6;
        place(bush, root, x, z, s, rot);
        for (let k = 0; k < 2; k++) place(bush, root, x + (rand() - 0.5) * 2.2, z + (rand() - 0.5) * 2.2, s * (0.7 + rand() * 0.3), rand() * 6);
      } else if (edge > 0.9 && roll < (meadow ? 0.15 : open ? 0.4 : 0.85) && !occludesTrack(x, z, 15, 4.4, 9 * TAN_BETA - 4.4)) {
        const s = 0.85 + rand() * 0.4;
        const src = trees[(rand() * trees.length) | 0];
        const height = ((src.metadata?.height as number) ?? 13) * s;
        place(src, root, x, z, s, rot);
        shade.push({ x, z, r: 3.2 * s });
        obstacles.push({ x, z, r: 0.75 * s }); // every trunk is solid
        // You may walk right up to the trunk; only where the crown would truly hide you is off-limits.
        canopies.push({ x, z, under: 1.3 * s, coverFrom: (height - 2.5 * s) * TAN_BETA - 3 * s, coverTo: (height + 1 * s) * TAN_BETA + 3 * s + 1, coverHalf: 3 * s });
      } else if (edge > 0.4 && roll < 0.5 && !occludesTrack(x, z, 2.2, 1)) {
        const s = 0.8 + rand() * 0.5;
        place(sapling, root, x, z, s, rot);
        obstacles.push({ x, z, r: 0.2 * s });
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
          obstacles.push({ x, z, r: 0.75 * s });
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
  obstacles.push({ x: at.x, z: at.z, r: 1.6 });
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
  obstacles.push({ x: at.x, z: at.z, r: 1.2 });
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
  obstacles.push({ x: base.x, z: base.z, r: 0.5 });
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
      obstacles.push({ x, z, r: 0.7 * s });
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
    obstacles.push({ x: at.x, z: at.z, r: 0.6 });
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
  obstacles.push({ x: at.x, z: at.z, r: 0.5 });
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
  obstacles.push({ x: at.x, z: at.z, r: 0.35 });
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
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const k = 0.9 + rand() * 0.15;
        ctx.fillStyle = rgb(126 * k, 116 * k, 140 * k);
        ctx.fillRect(x, y, 1, 1);
      }
    for (let i = 0; i < 140; i++) {
      // Swell crests: short pale dashes.
      // (texture x runs up the screen once laid on the map, so a crest — sideways on screen — is
      // a short vertical run here)
      ctx.fillStyle = rand() < 0.5 ? rgb(184, 166, 186) : rgb(96, 88, 118);
      ctx.fillRect((rand() * w) | 0, (rand() * h) | 0, 1, 3 + ((rand() * 5) | 0));
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
  tex.uScale = 40;
  tex.vScale = 30;

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
  glitter.uScale = 30;
  glitter.vScale = 22;

  // Emissive, so keep both out of the mode's glow layer (created after the world: first frame),
  // then let the swell drift and the glitter shimmer.
  let t = 0;
  let excluded = false;
  scene.onBeforeRenderObservable.add(() => {
    if (!excluded) {
      excluded = true;
      for (const layer of scene.effectLayers) if (layer instanceof GlowLayer) for (const m of [sea, glint]) layer.addExcludedMesh(m);
    }
    t += scene.getEngine().getDeltaTime() / 1000;
    tex.vOffset = t * 0.01;
    glitter.vOffset = Math.floor(t * 3) * 0.37; // jumps, like light flickering on water
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
