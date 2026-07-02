import dartPortrait from "../assets/portraits/dart.png";
import albertPortrait from "../assets/portraits/albert.png";
import lavitzPortrait from "../assets/portraits/lavitz.png";
import grehamPortrait from "../assets/portraits/greham.png";
import syuveilPortrait from "../assets/portraits/syuveil.png";
import shanaPortrait from "../assets/portraits/shana.png";
import meruPortrait from "../assets/portraits/meru.jpg";
import rosePortrait from "../assets/portraits/rose.png";
import haschelPortrait from "../assets/portraits/haschel.png";
import kongolPortrait from "../assets/portraits/kongol.png";
import ziegPortrait from "../assets/portraits/zieg.png";
import shirleyPortrait from "../assets/portraits/shirley.png";
import damiaPortrait from "../assets/portraits/damia.png";
import damiaDragoonPortrait from "../assets/portraits/damia-dragoon.png";
import belzacPortrait from "../assets/portraits/belzac.png";
import kanzasPortrait from "../assets/portraits/kanzas.png";
import { type DragoonClassId, isClassImplemented } from "./dragoonClasses";

/** Weapon silhouette held by the placeholder figure (and the strike motion it uses). */
export type WeaponKind = "sword" | "spear" | "bow" | "rapier" | "fist" | "hammer" | "axe";

/** Optional weapon variant overlaid on a {@link WeaponKind} for a signature silhouette. */
export type WeaponVariant = "spiked";

/** Distinctive hairstyle added to the placeholder figure so a character reads at a glance. */
export type HairStyle =
  | "ponytail"
  | "spiky"
  | "short"
  | "bob"
  | "swept"
  | "long"
  | "flow"
  | "banded"
  | "neat"
  | "wavy"
  | "wrap"
  | "topknot"
  | "mane"
  | "elder"
  | "siren";

/** Outfit overlaid on the placeholder figure (armour plates, straps, boots…). */
export type OutfitStyle =
  | "armored"
  | "knight"
  | "fullplate"
  | "dancer"
  | "archer"
  | "noble"
  | "darkness"
  | "valkyrie"
  | "darkknight"
  | "scholar"
  | "priestess"
  | "brawler"
  | "gigantos"
  | "martialist"
  | "siren";

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
  /**
   * Optional alternate portrait shown ONLY in the in-game party HUD while this bearer is
   * in Dragoon form (menus always keep {@link portrait}). Falls back to {@link portrait}
   * when absent, so it can be filled in per character as Dragoon art arrives.
   */
  dragoonPortrait?: string;
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
  /** Dragoon archetype (element) colour (RGB 0–1) — shared by all bearers of a class; used for the menu swatch and the default body tint. */
  color: [number, number, number];
  /** Optional 3D body tint when the figure's costume should differ from the archetype colour (e.g. Syuveil's white tunic, Greham's brown armour). Falls back to {@link color}. */
  bodyColor?: [number, number, number];
  /** Optional uniform figure scale (e.g. the giants Belzac/Kongol). Default 1. */
  scale?: number;
  /** Optional skin tone (RGB 0–1) for face and bare skin — e.g. Kongol's tan Gigantos hide. Default a light human tone. */
  skinTone?: [number, number, number];
  /** Part of the canonical Story party. */
  storyPlayable: boolean;
}

// One placeholder colour per Dragoon archetype (element) — shared by every bearer of
// that class, so the menu swatch reads as the element, not the individual.
const C_FIRE: [number, number, number] = [0.8, 0.2, 0.2];
const C_DARK: [number, number, number] = [0.42, 0.26, 0.5];
const C_WIND: [number, number, number] = [0.3, 0.62, 0.34];
const C_LIGHT: [number, number, number] = [0.85, 0.86, 0.92];
const C_THUNDER: [number, number, number] = [0.56, 0.34, 0.7];
const C_WATER: [number, number, number] = [0.3, 0.66, 0.85];
const C_EARTH: [number, number, number] = [0.78, 0.6, 0.26];

// Grouped by Dragoon archetype, and within each archetype in order of the Dragoon
// Spirit's possession (earliest holder first → current bearer last).
export const BEARERS: Bearer[] = [
  // Red-Eye (Fire) — swords
  { id: "zieg", name: "Zieg", classId: "redEye", portrait: ziegPortrait, weapon: "sword", weaponVariant: "spiked", hair: "mane", outfit: "fullplate", color: C_FIRE, storyPlayable: false },
  { id: "dart", name: "Dart", classId: "redEye", portrait: dartPortrait, weapon: "sword", hair: "spiky", outfit: "armored", color: C_FIRE, storyPlayable: true },
  // Darkness — rapier
  { id: "rose", name: "Rose", classId: "darkness", portrait: rosePortrait, weapon: "rapier", hair: "long", outfit: "darkness", color: C_DARK, storyPlayable: true },
  // Jade (Wind) — spears
  { id: "syuveil", name: "Syuveil", classId: "jade", portrait: syuveilPortrait, weapon: "spear", hair: "neat", outfit: "scholar", color: C_WIND, bodyColor: [0.88, 0.89, 0.92], storyPlayable: false },
  { id: "greham", name: "Greham", classId: "jade", portrait: grehamPortrait, weapon: "spear", hair: "banded", outfit: "darkknight", color: C_WIND, bodyColor: [0.26, 0.19, 0.13], storyPlayable: false },
  { id: "lavitz", name: "Lavitz", classId: "jade", portrait: lavitzPortrait, weapon: "spear", hair: "short", outfit: "knight", color: C_WIND, storyPlayable: true },
  { id: "albert", name: "Albert", classId: "jade", portrait: albertPortrait, weapon: "spear", hair: "swept", outfit: "noble", color: C_WIND, storyPlayable: true },
  // White-Silver (Light) — bows, no Additions
  { id: "shirley", name: "Shirley", classId: "whiteSilver", portrait: shirleyPortrait, weapon: "bow", hair: "wavy", outfit: "priestess", color: C_LIGHT, bodyColor: [0.8, 0.87, 0.96], storyPlayable: false },
  { id: "shana", name: "Shana", classId: "whiteSilver", portrait: shanaPortrait, weapon: "bow", hair: "bob", outfit: "archer", color: C_LIGHT, storyPlayable: true },
  { id: "miranda", name: "Miranda", classId: "whiteSilver", weapon: "bow", hair: "flow", outfit: "valkyrie", color: C_LIGHT, storyPlayable: true },
  // Violet (Thunder) — martial artist (fists)
  { id: "kanzas", name: "Kanzas", classId: "thunder", portrait: kanzasPortrait, weapon: "fist", hair: "spiky", color: C_THUNDER, storyPlayable: false },
  { id: "doel", name: "Doel", classId: "thunder", weapon: "fist", hair: "short", color: C_THUNDER, storyPlayable: false },
  { id: "haschel", name: "Haschel", classId: "thunder", portrait: haschelPortrait, weapon: "fist", hair: "elder", outfit: "martialist", color: C_THUNDER, storyPlayable: true },
  // Blue-Sea (Water) — hammer
  { id: "damia", name: "Damia", classId: "blueSea", portrait: damiaPortrait, dragoonPortrait: damiaDragoonPortrait, weapon: "hammer", hair: "siren", outfit: "siren", color: C_WATER, skinTone: [0.56, 0.76, 0.86], storyPlayable: false },
  { id: "lenus", name: "Lenus", classId: "blueSea", weapon: "hammer", hair: "long", color: C_WATER, storyPlayable: false },
  { id: "meru", name: "Meru", classId: "blueSea", portrait: meruPortrait, weapon: "hammer", hair: "ponytail", outfit: "dancer", color: C_WATER, storyPlayable: true },
  // Golden (Earth) — axe
  { id: "belzac", name: "Belzac", classId: "golden", portrait: belzacPortrait, weapon: "axe", hair: "wrap", outfit: "brawler", color: C_EARTH, scale: 1.2, storyPlayable: false },
  { id: "kongol", name: "Kongol", classId: "golden", portrait: kongolPortrait, weapon: "axe", hair: "topknot", outfit: "gigantos", color: C_EARTH, skinTone: [0.66, 0.5, 0.34], scale: 1.4, storyPlayable: true },
];

/** Default playable bearer (Dart). */
export const DEFAULT_BEARER: Bearer = BEARERS.find((b) => b.id === "dart")!;

export function bearerById(id: string): Bearer | undefined {
  return BEARERS.find((b) => b.id === id);
}

/** Bearers whose Dragoon class is implemented (selectable in Survival/Training). */
export function selectableBearers(): Bearer[] {
  return BEARERS.filter((b) => isClassImplemented(b.classId));
}
