import { Scene } from "@babylonjs/core/scene";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { softDotTexture } from "./atmosphere";
import type { Element } from "../combat/element";

/**
 * Procedural elemental spell VFX (attack items today; any magic later). Pure Babylon particle
 * systems — no asset files. Each element gets its OWN motion & shape, not a recolour of one plume:
 *   - Fire   — rising, flickering flames + falling embers + a lick of smoke.
 *   - Water  — icy shards bursting out and falling (velocity-stretched, crystalline).
 *   - Thunder— violet-white bolts cracking DOWN from above (stretched, ultra-short life) + a flash.
 *   - Wind   — a green vortex ring spun outward, translucent, spinning.
 *   - Earth  — chunky brown debris thrown up that falls back under strong gravity.
 *   - Light  — a soft radiant gold bloom rising.
 *   - Darkness — a swirling violet haze.
 *   - Non-Elemental — a neutral white shockwave.
 *
 * Every system is persistent and idle (emitRate 0); {@link burst} positions it and fires a one-shot
 * `manualEmitCount` (the spark/dust pattern in {@link import("./atmosphere").Atmosphere}). `power`
 * (~0.3 small charge flare … 1 normal … ~1.9 full 268% mash) scales count and reach.
 */
export class SpellFx {
  private readonly scene: Scene;
  private readonly dot: DynamicTexture;
  private readonly streak: DynamicTexture;
  private readonly shard: DynamicTexture;
  private readonly systems: Record<FxKind, Burst[]>;
  private readonly disposables: { dispose(): void }[] = [];

  constructor(scene: Scene) {
    this.scene = scene;
    this.dot = softDotTexture(scene);
    this.streak = streakTexture(scene);
    this.shard = shardTexture(scene);
    this.disposables.push(this.dot, this.streak, this.shard);
    this.systems = {
      fire: this.buildFire(),
      ice: [this.buildIce()],
      thunder: this.buildThunder(),
      wind: [this.buildWind()],
      earth: [this.buildEarth()],
      light: [this.buildLight()],
      dark: [this.buildDark()],
      neutral: [this.buildNeutral()],
    };
  }

  /** Fire the element's effect at a world position (feet of the target). */
  burst(element: Element, position: Vector3, power = 1): void {
    const p = Math.max(0.15, power);
    for (const b of this.systems[ELEMENT_KIND[element]]) {
      b.ps.emitter = position.add(new Vector3(0, b.yOffset, 0));
      b.ps.manualEmitCount = Math.round(b.count * p);
    }
  }

  dispose(): void {
    for (const list of Object.values(this.systems)) for (const b of list) b.ps.dispose();
    for (const d of this.disposables) d.dispose();
  }

  // --- per-element builders -------------------------------------------------

  /** Shared scaffold: a persistent, idle burst system paired with its per-burst tuning. */
  private make(name: string, capacity: number, tex: DynamicTexture, yOffset: number, count: number): Burst {
    const ps = new ParticleSystem(name, capacity, this.scene);
    ps.particleTexture = tex;
    ps.emitRate = 0;
    ps.updateSpeed = 0.02;
    return { ps, yOffset, count };
  }

  private buildFire(): Burst[] {
    // Flames: an upward cone that rises (positive gravity) and tapers as it climbs.
    const flameB = this.make("fxFireFlame", 340, this.dot, 0.4, 62);
    const flame = flameB.ps;
    flame.createConeEmitter(0.42, Math.PI / 3.2);
    flame.color1 = new Color4(1.0, 0.86, 0.34, 1);
    flame.color2 = new Color4(1.0, 0.36, 0.1, 1);
    flame.colorDead = new Color4(0.5, 0.06, 0.0, 0);
    flame.minSize = 0.28;
    flame.maxSize = 0.85;
    flame.addSizeGradient(0, 1.0); // start full…
    flame.addSizeGradient(1, 0.12); // …taper to a tip as it rises
    flame.minLifeTime = 0.3;
    flame.maxLifeTime = 0.68;
    flame.blendMode = ParticleSystem.BLENDMODE_ADD;
    flame.gravity = new Vector3(0, 6.5, 0);
    flame.minEmitPower = 2.4;
    flame.maxEmitPower = 6;
    flame.start();

    // Embers: tiny bright sparks flung out that fall back down.
    const emberB = this.make("fxFireEmber", 220, this.dot, 0.6, 40);
    const ember = emberB.ps;
    ember.createSphereEmitter(0.35);
    ember.color1 = new Color4(1.0, 0.95, 0.6, 1);
    ember.color2 = new Color4(1.0, 0.55, 0.15, 1);
    ember.colorDead = new Color4(0.7, 0.2, 0.0, 0);
    ember.minSize = 0.05;
    ember.maxSize = 0.16;
    ember.minLifeTime = 0.35;
    ember.maxLifeTime = 0.75;
    ember.blendMode = ParticleSystem.BLENDMODE_ADD;
    ember.gravity = new Vector3(0, -7, 0);
    ember.minEmitPower = 3;
    ember.maxEmitPower = 7;
    ember.start();

    // Smoke: a dark, growing, standard-blend puff that lifts slowly above the flames.
    const smokeB = this.make("fxFireSmoke", 120, this.dot, 0.9, 16);
    const smoke = smokeB.ps;
    smoke.createConeEmitter(0.5, Math.PI / 4);
    smoke.color1 = new Color4(0.22, 0.18, 0.16, 0.34);
    smoke.color2 = new Color4(0.12, 0.1, 0.09, 0.28);
    smoke.colorDead = new Color4(0.1, 0.09, 0.08, 0);
    smoke.minSize = 0.4;
    smoke.maxSize = 0.9;
    smoke.addSizeGradient(0, 0.4); // grows as it rises and dissipates
    smoke.addSizeGradient(1, 1.5);
    smoke.minLifeTime = 0.7;
    smoke.maxLifeTime = 1.3;
    smoke.blendMode = ParticleSystem.BLENDMODE_STANDARD;
    smoke.gravity = new Vector3(0, 1.4, 0);
    smoke.minEmitPower = 0.6;
    smoke.maxEmitPower = 1.6;
    smoke.start();

    return [flameB, emberB, smokeB];
  }

  private buildIce(): Burst {
    // Crystalline shards burst outward and fall; velocity-stretched so they read as sharp splinters.
    const b = this.make("fxIce", 300, this.shard, 0.9, 58);
    const ps = b.ps;
    ps.createSphereEmitter(0.4);
    ps.billboardMode = ParticleSystem.BILLBOARDMODE_STRETCHED;
    ps.color1 = new Color4(0.82, 0.95, 1.0, 1);
    ps.color2 = new Color4(0.32, 0.62, 0.96, 1);
    ps.colorDead = new Color4(0.2, 0.4, 0.85, 0);
    ps.minSize = 0.12;
    ps.maxSize = 0.5;
    ps.minLifeTime = 0.3;
    ps.maxLifeTime = 0.62;
    ps.blendMode = ParticleSystem.BLENDMODE_ADD;
    ps.gravity = new Vector3(0, -5, 0);
    ps.minEmitPower = 3.5;
    ps.maxEmitPower = 8;
    ps.start();
    return b;
  }

  private buildThunder(): Burst[] {
    // Bolts crack straight DOWN from above the target — stretched streaks with a jittered spread and
    // an ultra-short life, so they flicker like lightning rather than drift like sparks.
    const boltB = this.make("fxThunderBolt", 220, this.streak, 0.2, 46);
    const bolt = boltB.ps;
    bolt.minEmitBox = new Vector3(-0.5, 3.4, -0.5); // emit from a slab well above the target…
    bolt.maxEmitBox = new Vector3(0.5, 3.8, 0.5);
    bolt.direction1 = new Vector3(-0.5, -1, -0.5); // …striking down with a crackling spread
    bolt.direction2 = new Vector3(0.5, -1, 0.5);
    bolt.billboardMode = ParticleSystem.BILLBOARDMODE_STRETCHED;
    bolt.color1 = new Color4(0.9, 0.94, 1.0, 1);
    bolt.color2 = new Color4(0.62, 0.55, 1.0, 1);
    bolt.colorDead = new Color4(0.4, 0.4, 1.0, 0);
    bolt.minSize = 0.16;
    bolt.maxSize = 0.55;
    bolt.minLifeTime = 0.08;
    bolt.maxLifeTime = 0.2;
    bolt.blendMode = ParticleSystem.BLENDMODE_ADD;
    bolt.gravity = new Vector3(0, 0, 0);
    bolt.minEmitPower = 14;
    bolt.maxEmitPower = 24;
    bolt.start();

    // Impact flash: a couple of huge, instant soft blooms where the bolt lands (the thunderclap).
    const flashB = this.make("fxThunderFlash", 24, this.dot, 1.1, 6);
    const flash = flashB.ps;
    flash.createSphereEmitter(0.05);
    flash.color1 = new Color4(0.95, 0.97, 1.0, 1);
    flash.color2 = new Color4(0.7, 0.72, 1.0, 1);
    flash.colorDead = new Color4(0.6, 0.6, 1.0, 0);
    flash.minSize = 2.4;
    flash.maxSize = 4;
    flash.minLifeTime = 0.05;
    flash.maxLifeTime = 0.12;
    flash.blendMode = ParticleSystem.BLENDMODE_ADD;
    flash.minEmitPower = 0;
    flash.maxEmitPower = 0.5;
    flash.start();

    return [boltB, flashB];
  }

  private buildWind(): Burst {
    // A vortex ring: a flat cylinder emitter spun outward, translucent and rotating — a green gust.
    const b = this.make("fxWind", 240, this.dot, 1.0, 50);
    const ps = b.ps;
    ps.createCylinderEmitter(0.9, 0.3, 1, 1);
    ps.color1 = new Color4(0.62, 0.96, 0.62, 0.5);
    ps.color2 = new Color4(0.32, 0.82, 0.45, 0.42);
    ps.colorDead = new Color4(0.3, 0.7, 0.4, 0);
    ps.minSize = 0.2;
    ps.maxSize = 0.62;
    ps.addSizeGradient(0, 0.35);
    ps.addSizeGradient(1, 1.2);
    ps.minLifeTime = 0.5;
    ps.maxLifeTime = 1.0;
    ps.blendMode = ParticleSystem.BLENDMODE_STANDARD;
    ps.gravity = new Vector3(0, 0.6, 0);
    ps.minEmitPower = 2;
    ps.maxEmitPower = 5;
    ps.minAngularSpeed = -6; // spin the sprites → swirling motion
    ps.maxAngularSpeed = 6;
    ps.start();
    return b;
  }

  private buildEarth(): Burst {
    // Chunky debris thrown up in a tight cone and dragged back by strong gravity — rocks, not glow.
    const b = this.make("fxEarth", 240, this.shard, 0.2, 52);
    const ps = b.ps;
    ps.createConeEmitter(0.4, Math.PI / 5);
    ps.color1 = new Color4(0.58, 0.42, 0.26, 1);
    ps.color2 = new Color4(0.36, 0.26, 0.15, 1);
    ps.colorDead = new Color4(0.3, 0.22, 0.13, 0);
    ps.minSize = 0.18;
    ps.maxSize = 0.55;
    ps.minLifeTime = 0.4;
    ps.maxLifeTime = 0.9;
    ps.blendMode = ParticleSystem.BLENDMODE_STANDARD;
    ps.gravity = new Vector3(0, -12, 0);
    ps.minEmitPower = 4;
    ps.maxEmitPower = 9;
    ps.minAngularSpeed = -8; // tumbling rocks
    ps.maxAngularSpeed = 8;
    ps.start();
    return b;
  }

  private buildLight(): Burst {
    // A soft radiant bloom that lifts and grows — holy gold-white.
    const b = this.make("fxLight", 260, this.dot, 0.8, 56);
    const ps = b.ps;
    ps.createConeEmitter(0.4, Math.PI / 3);
    ps.color1 = new Color4(1.0, 0.98, 0.85, 1);
    ps.color2 = new Color4(1.0, 0.86, 0.42, 1);
    ps.colorDead = new Color4(1.0, 0.9, 0.6, 0);
    ps.minSize = 0.3;
    ps.maxSize = 0.9;
    ps.addSizeGradient(0, 0.5);
    ps.addSizeGradient(1, 1.3);
    ps.minLifeTime = 0.4;
    ps.maxLifeTime = 0.9;
    ps.blendMode = ParticleSystem.BLENDMODE_ADD;
    ps.gravity = new Vector3(0, 3, 0);
    ps.minEmitPower = 2;
    ps.maxEmitPower = 5;
    ps.start();
    return b;
  }

  private buildDark(): Burst {
    // A swirling violet haze that clings low and rotates — additive but dim, so it reads as gloom.
    const b = this.make("fxDark", 240, this.dot, 0.9, 50);
    const ps = b.ps;
    ps.createSphereEmitter(0.45);
    ps.color1 = new Color4(0.6, 0.3, 0.85, 0.9);
    ps.color2 = new Color4(0.32, 0.12, 0.5, 0.8);
    ps.colorDead = new Color4(0.18, 0.05, 0.3, 0);
    ps.minSize = 0.3;
    ps.maxSize = 0.85;
    ps.minLifeTime = 0.5;
    ps.maxLifeTime = 1.0;
    ps.blendMode = ParticleSystem.BLENDMODE_ADD;
    ps.gravity = new Vector3(0, -1.2, 0);
    ps.minEmitPower = 1.5;
    ps.maxEmitPower = 4;
    ps.minAngularSpeed = -5;
    ps.maxAngularSpeed = 5;
    ps.start();
    return b;
  }

  private buildNeutral(): Burst {
    // A quick white shockwave for Non-Elemental (Detonate Rock / Psyche Bomb).
    const b = this.make("fxNeutral", 220, this.dot, 0.9, 46);
    const ps = b.ps;
    ps.createSphereEmitter(0.4);
    ps.color1 = new Color4(0.95, 0.95, 1.0, 1);
    ps.color2 = new Color4(0.7, 0.72, 0.85, 1);
    ps.colorDead = new Color4(0.6, 0.6, 0.7, 0);
    ps.minSize = 0.2;
    ps.maxSize = 0.6;
    ps.minLifeTime = 0.25;
    ps.maxLifeTime = 0.55;
    ps.blendMode = ParticleSystem.BLENDMODE_ADD;
    ps.gravity = new Vector3(0, 0.5, 0);
    ps.minEmitPower = 4;
    ps.maxEmitPower = 8;
    ps.start();
    return b;
  }
}

/** A persistent particle system paired with its per-burst placement/intensity tuning. */
interface Burst {
  ps: ParticleSystem;
  /** Height above the passed (feet) position to place the emitter. */
  yOffset: number;
  /** manualEmitCount at power 1 (scaled by the burst's power). */
  count: number;
}

/** Which visual family an element uses. */
type FxKind = "fire" | "ice" | "thunder" | "wind" | "earth" | "light" | "dark" | "neutral";

const ELEMENT_KIND: Record<Element, FxKind> = {
  Fire: "fire",
  Water: "ice", // LoD "Water" attack items are ice (Frozen Jet, Fatal Blizzard, Spear Frost)
  Thunder: "thunder",
  Wind: "wind",
  Earth: "earth",
  Light: "light",
  Darkness: "dark",
  "Non-Elemental": "neutral",
};

/** A tall, soft vertical streak — for lightning bolts (with a stretched billboard). */
function streakTexture(scene: Scene): DynamicTexture {
  const w = 24;
  const h = 96;
  const tex = new DynamicTexture("fxStreak", { width: w, height: h }, scene, false);
  const ctx = tex.getContext() as unknown as CanvasRenderingContext2D;
  const v = ctx.createLinearGradient(0, 0, 0, h); // bright core down the middle, fading at the ends
  v.addColorStop(0, "rgba(255,255,255,0)");
  v.addColorStop(0.5, "rgba(255,255,255,1)");
  v.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
  const edge = ctx.createLinearGradient(0, 0, w, 0); // carve the horizontal edges to a thin line
  edge.addColorStop(0, "rgba(0,0,0,1)");
  edge.addColorStop(0.5, "rgba(0,0,0,0)");
  edge.addColorStop(1, "rgba(0,0,0,1)");
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
  tex.hasAlpha = true;
  tex.update();
  return tex;
}

/** A hard-edged diamond — for ice shards and earth debris (crystalline/chunky, not soft glow). */
function shardTexture(scene: Scene): DynamicTexture {
  const s = 48;
  const tex = new DynamicTexture("fxShard", { width: s, height: s }, scene, false);
  const ctx = tex.getContext() as unknown as CanvasRenderingContext2D;
  ctx.clearRect(0, 0, s, s);
  ctx.save();
  ctx.translate(s / 2, s / 2);
  ctx.rotate(Math.PI / 4); // a rotated square reads as a diamond/shard
  const g = ctx.createLinearGradient(-s / 3, 0, s / 3, 0); // a little inner shading
  g.addColorStop(0, "rgba(255,255,255,0.85)");
  g.addColorStop(0.5, "rgba(255,255,255,1)");
  g.addColorStop(1, "rgba(255,255,255,0.85)");
  ctx.fillStyle = g;
  ctx.fillRect(-s / 3.2, -s / 3.2, (s / 3.2) * 2, (s / 3.2) * 2);
  ctx.restore();
  tex.hasAlpha = true;
  tex.update();
  return tex;
}
