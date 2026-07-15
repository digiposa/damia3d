# Commander — wiki LoD (verbatim)

> **Source** : [legendofdragoon.org wiki — Commander](https://legendofdragoon.org/wiki/Commander)
> **Fiabilité** : 🥈 **tier 2** (wiki interne communauté Damia/Wulves)
> **Sauvegardé le** : 2026-05-22.
> **Usage** : ⭐ **DUAL-CLASSIFICATION canon ⭐ MAJEUR** — Commanders = officers Imperial Sandora canon. **Seles version = Boss** + **Marshland version = Minor Enemy** (same name, different stats + role). Both Disc 1 Darkness element.
>
> ⭐ **NEW Power Up boss mechanic canon MAJEUR ⭐** : Self-buff Auto Single-use disables current ability + enables new + increases other + Ignore Turn Order uses new ability immediately. Pattern boss "transformation buff" canon.
>
> ⭐ **NEW HP recovers boss ability canon** : Self-heal 30% HP <51% trigger.
>
> ⭐ **NEW Instant Death Immunity Minor Enemy passive canon ⭐** : Commander Marshland immune to Instant Death-proc (Gladius/Brass Knuckle/Indora's Axe weapons).
>
> ⭐ **Attack Ball 100% drop Commander Marshland ⭐** — confirme Attack Ball = Spell Item canon (cohérent Bowling Snowfield drop pattern). Pattern Spell Item drop 100% boss-like sur Mob.
>
> ⭐ **Escape 100% Commander Marshland NEW canon Mob ⚠️** — Minor Enemy with Escape 100% (cohérent Blue Bird Rare Monster 100%). Pattern thematic "scripted encounter player can flee" canon.

---

# Boss (Seles) — Disc 1 Commander

## Stats canon ⚠️ Damia adopt JP

| Aspect                  | Value (US/EU) | Damia adopt (JP probable) | Notes           |
| ----------------------- | ------------- | ------------------------- | --------------- |
| **Element**             | **Darkness**  | —                         |                 |
| **Counters Additions?** | **No** ⭐     | —                         | Counter 0       |
| HP                      | 14            | (JP +25% ~18 à confirmer) | Fallback US 14  |
| AT                      | 2             | —                         |                 |
| DF                      | 40            | —                         |                 |
| A-AV                    | 0%            | —                         |                 |
| SPD                     | 40            | —                         |                 |
| MAT                     | 4             | —                         | MAT > AT (rare) |
| MDF                     | 40            | —                         |                 |
| M-AV                    | 0%            | —                         |                 |

## Status Immunity all 8 ✔ (boss-tier standard)

| Petrify | Bewitch | Arm Block | Dispirit | Confuse | Fear | Poison | Stun |
| ------- | ------- | --------- | -------- | ------- | ---- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | ✔       | ✔    | ✔      | ✔    |

## Yield

| EXP | Gold | Drops         |
| --- | ---- | ------------- |
| 20  | 20   | Burn Out 100% |

⚠️ **Burn Out drop canon ⭐** : Spell Item Fire-elemental magic damage (cohérent ability name = drop name pattern). À documenter `items/consumables.md` (à créer) Burn Out entry — Spell Item Fire-magic.

## Counter Opportunities (0) — "Counters Additions? No"

## Encounters

| Encounter Formation (ID)                              | In Location (Submap ID) | Encounter%   | Escape% |
| ----------------------------------------------------- | ----------------------- | ------------ | ------- |
| Knight of Sandora (Seles) ×2, Commander (Seles) (384) | Seles (725)             | **Scripted** | 0%      |

⚠️ **Formation 384 = Commander + 2 Knights of Sandora canon Disc 1 Seles opening fight** ⭐.

## Traits — No passives

| Passives | Effects | Requires |
| -------- | ------- | -------- |
| None     | -       | -        |

⚠️ Pattern boss minimal passives Disc 1 (early game canon).

## Abilities — Boss AI "if → then" model ⭐ MAJEUR Power Up

| Action          | Target | Effect                                                                                                                                | Conditions                                                 |
| --------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| ~Sword Slash    | Single | 1× Physical damage                                                                                                                    | **Has not used Power Up**                                  |
| Burn Out        | Single | **1.2× Fire-elemental magic damage** ⭐                                                                                               | -                                                          |
| **Power Up** ⭐ | Self   | **Disables Sword Slash, enables Slash Twice, increases Burn Out damage to 1.5×**, then **ignores turn order** and uses Slash Twice ⭐ | **Knights of Sandora defeated**. **Auto**. **Single use**. |
| ~Slash Twice    | Single | **2× Physical damage**                                                                                                                | **Has used Power Up**                                      |
| HP recovers     | Self   | **Restores 30% (4) HP**                                                                                                               | **HP < 51%**                                               |

\* As most abilities do not have official names, the community came up with approximate names marked with an ~.

⚠️ **Power Up mechanic canon NEW MAJEUR ⭐⭐** :

- **Self-buff Auto Single-use** boss canon
- **Disables Sword Slash** (previous ability)
- **Enables Slash Twice** (new ability replacing)
- **Increases Burn Out damage** : 1.2× → **1.5×** Fire-elemental
- **Ignore Turn Order** = uses Slash Twice immediately post-Power Up
- Trigger condition : **Knights of Sandora defeated** ⭐ (story-canon trigger)
- Pattern boss "ability transformation buff" canon
- À implémenter `BossAbility { type: 'power-up'; disables; enables; modifies; postAction }` data-model

⚠️ **Burn Out 1.2× canon name ⭐** :

- `Burn Out` = canon name officiel (NOT ~ approximation) — Fire-elemental magic 1.2× damage
- Post Power Up : Burn Out damage → 1.5× (canon mechanic)
- Same name as item drop (item canon)

⚠️ **HP recovers self-heal canon ⭐** :

- 30% Max HP restore (= 4 HP)
- Trigger : HP < 51%
- Pattern boss self-heal canon Disc 1 (cohérent early boss design)

---

# Minor Enemy (Marshland) — Disc 1 Commander

## Stats canon ⚠️ Damia adopt JP

| Aspect                  | Value (US/EU) | Damia adopt (JP probable)    | Notes                                                           |
| ----------------------- | ------------- | ---------------------------- | --------------------------------------------------------------- |
| **Element**             | **Darkness**  | —                            |                                                                 |
| **Counters Additions?** | **Yes**       | —                            | Counter 28                                                      |
| HP                      | **128**       | (JP ~160 à confirmer fandom) | ⚠️ Cohérent wiki Bosses master "132" — minor stats divergence ? |
| AT                      | 11            | —                            |                                                                 |
| DF                      | **120** high  | —                            | DF anti-physical                                                |
| A-AV                    | 0%            | —                            |                                                                 |
| SPD                     | 70            | —                            |                                                                 |
| MAT                     | 9             | —                            |                                                                 |
| MDF                     | 80            | —                            |                                                                 |
| M-AV                    | 0%            | —                            |                                                                 |

⚠️ **Stats divergence wiki Commander page vs wiki Bosses master ⚠️** : page HP 128 / Bosses master HP 132. Minor divergence à reconcilier.

## Status Immunity (standard mob 4/4)

| Petrify | Bewitch | Arm Block | Dispirit | Confuse | Fear | Poison | Stun |
| ------- | ------- | --------- | -------- | ------- | ---- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | X       | X    | X      | X    |

## Yield

| EXP | Gold | Drops                   |
| --- | ---- | ----------------------- |
| 17  | 9    | **Attack Ball 100%** ⭐ |

⚠️ **Attack Ball 100% drop canon ⭐ MAJEUR** :

- **100% guaranteed drop Attack Ball Spell Item** (cohérent Bowling Snowfield Attack Ball drop pattern)
- Pattern Spell Item 100% drop boss-like sur Mob canon
- Confirme **Attack Ball = Spell Item** canon classification (Fire-magic ? Magic-elemental ?)
- À documenter `items/consumables.md` (à créer) Attack Ball entry précis effect canon

## Counter Opportunities (28) — high-density boss standard

## Encounters

| Encounter Formation (ID)                                          | In Location (Submap ID) | Encounter%   | Escape%     |
| ----------------------------------------------------------------- | ----------------------- | ------------ | ----------- |
| Sandora Soldier (Marshland, Fire) ×2, Commander (Marshland) (487) | Marshland (108)         | **Scripted** | **100%** ⚠️ |

| Encounter Formation (ID) | On World Map Road | Encounter% | Escape% |
| ------------------------ | ----------------- | ---------- | ------- |
| None                     | None              | N/A        | N/A     |

⚠️ **Escape 100% canon Mob Commander Marshland ⭐ NEW** :

- Minor Enemy with Escape 100% (vs 30%/90% standard)
- Pattern thematic "scripted encounter player can flee" canon
- Cohérent Blue Bird Rare Monster Escape 100% (pattern player choice canon)

⚠️ **Formation 487 = Commander + 2 Sandora Soldier Fire canon Disc 1 Marshland** ⭐.

## Traits — Instant Death Immunity passive NEW canon ⭐

| Passive                       | Effect                                                                    |
| ----------------------------- | ------------------------------------------------------------------------- |
| **Instant Death Immunity** ⭐ | Anything which inflicts Instant Death **misses when targeting** Commander |

⚠️ **Instant Death Immunity NEW Minor Enemy passive canon ⭐ MAJEUR** :

- Commander Marshland immune to Instant Death-proc
- Weapons : Gladius / Brass Knuckle / Indora's Axe (Can't Combat Weapons canon)
- Items : Total Vanishing / Pandemonium / Demon's Gate (Erase Attack Items canon ?)
- Pattern Minor Enemy with passive canon (rare — most Minor Enemies no passives)
- Pattern thematic "officer of Sandora higher rank immunity" canon
- À cross-référer canon Erase mechanic (Basilisk immune Can't Combat Weapons + Total Vanishing + Demon's Gate)

## Abilities — Minor Enemy AI HP-based

| HP    | Action          | Target | Effect                          | Notes                                              |
| ----- | --------------- | ------ | ------------------------------- | -------------------------------------------------- |
| > 50% | ~Sword Slash    | Single | 1× Physical damage              | -                                                  |
| ≤ 50% | ~Multi Slash    | Single | **2× Physical damage**          | -                                                  |
|       | Stunning Hammer | Single | **100% chance to inflict Stun** | Target's **M-AV** reduces chance to receive status |

\* As most abilities do not have official names, the community came up with approximate names marked with an ~.

⚠️ **Stunning Hammer canon name officiel** ⭐ (NOT ~ approximation) — Stun-inflict ability single target 100% (M-AV reduces).

⚠️ **AI 3-action canon** : 2-phase HP-conditional (Sword Slash > 50% / Multi Slash ≤ 50%) + Stunning Hammer always available probable.

## Trivia ⭐ NEW

> Unlike regular Power up, the Commander's version of this ability does **not affect his Power modifier**. While his damage appears to increase, this is because a **completely separate attack has been enabled**.

⚠️ **Power Up Commander vs standard Power Up canon ⭐ MAJEUR** :

- Standard Power Up = Power modifier buff (multiplicative damage)
- **Commander's Power Up = separate ability enabled** (NOT Power modifier change)
- Pattern technical canon distinct mechanics
- À documenter `combat/damage-modifiers.md` (à créer) Power Up canon variants

> The Commander's **idle stance changes** depending on whether or not he has used Power Up.

⚠️ **Visual canon Power Up idle stance change ⭐** — sprite/animation canon. À refléter visual design Damia.
