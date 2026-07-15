# Cactus — wiki LoD (verbatim)

> **Source** : [legendofdragoon.org wiki — Cactus](https://legendofdragoon.org/wiki/Cactus)
> **Fiabilité** : 🥈 **tier 2** (wiki interne communauté Damia/Wulves)
> **Sauvegardé le** : 2026-05-22.
> **Usage** : référence canon Minor Enemy Cactus (**Earth Death Frontier Disc 4** + Ulara roads). ⭐ **Counter Opportunities (16) Minor Enemy NEW ⭐ MAJEUR** — Counter 16 NOT exclusive Jars (previously thought) — Cactus = first Minor Enemy Counter 16 canon. **Stats balanced AT=MAT 67 / DF=MDF 150** (unique pattern). **Encounter "Contact" mechanic** Death Frontier visible mob canon (cohérent locations/Death Frontier.md Collision Encounter mention). **Drop Recovery Ball 15% NEW item canon** + drop rate 15% high (vs 8% standard). **2-phase AI simple** ~Bite > 50% / ~Thousand Needles 3× phys ≤ 50%.

---

## Stats canon ⚠️ Damia adopt JP canon (à confirmer fandom)

| Aspect                  | Value (US/EU)   | Damia adopt (JP probable)  | Notes                          |
| ----------------------- | --------------- | -------------------------- | ------------------------------ |
| **Element**             | **Earth**       | —                          | Pattern Earth desert mob canon |
| **Counters Additions?** | **Yes**         | —                          |                                |
| HP                      | 320             | (JP +25% ~400 à confirmer) | Damia adopt JP fallback US 320 |
| AT                      | **67**          | —                          | Equal MAT (rare balanced)      |
| DF                      | **150** ⚠️ high | —                          | DF anti-physical high          |
| A-AV                    | 0%              | —                          |                                |
| SPD                     | 60              | —                          |                                |
| MAT                     | **67**          | —                          | Equal AT (rare balanced)       |
| MDF                     | **150** ⚠️ high | —                          | MDF anti-magic high            |
| M-AV                    | 0%              | —                          |                                |

⚠️ **Pattern "balanced tank" canon ⭐** : Cactus stats AT=MAT=67 + DF=MDF=150 = unique pattern symmetric. Mob anti-physical AND anti-magic high defenses. Pattern Disc 4 Death Frontier mob design "tough generalist" canon.

## Status Immunity (standard 4/4 mob pattern)

| Petrify | Bewitch | Arm Block | Dispirit | Confuse | Fear | Poison | Stun |
| ------- | ------- | --------- | -------- | ------- | ---- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | X       | X    | X      | X    |

Pattern mob standard : 4 immune (Petrify/Bewitch/Arm Block/Dispirit) / 4 vulnerable (Confuse/Fear/Poison/Stun).

## Yield

| EXP | Gold | Drops             |
| --- | ---- | ----------------- |
| 126 | 36   | Recovery Ball 15% |

⚠️ **EXP 126 / Gold 36** Disc 4 mob yield (cohérent mid-late game progression).

⚠️ **Drop Recovery Ball 15% NEW item canon ⭐** :

- **Recovery Ball NEW canon item** — pattern Spell Item probable (cohérent Attack Ball Bowling Spell Item canon)
- **15% drop rate ⭐ high** (vs 8% standard mob drops, 10% early-mob, 2% accessory) — Cactus high drop rate canon
- À documenter `items/consumables.md` (à créer) Recovery Ball entry — probable healing-cast Spell Item
- Cohérent existing Spirit Potion / Recovery Ball references (TODO ligne 1046 mention "Recovery Ball 100 random" Magic Damage SP grants)

## Counter Opportunities ⭐ NEW Minor Enemy Counter 16 ⭐ MAJEUR

**(16)** — ⭐ **NEW canon : Minor Enemy avec Counter 16** ⭐ — Previously thought "Counter 16 = exclusive Unique Jar tier" (Lucky Jar/Cursed Jar/Treasure Jar). Cactus = first Minor Enemy Counter 16 confirmed canon.

### Counter Opportunities tier mapping canon Damia updated

| Tier                     | Total  | Examples canon                                                            |
| ------------------------ | ------ | ------------------------------------------------------------------------- |
| **High density**         | 28     | Aqua King, Archangel, Berserk Mouse, Berserker, Atlow, Blue Bird, etc.    |
| **Mid density**          | 19     | Assassin Cock                                                             |
| **Mid-low** ⭐ NEW Minor | **16** | Lucky Jar, Cursed Jar, Treasure Jar (Unique Jars) + **Cactus (Minor)** ⭐ |
| **Low density**          | 9      | Arrow Shooter                                                             |
| **Lowest**               | 4      | Bowling                                                                   |
| **No counter**           | 0      | Air Combat, Feyrbrand, Fire Bird                                          |

⚠️ **Counter 16 NOT exclusive Unique Jars** ⭐ — Cactus = Minor Enemy Earth Death Frontier Disc 4 avec Counter 16 = pattern tier 16 partagé canon. Pattern Counter tier per-mob assigned NOT category-correlated.

### Détails Counter (16) — non documentés Damia per user instruction

- Dart Volcano (2), Dart Crush Dance (2, 3), Lavitz Gust (2), Lavitz Flower Storm (2,3,4,5,6), Rose Hard Blade (2), Rose Demon's Dance (4,5), Meru Cool Boogie (3), Meru Perky Step (2), Albert Gust (2), Albert Flower Storm (2) — total 16 button presses / 10 abilities.

## Combat

### Encounters

| Encounter Formation (ID) | In Location (Submap ID)             | Encounter%  | Escape% |
| ------------------------ | ----------------------------------- | ----------- | ------- |
| Cactus ×2 (456)          | Death Frontier (748, 755, 763, 769) | **Contact** | 30%     |

| Encounter Formation (ID) | On World Map Road                                | Encounter% | Escape% |
| ------------------------ | ------------------------------------------------ | ---------- | ------- |
| Cactus ×2 (456)          | Death Frontier → Ulara / Ulara → Home of Giganto | ?%         | 30%     |

⚠️ **"Contact" encounter mechanic Death Frontier canon ⭐** :

- Pattern **Contact-type encounter** (visible mob contact-trigger) — cohérent existing `locations/Death Frontier.md:3` "**Collision Encounter** (mobs visibles + contact = battle, comme Phantom Ship)"
- Distinct **"Contact (arrows)" Berserker** (Home of Gigantos arrow traps) — Cactus = plain "Contact" (mob visible contact)
- Pattern Death Frontier desert mob visible canon : Cactus + autres mobs Earth/Wind Death Frontier
- À implémenter `EncounterMechanic = 'random' | 'contact-arrows' | 'contact-visible-mob'` data-model

⚠️ **Cactus ×2 unique formation canon** — Cactus uniquement spawns par paires (formation 456), pas de solo ni autres partners canon.

⚠️ **World Map roads bidirectional canon ⭐** :

- **Death Frontier → Ulara** road (entrance Disc 4 Wingly hidden city)
- **Ulara → Home of Giganto** road ⚠️ unusual reverse direction (vs Mountain → Evergreen directional canon)
- Pattern : Cactus = roaming mob roads Death Frontier-Ulara-Home of Giganto Disc 4

⚠️ **Escape rate 30%** = standard mob rate.

### Abilities — AI 2-phase simple

> Minor enemies act on their turn based primarily on their current HP. Additional criteria, if any, is annotated on the table.

| HP    | Action            | Target | Effect                    |
| ----- | ----------------- | ------ | ------------------------- |
| > 50% | ~Bite             | Single | 1× Physical damage        |
| ≤ 50% | ~Thousand Needles | Single | **3× Physical damage** ⚠️ |

\* As most abilities do not have official names, the community came up with approximate names marked with an ~.

⚠️ **AI 2-phase simple canon Cactus** :

- **Phase 1 (HP > 50%)** : ~Bite (1× phys basic)
- **Phase 2 (HP ≤ 50%)** : ~Thousand Needles (**3× phys** ⚠️ high damage)
- Pattern "wounded mob more dangerous" canon (cohérent Air Combat/Berserker/Bowling All-out Attack 3× phys pattern récurrent)
- Pas de Charging Spirit telegraph — Cactus AI plus simple direct escalation

### ~Bite + ~Thousand Needles canon names (community)

- **~Bite** = community approximation > 50% phase ability (1× phys basic)
- **~Thousand Needles** = community approximation ≤ 50% phase ability (3× phys) — pattern thematic "cactus thousand needles" Final Fantasy reference probable
- Pattern thematic "cactus shoots its needles when wounded" canon

## Description

> Cactus is a Minor Enemy.

(Wiki description minimal — fandom probable plus narrative.)

## Gallery / Trivia / References

(Sections wiki vides.)
