import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import "@babylonjs/core/Meshes/meshBuilder";

import { GameMode } from "../core/GameMode";
import { hasTouch } from "../core/device";
import { settings } from "../core/settings";
import { IsoCamera } from "../world/IsoCamera";
import { createGround } from "../world/Ground";
import { projectToScreen } from "../world/project";
import { Player } from "../entities/Player";
import { PartyMember } from "../entities/PartyMember";
import { Enemy, type EnemyAction } from "../entities/Enemy";
import { Arrow } from "../entities/Arrow";
import { GambitBrain, resolveGambit, nextGambitId, DEFAULT_GAMBIT_IDS } from "../combat/Gambit";
import type { ActionId } from "../combat/Action";
import { startingItems } from "../data/items";
import { KNIGHT_OF_SANDORA, COMMANDER_SELES, TRAINING_DUMMY } from "../data/enemies";
import {
  additionHitsPercent,
  additionMultiplier,
  additionPresses,
  type AdditionDef,
} from "../data/additions";
import { additionAttack, enemyPhysicalAttack, enemyMagicalAttack } from "../combat/formula";
import { estimateDps } from "../combat/balance";
import { elementMultiplier } from "../combat/element";
import { AdditionRunner } from "../combat/AdditionRunner";
import { t } from "../core/i18n";
import type { ModeMenuData, AdditionEntry } from "../core/menu";
import {
  type EquipSlot,
  equipById,
  equipmentForSlot,
  equipSummary,
} from "../data/equipment";
import { type Bearer, DEFAULT_BEARER, bearerById, selectableBearers } from "../data/bearers";
import { ActionButton } from "../ui/ActionButton";
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

/** Damage multiplier of one Dragoon magic cast (MAT²·5/MDF × this). */
const DRAGOON_MAGIC_MULT = 2;

/** SP gained by an AI member per auto-attack (so it can charge up to transform). */
const AI_SP_PER_HIT = 20;

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
  private hud!: PartyPanel;
  private sight!: TimingSight;
  private debugBtn!: Button;
  private debugMenu!: TrainingMenu;
  private attackBtn?: ActionButton;
  private guardBtn?: ActionButton;
  private transformBtn?: ActionButton;
  private itemBtn?: ActionButton;
  private magicBtn?: ActionButton;
  private revertBtn?: ActionButton;
  private switchBtn?: ActionButton;

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
    this.scene.clearColor = new Color4(0.043, 0.051, 0.071, 1);

    const ambient = new HemisphericLight("ambient", new Vector3(0, 1, 0), this.scene);
    ambient.intensity = 0.65;
    ambient.groundColor = new Color3(0.1, 0.12, 0.18);

    const sun = new DirectionalLight("sun", new Vector3(-0.5, -1, -0.4), this.scene);
    sun.intensity = 0.85;

    createGround(this.scene, 40);

    this.partyBearers = this.defaultParty();
    this.gambitIds = this.partyBearers.map(() => [...DEFAULT_GAMBIT_IDS]);
    this.buildParty();
    this.camera = new IsoCamera(this.scene, this.player.position.clone());

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
        refDf: BALANCE_REF_DF,
        balance: this.balanceRows(),
      }),
      onSetLevel: (lv) => this.setLevel(lv),
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
    // Right-hand action cluster (the left thumb drives the floating joystick). Touch gets
    // a big ⚔ attack button bottom-right; the secondary actions sit in an arc above it and
    // SWAP with the form — human: Guard/Item/Transform · Dragoon: Magic/Return (shared arc
    // slots). Desktop also has key shortcuts (G/R/T/F, Tab to switch).
    const touch = hasTouch();
    if (touch) this.attackBtn = new ActionButton("⚔", () => this.input.pressVirtual("Space"));
    // Slot 0 (above attack): Guard ⇄ Magic. Slot 1 (diagonal): Item ⇄ Return.
    this.guardBtn = this.actionArcButton("🛡", "Guard", 0, "rgba(40,90,150,0.82)", "rgba(150,190,255,0.6)", "#e6f0ff");
    this.magicBtn = this.actionArcButton("🔮", "Magic", 0, "rgba(95,55,140,0.82)", "rgba(200,170,255,0.6)", "#f0e6ff");
    this.itemBtn = this.actionArcButton("🧪", "Item", 1, "rgba(40,110,70,0.82)", "rgba(150,230,180,0.6)", "#e6fff0");
    this.revertBtn = this.actionArcButton("⮌", "Revert", 1, "rgba(120,80,40,0.82)", "rgba(230,190,150,0.6)", "#fff0e0");
    // Slot 2 (left of attack): Transform (human only, appears at full SP).
    this.transformBtn = this.actionArcButton("✨", "Transform", 2, "rgba(150,120,40,0.82)", "rgba(255,225,140,0.6)", "#fff4d8");
    // Switch controlled member — occasional, kept out of the combat cluster (top-right).
    this.switchBtn = new ActionButton("⇄", () => this.input.pressVirtual("Switch"), {
      top: "calc(env(safe-area-inset-top, 0px) + 104px)",
      right: "calc(env(safe-area-inset-right, 0px) + 10px)",
      bottom: "auto",
      width: "48px",
      height: "48px",
      font: "600 20px/1 system-ui, sans-serif",
      background: "rgba(70,60,120,0.82)",
      border: "1px solid rgba(180,170,255,0.6)",
      color: "#ece6ff",
    });

    this.canvas = this.scene.getEngine().getRenderingCanvas() ?? undefined;
    this.canvas?.addEventListener("pointerdown", this.onPointerDown);
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
  ): ActionButton {
    const slots = [
      { right: 34, bottom: 142 }, // above the attack button
      { right: 118, bottom: 118 }, // up-left diagonal
      { right: 152, bottom: 44 }, // left of the attack button
    ];
    const s = slots[slot] ?? slots[0];
    return new ActionButton(icon, () => this.input.pressVirtual(code), {
      left: "auto",
      right: `calc(env(safe-area-inset-right, 0px) + ${s.right}px)`,
      bottom: `calc(env(safe-area-inset-bottom, 0px) + ${s.bottom}px)`,
      width: "62px",
      height: "62px",
      font: "600 24px/1 system-ui, sans-serif",
      background,
      border: `1px solid ${borderColor}`,
      color,
    });
  }

  /** Default party: the starting bearer plus two distinct implemented front-liners. */
  private defaultParty(): Bearer[] {
    const roster = selectableBearers();
    const prefs = ["lavitz", "albert", "rose", "shana", "meru"];
    const team: Bearer[] = [DEFAULT_BEARER];
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
      m.setControlled(i === this.controlledIndex);
      return m;
    });
    this.runner.cancel();
    this.comboTarget = undefined;
    this.clearNav();
    this.runner.attach(this.controlled.gauge);
    this.runner.setFillTime(this.player.atbFillTime);
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
    if (this.input.wasPressed("Revert")) this.playerAct("revert");
    // T toggles form: transform in human form, return to human in Dragoon form.
    if (this.input.wasPressed("Transform") || this.input.wasPressed("KeyT")) {
      this.playerAct(this.player.transformed ? "revert" : "transform");
    }
    if (this.input.wasPressed("Tab") || this.input.wasPressed("Switch")) this.cycleControl();

    // Combat time scales with the Options "combat speed" setting.
    const cdt = dt * settings.combatSpeed;
    this.player.tickGuard(cdt);
    // Keep the ATB gauge's fill time in sync with the bearer's Speed (gear can change it).
    this.runner.setFillTime(this.player.atbFillTime);
    if (this.runner.tick(cdt)) {
      // The timing sight lapsed unpressed — a whiff; show it like a missed press.
      this.comboTarget = undefined;
      this.popText(this.player.position.add(new Vector3(0, 2.2, 0)), t("combat.miss"), "#c9c9c9");
    }
    this.updateEnemies(cdt);
    // AI party members (everyone except the controlled one) run their Brain.
    for (const m of this.party) {
      if (m !== this.controlled) this.updateAiMember(m, dt, cdt);
    }
    this.updateSight();

    this.refreshHud();
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
   * Perform a non-attack ATB action for the controlled member. Requires the ATB gauge
   * full and no combo in progress; on success it spends the gauge and counts a Dragoon
   * turn (except the transform itself). Attack is handled separately (the timed combo).
   */
  private playerAct(id: ActionId): void {
    // Returning to human form is a free stance change — not gated by the ATB gauge.
    if (id === "revert") {
      if (this.player.transformed) this.player.revert();
      return;
    }
    if (this.runner.active || !this.runner.gauge.isReady) return;
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
        break; // attack uses the timed-combo path; revert handled above
    }
    if (ok) {
      this.runner.gauge.spend();
      if (id !== "transform") m.avatar.tickDragoon();
    }
  }

  private doGuard(m: PartyMember): boolean {
    if (m.avatar.guardActive) return false;
    const heal = m.avatar.startGuard();
    this.popText(m.position.add(new Vector3(0, 2.2, 0)), `+${heal}`, "#9fe6a0");
    return true;
  }

  private doTransform(m: PartyMember): boolean {
    if (!m.avatar.canTransform) return false;
    m.avatar.transform();
    this.popText(m.position.add(new Vector3(0, 2.6, 0)), t("combat.dragoon"), "#ffe08a");
    return true;
  }

  private doItem(m: PartyMember): boolean {
    return this.useHealItem(m);
  }

  private doMagic(m: PartyMember): boolean {
    if (!m.avatar.canCastMagic) return false;
    const target =
      this.attackTarget && this.attackTarget.alive ? this.attackTarget : this.nearestEnemy(ACQUIRE_RANGE);
    if (!target) return false;
    m.avatar.face(target.position.subtract(m.position));
    this.castMagic(m.avatar, target);
    return true;
  }

  /** Consume the first available healing item on `m`. Returns false if none/full. */
  private useHealItem(m: PartyMember): boolean {
    const stock = this.items.find((s) => s.count > 0 && s.def.healFraction > 0);
    if (!stock) return false;
    const healed = m.avatar.heal(Math.floor(m.avatar.maxHp * stock.def.healFraction));
    stock.count -= 1;
    this.popText(m.position.add(new Vector3(0, 2.2, 0)), `+${healed}`, "#9fe6a0");
    return true;
  }

  /** Cast Dragoon magic: spend MP and deal magical damage (the Dragoon's element) to a foe. */
  private castMagic(attacker: Player, target: Enemy): void {
    attacker.mp = Math.max(0, attacker.mp - attacker.magicCost);
    attacker.strike();
    const element = elementMultiplier(attacker.element, target.def.element);
    const dmg = Math.max(
      1,
      enemyMagicalAttack(attacker.matk, target.def.stats.mdf, DRAGOON_MAGIC_MULT, { element }),
    );
    this.popText(attacker.position.add(new Vector3(0, 2.6, 0)), t("action.magic"), "#c8a6ff");
    this.landDamage(target, dmg, element);
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
    if (hasTouch()) {
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
      return;
    }
    const ground = this.groundPoint(e);
    if (ground) {
      this.moveTarget = ground;
      this.attackTarget = undefined;
      this.pendingAttack = false;
    }
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

    const res = this.runner.press(this.player.addition);
    if (res.kind !== "started") return; // ignored (e.g. during recovery)
    this.comboTarget = target;
    this.player.face(target.position.subtract(this.player.position));
    this.player.tickDragoon(); // one attack = one Dragoon turn
    this.applyHit(target, res.hits); // guaranteed hit 1
  }

  /** Resolve a timing-sight press against the locked combo target. */
  private resolveTimingPress(): void {
    const target = this.comboTarget;
    const add = this.player.addition;
    const res = this.runner.press(add);

    if (res.kind === "miss") {
      this.comboTarget = undefined;
      this.popText(this.player.position.add(new Vector3(0, 2.2, 0)), t("combat.miss"), "#c9c9c9");
      return;
    }
    if (res.kind !== "hit" || !target || !target.alive) return;

    this.applyHit(target, res.hits);
    // SP accrues per landed input (hit 1 is free); award an even share of spMax.
    const share = Math.floor(add.spMax / additionPresses(add));
    this.player.sp = Math.min(this.player.maxSp, this.player.sp + share);
    if (res.perfect) this.popText(target.position.add(new Vector3(0, 3.1, 0)), t("combat.perfect"), "#ffffff");
    if (res.completed) {
      this.player.recordAddition(add);
      this.comboTarget = undefined;
    }
  }

  /**
   * Apply hit `k` of the current Addition. Per-hit damage is the LoD formula's
   * running total minus the previous hits' total, so the chain's sum equals a
   * perfect Addition. Handles the target dying.
   */
  private applyHit(target: Enemy, k: number): void {
    this.player.strike(); // play the weapon's strike/draw animation on every blow
    const add = this.player.addition;
    const atk = { at: this.player.atk, lv: this.player.level };
    const df = target.def.stats.df;
    const mult = additionMultiplier(add, this.player.additionLevel(add));
    // Element modifier: the weapon's element vs the target's element (1 if non-elemental).
    const element = elementMultiplier(this.player.attackElement, target.def.element);
    const mods = { element };
    const before = k > 1 ? additionAttack(atk, df, additionHitsPercent(add, k - 1), mult, mods) : 0;
    const now = additionAttack(atk, df, additionHitsPercent(add, k), mult, mods);
    const dmg = Math.max(1, now - before);

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
            if (target.alive) this.landDamage(target, dmg, element);
          },
          0.22,
        ),
      );
      return;
    }

    this.landDamage(target, dmg, element);
  }

  /** Apply a computed hit to the target: damage, floating text, and death handling. */
  private landDamage(target: Enemy, dmg: number, element: number): void {
    target.takeDamage(dmg);
    this.popText(target.headPosition, `${dmg}`, damageColor(element));

    if (!target.alive) {
      this.player.gainExp(target.def.expReward);
      this.player.gold += target.def.goldReward;
      this.popText(target.headPosition, `+${target.def.expReward} EXP`, "#9fe6a0");
      // Only cancel the player's combo if it's the one that just died (an ally kill
      // must not abort the player's in-progress Addition).
      if (this.comboTarget === target) {
        this.runner.cancel();
        this.comboTarget = undefined;
      }
      this.removeEnemy(target);
    }
  }

  private updateEnemies(cdt: number): void {
    const knightsAlive = this.enemies.filter((e) => e.def.id.startsWith("knight_of_sandora")).length;
    const ctx = { knightsAlive };
    for (const enemy of this.enemies) {
      const action = enemy.aiUpdate(cdt, this.player.position, ctx);
      enemy.syncHud(this.scene);
      if (action) this.resolveEnemyAction(enemy, action);
    }
  }

  /** Apply an enemy's chosen action: damage the player, or self-heal. */
  private resolveEnemyAction(enemy: Enemy, action: EnemyAction): void {
    if (action.kind === "heal") {
      enemy.heal(action.amount);
      this.popText(enemy.headPosition, `+${action.amount}`, "#7CFC7C");
      return;
    }

    // Guarding halves incoming damage (the LoD "Guard" modifier).
    const guard = this.player.guardActive ? 0.5 : 1;
    const magical = action.kind === "magical";
    // Element only applies to magical attacks (attack element vs Dart's element).
    const element = magical ? elementMultiplier(action.element ?? "Non-Elemental", this.player.element) : 1;
    const raw = magical
      ? enemyMagicalAttack(enemy.def.stats.mat, this.player.mdef, action.multiplier, { guard, element })
      : enemyPhysicalAttack(enemy.def.stats.at, this.player.def, action.multiplier, { guard });
    // Damage-reduction gear (Phantom/Dragon Shield, Angel Scarf…).
    const dmg = Math.floor(raw * this.player.incomingMultiplier(magical ? "magic" : "phys"));
    this.player.hp = Math.max(0, this.player.hp - dmg);
    this.popText(this.player.position.add(new Vector3(0, 2.2, 0)), `${dmg}`, "#ff6b6b");

    if (this.player.hp === 0) {
      this.player.hp = this.player.maxHp; // sandbox: revive instead of game-over
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
    const decision = member.brain.decide(view, { enemies: this.enemies });
    if (decision.kind === "approach") {
      const to = decision.target.position.subtract(member.position);
      to.y = 0;
      member.avatar.move(to, dt);
    } else if (decision.kind === "idle") {
      if (decision.target) member.avatar.face(decision.target.position.subtract(member.position));
    } else {
      // An ATB action — only when the gauge is full; otherwise hold (face the target).
      if (member.ready && this.performAiAction(member, decision)) {
        member.gauge.spend();
        if (decision.kind !== "transform") member.avatar.tickDragoon();
      } else if ("target" in decision) {
        member.avatar.face(decision.target.position.subtract(member.position));
      }
    }
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
      case "magic":
        if (!decision.target || !avatar.canCastMagic) return false;
        avatar.face(decision.target.position.subtract(member.position));
        this.castMagic(avatar, decision.target);
        return true;
      case "guard": {
        if (avatar.guardActive) return false;
        const heal = avatar.startGuard();
        this.popText(member.position.add(new Vector3(0, 2.2, 0)), `+${heal}`, "#9fe6a0");
        return true;
      }
      case "transform":
        if (!avatar.canTransform) return false;
        avatar.transform();
        this.popText(member.position.add(new Vector3(0, 2.6, 0)), t("combat.dragoon"), "#ffe08a");
        return true;
      case "item":
        return this.useHealItem(member);
      default:
        return false;
    }
  }

  /** True when at least one healing item is in stock. */
  private hasHealItem(): boolean {
    return this.items.some((s) => s.count > 0 && s.def.healFraction > 0);
  }

  /**
   * An AI attacker auto-resolves its equipped Addition in one strike (no timed input):
   * the whole combo's damage lands at once. Ranged bearers loose an arrow as usual.
   */
  private autoStrike(attacker: Player, target: Enemy): void {
    attacker.strike();
    attacker.sp = Math.min(attacker.maxSp, attacker.sp + AI_SP_PER_HIT); // charge toward transform
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
          if (target.alive) this.landDamage(target, dmg, element);
        }, 0.22),
      );
      return;
    }
    this.landDamage(target, dmg, element);
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
    if (i >= 0) this.enemies.splice(i, 1);
    if (this.attackTarget === enemy) this.clearNav();
    enemy.dispose();
  }

  /** Data for the System menu's Status / Addition / Equipment tabs. */
  menuData(): ModeMenuData {
    const p = this.player;
    return {
      status: {
        name: p.bearer.name,
        portrait: p.bearer.portrait,
        level: p.level,
        exp: p.exp,
        nextExp: p.nextExp,
        hp: p.hp,
        maxHp: p.maxHp,
        sp: p.sp,
        maxSp: p.maxSp,
        mp: p.mp,
        maxMp: p.maxMp,
        gold: p.gold,
        combat: [
          { label: t("stat.at"), base: p.stats.at, gear: p.atk - p.stats.at, total: p.atk },
          { label: t("stat.df"), base: p.stats.df, gear: p.def - p.stats.df, total: p.def },
          { label: t("stat.mat"), base: p.stats.mat, gear: p.matk - p.stats.mat, total: p.matk },
          { label: t("stat.mdf"), base: p.stats.mdf, gear: p.mdef - p.stats.mdf, total: p.mdef },
        ],
        gearExtras: (
          [
            ["SPD", p.gearTotal("spd")],
            ["A-HIT", p.gearTotal("aHit")],
            ["M-HIT", p.gearTotal("mHit")],
            ["A-AV", p.gearTotal("aAv")],
            ["M-AV", p.gearTotal("mAv")],
          ] as [string, number][]
        )
          .filter(([, v]) => v !== 0)
          .map(([label, value]) => ({ label, value })),
      },
      additions: this.additionEntries(),
      equipAddition: (def) => this.equipAddition(def),
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
      equipment: {
        slots: (["weapon", "head", "body", "feet", "accessory"] as EquipSlot[]).map((slot) => ({
          slot,
          equippedName: p.equipment[slot]?.name,
        })),
        options: (slot) =>
          equipmentForSlot(slot, p.equipmentUser).map((def) => ({
            id: def.id,
            name: def.name,
            detail: equipSummary(def),
            equipped: p.equipment[slot]?.id === def.id,
          })),
        equip: (slot, id) => (id ? p.equip(equipById(id)!) : p.unequip(slot)),
      },
    };
  }

  private equipAddition(def: AdditionDef): void {
    this.player.addition = def;
    this.runner.cancel(); // never keep a running combo on the old Addition
  }

  /** Build the Addition rows from the player's unlock/level state. */
  private additionEntries(): AdditionEntry[] {
    const unlocked = this.player.unlockedAdditions();
    return this.player.additions.map((def) => ({
      def,
      unlocked: unlocked.includes(def),
      level: this.player.additionLevel(def),
      equipped: this.player.addition === def,
    }));
  }

  /** Spawn a non-canon training dummy: an immortal, inert damage-test target. */
  private spawnDummy(): void {
    this.enemies.push(new Enemy(this.scene, TRAINING_DUMMY, this.ringPosition(4)));
  }

  private spawnKnight(): void {
    this.enemies.push(new Enemy(this.scene, KNIGHT_OF_SANDORA, this.ringPosition()));
  }

  /**
   * Spawn the Commander boss on its own. (Its Power Up still triggers if Knights
   * are present and then defeated — spawn some alongside to see the scripted
   * Seles behaviour.)
   */
  private spawnCommander(): void {
    this.enemies.push(new Enemy(this.scene, COMMANDER_SELES, this.ringPosition(8)));
  }

  /** A random spawn position on a ring around the player. */
  private ringPosition(radius = 6): Vector3 {
    const angle = Math.random() * Math.PI * 2;
    const r = radius + Math.random() * 2;
    return this.player.position.add(new Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r));
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
          level: a.level,
          hp: a.hp,
          maxHp: a.maxHp,
          atb: m.gauge.fill,
          controlled,
          transformed: a.transformed,
        };
        if (controlled) {
          row.sp = a.sp;
          row.maxSp = a.maxSp;
          row.mp = a.mp;
          row.maxMp = a.maxMp;
        }
        return row;
      }),
    );

    // Attack-button lockout readout: guard disables attacking for the stance; otherwise
    // show the attack-interval "swing timer" (Addition recovery), or the ranged cadence.
    if (p.guardActive) {
      this.attackBtn?.setCooldown(p.guardRemaining / settings.combatSpeed, p.guardFraction);
    } else if (this.runner.recovering) {
      this.attackBtn?.setCooldown(this.runner.recoveryRemaining / settings.combatSpeed, this.runner.recoveryFraction);
    } else if (this.rangedCooldownT > 0) {
      this.attackBtn?.setCooldown(this.rangedCooldownT / settings.combatSpeed, this.rangedCooldownT / RANGED_COOLDOWN);
    } else {
      this.attackBtn?.setCooldown(0, 0);
    }

    // The action set swaps with the form (human: Guard/Item/Transform · Dragoon:
    // Magic/Return). Each is usable only with a full gauge and no combo running, plus its
    // own precondition; dim otherwise. Transform only appears once SP is full.
    const transformed = p.transformed;
    const ready = this.runner.gauge.isReady && !this.runner.active;

    this.guardBtn?.setVisible(!transformed);
    this.guardBtn?.setAvailable(ready && !p.guardActive);
    this.itemBtn?.setVisible(!transformed);
    this.itemBtn?.setAvailable(ready && this.hasHealItem());
    this.transformBtn?.setVisible(!transformed && p.canTransform);
    this.transformBtn?.setAvailable(ready);

    this.magicBtn?.setVisible(transformed);
    this.magicBtn?.setAvailable(ready && p.canCastMagic);
    this.revertBtn?.setVisible(transformed);
    this.revertBtn?.setAvailable(true);

    this.switchBtn?.setAvailable(this.party.length > 1);
  }

  dispose(): void {
    this.canvas?.removeEventListener("pointerdown", this.onPointerDown);
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
    this.revertBtn?.dispose();
    this.switchBtn?.dispose();
  }
}

/** Floating-damage colour: orange when boosted (weakness), blue-grey when resisted, else gold. */
function damageColor(elementMult: number): string {
  if (elementMult > 1) return "#ff9a3c";
  if (elementMult < 1) return "#9fb3d6";
  return "#ffd86b";
}
