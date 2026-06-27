// --- ATB gauge (FF12-style) -------------------------------------------------
//
// Foundation for the eventual 3-character party: every character (player-controlled
// or AI) owns one of these. The gauge charges from empty to full over `fillTime`
// seconds; a character may act only when it is full, and acting spends it back to
// empty. `fillTime` scales with the character's Speed, so faster characters act more
// often. For the single active player today this models the attack cadence (the old
// per-attack "recovery"); for companions it will gate when their brain may choose an
// action. Pure logic, no DOM/Babylon — unit-tested.

/** Base ATB fill time (seconds) for a character at the reference Speed. */
export const BASE_FILL_TIME = 3.0;

/** Reference Speed: a character at this Speed fills its gauge in {@link BASE_FILL_TIME}.
 *  Calibrated to Dart (canon SPD 50) → 3.0s; the roster spans SPD 30 (Kongol, 5.0s) to
 *  70 (Meru, ~2.14s). Fill time = 150 / SPD. */
export const REF_SPEED = 50;

/**
 * ATB fill time for a given Speed: `base × REF_SPEED / speed`. Higher Speed → shorter
 * fill → more frequent actions → higher sustained DPS, without touching the per-action
 * (canon) damage. Speed is floored at 1 to avoid division blow-ups.
 */
export function atbFillTime(speed: number, base = BASE_FILL_TIME): number {
  return base * (REF_SPEED / Math.max(1, speed));
}

export class AtbGauge {
  /** Current charge in [0,1]; 1 = ready to act. Starts ready. */
  private charge = 1;

  constructor(public fillTime: number = BASE_FILL_TIME) {}

  /** Current charge, 0 (just acted) → 1 (ready). */
  get fill(): number {
    return this.charge;
  }

  /** True when the gauge is full and the character may act. */
  get isReady(): boolean {
    return this.charge >= 1;
  }

  /** Charge still to go as a fraction (1 → 0), for a radial cooldown readout. */
  get remainingFraction(): number {
    return 1 - this.charge;
  }

  /** Seconds until full at the current fill rate (combat time). */
  get remainingSeconds(): number {
    return Math.max(0, (1 - this.charge) * this.fillTime);
  }

  /** Advance the charge by `dt` seconds (use combat-scaled dt). */
  tick(dt: number): void {
    if (this.charge < 1 && this.fillTime > 0) {
      this.charge = Math.min(1, this.charge + dt / this.fillTime);
    }
  }

  /** Spend the gauge to act: empties it so it must refill before the next action. */
  spend(): void {
    this.charge = 0;
  }

  /** Force the gauge back to ready (e.g. on respawn or a hard combat reset). */
  reset(): void {
    this.charge = 1;
  }
}
