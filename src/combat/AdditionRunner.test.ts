import { describe, it, expect } from "vitest";

import { AdditionRunner, SIGHT_DURATION } from "./AdditionRunner";
import { DART_ADDITIONS } from "../data/additions";

const ds = DART_ADDITIONS.doubleSlash; // 1 press (2 hits)
const volcano = DART_ADDITIONS.volcano; // 3 presses (4 hits)

/** Tick the runner to a given sight progress (fraction of SIGHT_DURATION). */
function tickToProgress(r: AdditionRunner, progress: number): void {
  r.tick(progress * SIGHT_DURATION);
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
    const timedOut = r.tick(SIGHT_DURATION * 1.2); // past the window
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
