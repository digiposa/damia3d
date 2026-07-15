# Beastie Dragon — Mob Wind Mountain of Mortal Dragon (Disc 3)

> **Minor enemy Wind canon Disc 3** : Mountain of Mortal Dragon mob, **Mist-based abilities canon** (Black Mist Fear + Sweet Mist Bewitchment 50% proc).
>
> ⭐ **Drop Total Vanishing 8%** ⚠️ MAJEUR — confirme **Total Vanishing = Attack Item canon (one-shot, kills minor enemy direct, NOT Repeat Item)** Erase-type (reconcilie hypothesis Basilisk).
>
> **Sources** :
>
> - 🥈 [`_sources/lod-wiki-beastie-dragon.md`](./_sources/lod-wiki-beastie-dragon.md) — wiki LoD (stats + 2-phase HP AI + Black/Sweet Mist 50% proc + Total Vanishing drop)
> - 🥉 [`_sources/fandom-beastie-dragon.md`](./_sources/fandom-beastie-dragon.md) — fandom (JP name ビースティドラゴン + appearance "velociraptor-like toxic-breathing dragon" canon + Bounce canon name + Total Vanishing "destroys minor enemies instantly" confirme Attack Item one-shot + Encounter rate Common + ~45min farming + Disc 3 Monsters confirmed)

## Statut

🟡 **Draft post-ingestion wiki LoD** — fandom à ingérer pour cross-check si page existe.

## Identity canon

- **Espèce** : Beastie Dragon (Wind dragon variant Mountain canon)
- **Element** : Wind
- **Location canon** : **Mountain of Mortal Dragon** (Disc 3, Divine Dragon seal location) — submaps 413-427
- **Disc** : Disc 3
- **Drop canon symbolique** : **Total Vanishing 8%** ⚠️ Attack Item one-shot Erase-type canon (cohérent Basilisk "immune Erase Total Vanishing")
- **Pattern symbolique** : **Mist-based abilities** canon (Black Mist + Sweet Mist) — Wind-related thematic mist

## Stats canon

| Stat | Value          |
| ---- | -------------- |
| HP   | 336            |
| AT   | 66             |
| DF   | **130** (high) |
| MAT  | 42             |
| MDF  | 90             |
| SPD  | 50             |
| A-AV | 0%             |
| M-AV | 0%             |

→ Pattern mob Disc 3 : **DF 130 high** anti-physical, MDF 90 moderate. AT 66 > MAT 42 (physical-focus profile mob).

## Status Immunity canon

Pattern mob standard : 4 immune (Petrify/Bewitch/Arm Block/Dispirit) / 4 vulnerable (Confuse/Fear/Poison/Stun).

## Yield canon

- **EXP : 110 / Gold : 33**
- **Drop : Total Vanishing 8%** ⭐ MAJEUR Attack Item canon (one-shot, kills minor enemy direct, NOT Repeat Item) Erase-type

## ⭐ Total Vanishing canon reconciliation ⚠️ MAJEUR

**Beastie Dragon drops Total Vanishing 8%** → confirme **Total Vanishing = Attack Item canon (one-shot, kills minor enemy direct, NOT Repeat Item)** (NOT Dragoon Magic comme hypothèse Basilisk).

Cross-reference Basilisk : "immune to Erase effect of Can't Combat Weapons, **Total Vanishing** and Demon's Gate" → re-interprétation :

- **Can't Combat Weapons** = weapons category (Gladius/Brass Knuckle/Indora's Axe)
- **Total Vanishing** = Attack Item canon (one-shot, kills minor enemy direct, NOT Repeat Item) (drops mobs canon Beastie Dragon)
- **Demon's Gate** = Attack Item canon (one-shot, kills minor enemy direct, NOT Repeat Item) probable (à confirmer via autres mobs drops)

→ Pattern canon **Erase Attack Items category** : Total Vanishing + Demon's Gate (probable) — **one-shot Attack Items canon** (kill minor enemy direct, NOT repeatable). **Basilisk + similar mobs immune** à Erase effects.

## Counter Opportunities

Counters Additions: **Yes** (28 pattern standard — non-implémenté Damia).

## AI canon (2-phase HP escalation)

| HP    | Action         | Target | Effect                                                        |
| ----- | -------------- | ------ | ------------------------------------------------------------- |
| > 50% | ~Flying Kick   | Single | 1× Physical damage (basic)                                    |
| ≤ 50% | **Black Mist** | Single | 1× Non-Elemental magic + **50% Fear** (M-AV mitigates)        |
| ≤ 50% | **Sweet Mist** | Single | 1× Non-Elemental magic + **50% Bewitchment** (M-AV mitigates) |

⚠️ Pattern AI canon mob 2-phase :

- **Phase 1 (HP > 50%)** : ~Flying Kick (1× phys)
- **Phase 2 (HP ≤ 50%)** : **Black Mist OR Sweet Mist** (Non-Elemental magic + 50% status) — equal chance probable

### Mist-based abilities canon ⭐

- **Black Mist** : 50% Fear proc (M-AV mitigates) — thematic "dark mist instills fear"
- **Sweet Mist** : 50% Bewitchment proc (M-AV mitigates) — thematic "sweet mist bewitches mind"
- Both Non-Elemental magic damage 1× + 50% status proc canon
- Pattern lower proc rate (50% vs 100% standard) → **Beastie Dragon less threatening status-wise** vs Arrow Shooter/Baby Dragon/Basilisk pattern

## Encounters canon

### Mountain of Mortal Dragon (Disc 3)

- **Beastie Dragon solo** (formation 151) : submaps 414, 418, 424 (10% each)
- **Beastie Dragon ×2** (formation 156) : submaps 413-415, 420-422, 427 (20-35%)
- **Deadly Spider + Beastie Dragon** (formation 157) : submaps 414-416, 421, 422, 424 (20-35%)

### World Map road canon ⚠️ directional

- **Mountain of Mortal Dragon → Evergreen Forest** : Beastie Dragon spawn canon
- ⚠️ **PAS Evergreen Forest → Mountain of Mortal Dragon** direction (canon directional restriction — same Baby Dragon)
- Pattern road encounter "one-way" canon récurrent Mountain mobs

### Deadly Spider mob canon NEW partner

- Formation 157 partner Beastie Dragon
- À documenter `mobs/Deadly Spider.md` (à créer)

### Escape rate 30% standard

## Combat flow canon

1. Mob spawn random (Mountain of Mortal Dragon submaps 413-427)
2. AI cycle :
   - HP > 50% : ~Flying Kick (1× phys)
   - HP ≤ 50% : Black Mist OR Sweet Mist (Non-Elemental magic + 50% Fear OR Bewitchment)
3. Counter mechanism (Counters Additions Yes)

### Strategy canon recommandée

- **Wind weak Earth** → Kongol axes / Earth Repeat Items 1.5× damage
- **Equip Bravery Amulet** (Fear prevention) + **Magic Ego Bell** (Bewitchment prevention) HP ≤ 50% phase
- **High M-AV** = mitigation Mist status procs
- **Burst damage HP > 50%** = avoid Mist abilities phase
- **Status applicables** : Confuse / Fear / Poison / Stun (vulnerable)

## Vision Damia (implémentation)

### Décisions canon à conserver

1. **Stats canon exacts** : HP 336 / AT 66 / DF 130 / MAT 42 / MDF 90 / SPD 50
2. **2-phase HP AI Mist** : ~Flying Kick > 50% / Black Mist OR Sweet Mist ≤ 50%
3. **50% status proc canon** : pattern lower rate vs 100% standards
4. **Total Vanishing 8% drop canon** : confirme Attack Item one-shot Erase-type
5. **Directional road encounter** : Mountain → Evergreen only canon (cohérent Baby Dragon)

### Questions ouvertes

- **Demon's Gate Attack Item canon (one-shot, kills minor enemy direct, NOT Repeat Item) ?** — Basilisk immune. Drop d'autres mobs ? À investiguer.
- **Total Vanishing / Demon's Gate mechanic** : "Erase" exact behavior ? Instant kill ? Remove from battle ? À investiguer fandom + Discord.
- **Deadly Spider mob canon Mountain of Mortal Dragon** — à documenter.

## Liens transverses

- [`README.md`](./README.md) — pattern général mobs canon
- [`../locations/Mountain of Mortal Dragon.md`](../locations/Mountain of Mortal Dragon.md) (à créer) — Disc 3 Divine Dragon seal location
- [`../locations/Evergreen Forest.md`](../locations/Evergreen Forest.md) — road connection one-way Disc 3
- [`Baby Dragon.md`](./Baby Dragon.md) — same location + same directional road canon
- [`Deadly Spider.md`](./Deadly Spider.md) (à créer) — encounter partner Mountain
- [`Basilisk.md`](./Basilisk.md) — immune to Erase effect of Total Vanishing canon (reconciliation)
- [`../combat/elements.md`](../combat/elements.md) — Wind weak Earth + Non-Elemental
- [`../items/consumables.md`](../items/consumables.md) (à créer) — **Total Vanishing** Attack Item one-shot Erase-type
- [`../combat/erase-mechanic.md`](../combat/erase-mechanic.md) (à créer) — Erase canon mechanic (Total Vanishing + Demon's Gate + Can't Combat weapons)

## Cross-check fandom (compléments + divergences)

**Confirmations utiles fandom** :

- **Wind element + Mountain of Mortal Dragon location** confirmé
- **Total Vanishing 8% drop** confirmé + **"destroys individual minor enemies instantly"** canon description ⭐ confirme **Attack Item one-shot canon** (user clarification)
- **Wind weak Earth** confirmé : "earth element spell items effective"
- **Black Mist / Sweet Mist** ability canon names confirmed (status proc)
- **Deadly Spider partner** formation confirmé
- **Counter Yes** confirmé

**NEW canon fandom-only** ⭐ :

- ⭐ **JP name ビースティドラゴン (Bīsutidoragon)** — direct translit "Beasty Dragon"
- ⭐ **Appearance canon "velociraptor-like toxic-breathing dragon"** : 2 hind legs + small arms balance + **wings functional pair limbs** (4-limb design) + **toxic-breathing** thematic explique Mist abilities
- ⭐ **Bounce canon name officiel** (vs wiki ~Flying Kick community)
- ⭐ **"Saboteur team role"** canon : pattern role mob — inflige status while others damage
- ⭐ **Encounter rate Common** canon (vs Uncommon other mobs like Air Combat)
- ⭐ **~45 minutes farming average** Total Vanishing canon
- ⭐ **Disc 3 Monsters category** confirmed (vs Basilisk fandom "Disc 4" — per-mob fandom variability)

**Divergences stats wiki vs fandom** :

| Stat                      | Wiki LoD                 | Fandom     | Notes                                          |
| ------------------------- | ------------------------ | ---------- | ---------------------------------------------- |
| **HP US/EU**              | 336                      | 336        | Match                                          |
| **HP JP**                 | (silent)                 | 420        | Fandom canon JP +25% pattern systématique      |
| **P. Attack**             | 66                       | **80**     | ⚠️ DIVERGENCE +21% (fandom probable JP values) |
| **M. Attack**             | 42                       | **48**     | ⚠️ DIVERGENCE +14%                             |
| **DF / MDF**              | 130/90                   | 130/90     | Match                                          |
| **SPD**                   | 50                       | 50         | Match                                          |
| **Gold JP**               | (silent)                 | 11         | Fandom canon JP ÷3 pattern                     |
| **~Flying Kick / Bounce** | ~Flying Kick (community) | **Bounce** | Fandom canon name officiel — adopter           |

→ Wiki tier 2 US prévaut pour stats. Fandom prévaut pour names canon + appearance + Total Vanishing clarification.

## Gaps / TODO

Voir [TODO.md](../../TODO.md) section Beastie Dragon.
