import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

import { softDotTexture } from "./atmosphere";
import { LIGHTING_PRESETS } from "./lighting";
import { mulberry32, pixelTexture, rgb } from "./paint";
import { fromUV, toUV } from "./kit/frame";
import { grassSource, rockSource } from "./kit/flora";
import { gradeColors, gridMesh, jitter, limb, matte, place } from "./kit/mesh";
import { hash01, noise2 } from "./kit/noise";
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

/** Story spots (u, v). */
export const HELLENA_SPOTS = {
  fromForest: { u: -6, v: 0 },
  exitForest: { u: -12, v: 0 },
  bridge: { u: 49, v: 0 },
  landing: { u: 56, v: 1 },
  gate: { u: 60, v: 3 },
};

const SEA_Y = -14;
const BRIDGE_U0 = 45.5; // the gap the drawbridge spans
const BRIDGE_U1 = 52.5;
const WALL_U = 61; // the prison's front wall

/** The cliff's edge over the sea, on the left of the path. */
function coastEdge(u: number): number {
  return -5.2 + 1.2 * Math.sin(u * 0.17) + 0.6 * Math.sin(u * 0.53 + 1);
}

const TRAILS: Knot[][] = [
  [
    { u: -14, v: 0, w: 3 },
    { u: 4, v: 0.6, w: 3.4 },
    { u: 16, v: -0.4, w: 3.6 },
    { u: 30, v: 0.6, w: 3.4 },
    { u: 44.5, v: 0, w: 3 },
    { u: 46, v: 0, w: 1.3 }, // the drawbridge
    { u: 52, v: 0, w: 1.3 },
    { u: 53.5, v: 0.4, w: 4.4 }, // the guard post's landing
    { u: 58.5, v: 1, w: 6.2 },
  ],
  // To the lookout tower's stairs, at the cliff edge.
  [{ u: 55, v: -1, w: 2.4 }, { u: 55.6, v: -5.6, w: 2 }],
];
const NET = new TrailNet(TRAILS);

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

/** The Hellena outside world. */
export function hellenaWorld(scene: Scene): World {
  obstacles = new Obstacles();
  const rand = mulberry32(0x4e11e4a);
  const root = new TransformNode("hellena", scene);
  const rock = rockMaterial(scene, rand);
  const wood = matte("hellenaWood", scene, undefined, new Color3(0.32, 0.22, 0.15));

  const grounds = buildGround(scene, root, rand);
  buildCliffFaces(scene, root, rand, rock);
  buildSea(scene, root, rand);
  buildRightRocks(scene, root, rand, rock);
  deadTree(scene, root, rand, fromUV(12, 4.4));
  const ticks = buildPrison(scene, root, rand, rock, wood);
  buildDrawbridge(scene, root, rand, wood);

  obstacles.index();
  for (const m of root.getChildMeshes()) {
    m.isPickable = false;
    m.freezeWorldMatrix();
  }
  return {
    clamp: clampToHellena,
    preset: LIGHTING_PRESETS.hellenaDusk,
    framing: 2,
    shadowReceivers: grounds,
    ownFill: [],
    // Nearing the drawbridge the view pulls back and up: the prison rises over the frame.
    shotAt: (p) => {
      const { u } = toUV(p.x, p.z);
      const k = smooth(30, 44, u);
      return k > 0 ? { zoom: 1 - 0.28 * k, offset: fromUV(4 * k, 0) } : null;
    },
    update: (_focus, dt) => {
      for (const t of ticks) t(dt);
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
function buildGround(scene: Scene, root: TransformNode, rand: () => number): Mesh[] {
  const U0 = -20;
  const U1 = WALL_U + 1;
  const V0 = -10;
  const V1 = 18;
  const W = (U1 - U0) * GROUND_PPU;
  const H = (V1 - V0) * GROUND_PPU;
  const tex = new DynamicTexture("hellenaGroundTex", { width: W, height: H }, scene, false, Texture.NEAREST_SAMPLINGMODE);
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
  const mat = matte("hellenaGroundMat", scene, tex);
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
  return [piece("hellenaCoast", U0, BRIDGE_U0), piece("hellenaLanding", BRIDGE_U1, U1)];
}

/** Rock faces dropping to the sea: along the coast's edge, and either side of the drawbridge's gap. */
function buildCliffFaces(scene: Scene, root: TransformNode, rand: () => number, rock: StandardMaterial): void {
  const strip = (name: string, n: number, top: (t: number) => Vector3, out: (t: number) => Vector3): void => {
    const m = gridMesh(name, scene, 3, n, (i, j) => {
      const t = j / n;
      const f = i / 3;
      const q = top(t).add(out(t).scale(f * 2.4 + (rand() - 0.5) * 0.6 * f));
      return { x: q.x, y: f * SEA_Y - 0.02 + (f > 0 && f < 1 ? (rand() - 0.5) * 1.2 : 0), z: q.z, tu: t * n * 0.4, tv: f * 3 };
    }, new Vector3(-1, 0, 0));
    m.material = rock;
    m.parent = root;
    m.convertToFlatShadedMesh();
  };
  const left = fromUV(0, -1).subtract(fromUV(0, 0));
  const coast = (a: number, c: number): void => strip(`hellenaCliff${a}`, Math.round((c - a) * 1.5), (t) => fromUV(a + t * (c - a), coastEdge(a + t * (c - a))), () => left);
  coast(-22, BRIDGE_U0);
  coast(BRIDGE_U1, WALL_U + 2);
  // The gap's two faces, across the land.
  const down = fromUV(-1, 0).subtract(fromUV(0, 0));
  const up = down.scale(-1);
  strip("hellenaGapNear", 30, (t) => fromUV(BRIDGE_U0, coastEdge(BRIDGE_U0) + t * 24), () => up);
  strip("hellenaGapFar", 30, (t) => fromUV(BRIDGE_U1, coastEdge(BRIDGE_U1) + t * 24), () => down);
}

/** The sea below the cliffs at dusk: violet near, burning rose-orange towards the open sea up the
 *  screen (the sunset behind the prison), a slow swell, sea stacks. Unlit, out of the fog. */
function buildSea(scene: Scene, root: TransformNode, rand: () => number): void {
  const tex = pixelTexture("hellenaSeaTex", scene, 64, 64, (ctx, w, h) => {
    // Texture x runs up the screen, y sideways: the swell's long crests run sideways (along y).
    for (let x = 0; x < w; x++)
      for (let y = 0; y < h; y++) {
        const k = (0.86 + 0.14 * Math.sin((x / w) * Math.PI * 6)) * (0.96 + rand() * 0.06);
        ctx.fillStyle = rgb(200 * k, 200 * k, 210 * k);
        ctx.fillRect(x, y, 1, 1);
      }
    for (let i = 0; i < 70; i++) {
      const x = (rand() * w) | 0;
      const y = (rand() * h) | 0;
      const len = 4 + ((rand() * 8) | 0);
      ctx.fillStyle = rgb(255, 238, 230); // a crest catching the sunset
      ctx.fillRect(x, y, 1, len);
      ctx.fillStyle = rgb(120, 120, 140); // its trough
      ctx.fillRect(x + 1, y + 1, 1, len - 1);
    }
  });
  tex.uScale = 20;
  tex.vScale = 14;
  // Unlit: the colour is all emissive (the texture), tinted per vertex by the sunset gradient.
  const mat = new StandardMaterial("hellenaSeaMat", scene);
  mat.emissiveTexture = tex;
  mat.diffuseColor = Color3.Black();
  mat.specularColor = Color3.Black();
  mat.disableLighting = true;
  mat.fogEnabled = false;
  const sea = gridMesh("hellenaSea", scene, 16, 24, (i, j) => {
    const u = -40 + (j / 24) * 200;
    const v = -90 + (i / 16) * 140;
    const p = fromUV(u, v);
    return { x: p.x, y: SEA_Y, z: p.z, tu: j / 24, tv: i / 16 };
  }, Vector3.Up());
  const pos = sea.getVerticesData("position")!;
  const col: number[] = [];
  for (let k = 0; k < pos.length; k += 3) {
    const { u } = toUV(pos[k], pos[k + 2]);
    const f = smooth(0, 150, u) ** 1.4; // towards the sunset, up the screen behind the prison
    col.push(0.2 + 0.62 * f, 0.18 + 0.3 * f, 0.36 + 0.04 * f, 1);
  }
  sea.setVerticesData("color", col);
  sea.material = mat;
  sea.parent = root;
  // Sea stacks off the coast, foam at their feet.
  const stackMat = matte("hellenaStack", scene, undefined, new Color3(0.22, 0.2, 0.26));
  for (const [u, v, h, r] of [[8, -18, 9, 2.4], [26, -24, 12, 3], [40, -15, 7, 1.8], [20, -34, 14, 3.6]] as const) {
    const at = fromUV(u, v);
    const stack = MeshBuilder.CreateCylinder("hellenaSeaStack", { height: h, diameterTop: r * 0.8, diameterBottom: r * 2, tessellation: 8, subdivisions: 4 }, scene);
    jitter(stack, 0.5, rand);
    stack.position.set(at.x, SEA_Y + h / 2 - 0.5, at.z);
    stack.material = stackMat;
    stack.parent = root;
  }
}

/** Rocks heaped along the right of the path, rising into a rough wall (the PS1 cliff on the right). */
function buildRightRocks(scene: Scene, root: TransformNode, rand: () => number, rock: StandardMaterial): void {
  const small = rockSource(scene, rand);
  const grass = grassSource(scene, rand);
  for (let u = -18; u < WALL_U - 1; u += 2.2) {
    if (u > BRIDGE_U0 - 1 && u < BRIDGE_U1 + 1) continue;
    for (const [dv, s] of [[4.6, 1], [7, 1.6], [10, 2.3]] as const) {
      const v = 0.5 + dv + (rand() - 0.5) * 1.4;
      const at = fromUV(u + (rand() - 0.5) * 1.6, v);
      const r = (0.9 + rand() * 0.8) * s;
      const lump = MeshBuilder.CreateIcoSphere("hellenaBoulder", { radius: r, subdivisions: 2 }, scene);
      lump.scaling.y = 0.75 + rand() * 0.6;
      lump.position.set(at.x, r * 0.35, at.z);
      jitter(lump, 0.25 * r, rand);
      lump.material = rock;
      lump.parent = root;
      gradeColors(lump, [0.5, 0.5, 0.56], [1, 1, 1.05]);
      if (dv < 6) obstacles.add(at.x, at.z, r * 0.9);
    }
    // Small stones and tufts on the path's verges.
    const sv = (rand() < 0.5 ? -1 : 1) * (2.6 + rand());
    const s = fromUV(u, sv > 0 ? sv : Math.max(coastEdge(u) + 0.6, sv));
    if (rand() < 0.6) place(small, root, s.x, s.z, 0.4 + rand() * 0.4, rand() * 6);
    else place(grass, root, s.x, s.z, 0.7 + rand() * 0.4, rand() * 3);
  }
}

/** The bare dead tree reaching over the path from the rocks (PS1: pale twisted branches). */
function deadTree(scene: Scene, root: TransformNode, rand: () => number, at: Vector3): void {
  const bark = matte("hellenaDeadBark", scene, undefined, new Color3(0.42, 0.44, 0.5));
  const parts: Mesh[] = [];
  const trunk = [0, 1, 2, 3].map((k) => new Vector3(at.x - k * 0.5, k * 1.6, at.z - k * 0.25));
  parts.push(limb("hellenaTreeTrunk", scene, trunk, 0.45, 0.12, rand));
  for (let k = 0; k < 9; k++) {
    const from = trunk[1 + (k % 3)];
    const a = Math.PI + (rand() - 0.5) * 2.4; // mostly reaching over the path (to the left)
    const len = 1.6 + rand() * 2.4;
    const pts = [0, 0.4, 0.75, 1].map((f) => new Vector3(from.x + Math.cos(a + f * 0.5) * len * f, from.y + len * 0.35 * f + 0.3 * Math.sin(f * 6), from.z + Math.sin(a + f * 0.5) * len * f * 0.6));
    parts.push(limb("hellenaTreeBranch", scene, pts, 0.1, 0.02, rand));
  }
  const tree = Mesh.MergeMeshes(parts, true, true);
  if (tree) {
    tree.material = bark;
    tree.parent = root;
  }
  obstacles.add(at.x, at.z, 0.6);
}

// --- The prison ------------------------------------------------------------------------------------

/**
 * The prison rock and its guard post (PS1): a great dark rock rising over the landing, its front a
 * wall of rock with windows burning orange and wooden balconies up it, the gate at its foot; a
 * wooden lookout tower and its stairs at the cliff's edge; torches.
 */
function buildPrison(scene: Scene, root: TransformNode, rand: () => number, rock: StandardMaterial, wood: StandardMaterial): ((dt: number) => void)[] {
  const ticks: ((dt: number) => void)[] = [];
  const glow = new StandardMaterial("hellenaWindowGlow", scene);
  glow.disableLighting = true;
  glow.emissiveColor = new Color3(1, 0.62, 0.26);
  const dark = matte("hellenaDark", scene, undefined, new Color3(0.03, 0.02, 0.03));

  // The rock mass: lumps rising behind and above the front wall, leaning over it a little.
  for (const [du, dv, rv, ru, h] of [[6, 0, 16, 9, 30], [10, -12, 9, 7, 22], [9, 13, 10, 8, 20], [3, 4, 9, 4, 26], [14, 2, 14, 10, 34]] as const) {
    const at = fromUV(WALL_U + du, dv);
    const lump = MeshBuilder.CreateSphere("hellenaRockMass", { diameter: 2, segments: 12 }, scene);
    lump.scaling.set(rv, h / 2, ru);
    lump.rotation.y = Math.atan2(-1, 1);
    lump.position.set(at.x, h * 0.35, at.z);
    jitter(lump, 0.08, rand);
    lump.material = rock;
    lump.parent = root;
    gradeColors(lump, [0.7, 0.66, 0.78], [1.3, 1.22, 1.3]);
  }
  // The front wall over the landing.
  const wallAt = fromUV(WALL_U, 0);
  const wall = MeshBuilder.CreateBox("hellenaFrontWall", { width: 30, height: 14, depth: 2.4 }, scene);
  wall.position.set(wallAt.x, 7, wallAt.z);
  wall.rotation.y = -Math.PI / 4; // along v, facing down the screen
  wall.material = rock;
  wall.parent = root;
  obstacles.addBox(wallAt.x, wallAt.z, 15, 1.4, -Math.PI / 4);

  /** A point on the wall's face: `v` along it, `y` up; `out` in front of it. */
  const onWall = (v: number, y: number, out = 0): Vector3 => fromUV(WALL_U - 1.25 - out, v).add(new Vector3(0, y, 0));
  const facing = -Math.PI / 4;

  // The gate: a dark arched opening, a stone frame, its doors standing open.
  const G = HELLENA_SPOTS.gate;
  const gate = MeshBuilder.CreatePlane("hellenaGate", { width: 3, height: 4 }, scene);
  gate.position.copyFrom(onWall(G.v, 2, 0.02));
  gate.rotation.y = facing;
  gate.material = dark;
  gate.parent = root;
  for (let k = 0; k <= 8; k++) {
    const a = (k / 8) * Math.PI;
    const stone = MeshBuilder.CreateBox("hellenaGateArch", { width: 0.5, height: 0.4, depth: 0.5 }, scene);
    stone.position.copyFrom(onWall(G.v + Math.cos(a) * 1.7, 3.2 + Math.sin(a) * 1.4, 0.1));
    stone.rotation.set(0, facing, 0);
    stone.material = rock;
    stone.parent = root;
  }
  for (const s of [-1, 1]) {
    const jamb = MeshBuilder.CreateBox("hellenaGateJamb", { width: 0.5, height: 3.4, depth: 0.5 }, scene);
    jamb.position.copyFrom(onWall(G.v + s * 1.7, 1.7, 0.1));
    jamb.rotation.y = facing;
    jamb.material = rock;
    jamb.parent = root;
    const door = MeshBuilder.CreateBox("hellenaGateDoor", { width: 1.4, height: 3.4, depth: 0.15 }, scene);
    const hinge = onWall(G.v + s * 1.5, 1.7, 0.6);
    door.position.copyFrom(hinge);
    door.rotation.y = facing + s * 1.2;
    door.material = wood;
    door.parent = root;
  }

  // Windows burning orange, round-topped, up the rock (bloom catches them).
  for (const [v, y, w] of [[-8, 4.5, 1.2], [-4.5, 3, 1.6], [8.5, 3.6, 1.6], [11, 7.5, 1.2], [-10, 9.5, 1], [2, 10.5, 1.4], [6, 12.5, 1]] as const) {
    const win = MeshBuilder.CreatePlane("hellenaWindow", { width: w, height: w * 1.1 }, scene);
    win.position.copyFrom(onWall(v, y, 0.03));
    win.rotation.y = facing;
    win.material = glow;
    win.parent = root;
    const top = MeshBuilder.CreateDisc("hellenaWindowTop", { radius: w / 2, tessellation: 12, arc: 0.5 }, scene);
    top.position.copyFrom(onWall(v, y + w * 0.55, 0.03));
    top.rotation.y = facing;
    top.material = glow;
    top.parent = root;
    // Bars.
    for (let k = -1; k <= 1; k++) {
      const bar = MeshBuilder.CreateBox("hellenaWindowBar", { width: 0.06, height: w * 1.4, depth: 0.06 }, scene);
      bar.position.copyFrom(onWall(v + k * w * 0.28, y + w * 0.1, 0.08));
      bar.rotation.y = facing;
      bar.material = dark;
      bar.parent = root;
    }
  }

  // Wooden balconies up the face, on posts and braces, with railings.
  for (const [v, y, len] of [[-6, 6, 6], [7, 9, 5], [-1, 13, 7]] as const) {
    const deck = MeshBuilder.CreateBox("hellenaBalcony", { width: len, height: 0.2, depth: 1.6 }, scene);
    deck.position.copyFrom(onWall(v, y, 0.8));
    deck.rotation.y = facing;
    deck.material = wood;
    deck.parent = root;
    for (let k = 0; k <= len; k += 1.2) {
      const post = MeshBuilder.CreateBox("hellenaRail", { width: 0.08, height: 0.9, depth: 0.08 }, scene);
      post.position.copyFrom(onWall(v - len / 2 + k, y + 0.5, 1.55));
      post.material = wood;
      post.parent = root;
    }
    const rail = MeshBuilder.CreateBox("hellenaRailBar", { width: len, height: 0.07, depth: 0.07 }, scene);
    rail.position.copyFrom(onWall(v, y + 0.95, 1.55));
    rail.rotation.y = facing;
    rail.material = wood;
    rail.parent = root;
    for (const s of [-1, 1]) {
      const brace = MeshBuilder.CreateBox("hellenaBrace", { width: 0.12, height: 2, depth: 0.12 }, scene);
      brace.position.copyFrom(onWall(v + s * (len / 2 - 0.5), y - 0.9, 0.55));
      brace.rotation.set(0, facing, 0);
      brace.rotate(new Vector3(1, 0, 1).normalize(), 0.5);
      brace.material = wood;
      brace.parent = root;
    }
  }

  // The lookout tower at the cliff's edge, its stairs coming down to the landing.
  const T = fromUV(55.6, -7.6);
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
  const S0 = fromUV(55.4, -3.4);
  const S1 = fromUV(55.6, -6.2);
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
  for (const at of [onWall(G.v - 2.6, 2.6, 0.4), onWall(G.v + 2.6, 2.6, 0.4), fromUV(54, -3).add(new Vector3(0, 1.6, 0)), fromUV(BRIDGE_U1 + 0.3, 1.8).add(new Vector3(0, 1.8, 0))]) {
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
