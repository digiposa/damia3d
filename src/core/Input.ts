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

  /** Movement axis on the ground plane, normalized to length <= 1. */
  axis(): { x: number; y: number } {
    let x = this.virtual.x;
    let y = this.virtual.y;
    if (this.isDown("KeyW") || this.isDown("ArrowUp")) y += 1;
    if (this.isDown("KeyS") || this.isDown("ArrowDown")) y -= 1;
    if (this.isDown("KeyD") || this.isDown("ArrowRight")) x += 1;
    if (this.isDown("KeyA") || this.isDown("ArrowLeft")) x -= 1;
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
