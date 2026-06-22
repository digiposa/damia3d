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
  /** Placeholder avatar body colour (RGB 0–1) — distinguishes each bearer until art lands. */
  color: [number, number, number];
  /** Part of the canonical Story party. */
  storyPlayable: boolean;
}

export const BEARERS: Bearer[] = [
  // Red-Eye (Fire)
  { id: "dart", name: "Dart", classId: "redEye", portrait: dartPortrait, color: [0.85, 0.2, 0.22], storyPlayable: true },
  { id: "zieg", name: "Zieg", classId: "redEye", color: [0.78, 0.36, 0.12], storyPlayable: false },
  // Jade (Wind)
  { id: "lavitz", name: "Lavitz", classId: "jade", color: [0.27, 0.6, 0.32], storyPlayable: true },
  { id: "albert", name: "Albert", classId: "jade", color: [0.2, 0.46, 0.72], storyPlayable: true },
  { id: "greham", name: "Greham", classId: "jade", color: [0.38, 0.42, 0.48], storyPlayable: false },
  { id: "syuveil", name: "Syuveil", classId: "jade", color: [0.2, 0.56, 0.54], storyPlayable: false },
  // White-Silver (Light) — no Additions (bow attack)
  { id: "shana", name: "Shana", classId: "whiteSilver", color: [0.92, 0.62, 0.72], storyPlayable: true },
  { id: "miranda", name: "Miranda", classId: "whiteSilver", color: [0.82, 0.82, 0.9], storyPlayable: true },
  // Darkness
  { id: "rose", name: "Rose", classId: "darkness", color: [0.34, 0.22, 0.4], storyPlayable: true },
  // Violet (Thunder)
  { id: "haschel", name: "Haschel", classId: "thunder", color: [0.85, 0.5, 0.18], storyPlayable: true },
  // Blue-Sea (Water)
  { id: "meru", name: "Meru", classId: "blueSea", color: [0.3, 0.72, 0.85], storyPlayable: true },
  // Golden (Earth)
  { id: "kongol", name: "Kongol", classId: "golden", color: [0.72, 0.56, 0.26], storyPlayable: true },
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
