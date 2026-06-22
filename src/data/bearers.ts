import dartPortrait from "../assets/portraits/dart.jpg";
import { type DragoonClassId, isClassImplemented } from "./dragoonClasses";

/**
 * A Dragoon Spirit bearer — a playable identity (skin) backed by a Dragoon class.
 * The base bearer of each class is the canonical Story character; previous
 * bearers play as reskins (same stats/Additions/element) in Survival/Training.
 * Some also exist as full bosses in Story (separate EnemyDefs).
 */
export interface Bearer {
  id: string;
  name: string;
  classId: DragoonClassId;
  portrait?: string;
  /** Part of the canonical Story party. */
  storyPlayable: boolean;
}

export const BEARERS: Bearer[] = [
  // Red-Eye (Fire)
  { id: "dart", name: "Dart", classId: "redEye", portrait: dartPortrait, storyPlayable: true },
  { id: "zieg", name: "Zieg", classId: "redEye", storyPlayable: false },
  // Jade (Wind)
  { id: "lavitz", name: "Lavitz", classId: "jade", storyPlayable: true },
  { id: "albert", name: "Albert", classId: "jade", storyPlayable: true },
  { id: "greham", name: "Greham", classId: "jade", storyPlayable: false },
  { id: "syuveil", name: "Syuveil", classId: "jade", storyPlayable: false },
  // White-Silver (Light) — no Additions (bow attack)
  { id: "shana", name: "Shana", classId: "whiteSilver", storyPlayable: true },
  { id: "miranda", name: "Miranda", classId: "whiteSilver", storyPlayable: true },
  // Darkness
  { id: "rose", name: "Rose", classId: "darkness", storyPlayable: true },
  // Violet (Thunder)
  { id: "haschel", name: "Haschel", classId: "thunder", storyPlayable: true },
];

/** Default playable bearer (Dart). */
export const DEFAULT_BEARER: Bearer = BEARERS[0];

export function bearerById(id: string): Bearer | undefined {
  return BEARERS.find((b) => b.id === id);
}

/** Bearers whose Dragoon class is implemented (selectable in Survival/Training). */
export function selectableBearers(): Bearer[] {
  return BEARERS.filter((b) => isClassImplemented(b.classId));
}
