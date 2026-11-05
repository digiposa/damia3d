import { describe, it, expect } from "vitest";

import { AdditionRunner } from "./AdditionRunner";
import { DART_ADDITIONS } from "../data/additions";

const ds = DART_ADDITIONS.doubleSlash; // 1 press (2 hits)
const volcano = DART_ADDITIONS.volcano; // 3 presses (4 hits)

/** Tick the runner to a given sight progress (fraction of the active window). */
function tickToProgress(r: AdditionRunner, progress: number): void {
  r.tick(progress * r.windowSeconds);
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
    const timedOut = r.tick(r.windowSeconds * 1.2); // past the window
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
  const choreo = {
    ...volcano,
    choreo: [{ clip: "a" }, { clip: "b", window: 0.4 }, { clip: "c", window: 1.2 }, { clip: "d" }],
  };

  it("collapses each sight over its hit's own window, the default where none is given", () => {
    const r = new AdditionRunner(0.7);
    r.press(choreo); // hit 1 free → the sight for hit 2 is armed
    expect(r.windowSeconds).toBe(0.4);
    tickToProgress(r, 0.95);
    expect(r.press(choreo)).toMatchObject({ kind: "hit", hits: 2 });
    expect(r.windowSeconds).toBe(1.2); // hit 3's window
    r.tick(0.6); // 0.5 of 1.2: not yet in the window (would be past it at the default 0.7)
    expect(r.inWindow).toBe(false);
    r.tick(0.55);
    expect(r.inWindow).toBe(true);
    expect(r.press(choreo)).toMatchObject({ kind: "hit", hits: 3 });
    expect(r.windowSeconds).toBe(0.7); // hit 4: no window given → default
  });

  it("keeps the default window for Additions without a choreography", () => {
    const r = new AdditionRunner(0.7);
    r.press({ ...volcano, choreo: undefined });
    expect(r.windowSeconds).toBe(0.7);
  });
});
