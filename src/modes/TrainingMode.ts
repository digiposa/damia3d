import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import "@babylonjs/core/Meshes/meshBuilder";

import { GameMode } from "../core/GameMode";
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
import { PlayerHud } from "../ui/PlayerHud";
import { floatingText } from "../ui/FloatingText";

/** How close Dart must be to start a combo on an enemy. */
const PLAYER_REACH = 2.3;
/** Enemies spawned per wave. */
const WAVE_SIZE = 3;

/**
 * Sandbox / arena mode: a Diablo-style real-time hack-and-slash against waves of
 * Knights of Sandora, but with LoD-faithful attacks. Pressing attack chains the
 * equipped Addition as a timed combo (see {@link AdditionRunner}); damage per
 * landed hit comes straight from the LoD Addition formula. Enemies chase and
 * strike back; clearing a wave spawns a tougher one and grants EXP.
 */
export class TrainingMode extends GameMode {
  readonly name = "Training";

  private camera!: IsoCamera;
  private player!: Player;
  private overlay!: DebugOverlay;
  private hud!: PlayerHud;
  private attackBtn!: ActionButton;

  private enemies: Enemy[] = [];
  private runner = new AdditionRunner();
  private comboTarget?: Enemy;
  private wave = 0;
  private log = "";
  private canvas?: HTMLCanvasElement;
  private onCanvasDown = () => this.input.pressVirtual("Space");

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
    this.attackBtn = new ActionButton("⚔", () => this.input.pressVirtual("Space"));

    // Click / tap on the world also attacks (Diablo-style); UI buttons sit on
    // top of the canvas so they don't trigger this.
    this.canvas = this.scene.getEngine().getRenderingCanvas() ?? undefined;
    this.canvas?.addEventListener("pointerdown", this.onCanvasDown);

    this.spawnWave();
  }

  update(dt: number): void {
    const { x, y } = this.input.axis();
    const dir = this.camera.groundForward.scale(y).add(this.camera.groundRight.scale(x));
    this.player.move(dir, dt);
    this.camera.follow(this.player.position);

    if (this.input.wasPressed("Space")) this.attack();
    this.runner.tick(dt);
    if (!this.runner.active) this.comboTarget = undefined;

    this.updateEnemies(dt);
    if (this.enemies.length === 0) this.spawnWave();

    this.refreshHud();
  }

  /** Resolve a combo press: chain the equipped Addition and damage the target. */
  private attack(): void {
    const target = this.runner.active ? this.comboTarget : this.nearestInReach();
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

    // Per-hit damage = the Addition formula's running total minus what the
    // previous hits already dealt, so the combo's sum equals a perfect Addition.
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

  private updateEnemies(dt: number): void {
    for (const enemy of this.enemies) {
      const attacked = enemy.aiUpdate(dt, this.player.position);
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
    enemy.dispose();
  }

  private spawnWave(): void {
    this.wave += 1;
    const count = WAVE_SIZE + Math.min(this.wave - 1, 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random();
      const r = 7 + Math.random() * 3;
      const pos = this.player.position.add(new Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r));
      this.enemies.push(new Enemy(this.scene, KNIGHT_OF_SANDORA, pos));
    }
    this.log = `Vague ${this.wave} — ${count} Knights of Sandora`;
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
      wave: String(this.wave),
      "—": "—",
      Dart: `LV ${this.player.level}  EXP ${this.player.exp}`,
      stats: `AT ${s.at} DF ${s.df} MAT ${s.mat} MDF ${s.mdf}`,
      enemies: String(this.enemies.length),
      log: this.log,
    });
  }

  dispose(): void {
    this.canvas?.removeEventListener("pointerdown", this.onCanvasDown);
    for (const e of this.enemies) e.dispose();
    this.enemies = [];
    this.overlay.dispose();
    this.hud.dispose();
    this.attackBtn.dispose();
  }
}
