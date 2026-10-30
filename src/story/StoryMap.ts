import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

import type { EnemyDef } from "../data/enemies";
import type { ItemDef } from "../data/items";
import type { HumanoidOptions } from "../entities/humanoid";
import type { World } from "../world/World";

/**
 * A Story map: a combat World plus what makes it a place in the story — where you can enter
 * from, its random encounters (if any), and its script (scenes, NPCs, chests, exits), written
 * against the {@link StoryApi} the Story mode provides.
 */
export interface StoryMap {
  world: World;
  /** Named spawn points (e.g. "start", "fromForest"). */
  entries: Record<string, Vector3>;
  /** Random encounters at this spot (canon distance counter), or null for none (towns). */
  encounterAt?(p: Vector3): { rate: number; formations: EnemyDef[][] } | null;
  /** Models to preload with the party (the map's enemies and props). */
  models?: string[];
  /** Set the map up (NPCs, chests, triggers, exits, opening scene). Called once play starts. */
  start(api: StoryApi, entry: string): void;
}

export type MapFactory = (scene: Scene) => StoryMap;

/** A non-player figure placed by a map (placeholder humanoid until its GLB exists). */
export interface NpcHandle {
  readonly position: Vector3;
  /** Point over the head, for speech bubbles and prompts. */
  readonly head: Vector3;
  /** Walk to a point (resolves on arrival). */
  walkTo(to: Vector3, speed?: number): Promise<void>;
  /** Turn to face a point. */
  face(at: Vector3): void;
  setVisible(on: boolean): void;
  /** Lie down / stand up (wounded villagers). */
  setLying(on: boolean): void;
}

/** One enemy of a scripted fight: who, and where it stands while the scene plays. */
export interface BattleUnit {
  def: EnemyDef;
  at: Vector3;
}

/** What a map's script can do. Everything that takes time returns a Promise: scripts read top-down. */
export interface StoryApi {
  readonly scene: Scene;
  /** The controlled hero's feet. */
  readonly hero: Vector3;
  /** Hand the controls to the scene (no player input) / give them back. */
  lock(): void;
  unlock(): void;
  /** A line of dialogue (PS1 box). */
  say(speaker: string, text: string): Promise<void>;
  wait(seconds: number): Promise<void>;
  /** Fade the screen to black (1) or back (0). */
  fade(to: number, seconds?: number): Promise<void>;
  /** Walk the hero to a point. */
  walkHero(to: Vector3): Promise<void>;
  /** Place an NPC. */
  npc(name: string, at: Vector3, look?: Partial<HumanoidOptions>): NpcHandle;
  /** Place a scripted fight's enemies, inactive (for the scene before the fight). */
  stage(units: BattleUnit[]): void;
  /** Start the staged fight (or stage + start `units`); resolves when every foe is down. */
  battle(units?: BattleUnit[]): Promise<void>;
  /** Run `run` once when the hero first comes within `radius` of `at` (and `when` holds). */
  trigger(at: Vector3, radius: number, run: () => Promise<void> | void, when?: () => boolean): void;
  /** Offer an action ("Open", "Talk") on the prompt when the hero is near `at`. */
  interact(at: Vector3, label: string, act: () => Promise<void> | void, when?: () => boolean, reach?: number): void;
  /** A chest: opens via the prompt, gives its loot once (remembered in the save). */
  chest(id: string, at: Vector3, loot: { item?: ItemDef; gold?: number }, onOpen?: () => void): void;
  /** A signpost bubble over the hero while they stand within `radius` of `at`. */
  sign(at: Vector3, radius: number, title: string, text: string): void;
  /** Leave for another map (fade, save, rebuild). */
  goto(map: string, entry: string): Promise<void>;
  hasFlag(id: string): boolean;
  setFlag(id: string): void;
  addItem(item: ItemDef, count?: number): void;
  readonly gold: number;
  addGold(n: number): void;
  /** Spend gold; false if there isn't enough. */
  spend(n: number): boolean;
  /** Count of an item the party owns. */
  owned(item: ItemDef): number;
  /** Floating text over a point. */
  pop(at: Vector3, text: string, color?: string): void;
  /** Pause the game behind a modal (a shop) / resume. */
  setPaused(on: boolean): void;
  /** Reset the random-encounter counter (Charm Potion). */
  resetEncounters(): void;
}
