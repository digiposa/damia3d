import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import "@babylonjs/core/Meshes/meshBuilder";
// Side-effect import: scene.pick / createPickingRay need Ray registered, else
// every click throws "Ray needs to be imported before" and click-to-move dies.
import "@babylonjs/core/Culling/ray";

import { GameMode } from "../core/GameMode";
import { settings } from "../core/settings";
import { IsoCamera } from "../world/IsoCamera";
import { createArena, clampToArena } from "../world/Arena";
import { Atmosphere } from "../world/atmosphere";
import { LIGHTING_PRESETS } from "../world/lighting";
import { loadEnvironment, importModel, type PropPlacement } from "../world/props";
import { projectToScreen } from "../world/project";
import { Player, MAX_DRAGOON_LEVEL } from "../entities/Player";
import { PartyMember } from "../entities/PartyMember";
import { Enemy, type EnemyAction } from "../entities/Enemy";
import { Arrow } from "../entities/Arrow";
import { GambitBrain, resolveGambit, nextGambitId, DEFAULT_GAMBIT_IDS } from "../combat/Gambit";
import type { ActionId } from "../combat/Action";
import { startingItems, type ItemDef } from "../data/items";
import { KNIGHT_OF_SANDORA, COMMANDER_SELES, TRAINING_DUMMY } from "../data/enemies";
import {
  additionHitsPercent,
  additionMultiplier,
  additionPresses,
  BASIC_ATTACK,
} from "../data/additions";
import { RosterStore, EQUIP_SLOTS } from "../data/roster";
import {
  additionAttack,
  dragoonAttack,
  DRAGOON_OUTPUT,
  magicAttack,
  enemyPhysicalAttack,
  enemyMagicalAttack,
} from "../combat/formula";
import { SpellMenu, type SpellEntry } from "../ui/SpellMenu";
import { ItemMenu, type ItemEntry } from "../ui/ItemMenu";
import type { DragoonSpell } from "../data/dragoonSpells";
import { estimateDps } from "../combat/balance";
import { elementMultiplier, fieldMultiplier, type Element } from "../combat/element";
import { AdditionRunner } from "../combat/AdditionRunner";
import { t } from "../core/i18n";
import type { ModeMenuData, AdditionEntry, StatusView, EquipView, CharacterSheet } from "../core/menu";
import {
  type EquipSlot,
  equipById,
  equipmentForSlot,
  equipSummary,
} from "../data/equipment";
import { type Bearer, DEFAULT_BEARER, bearerById, selectableBearers } from "../data/bearers";
import { dragoonClass } from "../data/dragoonClasses";
import { computeCharacterStats } from "../data/characterStats";
import { ActionButton } from "../ui/ActionButton";

// 3-frame sprite icon sets ripped from the LoD icon sheet — each animates while the ATB
// is ready and freezes on its rest pose. Loaded eagerly as URLs via Vite glob so the set
// stays in sync with the files in assets/icons without 30 import lines.
const ICON_URLS = import.meta.glob("../assets/icons/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
const iconFrames = (prefix: string, n = 3): string[] =>
  Array.from({ length: n }, (_, i) => ICON_URLS[`../assets/icons/${prefix}_${i}.png`]);

const ATTACK_ICON_FRAMES = iconFrames("attack"); // blue sword (human form)
const ATTACK_DRAGOON_FRAMES = iconFrames("redsword"); // red sword (dragoon form)
const GUARD_ICON_FRAMES = iconFrames("guard"); // green shield
const SPECIAL_ICON_FRAMES = iconFrames("special"); // yin-yang (all-party Special)
const ITEM_ICON_FRAMES = iconFrames("chest"); // treasure chest (opens)
const MAGIC_ICON_FRAMES = iconFrames("wand"); // green wand (waves)
/** Dragoon-eye sprite (closed → opens) per element, for the Transform button.
 *  Non-Elemental has no eye — those archetypes fall back to Fire. */
const EYE_FRAMES: Partial<Record<Element, string[]>> & { Fire: string[] } = {
  Fire: iconFrames("eye_fire"),
  Wind: iconFrames("eye_wind"),
  Light: iconFrames("eye_light"),
  Thunder: iconFrames("eye_thunder"),
  Darkness: iconFrames("eye_darkness"),
  Water: iconFrames("eye_water"),
  Earth: iconFrames("eye_earth"),
};

/** A 0–1 RGB archetype colour as a CSS rgba() string. */
function rgba(c: [number, number, number], a: number): string {
  return `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${a})`;
}
import { Button } from "../ui/Button";
import { PartyPanel, type PartyRowView } from "../ui/PartyPanel";
import { TimingSight } from "../ui/TimingSight";
import { TrainingMenu, type BalanceRow } from "../ui/TrainingMenu";
import { floatingText } from "../ui/FloatingText";

/** How close a melee attacker must be to land a combo hit on an enemy. */
const PLAYER_REACH = 2.3;

/** How close a ranged attacker (bow) must be to loose an arrow. */
const RANGED_REACH = 9;

/** Seconds between a ranged bearer's shots (their attack cadence). */
const RANGED_COOLDOWN = 0.7;

/** Pressing Attack with nobody in reach locks onto the nearest enemy within this radius and walks over. */
const ACQUIRE_RANGE = 20;

/** Arrow flight speed (world units / second). */
const ARROW_SPEED = 26;

/** Reference enemy defence used by the Training balance/DPS readout. */
const BALANCE_REF_DF = 20;

/** SP gained by an AI member per auto-attack (so it can charge up to transform). */
const AI_SP_PER_HIT = 20;

/** Fixed breather after every action (combat seconds), on top of max(exec, ATB fill). Keeps a
 *  rhythm/enemy window after long Additions without inverting the canon Addition ranking. */
const ACTION_RECOVERY = 0.5;

/** How fast the world (enemies, allies, every ATB gauge) runs WHILE the player is executing a
 *  combo. 0 = full freeze (a combo costs no game time → length-independent, perfectly canon);
 *  ~0.2 = slow-mo (combo still costs a little, world stays alive); 1 = no slow-down (the old
 *  overlap, which penalised long combos). The combo's own timing runs at real time regardless. */
const COMBO_TIME_SCALE = 0.2;

// Dragoon-Magic status / buff durations (seconds of combat time).
const FEAR_SECONDS = 12;
const STUN_SECONDS = 5;
const DAMAGE_HALVE_SECONDS = 15; // Rose/Blossom Storm (~3 turns)

/** Element colour as a 0–1 RGB triplet, for the Dragoon Space arena tint. */
const ELEMENT_RGB: Record<Element, [number, number, number]> = {
  Fire: [0.9, 0.35, 0.22],
  Water: [0.25, 0.6, 0.95],
  Wind: [0.35, 0.82, 0.45],
  Earth: [0.85, 0.66, 0.25],
  Light: [0.92, 0.9, 0.78],
  Darkness: [0.62, 0.32, 0.86],
  Thunder: [0.55, 0.42, 0.95],
  "Non-Elemental": [0.6, 0.6, 0.7],
};

/** Accent colour per element, for the spell picker rows / cast popups. */
const ELEMENT_COLOR: Record<Element, string> = {
  Fire: "#ff6b4a",
  Water: "#4aa6ff",
  Wind: "#5fd17a",
  Earth: "#e0a93f",
  Light: "#ece6c8",
  Darkness: "#b066e0",
  Thunder: "#8f6bff",
  "Non-Elemental": "#bdbdc8",
};

/** Floating combat-text palette — one colour per feedback type (tweak here only). */
const TEXT = {
  damage: "#ffcf5c", // OR — all damage (dealt to enemies or taken by the player)
  hp: "#7ec8ff", // light blue — HP restored (provisional, awaiting exact code)
  sp: "#6fe3c0", // mint — SP gained
  mp: "#b3a8ff", // light blue/mauve — MP gained
  miss: "#ff6a1a", // LoD orange — MISS / whiff
  dragoon: "#ffe08a", // amber — Dragoon! / Special!
  perfect: "#ffffff", // white — perfect timing
  status: "#d8b0ff", // violet — FEAR / STUN / DEATH
  buff: "#9ad0ff", // light blue — defensive buff (Rose Storm)
  exp: "#bfe8ff", // pale cyan — EXP gained
};

/** One-line effect tag for a spell row. */
function spellDetail(s: DragoonSpell): string {
  if (s.multiplier !== undefined) {
    const extra = s.drainHeal ? " · drain" : s.allyHealFull ? " · heal" : s.status ? ` · ${s.status}` : "";
    return `${s.element} · ${s.multiplier}%${extra}`;
  }
  if (s.buff === "damageHalve") return "Guard ½ dmg";
  const parts: string[] = [];
  if (s.heal) parts.push(`Heal ${Math.round(s.heal * 100)}%`);
  if (s.revive) parts.push("Revive");
  if (s.cure) parts.push("Cure");
  if (s.status) parts.push(s.status);
  return parts.join(" · ") || "—";
}

/** The most-hurt ally (lowest HP fraction); a downed ally (0 HP) sorts first. */
function lowestHp(allies: Player[]): Player | undefined {
  return allies.slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
}

/**
 * Training arena: a Diablo-style real-time hack-and-slash sandbox with
 * LoD-faithful attacks. Desktop uses click-to-move (click an enemy to approach
 * and strike it); mobile uses the joystick. Enemies are spawned from a pausing
 * spawn menu (opened below the gear). Attacks chain the equipped Addition as a
 * timed combo (see {@link AdditionRunner}); per-hit damage comes from the LoD
 * formula.
 */
export class TrainingMode extends GameMode {
  readonly name = "Training";

  private camera!: IsoCamera;
  private atmosphere?: Atmosphere;
  private hud!: PartyPanel;
  /**
   * GLB decor layout — Quaternius Fantasy Props dressing the medieval colosseum, placed ringside
   * (radius ~11-13) so it frames the arena without blocking the fight. Props sit at y:0 (models
   * are base-pivoted); scale 1 ≈ real size vs our ~1.8-unit characters. Tune from screenshots.
   */
  private decor: PropPlacement[] = [
    // Ringside supply cluster (back-left).
    { model: "fp_crate", position: [-11.5, 0, 4] },
    { model: "fp_crate_metal", position: [-12.3, 0, 5], rotationY: 0.6 },
    { model: "fp_barrel", position: [-10.8, 0, 4.8] },
    { model: "fp_barrel", position: [-11.7, 0, 5.9] },
    // Weapon racks (right side).
    { model: "fp_weaponstand", position: [11.8, 0, 2.5], rotationY: -2.2 },
    { model: "fp_weaponstand", position: [12.2, 0, 4], rotationY: -2.4 },
    // Caged beast + chains near the back.
    { model: "fp_cage", position: [-3, 0, 12] },
    { model: "fp_chain", position: [-4.2, 0, 11.3] },
    // A decorative vase.
    { model: "fp_vase", position: [5.5, 0, 12] },
  ];
  private sight!: TimingSight;
  private debugBtn!: Button;
  private debugMenu!: TrainingMenu;
  private attackBtn?: ActionButton;
  private guardBtn?: ActionButton;
  private transformBtn?: ActionButton;
  private itemBtn?: ActionButton;
  private magicBtn?: ActionButton;
  private switchBtn?: ActionButton;
  private specialBtn?: ActionButton;
  private spellMenu!: SpellMenu;
  private itemMenu!: ItemMenu;
  /** Party members whose ATB gauge was full last frame, for "start of turn" SP (Spirit Ring). */
  private turnReady = new WeakSet<PartyMember>();

  /** Active Dragoon Space element (Special command) — its Field modifier boosts matching
   *  elements / weakens the opposite, and tints the arena. Cleared when the initiator reverts. */
  private dragoonSpace?: Element;
  private spaceInitiator?: PartyMember;
  private spaceOverlay!: HTMLDivElement;

  /** Last form/element the attack & transform icons were set for (avoids per-frame swaps). */
  private attackDragoon = false;
  private transformElement?: Element;
  /** Whether the in-progress combo is a Dragoon D'Attack (snapshot at start, so a mid-combo
   *  auto-revert doesn't switch the damage formula). */
  private comboIsDragoon = false;
  /** Post-action breather (combat seconds) — blocks the next action start while counting down. */
  private actionRecoveryT = 0;

  /** Shared consumable pool (Training sandbox). */
  private items = startingItems();

  /** The party (up to 3): one member is player-controlled, the rest run their Brain. */
  private party: PartyMember[] = [];
  /** Index into {@link party} of the player-controlled member. */
  private controlledIndex = 0;
  /** The bearers assigned to each party slot (the roster the menu edits). */
  private partyBearers: Bearer[] = [];
  /** The slot the Character menu is currently editing. */
  private activeSlot = 0;
  /** Shared training level applied to the whole party. */
  private partyLevel = 1;
  /** Gambit rule ids per slot (3 rule slots each) — the AI rule lists the menu edits. */
  private gambitIds: string[][] = [];
  /** Per-character gear/Addition config for the whole roster (persists across rebuilds). */
  private roster = new RosterStore();

  private enemies: Enemy[] = [];
  private arrows: Arrow[] = [];
  /** Ranged fire cooldown (real seconds) so bow bearers don't spray arrows. */
  private rangedCooldownT = 0;
  private runner = new AdditionRunner();
  private comboTarget?: Enemy;

  /** True while the debug menu is open — pauses gameplay like the Options menu. */
  private paused = false;

  // Click-to-move intent (desktop).
  private moveTarget?: Vector3;
  private attackTarget?: Enemy;
  private pendingAttack = false;

  private canvas?: HTMLCanvasElement;

  /** The player-controlled party member. */
  private get controlled(): PartyMember {
    return this.party[this.controlledIndex];
  }

  /** The controlled member's avatar — the "player" for movement, camera, HUD and stats. */
  private get player(): Player {
    return this.controlled.avatar;
  }

  enter(): void {
    createArena(this.scene);
    // The sand floor catches the characters' cast shadows.
    const floor = this.scene.getMeshByName("arenaFloor");
    if (floor) floor.receiveShadows = true;

    this.partyBearers = this.defaultParty();
    this.gambitIds = this.partyBearers.map(() => [...DEFAULT_GAMBIT_IDS]);
    this.buildParty();
    this.camera = new IsoCamera(this.scene, this.player.position.clone());
    // Dark-fantasy rendering pass (lights + tone map + bloom + glow + fog + shadows + dust),
    // driven by a lighting preset — pure rendering, no assets. Swap the preset (or
    // transitionTo) per zone once the game has bright/dark areas. Register the party as casters.
    this.atmosphere = new Atmosphere(this.scene, this.camera.camera, LIGHTING_PRESETS.trainingArena);
    this.refreshShadowCasters();
    void this.loadDecor(); // GLB props (no-op until src/assets/models/ + the decor list are filled)
    void this.warmUpModels(); // preload the enemy GLB pipeline so the first spawn swaps instantly

    // Party HUD: one ATB row per member (EXP/Gold/Addition live in the System menu).
    // Tapping a row takes control of that member.
    this.hud = new PartyPanel((i) => this.controlMember(i));
    this.sight = new TimingSight();

    // Training debug menu (Training only): set level, spawn enemies, DPS balance.
    // (Party composition + gambits live in the normal System menu.) Opened from a
    // button just below the gear (⚙); pauses gameplay.
    this.debugMenu = new TrainingMenu({
      state: () => ({
        level: this.partyLevel,
        maxLevel: this.player.maxLevel,
        dragoonLevel: this.player.dragoonLevel,
        maxDragoonLevel: MAX_DRAGOON_LEVEL,
        refDf: BALANCE_REF_DF,
        balance: this.balanceRows(),
      }),
      onSetLevel: (lv) => this.setLevel(lv),
      onSetDragoonLevel: (dlv) => this.setDragoonLevel(dlv),
      onSpawnDummy: () => this.spawnDummy(),
      onSpawnKnight: () => this.spawnKnight(),
      onSpawnCommander: () => this.spawnCommander(),
      onResume: () => this.closeDebugMenu(),
    });
    this.debugBtn = new Button({
      label: "🛠",
      onClick: () => this.openDebugMenu(),
      style: {
        top: "calc(env(safe-area-inset-top, 0px) + 58px)",
        right: "calc(env(safe-area-inset-right, 0px) + 10px)",
        font: "600 18px/1 system-ui, sans-serif",
        padding: "10px 14px",
      },
    });
    // On-screen action cluster: a big ⚔ attack button bottom-right, with the secondary
    // actions in an arc above it that SWAP with the form (human: Guard/Item/Transform ·
    // Dragoon: Magic). Shown on every platform (clickable); desktop also has key shortcuts
    // (Space attack, G/R/F/T, X special, Tab switch). The floating joystick stays touch-only.
    // Dragoon-Magic spell picker (paused overlay): pick → cast, backdrop/Cancel → resume.
    this.spellMenu = new SpellMenu(
      (id) => this.onSpellPicked(id),
      () => this.closeSpellMenu(),
    );
    this.itemMenu = new ItemMenu(
      (id) => this.onItemPicked(id),
      () => this.closeItemMenu(),
    );
    this.attackBtn = new ActionButton(
      "⚔",
      () => this.input.pressVirtual("Space"),
      undefined,
      ATTACK_ICON_FRAMES,
    );
    // Slot 0 (above attack): Guard ⇄ Magic. Slot 1 (diagonal): Item ⇄ Return.
    this.guardBtn = this.actionArcButton("🛡", "Guard", 0, "rgba(40,90,150,0.85)", "rgba(150,190,255,0.55)", "#e6f0ff", GUARD_ICON_FRAMES);
    // Magic uses the green wand; rest pose = the upright glowing wand (frame 1).
    this.magicBtn = this.actionArcButton("🔮", "Magic", 0, "rgba(95,55,140,0.85)", "rgba(200,170,255,0.55)", "#f0e6ff", MAGIC_ICON_FRAMES, 1);
    this.itemBtn = this.actionArcButton("🧪", "Item", 1, "rgba(40,110,70,0.85)", "rgba(150,230,180,0.55)", "#e6fff0", ITEM_ICON_FRAMES);
    // Slot 2 (left of attack): Transform (human only, appears at full SP) — a Dragoon eye
    // that opens; its frames + colour are set per controlled archetype in refreshHud.
    this.transformBtn = this.actionArcButton("✨", "Transform", 2, "rgba(150,120,40,0.85)", "rgba(255,225,140,0.55)", "#fff4d8", EYE_FRAMES.Fire);
    // Switch controlled member — occasional, kept out of the combat cluster (top-right).
    this.switchBtn = new ActionButton("⇄", () => this.input.pressVirtual("Switch"), {
      top: "calc(env(safe-area-inset-top, 0px) + 104px)",
      right: "calc(env(safe-area-inset-right, 0px) + 10px)",
      bottom: "auto",
      width: "48px",
      height: "48px",
      font: "600 20px/1 system-ui, sans-serif",
      backgroundColor: "rgba(70,60,120,0.85)",
      border: "1px solid rgba(180,170,255,0.6)",
      color: "#ece6ff",
    });
    // Special (all-party transform): appears only when every member's SP is full and none are
    // transformed. Distinct gold button, top-right under the switch button.
    this.specialBtn = new ActionButton(
      "★",
      () => this.input.pressVirtual("Special"),
      {
        top: "calc(env(safe-area-inset-top, 0px) + 160px)",
        right: "calc(env(safe-area-inset-right, 0px) + 10px)",
        bottom: "auto",
        width: "48px",
        height: "48px",
        font: "700 22px/1 system-ui, sans-serif",
        backgroundColor: "rgba(60,60,72,0.9)",
        border: "1px solid rgba(220,220,230,0.6)",
        color: "#fff6d8",
      },
      SPECIAL_ICON_FRAMES,
    );
    this.specialBtn.setVisible(false);

    // Desktop only: a discreet keyboard-shortcut pill on each action button.
    this.attackBtn.setShortcut("Space");
    this.guardBtn.setShortcut("G");
    this.magicBtn.setShortcut("F");
    this.itemBtn.setShortcut("R");
    this.transformBtn.setShortcut("T");
    this.switchBtn.setShortcut("Tab");
    this.specialBtn.setShortcut("X");

    // Dragoon Space arena tint (Special) — a soft full-screen element-coloured overlay.
    this.spaceOverlay = document.createElement("div");
    Object.assign(this.spaceOverlay.style, {
      position: "fixed",
      inset: "0",
      display: "none",
      pointerEvents: "none",
      mixBlendMode: "screen",
      zIndex: "5",
    } satisfies Partial<CSSStyleDeclaration>);
    document.body.appendChild(this.spaceOverlay);

    this.canvas = this.scene.getEngine().getRenderingCanvas() ?? undefined;
    this.canvas?.addEventListener("pointerdown", this.onPointerDown);
    this.canvas?.addEventListener("pointermove", this.onPointerMove);
    this.canvas?.addEventListener("pointerleave", this.onPointerLeave);
    window.addEventListener("keydown", this.onKeyDown);

    this.spawnDummy();
  }

  /** Build one secondary-action button in the right-hand arc above the attack button. */
  private actionArcButton(
    icon: string,
    code: string,
    slot: number,
    background: string,
    borderColor: string,
    color: string,
    iconFrames?: string[],
    restFrame = 0,
  ): ActionButton {
    const slots = [
      { right: 34, bottom: 142 }, // above the attack button
      { right: 118, bottom: 118 }, // up-left diagonal
      { right: 152, bottom: 44 }, // left of the attack button
    ];
    const s = slots[slot] ?? slots[0];
    return new ActionButton(
      icon,
      () => this.input.pressVirtual(code),
      {
        left: "auto",
        right: `calc(env(safe-area-inset-right, 0px) + ${s.right}px)`,
        bottom: `calc(env(safe-area-inset-bottom, 0px) + ${s.bottom}px)`,
        width: "62px",
        height: "62px",
        font: "600 24px/1 system-ui, sans-serif",
        backgroundColor: background,
        border: `1px solid ${borderColor}`,
        color,
      },
      iconFrames,
      restFrame,
    );
  }

  /** Default party: the starting bearer plus two distinct implemented front-liners. */
  private defaultParty(): Bearer[] {
    const roster = selectableBearers();
    const prefs = ["lavitz", "albert", "rose", "shana"];
    // Meru leads the default party (she has a rigged 3D model); fall back to Dart if unavailable.
    const lead = roster.find((x) => x.id === "meru") ?? DEFAULT_BEARER;
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

  /** A small formation offset for party slot `i` around a base point. */
  private formationOffset(i: number): Vector3 {
    const offs = [new Vector3(0, 0, 0), new Vector3(-2.5, 0, -1.5), new Vector3(2.5, 0, -1.5)];
    return offs[i] ?? new Vector3(0, 0, 0);
  }

  /**
   * Build (or rebuild) the party from {@link partyBearers}: dispose any existing members,
   * spawn each in formation at {@link partyLevel}, mark the controlled one, and bind the
   * AdditionRunner to that member's ATB gauge. Resets transient combat state.
   */
  private buildParty(): void {
    const base = this.party.length ? this.player.position.clone() : new Vector3(0, 0, 0);
    for (const m of this.party) m.dispose();
    this.controlledIndex = Math.min(this.controlledIndex, this.partyBearers.length - 1);
    this.party = this.partyBearers.map((b, i) => {
      const brain = new GambitBrain(resolveGambit(this.gambitIds[i] ?? DEFAULT_GAMBIT_IDS));
      const m = new PartyMember(this.scene, b, base.add(this.formationOffset(i)), brain, this.partyLevel);
      m.avatar.unlockDragoon(); // Training: everyone has their Dragoon Spirit (SP/MP/transform)
      m.avatar.sp = m.avatar.maxSp; // Training: start with a full SP gauge (transform right away)
      this.applyConfig(m.avatar, b); // restore this character's stored gear / Addition
      m.setControlled(i === this.controlledIndex);
      return m;
    });
    this.runner.cancel();
    this.comboTarget = undefined;
    this.clearNav();
    this.runner.attach(this.controlled.gauge);
    this.runner.setFillTime(this.player.atbFillTime);
    this.refreshShadowCasters();
  }

  /**
   * Warm the GLB pipeline up front: the first enemy spawn otherwise shows the placeholder
   * capsule for a beat while the glTF loader module, the meshopt decoder and the model file all
   * download. Preload the knight once and discard it — the loader/decoder stay resident and the
   * file is HTTP-cached, so real spawns swap in immediately.
   */
  private async warmUpModels(): Promise<void> {
    const res = await importModel(this.scene, "knight_sandora").catch(() => undefined);
    if (!res) return;
    for (const g of res.animationGroups) g.dispose();
    for (const s of res.skeletons) s.dispose();
    for (const m of res.meshes) m.dispose();
    for (const t of res.transformNodes) t.dispose();
  }

  /** Load the optional GLB decor layout and register it as static shadow casters. No-op while
   *  the decor list is empty (the default) — the procedural arena stands alone. */
  private async loadDecor(): Promise<void> {
    if (!this.decor.length) return;
    const meshes = await loadEnvironment(this.scene, this.decor);
    this.atmosphere?.addStaticCasters(meshes);
  }

  /** Re-register every live entity as a shadow caster (party + enemies). Cheap; call after
   *  any spawn/despawn or party rebuild. No-op until the atmosphere exists. */
  private refreshShadowCasters(): void {
    if (!this.atmosphere) return;
    const roots = [...this.party.map((m) => m.avatar.root), ...this.enemies.map((e) => e.root)];
    this.atmosphere.setCasters(roots);
  }

  /** Cycle player control to the next party member (Tab / the ⇄ button). */
  private cycleControl(): void {
    if (this.party.length < 2) return;
    this.controlMember((this.controlledIndex + 1) % this.party.length);
  }

  /** Take control of a specific party member (e.g. tapping its HUD row). */
  private controlMember(index: number): void {
    if (index === this.controlledIndex || index < 0 || index >= this.party.length) return;
    this.runner.cancel();
    this.comboTarget = undefined;
    this.clearNav();
    this.controlled.setControlled(false);
    this.controlledIndex = index;
    this.controlled.setControlled(true);
    this.runner.attach(this.controlled.gauge);
    this.runner.setFillTime(this.player.atbFillTime);
  }

  private openDebugMenu(): void {
    this.paused = true;
    this.debugBtn.setVisible(false);
    this.debugMenu.show();
  }

  private closeDebugMenu(): void {
    this.debugMenu.hide();
    this.debugBtn.setVisible(true);
    this.paused = false;
  }

  /** GameMode: is one of this mode's overlays open? (mutually exclusive with the System menu) */
  hasOpenMenu(): boolean {
    return this.debugMenu.isOpen || this.itemMenu.isOpen || this.spellMenu.isOpen;
  }

  /** GameMode: Escape closes the open overlay (debug/item/spell) instead of opening System. */
  closeTopMenu(): boolean {
    if (this.debugMenu.isOpen) {
      this.closeDebugMenu();
      return true;
    }
    if (this.itemMenu.isOpen) {
      this.closeItemMenu();
      return true;
    }
    if (this.spellMenu.isOpen) {
      this.closeSpellMenu();
      return true;
    }
    return false;
  }

  /**
   * Assign a bearer to the active party slot, then rebuild the party. Duplicates are
   * avoided by swapping: if the bearer already holds another slot, that slot inherits the
   * one being replaced. Driven by the System menu's Party tab (which re-renders itself).
   */
  private assignToSlot(b: Bearer): void {
    const slot = this.activeSlot;
    const existing = this.partyBearers.findIndex((x) => x.id === b.id);
    if (existing === slot) return; // no change
    if (existing >= 0) this.partyBearers[existing] = this.partyBearers[slot]; // swap to dedupe
    this.partyBearers[slot] = b;
    this.buildParty();
  }

  /**
   * Cycle one gambit rule slot to the next catalog entry, then re-arm that member's
   * brain live (no rebuild needed). Edited from the System menu's Gambits tab.
   */
  private cycleGambit(member: number, idx: number): void {
    const rules = this.gambitIds[member];
    if (!rules || idx < 0 || idx >= rules.length) return;
    rules[idx] = nextGambitId(rules[idx]);
    const m = this.party[member];
    if (m) m.brain = new GambitBrain(resolveGambit(rules));
  }

  /** Jump the whole party to a level (debug). Keeps the menu open. */
  private setLevel(level: number): void {
    this.partyLevel = level;
    for (const m of this.party) m.avatar.setLevel(level);
    this.refreshHud();
  }

  /** Set the whole party's Dragoon Level (debug) — drives the SP gained per basic attack. */
  private setDragoonLevel(dlv: number): void {
    for (const m of this.party) m.avatar.setDragoonLevel(dlv);
    this.refreshHud();
  }

  /** Stop Tab from moving DOM focus — it's the control-switch key in Training. */
  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.code === "Tab") e.preventDefault();
  };

  update(dt: number): void {
    // Spawn menu open: gameplay is paused (the HUD keeps its last state).
    // Game's render loop still calls input.endFrame() after this returns.
    if (this.paused) return;

    // Movement (unaffected by combat speed): joystick on touch, click-to-move
    // otherwise. Attacking roots the player: you can't move while a melee Addition is
    // running or while a ranged shot is in progress/cooling down (no move-spam/kiting),
    // and guarding roots in place too. The post-whiff lockout doesn't root (you may
    // reposition while you can't attack).
    const rooted = this.player.guardActive || this.runner.active || this.rangedCooldownT > 0;
    const before = this.player.position.clone();
    if (!rooted) {
      const axis = this.input.axis();
      if (axis.x !== 0 || axis.y !== 0) {
        const dir = this.camera.groundForward.scale(axis.y).add(this.camera.groundRight.scale(axis.x));
        this.player.move(dir, dt);
        this.clearNav();
      } else {
        this.navigate(dt);
      }
      clampToArena(this.player.position); // the wall is a hard boundary
    }
    this.camera.follow(this.player.position);
    // Procedural walk/idle animation (visual only, uses real time).
    this.player.animate(dt, Vector3.DistanceSquared(before, this.player.position) > 1e-6);

    // Arrows fly in real time; each removes itself (and lands its damage) on arrival.
    if (this.arrows.length) this.arrows = this.arrows.filter((a) => a.update(dt));
    if (this.rangedCooldownT > 0) this.rangedCooldownT = Math.max(0, this.rangedCooldownT - dt);

    // Attack is the ⚔ button / click / Space (the timed combo). The other ATB actions
    // are the left-column buttons (or G/R/T/F keys); each is gated by the ATB gauge.
    if (this.input.wasPressed("Space") && !this.player.guardActive) this.attack(this.attackTarget);
    if (this.guardPressed()) this.playerAct("guard");
    if (this.input.wasPressed("Item") || this.input.wasPressed("KeyR")) this.playerAct("item");
    if (this.input.wasPressed("Magic") || this.input.wasPressed("KeyF")) this.playerAct("magic");
    // Transform (human form only) — canon: no manual de-transform, it ends when SP runs out.
    if (this.input.wasPressed("Transform") || this.input.wasPressed("KeyT")) this.playerAct("transform");
    if (this.input.wasPressed("Special") || this.input.wasPressed("KeyX")) this.doSpecial();
    if (this.input.wasPressed("Tab") || this.input.wasPressed("Switch")) this.cycleControl();

    // Combat time scales with the Options "combat speed" setting.
    const cdt = dt * settings.combatSpeed;
    // While the player executes a combo, the rest of the world (enemies, allies, every ATB
    // gauge) runs at COMBO_TIME_SCALE — so the combo's length costs ~no game time and long
    // Additions aren't penalised. The combo's own timing keeps running at real `cdt`.
    const worldScale = this.runner.active ? COMBO_TIME_SCALE : 1;
    const worldDt = cdt * worldScale;
    this.player.tickGuard(cdt);
    if (this.actionRecoveryT > 0) this.actionRecoveryT = Math.max(0, this.actionRecoveryT - cdt);
    // Keep the ATB gauge's fill time in sync with the bearer's Speed (gear can change it).
    this.runner.setFillTime(this.player.atbFillTime);
    if (this.runner.tick(cdt, worldDt)) {
      // The timing sight lapsed unpressed — a whiff; show it like a missed press.
      this.comboTarget = undefined;
      this.popText(this.player.position.add(new Vector3(0, 2.2, 0)), t("combat.miss"), TEXT.miss);
      this.finishAction(); // a lapsed combo closes the action too
    }
    // Slowed (or frozen, at scale 0) while the player combos.
    if (worldScale > 0) {
      this.updateEnemies(worldDt);
      // AI party members (everyone except the controlled one) run their Brain.
      for (const m of this.party) {
        if (m !== this.controlled) this.updateAiMember(m, dt * worldScale, worldDt);
      }
    }
    this.updateSight();
    this.updateDragoonSpace(); // end the Space once its initiator reverts
    this.grantTurnSp(); // Spirit Ring: +SP at the start of each member's turn

    this.refreshHud();
  }

  /** Spirit Ring & co.: grant per-turn SP when a member's ATB gauge becomes ready (edge). */
  private grantTurnSp(): void {
    for (const m of this.party) {
      const ready = m.gauge.isReady;
      if (ready && !this.turnReady.has(m)) {
        this.turnReady.add(m);
        const sp = m.avatar.spPerTurn;
        if (sp > 0) {
          m.avatar.gainSp(sp);
          this.popText(m.position.add(new Vector3(0, 2.4, 0)), `+${sp} ${t("stat.sp")}`, TEXT.sp);
        }
      } else if (!ready) {
        this.turnReady.delete(m);
      }
    }
  }

  private guardPressed(): boolean {
    return (
      this.input.wasPressed("Guard") ||
      this.input.wasPressed("KeyG") ||
      this.input.wasPressed("ShiftLeft") ||
      this.input.wasPressed("ShiftRight")
    );
  }

  // --- Player ATB actions (FF12-style: any one action spends the gauge) -----

  /**
   * Perform a non-attack ATB action for the controlled member. Requires the ATB gauge full
   * and no combo in progress; on success it spends the gauge and counts a Dragoon turn —
   * EXCEPT transform, which keeps the turn so the player can act in Dragoon form right away.
   * Attack is handled separately (the timed combo).
   */
  private playerAct(id: ActionId): void {
    if (this.runner.active || !this.runner.gauge.isReady || this.actionRecoveryT > 0) return;
    const m = this.controlled;
    let ok = false;
    switch (id) {
      case "guard":
        ok = this.doGuard(m);
        break;
      case "transform":
        ok = this.doTransform(m);
        break;
      case "item":
        ok = this.doItem(m);
        break;
      case "magic":
        ok = this.doMagic(m);
        break;
      case "attack":
        break; // attack uses the timed-combo path
    }
    // Transforming keeps the ATB turn (a free stance change): the gauge stays full so you can
    // immediately act in Dragoon form. Every other action spends the gauge and counts a turn.
    if (ok && id !== "transform") {
      this.runner.gauge.spend();
      m.avatar.tickDragoon();
      this.finishAction();
    }
  }

  /** Close out the controlled member's action: arm the post-action breather, and — if the
   *  Dragoon form just spent its last turn — revert now (at the action's END, so the boosted
   *  stats covered the whole action). Death (HP 0) reverts separately and immediately. */
  private finishAction(): void {
    this.actionRecoveryT = ACTION_RECOVERY;
    if (this.player.dragoonSpent) this.player.revert();
  }

  private doGuard(m: PartyMember): boolean {
    if (m.avatar.guardActive) return false;
    const heal = m.avatar.startGuard();
    this.popText(m.position.add(new Vector3(0, 2.2, 0)), `+${heal}`, TEXT.hp);
    return true;
  }

  private doTransform(m: PartyMember): boolean {
    if (!m.avatar.canTransform) return false;
    m.avatar.transform();
    this.popText(m.position.add(new Vector3(0, 2.6, 0)), t("combat.dragoon"), TEXT.dragoon);
    return true;
  }

  /** Item opens the picker (combat pauses); the chosen item spends the turn, not the open. */
  private doItem(_m: PartyMember): boolean {
    this.openItemMenu();
    return false;
  }

  private openItemMenu(): void {
    const entries: ItemEntry[] = this.items.map((s) => ({
      id: s.def.id,
      name: t(s.def.nameKey),
      count: s.count,
      enabled: s.count > 0, // any item in stock is usable, even if it would waste its effect
      detail: s.def.spRestore
        ? `+${s.def.spRestore} ${t("stat.sp")}`
        : `${t("stat.hp")} +${Math.round(s.def.healFraction * 100)}%`,
      color: s.def.spRestore ? TEXT.sp : TEXT.hp,
    }));
    this.paused = true;
    this.itemMenu.show(entries);
  }

  private closeItemMenu(): void {
    this.itemMenu.close();
    this.paused = false;
  }

  private onItemPicked(id: string): void {
    this.paused = false;
    const stock = this.items.find((s) => s.def.id === id);
    if (!stock || stock.count <= 0 || !this.runner.gauge.isReady) return;
    this.useItem(this.controlled, stock);
    this.runner.gauge.spend(); // using an item is the member's ATB action
    this.finishAction();
    this.refreshHud();
  }

  /** Apply a consumable to a member (heal + SP restore) and decrement the shared stock. */
  private useItem(m: PartyMember, stock: { def: ItemDef; count: number }): void {
    const a = m.avatar;
    if (stock.def.healFraction > 0) {
      const healed = a.heal(Math.floor(a.maxHp * stock.def.healFraction));
      if (healed > 0) this.popText(m.position.add(new Vector3(0, 2.2, 0)), `+${healed}`, TEXT.hp);
    }
    if (stock.def.spRestore) {
      a.gainSp(stock.def.spRestore);
      this.popText(m.position.add(new Vector3(0, 2.6, 0)), `+${stock.def.spRestore} ${t("stat.sp")}`, TEXT.sp);
    }
    stock.count -= 1;
  }

  /** True when the Special command is available: every member can transform (≥1 SP block and
   *  not already in Dragoon form). Looser than canon (which needs full SP meters) by design. */
  private get canSpecial(): boolean {
    return this.party.length > 0 && this.party.every((m) => m.avatar.canTransform);
  }

  /** Special: transform the whole party at once and open the controlled member's Dragoon Space
   *  (its element's Field modifier + arena tint), which lasts until that member reverts. */
  private doSpecial(): void {
    if (!this.canSpecial || !this.runner.gauge.isReady || this.runner.active) return;
    const initiator = this.controlled;
    for (const m of this.party) m.avatar.transform();
    this.dragoonSpace = initiator.avatar.element;
    this.spaceInitiator = initiator;
    this.showSpace(this.dragoonSpace);
    this.popText(initiator.position.add(new Vector3(0, 3.0, 0)), t("combat.special"), TEXT.dragoon);
    // Like Transform, Special keeps the ATB turn — the initiator acts in Dragoon form at once.
    this.refreshHud();
  }

  /** Tint the arena for the active Dragoon Space (soft element-coloured screen overlay). */
  private showSpace(element: Element): void {
    const [r, g, b] = ELEMENT_RGB[element] ?? [0.6, 0.6, 0.7];
    const c = (v: number): number => Math.round(v * 255);
    this.spaceOverlay.style.background = `radial-gradient(circle at 50% 40%, rgba(${c(r)},${c(g)},${c(b)},0.32), rgba(${c(r * 0.5)},${c(g * 0.5)},${c(b * 0.5)},0.16))`;
    this.spaceOverlay.style.display = "block";
  }

  /** End Dragoon Space once its initiator has reverted (SP ran out). */
  private updateDragoonSpace(): void {
    if (this.dragoonSpace && (!this.spaceInitiator || !this.spaceInitiator.avatar.transformed)) {
      this.dragoonSpace = undefined;
      this.spaceInitiator = undefined;
      this.spaceOverlay.style.display = "none";
    }
  }

  /** Magic opens the spell picker (combat pauses); it does not itself spend the turn — the
   *  chosen spell does. Returns false so playerAct leaves the ATB gauge charged. */
  private doMagic(m: PartyMember): boolean {
    if (!m.avatar.canCastMagic) return false;
    this.openSpellMenu();
    return false;
  }

  private openSpellMenu(): void {
    const p = this.player;
    const entries: SpellEntry[] = p.spells.map((s) => ({
      id: s.id,
      name: s.name,
      mp: s.mp,
      enabled: s.dLevel <= p.dragoonLevel && s.mp <= p.mp,
      detail: spellDetail(s),
      color: ELEMENT_COLOR[s.element] ?? "#b9a7ff",
    }));
    this.paused = true;
    this.spellMenu.show(entries, p.mp, p.maxMp);
  }

  private closeSpellMenu(): void {
    this.spellMenu.close();
    this.paused = false;
  }

  /** A spell was chosen from the picker: resume, then cast it (spends MP + one Dragoon turn). */
  private onSpellPicked(id: string): void {
    this.paused = false;
    const p = this.player;
    const spell = p.spells.find((s) => s.id === id);
    if (!spell || !this.runner.gauge.isReady || spell.mp > p.mp) return;
    const primary =
      this.attackTarget && this.attackTarget.alive ? this.attackTarget : this.nearestEnemy(ACQUIRE_RANGE);
    if (primary) this.player.face(primary.position.subtract(this.player.position));
    this.castSpell(p, spell, primary, this.party.map((m) => m.avatar));
    this.runner.gauge.spend(); // a cast costs the ATB action…
    p.tickDragoon(); // …and one Dragoon turn
    this.finishAction(); // cast resolves at once → breather + revert if it was the last turn
    this.refreshHud();
  }

  /**
   * Resolve a Dragoon spell: magic damage to enemy target(s), status ailments, recovery /
   * buffs to ally target(s). Shared by the player and AI casts.
   */
  private castSpell(caster: Player, spell: DragoonSpell, primaryEnemy: Enemy | undefined, allies: Player[]): void {
    caster.mp = Math.max(0, caster.mp - spell.mp);
    caster.strike();
    this.popText(caster.position.add(new Vector3(0, 2.6, 0)), spell.name, ELEMENT_COLOR[spell.element] ?? "#c8a6ff");

    // Foe target set (used for damage, status and instant-death alike).
    const foes =
      spell.target === "allEnemies"
        ? this.enemies.filter((e) => e.alive)
        : spell.target === "enemy" && primaryEnemy && primaryEnemy.alive
          ? [primaryEnemy]
          : [];

    // --- Damage to enemies (Feared foes take ×2; Dragoon Space scales by element) ---
    let totalDamage = 0;
    if (spell.multiplier !== undefined) {
      // "Dragon"-named spells ignore the Dragoon-Space Field modifier (canon).
      const field = spell.name.includes("Dragon") ? 1 : fieldMultiplier(this.dragoonSpace, spell.element);
      for (const foe of foes) {
        const elem = elementMultiplier(spell.element, foe.def.element);
        const dmg = Math.max(
          1,
          magicAttack(caster.baseMat, foe.def.stats.mdf, caster.dragoonMatPct, spell.multiplier, caster.level, {
            element: elem,
            targetFear: foe.feared ? 2 : 1,
            field,
          }),
        );
        totalDamage += dmg;
        this.landDamage(foe, dmg);
      }
    }

    // --- Status ailments on the (still-living) foes ---
    if (spell.status) {
      for (const foe of foes) {
        if (!foe.alive) continue;
        if (spell.status === "fear") foe.inflictFear(FEAR_SECONDS);
        else if (spell.status === "stun") foe.inflictStun(STUN_SECONDS);
        else if (spell.status === "death" && foe.kill()) this.rewardKill(foe);
        this.popText(foe.headPosition, spell.status.toUpperCase(), TEXT.status);
      }
    }

    // --- Recovery to allies ---
    const healTargets: Player[] =
      spell.target === "allAllies" || spell.allyHealFull
        ? allies
        : spell.target === "ally"
          ? [lowestHp(allies)].filter((a): a is Player => !!a)
          : spell.drainHeal
            ? allies.filter((a) => a.hp > 0)
            : [];
    for (const a of healTargets) {
      if (a.hp === 0 && spell.revive !== undefined) {
        a.hp = Math.max(1, Math.floor(a.maxHp * spell.revive));
        this.popText(a.position.add(new Vector3(0, 2.2, 0)), `+${a.hp}`, TEXT.hp);
      } else if (a.hp > 0) {
        const amount = spell.allyHealFull ? a.maxHp : spell.heal ? Math.floor(a.maxHp * spell.heal) : 0;
        if (spell.drainHeal) {
          const share = Math.floor(totalDamage / Math.max(1, healTargets.length));
          if (share > 0) this.popText(a.position.add(new Vector3(0, 2.2, 0)), `+${a.heal(share)}`, TEXT.hp);
        } else if (amount > 0) {
          this.popText(a.position.add(new Vector3(0, 2.2, 0)), `+${a.heal(amount)}`, TEXT.hp);
        }
      }
      // cure has no effect yet — allies can't be afflicted in the sandbox.
    }

    // --- Rose / Blossom Storm: halve incoming damage for the ally target(s) ---
    if (spell.buff === "damageHalve") {
      for (const a of healTargets) {
        a.applyDamageHalve(DAMAGE_HALVE_SECONDS);
        this.popText(a.position.add(new Vector3(0, 3.0, 0)), "½ DMG", TEXT.buff);
      }
    }
  }

  /** Consume the first available healing item on `m`. Returns false if none/full. */
  private useHealItem(m: PartyMember): boolean {
    const stock = this.items.find((s) => s.count > 0 && s.def.healFraction > 0);
    if (!stock) return false;
    const healed = m.avatar.heal(Math.floor(m.avatar.maxHp * stock.def.healFraction));
    stock.count -= 1;
    this.popText(m.position.add(new Vector3(0, 2.2, 0)), `+${healed}`, TEXT.hp);
    return true;
  }


  private updateSight(): void {
    if (this.runner.active && this.comboTarget) {
      const head = this.comboTarget.position.add(new Vector3(0, 1.6, 0));
      this.sight.update(this.scene, head, this.runner.sightProgress, this.runner.inWindow);
    } else {
      this.sight.hide();
    }
  }

  // --- Navigation (desktop click-to-move) ----------------------------------

  private onPointerDown = (e: PointerEvent): void => {
    // Branch on the ACTUAL pointer (not device capability): touch taps = attack and use the
    // joystick to move; mouse/pen = Diablo-style click-to-move / click-to-attack. This keeps
    // click-to-move working on touch-capable laptops (maxTouchPoints > 0) driven by a mouse.
    if (e.pointerType === "touch") {
      this.input.pressVirtual("Space"); // tap = attack / timing press
      return;
    }
    // While an Addition is running, any click is the timing-sight press.
    if (this.runner.active) {
      this.input.pressVirtual("Space");
      return;
    }
    const picked = this.scene.pick(e.offsetX, e.offsetY)?.pickedMesh?.metadata;
    if (picked instanceof Enemy && this.enemies.includes(picked)) {
      this.attackTarget = picked;
      this.moveTarget = undefined;
      this.pendingAttack = true;
      this.popText(picked.headPosition, "⚔ CLICK", "#ff9090"); // DEBUG
      return;
    }
    const ground = this.groundPoint(e);
    if (ground) {
      this.moveTarget = ground;
      this.attackTarget = undefined;
      this.pendingAttack = false;
      this.popText(ground.add(new Vector3(0, 0.4, 0)), "◎ MOVE", "#7fd0ff"); // DEBUG
    } else {
      // DEBUG: handler fired but no ground point (pick/ray failed) — mark over the player.
      this.popText(this.player.position.add(new Vector3(0, 3, 0)), "✖ NO GROUND", "#ffd070");
    }
  };

  /** Desktop hover: show the attack (sword) cursor over a living, attackable enemy; otherwise
   *  the normal cursor. Only enemies are pickable, so this is a cheap per-move pick. */
  private onPointerMove = (e: PointerEvent): void => {
    if (!this.canvas || e.pointerType === "touch") return;
    const picked = this.scene.pick(e.offsetX, e.offsetY)?.pickedMesh?.metadata;
    const overEnemy = picked instanceof Enemy && picked.alive && this.enemies.includes(picked);
    // Sword hotspot near the blade tip; match the form's blade colour (blue human / red Dragoon).
    const frame = this.player.transformed ? ATTACK_DRAGOON_FRAMES[0] : ATTACK_ICON_FRAMES[0];
    this.canvas.style.cursor = overEnemy ? `url(${frame}) 8 4, crosshair` : "";
  };

  private onPointerLeave = (): void => {
    if (this.canvas) this.canvas.style.cursor = "";
  };

  /** Walk toward the move target or attack target; strike when in reach. */
  private navigate(dt: number): void {
    if (this.attackTarget && !this.attackTarget.alive) this.clearNav();

    if (this.attackTarget) {
      const to = this.attackTarget.position.subtract(this.player.position);
      to.y = 0;
      if (to.length() > this.reach) {
        this.player.move(to, dt);
      } else {
        this.player.face(to);
        // Multi-hit Additions advance via clicks / timing presses. A basic
        // attacker (Shana/Miranda — no Additions) has nothing to chain, so
        // auto-repeat the strike while the target stays in reach; the runner's
        // recovery lockout paces it. Otherwise one click = one idle hit.
        if (this.pendingAttack || this.isBasicAttacker()) {
          this.pendingAttack = false;
          this.attack(this.attackTarget);
        }
      }
      return;
    }

    if (this.moveTarget) {
      const to = this.moveTarget.subtract(this.player.position);
      to.y = 0;
      if (to.length() > 0.15) this.player.move(to, dt);
      else this.moveTarget = undefined;
    }
  }

  private clearNav(): void {
    this.moveTarget = undefined;
    this.attackTarget = undefined;
    this.pendingAttack = false;
  }

  /** Intersect the cursor ray with the y=0 ground plane. */
  private groundPoint(e: PointerEvent): Vector3 | undefined {
    const ray = this.scene.createPickingRay(e.offsetX, e.offsetY, null, this.camera.camera);
    if (Math.abs(ray.direction.y) < 1e-6) return undefined;
    const t = -ray.origin.y / ray.direction.y;
    if (t < 0) return undefined;
    const p = ray.origin.add(ray.direction.scale(t));
    p.y = 0;
    clampToArena(p); // clicks beyond the wall walk to the arena edge
    return p;
  }

  // --- Combat ---------------------------------------------------------------

  /**
   * Attack input. Begins the equipped Addition on a target in reach (auto hit 1)
   * or, while one is running, resolves the current timing-sight press.
   */
  private attack(preferred?: Enemy): void {
    if (this.runner.active) {
      this.resolveTimingPress();
      return;
    }

    const target =
      preferred && preferred.alive && this.inReach(preferred) ? preferred : this.nearestInReach();
    if (!target) {
      // Nobody in reach: lock onto the nearest visible enemy and walk over to attack
      // it (navigate() handles the approach and lands the first hit in range).
      const acquire =
        preferred && preferred.alive && this.withinAcquire(preferred)
          ? preferred
          : this.nearestEnemy(ACQUIRE_RANGE);
      if (acquire) {
        this.attackTarget = acquire;
        this.moveTarget = undefined;
        this.pendingAttack = true;
      }
      return;
    }

    // In reach: ranged bearers fire on a fixed cadence — one arrow per draw, no spraying.
    if (this.isRanged() && this.rangedCooldownT > 0) return;
    if (this.actionRecoveryT > 0) return; // post-action breather

    // In Dragoon form the Attack command is the D'Attack (its own combo + damage formula).
    this.comboIsDragoon = this.player.transformed;
    const def = this.comboIsDragoon ? this.player.dragoonAttackDef : this.player.addition;
    const res = this.runner.press(def);
    if (res.kind !== "started") return; // ignored (e.g. during recovery)
    this.comboTarget = target;
    this.player.face(target.position.subtract(this.player.position));
    this.player.tickDragoon(); // one attack = one Dragoon turn
    this.applyHit(target, res.hits); // guaranteed hit 1
    // Bow users (no Additions) charge SP per attack, scaled by Dragoon Level; Addition users
    // earn SP through their timing presses. No SP while transformed (the gauge is draining).
    if (this.player.usesBasicAttack && !this.comboIsDragoon) {
      this.player.gainSp(this.player.spPerBasicAttack);
    }
    // A single-hit attack (basic / archer D'Attack) resolves at once → close it out now;
    // multi-hit combos close in resolveTimingPress when they complete or break.
    if (!this.runner.active) this.finishAction();
  }

  /** Resolve a timing-sight press against the locked combo target. */
  private resolveTimingPress(): void {
    const target = this.comboTarget;
    const dragoon = this.comboIsDragoon;
    const add = dragoon ? this.player.dragoonAttackDef : this.player.addition;
    const res = this.runner.press(add);

    if (res.kind === "miss") {
      this.comboTarget = undefined;
      this.popText(this.player.position.add(new Vector3(0, 2.2, 0)), t("combat.miss"), TEXT.miss);
      this.finishAction(); // a broken combo still closes the action (breather + Dragoon revert)
      return;
    }
    if (res.kind !== "hit" || !target || !target.alive) return;

    this.applyHit(target, res.hits);
    // Additions accrue SP per landed input (hit 1 free). A D'Attack earns no SP (the gauge
    // is draining) and is not recorded as an Addition.
    if (!dragoon) {
      const share = Math.floor((add.spMax / additionPresses(add)) * this.player.additionSpMultiplier);
      this.player.gainSp(share);
    }
    if (res.perfect) this.popText(target.position.add(new Vector3(0, 3.1, 0)), t("combat.perfect"), TEXT.perfect);
    if (res.completed) {
      if (!dragoon) this.player.recordAddition(add);
      this.comboTarget = undefined;
      this.finishAction(); // combo finished cleanly → breather + Dragoon revert if spent
    }
  }

  /**
   * Apply hit `k` of the current Addition. Per-hit damage is the LoD formula's
   * running total minus the previous hits' total, so the chain's sum equals a
   * perfect Addition. Handles the target dying.
   */
  private applyHit(target: Enemy, k: number): void {
    this.player.strike(); // play the weapon's strike/draw animation on every blow
    const df = target.def.stats.df;
    // Element modifier: the weapon's element vs the target's element (1 if non-elemental).
    const element = elementMultiplier(this.player.attackElement, target.def.element);
    // Feared targets take double damage (Target Fear ×2); Dragoon Space scales by element.
    const mods = {
      element,
      targetFear: target.feared ? 2 : 1,
      field: fieldMultiplier(this.dragoonSpace, this.player.attackElement),
    };
    const dmg = this.comboIsDragoon
      ? this.dragoonHitDamage(k, df, mods)
      : this.additionHitDamage(k, df, mods);

    // Ranged bearers loose an arrow: damage lands when it reaches the target.
    if (this.isRanged()) {
      this.rangedCooldownT = RANGED_COOLDOWN; // pace shots to the draw animation
      const from = this.player.position.add(new Vector3(0, 1.3, 0));
      const to = target.position.add(new Vector3(0, 1.2, 0));
      // Release the arrow ~0.22s in, syncing with the draw/loose animation.
      this.arrows.push(
        new Arrow(
          this.scene,
          from,
          to,
          ARROW_SPEED,
          () => {
            if (target.alive) this.landDamage(target, dmg);
          },
          0.22,
        ),
      );
      return;
    }

    this.landDamage(target, dmg);
  }

  /** Incremental damage of Addition hit `k`: running total minus the previous hits' total,
   *  so a completed combo sums to a perfect Addition. */
  private additionHitDamage(k: number, df: number, mods: { element: number; targetFear?: number; field?: number }): number {
    const add = this.player.addition;
    const atk = { at: this.player.atk, lv: this.player.level };
    const mult = additionMultiplier(add, this.player.additionLevel(add));
    const before = k > 1 ? additionAttack(atk, df, additionHitsPercent(add, k - 1), mult, mods) : 0;
    const now = additionAttack(atk, df, additionHitsPercent(add, k), mult, mods);
    return Math.max(1, now - before);
  }

  /** Incremental damage of D'Attack strike `k`, using the Output table and the line's DRGNAT%.
   *  Base AT (un-boosted) goes in — the Dragoon formula applies the % itself. */
  private dragoonHitDamage(k: number, df: number, mods: { element: number; targetFear?: number; field?: number }): number {
    const atk = { at: this.player.baseAtk, lv: this.player.level };
    const pct = this.player.dragoonAtPct;
    const archer = this.player.isArcher;
    const out = (i: number): number => DRAGOON_OUTPUT[Math.min(i, DRAGOON_OUTPUT.length) - 1];
    const now = dragoonAttack(atk, df, out(k), pct, mods, archer);
    const before = k > 1 ? dragoonAttack(atk, df, out(k - 1), pct, mods, archer) : 0;
    return Math.max(1, now - before);
  }

  /** Apply a computed hit to the target: damage, floating text, and death handling. */
  private landDamage(target: Enemy, dmg: number): void {
    target.takeDamage(dmg);
    this.atmosphere?.spark(target.headPosition); // hit-spark burst at the point of impact
    this.popText(target.headPosition, `${dmg}`, TEXT.damage);
    if (!target.alive) this.rewardKill(target);
  }

  /** Award EXP/gold for a felled enemy, end any combo locked on it, and remove it. */
  private rewardKill(target: Enemy): void {
    if (target.dying) return; // death sequence already running — don't double-award or re-trigger
    this.player.gainExp(target.def.expReward);
    this.player.gold += target.def.goldReward;
    this.popText(target.headPosition, `+${target.def.expReward} EXP`, TEXT.exp);
    // Only cancel the player's combo if it's the one that just died (an ally kill
    // must not abort the player's in-progress Addition).
    if (this.comboTarget === target) {
      this.runner.cancel();
      this.comboTarget = undefined;
    }
    if (this.attackTarget === target) this.clearNav(); // stop chasing the corpse
    target.playDeath(() => this.removeEnemy(target)); // play the death animation, then despawn
  }

  private updateEnemies(cdt: number): void {
    const knightsAlive = this.enemies.filter((e) => e.alive && e.def.id.startsWith("knight_of_sandora")).length;
    const ctx = { knightsAlive };
    for (const enemy of this.enemies) {
      enemy.tickStatus(cdt); // expire Fear/Stun + refresh their glow
      const action = enemy.aiUpdate(cdt, this.player.position, ctx);
      clampToArena(enemy.position);
      enemy.syncHud(this.scene);
      if (action) this.resolveEnemyAction(enemy, action);
    }
  }

  /** Apply an enemy's chosen action: damage the player, or self-heal. */
  private resolveEnemyAction(enemy: Enemy, action: EnemyAction): void {
    if (action.kind === "heal") {
      enemy.heal(action.amount);
      this.popText(enemy.headPosition, `+${action.amount}`, TEXT.hp);
      return;
    }

    // Guarding halves incoming damage (the LoD "Guard" modifier).
    const guard = this.player.guardActive ? 0.5 : 1;
    const magical = action.kind === "magical";
    // Element only applies to magical attacks (attack element vs Dart's element).
    const element = magical ? elementMultiplier(action.element ?? "Non-Elemental", this.player.element) : 1;
    const field = magical ? fieldMultiplier(this.dragoonSpace, action.element ?? "Non-Elemental") : 1;
    const raw = magical
      ? enemyMagicalAttack(enemy.def.stats.mat, this.player.mdef, action.multiplier, { guard, element, field })
      : enemyPhysicalAttack(enemy.def.stats.at, this.player.def, action.multiplier, { guard });
    // Damage-reduction gear (Phantom/Dragon Shield, Angel Scarf…), then Rose/Blossom Storm.
    let dmg = Math.floor(raw * this.player.incomingMultiplier(magical ? "magic" : "phys"));
    if (this.player.damageHalved) dmg = Math.floor(dmg * 0.5);

    const applyHit = (): void => {
      this.player.hp = Math.max(0, this.player.hp - dmg);
      this.popText(this.player.position.add(new Vector3(0, 2.2, 0)), `${dmg}`, TEXT.damage);
      if (this.player.hp === 0) {
        this.player.revert(); // HP 0 forces de-transformation (canon)
        this.player.hp = this.player.maxHp; // sandbox: revive instead of game-over
      }
    };

    // Thrown attacks (Throw Dagger/Knife) fly as a projectile and land on arrival; melee/magic hit now.
    if (action.kind === "physical" && action.ranged) {
      const fwd = this.player.position.subtract(enemy.position);
      fwd.y = 0;
      if (fwd.lengthSquared() > 1e-4) fwd.normalize();
      const from = enemy.handPosition.add(fwd.scale(0.45)); // hand extended forward at the release
      const to = this.player.position.add(new Vector3(0, 1.0, 0));
      // Release the dagger in sync with the throw animation (arm fully forward ≈ mid-clip).
      this.arrows.push(new Arrow(this.scene, from, to, ARROW_SPEED, applyHit, enemy.throwReleaseDelay));
    } else {
      applyHit();
    }
  }

  /** True for bow bearers (Shana/Miranda): they attack from range with arrows. */
  private isRanged(): boolean {
    return this.player.bearer.weapon === "bow";
  }

  /** Attack distance: long for ranged bearers, short for melee. */
  private get reach(): number {
    return this.reachFor(this.player);
  }

  /** Attack distance for any avatar (long for bow bearers, short for melee). */
  private reachFor(p: Player): number {
    return p.bearer.weapon === "bow" ? RANGED_REACH : PLAYER_REACH;
  }

  /**
   * Drive an AI party member: charge its ATB gauge, then run its brain (the single
   * decision point a future gambit system will replace) and execute the result —
   * approach, strike (auto-resolving the full Addition), or hold while charging.
   */
  private updateAiMember(member: PartyMember, dt: number, cdt: number): void {
    member.tickGauge(cdt);
    member.avatar.tickGuard(cdt);

    // Guarding roots the member for the stance's duration (like the player).
    if (member.avatar.guardActive) {
      member.avatar.animate(dt, false);
      member.syncHud(this.scene);
      return;
    }

    const before = member.position.clone();
    const view = {
      position: member.position,
      reach: this.reachFor(member.avatar),
      ready: member.ready,
      hpFraction: member.avatar.maxHp > 0 ? member.avatar.hp / member.avatar.maxHp : 1,
      canGuard: member.avatar.guardReady,
      canTransform: member.avatar.canTransform,
      hasItem: this.hasHealItem(),
      canCastMagic: member.avatar.canCastMagic,
    };
    const decision = member.brain.decide(view, { enemies: this.enemies.filter((e) => e.alive) });
    if (decision.kind === "approach") {
      const to = decision.target.position.subtract(member.position);
      to.y = 0;
      member.avatar.move(to, dt);
    } else if (decision.kind === "idle") {
      if (decision.target) member.avatar.face(decision.target.position.subtract(member.position));
    } else {
      // An ATB action — only when the gauge is full; otherwise hold (face the target).
      if (member.ready && this.performAiAction(member, decision)) {
        // Transforming keeps the turn (free stance change); other actions spend it + tick.
        if (decision.kind !== "transform") {
          member.gauge.spend();
          member.avatar.tickDragoon();
          // AI actions resolve at once, so revert here if that spent the last Dragoon turn.
          if (member.avatar.dragoonSpent) member.avatar.revert();
        }
      } else if ("target" in decision) {
        member.avatar.face(decision.target.position.subtract(member.position));
      }
    }
    clampToArena(member.position);
    member.avatar.animate(dt, Vector3.DistanceSquared(before, member.position) > 1e-6);
    member.syncHud(this.scene);
  }

  /** Execute an AI member's chosen ATB action. Returns false if it couldn't be performed. */
  private performAiAction(member: PartyMember, decision: { kind: string; target?: Enemy }): boolean {
    const avatar = member.avatar;
    switch (decision.kind) {
      case "attack":
        if (!decision.target) return false;
        avatar.face(decision.target.position.subtract(member.position));
        this.autoStrike(avatar, decision.target);
        return true;
      case "magic": {
        if (!decision.target || !avatar.canCastMagic) return false;
        // AI casts its cheapest available damage spell at the target.
        const spell = avatar.castableSpells().find((s) => s.multiplier !== undefined);
        if (!spell) return false;
        avatar.face(decision.target.position.subtract(member.position));
        this.castSpell(avatar, spell, decision.target, [avatar]);
        return true;
      }
      case "guard": {
        if (avatar.guardActive) return false;
        const heal = avatar.startGuard();
        this.popText(member.position.add(new Vector3(0, 2.2, 0)), `+${heal}`, TEXT.hp);
        return true;
      }
      case "transform":
        if (!avatar.canTransform) return false;
        avatar.transform();
        this.popText(member.position.add(new Vector3(0, 2.6, 0)), t("combat.dragoon"), TEXT.dragoon);
        return true;
      case "item":
        return this.useHealItem(member);
      default:
        return false;
    }
  }

  /** True when at least one healing item is in stock (AI gambit / Brain view). */
  private hasHealItem(): boolean {
    return this.items.some((s) => s.count > 0 && s.def.healFraction > 0);
  }

  /**
   * An AI attacker auto-resolves its equipped Addition in one strike (no timed input):
   * the whole combo's damage lands at once. Ranged bearers loose an arrow as usual.
   */
  private autoStrike(attacker: Player, target: Enemy): void {
    attacker.strike();
    // Charge toward transform: bow users (no Additions) by their Dragoon-Level table,
    // Addition users by a flat per-hit amount (they can't perform real Additions as AI).
    attacker.gainSp(attacker.usesBasicAttack ? attacker.spPerBasicAttack : AI_SP_PER_HIT);
    const add = attacker.addition;
    const atk = { at: attacker.atk, lv: attacker.level };
    const df = target.def.stats.df;
    const mult = additionMultiplier(add, attacker.additionLevel(add));
    const element = elementMultiplier(attacker.attackElement, target.def.element);
    const dmg = Math.max(1, additionAttack(atk, df, additionHitsPercent(add), mult, { element }));

    if (attacker.bearer.weapon === "bow") {
      const from = attacker.position.add(new Vector3(0, 1.3, 0));
      const to = target.position.add(new Vector3(0, 1.2, 0));
      this.arrows.push(
        new Arrow(this.scene, from, to, ARROW_SPEED, () => {
          if (target.alive) this.landDamage(target, dmg);
        }, 0.22),
      );
      return;
    }
    this.landDamage(target, dmg);
  }

  /** Per-Addition DPS readout for the Training balance tab (full vs. spam-hit-1). */
  private balanceRows(): BalanceRow[] {
    const atk = { at: this.player.atk, lv: this.player.level };
    return this.player.additions.map((a) => {
      const e = estimateDps(atk, a, this.player.additionLevel(a), BALANCE_REF_DF, this.player.atbFillTime);
      return {
        name: a.name,
        fullDps: Math.round(e.fullDps),
        spamDps: Math.round(e.spamDps),
        ratio: e.ratio,
      };
    });
  }

  private inReach(e: Enemy): boolean {
    return Vector3.Distance(this.player.position, e.position) <= this.reach;
  }

  /** A bearer with no Additions (single-hit "Attack", e.g. Shana/Miranda): it auto-repeats in reach. */
  private isBasicAttacker(): boolean {
    return additionPresses(this.player.addition) === 0;
  }

  private withinAcquire(e: Enemy): boolean {
    return Vector3.Distance(this.player.position, e.position) <= ACQUIRE_RANGE;
  }

  /** Nearest living enemy within `maxDist` (used to auto-approach on an Attack press). */
  private nearestEnemy(maxDist: number): Enemy | undefined {
    let best: Enemy | undefined;
    let bestDist = maxDist;
    for (const e of this.enemies) {
      if (!e.alive) continue; // skip corpses still lingering through their death animation
      const d = Vector3.Distance(this.player.position, e.position);
      if (d <= bestDist) {
        best = e;
        bestDist = d;
      }
    }
    return best;
  }

  private nearestInReach(): Enemy | undefined {
    let best: Enemy | undefined;
    let bestDist = this.reach;
    for (const e of this.enemies) {
      if (!e.alive) continue; // skip corpses still lingering through their death animation
      const d = Vector3.Distance(this.player.position, e.position);
      if (d <= bestDist) {
        best = e;
        bestDist = d;
      }
    }
    return best;
  }

  private removeEnemy(enemy: Enemy): void {
    const i = this.enemies.indexOf(enemy);
    if (i < 0) return; // already gone (e.g. the mode was torn down before the death linger fired)
    this.enemies.splice(i, 1);
    if (this.attackTarget === enemy) this.clearNav();
    enemy.dispose();
    this.refreshShadowCasters();
  }

  /** Data for the System menu's Characters / Party / Gambits tabs. */
  menuData(): ModeMenuData {
    return {
      gold: this.player.gold,
      characters: {
        controlledId: this.player.bearer.id,
        list: selectableBearers().map((b) => ({
          id: b.id,
          name: b.name,
          portrait: b.portrait,
          element: dragoonClass(b.classId)?.element ?? b.classId,
          color: b.color,
          active: this.partyBearers.some((pb) => pb.id === b.id),
          controlled: b.id === this.player.bearer.id,
        })),
        sheet: (id) => this.characterSheet(id),
      },
      party: {
        slots: this.partyBearers.map((b, i) => ({
          id: b.id,
          name: b.name,
          controlled: i === this.controlledIndex,
        })),
        activeSlot: this.activeSlot,
        selectSlot: (s) => {
          this.activeSlot = Math.min(Math.max(s, 0), this.partyBearers.length - 1);
        },
        assign: (id) => {
          const b = bearerById(id);
          if (b) this.assignToSlot(b);
        },
      },
      gambits: {
        members: this.party.map((m, i) => ({
          name: m.avatar.bearer.name,
          controlled: m === this.controlled,
          rules: this.gambitIds[i] ?? [],
        })),
        cycle: (mi, ri) => this.cycleGambit(mi, ri),
      },
    };
  }

  /**
   * Per-character sheet (Stats / Equipment / Additions) for any roster member, active or
   * reserve. Stats and gear come from the character's stored config (computed without a 3D
   * avatar); for an active member, live HP/SP/MP are overlaid. Edits route through the store.
   */
  private characterSheet(id: string): CharacterSheet {
    const bearer = bearerById(id)!;
    const cls = dragoonClass(bearer.classId)!;
    const cfg = this.roster.get(bearer);
    const live = this.party.find((m) => m.avatar.bearer.id === id)?.avatar;
    const cs = computeCharacterStats(cfg, bearer.classId, this.partyLevel);

    const gearExtras = (
      [
        ["SPD", cs.spd],
        ["A-HIT", cs.aHit],
        ["M-HIT", cs.mHit],
        ["A-AV", cs.aAv],
        ["M-AV", cs.mAv],
      ] as [string, number][]
    )
      .filter(([, v]) => v !== 0)
      .map(([label, value]) => ({ label, value }));

    const status: StatusView = {
      name: bearer.name,
      portrait: bearer.portrait,
      level: this.partyLevel,
      exp: cs.exp,
      nextExp: cs.nextExp,
      hp: live ? live.hp : cs.maxHp,
      maxHp: cs.maxHp,
      sp: live ? live.sp : 0,
      maxSp: live ? live.maxSp : 100,
      mp: live ? live.mp : cs.maxMp,
      maxMp: cs.maxMp,
      speed: cs.speed,
      combat: [
        { label: "AT", base: cs.at.base, gear: cs.at.gear, total: cs.at.base + cs.at.gear },
        { label: "DF", base: cs.df.base, gear: cs.df.gear, total: cs.df.base + cs.df.gear },
        { label: "MAT", base: cs.mat.base, gear: cs.mat.gear, total: cs.mat.base + cs.mat.gear },
        { label: "MDF", base: cs.mdf.base, gear: cs.mdf.gear, total: cs.mdf.base + cs.mdf.gear },
      ],
      gearExtras,
    };

    const additions: AdditionEntry[] = cls.additions.map((def) => ({
      def,
      unlocked: def.acquireLevel <= this.partyLevel,
      level: live ? live.additionLevel(def) : 1,
      equipped: def.name === cfg.additionName,
    }));

    const equipment: EquipView = {
      slots: EQUIP_SLOTS.map((slot) => ({
        slot,
        equippedName: cfg.equipment[slot] ? equipById(cfg.equipment[slot]!)?.name : undefined,
      })),
      options: (slot) =>
        equipmentForSlot(slot, cls.equipmentUser).map((def) => ({
          id: def.id,
          name: def.name,
          detail: equipSummary(def),
          equipped: cfg.equipment[slot] === def.id,
        })),
      equip: (slot, eid) => this.setEquip(id, slot, eid),
    };

    return { status, additions, equipAddition: (def) => this.setAddition(id, def.name), equipment };
  }

  // --- Roster config (gear / Addition persistence per character) -------------

  /** Apply a character's stored config (gear + equipped Addition) to a live avatar. */
  private applyConfig(p: Player, bearer: Bearer): void {
    const cfg = this.roster.get(bearer);
    for (const slot of EQUIP_SLOTS) {
      const id = cfg.equipment[slot];
      const def = id ? equipById(id) : undefined;
      if (def && def.slot === slot) p.equip(def);
      else p.unequip(slot);
    }
    p.addition = p.additions.find((a) => a.name === cfg.additionName) ?? BASIC_ATTACK;
  }

  /** Set a character's equipment (store + live avatar if it's in the party). */
  private setEquip(bearerId: string, slot: EquipSlot, id?: string): void {
    const bearer = bearerById(bearerId);
    if (!bearer) return;
    this.roster.get(bearer).equipment[slot] = id;
    const live = this.party.find((m) => m.avatar.bearer.id === bearerId)?.avatar;
    if (live) {
      const def = id ? equipById(id) : undefined;
      if (def && def.slot === slot) live.equip(def);
      else live.unequip(slot);
    }
  }

  /** Set a character's equipped Addition (store + live avatar if it's in the party). */
  private setAddition(bearerId: string, name: string): void {
    const bearer = bearerById(bearerId);
    if (!bearer) return;
    this.roster.get(bearer).additionName = name;
    const live = this.party.find((m) => m.avatar.bearer.id === bearerId)?.avatar;
    if (live) {
      live.addition = live.additions.find((a) => a.name === name) ?? BASIC_ATTACK;
      if (live === this.player) this.runner.cancel(); // never keep a running combo on the old Addition
    }
  }

  /** Register a spawned enemy and (re)register shadow casters — once now for the placeholder,
   *  and again when its rigged model finishes loading (its meshes appear then). */
  private addEnemy(e: Enemy): void {
    this.enemies.push(e);
    this.refreshShadowCasters();
    void e.ready.then(() => this.refreshShadowCasters());
  }

  /** Spawn a non-canon training dummy: an immortal, inert damage-test target. */
  private spawnDummy(): void {
    this.addEnemy(new Enemy(this.scene, TRAINING_DUMMY, this.ringPosition(4)));
  }

  private spawnKnight(): void {
    this.addEnemy(new Enemy(this.scene, KNIGHT_OF_SANDORA, this.ringPosition()));
  }

  /**
   * Spawn the Commander boss on its own. (Its Power Up still triggers if Knights
   * are present and then defeated — spawn some alongside to see the scripted
   * Seles behaviour.)
   */
  private spawnCommander(): void {
    this.addEnemy(new Enemy(this.scene, COMMANDER_SELES, this.ringPosition(8)));
  }

  /** A random spawn position on a ring around the player, kept inside the arena. */
  private ringPosition(radius = 6): Vector3 {
    const angle = Math.random() * Math.PI * 2;
    const r = radius + Math.random() * 2;
    const p = this.player.position.add(new Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r));
    clampToArena(p);
    return p;
  }

  private popText(world: Vector3, text: string, color: string): void {
    const p = projectToScreen(this.scene, world);
    if (p.visible) floatingText(p.x, p.y, text, color);
  }

  private refreshHud(): void {
    const p = this.player;
    // Party HUD: one ATB row per member (the controlled one shows SP/MP/Addition detail).
    this.hud.set(
      this.party.map((m): PartyRowView => {
        const a = m.avatar;
        const controlled = m === this.controlled;
        const row: PartyRowView = {
          name: a.bearer.name,
          portrait: a.bearer.portrait,
          dragoonPortrait: a.bearer.dragoonPortrait,
          level: a.level,
          hp: a.hp,
          maxHp: a.maxHp,
          atb: m.gauge.fill,
          controlled,
          transformed: a.transformed,
        };
        if (controlled) {
          row.dragoonUnlocked = a.dragoonUnlocked;
          row.sp = a.sp;
          row.maxSp = a.maxSp;
          row.dragoonLevel = a.dragoonLevel;
          row.mp = a.mp;
          row.maxMp = a.maxMp;
        }
        return row;
      }),
    );

    // ATB progress lives on the party HUD bar (single source of truth) — no radial timer
    // on the buttons. They only reflect ready/not-ready; ⚔ glows gold when an action can
    // begin. The action set swaps with the form (human: Guard/Item/Transform · Dragoon:
    // Magic/Return); each also needs its own precondition. Transform appears once SP is full.
    const transformed = p.transformed;
    const ready = this.runner.gauge.isReady && !this.runner.active; // ATB full, no combo
    const canStart = ready && !p.guardActive && this.rangedCooldownT <= 0;

    // Attack stays usable mid-combo (timing presses) and when ready to begin; glow = ready.
    // Its icon swaps with the form: blue sword (human) ↔ red sword (dragoon).
    if (transformed !== this.attackDragoon) {
      this.attackDragoon = transformed;
      this.attackBtn?.setFrames(transformed ? ATTACK_DRAGOON_FRAMES : ATTACK_ICON_FRAMES);
    }
    this.attackBtn?.setAvailable(this.runner.active || canStart);
    this.attackBtn?.setReady(canStart);

    this.guardBtn?.setVisible(!transformed);
    this.guardBtn?.setAvailable(ready && !p.guardActive);
    this.guardBtn?.setReady(ready && !p.guardActive);
    this.itemBtn?.setVisible(!transformed);
    // Usable whenever you can act and hold any item (even wasting its effect is allowed).
    const hasItems = this.items.some((s) => s.count > 0);
    this.itemBtn?.setAvailable(ready && hasItems);
    this.itemBtn?.setReady(ready && hasItems);

    // Transform: the Dragoon eye + button colour follow the controlled archetype.
    if (p.element !== this.transformElement) {
      this.transformElement = p.element;
      this.transformBtn?.setFrames(EYE_FRAMES[p.element] ?? EYE_FRAMES.Fire);
      this.transformBtn?.setColor(rgba(p.bearer.color, 0.85));
    }
    this.transformBtn?.setVisible(!transformed && p.canTransform);
    this.transformBtn?.setAvailable(ready);
    this.transformBtn?.setReady(ready && p.canTransform);

    this.magicBtn?.setVisible(transformed);
    this.magicBtn?.setAvailable(ready && p.canCastMagic);
    this.magicBtn?.setReady(ready && p.canCastMagic);

    this.switchBtn?.setAvailable(this.party.length > 1);
    // Special: appears once the whole party is charged & human — greyed until the controlled
    // member's ATB is also full, then it lights up (and the yin-yang animates).
    this.specialBtn?.setVisible(this.canSpecial);
    this.specialBtn?.setAvailable(this.canSpecial && ready);
    this.specialBtn?.setReady(this.canSpecial && ready);
  }

  dispose(): void {
    this.canvas?.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas?.removeEventListener("pointermove", this.onPointerMove);
    this.canvas?.removeEventListener("pointerleave", this.onPointerLeave);
    window.removeEventListener("keydown", this.onKeyDown);
    for (const a of this.arrows) a.dispose();
    this.arrows = [];
    for (const e of this.enemies) e.dispose();
    this.enemies = [];
    for (const m of this.party) m.dispose();
    this.party = [];
    this.hud.dispose();
    this.sight.dispose();
    this.debugMenu.dispose();
    this.debugBtn.dispose();
    this.attackBtn?.dispose();
    this.guardBtn?.dispose();
    this.transformBtn?.dispose();
    this.itemBtn?.dispose();
    this.magicBtn?.dispose();
    this.switchBtn?.dispose();
    this.specialBtn?.dispose();
    this.spellMenu.dispose();
    this.itemMenu.dispose();
    this.spaceOverlay.remove();
  }
}

/** Floating-damage colour: orange when boosted (weakness), blue-grey when resisted, else gold. */
