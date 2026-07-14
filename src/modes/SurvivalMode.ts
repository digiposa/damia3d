import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { ArenaCombatMode } from "./TrainingMode";
import { PartySelect } from "../ui/PartySelect";
import { RewardCards, type RewardCard } from "../ui/RewardCards";
import { selectableBearers, type Bearer } from "../data/bearers";
import { DEFAULT_GAMBIT_IDS } from "../combat/Gambit";
import { Enemy } from "../entities/Enemy";
import type { PartyMember } from "../entities/PartyMember";
import { KNIGHT_OF_SANDORA, COMMANDER_SELES } from "../data/enemies";
import { HEALING_POTION, ATTACK_ITEM_BY_ID, type ItemDef } from "../data/items";
import { t } from "../core/i18n";

/** Local-storage key for the best (waves survived) score. */
const BEST_KEY = "damia3d.survival.best";
/** A "mini-boss" (Commander) reinforces the wave every this-many waves. */
const BOSS_EVERY = 5;
/** How many reward cards to offer on a level-up. */
const CARDS_PER_LEVEL = 3;

/**
 * Survival mode — endless escalating waves in the training arena, built on {@link ArenaCombatMode}.
 * You start with ONE character (no Dragoon); kills grant shared EXP, and every level-up opens a
 * roguelite reward screen (Magic Survival style) to pick a card — recruit an ally, unlock a Dragoon
 * Spirit, heal, or restock. Waves grow in size; every {@link BOSS_EVERY} waves a Commander mini-boss
 * reinforces them. NO recovery between waves — HP/MP/SP persist, so attrition is the challenge. A
 * full party wipe ends the run with a Game Over (waves survived + kills + local best).
 */
export class SurvivalMode extends ArenaCombatMode {
  readonly name = "Survival";
  protected showDebugTools = false; // no Training spawn/level tools
  protected startFullSp = false; // earn SP (and the transform) over the waves
  protected reviveOnZero = false; // members that fall stay down until the run ends
  protected unlockDragoonOnBuild = false; // the Dragoon Spirit is a card reward, not a given
  protected shareXpWithParty = true; // canon: each living member earns the full kill EXP

  private wave = 0;
  private kills = 0;
  private runActive = false;
  private lastLevel = 1;
  private select?: PartySelect;
  private cards?: RewardCards;
  private banner?: HTMLDivElement;
  private gameOver?: HTMLDivElement;

  /** Survival starts with a lean kit (attrition!) — a few Healing Potions and two attack items,
   *  NOT the Training sampler. */
  protected initialItems(): { def: ItemDef; count: number }[] {
    return [
      { def: HEALING_POTION, count: 3 },
      { def: ATTACK_ITEM_BY_ID.get("burnOut")!, count: 2 },
      { def: ATTACK_ITEM_BY_ID.get("spinningGale")!, count: 1 },
    ];
  }

  /** Bootstrap the party until the player picks one (super.enter builds a party immediately). */
  protected pickParty(): Bearer[] {
    return this.defaultParty();
  }

  override enter(): void {
    super.enter(); // arena, camera, atmosphere/VFX, a bootstrap party, combat UI (no debug button)
    this.buildBanner();
    this.cards = new RewardCards(() => {
      this.paused = false; // resume once a card is chosen
    });
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
    this.lastLevel = this.partyLevelReached();
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
    // Kills grant shared EXP (in the base). When the party's level ticks up, open the reward screen.
    const lv = this.partyLevelReached();
    if (lv > this.lastLevel) {
      this.lastLevel = lv;
      this.offerCards(lv);
    }
  }

  /** The highest level any party member has reached (drives the level-up card trigger). */
  private partyLevelReached(): number {
    return this.party.reduce((max, m) => Math.max(max, m.avatar.level), 1);
  }

  /** Pause and offer {@link CARDS_PER_LEVEL} reward cards for the player to pick from. */
  private offerCards(level: number): void {
    const pool = this.buildRewardPool();
    if (!pool.length) return;
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Fisher–Yates shuffle
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    this.paused = true;
    this.cards?.show(t("survival.levelUp", { n: level }), pool.slice(0, CARDS_PER_LEVEL));
  }

  /** Every reward card that currently applies (situational recruit/Dragoon + always-available kit). */
  private buildRewardPool(): RewardCard[] {
    const pool: RewardCard[] = [];

    // Recruit: one card per available ally candidate (capped so the screen isn't flooded).
    if (this.party.length < 3) {
      for (const b of this.recruitPool().slice(0, 3)) {
        pool.push({
          id: `recruit:${b.id}`,
          title: t("reward.recruit", { name: b.name }),
          desc: t("reward.recruitDesc", { name: b.name }),
          icon: "🧑‍🤝‍🧑",
          color: "#8fe3a0",
          apply: () => this.recruit(b),
        });
      }
    }

    // Dragoon Spirit: one card per living member who lacks the transform.
    for (const m of this.party.filter((x) => x.avatar.hp > 0 && !x.avatar.dragoonUnlocked)) {
      pool.push({
        id: `dragoon:${m.avatar.bearer.id}`,
        title: t("reward.dragoon"),
        desc: t("reward.dragoonDesc", { name: m.avatar.bearer.name }),
        icon: "✦",
        color: "#ffe27a",
        apply: () => this.grantDragoon(m),
      });
    }

    // Stat upgrades for your leader (bonuses ON TOP of the canon level stats — not canon values).
    pool.push(this.statCard("at", 2, "reward.atk", "reward.atkDesc", "🗡️", "#ff8a5c"));
    pool.push(this.statCard("df", 2, "reward.def", "reward.defDesc", "🛡️", "#9ad0ff"));
    pool.push(this.statCard("mat", 2, "reward.mat", "reward.matDesc", "🔮", "#c9a2ff"));
    pool.push(this.statCard("hp", 25, "reward.hp", "reward.hpDesc", "🫀", "#ff6a8a"));

    // Always available: a full heal (precious given no between-wave recovery) and a supply cache.
    pool.push({
      id: "heal",
      title: t("reward.heal"),
      desc: t("reward.healDesc"),
      icon: "❤️",
      color: "#7ec8ff",
      apply: () => this.healParty(),
    });
    pool.push({
      id: "potions",
      title: t("reward.potions"),
      desc: t("reward.potionsDesc"),
      icon: "🧪",
      color: "#8fe3a0",
      apply: () => this.stock(HEALING_POTION, 3),
    });
    return pool;
  }

  /** A flat stat-bonus card applied to your leader (the controlled member). */
  private statCard(
    key: "at" | "df" | "mat" | "mdf" | "hp",
    amount: number,
    titleKey: string,
    descKey: string,
    icon: string,
    color: string,
  ): RewardCard {
    return {
      id: `stat:${key}`,
      title: t(titleKey, { n: amount }),
      desc: t(descKey, { n: amount }),
      icon,
      color,
      apply: () => {
        const a = this.controlled.avatar;
        a.addRunBonus(key, amount);
        this.popText(this.controlled.position.add(new Vector3(0, 2.8, 0)), `+${amount}`, color);
      },
    };
  }

  /** Selectable bearers not already in the party (recruit candidates). */
  private recruitPool(): Bearer[] {
    const have = new Set(this.party.map((m) => m.avatar.bearer.id));
    return selectableBearers().filter((b) => !have.has(b.id));
  }

  private recruit(bearer: Bearer): void {
    const member = this.addPartyMember(bearer);
    if (member) this.popText(member.position.add(new Vector3(0, 2.8, 0)), "★", "#8fe3a0");
  }

  private grantDragoon(member: PartyMember): void {
    member.avatar.unlockDragoon();
    this.popText(member.position.add(new Vector3(0, 2.8, 0)), "✦", "#ffe27a");
  }

  private healParty(): void {
    for (const m of this.party) {
      if (m.avatar.hp > 0) m.avatar.heal(m.avatar.maxHp);
    }
  }

  private stock(def: ItemDef, count: number): void {
    const slot = this.items.find((s) => s.def.id === def.id);
    if (slot) slot.count += count;
    else this.items.push({ def, count });
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
    this.cards?.dispose();
    this.banner?.remove();
    this.gameOver?.remove();
    super.dispose();
  }
}
