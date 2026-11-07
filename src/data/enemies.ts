import type { Stats } from "../combat/types";
import type { Element } from "../combat/element";

export type { Element };

/**
 * An enemy action. `multiplier` is the hidden Attack Multiplier fed to the
 * damage formula (e.g. Sword Slash = 1× physical, Throw Dagger = 0.5×).
 * `element` applies to magical attacks (e.g. Burn Out = Fire).
 */
export interface EnemyAttack {
  name: string;
  kind: "physical" | "magical";
  multiplier: number;
  element?: Element;
  /**
   * Test-tool escape hatch: deal exactly this fraction of the TARGET's max HP and skip the damage
   * formula entirely — no stats, no element, no guard, no gear. Non-canon; it exists so a practice
   * target can hit for a known, repeatable number (see {@link SPARRING_DUMMY}).
   */
  hpFraction?: number;
}

/** AI profile: "basic" uses attacks[0]; "commander" runs the Seles boss script; "fruegel" /
 *  "fruegel2" the Hellena warden's two fights; "seniorWarden" his summoned guards; "dummy" never
 *  acts. */
export type EnemyBehavior = "basic" | "commander" | "fruegel" | "fruegel2" | "seniorWarden" | "dummy";

/** Static definition of an enemy: identity, element, stats and battle yield. */
export interface EnemyDef {
  id: string;
  name: string;
  element: Element;
  stats: Stats;
  /** Speed (turn order). */
  spd: number;
  /** Physical / magical avoidance, as a percentage (0–100). */
  aAv: number;
  mAv: number;
  /** Whether the enemy can counter the player's Additions. TODO: dormant — not yet read by combat.
   *  The counter damage formula (`additionCounter` in combat/formula.ts) exists + is tested; what's
   *  missing is the trigger in the combat flow. See the Backlog in docs/WIP.md. */
  countersAdditions: boolean;
  /** Actions the enemy can take. The first is its default basic attack. */
  attacks: EnemyAttack[];
  /** EXP awarded on defeat. */
  expReward: number;
  /** Gold awarded on defeat. */
  goldReward: number;
  /** AI profile (defaults to "basic"). */
  behavior?: EnemyBehavior;
  /** Visual scale of the placeholder mesh (bosses are larger). */
  scale?: number;
  /** Body colour as RGB 0–1 (defaults to the knight's grey-blue). */
  bodyColor?: [number, number, number];
  /**
   * Optional rigged GLB model (base filename in src/assets/models/) replacing the placeholder
   * capsule, with animations (idle / walk / attack). Falls back to the capsule if absent.
   */
  model?: string;
  /**
   * The model's shading is painted into its texture (AI cartoon/cell-shaded exports). Render it
   * flat-diffuse (metallic 0, roughness 1, no env) so the painted look shows, instead of the
   * metallic PBR tuning used for genuinely metal assets.
   */
  cellShaded?: boolean;
  /** Yaw (degrees) spinning the model so its front faces the enemy's forward (+Z, toward the target).
   *  Needed for exports whose authored facing isn't +Z — e.g. a Tripo creature that looks backward. */
  modelYaw?: number;
  /** Optional weapon GLB (base filename in src/assets/models/) attached to the model's right-hand
   *  bone (mixamorig:RightHand). The blade is authored along the mesh's own axis; the engine seats
   *  the grip in the fist and points it out. */
  weaponModel?: string;
  /** Fit and ground the model on its skinned rest pose (a Mixamo-rigged Tripo export, whose raw
   *  geometry sits elsewhere than where its bones put it) rather than on the raw mesh. */
  fitSkinned?: boolean;
  /** The weapon's turn in the hand, degrees [x, y, z] (default: the swords' [0, 0, -90]). */
  weaponRotation?: [number, number, number];
  /** Aim the weapon every frame (forward at rest, along the forearm in a blow) instead of a fixed
   *  turn in the fist — for a rig whose hand pose changes a lot between clips. */
  weaponCarry?: boolean;
  /** Marks a boss: wider health bar + name plate. */
  isBoss?: boolean;
  /** Cannot be killed (clamped at 1 HP) — for the training dummy. */
  immortal?: boolean;
}

/**
 * Training Dummy — a non-canon practice target. Does not move or attack and
 * cannot be killed (HP clamps at 1), so it stays put as a damage/Addition test
 * bag. Non-elemental and moderate DF for clean baseline numbers.
 */
export const TRAINING_DUMMY: EnemyDef = {
  id: "training_dummy",
  name: "Training Dummy",
  element: "Non-Elemental",
  stats: { maxHp: 999999, at: 0, df: 50, mat: 0, mdf: 50 },
  spd: 1,
  aAv: 0,
  mAv: 0,
  countersAdditions: false,
  attacks: [{ name: "—", kind: "physical", multiplier: 0 }],
  expReward: 0,
  goldReward: 0,
  behavior: "dummy",
  immortal: true,
  bodyColor: [0.72, 0.58, 0.32],
};

/**
 * Sparring Dummy — a non-canon practice target that HITS BACK, in the spirit of the PS1 game's
 * special training foes. It chases and strikes like any melee enemy, but its blow always lands for
 * exactly **10% of the target's max HP** — no stats, no element, no guard, no gear reduction. A
 * fixed, repeatable number is the whole point: it makes combat feedback (floating damage numbers,
 * their fan-out, hit reactions) measurable instead of guessed at.
 *
 * Immortal like the inert {@link TRAINING_DUMMY}, at the roster's baseline pace (SPD 50 → a blow
 * every 3 s), so what you observe matches the cadence of a real fight.
 */
export const SPARRING_DUMMY: EnemyDef = {
  id: "sparring_dummy",
  name: "Sparring Dummy",
  element: "Non-Elemental",
  stats: { maxHp: 999999, at: 0, df: 50, mat: 0, mdf: 50 },
  spd: 50,
  aAv: 0,
  mAv: 0,
  countersAdditions: false,
  attacks: [{ name: "Calibrated Blow", kind: "physical", multiplier: 0, hpFraction: 0.1 }],
  expReward: 0,
  goldReward: 0,
  immortal: true,
  bodyColor: [0.74, 0.36, 0.28],
};

/**
 * Knight of Sandora — Seles variant. First encountered occupying Seles; a weak,
 * scripted tutorial-tier foe (tiny HP, high DF) that does not counter Additions.
 */
export const KNIGHT_OF_SANDORA_SELES: EnemyDef = {
  id: "knight_of_sandora_seles",
  name: "Knight of Sandora",
  element: "Fire",
  stats: { maxHp: 4, at: 2, df: 40, mat: 2, mdf: 50 },
  spd: 40,
  aAv: 0,
  mAv: 0,
  countersAdditions: false,
  attacks: [
    { name: "Sword Slash", kind: "physical", multiplier: 1 },
    { name: "Throw Dagger", kind: "physical", multiplier: 0.5 },
  ],
  expReward: 2,
  goldReward: 3,
  model: "knight_sandora",
  cellShaded: true,
  weaponModel: "kos_sword",
};

/**
 * Knight of Sandora — Black Castle variant. A far tougher version patrolling the
 * Black Castle in Kazas: high HP/DF, self-heals, and counters Additions.
 */
export const KNIGHT_OF_SANDORA_BLACK_CASTLE: EnemyDef = {
  id: "knight_of_sandora_black_castle",
  name: "Knight of Sandora",
  element: "Fire",
  stats: { maxHp: 180, at: 21, df: 100, mat: 21, mdf: 100 },
  spd: 50,
  aAv: 0,
  mAv: 0,
  countersAdditions: true,
  attacks: [
    { name: "Throw Knife", kind: "physical", multiplier: 1 },
    { name: "Sword Slash", kind: "physical", multiplier: 2 },
  ],
  expReward: 24,
  goldReward: 15,
  model: "knight_sandora",
  cellShaded: true,
  weaponModel: "kos_sword",
};

/** Default Knight of Sandora used in the sandbox (the first-encountered Seles squad member). */
export const KNIGHT_OF_SANDORA = KNIGHT_OF_SANDORA_SELES;

/**
 * Commander — Seles Boss. Confronts Dart in Seles alongside two Knights of
 * Sandora. House-rule script (adapted from the canon "knights defeated" trigger):
 * the turn he first drops below 50% HP he uses Power Up AND recovers 30% HP in
 * one action (single use) — Sword Slash is replaced by Slash Twice (2×) and Burn
 * Out rises to 1.5×. Burn Out is a 10 s-cooldown Fire spell (like the player's).
 * Darkness element; does not counter Additions.
 */
export const COMMANDER_SELES: EnemyDef = {
  id: "commander_seles",
  name: "Commander",
  element: "Darkness",
  stats: { maxHp: 15, at: 2, df: 40, mat: 4, mdf: 40 }, // JP hp (EU/US: 14); other stats identical across versions
  spd: 40,
  aAv: 0,
  mAv: 0,
  countersAdditions: false,
  attacks: [
    { name: "Sword Slash", kind: "physical", multiplier: 1 },
    { name: "Burn Out", kind: "magical", multiplier: 1.2, element: "Fire" },
    { name: "Slash Twice", kind: "physical", multiplier: 2 },
  ],
  expReward: 20,
  goldReward: 20,
  behavior: "commander",
  isBoss: true,
  scale: 1.3,
  bodyColor: [0.28, 0.18, 0.42],
  model: "commander",
  cellShaded: true,
  weaponModel: "commander_sword",
};

/**
 * Commander — Marshland minor enemy. A much tougher field version that counters
 * Additions. Its full kit (Multi Slash at ≤50% HP, Stunning Hammer) awaits a
 * status-effect system; for now it uses Sword Slash.
 */
export const COMMANDER_MARSHLAND: EnemyDef = {
  id: "commander_marshland",
  name: "Commander",
  element: "Darkness",
  stats: { maxHp: 128, at: 11, df: 120, mat: 9, mdf: 80 },
  spd: 70,
  aAv: 0,
  mAv: 0,
  countersAdditions: true,
  attacks: [
    { name: "Sword Slash", kind: "physical", multiplier: 1 },
    { name: "Multi Slash", kind: "physical", multiplier: 2 },
    { name: "Stunning Hammer", kind: "physical", multiplier: 0 },
  ],
  expReward: 17,
  goldReward: 9,
  scale: 1.3,
  bodyColor: [0.3, 0.2, 0.4],
  model: "commander",
  cellShaded: true,
  weaponModel: "commander_sword",
};

/* ============================================================================
 * Hellena Prison — Fruegel, the warden, fought on both visits (Disc 1).
 *
 * Sources: legendofdragoon.org (the wiki, which prevails on behaviour; its stats are the US ones)
 * and the Fandom wiki. Stats: the JP value whenever one is known, from either source; otherwise
 * the US one. Ability names marked ~ are the community's.
 * Drops (Knight Shield / 4 Healing Potions; Gravity Grabber) are not modelled yet.
 * ========================================================================== */

/** Fruegel's model, mace and fit — shared by both fights. */
const FRUEGEL_LOOK = {
  isBoss: true,
  scale: 1.25,
  bodyColor: [0.25, 0.2, 0.4] as [number, number, number],
  model: "fruegel",
  cellShaded: true,
  weaponModel: "fruegel_mace", // his mace (head at the mesh origin, like the swords' tip)
  fitSkinned: true,
  weaponCarry: true, // the mace held out before him, head forward and up, swung with the arm
};

/**
 * Fruegel, first visit (formation 386: Fruegel, Hellena Warden ×2, Senior Warden ×2). In the story
 * fight he opens with two Hellena Wardens at his side: he cannot be targeted while one stands
 * (PS1), but — unlike PS1's Observer, which made the fight too easy — he attacks from the start.
 * Once both are down he blows his Whistle (Auto, single use) and two Senior Wardens come in.
 * Spawned alone (Training), he is targetable at once and never whistles.
 * Moves: ~Slam (1.5×) and ~Rock Throw (2×) at random; ~Club (1×) only as his Retaliate — 20% when
 * an Addition is aimed at him, out of turn order; Power Up (dealt ×1.5, taken ×0.5 for 3 of his
 * turns) on his next turn after he is hit by magic, single use, only if no other enemy has.
 * Stats: JP HP/AT/MAT/EXP/Gold (Fandom), DF/MDF/SPD as both list them. US/EU: HP 90, AT 5,
 * MAT 3, EXP 300, Gold 50.
 */
export const FRUEGEL: EnemyDef = {
  id: "fruegel",
  name: "Fruegel",
  element: "Earth",
  stats: { maxHp: 125, at: 6, df: 100, mat: 4, mdf: 80 },
  spd: 50,
  aAv: 0,
  mAv: 0,
  countersAdditions: true,
  attacks: [
    { name: "Slam", kind: "physical", multiplier: 1.5 },
    { name: "Rock Throw", kind: "physical", multiplier: 2 }, // hurled (his Throw clip)
    { name: "Club", kind: "physical", multiplier: 1 }, // Retaliate only
  ],
  expReward: 240,
  goldReward: 20,
  behavior: "fruegel",
  ...FRUEGEL_LOOK,
};

/**
 * Fruegel, second visit (formation 387: Fruegel, Rodriguez, Guftas). Final Blow: the battle ends
 * when he falls (his pets flee). ~Club (1×), ~Chop (1.5×), ~Rock Throw (2×) at random; Power Up
 * when hit by magic (Auto, single use). His pets and his Command to them are still to come.
 * Stats: the wiki's (no JP figures given for this fight).
 */
export const FRUEGEL_2: EnemyDef = {
  id: "fruegel_2",
  name: "Fruegel",
  element: "Earth",
  stats: { maxHp: 1000, at: 25, df: 100, mat: 19, mdf: 80 },
  spd: 50,
  aAv: 0,
  mAv: 0,
  countersAdditions: true,
  attacks: [
    { name: "Club", kind: "physical", multiplier: 1 },
    { name: "Chop", kind: "physical", multiplier: 1.5 },
    { name: "Rock Throw", kind: "physical", multiplier: 2 },
  ],
  expReward: 2000,
  goldReward: 200,
  behavior: "fruegel2",
  ...FRUEGEL_LOOK,
};

/**
 * Hellena Warden, at Fruegel's side in the first fight (their fall makes him whistle). Stats are the
 * first-visit Hellena Warden's JP figures (HP 12; US/EU 9); the boss formation's copies have
 * "slightly higher HP" (exact figure not documented). Element Fire. The Knight of Sandora's model
 * stands in for him until his own.
 */
export const HELLENA_WARDEN_BOSS: EnemyDef = {
  id: "hellena_warden_boss",
  name: "Hellena Warden",
  element: "Fire",
  stats: { maxHp: 12, at: 4, df: 100, mat: 4, mdf: 100 },
  spd: 50,
  aAv: 0,
  mAv: 0,
  countersAdditions: false,
  attacks: [{ name: "Spear", kind: "physical", multiplier: 1 }],
  expReward: 6,
  goldReward: 0,
  scale: 1.0,
  bodyColor: [0.4, 0.25, 0.2],
  model: "knight_sandora",
  weaponModel: "kos_sword",
};

/**
 * Senior Warden, whistled in by Fruegel in the first fight. Double Voulge; as he falls he throws a
 * Gushing Magma ("Huh, I may as well take you to hell with me!"); a few turns after his partner
 * falls he powers up and takes half damage. Stats: JP HP 25 (Fandom; US 20 on the wiki), the
 * wiki's boss-extra figures otherwise (no EXP). Element Fire. The Knight of Sandora's model stands
 * in for him.
 */
export const SENIOR_WARDEN_BOSS: EnemyDef = {
  id: "senior_warden_boss",
  name: "Senior Warden",
  element: "Fire",
  stats: { maxHp: 25, at: 4, df: 100, mat: 8, mdf: 100 },
  spd: 50,
  aAv: 0,
  mAv: 0,
  countersAdditions: false,
  attacks: [{ name: "Double Voulge", kind: "physical", multiplier: 1 }],
  expReward: 0,
  goldReward: 0,
  behavior: "seniorWarden",
  scale: 1.05,
  bodyColor: [0.45, 0.2, 0.2],
  model: "knight_sandora",
  weaponModel: "kos_sword",
};

/** Enemies a boss can call into the fight (Fruegel's Whistle), by id. */
export const SUMMONS: Record<string, EnemyDef> = {
  senior_warden_boss: SENIOR_WARDEN_BOSS,
};

/* ============================================================================
 * Forest — Disc 1, area #2 (Seles → Forest → Hellena Prison). Four minor enemies,
 * one per element: Berserk Mouse (Darkness), Assassin Cock (Wind), Trent (Earth),
 * Goblin (Fire). Added in canonical order of appearance.
 *
 * STAT CONVENTION: we use the Japanese PS1 values when known (they usually differ
 * from — and are often higher than — the EU/US numbers on thelegendofdragoon.org).
 * The fandom wiki lists JP figures in parentheses. When only EU/US stats exist, we
 * use those and flag the gap. Movesets/flags come from the tier-2 wiki (version-agnostic).
 * ========================================================================== */

/**
 * Berserk Mouse — Darkness critter, "quite large and aggressive". Counters Additions.
 * Canon moveset: ~Bite (1×) above 50% HP, Chisel (2×) at/below 50%, plus a "Run away!".
 * Under the basic AI it uses its first melee attack (Bite); Chisel is kept for a future
 * HP-threshold behaviour, and the flee action isn't modelled yet. Stats are the JP values
 * (HP/AT/MAT/SPD higher, EXP/Gold lower than EU/US). No model yet → placeholder capsule.
 */
export const BERSERK_MOUSE: EnemyDef = {
  id: "berserk_mouse",
  name: "Berserk Mouse",
  element: "Darkness",
  stats: { maxHp: 4, at: 2, df: 80, mat: 2, mdf: 120 }, // JP (EU/US: hp2 at1 mat1)
  spd: 50, // JP (EU/US: 45)
  aAv: 0,
  mAv: 0,
  countersAdditions: true,
  attacks: [
    { name: "Bite", kind: "physical", multiplier: 1 }, // >50% HP — the active melee attack
    { name: "Chisel", kind: "physical", multiplier: 2 }, // ≤50% HP — inactive under basic AI (v1)
  ],
  expReward: 1, // JP (EU/US: 3)
  goldReward: 1, // JP (EU/US: 3)
  model: "berserk_mouse", // Tripo quadruped, un-rigged → engine synthesises rigid idle/walk/attack
  cellShaded: true, // painted Tripo texture — render flat-diffuse
  // fitHeight normalises to 1.8 (human height); this flat, wide critter needs shrinking to a big-rat
  // size. scale multiplies the whole enemy (model + health bar). Tune in-game if too big/small.
  scale: 0.45,
  modelYaw: 0, // flip to 180 if it faces away from its target in-game
  bodyColor: [0.28, 0.24, 0.34], // fallback capsule tint if the model fails to load
};

/**
 * Trent — Earth, an ambulatory quadrupedal tree-creature. Counters Additions. Canon moveset:
 * ~Trunk Slap (1.5× physical) above 25% HP, Pellet (1.5× Earth-elemental magic) at/below 50%.
 * Under the basic AI it uses its first attack (Trunk Slap); Pellet — its Earth magic — is kept for a
 * future HP-threshold behaviour. JP stats (AT/MAT/MDF higher, Gold lower than EU/US). Non-humanoid
 * (un-rigged Tripo mesh) → rigid procedural animation, same as the Berserk Mouse.
 */
export const TRENT: EnemyDef = {
  id: "trent",
  name: "Trent",
  element: "Earth",
  stats: { maxHp: 6, at: 3, df: 160, mat: 3, mdf: 120 }, // JP (EU/US: hp5 at2 mat2 mdf40)
  spd: 30,
  aAv: 0,
  mAv: 0,
  countersAdditions: true,
  attacks: [
    { name: "Trunk Slap", kind: "physical", multiplier: 1.5 }, // >25% HP — the active attack
    // ≤50% HP — inactive under basic AI (v1). Multiplier 1, NOT the wikis' 1.5: measured on the JP
    // PS1 (MAT 3 vs Dart's MDF 9 → 5 damage). floor(3²×5/9) = 5 exactly, while ×1.5 cannot produce
    // 5 at all — the reachable values are 1, 3, 4, 6, 7, 9… See docs/canon/ps1-jp-measurements.md.
    { name: "Pellet", kind: "magical", multiplier: 1, element: "Earth" },
  ],
  expReward: 4,
  goldReward: 3, // JP (EU/US: 9)
  model: "trent", // Tripo quadruped, un-rigged → engine synthesises rigid idle/walk/attack
  cellShaded: true, // painted Tripo texture — render flat-diffuse
  scale: 1.4, // a looming treant — taller than the ~1.8 party (fitHeight normalises to 1.8, ×1.4 ≈ 2.5)
  modelYaw: 0, // flip to 180 if it faces away from its target in-game
  bodyColor: [0.3, 0.34, 0.22], // fallback capsule tint if the model fails to load
};

/**
 * Goblin — Fire, a small greenish humanoid swinging a large bone as a club. Counters Additions.
 * Canon moveset: ~Bone Club (1.5× physical) above 50% HP; at/below 50% either Throw Stone (3×) or
 * ~Kick (4×). Under the basic AI it melees with Bone Club and throws stones from range (Throw Stone
 * is picked up as the ranged attack once the rigged model brings a throw clip); Kick waits on a
 * future HP-threshold behaviour. JP stats (HP/MAT higher, Gold lower than EU/US).
 *
 * Humanoid, but automatic rigging fought its squat proportions: Mixamo's auto-weights stretched the
 * mesh on any arm motion, and even a Knight skin-transfer stayed too stiff. So — like the Berserk
 * Mouse / Trent — it runs on the UN-rigged mesh with rigid procedural animation (bob/hop/lunge/topple).
 * No skeleton means no hand socket, so the bone club (Goblin__Weapon.glb, kept in the upload/pipeline)
 * is dropped until a proper rig; and with no throw clip, Throw Stone falls back to melee.
 */
export const GOBLIN: EnemyDef = {
  id: "goblin",
  name: "Goblin",
  element: "Fire",
  stats: { maxHp: 5, at: 2, df: 120, mat: 3, mdf: 120 }, // JP (EU/US: hp4 mat1)
  spd: 40,
  aAv: 0,
  mAv: 0,
  countersAdditions: true,
  attacks: [
    { name: "Bone Club", kind: "physical", multiplier: 1.5 }, // >50% HP — the active attack
    { name: "Throw Stone", kind: "physical", multiplier: 3 }, // ≤50% HP — no throw clip yet → melee
    { name: "Kick", kind: "physical", multiplier: 4 }, // ≤50% HP — inactive under basic AI (v1)
  ],
  expReward: 4,
  goldReward: 2, // JP (EU/US: 6)
  model: "goblin", // un-rigged Tripo mesh → engine synthesises rigid idle/walk/attack (Trent/Berserk path)
  cellShaded: true, // painted Tripo texture — render flat-diffuse
  scale: 0.7, // a small humanoid, shorter than the ~1.8 party. Tune in-game.
  modelYaw: 0, // flip to 180 if it faces away from its target in-game
  bodyColor: [0.32, 0.4, 0.24], // fallback capsule tint if the model fails to load
};

/**
 * Assassin Cock — Wind, an aggressive fighting-cock (recolor of Hellena's Fowl Fighter). Counters
 * Additions. Canon moveset: ~Talon Kick (2× physical) above 50% HP; ~Cry (1× Non-Elemental magic, a
 * party AoE) at/below 50%. Under the basic AI it uses Talon Kick; Cry (AoE + HP-gated) waits on a
 * future behaviour. JP stats (HP/MAT/SPD higher, Gold lower than EU/US). Non-humanoid bird → rigid
 * procedural animation (same path as the Berserk Mouse / Trent).
 */
export const ASSASSIN_COCK: EnemyDef = {
  id: "assassin_cock",
  name: "Assassin Cock",
  element: "Wind",
  stats: { maxHp: 4, at: 2, df: 100, mat: 3, mdf: 120 }, // JP (EU/US: hp3 mat2)
  spd: 50, // JP (EU/US: 45)
  aAv: 0,
  mAv: 0,
  countersAdditions: true,
  attacks: [
    { name: "Talon Kick", kind: "physical", multiplier: 2 }, // >50% HP — the active attack
    { name: "Cry", kind: "magical", multiplier: 1, element: "Non-Elemental" }, // ≤50% party AoE — inactive (v1)
  ],
  expReward: 5,
  goldReward: 2, // JP (EU/US: 6)
  model: "assassin_cock", // un-rigged Tripo bird → engine synthesises rigid idle/walk/attack
  cellShaded: true, // painted Tripo texture — render flat-diffuse
  scale: 0.5, // a big fighting-cock, small-critter sized. Tune in-game.
  modelYaw: 90, // its Tripo mesh faces -X; +90° points the head at +Z (the enemy's forward)
  bodyColor: [0.5, 0.32, 0.24], // reddish placeholder capsule if the model fails to load
};
