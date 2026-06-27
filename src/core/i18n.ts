/**
 * Minimal i18n. English is the base language; other locales fall back to it for
 * any missing key. Strings support `{name}` placeholders. The current locale is
 * persisted to localStorage; UI that is rebuilt on open picks up changes, and
 * persistent UI can subscribe via {@link onLocaleChange}.
 */
export type Locale = "en" | "fr";

export const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "English" },
  { id: "fr", label: "Français" },
];

type Dict = Record<string, string>;

const en: Dict = {
  // Main menu
  "menu.subtitle": "A tribute to The Legend of Dragoon",
  "mode.training": "Training",
  "mode.training.blurb": "Playable sandbox",
  "mode.story": "Story",
  "mode.story.blurb": "Campaign (soon)",
  "mode.survival": "Survival",
  "mode.survival.blurb": "Enemy waves (soon)",
  "menu.hint.touch": "Tap a mode to start",
  "menu.hint.desktop": "Click a mode to start · ⚙ / Esc for the menu",

  // Common
  "common.resume": "Resume",
  "common.mainMenu": "Main menu",

  // System menu sections
  "section.status": "Status",
  "section.characters": "Characters",
  "section.party": "Party",
  "section.equip": "Equipment",
  "section.addition": "Addition",
  "section.gambits": "Gambits",
  "section.config": "Config",
  "char.roster": "Roster",
  "char.stats": "Stats",
  "char.equip": "Equip",
  "char.additions": "Additions",
  "char.active": "Active",
  "char.controlled": "Controlled",
  "party.unavailable": "No party in this mode.",
  "party.inSlot": "In slot {n}",
  "gambit.unavailable": "No AI party members.",

  // Status
  "stat.hp": "HP",
  "stat.sp": "SP",
  "stat.mp": "MP",
  "stat.exp": "EXP",
  "stat.at": "Attack",
  "stat.df": "Defense",
  "stat.mat": "M. Attack",
  "stat.mdf": "M. Defense",
  "stat.gold": "Gold",
  "stat.base": "Body",
  "stat.gear": "Gear",
  "stat.total": "Total",
  "status.unavailable": "Status unavailable in this mode.",

  // Equipment
  "equip.placeholder": "No equipment yet — weapon, armor and accessories coming.",
  "equip.unavailable": "Equipment unavailable in this mode.",
  "equip.slot.weapon": "Weapon",
  "equip.slot.head": "Headwear",
  "equip.slot.body": "Body Armor",
  "equip.slot.feet": "Footwear",
  "equip.slot.accessory": "Accessory",
  "equip.empty": "(empty)",
  "equip.none": "— None",
  "equip.back": "‹ Back",

  // Addition
  "addition.unavailable": "Additions unavailable in this mode.",
  "addition.none": "This character has no Additions — they attack directly.",
  "addition.sub": "{presses} press · Lv {level}/5 · {dam}% · SP {sp}",
  "addition.locked": "🔒 Level {level}",

  // Config
  "config.sound": "Sound",
  "config.sound.on": "🔊 Sound: On",
  "config.sound.off": "🔇 Sound: Off",
  "config.music": "Music",
  "config.sfx": "SFX",
  "config.sound.note": "(no audio yet — settings ready)",
  "config.combatSpeed": "Combat speed",
  "config.combatSpeed.note": "Movement speed is unaffected.",
  "config.zoom": "Camera zoom",
  "config.language": "Language",

  // Character menu
  "char.title": "Character",
  "party.slots": "Party (3)",
  "party.hint": "Tap a slot, then a character to assign it. Tab / ⇄ switches control in-game.",

  // Battle actions
  "action.attack": "Attack",
  "action.guard": "Guard",
  "action.transform": "Transform",
  "action.item": "Item",
  "action.magic": "Magic",
  "action.revert": "Return",
  "combat.dragoon": "Dragoon!",
  "item.healingPotion": "Healing Potion",

  // Gambits (AI rules)
  "gambit.rulesFor": "AI rules — {name}",
  "gambit.note": "Rules run top-down each turn; the first that applies fires. Tap a rule to change it.",
  "gambit.none": "— empty —",
  "gambit.foeNear": "Foe: nearest → Attack",
  "gambit.foeLow": "Foe: lowest HP → Attack",
  "gambit.foeHigh": "Foe: highest HP → Attack",
  "gambit.magicNear": "Foe: nearest → Magic",
  "gambit.transform": "Self: SP full → Transform",
  "gambit.itemLow30": "Self: HP < 30% → Item",
  "gambit.itemLow50": "Self: HP < 50% → Item",
  "gambit.selfLow30": "Self: HP < 30% → Guard",
  "gambit.selfLow50": "Self: HP < 50% → Guard",

  // Training debug menu
  "debug.title": "Training",
  "debug.level": "Level",
  "debug.spawn": "Spawn",
  "debug.preset": "Presets",
  "debug.balance": "Balance",
  "debug.gambits": "Gambits",
  "balance.note": "DPS vs defence {df} — full Addition vs spamming the free hit 1. Ratio > 1× means completing the Addition wins.",
  "balance.addition": "Addition",
  "balance.full": "Full",
  "balance.spam": "Spam",
  "balance.ratio": "Ratio",
  "balance.none": "No Additions (basic attacker).",

  // Spawn menu
  "spawn.title": "Spawn enemies",
  "spawn.dummy": "🎯  Training Dummy",
  "spawn.knight": "🛡  Knight of Sandora",
  "spawn.commander": "👑  Commander (boss)",

  // HUD / combat
  "combat.press": "▸ PRESS!",
  "combat.perfect": "PERFECT",
  "combat.miss": "MISS",
  "tech.mode": "{mode} · {n} enemies · {speed}× combat",

  // Logs
  "log.knightSpawned": "Knight of Sandora appeared ({n} in play)",
  "log.commanderSpawned": "Commander (Seles) appeared",
  "log.defeated": "{name} defeated · +{exp} EXP · +{gold} G",
  "log.equipped": "Addition equipped: {name}",
  "log.fell": "{hero} fell — HP restored",
  "log.enemyAction": "{name}: {action} ({dmg})",
  "log.enemyHeal": "{name}: {action}",
  "log.additionMiss": "{name} missed",
  "log.additionPerfect": "{name} — Addition complete!",

  // Stub modes
  "stub.story.title": "Story Mode",
  "stub.story.subtitle": "Scripted campaign — coming soon",
  "stub.survival.title": "Survival Mode",
  "stub.survival.subtitle": "Endless enemy waves — coming soon",
  "stub.hint": "⚙ / Esc for the menu",
};

const fr: Dict = {
  "menu.subtitle": "Hommage à The Legend of Dragoon",
  "mode.training": "Entraînement",
  "mode.training.blurb": "Bac à sable jouable",
  "mode.story": "Histoire",
  "mode.story.blurb": "Campagne (bientôt)",
  "mode.survival": "Survie",
  "mode.survival.blurb": "Vagues d'ennemis (bientôt)",
  "menu.hint.touch": "Touchez un mode pour commencer",
  "menu.hint.desktop": "Cliquez un mode pour commencer · ⚙ / Échap pour le menu",

  "common.resume": "Reprendre",
  "common.mainMenu": "Menu principal",

  "section.status": "Statut",
  "section.characters": "Personnages",
  "section.party": "Équipe",
  "section.equip": "Équipement",
  "section.addition": "Addition",
  "section.gambits": "Gambits",
  "section.config": "Réglages",
  "char.roster": "Roster",
  "char.stats": "Stats",
  "char.equip": "Équip.",
  "char.additions": "Additions",
  "char.active": "Actif",
  "char.controlled": "Contrôlé",
  "party.unavailable": "Pas d'équipe dans ce mode.",
  "party.inSlot": "Slot {n}",
  "gambit.unavailable": "Aucun équipier IA.",

  "stat.hp": "PV",
  "stat.sp": "SP",
  "stat.mp": "PM",
  "stat.exp": "EXP",
  "stat.at": "Attaque",
  "stat.df": "Défense",
  "stat.mat": "Attaque M.",
  "stat.mdf": "Défense M.",
  "stat.gold": "Or",
  "stat.base": "Corps",
  "stat.gear": "Équip.",
  "stat.total": "Total",
  "status.unavailable": "Statut indisponible dans ce mode.",

  "equip.placeholder": "Aucun équipement pour l'instant — arme, armure et accessoires à venir.",
  "equip.unavailable": "Équipement indisponible dans ce mode.",
  "equip.slot.weapon": "Arme",
  "equip.slot.head": "Tête",
  "equip.slot.body": "Armure",
  "equip.slot.feet": "Bottes",
  "equip.slot.accessory": "Accessoire",
  "equip.empty": "(vide)",
  "equip.none": "— Aucun",
  "equip.back": "‹ Retour",

  "addition.unavailable": "Additions indisponibles dans ce mode.",
  "addition.none": "Ce personnage n'a pas d'Additions — il attaque directement.",
  "addition.sub": "{presses} appui(s) · Niv {level}/5 · {dam}% · SP {sp}",
  "addition.locked": "🔒 Niveau {level}",

  "config.sound": "Son",
  "config.sound.on": "🔊 Son : Activé",
  "config.sound.off": "🔇 Son : Coupé",
  "config.music": "Musique",
  "config.sfx": "Effets",
  "config.sound.note": "(aucun son pour l'instant — réglages prêts)",
  "config.combatSpeed": "Vitesse de combat",
  "config.combatSpeed.note": "La vitesse de déplacement n'est pas affectée.",
  "config.zoom": "Zoom caméra",
  "config.language": "Langue",

  "char.title": "Personnage",
  "party.slots": "Équipe (3)",
  "party.hint": "Touche un slot, puis un personnage pour l'assigner. Tab / ⇄ change de perso contrôlé en jeu.",
  "action.attack": "Attaque",
  "action.guard": "Garde",
  "action.transform": "Transformation",
  "action.item": "Objet",
  "action.magic": "Magie",
  "action.revert": "Retour",
  "combat.dragoon": "Dragoon !",
  "item.healingPotion": "Potion de soin",
  "gambit.rulesFor": "Règles IA — {name}",
  "gambit.note": "Règles évaluées de haut en bas ; la 1ère valide s'applique. Touche une règle pour la changer.",
  "gambit.none": "— vide —",
  "gambit.foeNear": "Ennemi : + proche → Attaque",
  "gambit.foeLow": "Ennemi : PV bas → Attaque",
  "gambit.foeHigh": "Ennemi : PV haut → Attaque",
  "gambit.magicNear": "Ennemi : + proche → Magie",
  "gambit.transform": "Soi : SP plein → Transfo",
  "gambit.itemLow30": "Soi : PV < 30% → Objet",
  "gambit.itemLow50": "Soi : PV < 50% → Objet",
  "gambit.selfLow30": "Soi : PV < 30% → Garde",
  "gambit.selfLow50": "Soi : PV < 50% → Garde",
  "debug.title": "Entraînement",
  "debug.level": "Niveau",
  "debug.spawn": "Apparition",
  "debug.preset": "Préréglages",
  "debug.balance": "Équilibrage",
  "debug.gambits": "Gambits",
  "balance.note": "DPS contre défense {df} — Addition complète vs spam du coup 1 (gratuit). Ratio > 1× = finir l'Addition l'emporte.",
  "balance.addition": "Addition",
  "balance.full": "Complet",
  "balance.spam": "Spam",
  "balance.ratio": "Ratio",
  "balance.none": "Aucune Addition (attaquant basique).",
  "spawn.title": "Apparition d'ennemis",
  "spawn.dummy": "🎯  Mannequin d'entraînement",
  "spawn.knight": "🛡  Knight of Sandora",
  "spawn.commander": "👑  Commander (boss)",

  "combat.press": "▸ APPUIE !",
  "combat.perfect": "PARFAIT",
  "combat.miss": "RATÉ",
  "tech.mode": "{mode} · {n} ennemi(s) · {speed}× combat",

  "log.knightSpawned": "Knight of Sandora apparu ({n} en jeu)",
  "log.commanderSpawned": "Commander (Seles) apparu",
  "log.defeated": "{name} vaincu · +{exp} EXP · +{gold} Or",
  "log.equipped": "Addition équipée : {name}",
  "log.fell": "{hero} est tombé — PV restaurés",
  "log.enemyAction": "{name} : {action} ({dmg})",
  "log.enemyHeal": "{name} : {action}",
  "log.additionMiss": "{name} raté",
  "log.additionPerfect": "{name} — Addition réussie !",

  "stub.story.title": "Mode Histoire",
  "stub.story.subtitle": "Campagne scénarisée — à venir",
  "stub.survival.title": "Mode Survie",
  "stub.survival.subtitle": "Vagues d'ennemis sans fin — à venir",
  "stub.hint": "⚙ / Échap pour le menu",
};

const dicts: Record<Locale, Dict> = { en, fr };

const STORAGE_KEY = "damia3d.locale";

function detect(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "fr") return saved;
  } catch {
    /* localStorage may be unavailable */
  }
  return typeof navigator !== "undefined" && navigator.language?.startsWith("fr") ? "fr" : "en";
}

let locale: Locale = detect();
const listeners = new Set<() => void>();

export function getLocale(): Locale {
  return locale;
}

export function setLocale(next: Locale): void {
  if (next === locale) return;
  locale = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  for (const fn of listeners) fn();
}

/** Subscribe to locale changes; returns an unsubscribe function. */
export function onLocaleChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Translate a key, interpolating `{name}` placeholders. Falls back to English, then the key. */
export function t(key: string, params?: Record<string, string | number>): string {
  const s = dicts[locale][key] ?? en[key] ?? key;
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (k in params ? String(params[k]) : `{${k}}`));
}
