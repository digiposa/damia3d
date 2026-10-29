import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { TrainingMode } from "./TrainingMode";
import { Enemy } from "../entities/Enemy";
import { ASSASSIN_COCK, BERSERK_MOUSE, GOBLIN, type EnemyDef } from "../data/enemies";
import { forestPoint, forestWorld } from "../world/Forest";
import type { World } from "../world/World";

/** A canon encounter group waiting at a spot on the map, woken when the party comes near. */
interface Encounter {
  /** Spot on the track, in the Forest's local (u, v) frame. */
  u: number;
  v: number;
  group: EnemyDef[];
  triggered: boolean;
}

/** Wake distance: about where the spot comes into view, so the group walks in from the edge. */
const WAKE_RANGE = 14;

/**
 * Story mode — first test map: the Forest, submap 624 "Path Merchant", built in code like the
 * arena. Real-time fights happen in place: each canon encounter group of 624 stands further up the
 * track and engages when you come near.
 *
 * Still a test bed: it keeps Training's character picker and debug menu.
 */
export class StoryMode extends TrainingMode {
  override readonly name = "Story";

  private encounters: Encounter[] = [
    // The four 624 groups (docs/damia2D/features/locations/Forest.md).
    { u: 15, v: 1.5, group: [BERSERK_MOUSE, BERSERK_MOUSE], triggered: false },
    { u: 30, v: -2, group: [BERSERK_MOUSE, ASSASSIN_COCK], triggered: false },
    { u: 40, v: 2, group: [GOBLIN, ASSASSIN_COCK], triggered: false },
    { u: 56, v: 0.5, group: [BERSERK_MOUSE], triggered: false },
  ];

  protected override createWorld(): World {
    return forestWorld(this.scene);
  }

  protected override extraModels(): string[] {
    return ["berserk_mouse", "assassin_cock", "goblin"];
  }

  override update(dt: number): void {
    super.update(dt);
    if (this.paused) return;
    const p = this.player.position;
    for (const e of this.encounters) {
      if (e.triggered) continue;
      const at = forestPoint(e.u, e.v);
      if (Math.hypot(p.x - at.x, p.z - at.z) > WAKE_RANGE) continue;
      e.triggered = true;
      void this.spawnGroup(at, e.group);
    }
  }

  private async spawnGroup(at: Vector3, group: EnemyDef[]): Promise<void> {
    for (const def of group) await this.ensureEnemyAssets(def);
    if (this.scene.isDisposed) return;
    group.forEach((def, i) => {
      const a = (i / group.length) * Math.PI * 2;
      const pos = at.add(new Vector3(Math.cos(a) * 1.4, 0, Math.sin(a) * 1.4));
      this.world.clamp(pos);
      this.addEnemy(new Enemy(this.scene, def, pos));
    });
  }
}
