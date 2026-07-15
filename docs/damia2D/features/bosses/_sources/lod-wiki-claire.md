# Claire — wiki LoD (verbatim)

> **Source** : [legendofdragoon.org wiki — Claire](https://legendofdragoon.org/wiki/Claire)
> **Fiabilité** : 🥈 **tier 2** (wiki interne communauté Damia/Wulves)
> **Sauvegardé le** : 2026-05-22.
> **Usage** : ⭐ **BOSS Claire Disc 4 Moon That Never Sets ⭐ MAJEUR** — Haschel's daughter possessed canon. Thunder element + scripted Moon submap 611 + Escape 0%.
>
> ⭐ **NEW Passives canon ⭐ MAJEUR** : **Unslayable** (HP=0 ne tue pas) + **Alternate Win Condition** (dialogue correct = battle ends) + **Retaliate** (Rouge Art HP=0 trigger).
>
> ⭐ **NEW Four-Gods-Destruction mechanic canon MAJEUR** : Reduce target HP to 1 + grant turn out of order + Auto Do Nothing next.
>
> ⭐ **NEW "Graphical Entity / Untargetable" canon MAJEUR** : Claire = 2 entities in battle (Possessed + Unpossessed graphical swap for dialogue). Pattern multi-entity boss fights canon récurrent : Kamuy + Lloyd (Flanvel Tower) + Magician Faust (Real) + 3 Dragon Spirits + Zieg Feld.

---

## Claire (Possessed) — Form 1 combat

### Stats canon ⚠️ Damia adopt JP canon (à confirmer fandom)

| Aspect                  | Value (US/EU) | Damia adopt (JP probable)    | Notes                           |
| ----------------------- | ------------- | ---------------------------- | ------------------------------- |
| **Element**             | **Thunder**   | —                            | Pattern Thunder Moon boss canon |
| **Counters Additions?** | **Yes**       | —                            | Counter 28                      |
| HP                      | 3,200         | (JP +25% ~4,000 à confirmer) | Fallback US 3,200               |
| AT                      | 76            | —                            |                                 |
| DF                      | 100           | —                            |                                 |
| A-AV                    | 0%            | —                            |                                 |
| SPD                     | 55            | —                            |                                 |
| MAT                     | 76            | —                            | AT = MAT (balanced)             |
| MDF                     | 100           | —                            |                                 |
| M-AV                    | 0%            | —                            |                                 |

### Status Immunity all 8 ✔ (boss-tier standard)

| Petrify | Bewitch | Arm Block | Dispirit | Confuse | Fear | Poison | Stun |
| ------- | ------- | --------- | -------- | ------- | ---- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | ✔       | ✔    | ✔      | ✔    |

### Yield

| EXP | Gold | Drops   |
| --- | ---- | ------- |
| 0   | 0    | Nothing |

⚠️ **EXP 0 / Gold 0 / Nothing drop Claire Possessed** — pattern story-locked boss canon Disc 4 Moon trials. EXP reward sur Unpossessed form canon.

### Counter Opportunities (28) — high-density boss standard

### Encounters

| Encounter Formation (ID)                       | In Location (Submap ID)    | Encounter%   | Escape% |
| ---------------------------------------------- | -------------------------- | ------------ | ------- |
| Claire (Possessed), Claire (Unpossessed) (435) | Moon That Never Sets (611) | **Scripted** | 0%      |

⚠️ **Formation 435 = dual-Claire entity canon** ⭐ — Possessed + Unpossessed simultaneously in battle.
⚠️ **Escape 0%** = boss combat lock-in canon.

### Traits — Boss passives canon ⭐ NEW MAJEUR

| Passives                       | Effects                                                                        | Requires                                              |
| ------------------------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------- |
| **Unslayable** ⭐              | When HP is reduced to 0, Claire is **not slain and continues to take actions** | **Chance to trigger** when targeted by an attack      |
| **Alternate Win Condition** ⭐ | When **correct dialogue is chosen during Talk**, the battle ends               | -                                                     |
| **Retaliate** ⭐               | Use **Rouge Art**                                                              | HP = 0. When targeted by an attack, trigger Retaliate |

⚠️ **Unslayable passive canon ⭐ MAJEUR** :

- HP=0 ≠ death pour Claire Possessed
- Chance-based trigger when targeted by attack
- Pattern boss "unkillable via damage only" canon
- Solution canon = Alternate Win Condition (dialogue path)

⚠️ **Alternate Win Condition passive canon ⭐ MAJEUR** :

- Boss defeated via **correct dialogue choice during Talk** command (NOT damage)
- Pattern story-canon boss resolution via dialogue
- Cohérent thematic Haschel "save daughter via words" canon Disc 4
- À implémenter `BossWinCondition = 'damage' | 'dialogue' | 'both'` data-model

⚠️ **Retaliate passive canon ⭐** :

- HP=0 + targeted = trigger Retaliate Rouge Art
- Pattern boss "death attack response" canon
- Cohérent existing canon "Ignore Turn Order paired with Retaliate"

### Abilities — Claire Possessed

| Action                 | Target | Effect                                                                                                   | Conditions                             |
| ---------------------- | ------ | -------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| ~Do nothing            | N/A    | Does nothing                                                                                             | **Only used by Four-Gods-Destruction** |
| ~Rouge Art             | Single | 1× Physical damage                                                                                       | -                                      |
| ~Four-Gods-Destruction | Single | **Reduce Target HP to 1** ⭐ + **grant them a turn out of order**. **Next action will be Do Nothing** ⭐ | -                                      |

⚠️ **~Four-Gods-Destruction NEW canon MAJEUR ⭐⭐** :

- **Reduce target HP to 1** (NOT instant kill — reduce to 1)
- **Grant target turn out of order** ⭐ — turn manipulation canon
- **Auto next action = Do Nothing** — boss filler turn post-Four-Gods-Destruction
- Pattern boss "near-instakill + extra turn + filler" combo canon
- Pattern thematic Haschel canon : Four-Gods (Summon 4 Gods Haschel addition) destruction reversed by daughter
- À implémenter ability `fourGodsDestruction` Damia : `{ effect: 'reduceToHP-1' + 'extraTurn'; postAction: 'doNothing' }`

⚠️ **Rouge Art canon name (community) ⭐** :

- `Rouge Art` = ability name canon Claire Possessed
- Pattern thematic possessed Claire "rouge" (red) magic art canon
- 1× phys basic attack

---

## Claire (Unpossessed) — Graphical Entity NEW canon ⭐⭐ MAJEUR

### Stats canon (identical Possessed)

| Aspect                  | Value (US/EU) | Damia adopt (JP probable)    |
| ----------------------- | ------------- | ---------------------------- |
| **Element**             | **Thunder**   | —                            |
| **Counters Additions?** | **No** ⭐     | —                            |
| HP                      | 3,200         | (JP +25% ~4,000 à confirmer) |
| AT                      | 76            | —                            |
| DF                      | 100           | —                            |
| A-AV                    | 0%            | —                            |
| SPD                     | 55            | —                            |
| MAT                     | 76            | —                            |
| MDF                     | 100           | —                            |
| M-AV                    | 0%            | —                            |

⚠️ **Stats identiques Possessed** : same HP/AT/DF/MAT/MDF/SPD — only **EXP 6,000** + **Counter 0** + **Untargetable passive** differ.

### Status Immunity all 8 ✔ (boss-tier maintained)

### Yield

| EXP   | Gold | Drops   |
| ----- | ---- | ------- |
| 6,000 | 0    | Nothing |

⚠️ **EXP 6,000 Claire Unpossessed canon ⭐** — Pattern : EXP reward attribué Unpossessed entity (NOT Possessed). Cohérent multi-entity boss canon (EXP attribué entity-spécifique).

### Counter Opportunities (0) — "Counters Additions? No"

⚠️ **Pattern multi-entity boss canon** : Unpossessed Counter 0 vs Possessed Counter 28.

### Traits — Untargetable passive canon ⭐ NEW MAJEUR

| Passives            | Effects                                                    | Requires |
| ------------------- | ---------------------------------------------------------- | -------- |
| **Untargetable** ⭐ | Claire (Unpossessed) **cannot be targeted or take damage** | -        |

⚠️ **Untargetable passive canon ⭐ MAJEUR** :

- Claire Unpossessed = cannot be targeted by attacks
- Cannot take damage
- Pattern "graphical entity in battle pour dialogue swap" canon
- Distinct Possessed entity (targetable damage canon)
- À implémenter `MobPassive.untargetable: true` data-model

### Abilities — Claire Unpossessed

| Action      | Target | Effect                                                                               | Conditions                                                                    |
| ----------- | ------ | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| ~Do nothing | N/A    | Does nothing                                                                         | -                                                                             |
| ~Talk       | Single | **Break free from possession to speak with Haschel, then revert to being possessed** | Used only **once when Claire's HP <75%, <50%**, then **continuously at <25%** |

⚠️ **~Talk ability NEW canon MAJEUR ⭐** :

- Claire breaks possession briefly to speak with Haschel
- Reverts to possessed post-speech
- **Trigger conditions** : HP <75% (once) / HP <50% (once) / HP <25% (continuously)
- Pattern boss "dialogue interjection threshold" canon
- Cohérent Alternate Win Condition (Talk command player → correct dialogue → battle ends)
- À implémenter ability `talk` Damia avec HP-threshold conditions + dialogue trigger

## Gallery / Trivia / References

### Trivia canon ⭐ MAJEUR

> While her possession may seem to be only a graphical change, there are actually **two of Claire in the battle that are swapped out for dialogue**. This **trick of having untargetable enemies in the battle for graphical reasons** is also seen in the boss fights for **Kamuy**, **Lloyd (Flanvel Tower)**, **Magician Faust (Real)**, **all three of the Dragon Spirits**, and **Zieg Feld**.

⚠️ **Trivia canon NEW MAJEUR ⭐ — Multi-entity boss fights pattern canon** :

- **Trick canon** : 2+ entities in battle, swapped for dialogue/graphical reasons
- **Pattern récurrent multi-boss canon** :
  - **Claire (Disc 4 Moon That Never Sets)** = Possessed + Unpossessed swap
  - **Kamuy (Disc 2 Evergreen Forest Optional)** = same trick
  - **Lloyd (Flanvel Tower Disc 3)** = same trick
  - **Magician Faust (Real)** = same trick
  - **3 Dragon Spirits (Disc 4 Mayfil)** = same trick (Feyrbrand/Regole/Divine Dragon Spirits)
  - **Zieg Feld (Disc 4 Moon That Never Sets final)** = same trick
- À documenter `combat/multi-entity-bosses.md` (à créer) — pattern technical canon Damia
- Pattern boss "untargetable graphical entity + targetable main entity" canon récurrent
