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
import { Enemy } from "../entities/Enemy";
import { KNIGHT_OF_SANDORA } from "../data/enemies";
import { additionHitsPercent, additionMultiplier } from "../data/additions";
import { additionAttack, enemyPhysicalAttack } from "../combat/formula";
import { AdditionRunner } from "../combat/AdditionRunner";
import { DebugOverlay } from "../ui/DebugOverlay";
import { ActionButton } from "../ui/ActionButton";
import { Button } from "../ui/Button";
import { PlayerHud } from "../ui/PlayerHud";
import { floatingText } from "../ui/FloatingText";

/** How close Dart must be to land a combo hit on an enemy. */
const PLAYER_REACH = 2.3;

/**
 * Training arena: a Diablo-style real-time hack-and-slash sandbox with
 * LoD-faithful attacks. Desktop uses click-to-move (click an enemy to approach
 * and strike it); mobile uses the joystick. Knights of Sandora are spawned one
 * at a time from a button. Attacks chain the equipped Addition as a timed combo
 * (see {@link AdditionRunner}); per-hit damage comes from the LoD formula.
 */
export class TrainingMode extends GameMode {
  readonly name = "Training";

  private camera!: IsoCamera;
  private player!: Player;
  private overlay!: DebugOverlay;
  private hud!: PlayerHud;
  private spawnBtn!: Button;
  private attackBtn?: ActionButton;

  private enemies: Enemy[] = [];
  private runner = new AdditionRunner();
  private comboTarget?: Enemy;

  // Click-to-move intent (desktop).
  private moveTarget?: Vector3;
  private attackTarget?: Enemy;
  private pendingAttack = false;

  private log = "";
  private canvas?: HTMLCanvasElement;

  enter(): void {
    this.scene.clearColor = new Color4(0.043, 0.051, 0.071, 1);

    const ambient = new HemisphericLight("ambient", new Vector3(0, 1, 0), this.scene);
    ambient.intensity = 0.65;
    ambient.groundColor = new Color3(0.1, 0.12, 0.18);

    const sun = new DirectionalLight("sun", new Vector3(-0.5, -1, -0.4), this.scene);
    sun.intensity = 0.85;

    createGround(this.scene, 40);

    this.player = new Player(this.scene, new Vector3(0, 0, 0));
    this.camera = new IsoCamera(this.scene, this.player.position.clone());

    this.overlay = new DebugOverlay();
    this.hud = new PlayerHud();
    this.spawnBtn = new Button({
      label: "🛡 Spawn Knight",
      onClick: () => this.spawnKnight(),
      style: { top: "calc(env(safe-area-inset-top, 0px) + 10px)", left: "50%", transform: "translateX(-50%)" },
    });
    // Touch devices attack with the ⚔ button; desktop attacks by clicking.
    if (hasTouch()) this.attackBtn = new ActionButton("⚔", () => this.input.pressVirtual("Space"));

    this.canvas = this.scene.getEngine().getRenderingCanvas() ?? undefined;
    this.canvas?.addEventListener("pointerdown", this.onPointerDown);

    this.spawnKnight();
  }

  update(dt: number): void {
    // Movement (unaffected by combat speed): joystick on touch, click-to-move otherwise.
    const axis = this.input.axis();
    if (axis.x !== 0 || axis.y !== 0) {
      const dir = this.camera.groundForward.scale(axis.y).add(this.camera.groundRight.scale(axis.x));
      this.player.move(dir, dt);
      this.clearNav();
    } else {
      this.navigate(dt);
    }
    this.camera.follow(this.player.position);

    if (this.input.wasPressed("Space")) this.attack(this.attackTarget);

    // Combat time scales with the Options "combat speed" setting.
    const cdt = dt * settings.combatSpeed;
    this.runner.tick(cdt);
    if (!this.runner.active) this.comboTarget = undefined;
    this.updateEnemies(cdt);

    this.refreshHud();
  }

  // --- Navigation (desktop click-to-move) ----------------------------------

  private onPointerDown = (e: PointerEvent): void => {
    if (hasTouch()) {
      this.input.pressVirtual("Space"); // tap = attack nearest in reach
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

  /** Chain the equipped Addition against a target, applying LoD-formula damage. */
  private attack(preferred?: Enemy): void {
    let target: Enemy | undefined;
    if (this.runner.active) target = this.comboTarget;
    else if (preferred && preferred.alive && this.inReach(preferred)) target = preferred;
    else target = this.nearestInReach();

    if (!target || !target.alive) {
      this.runner.cancel();
      this.comboTarget = undefined;
      return;
    }

    this.player.face(target.position.subtract(this.player.position));

    const add = this.player.addition;
    const out = this.runner.press(add);
    if (out.started) this.comboTarget = target;
    if (!out.landed) return;

    // Per-hit damage = the Addition formula's running total minus the previous
    // hits' total, so the combo's sum equals a perfect Addition.
    const atk = { at: this.player.stats.at, lv: this.player.level };
    const df = target.def.stats.df;
    const mult = additionMultiplier(add, 1);
    const before =
      out.hits > 1 ? additionAttack(atk, df, additionHitsPercent(add, out.hits - 1), mult) : 0;
    const now = additionAttack(atk, df, additionHitsPercent(add, out.hits), mult);
    const dmg = Math.max(1, now - before);

    target.takeDamage(dmg);
    this.popText(target.position.add(new Vector3(0, 2.6, 0)), `${dmg}`, "#ffd86b");

    if (!target.alive) {
      this.player.gainExp(target.def.expReward);
      this.log = `${target.def.name} vaincu · +${target.def.expReward} EXP`;
      this.removeEnemy(target);
      this.runner.cancel();
      this.comboTarget = undefined;
    } else if (out.completed) {
      this.log = `${add.name} parfait !`;
      this.comboTarget = undefined;
    }
  }

  private updateEnemies(cdt: number): void {
    for (const enemy of this.enemies) {
      const attacked = enemy.aiUpdate(cdt, this.player.position);
      enemy.syncHud(this.scene);
      if (!attacked) continue;

      const slash = enemy.def.attacks[0];
      const dmg = enemyPhysicalAttack(enemy.def.stats.at, this.player.stats.df, slash.multiplier);
      this.player.hp = Math.max(0, this.player.hp - dmg);
      this.popText(this.player.position.add(new Vector3(0, 2.2, 0)), `${dmg}`, "#ff6b6b");

      if (this.player.hp === 0) {
        this.player.hp = this.player.stats.maxHp; // sandbox: revive instead of game-over
        this.log = "Dart est tombé — PV restaurés";
      }
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

  private spawnKnight(): void {
    const angle = Math.random() * Math.PI * 2;
    const r = 5 + Math.random() * 2;
    const pos = this.player.position.add(new Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r));
    this.enemies.push(new Enemy(this.scene, KNIGHT_OF_SANDORA, pos));
    this.log = `Knight of Sandora apparu (${this.enemies.length} en jeu)`;
  }

  private popText(world: Vector3, text: string, color: string): void {
    const p = projectToScreen(this.scene, world);
    if (p.visible) floatingText(p.x, p.y, text, color);
  }

  private refreshHud(): void {
    const combo = this.runner.current
      ? `${this.runner.current.name}  ${this.runner.hits}/${this.runner.current.hits.length}`
      : "";
    this.hud.set(this.player.hp, this.player.stats.maxHp, combo);

    const s = this.player.stats;
    this.overlay.set({
      mode: this.name,
      fps: String(Math.round(this.scene.getEngine().getFps())),
      speed: `${settings.combatSpeed}× combat`,
      "—": "—",
      Dart: `LV ${this.player.level}  EXP ${this.player.exp}`,
      stats: `AT ${s.at} DF ${s.df} MAT ${s.mat} MDF ${s.mdf}`,
      enemies: String(this.enemies.length),
      log: this.log,
    });
  }

  dispose(): void {
    this.canvas?.removeEventListener("pointerdown", this.onPointerDown);
    for (const e of this.enemies) e.dispose();
    this.enemies = [];
    this.overlay.dispose();
    this.hud.dispose();
    this.spawnBtn.dispose();
    this.attackBtn?.dispose();
  }
}
