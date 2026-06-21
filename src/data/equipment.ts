/**
 * Equipment data from *The Legend of Dragoon*. Five slots; a character may have
 * one of each equipped. Many items are restricted to specific members.
 *
 * Populated with the full headwear / body armor / footwear set for every member
 * (restricted via `users`), Dart's weapons, and a broad set of accessories.
 * Other members' weapons can be added with the same shape. Flat stat bonuses
 * (at/df/mat/mdf/…) and the HP/MP percent
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
/** Members who can wear "Women" gear. */
const WOMEN: Member[] = ["Shana", "Miranda", "Rose", "Meru"];
/** Dart / Lavitz / Albert, who share most heavy armor. */
const HEAVY = ["Dart", "Lavitz", "Albert"] as Member[];
/** Members who have Additions (everyone except Shana / Miranda). */
const ADDITION_USERS: Member[] = ["Dart", "Lavitz", "Albert", "Rose", "Haschel", "Meru", "Kongol"];

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

  // --- Headwear -------------------------------------------------------------
  // Male
  { id: "bandana", name: "Bandana", slot: "head", mat: 3, users: MEN },
  { id: "sallet", name: "Sallet", slot: "head", mat: 8, aHit: 10, users: MEN, price: 40, effect: "+10% physical hit rate." },
  { id: "armet", name: "Armet", slot: "head", mat: 23, mdf: 5, users: MEN, price: 100 },
  { id: "knight_helm", name: "Knight Helm", slot: "head", mat: 37, df: 5, users: ["Dart", "Lavitz", "Albert", "Kongol"], price: 150, effect: "When magically damaged, gain 20 SP." },
  { id: "giganto_helm", name: "Giganto Helm", slot: "head", mat: 14, df: 10, mdf: 5, users: ["Kongol"], price: 200, effect: "When magically damaged, gain 20 SP." },
  { id: "soul_headband", name: "Soul Headband", slot: "head", mat: 25, df: 5, mdf: 5, users: ["Haschel"], price: 200, effect: "When magically damaged, gain 20 SP." },
  // Female
  { id: "felt_hat", name: "Felt Hat", slot: "head", mat: 5, users: WOMEN },
  { id: "cape", name: "Cape", slot: "head", mat: 17, users: WOMEN, price: 60 },
  { id: "tiara", name: "Tiara", slot: "head", mat: 29, df: 5, mAv: 10, users: WOMEN, price: 150 },
  { id: "jeweled_crown", name: "Jeweled Crown", slot: "head", mat: 24, mdf: 5, users: ["Shana", "Miranda", "Meru"], price: 200, effect: "When magically damaged, gain 20 SP." },
  { id: "roses_hairband", name: "Rose's Hairband", slot: "head", mat: 36, users: ["Rose"], effect: "Prevents Instant Death." },
  // All
  { id: "legend_casque", name: "Legend Casque", slot: "head", mat: 50, mdf: 127, mAv: 50, price: 10000, dmgReduce: { magic: 0.5 }, effect: "Halves incoming magic damage." },
  { id: "dragon_helm", name: "Dragon Helm", slot: "head", mat: 50, df: 12, hpPct: 0.5, effect: "Raises maximum HP by 50%." },
  { id: "phoenix_plume", name: "Phoenix Plume", slot: "head", mat: 30, mdf: 10, effect: "Prevents Fear, Confusion, Bewitchment and Dispiriting." },
  { id: "magical_hat", name: "Magical Hat", slot: "head", mat: 50, mdf: 10, mpPct: 0.5, effect: "Raises maximum MP by 50%." },

  // --- Body armor -----------------------------------------------------------
  // Dart / Lavitz / Albert
  { id: "leather_armor", name: "Leather Armor", slot: "body", df: 2, mdf: 2, users: HEAVY },
  { id: "scale_armor", name: "Scale Armor", slot: "body", df: 8, mdf: 8, users: HEAVY, price: 50 },
  { id: "chain_mail", name: "Chain Mail", slot: "body", df: 20, mdf: 24, users: HEAVY, price: 150 },
  { id: "plate_mail", name: "Plate Mail", slot: "body", df: 27, mdf: 20, users: HEAVY, price: 200 },
  { id: "saint_armor", name: "Saint Armor", slot: "body", df: 34, mdf: 34, users: HEAVY, price: 300, effect: "When physically damaged, gain 20 SP." },
  { id: "armor_of_yore", name: "Armor of Yore", slot: "body", df: 35, mdf: 35, users: ["Dart", "Lavitz", "Albert", "Kongol"], effect: "Prevents Poison, Stun and Arm-Blocking." },
  { id: "jade_dg_armor", name: "Jade DG Armor", slot: "body", df: 54, mdf: 27, users: ["Lavitz", "Albert"], price: 800, effect: "Reduces Wind-elemental magic damage to 0." },
  { id: "red_dg_armor", name: "Red DG Armor", slot: "body", df: 41, mdf: 40, users: ["Dart"], price: 800, effect: "Reduces Fire-elemental magic damage to 0." },
  // Haschel
  { id: "disciple_vest", name: "Disciple Vest", slot: "body", df: 13, mdf: 8, users: ["Haschel"] },
  { id: "warrior_dress", name: "Warrior Dress", slot: "body", df: 25, mdf: 23, users: ["Haschel"], price: 150, effect: "Defense +5%." },
  { id: "masters_vest", name: "Master's Vest", slot: "body", df: 30, mdf: 29, users: ["Haschel"], price: 250, effect: "When physically damaged, gain 20 SP." },
  { id: "energy_girdle", name: "Energy Girdle", slot: "body", df: 37, mdf: 26, users: ["Haschel"], price: 300, effect: "Additions accrue 50% more Spirit Points." },
  { id: "satori_vest", name: "Satori Vest", slot: "body", df: 40, mdf: 31, users: ["Haschel"], effect: "Prevents Poison, Stun and Arm-Blocking." },
  { id: "violet_dg_armor", name: "Violet DG Armor", slot: "body", df: 45, mdf: 40, users: ["Haschel"], price: 800, effect: "Reduces Thunder-elemental magic damage to 0." },
  // Kongol
  { id: "lion_fur", name: "Lion Fur", slot: "body", df: 46, mdf: 20, users: ["Kongol"] },
  { id: "breastplate", name: "Breastplate", slot: "body", df: 59, mdf: 14, users: ["Kongol"], price: 250 },
  { id: "giganto_armor", name: "Giganto Armor", slot: "body", df: 75, mdf: 25, users: ["Kongol"], price: 400, effect: "When physically damaged, gain 20 SP." },
  { id: "golden_dg_armor", name: "Golden DG Armor", slot: "body", df: 88, mdf: 23, users: ["Kongol"], price: 800, effect: "Reduces Earth-elemental magic damage to 0." },
  // Female
  { id: "clothes", name: "Clothes", slot: "body", df: 4, mdf: 5, users: WOMEN },
  { id: "leather_jacket", name: "Leather Jacket", slot: "body", df: 7, mdf: 12, users: ["Shana", "Miranda", "Rose"], price: 50 },
  { id: "angel_robe", name: "Angel Robe", slot: "body", users: ["Shana", "Miranda", "Meru"], price: 500, effect: "~45% chance to revive with half HP on KO." },
  { id: "silver_vest", name: "Silver Vest", slot: "body", df: 13, mdf: 17, users: WOMEN, price: 150 },
  { id: "sparkle_dress", name: "Sparkle Dress", slot: "body", df: 19, mdf: 45, users: WOMEN, price: 200, effect: "When physically damaged, gain 20 SP." },
  { id: "robe", name: "Robe", slot: "body", df: 25, mdf: 35, users: WOMEN, price: 500, effect: "When magically damaged, gain 20 SP." },
  { id: "rainbow_dress", name: "Rainbow Dress", slot: "body", df: 32, mdf: 55, users: WOMEN, effect: "Prevents Poison, Stun and Arm-Blocking." },
  { id: "blue_dg_armor", name: "Blue DG Armor", slot: "body", df: 30, mdf: 54, users: ["Meru"], price: 800, effect: "Reduces Water-elemental magic damage to 0." },
  { id: "dark_dg_armor", name: "Dark DG Armor", slot: "body", df: 41, mdf: 42, users: ["Rose"], price: 800, effect: "Reduces Darkness-elemental magic damage to 0." },
  { id: "silver_dg_armor", name: "Silver DG Armor", slot: "body", df: 27, mdf: 80, users: ["Shana", "Miranda"], price: 800, effect: "Reduces Light-elemental magic damage to 0." },
  // All
  { id: "armor_of_legend", name: "Armor of Legend", slot: "body", df: 127, aAv: 50, price: 10000, dmgReduce: { phys: 0.5 }, effect: "Halves incoming physical damage." },

  // --- Footwear -------------------------------------------------------------
  // Male
  { id: "leather_boots", name: "Leather Boots", slot: "feet", users: MEN },
  { id: "iron_kneepiece", name: "Iron Kneepiece", slot: "feet", df: 5, users: MEN, price: 100 },
  { id: "combat_shoes", name: "Combat Shoes", slot: "feet", df: 5, aAv: 5, users: MEN, price: 150 },
  { id: "bandit_shoes", name: "Bandit's Shoes", slot: "feet", spd: 20, users: MEN },
  // Female
  { id: "leather_shoes", name: "Leather Shoes", slot: "feet", users: WOMEN },
  { id: "soft_boots", name: "Soft Boots", slot: "feet", df: 5, users: WOMEN, price: 100 },
  { id: "stardust_boots", name: "Stardust Boots", slot: "feet", df: 5, mAv: 5, users: WOMEN, price: 150 },
  { id: "dancers_shoes", name: "Dancer's Shoes", slot: "feet", spd: 20, users: WOMEN },
  // All
  { id: "magical_greaves", name: "Magical Greaves", slot: "feet", spd: 10, aAv: 5, mAv: 5, price: 300 },

  // --- Accessories ----------------------------------------------------------
  { id: "bracelet", name: "Bracelet", slot: "accessory" },
  // Stat boosters
  { id: "fake_power_wrist", name: "Fake Power Wrist", slot: "accessory", at: 5, price: 100 },
  { id: "power_wrist", name: "Power Wrist", slot: "accessory", at: 10, price: 200 },
  { id: "attack_badge", name: "Attack Badge", slot: "accessory", at: 20, mat: 20, price: 1000, effect: "Raises physical & magical attack." },
  { id: "fake_shield", name: "Fake Shield", slot: "accessory", df: 5, price: 100 },
  { id: "knight_shield", name: "Knight Shield", slot: "accessory", df: 10, price: 200 },
  { id: "guard_badge", name: "Guard Badge", slot: "accessory", df: 20, mdf: 20, price: 1000, effect: "Raises physical & magical defense." },
  { id: "giganto_ring", name: "Giganto Ring", slot: "accessory", at: 20, df: 20, price: 1000, effect: "Raises physical attack & defense." },
  { id: "magical_ring", name: "Magical Ring", slot: "accessory", mat: 30, price: 600 },
  { id: "spiritual_ring", name: "Spiritual Ring", slot: "accessory", mdf: 30, price: 600 },
  { id: "bandit_ring", name: "Bandit's Ring", slot: "accessory", spd: 20, users: MEN, effect: "+20 Speed (males only)." },
  { id: "dancers_ring", name: "Dancer's Ring", slot: "accessory", spd: 20, users: WOMEN, effect: "+20 Speed (females only)." },
  { id: "elude_cloak", name: "Elude Cloak", slot: "accessory", aAv: 20, price: 300 },
  { id: "spirit_cloak", name: "Spirit Cloak", slot: "accessory", mAv: 20, price: 300 },
  { id: "sages_cloak", name: "Sage's Cloak", slot: "accessory", aAv: 20, mAv: 20, price: 600 },
  { id: "wargods_amulet", name: "Wargod's Amulet", slot: "accessory", aHit: 20, mHit: 20, effect: "+20 hit rate." },
  { id: "physical_ring", name: "Physical Ring", slot: "accessory", hpPct: 0.5, effect: "+50% max HP." },
  { id: "amulet", name: "Amulet", slot: "accessory", mpPct: 1, effect: "+100% max MP." },
  // Per-turn recovery / SP
  { id: "therapy_ring", name: "Therapy Ring", slot: "accessory", effect: "Recover 10% max HP each turn." },
  { id: "mage_ring", name: "Mage Ring", slot: "accessory", effect: "Recover 10% max MP each turn." },
  { id: "spirit_ring", name: "Spirit Ring", slot: "accessory", effect: "Gain 20 SP each turn." },
  { id: "wargods_sash", name: "Wargod's Sash", slot: "accessory", effect: "Additions award 50% more SP." },
  { id: "emerald_earring", name: "Emerald Earring", slot: "accessory", price: 1000, effect: "When physically damaged, gain 20 SP." },
  { id: "ruby_ring", name: "Ruby Ring", slot: "accessory", price: 1000, effect: "When magically damaged, gain 20 SP." },
  { id: "platinum_collar", name: "Platinum Collar", slot: "accessory", price: 1000, effect: "When physically damaged, recover 10% max MP." },
  { id: "sapphire_pin", name: "Sapphire Pin", slot: "accessory", price: 1000, effect: "When magically damaged, recover 10% max MP." },
  // Damage reduction
  { id: "phantom_shield", name: "Phantom Shield", slot: "accessory", price: 10000, dmgReduce: { phys: 0.5, magic: 0.5 }, effect: "Reduces all damage by 50%." },
  { id: "dragon_shield", name: "Dragon Shield", slot: "accessory", price: 5000, dmgReduce: { phys: 0.5 }, effect: "Reduces physical damage by 50%." },
  { id: "angel_scarf", name: "Angel Scarf", slot: "accessory", price: 5000, dmgReduce: { magic: 0.5 }, effect: "Reduces magical damage by 50%." },
  // Status protection
  { id: "active_ring", name: "Active Ring", slot: "accessory", price: 200, effect: "Prevents Dispiriting." },
  { id: "bravery_amulet", name: "Bravery Amulet", slot: "accessory", price: 300, effect: "Prevents Fear." },
  { id: "panic_guard", name: "Panic Guard", slot: "accessory", price: 300, effect: "Prevents Confusion." },
  { id: "poison_guard", name: "Poison Guard", slot: "accessory", price: 300, effect: "Prevents Poison." },
  { id: "stun_guard", name: "Stun Guard", slot: "accessory", price: 200, effect: "Prevents Stun." },
  { id: "protector", name: "Protector", slot: "accessory", price: 200, effect: "Prevents Arm-Blocking." },
  { id: "magic_ego_bell", name: "Magic Ego Bell", slot: "accessory", price: 300, effect: "Prevents Bewitchment." },
  { id: "destone_amulet", name: "Destone Amulet", slot: "accessory", price: 400, effect: "Prevents Petrification." },
  { id: "talisman", name: "Talisman", slot: "accessory", effect: "Prevents Instant Death." },
  { id: "rainbow_earring", name: "Rainbow Earring", slot: "accessory", effect: "Prevents all status ailments." },
  { id: "holy_ankh", name: "Holy Ankh", slot: "accessory", effect: "~45% chance to revive with half HP on KO." },
  // Element stones (halve magic damage of one element)
  { id: "red_eye_stone", name: "Red-Eye Stone", slot: "accessory", effect: "Reduces Fire-elemental magic damage by 50%." },
  { id: "blue_sea_stone", name: "Blue Sea Stone", slot: "accessory", effect: "Reduces Water-elemental magic damage by 50%." },
  { id: "jade_stone", name: "Jade Stone", slot: "accessory", effect: "Reduces Wind-elemental magic damage by 50%." },
  { id: "golden_stone", name: "Golden Stone", slot: "accessory", effect: "Reduces Earth-elemental magic damage by 50%." },
  { id: "violet_stone", name: "Violet Stone", slot: "accessory", effect: "Reduces Thunder-elemental magic damage by 50%." },
  { id: "silver_stone", name: "Silver Stone", slot: "accessory", effect: "Reduces Light-elemental magic damage by 50%." },
  { id: "darkness_stone", name: "Darkness Stone", slot: "accessory", effect: "Reduces Darkness-elemental magic damage by 50%." },
  // Addition automation
  { id: "wargod_calling", name: "Wargod Calling", slot: "accessory", price: 1000, users: ADDITION_USERS, effect: "Auto Additions — half damage & SP, no level-up." },
  { id: "ultimate_wargod", name: "Ultimate Wargod", slot: "accessory", price: 10000, users: ADDITION_USERS, effect: "Auto Additions — full damage & SP." },
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
