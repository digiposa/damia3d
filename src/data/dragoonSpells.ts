import type { Element } from "../combat/element";
import type { DragoonClassId } from "./dragoonClasses";

/** Who a Dragoon spell targets. Single-ally/enemy resolve to the locked foe / lowest-HP ally. */
export type SpellTarget = "enemy" | "allEnemies" | "ally" | "allAllies";

/**
 * One Dragoon Magic spell (canon — see docs/canon/dragoon.md). `multiplier` drives the magic
 * damage formula; the recovery/effect fields layer on top. Status ailments (fear/stun/death)
 * and the `damageHalve` buff have no engine support yet (Phase 3b) — they still cast and deal
 * any damage, but the ailment/buff is only flagged.
 */
export interface DragoonSpell {
  id: string;
  name: string;
  /** MP cost. */
  mp: number;
  /** Dragoon Level at which it's learned (1 = initial). */
  dLevel: number;
  target: SpellTarget;
  /** Element of the damage / Dragoon-Space field (Non-Elemental for the Divine spells). */
  element: Element;
  /** Magic damage multiplier (%); omit for pure-support spells. */
  multiplier?: number;
  /** Restore this fraction of Max HP to living ally target(s). */
  heal?: number;
  /** Revive a downed (HP 0) ally target at this fraction of Max HP. */
  revive?: number;
  /** Cure all status ailments on ally target(s). */
  cure?: boolean;
  /** Astral Drain: heal each living ally by floor(damage / living allies). */
  drainHeal?: boolean;
  /** W Silver Dragon: also fully heal all living allies (on an enemy-target spell). */
  allyHealFull?: boolean;
  /** Status ailment inflicted on enemy target(s) — Phase 3b (currently flagged only). */
  status?: "fear" | "stun" | "death";
  /** Persistent buff on ally target(s) — Phase 3b (currently flagged only). */
  buff?: "damageHalve";
}

const SPELLS: Record<DragoonClassId, DragoonSpell[]> = {
  redEye: [
    { id: "flameShot", name: "Flame Shot", mp: 10, dLevel: 1, target: "enemy", element: "Fire", multiplier: 200 },
    { id: "explosion", name: "Explosion", mp: 20, dLevel: 2, target: "allEnemies", element: "Fire", multiplier: 100 },
    { id: "finalBurst", name: "Final Burst", mp: 30, dLevel: 3, target: "enemy", element: "Fire", multiplier: 300 },
    { id: "redEyeDragon", name: "Red-Eye Dragon", mp: 80, dLevel: 5, target: "allEnemies", element: "Fire", multiplier: 300 },
  ],
  jade: [
    { id: "wingBlaster", name: "Wing Blaster", mp: 20, dLevel: 1, target: "allEnemies", element: "Wind", multiplier: 100 },
    { id: "roseStorm", name: "Rose Storm", mp: 20, dLevel: 2, target: "allAllies", element: "Wind", buff: "damageHalve" },
    { id: "gaspless", name: "Gaspless", mp: 30, dLevel: 3, target: "enemy", element: "Wind", multiplier: 300 },
    { id: "jadeDragon", name: "Jade Dragon", mp: 80, dLevel: 5, target: "allEnemies", element: "Wind", multiplier: 300 },
  ],
  whiteSilver: [
    { id: "moonLight", name: "Moon Light", mp: 10, dLevel: 1, target: "ally", element: "Light", heal: 1, revive: 0.5, cure: true },
    { id: "starChildren", name: "Star Children", mp: 20, dLevel: 2, target: "allEnemies", element: "Light", multiplier: 100 },
    { id: "gatesOfHeaven", name: "Gates of Heaven", mp: 30, dLevel: 3, target: "allAllies", element: "Light", heal: 0.5, revive: 0.5, cure: true },
    { id: "wSilverDragon", name: "W Silver Dragon", mp: 80, dLevel: 5, target: "allEnemies", element: "Light", multiplier: 300, allyHealFull: true },
  ],
  darkness: [
    { id: "astralDrain", name: "Astral Drain", mp: 10, dLevel: 1, target: "enemy", element: "Darkness", multiplier: 200, drainHeal: true },
    { id: "deathDimension", name: "Death Dimension", mp: 20, dLevel: 2, target: "allEnemies", element: "Darkness", multiplier: 100, status: "fear" },
    { id: "demonsGate", name: "Demon's Gate", mp: 30, dLevel: 3, target: "allEnemies", element: "Darkness", status: "death" },
    { id: "darkDragon", name: "Dark Dragon", mp: 80, dLevel: 5, target: "enemy", element: "Darkness", multiplier: 400 },
  ],
  thunder: [
    { id: "atomicMind", name: "Atomic Mind", mp: 10, dLevel: 1, target: "enemy", element: "Thunder", multiplier: 100 },
    { id: "thunderKid", name: "Thunder Kid", mp: 20, dLevel: 2, target: "enemy", element: "Thunder", multiplier: 200, status: "stun" },
    { id: "thunderGod", name: "Thunder God", mp: 30, dLevel: 3, target: "enemy", element: "Thunder", multiplier: 300 },
    { id: "violetDragon", name: "Violet Dragon", mp: 80, dLevel: 5, target: "enemy", element: "Thunder", multiplier: 400 },
  ],
  blueSea: [
    { id: "freezingRing", name: "Freezing Ring", mp: 10, dLevel: 1, target: "enemy", element: "Water", multiplier: 200 },
    { id: "rainbowBreath", name: "Rainbow Breath", mp: 20, dLevel: 2, target: "allAllies", element: "Water", heal: 0.5, cure: true },
    { id: "diamondDust", name: "Diamond Dust", mp: 30, dLevel: 3, target: "allEnemies", element: "Water", multiplier: 200 },
    { id: "blueSeaDragon", name: "Blue Sea Dragon", mp: 80, dLevel: 5, target: "enemy", element: "Water", multiplier: 400 },
  ],
  golden: [
    { id: "grandStream", name: "Grand Stream", mp: 20, dLevel: 1, target: "allEnemies", element: "Earth", multiplier: 150 },
    { id: "meteorStrike", name: "Meteor Strike", mp: 20, dLevel: 3, target: "allEnemies", element: "Earth", multiplier: 200 },
    { id: "goldenDragon", name: "Golden Dragon", mp: 80, dLevel: 5, target: "allEnemies", element: "Earth", multiplier: 300 },
  ],
};

/** All Dragoon spells for a class, in learn order. */
export function spellsForClass(id: DragoonClassId): DragoonSpell[] {
  return SPELLS[id] ?? [];
}
