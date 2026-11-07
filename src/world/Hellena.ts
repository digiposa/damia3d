import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

import { softDotTexture } from "./atmosphere";
import { LIGHTING_PRESETS } from "./lighting";
import { mulberry32, pixelTexture, rgb } from "./paint";
import { fromUV, toUV } from "./kit/frame";
import { grassSource, rockSource } from "./kit/flora";
import { gradeColors, gridMesh, jitter, limb, matte, place } from "./kit/mesh";
import type { InstancedMesh } from "@babylonjs/core/Meshes/instancedMesh";
import { hash01, noise2 } from "./kit/noise";
import { makeWater, type WaterOptions } from "./kit/water";
import { farLand } from "./kit/farLand";
import { Obstacles } from "./kit/obstacles";
import { GROUND_PPU } from "./kit/texels";
import { TrailNet, type Knot } from "./kit/trails";
import type { World } from "./World";

/**
 * Hellena Prison, outside (PS1, first visit): the coastal path at dusk, up the screen along a cliff
 * over the sea (left), rocks and a dead tree on the right, the prison rock rising at its end; a
 * drawbridge over the gap, then the guard post at the rock's foot — a wooden lookout tower and its
 * stairs at the cliff edge, balconies up the rock face, windows burning orange, the gate in.
 *
 * Authored in the iso (u, v) frame: u up the screen, v sideways (+ to the right).
 */

/**
 * Two sections (PS1 does it in two screens too): the coastal path, a scenic section with a low
 * perspective camera looking along it to the prison far out on the sea under the sunset; then the
 * guard post at the drawbridge, in the iso view. Story spots (u, v):
 */
export const HELLENA_SPOTS = {
  // The coastal path (scenic section).
  coastStart: { u: 2, v: 0 },
  coastBack: { u: -2.5, v: 0 }, // back to the Forest
  coastEnd: { u: 70, v: 0 }, // on to the guard post (a long walk: the view is the point)
  // The guard post (iso section).
  fromCoast: { u: 33, v: 0 },
  backToCoast: { u: 28.5, v: 0 }, // across the whole path's width (no slipping past it)
  bridge: { u: 49, v: 0 },
  landing: { u: 56, v: 1 },
  gate: { u: 60, v: 3 },
};

/** Hellena's sea at dusk (kit water), shared by both sections. */
const HELLENA_WATER: WaterOptions = {
  deep: new Color3(0.04, 0.03, 0.08),
  // What it mirrors away from the sun: the violet dusk (PS1: dark purple water, orange only under the sun).
  skyHorizon: new Color3(0.26, 0.13, 0.19),
  skyZenith: new Color3(0.1, 0.06, 0.16),
  sun: new Vector3(0, 0.06, 0).add(fromUV(1, -0.25).normalize()),
  sunColor: new Color3(1, 0.55, 0.28),
  glint: 1.2,
  waveScale: 6,
  fogColor: new Color3(0.55, 0.26, 0.22),
  fogStart: 160,
  fogEnd: 800,
}

const SEA_Y = -14;
const BRIDGE_U0 = 45.5; // the gap the drawbridge spans
const BRIDGE_U1 = 52.5;
const WALL_U = 61; // the prison's front wall

/** The cliff's edge over the sea, on the left of the path. */
function coastEdge(u: number): number {
  return -5.2 + 1.2 * Math.sin(u * 0.17) + 0.6 * Math.sin(u * 0.53 + 1);
}

/** The guard post section's ways in from the coast, over the bridge, round the landing. */
const TRAILS: Knot[][] = [
  [
    // The coastal path arriving (the same cobbled way, as wide, with the same gentle swing), from
    // well behind where the section starts: looking back, it runs on along the cliff.
    { u: -18, v: -0.3, w: 3.2 },
    { u: 4, v: 0.5, w: 3.2 },
    { u: 16, v: -0.3, w: 3.2 },
    { u: 28, v: 0.4, w: 3.2 },
    { u: 34, v: 0.4, w: 3.4 },
    { u: 44.5, v: 0, w: 3 },
    { u: 46, v: 0, w: 1.3 }, // the drawbridge
    { u: 52, v: 0, w: 1.3 },
    { u: 53.5, v: 0.4, w: 4.4 }, // the guard post's landing
    { u: 58.5, v: 1, w: 6.2 },
  ],
  // To the lookout tower's stairs, on the right before the drawbridge (PS1).
  [{ u: 35.5, v: 1, w: 2.4 }, { u: 37, v: 3.8, w: 2 }],
];
const GATE_NET = new TrailNet(TRAILS);
/** The coastal path, straight on towards the prison. */
/** The coastal path's half-width: the same all the way to the prison (it must not narrow). */
const COAST_W = 3.2;
const COAST_NET = new TrailNet([
  [
    { u: -8, v: 0, w: COAST_W },
    { u: 8, v: 0.5, w: COAST_W },
    { u: 20, v: -0.3, w: COAST_W },
    { u: 34, v: 0.4, w: COAST_W },
    { u: 48, v: 0, w: COAST_W },
    { u: 62, v: 0.5, w: COAST_W },
    { u: 76, v: -0.3, w: COAST_W },
    { u: 98, v: -1.5, w: COAST_W }, // on along the spit (seen, not walked: the section ends at 70)
  ],
]);
let NET = GATE_NET;

let obstacles = new Obstacles();
function clampToHellena(p: Vector3, margin = 0.4): void {
  const n = NET.nearest(p.x, p.z);
  const max = n.w - margin;
  if (n.d > max) {
    const k = max / n.d;
    p.x = n.px + (p.x - n.px) * k;
    p.z = n.pz + (p.z - n.pz) * k;
  }
  obstacles.pushOut(p, margin);
}

export function hellenaPoint(spot: { u: number; v: number }): Vector3 {
  return fromUV(spot.u, spot.v);
}

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number): number => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * The coastal path (scenic section): a low perspective shot along the path, the sea to the horizon,
 * the prison rock far out on it with its windows lit, the sunset sky with its first stars; rocks
 * and the dead tree framing the right.
 */
export function hellenaCoastWorld(scene: Scene): World {
  obstacles = new Obstacles();
  NET = COAST_NET;
  const rand = mulberry32(0xc0a57);
  const root = new TransformNode("hellenaCoast", scene);
  const rock = rockMaterial(scene, rand);
  // Two painted pieces: one would be wider than MAX_TEX at the standard density.
  const grounds = [...buildGround(scene, root, rand, -12, 42, [[-12, 42]]), ...buildGround(scene, root, rand, 42, 96, [[42, 96]])];
  buildCliffFaces(scene, root, rand, rock, [[-14, 98]], false);
  const tufts = buildRightRocks(scene, root, rand, rock, -12, 96, true);
  deadTree(scene, root, rand, fromUV(26, 3.8));
  buildSpit(scene, root, rand, rock);
  const ticks: ((dt: number) => void)[] = [];
  const noGlow = buildHorizon(scene, root, rand, ticks);
  ticks.push(seaBirds(scene, root, rand), spray(scene));
  // The wind off the sea: the tufts lean and sway (each its own phase).
  const phase = tufts.map(() => rand() * 6);
  let wind = 0;
  ticks.push((dt) => {
    wind += dt;
    tufts.forEach((g, i) => (g.rotation.z = 0.12 + 0.1 * Math.sin(wind * 2.2 + phase[i])));
  });
  let glowChecked = false;
  obstacles.index();
  for (const m of root.getChildMeshes()) {
    m.isPickable = false;
    if (!m.name.startsWith("hellenaGull") && !tufts.includes(m as InstancedMesh)) m.freezeWorldMatrix();
  }
  return {
    clamp: clampToHellena,
    preset: LIGHTING_PRESETS.hellenaCoast,
    framing: 0,
    view: { beta: 1.32, fov: 0.85, radius: 11, lift: 1.4 },
    shadowReceivers: grounds,
    ownFill: [],
    update: (_focus, dt) => {
      for (const t of ticks) t(dt);
      if (glowChecked) return;
      glowChecked = true; // the mode's glow layer is created after the world
      for (const layer of scene.effectLayers) if (layer instanceof GlowLayer) for (const m of noGlow) layer.addExcludedMesh(m);
    },
  };
}

/** The Hellena guard post (iso section): the drawbridge, the landing, the prison's front. */
export function hellenaWorld(scene: Scene): World {
  obstacles = new Obstacles();
  NET = GATE_NET;
  const rand = mulberry32(0x4e11e4a);
  const root = new TransformNode("hellena", scene);
  const rock = rockMaterial(scene, rand);
  const wood = matte("hellenaWood", scene, undefined, new Color3(0.32, 0.22, 0.15));

  // The ground starts well behind the section's start, so the coastal path runs on behind the hero
  // (two painted pieces: one would be wider than MAX_TEX at the standard density).
  const grounds = [
    ...buildGround(scene, root, rand, -18, 16, [[-18, 16]]),
    ...buildGround(scene, root, rand, 16, WALL_U + 1, [[16, BRIDGE_U0], [BRIDGE_U1, WALL_U + 1]]),
  ];
  buildCliffFaces(scene, root, rand, rock, [[-20, BRIDGE_U0], [BRIDGE_U1, WALL_U + 2]], true);
  // The coast's high craggy wall of rocks on the right, up to where the lookout stands (PS1: none
  // around the lookout).
  buildRightRocks(scene, root, rand, rock, -18, 30.5, true);
  const ticks = buildPrison(scene, root, rand, rock, wood);
  buildDrawbridge(scene, root, rand, wood);
  const noGlow = buildHorizon(scene, root, rand, ticks, false);
  // The land going on past the guard post's ground, behind and to the right (the free camera
  // looks that way): the rock rising into dark hills; the sea on the left and the drawbridge's gap
  // stay open.
  farLand(scene, root, {
    center: fromUV(42, 4),
    inner: 12,
    outer: 600,
    flat: 22,
    height: 60,
    near: new Color3(0.27, 0.24, 0.26),
    far: new Color3(0.2, 0.17, 0.22),
    seed: 3,
    land: (x, z) => {
      const { u, v } = hellenaUV(new Vector3(x, 0, z));
      const gap = smooth(BRIDGE_U0 - 0.2, BRIDGE_U0 + 0.8, u) * (1 - smooth(BRIDGE_U1 - 0.8, BRIDGE_U1 + 0.2, u));
      return smooth(coastEdge(u) + 0.6, coastEdge(u) + 4, v) * (1 - gap);
    },
    sink: SEA_Y - 3,
    rings: 36,
    segments: 96,
  });
  let glowChecked = false;

  obstacles.index();
  for (const m of root.getChildMeshes()) {
    m.isPickable = false;
    m.freezeWorldMatrix();
  }
  return {
    clamp: clampToHellena,
    preset: LIGHTING_PRESETS.hellenaCoast,
    framing: 0,
    // Scenic, like the coast (PS1: a low shot of the guard post under its overhang of rock).
    view: { beta: 1.3, fov: 0.9, radius: 12, lift: 2.2 },
    shadowReceivers: grounds,
    ownFill: [],
    update: (_focus, dt) => {
      for (const t of ticks) t(dt);
      if (glowChecked) return;
      glowChecked = true; // the mode's glow layer is created after the world
      for (const layer of scene.effectLayers) if (layer instanceof GlowLayer) for (const m of noGlow) layer.addExcludedMesh(m);
    },
  };
}

// --- Materials -----------------------------------------------------------------------------------

/** Dark blue-grey rock, in rough lumps (the prison rock and the coast's cliffs). */
function rockMaterial(scene: Scene, rand: () => number): StandardMaterial {
  const tex = pixelTexture("hellenaRockTex", scene, 64, 64, (ctx, w, h) => {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const n = noise2(x / 9, y / 9) * 0.6 + noise2(x / 3.5, y / 3.5) * 0.4;
        const k = (0.55 + 0.6 * n) * (0.92 + rand() * 0.16);
        ctx.fillStyle = rgb(78 * k, 80 * k, 96 * k);
        ctx.fillRect(x, y, 1, 1);
      }
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = rgb(28, 28, 36); // cracks
      const x = (rand() * w) | 0;
      const y = (rand() * h) | 0;
      ctx.fillRect(x, y, 1, 3 + ((rand() * 6) | 0));
    }
  });
  tex.wrapU = tex.wrapV = Texture.WRAP_ADDRESSMODE;
  return matte("hellenaRock", scene, tex);
}

// --- Ground ----------------------------------------------------------------------------------------

/**
 * The cliff-top ground, painted at the standard density: the path of dark blue-grey cobbles (PS1),
 * the rest bare rock and earth with a few tufts. Two pieces, either side of the drawbridge's gap;
 * past the cliff edge the vertices fold onto it.
 */
function buildGround(scene: Scene, root: TransformNode, rand: () => number, U0: number, U1: number, pieces: [number, number][]): Mesh[] {
  const V0 = -10;
  const V1 = 18;
  const W = (U1 - U0) * GROUND_PPU;
  const H = (V1 - V0) * GROUND_PPU;
  const tex = new DynamicTexture(`hellenaGroundTex${U0}`, { width: W, height: H }, scene, false, Texture.NEAREST_SAMPLINGMODE);
  tex.wrapU = tex.wrapV = Texture.CLAMP_ADDRESSMODE;
  const ctx = tex.getContext() as CanvasRenderingContext2D;
  const img = ctx.createImageData(W, H);
  const out = img.data;
  for (let y = 0; y < H; y++) {
    const v = V1 - (y + 0.5) / GROUND_PPU;
    for (let x = 0; x < W; x++) {
      const u = U0 + (x + 0.5) / GROUND_PPU;
      const p = fromUV(u, v);
      const n = NET.nearest(p.x, p.z);
      const edge = n.d - n.w * 0.85 + (noise2(u * 1.2, v * 1.2) - 0.5) * 0.8;
      const grain = rand();
      let r: number;
      let g: number;
      let b: number;
      if (edge < 0) {
        // Cobbles: rows of rounded stones (offset every other row), dark joints between.
        const cu = u * 2.2;
        const row = Math.floor(v * 2.6);
        const cv = v * 2.6;
        const cell = Math.floor(cu + (row % 2) * 0.5);
        const fu = cu + (row % 2) * 0.5 - cell;
        const fv = cv - row;
        const joint = fu < 0.1 || fv < 0.12;
        const tone = 0.7 + 0.4 * hash01(cell, row);
        const k = tone * (0.9 + grain * 0.14) * (fv > 0.7 ? 0.86 : fv < 0.3 ? 1.1 : 1); // lit top, shaded foot
        [r, g, b] = joint ? [34, 34, 44] : [92 * k, 94 * k, 112 * k];
      } else {
        // Bare rock and dark earth, a few dry tufts.
        const k = (0.6 + 0.4 * noise2(u * 0.6, v * 0.6)) * (0.85 + grain * 0.25);
        [r, g, b] = [70 * k, 62 * k, 66 * k];
        if (grain < 0.05) [r, g, b] = [104, 92, 70];
      }
      // Toward the cliff's edge the rock darkens.
      const lip = 1 - 0.4 * (1 - smooth(0, 1.6, v - coastEdge(u)));
      const o = (y * W + x) * 4;
      out[o] = r * lip;
      out[o + 1] = g * lip;
      out[o + 2] = b * lip;
      out[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  tex.update();
  const mat = matte(`hellenaGroundMat${U0}`, scene, tex);
  const piece = (name: string, a: number, c: number): Mesh => {
    const cols = Math.round((c - a) * 2);
    const m = gridMesh(name, scene, (V1 - V0) * 2, cols, (i, j) => {
      const u = a + (j / cols) * (c - a);
      const v = Math.max(coastEdge(u), V0 + i / 2);
      const p = fromUV(u, v);
      return { x: p.x, y: 0, z: p.z, tu: (u - U0) / (U1 - U0), tv: (v - V0) / (V1 - V0) };
    }, Vector3.Up());
    m.material = mat;
    m.parent = root;
    return m;
  };
  return pieces.map(([a, c]) => piece(`hellenaGround${a}`, a, c));
}

/** Rock faces dropping to the sea: along the coast's edge, and either side of the drawbridge's gap. */
function buildCliffFaces(scene: Scene, root: TransformNode, rand: () => number, rock: StandardMaterial, coasts: [number, number][], gap: boolean): void {
  const strip = (name: string, n: number, top: (t: number) => Vector3, out: (t: number) => Vector3): void => {
    const m = gridMesh(name, scene, 3, n, (i, j) => {
      const t = j / n;
      const f = i / 3;
      const q = top(t).add(out(t).scale(f * 2.4 + (rand() - 0.5) * 0.6 * f));
      return { x: q.x, y: f * SEA_Y - 0.02 + (f > 0 && f < 1 ? (rand() - 0.5) * 1.2 : 0), z: q.z, tu: t * n * 0.4, tv: f * 3 };
    }, out(0)); // facing outwards (each face its own way: a fixed one culled the gap's faces)
    m.material = rock;
    m.parent = root;
    m.convertToFlatShadedMesh();
  };
  const left = fromUV(0, -1).subtract(fromUV(0, 0));
  const coast = (a: number, c: number): void => strip(`hellenaCliff${a}`, Math.round((c - a) * 1.5), (t) => fromUV(a + t * (c - a), coastEdge(a + t * (c - a))), () => left);
  for (const [a, c] of coasts) coast(a, c);
  if (!gap) return;
  // The gap's two faces, across the land.
  const down = fromUV(-1, 0).subtract(fromUV(0, 0));
  const up = down.scale(-1);
  strip("hellenaGapNear", 30, (t) => fromUV(BRIDGE_U0, coastEdge(BRIDGE_U0) + t * 24), () => up);
  strip("hellenaGapFar", 30, (t) => fromUV(BRIDGE_U1, coastEdge(BRIDGE_U1) + t * 24), () => down);
}


/** Rocks heaped along the right of the path, rising into a rough wall (the PS1 cliff on the right). */
function buildRightRocks(scene: Scene, root: TransformNode, rand: () => number, rock: StandardMaterial, u0: number, u1: number, tall: boolean): InstancedMesh[] {
  const tufts: InstancedMesh[] = [];
  const small = rockSource(scene, rand);
  const grass = grassSource(scene, rand);
  // On the coast (seen low from behind) the rocks rise into a high craggy wall (PS1).
  const rows: [number, number][] = tall ? [[4.4, 1], [6.8, 1.8], [9.6, 2.8], [13, 3.8]] : [[4.6, 1], [7, 1.6], [10, 2.3]];
  for (let u = u0; u < u1; u += 2.2) {
    if (u > BRIDGE_U0 - 1 && u < BRIDGE_U1 + 1) continue;
    for (const [dv, s] of rows) {
      const v = 0.5 + dv + (rand() - 0.5) * 1.4;
      const at = fromUV(u + (rand() - 0.5) * 1.6, v);
      const r = (0.9 + rand() * 0.8) * s;
      // On the coast: lumpier (PS1: a knobbly, crumbly rock face), lit cold blue on its tops.
      const lump = MeshBuilder.CreateIcoSphere("hellenaBoulder", { radius: r, subdivisions: tall ? 3 : 2 }, scene);
      lump.scaling.y = 0.75 + rand() * 0.6;
      lump.position.set(at.x, r * (tall && dv > 9 ? 0.9 : 0.35), at.z);
      jitter(lump, (tall ? 0.16 : 0.25) * r, rand);
      if (tall) {
        // Knobs: push each vertex out by a little noise of its own.
        const p = lump.getVerticesData("position")!;
        for (let k = 0; k < p.length; k += 3) {
          const n = 1 + 0.18 * (noise2(p[k] * 1.3 + u, p[k + 2] * 1.3 + p[k + 1]) - 0.5) * 2;
          p[k] *= n;
          p[k + 1] *= n;
          p[k + 2] *= n;
        }
        lump.setVerticesData("position", p);
        lump.convertToFlatShadedMesh();
      }
      lump.material = rock;
      lump.parent = root;
      if (tall) gradeColors(lump, [0.44, 0.45, 0.52], [1.02, 1.08, 1.28]);
      else gradeColors(lump, [0.5, 0.5, 0.56], [1, 1, 1.05]);
      if (dv < 6) obstacles.add(at.x, at.z, r * 0.9);
    }
    // Small stones and tufts on the path's verges.
    const sv = (rand() < 0.5 ? -1 : 1) * (2.6 + rand());
    const s = fromUV(u, sv > 0 ? sv : Math.max(coastEdge(u) + 0.6, sv));
    if (rand() < 0.6) place(small, root, s.x, s.z, 0.4 + rand() * 0.4, rand() * 6);
    else tufts.push(place(grass, root, s.x, s.z, 0.7 + rand() * 0.4, rand() * 3));
  }
  return tufts;
}

/** The bare dead tree reaching over the path from the rocks (PS1: pale twisted branches). */
function deadTree(scene: Scene, root: TransformNode, rand: () => number, at: Vector3): void {
  // Bleached and gnarled (PS1): a twisting trunk out of the rock, roots gripping it, long branches
  // reaching over the path and drooping at their tips, forking into thin twigs.
  const bark = matte("hellenaDeadBark", scene, undefined, new Color3(0.66, 0.68, 0.74));
  const parts: Mesh[] = [];
  const trunk = [0, 1, 2, 3, 4].map((k) => new Vector3(at.x - k * 0.45 + Math.sin(k * 1.7) * 0.3, k * 1.25, at.z - k * 0.2 + Math.cos(k * 1.3) * 0.25));
  parts.push(limb("hellenaTreeTrunk", scene, trunk, 0.5, 0.1, rand));
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + rand() * 0.5;
    const len = 1 + rand() * 1.2;
    parts.push(limb("hellenaTreeRoot", scene, [0, 0.5, 1].map((f) => new Vector3(at.x + Math.cos(a) * len * f, 0.5 * (1 - f) ** 1.5, at.z + Math.sin(a) * len * f)), 0.22, 0.04, rand));
  }
  for (let k = 0; k < 10; k++) {
    const from = trunk[2 + (k % 3)];
    const a = Math.PI + (rand() - 0.5) * 2.4; // mostly reaching over the path (to the left)
    const len = 2 + rand() * 2.8;
    const pts = [0, 0.3, 0.6, 0.85, 1].map((f) => new Vector3(
      from.x + Math.cos(a + f * 0.6) * len * f,
      from.y + len * (0.45 * f - 0.55 * f * f) + 0.2 * Math.sin(f * 7), // up, then drooping at the tip
      from.z + Math.sin(a + f * 0.6) * len * f * 0.6,
    ));
    parts.push(limb("hellenaTreeBranch", scene, pts, 0.12, 0.015, rand));
    const mid = pts[2];
    const b = a + (rand() < 0.5 ? -1 : 1) * 0.8;
    parts.push(limb("hellenaTreeTwig", scene, [mid, new Vector3(mid.x + Math.cos(b) * 0.7, mid.y + 0.3, mid.z + Math.sin(b) * 0.5), new Vector3(mid.x + Math.cos(b) * 1.3, mid.y + 0.2, mid.z + Math.sin(b) * 0.9)], 0.05, 0.01, rand));
  }
  const tree = Mesh.MergeMeshes(parts, true, true);
  if (tree) {
    tree.material = bark;
    tree.parent = root;
    gradeColors(tree, [0.45, 0.5, 0.62], [1.1, 1.1, 1.15]);
  }
  obstacles.add(at.x, at.z, 0.6);
}

/**
 * Past the walkable end of the coastal path the land runs on to the prison (PS1: a long dark spit
 * of rock between the sea and the sky, the prison at its end): a ridge narrowing and sinking towards
 * the sea, sheer sides down to the water, boulders along its back, the path's line on it. Seen only
 * from afar (fog darkens it into a silhouette), so plain tiled rock, no painting.
 */
function buildSpit(scene: Scene, root: TransformNode, rand: () => number, rock: StandardMaterial): void {
  const U0 = 95.5; // overlapping the painted ground's far edge (96)
  const U1 = 292;
  const N = 80;
  const COLS = 16;
  const at = (j: number): { u: number; t: number; left: number; right: number; y: number; path: number; pw: number } => {
    const u = U0 + (j / N) * (U1 - U0);
    const t = (u - U0) / (U1 - U0);
    const centre = -12 * smooth(0.2, 1, t); // drifting left, towards the prison
    // The path's line: where the painted path leaves it (v -1.5), drifting with the spit.
    const path = centre - 1.5 * (1 - smooth(0, 0.2, t));
    const half = COAST_W * 0.85 + 1.4 + 4 * (1 - t) + 1.2 * Math.abs(Math.sin(u * 0.09)); // always wider than the path
    // It starts exactly on the coast's edge (no ledge jutting past the cliff), then narrows.
    const e = smooth(0, 0.15, t);
    const left = coastEdge(u) * (1 - e) + Math.max(coastEdge(u), centre - half) * e;
    const right = 18 * (1 - smooth(0, 0.25, t)) + (centre + half) * smooth(0, 0.25, t);
    const y = (SEA_Y + 5) * smooth(0.08, 1, t) ** 0.8;
    return { u, t, left, right, y, path, pw: COAST_W * 0.85 }; // as wide as the painted path
  };
  /** The spit's back at a point: flat along the path, humped away from it (low near the start). */
  const lift = (a: ReturnType<typeof at>, v: number): number => {
    const off = Math.max(0, Math.abs(v - a.path) - a.pw - 0.6);
    return Math.min(1, off / 4) * 1.6 * smooth(0.02, 0.3, a.t) * (0.6 + 0.4 * Math.sin(a.u * 0.4 + v));
  };
  // Its back: the same dark earth as the ground off the path, so the two meet without a seam.
  const earth = pixelTexture("hellenaSpitEarthTex", scene, 64, 64, (ctx, w, h) => {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const k = (0.6 + 0.4 * noise2(x / 6, y / 6)) * (0.85 + rand() * 0.25);
        ctx.fillStyle = rand() < 0.05 ? rgb(104, 92, 70) : rgb(70 * k, 62 * k, 66 * k);
        ctx.fillRect(x, y, 1, 1);
      }
  });
  earth.wrapU = earth.wrapV = Texture.WRAP_ADDRESSMODE;
  const top = gridMesh("hellenaSpitTop", scene, COLS, N, (i, j) => {
    const a = at(j);
    const v = a.left + (a.right - a.left) * (i / COLS);
    const p = fromUV(a.u, v);
    return { x: p.x, y: a.y + lift(a, v), z: p.z, tu: a.u / 3.2, tv: v / 3.2 };
  }, Vector3.Up());
  top.material = matte("hellenaSpitEarth", scene, earth);
  top.parent = root;
  // The path itself, carrying on along the spit: the same cobbles, a ribbon on its back.
  const cobbles = pixelTexture("hellenaCobbleTex", scene, 64, 64, (ctx, w, h) => {
    const rows = 8;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const row = Math.floor((y / h) * rows);
        const fv = (y / h) * rows - row;
        const cu = (x / w) * 7 + (row % 2) * 0.5;
        const cell = Math.floor(cu);
        const fu = cu - cell;
        const joint = fu < 0.1 || fv < 0.12;
        const k = (0.7 + 0.4 * hash01(cell, row)) * (0.9 + rand() * 0.14) * (fv > 0.7 ? 0.86 : fv < 0.3 ? 1.1 : 1);
        ctx.fillStyle = joint ? rgb(34, 34, 44) : rgb(92 * k, 94 * k, 112 * k);
        ctx.fillRect(x, y, 1, 1);
      }
  });
  cobbles.wrapU = cobbles.wrapV = Texture.WRAP_ADDRESSMODE;
  let along = 0;
  let prev: Vector3 | undefined;
  const lens: number[] = [];
  for (let j = 0; j <= N; j++) {
    const a = at(j);
    const p = fromUV(a.u, a.path);
    if (prev) along += Vector3.Distance(prev, p);
    lens.push(along);
    prev = p;
  }
  const ribbon = gridMesh("hellenaSpitPath", scene, 4, N, (i, j) => {
    const a = at(j);
    const ragged = i === 0 || i === 4 ? (hash01(j, i) - 0.5) * 0.5 : 0;
    const v = a.path + (i / 4 - 0.5) * 2 * a.pw + ragged;
    const p = fromUV(a.u, v);
    return { x: p.x, y: a.y + lift(a, v) + 0.03, z: p.z, tu: lens[j] / 2.9, tv: (i / 4) * (2 * a.pw) / 2.9 };
  }, Vector3.Up());
  const pathMat = matte("hellenaSpitPathMat", scene, cobbles);
  pathMat.zOffset = -2;
  ribbon.material = pathMat;
  ribbon.parent = root;
  for (const side of [0, 1]) {
    const wall = gridMesh(`hellenaSpitSide${side}`, scene, 3, N, (i, j) => {
      const a = at(j);
      const v = side === 0 ? a.left : a.right;
      const out = (i / 3) * 3 * (side === 0 ? -1 : 1);
      const p = fromUV(a.u, v + out + (i > 0 && i < 3 ? (rand() - 0.5) : 0));
      const yTop = a.y + lift(a, v);
      return { x: p.x, y: yTop + (SEA_Y - yTop) * (i / 3), z: p.z, tu: a.u / 4, tv: i };
    }, side === 0 ? fromUV(0, -1) : fromUV(0, 1));
    wall.material = rock;
    wall.parent = root;
    wall.convertToFlatShadedMesh();
  }
  // Boulders along its back, off the path, thinning out towards the prison.
  for (let j = 2; j < N - 4; j += 1) {
    const a = at(j);
    if (rand() > 0.85 - a.t * 0.5) continue;
    const r = (1 + rand() * 2.2) * (1 - a.t * 0.6);
    const side = rand() < 0.75 ? 1 : -1;
    const v = side > 0 ? a.path + a.pw + r + rand() * Math.max(0, a.right - a.path - a.pw - 2 * r) : a.path - a.pw - r - rand() * 0.5;
    if (v < a.left + 0.5 || v > a.right - 0.5) continue;
    const p = fromUV(a.u + (rand() - 0.5) * 3, v);
    const lump = MeshBuilder.CreateIcoSphere("hellenaSpitRock", { radius: r, subdivisions: 1 }, scene);
    lump.scaling.y = 0.7 + rand() * 0.5;
    lump.position.set(p.x, a.y + lift(a, v) + r * 0.3, p.z);
    jitter(lump, 0.2 * r, rand);
    lump.material = rock;
    lump.parent = root;
  }
}

// --- The horizon (scenic section) -----------------------------------------------------------------

/**
 * What the low camera sees beyond the cliff: a sunset sky dome (violet overhead, burning rose and
 * orange at the horizon behind the prison, first stars), long dark clouds, the sea out to the
 * horizon catching the sunset, and the prison: a great leaning rock far out on the water, its
 * windows lit. All unlit and out of the fog (the colour is all emissive, tinted per vertex).
 */
function buildHorizon(scene: Scene, root: TransformNode, rand: () => number, ticks: ((dt: number) => void)[], farPrison = true): Mesh[] {
  const noGlow: Mesh[] = []; // big unlit surfaces: kept out of the glow layer (it would bloom them white)
  const unlit = (name: string): StandardMaterial => {
    const m = new StandardMaterial(name, scene);
    m.disableLighting = true;
    m.fogEnabled = false;
    m.diffuseColor = Color3.Black();
    m.specularColor = Color3.Black();
    m.emissiveColor = Color3.White();
    return m;
  };
  const toSun = fromUV(1, -0.25).normalize(); // up the screen, a little left: behind the prison
  const sky = MeshBuilder.CreateSphere("hellenaSky", { diameter: 1600, segments: 24, sideOrientation: Mesh.BACKSIDE }, scene);
  sky.infiniteDistance = true;
  sky.material = unlit("hellenaSkyMat");
  const sp = sky.getVerticesData("position")!;
  const sc: number[] = [];
  for (let k = 0; k < sp.length; k += 3) {
    const d = new Vector3(sp[k], sp[k + 1], sp[k + 2]).normalize();
    const e = Math.max(0, d.y); // elevation
    const sun = Math.max(0, d.x * toSun.x + d.z * toSun.z); // facing the sunset
    const low = 1 - smooth(0, 0.35, e);
    const glow = low * (0.35 + 0.65 * sun ** 2);
    // Night overhead (deep blue-violet), the sunset a burning band low over the horizon (PS1).
    sc.push(0.05 + 0.16 * (1 - e) ** 3 + 0.85 * glow, 0.04 + 0.05 * (1 - e) ** 3 + 0.4 * glow, 0.12 + 0.12 * (1 - e) ** 3 + 0.14 * glow, 1);
  }
  sky.setVerticesData("color", sc);
  sky.parent = root;
  noGlow.push(sky);
  // Stars, high up (one merged mesh).
  const stars: Mesh[] = [];
  for (let k = 0; k < 140; k++) {
    const a = rand() * Math.PI * 2;
    const e = 0.35 + rand() * 1.1;
    const d = new Vector3(Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)).scale(760);
    const st = MeshBuilder.CreateDisc("hellenaStar", { radius: 0.8 + rand() * 1.4, tessellation: 4 }, scene);
    st.position.copyFrom(d);
    st.lookAt(Vector3.Zero());
    stars.push(st);
  }
  const starMesh = Mesh.MergeMeshes(stars, true, true);
  if (starMesh) {
    starMesh.infiniteDistance = true;
    const m = unlit("hellenaStarMat");
    m.emissiveColor = new Color3(0.9, 0.88, 1);
    m.backFaceCulling = false;
    starMesh.material = m;
    starMesh.parent = root;
  }
  // Clouds: soft painted banks (sprites), dark violet above and lit rose-orange from beneath by
  // the sun below the horizon; long low banks towards the sunset, a few thin wisps higher up.
  const cloudTex = (name: string, seed: number): DynamicTexture => {
    const r2 = mulberry32(seed);
    const W = 256;
    const H = 64;
    const tex = new DynamicTexture(name, { width: W, height: H }, scene, true);
    const ctx = tex.getContext() as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, W, H);
    // Puffs along a long, flat-bottomed bank.
    for (let k = 0; k < 26; k++) {
      const x = W * (0.08 + r2() * 0.84);
      const edge = 1 - Math.abs(x / W - 0.5) * 2; // thinner towards the ends
      const ry = H * (0.12 + 0.28 * edge * r2());
      const rx = ry * (1.6 + r2() * 1.6);
      const y = H * 0.72 - ry * 0.6;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
      g.addColorStop(0, "rgba(255,255,255,0.55)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, ry / rx);
      ctx.translate(-x, -y);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // Colour by height: lit belly, dark top (kept in the alpha the puffs laid down).
    const img = ctx.getImageData(0, 0, W, H);
    for (let y = 0; y < H; y++) {
      const f = y / H; // 0 top … 1 bottom
      const lit = smooth(0.45, 0.85, f);
      for (let x = 0; x < W; x++) {
        const o = (y * W + x) * 4;
        img.data[o] = 60 + 190 * lit;
        img.data[o + 1] = 34 + 92 * lit;
        img.data[o + 2] = 64 + 40 * lit;
        img.data[o + 3] = Math.min(255, img.data[o + 3] * 1.4);
      }
    }
    ctx.putImageData(img, 0, 0);
    tex.update();
    tex.hasAlpha = true;
    return tex;
  };
  const cloudMats = [0, 1, 2].map((k) => {
    const m = unlit(`hellenaCloudMat${k}`);
    const tex = cloudTex(`hellenaCloudTex${k}`, 0xc10d + k * 977);
    m.emissiveTexture = tex;
    m.opacityTexture = tex;
    m.emissiveColor = new Color3(0.62, 0.42, 0.46); // dimmed: dusk clouds, not white puffs
    m.backFaceCulling = false;
    return m;
  });
  const sunAz = Math.atan2(toSun.z, toSun.x);
  for (let k = 0; k < 16; k++) {
    const high = k >= 12;
    const a = sunAz + (rand() - 0.5) * (high ? 1.6 : 2.4);
    const e = high ? 0.22 + rand() * 0.15 : 0.03 + rand() * 0.12;
    const w = high ? 160 + rand() * 120 : 140 + rand() * 200;
    const c = MeshBuilder.CreatePlane("hellenaCloud", { width: w, height: w * (high ? 0.12 : 0.22) }, scene);
    c.position.set(Math.cos(a) * Math.cos(e) * 700, Math.sin(e) * 700, Math.sin(a) * Math.cos(e) * 700);
    c.lookAt(new Vector3(0, c.position.y, 0)); // facing the viewer, upright
    c.rotation.y += Math.PI;
    c.infiniteDistance = true;
    c.material = cloudMats[k % 3];
    c.alphaIndex = 1;
    c.parent = root;
    noGlow.push(c);
  }

  // The sea to the horizon (kit water): dark violet deep water, the sunset sky reflected towards
  // the horizon, the sun's road glittering on the swell, fading into the horizon's colour.
  const sea = gridMesh("hellenaFarSea", scene, 24, 24, (i, j) => {
    const u = -60 + (j / 24) * 900;
    const v = -500 + (i / 24) * 1000;
    const p = fromUV(u, v);
    return { x: p.x, y: SEA_Y, z: p.z, tu: j / 24, tv: i / 24 };
  }, Vector3.Up());
  sea.parent = root;
  // Close below the guard post the sun would glint off every wave: just a sheen there.
  ticks.push(makeWater(sea, farPrison ? HELLENA_WATER : { ...HELLENA_WATER, glint: 0.15 }));
  noGlow.push(sea);

  if (!farPrison) return noGlow; // at the guard post we stand at its foot

  // The prison, far out (PS1): one enormous raw rock rising from the sea like a broken tooth,
  // leaning to the left, broad at its foot, its top snapped off jagged. Rough works cling to its
  // right face — terraces, palisades of stakes, little spires — lit gold from within; black smoke
  // trails off it on the wind; a thin causeway runs out to its foot.
  const node = new TransformNode("hellenaFarPrison", scene);
  node.parent = root;
  const P = fromUV(300, -26); // just left of the path: in frame on a phone too
  node.position.set(P.x, SEA_Y, P.z);
  node.rotation.y = -Math.PI / 4; // local -z faces back down the path (the camera), +x is screen right
  const lean = new TransformNode("hellenaFarLean", scene);
  lean.parent = node;
  lean.rotation.z = 0.36; // leaning left
  const H = 44;
  const radius = (t: number): number => 17 - 7 * t + (t < 0.15 ? (0.15 - t) * 30 : 0); // stocky, like a broken tooth
  const rockMesh = MeshBuilder.CreateCylinder("hellenaFarRock", { height: H, diameter: 2, tessellation: 18, subdivisions: 18 }, scene);
  const rp = rockMesh.getVerticesData("position")!;
  for (let k = 0; k < rp.length; k += 3) {
    const t = (rp[k + 1] + H / 2) / H;
    const ang = Math.atan2(rp[k + 2], rp[k]);
    // Craggy: big buttresses and smaller knobs, the top snapped off at a slant with jagged teeth.
    const crag = 1 + 0.16 * Math.sin(ang * 3 + t * 4) + 0.12 * (noise2(ang * 2.5, t * 9) - 0.5) * 2;
    const r = radius(t) * crag;
    rp[k] = Math.cos(ang) * r;
    rp[k + 2] = Math.sin(ang) * r * 0.78;
    let y = rp[k + 1] + H / 2;
    if (t > 0.99) y += -Math.cos(ang) * 6 - 4 * hash01(Math.round(ang * 5), 3); // higher on the left, broken
    rp[k + 1] = y;
  }
  rockMesh.setVerticesData("position", rp);
  rockMesh.convertToFlatShadedMesh();
  const shade = (m: Mesh, top: number): void => {
    const p = m.getVerticesData("position")!;
    const n = m.getVerticesData("normal")!;
    const c: number[] = [];
    for (let k = 0; k < p.length; k += 3) {
      const t = Math.max(0, p[k + 1]) / top;
      // Dark brown-olive rock; the sunset (left) rims it rose, the gold works warm its right side.
      const rim = Math.max(0, -n[k]) * 0.45 + Math.max(0, n[k + 1]) * 0.2;
      const warm = Math.max(0, n[k]) * 0.18 * (1 - Math.abs(t - 0.45) * 2);
      c.push(0.12 + 0.04 * t + 0.36 * rim + 0.5 * warm, 0.1 + 0.03 * t + 0.13 * rim + 0.3 * warm, 0.1 + 0.02 * t + 0.1 * rim + 0.05 * warm, 1);
    }
    m.setVerticesData("color", c);
  };
  shade(rockMesh, H);
  rockMesh.material = unlit("hellenaFarRockMat");
  rockMesh.parent = lean;
  noGlow.push(rockMesh);
  // Its foot: broken rock shelving into the sea.
  for (const [x, z, r, h] of [[11, -3, 9, 6], [-6, -5, 7, 4], [4, -9, 6, 3]] as const) {
    const foot = MeshBuilder.CreateCylinder("hellenaFarFoot", { height: h, diameterTop: r, diameterBottom: r * 1.8, tessellation: 8, subdivisions: 2 }, scene);
    jitter(foot, 0.9, rand);
    foot.position.set(x, h / 2 - 1, z);
    foot.convertToFlatShadedMesh();
    shade(foot, H);
    foot.material = rockMesh.material;
    foot.parent = node;
    noGlow.push(foot);
  }

  // The works on its right face: terraces cut into the rock, palisades and little spires, lit gold.
  const works = unlit("hellenaFarWorks");
  works.emissiveColor = new Color3(0.32, 0.2, 0.1);
  const gold = unlit("hellenaFarGold");
  gold.emissiveColor = new Color3(1, 0.7, 0.3);
  const lights: Mesh[] = [];
  const workParts: Mesh[] = [];
  for (const [t, a0, len] of [[0.12, -0.9, 1.4], [0.28, -0.6, 1.1], [0.42, -0.3, 0.9], [0.56, -0.1, 0.7], [0.7, 0.1, 0.5]] as const) {
    const y = t * H;
    const r = radius(t) * 0.98;
    // A ledge round part of the face (towards the camera and the right).
    const steps = Math.round(len * 6);
    for (let k = 0; k <= steps; k++) {
      const ang = -Math.PI / 2 + a0 + (k / steps) * len * 1.6; // from facing the camera, round to the right
      const x = Math.cos(ang) * r;
      const z = Math.sin(ang) * r * 0.78;
      const ledge = MeshBuilder.CreateBox("hellenaFarLedge", { width: 2.6, height: 0.8, depth: 1.6 }, scene);
      ledge.position.set(x, y, z);
      ledge.rotation.y = -ang + Math.PI / 2;
      workParts.push(ledge);
      // Stakes of a palisade along it, and here and there a little spire.
      if (rand() < 0.7) {
        const stake = MeshBuilder.CreateCylinder("hellenaFarStake", { height: 1.6 + rand() * 1.8, diameterTop: 0, diameterBottom: 0.35, tessellation: 4 }, scene);
        stake.position.set(x * 1.06, y + 1.2, z * 1.06);
        workParts.push(stake);
      }
      if (rand() < 0.18) {
        const spire = MeshBuilder.CreateCylinder("hellenaFarSpire", { height: 5 + rand() * 4, diameterTop: 0, diameterBottom: 1.1, tessellation: 5 }, scene);
        spire.position.set(x, y + 3, z);
        workParts.push(spire);
      }
      // Gold light glowing out of the openings cut in the rock behind the ledge.
      if (Math.cos(ang) > -0.2 && rand() < 0.6) {
        const glow = MeshBuilder.CreatePlane("hellenaFarOpening", { width: 1.1 + rand() * 1.4, height: 1 + rand() }, scene);
        glow.position.set(Math.cos(ang) * (r + 0.85), y + 1.3, Math.sin(ang) * (r * 0.78 + 0.85));
        glow.rotation.y = -ang - Math.PI / 2;
        lights.push(glow);
      }
    }
  }
  const worksMesh = Mesh.MergeMeshes(workParts, true, true);
  if (worksMesh) {
    worksMesh.material = works;
    worksMesh.parent = lean;
    noGlow.push(worksMesh);
  }
  const lit = Mesh.MergeMeshes(lights, true, true);
  if (lit) {
    lit.material = gold;
    gold.backFaceCulling = false;
    lit.parent = lean;
  }
  // The gold haze round the works (soft, additive).
  const haze = MeshBuilder.CreatePlane("hellenaFarGlow", { width: 30, height: 30 }, scene);
  haze.position.set(10, 16, -14);
  const hm = unlit("hellenaFarGlowMat");
  hm.emissiveColor = new Color3(0.45, 0.25, 0.08);
  hm.opacityTexture = softDotTexture(scene);
  hm.alphaMode = 1; // additive
  haze.material = hm;
  haze.parent = node;
  noGlow.push(haze);

  // The thin causeway from the spit's end to its foot.
  const cw = fromUV(292, -14);
  const causeway = MeshBuilder.CreateBox("hellenaFarCauseway", { width: 1.4, height: 0.6, depth: Vector3.Distance(cw, P) }, scene);
  causeway.position.set((cw.x + P.x) / 2, SEA_Y + 0.6, (cw.z + P.z) / 2);
  causeway.rotation.y = Math.atan2(P.x - cw.x, P.z - cw.z);
  causeway.material = works;
  causeway.parent = root;

  // Black smoke (PS1): not from the top — two or three thin columns rising from vents on its right
  // flank, mid-height, slanting up and to the left on the wind.
  node.computeWorldMatrix(true);
  lean.computeWorldMatrix(true);
  for (const [t, ang] of [[0.36, -0.4], [0.5, -0.15], [0.28, 0.1]] as const) {
    const r = radius(t);
    const vent = new Vector3(Math.cos(ang) * r, t * H, Math.sin(ang) * r * 0.78);
    const from = Vector3.TransformCoordinates(vent, lean.getWorldMatrix());
    const smoke = new ParticleSystem("hellenaFarSmoke", 50, scene);
    smoke.particleTexture = softDotTexture(scene);
    smoke.emitter = from;
    smoke.minEmitBox = new Vector3(-0.4, 0, -0.4);
    smoke.maxEmitBox = new Vector3(0.4, 0.4, 0.4);
    smoke.blendMode = ParticleSystem.BLENDMODE_STANDARD;
    smoke.color1 = new Color4(0.06, 0.04, 0.05, 0.75);
    smoke.color2 = new Color4(0.1, 0.06, 0.07, 0.6);
    smoke.colorDead = new Color4(0.2, 0.12, 0.12, 0);
    smoke.minSize = 4;
    smoke.maxSize = 7;
    smoke.minLifeTime = 10;
    smoke.maxLifeTime = 16;
    smoke.emitRate = 6;
    const wind = fromUV(0.3, -1).normalize(); // towards screen left, a little away
    smoke.direction1 = new Vector3(wind.x * 1.2, 2.6, wind.z * 1.2); // a narrow column, slanting left
    smoke.direction2 = new Vector3(wind.x * 1.6, 3, wind.z * 1.6);
    smoke.minEmitPower = 1;
    smoke.maxEmitPower = 1.6;
    smoke.gravity = new Vector3(wind.x * 0.6, 0.3, wind.z * 0.6);
    smoke.preWarmCycles = 600;
    smoke.preWarmStepOffset = 4;
    smoke.start();
  }
  return noGlow;
}

/** Seabirds wheeling far out by the prison: dark gull shapes beating slowly round wide circles. */
function seaBirds(scene: Scene, root: TransformNode, rand: () => number): (dt: number) => void {
  const black = matte("hellenaGullMat", scene, undefined, new Color3(0.05, 0.04, 0.06));
  black.disableLighting = true;
  black.fogEnabled = false;
  const birds = [0, 1, 2, 3].map((k) => {
    const node = new TransformNode(`hellenaGull${k}`, scene);
    node.parent = root;
    const wings = [-1, 1].map((sx) => {
      const hinge = new TransformNode("hellenaGullHinge", scene);
      hinge.parent = node;
      const w = MeshBuilder.CreateBox("hellenaGullWing", { width: 2.4, height: 0.12, depth: 0.7 }, scene);
      w.position.x = sx * 1.2;
      w.material = black;
      w.parent = hinge;
      return { hinge, sx };
    });
    return { node, wings, centre: fromUV(200 + rand() * 80, -30 + rand() * 40), r: 14 + rand() * 18, h: 14 + rand() * 18, a: rand() * 6, speed: 0.12 + rand() * 0.08 };
  });
  let t = 0;
  return (dt) => {
    t += dt;
    for (const b of birds) {
      b.a += dt * b.speed;
      b.node.position.set(b.centre.x + Math.cos(b.a) * b.r, b.h + Math.sin(t * 0.7 + b.a) * 1.5, b.centre.z + Math.sin(b.a) * b.r);
      b.node.rotation.y = -b.a;
      const flap = Math.sin(t * 3 + b.a * 5) * 0.45;
      for (const w of b.wings) w.hinge.rotation.z = w.sx * flap;
    }
  };
}

/** Spray flung up now and then where the swell breaks below the cliff's edge. */
function spray(scene: Scene): (dt: number) => void {
  const ps = new ParticleSystem("hellenaSpray", 60, scene);
  ps.particleTexture = softDotTexture(scene);
  const a = fromUV(-6, coastEdge(-6) - 1.5);
  const b = fromUV(40, coastEdge(40) - 1.5);
  ps.emitter = new Vector3((a.x + b.x) / 2, SEA_Y + 9, (a.z + b.z) / 2);
  const half = b.subtract(a).scale(0.5);
  ps.minEmitBox = new Vector3(-Math.abs(half.x), 0, -Math.abs(half.z));
  ps.maxEmitBox = new Vector3(Math.abs(half.x), 2, Math.abs(half.z));
  ps.blendMode = ParticleSystem.BLENDMODE_ADD;
  ps.color1 = new Color4(0.35, 0.3, 0.35, 0.4);
  ps.color2 = new Color4(0.45, 0.35, 0.35, 0.3);
  ps.colorDead = new Color4(0.2, 0.15, 0.2, 0);
  ps.minSize = 0.2;
  ps.maxSize = 0.5;
  ps.minLifeTime = 1.2;
  ps.maxLifeTime = 2.2;
  ps.emitRate = 12;
  ps.direction1 = new Vector3(-0.2, 2.5, -0.2);
  ps.direction2 = new Vector3(0.2, 4, 0.2);
  ps.minEmitPower = 1;
  ps.maxEmitPower = 2;
  ps.gravity = new Vector3(0, -3, 0);
  ps.start();
  return () => undefined;
}

// --- The prison ------------------------------------------------------------------------------------

/**
 * The guard post at the prison rock's foot (PS1): the landing sheltered under a huge overhang of
 * rock hung with stalactites; the rock face behind with arched openings glowing gold behind their
 * grilles and the barred iron gate; wooden walkways and lanterns clinging to the rock above; a
 * lookout on stilts at the cliff's edge with its stairs; torches.
 */
function buildPrison(scene: Scene, root: TransformNode, rand: () => number, rock: StandardMaterial, wood: StandardMaterial): ((dt: number) => void)[] {
  const ticks: ((dt: number) => void)[] = [];

  /** A point on the rock face: `v` along it, `y` up; `out` in front of it. */
  const onWall = (v: number, y: number, out = 0): Vector3 => fromUV(WALL_U - 1.25 - out, v).add(new Vector3(0, y, 0));
  const facing = -Math.PI / 4;
  const G = HELLENA_SPOTS.gate;

  /** A craggy lump of rock (flattened icosphere, knobbly, flat-shaded, a cold rim on top). */
  const crag = (name: string, at: Vector3, r: number, sy: number, sx = 1): Mesh => {
    const m = MeshBuilder.CreateIcoSphere(name, { radius: r, subdivisions: 3 }, scene);
    const p = m.getVerticesData("position")!;
    for (let k = 0; k < p.length; k += 3) {
      const n = 1 + 0.22 * (noise2(p[k] * 0.5 + at.x, p[k + 2] * 0.5 + p[k + 1] * 0.7) - 0.5) * 2;
      p[k] *= n * sx;
      p[k + 1] *= n * sy;
      p[k + 2] *= n * sx;
    }
    m.setVerticesData("position", p);
    m.convertToFlatShadedMesh();
    m.position.copyFrom(at);
    m.material = rock;
    m.parent = root;
    gradeColors(m, [0.42, 0.42, 0.5], [1, 1.06, 1.25]);
    return m;
  };

  // The rock face behind the landing: big crags shoulder to shoulder, rising into the prison rock.
  for (let v = -12; v <= 16; v += 3.2) {
    crag("hellenaFace", fromUV(WALL_U + 1.6 + rand() * 1.4, v).add(new Vector3(0, 3 + rand() * 2, 0)), 3.6 + rand() * 1.4, 1.6);
    crag("hellenaFaceHigh", fromUV(WALL_U + 4 + rand() * 2, v + 1.6).add(new Vector3(0, 11 + rand() * 4, 0)), 4.4 + rand() * 1.6, 1.2);
  }
  obstacles.addBox(fromUV(WALL_U + 1, 2).x, fromUV(WALL_U + 1, 2).z, 15, 1.4, facing);

  // The overhang: a great lip of rock jutting out over the landing, high up, its underside hung
  // with stalactites (PS1: the guard post sits in the mouth of a cave).
  const lip: Vector3[] = [];
  for (let v = -14; v <= 14; v += 2.6) {
    const reach = 5 + 2.5 * Math.cos(v * 0.12) + rand() * 1.5; // furthest out in the middle
    const at = fromUV(WALL_U - reach * 0.55, v).add(new Vector3(0, 10.5 + rand() * 1.5, 0));
    crag("hellenaOverhang", at, 3.2 + rand() * 1.2, 0.55, 1.4);
    lip.push(at);
  }
  for (let k = 0; k < 26; k++) {
    const a = lip[(rand() * lip.length) | 0];
    const h = 1.2 + rand() * 2.6;
    const st = MeshBuilder.CreateCylinder("hellenaStalactite", { height: h, diameterTop: 0.9 + rand() * 0.6, diameterBottom: 0, tessellation: 5 }, scene);
    st.position.set(a.x + (rand() - 0.5) * 4, a.y - 1.4 - h / 2, a.z + (rand() - 0.5) * 4);
    st.material = rock;
    st.parent = root;
    gradeColors(st, [0.4, 0.4, 0.48], [0.8, 0.82, 0.95]);
  }

  // Arched openings in the face, glowing gold behind their grilles (PS1), and the barred iron gate.
  const glow = new StandardMaterial("hellenaWindowGlow", scene);
  glow.disableLighting = true;
  glow.emissiveColor = new Color3(0.78, 0.46, 0.16); // warm, not blown out by the bloom
  const dark = matte("hellenaDark", scene, undefined, new Color3(0.03, 0.02, 0.03));
  const iron = matte("hellenaGateIron", scene, undefined, new Color3(0.14, 0.13, 0.15));
  const arched = (v: number, y: number, w: number, h: number, mat: StandardMaterial): void => {
    const pane = MeshBuilder.CreatePlane("hellenaOpening", { width: w, height: h }, scene);
    pane.position.copyFrom(onWall(v, y + h / 2, 0.05));
    pane.rotation.y = facing;
    pane.material = mat;
    pane.parent = root;
    const top = MeshBuilder.CreateDisc("hellenaOpeningTop", { radius: w / 2, tessellation: 14, arc: 0.5 }, scene);
    top.position.copyFrom(onWall(v, y + h, 0.05));
    top.rotation.y = facing;
    top.material = mat;
    top.parent = root;
    // A frame of dressed stone round it.
    for (let k = 0; k <= 8; k++) {
      const a = (k / 8) * Math.PI;
      const stone = MeshBuilder.CreateBox("hellenaArchStone", { width: 0.4, height: 0.32, depth: 0.5 }, scene);
      stone.position.copyFrom(onWall(v + Math.cos(a) * (w / 2 + 0.2), y + h + Math.sin(a) * (w / 2 + 0.2), 0.1));
      stone.rotation.set(0, facing, 0);
      stone.material = rock;
      stone.parent = root;
    }
  };
  const grille = (v: number, y: number, w: number, h: number): void => {
    for (let x = -w / 2 + 0.3; x < w / 2; x += 0.45) {
      const bar = MeshBuilder.CreateBox("hellenaBar", { width: 0.07, height: h + w * 0.4, depth: 0.07 }, scene);
      bar.position.copyFrom(onWall(v + x, y + (h + w * 0.4) / 2, 0.12));
      bar.rotation.y = facing;
      bar.material = iron;
      bar.parent = root;
    }
    for (const yy of [y + h * 0.35, y + h * 0.8]) {
      const rail = MeshBuilder.CreateBox("hellenaBarRail", { width: w, height: 0.08, depth: 0.08 }, scene);
      rail.position.copyFrom(onWall(v, yy, 0.12));
      rail.rotation.y = facing;
      rail.material = iron;
      rail.parent = root;
    }
  };
  for (const [v, w] of [[5.4, 2.4], [9, 2.4], [-5.2, 2]] as const) {
    arched(v, 0.2, w, 1.8, glow);
    grille(v, 0.2, w, 1.8);
  }
  // The gate: tall, dark inside, a faint glow far in, a heavy iron portcullis.
  arched(G.v, 0, 3, 3.6, dark);
  const deep = MeshBuilder.CreatePlane("hellenaGateGlow", { width: 1.2, height: 1.6 }, scene);
  deep.position.copyFrom(onWall(G.v + 0.3, 1.2, 0.07));
  deep.rotation.y = facing;
  const dg = new StandardMaterial("hellenaGateGlowMat", scene);
  dg.disableLighting = true;
  dg.emissiveColor = new Color3(0.35, 0.18, 0.06);
  deep.material = dg;
  deep.parent = root;
  grille(G.v, 0, 3, 3.6);

  // Wooden walkways clinging to the rock above, with railings and hanging lanterns.
  const lantern = new StandardMaterial("hellenaLantern", scene);
  lantern.disableLighting = true;
  lantern.emissiveColor = new Color3(1, 0.7, 0.32);
  for (const [v, y, len] of [[-3, 5.4, 7], [8, 7.8, 6], [1, 13.5, 8]] as const) {
    const deck = MeshBuilder.CreateBox("hellenaWalkway", { width: len, height: 0.2, depth: 1.5 }, scene);
    deck.position.copyFrom(onWall(v, y, 0.7));
    deck.rotation.y = facing;
    deck.material = wood;
    deck.parent = root;
    for (let k = 0; k <= len; k += 1) {
      const post = MeshBuilder.CreateBox("hellenaWalkPost", { width: 0.08, height: 0.9, depth: 0.08 }, scene);
      post.position.copyFrom(onWall(v - len / 2 + k, y + 0.5, 1.4));
      post.material = wood;
      post.parent = root;
    }
    const rail = MeshBuilder.CreateBox("hellenaWalkRail", { width: len, height: 0.07, depth: 0.07 }, scene);
    rail.position.copyFrom(onWall(v, y + 0.95, 1.4));
    rail.rotation.y = facing;
    rail.material = wood;
    rail.parent = root;
    for (const s of [-1, 1]) {
      const brace = MeshBuilder.CreateBox("hellenaWalkBrace", { width: 0.12, height: 1.8, depth: 0.12 }, scene);
      brace.position.copyFrom(onWall(v + s * (len / 2 - 0.4), y - 0.8, 0.4));
      brace.rotation.y = facing;
      brace.rotate(new Vector3(1, 0, 1).normalize(), 0.5);
      brace.material = wood;
      brace.parent = root;
    }
    const lamp = MeshBuilder.CreateSphere("hellenaLanternGlass", { diameter: 0.35, segments: 6 }, scene);
    lamp.position.copyFrom(onWall(v + len / 2 - 0.6, y - 0.45, 1.3));
    lamp.material = lantern;
    lamp.parent = root;
    // A glowing doorway onto each walkway.
    arched(v - len / 4, y + 0.1, 1.1, 1.5, glow);
  }

  // The lookout tower at the cliff's edge, its stairs coming down to the landing.
  const T = fromUV(40.6, 5.2); // before the drawbridge, on the right (PS1)
  const TH = 4.6;
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const post = MeshBuilder.CreateBox("hellenaTowerPost", { width: 0.22, height: TH + 1, depth: 0.22 }, scene);
    post.position.set(T.x + dx * 1.2, (TH + 1) / 2, T.z + dz * 1.2);
    post.material = wood;
    post.parent = root;
  }
  const floor = MeshBuilder.CreateBox("hellenaTowerFloor", { width: 3, height: 0.2, depth: 3 }, scene);
  floor.position.set(T.x, TH, T.z);
  floor.material = wood;
  floor.parent = root;
  for (const [dx, dz, ry] of [[0, -1.4, 0], [0, 1.4, 0], [-1.4, 0, Math.PI / 2], [1.4, 0, Math.PI / 2]] as const) {
    const rail = MeshBuilder.CreateBox("hellenaTowerRail", { width: 2.9, height: 0.8, depth: 0.08 }, scene);
    rail.position.set(T.x + dx, TH + 0.5, T.z + dz);
    rail.rotation.y = ry;
    rail.material = wood;
    rail.parent = root;
  }
  // Cross braces between the legs.
  for (const ry of [0, Math.PI / 2]) {
    const x = MeshBuilder.CreateBox("hellenaTowerX", { width: 3.2, height: 0.1, depth: 0.1 }, scene);
    x.position.set(T.x, TH / 2, T.z);
    x.rotation.set(0, ry, 0.9);
    x.material = wood;
    x.parent = root;
  }
  // The stairs: steps climbing from the landing to the tower's deck.
  const S0 = fromUV(36.6, 4.2);
  const S1 = fromUV(39.4, 4.6);
  for (let k = 0; k < 10; k++) {
    const f = k / 9;
    const step = MeshBuilder.CreateBox("hellenaStep", { width: 1.1, height: 0.12, depth: 0.4 }, scene);
    const q = Vector3.Lerp(S0, S1, f);
    step.position.set(q.x, 0.3 + f * (TH - 0.4), q.z);
    step.rotation.y = Math.atan2(S1.x - S0.x, S1.z - S0.z) + Math.PI / 2;
    step.material = wood;
    step.parent = root;
  }
  obstacles.add(T.x, T.z, 1.8);

  // Torches either side of the gate and at the tower's foot; a lamp on the drawbridge's far post.
  for (const at of [onWall(G.v - 2.6, 2.6, 0.4), onWall(G.v + 2.6, 2.6, 0.4), fromUV(37.4, 2.6).add(new Vector3(0, 1.6, 0)), fromUV(BRIDGE_U1 + 0.3, 1.8).add(new Vector3(0, 1.8, 0)), new Vector3(T.x + 1.1, TH + 1.1, T.z - 1.1)]) {
    ticks.push(torch(scene, root, rand, at, wood));
  }
  return ticks;
}

/** A torch: a short bracket, a flame, embers rising; its little light pool on the ground flickers. */
function torch(scene: Scene, root: TransformNode, rand: () => number, at: Vector3, wood: StandardMaterial): (dt: number) => void {
  const stick = MeshBuilder.CreateBox("hellenaTorchStick", { width: 0.1, height: at.y, depth: 0.1 }, scene);
  stick.position.set(at.x, at.y / 2, at.z);
  stick.material = wood;
  stick.parent = root;
  const dot = softDotTexture(scene);
  const fire = new ParticleSystem("hellenaTorchFire", 30, scene);
  fire.particleTexture = dot;
  fire.emitter = new Vector3(at.x, at.y + 0.1, at.z);
  fire.minEmitBox = new Vector3(-0.08, 0, -0.08);
  fire.maxEmitBox = new Vector3(0.08, 0.05, 0.08);
  fire.blendMode = ParticleSystem.BLENDMODE_ADD;
  fire.color1 = new Color4(1, 0.7, 0.3, 1);
  fire.color2 = new Color4(1, 0.45, 0.15, 1);
  fire.colorDead = new Color4(0.4, 0.06, 0, 0);
  fire.minSize = 0.25;
  fire.maxSize = 0.5;
  fire.minLifeTime = 0.3;
  fire.maxLifeTime = 0.6;
  fire.emitRate = 40;
  fire.direction1 = new Vector3(-0.1, 1, -0.1);
  fire.direction2 = new Vector3(0.1, 1.4, 0.1);
  fire.minEmitPower = 0.6;
  fire.maxEmitPower = 1;
  fire.start();
  const pool = MeshBuilder.CreateDisc("hellenaTorchPool", { radius: 2.4, tessellation: 18 }, scene);
  pool.rotation.x = Math.PI / 2;
  pool.position.set(at.x, 0.05, at.z);
  const m = new StandardMaterial("hellenaTorchPoolMat", scene);
  m.disableLighting = true;
  m.opacityTexture = dot;
  m.alphaMode = 1;
  m.fogEnabled = false;
  m.emissiveColor = new Color3(0.4, 0.2, 0.06);
  pool.material = m;
  pool.parent = root;
  let t = rand() * 10;
  return (dt) => {
    t += dt;
    const k = 0.82 + 0.1 * Math.sin(t * 9.1) + 0.08 * Math.sin(t * 23.7 + 1.3);
    m.emissiveColor.set(0.4 * k, 0.2 * k, 0.06 * k);
  };
}

/** The drawbridge, let down over the gap: planks, side beams, chains up to the wall's frame. */
function buildDrawbridge(scene: Scene, root: TransformNode, rand: () => number, wood: StandardMaterial): void {
  const iron = matte("hellenaIron", scene, undefined, new Color3(0.2, 0.2, 0.24));
  const len = BRIDGE_U1 - BRIDGE_U0 + 1;
  for (let k = 0; k < len / 0.45; k++) {
    const q = fromUV(BRIDGE_U0 - 0.5 + k * 0.45 + 0.2, 0);
    const plank = MeshBuilder.CreateBox("hellenaPlank", { width: 2.6, height: 0.12, depth: 0.4 }, scene);
    plank.position.set(q.x, -0.04 + (rand() - 0.5) * 0.03, q.z);
    plank.rotation.y = -Math.PI / 4; // across the path
    plank.material = wood;
    plank.parent = root;
    gradeColors(plank, [0.7 + rand() * 0.3, 0.7, 0.7], [1, 1, 1]);
  }
  for (const s of [-1, 1]) {
    const mid = fromUV((BRIDGE_U0 + BRIDGE_U1) / 2, s * 1.35);
    const beam = MeshBuilder.CreateBox("hellenaBridgeBeam", { width: 0.22, height: 0.3, depth: len }, scene);
    beam.position.set(mid.x, 0.05, mid.z);
    beam.rotation.y = -Math.PI / 4; // along the path
    beam.material = wood;
    beam.parent = root;
    // The chain from the bridge's far end up to the post by the wall.
    const a = fromUV(BRIDGE_U0 + 0.4, s * 1.35);
    const post = fromUV(BRIDGE_U1 + 0.3, s * 1.8);
    const p = MeshBuilder.CreateBox("hellenaBridgePost", { width: 0.3, height: 3.6, depth: 0.3 }, scene);
    p.position.set(post.x, 1.8, post.z);
    p.material = wood;
    p.parent = root;
    obstacles.add(post.x, post.z, 0.3);
    const top = new Vector3(post.x, 3.4, post.z);
    const foot = new Vector3(a.x, 0.1, a.z);
    const links = 14;
    for (let k = 0; k < links; k++) {
      const f = (k + 0.5) / links;
      const q = Vector3.Lerp(foot, top, f);
      q.y -= Math.sin(f * Math.PI) * 0.35; // sagging
      const link = MeshBuilder.CreateTorus("hellenaChain", { diameter: 0.22, thickness: 0.05, tessellation: 6 }, scene);
      link.position.copyFrom(q);
      link.rotation.set(Math.PI / 2, k % 2 ? 0 : Math.PI / 2, 0);
      link.material = iron;
      link.parent = root;
    }
  }
}

/** Local (u, v) of a world point. */
export function hellenaUV(p: Vector3): { u: number; v: number } {
  return toUV(p.x, p.z);
}
