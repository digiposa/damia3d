import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Camera } from "@babylonjs/core/Cameras/camera";
import type { Scene } from "@babylonjs/core/scene";

import { settings } from "../core/settings";

/** Base vertical span (world units) the orthographic camera shows, before zoom. */
const VIEW_HEIGHT = 16;

/** True isometric tilt: ~54.74° from vertical. */
const ISO_BETA = Math.atan(Math.SQRT2);
const ISO_ALPHA = -Math.PI / 4;
/** The standard iso tilt, for callers that set {@link IsoCamera.tilt}. */
export const ISO_TILT = ISO_BETA;

/**
 * Orthographic camera locked to an isometric angle. It does not orbit on user
 * input; gameplay code moves its target to follow the player.
 */
export class IsoCamera {
  readonly camera: ArcRotateCamera;

  constructor(scene: Scene, target = Vector3.Zero()) {
    this.camera = new ArcRotateCamera("iso", ISO_ALPHA, ISO_BETA, 40, target, scene);
    this.camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    this.applyOrtho(scene);

    scene.onBeforeRenderObservable.add(() => this.applyOrtho(scene));
  }

  private lastAspect = -1;
  private lastZoom = -1;

  /** Recompute orthographic bounds from the current aspect ratio — only when the aspect ratio or
   *  zoom actually changed (runs every frame via onBeforeRender, but the bounds rarely move). */
  private applyOrtho(scene: Scene): void {
    if (this.view) return; // a scenic perspective shot has no ortho bounds
    const aspect = scene.getEngine().getAspectRatio(this.camera);
    const zoom = settings.cameraZoom * this.shotZoom;
    if (aspect === this.lastAspect && zoom === this.lastZoom) return;
    this.lastAspect = aspect;
    this.lastZoom = zoom;
    const half = VIEW_HEIGHT / zoom / 2;
    this.camera.orthoTop = half;
    this.camera.orthoBottom = -half;
    this.camera.orthoLeft = -half * aspect;
    this.camera.orthoRight = half * aspect;
  }

  // --- Scenic sections (a perspective shot, see World.view) -------------------------------

  private view?: { beta: number; fov: number; radius: number; lift: number; heading?: number };

  /** Switch to a scenic perspective shot for this map (kept until the camera is rebuilt). */
  scenic(view: { beta: number; fov: number; radius: number; lift: number; heading?: number }): void {
    this.view = view;
    this.camera.alpha = ISO_ALPHA + (view.heading ?? 0);
    this._groundForward = this._groundRight = undefined; // the ground basis follows the heading
    this.camera.mode = Camera.PERSPECTIVE_CAMERA;
    this.camera.fov = view.fov;
    this.camera.beta = this.tilt = view.beta;
    this.camera.radius = view.radius;
    this.camera.minZ = 0.3;
    this.applyTarget();
  }

  /** Back to the plain orthographic iso view (undoes {@link scenic}). */
  iso(): void {
    if (!this.view) return;
    this.view = undefined;
    this.camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    this.camera.alpha = ISO_ALPHA;
    this.camera.beta = this.tilt = ISO_BETA;
    this.camera.radius = 40;
    this.camera.minZ = 1;
    this._groundForward = this._groundRight = undefined;
    this.lastAspect = -1; // recompute the ortho bounds
    this.applyTarget();
  }

  /** Turn the view about the followed point (free camera, Story maps: either view). */
  turn(delta: number): void {
    if (!delta) return;
    this.camera.alpha += delta;
    this._groundForward = this._groundRight = undefined;
  }

  /** The perspective shot's own distance from the followed point (before any pull-in). */
  get viewRadius(): number {
    return this.view?.radius ?? this.camera.radius;
  }

  /** True in a perspective (scenic / third-person) shot. */
  get isPerspective(): boolean {
    return !!this.view;
  }

  /** The heading (camera alpha). */
  get heading(): number {
    return this.camera.alpha;
  }

  // --- Framed "moments" (a map's set pieces: a cliff edge, a boss arena) -------------------

  /** Current shot: zoom multiplier on the player's zoom setting, and a ground offset of the target. */
  private shotZoom = 1;
  private readonly shotOffset = Vector3.Zero();
  private readonly wantOffset = Vector3.Zero();
  private wantZoom = 1;

  /** Ask for a framing (eased in over ~1 s); `setShot(1)` returns to the plain follow. */
  setShot(zoom: number, offset?: Vector3): void {
    this.wantZoom = zoom;
    if (offset) this.wantOffset.copyFrom(offset);
    else this.wantOffset.setAll(0);
  }

  /** Ease the shot toward the wanted one; call once per frame. */
  tickShot(dt: number): void {
    const k = Math.min(1, dt * 1.8);
    const z = this.shotZoom + (this.wantZoom - this.shotZoom) * k;
    this.shotZoom = Math.abs(z - this.wantZoom) < 1e-3 ? this.wantZoom : z;
    Vector3.LerpToRef(this.shotOffset, this.wantOffset, k, this.shotOffset);
    this.applyTarget();
  }

  // The camera target we're actually following (the "clean" point); the live camera.target is this
  // plus a transient shake offset, so shake never accumulates into the followed position.
  private base?: Vector3;
  private shakeT = 0;
  private shakeDur = 0;
  private shakeMag = 0;

  /** Smoothly follow a world position on the ground. */
  follow(position: Vector3, lerp = 0.15): void {
    if (!this.base) this.base = this.camera.target.clone();
    Vector3.LerpToRef(this.base, position, lerp, this.base);
    this.applyTarget();
  }

  /**
   * Kick a screen shake: `magnitude` in world units (~0.1 light … ~0.5 heavy), decaying over
   * `duration` seconds. A stronger shake overrides a weaker ongoing one (they don't stack).
   */
  shake(magnitude: number, duration = 0.28): void {
    if (magnitude <= 0) return;
    if (magnitude >= this.shakeMag) this.shakeMag = magnitude;
    this.shakeDur = duration;
    this.shakeT = duration;
  }

  /** Advance the shake decay; call once per frame. */
  tickShake(dt: number): void {
    if (this.shakeT <= 0) return;
    this.shakeT = Math.max(0, this.shakeT - dt);
    if (this.shakeT === 0) this.shakeMag = 0;
    this.applyTarget();
  }

  /**
   * How far (world units, along the ground "into the screen") the view leads ahead of the followed
   * point. A positive value sits the player in the lower part of the frame with more of the scene
   * BEHIND them — the PS1 battle composition, fighters low and the arena wall as a backdrop.
   */
  framing = 0;

  /**
   * Wanted tilt (camera beta, radians from vertical); the camera eases toward it in
   * {@link tickTilt}. Iso by default; a map can lower it per zone (the "cinema" camera style).
   * Only the tilt moves — the heading stays, so the ground basis used by movement is unchanged.
   */
  tilt = ISO_BETA;

  /** Ease the live tilt toward {@link tilt}; call once per frame. */
  tickTilt(dt: number): void {
    const b = this.camera.beta;
    if (Math.abs(this.tilt - b) < 1e-4) return;
    this.camera.beta = b + (this.tilt - b) * Math.min(1, dt * 1.6);
  }

  /** Set the live camera target = followed base + framing lead + current (decaying) shake offset. */
  private applyTarget(): void {
    if (!this.base) return;
    this.camera.target.copyFrom(this.base).addInPlace(this.shotOffset);
    if (this.view) this.camera.target.y += this.view.lift;
    if (this.framing) {
      const f = this.groundForward;
      this.camera.target.x += f.x * this.framing;
      this.camera.target.z += f.z * this.framing;
    }
    if (this.shakeT > 0 && this.shakeDur > 0) {
      const k = this.shakeMag * (this.shakeT / this.shakeDur); // linear decay to 0
      this.camera.target.x += (Math.random() * 2 - 1) * k;
      this.camera.target.z += (Math.random() * 2 - 1) * k;
    }
  }

  // The iso angle is fixed, so the ground basis never changes — compute it once and hand back
  // shared read-only vectors (movement reads these every frame; don't allocate).
  private _groundForward?: Vector3;
  private _groundRight?: Vector3;

  /** Forward direction (into the screen) projected onto the ground plane. */
  get groundForward(): Vector3 {
    if (!this._groundForward) {
      // From the heading itself, not from target − position: the camera's position only catches up
      // with a new heading at the next render, and a stale one inverted the controls (Seles).
      const a = this.camera.alpha;
      this._groundForward = new Vector3(-Math.cos(a), 0, -Math.sin(a));
    }
    return this._groundForward;
  }

  /** Right direction relative to the screen, on the ground plane. */
  get groundRight(): Vector3 {
    if (!this._groundRight) {
      const f = this.groundForward;
      this._groundRight = new Vector3(f.z, 0, -f.x);
    }
    return this._groundRight;
  }
}
