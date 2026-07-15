# Flabby Troll — wiki LoD (verbatim)

> **Source** : [The Legend of Dragoon Wiki — Flabby Troll](https://legendofdragoon.org/wiki/Flabby_Troll)
> **Fiabilité** : 🥈 **tier 2** (wiki LoD legendofdragoon.org — stats + AI + Counter + Encounters précis).
> **Sauvegardé le** : 2026-05-25.
> **Usage** : référence canon **Flabby Troll** (Minor Enemy Earth Undersea Cavern Disc 2). ⭐⭐⭐ **~Shield Thwacking NEW canon MAJEUR** : 100% Fear proc Party Non-Elemental magic + **M-AV reduces status canon NEW MAJEUR** (premier ingestion M-AV reduces parallel A-AV pattern récurrent). + ⭐⭐⭐ **Knight Shield 2% drop CROSS-MOB source CONFIRMED** : cohérent existing Dragon Soldier Knight Shield 2% canon — 2 sources farming canon (Dragon Soldier Disc 3 + Flabby Troll Disc 2). + ⭐⭐ **Counter 0 No Counter tier** confirmé cohérent existing pattern. + ⭐⭐ **Undersea Cavern location canon Disc 2** cohérent existing canon (Glare/Mermaid/Screw Shell/Sea Piranha/Lenus/Regole partners). + ⭐⭐ **Mermaid partner mob canon NEW** Undersea mixed formation. + ⭐⭐ **Status 4/4 standard Minor Enemy** (Petrify/Bewitch/Arm Block/Dispirit ✔ vs Confuse/Fear/Poison/Stun ✗). + ⭐⭐ **AI 2-phase** : ~Club (>25%) + ~Shield Thwacking (≤50% Party Non-Elemental magic 100% Fear).

---

## Description canon

**Flabby Troll** is a **Minor Enemy**.

## Element canon

- **Earth** ⭐ (cohérent thematic troll earth-creature)

## Stats canon (US wiki tier 2)

| Stat | Wiki US | Notes                               |
| ---- | ------- | ----------------------------------- |
| HP   | **560** | Moderate-high HP Minor Enemy Disc 2 |
| AT   | **52**  | Moderate Attack                     |
| DF   | **60**  | Low Defense                         |
| MAT  | **33**  | Low Magical                         |
| MDF  | **60**  | Low MDF                             |
| SPD  | **50**  | Slow                                |
| A-AV | 0%      | Standard Minor                      |
| M-AV | 0%      | Standard Minor                      |

⚠️ **Pattern "fragile high HP slow" canon Flabby Troll ⭐** :

- HP 560 moderate-high + DF/MDF 60 low → fragile mais durable
- AT 52 moderate + MAT 33 low → physical-focused offensive
- SPD 50 slow → late-turn often
- Pattern Damia : `FlabbyTrollStats { hp: 560; df: 60; mdf: 60; spd: 50 }` data-model canon

## Status Immunity canon (4/4 standard pattern)

| Petrify | Bewitch | Arm Block | Dispirit | Confuse | Fear | Poison | Stun |
| ------- | ------- | --------- | -------- | ------- | ---- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | ✗       | ✗    | ✗      | ✗    |

Pattern Minor Enemy 4/4 standard canon récurrent.

## Yield canon

- **EXP : 84** + **Gold : 30** + **Drop : Knight Shield 2%** ⭐⭐⭐ canon

### Knight Shield 2% drop CROSS-MOB source CONFIRMED ⭐⭐⭐

- **Knight Shield** = existing item canon ✓ (cohérent existing Dragon Soldier Knight Shield 2% canon)
- ⭐⭐ **Flabby Troll = 2ème source Knight Shield farming canon Damia** (cohérent Dragon Soldier Disc 3 Tower of Flanvel source)
- 2% drop rate canon (cohérent Dragon Soldier 2% same rate)
- Pattern Damia : multi-source farming canon Knight Shield (Dragon Soldier Disc 3 + Flabby Troll Disc 2)
- À cross-référer `items/Knight Shield.md` (à créer/vérifier) — accessory canon Damia + drop sources cross-mob

## Counter Opportunities (0) — NO COUNTER tier ⭐ confirmé

**(0)** — **No counter** tier (cohérent existing canon Air Combat / Feyrbrand / Fire Bird / Canbria Dayfly / Drake the Bandit boss group).

Pattern Damia : Counter 0 No counter tier — Flabby Troll = 5ème instance Minor Enemy no counter canon Damia.

## AI canon (2-phase Club + Shield Thwacking)

| HP    | Action                   | Target | Effect                                                            | Notes                                                                |
| ----- | ------------------------ | ------ | ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| > 25% | **~Club**                | Single | 1× Physical damage                                                | Community approximation (~)                                          |
| ≤ 50% | **~Shield Thwacking** ⭐ | Party  | **1× Non-Elemental magic damage + 100% chance Fear** ⭐ NEW canon | **Target's M-AV reduces chance to receive status** ⭐⭐⭐ NEW MAJEUR |

⚠️ **Pattern AI canon mob 2-phase NEW MAJEUR ⭐⭐⭐** :

- **Phase 1 (HP > 25%)** : ~Club (1× phys baseline)
- **Phase 2 (HP ≤ 50%)** : **~Shield Thwacking** (1× Non-Elemental magic Party + 100% Fear proc — M-AV reduces)
- ⚠️ **HP overlap zone canon** : 25-50% overlap (Club + Shield Thwacking)

### ~Shield Thwacking NEW canon ability MAJEUR ⭐⭐⭐

- **~Shield Thwacking** = community approximation ≤50% phase ability
- **1× Non-Elemental magic Party AoE + 100% Fear proc** ⭐⭐⭐ NEW canon
- Pattern Damia : `ShieldThwackingAbility { type: 'magic-party-aoe'; multiplier: 1; element: 'non-elemental'; statusProc: { type: 'Fear'; chance: 1.0 } }` data-model canon NEW
- ⚠️ **First 100% Fear proc Party canon ingestion Damia** ⭐⭐⭐ MAJEUR
- Pattern thematic "troll shield thwacks Party + induces fear" canon
- À implémenter ability `shieldThwacking` Damia (canon NEW Party Fear 100% proc)

### M-AV reduces status proc canon NEW MAJEUR ⭐⭐⭐

- **Target's M-AV reduces chance to receive status ailment** canon NEW
- ⚠️ Pattern Damia : **M-AV reduces status proc canon NEW MAJEUR** — premier ingestion M-AV reduces ability canon Damia (parallel pattern A-AV reduces canon récurrent — Caterpillar boss + Crystal Golem mob + Earth Shaker mob)
- Pattern Damia : **M-AV reduces magic-based status proc** (vs A-AV reduces physical-based status proc) — pattern symmetric canon NEW
- À cross-référer pattern existing A-AV/M-AV reduces status canon : M-AV reduces Fear (magic-based) vs A-AV reduces Stun (physical-based) — pattern element-based reduction canon NEW
- Pattern Damia : `MAVReducesStatusProc` mechanic canon NEW

### ~Club canon name (community)

- **~Club** = community approximation > 25% baseline
- 1× physical baseline
- Pattern thematic "flabby troll club attack" canon

## Encounters canon

### Undersea Cavern (Disc 2) — Multi-submap location canon

| Encounter Formation (ID)    | Submap IDs    | Encounter%    | Escape% |
| --------------------------- | ------------- | ------------- | ------- |
| Flabby Troll (124)          | 305           | 10%           | 30%     |
| Mermaid, Flabby Troll (128) | 302, 303, 305 | 20%, 35%, 35% | 30%     |

⚠️ **Undersea Cavern location canon Disc 2 ⭐⭐** :

- **Undersea Cavern** = existing location canon Disc 2 (cohérent existing Glare + Mermaid + Screw Shell + Sea Piranha + Lenus + Regole canon)
- 3 submaps spawn Flabby Troll : 305 (solo 10%) + 302/303/305 (mixed Mermaid 20-35%)
- **Mermaid partner mob canon** ✓ cohérent existing canon Undersea Cavern

### Escape rate 30% canon

- **30% escape rate** Undersea Cavern moderate-low Disc 2

### No World Map Road encounters

- Flabby Troll = **Undersea Cavern exclusive** canon

## Gallery / Trivia / References

(Article wiki sections présentes — détails à investiguer future)
