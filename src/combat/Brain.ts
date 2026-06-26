import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import type { Enemy } from "../entities/Enemy";

// --- Combatant brains -------------------------------------------------------
//
// A brain is the single decision point for a (non-player-controlled) combatant: given a
// snapshot of itself and the world, it returns the action to take this frame. This is the
// seam the future party plugs into — today there is one {@link AutoBrain} (chase-and-strike
// the nearest enemy), and a simplified gambit system will later be just another Brain that
// evaluates a list of condition→action rules. The mode executes the returned Decision; the
// brain never mutates anything.

/** Read-only snapshot of the deciding combatant. */
export interface CombatantView {
  readonly position: Vector3;
  /** Attack distance (melee short, ranged long). */
  readonly reach: number;
  /** True when the ATB gauge is full and the combatant may act. */
  readonly ready: boolean;
  /** Current HP as a fraction of max (0–1), for self-condition gambits. */
  readonly hpFraction: number;
  /** True when the Guard stance can be entered (off cooldown, not active). */
  readonly canGuard: boolean;
  /** True when the Dragoon Spirit is full and the member can transform. */
  readonly canTransform: boolean;
  /** True when a healing item is available to use. */
  readonly hasItem: boolean;
  /** True when Dragoon magic can be cast (transformed + enough MP). */
  readonly canCastMagic: boolean;
}

/** Read-only snapshot of the battlefield the brain may reason about. */
export interface CombatWorld {
  readonly enemies: Enemy[];
}

export type Decision =
  /** Hold position (optionally facing a target while the gauge charges). */
  | { kind: "idle"; target?: Enemy }
  /** Walk toward the target (out of reach). */
  | { kind: "approach"; target: Enemy }
  /** Strike the target (in reach and ready). */
  | { kind: "attack"; target: Enemy }
  /** Enter the defensive Guard stance (self-preservation). */
  | { kind: "guard" }
  /** Transform into Dragoon form (spends the full SP gauge). */
  | { kind: "transform" }
  /** Use a healing item on self. */
  | { kind: "item" }
  /** Cast Dragoon magic at the target. */
  | { kind: "magic"; target: Enemy };

export interface Brain {
  decide(self: CombatantView, world: CombatWorld): Decision;
}

/** Nearest living enemy to `from` within `maxDist` (undefined if none). */
function nearestEnemy(from: Vector3, enemies: Enemy[], maxDist: number): Enemy | undefined {
  let best: Enemy | undefined;
  let bestDist = maxDist;
  for (const e of enemies) {
    if (!e.alive) continue;
    const d = Vector3.Distance(from, e.position);
    if (d <= bestDist) {
      best = e;
      bestDist = d;
    }
  }
  return best;
}

/**
 * Auto-battle brain: lock onto the nearest enemy within aggro range, walk into reach,
 * and strike when the ATB gauge is ready (otherwise hold and face it while it charges).
 */
export class AutoBrain implements Brain {
  constructor(private aggroRange = 18) {}

  decide(self: CombatantView, world: CombatWorld): Decision {
    const target = nearestEnemy(self.position, world.enemies, this.aggroRange);
    if (!target) return { kind: "idle" };
    const dist = Vector3.Distance(self.position, target.position);
    if (dist > self.reach) return { kind: "approach", target };
    return self.ready ? { kind: "attack", target } : { kind: "idle", target };
  }
}
