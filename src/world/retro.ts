import { PostProcess } from "@babylonjs/core/PostProcesses/postProcess";
import { Effect } from "@babylonjs/core/Materials/effect";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import type { Engine } from "@babylonjs/core/Engines/engine";
import type { Camera } from "@babylonjs/core/Cameras/camera";

import { settings } from "../core/settings";

/**
 * The PS1 look, as a renderer setting rather than an art style.
 *
 * What made the console's image recognisable is not its geometry but how it was drawn:
 *  1. a **tiny framebuffer** (240 lines) blown up to the TV with no smoothing — hard pixels,
 *     shimmering edges, no anti-aliasing;
 *  2. **15-bit colour** (5 bits per channel) with an **ordered 4×4 dither** smoothing the banding
 *     in dark gradients — the cross-hatch you see in every TLoD torch-lit wall.
 *
 * (1) is done for real, not faked: the WebGL canvas is rendered at low resolution and the browser
 * upscales it nearest-neighbour (`image-rendering: pixelated`). Besides being the honest way to get
 * the look, it makes the game CHEAPER to run — on a phone, ~10× fewer pixels to shade.
 * (2) is a last post-process pass that quantises and dithers in that low-res pixel space.
 *
 * The HUD is DOM and stays sharp at any setting.
 */

Effect.ShadersStore["retroPs1FragmentShader"] = `
precision highp float;
varying vec2 vUV;
uniform sampler2D textureSampler;
uniform vec2 screenSize;
uniform float strength;

// 4x4 Bayer matrix built from the 2x2 one: M4(p) = 4*M2(p mod 2) + M2(floor(p/2)), values 0..15.
float bayer2(vec2 a) { return mod(a.x * 2.0 + a.y * 3.0, 4.0); }
float bayer4(vec2 p) {
  p = mod(p, 4.0);
  return (4.0 * bayer2(mod(p, 2.0)) + bayer2(floor(p / 2.0))) / 16.0;
}

void main(void) {
  vec4 src = texture2D(textureSampler, vUV);
  if (strength <= 0.0) { gl_FragColor = src; return; }
  vec2 cell = floor(vUV * screenSize);
  // Offset by up to ±half a 5-bit step before rounding: the ordered pattern that hides banding.
  float d = (bayer4(cell) - 0.47) * strength;
  vec3 c = floor(src.rgb * 31.0 + 0.5 + d) / 31.0;
  gl_FragColor = vec4(clamp(c, 0.0, 1.0), src.a);
}
`;

/** Is the retro look active right now? */
export function retroEnabled(): boolean {
  return settings.retroLines > 0;
}

/**
 * Size the canvas backbuffer for the current retro setting. With retro off this restores the
 * engine's own device-pixel-ratio scaling (crisp on high-DPI phones); with it on, the backbuffer
 * is ~`retroLines` tall whatever the screen, and CSS upscales it with hard pixel edges.
 *
 * Call on start-up, on every resize, and whenever the setting changes.
 */
export function applyRetroResolution(engine: Engine): void {
  const canvas = engine.getRenderingCanvas();
  if (!canvas) return;
  const native = 1 / Math.max(1, window.devicePixelRatio || 1);
  const lines = settings.retroLines;
  const cssHeight = canvas.clientHeight || window.innerHeight;
  // Never ABOVE native resolution: on a small window, 280 lines may already be coarser than native.
  const level = lines > 0 ? Math.max(native, cssHeight / lines) : native;
  if (Math.abs(engine.getHardwareScalingLevel() - level) > 1e-3) engine.setHardwareScalingLevel(level);
  canvas.style.imageRendering = lines > 0 ? "pixelated" : "";
}

/**
 * The 15-bit + ordered-dither pass, attached to a mode's camera. It runs last, after tone mapping
 * and bloom, so it quantises what you actually see. Toggles itself off (pass-through) when the
 * retro setting is off — no rebuild needed.
 */
export class RetroPass {
  readonly pass: PostProcess;

  constructor(camera: Camera) {
    this.pass = new PostProcess(
      "retroPs1",
      "retroPs1",
      ["screenSize", "strength"],
      null,
      1.0,
      camera,
      Texture.NEAREST_SAMPLINGMODE,
    );
    this.pass.onApply = (effect) => {
      effect.setFloat2("screenSize", this.pass.width, this.pass.height);
      effect.setFloat("strength", retroEnabled() ? 1 : 0);
    };
  }

  /** Re-append this pass at the END of the camera's chain. Needed after anything that rebuilds the
   *  rendering pipeline (which re-attaches its own passes behind ours). */
  moveToEnd(camera: Camera): void {
    camera.detachPostProcess(this.pass);
    camera.attachPostProcess(this.pass);
  }

  dispose(camera: Camera): void {
    this.pass.dispose(camera);
  }
}
