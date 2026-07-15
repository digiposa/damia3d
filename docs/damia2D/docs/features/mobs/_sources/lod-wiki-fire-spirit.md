# Fire Spirit — wiki LoD (verbatim)

> **Source** : [The Legend of Dragoon Wiki — Fire Spirit](https://legendofdragoon.org/wiki/Fire_Spirit)
> **Fiabilité** : 🥈 **tier 2** (wiki LoD legendofdragoon.org — stats + AI + Counter + Encounters + Passive + variants précis).
> **Sauvegardé le** : 2026-05-25.
> **Usage** : référence canon **Fire Spirit** (Minor Enemy Fire Volcano Villude Disc 1). ⭐⭐⭐ **2 variants Fire Spirit (I) / (II) canon NEW MAJEUR** : visually indistinguishable + identical otherwise, AT 8/9 + Spirit Cloak drop 10%/2%. + ⭐⭐⭐ **Status all 8 ✔ Minor canon récurrent** (3ème instance : Bowling + Crystal Golem + Fire Spirit). + ⭐⭐⭐ **Passive Fire Immunity Mob canon NEW MAJEUR** : Fire-elemental magic damage reduced to 0 (rare Minor passive canon — cohérent existing Instant Death Immunity Commander Marshland + Crystal Golem). + ⭐⭐⭐ **HP recovers 30% Max HP = 7 HP — 5ème cross-mob/boss instance CONFIRMS** (26 × 30% = 7.8 ≈ 7 floor canon). + ⭐⭐ **Spirit Cloak NEW item canon** (Fire equipment probable). + ⭐⭐ **Dual A-AV/M-AV 20% canon** (2ème instance dual-AV après Fairy 10%). + ⭐⭐ **Volcano Villude location canon** + Salamander partner mob NEW. + ⭐⭐ **Counter 19 Mid density tier** (cohérent existing Assassin Cock). + ⭐⭐ **Variant-conditional spawn canon NEW** : "Fire Spirit (II) only appears when there are two Fire Spirits".

---

## Description canon ⭐⭐⭐ 2 variants reveal

⭐⭐⭐ **2 variants Fire Spirit canon NEW MAJEUR** :

> "There are two variants that appear in combat, but they are visually indistinguishable in game. Otherwise identical, one has 8 AT and a 10% drop chance while the other has 9 AT and a 2% drop chance. The Fire Spirit with a lower drop rate only appears when there are two Fire Spirits."

- **Fire Spirit (I)** : AT 8 + Spirit Cloak 10% drop — appears solo + mixed
- **Fire Spirit (II)** : AT 9 + Spirit Cloak 2% drop — **only when 2 Fire Spirits spawn**
- ⚠️ Pattern Damia : **variant-conditional spawn canon NEW** (Fire Spirit II conditional on duo formation)
- Pattern Damia : variant canon = subtle stat/drop differences (visual identical) — NEW canon variant mechanic
- À implémenter Damia : variant-based spawn canon (Fire Spirit I solo + duo / Fire Spirit II only in duo)

## Element canon

- **Fire** ⭐ (cohérent thematic Fire spirit Volcano Villude)

## Stats canon (US wiki tier 2)

| Stat | Wiki US (I)  | Wiki US (II) | Notes                                     |
| ---- | ------------ | ------------ | ----------------------------------------- |
| HP   | **26**       | 26           | Very low HP Minor Enemy Disc 1            |
| AT   | **8**        | **9** ⭐     | ⚠️ Variant differ (+1 AT II)              |
| DF   | **100**      | 100          | High Defense anti-physical                |
| MAT  | **13**       | 13           | Very low Magical                          |
| MDF  | **160** ⭐⭐ | 160          | **Very high MDF anti-magic** ⭐⭐         |
| SPD  | **60**       | 60           | Moderate                                  |
| A-AV | **20%** ⭐   | 20%          | **High A-AV** (status proc reduction)     |
| M-AV | **20%** ⭐   | 20%          | **High M-AV** (NEW dual-AV 2ème instance) |

⚠️ **Pattern "fragile dual-AV tank anti-magic" canon Fire Spirit ⭐⭐** :

- **HP 26 very low** + **DF 100 + MDF 160** → fragile mais resistant
- **Dual A-AV/M-AV 20%** → dual dodge canon NEW 2ème instance (vs Fairy 10%)
- **MAT 13 very low** → faible offensive magique
- Pattern Damia : `FireSpiritStats { hp: 26; df: 100; mdf: 160; aAv: 0.20; mAv: 0.20 }` data-model

## Status Immunity canon (all 8 ✔ Boss-tier Minor récurrent) ⭐⭐⭐

| Petrify | Bewitch | Arm Block | Dispirit | Confuse | Fear | Poison | Stun |
| ------- | ------- | --------- | -------- | ------- | ---- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | ✔       | ✔    | ✔      | ✔    |

⚠️ **Pattern Minor Enemy all 8 ✔ Boss-tier canon récurrent ⭐⭐⭐ 3ème instance** :

- Cohérent existing **Bowling** + **Crystal Golem** canon (all 8 ✔ Minor)
- Fire Spirit = **3ème Minor Enemy all 8 ✔ ingestion canon Damia** ⭐
- Pattern Damia : Minor Enemy all 8 ✔ canon récurrent tier

## Yield canon

- **EXP : 13** + **Gold : 12** + **Drop : Spirit Cloak 10% (I) / 2% (II)** ⭐⭐ canon

### Spirit Cloak NEW item canon ⭐⭐

- **Spirit Cloak** = NEW item canon Damia (probable Fire equipment thematic)
- Drop rate variant : 10% (I) / 2% (II)
- À documenter `items/Spirit Cloak.md` (à créer/vérifier) — Fire equipment canon NEW

## Counter Opportunities (19) — MID DENSITY tier ⭐ confirmé 2ème instance

**(19)** — **MID DENSITY canon tier** (cohérent existing Assassin Cock canon — Fire Spirit = **2ème Minor Enemy Mid density tier ingestion canon Damia** ⭐).

### Counter list (12 entries detailed)

| User    | Addition           | Button Press  |
| ------- | ------------------ | ------------- |
| Dart    | Volcano            | 2             |
| Dart    | Crush Dance        | 2, 3          |
| Lavitz  | Gust of Wind Dance | 2             |
| Lavitz  | Flower Storm       | 2, 3, 4, 5, 6 |
| Rose    | Hard Blade         | 2             |
| Rose    | Demon's Dance      | 4, 5, 6       |
| Meru    | Cool Boogie        | 3             |
| Meru    | Cat's Cradle       | 3             |
| Meru    | Perky Step         | 2             |
| Haschel | Summon 4 Gods      | 2             |
| Albert  | Gust of Wind Dance | 2             |
| Albert  | Flower Storm       | 2             |

Per user instruction : feature Counter non-implémentée Damia, factual tier mention only.

## Passive Fire Immunity canon NEW MAJEUR ⭐⭐⭐

| Passive           | Effect                                              |
| ----------------- | --------------------------------------------------- |
| **Fire Immunity** | **Fire-elemental magic damage reduced to 0** ⭐ NEW |

⚠️ **Passive Fire Immunity Mob canon NEW MAJEUR ⭐⭐⭐** :

- ⭐⭐⭐ **Fire-elemental magic damage reduced to 0** canon NEW
- ⚠️ Pattern Damia : Mob passive canon récurrent (cohérent existing Instant Death Immunity Commander Marshland + Crystal Golem)
- Pattern thematic "Fire Spirit immune to own element" canon
- Pattern Damia : `FireImmunityPassive { effect: 'fire-magic-damage-zero' }` data-model canon NEW
- À implémenter passive `fireImmunity` Damia (canon NEW Mob passive)
- À cross-référer pattern : autres elemental-immunity passives canon (Water Immunity ? Earth ? etc.)

## AI canon (2-phase Twin Slap + HP recovers)

| HP    | Action          | Target | Effect                  | Notes                                |
| ----- | --------------- | ------ | ----------------------- | ------------------------------------ |
| > 25% | **~Twin Slap**  | Single | 1× Physical damage      | Community approximation (~)          |
| ≤ 50% | **HP recovers** | Self   | **Restores 30% (7) HP** | 5ème cross-mob/boss instance formula |

⚠️ **Pattern AI canon mob 2-phase HP recovers ⭐⭐** :

- **Phase 1 (HP > 25%)** : ~Twin Slap (1× phys baseline)
- **Phase 2 (HP ≤ 50%)** : HP recovers (30% Max HP = 7 HP self-heal)
- ⚠️ Pattern overlap zone HP 25-50% (Twin Slap + HP recovers possible)

### HP recovers 30% formula CONFIRMS 5ème cross-mob/boss instance ⭐⭐⭐

- **HP recovers** = canon name officiel (cohérent existing cross-mob/boss canon)
- **30% Max HP = 7 HP** (Fire Spirit US 26 × 30% = 7.8 ≈ **7 floor** ⚠️ NEW canon floor behavior)
- ⚠️ Pattern **30% scaling formula canon ✓ CONFIRMED 5ème instance cross-mob/boss + FLOOR behavior NEW** :
  - Crystal Golem US 160 × 30% = 48 ✓ / JP 200 × 30% = 60 ✓
  - Dragon Soldier US 488 × 30% = 146 ✓
  - Drake the Bandit US 1200 × 30% = 360 ✓ (single-use variant)
  - Fairy US 320 × 30% = 96 ✓
  - **Fire Spirit US 26 × 30% = 7.8 → floor 7 ✓** ⚠️ NEW floor behavior reveal
- Pattern Damia : `HpRecoversAbility` data-model canon shared cross-mob/boss + **floor() rounding canon NEW**

### ~Twin Slap canon name (community)

- **~Twin Slap** = community approximation > 25% phase ability
- 1× physical baseline
- Pattern thematic "fire spirit twin slap attack" canon

## Encounters canon

### Volcano Villude (Disc 1) — Multi-submap location canon

| Encounter Formation (ID)               | Submap IDs                   | Encounter%                   | Escape% |
| -------------------------------------- | ---------------------------- | ---------------------------- | ------- |
| Fire Spirit (I) (43)                   | 117, 123                     | 10%, 10%                     | 50%     |
| Fire Spirit (I), Fire Spirit (II) (47) | 115, 116, 117, 121, 122, 123 | 20%, 35%, 35%, 35%, 35%, 20% | 50%     |
| Fire Spirit (I), Salamander (48)       | 116, 117, 118, 122, 123      | 20%, 35%, 35%, 35%, 35%      | 50%     |

⚠️ **Volcano Villude location canon Disc 1 ⭐⭐** :

- **Volcano Villude** = existing location canon Disc 1 (cohérent existing canon database mentions)
- 6 submaps spawn Fire Spirit (115-123 range)
- **Salamander partner mob canon** ✓ cohérent existing canon
- ⭐ Fire Spirit (II) variant-conditional spawn canon (only formation 47 mixed)

### Escape rate 50% canon

- **50% escape rate** Volcano Villude canon (moderate-high Disc 1)
- Pattern Damia : Volcano Villude moderate-high escape canon

### No World Map Road encounters

- Fire Spirit = **Volcano Villude exclusive** canon

## Gallery / Trivia / References

(Article wiki sections présentes — Trivia + References détails à investiguer future)
