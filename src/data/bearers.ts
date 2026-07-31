import dartPortrait from "../assets/portraits/dart.png";
import albertPortrait from "../assets/portraits/albert.png";
import lavitzPortrait from "../assets/portraits/lavitz.png";
import grehamPortrait from "../assets/portraits/greham.png";
import syuveilPortrait from "../assets/portraits/syuveil.png";
import shanaPortrait from "../assets/portraits/shana.png";
import meruPortrait from "../assets/portraits/meru.png";
import rosePortrait from "../assets/portraits/rose.png";
import haschelPortrait from "../assets/portraits/haschel.png";
import kongolPortrait from "../assets/portraits/kongol.png";
import ziegPortrait from "../assets/portraits/zieg.png";
import shirleyPortrait from "../assets/portraits/shirley.png";
import damiaPortrait from "../assets/portraits/damia.png";
import damiaDragoonPortrait from "../assets/portraits/damia-dragoon.png";
import belzacPortrait from "../assets/portraits/belzac.png";
import kanzasPortrait from "../assets/portraits/kanzas.png";
import doelPortrait from "../assets/portraits/doel.png";
import lenusPortrait from "../assets/portraits/lenus.png";
import mirandaPortrait from "../assets/portraits/miranda.png";
import { type DragoonClassId, isClassImplemented } from "./dragoonClasses";

/** Weapon silhouette held by the placeholder figure (and the strike motion it uses). */
export type WeaponKind = "sword" | "spear" | "bow" | "rapier" | "fist" | "hammer" | "axe" | "dualsword";

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
  | "siren"
  | "firebrand"
  | "imperial";

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
  | "siren"
  | "enforcer"
  | "warlord";

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
  /** Optional rigged glTF/GLB model (base filename in src/assets/models/); falls back to the
   *  procedural placeholder when absent. Auto-fit, oriented and animated by {@link Player.loadModel}. */
  model?: string;
  /** Extra yaw (radians) applied to the model to correct its authored facing to the game's forward
   *  (+Z). 0 for Mixamo-rigged exports (their convention); set for raw Tripo meshes that face +X
   *  until their rigged version replaces them. */
  modelYaw?: number;
  /** Optional Dragoon-form GLB (base filename in src/assets/models/) shown while transformed,
   *  replacing the procedural {@link DragoonForm}. Static until animation clips are grafted in. */
  dragoonModel?: string;
  /** Optional weapon GLB (base filename in src/assets/models/) attached to the loaded model's
   *  right-hand bone. Only used alongside {@link model}. */
  weaponModel?: string;
  /** Where the fist grips along the weapon mesh (0–1 up its length). Higher = the hand holds
   *  further up toward the head, so the weapon hangs lower. Per-weapon; default tuned for Meru. */
  weaponGrip?: number;
  /** Uniform world scale of the hand-held weapon. Per-weapon; default tuned for Meru. */
  weaponScale?: number;
  /** Flat-shade the weapon (painted/wooden look, no metal glint or glow) instead of the default
   *  metallic tuning — for vertex-coloured props like Shana's bow, which otherwise blooms into a
   *  glowing wire under the GlowLayer. */
  weaponCellShaded?: boolean;
  /** Keep the weapon in the hand at all times (never holster to the back) — avoids the sword-tuned
   *  back placement for a weapon whose sheathed pose isn't tuned. */
  weaponNoSheath?: boolean;
  /** Full hand-mount orientation in DEGREES [x,y,z], replacing the default blade-up flip — for
   *  weapons that aren't a +Y blade (Shana's bow stands vertical, held sideways). */
  weaponRotation?: [number, number, number];
  /** Attach the weapon to the LEFT hand instead of the right — the bow hand, so the right can draw
   *  the string. */
  weaponLeftHand?: boolean;
  /** Sheathed (on-back) pose overrides for the weapon, in the spine's scale-cancelled (world-unit)
   *  frame — same clean single-node placement as {@link backModelOffset}/{@link backModelRotation},
   *  bypassing the sword-tuned back defaults. Set either to opt a weapon (e.g. the bow) into a proper
   *  slung-on-the-back pose while still drawing to the hand in combat. */
  weaponBackRotation?: [number, number, number];
  weaponBackOffset?: [number, number, number];
  /** Uniform world scale of the sheathed weapon. Default: the hand-held {@link weaponScale}. */
  weaponBackScale?: number;
  /** Optional GLB permanently strapped to the model's spine bone (e.g. Shana's quiver). Unlike
   *  {@link weaponModel} it never draws to the hand — it just rides the back through every animation.
   *  Only used alongside {@link model}. */
  backModel?: string;
  /** Back-item orientation in DEGREES [x,y,z] in the spine's scale-cancelled (world-unit) frame. */
  backModelRotation?: [number, number, number];
  /** Uniform world scale of the back item. Default {@link BACK_ITEM_SCALE}. */
  backModelScale?: number;
  /** Back-item position offset [x,y,z] in world units on the spine frame: shift it across the back,
   *  drop it down, and push it off the body. */
  backModelOffset?: [number, number, number];
  /** Flat-shade the back item (painted/wooden look) instead of the metallic weapon tuning. */
  backModelCellShaded?: boolean;
  /** Optional animation-only GLB (a Mixamo clip on the same mixamorig skeleton) retargeted onto the
   *  model as its death collapse, played once on KO. Only used alongside {@link model}. */
  deathAnim?: string;
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
  { id: "rose", name: "Rose", classId: "darkness", portrait: rosePortrait, model: "rose", modelYaw: -Math.PI / 2, weapon: "rapier", hair: "long", outfit: "darkness", color: C_DARK, storyPlayable: true },
  // Jade (Wind) — spears
  { id: "syuveil", name: "Syuveil", classId: "jade", portrait: syuveilPortrait, weapon: "spear", hair: "neat", outfit: "scholar", color: C_WIND, bodyColor: [0.88, 0.89, 0.92], storyPlayable: false },
  { id: "greham", name: "Greham", classId: "jade", portrait: grehamPortrait, weapon: "spear", hair: "banded", outfit: "darkknight", color: C_WIND, bodyColor: [0.26, 0.19, 0.13], storyPlayable: false },
  { id: "lavitz", name: "Lavitz", classId: "jade", portrait: lavitzPortrait, weapon: "spear", hair: "short", outfit: "knight", color: C_WIND, storyPlayable: true },
  { id: "albert", name: "Albert", classId: "jade", portrait: albertPortrait, weapon: "spear", hair: "swept", outfit: "noble", color: C_WIND, storyPlayable: true },
  // White-Silver (Light) — bows, no Additions
  { id: "shirley", name: "Shirley", classId: "whiteSilver", portrait: shirleyPortrait, weapon: "bow", hair: "wavy", outfit: "priestess", color: C_LIGHT, bodyColor: [0.8, 0.87, 0.96], storyPlayable: false },
  // Shana carries a Tripo-made bow (shana_bow.glb): painted (cellShaded so it doesn't bloom under the
  // GlowLayer). The GLB pivot was re-centred on the riser, so grip 0 seats it in the fist and rotation
  // [0,0,90] stands it upright at her side. Out of combat it now slings to her back (weaponBack*),
  // drawing to the hand when enemies are near. Her quiver (shana_quiver.glb) rides the spine
  // permanently (backModel*): re-centred pivot, flipped 180° so the arrows rise over the shoulder,
  // hugged to the back. All tuned via src/dev/poseViewer.
  { id: "shana", name: "Shana", classId: "whiteSilver", portrait: shanaPortrait, model: "shana", weaponModel: "shana_bow", weaponCellShaded: true, weaponLeftHand: true, weaponRotation: [0, 0, 0], weaponScale: 1.4, weaponGrip: 0, weaponBackRotation: [0, 0, 10], weaponBackOffset: [0.1, 0, -0.1], weaponBackScale: 1.4, backModel: "shana_quiver", backModelCellShaded: true, backModelRotation: [0, 0, 180], backModelScale: 1.0, backModelOffset: [0, -0.06, -0.11], deathAnim: "shana_death", weapon: "bow", hair: "bob", outfit: "archer", color: C_LIGHT, storyPlayable: true },
  { id: "miranda", name: "Miranda", classId: "whiteSilver", portrait: mirandaPortrait, model: "miranda", weaponModel: "shana_bow", weaponCellShaded: true, weaponLeftHand: true, weaponRotation: [0, 0, 0], weaponScale: 1.4, weaponGrip: 0, weaponBackRotation: [0, 0, 10], weaponBackOffset: [0.1, 0, -0.1], weaponBackScale: 1.4, backModel: "shana_quiver", backModelCellShaded: true, backModelRotation: [0, 0, 180], backModelScale: 1.0, backModelOffset: [0, -0.06, -0.11], weapon: "bow", hair: "flow", outfit: "valkyrie", color: C_LIGHT, storyPlayable: true },
  // Violet (Thunder) — martial artist (fists)
  { id: "kanzas", name: "Kanzas", classId: "thunder", portrait: kanzasPortrait, weapon: "fist", hair: "firebrand", outfit: "enforcer", color: C_THUNDER, storyPlayable: false },
  { id: "doel", name: "Doel", classId: "thunder", portrait: doelPortrait, weapon: "dualsword", hair: "imperial", outfit: "warlord", color: C_THUNDER, bodyColor: [0.16, 0.14, 0.2], storyPlayable: false },
  { id: "haschel", name: "Haschel", classId: "thunder", portrait: haschelPortrait, model: "haschel", weapon: "fist", hair: "elder", outfit: "martialist", color: C_THUNDER, storyPlayable: true },
  // Blue-Sea (Water) — hammer
  { id: "damia", name: "Damia", classId: "blueSea", portrait: damiaPortrait, dragoonPortrait: damiaDragoonPortrait, model: "damia", dragoonModel: "damia_dragoon", weaponModel: "damia_weapon", weaponGrip: 0.85, weapon: "hammer", hair: "siren", outfit: "siren", color: C_WATER, skinTone: [0.56, 0.76, 0.86], storyPlayable: false },
  { id: "lenus", name: "Lenus", classId: "blueSea", portrait: lenusPortrait, weapon: "hammer", hair: "long", color: C_WATER, storyPlayable: false },
  // Meru rides Damia's grafted mixamorig skeleton (skin transferred from Damia); her hammer seats on
  // mixamorig:RightHand. The hammer mesh is head-heavy at the BOTTOM (Y 0–0.3) with the haft above, so
  // the default grip 0.6 lands the fist on the HAFT (correct); a lower grip would seat the head in the
  // fist. Keep defaults — do NOT set weaponGrip below ~0.35 or she grabs the mallet head.
  { id: "meru", name: "Meru", classId: "blueSea", portrait: meruPortrait, model: "meru", weaponModel: "meru_hammer", weapon: "hammer", hair: "ponytail", outfit: "dancer", color: C_WATER, storyPlayable: true },
  // Golden (Earth) — axe
  { id: "belzac", name: "Belzac", classId: "golden", portrait: belzacPortrait, weapon: "axe", hair: "wrap", outfit: "brawler", color: C_EARTH, scale: 1.2, storyPlayable: false },
  { id: "kongol", name: "Kongol", classId: "golden", portrait: kongolPortrait, weapon: "axe", hair: "topknot", outfit: "gigantos", color: C_EARTH, skinTone: [0.66, 0.5, 0.34], scale: 1.4, storyPlayable: true },
];

/** Default playable bearer (Dart). */
export const DEFAULT_BEARER: Bearer = BEARERS.find((b) => b.id === "dart")!;

const BEARER_BY_ID = new Map(BEARERS.map((b) => [b.id, b]));
export function bearerById(id: string): Bearer | undefined {
  return BEARER_BY_ID.get(id);
}

/** Bearers whose Dragoon class is implemented (selectable in Survival/Training). */
export function selectableBearers(): Bearer[] {
  return BEARERS.filter((b) => isClassImplemented(b.classId));
}

/**
 * Default party: Damia leading, then the 3D-modeled bearers so they show up in Training.
 * Shared by the arena modes (starting lineup) and the main menu's asset prefetch, so what the
 * menu warms is exactly what a mode then loads.
 */
export function defaultPartyBearers(): Bearer[] {
  const roster = selectableBearers();
  const prefs = ["shana", "rose", "meru", "haschel", "lavitz", "albert"];
  const lead = roster.find((x) => x.id === "damia") ?? DEFAULT_BEARER;
  const team: Bearer[] = [lead];
  for (const id of prefs) {
    if (team.length >= 3) break;
    const b = roster.find((x) => x.id === id);
    if (b && !team.some((m) => m.id === b.id)) team.push(b);
  }
  // Top up from the implemented roster if the preferred picks weren't enough.
  for (const b of roster) {
    if (team.length >= 3) break;
    if (!team.some((m) => m.id === b.id)) team.push(b);
  }
  return team;
}

/** Every GLB a bearer needs on screen (body, Dragoon form, weapon) — for prefetch/loading sets. */
export function bearerModelNames(b: Bearer): string[] {
  return [b.model, b.dragoonModel, b.weaponModel, b.backModel, b.deathAnim].filter((n): n is string => !!n);
}
