import { ASSASSIN_COCK, BERSERK_MOUSE, GOBLIN, TRENT, type EnemyDef } from "../../data/enemies";
import { ATTACK_ITEM_BY_ID, CHARM_POTION, HEALING_POTION, type ItemDef } from "../../data/items";
import { t } from "../../core/i18n";
import { ShopPanel } from "../../ui/ShopPanel";
import {
  FOREST_ZONES,
  MAP_END_U,
  MAP_START_U,
  MERCHANT_SPOT,
  SHANA_SCENE_SPOT,
  forestPoint,
  forestUV,
  forestWorld,
  trackPointAt,
} from "../../world/Forest";
import type { MapFactory } from "../StoryMap";

/**
 * The Forest (lieu #2) as a Story map: canon random encounters per submap, the merchant and his
 * shop, the four chests, Dart's memory after the gorge, Seles behind, Hellena / the Prairie ahead.
 */

/** Canon formations and encounter rate per submap (docs/damia2D/features/locations/Forest.md). */
const M = BERSERK_MOUSE;
const C = ASSASSIN_COCK;
const G = GOBLIN;
const T = TRENT;
const ENCOUNTERS: Record<string, { rate: number; formations: EnemyDef[][] }> = {
  merchant: { rate: 14, formations: [[M, M], [M, C], [G, C], [M]] }, // submap 624
  ravine: { rate: 10, formations: [[C, C], [T, C], [T], [C]] }, // 5 — the cliff
  maze: { rate: 10, formations: [[G, C], [T, C], [M, C], [G]] }, // 625
  gorge: { rate: 7, formations: [[C, C], [M, M], [G, T], [T]] }, // 6
  fork: { rate: 10, formations: [[G, T], [M, M], [C, C], [T]] }, // 7 — the final trail
};

/** The merchant's wares (wiki: the Forest Item Shop). Body Purifier isn't in the item system yet. */
const SHOP: { id: string; price: number; item?: ItemDef; nameKey: string; blurbKey: string }[] = [
  { id: "healingPotion", price: 10, item: HEALING_POTION, nameKey: "item.healingPotion", blurbKey: "story.shop.healingPotion" },
  { id: "burnOut", price: 10, item: ATTACK_ITEM_BY_ID.get("burnOut"), nameKey: "item.burnOut", blurbKey: "story.shop.burnOut" },
  { id: "bodyPurifier", price: 10, nameKey: "story.item.bodyPurifier", blurbKey: "story.shop.bodyPurifier" },
  { id: "charmPotion", price: 4, item: CHARM_POTION, nameKey: "item.charmPotion", blurbKey: "story.shop.charmPotion" },
];

/** What each chest holds (wiki: the four Forest chests). */
const CHEST_LOOT: Record<string, { item?: ItemDef; gold?: number }> = {
  healingPotion: { item: HEALING_POTION },
  charmPotion: { item: CHARM_POTION },
  gold20: { gold: 20 },
  burnOut: { item: ATTACK_ITEM_BY_ID.get("burnOut") },
};

export const forestMap: MapFactory = (scene) => {
  const world = forestWorld(scene);
  return {
    world,
    entries: {
      fromSeles: trackPointAt(MAP_START_U + 3),
      fromHellena: trackPointAt(MAP_END_U - 4),
    },
    models: ["berserk_mouse", "assassin_cock", "goblin", "trent"],
    encounterAt: (p) => {
      const { u } = forestUV(p);
      const zone = FOREST_ZONES.find((z) => u >= z.u0 && u < z.u1);
      return zone ? ENCOUNTERS[zone.id] ?? null : null;
    },
    start(api) {
      // Chests.
      for (const [id, at] of world.chests) {
        const loot = CHEST_LOOT[id];
        if (loot) api.chest(id, at, loot, () => world.openChest(id));
      }

      // The merchant and his shop.
      const shop = new ShopPanel(
        {
          lines: () =>
            SHOP.map((w) => ({
              id: w.id,
              name: t(w.nameKey),
              blurb: t(w.blurbKey),
              price: w.price,
              owned: w.item ? api.owned(w.item) : 0,
              soon: !w.item,
            })),
          gold: () => api.gold,
          buy: (id) => {
            const w = SHOP.find((x) => x.id === id);
            if (!w?.item || !api.spend(w.price)) return false;
            api.addItem(w.item);
            return true;
          },
        },
        () => api.setPaused(false),
      );
      scene.onDisposeObservable.addOnce(() => shop.dispose());
      api.interact(forestPoint(MERCHANT_SPOT.u, MERCHANT_SPOT.v), t("story.interact.talk"), () => {
        api.setPaused(true);
        shop.show();
      }, undefined, 2.8);

      // Dart's memory after the gorge ("leave Shana alone"), once.
      const shana = forestPoint(SHANA_SCENE_SPOT.u, SHANA_SCENE_SPOT.v);
      api.trigger(shana, 4, async () => {
        api.setFlag("forest:shanaMemory");
        api.lock();
        await api.say(t("story.dart"), t("story.shana.line"));
      }, () => !api.hasFlag("forest:shanaMemory"));

      // Ends of the map: back to Seles; Hellena and the Prairie come later.
      api.trigger(trackPointAt(MAP_START_U + 0.5), 2.5, () => api.goto("seles", "fromForest"));
      const hellena = forestPoint(MAP_END_U, -9);
      const prairie = forestPoint(MAP_END_U, 10);
      api.sign(hellena, 4, t("story.exit.hellena.title"), t("story.exit.soon"));
      api.sign(prairie, 4, t("story.exit.prairie.title"), t("story.exit.soon"));
    },
  };
};
