import type { Input } from "../core/Input";

/** Diameter (px) of the joystick base ring. */
const BASE = 132;
/** Diameter (px) of the draggable knob. */
const KNOB = 60;
/** Maximum travel of the knob centre from the base centre. */
const RADIUS = (BASE - KNOB) / 2;

/**
 * Floating on-screen analog stick for touch devices. A transparent capture zone covers the
 * lower-left of the screen (clear of the right-hand action cluster and below the status
 * panel); touching anywhere in it spawns the stick at the finger and drags from there. It
 * drives the shared {@link Input} virtual axis so gameplay stays input-agnostic. Pointer
 * Events so it also works with a mouse for desktop testing.
 */
export class VirtualJoystick {
  private zone: HTMLDivElement;
  private base: HTMLDivElement;
  private knob: HTMLDivElement;
  private pointerId: number | null = null;
  private centre = { x: 0, y: 0 };

  constructor(private input: Input) {
    // Transparent capture zone: lower-left, leaving the right half and the top status
    // panel free. Lower z-index than the buttons/status bar so those still take taps.
    this.zone = document.createElement("div");
    Object.assign(this.zone.style, {
      position: "fixed",
      left: "0",
      top: "34%",
      width: "50%",
      bottom: "0",
      touchAction: "none",
      zIndex: "8",
    } satisfies Partial<CSSStyleDeclaration>);

    this.base = document.createElement("div");
    Object.assign(this.base.style, {
      position: "fixed",
      width: `${BASE}px`,
      height: `${BASE}px`,
      marginLeft: `${-BASE / 2}px`,
      marginTop: `${-BASE / 2}px`,
      borderRadius: "50%",
      background: "rgba(20,28,44,0.45)",
      border: "1px solid rgba(120,150,200,0.30)",
      boxShadow: "inset 0 0 24px rgba(0,0,0,0.35)",
      display: "none",
      pointerEvents: "none",
      zIndex: "9",
    } satisfies Partial<CSSStyleDeclaration>);

    this.knob = document.createElement("div");
    Object.assign(this.knob.style, {
      position: "absolute",
      left: "50%",
      top: "50%",
      width: `${KNOB}px`,
      height: `${KNOB}px`,
      marginLeft: `${-KNOB / 2}px`,
      marginTop: `${-KNOB / 2}px`,
      borderRadius: "50%",
      background: "rgba(160,190,235,0.55)",
      border: "1px solid rgba(200,220,255,0.65)",
      transform: "translate(0px, 0px)",
      pointerEvents: "none",
    } satisfies Partial<CSSStyleDeclaration>);
    this.base.appendChild(this.knob);

    this.zone.addEventListener("pointerdown", this.onDown);
    window.addEventListener("pointermove", this.onMove);
    window.addEventListener("pointerup", this.onUp);
    window.addEventListener("pointercancel", this.onUp);

    document.body.appendChild(this.zone);
    document.body.appendChild(this.base);
  }

  private onDown = (e: PointerEvent): void => {
    if (this.pointerId !== null) return;
    this.pointerId = e.pointerId;
    // Spawn the stick at the finger (clamped so the base stays fully on-screen).
    const half = BASE / 2;
    this.centre = {
      x: Math.min(Math.max(e.clientX, half), window.innerWidth - half),
      y: Math.min(Math.max(e.clientY, half), window.innerHeight - half),
    };
    this.base.style.left = `${this.centre.x}px`;
    this.base.style.top = `${this.centre.y}px`;
    this.base.style.display = "block";
    this.update(e);
  };

  private onMove = (e: PointerEvent): void => {
    if (e.pointerId !== this.pointerId) return;
    this.update(e);
  };

  private onUp = (e: PointerEvent): void => {
    if (e.pointerId !== this.pointerId) return;
    this.pointerId = null;
    this.base.style.display = "none";
    this.knob.style.transform = "translate(0px, 0px)";
    this.input.setVirtualAxis(0, 0);
  };

  /** Map the pointer position (relative to the spawned centre) to a clamped vector. */
  private update(e: PointerEvent): void {
    let dx = e.clientX - this.centre.x;
    let dy = e.clientY - this.centre.y;

    const dist = Math.hypot(dx, dy);
    if (dist > RADIUS) {
      dx = (dx / dist) * RADIUS;
      dy = (dy / dist) * RADIUS;
    }

    this.knob.style.transform = `translate(${dx}px, ${dy}px)`;
    // Screen y grows downward; game "forward" is up, hence the negation.
    this.input.setVirtualAxis(dx / RADIUS, -dy / RADIUS);
  }

  /** Show or hide the stick (e.g. while the main menu is open). */
  setVisible(visible: boolean): void {
    this.zone.style.display = visible ? "block" : "none";
    if (!visible) {
      this.pointerId = null;
      this.base.style.display = "none";
      this.input.setVirtualAxis(0, 0);
    }
  }

  dispose(): void {
    this.zone.removeEventListener("pointerdown", this.onDown);
    window.removeEventListener("pointermove", this.onMove);
    window.removeEventListener("pointerup", this.onUp);
    window.removeEventListener("pointercancel", this.onUp);
    this.zone.remove();
    this.base.remove();
  }
}
