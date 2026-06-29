import type { AdditionDef } from "../data/additions";
import { additionPresses } from "../data/additions";
import { AtbGauge, BASE_FILL_TIME } from "./AtbGauge";

// --- Timing-sight tuning (seconds / progress fractions) --------------------

/** Per-window collapse time — the comfortable MAX. The actual window shrinks so the whole
 *  Addition executes within the member's ATB fill time (see {@link AdditionRunner.press}),
 *  which keeps higher-rank (longer) Additions strictly better DPS and stops fast characters'
 *  Speed from being eaten by long combos. */
export const SIGHT_DURATION = 0.7;

/** Floor on the window collapse time, so the longest combos stay humanly timeable. Above this
 *  floor a long combo may run a bit past one fill — but its high DAM% keeps it the best DPS, so
 *  canon ranking still holds without forcing brutal sub-0.5s windows. */
export const MIN_SIGHT_DURATION = 0.5;

/** Success window, as a fraction of the window duration (1 = perfect alignment). */
export const WINDOW_LO = 0.8;
export const WINDOW_HI = 1.1;
/** Tighter "white / perfect" band inside the success window. */
export const PERFECT_LO = 0.93;
export const PERFECT_HI = 1.05;

/**
 * Attack-interval model, now expressed as an {@link AtbGauge}. Each Addition is one
 * "attack": it spends the gauge at its start, then the gauge refills over ~ATTACK_INTERVAL
 * seconds (modulated by the character's Speed). The next attack can't begin until the
 * gauge is full again — a short combo waits out the remainder, a long combo that overruns
 * the fill finds the gauge already full. Because attacks come at this fixed rate, sustained
 * DPS tracks canon per-execution damage (higher-rank damage Additions out-DPS lower-rank
 * ones, canon values untouched), and whiffing still burns the whole interval. This is the
 * per-character ATB gauge the future party will each own.
 */
export const ATTACK_INTERVAL = BASE_FILL_TIME;

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
 * Cadence is governed by an {@link AtbGauge}: starting a (multi-hit) Addition spends
 * the gauge, and the next attack waits for it to refill. A press-less basic attack
 * (Shana/Miranda) does not spend the gauge — its cadence is paced by the mode.
 *
 * Pure logic (no DOM/Babylon) so it can be unit-tested; the UI reads
 * {@link sightProgress} and {@link inWindow} to draw the sight.
 */
export class AdditionRunner {
  active = false;
  hits = 0;
  /**
   * Per-character ATB gauge: full = ready to attack, empties on each Addition. Defaults
   * to an own gauge (used standalone in tests); in a party the runner is {@link attach}ed
   * to whichever member is currently player-controlled, so its gauge is that member's.
   */
  gauge = new AtbGauge(ATTACK_INTERVAL);
  private def?: AdditionDef;
  /** Timed presses landed so far (hit 1 is free, so presses = hits - 1). */
  private presses = 0;
  private sightTimer = 0;

  constructor(private sightDuration = SIGHT_DURATION) {}

  get current(): AdditionDef | undefined {
    return this.def;
  }

  /** Set the gauge's fill time (seconds) — e.g. from the bearer's Speed stat. */
  setFillTime(seconds: number): void {
    this.gauge.fillTime = seconds;
  }

  /** Bind the runner to a specific ATB gauge (the now-controlled party member's). */
  attach(gauge: AtbGauge): void {
    this.gauge = gauge;
  }

  /** True while the ATB gauge is still refilling (the attack is on cooldown). */
  get recovering(): boolean {
    return !this.gauge.isReady;
  }

  /** Seconds of lockout still to run (combat time). */
  get recoveryRemaining(): number {
    return this.gauge.remainingSeconds;
  }

  /** Fraction of the current lockout still to go (1 → 0). */
  get recoveryFraction(): number {
    return this.gauge.remainingFraction;
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
    if (!this.active) {
      const multiHit = additionPresses(def) > 0;
      // A multi-hit Addition needs a charged gauge; the gauge is its cadence.
      if (multiHit && !this.gauge.isReady) return { kind: "none" };

      this.def = def;
      this.active = true;
      this.hits = 1;
      this.presses = 0;
      this.sightTimer = 0;
      if (multiHit) {
        // Scale the window so the combo executes in ~one fill: window = fill / presses,
        // clamped to a comfortable range. The whole Addition then takes ~the member's ATB
        // cadence regardless of length → one Addition = one turn, longer = strictly better.
        const presses = additionPresses(def);
        this.sightDuration = Math.min(
          SIGHT_DURATION,
          Math.max(MIN_SIGHT_DURATION, this.gauge.fillTime / presses),
        );
        this.gauge.spend(); // start refilling from empty — this attack's cadence
      } else {
        // A single-hit Addition (basic attack) resolves instantly and leaves the
        // gauge untouched (its cadence is paced by the mode, e.g. ranged cooldown).
        this.endCombo();
      }
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
    this.gauge.tick(dt); // the ATB gauge refills whether idle or mid-combo
    if (!this.active) return false;
    this.sightTimer += dt;
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
   * End the attack: clear the active combo state. The gauge was spent when the
   * attack started (for multi-hit Additions) and keeps refilling from there, so the
   * whole attack occupies ~one fill cycle from its start regardless of whether it
   * completed or whiffed — that's the point.
   */
  private endCombo(): void {
    this.active = false;
    this.hits = 0;
    this.presses = 0;
    this.def = undefined;
    this.sightTimer = 0;
  }
}
