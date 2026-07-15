# Fairy — wiki LoD (verbatim)

> **Source** : [The Legend of Dragoon Wiki — Fairy](https://legendofdragoon.org/wiki/Fairy)
> **Fiabilité** : 🥈 **tier 2** (wiki LoD legendofdragoon.org — stats + AI + Counter + Encounters précis).
> **Sauvegardé le** : 2026-05-25.
> **Usage** : référence canon **Fairy** (Minor Enemy Light Kadessa Disc 3). ⭐⭐⭐ **Trans Light cross-mob canon CONFIRMED MAJEUR** (cohérent existing Crystal Golem Trans Light canon — Light element shared ability cross-mob canon). + ⭐⭐⭐ **Dancing Ray NEW ability canon MAJEUR** (1× Light magic Party — canon name officiel no ~ marker). + ⭐⭐⭐ **HP recovers 30% Max HP = 96 HP CONFIRMS formula** (320 × 30% = 96 ✓ — **4ème cross-mob/boss instance** : Crystal Golem 48/60 + Dragon Soldier 146 + Drake 360 + Fairy 96). + ⭐⭐ **Sun Rhapsody 8% drop canon** (Light Spell Item probable). + ⭐⭐ **Kadessa Puck partner mob canon** (cohérent existing Kadessa partners). + ⭐⭐ **Dual A-AV/M-AV 10% tier canon NEW** (moderate dodge dual canon). + ⭐⭐ **Counter 28 high-density tier confirmé**. + ⭐⭐ **Status 4/4 standard Minor Enemy** (Petrify/Bewitch/Arm Block/Dispirit ✔). + ⭐ **Light Minor Enemy 3ème ingestion canon Damia** (Crystal Golem + Fairy — Light mobs rare). + ⭐ **MDF 150 high anti-magic** + **DF 80 moderate** = physical favored counter.

---

## Description canon

**Fairy** is a **Minor Enemy**.

## Element canon

- **Light** ⭐ (rare canon Minor Enemy Damia — 3ème ingestion Light après Crystal Golem)
- Pattern thematic "fairy magical Light creature" canon

## Stats canon (US wiki tier 2)

| Stat | Wiki US      | Notes                                         |
| ---- | ------------ | --------------------------------------------- |
| HP   | **320**      | Moderate HP Minor Enemy Disc 3                |
| AT   | **43**       | Low Attack                                    |
| DF   | **80**       | Moderate Defense                              |
| MAT  | **57**       | Moderate Magical                              |
| MDF  | **150** ⭐⭐ | **High MDF anti-magic** ⭐⭐                  |
| SPD  | **70**       | Moderate-high                                 |
| A-AV | **10%** ⭐   | **Moderate A-AV** (status proc reduction)     |
| M-AV | **10%** ⭐   | **Moderate M-AV** (status proc reduction NEW) |

⚠️ **Pattern "balanced magical caster" canon Fairy ⭐⭐** :

- **MDF 150 high anti-magic** + **DF 80 moderate** → physical favored counter
- **MAT 57 moderate** + Trans Light 1.5× magic single → magical caster threat
- **Dual A-AV/M-AV 10%** → moderate dodge dual canon NEW
- Pattern Damia : `FairyStats { hp: 320; at: 43; df: 80; mat: 57; mdf: 150; spd: 70; aAv: 0.10; mAv: 0.10 }` data-model canon
- ⚠️ **Dual A-AV/M-AV NEW canon Mob** (vs single A-AV typical pattern)

## Status Immunity canon (4/4 standard pattern)

| Petrify | Bewitch | Arm Block | Dispirit | Confuse | Fear | Poison | Stun |
| ------- | ------- | --------- | -------- | ------- | ---- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | ✗       | ✗    | ✗      | ✗    |

Pattern Minor Enemy 4/4 standard canon.

## Yield canon

- **EXP : 81** + **Gold : 24** + **Drop : Sun Rhapsody 8%** canon

### Sun Rhapsody 8% drop canon ⭐⭐

- **Sun Rhapsody** = item canon Damia (Light Spell Item probable thematic)
- 8% drop rate canon
- Pattern Damia : Light element Spell Item canon (Fairy = Sun Rhapsody source canon)
- À cross-référer `items/Sun Rhapsody.md` (à créer/vérifier) — Light Spell Item canon

## Counter Opportunities (28) — HIGH DENSITY tier

**(28)** — cohérent existing canon HIGH DENSITY tier.

## AI canon (4-ability NEW Staff Smack + Trans Light + Dancing Ray + HP recovers)

| HP           | Action             | Target | Effect                                     | Notes                                               |
| ------------ | ------------------ | ------ | ------------------------------------------ | --------------------------------------------------- |
| > 50%        | **~Staff Smack**   | Single | 1× Physical damage                         | Community approximation (~)                         |
| ≤ 50%, > 25% | **Trans Light** ⭐ | Single | **1.5× Light-elemental magic damage** ⭐   | Canon name officiel (no ~) — cohérent Crystal Golem |
| ≤ 25%        | **Dancing Ray** ⭐ | Party  | **1× Light-elemental magic damage** ⭐ NEW | Canon name officiel (no ~) — NEW ability            |
| ≤ 25%        | **HP recovers**    | Self   | **Restores 30% (96) HP**                   | 4ème cross-mob/boss instance formula                |

⚠️ **Pattern AI canon mob 4-ability NEW MAJEUR ⭐⭐⭐** :

- **Phase 1 (HP > 50%)** : ~Staff Smack (1× phys baseline)
- **Phase 2 (HP ≤ 50%, > 25%)** : **Trans Light** (1.5× Light magic Single) ⭐ cohérent existing Crystal Golem
- **Phase 3 (HP ≤ 25%)** : **Dancing Ray** (1× Light magic Party) ⭐ NEW + **HP recovers** (30% self-heal)
- ⚠️ Pattern : phase ≤25% = 2 abilities possible (Dancing Ray + HP recovers — equal chance)

### Trans Light cross-mob canon CONFIRMED ⭐⭐⭐ cohérent Crystal Golem

- **Trans Light** = canon name officiel (NO ~ marker — canonical wiki)
- **1.5× Light-elemental magic damage Single**
- ⭐⭐⭐ **Cohérent existing Crystal Golem Trans Light canon** ✓ (Light element shared ability cross-mob canon)
- Pattern Damia : Trans Light = Light Family shared ability canon (Crystal Golem + Fairy both)
- Pattern thematic "Light energy transmission/transformation attack" canon
- À implémenter ability `transLight` Damia shared cross-mob Light family

### Dancing Ray NEW canon ability MAJEUR ⭐⭐⭐

- **Dancing Ray** = canon name officiel (NO ~ marker — canonical wiki)
- **1× Light-elemental magic damage Party AoE** ⭐ NEW
- Pattern thematic "dancing light rays Party AoE attack" canon
- Pattern Damia : `DancingRayAbility { type: 'magic-party-aoe'; multiplier: 1; element: 'light' }` data-model canon NEW
- À implémenter ability `dancingRay` Damia
- Pattern Light Party AoE canon NEW (cross-element Dragonfly Thunderbolt pattern parallel)

### HP recovers 30% formula CONFIRMS ⭐⭐ 4ème cross-mob/boss instance

- **HP recovers** = canon name officiel (cohérent existing cross-mob/boss canon)
- **30% Max HP = 96 HP** (Fairy US 320 × 30% = 96 ✓)
- ⚠️ Pattern **30% scaling formula canon ✓ CONFIRMED 4ème instance cross-mob/boss** :
  - Crystal Golem US 160 × 30% = 48 ✓ / JP 200 × 30% = 60 ✓
  - Dragon Soldier US 488 × 30% = 146 ✓
  - Drake the Bandit US 1200 × 30% = 360 ✓ (single-use variant)
  - Fairy US 320 × 30% = 96 ✓
- Pattern Damia : `HpRecoversAbility { type: 'self-heal'; healPercent: 0.3 }` data-model canon shared cross-mob/boss confirmed

### ~Staff Smack canon name (community)

- **~Staff Smack** = community approximation > 50% baseline
- 1× physical baseline
- Pattern thematic "fairy with staff smack" canon

## Encounters canon

### Kadessa (Disc 3) — Multi-submap location canon

| Encounter Formation (ID) | Submap IDs                        | Encounter%                        | Escape% |
| ------------------------ | --------------------------------- | --------------------------------- | ------- |
| Fairy (141)              | 394, 399, 404                     | 10%, 10%, 10%                     | 30%     |
| Fairy x2, Puck (149)     | 395, 396, 397, 400, 401, 402, 405 | 20%, 35%, 35%, 20%, 35%, 35%, 35% | 30%     |

⚠️ **Kadessa location canon Disc 3 ⭐⭐** :

- **Kadessa** = existing location canon Disc 3 (cohérent Grand Jewel + Spinninghead + Toad Stool + Gnome + Puck + S Virage canon)
- 10 submaps spawn Fairy : 394/399/404 (solo low 10%) + 395/396/397/400/401/402/405 (mixed Puck 20-35%)
- **Puck partner mob canon** ✓ cohérent existing canon Kadessa

### Escape rate 30% canon

- **30% escape rate** Kadessa canon (moderate-low Disc 3)
- Pattern Damia : Kadessa moderate-low escape canon

### No World Map Road encounters

- Fairy = **Kadessa exclusive** canon

## Gallery / Trivia / References

(Article wiki sections présentes mais détails à investiguer future)
