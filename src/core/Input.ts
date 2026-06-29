/**
 * Global keyboard state. Tracks which keys are currently held so gameplay code
 * can poll movement each frame instead of reacting to discrete key events.
 */
export class Input {
  private held = new Set<string>();
  private pressedThisFrame = new Set<string>();
  private virtual = { x: 0, y: 0 };

  constructor() {
    window.addEventListener("keydown", (e) => {
      const code = e.code;
      if (!this.held.has(code)) this.pressedThisFrame.add(code);
      this.held.add(code);
    });
    window.addEventListener("keyup", (e) => this.held.delete(code(e)));
    window.addEventListener("blur", () => this.held.clear());
  }

  /** True while the key is held down. */
  isDown(code: string): boolean {
    return this.held.has(code);
  }

  /** True only on the first frame the key went down. Call endFrame() after polling. */
  wasPressed(code: string): boolean {
    return this.pressedThisFrame.has(code);
  }

  /**
   * Inject a one-frame "press" for a key code from a virtual control (e.g. a
   * touch action button), so gameplay can treat touch and keyboard uniformly.
   */
  pressVirtual(code: string): void {
    this.pressedThisFrame.add(code);
  }

  /**
   * Set the analog movement axis from a virtual control (e.g. touch joystick).
   * Components are expected in [-1, 1]; y points "up" on screen (forward).
   */
  setVirtualAxis(x: number, y: number): void {
    this.virtual.x = x;
    this.virtual.y = y;
  }

  /**
   * Movement axis on the ground plane, normalized to length <= 1. The touch joystick feeds
   * the virtual axis; on desktop, WASD / arrow keys drive it too (y points "up"/forward).
   * Click-to-move still works when no movement key is held.
   */
  axis(): { x: number; y: number } {
    let x = this.virtual.x;
    let y = this.virtual.y;
    if (this.held.has("KeyW") || this.held.has("ArrowUp")) y += 1;
    if (this.held.has("KeyS") || this.held.has("ArrowDown")) y -= 1;
    if (this.held.has("KeyD") || this.held.has("ArrowRight")) x += 1;
    if (this.held.has("KeyA") || this.held.has("ArrowLeft")) x -= 1;
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    return { x, y };
  }

  /** Clears the per-frame "just pressed" set. Call once at the end of each update. */
  endFrame(): void {
    this.pressedThisFrame.clear();
  }
}

function code(e: KeyboardEvent): string {
  return e.code;
}
