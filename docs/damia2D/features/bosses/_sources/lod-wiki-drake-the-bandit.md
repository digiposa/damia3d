# Drake the Bandit — wiki LoD (verbatim)

> **Source** : [The Legend of Dragoon Wiki — Drake the Bandit](https://legendofdragoon.org/wiki/Drake_the_Bandit)
> **Fiabilité** : 🥈 **tier 2** (wiki LoD legendofdragoon.org — stats + AI + Counter + Encounters + Boss Extras précis).
> **Sauvegardé le** : 2026-05-25.
> **Usage** : référence canon **Drake the Bandit** (Boss Shrine of Shirley Disc 1 Wind). ⭐⭐⭐ **Multi-entity boss canon MAJEUR** : Drake + **3× Bursting Ball** (Boss Extra NEW) + **1× Wire** (Boss Extra NEW) = 5 entities battle. + ⭐⭐⭐ **Final Blow passive Disc 1 canon NEW** (cohérent existing Divine Dragon canon — battle ends when Drake HP 0). + ⭐⭐⭐ **Bomb Trap → Wire Trap → HP recovers chain canon NEW MAJEUR** : sequential "Enable" trigger system Drake AI canon. + ⭐⭐⭐ **Bursting Ball Boss Extra NEW canon** : kamikaze self-destruct AoE bomb thematic (HP 64, Roll Forward → Detonate after twice). + ⭐⭐⭐ **Wire Boss Extra NEW canon MAJEUR** : 2 passives Impassable (0× phys to Drake = full phys immunity via Wire) + Sharp (reactive 1,000/DF damage when Drake targeted by Addition). + ⭐⭐⭐ **Boss Extras canonical 4ème instance** : Drake the Bandit Disc 1 + Divine Dragon Disc 3 + Dark Doel Disc 4 + Crafty Thief existing canon = 4 Boss Extras confirmed canon. + ⭐⭐ **Counter 0 No counter tier** all 3 entities (cohérent Air Combat/Feyrbrand/Fire Bird/Canbria Dayfly). + ⭐⭐ **Bandit's Ring 30% drop NEW item canon** (high drop rate vs typical 2-8%). + ⭐⭐ **Shrine of Shirley canon location** (cohérent Crystal Golem Shrine + Shirley Light Dragoon Spirit canon Disc 1). + ⭐⭐ **HP recovers single-use chain-gated canon** (vs Crystal Golem repeatable). + ⭐⭐ **Status all 8 ✔ Boss-tier** all 3 entities.

---

## Description canon

**Drake the Bandit** = Boss Disc 1 Wind element Shrine of Shirley + 2 Boss Extras (Bursting Ball x3 + Wire) = **5-entity battle canon**.

## Boss main — Drake the Bandit

### Identity canon

- **Element** : **Wind**
- **Counters Additions** : **No** (Counter 0)

### Stats canon

| Stat | Wiki US      | Notes                                |
| ---- | ------------ | ------------------------------------ |
| HP   | **1,200** ⭐ | Disc 1 boss HP tier moderate         |
| AT   | 20           | Low Attack (weak baseline offensive) |
| DF   | 80           | Moderate Defense                     |
| MAT  | 17           | Very low Magical                     |
| MDF  | 80           | Moderate Magical Defense             |
| SPD  | 70           | Moderate SPD                         |
| A-AV | 0%           | Standard Boss                        |
| M-AV | 0%           | Standard Boss                        |

### Status Immunity canon (all 8 ✔ Boss-tier)

| Petrify | Bewitch | Arm Block | Dispirit | Confuse | Fear | Poison | Stun |
| ------- | ------- | --------- | -------- | ------- | ---- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | ✔       | ✔    | ✔      | ✔    |

Pattern Boss-tier all 8 ✔ standard canon.

### Yield canon

- **EXP** : **1,500** (Disc 1 boss yield)
- **Gold** : 100
- **Drops** : **Bandit's Ring 30%** ⭐⭐ NEW item canon — high drop rate

#### Bandit's Ring NEW item canon ⭐⭐

- **Bandit's Ring** = NEW item canon Damia
- **30% drop rate** ⭐ — high drop rate (vs typical 2-8% Mob accessory)
- Pattern thematic "Bandit" name = cohérent Drake the Bandit signature drop
- Pattern Damia probable accessory canon (ring = accessory thematic)
- À documenter `items/equipment.md` Bandit's Ring accessory entry — effect précis à investiguer fandom + Guidebook

### Counter Opportunities (0) — NO COUNTER tier

**(0)** — **No counter** tier (cohérent existing canon Air Combat / Feyrbrand / Fire Bird / Canbria Dayfly).

### Story

(Wiki section "Read More" — détails Story à investiguer future. Pattern thematic : Drake = bandit stealing Shirley's Light Dragoon Spirit canon Disc 1)

### Encounters canon

| Encounter Formation (ID) | Location (Submap ID)    | Encounter | Escape |
| ------------------------ | ----------------------- | --------- | ------ |
| Drake the Bandit (412)   | Shrine of Shirley (161) | Scripted  | 0%     |

⚠️ **Scripted encounter canon** + **0% escape** Boss battle canon standard.

### Traits canon — Final Blow passive NEW Disc 1 ⭐⭐⭐

| Passive        | Effect                                               | Requires |
| -------------- | ---------------------------------------------------- | -------- |
| **Final Blow** | **Battle ends when Drake the Bandit's HP reaches 0** | —        |

⚠️ **Final Blow passive Disc 1 canon NEW MAJEUR ⭐⭐⭐** :

- **Final Blow** = canon passive (cohérent existing Divine Dragon Final Blow canon Disc 3)
- **Effect canon** : battle ends when Drake HP reaches 0 (regardless of remaining Boss Extras — Bursting Balls / Wire persist mais battle ends)
- Pattern Damia : `FinalBlowPassive { trigger: 'main-boss-hp-zero'; effect: 'end-battle' }` data-model canon — cohérent existing canon
- ⭐ **Pattern canon Damia Boss Extras** : Final Blow = canonical main-priority pattern (cohérent Divine Dragon main-priority canon + Drake the Bandit confirms Disc 1 instance)
- Pattern canon multi-entity boss : kill main = win battle (Boss Extras inutiles à kill)
- À documenter `combat/passives.md` (à créer/vérifier) Final Blow passive cross-boss canon

### Abilities canon — Drake the Bandit

| Action            | Target | Effect                                             | Conditions                                                                       |
| ----------------- | ------ | -------------------------------------------------- | -------------------------------------------------------------------------------- |
| **~Throw Knives** | Single | 1× Physical damage                                 | —                                                                                |
| **~Bomb Trap** ⭐ | N/A    | Summons **Bursting Ball (x3)** + Enables Wire Trap | Bursting Ball not in battle. **Will always use within first 3 actions** ⭐ canon |
| **~Wire Trap** ⭐ | N/A    | Summons **Wire** + Enables HP recovers             | Wire not in battle. Must be **Enabled by Bomb Trap**. **HP ≤ 50%**               |
| **HP recovers**   | Self   | Restores **30% (360) HP**                          | Must be **Enabled by Wire Trap**. **HP ≤ 33.3%**. **Single use** ⭐              |

⚠️ **Bomb Trap → Wire Trap → HP recovers chain canon NEW MAJEUR ⭐⭐⭐** :

- **Sequential "Enable" trigger system** canon NEW
- Drake AI cascade canon :
  1. **Bomb Trap** (within first 3 actions, summons 3× Bursting Ball + enables Wire Trap)
  2. **Wire Trap** (HP ≤ 50%, summons Wire + enables HP recovers)
  3. **HP recovers** (HP ≤ 33.3%, single-use 30% Max HP heal = 360 HP)
- Pattern Damia : `EnableChainAI { phase1: 'bomb-trap'; phase2: 'wire-trap-conditional-hp50'; phase3: 'hp-recovers-conditional-hp33-single-use' }` data-model canon NEW
- ⚠️ Pattern canon : HP recovers gated triple-condition (Wire Trap enabled + HP ≤ 33.3% + single use)
- À implémenter ability chain enable system Damia (canon NEW Boss AI mechanic)

⚠️ **HP recovers single-use chain-gated canon ⭐⭐** :

- **30% Max HP = 360 HP** (Drake US 1,200 × 30% = 360 ✓ — cohérent existing canon 30% formula Crystal Golem + Dragon Soldier)
- ⚠️ **Single use canon** (vs Crystal Golem repeatable / Dragon Soldier repeatable) — pattern NEW canon Drake variant
- À cross-référer existing canon `combat/mob-abilities.md` HP recovers shared cross-mob/boss canon

---

## Boss Extra (Bursting Ball) — NEW canon ⭐⭐⭐

### Identity canon Bursting Ball

- **Name** : Bursting Ball (Boss Extra summoned by Drake's Bomb Trap)
- **Element** : **Non-Elemental**
- **Counters Additions** : No (Counter 0)
- **Quantity** : 3× spawned simultaneously by Bomb Trap canon

### Stats canon Bursting Ball

| Stat      | Wiki US | Notes                               |
| --------- | ------- | ----------------------------------- |
| HP        | **64**  | Very low HP (fragile bomb canon)    |
| AT        | 30      |                                     |
| DF        | **150** | **High Defense** anti-physical ⭐   |
| MAT       | 30      |                                     |
| MDF       | 50      | Low Magical Defense (magic favored) |
| SPD       | 70      |                                     |
| A-AV/M-AV | 0%/0%   |                                     |

### Status Immunity canon Bursting Ball (all 8 ✔ Boss-tier)

Same all 8 ✔ pattern.

### Yield canon Bursting Ball

- **EXP / Gold / Drops** : **0 / 0 / Nothing** (Boss Extra = no yield canon cohérent existing pattern)

### Counter Opportunities (0) Bursting Ball

**(0)** — No counter tier (Boss Extra cohérent canon).

### Abilities canon Bursting Ball ⭐⭐ NEW kamikaze AI

| Action            | Target                                          | Effect                                              | Conditions                                          |
| ----------------- | ----------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| **~Roll Forward** | Self                                            | Move towards party member opposite of Bursting Ball | —                                                   |
| **~Detonate** ⭐  | Single (party member opposite of Bursting Ball) | 1× Physical damage + **self destructs** ⭐          | **Only used after Roll Forward twice**. **Auto** ⭐ |

⚠️ **Bursting Ball kamikaze AI NEW canon MAJEUR ⭐⭐⭐** :

- Pattern thematic "ball rolls towards target then explodes self-destructs" canon
- **2-Roll-Forward → Auto-Detonate** sequence canon NEW
- Pattern Damia : `BurstingBallKamikazeAI { rollPhases: 2; autoDetonate: true; target: 'opposite-party-member'; selfDestruct: true }` data-model canon NEW
- ⚠️ Pattern position-based target canon : "opposite of Bursting Ball" — 3-position party canon (cohérent Divine Dragon Cannon position-based)
- À implémenter Boss Extra summoned entity Damia avec kamikaze AI canon NEW

---

## Boss Extra (Wire) — NEW canon MAJEUR ⭐⭐⭐

### Identity canon Wire

- **Name** : Wire (Boss Extra summoned by Drake's Wire Trap)
- **Element** : **Non-Elemental**
- **Counters Additions** : No (Counter 0)
- **Quantity** : 1× spawned by Wire Trap canon

### Stats canon Wire

| Stat      | Wiki US | Notes                                       |
| --------- | ------- | ------------------------------------------- |
| HP        | **120** | Low HP                                      |
| AT        | 13      | Very low Attack (irrelevant — passive Wire) |
| DF        | **120** | **High Defense** anti-physical              |
| MAT       | 13      | Very low Magical                            |
| MDF       | 80      | Moderate Magical Defense                    |
| SPD       | 50      |                                             |
| A-AV/M-AV | 0%/0%   |                                             |

### Status Immunity canon Wire (all 8 ✔ Boss-tier)

Same all 8 ✔ pattern.

### Yield canon Wire

- **EXP / Gold / Drops** : **0 / 0 / Nothing** (Boss Extra canon)

### Counter Opportunities (0) Wire

**(0)** — No counter tier.

### Traits canon Wire — 2 NEW passives MAJEURS ⭐⭐⭐

| Passive               | Effect                                                      | Requires                                                      |
| --------------------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| **Impassable** ⭐⭐⭐ | **0× Physical Damage Multiplier to Drake the Bandit**       | —                                                             |
| **Sharp** ⭐⭐⭐      | **(1,000 / attacker's DF) Physical Damage to the attacker** | **Triggers when Drake the Bandit is targeted by an Addition** |

⚠️ **Impassable passive canon NEW MAJEUR ⭐⭐⭐** :

- **0× Physical Damage Multiplier to Drake** = **full physical immunity via Wire** canon
- Pattern Damia : `ImpassablePassive { effect: 'physical-damage-zero-to-protected-entity'; protectedEntity: 'drake-the-bandit' }` data-model canon NEW
- ⚠️ Pattern Boss Extra defensive shield canon NEW : Wire = shield for Drake (physical attacks deal 0 damage while Wire alive)
- Strategy counter canon : **kill Wire first** to disable Impassable + access physical damage Drake
- À implémenter passive `impassable` Damia (canon NEW Boss Extra defensive)

⚠️ **Sharp passive canon NEW MAJEUR ⭐⭐⭐** :

- **(1,000 / attacker's DF) Physical Damage** to attacker when Drake targeted by Addition
- ⚠️ **Reactive damage formula canon NEW** : 1,000 / DF inverse formula (lower DF = higher damage taken)
- Pattern Damia : `SharpReactivePassive { trigger: 'protected-targeted-by-addition'; formula: '1000 / attackerDF'; damageTarget: 'attacker' }` data-model canon NEW
- ⚠️ Pattern reactive thorns/spikes damage canon NEW (cohérent thematic Wire = sharp barbed wire)
- Pattern canon Damia : attacker DF self-protection vs Sharp counter (higher DF gear = less Sharp damage taken)
- Strategy counter canon : avoid Additions targeting Drake while Wire alive (Magic / Items / non-Addition attacks favored)
- À implémenter passive `sharp` Damia (canon NEW reactive damage)

### Abilities canon Wire ⭐

| Action          | Target | Effect       | Conditions |
| --------------- | ------ | ------------ | ---------- |
| **~Do nothing** | N/A    | Does nothing | —          |

⚠️ **Wire passive-only canon ⭐** :

- Wire's role = **defensive passive shield** for Drake (Impassable + Sharp)
- AI action = **~Do nothing** (no offensive ability)
- Pattern Damia : Boss Extra passive-only entity canon NEW (cohérent thematic Wire = inanimate trap barbed wire)
- À implémenter Boss Extra entity Damia avec passive-only AI canon NEW

## Gallery

(Wiki section "Gallery" présente)

## Trivia / References

(Article wiki sections présentes mais détails à investiguer future)

## Pattern Boss Extras canon 4ème instance MAJEUR ⭐⭐⭐

⭐⭐⭐ **Boss Extras canonical 4ème instance confirmed** :

1. **Drake the Bandit** Disc 1 + Bursting Ball + Wire (3 entities, NEW)
2. **Crafty Thief** Disc 1 + Boss Extras existing canon (Dual-classification Minor + Boss Extras)
3. **Divine Dragon** Disc 3 + Boss Extras existing canon (multi-entity 3-entity 9000 HP total)
4. **Dark Doel** Disc 4 + Light Sword + Shadow Blade existing canon (3500 HP)

→ Pattern Damia : Boss Extras = canonical recurring boss mechanic (4 instances confirmed cross-disc 1/3/4).

## Article complet wiki tier 2 ⭐ canon

Article wiki tier 2 complet (Story + Combat + Boss Extra Bursting Ball + Boss Extra Wire + Gallery + Trivia + References sections détaillées). Pattern Damia : référence stats + AI + Counter + Encounters + Boss Extras + passives canon précis cross-entity.
