import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { ArenaCombatMode } from "./TrainingMode";
import { Enemy } from "../entities/Enemy";
import { Humanoid, type HumanoidOptions } from "../entities/humanoid";
import type { PartyMember } from "../entities/PartyMember";
import type { EnemyDef } from "../data/enemies";
import { bearerById, type Bearer } from "../data/bearers";
import type { ItemDef } from "../data/items";
import { t } from "../core/i18n";
import { DialogueBox } from "../ui/DialogueBox";
import { EncounterMeter, meterAnchor } from "../ui/EncounterMeter";
import { Fader } from "../ui/Fader";
import { InteractPrompt } from "../ui/InteractPrompt";
import { SpeechBubble } from "../ui/SpeechBubble";
import { MAPS } from "../story/maps";
import { hasFlag, itemDef, saveStory, setFlag, story } from "../story/state";
import type { BattleUnit, NpcHandle, StoryApi, StoryMap } from "../story/StoryMap";
import type { World } from "../world/World";

/** Average distance walked between encounters = DISTANCE_PER_RATE / rate (rate 14 → ~21 units). */
const DISTANCE_PER_RATE = 300;
/** How far from the hero a random formation appears: just past the edge of the view. */
const SPAWN_DIST = 11;

interface Trigger {
  at: Vector3;
  radius: number;
  run: () => Promise<void> | void;
  when?: () => boolean;
  done: boolean;
}
interface Interactable {
  at: Vector3;
  label: string;
  act: () => Promise<void> | void;
  when?: () => boolean;
  reach: number;
}
interface Sign {
  at: Vector3;
  radius: number;
  title: string;
  text: string;
}
interface Npc {
  fig: Humanoid;
  root: TransformNode;
  walk?: { to: Vector3; speed: number; done: () => void };
}

/**
 * Story mode — the campaign, map by map. The current map and everything the party owns live in
 * the save ({@link story}); a map change rebuilds the scene with the next map. Each map brings its
 * own World and a script written against {@link StoryApi}: dialogue, scenes, NPCs, chests, scripted
 * fights, exits. Random encounters follow the canon distance counter where the map has them.
 *
 * Still a POC: the debug menu stays available.
 */
export class StoryMode extends ArenaCombatMode {
  readonly name: string = "Story";

  private map!: StoryMap;
  private api!: StoryApi;
  private readonly mapId = story().map;
  private readonly entry = story().entry;

  private dialogue?: DialogueBox;
  private fader?: Fader;
  private bubble?: SpeechBubble;
  private prompt?: InteractPrompt;
  private meter?: EncounterMeter;

  private triggers: Trigger[] = [];
  private interactables: Interactable[] = [];
  private signs: Sign[] = [];
  private npcs: Npc[] = [];
  private staged: Enemy[] = [];
  private waits: { until: () => boolean; done: () => void }[] = [];
  /** A script is running (one at a time). */
  private busy = false;
  private started = false;
  private offer?: () => void;
  private signShown?: Sign;

  // Random encounters (canon distance counter).
  private walked = 0;
  private nextAt = 0;
  private lastPos?: Vector3;

  // --- Setup ---------------------------------------------------------------------------------

  protected override createWorld(): World {
    const build = MAPS[this.mapId] ?? MAPS.seles;
    this.map = build(this.scene);
    this.api = this.makeApi();
    this.dialogue = new DialogueBox();
    this.fader = new Fader(true); // opens on black, faded in once the map is ready
    this.bubble = new SpeechBubble(this.scene);
    this.prompt = new InteractPrompt(this.scene, () => this.offer?.());
    this.meter = new EncounterMeter(this.scene);
    return this.map.world;
  }

  protected override pickParty(): Bearer[] {
    const s = story();
    this.partyLevel = s.level;
    this.gold = s.gold;
    const party = s.party.map((id) => bearerById(id)).filter((b): b is Bearer => !!b);
    return party.length ? party : this.defaultParty().slice(0, 1);
  }

  protected override initialItems(): { def: ItemDef; count: number }[] {
    const out: { def: ItemDef; count: number }[] = [];
    for (const { id, count } of story().items) {
      const def = itemDef(id);
      if (def && count > 0) out.push({ def, count });
    }
    return out;
  }

  protected override extraModels(): string[] {
    return this.map?.models ?? [];
  }

  override enter(): void {
    super.enter();
    // Stand the party at the map's entry point.
    const at = this.map.entries[this.entry] ?? Object.values(this.map.entries)[0] ?? Vector3.Zero();
    this.party.forEach((m, i) => {
      const p = at.add(this.formationOffset(i));
      this.world.clamp(p);
      m.position.copyFrom(p);
    });
    this.camera.follow(this.player.position, 1);
  }

  protected override onAssetsReady(): void {
    this.paused = false;
    if (this.started) return;
    this.started = true;
    void this.fader?.fade(0, 0.8);
    this.map.start(this.api, this.entry);
  }

  // --- Frame ---------------------------------------------------------------------------------

  override update(dt: number): void {
    // Dialogue: Space / Enter / E finish or close the line (taps are handled by the box).
    if (this.dialogue?.isOpen && ["Space", "Enter", "KeyE"].some((k) => this.input.wasPressed(k))) this.dialogue.advance();
    super.update(dt);
    if (this.paused) return;
    this.updateNpcs(dt);
    for (const w of [...this.waits]) {
      if (w.until()) {
        this.waits.splice(this.waits.indexOf(w), 1);
        w.done();
      }
    }
    if (!this.busy && !this.inputLocked) {
      this.runTriggers();
      this.updateEncounters(dt);
    } else {
      this.meter?.update(dt, meterAnchor(this.player.position), null);
    }
    this.updateInteract(dt);
    this.updateSigns();
  }

  private runTriggers(): void {
    const p = this.player.position;
    for (const tr of this.triggers) {
      if (tr.done || Math.hypot(p.x - tr.at.x, p.z - tr.at.z) > tr.radius) continue;
      if (tr.when && !tr.when()) continue;
      tr.done = true;
      void this.runScript(tr.run);
      return;
    }
  }

  /** Run one script at a time; the controls come back when it ends. */
  private async runScript(run: () => Promise<void> | void): Promise<void> {
    this.busy = true;
    try {
      await run();
    } finally {
      this.busy = false;
      this.unlock();
    }
  }

  private updateInteract(dt: number): void {
    if (!this.prompt) return;
    const p = this.player.position;
    let best: { d: number; it: Interactable } | undefined;
    if (!this.busy && !this.inputLocked && !this.enemies.some((e) => e.alive)) {
      for (const it of this.interactables) {
        if (it.when && !it.when()) continue;
        const d = Math.hypot(p.x - it.at.x, p.z - it.at.z);
        if (d < it.reach && (!best || d < best.d)) best = { d, it };
      }
    }
    if (!best) {
      this.offer = undefined;
      this.prompt.hide();
      return;
    }
    const it = best.it;
    this.offer = () => void this.runScript(it.act);
    this.prompt.show(it.at.add(new Vector3(0, 1.6, 0)), it.label);
    this.prompt.update(dt);
    if (this.input.wasPressed("KeyE")) this.offer();
  }

  private updateSigns(): void {
    if (!this.bubble) return;
    const p = this.player.position;
    const sign = this.busy ? undefined : this.signs.find((s) => Math.hypot(p.x - s.at.x, p.z - s.at.z) < s.radius);
    if (sign) this.bubble.show(p.add(new Vector3(0, 2.2, 0)), sign.title, sign.text);
    else if (this.signShown) this.bubble.hide();
    this.signShown = sign;
  }

  private updateNpcs(dt: number): void {
    for (const n of this.npcs) {
      let moving = false;
      if (n.walk) {
        const to = n.walk.to.subtract(n.root.position);
        to.y = 0;
        const d = to.length();
        if (d < 0.1) {
          const done = n.walk.done;
          n.walk = undefined;
          done();
        } else {
          const step = Math.min(d, n.walk.speed * dt);
          n.root.position.addInPlace(to.scale(step / d));
          n.root.rotation.y = Math.atan2(to.x, to.z);
          moving = true;
        }
      }
      n.fig.update(dt, moving);
    }
  }

  // --- Random encounters ---------------------------------------------------------------------

  private rollNext(): void {
    const rate = this.map.encounterAt?.(this.player.position)?.rate ?? 10;
    this.walked = 0;
    this.nextAt = (DISTANCE_PER_RATE / rate) * (0.7 + Math.random() * 0.6);
  }

  private updateEncounters(dt: number): void {
    const p = this.player.position;
    const table = this.map.encounterAt?.(p);
    const fighting = this.enemies.some((e) => e.alive);
    if (!table) {
      this.meter?.update(dt, meterAnchor(p), null);
      this.lastPos = p.clone();
      return;
    }
    if (!this.nextAt) this.rollNext();
    if (this.lastPos && !fighting) {
      const step = Math.hypot(p.x - this.lastPos.x, p.z - this.lastPos.z);
      if (step < 2) this.walked += step; // (a teleport / respawn doesn't count)
    }
    this.lastPos = p.clone();
    this.meter?.update(dt, meterAnchor(p), fighting ? null : Math.min(1, this.walked / this.nextAt));
    if (!fighting && this.walked >= this.nextAt) {
      void this.spawnFormation(table.formations[(Math.random() * table.formations.length) | 0]);
      this.rollNext();
    }
  }

  /** Bring a formation in from just past the edge of the view, on walkable ground. */
  private async spawnFormation(group: EnemyDef[]): Promise<void> {
    for (const def of group) await this.ensureEnemyAssets(def);
    if (this.scene.isDisposed) return;
    const p = this.player.position;
    let at = p.clone();
    for (let k = 0; k < 16; k++) {
      const a = Math.random() * Math.PI * 2;
      const c = p.add(new Vector3(Math.cos(a) * SPAWN_DIST, 0, Math.sin(a) * SPAWN_DIST));
      this.world.clamp(c);
      if (Math.hypot(c.x - p.x, c.z - p.z) > SPAWN_DIST * 0.6) {
        at = c;
        break;
      }
    }
    group.forEach((def, i) => {
      const a = (i / group.length) * Math.PI * 2;
      const pos = at.add(new Vector3(Math.cos(a) * 1.4, 0, Math.sin(a) * 1.4));
      this.world.clamp(pos);
      this.addEnemy(new Enemy(this.scene, def, pos));
    });
  }

  /** Charm Potion out of battle: the next random encounter starts its count from zero again. */
  protected override onCharmOutOfBattle(m: PartyMember): void {
    this.rollNext();
    this.popText(m.position.add(new Vector3(0, 2.6, 0)), t("story.charm.reset"), "#9fd0ff");
  }

  // --- The script API ------------------------------------------------------------------------

  private lock(): void {
    this.inputLocked = true;
    this.clearNav();
  }

  private unlock(): void {
    this.inputLocked = false;
    this.scriptWalk = undefined;
  }

  private waitUntil(until: () => boolean): Promise<void> {
    return new Promise((done) => this.waits.push({ until, done }));
  }

  private addItem(def: ItemDef, count = 1): void {
    const stock = this.items.find((s) => s.def.id === def.id);
    if (stock) stock.count += count;
    else this.items.push({ def, count });
  }

  /** Copy what the party owns back into the save. */
  private syncState(): void {
    const s = story();
    s.gold = this.gold;
    s.level = this.partyLevel;
    s.items = this.items.filter((i) => i.count > 0).map((i) => ({ id: i.def.id, count: i.count }));
  }

  private makeApi(): StoryApi {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const mode = this; // the getters below need the mode, not the API object
    const wait = (seconds: number): Promise<void> => {
      let elapsed = 0;
      return this.waitUntil(() => (elapsed += this.scene.getEngine().getDeltaTime() / 1000) >= seconds);
    };
    return {
      scene: this.scene,
      get hero(): Vector3 {
        return mode.player.position;
      },
      lock: () => this.lock(),
      unlock: () => this.unlock(),
      say: (speaker, text) => this.dialogue!.say(speaker, text),
      wait,
      fade: (to, seconds) => this.fader!.fade(to, seconds),
      walkHero: (to) => {
        this.lock();
        this.scriptWalk = to.clone();
        return this.waitUntil(() => !this.scriptWalk);
      },
      npc: (name, at, look) => this.spawnNpc(name, at, look),
      stage: (units) => this.stage(units),
      battle: async (units) => {
        if (units) this.stage(units);
        const foes = this.staged;
        this.staged = [];
        for (const e of foes) e.held = false;
        this.unlock();
        await this.waitUntil(() => foes.every((e) => !e.alive));
        await wait(1); // let the last one fall
        this.lock();
      },
      trigger: (at, radius, run, when) => this.triggers.push({ at, radius, run, when, done: false }),
      interact: (at, label, act, when, reach = 2.2) => this.interactables.push({ at, label, act, when, reach }),
      chest: (id, at, loot, onOpen) => {
        const flag = `chest:${this.mapId}:${id}`;
        if (hasFlag(flag)) onOpen?.();
        this.interactables.push({
          at,
          label: t("story.interact.open"),
          when: () => !hasFlag(flag),
          reach: 1.9,
          act: () => {
            setFlag(flag);
            onOpen?.();
            let label = "";
            if (loot.item) {
              this.addItem(loot.item);
              label = t(loot.item.nameKey);
            } else if (loot.gold) {
              this.gold += loot.gold;
              label = t("story.chest.gold", { n: loot.gold });
            }
            const text = t("story.chest.found", { item: label });
            this.popText(at.add(new Vector3(0, 1.2, 0)), text, "#f0d070", true);
            this.combatLog?.push(text, "#f0d070");
          },
        });
      },
      sign: (at, radius, title, text) => this.signs.push({ at, radius, title, text }),
      goto: (map, entry) => this.gotoMap(map, entry),
      hasFlag,
      setFlag,
      addItem: (item, count) => this.addItem(item, count),
      get gold(): number {
        return mode.gold;
      },
      addGold: (n) => {
        this.gold += n;
      },
      spend: (n) => {
        if (this.gold < n) return false;
        this.gold -= n;
        return true;
      },
      owned: (item) => this.items.find((s) => s.def.id === item.id)?.count ?? 0,
      pop: (at, text, color = "#f0d070") => this.popText(at, text, color, true),
      setPaused: (on) => {
        this.paused = on;
      },
      resetEncounters: () => this.rollNext(),
    };
  }

  private stage(units: BattleUnit[]): void {
    for (const u of units) {
      const pos = u.at.clone();
      this.world.clamp(pos);
      const e = new Enemy(this.scene, u.def, pos);
      e.held = true;
      this.staged.push(e);
      this.addEnemy(e);
    }
  }

  private spawnNpc(name: string, at: Vector3, look?: Partial<HumanoidOptions>): NpcHandle {
    const root = new TransformNode(`npc:${name}`, this.scene);
    root.position.copyFrom(at);
    const fig = new Humanoid(this.scene, { color: [0.45, 0.38, 0.3], hair: "short", ...look });
    fig.rig.parent = root;
    for (const m of root.getChildMeshes()) m.isPickable = false;
    const npc: Npc = { fig, root };
    this.npcs.push(npc);
    return {
      get position() {
        return root.position;
      },
      get head() {
        return root.position.add(new Vector3(0, 2.1, 0));
      },
      walkTo: (to, speed = 2.2) =>
        new Promise<void>((done) => {
          npc.walk = { to: to.clone(), speed, done };
        }),
      face: (p) => {
        root.rotation.y = Math.atan2(p.x - root.position.x, p.z - root.position.z);
      },
      setVisible: (on) => root.setEnabled(on),
      setLying: (on) => {
        fig.rig.rotation.x = on ? -Math.PI / 2 : 0;
        fig.rig.position.y = on ? 0.18 : 0;
      },
    };
  }

  /** Leave for another map: fade out, save, rebuild the scene with the next map. */
  private async gotoMap(map: string, entry: string): Promise<void> {
    this.lock();
    await this.fader?.fade(1, 0.6);
    this.syncState();
    const s = story();
    s.map = map;
    s.entry = entry;
    saveStory();
    this.host.switchMode((sc, i, h) => new StoryMode(sc, i, h));
  }

  override hasOpenMenu(): boolean {
    return !!this.dialogue?.isOpen || super.hasOpenMenu();
  }

  override closeTopMenu(): boolean {
    if (this.dialogue?.isOpen) return true; // a line must be read, not dismissed by Escape
    return super.closeTopMenu();
  }

  override dispose(): void {
    this.syncState();
    saveStory();
    this.dialogue?.dispose();
    this.fader?.dispose();
    this.bubble?.dispose();
    this.prompt?.dispose();
    this.meter?.dispose();
    super.dispose();
  }
}
