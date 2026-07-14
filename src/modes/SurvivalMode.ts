import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { ArenaCombatMode } from "./TrainingMode";
import { PartySelect } from "../ui/PartySelect";
import { selectableBearers, type Bearer } from "../data/bearers";
import { DEFAULT_GAMBIT_IDS } from "../combat/Gambit";
import { Enemy } from "../entities/Enemy";
import type { PartyMember } from "../entities/PartyMember";
import { KNIGHT_OF_SANDORA, COMMANDER_SELES } from "../data/enemies";
import { t } from "../core/i18n";

/** Local-storage key for the best (waves survived) score. */
const BEST_KEY = "damia3d.survival.best";
/** A "mini-boss" (Commander) reinforces the wave every this-many waves. */
const BOSS_EVERY = 5;
/** Per-kill chance to drop a rare reward (recruit an ally, or unlock a Dragoon Spirit). */
const REWARD_CHANCE = 0.06;

/**
 * Survival mode — endless escalating waves in the training arena, built on {@link ArenaCombatMode}.
 * The player first picks a party (1–3), then fights waves that grow in size; every {@link BOSS_EVERY}
 * waves a Commander mini-boss reinforces them. There is NO recovery between waves — HP/MP/SP persist,
 * so attrition is the challenge. A full party wipe ends the run with a Game Over showing the score
 * (waves survived + kills) and the local best. Retry re-picks a party; nothing else persists.
 */
export class SurvivalMode extends ArenaCombatMode {
  readonly name = "Survival";
  protected showDebugTools = false; // no Training spawn/level tools
  protected startFullSp = false; // earn SP (and the transform) over the waves
  protected reviveOnZero = false; // members that fall stay down until the run ends
  protected unlockDragoonOnBuild = false; // the Dragoon Spirit is a rare in-run reward, not a given

  private wave = 0;
  private kills = 0;
  private runActive = false;
  private select?: PartySelect;
  private banner?: HTMLDivElement;
  private gameOver?: HTMLDivElement;

  /** Bootstrap the party until the player picks one (super.enter builds a party immediately). */
  protected pickParty(): Bearer[] {
    return this.defaultParty();
  }

  override enter(): void {
    super.enter(); // arena, camera, atmosphere/VFX, a bootstrap party, combat UI (no debug button)
    this.buildBanner();
    // Straight into character selection (solo — allies are recruited as rare rewards).
    this.select = new PartySelect(selectableBearers(), (party) => this.beginRun(party), 1);
    this.paused = true;
    this.select.show();
  }

  /** Start (or restart) a run with the chosen party. */
  private beginRun(party: Bearer[]): void {
    this.select?.close();
    this.gameOver?.remove();
    this.gameOver = undefined;
    this.partyBearers = party;
    this.gambitIds = party.map(() => [...DEFAULT_GAMBIT_IDS]);
    this.controlledIndex = 0;
    this.buildParty();
    // Clear any leftover enemies from a previous run.
    for (const e of this.enemies) e.dispose();
    this.enemies = [];
    this.wave = 0;
    this.kills = 0;
    this.partyWiped = false;
    this.runActive = true;
    this.paused = false;
    this.spawnNextWave();
  }

  /** Spawn the next wave: escalating knights, plus a Commander every {@link BOSS_EVERY} waves. */
  private spawnNextWave(): void {
    if (!this.runActive) return;
    this.wave++;
    const isBoss = this.wave % BOSS_EVERY === 0;
    const knights = Math.min(8, 2 + Math.floor(this.wave / 2));
    for (let i = 0; i < knights; i++) {
      this.addEnemy(new Enemy(this.scene, KNIGHT_OF_SANDORA, this.ringPosition(6)));
    }
    if (isBoss) this.addEnemy(new Enemy(this.scene, COMMANDER_SELES, this.ringPosition(9)));
    this.showBanner(
      isBoss ? t("survival.miniBoss", { n: this.wave }) : t("survival.wave", { n: this.wave }),
      isBoss ? "#ff8a5c" : "#ffe08a",
    );
  }

  // --- ArenaCombatMode hooks ------------------------------------------------

  protected override onEnemiesCleared(): void {
    if (this.runActive) this.spawnNextWave(); // wave cleared → next one (no breather heal)
  }

  protected override onEnemyKilled(): void {
    if (!this.runActive) return;
    this.kills++;
    if (Math.random() < REWARD_CHANCE) this.grantRareReward();
  }

  /** Roll a rare reward: recruit a new ally, or grant a Dragoon Spirit to a member who lacks one. */
  private grantRareReward(): void {
    const canRecruit = this.party.length < 3 && this.recruitPool().length > 0;
    const locked = this.party.filter((m) => m.avatar.hp > 0 && !m.avatar.dragoonUnlocked);
    const options: ("recruit" | "dragoon")[] = [];
    if (canRecruit) options.push("recruit");
    if (locked.length) options.push("dragoon");
    if (!options.length) return;
    const pick = options[Math.floor(Math.random() * options.length)];
    if (pick === "recruit") this.recruitAlly();
    else this.grantDragoon(locked[Math.floor(Math.random() * locked.length)]);
  }

  /** Selectable bearers not already in the party (recruit candidates). */
  private recruitPool(): Bearer[] {
    const have = new Set(this.party.map((m) => m.avatar.bearer.id));
    return selectableBearers().filter((b) => !have.has(b.id));
  }

  private recruitAlly(): void {
    const pool = this.recruitPool();
    if (!pool.length) return;
    const bearer = pool[Math.floor(Math.random() * pool.length)];
    const member = this.addPartyMember(bearer);
    if (member) {
      this.showBanner(t("survival.recruited", { name: bearer.name }), "#8fe3a0");
      this.popText(member.position.add(new Vector3(0, 2.8, 0)), "★", "#8fe3a0");
    }
  }

  private grantDragoon(member: PartyMember): void {
    member.avatar.unlockDragoon();
    this.showBanner(t("survival.dragoonReward", { name: member.avatar.bearer.name }), "#ffe27a");
    this.popText(member.position.add(new Vector3(0, 2.8, 0)), "✦", "#ffe27a");
  }

  protected override onMemberDowned(member: PartyMember): void {
    this.popText(member.position.add(new Vector3(0, 2.6, 0)), "✖", "#ff6a6a");
    this.takeControlOfLiving(); // front the next living member (no-op if none — wipe fires next frame)
  }

  protected override onPartyWiped(): void {
    this.runActive = false;
    this.paused = true;
    const best = this.commitBest(this.wave);
    this.showGameOver(best.best, best.isNew);
  }

  // --- Score persistence ----------------------------------------------------

  private commitBest(waves: number): { best: number; isNew: boolean } {
    let best = 0;
    try {
      best = parseInt(localStorage.getItem(BEST_KEY) ?? "0", 10) || 0;
    } catch {
      best = 0;
    }
    const isNew = waves > best;
    if (isNew) {
      best = waves;
      try {
        localStorage.setItem(BEST_KEY, String(best));
      } catch {
        /* storage unavailable (private mode) — score just isn't persisted */
      }
    }
    return { best, isNew };
  }

  // --- Overlays -------------------------------------------------------------

  /** Persistent wave-announcement banner (reused; fades in/out per wave). */
  private buildBanner(): void {
    const el = document.createElement("div");
    Object.assign(el.style, {
      position: "fixed",
      top: "16%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      font: "900 34px/1 system-ui, sans-serif",
      color: "#ffe08a",
      textShadow: "0 3px 10px rgba(0,0,0,0.85)",
      pointerEvents: "none",
      userSelect: "none",
      opacity: "0",
      zIndex: "20",
    } satisfies Partial<CSSStyleDeclaration>);
    document.body.appendChild(el);
    this.banner = el;
  }

  private showBanner(text: string, color: string): void {
    const el = this.banner;
    if (!el) return;
    el.textContent = text;
    el.style.color = color;
    el.animate(
      [
        { opacity: 0, transform: "translate(-50%, -50%) scale(0.7)", offset: 0 },
        { opacity: 1, transform: "translate(-50%, -50%) scale(1)", offset: 0.2 },
        { opacity: 1, transform: "translate(-50%, -50%) scale(1)", offset: 0.75 },
        { opacity: 0, transform: "translate(-50%, -50%) scale(1.05)", offset: 1 },
      ],
      { duration: 1600, easing: "ease-out" },
    );
  }

  private showGameOver(best: number, isNew: boolean): void {
    const box = document.createElement("div");
    Object.assign(box.style, {
      position: "fixed",
      inset: "0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      background: "linear-gradient(180deg, rgba(20,6,6,0.9), rgba(4,4,8,0.96))",
      color: "#eafaef",
      zIndex: "42",
      font: "600 16px/1.3 system-ui, sans-serif",
      textAlign: "center",
      padding: "20px",
    } satisfies Partial<CSSStyleDeclaration>);

    const title = document.createElement("div");
    title.textContent = t("survival.gameOver");
    Object.assign(title.style, { font: "900 32px/1 system-ui, sans-serif", color: "#ff6a6a" });

    const waves = document.createElement("div");
    waves.textContent = t("survival.wavesSurvived", { n: this.wave });
    Object.assign(waves.style, { font: "800 20px/1.2 system-ui, sans-serif" });

    const kills = document.createElement("div");
    kills.textContent = t("survival.kills", { n: this.kills });

    const bestLine = document.createElement("div");
    bestLine.textContent = isNew ? t("survival.newBest") : t("survival.best", { n: best });
    Object.assign(bestLine.style, { color: isNew ? "#ffe27a" : "#9ad0ff", font: "800 16px/1.2 system-ui, sans-serif" });

    const retry = this.overlayButton(t("survival.retry"), "rgba(40,120,70,0.4)", () => {
      this.gameOver?.remove();
      this.gameOver = undefined;
      this.select?.show();
      this.paused = true; // held until a party is picked
    });
    const quit = this.overlayButton(t("survival.quit"), "rgba(80,80,96,0.4)", () => {
      this.host.openSystemMenu();
    });

    box.append(title, waves, kills, bestLine, retry, quit);
    document.body.appendChild(box);
    this.gameOver = box;
  }

  private overlayButton(label: string, bg: string, onClick: () => void): HTMLButtonElement {
    const b = document.createElement("button");
    b.textContent = label;
    Object.assign(b.style, {
      marginTop: "6px",
      width: "min(80vw, 260px)",
      padding: "12px",
      borderRadius: "11px",
      border: "1px solid rgba(255,255,255,0.25)",
      background: bg,
      color: "#eafaef",
      font: "800 16px/1 system-ui, sans-serif",
      cursor: "pointer",
    } satisfies Partial<CSSStyleDeclaration>);
    b.addEventListener("pointerup", onClick);
    return b;
  }

  override dispose(): void {
    this.select?.dispose();
    this.banner?.remove();
    this.gameOver?.remove();
    super.dispose();
  }
}
