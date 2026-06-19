import type { AdditionDef } from "../data/additions";

export interface PressOutcome {
  /** A new hit landed on this press. */
  landed: boolean;
  /** Whether a brand-new combo started on this press. */
  started: boolean;
  /** Total hits landed in the current combo after this press. */
  hits: number;
  /** The combo reached its final hit (a perfect Addition). */
  completed: boolean;
}

const NO_PRESS: PressOutcome = { landed: false, started: false, hits: 0, completed: false };

/** Seconds within which the next hit must be pressed to chain the combo. */
const DEFAULT_WINDOW = 0.55;
/** Seconds of lockout after a combo ends (whiffed or completed). */
const DEFAULT_RECOVERY = 0.4;

/**
 * Real-time driver for a LoD Addition rendered as a hack-and-slash combo. Each
 * attack press lands the next hit of the equipped Addition, but only if pressed
 * within the chaining window; let it lapse and the combo ends. Landing every hit
 * is a "perfect" Addition. This carries no damage math — the owner reads
 * {@link PressOutcome.hits} and applies the LoD formula per landed hit.
 */
export class AdditionRunner {
  active = false;
  hits = 0;
  private def?: AdditionDef;
  private windowTimer = 0;
  private recoveryTimer = 0;

  constructor(
    private window = DEFAULT_WINDOW,
    private recovery = DEFAULT_RECOVERY,
  ) {}

  /** The Addition currently being performed, if any. */
  get current(): AdditionDef | undefined {
    return this.def;
  }

  /** Fraction of the chaining window still open, in [0, 1] (for UI feedback). */
  get windowFraction(): number {
    return this.active ? Math.max(0, this.windowTimer / this.window) : 0;
  }

  /** Whether the runner is in its post-combo lockout. */
  get recovering(): boolean {
    return this.recoveryTimer > 0;
  }

  /**
   * Press attack with the given equipped Addition. Starts a combo when idle, or
   * chains the next hit when one is active and the window is open.
   */
  press(def: AdditionDef): PressOutcome {
    if (this.recoveryTimer > 0) return NO_PRESS;

    if (!this.active) {
      this.def = def;
      this.active = true;
      this.hits = 1;
      this.windowTimer = this.window;
      return this.settle(true);
    }

    if (this.def === def && this.hits < this.def.hits.length) {
      this.hits += 1;
      this.windowTimer = this.window;
      return this.settle(false);
    }

    return { ...NO_PRESS, hits: this.hits };
  }

  /** Advance timers; ends the combo if the chaining window lapses. */
  tick(dt: number): void {
    if (this.recoveryTimer > 0) {
      this.recoveryTimer = Math.max(0, this.recoveryTimer - dt);
      return;
    }
    if (this.active) {
      this.windowTimer -= dt;
      if (this.windowTimer <= 0) this.endCombo();
    }
  }

  /** Force-end the current combo (e.g. the target died or left range). */
  cancel(): void {
    if (this.active) this.endCombo();
  }

  /** Finalize a landed press, returning the outcome before any combo reset. */
  private settle(started: boolean): PressOutcome {
    const hits = this.hits;
    const completed = hits >= this.def!.hits.length;
    if (completed) this.endCombo();
    return { landed: true, started, hits, completed };
  }

  private endCombo(): void {
    this.active = false;
    this.hits = 0;
    this.def = undefined;
    this.windowTimer = 0;
    this.recoveryTimer = this.recovery;
  }
}
