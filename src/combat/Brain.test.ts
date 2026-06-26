import { describe, it, expect } from "vitest";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { AutoBrain, type CombatantView } from "./Brain";
import type { Enemy } from "../entities/Enemy";

/** Minimal duck-typed enemy: the brain only reads `alive` and `position`. */
function enemy(x: number, z: number, alive = true): Enemy {
  return { alive, position: new Vector3(x, 0, z) } as unknown as Enemy;
}

const self = (ready: boolean, reach = 2.3): CombatantView => ({
  position: new Vector3(0, 0, 0),
  reach,
  ready,
  hpFraction: 1,
  canGuard: true,
});

describe("AutoBrain", () => {
  it("idles when there are no enemies", () => {
    expect(new AutoBrain().decide(self(true), { enemies: [] })).toEqual({ kind: "idle" });
  });

  it("approaches an enemy out of reach", () => {
    const e = enemy(10, 0);
    expect(new AutoBrain().decide(self(true), { enemies: [e] })).toEqual({ kind: "approach", target: e });
  });

  it("attacks an enemy in reach when ready", () => {
    const e = enemy(1, 0);
    expect(new AutoBrain().decide(self(true), { enemies: [e] })).toEqual({ kind: "attack", target: e });
  });

  it("holds (idle, facing) when in reach but the gauge is still charging", () => {
    const e = enemy(1, 0);
    expect(new AutoBrain().decide(self(false), { enemies: [e] })).toEqual({ kind: "idle", target: e });
  });

  it("ignores dead enemies and picks the nearest living one", () => {
    const dead = enemy(1, 0, false);
    const far = enemy(12, 0);
    const near = enemy(5, 0);
    expect(new AutoBrain().decide(self(true), { enemies: [dead, far, near] })).toEqual({
      kind: "approach",
      target: near,
    });
  });

  it("respects the aggro range (ignores enemies beyond it)", () => {
    const e = enemy(50, 0);
    expect(new AutoBrain(18).decide(self(true), { enemies: [e] })).toEqual({ kind: "idle" });
  });
});
