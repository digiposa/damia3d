# Archangel — wiki LoD (verbatim)

> **Source** : [legendofdragoon.org wiki — Archangel](https://legendofdragoon.org/)
> **Fiabilité** : 🥈 **tier 2** (wiki interne communauté Damia/Wulves)
> **Sauvegardé le** : 2026-05-20.
> **Usage** : référence canon Boss Archangel (Light, Moon That Never Sets Disc 4 endgame). Mécanique unique **Final Verdict** : battle ends after Talk used for the last time (dialogue-ending fight, NOT HP=0). Meru-targeted boss (heals Meru + talks to Meru). **Counter Opportunities table identique à Aqua King (28)** — hypothesis "universel" INVALIDÉE par Arrow Shooter (9), pattern per-enemy canon possiblement tier-based.

---

## Stats canon

| Aspect                  | Value   |
| ----------------------- | ------- |
| **Element**             | Light   |
| **Counters Additions?** | **Yes** |
| HP                      | 3,000   |
| AT                      | 53      |
| DF                      | 80      |
| A-AV                    | 5%      |
| SPD                     | 50      |
| MAT                     | 76      |
| MDF                     | 160     |
| M-AV                    | 5%      |

## Status Immunity (boss pattern : all 8 ✔)

| Petrify | Bewitch | Arm Block | Dispirit | Confuse | Fear | Poison | Stun |
| ------- | ------- | --------- | -------- | ------- | ---- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | ✔       | ✔    | ✔      | ✔    |

## Yield

| EXP   | Gold | Drops   |
| ----- | ---- | ------- |
| 6,000 | 0    | Nothing |

## Counterattack Opportunities (28) ⭐ IDENTIQUE Aqua King

| User    | Addition           | Button Press  |
| ------- | ------------------ | ------------- |
| Dart    | Volcano            | 2             |
| Dart    | Crush Dance        | 2, 3          |
| Dart    | Moon Strike        | 2, 3          |
| Lavitz  | Rod Typhoon        | 2, 3          |
| Lavitz  | Gust of Wind Dance | 2, 5          |
| Lavitz  | Flower Storm       | 2, 3, 4, 5, 6 |
| Rose    | Hard Blade         | 2             |
| Rose    | Demon's Dance      | 3, 4, 5, 6    |
| Meru    | Cool Boogie        | 2, 3          |
| Meru    | Cat's Cradle       | 3, 4          |
| Meru    | Perky Step         | 2             |
| Haschel | Summon 4 Gods      | 2             |
| Haschel | Hex Hammer         | 2             |
| Albert  | Gust of Wind Dance | 2             |
| Albert  | Flower Storm       | 2             |

⚠️ **EXACTEMENT le même tableau 28 opportunities que Aqua King** → pattern probable canon "Counter Opportunities = table universel" pour tous bosses/mobs avec `Counters Additions: Yes`. À investiguer.

## Combat

### Encounters

| Encounter Formation (ID) | In Location (Submap ID)    | Encounter% | Escape% |
| ------------------------ | -------------------------- | ---------- | ------- |
| Archangel (439)          | Moon That Never Sets (729) | Scripted   | 0%      |

### Traits (passives)

| Passive           | Effects                                              | Requires |
| ----------------- | ---------------------------------------------------- | -------- |
| **Final Verdict** | **Battle ends after Talk is used for the last time** | -        |

⚠️ **Pattern UNIQUE canon** : battle ne se termine PAS via HP=0 mais via **dialogue Talk usage final**.

### Abilities

> Auto — Action will be used on the enemy's next turn if conditions are met.
> Ignore Turn Order — Usually paired with Retaliate, current turn order values don't change.

| Action             | Target | Effect                                                                                                                                              | Conditions                                                                                    |
| ------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| ~Sword Bash        | Single | Inflicts 1× Physical damage                                                                                                                         | -                                                                                             |
| **Spark Net**      | Single | Inflicts 1.2× **Thunder**-elemental magic damage                                                                                                    | -                                                                                             |
| **Flash Hall**     | Party  | Inflicts **3× Thunder**-elemental magic damage                                                                                                      | -                                                                                             |
| **Trans Light**    | Single | Inflicts 1.5× **Light**-elemental magic damage                                                                                                      | -                                                                                             |
| **Spectral Flash** | Party  | Inflicts **3× Light**-elemental magic damage                                                                                                        | -                                                                                             |
| ~Healing Flower    | Single | **30% HP recovery for Meru**. Should this recovery exceed her maximum HP, it will visually display the correct number but in actuality recover 0 HP | **Always used if Meru's HP ≤ 31% unless using Healing Scripture.** ⚠️ visual bug overflow     |
| ~Healing Scripture | Single | **100% HP recovery for Meru**                                                                                                                       | **Only used if Meru's HP ≤ 31%. Always used if Meru's HP ≤ 31% unless using Healing Flower.** |
| ~Blow Trumpet      | Single | **Reduce Target's HP to 1 and grant them a turn out of order**                                                                                      | **Used only once at HP < 75% and < 35%. Cannot be dodged.**                                   |
| **~Talk**          | N/A    | **Talk to Meru**                                                                                                                                    | **Used only once at HP < 75%, < 60%, < 35%, and < 5%** (4 talks total).                       |

\* As most abilities do not have official names, the community came up with approximate names marked with an ~.

## Gallery / Trivia / References

(Sections wiki vides.)
