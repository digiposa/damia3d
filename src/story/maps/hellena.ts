import { t } from "../../core/i18n";
import { HELLENA_SPOTS, hellenaCoastWorld, hellenaPoint, hellenaWorld } from "../../world/Hellena";
import type { MapFactory } from "../StoryMap";

/**
 * Hellena Prison, outside (lieu #3, first visit: docs/damia2D/features/locations/Hellena Prison.md):
 * the coastal path (a scenic section) and the guard post at the drawbridge. The inside comes next;
 * the scenes later.
 */
const P = hellenaPoint;

/** The coastal path: the scenic section, the prison far out on the sea. */
export const hellenaCoastMap: MapFactory = (scene) => ({
  world: hellenaCoastWorld(scene),
  entries: { fromForest: P(HELLENA_SPOTS.coastStart), fromGate: P({ u: HELLENA_SPOTS.coastEnd.u - 4, v: 0 }) },
  encounterAt: () => null, // canon: no battles on the coastal path
  start(api) {
    api.exit(P(HELLENA_SPOTS.coastBack), 2.2, "forest", "fromHellena");
    api.exit(P(HELLENA_SPOTS.coastEnd), 2.6, "hellena", "fromCoast");
  },
});

/** The guard post at the drawbridge. */
export const hellenaMap: MapFactory = (scene) => ({
  world: hellenaWorld(scene),
  entries: { fromCoast: P(HELLENA_SPOTS.fromCoast), gate: P(HELLENA_SPOTS.landing) },
  encounterAt: () => null,
  start(api) {
    api.exit(P(HELLENA_SPOTS.backToCoast), 1.8, "hellenaCoast", "fromGate");
    api.sign(P(HELLENA_SPOTS.gate), 2.8, t("hellena.gate.title"), t("story.exit.soon"));
  },
});
