import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { TrainingMode } from "./TrainingMode";
import { Enemy } from "../entities/Enemy";
import { ASSASSIN_COCK, BERSERK_MOUSE, GOBLIN, TRENT, type EnemyDef } from "../data/enemies";
import { HEALING_POTION, ATTACK_ITEM_BY_ID, type ItemDef } from "../data/items";
import { t } from "../core/i18n";
import { SpeechBubble } from "../ui/SpeechBubble";
import { InteractPrompt } from "../ui/InteractPrompt";
import { ShopPanel, type ShopLine } from "../ui/ShopPanel";
import {
  MAP_END_U,
  MAP_START_U,
  MERCHANT_SPOT,
  SHANA_SCENE_SPOT,
  forestPoint,
  forestUV,
  forestWorld,
  type ForestWorld,
} from "../world/Forest";
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
/** How close a chest / the merchant must be for the "interact" prompt to offer it. */
const CHEST_REACH = 1.9;
const TALK_REACH = 2.8;
/** Walk this far from a story beat or a map exit and its bubble closes. */
const TALK_LEAVE = 4.5;
/** How close to the end of the map counts as "at the exit". */
const EXIT_REACH = 1.5;

/** The merchant's wares (wiki: the Forest Item Shop). Body Purifier and Charm Potion are canon
 *  but not in the item system yet — listed, not sold. */
const SHOP: { id: string; price: number; item?: () => ItemDef | undefined; nameKey: string; blurbKey: string }[] = [
  { id: "healingPotion", price: 10, item: () => HEALING_POTION, nameKey: "item.healingPotion", blurbKey: "story.shop.healingPotion" },
  { id: "burnOut", price: 10, item: () => ATTACK_ITEM_BY_ID.get("burnOut"), nameKey: "item.burnOut", blurbKey: "story.shop.burnOut" },
  { id: "bodyPurifier", price: 10, nameKey: "story.item.bodyPurifier", blurbKey: "story.shop.bodyPurifier" },
  { id: "charmPotion", price: 4, nameKey: "story.item.charmPotionName", blurbKey: "story.shop.charmPotion" },
];

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
  private prompt?: InteractPrompt;
  private shop?: ShopPanel;
  /** What the prompt currently offers (acted on by the prompt, or the E key). */
  private offer?: () => void;
  /** Who the open bubble belongs to. */
  private talking?: "shana" | "exit";
  private opened = new Set<string>();
  private shanaSeen = false;

  protected override createWorld(): World {
    this.forest = forestWorld(this.scene);
    this.bubble = new SpeechBubble(this.scene);
    this.prompt = new InteractPrompt(this.scene, () => this.offer?.());
    this.shop = new ShopPanel(
      {
        lines: () => this.shopLines(),
        gold: () => this.gold,
        buy: (id) => this.buy(id),
      },
      () => {
        this.paused = false;
      },
    );
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
    this.updateInteract(dt);
    this.updateTalk();
  }

  /**
   * The nearest thing you can act on — an unopened chest, the merchant — gets the prompt; acting
   * (tap the prompt, or E) opens it / opens his shop.
   */
  private updateInteract(dt: number): void {
    if (!this.forest || !this.prompt) return;
    const p = this.player.position;
    let best: { d: number; at: Vector3; label: string; act: () => void } | undefined;
    for (const [id, at] of this.forest.chests) {
      if (this.opened.has(id)) continue;
      const d = Math.hypot(p.x - at.x, p.z - at.z);
      if (d < CHEST_REACH && (!best || d < best.d)) best = { d, at: at.add(new Vector3(0, 1.1, 0)), label: t("story.interact.open"), act: () => this.openChest(id) };
    }
    const m = forestPoint(MERCHANT_SPOT.u, MERCHANT_SPOT.v);
    const dm = Math.hypot(p.x - m.x, p.z - m.z);
    if (dm < TALK_REACH && (!best || dm < best.d)) best = { d: dm, at: this.forest.merchantHead, label: t("story.interact.talk"), act: () => this.openShop() };
    if (best) {
      this.offer = best.act;
      this.prompt.show(best.at, best.label);
      this.prompt.update(dt);
      if (this.input.wasPressed("KeyE")) best.act();
    } else {
      this.offer = undefined;
      this.prompt.hide();
    }
  }

  private openShop(): void {
    if (!this.shop || this.shop.isOpen) return;
    this.prompt?.hide();
    this.paused = true;
    this.shop.show();
  }

  private shopLines(): ShopLine[] {
    return SHOP.map((w) => {
      const def = w.item?.();
      return {
        id: w.id,
        name: t(w.nameKey),
        blurb: t(w.blurbKey),
        price: w.price,
        owned: def ? (this.items.find((s) => s.def.id === def.id)?.count ?? 0) : 0,
        soon: !def,
      };
    });
  }

  private buy(id: string): boolean {
    const w = SHOP.find((x) => x.id === id);
    const def = w?.item?.();
    if (!w || !def || this.gold < w.price) return false;
    this.gold -= w.price;
    this.addItem(def);
    return true;
  }

  private addItem(def: ItemDef): void {
    const stock = this.items.find((s) => s.def.id === def.id);
    if (stock) stock.count++;
    else this.items.push({ def, count: 1 });
  }

  override hasOpenMenu(): boolean {
    return !!this.shop?.isOpen || super.hasOpenMenu();
  }

  override closeTopMenu(): boolean {
    if (this.shop?.isOpen) {
      this.shop.close();
      return true;
    }
    return super.closeTopMenu();
  }

  /** Open a chest: the lid swings, the loot goes to the party. */
  private openChest(id: string): void {
    const at = this.forest?.chests.get(id);
    if (!this.forest || !at || this.opened.has(id)) return;
    this.opened.add(id);
    this.forest.openChest(id);
    const loot = CHEST_LOOT[id];
    let label = "";
    const def = loot?.item?.();
    if (def) {
      this.addItem(def);
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

  /**
   * Story beats and signposts: Dart's memory after the gorge (once), and at the ends of the map,
   * where the next map will connect, a note saying where the road leads.
   */
  private updateTalk(): void {
    if (!this.forest || !this.bubble) return;
    const p = this.player.position;
    const at = forestPoint(SHANA_SCENE_SPOT.u, SHANA_SCENE_SPOT.v);
    const nearShana = Math.hypot(p.x - at.x, p.z - at.z);
    const { u, v } = forestUV(p);
    const exit = u > MAP_END_U - EXIT_REACH ? (v < 0 ? "hellena" : "prairie") : u < MAP_START_U + EXIT_REACH ? "seles" : undefined;
    if (this.talking === "shana" && nearShana > TALK_LEAVE + 2) this.endTalk();
    if (this.talking === "exit" && !exit) this.endTalk();
    if (!this.talking && !this.shanaSeen && nearShana < TALK_REACH + 1.2) {
      this.talking = "shana";
      this.shanaSeen = true;
    } else if (!this.talking && exit) {
      this.talking = "exit";
    }
    // Both follow Dart (re-anchored over the player each frame).
    const head = p.add(new Vector3(0, 2.2, 0));
    if (this.talking === "shana") this.bubble.show(head, t("story.dart"), t("story.shana.line"));
    else if (this.talking === "exit" && exit) this.bubble.show(head, t(`story.exit.${exit}.title`), t("story.exit.soon"));
  }

  private endTalk(): void {
    this.talking = undefined;
    this.bubble?.hide();
  }

  override dispose(): void {
    this.bubble?.dispose();
    this.prompt?.dispose();
    this.shop?.dispose();
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
