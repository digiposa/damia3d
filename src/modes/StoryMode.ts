import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { TrainingMode } from "./TrainingMode";
import { Enemy } from "../entities/Enemy";
import { ASSASSIN_COCK, BERSERK_MOUSE, GOBLIN, TRENT, type EnemyDef } from "../data/enemies";
import { FOREST_ZONES, forestPoint, forestU, forestWorld, trackPointAt, type ForestWorld } from "../world/Forest";
import type { World } from "../world/World";

/** A canon encounter group waiting at a spot on the map, woken when the party comes near. */
interface Encounter {
  /** Spot on the track, in the Forest's local (u, v) frame. */
  u: number;
  v: number;
  group: EnemyDef[];
  triggered: boolean;
  /** The group's enemies once spawned (to clear them when leaving a screen in split play). */
  spawned: Enemy[];
}

/** Wake distance: about where the spot comes into view, so the group walks in from the edge. */
const WAKE_RANGE = 14;
/** How close to a screen's end (along the track) counts as walking out of it, in split play. */
const EXIT_REACH = 0.9;
/** Fade to / from black on a screen change, seconds each way. */
const FADE = 0.35;

/**
 * Story mode — test map: the Forest, built in code like the arena. Real-time fights happen in
 * place: each canon encounter group stands further along the track and engages when you come near.
 *
 * Two ways to play the same map, to compare:
 *  - {@link StoryMode}: one seamless map, the camera simply follows you through the whole wood;
 *  - {@link StorySplitMode}: the PS1 way — one screen at a time ({@link FOREST_ZONES}); walk off the
 *    end of the track and the screen fades to black and opens on the next one.
 *
 * Still a test bed: it keeps Training's character picker and debug menu.
 */
export class StoryMode extends TrainingMode {
  override readonly name: string = "Story";
  /** Play the map screen by screen (fade between them) instead of as one seamless map. */
  protected split = false;

  private forest?: ForestWorld;
  private zone = 0;
  private fader?: HTMLDivElement;
  private changing = false;

  private encounters: Encounter[] = [
    // Forest groups (docs/damia2D/features/locations/Forest.md), placed along the five screens.
    { u: 15, v: 1.5, group: [BERSERK_MOUSE, BERSERK_MOUSE], triggered: false, spawned: [] },
    { u: 30, v: -2, group: [BERSERK_MOUSE, ASSASSIN_COCK], triggered: false, spawned: [] },
    { u: 59, v: 1, group: [GOBLIN, ASSASSIN_COCK], triggered: false, spawned: [] }, // past the first trunk
    { u: 80, v: -2, group: [BERSERK_MOUSE], triggered: false, spawned: [] }, // in the maze…
    { u: 95, v: -8, group: [TRENT], triggered: false, spawned: [] }, // …down a dead end
    { u: 129, v: 0, group: [GOBLIN, ASSASSIN_COCK], triggered: false, spawned: [] }, // before the fork
  ];

  protected override createWorld(): World {
    this.forest = forestWorld(this.scene);
    if (this.split) this.forest.setZone(0);
    return this.forest;
  }

  protected override extraModels(): string[] {
    return ["berserk_mouse", "assassin_cock", "goblin", "trent"];
  }

  override update(dt: number): void {
    super.update(dt);
    if (this.paused || this.changing) return;
    const p = this.player.position;
    for (const e of this.encounters) {
      if (e.triggered || (this.split && !this.inZone(e.u, this.zone))) continue;
      const at = forestPoint(e.u, e.v);
      if (Math.hypot(p.x - at.x, p.z - at.z) > WAKE_RANGE) continue;
      e.triggered = true;
      void this.spawnGroup(e, at);
    }
    if (this.split) this.checkExit();
  }

  private inZone(u: number, zone: number): boolean {
    const z = FOREST_ZONES[zone];
    return u >= z.u0 && u < z.u1;
  }

  private async spawnGroup(e: Encounter, at: Vector3): Promise<void> {
    for (const def of e.group) await this.ensureEnemyAssets(def);
    if (this.scene.isDisposed || !e.triggered) return;
    e.group.forEach((def, i) => {
      const a = (i / e.group.length) * Math.PI * 2;
      const pos = at.add(new Vector3(Math.cos(a) * 1.4, 0, Math.sin(a) * 1.4));
      this.world.clamp(pos);
      const enemy = new Enemy(this.scene, def, pos);
      e.spawned.push(enemy);
      this.addEnemy(enemy);
    });
  }

  // --- Split play ---------------------------------------------------------------------

  /** Walked to the end of the screen (the clamp holds you just inside it)? Change screen. */
  private checkExit(): void {
    const u = forestU(this.player.position);
    const z = FOREST_ZONES[this.zone];
    if (u > z.u1 - EXIT_REACH && this.zone < FOREST_ZONES.length - 1) void this.changeZone(this.zone + 1, "start");
    else if (u < z.u0 + EXIT_REACH && this.zone > 0) void this.changeZone(this.zone - 1, "end");
  }

  /** Fade out, swap screens (decor, bounds, enemies), enter at the matching end, fade in. */
  private async changeZone(next: number, enterAt: "start" | "end"): Promise<void> {
    this.changing = true;
    this.paused = true;
    await this.fade(1);
    if (this.scene.isDisposed) return;

    // Foes left behind go away; their groups wait again for your next visit (like the console's
    // screens, which reset their encounters when you leave).
    for (const e of this.encounters) {
      const alive = e.spawned.filter((en) => this.enemies.includes(en));
      if (!alive.length) continue;
      for (const en of alive) this.removeEnemy(en);
      e.spawned = [];
      e.triggered = false;
    }
    this.clearNav();

    this.zone = next;
    this.forest?.setZone(next);
    const z = FOREST_ZONES[next];
    const entry = trackPointAt(enterAt === "start" ? z.u0 + 2.5 : z.u1 - 2.5);
    this.party.forEach((m, i) => {
      const p = entry.add(this.formationOffset(i));
      this.world.clamp(p);
      m.position.copyFrom(p);
    });
    this.camera.follow(this.player.position, 1); // snap: no pan across the cut

    await this.fade(0);
    this.paused = false;
    this.changing = false;
  }

  /** Fade the black curtain to `to` (0 clear … 1 black). */
  private fade(to: number): Promise<void> {
    if (!this.fader) {
      const d = document.createElement("div");
      Object.assign(d.style, {
        position: "fixed",
        inset: "0",
        background: "#000",
        opacity: "0",
        pointerEvents: "none",
        transition: `opacity ${FADE}s ease`,
        zIndex: "40",
      } satisfies Partial<CSSStyleDeclaration>);
      document.body.appendChild(d);
      this.fader = d;
    }
    const d = this.fader;
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        d.style.opacity = String(to);
        window.setTimeout(resolve, FADE * 1000 + 30);
      });
    });
  }

  override dispose(): void {
    this.fader?.remove();
    super.dispose();
  }
}

/** The same Forest played the PS1 way: screen by screen, with a fade between them. */
export class StorySplitMode extends StoryMode {
  protected override split = true;
}
