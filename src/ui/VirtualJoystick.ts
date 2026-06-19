import type { Input } from "../core/Input";

/** Diameter (px) of the joystick base ring. */
const BASE = 132;
/** Diameter (px) of the draggable knob. */
const KNOB = 60;
/** Maximum travel of the knob centre from the base centre. */
const RADIUS = (BASE - KNOB) / 2;

/**
 * On-screen analog stick for touch devices. Anchored bottom-left, it drives the
 * shared {@link Input} virtual axis so gameplay code stays input-agnostic. Uses
 * Pointer Events so it also works with a mouse for desktop testing.
 */
export class VirtualJoystick {
  private base: HTMLDivElement;
  private knob: HTMLDivElement;
  private pointerId: number | null = null;

  constructor(private input: Input) {
    this.base = document.createElement("div");
    Object.assign(this.base.style, {
      position: "fixed",
      left: "calc(env(safe-area-inset-left, 0px) + 26px)",
      bottom: "calc(env(safe-area-inset-bottom, 0px) + 26px)",
      width: `${BASE}px`,
      height: `${BASE}px`,
      borderRadius: "50%",
      background: "rgba(20,28,44,0.45)",
      border: "1px solid rgba(120,150,200,0.30)",
      boxShadow: "inset 0 0 24px rgba(0,0,0,0.35)",
      touchAction: "none",
      zIndex: "15",
      transition: "opacity 0.15s ease",
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
      transition: "transform 0.08s ease-out",
      pointerEvents: "none",
    } satisfies Partial<CSSStyleDeclaration>);
    this.base.appendChild(this.knob);

    this.base.addEventListener("pointerdown", this.onDown);
    window.addEventListener("pointermove", this.onMove);
    window.addEventListener("pointerup", this.onUp);
    window.addEventListener("pointercancel", this.onUp);

    document.body.appendChild(this.base);
  }

  private onDown = (e: PointerEvent): void => {
    if (this.pointerId !== null) return;
    this.pointerId = e.pointerId;
    this.knob.style.transition = "none";
    this.update(e);
  };

  private onMove = (e: PointerEvent): void => {
    if (e.pointerId !== this.pointerId) return;
    this.update(e);
  };

  private onUp = (e: PointerEvent): void => {
    if (e.pointerId !== this.pointerId) return;
    this.pointerId = null;
    this.knob.style.transition = "transform 0.08s ease-out";
    this.knob.style.transform = "translate(0px, 0px)";
    this.input.setVirtualAxis(0, 0);
  };

  /** Map the pointer position to a clamped vector and feed the shared input. */
  private update(e: PointerEvent): void {
    const rect = this.base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;

    const dist = Math.hypot(dx, dy);
    if (dist > RADIUS) {
      dx = (dx / dist) * RADIUS;
      dy = (dy / dist) * RADIUS;
    }

    this.knob.style.transform = `translate(${dx}px, ${dy}px)`;
    // Screen y grows downward; game "forward" is up, hence the negation.
    this.input.setVirtualAxis(dx / RADIUS, -dy / RADIUS);
  }

  dispose(): void {
    this.base.removeEventListener("pointerdown", this.onDown);
    window.removeEventListener("pointermove", this.onMove);
    window.removeEventListener("pointerup", this.onUp);
    window.removeEventListener("pointercancel", this.onUp);
    this.base.remove();
  }
}
