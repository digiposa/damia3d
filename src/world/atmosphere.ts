import { Scene } from "@babylonjs/core/scene";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import { ImageProcessingConfiguration } from "@babylonjs/core/Materials/imageProcessingConfiguration";
import type { Camera } from "@babylonjs/core/Cameras/camera";

/**
 * Dark-fantasy "mood" pass — pure rendering, no assets. Turns flat low-poly geometry into a
 * moody, Diablo-ish scene the cheap way: filmic tone mapping + contrast + a dark vignette,
 * bloom and a glow layer (so emissive gems/torches/wings actually shine), and distance fog
 * that melts far decor into gloom. Reversible: it only touches the scene's post-process,
 * fog and glow — remove the call and the look reverts. Tune the constants below to taste.
 *
 * Note: the iso camera is orthographic, so we use LINEAR fog (start/end) for predictable
 * depth falloff rather than exponential, which reads flat under ortho projection.
 */
export function applyAtmosphere(scene: Scene, camera: Camera): DefaultRenderingPipeline {
  // Distance gloom: the fighting floor stays clear; the far wall/stands/gate sink into dark.
  scene.fogMode = Scene.FOGMODE_LINEAR;
  scene.fogColor = new Color3(0.035, 0.043, 0.06);
  scene.fogStart = 24;
  scene.fogEnd = 62;

  // Real glow for emissive surfaces (chest gems, headband gems, cyan filigree, brazier
  // flames, the Dragoon wings). Keeps the bloom tight so it haloes lights, not everything.
  const glow = new GlowLayer("moodGlow", scene, { blurKernelSize: 32 });
  glow.intensity = 0.6;

  // HDR pipeline (float buffers → tone mapping + bloom look right).
  const pipe = new DefaultRenderingPipeline("mood", true, scene, [camera]);
  pipe.fxaaEnabled = true; // smooth the hard low-poly edges under ortho

  const ip = pipe.imageProcessing;
  ip.toneMappingEnabled = true;
  ip.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES; // filmic, rolls off highlights
  ip.exposure = 1.1;
  ip.contrast = 1.45; // deeper shadows, punchier key light
  ip.vignetteEnabled = true;
  ip.vignetteBlendMode = ImageProcessingConfiguration.VIGNETTEMODE_MULTIPLY; // darken the frame edges
  ip.vignetteWeight = 2.6;
  ip.vignetteColor = new Color4(0, 0, 0, 1);

  pipe.bloomEnabled = true;
  pipe.bloomThreshold = 0.55; // only bright/emissive pixels bloom
  pipe.bloomWeight = 0.5;
  pipe.bloomKernel = 48;
  pipe.bloomScale = 0.5;

  return pipe;
}
