import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import type { Scene } from "@babylonjs/core/scene";

/**
 * Helpers for the hand-"painted" PS1-size textures every code-built set uses (Arena, Forest…).
 */

/** Small deterministic PRNG, so the hand-"painted" textures come out identical every time. */
export function mulberry32(seed: number): () => number {
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
export function pixelTexture(
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

export const rgb = (r: number, g: number, b: number): string => `rgb(${r | 0},${g | 0},${b | 0})`;
