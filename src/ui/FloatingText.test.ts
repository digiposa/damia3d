import { describe, it, expect } from "vitest";
import { fanOut, type LiveNumber } from "./FloatingText";

/** A number that spawned right now at (x, y) and is still fully on screen. */
const at = (x: number, y: number, born = 0, life = 750): LiveNumber => ({ x, y, born, life });

const W = 520; // a phone-width viewport
const gap = (a: { x: number; y: number }, b: { x: number; y: number }): number =>
  Math.hypot(a.x - b.x, a.y - b.y);

describe("fanOut", () => {
  it("leaves a lone number where it was asked for", () => {
    expect(fanOut(260, 300, [], 0, W)).toEqual({ x: 260, y: 300 });
  });

  it("separates two hits landing on the same point in the same frame", () => {
    const first = fanOut(260, 300, [], 0, W);
    const second = fanOut(260, 300, [at(first.x, first.y)], 0, W);
    // The bug: both used to land on the exact same pixel, so only one number was ever readable.
    expect(gap(first, second)).toBeGreaterThanOrEqual(26);
  });

  it("keeps separating as more hits pile onto the same point", () => {
    const live: LiveNumber[] = [];
    const placed = [];
    for (let i = 0; i < 5; i++) {
      const p = fanOut(260, 300, live, 0, W);
      placed.push(p);
      live.push(at(p.x, p.y));
    }
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        expect(gap(placed[i], placed[j])).toBeGreaterThanOrEqual(26);
      }
    }
  });

  it("ignores numbers whose animation is already over", () => {
    const stale = at(260, 300, 0, 750);
    expect(fanOut(260, 300, [stale], 900, W)).toEqual({ x: 260, y: 300 });
  });

  it("leans toward the source, so a hit says where it came from", () => {
    const fromLeft = fanOut(260, 300, [], 0, W, { x: -1, y: 0 });
    const fromRight = fanOut(260, 300, [], 0, W, { x: 1, y: 0 });
    expect(fromLeft.x).toBeLessThan(260);
    expect(fromRight.x).toBeGreaterThan(260);
  });

  it("never places a number outside the viewport", () => {
    const live: LiveNumber[] = [];
    for (let i = 0; i < 8; i++) {
      const p = fanOut(W - 10, 300, live, 0, W); // anchored hard against the right edge
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(W);
      live.push(at(p.x, p.y));
    }
  });

  it("gives up gracefully rather than flinging a number away when the area is saturated", () => {
    const live: LiveNumber[] = [];
    for (let dy of [0, -26]) for (let k = -3; k <= 3; k++) live.push(at(260 + k * 30, 300 + dy));
    const p = fanOut(260, 300, live, 0, W);
    expect(gap(p, { x: 260, y: 300 })).toBeLessThan(30);
  });
});
