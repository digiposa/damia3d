import type { MapFactory } from "../StoryMap";
import { forestMap } from "./forest";
import { selesMap } from "./seles";

/** Every Story map, by id (the save stores the id). */
export const MAPS: Record<string, MapFactory> = {
  seles: selesMap,
  forest: forestMap,
};
