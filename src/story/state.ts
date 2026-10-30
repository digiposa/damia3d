import { ATTACK_ITEMS, CHARM_POTION, HEALING_POTION, SPIRIT_POTION, SUN_RHAPSODY, type ItemDef } from "../data/items";

/**
 * The Story's save state: where the hero is, what has happened (flags), what the party owns.
 * One slot, kept in localStorage (best effort: a private window just won't remember).
 */
export interface StoryState {
  /** Current map id and the entry point to appear at. */
  map: string;
  entry: string;
  /** Story beats seen, chests opened, NPCs met… (string ids). */
  flags: string[];
  gold: number;
  items: { id: string; count: number }[];
  /** Party bearer ids, in order. */
  party: string[];
  level: number;
}

const KEY = "damia3d.story.v1";

/** Where a new game starts (the intro comes later: Seles for now). */
export function newStory(): StoryState {
  return { map: "seles", entry: "start", flags: [], gold: 0, items: [{ id: "healingPotion", count: 3 }], party: ["dart"], level: 1 };
}

let current: StoryState | null = null;

/** The running story (loaded from the save, or a new game). */
export function story(): StoryState {
  if (!current) current = loadStory() ?? newStory();
  return current;
}

export function startNewStory(): StoryState {
  current = newStory();
  saveStory();
  return current;
}

export function hasSave(): boolean {
  try {
    return !!localStorage.getItem(KEY);
  } catch {
    return false;
  }
}

export function saveStory(): void {
  if (!current) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    /* storage unavailable: the game still runs, it just won't remember */
  }
}

function loadStory(): StoryState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as StoryState;
    return s && typeof s.map === "string" ? s : null;
  } catch {
    return null;
  }
}

export function hasFlag(id: string): boolean {
  return story().flags.includes(id);
}

export function setFlag(id: string): void {
  const s = story();
  if (!s.flags.includes(id)) s.flags.push(id);
}

/** Every item the Story can hold, by id. */
const ITEMS = new Map<string, ItemDef>(
  [HEALING_POTION, SPIRIT_POTION, SUN_RHAPSODY, CHARM_POTION, ...ATTACK_ITEMS].map((d) => [d.id, d]),
);
export function itemDef(id: string): ItemDef | undefined {
  return ITEMS.get(id);
}
