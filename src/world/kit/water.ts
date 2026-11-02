import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import { Effect } from "@babylonjs/core/Materials/effect";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";

/**
 * Open water for any map (kit): one cheap shader pass, no reflection render (mobile).
 *
 * - Waves: a handful of directional swells summed per pixel into the surface normal, animated;
 *   their detail fades with distance so the far sea doesn't alias into noise.
 * - Reflection: the sky's own gradient (horizon → zenith, plus the sun's glow), mixed in by a
 *   Fresnel term — dark deep water looking down, the sky's colour towards the horizon.
 * - The sun: a sharp glint and a broader sheen on the swell, along its road on the water.
 * - Distance: fades into `fog` (usually the horizon colour), so the sea meets the sky.
 *
 * Unlit and out of the scene's fog/image pipeline: keep it out of the glow layer too.
 */
export interface WaterOptions {
  /** Colour of the water itself, seen straight down. */
  deep: Color3;
  /** Sky colour at the horizon / overhead (what the water reflects). */
  skyHorizon: Color3;
  skyZenith: Color3;
  /** Direction towards the sun (any length) and its colour. */
  sun: Vector3;
  sunColor: Color3;
  /** Sun glint strength (0 none … ~2 dazzling). */
  glint?: number;
  /** Size of the swell, world units (larger = longer waves). */
  waveScale?: number;
  /** Fade into `fogColor` from `fogStart` to `fogEnd` (world units from the camera). */
  fogColor: Color3;
  fogStart: number;
  fogEnd: number;
}

const NAME = "kitWater";

Effect.ShadersStore[`${NAME}VertexShader`] = `
precision highp float;
attribute vec3 position;
uniform mat4 world;
uniform mat4 viewProjection;
varying vec3 vPos;
void main() {
  vec4 w = world * vec4(position, 1.0);
  vPos = w.xyz;
  gl_Position = viewProjection * w;
}`;

Effect.ShadersStore[`${NAME}FragmentShader`] = `
precision highp float;
varying vec3 vPos;
uniform vec3 cameraPosition;
uniform float time;
uniform float waveScale;
uniform float glint;
uniform vec3 deep;
uniform vec3 skyHorizon;
uniform vec3 skyZenith;
uniform vec3 sunDir;
uniform vec3 sunColor;
uniform vec3 fogColor;
uniform vec2 fogRange;

// One directional swell: adds its slope to (dx, dz).
void swell(vec2 p, vec2 d, float k, float speed, float amp, inout vec2 slope) {
  float ph = dot(p, d) * k + time * speed;
  slope += d * (amp * k * cos(ph));
}

void main() {
  vec3 toEye = cameraPosition - vPos;
  float dist = length(toEye);
  vec3 view = toEye / dist;
  vec2 p = vPos.xz / waveScale;
  // Detail fades with distance (no aliasing far out), and when looking along the surface.
  float fade = 1.0 / (1.0 + dist * 0.012);
  vec2 slope = vec2(0.0);
  swell(p, normalize(vec2(1.0, 0.35)), 1.0, 0.9, 0.16, slope);
  swell(p, normalize(vec2(-0.4, 1.0)), 1.7, 1.3, 0.09, slope);
  swell(p, normalize(vec2(0.8, -0.6)), 2.9, 1.9, 0.05 * (0.4 + fade), slope);
  swell(p, normalize(vec2(-0.9, -0.3)), 5.3, 2.6, 0.03 * fade, slope);
  swell(p, normalize(vec2(0.2, 0.95)), 9.1, 3.4, 0.018 * fade, slope);
  vec3 n = normalize(vec3(-slope.x, 1.0, -slope.y));

  vec3 r = reflect(-view, n);
  float elev = clamp(r.y, 0.0, 1.0);
  vec3 sky = mix(skyHorizon, skyZenith, pow(elev, 0.6));
  float toSun = max(dot(r, sunDir), 0.0);
  sky += sunColor * pow(toSun, 14.0) * 0.6; // the sun's glow in the reflected sky: only along its road

  float fres = 0.03 + 0.97 * pow(1.0 - max(dot(view, n), 0.0), 5.0);
  vec3 col = mix(deep, sky, fres);
  // The sun on the swell: a sharp glint and a broader sheen.
  col += sunColor * (pow(toSun, 800.0) * 2.0 + pow(toSun, 90.0) * 0.18) * glint;

  float f = clamp((dist - fogRange.x) / (fogRange.y - fogRange.x), 0.0, 1.0);
  col = mix(col, fogColor, f * f);
  gl_FragColor = vec4(col, 1.0);
}`;

/** A water material; call `tick(dt)` every frame to move the waves. */
export function waterMaterial(scene: Scene, name: string, o: WaterOptions): { material: ShaderMaterial; tick(dt: number): void } {
  const m = new ShaderMaterial(name, scene, NAME, {
    attributes: ["position"],
    uniforms: ["world", "viewProjection", "cameraPosition", "time", "waveScale", "glint", "deep", "skyHorizon", "skyZenith", "sunDir", "sunColor", "fogColor", "fogRange"],
  });
  m.setFloat("waveScale", o.waveScale ?? 6);
  m.setFloat("glint", o.glint ?? 1);
  m.setColor3("deep", o.deep);
  m.setColor3("skyHorizon", o.skyHorizon);
  m.setColor3("skyZenith", o.skyZenith);
  m.setVector3("sunDir", o.sun.normalizeToNew());
  m.setColor3("sunColor", o.sunColor);
  m.setColor3("fogColor", o.fogColor);
  m.setVector2("fogRange", new Vector2(o.fogStart, o.fogEnd));
  m.backFaceCulling = false;
  let t = 0;
  m.onBindObservable.add(() => {
    const cam = scene.activeCamera;
    if (cam) m.setVector3("cameraPosition", cam.globalPosition);
  });
  return {
    material: m,
    tick: (dt) => {
      t += dt;
      m.setFloat("time", t);
    },
  };
}

/** Put a water material on a (flat) mesh; returns the per-frame tick. */
export function makeWater(mesh: Mesh, o: WaterOptions): (dt: number) => void {
  const w = waterMaterial(mesh.getScene(), `${mesh.name}Water`, o);
  mesh.material = w.material;
  return w.tick;
}
