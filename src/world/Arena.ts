import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

/**
 * The Training arena — a torch-lit tournament colosseum in the spirit of the
 * Lohan Hero Competition: a circular sand floor ringed by a stone parapet with
 * banner-hung pillars and braziers, tiered spectator stands rising behind it,
 * and one monumental gate. Everything is procedural (no textures on disk).
 *
 * The iso camera never rotates, so decor on the camera side of the ring is
 * faded to translucency once and for all at build time — the player is never
 * hidden behind the near wall.
 */

/** Radius of the fighting floor combatants are clamped to (the wall sits just beyond). */
export const ARENA_RADIUS = 15;

const WALL_RADIUS = 16.2;
const WALL_SEGMENTS = 28;
const WALL_HEIGHT = 1.7;
const PILLARS = 8;
const GROUND_SIZE = 44;

/** The gate faces screen-top: directly away from the fixed iso camera. */
const GATE_ANGLE = (3 * Math.PI) / 4;

/** Ground direction from the arena toward the camera (alpha = -π/4 → +x, -z). */
const CAM_X = Math.SQRT1_2;
const CAM_Z = -Math.SQRT1_2;

// LoD palette: pale sand, cool night stone, and the iconic deep red + gold.
const SAND = "#a8875a";
const STONE = new Color3(0.4, 0.39, 0.44);
const STONE_LIGHT = new Color3(0.5, 0.48, 0.52);
const STAND_A = new Color3(0.28, 0.3, 0.38);
const STAND_B = new Color3(0.24, 0.26, 0.34);
const WOOD = new Color3(0.34, 0.24, 0.14);
const BANNER_RED = new Color3(0.52, 0.07, 0.09);
const GOLD = new Color3(0.82, 0.62, 0.2);

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

/** Build the whole arena into the scene. Meshes die with the scene (mode switch). */
export function createArena(scene: Scene): void {
  const root = new TransformNode("arena", scene);
  buildFloor(scene, root);
  buildWall(scene, root);
  buildStands(scene, root);
  buildGate(scene, root);
  buildProps(scene, root);

  // Decor must never swallow clicks — picking is for enemies and the ground ray.
  for (const m of root.getChildMeshes()) m.isPickable = false;
}

// --- Shared helpers ---------------------------------------------------------

function mat(name: string, scene: Scene, color: Color3, emissive?: Color3): StandardMaterial {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = color;
  m.specularColor = new Color3(0.05, 0.05, 0.06);
  if (emissive) m.emissiveColor = emissive;
  return m;
}

/** Smallest signed angle between two headings. */
function angDiff(a: number, b: number): number {
  let d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/** Rotation.y that lays a box/plane's width along the ring tangent at heading `a`. */
function tangentY(a: number): number {
  return -a - Math.PI / 2;
}

/**
 * Fade decor standing between the camera and the floor: the camera never
 * rotates, so anything on the camera side of the ring gets a fixed
 * translucency (classic iso "cutaway") instead of hiding the fight.
 */
function fadeNearCamera(mesh: Mesh, x: number, z: number): void {
  const len = Math.hypot(x, z) || 1;
  const toward = (x * CAM_X + z * CAM_Z) / len; // 1 = straight at the camera
  const t = Math.min(1, Math.max(0, (toward - 0.35) / 0.5));
  const s = t * t * (3 - 2 * t); // smoothstep
  if (s > 0) mesh.visibility = 1 - 0.78 * s;
}

// --- Floor -------------------------------------------------------------------

/** Sand fighting floor painted onto a canvas: speckle, scuffs, ring markings. */
function buildFloor(scene: Scene, root: TransformNode): void {
  const ground = MeshBuilder.CreateGround(
    "arenaFloor",
    { width: GROUND_SIZE, height: GROUND_SIZE },
    scene,
  );
  ground.parent = root;

  const SIZE = 1024;
  const tex = new DynamicTexture("arenaFloorTex", SIZE, scene, false);
  // Babylon's ICanvasRenderingContext type misses ellipse(); in the browser it IS a 2D context.
  const ctx = tex.getContext() as CanvasRenderingContext2D;
  const c = SIZE / 2;
  const px = (world: number): number => (world / (GROUND_SIZE / 2)) * c;

  // Cool dark flagstone apron under the stands, outside the ring.
  ctx.fillStyle = "#272931";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // The sand disc, out to the wall line.
  ctx.fillStyle = SAND;
  ctx.beginPath();
  ctx.arc(c, c, px(WALL_RADIUS), 0, Math.PI * 2);
  ctx.fill();

  // Grain: thousands of light/dark specks.
  for (let i = 0; i < 2600; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * px(WALL_RADIUS - 0.1);
    const s = 1 + Math.random() * 2;
    ctx.fillStyle = Math.random() < 0.5 ? "rgba(58,44,26,0.28)" : "rgba(236,214,168,0.3)";
    ctx.fillRect(c + Math.cos(a) * r - s / 2, c + Math.sin(a) * r - s / 2, s, s);
  }

  // Faint trampled scuffs where fighters have dragged their feet.
  for (let i = 0; i < 18; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * px(11);
    ctx.fillStyle = "rgba(50,38,22,0.05)";
    ctx.beginPath();
    ctx.ellipse(
      c + Math.cos(a) * r,
      c + Math.sin(a) * r,
      8 + Math.random() * 16,
      4 + Math.random() * 8,
      a,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Sand darkens toward the wall (torchlight falls off at the edge).
  const edge = ctx.createRadialGradient(c, c, px(4), c, c, px(WALL_RADIUS));
  edge.addColorStop(0, "rgba(0,0,0,0)");
  edge.addColorStop(1, "rgba(24,16,8,0.4)");
  ctx.fillStyle = edge;
  ctx.beginPath();
  ctx.arc(c, c, px(WALL_RADIUS), 0, Math.PI * 2);
  ctx.fill();

  // Combat ring + centre medallion, drawn in trampled dark earth.
  ctx.strokeStyle = "rgba(66,44,24,0.85)";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(c, c, px(12), 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(c, c, px(2.2), 0, Math.PI * 2);
  ctx.stroke();
  // Four diagonal tick marks on the big ring.
  ctx.lineWidth = 6;
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    ctx.beginPath();
    ctx.moveTo(c + Math.cos(a) * px(11.2), c + Math.sin(a) * px(11.2));
    ctx.lineTo(c + Math.cos(a) * px(12.8), c + Math.sin(a) * px(12.8));
    ctx.stroke();
  }

  tex.update(false);

  const m = new StandardMaterial("arenaFloorMat", scene);
  m.diffuseTexture = tex;
  m.specularColor = new Color3(0.04, 0.04, 0.04);
  ground.material = m;
}

// --- Parapet wall, pillars, braziers, banners ---------------------------------

function buildWall(scene: Scene, root: TransformNode): void {
  const stone = mat("arenaStone", scene, STONE);
  const cap = mat("arenaStoneCap", scene, STONE_LIGHT);
  const step = (Math.PI * 2) / WALL_SEGMENTS;
  const chord = 2 * Math.sin(step / 2) * WALL_RADIUS + 0.12;

  for (let i = 0; i < WALL_SEGMENTS; i++) {
    const a = (i + 0.5) * step;
    if (Math.abs(angDiff(a, GATE_ANGLE)) < 0.13) continue; // the gate opening
    const x = Math.cos(a) * WALL_RADIUS;
    const z = Math.sin(a) * WALL_RADIUS;

    const seg = MeshBuilder.CreateBox(
      `wall${i}`,
      { width: chord, height: WALL_HEIGHT, depth: 0.9 },
      scene,
    );
    seg.position.set(x, WALL_HEIGHT / 2, z);
    seg.rotation.y = tangentY(a);
    seg.material = stone;
    seg.parent = root;
    fadeNearCamera(seg, x, z);

    const cop = MeshBuilder.CreateBox(
      `wallCap${i}`,
      { width: chord + 0.14, height: 0.22, depth: 1.1 },
      scene,
    );
    cop.position.set(x, WALL_HEIGHT + 0.11, z);
    cop.rotation.y = tangentY(a);
    cop.material = cap;
    cop.parent = root;
    fadeNearCamera(cop, x, z);
  }

  buildPillars(scene, root);
}

/** Banner-hung pillars around the ring, each crowned by a lit brazier. */
function buildPillars(scene: Scene, root: TransformNode): void {
  const stone = mat("arenaPillar", scene, new Color3(0.46, 0.43, 0.47));
  const bowl = mat("arenaBrazier", scene, new Color3(0.16, 0.14, 0.13));
  const flames: { mesh: Mesh; phase: number }[] = [];
  const banners: { node: TransformNode; phase: number }[] = [];

  for (let j = 0; j < PILLARS; j++) {
    const a = (j * Math.PI * 2) / PILLARS;
    if (Math.abs(angDiff(a, GATE_ANGLE)) < 0.2) continue; // the gate replaces this pillar
    const x = Math.cos(a) * WALL_RADIUS;
    const z = Math.sin(a) * WALL_RADIUS;

    const shaft = MeshBuilder.CreateBox(`pillar${j}`, { width: 1.2, height: 3.0, depth: 1.2 }, scene);
    shaft.position.set(x, 1.5, z);
    shaft.rotation.y = tangentY(a);
    shaft.material = stone;
    shaft.parent = root;
    fadeNearCamera(shaft, x, z);

    const capstone = MeshBuilder.CreateBox(`pillarCap${j}`, { width: 1.5, height: 0.25, depth: 1.5 }, scene);
    capstone.position.set(x, 3.12, z);
    capstone.rotation.y = tangentY(a);
    capstone.material = stone;
    capstone.parent = root;
    fadeNearCamera(capstone, x, z);

    // Brazier bowl + its flame.
    const basin = MeshBuilder.CreateCylinder(
      `brazier${j}`,
      { diameterTop: 0.8, diameterBottom: 0.4, height: 0.35, tessellation: 10 },
      scene,
    );
    basin.position.set(x, 3.42, z);
    basin.material = bowl;
    basin.parent = root;
    fadeNearCamera(basin, x, z);
    flames.push({ mesh: buildFlame(scene, root, x, 3.6, z, `flame${j}`), phase: j * 2.399 });

    // A red banner draped down the pillar's inner face, gold-barred at the top.
    banners.push({ node: buildBanner(scene, root, a, WALL_RADIUS - 0.85, 3.0, 1.1, 2.3), phase: j * 1.13 });
  }

  animateArena(scene, flames, banners);
}

/** A two-part unlit flame (orange shell + yellow core), flicker-animated later. */
function buildFlame(scene: Scene, root: TransformNode, x: number, y: number, z: number, name: string): Mesh {
  const shell = new StandardMaterial(`${name}Mat`, scene);
  shell.emissiveColor = new Color3(1.0, 0.5, 0.12);
  shell.diffuseColor = Color3.Black();
  shell.disableLighting = true;
  const core = new StandardMaterial(`${name}CoreMat`, scene);
  core.emissiveColor = new Color3(1.0, 0.88, 0.45);
  core.diffuseColor = Color3.Black();
  core.disableLighting = true;

  const flame = MeshBuilder.CreateCylinder(
    name,
    { diameterTop: 0, diameterBottom: 0.46, height: 0.75, tessellation: 8 },
    scene,
  );
  flame.position.set(x, y + 0.3, z);
  flame.material = shell;
  flame.parent = root;
  fadeNearCamera(flame, x, z);

  const inner = MeshBuilder.CreateCylinder(
    `${name}Core`,
    { diameterTop: 0, diameterBottom: 0.24, height: 0.42, tessellation: 8 },
    scene,
  );
  inner.position.set(0, -0.1, 0);
  inner.material = core;
  inner.parent = flame;
  fadeNearCamera(inner, x, z); // visibility doesn't inherit — fade the core too
  return flame;
}

/**
 * A hanging red banner with a gold top bar and emblem, pivoted at its top edge
 * (so the sway animation swings it like cloth). Returns the pivot node.
 */
function buildBanner(
  scene: Scene,
  root: TransformNode,
  a: number,
  radius: number,
  topY: number,
  width: number,
  height: number,
): TransformNode {
  const x = Math.cos(a) * radius;
  const z = Math.sin(a) * radius;
  const pivot = new TransformNode(`bannerPivot${a.toFixed(2)}`, scene);
  pivot.position.set(x, topY, z);
  pivot.rotation.y = tangentY(a);
  pivot.parent = root;

  const red = mat(`bannerRed${a.toFixed(2)}`, scene, BANNER_RED, new Color3(0.16, 0.02, 0.02));
  const gold = mat(`bannerGold${a.toFixed(2)}`, scene, GOLD, new Color3(0.24, 0.17, 0.04));

  const cloth = MeshBuilder.CreatePlane(
    `banner${a.toFixed(2)}`,
    { width, height, sideOrientation: Mesh.DOUBLESIDE },
    scene,
  );
  cloth.position.y = -height / 2;
  cloth.material = red;
  cloth.parent = pivot;
  fadeNearCamera(cloth, x, z);

  const bar = MeshBuilder.CreateBox(`bannerBar${a.toFixed(2)}`, { width: width + 0.16, height: 0.1, depth: 0.1 }, scene);
  bar.position.y = 0;
  bar.material = gold;
  bar.parent = pivot;
  fadeNearCamera(bar, x, z);

  // Gold emblem disc at the banner's heart (the tournament crest).
  const emblem = MeshBuilder.CreateDisc(
    `bannerEmblem${a.toFixed(2)}`,
    { radius: Math.min(0.26, width * 0.24), tessellation: 24, sideOrientation: Mesh.DOUBLESIDE },
    scene,
  );
  emblem.position.set(0, -height * 0.42, 0.012);
  emblem.material = gold;
  emblem.parent = pivot;
  fadeNearCamera(emblem, x, z);

  return pivot;
}

/** One shared per-frame animation: brazier flames flicker, banners sway. */
function animateArena(
  scene: Scene,
  flames: { mesh: Mesh; phase: number }[],
  banners: { node: TransformNode; phase: number }[],
): void {
  let t = 0;
  scene.onBeforeRenderObservable.add(() => {
    t += scene.getEngine().getDeltaTime() / 1000;
    for (const f of flames) {
      f.mesh.scaling.y = 1 + 0.16 * Math.sin(t * 9 + f.phase) + 0.09 * Math.sin(t * 23 + f.phase * 1.7);
      const w = 1 + 0.1 * Math.sin(t * 13 + f.phase * 0.6);
      f.mesh.scaling.x = w;
      f.mesh.scaling.z = w;
    }
    for (const b of banners) {
      b.node.rotation.x = 0.05 * Math.sin(t * 1.6 + b.phase) + 0.02 * Math.sin(t * 4.3 + b.phase * 2.1);
    }
  });
}

// --- Spectator stands ----------------------------------------------------------

/** Three rising tiers of stone stands ringing the wall, pennants on the crown. */
function buildStands(scene: Scene, root: TransformNode): void {
  const shadeA = mat("standA", scene, STAND_A);
  const shadeB = mat("standB", scene, STAND_B);
  const tiers = [
    { radius: 17.9, top: 1.5 },
    { radius: 19.5, top: 2.6 },
    { radius: 21.0, top: 3.7 },
  ];
  const step = (Math.PI * 2) / WALL_SEGMENTS;

  tiers.forEach((tier, ti) => {
    const chord = 2 * Math.sin(step / 2) * tier.radius + 0.14;
    for (let i = 0; i < WALL_SEGMENTS; i++) {
      const a = (i + 0.5) * step;
      // The gate tunnel cuts through the two lower tiers.
      if (ti < 2 && Math.abs(angDiff(a, GATE_ANGLE)) < 0.13) continue;
      const x = Math.cos(a) * tier.radius;
      const z = Math.sin(a) * tier.radius;
      const seg = MeshBuilder.CreateBox(
        `stand${ti}_${i}`,
        { width: chord, height: tier.top, depth: 1.7 },
        scene,
      );
      seg.position.set(x, tier.top / 2, z);
      seg.rotation.y = tangentY(a);
      seg.material = (i + ti) % 2 === 0 ? shadeA : shadeB;
      seg.parent = root;
      fadeNearCamera(seg, x, z);
    }
  });

  // Pennant poles on the top tier's crown.
  const pole = mat("pennantPole", scene, new Color3(0.3, 0.28, 0.3));
  const cloth = mat("pennantRed", scene, BANNER_RED, new Color3(0.14, 0.02, 0.02));
  for (let j = 0; j < PILLARS; j++) {
    const a = (j * Math.PI * 2) / PILLARS + Math.PI / PILLARS;
    const x = Math.cos(a) * 21.0;
    const z = Math.sin(a) * 21.0;
    const mast = MeshBuilder.CreateCylinder(`pennantPole${j}`, { diameter: 0.08, height: 1.7, tessellation: 6 }, scene);
    mast.position.set(x, 3.7 + 0.85, z);
    mast.material = pole;
    mast.parent = root;
    fadeNearCamera(mast, x, z);
    const flag = MeshBuilder.CreateDisc(
      `pennant${j}`,
      { radius: 0.3, tessellation: 3, sideOrientation: Mesh.DOUBLESIDE },
      scene,
    );
    flag.position.set(x, 3.7 + 1.5, z);
    flag.rotation.y = tangentY(a);
    flag.rotation.z = -Math.PI / 2; // point the pennant sideways off the mast
    flag.material = cloth;
    flag.parent = root;
    fadeNearCamera(flag, x, z);
  }
}

// --- The gate -------------------------------------------------------------------

/** Monumental gate at screen-top: posts, lintel, hanging banner, dark tunnel. */
function buildGate(scene: Scene, root: TransformNode): void {
  const stone = mat("gateStone", scene, STONE_LIGHT);
  const dark = mat("gateTunnel", scene, new Color3(0.02, 0.02, 0.03), new Color3(0.015, 0.015, 0.025));

  for (const side of [-1, 1]) {
    const a = GATE_ANGLE + side * 0.145;
    const x = Math.cos(a) * WALL_RADIUS;
    const z = Math.sin(a) * WALL_RADIUS;
    const post = MeshBuilder.CreateBox(`gatePost${side}`, { width: 1.1, height: 4.4, depth: 1.3 }, scene);
    post.position.set(x, 2.2, z);
    post.rotation.y = tangentY(a);
    post.material = stone;
    post.parent = root;
    // A brazier flame crowns each gate post.
    buildFlame(scene, root, x, 4.55, z, `gateFlame${side}`);
  }

  const gx = Math.cos(GATE_ANGLE) * WALL_RADIUS;
  const gz = Math.sin(GATE_ANGLE) * WALL_RADIUS;
  const lintel = MeshBuilder.CreateBox("gateLintel", { width: 5.6, height: 0.8, depth: 1.4 }, scene);
  lintel.position.set(gx, 4.65, gz);
  lintel.rotation.y = tangentY(GATE_ANGLE);
  lintel.material = stone;
  lintel.parent = root;

  // The dark tunnel mouth behind the opening.
  const tunnel = MeshBuilder.CreateBox("gateTunnelMouth", { width: 3.8, height: 4.2, depth: 0.3 }, scene);
  tunnel.position.set(Math.cos(GATE_ANGLE) * (WALL_RADIUS + 0.8), 2.1, Math.sin(GATE_ANGLE) * (WALL_RADIUS + 0.8));
  tunnel.rotation.y = tangentY(GATE_ANGLE);
  tunnel.material = dark;
  tunnel.parent = root;

  // The grand tournament banner hanging from the lintel.
  buildBanner(scene, root, GATE_ANGLE, WALL_RADIUS - 0.9, 4.25, 1.7, 3.0);
}

// --- Props inside the ring --------------------------------------------------------

/** Training gear along the far wall: weapon racks and water barrels. */
function buildProps(scene: Scene, root: TransformNode): void {
  const wood = mat("propWood", scene, WOOD);
  const steel = mat("propSteel", scene, new Color3(0.5, 0.52, 0.58));
  const hoop = mat("propHoop", scene, new Color3(0.12, 0.11, 0.1));

  for (const side of [-1, 1]) {
    const a = GATE_ANGLE + side * 0.85;
    const x = Math.cos(a) * 15.3;
    const z = Math.sin(a) * 15.3;

    // Weapon rack: two posts, a crossbar, three practice swords leaning on it.
    const rack = new TransformNode(`rack${side}`, scene);
    rack.position.set(x, 0, z);
    rack.rotation.y = tangentY(a);
    rack.parent = root;
    for (const p of [-0.7, 0.7]) {
      const post = MeshBuilder.CreateBox(`rackPost${side}${p}`, { width: 0.12, height: 1.35, depth: 0.12 }, scene);
      post.position.set(p, 0.675, 0);
      post.material = wood;
      post.parent = rack;
    }
    const bar = MeshBuilder.CreateBox(`rackBar${side}`, { width: 1.65, height: 0.1, depth: 0.1 }, scene);
    bar.position.set(0, 1.3, 0);
    bar.material = wood;
    bar.parent = rack;
    for (let k = 0; k < 3; k++) {
      const sword = MeshBuilder.CreateBox(`rackSword${side}${k}`, { width: 0.07, height: 1.5, depth: 0.03 }, scene);
      sword.position.set(-0.45 + k * 0.45, 0.72, 0.16);
      sword.rotation.x = -0.25;
      sword.material = steel;
      sword.parent = rack;
    }

    // A water barrel beside each rack.
    const bx = Math.cos(a + side * 0.16) * 15.3;
    const bz = Math.sin(a + side * 0.16) * 15.3;
    const barrel = MeshBuilder.CreateCylinder(`barrel${side}`, { diameter: 0.85, height: 1.0, tessellation: 12 }, scene);
    barrel.position.set(bx, 0.5, bz);
    barrel.material = wood;
    barrel.parent = root;
    for (const hy of [0.25, 0.8]) {
      const ring = MeshBuilder.CreateCylinder(`barrelHoop${side}${hy}`, { diameter: 0.88, height: 0.06, tessellation: 12 }, scene);
      ring.position.set(bx, hy, bz);
      ring.material = hoop;
      ring.parent = root;
    }
  }
}
