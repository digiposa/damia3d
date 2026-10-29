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
import { LIGHTING_PRESETS } from "./lighting";
import { mulberry32, pixelTexture, rgb } from "./paint";
import type { World } from "./World";

/**
 * The Forest east of Seles — submap 624, "Path Merchant": a worn cart track winding up through
 * giant trunks, ferns and shafts of sunlight coming down through the canopy. Built entirely in
 * code, like the Lohan arena: no model, no image file.
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

/** Track control points (u, v) and the walkable half-width there (clearings are wider). */
const TRACK: { u: number; v: number; w: number }[] = [
  { u: -9, v: 0.5, w: 3.4 },
  { u: 0, v: 0, w: 3.8 },
  { u: 8, v: 2.6, w: 3.6 },
  { u: 16, v: 0.8, w: 6.2 }, // clearing — first encounter
  { u: 24, v: -2.8, w: 3.6 },
  { u: 32, v: -2.2, w: 4.0 },
  { u: 40, v: 1.6, w: 6.4 }, // clearing
  { u: 48, v: 3.2, w: 3.6 },
  { u: 56, v: 0.4, w: 4.2 },
  { u: 64, v: -1.2, w: 3.4 },
];

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

/** The track as a dense polyline (Catmull-Rom through {@link TRACK}, ~1 unit steps). */
function sampleTrack(): Sample[] {
  const pts = TRACK.map((k) => ({ p: forestPoint(k.u, k.v), w: k.w }));
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

const SAMPLES = sampleTrack();

/** Nearest point of the track to `(x, z)`: distance, interpolated half-width, and the point. */
function nearestOnTrack(x: number, z: number): { d: number; w: number; px: number; pz: number } {
  let best = { d: Infinity, w: 0, px: 0, pz: 0 };
  for (let i = 0; i < SAMPLES.length - 1; i++) {
    const a = SAMPLES[i];
    const b = SAMPLES[i + 1];
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

/** Keep a ground position on the track corridor and out of trunks, rocks and the cart. */
export function clampToForest(p: Vector3, margin = 0.4): void {
  const n = nearestOnTrack(p.x, p.z);
  const max = n.w - margin;
  if (n.d > max) {
    const k = max / n.d;
    p.x = n.px + (p.x - n.px) * k;
    p.z = n.pz + (p.z - n.pz) * k;
  }
  for (const o of obstacles) {
    const dx = p.x - o.x;
    const dz = p.z - o.z;
    const d = Math.hypot(dx, dz);
    const r = o.r + margin * 0.5;
    if (d < r && d > 1e-4) {
      p.x = o.x + (dx / d) * r;
      p.z = o.z + (dz / d) * r;
    }
  }
}

/**
 * Would something `height` tall with a crown `crown` wide, standing at (x, z), hide any part of
 * the walkable track from the iso camera? It does if the track lies "above" it on screen within
 * the reach of its silhouette: up-screen distance ≤ height·tan(β), sideways within the crown.
 */
function occludesTrack(x: number, z: number, height: number, crown: number): boolean {
  const reach = height * TAN_BETA + crown;
  for (const s of SAMPLES) {
    const dx = s.p.x - x;
    const dz = s.p.z - z;
    const up = dx * FWD.x + dz * FWD.z; // > 0: the track is above the object on screen
    if (up < -s.w || up > reach + s.w) continue;
    const side = Math.abs(dx * SIDE.x + dz * SIDE.z);
    if (side < crown + s.w) return true;
  }
  return false;
}

// --- Build ---------------------------------------------------------------------

/** Submap 624 of the Forest, as a combat world. */
export function forestWorld(scene: Scene): World {
  obstacles.length = 0;
  const root = new TransformNode("forest", scene);
  const rand = mulberry32(0x0f0e57); // fixed seed: the same forest every visit

  const ground = buildGround(scene, root, rand);
  const track = buildTrack(scene, root, rand);
  const trees = buildVegetation(scene, root, rand);
  buildCart(scene, root);
  buildFallenLog(scene, root);
  shadeGround([ground, track], trees);
  buildSunShafts(scene, root, rand);
  buildPollen(scene);

  for (const m of root.getChildMeshes()) {
    m.isPickable = false; // decor never swallows clicks
    m.freezeWorldMatrix();
  }
  return {
    clamp: clampToForest,
    preset: LIGHTING_PRESETS.forestDay,
    framing: 2.5,
    shadowReceivers: [ground, track],
    ownFill: [],
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

/** Centre and size of the forest floor (it reaches well past what the camera can see). */
const GROUND_CENTRE = forestPoint(27, 0);
const GROUND_SIZE = 150;
const GROUND_SUBDIV = 75;

function buildGround(scene: Scene, root: TransformNode, rand: () => number): Mesh {
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
  tex.uScale = tex.vScale = GROUND_SIZE / 6;

  const ground = MeshBuilder.CreateGround(
    "forestFloor",
    { width: GROUND_SIZE, height: GROUND_SIZE, subdivisions: GROUND_SUBDIV, updatable: true },
    scene,
  );
  ground.position.copyFrom(GROUND_CENTRE);
  ground.material = matte("forestFloorMat", scene, tex);
  ground.parent = root;
  return ground;
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
      for (const t of trees) {
        const td = Math.hypot(x - t.x, z - t.z);
        if (td < t.r) k *= 0.7 + 0.3 * (td / t.r);
      }
      colors[c] = k;
      colors[c + 1] = k * 0.97;
      colors[c + 2] = k * 0.9;
      colors[c + 3] = 1;
    }
    mesh.setVerticesData(VertexBuffer.ColorKind, colors, false, 4);
  }
}

// --- The track -------------------------------------------------------------------

/** The beaten cart track: a ribbon of dirt along the path, ragged at the edges (alpha-tested). */
function buildTrack(scene: Scene, root: TransformNode, rand: () => number): Mesh {
  const tex = pixelTexture("forestTrackTex", scene, 64, 64, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    let left = 6;
    let right = w - 6;
    for (let y = 0; y < h; y++) {
      // Edges wander a pixel at a time — grass nibbling at the dirt.
      left = Math.min(14, Math.max(2, left + ((rand() * 3) | 0) - 1));
      right = Math.max(w - 14, Math.min(w - 2, right + ((rand() * 3) | 0) - 1));
      for (let x = left; x < right; x++) {
        const edge = Math.min(x - left, right - x);
        const rut = Math.abs(x - w * 0.33) < 2.5 || Math.abs(x - w * 0.67) < 2.5; // cart wheel ruts
        let k = 0.86 + rand() * 0.22;
        if (rut) k *= 0.9;
        if (edge < 3) k *= 0.88;
        ctx.fillStyle = rgb(178 * k, 120 * k, 92 * k); // terracotta / salmon earth of the PS1 screens
        ctx.fillRect(x, y, 1, 1);
      }
      if (rand() < 0.35) {
        ctx.fillStyle = rgb(206, 150, 116);
        ctx.fillRect(left + 3 + ((rand() * (right - left - 6)) | 0), y, 1, 1); // pebble
      }
      if (rand() < 0.25) {
        ctx.fillStyle = rgb(118, 74, 52); // darker clod
        ctx.fillRect(left + 4 + ((rand() * (right - left - 8)) | 0), y, 1, 2); // grass tuft in the middle strip
      }
    }
  });
  tex.hasAlpha = true;
  tex.wrapU = Texture.CLAMP_ADDRESSMODE;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  let along = 0;
  // Extend the dirt a little past both ends so it runs into the dark rather than stopping short.
  const first = SAMPLES[0];
  const last = SAMPLES[SAMPLES.length - 1];
  const pts = [
    { p: first.p.subtract(first.t.scale(6)), t: first.t },
    ...SAMPLES,
    { p: last.p.add(last.t.scale(6)), t: last.t },
  ];
  // Several columns across (not just two edges), so the sun dapple in the vertex colours can fall
  // across the dirt too — the bright patches on the track are half the reference shot's light.
  const COLS = 6;
  for (let i = 0; i < pts.length; i++) {
    const { p, t } = pts[i];
    if (i > 0) along += Vector3.Distance(pts[i - 1].p, p);
    const nx = -t.z;
    const nz = t.x;
    const half = DIRT_HALF * (0.92 + 0.16 * Math.sin(along * 0.7 + rand()));
    for (let c = 0; c <= COLS; c++) {
      const f = c / COLS;
      const o = half * (1 - 2 * f);
      positions.push(p.x + nx * o, 0.02, p.z + nz * o);
      uvs.push(f, along / 4);
    }
    if (i > 0) {
      const a = (i - 1) * (COLS + 1);
      const b = i * (COLS + 1);
      for (let c = 0; c < COLS; c++) indices.push(a + c, b + c, a + c + 1, a + c + 1, b + c, b + c + 1);
    }
  }
  const normals: number[] = [];
  VertexData.ComputeNormals(positions, indices, normals);
  const vd = new VertexData();
  vd.positions = positions;
  vd.indices = indices;
  vd.uvs = uvs;
  vd.normals = normals.map((_, i) => (i % 3 === 1 ? 1 : 0)); // flat ground: straight up
  const mesh = new Mesh("forestTrack", scene);
  vd.applyToMesh(mesh);
  const mat = matte("forestTrackMat", scene, tex);
  mat.backFaceCulling = false;
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

/** A tall tree: tapered, slightly bent trunk with root flares, crown of jittered blobs. */
function treeSource(i: number, scene: Scene, bark: StandardMaterial, leaves: StandardMaterial, rand: () => number): Mesh {
  const height = 9 + rand() * 4;
  const r = 0.55 + rand() * 0.25;
  const parts: Mesh[] = [];
  const trunk = MeshBuilder.CreateCylinder(
    `t${i}trunk`,
    { height, diameterTop: r * 0.9, diameterBottom: r * 2, tessellation: 7, subdivisions: 4 },
    scene,
  );
  trunk.position.y = height / 2;
  jitter(trunk, 0.18, rand);
  gradeColors(trunk, [0.7, 0.66, 0.6], PLAIN);
  trunk.material = bark;
  parts.push(trunk);
  for (let k = 0; k < 4; k++) {
    const root = MeshBuilder.CreateCylinder(`t${i}root${k}`, { height: 2.2, diameterTop: 0.1, diameterBottom: r * 0.9, tessellation: 5 }, scene);
    const a = (k / 4) * Math.PI * 2 + rand() * 0.8;
    root.rotation.set(0, -a, 0);
    root.rotation.z = 1.05; // splayed out along the ground
    root.position.set(Math.cos(a) * r * 1.1, 0.35, Math.sin(a) * r * 1.1);
    root.rotation.y = -a;
    root.material = bark;
    gradeColors(root, [0.6, 0.56, 0.5], PLAIN);
    parts.push(root);
  }
  // Many small lumps rather than a few big ones: seen from above (as the iso camera does) a crown
  // should read like the reference's cauliflower clumps — each lump lit on top, dark underneath.
  const blobs = 10 + ((rand() * 5) | 0);
  for (let k = 0; k < blobs; k++) {
    const b = MeshBuilder.CreateIcoSphere(`t${i}leaf${k}`, { radius: 1.0 + rand() * 0.6, subdivisions: 2 }, scene);
    const a = rand() * Math.PI * 2;
    const d = k === 0 ? 0 : Math.sqrt(rand()) * 2.8;
    b.position.set(Math.cos(a) * d, height - 0.4 + (1 - d / 2.8) * 1.4 + rand() * 0.6, Math.sin(a) * d);
    b.scaling.y = 0.8;
    jitter(b, 0.22, rand);
    gradeColors(b, LEAF_SHADE, LEAF_SUN);
    b.material = leaves;
    parts.push(b);
  }
  return mergeSource(`forestTree${i}`, parts);
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
    const b = MeshBuilder.CreateIcoSphere(`bush${k}`, { radius: r, subdivisions: 2 }, scene);
    const a = rand() * Math.PI * 2;
    const d = k === 0 ? 0 : 0.35 + rand() * 0.4;
    b.position.set(Math.cos(a) * d, r * 0.8 + (k === 0 ? 0.25 : rand() * 0.15), Math.sin(a) * d);
    b.scaling.y = 0.85;
    jitter(b, 0.1, rand);
    gradeColors(b, LEAF_SHADE, LEAF_SUN);
    b.material = leaves;
    parts.push(b);
  }
  return mergeSource("forestBush", parts);
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

/** Place an instance of `src`, frozen in place. */
function place(src: Mesh, root: TransformNode, x: number, z: number, scale: number, rotY: number): void {
  const inst = src.createInstance(`${src.name}_${x.toFixed(1)}_${z.toFixed(1)}`);
  inst.parent = root;
  inst.position.set(x, 0, z);
  inst.scaling.setAll(scale);
  inst.rotation.y = rotY;
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
  const bush = bushSource(scene, leaves, rand);
  const rock = rockSource(scene, rand);
  const fern = fernSource(scene, rand);

  const shade: { x: number; z: number; r: number }[] = [];
  const STEP = 3.1;
  const REACH = 24; // how far from the track the wood is dressed
  const half = GROUND_SIZE / 2;
  for (let gx = -half; gx < half; gx += STEP)
    for (let gz = -half; gz < half; gz += STEP) {
      const x = GROUND_CENTRE.x + gx + (rand() - 0.5) * STEP * 0.9;
      const z = GROUND_CENTRE.z + gz + (rand() - 0.5) * STEP * 0.9;
      const near = nearestOnTrack(x, z);
      const edge = near.d - near.w; // < 0: inside the walkable corridor
      if (near.d > REACH + near.w) continue;
      const rot = rand() * Math.PI * 2;
      const roll = rand();

      if (edge > 0.9 && roll < 0.78 && !occludesTrack(x, z, 13, 3.4)) {
        const s = 0.85 + rand() * 0.4;
        place(trees[(rand() * trees.length) | 0], root, x, z, s, rot);
        shade.push({ x, z, r: 3.2 * s });
        if (edge < 2.2) obstacles.push({ x, z, r: 0.9 * s }); // trunks at the corridor's edge block
      } else if (edge > 0.4 && roll < 0.5 && !occludesTrack(x, z, 2.2, 1)) {
        place(sapling, root, x, z, 0.8 + rand() * 0.5, rot);
      } else if (edge > -0.6) {
        // Low growth: a clump of ferns, a bush, or a mossy rock — never more than knee-high.
        const what = rand();
        if (what < 0.35) {
          for (let k = 0; k < 3; k++)
            place(fern, root, x + (rand() - 0.5) * 2, z + (rand() - 0.5) * 2, 0.8 + rand() * 0.6, rand() * Math.PI);
        } else if (what < 0.85) {
          // Big rounded clumps where they hide nothing (the reference screens are packed with them),
          // knee-high ones right at the verge.
          if (edge > 0.6 && !occludesTrack(x, z, 2, 1.8)) place(bush, root, x, z, 1.4 + rand() * 0.9, rot);
          else if (edge > 0.3) place(bush, root, x, z, 0.7 + rand() * 0.4, rot);
        } else if (edge > 0.2) {
          const s = 0.6 + rand() * 0.8;
          place(rock, root, x, z, s, rot);
          if (edge < 1) obstacles.push({ x, z, r: 0.75 * s });
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
  for (let u = -4; u < 66; u += 5 + rand() * 4) {
    const v = (rand() - 0.5) * 9;
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
