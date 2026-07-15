# Erupting Chick — wiki LoD (verbatim)

> **Source** : [The Legend of Dragoon Wiki — Erupting Chick](https://legendofdragoon.org/wiki/Erupting_Chick)
> **Fiabilité** : 🥈 **tier 2** (wiki LoD legendofdragoon.org — stats + AI + Counter + Encounters précis).
> **Sauvegardé le** : 2026-05-25.
> **Usage** : référence canon **Erupting Chick** (Minor Enemy Wind Valley of Corrupted Gravity Disc 2). ⭐⭐⭐ **Summon Roc canon NEW MAJEUR** : Mob summons Boss Extra (Roc) one-shot Party 2× phys then Roc disappears (temporary summon — NOT remaining in battle canon NEW). + ⭐⭐⭐ **Run away! ability canon NEW MAJEUR** : Mob self-escape removes target from combat (no EXP/gold/item award canon NEW). + ⭐⭐⭐ **AI 3-phase NEW MAJEUR** : ~Kick (>25%) / Summon Roc (≤50% Party 2× phys) / Run away! (≤25% self-escape). + ⭐⭐ **Killer Bird + Spider Urchin partner mobs NEW canon** (mixed formations Valley of Corrupted Gravity). + ⭐⭐ **A-AV 20% NEW canon Mob** (A-AV reduces status proc pattern). + ⭐⭐ **Counter 28 high-density tier**. + ⭐⭐ **Status 4/4 standard Minor Enemy**. + ⭐⭐ **Mind Purifier 8% drop canon**. + ⭐ **Valley of Corrupted Gravity 5 submaps 252-257 mixed formations** (cohérent existing Dragonfly).

---

## Description canon

**Erupting Chick** is a **Minor Enemy**.

## Element canon

- **Wind** ⭐
- Pattern thematic "chick bird Wind aerial" canon

## Stats canon (US wiki tier 2)

| Stat | Wiki US      | Notes                                 |
| ---- | ------------ | ------------------------------------- |
| HP   | **120**      | Low HP Minor Enemy Disc 2             |
| AT   | **20**       | Low Attack                            |
| DF   | **80**       | Moderate Defense                      |
| MAT  | **22**       | Low Magical                           |
| MDF  | **30**       | Very low MDF (magic favored counter)  |
| SPD  | **80** ⭐    | High SPD (first strike often)         |
| A-AV | **20%** ⭐⭐ | **High A-AV** (status proc reduction) |
| M-AV | 0%           | Standard Minor                        |

⚠️ **Pattern "fast fragile dodge canon" Erupting Chick ⭐⭐** :

- **SPD 80 high** + **A-AV 20%** → first strike + status dodge
- **HP 120 low + MDF 30 very low** → fragile vs magic
- **AT 20 low** + Summon Roc 2× Party AoE = main threat via summoned attack
- Pattern Damia : `EruptingChickStats { hp: 120; at: 20; df: 80; mat: 22; mdf: 30; spd: 80; aAv: 0.20; mAv: 0 }` data-model canon
- ⚠️ **A-AV 20% NEW canon Mob** : cohérent pattern A-AV reduces status proc canon (récurrent canon Damia)

## Status Immunity canon (4/4 standard pattern)

| Petrify | Bewitch | Arm Block | Dispirit | Confuse | Fear | Poison | Stun |
| ------- | ------- | --------- | -------- | ------- | ---- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | ✗       | ✗    | ✗      | ✗    |

## Yield canon

- **EXP : 32** + **Gold : 15** + **Drop : Mind Purifier 8%** canon

### Mind Purifier 8% drop canon ⭐

- **Mind Purifier** = existing item canon (cohérent existing canon — likely Confusion cure item)
- 8% drop rate canon
- À cross-référer `items/Mind Purifier.md` (à créer/vérifier) — Mind Purifier item canon Damia

## Counter Opportunities (28) — HIGH DENSITY tier

**(28)** — cohérent existing canon HIGH DENSITY tier (Aqua King/Berserker/Dragon Soldier/Dragon Spirits/etc.).

## AI canon (3-phase NEW Kick + Summon Roc + Run away!)

| HP    | Action                      | Target | Effect                                | Notes                                           |
| ----- | --------------------------- | ------ | ------------------------------------- | ----------------------------------------------- |
| > 25% | **~Kick**                   | Single | 1× Physical damage                    | Community approximation (~)                     |
| ≤ 50% | **Summon Roc** ⭐⭐⭐ canon | Party  | **2× Physical damage** ⭐ NEW         | ⚠️ **Roc does NOT remain in battle** canon NEW  |
| ≤ 25% | **Run away!** ⭐⭐⭐ canon  | Self   | **Removes target from combat** ⭐ NEW | **Does NOT award EXP, gold, or item** canon NEW |

⚠️ **Pattern AI canon mob 3-phase NEW MAJEUR ⭐⭐⭐** :

- **Phase 1 (HP > 25%)** : ~Kick (1× phys baseline)
- **Phase 2 (HP ≤ 50%)** : **Summon Roc** (Boss Extra summon one-shot Party 2× phys then disappears)
- **Phase 3 (HP ≤ 25%)** : **Run away!** (Mob self-escape — no rewards)
- ⚠️ **HP overlap zones canon** : 25-50% overlap (~Kick + Summon Roc) + ≤25% all three abilities possible (~Kick + Summon Roc + Run away!)

### Summon Roc canon NEW MAJEUR ⭐⭐⭐

- **Summon Roc** = canon name officiel (NO ~ marker — canonical)
- **Effect canon** : Summons **Roc** (Boss Extra-like entity) → **2× Physical damage Party AoE** → ⚠️ **Roc does NOT remain in battle**
- Pattern Damia : `SummonRocAbility { type: 'summon-extra-one-shot'; summonEntity: 'roc'; effect: { multiplier: 2; type: 'physical'; target: 'party' }; entityRemains: false }` data-model canon NEW
- ⚠️ Pattern NEW : **temporary one-shot summon mechanic canon** (vs Drake Bandit Bursting Ball + Wire persistent summons)
- Pattern thematic "chick summons adult Roc bird for parental attack" cohérent canon
- ⚠️ **Roc = Boss Extra-like canon NEW** : appears one-shot, attack, disappears (vs typical Boss Extras persistent)
- Pattern Damia : NEW summon mechanic variant canon (one-shot vs persistent summons)
- À cross-référer existing Roc mob canon (Wind Valley of Corrupted Gravity also spawns separately) — pattern dual existence canon (regular mob + summoned variant ?)
- À implémenter ability `summonRoc` Damia (canon NEW one-shot summon mechanic)

### Run away! canon NEW MAJEUR ⭐⭐⭐

- **Run away!** = canon name officiel (NO ~ marker — canonical, includes exclamation mark canon)
- **Effect canon** : "Removes target from combat" — Mob self-escape from battle
- ⚠️ **No reward canon NEW** : "Does NOT award EXP, gold, or item"
- Pattern Damia : `RunAwayAbility { type: 'self-escape'; effect: 'remove-from-battle'; rewardsGranted: false }` data-model canon NEW
- ⚠️ Pattern NEW : **Mob desperation escape mechanic canon** (vs typical mob fight-to-death)
- Pattern thematic "wounded chick flees" canon cohérent
- ⚠️ **Strategy implication** : Erupting Chick HP ≤ 25% threshold = burst-kill canon (must finish before Run away! triggers OR no rewards)
- Pattern Damia : Mob self-escape ability canon NEW (rare — only Mob with self-escape canon ingestion Damia)
- À implémenter ability `runAway` Damia (canon NEW self-escape mechanic)

### ~Kick canon name (community)

- **~Kick** = community approximation > 25% phase ability
- 1× physical baseline (no special effect)
- Pattern thematic "chick kick" canon

## Encounters canon

### Valley of Corrupted Gravity (Disc 2) — 5 submaps mixed formations

| Encounter Formation (ID)              | Submap IDs              | Encounter%              | Escape% |
| ------------------------------------- | ----------------------- | ----------------------- | ------- |
| Erupting Chick (90)                   | 252                     | 10%                     | 40%     |
| Killer Bird x2, Erupting Chick (95)   | 252, 253, 255           | 35%, 35%, 20%           | 40%     |
| Erupting Chick x2, Spider Urchin (97) | 253, 254, 255, 256, 257 | 20%, 35%, 35%, 35%, 20% | 40%     |

⚠️ **Mixed formations canon ⭐⭐ NEW partner mobs reveal** :

- **Killer Bird** = NEW partner mob canon (Valley of Corrupted Gravity — mixed formation 95)
- **Spider Urchin** = NEW partner mob canon (Valley of Corrupted Gravity — mixed formation 97)
- Pattern Damia : 3 formation types Erupting Chick (solo + Killer Bird mixed + Spider Urchin mixed)
- À documenter `mobs/Killer Bird.md` + `mobs/Spider Urchin.md` (à créer) — NEW partner mobs canon

### Escape rate 40% canon

- Pattern intermediate Disc 2 dungeon (cohérent Dragonfly Valley 40%)

### No World Map Road encounters

- Erupting Chick = **Valley of Corrupted Gravity exclusive** canon

## Trivia / References

(Article wiki sections présentes mais détails à investiguer future)
