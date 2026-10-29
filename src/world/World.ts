import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Scene } from "@babylonjs/core/scene";

import { createArena, clampToArena } from "./Arena";
import { LIGHTING_PRESETS, type LightingPreset } from "./lighting";

/**
 * A place the real-time combat core can run in: the Lohan arena, a forest path, later every map of
 * the Story. The mode builds it, keeps everyone inside it with {@link clamp}, and lights it with
 * {@link preset}.
 */
export interface World {
  /** Keep a ground position walkable (mutates `p`): bounds, and out of solid obstacles. */
  clamp(p: Vector3, margin?: number): void;
  /** Lighting / mood for this place. */
  preset: LightingPreset;
  /** How far the camera leads ahead of the player, "into the screen" (see IsoCamera.framing). */
  framing: number;
  /** Surfaces that catch the fighters' cast shadows. */
  shadowReceivers: AbstractMesh[];
  /** Meshes that bring their own fill light and must not get the world's (see Atmosphere). */
  ownFill: AbstractMesh[];
  /** Per-frame upkeep around the controlled character (e.g. animated props), if any. */
  update?(focus: Vector3, dt: number): void;
}

/** The Lohan Hero Competition ring (Training, Survival). */
export function arenaWorld(scene: Scene): World {
  const meshes = createArena(scene);
  const floor = scene.getMeshByName("arenaFloor");
  return {
    clamp: clampToArena,
    preset: LIGHTING_PRESETS.lohanArena,
    framing: 3, // fighters low in the frame, the back wall and its torches behind them
    shadowReceivers: floor ? [floor] : [],
    ownFill: meshes,
  };
}
