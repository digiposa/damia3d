/**
 * Dev-only pose viewer (not shipped in the production build): drops a single bearer into an empty,
 * evenly-lit scene with a close orbit camera, so hand-attached weapons can be framed and tuned. It
 * builds the REAL {@link Player} (same model load + attachWeapon path as in game), so what you see
 * here is exactly what the arena renders — no divergent probe.
 *
 * Everything is driven by URL query params, so tuning is edit-URL-and-reload (no source rebuild):
 *   ?bearer=shana            which bearer to show (default shana)
 *   &rx=90&ry=90&rz=0        weaponRotation override (degrees)
 *   &scale=1.4&grip=0.5      weaponScale / weaponGrip overrides
 *   &bx=0&by=0&bz=0          backModelRotation override (degrees)
 *   &bscale=1.3              backModelScale override
 *   &box=0&boy=0&boz=-0.15   backModelOffset override (world units on the spine)
 *   &yaw=0                   spin the figure about Y (degrees)
 *   &alpha=1.6&beta=1.3&radius=3.2&ty=1.2   camera orbit (rad) / target height
 * Served at /pose.html in `npm run dev`.
 */
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";

import { bearerById, type Bearer } from "../data/bearers";
import { Player } from "../entities/Player";

const q = new URLSearchParams(location.search);
const num = (k: string, d: number): number => (q.has(k) ? Number(q.get(k)) : d);

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true }, true);
const scene = new Scene(engine);
scene.clearColor = new Color4(0.16, 0.17, 0.2, 1); // neutral grey so a painted weapon reads true

const camera = new ArcRotateCamera(
  "cam",
  num("alpha", Math.PI / 2 + 0.25),
  num("beta", Math.PI / 2 - 0.12),
  num("radius", 3.4),
  new Vector3(0, num("ty", 1.15), 0),
  scene,
);
camera.attachControl(canvas, true);
camera.minZ = 0.05;
camera.wheelPrecision = 40;

const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);
hemi.intensity = 0.9;
hemi.groundColor = new Color3(0.35, 0.35, 0.4);
const key = new DirectionalLight("key", new Vector3(-0.6, -1, -0.4), scene);
key.intensity = 1.1;

const bearerId = q.get("bearer") ?? "shana";
const base = bearerById(bearerId);
if (!base) throw new Error(`unknown bearer "${bearerId}"`);

// Apply weapon-tuning overrides from the URL onto a shallow bearer clone.
const bearer: Bearer = { ...base };
if (q.has("rx") || q.has("ry") || q.has("rz")) {
  bearer.weaponRotation = [num("rx", 0), num("ry", 0), num("rz", 0)];
}
if (q.has("scale")) bearer.weaponScale = num("scale", 1);
if (q.has("grip")) bearer.weaponGrip = num("grip", 0.5);
if (q.has("bx") || q.has("by") || q.has("bz")) {
  bearer.backModelRotation = [num("bx", 0), num("by", 0), num("bz", 0)];
}
if (q.has("bscale")) bearer.backModelScale = num("bscale", 1.3);
if (q.has("box") || q.has("boy") || q.has("boz")) {
  bearer.backModelOffset = [num("box", 0), num("boy", 0), num("boz", 0)];
}

const player = new Player(scene, bearer);
player.root.rotation.y = (num("yaw", 0) * Math.PI) / 180;

const hud = document.getElementById("hud")!;
void player.modelReady.then(() => {
  player.setCombat(true); // weapon in hand (not sheathed)
  const r = bearer.weaponRotation ?? [0, 0, 0];
  const br = bearer.backModelRotation ?? [0, 0, 0];
  const bo = bearer.backModelOffset ?? [0, 0, 0];
  hud.textContent =
    `bow rot[${r.join(",")}]° scale ${bearer.weaponScale ?? "def"} grip ${bearer.weaponGrip ?? "def"}` +
    (bearer.backModel ? ` · quiver rot[${br.join(",")}]° scale ${bearer.backModelScale ?? "def"} off[${bo.join(",")}]` : "");
  hud.dataset.ready = "1"; // Playwright waits on this before screenshotting
});

engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
