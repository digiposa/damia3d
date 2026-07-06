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
import type { Camera } from "@babylonjs/core/Cameras/camera";
import type { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";

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

  constructor(scene: Scene, camera: Camera, sun: DirectionalLight) {
    // Distance gloom: the fighting floor stays clear; far wall/stands/gate sink into dark.
    scene.fogMode = Scene.FOGMODE_LINEAR;
    scene.fogColor = new Color3(0.035, 0.043, 0.06);
    scene.fogStart = 24;
    scene.fogEnd = 62;

    // Real glow for emissive surfaces (chest gems, brazier flames, filigree, Dragoon wings).
    const glow = new GlowLayer("moodGlow", scene, { blurKernelSize: 32 });
    glow.intensity = 0.6;

    // HDR pipeline (float buffers → tone mapping + bloom look right).
    const pipe = new DefaultRenderingPipeline("mood", true, scene, [camera]);
    pipe.fxaaEnabled = true; // smooth the hard low-poly edges under ortho
    const ip = pipe.imageProcessing;
    ip.toneMappingEnabled = true;
    ip.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES; // filmic highlight roll-off
    ip.exposure = 1.1;
    ip.contrast = 1.45; // deeper shadows, punchier key light
    ip.vignetteEnabled = true;
    ip.vignetteBlendMode = ImageProcessingConfiguration.VIGNETTEMODE_MULTIPLY; // darken frame edges
    ip.vignetteWeight = 2.6;
    ip.vignetteColor = new Color4(0, 0, 0, 1);
    pipe.bloomEnabled = true;
    pipe.bloomThreshold = 0.55; // only bright/emissive pixels bloom
    pipe.bloomWeight = 0.5;
    pipe.bloomKernel = 48;
    pipe.bloomScale = 0.5;

    // Soft shadows: the sun casts a blurred shadow map; entities cast, the floor receives.
    sun.position = new Vector3(28, 46, 22); // a projection origin opposite the light direction
    sun.shadowMinZ = 1;
    sun.shadowMaxZ = 100;
    this.shadows = new ShadowGenerator(1024, sun);
    this.shadows.useBlurExponentialShadowMap = true;
    this.shadows.blurKernel = 32;
    this.shadows.setDarkness(0.5);

    this.dot = softDotTexture(scene);
    this.spawnDust(scene);
  }

  /**
   * Replace the set of shadow-casting entities (call after the party or enemies change). We
   * rebuild the whole list rather than add/remove piecemeal, so disposed meshes never linger.
   */
  setCasters(roots: TransformNode[]): void {
    const map = this.shadows.getShadowMap();
    if (!map || !map.renderList) return;
    map.renderList.length = 0;
    for (const root of roots) {
      for (const mesh of root.getChildMeshes()) map.renderList.push(mesh);
    }
  }

  /** Slow dust motes drifting through the arena air — cheap atmospheric depth. */
  private spawnDust(scene: Scene): void {
    const ps = new ParticleSystem("dust", 60, scene);
    ps.particleTexture = this.dot;
    ps.emitter = new Vector3(0, 2.4, 0);
    ps.minEmitBox = new Vector3(-14, -2, -14);
    ps.maxEmitBox = new Vector3(14, 4, 14);
    ps.color1 = new Color4(0.8, 0.82, 0.9, 0.06);
    ps.color2 = new Color4(0.72, 0.76, 0.9, 0.1);
    ps.colorDead = new Color4(0.7, 0.75, 0.9, 0);
    ps.minSize = 0.03;
    ps.maxSize = 0.09;
    ps.minLifeTime = 6;
    ps.maxLifeTime = 12;
    ps.emitRate = 8;
    ps.gravity = new Vector3(0, 0.02, 0); // barely rising
    ps.direction1 = new Vector3(-0.2, 0.05, -0.2);
    ps.direction2 = new Vector3(0.2, 0.15, 0.2);
    ps.minEmitPower = 0.05;
    ps.maxEmitPower = 0.15;
    ps.updateSpeed = 0.02;
    ps.start();
  }
}
