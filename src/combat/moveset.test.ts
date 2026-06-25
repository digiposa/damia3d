import { describe, it, expect } from "vitest";

import { AdditionRunner } from "./AdditionRunner";
import { additionAttack, physicalAttack, type AttackerStats } from "./formula";
import type { Modifiers } from "./modifiers";
import {
  ADDITION_LISTS,
  BASIC_ATTACK,
  additionPresses,
  additionHitsPercent,
  additionMultiplier,
  type AdditionDef,
} from "../data/additions";

/**
 * Combat integration: drive every character's Additions through the real
 * {@link AdditionRunner} as a *perfect* performance and check the decomposed
 * per-hit damage (the running-total scheme TrainingMode uses) sums to the
 * Addition's perfect damage. This validates movesets that have never been
 * exercised in play (6- and 7-press Additions, Shana's Addition-less attack).
 */

// A beefy attacker vs a soft target so each per-hit increment is comfortably
// positive (no Math.max(1,…) clamping) — lets us assert exact telescoping.
const ATK: AttackerStats = { at: 150, lv: 50 };
const TARGET_DF = 50;

/** Mirror of TrainingMode.applyHit: per-hit damage = running total minus the prior total. */
function hitDamage(
  def: AdditionDef,
  k: number,
  mult: number,
  mods: Partial<Modifiers>,
): number {
  const before = k > 1 ? additionAttack(ATK, TARGET_DF, additionHitsPercent(def, k - 1), mult, mods) : 0;
  const now = additionAttack(ATK, TARGET_DF, additionHitsPercent(def, k), mult, mods);
  return Math.max(1, now - before);
}

interface SimResult {
  perHit: number[];
  perfects: number;
  completedAt: number; // 1-based timed-press index that completed the combo
  total: number;
}

/** Play an Addition with perfectly-timed presses through the runner. */
function simulatePerfect(def: AdditionDef, level = 5, mods: Partial<Modifiers> = {}): SimResult {
  const runner = new AdditionRunner();
  const mult = additionMultiplier(def, level);

  const start = runner.press(def);
  expect(start.kind).toBe("started");

  const perHit = [hitDamage(def, 1, mult, mods)];
  let perfects = 0;
  let completedAt = -1;
  const presses = additionPresses(def);

  for (let i = 0; i < presses; i++) {
    runner.tick(runner.windowSeconds); // collapse the sight to perfect alignment (progress = 1.0)
    const r = runner.press(def);
    expect(r.kind).toBe("hit");
    if (r.kind === "hit") {
      if (r.perfect) perfects++;
      expect(r.hits).toBe(i + 2); // hit 1 was free; this is the (i+2)-th hit
      perHit.push(hitDamage(def, r.hits, mult, mods));
      if (r.completed) completedAt = i + 1;
    }
  }

  return { perHit, perfects, completedAt, total: perHit.reduce((a, b) => a + b, 0) };
}

const ALL = Object.entries(ADDITION_LISTS);

describe("perfect Addition runs (all characters)", () => {
  for (const [char, list] of ALL) {
    describe(char, () => {
      for (const def of list) {
        const presses = additionPresses(def);
        it(`${def.name}: lands ${presses + 1} hits, all timed presses perfect`, () => {
          const r = simulatePerfect(def);
          expect(r.perHit).toHaveLength(def.hits.length);
          expect(r.perfects).toBe(presses);
          // Only the final timed press completes the combo (or it is a 1-hit Addition).
          expect(r.completedAt).toBe(presses === 0 ? -1 : presses);
        });

        it(`${def.name}: per-hit damage telescopes to the perfect total`, () => {
          const mult = additionMultiplier(def, 5);
          const perfect = additionAttack(ATK, TARGET_DF, additionHitsPercent(def), mult);
          const r = simulatePerfect(def);
          expect(r.total).toBe(perfect);
          // Each hit deals positive damage and the running total never decreases.
          let running = 0;
          for (const d of r.perHit) {
            expect(d).toBeGreaterThan(0);
            running += d;
          }
          expect(running).toBe(perfect);
        });
      }
    });
  }
});

describe("element modifier moves damage the right way", () => {
  // Use Dart's Volcano as the probe; the modifier wrapper is shared by all.
  const def = ADDITION_LISTS.dart.find((a) => a.name === "Volcano")!;
  const mult = additionMultiplier(def, 5);
  const full = additionHitsPercent(def);
  const neutral = additionAttack(ATK, TARGET_DF, full, mult, { element: 1 });
  const weak = additionAttack(ATK, TARGET_DF, full, mult, { element: 1.5 });
  const resist = additionAttack(ATK, TARGET_DF, full, mult, { element: 0.5 });

  it("weakness (x1.5) hits harder, resistance (x0.5) softer", () => {
    expect(weak).toBeGreaterThan(neutral);
    expect(resist).toBeLessThan(neutral);
  });

  it("the simulated chain respects the element multiplier", () => {
    expect(simulatePerfect(def, 5, { element: 1.5 }).total).toBe(weak);
    expect(simulatePerfect(def, 5, { element: 0.5 }).total).toBe(resist);
  });
});

describe("Addition-less attack (Shana / Miranda — BASIC_ATTACK)", () => {
  it("has no timed presses and completes instantly", () => {
    expect(additionPresses(BASIC_ATTACK)).toBe(0);
    const runner = new AdditionRunner();
    const r = runner.press(BASIC_ATTACK);
    expect(r.kind).toBe("started");
    expect(runner.active).toBe(false); // instantly resolved, now in recovery
  });

  it("reduces to LoD's archer (basic physical) attack", () => {
    // additionAttack at hit-1 (100%) / x100 multiplier === physicalAttack.
    const viaAddition = additionAttack(ATK, TARGET_DF, additionHitsPercent(BASIC_ATTACK), 100);
    const viaArcher = physicalAttack(ATK, TARGET_DF);
    expect(viaAddition).toBe(viaArcher);
  });
});

describe("Addition level scaling", () => {
  it("higher Addition level never lowers perfect damage", () => {
    for (const [, list] of ALL) {
      for (const def of list) {
        const full = additionHitsPercent(def);
        let prev = 0;
        for (let lv = 1; lv <= 5; lv++) {
          const d = additionAttack(ATK, TARGET_DF, full, additionMultiplier(def, lv));
          expect(d).toBeGreaterThanOrEqual(prev);
          prev = d;
        }
      }
    }
  });
});
