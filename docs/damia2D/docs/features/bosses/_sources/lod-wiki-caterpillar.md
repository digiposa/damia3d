# Caterpillar — wiki LoD (verbatim)

> **Source** : [legendofdragoon.org wiki — Caterpillar](https://legendofdragoon.org/wiki/Caterpillar)
> **Fiabilité** : 🥈 **tier 2** (wiki interne communauté Damia/Wulves)
> **Sauvegardé le** : 2026-05-22.
> **Usage** : ⭐ **BOSS 3-form transformation canon Divine Tree Disc 4 ⭐ MAJEUR** : Caterpillar → Pupa → Imago séquentielle (HP=0 = Transform au lieu de mort). **Non-Elemental** boss. **EXP 13,000 / Gold 300 / Drop Healing Rain 100% + Moon Serenade 100% + Sun Rhapsody 100%** (3 drops 100% Spell Items canon).
>
> ⭐ **NEW Boss AI "if → then" model canon MAJEUR** — pattern boss behavior changes player input + conditions criteria + multi-action random selection.
>
> ⭐ **NEW Boss conditions canon** : `Auto` (next turn condition met) + `Ignore Turn Order` (paired Retaliate, doesn't change turn values).
>
> ⭐ **Status reduction via A-AV NEW canon** — Caterpillar abilities Poison/Stun chance "reduced by **A-AV**" (NOT M-AV usual) ⚠️ MAJEUR divergence pattern. À investiguer canon.
>
> ⭐ **Dark Vapor RNG 1/101 (~0.99%) code calling 0-100 NEW canon ⭐ MAJEUR** — Imago Dispiriting 99.01% listed mais code 0-100 inclusive RNG = 1/101 chance fail. Pattern technical canon Damia + recurrent multi-boss (Ghost Commander Skull Projection + Kamuy Howl).
>
> ⭐ **Imago "Can't Combat" Instant Death ability canon NEW** — same name as Can't Combat Weapons (Gladius/Brass Knuckle/Indora's Axe). Boss ability variant : triggered only Dispirited target + Auto.
>
> ⭐ **Pupa "Writhe" useless turn canon NEW** — ability "does nothing" pattern boss form filler turns.

---

## Caterpillar (Form 1)

### Stats canon ⚠️ Damia adopt JP canon (à confirmer fandom)

| Aspect                  | Value (US/EU)     | Damia adopt (JP probable)    | Notes             |
| ----------------------- | ----------------- | ---------------------------- | ----------------- |
| **Element**             | **Non-Elemental** | —                            |                   |
| **Counters Additions?** | **Yes**           | —                            | Counter 28        |
| HP                      | 6,000             | (JP +25% ~7,500 à confirmer) | Fallback US 6,000 |
| AT                      | 110               | —                            |                   |
| DF                      | 120               | —                            |                   |
| A-AV                    | 0%                | —                            |                   |
| SPD                     | 70                | —                            |                   |
| MAT                     | 92                | —                            |                   |
| MDF                     | 120               | —                            |                   |
| M-AV                    | 0%                | —                            |                   |

### Status Immunity all 8 ✔ (boss-tier standard)

| Petrify | Bewitch | Arm Block | Dispirit | Confuse | Fear | Poison | Stun |
| ------- | ------- | --------- | -------- | ------- | ---- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | ✔       | ✔    | ✔      | ✔    |

### Yield

| EXP    | Gold | Drops             |
| ------ | ---- | ----------------- |
| 13,000 | 300  | Healing Rain 100% |

⚠️ **EXP 13,000 boss high reward Disc 4 canon** + **Gold 300** + **Healing Rain 100% Spell Item drop canon** ⭐.

### Counter Opportunities (28) — standard high-density tier

(Détails non documentés Damia per user instruction.)

## Encounters

| Encounter Formation (ID)       | In Location (Submap ID) | Encounter%   | Escape% |
| ------------------------------ | ----------------------- | ------------ | ------- |
| Caterpillar, Pupa, Imago (433) | Divine Tree (592)       | **Scripted** | 0%      |

⚠️ **Formation 433 = 3-form séquentielle canon** — pattern boss multi-phase Divine Tree submap 592.
⚠️ **Escape 0%** = boss combat lock-in canon (cohérent fandom Bosses master "Escape cannot be used").

## Traits — Boss passive effects canon ⭐ NEW

> Bosses often possess passive effects which modify standard battle mechanics. None of these are given official names, so the community used approximate names.

| Passives | Effects | Requires |
| -------- | ------- | -------- |
| None     | -       | -        |

⚠️ Caterpillar has **no passives** canon — pattern boss minimal passives (vs Rare Monsters Damage Mitigation / Magical Immunity passives).

## Abilities — Boss AI "if → then" model canon ⭐ NEW MAJEUR

> Boss behavior often changes from player input as most of them use "if → then" rules. Conditions are criteria that must be met in order for a Boss to take a particular action. With multiple eligible actions, the Boss selects one at random.

### Key terms canon

- **Auto** — Found under the Conditions column, this means the Action will be used on the enemy's next turn if the other conditions are met.
- **Ignore Turn Order** — Usually paired with the Retaliate action, this means the current values which determine turn order do not change from this action being taken.

⚠️ **NEW Boss AI model canon ⭐ MAJEUR** :

- Pattern "if → then" rules canon (vs Minor Enemy HP-based simple AI)
- Conditions = criteria triggering specific action
- Multi-action random selection if multiple eligible
- Auto-condition = next turn ability execution
- Ignore Turn Order = doesn't reset turn values (Retaliate pattern)
- À implémenter `BossAI = { actions: BossAction[]; conditions: BossCondition[] }` data-model

### Caterpillar abilities table

| Action         | Target | Effect                                                 | Conditions                                                                             |
| -------------- | ------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| ~Transform     | Self   | Transform into **Pupa**                                | **When HP = 0**, instead of ending the battle, **ignore turn order** and use Transform |
| ~Tentacle Whip | Single | 1× Physical damage                                     | -                                                                                      |
| ~Splash Poison | Single | 1× Physical damage + **100% chance to inflict Poison** | Target's **A-AV** reduces chance to receive status ailment ⚠️                          |
| ~Rancid Stench | Single | **100% chance to inflict Stun**                        | Target's **A-AV** reduces chance to receive status ailment ⚠️                          |

\* As most abilities do not have official names, the community came up with approximate names marked with an ~.

⚠️ **A-AV reduces status chance NEW canon ⭐ MAJEUR** :

- Caterpillar abilities Poison/Stun chance "reduced by **A-AV**" (NOT M-AV usual pattern)
- Pattern boss status proc canon : A-AV reduction (vs Minor Enemy abilities M-AV reduction)
- À investiguer canon distinction A-AV vs M-AV status reduction per-ability type
- À documenter `combat/status-effects.md` per-ability reduction modifier canon

⚠️ **~Transform on HP=0 mechanic canon** :

- HP=0 ≠ death → triggers Transform Pupa instead
- Pattern multi-form boss "phase transition on HP depletion"
- Cohérent existing Bosses master canon Caterpillar 3-phase

---

## Pupa (Form 2 — Caterpillar Transformed)

### Stats canon

| Aspect                  | Value (US/EU)     | Damia adopt (JP probable)    |
| ----------------------- | ----------------- | ---------------------------- |
| **Element**             | **Non-Elemental** | —                            |
| **Counters Additions?** | **No** ⭐         | —                            |
| HP                      | 2,500             | (JP +25% ~3,125 à confirmer) |
| AT                      | 92                | —                            |
| DF                      | **160** high      | —                            |
| A-AV                    | 0%                | —                            |
| SPD                     | 60                | —                            |
| MAT                     | 92                | —                            |
| MDF                     | **160** high      | —                            |
| M-AV                    | 0%                | —                            |

⚠️ **Pattern "Pupa cocoon defensive" canon ⭐** : DF/MDF 160 high (vs Caterpillar 120/120) — Pupa = defensive form canon. AT/MAT 92 maintained.

### Status Immunity all 8 ✔ (boss-tier maintained)

(Identical Caterpillar — 8/8 boss standard.)

### Yield

| EXP | Gold | Drops              |
| --- | ---- | ------------------ |
| 0   | 0    | Moon Serenade 100% |

⚠️ **EXP 0 / Gold 0 Pupa canon** : intermediate transformation form = no reward (cohérent Bosses master pattern multi-part secondary parts). **Moon Serenade 100% Spell Item drop canon ⭐**.

### Counter Opportunities (0) — "Counters Additions? No" ⭐

⚠️ **Pupa Counter 0 NEW canon ⭐** :

- Pattern boss form Counter 0 ("Counters Additions? No")
- Distinct Caterpillar (28) + Imago (28) — Pupa intermediate form = no counter
- À cross-référence pattern multi-form boss : pre/post forms Counter 28, intermediate Counter 0 ?

### Abilities

| Action     | Target | Effect                   | Conditions                                                                             |
| ---------- | ------ | ------------------------ | -------------------------------------------------------------------------------------- |
| ~Transform | Single | Transform into **Imago** | **When HP = 0**, instead of ending the battle, **ignore turn order** and use Transform |
| ~Writhe    | N/A    | **Does nothing** ⭐      | -                                                                                      |

⚠️ **~Writhe ability NEW canon ⭐ MAJEUR** :

- "Does nothing" — pattern boss "useless turn" filler canon
- Cohérent thematic Pupa "cocoon state inactive transformation period"
- Pattern boss form transition canon : Pupa = passive cocoon between Caterpillar/Imago
- À implémenter ability `noop` canon Damia pour boss filler turns

---

## Imago (Form 3 — Pupa Transformed)

### Stats canon ⚠️ Damia adopt JP

| Aspect                  | Value (US/EU)     | Damia adopt (JP probable)     |
| ----------------------- | ----------------- | ----------------------------- |
| **Element**             | **Non-Elemental** | —                             |
| **Counters Additions?** | **Yes**           | —                             |
| HP                      | **12,000** ⚠️ max | (JP +25% ~15,000 à confirmer) |
| AT                      | 100               | —                             |
| DF                      | 120               | —                             |
| A-AV                    | 0%                | —                             |
| SPD                     | 70                | —                             |
| MAT                     | **134** high      | —                             |
| MDF                     | **160** high      | —                             |
| M-AV                    | 0%                | —                             |

⚠️ **Pattern "Imago final form magic-focused" canon ⭐** : HP 12000 ⚠️ MAJEUR (double Caterpillar 6k) + MAT 134 high + MDF 160 high = magic-tier offensive + magic-resistant. Pattern boss final transformation power-up canon.

### Status Immunity all 8 ✔ (boss-tier maintained)

### Yield

| EXP | Gold | Drops             |
| --- | ---- | ----------------- |
| 0   | 0    | Sun Rhapsody 100% |

⚠️ **EXP 0 / Gold 0 Imago canon** : final form rewards 0 (all EXP/Gold from Caterpillar form initial canon). **Sun Rhapsody 100% Spell Item drop canon ⭐**.

⭐ **Pattern 3-form drops 100% canon** : Healing Rain (Caterpillar) + Moon Serenade (Pupa) + Sun Rhapsody (Imago) = **3 Spell Items 100% drops séquentiels**. Pattern fight Caterpillar drops 3 items canon = farming high-value Disc 4.

### Counter Opportunities (28) — high-density restored

(Détails non documentés Damia per user instruction.)

### Abilities

| Action           | Target | Effect                                       | Conditions                                                    |
| ---------------- | ------ | -------------------------------------------- | ------------------------------------------------------------- |
| ~Pickup Slash    | Single | 1× Physical damage                           | -                                                             |
| ~Laser           | Single | 1× **Light**-elemental magic damage ⭐       | -                                                             |
| ~Dark Vapor      | Single | **~99.01% chance to inflict Dispiriting** ⭐ | Target's **A-AV** reduces chance to receive status ailment ⚠️ |
| **Can't Combat** | Single | **Inflicts Instant Death** ⭐ MAJEUR         | **Only used on a Dispirited target. Auto**                    |

⚠️ **~Laser = Light-elemental NEW canon ⭐** :

- Imago = Non-Elemental boss BUT uses Light-elemental ability (cohérent boss flex element)
- Pattern boss abilities specific elements vs boss tag canon (cohérent Divine Dragon "Non-Elemental tag but spells regular elements" canon existing)
- Implication player : Darkness Rose Dragoon strong vs Light ability ?

⚠️ **~Dark Vapor 99.01% Dispiriting RNG 1/101 NEW canon ⭐ MAJEUR** :

- Code calling RNG 0-100 inclusive (101 values)
- 99.01% Dispiriting probability listed
- Reality : 1/101 (~0.99%) chance fail due to 0-100 inclusive
- Pattern technical RNG mechanic canon Damia
- À documenter `combat/rng-mechanics.md` (à créer)
- Pattern recurrent multi-boss (cohérent Trivia : Ghost Commander Skull Projection + Kamuy Howl)

⚠️ **Can't Combat = Instant Death ability boss canon NEW ⭐ MAJEUR** :

- Name "Can't Combat" = same as canon "Can't Combat Weapons" (Gladius / Brass Knuckle / Indora's Axe) — Instant Death proc weapons
- Imago "Can't Combat" = boss ability variant (NOT weapon)
- **Trigger condition canon** : "Only used on a Dispirited target" + **Auto** (next turn after Dark Vapor success)
- Pattern boss combo canon : Dark Vapor → Auto Can't Combat = setup Instant Death sequence ⭐
- Strategy player : prevent Dispirited status (Bravery Amulet ? high A-AV ?) → prevent Can't Combat
- Cohérent canon Erase mechanic existing (Basilisk immune Can't Combat Weapons + Total Vanishing + Demon's Gate)

## Gallery / Trivia / References

### Trivia canon ⭐ NEW

> The **miss chance of Dark Vapor** can also be seen in **Ghost Commander's Skull Projection** and **Kamuy's Howl**.

⚠️ **RNG 1/101 pattern recurrent multi-boss canon ⭐ MAJEUR** :

- **Dark Vapor (Imago Disc 4 Divine Tree)** : 99.01% Dispiriting + 1/101 fail
- **Skull Projection (Ghost Commander Disc 2 Phantom Ship)** : same RNG pattern (à investiguer fandom)
- **Howl (Kamuy Disc 2 Evergreen Forest Optional)** : same RNG pattern (à investiguer fandom)
- Pattern technical TLoD code canon : status abilities use 0-100 inclusive RNG → 1/101 fail systematic
- À documenter `combat/rng-mechanics.md` (à créer) canon technical detail
