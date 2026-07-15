# Fire Bird — wiki LoD (verbatim)

> **Source** : [legendofdragoon.org wiki — Fire Bird](https://legendofdragoon.org/)
> **Fiabilité** : 🥈 **tier 2** (wiki interne communauté Damia/Wulves)
> **Sauvegardé le** : 2026-05-20.
> **Usage** : référence canon boss Fire Bird (Volcano Villude Disc 1), source canon Red-Eye Stone 100%, pattern complexe Sequential Retaliation + Volcano Ball "Boss Extra" + HP 61% threshold phase swap.

---

## Fire Bird (main boss)

### Stats canon

| Aspect                  | Value |
| ----------------------- | ----- |
| **Element**             | Fire  |
| **Counters Additions?** | No    |
| HP                      | 640   |
| AT                      | 13    |
| DF                      | 80    |
| A-AV                    | 0%    |
| SPD                     | 45    |
| MAT                     | 16    |
| MDF                     | 80    |
| M-AV                    | 0%    |

### Status Immunity (all 8)

| Petrify | Bewitch | Arm Block | Dispirit | Confuse | Fear | Poison | Stun |
| ------- | ------- | --------- | -------- | ------- | ---- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | ✔       | ✔    | ✔      | ✔    |

### Yield

| EXP | Gold | Drops                  |
| --- | ---- | ---------------------- |
| 800 | 100  | **Red-Eye Stone 100%** |

### Counter Opportunities

**(0)** — aucune.

## Combat

### Encounters

| Encounter Formation (ID) | In Location (Submap ID) | Encounter% | Escape% |
| ------------------------ | ----------------------- | ---------- | ------- |
| Fire Bird (415)          | Volcano Villude (121)   | Scripted   | 0%      |

### Traits (passives Fire Bird)

| Passive                    | Effects                                                                                                                          | Requires                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **Final Blow**             | **The battle ends when Fire Bird's HP reaches 0**                                                                                | -                                                        |
| **Sequential Retaliation** | When using any Retaliate, they will be used in **order of 1st, 2nd, 3rd, and then repeat**                                       | -                                                        |
| **(1st) Retaliate**        | Ignore turn order and use **Bind and Peck**, **Fiery Wing Beat** (if Requirements met), or **Molten Dive** (if Requirements met) | **Has a chance to trigger when targeted by an Addition** |
| **(2nd) Retaliate**        | Ignore turn order and use **Call Volcano Balls**                                                                                 | Has a chance to trigger when targeted by an Addition     |
| **(3rd) Retaliate**        | Ignore turn order and use **Instigate Erupt**. If there is no Volcano Ball in battle, use **Do Nothing** instead                 | Has a chance to trigger when targeted by an Addition     |

### Abilities (Fire Bird)

> Auto — Action will be used on the enemy's next turn if conditions are met.
> Ignore Turn Order — Usually paired with Retaliate, current turn order values don't change.

| Action              | Target        | Effect                                                          | Conditions                                                                                     |
| ------------------- | ------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| ~Do nothing         | N/A           | Does nothing                                                    | Only used by (3rd) Retaliate                                                                   |
| ~Bind and Peck      | Single        | Inflicts 1× Physical damage                                     | -                                                                                              |
| ~Fiery Wing Beat    | Party         | Inflicts 0.5× Physical damage                                   | **HP > 61%**                                                                                   |
| ~Molten Dive        | Party         | Inflicts 0.5× **Fire**-elemental magic damage                   | **HP < 61%**                                                                                   |
| ~Call Volcano Balls | N/A           | **Summons Volcano Ball (×4)**                                   | Only used by (2nd) Retaliate                                                                   |
| ~Instigate Erupt    | Volcano Balls | **Ignore turn order and force all Volcano Ball's to use Erupt** | If there is a Volcano Ball in battle, then Auto. **Only max 3 of 4 Volcano Balls deal damage** |

\* As most abilities do not have official names, the community came up with approximate names marked with an ~.

## Boss Extra : Volcano Ball

### Stats canon

| Aspect                  | Value |
| ----------------------- | ----- |
| **Element**             | Fire  |
| **Counters Additions?** | No    |
| HP                      | **8** |
| AT                      | 12    |
| DF                      | 80    |
| A-AV                    | 0%    |
| SPD                     | 45    |
| MAT                     | 12    |
| MDF                     | 100   |
| M-AV                    | 0%    |

### Status Immunity (all 8 ✔)

Same as Fire Bird — immune to all 8 statuses.

### Yield Volcano Ball

| EXP | Gold | Drops   |
| --- | ---- | ------- |
| 0   | 0    | Nothing |

### Abilities (Volcano Ball)

| Action      | Target | Effect                      | Conditions                                   |
| ----------- | ------ | --------------------------- | -------------------------------------------- |
| ~Do nothing | N/A    | Does nothing                | -                                            |
| ~Erupt      | Single | Inflicts 1× Physical damage | **Only used by Fire Bird's Instigate Erupt** |

## Gallery / Trivia / References

(Sections wiki vides.)

## Categorization

- Pages with broken file links
- Missing Information
- Bosses
- Boss Extras
- **Disc 1**
