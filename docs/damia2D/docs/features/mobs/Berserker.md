# Berserker — Mob Darkness Home of Gigantos (Disc 2)

> **Mob Gehrich Gang canon** : Darkness element **Home of Gigantos Disc 2**, partners Piggy + Crafty Thief Gehrich Gang. **Glass cannon profile** HP 400 + LOW DF 30 / MDF 50 + high SPD 60. **Status Immunity 6✔/2✗ NEW** : Confuse + Fear immune (cohérent thematic "berserker fearless single-minded").
>
> ⭐ **AI 3-phase Charging Spirit telegraph canon** : ~Multi Slash > 25% / Charging Spirit @ 25% / Menacing (100% Fear) OR All-out Attack! (3× phys) ≤ 25%. **Pattern AI récurrent multi-mob** (cohérent Air Combat même pattern Charging Spirit + All-out Attack! 3× phys).
>
> ⭐ **Drop Energy Girdle 2% accessory SP+** rare canon source farming.
>
> ⭐ **"Contact (arrows)" encounter mechanic NEW canon** : Gehrich Gang arrow traps Home of Gigantos hideout — pattern Contact-type encounters NEW vs Random Encounter standard.
>
> **Sources** :
>
> - 🥈 [`_sources/lod-wiki-berserker.md`](./_sources/lod-wiki-berserker.md) — wiki LoD (stats glass cannon + Status Immunity 6✔/2✗ Confuse+Fear immune + AI 3-phase Charging Spirit Menacing/All-out Attack + Energy Girdle 2% drop + Contact arrows encounter NEW + 28 Counter)
> - 🥉 [`_sources/fandom-berserker.md`](./_sources/fandom-berserker.md) — fandom (appearance "humanoid two cleavers gold/blue armor" + **Butcher Knives canon name** vs ~Multi Slash + **"Spams All Out Attack critical health" clarification** + ⭐ **Energy Girdle = body armor Haschel-only canon clarification** vs SP+ accessory existing docs + Rock Fireflies free resource replenish NEW + Bandit's Ring/Sachets co-drops + Mappi/Gehrich bosses Disc 2 area + Disc 2 Monsters confirmed)

## Statut

🟢 **Canon documenté wiki + fandom** — Energy Girdle armor vs accessory classification à reconcilier.

## Identity canon

- **Espèce** : Berserker (humanoid warrior gang Gehrich)
- **Element** : **Darkness** (cohérent Berserk Mouse Darkness Forest pattern thematic "berserk = darkness")
- **Location canon** : **Home of Gigantos** (Disc 2 Gehrich Gang hideout, post-Donau / Valley of Corrupted Gravity)
- **Disc** : Disc 2 (Gehrich Gang storyline Lynn rescue quest)
- **Faction** : **Gehrich Gang** canon (partner mobs Piggy + Crafty Thief — Gehrich Gang members)
- **Pattern symbolique** : **Glass cannon profile** + **Charging Spirit telegraph pattern récurrent** multi-mob canon

## Stats canon ⚠️ glass cannon profile

| Stat | Value         |
| ---- | ------------- |
| HP   | 400           |
| AT   | 40            |
| DF   | **30** ⚠️ low |
| MAT  | 32            |
| MDF  | **50** ⚠️ low |
| SPD  | 60            |
| A-AV | 0%            |
| M-AV | 0%            |

→ Pattern "glass cannon" canon : **HP 400 substantial** mais **DF 30 / MDF 50 LOW** = mob meurt vite mais hits hard. Inverse Beastie Dragon (DF 130 high anti-physical). **SPD 60 high** = first strike souvent vs party Disc 2.

## Status Immunity canon ⚠️ DEVIATES 6✔/2✗ NEW

Pattern **NEW** mob 6 immune / 2 vulnerable :

- **Immune (6)** : Petrify / Bewitch / Arm Block / Dispirit / **Confuse** ⭐ NEW / **Fear** ⭐ NEW
- **Vulnerable (2)** : Poison / Stun

⚠️ **Berserker Confuse + Fear ✔ immune NEW canon** :

- Cohérent thematic "berserker single-minded fearless rage focus"
- Pattern per-mob status deviations canon — wiki standard 4✔/4✗ definitely NOT universel
- **Pattern "berserk" mob Fear immune canon** : Berserker + Berserk Mouse both Fear immune → systematic ?
- À documenter `combat/status-effects.md` per-mob immunity table canon

## Yield canon

- **EXP : 55 / Gold : 15** (mob Disc 2 mid-tier yield)
- **Drop : Energy Girdle 2%** ⚠️ ACCESSORY SP+ rare canon

### Energy Girdle drop canon ⭐ MAJEUR

- **Energy Girdle = SP+ Additions/attacks accessory canon** (cohérent equipment.md catalogue : Fairy Sword / Pretty Hammer / Energy Girdle / Wargod's Sash SP+ accessories)
- **2% drop rate** = pattern accessory drop (vs 8% standard item / 10% early-mob items)
- **Berserker = source canon Energy Girdle farming Disc 2** Home of Gigantos
- À refléter `items/equipment.md` Energy Girdle source canon (compléter avec Berserker 2% Home of Gigantos)

## Counter Opportunities

**(28)** — pattern standard "counter Yes" enemies high-density tier. Détails non documentés (feature non-implémentée Damia per user instruction).

⚠️ **Tier 28 universal multi-disc confirmed** : Berserker Disc 2 = same Berserk Mouse Disc 1 = same Aqua King/Archangel Disc 4 = 28-tier mob canon.

## AI canon (3-phase Charging Spirit telegraph pattern récurrent)

| HP    | Chance | Action                 | Target | Effect                                                  |
| ----- | ------ | ---------------------- | ------ | ------------------------------------------------------- |
| > 25% | 75%    | ~Multi Slash           | Single | 1× Physical damage                                      |
| 25%   |        | **Charging Spirit** ⭐ | Self   | Prepares **Menacing** OR **All-out Attack!** next turn  |
| ≤ 25% |        | **Menacing** ⭐ NEW    | Single | 100% chance to inflict **Fear** (target M-AV mitigates) |
| ≤ 25% |        | **All-out Attack!**    | Single | **3× Physical damage** ⚠️                               |

⚠️ Pattern AI canon mob **3-phase Charging Spirit telegraph récurrent** :

- **Phase 1 (HP > 25%, 75% chance)** : ~Multi Slash (1× phys basic). Other 25% chance = ambiguous (probable also Multi Slash OR transitional)
- **Phase 2 (HP = 25% exact threshold)** : **Charging Spirit** self-buff prepares next turn ability
- **Phase 3 (HP ≤ 25%)** : **Menacing** (100% Fear) OR **All-out Attack!** (3× phys) — chosen by Charging Spirit prep

### Charging Spirit telegraph pattern canon récurrent ⭐ MAJEUR

- **Same pattern Air Combat** : Charging Spirit self-buff + All-out Attack! 3× damage
- Pattern multi-mob "wounded mob more dangerous" canon systematic
- **Telegraph turn before high-damage ability** = pattern AI canon récurrent (player counter-strategy : Stun/Poison Berserker during Charging Spirit turn)
- Data-model `selfBuff.primesNextTurn: { ability: AbilityRef; weight?: number }` réutilisable

### Menacing 100% Fear single canon ⭐ NEW

- **100% Fear proc canon** (vs Beastie Dragon Black Mist 50% Fear — Berserker Menacing 2× plus dangereux)
- Pattern Fear-inflict single-target canon
- Lié status Fear : target's M-AV reduces chance
- Implication : **Bravery Amulet equip critical HP ≤ 25% phase**

### All-out Attack! 3× phys canon récurrent

- **3× physical damage canon** (cohérent Air Combat même ability + 3× phys)
- Pattern shared multi-mob "wounded berserk finisher" canon
- Implémenter Damia : ability référence cross-mob canon

## Encounters canon

### Home of Gigantos (Disc 2)

- **Berserker solo** (formation 102) : submap 261 (Contact arrows), 263 (10%), 265 (10%)
- **Berserker + Piggy** (formation 105) : submap 261 (Contact arrows), 262 (Random 35%)
- **Crafty Thief + Berserker** (formation 106) : submap 261 (Contact arrows), 262 (35%), 263 (35%)
- **Berserker ×2 + Piggy** (formation 107) : submap 261 (Contact arrows), 262 (20%), 263 (35%), 264 (35%)

⚠️ **Submap 261 = entrée Home of Gigantos canon** (4 formations sur 4 = Contact arrows submap 261 hotspot).

### World Map roads canon

- **None** ⚠️ — Berserker location-locked Home of Gigantos canon (no World Map spawns)

### "Contact (arrows)" encounter mechanic NEW canon ⭐ MAJEUR

- Pattern encounter triggered par **contact with arrows** (vs Random Encounter standard)
- Cohérent thematic Gehrich Gang Home of Gigantos : **gang hideout with arrow traps** canon
- **Pattern NEW encounter type Damia** : "Contact (arrows)" event-trigger vs Random spawn
- À documenter `combat/encounter-mechanics.md` (à créer) — pattern Contact-type encounters canon
- Implémentation : event triggers (zones arrow-trap on map) vs random spawns canon

### Escape rate 40%

- **40% Home of Gigantos** (vs 30% standard / 90% Forest Disc 1)
- Pattern location-specific escape rates canon

### Gehrich Gang mob faction canon ⭐

- Partner mobs : **Piggy** + **Crafty Thief** = Gehrich Gang members canon
- Cohérent Donau quest line `Gehrich Gang` (Lynn rescue quest)
- Pattern enemy faction canon : Home of Gigantos = Gehrich Gang HQ → faction-mobs identification
- À documenter `lore/factions.md` (à créer) — Gehrich Gang faction canon + mobs roster

## Combat flow canon

1. Mob spawn random Home of Gigantos submaps 261-265 (Contact arrows OR Random)
2. AI cycle :
   - HP > 25% (75% chance) : ~Multi Slash (1× phys)
   - HP = 25% threshold : Charging Spirit self-buff (preps next turn)
   - HP ≤ 25% : Menacing (100% Fear) OR All-out Attack! (3× phys)
3. Counter mechanism (Counter Opportunities 28 high-density tier)
4. **HP 400 + DF 30 LOW** = mob meurt vite vs party Dragoon physical

### Strategy canon recommandée

- **Darkness weak Light** → Shana/Miranda Light spells / Light Repeat Items 1.5× damage (Disc 2 Shana early Light Dragoon)
- **Burst damage rapide** = exploit DF 30 / MDF 50 LOW glass cannon
- **Stun pendant Charging Spirit turn** = prevent All-out Attack! 3× phys finisher
- **Equip Bravery Amulet** = prevent Menacing Fear ≤ 25% phase
- **Status applicables** : Poison / Stun (NON Confuse / Fear / Petrify / Bewitch / Arm Block / Dispirit ⚠️ immune)
- **High M-AV** = mitigation Menacing Fear proc
- **Escape 40%** = option si party low HP

## Vision Damia (implémentation)

### Décisions canon à conserver

1. **Stats canon exacts** : HP 400 / AT 40 / DF 30 / MAT 32 / MDF 50 / SPD 60
2. **Status Immunity 6✔/2✗ canon** : Confuse + Fear immune NEW deviation pattern
3. **3-phase AI Charging Spirit récurrent** : Multi Slash > 25% / Charging Spirit @ 25% / Menacing OR All-out Attack! ≤ 25%
4. **Charging Spirit telegraph pattern réutilisable** : data-model cross-mob (Air Combat + Berserker)
5. **Menacing 100% Fear canon NEW** : single-target ability
6. **All-out Attack! 3× phys canon récurrent** : shared multi-mob ability
7. **Energy Girdle 2% accessory drop** : source canon SP+ farming Home of Gigantos Disc 2
8. **"Contact (arrows)" encounter NEW canon** : event-trigger vs Random spawn
9. **Gehrich Gang faction mob canon** : Berserker + Piggy + Crafty Thief

### Implementation tech

- Data-model `MobAI3PhaseCharging` (extension réutilisable Air Combat + Berserker) :
  ```ts
  type MobAI3PhaseCharging = {
    phase1: { hpThreshold: 0.25; chance: 0.75; ability: 'multiSlash' };
    phase2: { hpThreshold: 0.25; ability: 'chargingSpirit'; primesNext: AbilityRef[] };
    phase3: { hpThreshold: 0; abilities: ('menacing' | 'allOutAttack')[] };
  };
  ```
- Data-model `EncounterMechanic` :
  ```ts
  type EncounterMechanic = 'random' | 'contact-arrows' | 'contact-other';
  type SubmapEncounter = {
    submapId: number;
    formationId: number;
    mechanic: EncounterMechanic;
    rate?: number; // null if Contact-type
  };
  ```

### Questions ouvertes

- **Charging Spirit HP threshold canon ambiguous** : "25%" exact OR "> 25%, 25% chance" ? Wiki phrasing dual-interpretation. À clarifier fandom + Discord.
- **Multi Slash > 25% other 25% chance canon unknown** : 75% Multi Slash + 25% = ??? (Charging Spirit ? OR transitional ?). À investiguer.
- **Pattern "berserk" mob Fear immune systematic** : Berserker + Berserk Mouse both Fear immune → other "berserk" mobs ? À cross-check alphabetical mobs ingestion.
- **"Contact (arrows)" encounter mechanic implementation Damia** : event-trigger map zones OR random spawn variant ? À decide.
- ⚠️ **Energy Girdle classification canon armor vs accessory** : fandom "body armor Haschel-only" vs existing docs Damia "SP+ accessory" — à reconcilier `items/equipment.md` Energy Girdle entry.

## Cross-check fandom (compléments + divergences)

**Confirmations utiles fandom** :

- **Element Darkness + Home of Gigantos location** confirmé
- **HP 400 (US/EU) + DF 30 + MDF 50 + SPD 60** match
- **Energy Girdle 2% drop** confirmé
- **Counter Yes** confirmé
- **Confuse + Fear immune** confirmé (cohérent wiki 6✔/2✗ NEW pattern)
- **Charging Spirit + All Out Attack + Menacing canon names** confirmés
- **Battle formations 4** : solo / + Crafty Thief / + Piggy / ×2 + Piggy (cohérent wiki tier 2)
- **Disc 2 Monsters category** ✅

**NEW canon fandom-only** ⭐ :

- ⭐ **Appearance canon "humanoid two large cleavers + wounded legs/arms + gold boots/pauldrons/bracers + blue chest plate"** — visual design canon précisé (vs wiki silent)
- ⭐ **Butcher Knives canon name officiel** (vs wiki ~Multi Slash community) — adopter fandom canon > 25% phase ability
- ⭐ **"Spams All Out Attack in critical health" canon clarification** — HP ≤ 25% = All Out Attack predominant (vs Menacing rare). Précise wiki ambiguous "Menacing OR All-out Attack" dual choice
- ⭐ **All Out Attack damage canon précisé 250-500 dégâts** party characters
- ⭐ **Encounter rate Common** canon
- ⭐ **Energy Girdle = body armor Haschel-only canon clarification ⭐ MAJEUR** :
  - Body armor classification (vs SP+ accessory existing docs Damia) — à reconcilier `items/equipment.md`
  - "Greater than most armors Disc 3" stat tier high canon
  - ~30+ minutes farming canon Home of Gigantos
- ⭐ **Bandit's Ring drop Gangster 2%** confirmation Home of Gigantos farm area (cohérent existing docs)
- ⭐ **Sachets drop Piggy** Home of Gigantos area
- ⭐ **Rock Fireflies free resource replenish NEW canon ⭐ MAJEUR** — Home of Gigantos feature unique : NPC/object replenish party resources (HP/MP/SP) sans coût. Pattern farming-area design canon
- ⭐ **Mappi + Gehrich = bosses Home of Gigantos Disc 2** canon — à documenter `bosses/Mappi.md` + `bosses/Gehrich.md` (à créer)
- ⭐ **Strategy canon : physical > magic** (MDF > DF) recommended — burst kill turn 1 priority

**Divergences stats wiki vs fandom** :

| Stat                              | Wiki LoD                                     | Fandom                      | Notes                                                          |
| --------------------------------- | -------------------------------------------- | --------------------------- | -------------------------------------------------------------- |
| **HP US/EU**                      | 400                                          | 400                         | Match                                                          |
| **HP JP**                         | (silent)                                     | **500**                     | Fandom canon JP +25% pattern systématique                      |
| **P. Attack**                     | 40                                           | **55**                      | ⚠️ DIVERGENCE +37% (fandom probable JP values OR fandom typo)  |
| **M. Attack**                     | 32                                           | **36**                      | ⚠️ DIVERGENCE +12%                                             |
| **DF / MDF**                      | 30/50                                        | 30/50                       | Match                                                          |
| **SPD**                           | 60                                           | 60                          | Match                                                          |
| **Gold US**                       | 15                                           | 15                          | Match                                                          |
| **Gold JP**                       | (silent)                                     | **5**                       | Fandom canon JP ÷3 pattern systématique                        |
| **~Multi Slash / Butcher Knives** | ~Multi Slash                                 | **Butcher Knives**          | Fandom canon name officiel — adopter                           |
| **Energy Girdle classification**  | (drop only)                                  | **body armor Haschel-only** | Fandom clarification — à reconcilier vs existing SP+ accessory |
| **HP ≤ 25% behavior**             | Menacing OR All-out Attack! (equal probable) | **"Spams All Out Attack"**  | Fandom clarification : All Out Attack predominant              |

→ **Wiki tier 2 prévaut pour stats numériques** (HP US/EU, AT, MAT, DF, MDF, SPD).
→ **Fandom prévaut pour names canon officiels** (Butcher Knives) + appearance + Energy Girdle armor classification + "spams All Out Attack" clarification + Rock Fireflies free replenish + Mappi/Gehrich bosses identification.

## Liens transverses

- [`README.md`](./README.md) — pattern général mobs canon
- [`../locations/Home of Gigantos.md`](../locations/Home of Gigantos.md) (à créer) — Disc 2 Gehrich Gang HQ
- [`../locations/Donau.md`](../locations/Donau.md) — quest line Gehrich Gang Disc 2 (Lynn rescue)
- [`Piggy.md`](./Piggy.md) (à créer) — partner Gehrich Gang mob Home of Gigantos
- [`Crafty Thief.md`](./Crafty Thief.md) (à créer) — partner Gehrich Gang mob Home of Gigantos
- [`Berserk Mouse.md`](./Berserk Mouse.md) — pattern "berserk" Fear immune cross-mob
- [`Air Combat.md`](./Air Combat.md) — pattern Charging Spirit + All-out Attack! 3× phys récurrent
- [`../bosses/Gehrich.md`](../bosses/Gehrich.md) (à créer) — boss Gehrich Gang leader Disc 2
- [`../bosses/Mappi.md`](../bosses/Mappi.md) (à créer) — boss Home of Gigantos partner Gehrich Disc 2 (fandom NEW canon)
- [`../npcs/Rock Fireflies.md`](../npcs/Rock Fireflies.md) (à créer) — NPC Home of Gigantos free resource replenish (fandom NEW canon)
- [`../combat/elements.md`](../combat/elements.md) — Darkness weak Light + element tagging
- [`../combat/status-effects.md`](../combat/status-effects.md) (à créer) — per-mob immunity 6✔/2✗ NEW (Berserker Confuse+Fear immune)
- [`../combat/encounter-mechanics.md`](../combat/encounter-mechanics.md) (à créer) — Contact (arrows) NEW encounter type canon
- [`../combat/additions.md`](../combat/additions.md) — Counter Opportunities tier 28 universal
- [`../items/equipment.md`](../items/equipment.md) — Energy Girdle SP+ accessory source canon Berserker 2%
- [`../lore/factions.md`](../lore/factions.md) (à créer) — Gehrich Gang faction mobs roster

## Gaps / TODO

Voir [TODO.md](../../TODO.md) section Berserker.
