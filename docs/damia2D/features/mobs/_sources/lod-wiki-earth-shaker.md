# Earth Shaker — wiki LoD (verbatim)

> **Source** : [The Legend of Dragoon Wiki — Earth Shaker](https://legendofdragoon.org/wiki/Earth_Shaker)
> **Fiabilité** : 🥈 **tier 2** (wiki LoD legendofdragoon.org — stats + AI + Counter + Encounters précis).
> **Sauvegardé le** : 2026-05-25.
> **Usage** : référence canon **Earth Shaker** (Minor Enemy Earth element Barrens). ⭐⭐⭐ **Stomp the Ground 0.5× Party AoE NEW low multiplier canon MAJEUR** (rare pattern < 1× attack multiplier Mob). + ⭐⭐ **Stunning Hammer 8% drop canon** (cohérent existing Cursed Jar Stunning Hammer 100% Stun canon — Earth Shaker = 2ème source farming canon). + ⭐⭐ **~Rush 50% Stun proc + A-AV reduces canon récurrent** (cohérent existing Caterpillar + Crystal Golem A-AV reduces status pattern canon). + ⭐⭐ **Barrens location canon Disc 1** (cohérent existing Crafty Thief Barrens canon). + ⭐⭐ **Counter 28 high-density tier confirmé**. + ⭐⭐ **Status 4/4 standard Minor Enemy** (Petrify/Bewitch/Arm Block/Dispirit ✔). + ⭐⭐ **AI 2-phase HP-shift** : aggressive Single (>50%) → Party AoE weak (≤50%) pattern NEW canon variant.

---

## Description canon

**Earth Shaker** is a **Minor Enemy**.

## Element canon

- **Earth** ⭐
- Pattern thematic "earth-shaking ground stomp golem" canon (cohérent ability ~Stomp the Ground)

## Stats canon (US wiki tier 2)

| Stat | Wiki US    | Notes                              |
| ---- | ---------- | ---------------------------------- |
| HP   | **200**    | Low-moderate HP Minor Enemy Disc 1 |
| AT   | **33**     | Moderate Attack                    |
| DF   | **140** ⭐ | **High Defense anti-physical**     |
| MAT  | **27**     | Low Magical                        |
| MDF  | 60         | Low MDF (magic favored counter)    |
| SPD  | 50         | Slow                               |
| A-AV | 0%         | Standard Minor                     |
| M-AV | 0%         | Standard Minor                     |

⚠️ **Pattern "anti-physical tank moderate" canon Earth Shaker ⭐** :

- **DF 140 high anti-physical** + **MDF 60 low** → magic favored counter (cohérent Earth weak Wind)
- **SPD 50 slow** → late-turn often
- Pattern Damia : `EarthShakerStats { hp: 200; at: 33; df: 140; mat: 27; mdf: 60; spd: 50 }` data-model canon

## Status Immunity canon (4/4 standard pattern)

| Petrify | Bewitch | Arm Block | Dispirit | Confuse | Fear | Poison | Stun |
| ------- | ------- | --------- | -------- | ------- | ---- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | ✗       | ✗    | ✗      | ✗    |

Pattern Minor Enemy 4/4 standard canon récurrent.

## Yield canon

- **EXP : 48** (low-moderate Disc 1 yield)
- **Gold : 15** (low)
- **Drops : Stunning Hammer 8%** ⭐⭐ canon

### Stunning Hammer 8% drop canon ⭐⭐ NEW farming source

- **Stunning Hammer** = existing item canon (cohérent existing Cursed Jar Stunning Hammer 100% Stun NEW canon)
- Earth Shaker = **2ème source Stunning Hammer farming canon** (vs Cursed Jar)
- 8% drop rate canon
- À cross-référer `items/Stunning Hammer.md` (à créer/vérifier) — Stunning Hammer item canon Damia + drop sources

## Counter Opportunities (28) — HIGH DENSITY tier

**(28)** — cohérent existing canon HIGH DENSITY tier (Aqua King/Berserker/Dragon Soldier/Dragon Spirits/etc.).

Per user instruction : feature Counter non-implémentée Damia, factual tier mention only.

## AI canon (2-phase NEW Rush + Stomp the Ground 0.5× Party AoE)

| HP    | Action                   | Target | Effect                                               | Notes                                                 |
| ----- | ------------------------ | ------ | ---------------------------------------------------- | ----------------------------------------------------- |
| > 50% | **~Rush**                | Single | 1× Physical damage + **50% chance to inflict Stun**  | **Target's A-AV reduces chance to receive status** ⭐ |
| ≤ 50% | **~Stomp the Ground** ⭐ | Party  | **0.5× Physical damage** ⭐ NEW low multiplier canon | Party AoE weak                                        |

⚠️ **Pattern AI canon mob 2-phase NEW HP-shift ⭐** :

- **Phase 1 (HP > 50%)** : ~Rush (1× phys Single + 50% Stun proc)
- **Phase 2 (HP ≤ 50%)** : ~Stomp the Ground (**0.5× phys Party AoE** — desperation switch)
- ⚠️ **Pattern NEW canon** : aggressive Single → weak Party AoE shift (vs typical mob escalation pattern)
- Pattern "wounded mob defensive AoE" canon canon NEW Damia

### ~Rush canon name (community) + A-AV reduces Stun proc canon ⭐ récurrent

- **~Rush** = community approximation > 50% phase ability
- 1× physical + **50% Stun proc** canon
- ⚠️ **A-AV reduces status proc canon ⭐ RÉCURRENT** : cohérent existing Caterpillar boss + Crystal Golem mob A-AV reduces status pattern canon (Earth Shaker = 3ème instance pattern confirmé canon Damia cross-mob/boss)

### ~Stomp the Ground 0.5× Party AoE NEW canon MAJEUR ⭐⭐⭐

- **~Stomp the Ground** = community approximation ability
- ⭐⭐⭐ **0.5× Physical damage Party AoE** canon NEW MAJEUR — **first instance < 1× multiplier Mob canon Damia**
- Pattern Damia : `StompTheGroundAbility { type: 'physical-party-aoe'; multiplier: 0.5 }` data-model canon NEW
- Pattern thematic "earth-shaker stomps ground = ground tremor weak Party hit" cohérent canon
- ⚠️ Pattern NEW : **sub-1× multiplier canon** (rare Mob — most Mobs ≥ 1× multiplier offensive)
- Pattern Damia : weak Party AoE compensé by multi-target hit (vs single high-multiplier Single hit)

## Encounters canon

### Barrens (Disc 1)

| Encounter Formation (ID) | Submap IDs | Encounter% | Escape% |
| ------------------------ | ---------- | ---------- | ------- |
| Earth Shaker (84)        | 232        | 10%        | 40%     |
| Earth Shaker x2 (89)     | 232, 233   | 20%, 35%   | 40%     |

⚠️ **Barrens location canon Disc 1 ⭐⭐** :

- **Barrens** = existing location canon Disc 1 (cohérent Crafty Thief Barrens canon)
- 2 submaps spawn : 232 + 233 (formation x2 primary submap 233 at 35%)
- À documenter `locations/Barrens.md` (à créer/vérifier) — Disc 1 location canon

### Escape rate 40% canon

- Pattern intermediate Disc 1 (cohérent Home of Gigantos / Crystal Golem / Dragonfly 40% pattern)

### No World Map Road encounters

- Earth Shaker = **Barrens exclusive** canon (no World Map spawns)

## Trivia / References

(Article wiki sections présentes mais détails à investiguer future)
