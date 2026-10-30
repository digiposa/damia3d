import { COMMANDER_SELES, KNIGHT_OF_SANDORA } from "../../data/enemies";
import { ATTACK_ITEM_BY_ID } from "../../data/items";
import { t } from "../../core/i18n";
import { SELES_SPOTS, selesPoint, selesWorld } from "../../world/Seles";
import type { MapFactory, StoryApi } from "../StoryMap";

/**
 * Seles (lieu #1) — the village in ruins (canon: docs/damia2D/features/locations/Seles.md).
 * Dart comes down the slope; past the fence two knights are about to kill a villager (fight 1,
 * formation 477); the Burn Out chest by the Save Point; Plos in front of the burned house, then
 * the Commander and two knights (fight 2, formation 384) — Shana was taken to Hellena; Lowe and
 * Isha, the Stardust tomb, Master Tasman; the road north, with the scene at Hellena, to the Forest.
 *
 * Only the Commander's first line is canon; the rest is a draft to be corrected.
 */

const S = (key: string): string => t(`seles.${key}`);
const P = selesPoint;

export const selesMap: MapFactory = (scene) => {
  const world = selesWorld(scene);
  return {
    world,
    entries: { start: P(SELES_SPOTS.start), fromForest: P(SELES_SPOTS.fromForest) },
    models: ["knight_sandora", "kos_sword", "commander", "commander_sword"],
    encounterAt: () => null, // a town: scripted fights only
    start(api, entry) {
      const dart = t("story.dart");
      const done1 = (): boolean => api.hasFlag("seles:fight1");
      const done2 = (): boolean => api.hasFlag("seles:commander");

      // --- People ------------------------------------------------------------------------------
      const villager = api.npc("villager", P(SELES_SPOTS.villager), { color: [0.42, 0.36, 0.26], hair: "short" });
      villager.setLying(true);
      const plos = api.npc("plos", P(SELES_SPOTS.plos), { color: [0.4, 0.3, 0.22], hair: "elder" });
      plos.setLying(!done2() && !api.hasFlag("seles:plosHelped"));
      if (api.hasFlag("seles:plosHelped") || done2()) plos.walkTo(P({ u: SELES_SPOTS.plosHouse.u - 2.6, v: SELES_SPOTS.plosHouse.v + 2.6 }), 99);
      const lowe = api.npc("lowe", P(SELES_SPOTS.kids), { color: [0.5, 0.42, 0.3], hair: "short", scale: 0.65 });
      const isha = api.npc("isha", P({ u: SELES_SPOTS.kids.u + 1, v: SELES_SPOTS.kids.v + 0.6 }), { color: [0.62, 0.4, 0.38], hair: "bob", scale: 0.62 });
      const tasman = api.npc("tasman", P(SELES_SPOTS.tasman), { color: [0.3, 0.3, 0.36], hair: "elder", weapon: "sword" });
      tasman.face(P(SELES_SPOTS.well));

      // --- Opening: the slope ---------------------------------------------------------------
      if (entry === "start" && !api.hasFlag("seles:arrived")) {
        void (async () => {
          api.lock();
          await api.wait(0.9);
          await api.say(dart, S("arrive1"));
          await api.say(dart, S("arrive2"));
          await api.walkHero(P(SELES_SPOTS.slopeFoot));
          api.setFlag("seles:arrived");
          api.unlock();
        })();
      }

      // --- Fight 1: the knights and the villager --------------------------------------------
      if (!done1()) {
        api.stage([
          { def: KNIGHT_OF_SANDORA, at: P({ u: SELES_SPOTS.villager.u + 1.6, v: SELES_SPOTS.villager.v - 1.2 }) },
          { def: KNIGHT_OF_SANDORA, at: P({ u: SELES_SPOTS.villager.u - 0.6, v: SELES_SPOTS.villager.v - 2.2 }) },
        ]);
      }
      api.trigger(P(SELES_SPOTS.fence), 4.5, async () => {
        api.lock();
        await api.say(S("knight"), S("knight1"));
        await api.say(S("villager"), S("villager1"));
        await api.say(dart, S("dart1"));
        await api.battle();
        await api.walkHero(P({ u: SELES_SPOTS.villager.u - 1.4, v: SELES_SPOTS.villager.v - 0.4 }));
        await api.say(S("villager"), S("villager2"));
        await api.say(S("villager"), S("villager3"));
        await api.say(dart, S("dart2"));
        api.setFlag("seles:fight1");
        openChest(api);
      }, () => !done1());
      if (done1()) openChest(api);

      // --- Plos, then the Commander ----------------------------------------------------------
      api.trigger(P(SELES_SPOTS.plos), 5, async () => {
        api.lock();
        await api.say(dart, S("dart3"));
        await api.walkHero(P({ u: SELES_SPOTS.plos.u - 1.3, v: SELES_SPOTS.plos.v + 1 }));
        plos.setLying(false);
        await plos.walkTo(P({ u: SELES_SPOTS.plosHouse.u - 2.6, v: SELES_SPOTS.plosHouse.v + 2.6 }), 1);
        plos.face(api.hero);
        api.setFlag("seles:plosHelped");
        await api.say(S("plos"), S("plos1"));
        await api.say(S("plos"), S("plos2"));
        await api.say(dart, S("dart4"));
        // The Commander and two knights come down the square.
        const c = SELES_SPOTS.commanderFrom;
        api.stage([
          { def: COMMANDER_SELES, at: P(c) },
          { def: KNIGHT_OF_SANDORA, at: P({ u: c.u - 1, v: c.v - 2 }) },
          { def: KNIGHT_OF_SANDORA, at: P({ u: c.u - 1, v: c.v + 2 }) },
        ]);
        await api.wait(0.6);
        await api.say(S("commander"), S("commander1")); // canon
        await api.say(S("commander"), S("commander2"));
        await api.say(dart, S("dart5"));
        await api.battle();
        plos.face(api.hero);
        await api.say(S("plos"), S("plos3"));
        await api.say(dart, S("dart6"));
        api.setFlag("seles:commander");
      }, () => done1() && !done2());

      // --- Optional: Lowe & Isha, the Stardust, Master Tasman --------------------------------
      api.interact(lowe.position, t("story.interact.talk"), async () => {
        api.lock();
        await api.say(S("lowe"), S("lowe1"));
        await api.say(S("isha"), S("isha1"));
      }, done2, 4); // they hide in the ruins behind Plos: talk through the doorway
      void isha;
      api.interact(P(SELES_SPOTS.tomb3), S("examine"), () => {
        api.setFlag("seles:stardust");
        api.pop(P(SELES_SPOTS.tomb3), S("stardust"));
      }, () => !api.hasFlag("seles:stardust"), 1.6);
      api.interact(tasman.position, t("story.interact.talk"), async () => {
        api.lock();
        tasman.face(api.hero);
        await api.say(S("tasman"), S("tasman1"));
        await api.say(S("tasman"), S("tasman2"));
        await api.say(S("tasman"), S("tasman3"));
      }, done2, 2.8);

      // --- North: the scene at Hellena, then the Forest -----------------------------------------
      api.sign(P(SELES_SPOTS.exitNorth), 3.5, dart, S("notYet"));
      api.trigger(P(SELES_SPOTS.exitNorth), 3, async () => {
        api.lock();
        await api.fade(1, 0.8);
        if (!api.hasFlag("seles:hellenaScene")) {
          api.setFlag("seles:hellenaScene");
          await api.say("", S("meanwhile"));
          await api.say(S("fruegel"), S("fruegel1"));
          await api.say(S("hood"), S("hood1"));
          await api.say(S("fruegel"), S("fruegel2"));
          await api.say(S("hood"), S("hood2")); // canon
        }
        await api.goto("forest", "fromSeles");
      }, done2);
    },
  };
};

/** The Burn Out chest by the Save Point (reachable once the first fight is over). */
function openChest(api: StoryApi): void {
  const burnOut = ATTACK_ITEM_BY_ID.get("burnOut");
  if (burnOut) api.chest("burnOut", P(SELES_SPOTS.chest), { item: burnOut });
}
