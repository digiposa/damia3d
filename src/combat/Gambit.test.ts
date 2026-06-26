import { describe, it, expect } from "vitest";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { GambitBrain, resolveGambit, nextGambitId, GAMBIT_CATALOG } from "./Gambit";
import type { CombatantView } from "./Brain";
import type { Enemy } from "../entities/Enemy";

/** Minimal duck-typed enemy: the gambit only reads alive / position / hp. */
function enemy(x: number, hp: number, alive = true): Enemy {
  return { alive, hp, position: new Vector3(x, 0, 0) } as unknown as Enemy;
}

const view = (over: Partial<CombatantView> = {}): CombatantView => ({
  position: new Vector3(0, 0, 0),
  reach: 2.3,
  ready: true,
  hpFraction: 1,
  canGuard: true,
  ...over,
});

describe("resolveGambit", () => {
  it("maps catalog ids to rules and drops 'none'", () => {
    expect(resolveGambit(["foeNear", "none", "selfLow30"])).toHaveLength(2);
    expect(resolveGambit(["none", "none"])).toHaveLength(0);
  });

  it("nextGambitId cycles through the catalog and wraps", () => {
    let id = "none";
    const seen = new Set<string>();
    for (let i = 0; i < GAMBIT_CATALOG.length; i++) {
      seen.add(id);
      id = nextGambitId(id);
    }
    expect(id).toBe("none"); // wrapped back to the start
    expect(seen.size).toBe(GAMBIT_CATALOG.length);
  });
});

describe("GambitBrain (top-down rule evaluation)", () => {
  it("falls through to idle when no rule matches", () => {
    const brain = new GambitBrain(resolveGambit(["foeNear"]));
    expect(brain.decide(view(), { enemies: [] })).toEqual({ kind: "idle" });
  });

  it("attacks the nearest foe in reach when ready", () => {
    const e = enemy(1, 100);
    const brain = new GambitBrain(resolveGambit(["foeNear"]));
    expect(brain.decide(view(), { enemies: [e] })).toEqual({ kind: "attack", target: e });
  });

  it("'foeLow' targets the lowest-HP foe", () => {
    const strong = enemy(1, 100);
    const weak = enemy(1.2, 10);
    const brain = new GambitBrain(resolveGambit(["foeLow"]));
    expect(brain.decide(view(), { enemies: [strong, weak] })).toMatchObject({ kind: "attack", target: weak });
  });

  it("'foeHigh' targets the highest-HP foe", () => {
    const strong = enemy(1, 100);
    const weak = enemy(1.2, 10);
    const brain = new GambitBrain(resolveGambit(["foeHigh"]));
    expect(brain.decide(view(), { enemies: [strong, weak] })).toMatchObject({ kind: "attack", target: strong });
  });

  it("guards first when HP is low (rule order matters)", () => {
    const e = enemy(1, 100);
    const brain = new GambitBrain(resolveGambit(["selfLow50", "foeNear"]));
    // Healthy: skip the guard rule, attack.
    expect(brain.decide(view({ hpFraction: 0.9 }), { enemies: [e] })).toMatchObject({ kind: "attack" });
    // Hurt: the guard rule fires first.
    expect(brain.decide(view({ hpFraction: 0.3 }), { enemies: [e] })).toEqual({ kind: "guard" });
  });

  it("skips the guard rule when guard is on cooldown", () => {
    const e = enemy(1, 100);
    const brain = new GambitBrain(resolveGambit(["selfLow50", "foeNear"]));
    expect(brain.decide(view({ hpFraction: 0.2, canGuard: false }), { enemies: [e] })).toMatchObject({
      kind: "attack",
    });
  });
});
