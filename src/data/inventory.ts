import type { Bearer } from "./bearers";
import { dragoonClass } from "./dragoonClasses";

/**
 * Shared equipment stash: how many copies of each equip id the party owns (a common inventory,
 * LoD-style). Ownership is by COUNT — a copy worn by one member isn't available to another, so one
 * Bastard Sword means Dart OR Zieg, two means both can wear one. This class only tracks the totals
 * owned; the mode derives per-slot availability from who is currently wearing what.
 *
 * Training ignores this entirely (all gear is free — a sandbox). Survival/Story consult it, and
 * every acquisition source (Story loot/chests/shops, Survival boss drops) just calls {@link add}.
 */
export class EquipInventory {
  private counts = new Map<string, number>();
  /** Bearers whose starting loadout has already been granted (so party rebuilds don't re-count). */
  private granted = new Set<string>();

  /** Grant a bearer their class starting loadout, once — so a member always owns their own kit.
   *  Two members sharing a loadout item each contribute a copy (they each started with one). */
  grantLoadout(bearer: Bearer): void {
    if (this.granted.has(bearer.id)) return;
    this.granted.add(bearer.id);
    const cls = dragoonClass(bearer.classId);
    for (const id of Object.values(cls?.loadout ?? {})) if (id) this.add(id);
  }

  /** Add `n` copies of an equip id to the stash (loot / reward card / shop purchase). */
  add(id: string, n = 1): void {
    this.counts.set(id, (this.counts.get(id) ?? 0) + n);
  }

  /** Total copies owned (0 if never acquired). */
  count(id: string): number {
    return this.counts.get(id) ?? 0;
  }
}
