import dartPortrait from "../assets/portraits/dart.png";
import albertPortrait from "../assets/portraits/albert.png";
import lavitzPortrait from "../assets/portraits/lavitz.png";
import meruPortrait from "../assets/portraits/meru.jpg";
import rosePortrait from "../assets/portraits/rose.png";
import haschelPortrait from "../assets/portraits/haschel.png";
import { type DragoonClassId, isClassImplemented } from "./dragoonClasses";

/** Weapon silhouette held by the placeholder figure (and the strike motion it uses). */
export type WeaponKind = "sword" | "spear" | "bow" | "rapier" | "fist" | "hammer" | "axe";

/** Optional weapon variant overlaid on a {@link WeaponKind} for a signature silhouette. */
export type WeaponVariant = "spiked";

/** Distinctive hairstyle added to the placeholder figure so a character reads at a glance. */
export type HairStyle = "ponytail" | "spiky" | "short" | "bob";

/** Outfit overlaid on the placeholder figure (armour plates, straps, boots…). */
export type OutfitStyle = "armored" | "knight" | "fullplate" | "dancer" | "archer";

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
  /** Optional rigged glTF/GLB model URL; falls back to the procedural placeholder when absent. */
  model?: string;
  /** Weapon the placeholder figure carries (default "sword"). */
  weapon?: WeaponKind;
  /** Optional weapon variant for a signature look (e.g. Zieg's spiked broadsword). */
  weaponVariant?: WeaponVariant;
  /** Distinctive hairstyle on the placeholder figure (e.g. Meru's high ponytail). */
  hair?: HairStyle;
  /** Outfit overlaid on the placeholder figure (e.g. Dart's red adventuring armour). */
  outfit?: OutfitStyle;
  /** Placeholder avatar body colour (RGB 0–1) — distinguishes each bearer until art lands. */
  color: [number, number, number];
  /** Part of the canonical Story party. */
  storyPlayable: boolean;
}

export const BEARERS: Bearer[] = [
  // Red-Eye (Fire) — swords
  { id: "dart", name: "Dart", classId: "redEye", portrait: dartPortrait, weapon: "sword", hair: "spiky", outfit: "armored", color: [0.85, 0.2, 0.22], storyPlayable: true },
  { id: "zieg", name: "Zieg", classId: "redEye", weapon: "sword", weaponVariant: "spiked", hair: "short", outfit: "fullplate", color: [0.58, 0.12, 0.1], storyPlayable: false },
  // Jade (Wind) — spears
  { id: "lavitz", name: "Lavitz", classId: "jade", portrait: lavitzPortrait, weapon: "spear", hair: "short", outfit: "knight", color: [0.27, 0.6, 0.32], storyPlayable: true },
  { id: "albert", name: "Albert", classId: "jade", portrait: albertPortrait, weapon: "spear", color: [0.2, 0.46, 0.72], storyPlayable: true },
  { id: "greham", name: "Greham", classId: "jade", weapon: "spear", color: [0.38, 0.42, 0.48], storyPlayable: false },
  { id: "syuveil", name: "Syuveil", classId: "jade", weapon: "spear", color: [0.2, 0.56, 0.54], storyPlayable: false },
  // White-Silver (Light) — bows, no Additions
  { id: "shana", name: "Shana", classId: "whiteSilver", weapon: "bow", hair: "bob", outfit: "archer", color: [0.92, 0.62, 0.72], storyPlayable: true },
  { id: "miranda", name: "Miranda", classId: "whiteSilver", weapon: "bow", color: [0.82, 0.82, 0.9], storyPlayable: true },
  // Darkness — rapier
  { id: "rose", name: "Rose", classId: "darkness", portrait: rosePortrait, weapon: "rapier", color: [0.34, 0.22, 0.4], storyPlayable: true },
  // Violet (Thunder) — martial artist (fists)
  { id: "haschel", name: "Haschel", classId: "thunder", portrait: haschelPortrait, weapon: "fist", color: [0.85, 0.5, 0.18], storyPlayable: true },
  // Blue-Sea (Water) — hammer
  { id: "meru", name: "Meru", classId: "blueSea", portrait: meruPortrait, weapon: "hammer", hair: "ponytail", outfit: "dancer", color: [0.3, 0.72, 0.85], storyPlayable: true },
  // Golden (Earth) — axe
  { id: "kongol", name: "Kongol", classId: "golden", weapon: "axe", color: [0.72, 0.56, 0.26], storyPlayable: true },
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
