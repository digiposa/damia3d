# Berserker — wiki LoD (verbatim)

> **Source** : [legendofdragoon.org wiki — Berserker](https://legendofdragoon.org/)
> **Fiabilité** : 🥈 **tier 2** (wiki interne communauté Damia/Wulves)
> **Sauvegardé le** : 2026-05-21.
> **Usage** : référence canon Minor Enemy Berserker (**Darkness element Home of Gigantos Disc 2**, **Gehrich Gang mob canon**). **Glass cannon profile** HP 400 + LOW DF 30 / MDF 50 + high SPD 60. **Status Immunity NEW pattern 6✔/2✗** : Confuse + Fear immune (cohérent thematic "berserker fearless single-minded"). **AI 3-phase Charging Spirit telegraph canon** : Multi Slash > 25% / Charging Spirit @ 25% / Menacing (100% Fear) OR All-out Attack! (3× phys) ≤ 25%. **Drop Energy Girdle 2% accessory SP+ rare**.

---

## Stats canon

| Aspect                  | Value           |
| ----------------------- | --------------- |
| **Element**             | **Darkness** ⭐ |
| **Counters Additions?** | **Yes**         |
| HP                      | 400             |
| AT                      | 40              |
| DF                      | **30** ⚠️ low   |
| A-AV                    | 0%              |
| SPD                     | 60              |
| MAT                     | 32              |
| MDF                     | **50** ⚠️ low   |
| M-AV                    | 0%              |

⚠️ **Pattern "glass cannon" canon** : HP 400 substantial + DF 30 / MDF 50 LOW = mob meurt vite mais hits hard. Inverse pattern Beastie Dragon (DF 130 high anti-physical).
⚠️ **SPD 60 high** = first strike souvent vs party Disc 2.

## Status Immunity (pattern DEVIATES — 6✔/2✗ NEW)

| Petrify | Bewitch | Arm Block | Dispirit | Confuse  | Fear     | Poison | Stun |
| ------- | ------- | --------- | -------- | -------- | -------- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | **✔** ⭐ | **✔** ⭐ | X      | X    |

⚠️ **6 immune / 2 vulnerable NEW canon pattern** :

- **Confuse ✔ immune NEW** ⭐ : cohérent thematic "berserker single-minded focused on rage" (cannot be confused)
- **Fear ✔ immune NEW** ⭐ : cohérent thematic "berserker fearless" (cohérent Berserk Mouse même Fear immune)
- **Pattern "berserk" mob status immunity canon** : Fear immune systematic ? À cross-check autres "berserk" mobs.
- Wiki standard 4✔/4✗ confirmé pas universel — Berserker = pattern 6✔/2✗ NEW deviation pattern

## Yield

| EXP | Gold | Drops            |
| --- | ---- | ---------------- |
| 55  | 15   | Energy Girdle 2% |

⚠️ **Energy Girdle 2% drop ⭐ MAJEUR** :

- **Energy Girdle = SP+ Additions/attacks accessory canon** (cohérent equipment.md catalogue : Fairy Sword / Pretty Hammer / Energy Girdle / Wargod's Sash SP+ accessories)
- **2% drop rate** = pattern accessory drop (vs 8% standard item / 10% early-mob items)
- **Berserker = source canon Energy Girdle farming Disc 2** Home of Gigantos
- À cross-référer `items/equipment.md` Energy Girdle source canon (à compléter)

## Counter Opportunities

**(28)** — pattern standard "counter Yes" enemies high-density tier. Détails non documentés (feature non-implémentée Damia per user instruction).

## Combat

### Encounters

| Encounter Formation (ID)      | In Location (Submap ID)              | Encounter%                                          | Escape% |
| ----------------------------- | ------------------------------------ | --------------------------------------------------- | ------- |
| Berserker (102)               | Home of Giganto (261, 263, 265)      | Contact (arrows), 10%, 10%                          | 40%     |
| Berserker, Piggy (105)        | Home of Giganto (261, 262)           | Contact (arrows) and Random Encounter 35%, 35%      | 40%     |
| Crafty Thief, Berserker (106) | Home of Giganto (261, 262, 263)      | Contact (arrows) and Random Encounter 20%, 35%, 35% | 40%     |
| Berserker ×2, Piggy (107)     | Home of Giganto (261, 262, 263, 264) | Contact (arrows), 20%, 35%, 35%                     | 40%     |

| Encounter Formation (ID) | On World Map Road | Encounter% | Escape% |
| ------------------------ | ----------------- | ---------- | ------- |
| None                     | None              | N/A        | N/A     |

⚠️ **"Contact (arrows)" encounter mechanic NEW canon ⭐ MAJEUR** :

- Pattern encounter triggered par contact with arrows (vs Random Encounter standard)
- Cohérent thematic Gehrich Gang Home of Gigantos : **gang hideout with arrow traps** canon
- Submap 261 = entrée area Home of Gigantos (contact arrows on all 4 formations)
- **Pattern NEW encounter type** : "Contact (arrows)" + "Random Encounter" hybrid system
- À documenter `combat/encounter-mechanics.md` (à créer) — pattern Contact-type encounters
- Implémentation Damia : event triggers vs random spawns canon

⚠️ **No World Map road encounters** : Berserker is **location-locked Home of Gigantos** (no World Map spawns).

⚠️ **Escape rate 40%** pattern Home of Gigantos canon (vs 30% standard / 90% Forest Disc 1).

⚠️ **Gehrich Gang mobs partners canon** : Piggy + Crafty Thief = Gehrich Gang members (cohérent Donau quest line `Gehrich Gang` → Lynn rescue) — pattern enemy faction Home of Gigantos canon.

### Abilities

> Minor enemies act on their turn based primarily on their current HP. Additional criteria, if any, is annotated on the table. Minor enemies have an equal chance to perform any eligible action unless otherwise indicated.

| HP    | Chance | Action              | Target | Effect                                                 | Notes                                          |
| ----- | ------ | ------------------- | ------ | ------------------------------------------------------ | ---------------------------------------------- |
| > 25% | 75%    | ~Multi Slash        | Single | 1× Physical damage                                     |                                                |
| 25%   |        | **Charging Spirit** | Self   | Will use **Menacing** or **All-out Attack!** next turn |                                                |
| ≤ 25% |        | **Menacing**        | Single | 100% chance to inflict Fear                            | Target's M-AV reduces chance to receive status |
| ≤ 25% |        | **All-out Attack!** | Single | 3× Physical damage                                     |                                                |

\* As most abilities do not have official names, the community came up with approximate names marked with an ~.

⚠️ **AI 3-phase Charging Spirit pattern canon ⭐ MAJEUR** :

- **Phase 1 (HP > 25%, 75% chance)** : ~Multi Slash (1× phys single)
- **Phase 2 (HP = 25% exact threshold ?)** : **Charging Spirit** self-buff prepare next turn
- **Phase 3 (HP ≤ 25%)** : **Menacing** (100% Fear) OR **All-out Attack!** (3× phys) — chosen by Charging Spirit prep
- Pattern recurring multi-mob canon : **Air Combat même Charging Spirit telegraph + All-out Attack! 3× damage** → pattern AI "wounded mob more dangerous" canon systematic

⚠️ **Ambiguïté > 25% other 25% chance** : Wiki dit 75% Multi Slash > 25%, but other 25% = ??? (Charging Spirit possible mais HP threshold 25% exact). À clarifier fandom.

⚠️ **Menacing canon name officiel ⭐ NEW** :

- **100% Fear proc** (vs Air Combat aucun Fear) — Menacing single-target Fear-inflict
- Pattern Fear-inflict ability canon (cohérent thematic "berserker menacing roar")
- Lié status Fear : target's M-AV reduces chance

⚠️ **All-out Attack! 3× phys canon récurrent** (Air Combat même ability + 3× phys) — pattern shared multi-mob.

⚠️ **Charging Spirit telegraph pattern canon récurrent** (Air Combat même) — pattern systematic multi-mob "preparation turn before high-damage ability" canon.

## Description

> Berserker is a Minor Enemy.

(Wiki description minimal — fandom probable plus narrative.)

## Gallery / Trivia / References

(Sections wiki vides.)
