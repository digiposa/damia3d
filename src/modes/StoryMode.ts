import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { TrainingMode } from "./TrainingMode";
import { Enemy } from "../entities/Enemy";
import { ASSASSIN_COCK, BERSERK_MOUSE, GOBLIN, TRENT, type EnemyDef } from "../data/enemies";
import { HEALING_POTION, ATTACK_ITEM_BY_ID, type ItemDef } from "../data/items";
import { t } from "../core/i18n";
import { SpeechBubble } from "../ui/SpeechBubble";
import { MERCHANT_SPOT, SHANA_SCENE_SPOT, forestPoint, forestWorld, type ForestWorld } from "../world/Forest";
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
/** Walk this close to a chest to open it. */
const CHEST_REACH = 1.6;
/** Walk this close to someone to hear them (the bubble closes a little further out). */
const TALK_REACH = 3;
const TALK_LEAVE = 4.5;

/** What each Forest chest holds (wiki: the four Forest chests). */
const CHEST_LOOT: Record<string, { item?: () => ItemDef | undefined; gold?: number; labelKey?: string }> = {
  healingPotion: { item: () => HEALING_POTION },
  charmPotion: { labelKey: "story.item.charmPotion" }, // not in the item system yet
  gold20: { gold: 20 },
  burnOut: { item: () => ATTACK_ITEM_BY_ID.get("burnOut") },
};

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

  private forest?: ForestWorld;
  private bubble?: SpeechBubble;
  /** Who the open bubble belongs to. */
  private talking?: "merchant" | "shana";
  private opened = new Set<string>();
  private shanaSeen = false;

  protected override createWorld(): World {
    this.forest = forestWorld(this.scene);
    this.bubble = new SpeechBubble(this.scene);
    return this.forest;
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
    this.updateChests();
    this.updateTalk();
  }

  /** Walk up to a chest to open it: the lid swings, the loot goes to the party. */
  private updateChests(): void {
    if (!this.forest) return;
    const p = this.player.position;
    for (const [id, at] of this.forest.chests) {
      if (this.opened.has(id) || Math.hypot(p.x - at.x, p.z - at.z) > CHEST_REACH) continue;
      this.opened.add(id);
      this.forest.openChest(id);
      const loot = CHEST_LOOT[id];
      let label = "";
      const def = loot?.item?.();
      if (def) {
        const stock = this.items.find((s) => s.def.id === def.id);
        if (stock) stock.count++;
        else this.items.push({ def, count: 1 });
        label = t(def.nameKey);
      } else if (loot?.gold) {
        this.gold += loot.gold;
        label = t("story.chest.gold", { n: loot.gold });
      } else if (loot?.labelKey) {
        label = t(loot.labelKey);
      }
      const text = t("story.chest.found", { item: label });
      this.popText(at.add(new Vector3(0, 1.2, 0)), text, "#f0d070", true);
      this.combatLog?.push(text, "#f0d070");
    }
  }

  /** NPC lines and story beats: a bubble opens when you come near, closes as you walk off. */
  private updateTalk(): void {
    if (!this.forest || !this.bubble) return;
    const p = this.player.position;
    const near = (spot: { u: number; v: number }, r: number): boolean => {
      const at = forestPoint(spot.u, spot.v);
      return Math.hypot(p.x - at.x, p.z - at.z) < r;
    };
    if (this.talking === "merchant" && !near(MERCHANT_SPOT, TALK_LEAVE)) this.endTalk();
    if (this.talking === "shana" && !near(SHANA_SCENE_SPOT, TALK_LEAVE + 2)) this.endTalk();
    if (!this.talking && near(MERCHANT_SPOT, TALK_REACH)) {
      this.talking = "merchant";
      this.bubble.show(this.forest.merchantHead, t("story.merchant"), t("story.merchant.line"));
    } else if (!this.talking && !this.shanaSeen && near(SHANA_SCENE_SPOT, TALK_REACH + 1)) {
      this.talking = "shana";
      this.shanaSeen = true;
    }
    // Dart's memory follows Dart (re-anchored over the player each frame); the merchant stays put.
    if (this.talking === "shana") this.bubble.show(this.player.position.add(new Vector3(0, 2.2, 0)), t("story.dart"), t("story.shana.line"));
    else this.bubble.update();
  }

  private endTalk(): void {
    this.talking = undefined;
    this.bubble?.hide();
  }

  override dispose(): void {
    this.bubble?.dispose();
    super.dispose();
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
