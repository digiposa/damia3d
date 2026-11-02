import { t } from "../../core/i18n";
import { HELLENA_SPOTS, hellenaPoint, hellenaWorld } from "../../world/Hellena";
import type { MapFactory } from "../StoryMap";

/**
 * Hellena Prison, outside (lieu #3, first visit: docs/damia2D/features/locations/Hellena Prison.md):
 * the coastal path and the guard post at the drawbridge. The inside comes next; the scenes later.
 */
export const hellenaMap: MapFactory = (scene) => {
  const world = hellenaWorld(scene);
  const P = hellenaPoint;
  return {
    world,
    entries: { fromForest: P(HELLENA_SPOTS.fromForest), gate: P(HELLENA_SPOTS.landing) },
    encounterAt: () => null, // canon: no battles on the coastal path
    start(api) {
      api.trigger(P(HELLENA_SPOTS.exitForest), 2.6, () => api.goto("forest", "fromHellena"));
      api.sign(P(HELLENA_SPOTS.gate), 2.8, t("hellena.gate.title"), t("story.exit.soon"));
    },
  };
};
