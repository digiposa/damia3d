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
import { Enemy, type EnemyAction } from "../entities/Enemy";
import { KNIGHT_OF_SANDORA, COMMANDER_SELES } from "../data/enemies";
import {
  additionHitsPercent,
  additionMultiplier,
  additionPresses,
  type AdditionDef,
} from "../data/additions";
import { additionAttack, enemyPhysicalAttack, enemyMagicalAttack } from "../combat/formula";
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
import { type Bearer, DEFAULT_BEARER } from "../data/bearers";
import { ActionButton } from "../ui/ActionButton";
import { Button } from "../ui/Button";
import { StatsBar } from "../ui/StatsBar";
import { TimingSight } from "../ui/TimingSight";
import { SpawnMenu } from "../ui/SpawnMenu";
import { CharacterMenu } from "../ui/CharacterMenu";
import { floatingText } from "../ui/FloatingText";

/** How close the player must be to land a combo hit on an enemy. */
const PLAYER_REACH = 2.3;

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
  private player!: Player;
  private stats!: StatsBar;
  private sight!: TimingSight;
  private spawnOpenBtn!: Button;
  private spawnMenu!: SpawnMenu;
  private charBtn!: Button;
  private charMenu!: CharacterMenu;
  private bearer: Bearer = DEFAULT_BEARER;
  private attackBtn?: ActionButton;
  private guardBtn?: ActionButton;

  private enemies: Enemy[] = [];
  private runner = new AdditionRunner();
  private comboTarget?: Enemy;

  /** True while the spawn menu is open — pauses gameplay like the Options menu. */
  private paused = false;

  // Click-to-move intent (desktop).
  private moveTarget?: Vector3;
  private attackTarget?: Enemy;
  private pendingAttack = false;

  private canvas?: HTMLCanvasElement;

  enter(): void {
    this.scene.clearColor = new Color4(0.043, 0.051, 0.071, 1);

    const ambient = new HemisphericLight("ambient", new Vector3(0, 1, 0), this.scene);
    ambient.intensity = 0.65;
    ambient.groundColor = new Color3(0.1, 0.12, 0.18);

    const sun = new DirectionalLight("sun", new Vector3(-0.5, -1, -0.4), this.scene);
    sun.intensity = 0.85;

    createGround(this.scene, 40);

    this.player = new Player(this.scene, this.bearer, new Vector3(0, 0, 0));
    this.camera = new IsoCamera(this.scene, this.player.position.clone());

    // The equipped-Addition chip in the stats bar opens the System menu on Addition.
    this.stats = new StatsBar(() => this.host.openSystemMenu("addition"));
    this.sight = new TimingSight();

    // Spawn menu (Training only), opened from a button just below the gear (⚙).
    this.spawnMenu = new SpawnMenu({
      onKnight: () => this.spawnKnight(),
      onCommander: () => this.spawnCommander(),
      onResume: () => this.closeSpawnMenu(),
    });
    this.spawnOpenBtn = new Button({
      label: "🐾",
      onClick: () => this.openSpawnMenu(),
      style: {
        top: "calc(env(safe-area-inset-top, 0px) + 58px)",
        right: "calc(env(safe-area-inset-right, 0px) + 10px)",
        font: "600 18px/1 system-ui, sans-serif",
        padding: "10px 14px",
      },
    });
    // Character picker (Training/Survival): re-skin the player to another bearer.
    this.charMenu = new CharacterMenu({
      onSelect: (b) => this.setBearer(b),
      onResume: () => this.closeCharacterMenu(),
    });
    this.charBtn = new Button({
      label: "👤",
      onClick: () => this.openCharacterMenu(),
      style: {
        top: "calc(env(safe-area-inset-top, 0px) + 106px)",
        right: "calc(env(safe-area-inset-right, 0px) + 10px)",
        font: "600 18px/1 system-ui, sans-serif",
        padding: "10px 14px",
      },
    });
    // Touch devices attack with the ⚔ button (desktop attacks by clicking). The
    // 🛡 guard button is shown on both (also bound to Shift) so its cooldown is
    // always visible; it sits left of the attack button on touch.
    const touch = hasTouch();
    if (touch) this.attackBtn = new ActionButton("⚔", () => this.input.pressVirtual("Space"));
    this.guardBtn = new ActionButton("🛡", () => this.input.pressVirtual("Guard"), {
      right: touch ? "calc(env(safe-area-inset-right, 0px) + 124px)" : "calc(env(safe-area-inset-right, 0px) + 26px)",
      background: "rgba(40,90,150,0.8)",
      border: "1px solid rgba(150,190,255,0.6)",
      color: "#e6f0ff",
    });

    this.canvas = this.scene.getEngine().getRenderingCanvas() ?? undefined;
    this.canvas?.addEventListener("pointerdown", this.onPointerDown);

    this.spawnKnight();
  }

  private openSpawnMenu(): void {
    this.paused = true;
    this.spawnOpenBtn.setVisible(false);
    this.spawnMenu.show();
  }

  private closeSpawnMenu(): void {
    this.spawnMenu.hide();
    this.spawnOpenBtn.setVisible(true);
    this.paused = false;
  }

  private openCharacterMenu(): void {
    this.paused = true;
    this.charBtn.setVisible(false);
    this.charMenu.show(this.bearer.id);
  }

  private closeCharacterMenu(): void {
    this.charMenu.hide();
    this.charBtn.setVisible(true);
    this.paused = false;
  }

  /**
   * Re-skin the player to another bearer: rebuild the avatar in place (same
   * position) on the new bearer's Dragoon class, resetting transient combat
   * state. Selecting the current bearer just resumes.
   */
  private setBearer(b: Bearer): void {
    if (b.id !== this.bearer.id) {
      const pos = this.player.position.clone();
      const level = this.player.level;
      this.player.dispose();
      this.bearer = b;
      this.player = new Player(this.scene, b, pos, level);
      this.runner.cancel();
      this.comboTarget = undefined;
      this.clearNav();
    }
    this.closeCharacterMenu();
  }

  update(dt: number): void {
    // Spawn menu open: gameplay is paused (the HUD keeps its last state).
    // Game's render loop still calls input.endFrame() after this returns.
    if (this.paused) return;

    // Movement (unaffected by combat speed): joystick on touch, click-to-move
    // otherwise. Guarding roots Dart in place.
    if (!this.player.guardActive) {
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

    if (this.input.wasPressed("Space")) this.attack(this.attackTarget);
    if (this.guardPressed()) this.tryGuard();

    // Combat time scales with the Options "combat speed" setting.
    const cdt = dt * settings.combatSpeed;
    this.player.tickGuard(cdt);
    if (this.runner.tick(cdt)) this.comboTarget = undefined;
    this.updateEnemies(cdt);
    this.updateSight();

    this.refreshHud();
  }

  private guardPressed(): boolean {
    return (
      this.input.wasPressed("Guard") ||
      this.input.wasPressed("ShiftLeft") ||
      this.input.wasPressed("ShiftRight")
    );
  }

  /** Enter the Defense stance if it's off cooldown. */
  private tryGuard(): void {
    if (!this.player.guardReady) return;
    const heal = this.player.startGuard();
    this.popText(this.player.position.add(new Vector3(0, 2.2, 0)), `+${heal}`, "#9fe6a0");
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
      if (to.length() > PLAYER_REACH) {
        this.player.move(to, dt);
      } else {
        this.player.face(to);
        if (this.pendingAttack) {
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
    if (!target) return;

    const res = this.runner.press(this.player.addition);
    if (res.kind !== "started") return; // ignored (e.g. during recovery)
    this.comboTarget = target;
    this.player.face(target.position.subtract(this.player.position));
    this.applyHit(target, res.hits); // guaranteed hit 1
  }

  /** Resolve a timing-sight press against the locked combo target. */
  private resolveTimingPress(): void {
    const target = this.comboTarget;
    const add = this.player.addition;
    const res = this.runner.press(add);

    if (res.kind === "miss") {
      this.comboTarget = undefined;
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

    target.takeDamage(dmg);
    this.popText(target.headPosition, `${dmg}`, damageColor(element));

    if (!target.alive) {
      this.player.gainExp(target.def.expReward);
      this.player.gold += target.def.goldReward;
      this.popText(target.headPosition, `+${target.def.expReward} EXP`, "#9fe6a0");
      this.removeEnemy(target);
      this.runner.cancel();
      this.comboTarget = undefined;
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

  private inReach(e: Enemy): boolean {
    return Vector3.Distance(this.player.position, e.position) <= PLAYER_REACH;
  }

  private nearestInReach(): Enemy | undefined {
    let best: Enemy | undefined;
    let bestDist = PLAYER_REACH;
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
    const eq = p.addition;
    this.stats.set({
      name: p.bearer.name,
      portrait: p.bearer.portrait,
      level: p.level,
      hp: p.hp,
      maxHp: p.maxHp,
      sp: p.sp,
      maxSp: p.maxSp,
      mp: p.mp,
      maxMp: p.maxMp,
      exp: p.exp,
      nextExp: p.nextExp,
      gold: p.gold,
      additionName: eq.name,
      additionLevel: p.additionLevel(eq),
    });

    // Cooldown readout. Timers run on combat time, so convert to real seconds.
    this.guardBtn?.setCooldown(p.guardCooldownRemaining / settings.combatSpeed, p.guardCooldownFraction);
  }

  dispose(): void {
    this.canvas?.removeEventListener("pointerdown", this.onPointerDown);
    for (const e of this.enemies) e.dispose();
    this.enemies = [];
    this.stats.dispose();
    this.sight.dispose();
    this.spawnMenu.dispose();
    this.spawnOpenBtn.dispose();
    this.charMenu.dispose();
    this.charBtn.dispose();
    this.attackBtn?.dispose();
    this.guardBtn?.dispose();
  }
}

/** Floating-damage colour: orange when boosted (weakness), blue-grey when resisted, else gold. */
function damageColor(elementMult: number): string {
  if (elementMult > 1) return "#ff9a3c";
  if (elementMult < 1) return "#9fb3d6";
  return "#ffd86b";
}
