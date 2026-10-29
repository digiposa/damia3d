import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3, Vector4 } from "@babylonjs/core/Maths/math.vector";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Scene } from "@babylonjs/core/scene";
import { softDotTexture } from "./atmosphere";

/**
 * The battle ring of the Lohan Hero Competition, rebuilt after the PS1 battle screen: not an open
 * colosseum but an **enclosed, intimate ring** — square flagstones, a tall dark-timber palisade
 * banded in iron closing off the back, and torches on the wall throwing big orange pools of light
 * into otherwise near-total darkness. Nothing above the wall: the console showed black there.
 *
 * Built for the console look, not against it:
 *  - every texture is painted in code at PS1 sizes (32–128 px) and sampled NEAREST — no smoothing,
 *    no mipmaps, so the texels stay crisp blocks under the retro renderer (see {@link ./retro});
 *  - the palette is lifted from the reference screens: sepia, amber and brown-red, no blue at all;
 *  - the light comes from the torches, as on the original — that is what carries the mood.
 *
 * The iso camera never rotates, so the ring is an open cutaway: the wall rises tall behind the
 * fight (the "backdrop" of the PS1 shot) and drops to a knee-high rim on the camera side, so the
 * player is never hidden.
 */

/** Radius of the fighting floor combatants are clamped to (the palisade sits just beyond). */
export const ARENA_RADIUS = 9.5;

const WALL_RADIUS = 10.4;
const SEGMENTS = 36;
/** Palisade height at the back of the ring, and at the cutaway rim on the camera side. */
const WALL_TALL = 6.4;
const WALL_LOW = 1.1;
/** A heavy upright every this many wall segments. */
const POST_EVERY = 3;

/** The gate faces screen-top: directly away from the fixed iso camera. */
const GATE_ANGLE = (3 * Math.PI) / 4;
const GATE_HALF_WIDTH = 0.2; // radians of wall the gate replaces

/** Ground direction from the arena toward the camera (alpha = -π/4 → +x, -z). */
const CAM_X = Math.SQRT1_2;
const CAM_Z = -Math.SQRT1_2;

/** Torches hang on the back half of the ring, symmetric about the gate. */
const TORCH_OFFSETS = [-1.25, -0.55, 0.55, 1.25];
const TORCH_HEIGHT = 3.7;

// Reference palette (PS1 Lohan battle screen): timber, iron, flagstone, torchlight.
const WOOD_DARK = new Color3(0.2, 0.12, 0.08);
const IRON = new Color3(0.13, 0.11, 0.1);
const BRONZE = new Color3(0.36, 0.24, 0.12);
const TORCH = new Color3(1.0, 0.58, 0.26);

/**
 * Keep a ground position inside the fighting floor (mutates `p` in place).
 * Used for the party, enemies, spawn points and click-to-move targets alike.
 */
export function clampToArena(p: Vector3, margin = 0.4): void {
  const max = ARENA_RADIUS - margin;
  const r = Math.hypot(p.x, p.z);
  if (r > max) {
    const s = max / r;
    p.x *= s;
    p.z *= s;
  }
}

/**
 * Build the whole arena into the scene. Meshes die with the scene (mode switch).
 *
 * Returns the arena's meshes. The caller must keep the WORLD fill light off them (see
 * `Atmosphere.excludeFromFill`): the set has its own dim fill, so the torches can stand out.
 * Babylon's standard material clamps lighting to 1 before applying the texture — a surface
 * already fully lit by the global fill cannot get any brighter near a torch, and the light
 * pools that make the PS1 scene simply never show.
 */
export function createArena(scene: Scene): AbstractMesh[] {
  const root = new TransformNode("arena", scene);
  const rand = mulberry32(0x10a4); // fixed seed: the same arena every visit
  const lit: AbstractMesh[] = []; // what the torches illuminate

  lit.push(buildFloor(scene, root, rand));
  const walls = buildPalisade(scene, root, rand);
  lit.push(...buildGate(scene, root));
  buildTorches(scene, root, lit, walls);
  buildBanners(scene, root, rand);
  buildBells(scene, root);

  const meshes = root.getChildMeshes();
  // Decor must never swallow clicks — picking is for enemies and the ground ray.
  for (const m of meshes) m.isPickable = false;

  // The set's own fill: low and warm, so the torchlit areas reach full brightness and the rest
  // falls back into shadow, as on the console. (The sun still reaches it — for the fighters'
  // shadows on the flagstones.)
  const fill = new HemisphericLight("arenaFill", new Vector3(0, 1, 0), scene);
  fill.intensity = 0.3;
  fill.diffuse = new Color3(1.0, 0.7, 0.52); // red-brown, not yellow: yellow fill reads olive on grey stone
  fill.groundColor = new Color3(0.2, 0.12, 0.07);
  fill.specular = Color3.Black();
  fill.includedOnlyMeshes = meshes;
  return meshes;
}

// --- Shared helpers ---------------------------------------------------------

/** Small deterministic PRNG, so the hand-"painted" textures come out identical every time. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A PS1-sized canvas texture: nearest sampling, no mipmaps — texels stay crisp blocks. */
function pixelTexture(
  name: string,
  scene: Scene,
  w: number,
  h: number,
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
): DynamicTexture {
  const tex = new DynamicTexture(name, { width: w, height: h }, scene, false, Texture.NEAREST_SAMPLINGMODE);
  // DynamicTexture defaults to CLAMP; these tile (floor slabs repeat across the ring).
  tex.wrapU = Texture.WRAP_ADDRESSMODE;
  tex.wrapV = Texture.WRAP_ADDRESSMODE;
  // Babylon's ICanvasRenderingContext type misses a few methods; in the browser it IS a 2D context.
  paint(tex.getContext() as CanvasRenderingContext2D, w, h);
  tex.update(false);
  return tex;
}

const rgb = (r: number, g: number, b: number): string => `rgb(${r | 0},${g | 0},${b | 0})`;

/** Lit, low-spec material for the torch-lit set (several point lights reach it). */
function setMaterial(name: string, scene: Scene, tex?: Texture, color?: Color3): StandardMaterial {
  const m = new StandardMaterial(name, scene);
  if (tex) m.diffuseTexture = tex;
  if (color) m.diffuseColor = color;
  m.specularColor = new Color3(0.03, 0.025, 0.02); // matte: the PS1 had no specular to speak of
  m.maxSimultaneousLights = 8; // sun + fill + four torches
  return m;
}

/** Unlit, self-coloured material (flames, glows, deep shadow). */
function glowMaterial(name: string, scene: Scene, color: Color3): StandardMaterial {
  const m = new StandardMaterial(name, scene);
  m.emissiveColor = color;
  m.diffuseColor = Color3.Black();
  m.disableLighting = true;
  return m;
}

/** Smallest signed angle between two headings. */
function angDiff(a: number, b: number): number {
  let d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/** Rotation.y that turns a plane at heading `a` on the ring to face the arena centre. */
function faceCentreY(a: number): number {
  return -a - Math.PI / 2;
}

/** 0 at the back of the ring (away from the camera) … 1 straight in front of it. */
function towardCamera(a: number): number {
  const toward = Math.cos(a) * CAM_X + Math.sin(a) * CAM_Z;
  const t = Math.min(1, Math.max(0, (toward + 0.15) / 0.7));
  return t * t * (3 - 2 * t);
}

/** Palisade height at heading `a`: tall backdrop behind the fight, knee-high rim in front. */
function wallHeight(a: number): number {
  return WALL_TALL + (WALL_LOW - WALL_TALL) * towardCamera(a);
}

// --- Floor -------------------------------------------------------------------

/**
 * Square flagstones, 1.6 units a side, in a grid — the floor of the reference shot. One 128 px
 * texture holds a 4×4 block of slabs, each slab with its own tone, bevel, grime and the odd crack.
 */
function buildFloor(scene: Scene, root: TransformNode, rand: () => number): Mesh {
  const TILE = 32; // px per slab
  const tex = pixelTexture("arenaFloorTex", scene, TILE * 4, TILE * 4, (ctx, w, h) => {
    ctx.fillStyle = rgb(38, 28, 22); // mortar
    ctx.fillRect(0, 0, w, h);
    for (let ty = 0; ty < 4; ty++) {
      for (let tx = 0; tx < 4; tx++) {
        const x0 = tx * TILE + 1;
        const y0 = ty * TILE + 1;
        const s = TILE - 2;
        const k = 0.88 + rand() * 0.2; // slab-to-slab tone
        const base = [130 * k, 102 * k, 82 * k]; // the slab's FULLY-lit tone: what a torch brings it up to
        ctx.fillStyle = rgb(base[0], base[1], base[2]);
        ctx.fillRect(x0, y0, s, s);
        // Speckle: the stone's grain, one texel at a time.
        for (let i = 0; i < 70; i++) {
          const d = rand() < 0.5 ? -18 : 14;
          ctx.fillStyle = rgb(base[0] + d, base[1] + d * 0.85, base[2] + d * 0.7);
          ctx.fillRect(x0 + ((rand() * s) | 0), y0 + ((rand() * s) | 0), 1, 1);
        }
        // Worn bevel: lit top/left edge, shadowed bottom/right — reads as relief without a normal map.
        ctx.fillStyle = rgb(base[0] + 22, base[1] + 18, base[2] + 12);
        ctx.fillRect(x0, y0, s, 1);
        ctx.fillRect(x0, y0, 1, s);
        ctx.fillStyle = rgb(base[0] - 28, base[1] - 24, base[2] - 20);
        ctx.fillRect(x0, y0 + s - 1, s, 1);
        ctx.fillRect(x0 + s - 1, y0, 1, s);
        // Grime pooled in one corner.
        if (rand() < 0.5) {
          ctx.fillStyle = "rgba(20,12,8,0.35)";
          ctx.fillRect(x0 + (rand() < 0.5 ? 0 : s - 9), y0 + (rand() < 0.5 ? 0 : s - 7), 9, 7);
        }
        // An occasional crack: a jagged 1-texel line.
        if (rand() < 0.3) {
          let cx = x0 + 4 + rand() * (s - 8);
          let cy = y0 + 2;
          ctx.fillStyle = rgb(base[0] - 40, base[1] - 34, base[2] - 28);
          while (cy < y0 + s - 3) {
            ctx.fillRect(cx | 0, cy | 0, 1, 1);
            cy += 1;
            cx += (rand() - 0.5) * 2;
          }
        }
      }
    }
  });

  const floor = MeshBuilder.CreateDisc("arenaFloor", { radius: WALL_RADIUS + 0.4, tessellation: 48 }, scene);
  floor.rotation.x = Math.PI / 2;
  floor.parent = root;
  // CreateDisc maps its UVs across its diameter: tile the 4-slab texture to 1.6-unit slabs.
  const span = (WALL_RADIUS + 0.4) * 2;
  tex.uScale = span / (1.6 * 4);
  tex.vScale = span / (1.6 * 4);
  floor.material = setMaterial("arenaFloorMat", scene, tex);
  return floor;
}

// --- Palisade -------------------------------------------------------------------

/**
 * The wall texture: three vertical timber planks over a stone plinth, crossed by two iron bands
 * studded with rivets, darkening with soot toward the top. 64×192 — one wall panel.
 */
function palisadeTexture(scene: Scene, rand: () => number): DynamicTexture {
  return pixelTexture("arenaWallTex", scene, 64, 192, (ctx, w, h) => {
    const PLINTH = 30;
    // Planks.
    const planks = 3;
    const pw = w / planks;
    for (let p = 0; p < planks; p++) {
      const k = 0.85 + rand() * 0.3;
      const base = [132 * k, 80 * k, 52 * k];
      ctx.fillStyle = rgb(base[0], base[1], base[2]);
      ctx.fillRect(p * pw, 0, pw, h - PLINTH);
      // Grain: long vertical streaks.
      for (let i = 0; i < 26; i++) {
        const gx = p * pw + 1 + ((rand() * (pw - 2)) | 0);
        const gy = (rand() * (h - PLINTH)) | 0;
        const len = 6 + rand() * 30;
        const d = rand() < 0.55 ? -16 : 12;
        ctx.fillStyle = rgb(base[0] + d, base[1] + d * 0.7, base[2] + d * 0.5);
        ctx.fillRect(gx, gy, 1, len);
      }
      // A knot here and there.
      if (rand() < 0.6) {
        ctx.fillStyle = rgb(base[0] - 30, base[1] - 20, base[2] - 14);
        ctx.fillRect(p * pw + 5 + rand() * (pw - 10), 40 + rand() * 90, 3, 2);
      }
      // Seam between planks.
      ctx.fillStyle = rgb(26, 15, 10);
      ctx.fillRect(p * pw, 0, 1, h - PLINTH);
    }
    // Soot: the top third darkens toward the black above the wall.
    for (let y = 0; y < 60; y++) {
      ctx.fillStyle = `rgba(10,6,4,${((60 - y) / 60) * 0.55})`;
      ctx.fillRect(0, y, w, 1);
    }
    // Iron bands with rivets.
    for (const by of [34, 104]) {
      ctx.fillStyle = rgb(34, 29, 27);
      ctx.fillRect(0, by, w, 5);
      ctx.fillStyle = rgb(58, 50, 44);
      ctx.fillRect(0, by, w, 1);
      for (let x = 4; x < w; x += 10) {
        ctx.fillStyle = rgb(92, 80, 66);
        ctx.fillRect(x, by + 2, 1, 1);
        ctx.fillStyle = rgb(18, 14, 12);
        ctx.fillRect(x + 1, by + 3, 1, 1);
      }
    }
    // Stone plinth: two courses of blocks.
    const top = h - PLINTH;
    ctx.fillStyle = rgb(30, 23, 18);
    ctx.fillRect(0, top, w, PLINTH);
    for (let row = 0; row < 2; row++) {
      const y = top + 1 + row * 15;
      const off = row % 2 === 0 ? 0 : 11;
      for (let x = -off; x < w; x += 22) {
        const k = 0.85 + rand() * 0.3;
        ctx.fillStyle = rgb(84 * k, 70 * k, 58 * k);
        ctx.fillRect(x + 1, y, 20, 13);
        ctx.fillStyle = rgb(104 * k, 88 * k, 72 * k);
        ctx.fillRect(x + 1, y, 20, 1);
      }
    }
  });
}

/** Ring of timber panels, tall at the back and cut down in front, with heavy uprights. Returns
 *  the meshes the torches should light. */
function buildPalisade(scene: Scene, root: TransformNode, rand: () => number): AbstractMesh[] {
  const tex = palisadeTexture(scene, rand);
  const wall = setMaterial("arenaWallMat", scene, tex);
  const capMat = setMaterial("arenaCapMat", scene, undefined, WOOD_DARK);
  const postTex = pixelTexture("arenaPostTex", scene, 16, 64, (ctx, w, h) => {
    ctx.fillStyle = rgb(52, 32, 22);
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = rand() < 0.5 ? rgb(38, 23, 15) : rgb(68, 44, 30);
      ctx.fillRect((rand() * w) | 0, (rand() * h) | 0, 1, 4 + rand() * 10);
    }
    ctx.fillStyle = rgb(30, 26, 24);
    ctx.fillRect(0, 12, w, 3);
    ctx.fillRect(0, 44, w, 3);
  });
  const postMat = setMaterial("arenaPostMat", scene, postTex);

  const lit: AbstractMesh[] = [];
  const step = (Math.PI * 2) / SEGMENTS;
  const chord = 2 * Math.sin(step / 2) * WALL_RADIUS + 0.04;

  for (let i = 0; i < SEGMENTS; i++) {
    const a = (i + 0.5) * step;
    if (Math.abs(angDiff(a, GATE_ANGLE)) < GATE_HALF_WIDTH) continue;
    const h = wallHeight(a);
    const x = Math.cos(a) * WALL_RADIUS;
    const z = Math.sin(a) * WALL_RADIUS;

    // Show the BOTTOM of the panel texture on cut-down segments, so the rim keeps its plinth.
    const panel = MeshBuilder.CreatePlane(
      `wall${i}`,
      {
        width: chord,
        height: h,
        sideOrientation: Mesh.DOUBLESIDE,
        frontUVs: new Vector4(0, 0, 1, h / WALL_TALL),
        backUVs: new Vector4(0, 0, 1, h / WALL_TALL),
      },
      scene,
    );
    panel.position.set(x, h / 2, z);
    panel.rotation.y = faceCentreY(a);
    panel.material = wall;
    panel.parent = root;
    lit.push(panel);

    // A dark beam caps the palisade.
    const cap = MeshBuilder.CreateBox(`wallCap${i}`, { width: chord, height: 0.22, depth: 0.5 }, scene);
    cap.position.set(Math.cos(a) * (WALL_RADIUS + 0.1), h + 0.11, Math.sin(a) * (WALL_RADIUS + 0.1));
    cap.rotation.y = faceCentreY(a);
    cap.material = capMat;
    cap.parent = root;
  }

  // Heavy uprights between panels, proud of the wall face.
  for (let i = 0; i < SEGMENTS; i += POST_EVERY) {
    const a = i * step;
    if (Math.abs(angDiff(a, GATE_ANGLE)) < GATE_HALF_WIDTH + 0.05) continue;
    const h = wallHeight(a) + 0.45;
    const post = MeshBuilder.CreateBox(`wallPost${i}`, { width: 0.55, height: h, depth: 0.55 }, scene);
    post.position.set(Math.cos(a) * (WALL_RADIUS - 0.18), h / 2, Math.sin(a) * (WALL_RADIUS - 0.18));
    post.rotation.y = faceCentreY(a);
    post.material = postMat;
    post.parent = root;
    lit.push(post);
  }
  return lit;
}

// --- The gate -------------------------------------------------------------------

/** The fighters' entrance at the back: a timber frame over a black passage, portcullis half-raised.
 *  Returns the frame meshes, for the torches to light. */
function buildGate(scene: Scene, root: TransformNode): AbstractMesh[] {
  const lit: AbstractMesh[] = [];
  const frame = setMaterial("gateFrameMat", scene, undefined, WOOD_DARK);
  const iron = setMaterial("gateIronMat", scene, undefined, IRON);
  const dark = glowMaterial("gateDarkMat", scene, new Color3(0.012, 0.008, 0.006));
  const r = WALL_RADIUS;
  const at = (rad: number, a: number): [number, number] => [Math.cos(a) * rad, Math.sin(a) * rad];

  // The black passage, set back behind the wall line.
  const [dx, dz] = at(r + 0.9, GATE_ANGLE);
  const passage = MeshBuilder.CreatePlane("gatePassage", { width: 3.6, height: 4.6 }, scene);
  passage.position.set(dx, 2.3, dz);
  passage.rotation.y = faceCentreY(GATE_ANGLE);
  passage.material = dark;
  passage.parent = root;

  // Jambs and a heavy lintel.
  for (const side of [-1, 1]) {
    const [x, z] = at(r, GATE_ANGLE + side * (GATE_HALF_WIDTH + 0.02));
    const jamb = MeshBuilder.CreateBox(`gateJamb${side}`, { width: 0.8, height: WALL_TALL + 0.6, depth: 1.4 }, scene);
    jamb.position.set(x, (WALL_TALL + 0.6) / 2, z);
    jamb.rotation.y = faceCentreY(GATE_ANGLE);
    jamb.material = frame;
    jamb.parent = root;
    lit.push(jamb);
  }
  const [lx, lz] = at(r, GATE_ANGLE);
  const lintel = MeshBuilder.CreateBox("gateLintel", { width: 5.4, height: 1.0, depth: 1.5 }, scene);
  lintel.position.set(lx, 5.0, lz);
  lintel.rotation.y = faceCentreY(GATE_ANGLE);
  lintel.material = frame;
  lintel.parent = root;
  lit.push(lintel);
  // Wall above the lintel, so the backdrop stays closed.
  const over = MeshBuilder.CreateBox("gateOver", { width: 5.0, height: WALL_TALL - 5.5, depth: 0.4 }, scene);
  over.position.set(lx, 5.5 + (WALL_TALL - 5.5) / 2, lz);
  over.rotation.y = faceCentreY(GATE_ANGLE);
  over.material = frame;
  over.parent = root;
  lit.push(over);

  // Portcullis, raised to show its spiked teeth.
  const bars = new TransformNode("gatePortcullis", scene);
  bars.parent = root;
  const [px, pz] = at(r + 0.35, GATE_ANGLE);
  bars.position.set(px, 0, pz);
  bars.rotation.y = faceCentreY(GATE_ANGLE);
  for (let i = -3; i <= 3; i++) {
    const bar = MeshBuilder.CreateBox(`gateBar${i}`, { width: 0.1, height: 2.6, depth: 0.1 }, scene);
    bar.position.set(i * 0.5, 3.4, 0);
    bar.material = iron;
    bar.parent = bars;
    const tooth = MeshBuilder.CreateCylinder(`gateTooth${i}`, { diameterTop: 0.14, diameterBottom: 0, height: 0.3, tessellation: 4 }, scene);
    tooth.position.set(i * 0.5, 1.95, 0);
    tooth.material = iron;
    tooth.parent = bars;
  }
  for (const y of [2.4, 3.6]) {
    const rail = MeshBuilder.CreateBox(`gateRail${y}`, { width: 3.4, height: 0.12, depth: 0.12 }, scene);
    rail.position.set(0, y, 0);
    rail.material = iron;
    rail.parent = bars;
  }
  return lit;
}

// --- Torches ---------------------------------------------------------------------

/** Wall torches: iron bracket, low-poly flame, embers, a flickering light raking the floor and
 *  palisade, and a tight one washing the planks around the bracket. `walls` is the palisade. */
function buildTorches(scene: Scene, root: TransformNode, lit: AbstractMesh[], walls: AbstractMesh[]): void {
  const iron = setMaterial("torchIronMat", scene, undefined, IRON);
  const shell = glowMaterial("torchFlameMat", scene, new Color3(1.0, 0.48, 0.12));
  const core = glowMaterial("torchCoreMat", scene, new Color3(1.0, 0.86, 0.45));
  const emberTex = softDotTexture(scene);

  const torches: { flame: Mesh; light: PointLight; wash: PointLight; phase: number }[] = [];
  TORCH_OFFSETS.forEach((off, k) => {
    const a = GATE_ANGLE + off;
    const inX = -Math.cos(a);
    const inZ = -Math.sin(a);
    const wx = Math.cos(a) * WALL_RADIUS;
    const wz = Math.sin(a) * WALL_RADIUS;

    // Bracket: a stub out of the wall and a cup.
    const arm = MeshBuilder.CreateBox(`torchArm${k}`, { width: 0.12, height: 0.12, depth: 0.6 }, scene);
    arm.position.set(wx + inX * 0.3, TORCH_HEIGHT - 0.25, wz + inZ * 0.3);
    arm.rotation.y = faceCentreY(a);
    arm.material = iron;
    arm.parent = root;
    const cup = MeshBuilder.CreateCylinder(
      `torchCup${k}`,
      { diameterTop: 0.42, diameterBottom: 0.18, height: 0.32, tessellation: 6 },
      scene,
    );
    cup.position.set(wx + inX * 0.6, TORCH_HEIGHT - 0.12, wz + inZ * 0.6);
    cup.material = iron;
    cup.parent = root;

    // Low-poly flame: an orange cone with a yellow heart.
    const flame = MeshBuilder.CreateCylinder(
      `torchFlame${k}`,
      { diameterTop: 0, diameterBottom: 0.4, height: 0.8, tessellation: 6 },
      scene,
    );
    flame.position.set(wx + inX * 0.6, TORCH_HEIGHT + 0.42, wz + inZ * 0.6);
    flame.material = shell;
    flame.parent = root;
    const heart = MeshBuilder.CreateCylinder(
      `torchHeart${k}`,
      { diameterTop: 0, diameterBottom: 0.2, height: 0.45, tessellation: 6 },
      scene,
    );
    heart.position.y = -0.12;
    heart.material = core;
    heart.parent = flame;

    buildEmbers(scene, flame.position.clone(), emberTex, `torchEmbers${k}`);

    // The real light, out in front of the wall so it rakes across the floor.
    const light = new PointLight(`torchLight${k}`, new Vector3(wx + inX * 1.2, TORCH_HEIGHT + 0.3, wz + inZ * 1.4), scene);
    light.diffuse = TORCH;
    light.specular = Color3.Black();
    light.range = 8.5;
    light.intensity = 1.1;
    // Torches light the SET only. Characters keep the global sun + fill (and their material's light
    // budget): this is also how the console did it — environment lighting baked, actors lit flat.
    // NOT the palisade: it takes the wall-wash lights below instead. No material may see more than
    // 8 lights — a 12-light shader exceeded desktop (Windows/ANGLE) GPU limits and the walls
    // rendered black, while phones coped.
    light.includedOnlyMeshes = lit;

    // The pool of light on the wall around the torch — the big orange bloom of the reference shot.
    // A second, tight light hugging the planks: a single raking light from the floor side spreads
    // too evenly to draw it.
    const wash = new PointLight(`torchWash${k}`, new Vector3(wx + inX * 0.55, TORCH_HEIGHT + 0.35, wz + inZ * 0.55), scene);
    wash.diffuse = new Color3(1.0, 0.52, 0.2);
    wash.specular = Color3.Black();
    wash.range = 5;
    wash.intensity = 2.0;
    wash.includedOnlyMeshes = walls;

    torches.push({ flame, light, wash, phase: k * 2.17 });
  });

  // One shared flicker: flames dance, lights and wall pools breathe together.
  let t = 0;
  scene.onBeforeRenderObservable.add(() => {
    t += scene.getEngine().getDeltaTime() / 1000;
    for (const tc of torches) {
      const f = 0.5 * Math.sin(t * 9 + tc.phase) + 0.3 * Math.sin(t * 23 + tc.phase * 1.7) + 0.2 * Math.sin(t * 4.1 + tc.phase);
      tc.flame.scaling.y = 1 + 0.18 * f;
      const w = 1 + 0.08 * Math.sin(t * 13 + tc.phase * 0.6);
      tc.flame.scaling.x = w;
      tc.flame.scaling.z = w;
      tc.light.intensity = 1.1 + 0.2 * f;
      tc.wash.intensity = 2.0 + 0.4 * f;
    }
  });
}

/** Sparks rising off a torch — additive, buoyant, short-lived. */
function buildEmbers(scene: Scene, at: Vector3, tex: DynamicTexture, name: string): void {
  const ps = new ParticleSystem(name, 30, scene);
  ps.particleTexture = tex;
  ps.emitter = at.add(new Vector3(0, 0.3, 0));
  ps.minEmitBox = new Vector3(-0.1, 0, -0.1);
  ps.maxEmitBox = new Vector3(0.1, 0.1, 0.1);
  ps.color1 = new Color4(1.0, 0.6, 0.2, 0.9);
  ps.color2 = new Color4(1.0, 0.85, 0.45, 0.9);
  ps.colorDead = new Color4(0.6, 0.2, 0.05, 0);
  ps.minSize = 0.04;
  ps.maxSize = 0.1;
  ps.minLifeTime = 0.5;
  ps.maxLifeTime = 1.3;
  ps.emitRate = 14;
  ps.blendMode = ParticleSystem.BLENDMODE_ADD;
  ps.gravity = new Vector3(0, 0.6, 0);
  ps.direction1 = new Vector3(-0.3, 1.2, -0.3);
  ps.direction2 = new Vector3(0.3, 2.0, 0.3);
  ps.minEmitPower = 0.3;
  ps.maxEmitPower = 0.8;
  ps.updateSpeed = 0.02;
  ps.start();
}

// --- Banners & bells -----------------------------------------------------------------

/** Two tournament banners flanking the gate: red cloth, gold border and crest, swaying. */
function buildBanners(scene: Scene, root: TransformNode, rand: () => number): void {
  const tex = pixelTexture("bannerTex", scene, 16, 48, (ctx, w, h) => {
    ctx.fillStyle = rgb(118, 20, 14);
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = rand() < 0.5 ? rgb(92, 14, 10) : rgb(138, 30, 20);
      ctx.fillRect((rand() * w) | 0, (rand() * h) | 0, 1, 1);
    }
    ctx.fillStyle = rgb(196, 146, 52); // gold trim + crest
    ctx.fillRect(0, 0, w, 2);
    ctx.fillRect(1, 2, 1, h - 6);
    ctx.fillRect(w - 2, 2, 1, h - 6);
    ctx.fillRect(5, 14, 6, 6);
    ctx.fillRect(7, 12, 2, 10);
    ctx.fillStyle = rgb(118, 20, 14);
    ctx.fillRect(7, 16, 2, 2);
    // Swallow-tail bottom.
    ctx.clearRect(0, h - 4, w, 4);
    ctx.fillStyle = rgb(118, 20, 14);
    ctx.fillRect(1, h - 4, 5, 4);
    ctx.fillRect(w - 6, h - 4, 5, 4);
  });
  tex.hasAlpha = true;
  const mat = setMaterial("bannerMat", scene, tex);
  mat.backFaceCulling = false;
  const pole = setMaterial("bannerPoleMat", scene, undefined, BRONZE);

  const banners: { node: TransformNode; phase: number }[] = [];
  for (const side of [-1, 1]) {
    const a = GATE_ANGLE + side * 0.32;
    const r = WALL_RADIUS - 0.12;
    const pivot = new TransformNode(`bannerPivot${side}`, scene);
    pivot.position.set(Math.cos(a) * r, 5.6, Math.sin(a) * r);
    pivot.rotation.y = faceCentreY(a);
    pivot.parent = root;
    const cloth = MeshBuilder.CreatePlane(`banner${side}`, { width: 1.1, height: 3.3 }, scene);
    cloth.position.y = -1.65;
    cloth.material = mat;
    cloth.parent = pivot;
    const bar = MeshBuilder.CreateBox(`bannerBar${side}`, { width: 1.35, height: 0.09, depth: 0.09 }, scene);
    bar.material = pole;
    bar.parent = pivot;
    banners.push({ node: pivot, phase: side * 1.3 });
  }
  let t = 0;
  scene.onBeforeRenderObservable.add(() => {
    t += scene.getEngine().getDeltaTime() / 1000;
    for (const b of banners) b.node.rotation.x = 0.04 * Math.sin(t * 1.4 + b.phase) + 0.015 * Math.sin(t * 3.9 + b.phase);
  });
}

/** Bronze bells hung from the palisade crown on chains — a nod to Lohan's bell-hung waiting hall. */
function buildBells(scene: Scene, root: TransformNode): void {
  const bronze = setMaterial("bellMat", scene, undefined, BRONZE);
  bronze.emissiveColor = new Color3(0.06, 0.035, 0.015); // catch a little torchlight in the dark
  const chainMat = setMaterial("bellChainMat", scene, undefined, IRON);
  const bells: { node: TransformNode; phase: number }[] = [];
  [-0.9, 0, 0.9].forEach((off, k) => {
    // Between the torches, a little in front of the wall.
    const a = GATE_ANGLE + off + (off === 0 ? 0.42 : 0);
    const r = WALL_RADIUS - 0.7;
    const pivot = new TransformNode(`bellPivot${k}`, scene);
    pivot.position.set(Math.cos(a) * r, WALL_TALL + 0.1, Math.sin(a) * r);
    pivot.parent = root;
    const chain = MeshBuilder.CreateCylinder(`bellChain${k}`, { diameter: 0.05, height: 1.3, tessellation: 4 }, scene);
    chain.position.y = -0.65;
    chain.material = chainMat;
    chain.parent = pivot;
    const bell = MeshBuilder.CreateCylinder(
      `bell${k}`,
      { diameterTop: 0.22, diameterBottom: 0.62, height: 0.6, tessellation: 8 },
      scene,
    );
    bell.position.y = -1.55;
    bell.material = bronze;
    bell.parent = pivot;
    const lip = MeshBuilder.CreateTorus(`bellLip${k}`, { diameter: 0.62, thickness: 0.07, tessellation: 8 }, scene);
    lip.position.y = -1.85;
    lip.material = bronze;
    lip.parent = pivot;
    bells.push({ node: pivot, phase: k * 1.9 });
  });
  let t = 0;
  scene.onBeforeRenderObservable.add(() => {
    t += scene.getEngine().getDeltaTime() / 1000;
    for (const b of bells) {
      b.node.rotation.x = 0.05 * Math.sin(t * 0.9 + b.phase);
      b.node.rotation.z = 0.04 * Math.sin(t * 0.7 + b.phase * 1.3);
    }
  });
}
