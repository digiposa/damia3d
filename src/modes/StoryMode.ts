import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { TrainingMode } from "./TrainingMode";
import { Enemy } from "../entities/Enemy";
import { ASSASSIN_COCK, BERSERK_MOUSE, GOBLIN, TRENT, type EnemyDef } from "../data/enemies";
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
 * Story mode — test map: the Forest, built in code like the arena. Real-time fights happen in
 * place: each canon encounter group stands further along the track and engages when you come near.
 *
 * One seamless map: the camera simply follows you through the whole wood, from the merchant's
 * path to the fork (a split-into-screens variant was tried and dropped — seamless plays better).
 *
 * Still a test bed: it keeps Training's character picker and debug menu.
 */
export class StoryMode extends TrainingMode {
  override readonly name: string = "Story";

  private encounters: Encounter[] = [
    // Forest groups (docs/damia2D/features/locations/Forest.md), placed along the five areas.
    { u: 15, v: 1.5, group: [BERSERK_MOUSE, BERSERK_MOUSE], triggered: false },
    { u: 30, v: -2, group: [BERSERK_MOUSE, ASSASSIN_COCK], triggered: false },
    { u: 59, v: 1, group: [GOBLIN, ASSASSIN_COCK], triggered: false }, // past the first trunk
    { u: 80, v: -2, group: [BERSERK_MOUSE], triggered: false }, // in the maze…
    { u: 95, v: -8, group: [TRENT], triggered: false }, // …down a dead end
    { u: 129, v: 0, group: [GOBLIN, ASSASSIN_COCK], triggered: false }, // before the fork
  ];

  protected override createWorld(): World {
    return forestWorld(this.scene);
  }

  protected override extraModels(): string[] {
    return ["berserk_mouse", "assassin_cock", "goblin", "trent"];
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
      void this.spawnGroup(e, at);
    }
  }

  private async spawnGroup(e: Encounter, at: Vector3): Promise<void> {
    for (const def of e.group) await this.ensureEnemyAssets(def);
    if (this.scene.isDisposed) return;
    e.group.forEach((def, i) => {
      const a = (i / e.group.length) * Math.PI * 2;
      const pos = at.add(new Vector3(Math.cos(a) * 1.4, 0, Math.sin(a) * 1.4));
      this.world.clamp(pos);
      this.addEnemy(new Enemy(this.scene, def, pos));
    });
  }
}
