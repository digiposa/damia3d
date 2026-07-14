import { Scene } from "@babylonjs/core/scene";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import { ImageProcessingConfiguration } from "@babylonjs/core/Materials/imageProcessingConfiguration";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { EquiRectangularCubeTexture } from "@babylonjs/core/Materials/Textures/equiRectangularCubeTexture";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import type { Camera } from "@babylonjs/core/Cameras/camera";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Observer } from "@babylonjs/core/Misc/observable";
import { type LightingPreset, lerpPreset } from "./lighting";

/**
 * A soft round particle sprite (radial white → transparent) painted on a canvas — the shared
 * shape for embers and dust motes, so no image file is needed.
 */
export function softDotTexture(scene: Scene): DynamicTexture {
  const size = 64;
  const tex = new DynamicTexture("softDot", { width: size, height: size }, scene, false);
  const ctx = tex.getContext();
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.5, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  tex.hasAlpha = true;
  tex.update();
  return tex;
}

/**
 * Dark-fantasy "mood" pass — pure rendering, no assets. Turns flat low-poly geometry into a
 * moody, Diablo-ish scene the cheap way:
 *   - filmic tone mapping + contrast + a dark vignette (post-process),
 *   - bloom + a glow layer so emissive gems/torches/wings actually shine,
 *   - linear distance fog that melts far decor into gloom (linear, not exp, because the iso
 *     camera is orthographic — exp fog reads flat under ortho),
 *   - a soft blurred shadow map on the sun (characters cast, the floor receives),
 *   - slow dust motes drifting through the air.
 * Reversible: drop the instance and the look reverts. Tune the constants below to taste.
 */
export class Atmosphere {
  readonly shadows: ShadowGenerator;
  readonly dot: DynamicTexture;
  private readonly scene: Scene;
  private readonly ambient: HemisphericLight;
  private readonly sun: DirectionalLight;
  private readonly pipeline: DefaultRenderingPipeline;
  private readonly sparks: ParticleSystem;
  private readonly magic: ParticleSystem;
  private current: LightingPreset;
  private transitionObs?: Observer<Scene>;
  /** Static (decor) shadow casters, kept so the dynamic rebuild in setCasters never drops them. */
  private staticCasters: AbstractMesh[] = [];

  constructor(scene: Scene, camera: Camera, preset: LightingPreset) {
    this.scene = scene;

    // Lights: a hemispheric fill + a directional "sun" key. Their values come from the preset
    // (see applyPreset); created once here so the whole mood is owned in one place.
    this.ambient = new HemisphericLight("ambient", new Vector3(0, 1, 0), scene);
    this.sun = new DirectionalLight("sun", new Vector3(-0.5, -1, -0.4), scene);

    // Distance fog is always LINEAR (exp reads flat under the orthographic iso camera); its
    // start/end/colour are set per preset.
    scene.fogMode = Scene.FOGMODE_LINEAR;

    // Image-based lighting so PBR metals (AI-generated armour, etc.) have something to reflect —
    // without it, metallic surfaces render near-black. A small procedural warm-to-dark gradient
    // (no external file) matches the mood; only PBR materials use it, so the low-poly
    // StandardMaterial world is unaffected.
    this.buildEnvironment(scene);

    // Real glow for emissive surfaces (chest gems, brazier flames, filigree, Dragoon wings).
    const glow = new GlowLayer("moodGlow", scene, { blurKernelSize: 32 });
    glow.intensity = 0.6;

    // HDR pipeline (float buffers → tone mapping + bloom look right). The look-shaping values
    // (exposure/contrast/vignette weight/bloom weight) come from the preset; the rest are fixed.
    this.pipeline = new DefaultRenderingPipeline("mood", true, scene, [camera]);
    this.pipeline.fxaaEnabled = true; // smooth the hard low-poly edges under ortho
    const ip = this.pipeline.imageProcessing;
    ip.toneMappingEnabled = true;
    ip.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES; // filmic highlight roll-off
    ip.vignetteEnabled = true;
    ip.vignetteBlendMode = ImageProcessingConfiguration.VIGNETTEMODE_MULTIPLY; // darken frame edges
    ip.vignetteColor = new Color4(0, 0, 0, 1);
    this.pipeline.bloomEnabled = true;
    this.pipeline.bloomThreshold = 0.55; // only bright/emissive pixels bloom
    this.pipeline.bloomKernel = 48;
    this.pipeline.bloomScale = 0.5;

    // Shadows: the sun casts a crisp PCF shadow map; entities cast, the floor receives. PCF
    // is more reliable/visible than blurred ESM on a large ortho scene. Darkened well below
    // half so the cast shadow reads clearly against the lit sand (ambient still fills it a bit).
    this.sun.position = new Vector3(28, 46, 22); // projection origin opposite the light direction
    this.sun.autoUpdateExtends = true; // fit the shadow frustum to the casters each frame
    this.sun.shadowMinZ = 1;
    this.sun.shadowMaxZ = 120;
    this.shadows = new ShadowGenerator(2048, this.sun);
    this.shadows.usePercentageCloserFiltering = true;
    this.shadows.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
    this.shadows.setDarkness(0.25);

    this.dot = softDotTexture(scene);
    this.sparks = this.buildSparks(scene);
    this.magic = this.buildMagicBurst(scene);
    this.spawnDust(scene);

    this.current = preset;
    this.applyPreset(preset);
  }

  /** Snap all lighting/mood to a preset (lights, backdrop, fog and post-process). */
  applyPreset(p: LightingPreset): void {
    this.scene.clearColor = new Color4(p.clearColor[0], p.clearColor[1], p.clearColor[2], 1);
    this.ambient.intensity = p.ambientIntensity;
    this.ambient.groundColor = new Color3(p.ambientGround[0], p.ambientGround[1], p.ambientGround[2]);
    this.sun.intensity = p.sunIntensity;
    this.sun.diffuse = new Color3(p.sunColor[0], p.sunColor[1], p.sunColor[2]);
    this.sun.direction = new Vector3(p.sunDirection[0], p.sunDirection[1], p.sunDirection[2]);
    const ip = this.pipeline.imageProcessing;
    ip.exposure = p.exposure;
    ip.contrast = p.contrast;
    ip.vignetteWeight = p.vignetteWeight;
    this.pipeline.bloomWeight = p.bloomWeight;
    this.scene.fogStart = p.fogStart;
    this.scene.fogEnd = p.fogEnd;
    this.scene.fogColor = new Color3(p.fogColor[0], p.fogColor[1], p.fogColor[2]);
    this.current = p;
  }

  /**
   * Smoothly cross-fade the lighting from the current preset to `target` over `seconds` (e.g.
   * walking from a dark corridor into a lit hall). Interrupts any transition in progress.
   */
  transitionTo(target: LightingPreset, seconds = 1.5): void {
    if (this.transitionObs) {
      this.scene.onBeforeRenderObservable.remove(this.transitionObs);
      this.transitionObs = undefined;
    }
    if (seconds <= 0) {
      this.applyPreset(target);
      return;
    }
    const from = this.current;
    let elapsed = 0;
    this.transitionObs = this.scene.onBeforeRenderObservable.add(() => {
      elapsed += this.scene.getEngine().getDeltaTime() / 1000;
      const t = Math.min(1, elapsed / seconds);
      this.applyPreset(lerpPreset(from, target, t));
      if (t >= 1 && this.transitionObs) {
        this.scene.onBeforeRenderObservable.remove(this.transitionObs);
        this.transitionObs = undefined;
      }
    });
  }

  /**
   * Replace the set of shadow-casting entities (call after the party or enemies change). We
   * rebuild the whole list rather than add/remove piecemeal, so disposed meshes never linger.
   */
  setCasters(roots: TransformNode[]): void {
    const map = this.shadows.getShadowMap();
    if (!map || !map.renderList) return;
    map.renderList.length = 0;
    map.renderList.push(...this.staticCasters); // decor first, then the live entities
    for (const root of roots) {
      for (const mesh of root.getChildMeshes()) map.renderList.push(mesh);
    }
  }

  /** Register always-present decor meshes (e.g. loaded GLB props) as shadow casters. They
   *  persist across setCasters() rebuilds. */
  addStaticCasters(meshes: AbstractMesh[]): void {
    this.staticCasters.push(...meshes);
    const map = this.shadows.getShadowMap();
    if (map?.renderList) map.renderList.push(...meshes);
  }

  /**
   * One persistent hit-spark system, emitting nothing until {@link spark} fires a manual burst.
   * (Re-triggering a single system beats spawning a throwaway system per hit — that only ever
   * rendered once.)
   */
  private buildSparks(scene: Scene): ParticleSystem {
    const ps = new ParticleSystem("hitSpark", 400, scene);
    ps.particleTexture = this.dot;
    ps.createSphereEmitter(0.2); // radial burst around the emitter point
    ps.color1 = new Color4(1.0, 0.95, 0.7, 1);
    ps.color2 = new Color4(1.0, 0.7, 0.3, 1);
    ps.colorDead = new Color4(1.0, 0.4, 0.1, 0);
    ps.minSize = 0.08;
    ps.maxSize = 0.22;
    ps.minLifeTime = 0.2;
    ps.maxLifeTime = 0.45;
    ps.blendMode = ParticleSystem.BLENDMODE_ADD;
    ps.gravity = new Vector3(0, -6, 0);
    ps.minEmitPower = 2.5;
    ps.maxEmitPower = 6;
    ps.updateSpeed = 0.02;
    ps.emitRate = 0; // no continuous stream — bursts only, via manualEmitCount
    ps.start();
    return ps;
  }

  /** Fire a one-shot spark burst at a world position (every landed hit). */
  spark(position: Vector3): void {
    this.sparks.emitter = position.clone();
    this.sparks.manualEmitCount = 26; // emitted once on the next frame, then auto-resets to 0
  }

  /**
   * One persistent elemental-magic burst system, recoloured per call (fire / water / thunder / …).
   * Rising additive plume — reads as an eruption of the element. Reused like {@link spark}: nothing
   * emits until {@link magicBurst} sets colours + a manual count. Colour is set per burst, so a fire
   * burst and a frost burst can fire back-to-back from the same system.
   */
  private buildMagicBurst(scene: Scene): ParticleSystem {
    const ps = new ParticleSystem("magicBurst", 700, scene);
    ps.particleTexture = this.dot;
    ps.createConeEmitter(0.5, Math.PI / 3); // upward cone — an eruption from the ground up
    ps.minSize = 0.14;
    ps.maxSize = 0.62;
    ps.minLifeTime = 0.25;
    ps.maxLifeTime = 0.65;
    ps.blendMode = ParticleSystem.BLENDMODE_ADD; // glowy magic (feeds the GlowLayer/bloom)
    ps.gravity = new Vector3(0, 5, 0); // flames/energy rise
    ps.minEmitPower = 2.5;
    ps.maxEmitPower = 6.5;
    ps.updateSpeed = 0.02;
    ps.emitRate = 0; // bursts only
    ps.start();
    return ps;
  }

  /**
   * Fire a one-shot elemental burst at a world position. `hot` is the bright core colour, `cool`
   * the outer/dying colour; `power` (≈0.2 small flare … 1 full eruption … up to ~2) scales the
   * particle count and reach. Used for attack-item spells (see TrainingMode) and future magic.
   */
  magicBurst(position: Vector3, hot: Color4, cool: Color4, power = 1): void {
    const p = Math.max(0.1, power);
    this.magic.emitter = position.clone();
    this.magic.color1 = hot;
    this.magic.color2 = cool;
    this.magic.colorDead = new Color4(cool.r, cool.g, cool.b, 0);
    this.magic.minEmitPower = 2.5 * p;
    this.magic.maxEmitPower = 6.5 * p;
    this.magic.manualEmitCount = Math.round(70 * p);
  }

  /**
   * A procedural equirectangular gradient (warm dim sky → dark ground) baked to a cube texture
   * and used as the scene's IBL. Gives PBR metals a soft, mood-matched reflection instead of
   * black. Self-contained (canvas data URI — no asset file). Tune environmentIntensity to taste.
   */
  private buildEnvironment(scene: Scene): void {
    const w = 256;
    const h = 128;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0.0, "#b89a6e"); // warm "sky" — brighter so metals reflect something visible
    g.addColorStop(0.5, "#6a5f4e"); // horizon
    g.addColorStop(1.0, "#22222a"); // ground
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // A soft bright "key light" blob so metals catch a specular glint (reads as polished metal,
    // not a flat matte wash).
    const glint = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, h * 0.55);
    glint.addColorStop(0, "rgba(255,244,224,0.95)");
    glint.addColorStop(1, "rgba(255,244,224,0)");
    ctx.fillStyle = glint;
    ctx.fillRect(0, 0, w, h);
    scene.environmentTexture = new EquiRectangularCubeTexture(c.toDataURL(), scene, 128);
    scene.environmentIntensity = 1.2;
  }

  /** Slow dust motes drifting through the arena air — cheap atmospheric depth. */
  private spawnDust(scene: Scene): void {
    const ps = new ParticleSystem("dust", 40, scene);
    ps.particleTexture = this.dot;
    ps.emitter = new Vector3(0, 2.4, 0);
    ps.minEmitBox = new Vector3(-14, -2, -14);
    ps.maxEmitBox = new Vector3(14, 4, 14);
    // Alpha-blended (NOT additive — additive white motes glow like bright orbs on the dark
    // floor), tiny, and barely-there: a faint warm-grey haze, not visible "smoke".
    ps.blendMode = ParticleSystem.BLENDMODE_STANDARD;
    ps.color1 = new Color4(0.5, 0.47, 0.42, 0.035);
    ps.color2 = new Color4(0.55, 0.52, 0.48, 0.05);
    ps.colorDead = new Color4(0.5, 0.47, 0.42, 0);
    ps.minSize = 0.015;
    ps.maxSize = 0.045;
    ps.minLifeTime = 4;
    ps.maxLifeTime = 8;
    ps.emitRate = 3;
    ps.gravity = new Vector3(0, 0.01, 0); // drifts almost imperceptibly
    ps.direction1 = new Vector3(-0.15, 0.03, -0.15);
    ps.direction2 = new Vector3(0.15, 0.1, 0.15);
    ps.minEmitPower = 0.04;
    ps.maxEmitPower = 0.12;
    ps.updateSpeed = 0.02;
    ps.start();
  }
}
