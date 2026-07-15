# Crescent Bee — wiki LoD (verbatim)

> **Source** : [legendofdragoon.org wiki — Crescent Bee](https://legendofdragoon.org/wiki/Crescent_Bee)
> **Fiabilité** : 🥈 **tier 2** (wiki interne communauté Damia/Wulves)
> **Sauvegardé le** : 2026-05-22.
> **Usage** : référence canon Minor Enemy Crescent Bee (**Wind Prairie Disc 1** + 3 World Map roads canon). ⭐ **A-AV 20% NEW canon ⭐ MAJEUR** (vs Crafty Thief 5%, Canbria Dayfly 10%) — pattern tier A-AV étendu canon. ⭐ **Spinning Gale drop confirme Spell Item canon NEW** — ability + drop shared name pattern canon (cohérent Burn Out Commander Seles + Canbria Dayfly Spinning Gale ability). ⭐ **Recolor of Stinger Barrens canon NEW Trivia** ⭐.

---

## Stats canon ⚠️ Damia adopt JP canon (à confirmer fandom)

| Aspect                  | Value (US/EU)  | Damia adopt (JP probable) | Notes                                 |
| ----------------------- | -------------- | ------------------------- | ------------------------------------- |
| **Element**             | **Wind**       | —                         | Pattern Wind insect Prairie canon     |
| **Counters Additions?** | **Yes**        | —                         | Counter 28                            |
| HP                      | 9              | (JP ~11 à confirmer)      | Pattern minimal stats +1-2 unit canon |
| AT                      | 5              | —                         |                                       |
| DF                      | 100            | —                         |                                       |
| **A-AV**                | **20%** ⭐ NEW | —                         | Higher A-AV tier canon                |
| SPD                     | 60             | —                         |                                       |
| MAT                     | 5              | —                         |                                       |
| MDF                     | 100            | —                         |                                       |
| M-AV                    | 0%             | —                         |                                       |

⚠️ **A-AV 20% NEW canon ⭐ MAJEUR** :

- Higher A-AV tier ingestion canon Damia (vs Crafty Thief 5%, Canbria Dayfly 10%)
- Pattern A-AV tier mapping étendu canon : 0% / 5% / 10% / **20%** / 50%
- Pattern thematic "flying bee evasive" canon
- Implication player : 20% miss physical attacks vs Crescent Bee

## Status Immunity (standard mob 4/4)

| Petrify | Bewitch | Arm Block | Dispirit | Confuse | Fear | Poison | Stun |
| ------- | ------- | --------- | -------- | ------- | ---- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | X       | X    | X      | X    |

Pattern mob standard : 4 immune (Petrify/Bewitch/Arm Block/Dispirit) / 4 vulnerable (Confuse/Fear/Poison/Stun).

## Yield

| EXP | Gold | Drops                   |
| --- | ---- | ----------------------- |
| 10  | 6    | **Spinning Gale 8%** ⭐ |

⚠️ **Spinning Gale 8% drop confirme Spell Item canon NEW MAJEUR ⭐⭐** :

- **Spinning Gale = Spell Item** canon confirmed (cohérent Canbria Dayfly Spinning Gale ability 1.5× Wind magic)
- **Pattern ability name = Spell Item drop name canon** ⭐ — récurrent canon TLoD :
  - **Burn Out** : ability Commander Seles + Spell Item drop Commander Seles
  - **Spinning Gale** : ability Canbria Dayfly + Spell Item drop Crescent Bee
- À documenter `items/consumables.md` (à créer) Spinning Gale Spell Item Wind 1.5× magic damage

## Counter Opportunities (28) — high-density tier mob standard

## Combat

### Encounters

| Encounter Formation (ID)        | In Location (Submap ID) | Encounter% | Escape% |
| ------------------------------- | ----------------------- | ---------- | ------- |
| Crescent Bee (12)               | Prairie (38, 42)        | 10%, 20%   | 80%     |
| Vampire Kiwi, Crescent Bee (15) | Prairie (38, 43)        | 35%, 35%   | 80%     |
| Mantis, Crescent Bee (16)       | Prairie (39)            | 35%        | 80%     |

| Encounter Formation (ID) | On World Map Road                                                    | Encounter% | Escape% |
| ------------------------ | -------------------------------------------------------------------- | ---------- | ------- |
| Crescent Bee (12)        | Prairie → Intersection / Prairie → Forest / Prairie → Limestone Cave | ?%         | 80%     |

⚠️ **Prairie Disc 1 location canon ⭐** :

- Crescent Bee submaps Prairie : 38, 39, 42, 43
- Partner mobs : **Vampire Kiwi NEW** + **Mantis NEW** — Prairie mobs ecosystem canon Disc 1
- **3 World Map roads canon Prairie hub Disc 1** :
  - **Prairie → Intersection**
  - **Prairie → Forest**
  - **Prairie → Limestone Cave**
- Pattern Prairie = hub Disc 1 transit canon (cohérent post-Forest Seles)

⚠️ **Escape rate 80% canon ⭐** :

- Disc 1 high escape rate (vs Forest 90% / Mountain 30%)
- Pattern early Disc 1 player learning curve canon

⚠️ **Vampire Kiwi NEW mob canon** + **Mantis NEW mob canon** ⭐ :

- Both Prairie Disc 1 mobs canon
- À documenter `mobs/Vampire Kiwi.md` + `mobs/Mantis.md` (à créer)

### Abilities — AI 2-phase Wind ⭐ Spinning Gale ability

> Minor enemies act on their turn based primarily on their current HP.

| HP    | Action            | Target | Effect                                  |
| ----- | ----------------- | ------ | --------------------------------------- |
| > 50% | ~Needle Prick     | Single | 1× Physical damage                      |
| ≤ 50% | **Spinning Gale** | Single | **1.5× Wind-elemental magic damage** ⭐ |

\* As most abilities do not have official names, the community came up with approximate names marked with an ~.

⚠️ **AI 2-phase canon Wind ⭐** :

- **Phase 1 (HP > 50%)** : ~Needle Prick (1× phys basic)
- **Phase 2 (HP ≤ 50%)** : **Spinning Gale** (1.5× Wind-elemental magic) ⭐

⚠️ **Spinning Gale canon name officiel ⭐ MAJEUR** :

- **Same canon name as Canbria Dayfly ability** (cohérent existing canon)
- **1.5× Wind-elemental magic damage** ⭐ — pattern Attack Multiplier 1.5× canon
- **Same name as Spell Item drop** (cohérent ability + item shared name canon)
- À implémenter ability `spinningGale` Damia shared cross-mob (cohérent existing canon Canbria Dayfly)

### ~Needle Prick canon name (community)

- **~Needle Prick** = community approximation > 50% phase ability (1× phys)
- Pattern thematic "bee stinger needle" canon

## Gallery / Trivia / References

### Trivia canon ⭐ NEW MAJEUR

> Their model is a **recolor of Stinger located in Barrens**.

⚠️ **Recolor canon Stinger NEW ⭐ MAJEUR** :

- **Crescent Bee = recolor of Stinger** (Barrens Disc 2 mob)
- Pattern recolor mob canon récurrent (cohérent existing pattern : Assassin Cock/Fowl Fighter, Plague Rat/Berserk Mouse, Wyvern/Air Combat, etc.)
- À documenter `mobs/Stinger.md` (à créer) — Barrens Disc 2 mob Crescent Bee model source canon
- Pattern visual reuse TLoD canon récurrent
