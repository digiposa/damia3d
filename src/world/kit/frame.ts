import { Vector3 } from "@babylonjs/core/Maths/math.vector";

/**
 * Map kit — the iso map frame. The camera never rotates, so every map is authored in the same local
 * (u, v) frame: u runs "up the screen" (away from the camera), v sideways. Trails, zones and props
 * are written in (u, v); these convert to and from the world.
 */

/** Ground direction that reads as "up the screen" in the iso view (away from the camera). */
export const FWD = new Vector3(-Math.SQRT1_2, 0, Math.SQRT1_2);
/** Ground direction that reads as "sideways" on screen. */
export const SIDE = new Vector3(Math.SQRT1_2, 0, Math.SQRT1_2);
/** Iso camera tilt: a point `h` high shows `h·tan(β)` ground units further up the screen. */
export const TAN_BETA = Math.SQRT2;

/** World position of local (u, v). */
export function fromUV(u: number, v: number): Vector3 {
  return FWD.scale(u).addInPlace(SIDE.scale(v));
}

/** Local (u, v) of a world ground point. */
export function toUV(x: number, z: number): { u: number; v: number } {
  return { u: x * FWD.x + z * FWD.z, v: x * SIDE.x + z * SIDE.z };
}
