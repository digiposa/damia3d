import { describe, it, expect } from "vitest";
import { launch } from "./FloatingText";

/** Where a number sits, relative to its anchor, `t` seconds into its own flight. */
const at = (v: { vx: number; vy: number }, t: number): { x: number; y: number } => ({
  x: v.vx * t,
  y: v.vy * t + 0.5 * 320 * t * t, // GRAVITY
});

/** Where the `index`-th number of a burst is `wall` seconds after the burst started — i.e. with its
 *  stream delay taken off. Before its turn it has not been released yet. */
const atWall = (index: number, wall: number): { x: number; y: number } | null => {
  const v = launch(index);
  const t = wall - v.delayMs / 1000;
  return t <= 0 ? null : at(v, t);
};

const dist = (a: { x: number; y: number }, b: { x: number; y: number }): number => Math.hypot(a.x - b.x, a.y - b.y);

describe("launch", () => {
  it("throws consecutive numbers to opposite sides", () => {
    expect(Math.sign(launch(0).vx)).toBe(-Math.sign(launch(1).vx));
    expect(Math.sign(launch(2).vx)).toBe(-Math.sign(launch(3).vx));
  });

  it("opens the burst on the attacker's side", () => {
    expect(launch(0, { x: -1, y: 0 }).vx).toBeLessThan(0);
    expect(launch(0, { x: 1, y: 0 }).vx).toBeGreaterThan(0);
  });

  it("throws each further pair wider, so a big burst fans out", () => {
    expect(Math.abs(launch(2).vx)).toBeGreaterThan(Math.abs(launch(0).vx));
    expect(Math.abs(launch(4).vx)).toBeGreaterThan(Math.abs(launch(2).vx));
  });

  it("streams a burst instead of releasing it all at once", () => {
    // WoW's trick: simultaneous hits are held back a few dozen ms each, so they read as a spray.
    expect(launch(0).delayMs).toBe(0);
    for (let i = 1; i < 6; i++) expect(launch(i).delayMs).toBeGreaterThan(launch(i - 1).delayMs);
  });

  it("never lets two numbers of a burst coincide", () => {
    // The case that used to show as a block of identical numbers over the victim. They start from
    // the same anchor, so they ARE close early on — what must never happen is one hiding another.
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        for (let wall = 0.1; wall <= 1; wall += 0.05) {
          const a = atWall(i, wall);
          const b = atWall(j, wall);
          if (!a || !b) continue; // one of them has not been released yet
          expect(dist(a, b)).toBeGreaterThan(10);
        }
      }
    }
  });

  it("keeps pulling a burst apart as it flies", () => {
    // This is what carries the legibility: separation comes from movement, not from spawn placement.
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        const early = dist(atWall(i, 0.35)!, atWall(j, 0.35)!);
        const late = dist(atWall(i, 0.9)!, atWall(j, 0.9)!);
        expect(late).toBeGreaterThan(early);
      }
    }
  });

  it("arcs: rises, tops out, then eases back down", () => {
    const v = launch(0);
    const rise = at(v, 0.3).y;
    const top = at(v, 0.58).y; // apex ≈ LAUNCH_Y / GRAVITY
    const fall = at(v, 0.9).y;
    expect(top).toBeLessThan(rise); // screen y grows downward: lower value = higher up
    expect(fall).toBeGreaterThan(top);
    expect(fall).toBeLessThan(0); // still above where it started when it fades out
  });
});
