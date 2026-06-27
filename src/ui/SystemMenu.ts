import { settings } from "../core/settings";
import { hasTouch } from "../core/device";
import { t, getLocale, setLocale, LOCALES } from "../core/i18n";
import type {
  ModeMenuData,
  AdditionEntry,
  SystemSection,
  StatBreakdown,
  StatusView,
  EquipView,
  CharacterSheet,
  CharacterRosterView,
  CharacterListEntry,
} from "../core/menu";
import type { EquipSlot } from "../data/equipment";
import {
  type AdditionDef,
  additionPresses,
  additionHitsPercent,
  additionMultiplier,
} from "../data/additions";
import { gambitEntry } from "../combat/Gambit";
import { selectableBearers, bearerById } from "../data/bearers";
import { dragoonClass } from "../data/dragoonClasses";

type Section = SystemSection;

const SECTIONS: { id: Section; labelKey: string; icon: string }[] = [
  { id: "characters", labelKey: "section.characters", icon: "📊" },
  { id: "party", labelKey: "section.party", icon: "👥" },
  { id: "gambits", labelKey: "section.gambits", icon: "🧠" },
  { id: "config", labelKey: "section.config", icon: "⚙" },
];

type CharTab = "stats" | "equip" | "additions";

const COMBAT_SPEEDS = [0.5, 1, 1.5, 2];
const ZOOM_LEVELS = [1, 1.25, 1.5, 2];

export interface SystemMenuCallbacks {
  /** Live data from the active mode (Status/Addition); undefined for stub modes. */
  data: () => ModeMenuData | undefined;
  onResume: () => void;
  onMainMenu: () => void;
}

/**
 * In-game System menu in the LoD PS1 style: a left section list (Status,
 * Equipment, Addition, Config) and a right content panel. It pauses the game and
 * is the single hub for character info, equipping Additions and settings. The
 * nav shows icons only on mobile. Nav and content are rebuilt on each render so
 * a language change applies live.
 */
export class SystemMenu {
  private root: HTMLDivElement;
  private nav: HTMLDivElement;
  private content: HTMLDivElement;
  private section: Section = "characters";
  private compact = hasTouch();
  /** When opened from the title screen there is no mode: Config only, no "Main menu". */
  private atMainMenu = false;
  /** Equipment sub-state: which slot is being chosen (undefined = slot list). */
  private equipSlot?: EquipSlot;
  /** Gambits tab sub-state: which party member is being edited. */
  private gambitMember = 0;
  /** Characters tab: focused character (bearer id), the sub-tab, and roster-list mode. */
  private focusedChar?: string;
  private charTab: CharTab = "stats";
  private charListOpen = false;

  constructor(private cb: SystemMenuCallbacks) {
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      inset: "0",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      boxSizing: "border-box",
      background: "radial-gradient(120% 120% at 50% 30%, #161106e0 0%, #0b0d12f5 72%)",
      color: "#f0e6cf",
      zIndex: "40",
    } satisfies Partial<CSSStyleDeclaration>);

    const panel = document.createElement("div");
    Object.assign(panel.style, {
      display: "flex",
      gap: "14px",
      width: "min(720px, 94vw)",
      height: "min(520px, 84vh)",
      padding: "14px",
      borderRadius: "10px",
      background: "linear-gradient(180deg, #2a2310 0%, #1a1608 100%)",
      border: "2px solid #caa24a",
      boxShadow: "0 8px 40px rgba(0,0,0,0.6), inset 0 0 30px rgba(0,0,0,0.5)",
      boxSizing: "border-box",
    } satisfies Partial<CSSStyleDeclaration>);

    this.nav = document.createElement("div");
    Object.assign(this.nav.style, {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      width: this.compact ? "58px" : "168px",
      flex: "0 0 auto",
    } satisfies Partial<CSSStyleDeclaration>);

    this.content = document.createElement("div");
    Object.assign(this.content.style, {
      flex: "1",
      minWidth: "0",
      padding: "12px 14px",
      borderRadius: "8px",
      background: "rgba(12,10,5,0.6)",
      border: "1px solid #6b551f",
      overflowY: "auto",
    } satisfies Partial<CSSStyleDeclaration>);

    panel.append(this.nav, this.content);
    this.root.appendChild(panel);
    document.body.appendChild(this.root);
  }

  get isOpen(): boolean {
    return this.root.style.display !== "none";
  }

  show(atMainMenu = false, section?: Section): void {
    this.atMainMenu = atMainMenu;
    if (section) this.section = section; // clamped in render() if unavailable
    this.root.style.display = "flex";
    this.render();
  }

  hide(): void {
    this.root.style.display = "none";
  }

  dispose(): void {
    this.root.remove();
  }

  // --- Rendering ------------------------------------------------------------

  private render(): void {
    const data = this.cb.data();
    // Character tabs only exist once a mode has player state; otherwise Config only.
    let available = data ? SECTIONS : SECTIONS.filter((s) => s.id === "config");
    if (!data?.characters) available = available.filter((s) => s.id !== "characters");
    if (!data?.party) available = available.filter((s) => s.id !== "party");
    if (!data?.gambits) available = available.filter((s) => s.id !== "gambits");
    if (!available.some((s) => s.id === this.section)) this.section = available[0].id;
    if (this.charTab !== "equip") this.equipSlot = undefined;

    this.renderNav(available, data?.gold);
    this.content.replaceChildren(
      this.section === "config"
        ? this.renderConfig()
        : this.section === "party"
          ? this.renderParty(data)
          : this.section === "gambits"
            ? this.renderGambits(data)
            : this.renderCharacters(data),
    );
  }

  private renderNav(available: typeof SECTIONS, gold?: number): void {
    const items: HTMLElement[] = available.map((s) =>
      navButton(s.icon, t(s.labelKey), this.compact, () => {
        this.section = s.id;
        this.render();
      }, s.id === this.section ? "rgba(200,162,74,0.92)" : undefined, s.id === this.section),
    );

    const spacer = document.createElement("div");
    spacer.style.flex = "1";
    items.push(spacer);
    // Shared party wallet (game-wide), pinned above the Resume button.
    if (gold !== undefined) items.push(goldChip(gold, this.compact));
    items.push(
      navButton("▶", t("common.resume"), this.compact, () => this.cb.onResume(), "#2f6b3e"),
    );
    if (!this.atMainMenu) {
      items.push(
        navButton("⌂", t("common.mainMenu"), this.compact, () => this.cb.onMainMenu(), "#6b3340"),
      );
    }
    this.nav.replaceChildren(...items);
  }

  /** Characters tab: the roster list, or a focused character's sheet (Stats/Equip/Additions). */
  private renderCharacters(data?: ModeMenuData): HTMLElement {
    const c = data?.characters;
    if (!c || c.list.length === 0) return note(t("status.unavailable"));
    if (this.focusedChar === undefined || !c.list.some((e) => e.id === this.focusedChar)) {
      this.focusedChar = c.controlledId;
    }
    if (this.charListOpen) return this.renderCharList(c);

    const idx = c.list.findIndex((e) => e.id === this.focusedChar);
    const entry = c.list[idx];
    const sheet = c.sheet(this.focusedChar);
    const box = document.createElement("div");

    // Header: ‹ [portrait + name card → roster] ›, flipping through the roster.
    const goto = (delta: number): void => {
      const n = c.list.length;
      this.focusedChar = c.list[(idx + delta + n) % n].id;
      this.render();
    };
    const header = document.createElement("div");
    Object.assign(header.style, { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" } satisfies Partial<CSSStyleDeclaration>);
    header.append(
      charHeaderButton(entry, () => {
        this.charListOpen = true;
        this.render();
      }),
      arrowButton("‹", () => goto(-1)),
      arrowButton("›", () => goto(1)),
    );
    box.appendChild(header);

    // Segmented sub-tabs (single row, equal widths — no wrap).
    box.appendChild(
      segTabs(
        (["stats", "equip", "additions"] as CharTab[]).map((id) => ({ id, label: t(`char.${id}`) })),
        this.charTab,
        (tab) => {
          this.charTab = tab;
          this.equipSlot = undefined;
          this.render();
        },
      ),
    );
    box.appendChild(divider());
    box.appendChild(
      this.charTab === "stats"
        ? this.renderStatusBody(sheet.status)
        : this.charTab === "equip"
          ? this.renderEquipBody(sheet.equipment)
          : this.renderAdditionBody(sheet),
    );
    return box;
  }

  /** The whole roster, grouped by element; tap a character to open its sheet. */
  private renderCharList(c: CharacterRosterView): HTMLElement {
    const box = document.createElement("div");

    // Header bar: a back arrow (return to the focused sheet) + the title.
    const header = document.createElement("div");
    Object.assign(header.style, { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" } satisfies Partial<CSSStyleDeclaration>);
    header.append(
      arrowButton("‹", () => {
        this.charListOpen = false;
        this.render();
      }),
      heading(t("section.characters")),
    );
    box.appendChild(header);

    let currentEl: string | undefined;
    for (const e of c.list) {
      if (e.element !== currentEl) {
        currentEl = e.element;
        box.appendChild(label(e.element));
      }
      box.appendChild(
        charRow(e, e.id === this.focusedChar, () => {
          this.focusedChar = e.id;
          this.charListOpen = false;
          this.render();
        }),
      );
    }
    return box;
  }

  private renderStatusBody(s: StatusView): HTMLElement {
    const box = document.createElement("div");
    box.appendChild(heading(`LV ${s.level}`));
    box.appendChild(statLines([
      [t("stat.hp"), `${s.hp} / ${s.maxHp}`],
      [t("stat.sp"), `${s.sp} / ${s.maxSp}`],
      [t("stat.mp"), `${s.mp} / ${s.maxMp}`],
      ["SPD", `${s.speed}`],
      [t("stat.exp"), `${s.exp} / ${s.nextExp}`],
    ]));
    box.appendChild(divider());
    box.appendChild(breakdownTable(s.combat));
    if (s.gearExtras.length) {
      box.appendChild(divider());
      box.appendChild(statLines(s.gearExtras.map((e) => [e.label, `+${e.value}`])));
    }
    return box;
  }

  private renderEquipBody(equip: EquipView): HTMLElement {
    const box = document.createElement("div");

    // Slot list.
    if (!this.equipSlot) {
      for (const s of equip.slots) {
        box.appendChild(
          listRow(t(`equip.slot.${s.slot}`), s.equippedName ?? t("equip.empty"), false, true, () => {
            this.equipSlot = s.slot;
            this.render();
          }),
        );
      }
      return box;
    }

    // Item list for the chosen slot.
    box.appendChild(
      navButton("‹", t("equip.back"), false, () => {
        this.equipSlot = undefined;
        this.render();
      }),
    );
    const slot = this.equipSlot;
    box.appendChild(
      listRow(t("equip.none"), "", false, true, () => {
        equip.equip(slot, undefined);
        this.render();
      }),
    );
    for (const opt of equip.options(slot)) {
      box.appendChild(
        listRow(opt.name, opt.detail, opt.equipped, true, () => {
          equip.equip(slot, opt.id);
          this.render();
        }),
      );
    }
    return box;
  }

  private renderAdditionBody(sheet: CharacterSheet): HTMLElement {
    const box = document.createElement("div");
    if (sheet.additions.length === 0) {
      box.appendChild(note(t("addition.none")));
      return box;
    }
    for (const entry of sheet.additions) {
      box.appendChild(this.additionRow(entry, sheet.equipAddition));
    }
    return box;
  }

  private additionRow(entry: AdditionEntry, equip: (def: AdditionDef) => void): HTMLElement {
    const { def, unlocked, level, equipped } = entry;
    const el = document.createElement("button");
    el.disabled = !unlocked;
    Object.assign(el.style, {
      display: "flex",
      flexDirection: "column",
      gap: "3px",
      width: "100%",
      textAlign: "left",
      font: "700 15px/1.2 system-ui, sans-serif",
      color: unlocked ? "#f0e6cf" : "#8a7f63",
      background: equipped ? "rgba(200,162,74,0.85)" : "rgba(40,34,16,0.7)",
      border: `1px solid ${equipped ? "#ffe08a" : "#6b551f"}`,
      borderRadius: "8px",
      padding: "10px 12px",
      marginBottom: "7px",
      cursor: unlocked ? "pointer" : "default",
      opacity: unlocked ? "1" : "0.7",
      touchAction: "manipulation",
    } satisfies Partial<CSSStyleDeclaration>);

    const dam = Math.floor((additionHitsPercent(def) * additionMultiplier(def, level)) / 100);
    const sub = unlocked
      ? t("addition.sub", { presses: additionPresses(def), level, dam, sp: def.spMax })
      : t("addition.locked", { level: def.acquireLevel });
    el.innerHTML =
      `<span>${def.name}${equipped ? "  ✓" : ""}</span>` +
      `<span style="font:400 12px/1.3 ui-monospace,monospace;opacity:0.85;color:${equipped ? "#2a2310" : "inherit"}">${sub}</span>`;

    if (unlocked) {
      el.addEventListener("pointerup", (e) => {
        e.preventDefault();
        equip(def);
        this.render();
      });
    }
    return el;
  }

  private renderParty(data?: ModeMenuData): HTMLElement {
    const box = section(t("section.party"));
    const p = data?.party;
    if (!p || p.slots.length === 0) {
      box.appendChild(note(t("party.unavailable")));
      return box;
    }

    // Slot selector: portrait cards for the 3 slots (controlled member marked with a dot).
    const slots = document.createElement("div");
    Object.assign(slots.style, {
      display: "grid",
      gridTemplateColumns: `repeat(${p.slots.length}, 1fr)`,
      gap: "6px",
      marginBottom: "8px",
    } satisfies Partial<CSSStyleDeclaration>);
    p.slots.forEach((s, i) => {
      const b = bearerById(s.id);
      slots.appendChild(
        slotCard(
          b ? { name: b.name, portrait: b.portrait, color: b.color } : undefined,
          i === p.activeSlot,
          s.controlled,
          () => {
            p.selectSlot(i);
            this.render();
          },
        ),
      );
    });
    box.appendChild(slots);
    box.appendChild(hint(t("party.hint")));
    box.appendChild(divider());

    // Roster, grouped by Dragoon element. Tap a character to put it in the active slot;
    // a character already in the party shows its slot number (assigning swaps to dedupe).
    let currentClass: string | undefined;
    for (const b of selectableBearers()) {
      if (b.classId !== currentClass) {
        currentClass = b.classId;
        box.appendChild(label(dragoonClass(b.classId)?.element ?? b.classId));
      }
      const inSlot = p.slots.findIndex((s) => s.id === b.id);
      box.appendChild(
        entryRow({
          name: b.name,
          portrait: b.portrait,
          color: b.color,
          focused: inSlot === p.activeSlot,
          badgeText: inSlot >= 0 ? t("party.inSlot", { n: inSlot + 1 }) : undefined,
          onClick: () => {
            p.assign(b.id);
            this.render();
          },
        }),
      );
    }
    return box;
  }

  private renderGambits(data?: ModeMenuData): HTMLElement {
    const box = section(t("section.gambits"));
    const g = data?.gambits;
    if (!g || g.members.length === 0) {
      box.appendChild(note(t("gambit.unavailable")));
      return box;
    }
    if (this.gambitMember >= g.members.length) this.gambitMember = 0;

    // Member selector: pick whose rules to edit (the controlled member is marked ⓟ).
    box.appendChild(
      choiceRow(
        g.members.map((_, i) => i),
        this.gambitMember,
        (i) => {
          this.gambitMember = i;
          this.render();
        },
        (i) => `${g.members[i].controlled ? "ⓟ " : ""}${g.members[i].name}`,
      ),
    );

    const m = g.members[this.gambitMember];
    box.appendChild(divider());
    box.appendChild(label(t("gambit.rulesFor", { name: m.name })));
    m.rules.forEach((id, idx) => {
      box.appendChild(
        listRow(`${idx + 1}.  ${t(gambitEntry(id).labelKey)}`, "", false, true, () => {
          g.cycle(this.gambitMember, idx);
          this.render();
        }),
      );
    });
    box.appendChild(hint(t("gambit.note")));
    return box;
  }

  private renderConfig(): HTMLElement {
    const box = section(t("section.config"));

    box.append(label(t("config.language")));
    box.append(
      choiceRow(
        LOCALES.map((l) => l.id),
        getLocale(),
        (id) => {
          setLocale(id);
          this.render();
        },
        (id) => LOCALES.find((l) => l.id === id)!.label,
      ),
    );

    box.append(divider(), label(t("config.sound")));
    box.append(
      pill(settings.soundEnabled ? t("config.sound.on") : t("config.sound.off"), () => {
        settings.soundEnabled = !settings.soundEnabled;
        this.render();
      }),
    );
    box.append(slider(t("config.music"), settings.musicVolume, (v) => (settings.musicVolume = v)));
    box.append(slider(t("config.sfx"), settings.sfxVolume, (v) => (settings.sfxVolume = v)));
    box.append(hint(t("config.sound.note")));

    box.append(divider(), label(t("config.combatSpeed")));
    box.append(
      choiceRow(COMBAT_SPEEDS, settings.combatSpeed, (v) => {
        settings.combatSpeed = v;
        this.render();
      }, (v) => `${v}×`),
    );
    box.append(hint(t("config.combatSpeed.note")));

    box.append(divider(), label(t("config.zoom")));
    box.append(
      choiceRow(ZOOM_LEVELS, settings.cameraZoom, (v) => {
        settings.cameraZoom = v;
        this.render();
      }, (v) => `${v}×`),
    );
    return box;
  }
}

// --- DOM helpers ------------------------------------------------------------

function navButton(
  icon: string,
  labelText: string,
  compact: boolean,
  onClick: () => void,
  bg = "rgba(40,34,16,0.85)",
  active = false,
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.textContent = compact ? icon : `${icon}  ${labelText}`;
  btn.title = labelText;
  Object.assign(btn.style, {
    font: compact ? "20px/1 system-ui, sans-serif" : "700 15px/1 system-ui, sans-serif",
    color: active ? "#1a1608" : "#f0e6cf",
    background: bg,
    border: "1px solid #6b551f",
    borderRadius: "8px",
    padding: compact ? "12px 0" : "11px 12px",
    textAlign: compact ? "center" : "left",
    cursor: "pointer",
    touchAction: "manipulation",
  } satisfies Partial<CSSStyleDeclaration>);
  btn.style.setProperty("-webkit-tap-highlight-color", "transparent");
  btn.addEventListener("pointerup", (e) => {
    e.preventDefault();
    onClick();
  });
  return btn;
}

/** A two-line selectable row (title + sub-detail), highlighted when active. */
function listRow(
  title: string,
  sub: string,
  highlighted: boolean,
  enabled: boolean,
  onClick: () => void,
): HTMLButtonElement {
  const el = document.createElement("button");
  el.disabled = !enabled;
  Object.assign(el.style, {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    width: "100%",
    textAlign: "left",
    font: "700 15px/1.2 system-ui, sans-serif",
    color: "#f0e6cf",
    background: highlighted ? "rgba(200,162,74,0.85)" : "rgba(40,34,16,0.7)",
    border: `1px solid ${highlighted ? "#ffe08a" : "#6b551f"}`,
    borderRadius: "8px",
    padding: "10px 12px",
    marginBottom: "7px",
    cursor: enabled ? "pointer" : "default",
    touchAction: "manipulation",
  } satisfies Partial<CSSStyleDeclaration>);
  const top = document.createElement("span");
  top.textContent = title + (highlighted ? "  ✓" : "");
  el.appendChild(top);
  if (sub) {
    const s = document.createElement("span");
    s.textContent = sub;
    Object.assign(s.style, {
      font: "400 12px/1.3 ui-monospace, monospace",
      opacity: "0.85",
      color: highlighted ? "#2a2310" : "inherit",
    } satisfies Partial<CSSStyleDeclaration>);
    el.appendChild(s);
  }
  el.addEventListener("pointerup", (e) => {
    e.preventDefault();
    onClick();
  });
  return el;
}

function section(title: string): HTMLDivElement {
  const box = document.createElement("div");
  const h = document.createElement("div");
  h.textContent = title;
  Object.assign(h.style, {
    font: "800 18px/1 system-ui, sans-serif",
    color: "#ffe08a",
    marginBottom: "12px",
  } satisfies Partial<CSSStyleDeclaration>);
  box.appendChild(h);
  return box;
}

function heading(text: string): HTMLDivElement {
  const el = document.createElement("div");
  el.textContent = text;
  Object.assign(el.style, {
    font: "800 17px/1.3 system-ui, sans-serif",
    marginBottom: "8px",
  } satisfies Partial<CSSStyleDeclaration>);
  return el;
}

function statLines(rows: [string, string][]): HTMLDivElement {
  const box = document.createElement("div");
  Object.assign(box.style, {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    rowGap: "5px",
    columnGap: "16px",
    font: "13px/1.3 ui-monospace, monospace",
  } satisfies Partial<CSSStyleDeclaration>);
  for (const [k, v] of rows) {
    const key = document.createElement("div");
    key.textContent = k;
    key.style.opacity = "0.8";
    const val = document.createElement("div");
    val.textContent = v;
    val.style.textAlign = "right";
    val.style.color = "#ffe08a";
    box.append(key, val);
  }
  return box;
}

/** A Body | Gear | Total breakdown grid for the combat stats. */
function breakdownTable(rows: StatBreakdown[]): HTMLDivElement {
  const grid = document.createElement("div");
  Object.assign(grid.style, {
    display: "grid",
    gridTemplateColumns: "1fr auto auto auto",
    rowGap: "5px",
    columnGap: "16px",
    font: "13px/1.3 ui-monospace, monospace",
  } satisfies Partial<CSSStyleDeclaration>);

  const cell = (text: string, opts: { align?: string; color?: string; dim?: boolean } = {}) => {
    const el = document.createElement("div");
    el.textContent = text;
    el.style.textAlign = opts.align ?? "left";
    if (opts.color) el.style.color = opts.color;
    if (opts.dim) el.style.opacity = "0.7";
    grid.appendChild(el);
  };

  // Header
  cell("", { dim: true });
  cell(t("stat.base"), { align: "right", dim: true });
  cell(t("stat.gear"), { align: "right", dim: true });
  cell(t("stat.total"), { align: "right", dim: true });

  for (const r of rows) {
    cell(r.label, { dim: true });
    cell(String(r.base), { align: "right" });
    cell(r.gear ? `+${r.gear}` : "·", { align: "right", color: r.gear ? "#9fe6a0" : undefined, dim: !r.gear });
    cell(String(r.total), { align: "right", color: "#ffe08a" });
  }
  return grid;
}

function divider(): HTMLDivElement {
  const el = document.createElement("div");
  Object.assign(el.style, {
    height: "1px",
    background: "rgba(200,162,74,0.3)",
    margin: "12px 0",
  } satisfies Partial<CSSStyleDeclaration>);
  return el;
}

function label(text: string): HTMLDivElement {
  const el = document.createElement("div");
  el.textContent = text;
  Object.assign(el.style, {
    font: "700 14px/1 system-ui, sans-serif",
    color: "#ffe08a",
    margin: "0 0 8px",
  } satisfies Partial<CSSStyleDeclaration>);
  return el;
}

function note(text: string): HTMLDivElement {
  const el = document.createElement("div");
  el.textContent = text;
  Object.assign(el.style, {
    font: "14px/1.5 system-ui, sans-serif",
    opacity: "0.75",
  } satisfies Partial<CSSStyleDeclaration>);
  return el;
}

function hint(text: string): HTMLDivElement {
  const el = document.createElement("div");
  el.textContent = text;
  Object.assign(el.style, {
    font: "12px/1.4 ui-monospace, monospace",
    opacity: "0.55",
    margin: "8px 0 0",
  } satisfies Partial<CSSStyleDeclaration>);
  return el;
}

function pill(text: string, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.textContent = text;
  Object.assign(btn.style, {
    font: "600 14px/1 system-ui, sans-serif",
    color: "#f0e6cf",
    background: "rgba(40,34,16,0.85)",
    border: "1px solid #6b551f",
    borderRadius: "8px",
    padding: "9px 14px",
    cursor: "pointer",
    touchAction: "manipulation",
  } satisfies Partial<CSSStyleDeclaration>);
  btn.addEventListener("pointerup", (e) => {
    e.preventDefault();
    onClick();
  });
  return btn;
}

/** The shared party wallet chip for the nav rail (coin + amount; stacks when compact). */
function goldChip(gold: number, compact: boolean): HTMLDivElement {
  const el = document.createElement("div");
  Object.assign(el.style, {
    display: "flex",
    flexDirection: compact ? "column" : "row",
    alignItems: "center",
    justifyContent: "center",
    gap: compact ? "1px" : "6px",
    font: "800 13px/1.1 ui-monospace, monospace",
    color: "#ffe08a",
    background: "rgba(40,34,16,0.85)",
    border: "1px solid #6b551f",
    borderRadius: "8px",
    padding: compact ? "8px 0" : "9px 12px",
    textShadow: "0 1px 2px #000",
  } satisfies Partial<CSSStyleDeclaration>);
  const coin = document.createElement("span");
  coin.textContent = "🪙";
  const amount = document.createElement("span");
  amount.textContent = compact ? `${gold}` : `${gold} G`;
  el.append(coin, amount);
  return el;
}

/** Shared selectable row: element-colour accent + mini portrait + name + optional badge. */
function entryRow(o: {
  name: string;
  portrait?: string;
  color: [number, number, number];
  focused: boolean;
  badgeText?: string;
  badgeColor?: string;
  onClick: () => void;
}): HTMLButtonElement {
  const [cr, cg, cb] = o.color;
  const rgb = `rgb(${(cr * 255) | 0},${(cg * 255) | 0},${(cb * 255) | 0})`;
  const el = document.createElement("button");
  Object.assign(el.style, {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    textAlign: "left",
    color: o.focused ? "#1a1608" : "#f0e6cf",
    background: o.focused ? "rgba(200,162,74,0.9)" : "rgba(40,34,16,0.7)",
    border: `1px solid ${o.focused ? "#ffe08a" : "#6b551f"}`,
    borderLeft: `4px solid ${rgb}`,
    borderRadius: "8px",
    padding: "6px 9px",
    marginBottom: "6px",
    cursor: "pointer",
    touchAction: "manipulation",
  } satisfies Partial<CSSStyleDeclaration>);

  const name = document.createElement("span");
  Object.assign(name.style, {
    flex: "1",
    minWidth: "0",
    font: "700 15px/1 system-ui, sans-serif",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  } satisfies Partial<CSSStyleDeclaration>);
  name.textContent = o.name;

  el.append(miniPortrait(o.name, o.portrait, 30), name);
  if (o.badgeText) el.appendChild(badge(o.badgeText, o.badgeColor ?? "#ffe08a"));

  el.addEventListener("pointerup", (ev) => {
    ev.preventDefault();
    o.onClick();
  });
  return el;
}

/** A roster-list row (Characters tab): shows the active/controlled state as a badge. */
function charRow(e: CharacterListEntry, focused: boolean, onClick: () => void): HTMLButtonElement {
  return entryRow({
    name: e.name,
    portrait: e.portrait,
    color: e.color,
    focused,
    badgeText: e.controlled ? t("char.controlled") : e.active ? t("char.active") : undefined,
    badgeColor: e.controlled ? "#ffe08a" : "#9fe6a0",
    onClick,
  });
}

/** A party-slot card (Party tab): a small portrait tile + name; gold when it's the edited slot. */
function slotCard(
  bearer: { name: string; portrait?: string; color: [number, number, number] } | undefined,
  active: boolean,
  controlled: boolean,
  onClick: () => void,
): HTMLButtonElement {
  const el = document.createElement("button");
  Object.assign(el.style, {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    minWidth: "0",
    color: active ? "#1a1608" : "#f0e6cf",
    background: active ? "rgba(200,162,74,0.9)" : "rgba(40,34,16,0.8)",
    border: `2px solid ${active ? "#ffe08a" : "#6b551f"}`,
    borderRadius: "9px",
    padding: "8px 4px",
    cursor: "pointer",
    touchAction: "manipulation",
  } satisfies Partial<CSSStyleDeclaration>);

  el.appendChild(miniPortrait(bearer?.name ?? "—", bearer?.portrait, 36, controlled ? "#ffe08a" : undefined));
  const nm = document.createElement("span");
  Object.assign(nm.style, {
    font: "700 11px/1.1 system-ui, sans-serif",
    maxWidth: "100%",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  } satisfies Partial<CSSStyleDeclaration>);
  nm.textContent = bearer?.name ?? "—";
  el.appendChild(nm);

  el.addEventListener("pointerup", (ev) => {
    ev.preventDefault();
    onClick();
  });
  return el;
}

/** A small status pill: coloured text on a dark chip (readable on light or dark rows). */
function badge(text: string, color: string): HTMLSpanElement {
  const s = document.createElement("span");
  s.textContent = text;
  Object.assign(s.style, {
    flex: "0 0 auto",
    font: "800 10px/1 ui-monospace, monospace",
    color,
    background: "rgba(10,12,18,0.88)",
    border: `1px solid ${color}`,
    borderRadius: "6px",
    padding: "4px 7px",
    letterSpacing: "0.03em",
  } satisfies Partial<CSSStyleDeclaration>);
  return s;
}

/** Compact square arrow button (member prev/next in the Characters header). */
function arrowButton(glyph: string, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.textContent = glyph;
  Object.assign(btn.style, {
    flex: "0 0 auto",
    width: "38px",
    font: "800 20px/1 system-ui, sans-serif",
    color: "#f0e6cf",
    background: "rgba(40,34,16,0.85)",
    border: "1px solid #6b551f",
    borderRadius: "8px",
    padding: "9px 0",
    cursor: "pointer",
    touchAction: "manipulation",
  } satisfies Partial<CSSStyleDeclaration>);
  btn.addEventListener("pointerup", (e) => {
    e.preventDefault();
    onClick();
  });
  return btn;
}

/**
 * A mini portrait tile (background image, or the name's initial as a fallback). An optional
 * `mark` colour draws a small status dot in the corner (active/controlled) without using any
 * horizontal space.
 */
function miniPortrait(name: string, portrait: string | undefined, size: number, mark?: string): HTMLDivElement {
  const port = document.createElement("div");
  Object.assign(port.style, {
    position: "relative",
    width: `${size}px`,
    height: `${size}px`,
    flex: "0 0 auto",
    borderRadius: "5px",
    border: "1px solid rgba(0,0,0,0.5)",
    overflow: "hidden",
    background: "rgba(20,28,44,0.7)",
    backgroundSize: "cover",
    backgroundPosition: "center top",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    font: `800 ${Math.round(size * 0.46)}px/1 system-ui, sans-serif`,
    color: "rgba(207,227,255,0.85)",
  } satisfies Partial<CSSStyleDeclaration>);
  if (portrait) port.style.backgroundImage = `url(${portrait})`;
  else port.textContent = name.charAt(0);
  if (mark) {
    const dot = document.createElement("div");
    Object.assign(dot.style, {
      position: "absolute",
      top: "1px",
      right: "1px",
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: mark,
      border: "1px solid rgba(0,0,0,0.7)",
    } satisfies Partial<CSSStyleDeclaration>);
    port.appendChild(dot);
  }
  return port;
}

/**
 * The focused character's header card (full width, with the ‹ › arrows beside it): the
 * roster-row look — element-colour accent + portrait (status dot) + name — plus a ▾ chevron
 * hinting it opens the list. Full width so the name never gets squeezed.
 */
function charHeaderButton(e: CharacterListEntry, onClick: () => void): HTMLButtonElement {
  const [cr, cg, cb] = e.color;
  const rgb = `rgb(${(cr * 255) | 0},${(cg * 255) | 0},${(cb * 255) | 0})`;
  const mark = e.controlled ? "#ffe08a" : e.active ? "#9fe6a0" : undefined;
  const btn = document.createElement("button");
  Object.assign(btn.style, {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    flex: "1",
    minWidth: "0",
    textAlign: "left",
    color: "#f0e6cf",
    background: "rgba(40,34,16,0.7)",
    border: "1px solid #6b551f",
    borderLeft: `4px solid ${rgb}`,
    borderRadius: "8px",
    padding: "7px 10px",
    cursor: "pointer",
    touchAction: "manipulation",
  } satisfies Partial<CSSStyleDeclaration>);

  const name = document.createElement("span");
  Object.assign(name.style, {
    flex: "1",
    minWidth: "0",
    font: "800 16px/1 system-ui, sans-serif",
    color: "#ffe08a",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  } satisfies Partial<CSSStyleDeclaration>);
  name.textContent = e.name;

  const chevron = document.createElement("span");
  chevron.textContent = "▾";
  Object.assign(chevron.style, { flex: "0 0 auto", opacity: "0.6", font: "700 13px/1 system-ui, sans-serif" } satisfies Partial<CSSStyleDeclaration>);

  btn.append(miniPortrait(e.name, e.portrait, 28, mark), name, chevron);
  btn.addEventListener("pointerup", (ev) => {
    ev.preventDefault();
    onClick();
  });
  return btn;
}

/** A segmented tab bar: equal-width buttons on a single row (no wrapping). */
function segTabs<T extends string>(tabs: { id: T; label: string }[], active: T, onPick: (id: T) => void): HTMLDivElement {
  const row = document.createElement("div");
  Object.assign(row.style, { display: "flex", gap: "6px", marginBottom: "12px" } satisfies Partial<CSSStyleDeclaration>);
  for (const tab of tabs) {
    const on = tab.id === active;
    const btn = document.createElement("button");
    btn.textContent = tab.label;
    Object.assign(btn.style, {
      flex: "1",
      minWidth: "0",
      font: "700 14px/1 system-ui, sans-serif",
      color: on ? "#1a1608" : "#f0e6cf",
      background: on ? "rgba(200,162,74,0.92)" : "rgba(40,34,16,0.85)",
      border: `1px solid ${on ? "#ffe08a" : "#6b551f"}`,
      borderRadius: "8px",
      padding: "10px 4px",
      cursor: "pointer",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      touchAction: "manipulation",
    } satisfies Partial<CSSStyleDeclaration>);
    btn.addEventListener("pointerup", (e) => {
      e.preventDefault();
      onPick(tab.id);
    });
    row.appendChild(btn);
  }
  return row;
}

function choiceRow<T extends string | number>(
  values: T[],
  active: T,
  onPick: (v: T) => void,
  fmt: (v: T) => string,
): HTMLDivElement {
  const row = document.createElement("div");
  Object.assign(row.style, { display: "flex", gap: "8px", flexWrap: "wrap" } satisfies Partial<CSSStyleDeclaration>);
  for (const v of values) {
    const on = v === active;
    const btn = document.createElement("button");
    btn.textContent = fmt(v);
    Object.assign(btn.style, {
      font: "700 14px/1 system-ui, sans-serif",
      color: on ? "#1a1608" : "#f0e6cf",
      background: on ? "rgba(200,162,74,0.92)" : "rgba(40,34,16,0.85)",
      border: `1px solid ${on ? "#ffe08a" : "#6b551f"}`,
      borderRadius: "8px",
      padding: "9px 14px",
      cursor: "pointer",
      touchAction: "manipulation",
    } satisfies Partial<CSSStyleDeclaration>);
    btn.addEventListener("pointerup", (e) => {
      e.preventDefault();
      onPick(v);
    });
    row.appendChild(btn);
  }
  return row;
}

function slider(name: string, value: number, onChange: (v: number) => void): HTMLLabelElement {
  const row = document.createElement("label");
  Object.assign(row.style, {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "8px 0",
    font: "13px/1 system-ui, sans-serif",
  } satisfies Partial<CSSStyleDeclaration>);
  const span = document.createElement("span");
  span.textContent = name;
  span.style.width = "64px";
  const input = document.createElement("input");
  input.type = "range";
  input.min = "0";
  input.max = "100";
  input.value = String(Math.round(value * 100));
  input.style.flex = "1";
  input.style.touchAction = "manipulation";
  input.addEventListener("input", () => onChange(Number(input.value) / 100));
  row.append(span, input);
  return row;
}
