import type { AdditionDef } from "../data/additions";
import { additionPresses } from "../data/additions";

// --- Timing-sight tuning (seconds / progress fractions) --------------------

/** Real-time seconds for the outer square to collapse onto the inner square. */
export const SIGHT_DURATION = 0.85;
/** Success window, as a fraction of SIGHT_DURATION (1 = perfect alignment). */
export const WINDOW_LO = 0.8;
export const WINDOW_HI = 1.1;
/** Tighter "white / perfect" band inside the success window. */
export const PERFECT_LO = 0.93;
export const PERFECT_HI = 1.05;
/**
 * Lockout after an Addition ends. Asymmetric on purpose: nailing the chain lets you
 * immediately start the next one (short), but aborting/whiffing it leaves you exposed.
 * The whiff lockout scales with how far you got — bailing right after the free hit 1
 * (the spam exploit) eats the MAX penalty, while slipping on the last input costs only
 * the MIN. This is the real-time equivalent of LoD's "a flubbed Addition wastes your
 * turn": pushing deeper is always better, and spamming hit 1 is the worst line.
 */
export const COMPLETE_RECOVERY = 0.25;
export const MISS_RECOVERY_MAX = 2.4;
export const MISS_RECOVERY_MIN = 0.5;

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

  /** True when the active lockout is a whiff/abort penalty (worth surfacing). */
  get recoveryIsPenalty(): boolean {
    return this.recoveryTimer > 0 && this.recoveryTotal > COMPLETE_RECOVERY;
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
      // A single-hit Addition (no presses) would complete instantly; Dart's all
      // have at least one press, but guard anyway.
      if (additionPresses(def) === 0) this.endCombo(false);
      return { kind: "started", hits: 1 };
    }

    const p = this.sightProgress;
    if (p < WINDOW_LO || p > WINDOW_HI) {
      this.endCombo(true); // whiffed — long recovery
      return { kind: "miss" };
    }

    this.hits += 1;
    this.presses += 1;
    this.sightTimer = 0;
    const perfect = p >= PERFECT_LO && p <= PERFECT_HI;
    const completed = this.presses >= additionPresses(this.def!);
    const hits = this.hits; // capture before endCombo resets state
    if (completed) this.endCombo(false); // nailed it — short recovery
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
    if (this.sightProgress > WINDOW_HI) {
      this.endCombo(true); // let the sight lapse — long recovery
      return true;
    }
    return false;
  }

  /** Force-end the Addition (e.g. the target died) — no penalty. */
  cancel(): void {
    if (this.active) this.endCombo(false);
  }

  private endCombo(failed: boolean): void {
    if (failed) {
      // Scale the whiff lockout by how far the chain got: 0 timed hits landed (a
      // hit-1 spam/abort) → MAX penalty; nearly complete → MIN.
      const need = this.def ? additionPresses(this.def) : 0;
      const progress = need > 0 ? this.presses / need : 0;
      this.recoveryTotal = MISS_RECOVERY_MAX - (MISS_RECOVERY_MAX - MISS_RECOVERY_MIN) * progress;
    } else {
      this.recoveryTotal = COMPLETE_RECOVERY;
    }
    this.recoveryTimer = this.recoveryTotal;
    this.active = false;
    this.hits = 0;
    this.presses = 0;
    this.def = undefined;
    this.sightTimer = 0;
  }
}
