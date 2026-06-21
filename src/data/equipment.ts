/**
 * Equipment data from *The Legend of Dragoon*. Five slots; a character may have
 * one of each equipped. Many items are restricted to specific members.
 *
 * Currently populated with everything Dart can equip (the only playable
 * character so far) plus shared accessories. Other members' gear can be added
 * with the same shape. Flat stat bonuses (at/df/mat/mdf/…) and the HP/MP percent
 * bonuses are applied to effective stats; `dmgReduce` is applied to incoming
 * damage; `effect` is descriptive text for effects not yet mechanically wired.
 */
export type EquipSlot = "weapon" | "head" | "body" | "feet" | "accessory";

export type Member =
  | "Dart"
  | "Lavitz"
  | "Albert"
  | "Shana"
  | "Miranda"
  | "Rose"
  | "Haschel"
  | "Meru"
  | "Kongol";

/** Members who can wear "Men" gear. */
const MEN: Member[] = ["Dart", "Lavitz", "Albert", "Haschel", "Kongol"];
const HEAVY = ["Dart", "Lavitz", "Albert"] as Member[];

export interface EquipDef {
  id: string;
  name: string;
  slot: EquipSlot;
  at?: number;
  df?: number;
  mat?: number;
  mdf?: number;
  spd?: number;
  aHit?: number;
  mHit?: number;
  aAv?: number;
  mAv?: number;
  /** Percent bonus to max HP / MP (0.5 = +50%). */
  hpPct?: number;
  mpPct?: number;
  /** Fractional reduction of incoming damage (0.5 = −50%). */
  dmgReduce?: { phys?: number; magic?: number };
  /** Members who can equip it; omitted = all. */
  users?: Member[];
  /** Descriptive effect text (not all are mechanically applied yet). */
  effect?: string;
  /** Shop buy price in Gold, if sold. */
  price?: number;
}

export const EQUIPMENT: EquipDef[] = [
  // --- Dart's weapons -------------------------------------------------------
  { id: "broad_sword", name: "Broad Sword", slot: "weapon", at: 2, users: ["Dart"] },
  { id: "bastard_sword", name: "Bastard Sword", slot: "weapon", at: 7, users: ["Dart"], price: 60 },
  { id: "heat_blade", name: "Heat Blade", slot: "weapon", at: 18, users: ["Dart"], price: 150, effect: "Additions deal Fire-elemental physical damage." },
  { id: "falchion", name: "Falchion", slot: "weapon", at: 26, users: ["Dart"], price: 250 },
  { id: "mind_crush", name: "Mind Crush", slot: "weapon", at: 34, users: ["Dart"], price: 350, effect: "20% chance to inflict Confusion." },
  { id: "fairy_sword", name: "Fairy Sword", slot: "weapon", at: 39, users: ["Dart"], price: 400, effect: "Additions accrue 50% more Spirit Points." },
  { id: "claymore", name: "Claymore", slot: "weapon", at: 44, users: ["Dart"], price: 500 },
  { id: "soul_eater", name: "Soul Eater", slot: "weapon", at: 75, users: ["Dart"], effect: "Dart loses 10% max HP at the start of each turn." },

  // --- Headwear (Dart-equippable) ------------------------------------------
  { id: "bandana", name: "Bandana", slot: "head", mat: 3, users: MEN },
  { id: "sallet", name: "Sallet", slot: "head", mat: 8, aHit: 10, users: MEN, price: 40 },
  { id: "armet", name: "Armet", slot: "head", mat: 23, mdf: 5, users: MEN, price: 100 },
  { id: "knight_helm", name: "Knight Helm", slot: "head", mat: 37, df: 5, users: HEAVY, price: 150, effect: "When magically damaged, gain 20 SP." },
  { id: "legend_casque", name: "Legend Casque", slot: "head", mat: 50, mdf: 127, mAv: 50, price: 10000, dmgReduce: { magic: 0.5 }, effect: "Halves incoming magic damage." },
  { id: "dragon_helm", name: "Dragon Helm", slot: "head", mat: 50, df: 10, hpPct: 0.5, effect: "Raises maximum HP by 50%." },
  { id: "phoenix_plume", name: "Phoenix Plume", slot: "head", mat: 30, mdf: 10, effect: "Prevents Fear, Bewitchment, Confusion and Dispiriting." },
  { id: "magical_hat", name: "Magical Hat", slot: "head", mat: 50, mdf: 10, mpPct: 0.5, effect: "Raises maximum MP by 50%." },

  // --- Body armor (Dart-equippable) ----------------------------------------
  { id: "leather_armor", name: "Leather Armor", slot: "body", df: 2, mdf: 2, users: HEAVY },
  { id: "scale_armor", name: "Scale Armor", slot: "body", df: 8, mdf: 8, users: HEAVY, price: 50 },
  { id: "chain_mail", name: "Chain Mail", slot: "body", df: 20, mdf: 24, users: HEAVY, price: 150 },
  { id: "plate_mail", name: "Plate Mail", slot: "body", df: 27, mdf: 20, users: HEAVY, price: 200 },
  { id: "saint_armor", name: "Saint Armor", slot: "body", df: 34, mdf: 34, users: HEAVY, price: 300, effect: "When physically damaged, gain 20 SP." },
  { id: "armor_of_yore", name: "Armor of Yore", slot: "body", df: 35, mdf: 35, users: ["Dart", "Lavitz", "Albert", "Kongol"], effect: "Prevents Poison, Stun and Arm-Blocking." },
  { id: "red_dg_armor", name: "Red DG Armor", slot: "body", df: 41, mdf: 40, users: ["Dart"], price: 800, effect: "Reduces Fire-elemental magic damage to 0." },
  { id: "armor_of_legend", name: "Armor of Legend", slot: "body", df: 127, aAv: 50, price: 10000, dmgReduce: { phys: 0.5 }, effect: "Halves incoming physical damage." },

  // --- Footwear (Dart-equippable) ------------------------------------------
  { id: "leather_boots", name: "Leather Boots", slot: "feet", users: MEN },
  { id: "iron_kneepiece", name: "Iron Kneepiece", slot: "feet", df: 5, users: MEN, price: 100 },
  { id: "combat_shoes", name: "Combat Shoes", slot: "feet", df: 5, aAv: 5, users: MEN, price: 150 },
  { id: "bandit_shoes", name: "Bandit's Shoes", slot: "feet", spd: 20, users: MEN },
  { id: "magical_greaves", name: "Magical Greaves", slot: "feet", spd: 10, aAv: 5, mAv: 5, price: 300 },

  // --- Accessories ----------------------------------------------------------
  { id: "bracelet", name: "Bracelet", slot: "accessory" },
  { id: "fake_power_wrist", name: "Fake Power Wrist", slot: "accessory", at: 5, price: 100 },
  { id: "power_wrist", name: "Power Wrist", slot: "accessory", at: 10, price: 200 },
  { id: "attack_badge", name: "Attack Badge", slot: "accessory", at: 20, mat: 20, price: 1000 },
  { id: "fake_shield", name: "Fake Shield", slot: "accessory", df: 5, price: 100 },
  { id: "knight_shield", name: "Knight Shield", slot: "accessory", df: 10, price: 200 },
  { id: "guard_badge", name: "Guard Badge", slot: "accessory", df: 20, mdf: 20, price: 1000 },
  { id: "giganto_ring", name: "Giganto Ring", slot: "accessory", at: 20, df: 20, price: 1000 },
  { id: "magical_ring", name: "Magical Ring", slot: "accessory", mat: 30, price: 600 },
  { id: "spiritual_ring", name: "Spiritual Ring", slot: "accessory", mdf: 30, price: 600 },
  { id: "bandit_ring", name: "Bandit's Ring", slot: "accessory", spd: 20, users: MEN },
  { id: "elude_cloak", name: "Elude Cloak", slot: "accessory", aAv: 20, price: 300 },
  { id: "spirit_cloak", name: "Spirit Cloak", slot: "accessory", mAv: 20, price: 300 },
  { id: "sages_cloak", name: "Sage's Cloak", slot: "accessory", aAv: 20, mAv: 20, price: 600 },
  { id: "wargods_amulet", name: "Wargod's Amulet", slot: "accessory", aHit: 20, mHit: 20 },
  { id: "physical_ring", name: "Physical Ring", slot: "accessory", hpPct: 0.5, effect: "+50% max HP." },
  { id: "amulet", name: "Amulet", slot: "accessory", mpPct: 1, effect: "+100% max MP." },
  { id: "therapy_ring", name: "Therapy Ring", slot: "accessory", effect: "Recover 10% max HP at the start of each turn." },
  { id: "spirit_ring", name: "Spirit Ring", slot: "accessory", effect: "Gain 20 SP at the start of each turn." },
  { id: "phantom_shield", name: "Phantom Shield", slot: "accessory", price: 10000, dmgReduce: { phys: 0.5, magic: 0.5 }, effect: "Reduces all damage by 50%." },
  { id: "dragon_shield", name: "Dragon Shield", slot: "accessory", price: 5000, dmgReduce: { phys: 0.5 }, effect: "Reduces physical damage by 50%." },
  { id: "angel_scarf", name: "Angel Scarf", slot: "accessory", price: 5000, dmgReduce: { magic: 0.5 }, effect: "Reduces magical damage by 50%." },
];

const BY_ID = new Map(EQUIPMENT.map((e) => [e.id, e]));

export function equipById(id: string): EquipDef | undefined {
  return BY_ID.get(id);
}

export function canEquip(def: EquipDef, member: Member): boolean {
  return !def.users || def.users.includes(member);
}

/** Equipment of a slot that the given member can equip. */
export function equipmentForSlot(slot: EquipSlot, member: Member): EquipDef[] {
  return EQUIPMENT.filter((e) => e.slot === slot && canEquip(e, member));
}

/** Compact one-line summary of an item's bonuses and effect. */
export function equipSummary(def: EquipDef): string {
  const parts: string[] = [];
  const add = (v: number | undefined, code: string) => {
    if (v) parts.push(`${v > 0 ? "+" : ""}${v} ${code}`);
  };
  add(def.at, "AT");
  add(def.df, "DF");
  add(def.mat, "MAT");
  add(def.mdf, "MDF");
  add(def.spd, "SPD");
  add(def.aHit, "A-HIT");
  add(def.mHit, "M-HIT");
  add(def.aAv, "A-AV");
  add(def.mAv, "M-AV");
  if (def.hpPct) parts.push(`+${Math.round(def.hpPct * 100)}% HP`);
  if (def.mpPct) parts.push(`+${Math.round(def.mpPct * 100)}% MP`);
  let s = parts.join(" · ");
  if (def.effect) s += (s ? " · " : "") + def.effect;
  return s || "—";
}
