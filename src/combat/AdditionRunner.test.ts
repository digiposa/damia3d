import { describe, it, expect } from "vitest";

import { AdditionRunner } from "./AdditionRunner";
import { DART_ADDITIONS } from "../data/additions";

const ds = DART_ADDITIONS.doubleSlash; // 1 press (2 hits)
const volcano = DART_ADDITIONS.volcano; // 3 presses (4 hits)

/** Tick the runner to a given sight progress (fraction of the active window). */
function tickToProgress(r: AdditionRunner, progress: number): void {
  r.tick(r.lastHold + progress * r.windowSeconds); // past any hold (the previous blow playing out), then into the sight
}

describe("AdditionRunner (timing sight)", () => {
  it("begins with a free hit 1 on the first press", () => {
    const r = new AdditionRunner();
    const res = r.press(ds);
    expect(res).toEqual({ kind: "started", hits: 1 });
    expect(r.active).toBe(true);
  });

  it("lands hit 2 with a press inside the window and completes Double Slash", () => {
    const r = new AdditionRunner();
    r.press(ds); // hit 1
    tickToProgress(r, 0.95); // inside [0.8, 1.1]
    const res = r.press(ds);
    expect(res).toMatchObject({ kind: "hit", hits: 2, completed: true });
    expect(r.recovering).toBe(true);
  });

  it("flags a perfect press near alignment", () => {
    const r = new AdditionRunner();
    r.press(ds);
    tickToProgress(r, 1.0);
    expect(r.press(ds)).toMatchObject({ kind: "hit", perfect: true });
  });

  it("misses when pressed too early (before the window)", () => {
    const r = new AdditionRunner();
    r.press(ds);
    tickToProgress(r, 0.5); // too fast
    expect(r.press(ds)).toEqual({ kind: "miss" });
    expect(r.active).toBe(false);
  });

  it("misses when the sight lapses unpressed", () => {
    const r = new AdditionRunner();
    r.press(ds);
    const timedOut = r.tick(r.lastHold + r.windowSeconds * 1.2); // past the window
    expect(timedOut).toBe(true);
    expect(r.active).toBe(false);
  });

  it("chains a multi-press Addition (Volcano: 3 presses)", () => {
    const r = new AdditionRunner();
    r.press(volcano); // hit 1
    for (let i = 0; i < 3; i++) {
      tickToProgress(r, 0.95);
      const res = r.press(volcano);
      expect(res.kind).toBe("hit");
    }
    expect(r.hits).toBe(0); // reset after completion
    expect(r.recovering).toBe(true);
  });

  it("ignores presses during recovery", () => {
    const r = new AdditionRunner();
    r.press(ds);
    tickToProgress(r, 0.95);
    r.press(ds); // completes -> recovery
    expect(r.press(ds)).toEqual({ kind: "none" });
  });
});

describe("AdditionRunner (choreographed windows)", () => {
  // PS1: the press falls on each blow's impact; the last blow is free.
  const choreo = {
    ...volcano,
    choreo: [{ clip: "a", impact: 0.4 }, { clip: "b", impact: 0.5, window: 1.2 }, { clip: "c" }, { clip: "d", impact: 0.3 }],
  };

  it("collapses each sight over the playing blow's impact (or its window), the default where none is given", () => {
    const r = new AdditionRunner(0.7);
    r.press(choreo); // blow 1 starts → its press lands at its impact
    expect(r.windowSeconds).toBe(0.4);
    tickToProgress(r, 0.95);
    expect(r.press(choreo)).toMatchObject({ kind: "hit", hits: 2 });
    expect(r.windowSeconds).toBe(1.2); // blow 2: an explicit window beats its impact
    r.tick(0.6); // 0.5 of 1.2: not yet in the window (would be past it at the default 0.7)
    expect(r.inWindow).toBe(false);
    r.tick(0.55);
    expect(r.inWindow).toBe(true);
    expect(r.press(choreo)).toMatchObject({ kind: "hit", hits: 3 });
    expect(r.windowSeconds).toBe(0.7); // blow 3: nothing given → default (blow 4 is free: no press)
  });

  it("holds the next sight while the validated blow plays out, then collapses it from the next blow's start", () => {
    const r = new AdditionRunner(0.7);
    const def = { ...volcano, choreo: [{ clip: "a", impact: 0.5, length: 0.8 }, { clip: "b", impact: 0.4, length: 0.6 }, { clip: "c" }, { clip: "d" }] };
    r.press(def);
    r.tick(0.5); // press exactly on blow 1's impact
    expect(r.press(def)).toMatchObject({ kind: "hit", hits: 2 });
    expect(r.lastHold).toBeCloseTo(0.3); // 0.8 − 0.5: the rest of blow 1
    expect(r.sightHeld).toBe(true);
    expect(r.inWindow).toBe(false);
    r.tick(0.25);
    expect(r.sightHeld).toBe(true); // still playing out
    r.tick(0.05 + 0.4 * 0.95); // blow 2 starts, then its sight collapses over its 0.4 s impact
    expect(r.sightHeld).toBe(false);
    expect(r.inWindow).toBe(true);
    expect(r.press(def)).toMatchObject({ kind: "hit", hits: 3 });
    expect(r.lastHold).toBeCloseTo(0.6 - 0.4 * 0.95, 5);
  });

  it("keeps the default window for Additions without a choreography", () => {
    const r = new AdditionRunner(0.7);
    r.press({ ...volcano, choreo: undefined });
    expect(r.windowSeconds).toBe(0.7);
  });
});
