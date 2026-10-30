import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

import { mulberry32 } from "./paint";

/**
 * What makes the wood feel alive rather than painted: things that MOVE on their own, independent
 * of the player — butterflies over the grass, leaves letting go of the canopy, and now and then a
 * few birds crossing high overhead. All of it follows the camera, so it costs the same anywhere on the map.
 *
 * `walkable(x, z)` says where open ground is (butterflies stay over it, not inside the trees).
 */
export function buildForestLife(scene: Scene, walkable: (x: number, z: number) => boolean): void {
  const rand = mulberry32(0x11fe);
  const focus = (): Vector3 => {
    const cam = scene.activeCamera as { target?: Vector3 } | null;
    return cam?.target ?? Vector3.Zero();
  };
  const dt = (): number => Math.min(0.05, scene.getEngine().getDeltaTime() / 1000);

  buildFallingLeaves(scene, focus);
  buildButterflies(scene, focus, walkable, rand, dt);
  buildBirds(scene, focus, rand, dt);
}

/** Canvas texture helper (smooth sampling: these are soft, not pixel-art). */
function softTexture(name: string, scene: Scene, w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void): DynamicTexture {
  const tex = new DynamicTexture(name, { width: w, height: h }, scene, true);
  const ctx = tex.getContext() as CanvasRenderingContext2D;
  ctx.clearRect(0, 0, w, h);
  paint(ctx);
  tex.hasAlpha = true;
  tex.update();
  return tex;
}

/**
 * The canopy's shadow, moving: a big soft-blotched layer laid just over the ground around the camera,
 * multiplied onto it, drifting back and forth as gusts sway the crowns. Two layers at different
 * scales and speeds, so the pattern never visibly repeats.
 */
/** Leaves letting go of the canopy: tumbling slowly down, drifting with the breeze. */
function buildFallingLeaves(scene: Scene, focus: () => Vector3): void {
  const tex = softTexture("forestFallingLeafTex", scene, 32, 32, (ctx) => {
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.beginPath();
    ctx.ellipse(16, 16, 6, 13, 0.5, 0, Math.PI * 2);
    ctx.fill();
  });
  const ps = new ParticleSystem("forestFallingLeaves", 70, scene);
  ps.particleTexture = tex;
  const emitter = Vector3.Zero();
  ps.emitter = emitter;
  ps.minEmitBox = new Vector3(-14, 6, -14);
  ps.maxEmitBox = new Vector3(14, 9, 14);
  ps.blendMode = ParticleSystem.BLENDMODE_STANDARD;
  ps.color1 = new Color4(0.62, 0.62, 0.22, 1);
  ps.color2 = new Color4(0.8, 0.5, 0.18, 1);
  ps.colorDead = new Color4(0.6, 0.45, 0.2, 0);
  ps.minSize = 0.12;
  ps.maxSize = 0.22;
  ps.minLifeTime = 7;
  ps.maxLifeTime = 11;
  ps.emitRate = 4;
  ps.gravity = new Vector3(0, -0.9, 0);
  ps.direction1 = new Vector3(-0.4, -0.2, -0.2);
  ps.direction2 = new Vector3(0.5, 0, 0.4);
  ps.minEmitPower = 0.3;
  ps.maxEmitPower = 0.6;
  ps.minAngularSpeed = -2.5;
  ps.maxAngularSpeed = 2.5;
  ps.updateSpeed = 0.015;
  // Air drag keeps the fall slow and floaty (gravity alone would drop them like stones).
  ps.addLimitVelocityGradient(0, 0.5);
  ps.limitVelocityDamping = 0.9;
  ps.preWarmCycles = 300;
  ps.start();
  let t = 0;
  scene.onBeforeRenderObservable.add(() => {
    t += scene.getEngine().getDeltaTime() / 1000;
    const f = focus();
    emitter.set(f.x, 0, f.z);
    // The breeze shifts: leaves drift one way, then the other.
    ps.direction1.x = -0.4 + Math.sin(t * 0.3) * 0.5;
    ps.direction2.x = 0.5 + Math.sin(t * 0.3) * 0.5;
  });
}

interface Butterfly {
  node: TransformNode;
  wings: [Mesh, Mesh];
  target: Vector3;
  vel: Vector3;
  flap: number;
  rest: number;
}

/** Butterflies flitting over the open grass: erratic little flights, short rests on the ground. */
function buildButterflies(
  scene: Scene,
  focus: () => Vector3,
  walkable: (x: number, z: number) => boolean,
  rand: () => number,
  dt: () => number,
): void {
  const colours: [number, number, number][] = [
    [0.98, 0.95, 0.85], // cabbage white
    [1.0, 0.82, 0.28], // brimstone yellow
    [0.95, 0.55, 0.2], // orange tip
    [0.6, 0.7, 1.0], // a blue
  ];
  const wingTex = softTexture("forestWingTex", scene, 32, 32, (ctx) => {
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.beginPath();
    ctx.ellipse(10, 12, 9, 10, 0.3, 0, Math.PI * 2); // fore wing
    ctx.ellipse(10, 24, 6, 7, -0.2, 0, Math.PI * 2); // hind wing
    ctx.fill();
    ctx.fillStyle = "rgba(40,30,20,0.9)";
    ctx.beginPath();
    ctx.arc(14, 9, 2, 0, Math.PI * 2); // a wing spot
    ctx.fill();
  });
  const mats = colours.map((c, i) => {
    const m = new StandardMaterial(`forestButterflyMat${i}`, scene);
    m.diffuseTexture = wingTex;
    m.useAlphaFromDiffuseTexture = true;
    m.diffuseColor = new Color3(...c);
    m.emissiveColor = new Color3(c[0] * 0.35, c[1] * 0.35, c[2] * 0.35);
    m.specularColor = Color3.Black();
    m.backFaceCulling = false;
    return m;
  });
  const pickSpot = (around: Vector3): Vector3 => {
    for (let k = 0; k < 12; k++) {
      const a = rand() * Math.PI * 2;
      const r = 2 + rand() * 9;
      const x = around.x + Math.cos(a) * r;
      const z = around.z + Math.sin(a) * r;
      if (walkable(x, z)) return new Vector3(x, 0.4 + rand() * 1.4, z);
    }
    return new Vector3(around.x, 1, around.z);
  };
  const flies: Butterfly[] = [];
  for (let i = 0; i < 9; i++) {
    const node = new TransformNode(`forestButterfly${i}`, scene);
    const mat = mats[i % mats.length];
    const wing = (side: number): Mesh => {
      const pivot = MeshBuilder.CreatePlane(`forestButterflyWing${i}_${side}`, { width: 0.16, height: 0.16 }, scene);
      pivot.material = mat;
      pivot.isPickable = false;
      pivot.parent = node;
      // Hinged at the body: shift the plane so its inner edge sits on the axis.
      pivot.setPivotPoint(new Vector3(-side * 0.08, 0, 0));
      pivot.position.x = side * 0.08;
      pivot.rotation.x = Math.PI / 2; // lying flat, top up
      if (side < 0) pivot.scaling.x = -1;
      return pivot;
    };
    const f: Butterfly = { node, wings: [wing(-1), wing(1)], target: Vector3.Zero(), vel: Vector3.Zero(), flap: rand() * 6, rest: 0 };
    node.position.copyFrom(pickSpot(focus()));
    f.target = pickSpot(node.position);
    flies.push(f);
  }
  scene.onBeforeRenderObservable.add(() => {
    const d = dt();
    const f0 = focus();
    for (const b of flies) {
      const p = b.node.position;
      // Too far from the view: reappear somewhere near it.
      if (Math.hypot(p.x - f0.x, p.z - f0.z) > 16) {
        p.copyFrom(pickSpot(f0));
        b.target = pickSpot(p);
      }
      if (b.rest > 0) {
        // Resting on the grass, wings slowly opening and closing.
        b.rest -= d;
        b.flap += d * 2;
        const open = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(b.flap));
        b.wings[0].rotation.z = -open;
        b.wings[1].rotation.z = open;
        if (b.rest <= 0) b.target = pickSpot(p);
        continue;
      }
      // Erratic flight: steer toward the target with a wobble, flapping fast.
      const to = b.target.subtract(p);
      const dist = to.length();
      if (dist < 0.3) {
        if (rand() < 0.35) {
          b.target.y = 0.08;
          b.rest = 0; // land first (next frames), then rest
        } else b.target = pickSpot(p);
      }
      if (b.target.y < 0.1 && Math.abs(p.y - 0.08) < 0.05 && dist < 0.4) b.rest = 2 + rand() * 4;
      const wob = new Vector3(Math.sin(b.flap * 0.37) * 0.8, Math.sin(b.flap * 0.53) * 0.9, Math.cos(b.flap * 0.29) * 0.8);
      const steer = to.normalize().scale(1.4).add(wob);
      b.vel = Vector3.Lerp(b.vel, steer, Math.min(1, d * 3));
      p.addInPlace(b.vel.scale(d));
      if (p.y < 0.08) p.y = 0.08;
      b.node.rotation.y = Math.atan2(b.vel.x, b.vel.z);
      b.flap += d * 22;
      const a = 0.9 * Math.sin(b.flap);
      b.wings[0].rotation.z = -a;
      b.wings[1].rotation.z = a;
    }
  });
}

/** Now and then a few birds cross high over the wood, flapping and gliding. */
function buildBirds(scene: Scene, focus: () => Vector3, rand: () => number, dt: () => number): void {
  const mat = new StandardMaterial("forestBirdMat", scene);
  mat.diffuseColor = new Color3(0.12, 0.1, 0.1);
  mat.specularColor = Color3.Black();
  mat.backFaceCulling = false;
  const flock: { node: TransformNode; wings: Mesh[]; offset: Vector3; flap: number }[] = [];
  for (let i = 0; i < 5; i++) {
    const node = new TransformNode(`forestBird${i}`, scene);
    const body = MeshBuilder.CreateBox(`forestBirdBody${i}`, { width: 0.08, height: 0.06, depth: 0.32 }, scene);
    body.material = mat;
    body.parent = node;
    body.isPickable = false;
    const wings = [-1, 1].map((side) => {
      const w = MeshBuilder.CreatePlane(`forestBirdWing${i}_${side}`, { width: 0.42, height: 0.16 }, scene);
      w.material = mat;
      w.isPickable = false;
      w.parent = node;
      w.setPivotPoint(new Vector3(-side * 0.21, 0, 0));
      w.position.x = side * 0.21;
      w.rotation.x = Math.PI / 2;
      return w;
    });
    // A loose V.
    const offset = new Vector3((i % 2 === 0 ? 1 : -1) * Math.ceil(i / 2) * 0.9, (rand() - 0.5) * 0.4, -Math.ceil(i / 2) * 0.9);
    flock.push({ node, wings, offset, flap: rand() * 6 });
    node.setEnabled(false);
  }
  let wait = 6 + rand() * 8;
  let flying = 0;
  const lead = Vector3.Zero();
  const dir = Vector3.Zero();
  scene.onBeforeRenderObservable.add(() => {
    const d = dt();
    if (flying <= 0) {
      wait -= d;
      if (wait > 0) return;
      // Launch a pass: across the view from one side to the other, high above the trees.
      const f = focus();
      const a = rand() * Math.PI * 2;
      dir.set(Math.cos(a), 0, Math.sin(a));
      lead.set(f.x - dir.x * 26, 9 + rand() * 3, f.z - dir.z * 26);
      flying = 52 / 7;
      flock.forEach((b) => b.node.setEnabled(true));
      wait = 18 + rand() * 20;
    }
    flying -= d;
    lead.addInPlace(dir.scale(7 * d));
    const yaw = Math.atan2(dir.x, dir.z);
    for (const b of flock) {
      // Rotate the V offset into the flight direction.
      const ox = b.offset.x * Math.cos(yaw) + b.offset.z * Math.sin(yaw);
      const oz = -b.offset.x * Math.sin(yaw) + b.offset.z * Math.cos(yaw);
      b.node.position.set(lead.x + ox, lead.y + b.offset.y, lead.z + oz);
      b.node.rotation.y = yaw;
      b.flap += d;
      // Flap a few beats, then glide a moment.
      const beat = (b.flap % 2.2) < 1.3 ? Math.sin(b.flap * 14) * 0.7 : 0.1;
      b.wings[0].rotation.z = -beat;
      b.wings[1].rotation.z = beat;
    }
    if (flying <= 0) flock.forEach((b) => b.node.setEnabled(false));
  });
}
