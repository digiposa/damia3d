# Baby Dragon — Mob Thunder Mountain of Mortal Dragon (Disc 3)

> **Minor enemy Thunder canon Disc 3** : Mountain of Mortal Dragon mob, **Dragon emotion abilities pattern canon** (Anger/Sorrow/Cry of Dragon). Recolor Swift Dragon (Moon That Never Sets) — possible "younger version" canon lore.
>
> **Sources** :
>
> - 🥈 [`_sources/lod-wiki-baby-dragon.md`](./_sources/lod-wiki-baby-dragon.md) — wiki LoD (stats + 3-phase HP AI + Dragon emotion abilities + Swift Dragon recolor + directional road encounter Mountain → Evergreen Forest only)
> - 🥉 [`_sources/fandom-baby-dragon.md`](./_sources/fandom-baby-dragon.md) — fandom (JP name ベビードラゴン Bebīdoragon + appearance short green dragons two legs yellow armored stomach + Dragon Tail canon name + Mind Purifier 20 gold shop standard + "attack-all spells preferable groups of 3" strategy)

## Statut

🟡 **Draft post-ingestion wiki LoD** — fandom à ingérer pour cross-check si page existe.

## Identity canon

- **Espèce** : Baby Dragon (probable younger version Swift Dragon canon)
- **Element** : Thunder
- **Location canon** : **Mountain of Mortal Dragon** (Disc 3, Divine Dragon seal location) — submaps 413-427
- **Disc** : Disc 3 (Mille Seseau, Mountain Divine Dragon seal)
- **Lineage canon hypothesis** : "**Recolor of Swift Dragon (Moon That Never Sets)**" — pattern visual reuse + possible "young dragon" lore (Mountain of Mortal Dragon = lieu reproduction/young dragons canon ?)
- **Pattern symbolique** : **"Dragon emotion" abilities canon** unique : Anger / Sorrow / Cry → phases émotionnelles HP-dependent

## Stats canon

| Stat | Value          |
| ---- | -------------- |
| HP   | 240            |
| AT   | 50             |
| DF   | **140** (high) |
| MAT  | 50             |
| MDF  | 80             |
| SPD  | 60             |
| A-AV | 0%             |
| M-AV | 0%             |

→ Pattern mob Disc 3 : **DF 140 high** (anti-physical), MDF 80 moderate (anti-magic less). Balanced AT/MAT 50.

## Status Immunity canon

Pattern mob standard : 4 immune (Petrify/Bewitch/Arm Block/Dispirit) / 4 vulnerable (Confuse/Fear/Poison/Stun).

## Yield canon

- **EXP : 100 / Gold : 27**
- **Drop : Mind Purifier 8%** — anti-Confusion/Bewitchment Repeat Item canon (cohérent Evergreen Forest chest + status purifiers family)

## Counter Opportunities

Counters Additions: **Yes** (28 pattern standard — non-implémenté Damia).

## AI canon (3-phase HP "Dragon emotion" escalation) ⭐

| HP           | Action(s)            | Target | Effect                                                             |
| ------------ | -------------------- | ------ | ------------------------------------------------------------------ |
| > 50%        | ~Tail                | Single | 1× phys                                                            |
| ≤ 50%, > 25% | **Anger of Dragon**  | Single | 1× **Fire** magic damage ⚠️ exception                              |
| ≤ 25%        | **Sorrow of Dragon** | Single | 1× **Non-Elemental** magic + **100% Dispiriting** (M-AV mitigates) |
| ≤ 25%        | **Cry of Dragon**    | Single | 1× **Non-Elemental** magic + **100% Fear** (M-AV mitigates)        |

⚠️ Pattern AI canon mob 3-phase "Dragon emotion" :

- **Phase 1 (HP > 50%)** : ~Tail (1× phys basic)
- **Phase 2 (HP 50-25%)** : **Anger of Dragon** — Thunder mob utilise **Fire** ability canon (exception élément)
- **Phase 3 (HP ≤ 25%)** : **Sorrow** + **Cry** = panic 100% status (Dispirit / Fear) Non-Elemental finisher

### Anger of Dragon canon ⚠️ exception element

- ⚠️ **Thunder mob uses Fire ability** — pattern "mob element ≠ ability element" canon (cohérent Arrow Shooter Earth utilise Detonate Arrow Non-Elemental)
- Possibly lore : "dragon emotion = element associative" (anger = fire / sorrow = darkness ? / cry = light ?)

### Sorrow of Dragon + Cry of Dragon canon ⚠️ panic phase

- Both Non-Elemental magic + 100% status proc
- **Sorrow → Dispiriting** (SP reduction status)
- **Cry → Fear** (status)
- **M-AV mitigation** canon : pattern magic status proc → M-AV reduces (cohérent Arrow Shooter Thunder Arrow M-AV)

## Encounters canon

### Mountain of Mortal Dragon (Disc 3)

- **Baby Dragon solo** (formation 150) : submaps 413, 417, 422, 427 (10% each)
- **Baby Dragon ×3** (formation 159) : submaps 416-418, 424-426 (20-35%)

### World Map road canon ⚠️ directional

- **Mountain of Mortal Dragon → Evergreen Forest** : Baby Dragon spawn canon
- ⚠️ **PAS Evergreen Forest → Mountain of Mortal Dragon** direction (canon directional restriction)
- Pattern road encounter "one-way" canon

### Escape rate 30% standard

## Trivia canon ⭐

### Swift Dragon recolor (Moon That Never Sets) canon

- **Baby Dragon = Swift Dragon recolor** Mountain of Mortal Dragon → Moon That Never Sets pattern visual reuse
- ⚠️ **Cohérent Air Combat (Wyvern recolor Mountain → Moon)** pattern systématique Moon mob recolor visuals from earlier dungeons
- Possible lore : **Swift Dragon = adult version Baby Dragon canon** ? Logical "baby dragon grown up Moon canon" ?
- À cross-référer `mobs/Swift Dragon.md` (à créer)

## Combat flow canon

1. Mob spawn random (Mountain of Mortal Dragon submaps 413-427)
2. AI cycle :
   - HP > 50% : ~Tail (1× phys)
   - HP 50-25% : Anger of Dragon (1× Fire magic)
   - HP ≤ 25% : Sorrow OR Cry of Dragon (1× Non-Elemental magic + 100% Dispirit OR Fear)
3. Counter mechanism (Counters Additions Yes)

### Strategy canon recommandée

- **Thunder no opposite element** → physical Earth/Wind weapons normal damage
- **Wind weapons Lavitz/Albert Twister Glaive** = neutral vs Thunder
- **Equip Bravery Amulet** (Fear prevention) + **Active Ring** (Dispiriting prevention) HP ≤ 25% phase
- **High M-AV** = mitigation status procs Sorrow/Cry
- **Burst damage HP > 25%** = avoid Sorrow/Cry panic finishers
- **Status applicables vs mob** : Confuse / Fear / Poison / Stun (vulnerable)

## Vision Damia (implémentation)

### Décisions canon à conserver

1. **Stats canon exacts** : HP 240 / AT 50 / DF 140 / MAT 50 / MDF 80 / SPD 60
2. **3-phase AI "Dragon emotion"** : ~Tail / Anger / Sorrow+Cry
3. **Thunder mob Fire ability exception** : pattern element-decoupled
4. **Mind Purifier drop 8%** standard repeat item
5. **Swift Dragon recolor visual** : asset reuse pattern
6. **Directional road encounter** : Mountain → Evergreen only canon

### Questions ouvertes

- **Swift Dragon = Baby Dragon adulte canon ?** Lore "younger version" speculation
- **"Dragon emotion" pattern systématique mobs ?** Investigate autres dragon-mobs canon

## Liens transverses

- [`README.md`](./README.md) — pattern général mobs canon
- [`../locations/Mountain of Mortal Dragon.md`](../locations/Mountain of Mortal Dragon.md) (à créer) — Disc 3 Divine Dragon seal location
- [`../locations/Evergreen Forest.md`](../locations/Evergreen Forest.md) — road connection Disc 3
- [`../locations/Moon That Never Sets.md`](../locations/Moon That Never Sets.md) (à créer) — Swift Dragon location Disc 4
- [`Swift Dragon.md`](./Swift Dragon.md) (à créer) — original model Moon That Never Sets
- [`Air Combat.md`](./Air Combat.md) — Wyvern recolor pattern parallel Moon mob
- [`../combat/elements.md`](../combat/elements.md) — Thunder + Fire + Non-Elemental
- [`../items/equipment.md`](../items/equipment.md) — Mind Purifier / Bravery Amulet / Active Ring

## Cross-check fandom (compléments + divergences)

**Confirmations utiles fandom** :

- **Thunder element + Mountain of Mortal Dragon location** confirmé
- **Mind Purifier drop 8%** confirmé + **shop price canon 20 gold "anywhere"** ⭐ NEW
- **No elemental weakness Thunder** explicit canon
- **Pattern groups of 3** confirme formation ×3 (recommandation strategy attack-all spells)
- **Fear / Dispirit status canon** confirmed (Sorrow → Dispirit / Cry → Fear)
- **Counter Yes** confirmed

**NEW canon fandom-only** ⭐ :

- ⭐ **JP name ベビードラゴン (Bebīdoragon)** — direct translit (pattern simple canon comme Assassin Cock vs Feyrbrand metaphor)
- ⭐ **Appearance canon** : **short green dragons + 2 legs + very short wings + tail + spikey head + yellow armored stomach** — visual design canon
- ⭐ **Dragon Tail canon name officiel** (vs wiki ~Tail) — adopter fandom
- ⭐ **Mind Purifier shop price 20 gold canon** ⚠️ NEW — purchasable "anywhere" canon. Pattern : status purifiers cheap. À documenter `items/consumables.md` (à créer) Mind Purifier entry.

**Divergences stats wiki vs fandom** :

| Stat                  | Wiki LoD          | Fandom                          | Notes                                                   |
| --------------------- | ----------------- | ------------------------------- | ------------------------------------------------------- |
| **HP US/EU**          | 240               | 240                             | Match                                                   |
| **HP JP**             | (silent)          | 300                             | Fandom canon JP +25% pattern systématique               |
| **P. Attack**         | 50                | **56**                          | ⚠️ DIVERGENCE +12% (fandom probable JP values pattern)  |
| **M. Attack**         | 50                | **56**                          | ⚠️ DIVERGENCE +12%                                      |
| **DF / MDF**          | 140/80            | 140/80                          | Match                                                   |
| **SPD**               | 60                | 60                              | Match                                                   |
| **Gold JP**           | (silent)          | 9                               | Fandom canon JP ÷3 pattern                              |
| **Evade probability** | A-AV/M-AV 0%      | "evades with given probability" | ⚠️ DIVERGENCE — wiki tier 2 prévaut (0% evade) probable |
| **Dragon Tail name**  | ~Tail (community) | **Dragon Tail**                 | Fandom canon name officiel — adopter                    |

→ Wiki tier 2 US prévaut pour stats numériques. Fandom prévaut pour names canon + appearance.

## Gaps / TODO

Voir [TODO.md](../../TODO.md) section Baby Dragon.
