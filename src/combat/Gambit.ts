import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import type { Enemy } from "../entities/Enemy";
import type { Brain, CombatantView, CombatWorld, Decision } from "./Brain";

// --- Simplified gambit system (FF12-lite) -----------------------------------
//
// A gambit is an ordered list of "target → action" rules. Each frame the brain walks the
// list top-down and fires the first rule whose target resolves and whose action applies —
// exactly like FF12, pared down to the actions our combat supports today (Attack a chosen
// foe, or Guard when hurt). It plugs into the same {@link Brain} seam the AutoBrain uses, so
// nothing else in the combat loop changes. Rules are edited in the Training menu via a fixed
// catalog (see {@link GAMBIT_CATALOG}); the mode resolves catalog ids into a GambitBrain.

/** How a rule chooses its subject. */
export type GambitTarget =
  | { who: "foe"; pick: "nearest" | "lowestHp" | "highestHp" }
  | { who: "self"; cond: "hpBelow"; pct: number };

export type GambitAction = "attack" | "guard";

export interface GambitRule {
  target: GambitTarget;
  action: GambitAction;
}

/** A selectable gambit entry: a stable id, an i18n label key, and the rule it sets ("none" = empty). */
export interface GambitCatalogEntry {
  id: string;
  labelKey: string;
  rule: GambitRule | null;
}

/** The fixed catalog the menu cycles through (kept small and touch-friendly). */
export const GAMBIT_CATALOG: GambitCatalogEntry[] = [
  { id: "none", labelKey: "gambit.none", rule: null },
  { id: "foeNear", labelKey: "gambit.foeNear", rule: { target: { who: "foe", pick: "nearest" }, action: "attack" } },
  { id: "foeLow", labelKey: "gambit.foeLow", rule: { target: { who: "foe", pick: "lowestHp" }, action: "attack" } },
  { id: "foeHigh", labelKey: "gambit.foeHigh", rule: { target: { who: "foe", pick: "highestHp" }, action: "attack" } },
  { id: "selfLow30", labelKey: "gambit.selfLow30", rule: { target: { who: "self", cond: "hpBelow", pct: 0.3 }, action: "guard" } },
  { id: "selfLow50", labelKey: "gambit.selfLow50", rule: { target: { who: "self", cond: "hpBelow", pct: 0.5 }, action: "guard" } },
];

/** Default rule set for a fresh party member: attack the nearest foe (like the AutoBrain). */
export const DEFAULT_GAMBIT_IDS = ["foeNear", "none", "none"];

export function gambitEntry(id: string): GambitCatalogEntry {
  return GAMBIT_CATALOG.find((e) => e.id === id) ?? GAMBIT_CATALOG[0];
}

/** Next catalog id, wrapping — used by the menu to cycle a rule slot on tap. */
export function nextGambitId(id: string): string {
  const i = GAMBIT_CATALOG.findIndex((e) => e.id === id);
  return GAMBIT_CATALOG[(i + 1) % GAMBIT_CATALOG.length].id;
}

/** Resolve an ordered list of catalog ids into the (non-empty) rules they map to. */
export function resolveGambit(ids: string[]): GambitRule[] {
  return ids.map((id) => gambitEntry(id).rule).filter((r): r is GambitRule => r !== null);
}

/** Pick a foe per the selector, among living enemies within `maxDist` (undefined if none). */
function pickFoe(
  from: Vector3,
  enemies: Enemy[],
  maxDist: number,
  pick: "nearest" | "lowestHp" | "highestHp",
): Enemy | undefined {
  const inRange = enemies.filter((e) => e.alive && Vector3.Distance(from, e.position) <= maxDist);
  if (inRange.length === 0) return undefined;
  if (pick === "nearest") {
    return inRange.reduce((best, e) =>
      Vector3.Distance(from, e.position) < Vector3.Distance(from, best.position) ? e : best,
    );
  }
  const cmp = pick === "lowestHp" ? (a: number, b: number) => a < b : (a: number, b: number) => a > b;
  return inRange.reduce((best, e) => (cmp(e.hp, best.hp) ? e : best));
}

/**
 * A {@link Brain} driven by an ordered gambit list. Evaluates rules top-down and returns the
 * first applicable {@link Decision}; falls through to idle when none match.
 */
export class GambitBrain implements Brain {
  constructor(private rules: GambitRule[], private aggroRange = 18) {}

  decide(self: CombatantView, world: CombatWorld): Decision {
    for (const rule of this.rules) {
      const d = this.evalRule(rule, self, world);
      if (d) return d;
    }
    return { kind: "idle" };
  }

  private evalRule(rule: GambitRule, self: CombatantView, world: CombatWorld): Decision | null {
    if (rule.target.who === "self") {
      if (rule.target.cond === "hpBelow" && self.hpFraction < rule.target.pct) {
        if (rule.action === "guard") return self.canGuard ? { kind: "guard" } : null;
      }
      return null;
    }

    const target = pickFoe(self.position, world.enemies, this.aggroRange, rule.target.pick);
    if (!target || rule.action !== "attack") return null;
    const dist = Vector3.Distance(self.position, target.position);
    if (dist > self.reach) return { kind: "approach", target };
    return self.ready ? { kind: "attack", target } : { kind: "idle", target };
  }
}
