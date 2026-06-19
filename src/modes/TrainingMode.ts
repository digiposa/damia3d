import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import "@babylonjs/core/Meshes/meshBuilder";

import { GameMode } from "../core/GameMode";
import { IsoCamera } from "../world/IsoCamera";
import { createGround } from "../world/Ground";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { KNIGHT_OF_SANDORA } from "../data/enemies";
import { physicalAttack, enemyPhysicalAttack } from "../combat/formula";
import { DebugOverlay } from "../ui/DebugOverlay";
import { ActionButton } from "../ui/ActionButton";

/** Distance (world units) within which Dart can strike the enemy. */
const ATTACK_RANGE = 2.2;
/** Seconds before a fresh Knight spawns after one is defeated. */
const RESPAWN_DELAY = 1.5;

/**
 * Sandbox mode for development and debugging: an isometric grid the player walks
 * around on, plus a live debug overlay and a minimal melee loop against a Knight
 * of Sandora using the real LoD damage formulas. This is where new systems
 * (combat, Additions, abilities) get wired up before reaching Story/Survival.
 */
export class TrainingMode extends GameMode {
  readonly name = "Training";

  private camera!: IsoCamera;
  private player!: Player;
  private enemy?: Enemy;
  private overlay!: DebugOverlay;
  private attackBtn!: ActionButton;

  private log = "";
  private respawnTimer = 0;

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

    this.spawnEnemy();

    this.overlay = new DebugOverlay();
    // Touch/click "Attack" button mirrors the Space key.
    this.attackBtn = new ActionButton("⚔", () => this.input.pressVirtual("Space"));
  }

  update(dt: number): void {
    const { x, y } = this.input.axis();
    // Screen-relative movement: combine camera forward/right by the input axis.
    const dir = this.camera.groundForward.scale(y).add(this.camera.groundRight.scale(x));
    this.player.move(dir, dt);
    this.camera.follow(this.player.position);

    if (this.input.wasPressed("Space")) this.tryAttack();

    if (!this.enemy) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) this.spawnEnemy();
    }

    this.refreshOverlay();
  }

  /** Dart strikes the Knight if in range; the survivor counters with Sword Slash. */
  private tryAttack(): void {
    const enemy = this.enemy;
    if (!enemy) return;

    const dist = Vector3.Distance(this.player.position, enemy.position);
    if (dist > ATTACK_RANGE) {
      this.log = "Trop loin — approche le Knight";
      return;
    }

    const dmg = physicalAttack(
      { at: this.player.stats.at, lv: this.player.level },
      enemy.def.stats.df,
    );
    enemy.takeDamage(dmg);
    this.log = `Dart inflige ${dmg} (Attaque)`;

    if (!enemy.alive) {
      this.player.gainExp(enemy.def.expReward);
      this.log += ` — ${enemy.def.name} vaincu ! +${enemy.def.expReward} EXP`;
      enemy.dispose();
      this.enemy = undefined;
      this.respawnTimer = RESPAWN_DELAY;
      return;
    }

    // Counter-attack: the Knight's basic Sword Slash against Dart's DF.
    const slash = enemy.def.attacks[0];
    const back = enemyPhysicalAttack(enemy.def.stats.at, this.player.stats.df, slash.multiplier);
    this.player.hp = Math.max(0, this.player.hp - back);
    this.log += ` · ${enemy.def.name} riposte ${slash.name} ${back}`;
    if (this.player.hp === 0) {
      this.player.hp = this.player.stats.maxHp; // sandbox: revive instead of game-over
      this.log += " · Dart est tombé — PV restaurés";
    }
  }

  private spawnEnemy(): void {
    const angle = Math.random() * Math.PI * 2;
    const r = 5 + Math.random() * 3;
    const pos = new Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r);
    this.enemy = new Enemy(this.scene, KNIGHT_OF_SANDORA, pos);
  }

  private refreshOverlay(): void {
    const fps = Math.round(this.scene.getEngine().getFps());
    const p = this.player.position;
    const s = this.player.stats;
    const e = this.enemy;
    this.overlay.set({
      mode: this.name,
      fps: String(fps),
      pos: `${p.x.toFixed(1)}, ${p.z.toFixed(1)}`,
      "—": "—",
      Dart: `LV ${this.player.level}  HP ${this.player.hp}/${s.maxHp}  EXP ${this.player.exp}`,
      stats: `AT ${s.at} DF ${s.df} MAT ${s.mat} MDF ${s.mdf}`,
      enemy: e ? `${e.def.name} (${e.def.element})` : "— (respawn…)",
      "enemy HP": e ? `${e.hp}/${e.def.stats.maxHp}` : "—",
      log: this.log,
    });
  }

  dispose(): void {
    this.overlay.dispose();
    this.attackBtn.dispose();
    this.enemy?.dispose();
  }
}
