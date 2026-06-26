import { describe, it, expect } from "vitest";

import { AtbGauge, atbFillTime, REF_SPEED, BASE_FILL_TIME } from "./AtbGauge";

describe("AtbGauge", () => {
  it("starts full and ready", () => {
    const g = new AtbGauge(2.8);
    expect(g.isReady).toBe(true);
    expect(g.fill).toBe(1);
    expect(g.remainingSeconds).toBe(0);
  });

  it("empties on spend and refills over fillTime", () => {
    const g = new AtbGauge(2);
    g.spend();
    expect(g.isReady).toBe(false);
    expect(g.fill).toBe(0);
    expect(g.remainingSeconds).toBe(2);

    g.tick(1); // half way
    expect(g.fill).toBeCloseTo(0.5);
    expect(g.isReady).toBe(false);
    expect(g.remainingFraction).toBeCloseTo(0.5);

    g.tick(1); // full
    expect(g.isReady).toBe(true);
    expect(g.fill).toBe(1);
  });

  it("never overfills past full", () => {
    const g = new AtbGauge(1);
    g.spend();
    g.tick(5);
    expect(g.fill).toBe(1);
    expect(g.isReady).toBe(true);
  });

  it("reset forces back to ready", () => {
    const g = new AtbGauge(3);
    g.spend();
    g.reset();
    expect(g.isReady).toBe(true);
  });
});

describe("atbFillTime (Speed → recharge)", () => {
  it("equals the base time at reference Speed", () => {
    expect(atbFillTime(REF_SPEED)).toBeCloseTo(BASE_FILL_TIME);
  });

  it("double Speed halves the fill time; half Speed doubles it", () => {
    expect(atbFillTime(REF_SPEED * 2)).toBeCloseTo(BASE_FILL_TIME / 2);
    expect(atbFillTime(REF_SPEED / 2)).toBeCloseTo(BASE_FILL_TIME * 2);
  });

  it("floors Speed so it never divides by zero", () => {
    expect(Number.isFinite(atbFillTime(0))).toBe(true);
  });
});
