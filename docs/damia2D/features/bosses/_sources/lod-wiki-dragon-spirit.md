# Dragon Spirit — wiki LoD (verbatim)

> **Source** : [The Legend of Dragoon Wiki — Dragon Spirit](https://legendofdragoon.org/wiki/Dragon_Spirit)
> **Fiabilité** : 🥈 **tier 2** (wiki LoD legendofdragoon.org — stats + AI + Counter + Encounters + Trivia précis).
> **Sauvegardé le** : 2026-05-25.
> **Usage** : référence canon **Dragon Spirit** (3 ghost-form bosses Mayfil Death City Disc 4). ⭐⭐⭐ **Lore canon MAJEUR** : 3 Dragon Spirits = ghost forms of defeated dragons (Feyrbrand/Regole/Divine Dragon) revisited Mayfil Disc 4. + ⭐⭐⭐ **Dual-entity boss canon MAJEUR** : chaque Dragon Spirit = Dragon Spirit form (targetable) + Ghost form (untargetable transformation effect). + ⭐⭐⭐ **Retaliate passive canon NEW MAJEUR** : reactive ability triggered when targeted by attack → transform Ghost + attack + revert. + ⭐⭐⭐ **Instigate self-action canon** : transform Ghost form → attack → revert (cohérent existing canon Divine Dragon Boss Extras). + ⭐⭐⭐ **Untargetable Ghost form Trivia MAJEUR NEW** : "graphical effect transforming" trick → Ghost forms unaffected Power Down + Speed Down. + ⭐⭐⭐ **Cross-boss untargetable trick canon récurrent NEW** : Kamuy / Lloyd (Flanvel Tower) / Magician Faust (Real) / Claire / Zieg Feld — pattern canon. + ⭐⭐ **Status all 8 ✔ Boss-tier** all 3 spirits. + ⭐⭐ **Counter 28 high-density tier** all 3 spirits. + ⭐⭐ **EXP/Gold "0/X" pattern Ghost form** : Ghost = 0 yield / Dragon Spirit = X yield (Ghost untargetable + non-defeatable). + ⭐⭐ **3 signature drops Spell Items 100%** : Down Burst (Wind Feyrbrand) / Frozen Jet (Water Regole) / Flash Hall (Non-Elemental Divine Dragon).

---

## Description canon

3 distinct boss entries on the wiki "Dragon Spirit" page :

1. **Dragon Spirit (Feyrbrand)** / Ghost (Feyrbrand) — Wind
2. **Dragon Spirit (Regole)** / Ghost (Regole) — Water
3. **Dragon Spirit (Divine Dragon)** / Ghost (Divine Dragon) — Non-Elemental

⚠️ **Pattern canon ⭐⭐⭐** : 3 Dragon Spirits Disc 4 Mayfil = ghost forms of dragons defeated previously (Feyrbrand Disc 1 / Regole Disc 2 / Divine Dragon Disc 3) — lore canon revisit Disc 4 Mayfil Death City.

---

## Boss (Feyrbrand)

### Identity canon Feyrbrand spirit

- **Name** : Dragon Spirit (Feyrbrand) / Ghost (Feyrbrand)
- **Element** : **Wind**
- **Counters Additions** : Yes / No (Dragon Spirit Yes / Ghost No untargetable)

### Stats canon Feyrbrand spirit

| Stat | Wiki US      | Notes               |
| ---- | ------------ | ------------------- |
| HP   | **8,000** ⭐ | Disc 4 boss HP tier |
| AT   | 89           |                     |
| DF   | 100          |                     |
| MAT  | 71           |                     |
| MDF  | 80           |                     |
| SPD  | 60           |                     |
| A-AV | 0%           |                     |
| M-AV | 0%           |                     |

### Status Immunity canon Feyrbrand spirit (all 8 ✔ Boss-tier)

| Petrify | Bewitch | Arm Block | Dispirit | Confuse | Fear | Poison | Stun |
| ------- | ------- | --------- | -------- | ------- | ---- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | ✔       | ✔    | ✔      | ✔    |

### Yield canon Feyrbrand spirit

- **EXP** : 4,000
- **Gold** : 200
- **Drops** : Nothing (Ghost) / **Down Burst 100%** (Dragon Spirit) ⭐⭐⭐ signature drop

### Counter Opportunities (28) Feyrbrand spirit

Counter list complete (15 entries) — pattern HIGH DENSITY canon tier 28.

### Story Feyrbrand spirit

(Wiki section : "Read More" — détails Story à investiguer future)

### Encounters Feyrbrand spirit

| Encounter Formation (ID)                           | Location (Submap ID) | Encounter | Escape |
| -------------------------------------------------- | -------------------- | --------- | ------ |
| Dragon Spirit (Feyrbrand), Ghost (Feyrbrand) (449) | Mayfil (542)         | Contact   | 0%     |

⚠️ **Escape 0%** canon — Boss battle non-fuyable.
⚠️ **Contact encounter** canon — scripted boss encounter (vs random spawn).

### Traits canon Feyrbrand spirit

| Passive       | Effect                                | Requires                                                    |
| ------------- | ------------------------------------- | ----------------------------------------------------------- |
| **Retaliate** | **Ignore turn order + use Instigate** | **Chance to trigger when targeted by attack** ⭐ NEW MAJEUR |

⚠️ **Retaliate passive canon NEW MAJEUR ⭐⭐⭐** :

- Trigger : reactive (chance) when Dragon Spirit targeted by attack
- Effect : Ignore turn order + use Instigate action
- Pattern Damia : `RetaliatePassive { trigger: 'on-targeted-by-attack'; chance: 'variable'; effect: 'ignore-turn-order + instigate' }` data-model canon NEW

### Abilities canon Feyrbrand spirit

| Form          | Action              | Target | Effect                                                                                | Conditions             |
| ------------- | ------------------- | ------ | ------------------------------------------------------------------------------------- | ---------------------- |
| Dragon Spirit | **~Instigate**      | Self   | Transform Ghost Feyrbrand + use Tentacle Smack OR Status Slime + revert Dragon Spirit | —                      |
| Ghost         | **~Tentacle Smack** | Single | 1× Physical damage                                                                    | Only used by Instigate |
| Ghost         | **~Status Slime**   | Single | 1× Physical damage + 100% Fear OR Poison OR Stun                                      | Only used by Instigate |

⚠️ **~Status Slime NEW canon MAJEUR ⭐⭐⭐** : 100% chance to inflict Fear / Poison / Stun — multi-status proc canon NEW (vs typical 50% single-status).
⚠️ **~Tentacle Smack NEW canon** : 1× phys Ghost ability canon Feyrbrand.

---

## Boss (Regole)

### Identity canon Regole spirit

- **Name** : Dragon Spirit (Regole) / Ghost (Regole)
- **Element** : **Water**

### Stats canon Regole spirit

| Stat | Wiki US       | Notes                                   |
| ---- | ------------- | --------------------------------------- |
| HP   | **12,000** ⭐ | Disc 4 boss HP tier (+50% vs Feyrbrand) |
| AT   | 98            |                                         |
| DF   | 80            |                                         |
| MAT  | 71            |                                         |
| MDF  | 120           | High anti-magic                         |
| SPD  | 60            |                                         |
| A-AV | 0%            |                                         |
| M-AV | **0/5%** ⚠️   | Dragon Spirit 0% / Ghost 5% variant     |

⚠️ **M-AV 0/5% canon Regole NEW** : pattern Dragon Spirit 0% / Ghost 5% — différencié par form ⭐ NEW canon.

### Status Immunity canon Regole spirit (all 8 ✔ Boss-tier)

Same all 8 ✔ pattern Feyrbrand spirit.

### Yield canon Regole spirit

- **EXP** : 0 / **6,000** ⚠️ Ghost 0 / Dragon Spirit 6,000 pattern
- **Gold** : 0 / **300** ⚠️ Ghost 0 / Dragon Spirit 300 pattern
- **Drops** : Nothing (Ghost) / **Frozen Jet 100%** (Dragon Spirit) ⭐⭐⭐ signature drop

⚠️ **EXP/Gold "0/X" pattern Ghost form canon ⭐⭐ NEW** :

- Ghost form = 0 EXP / 0 Gold (untargetable, defeated indirectly via Dragon Spirit defeat)
- Dragon Spirit form = X EXP / X Gold yield canon
- Pattern Damia : dual-entity yield split canon (cohérent untargetable trick mechanic)

### Counter Opportunities (28) Regole spirit

Same Counter list 15 entries pattern HIGH DENSITY canon.

### Story Regole spirit

(Wiki section : "Read More")

### Encounters Regole spirit

| Encounter Formation (ID)                     | Location (Submap ID) | Encounter | Escape |
| -------------------------------------------- | -------------------- | --------- | ------ |
| Dragon Spirit (Regole), Ghost (Regole) (448) | Mayfil (544)         | Contact   | 0%     |

### Traits canon Regole spirit

| Passive       | Effect                                                                              | Requires                                  |
| ------------- | ----------------------------------------------------------------------------------- | ----------------------------------------- |
| **Retaliate** | Ignore turn order + Transform Ghost Regole + use Tentacle Smash OR W Laser + revert | Chance to trigger when targeted by attack |

⚠️ ⚠️ **Retaliate Regole variant canon** : différencié de Feyrbrand canon (Feyrbrand passive = "use Instigate" / Regole passive = transform direct + abilities subset). Pattern canon variant per-spirit.

### Abilities canon Regole spirit

| Form          | Action              | Target | Effect                                                                                       | Conditions                          |
| ------------- | ------------------- | ------ | -------------------------------------------------------------------------------------------- | ----------------------------------- |
| Dragon Spirit | **~Instigate**      | Self   | Transform Ghost Regole + use Tentacle Smash OR W Laser OR **Tsunami** + revert Dragon Spirit | —                                   |
| Ghost         | **~Tentacle Smash** | Single | 1× Physical damage                                                                           | Only used by Retaliate or Instigate |
| Ghost         | **~W Laser**        | Party  | **2× Light-elemental magic damage** ⭐ NEW                                                   | Only used by Retaliate or Instigate |
| Ghost         | **~Tsunami**        | Party  | **4× Water-elemental magic damage** ⭐ NEW                                                   | Only used by Retaliate or Instigate |

⚠️ **~W Laser NEW canon MAJEUR ⭐⭐⭐** : 2× **Light-elemental** magic Party — Regole Water spirit uses Light magic ability (cross-element NEW canon).
⚠️ **~Tsunami NEW canon MAJEUR ⭐⭐⭐** : 4× Water-elemental magic Party (high-tier Party AoE attack canon).
⚠️ **Pattern Regole spirit canon : ~Tsunami available only via Instigate** (NOT Retaliate) — differential ability access canon NEW.

---

## Boss (Divine Dragon)

### Identity canon Divine Dragon spirit

- **Name** : Dragon Spirit (Divine Dragon) / Ghost (Divine Dragon)
- **Element** : **Non-Elemental** ⭐

### Stats canon Divine Dragon spirit

| Stat | Wiki US         | Notes                                   |
| ---- | --------------- | --------------------------------------- |
| HP   | **16,000** ⭐⭐ | Disc 4 boss HP tier (highest 3 spirits) |
| AT   | 107             | Highest AT 3 spirits                    |
| DF   | **160**         | High anti-physical                      |
| MAT  | **116**         | Highest MAT 3 spirits                   |
| MDF  | 100             |                                         |
| SPD  | 60              |                                         |
| A-AV | 0%              |                                         |
| M-AV | 0%              |                                         |

⚠️ **Pattern Dragon Spirit Divine Dragon strongest canon ⭐⭐** : HP 16,000 / AT 107 / MAT 116 = highest 3 spirits stats (cohérent thematic Divine Dragon "King of Dragons" hierarchy).

### Status Immunity canon Divine Dragon spirit (all 8 ✔ Boss-tier)

Same all 8 ✔ pattern.

### Yield canon Divine Dragon spirit

- **EXP** : 0 / **8,000** Ghost 0 / Dragon Spirit 8,000
- **Gold** : 0 / **400** Ghost 0 / Dragon Spirit 400
- **Drops** : Nothing (Ghost) / **Flash Hall 100%** (Dragon Spirit) ⭐⭐⭐ signature drop

### Counter Opportunities (28) Divine Dragon spirit

Same Counter list 15 entries pattern HIGH DENSITY canon.

### Story Divine Dragon spirit

(Wiki section : "Read More")

### Encounters Divine Dragon spirit

| Encounter Formation (ID)                                   | Location (Submap ID) | Encounter | Escape |
| ---------------------------------------------------------- | -------------------- | --------- | ------ |
| Dragon Spirit (Divine Dragon), Ghost (Divine Dragon) (447) | Mayfil (546)         | Contact   | 0%     |

### Traits canon Divine Dragon spirit

| Passive       | Effect                                                                                                                                                                         | Requires                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| **Retaliate** | Ignore turn order + Transform Divine Dragon Ghost + use Burning Wave OR Burn Out OR Pellet OR Down Burst OR Arm Swipe OR Divine Dragon Bullet OR Divine Dragon Cannon + revert | Chance to trigger when targeted by attack |

⚠️ **Retaliate Divine Dragon variant canon expansive ⭐⭐** : 7 abilities sub-pool via Retaliate (vs 2-3 abilities Feyrbrand/Regole) — most complex Dragon Spirit canon.

### Abilities canon Divine Dragon spirit ⭐⭐⭐ MAJEUR

| Form          | Action                     | Target                    | Effect                                                                                        | Conditions                          |
| ------------- | -------------------------- | ------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------- |
| Dragon Spirit | **Burning Wave**           | Party                     | **3× Fire-elemental magic damage** ⭐                                                         | —                                   |
| Dragon Spirit | **Burn Out**               | Single                    | **1.5× Fire-elemental magic damage** ⭐                                                       | —                                   |
| Dragon Spirit | **Pellet**                 | Single                    | **1.5× Earth-elemental magic damage** ⭐                                                      | —                                   |
| Dragon Spirit | **Down Burst**             | Party                     | **3× Wind-elemental magic damage** ⭐                                                         | —                                   |
| Dragon Spirit | **~Instigate**             | Self                      | Transform Divine Dragon Ghost + use Arm Swipe OR Divine Dragon Bullet OR Divine Dragon Cannon | —                                   |
| Ghost         | **~Arm Swipe**             | Single                    | 1× Physical damage                                                                            | Only used by Retaliate or Instigate |
| Ghost         | **~Divine Dragon Barrage** | Party                     | **2× Non-Elemental magic damage** ⭐                                                          | Only used by Retaliate or Instigate |
| Ghost         | **~Divine Dragon Cannon**  | Position-based (3-target) | **4× Non-Elemental magic (primary) / 2× Non-Elemental magic (adjacent)** position-based AoE   | Only used by Retaliate or Instigate |

⚠️ **Divine Dragon Cannon position-based canon ⭐⭐⭐ MAJEUR** ✓ cohérent existing Divine Dragon main boss canon :

- Primary target = 4× Non-Elemental magic
- Adjacent target = 2× Non-Elemental magic
- Pattern : central member primary → both sides adjacent / side member primary → central adjacent + opposite side NOT targeted
- ⭐ **Position-based AoE canon** cohérent existing Divine Dragon canon Disc 3

⚠️ **Canonical abilities NOT ~ approximations ⭐⭐⭐** :

- **Burning Wave** / **Burn Out** / **Pellet** / **Down Burst** = canonical names officiels (no ~ marker)
- Pattern : 4 Dragon Spirit form abilities = canon names from existing Divine Dragon Disc 3 boss canon (cohérent revisit)

⚠️ **Wiki naming inconsistency potential ⚠️** :

- Retaliate passive lists "Divine Dragon Bullet" mais Abilities lists "Divine Dragon Barrage"
- Probable typo wiki canon ⚠️ — à clarifier fandom future
- Damia adopt **Divine Dragon Barrage** (Abilities section more authoritative)

---

## Gallery

The Gallery is empty.

## Trivia ⭐⭐⭐ MAJEUR canon

⚠️ **Trivia NEW MAJEUR canon ⭐⭐⭐** :

> "Each of the Dragon Spirits having an **untargetable Ghost counterpart** was **likely only intended for creating the graphical effect of transforming**, but as a consequence the **Ghost forms are unaffected by Power Down and Speed Down**. This trick of having **untargetable enemies in the battle for graphical reasons** is also seen in the boss fights for **Kamuy**, **Lloyd (Flanvel Tower)**, **Magician Faust (Real)**, **Claire**, and **Zieg Feld**."

⭐⭐⭐ **Untargetable Ghost form trick canon NEW MAJEUR** :

- **Intent canon** : graphical effect transforming (visual flair)
- **Consequence canon** : Ghost forms **unaffected Power Down + Speed Down** (untargetable = stat modifiers can't apply)
- Pattern Damia : `UntargetableGhostFormBoss { unaffectedByDebuffs: ['power-down', 'speed-down']; purpose: 'graphical-transformation-effect' }` data-model canon NEW

⭐⭐⭐ **Cross-boss untargetable trick canon récurrent NEW** :

- **Kamuy** — boss canon ⚠️ NEW reference (à documenter)
- **Lloyd (Flanvel Tower)** — boss variant canon NEW ⚠️ (vs main Lloyd boss = separate encounter) MAJEUR
- **Magician Faust (Real)** — boss variant canon NEW ⚠️ (vs main Faust = separate variant) MAJEUR
- **Claire** — boss canon NEW ⚠️ MAJEUR
- **Zieg Feld** — boss canon NEW ⚠️ (Zieg = Dart's father, antagonist final-area canon Disc 4) MAJEUR

⚠️ Pattern Damia : 5 additional bosses confirmed use untargetable trick + 3 Dragon Spirits = **8 bosses canon** untargetable mechanic confirmed.

## References

(Section présente mais détails à investiguer future)

## Article complet wiki tier 2 ⭐ canon

Article wiki tier 2 complet (Boss x3 + Combat + Encounters + Traits + Abilities + Gallery + Trivia + References sections détaillées). Pattern Damia : référence stats + AI + Counter + Encounters + Trivia canon précis cross-spirit.
