import type { AdditionDef } from "../data/additions";
import { additionPresses } from "../data/additions";

// --- Timing-sight tuning (seconds / progress fractions) --------------------

/** Per-window collapse time — comfortable and fixed for every Addition. */
export const SIGHT_DURATION = 0.7;

/** Success window, as a fraction of the window duration (1 = perfect alignment). */
export const WINDOW_LO = 0.8;
export const WINDOW_HI = 1.1;
/** Tighter "white / perfect" band inside the success window. */
export const PERFECT_LO = 0.93;
export const PERFECT_HI = 1.05;

/**
 * Attack-interval model. Each Addition is one "attack" that occupies roughly
 * ATTACK_INTERVAL seconds (the real-time analogue of a turn): after it starts, the next
 * attack can't begin until the interval elapses. A short combo waits out the remainder;
 * a long combo that overruns the interval gets only MIN_RECOVERY. Because attacks come
 * at a fixed rate, sustained DPS tracks the canon per-execution damage (higher-rank
 * damage Additions out-DPS lower-rank ones, canon values untouched), and whiffing wastes
 * the whole interval — a pure opportunity cost, exactly like fumbling a turn.
 */
export const ATTACK_INTERVAL = 2.8;
export const MIN_RECOVERY = 0.2;
/** Press-less basic attack (Shana/Miranda); their cadence is paced by the mode instead. */
export const BASIC_RECOVERY = 0.25;

export type AttackResult =
  | { kind: "none" }
  /** A new Addition began; hit 1 is guaranteed (no input needed). */
  | { kind: "started"; hits: number }
  /** A timed input landed the next hit. */
  | { kind: "hit"; hits: number; perfect: boolean; completed: boolean }
  /** A mistimed press ended the Addition. */
  | { kind: "miss" };

/**
 * Faithful LoD Addition timing system. The Attack command begins the Addition
 * and lands hit 1 for free; thereafter a "timing sight" collapses and each
 * subsequent hit requires a press while the squares overlap. A press outside the
 * window — or letting it lapse — ends the chain. Carries no damage math; the
 * owner reads the hit count and applies the LoD Addition formula per hit.
 *
 * Pure logic (no DOM/Babylon) so it can be unit-tested; the UI reads
 * {@link sightProgress} and {@link inWindow} to draw the sight.
 */
export class AdditionRunner {
  active = false;
  hits = 0;
  private def?: AdditionDef;
  /** Timed presses landed so far (hit 1 is free, so presses = hits - 1). */
  private presses = 0;
  private sightTimer = 0;
  private recoveryTimer = 0;
  private recoveryTotal = 0;
  /** Real seconds elapsed since the current attack (Addition) started. */
  private elapsed = 0;

  constructor(private sightDuration = SIGHT_DURATION) {}

  get current(): AdditionDef | undefined {
    return this.def;
  }

  get recovering(): boolean {
    return this.recoveryTimer > 0;
  }

  /** Seconds of lockout still to run (combat time). */
  get recoveryRemaining(): number {
    return this.recoveryTimer;
  }

  /** Fraction of the current lockout still to go (1 → 0). */
  get recoveryFraction(): number {
    return this.recoveryTotal > 0 ? this.recoveryTimer / this.recoveryTotal : 0;
  }

  /** Seconds for the active window to collapse to alignment. */
  get windowSeconds(): number {
    return this.sightDuration;
  }

  /** Collapse progress of the current sight (0 = wide, 1 = aligned, can exceed). */
  get sightProgress(): number {
    return this.active ? this.sightTimer / this.sightDuration : 0;
  }

  /** True while a press would land the current hit. */
  get inWindow(): boolean {
    const p = this.sightProgress;
    return this.active && p >= WINDOW_LO && p <= WINDOW_HI;
  }

  /**
   * Press the attack button with the equipped Addition. Begins the Addition when
   * idle (auto hit 1), or evaluates the current timing sight when active.
   */
  press(def: AdditionDef): AttackResult {
    if (this.recoveryTimer > 0) return { kind: "none" };

    if (!this.active) {
      this.def = def;
      this.active = true;
      this.hits = 1;
      this.presses = 0;
      this.sightTimer = 0;
      this.elapsed = 0;
      // A single-hit Addition (no presses) completes instantly (e.g. the basic attack).
      if (additionPresses(def) === 0) this.endCombo();
      return { kind: "started", hits: 1 };
    }

    const p = this.sightProgress;
    if (p < WINDOW_LO || p > WINDOW_HI) {
      this.endCombo();
      return { kind: "miss" };
    }

    this.hits += 1;
    this.presses += 1;
    this.sightTimer = 0;
    const perfect = p >= PERFECT_LO && p <= PERFECT_HI;
    const completed = this.presses >= additionPresses(this.def!);
    const hits = this.hits; // capture before endCombo resets state
    if (completed) this.endCombo();
    return { kind: "hit", hits, perfect, completed };
  }

  /** Advance timers. Returns true on the frame a sight lapses unpressed (a miss). */
  tick(dt: number): boolean {
    if (this.recoveryTimer > 0) {
      this.recoveryTimer = Math.max(0, this.recoveryTimer - dt);
      return false;
    }
    if (!this.active) return false;
    this.sightTimer += dt;
    this.elapsed += dt;
    if (this.sightProgress > WINDOW_HI) {
      this.endCombo();
      return true;
    }
    return false;
  }

  /** Force-end the Addition (e.g. the target died). */
  cancel(): void {
    if (this.active) this.endCombo();
  }

  /**
   * End the attack and set the lockout so the whole attack occupies ~ATTACK_INTERVAL
   * from its start: a short combo waits out the remainder, a long one that overran the
   * interval gets only MIN_RECOVERY. A press-less basic attack uses BASIC_RECOVERY.
   * Whether it completed or whiffed doesn't change the cost — that's the point.
   */
  private endCombo(): void {
    const presses = this.def ? additionPresses(this.def) : 0;
    this.recoveryTotal =
      presses === 0 ? BASIC_RECOVERY : Math.max(MIN_RECOVERY, ATTACK_INTERVAL - this.elapsed);
    this.recoveryTimer = this.recoveryTotal;
    this.active = false;
    this.hits = 0;
    this.presses = 0;
    this.def = undefined;
    this.sightTimer = 0;
    this.elapsed = 0;
  }
}
