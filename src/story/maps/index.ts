import type { MapFactory } from "../StoryMap";
import { forestMap } from "./forest";
import { hellenaMap } from "./hellena";
import { selesMap } from "./seles";

/** What the "Explore a map" menu offers: each map and the entries to start from (label keys). */
export const EXPLORE: { map: string; entries: string[] }[] = [
  { map: "seles", entries: ["start", "fromForest"] },
  { map: "forest", entries: ["fromSeles", "fromHellena"] },
  { map: "hellena", entries: ["fromForest", "gate"] },
];

/** Every Story map, by id (the save stores the id). */
export const MAPS: Record<string, MapFactory> = {
  seles: selesMap,
  forest: forestMap,
  hellena: hellenaMap,
};
