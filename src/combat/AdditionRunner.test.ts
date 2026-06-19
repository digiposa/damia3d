import { describe, it, expect } from "vitest";

import { AdditionRunner } from "./AdditionRunner";
import { DART_ADDITIONS } from "../data/additions";

const ds = DART_ADDITIONS.doubleSlash; // 2 hits
const moon = DART_ADDITIONS.moonStrike; // 7 hits

describe("AdditionRunner", () => {
  it("starts a combo and lands hit 1 on first press", () => {
    const r = new AdditionRunner();
    const out = r.press(ds);
    expect(out).toMatchObject({ landed: true, started: true, hits: 1, completed: false });
    expect(r.active).toBe(true);
  });

  it("chains the next hit within the window and completes Double Slash", () => {
    const r = new AdditionRunner(0.5);
    r.press(ds);
    r.tick(0.2); // still inside window
    const out = r.press(ds);
    expect(out).toMatchObject({ landed: true, hits: 2, completed: true });
    // Completing puts the runner into recovery.
    expect(r.active).toBe(false);
    expect(r.recovering).toBe(true);
  });

  it("ends the combo when the chaining window lapses", () => {
    const r = new AdditionRunner(0.5);
    r.press(moon);
    r.tick(0.6); // window lapsed
    expect(r.active).toBe(false);
  });

  it("ignores presses during recovery, then accepts a new combo", () => {
    const r = new AdditionRunner(0.5, 0.4);
    r.press(ds);
    r.press(ds); // completes -> recovery
    expect(r.press(ds)).toMatchObject({ landed: false });
    r.tick(0.4); // recovery elapses
    expect(r.press(ds)).toMatchObject({ landed: true, started: true, hits: 1 });
  });

  it("accumulates hits across a longer Addition", () => {
    const r = new AdditionRunner(1);
    for (let i = 0; i < 7; i++) r.press(moon);
    // 7-hit addition completes on the 7th press.
    expect(r.recovering).toBe(true);
  });
});
