# Dragon Soldier — wiki LoD (verbatim)

> **Source** : [The Legend of Dragoon Wiki — Dragon Soldier](https://legendofdragoon.org/wiki/Dragon_Soldier)
> **Fiabilité** : 🥈 **tier 2** (wiki LoD legendofdragoon.org — stats + AI + Counter + Encounters précis).
> **Sauvegardé le** : 2026-05-25.
> **Usage** : référence canon **Dragon Soldier** (Minor Enemy Earth element Flanvel Tower Disc 3). ⭐⭐⭐ **Lore canon MAJEUR** : Flanvel Tower location NEW canon Disc 3 (Mille Seseau Snowfield area). + ⭐⭐⭐ **Physical Attack Barrier NEW ability canon MAJEUR** : self-buff reduces physical damage to 0 until next turn (full physical immunity 1 turn) — NEW defensive ability canon Mob. + ⭐⭐ **HP recovers self-heal canon** : 30% Max HP (146 HP) — pattern cohérent Crystal Golem same 30% formula cross-mob canon. + ⭐⭐ **Knight Shield NEW item canon** : 2% drop probable armor canon. + ⭐⭐ **Metal Fang sibling mob NEW canon** : Flanvel Tower fellow encounter (mixed formation 177). + ⭐⭐ **Counter 28 high-density tier confirmé** cohérent existing canon. + ⭐⭐ **Status 4/4 standard Minor Enemy canon** (Petrify/Bewitch/Arm Block/Dispirit ✔ vs Confuse/Fear/Poison/Stun ✗). + ⭐ **Earth element pattern thematic divergence Snowfield** : Dragon Soldier Earth vs Snowfield région Mille Seseau (cohérent Mob Earth dans tour Snowfield = thematic stone fortress).

---

## Description canon

**Dragon Soldier** is a **Minor Enemy**.

⚠️ **Category canon ⭐** :

- **Minor Enemy** ✓ canon confirmed
- Pattern Minor Enemy Disc 3 Flanvel Tower canon

## Element canon

- **Earth** ⭐ canon
- Pattern Earth element Disc 3 Flanvel Tower thematic stone-fortress canon
- Pattern thematic divergence : Earth element dans Snowfield Mille Seseau (vs typical Ice/Water mobs Snowfield)
- Cohérent thematic "stone fortress + armored soldier" Dragon Soldier canon

## Stats canon (US wiki tier 2)

| Stat | Wiki US    | Notes                                |
| ---- | ---------- | ------------------------------------ |
| HP   | **488** ⭐ | High HP Minor Enemy Disc 3           |
| AT   | **122** ⭐ | High Attack Minor Enemy              |
| DF   | **160** ⭐ | High Defense anti-physical           |
| MAT  | 86         | Moderate magical                     |
| MDF  | 100        | Moderate magical defense             |
| SPD  | 50         | Moderate (vs typical Mob SPD 60-100) |
| A-AV | 0%         | Standard Minor                       |
| M-AV | 0%         | Standard Minor                       |

⚠️ **Pattern "anti-physical heavy tank" canon Dragon Soldier ⭐** :

- **DF 160 high anti-physical** + **MDF 100 moderate** → resist physical favored
- **AT 122 high** + **MAT 86 moderate** → physical bruiser offensive
- **HP 488 high** → durable Minor Enemy Disc 3
- **SPD 50 moderate** → slow (vs typical Mob SPD higher)
- Pattern Damia : `DragonSoldierStats { hp: 488; at: 122; df: 160; mat: 86; mdf: 100; spd: 50; aAv: 0; mAv: 0 }` data-model canon

⚠️ **JP stats à confirmer fandom future** — wiki US only ingéré, pattern Damia adopt JP when available (+25% HP typical / ÷3 Gold systematic). À mettre à jour quand fandom Dragon Soldier ingéré.

## Status Immunity canon (4/4 standard pattern)

| Petrify | Bewitch | Arm Block | Dispirit | Confuse | Fear | Poison | Stun |
| ------- | ------- | --------- | -------- | ------- | ---- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | ✗       | ✗    | ✗      | ✗    |

⚠️ **Pattern Minor Enemy 4/4 standard canon ⭐** :

- Immune : Petrify / Bewitch / Arm Block / Dispirit (4 status immune)
- Vulnerable : Confuse / Fear / Poison / Stun (4 status vulnerable)
- Pattern standard Minor Enemy canon (vs all 8 ✔ boss-tier Bowling/Crystal Golem)
- Cohérent pattern canon "4/4 standard Minor Enemy" most common tier

## Yield canon

- **EXP : 180** (high Minor Enemy Disc 3 yield)
- **Gold : 60** (moderate-high)
- **Drops : Knight Shield 2%** ⭐ NEW item canon

### Knight Shield NEW item canon ⭐⭐

- **Knight Shield** = NEW item canon Damia
- Pattern thematic "shield" = probable armor canon (defensive equipment)
- 2% drop rate canon (cohérent pattern accessory/armor rare drop)
- À documenter `items/equipment.md` Knight Shield armor canon entry — effect précis à investiguer fandom + Guidebook
- Pattern thematic cohérent Dragon Soldier (knight) drops Knight Shield (knight equipment)

## Counter Opportunities (28) — HIGH DENSITY tier ⭐

**(28)** — **HIGH DENSITY canon tier** (max canon tier, cohérent existing Aqua King / Berserk Mouse / Berserker / Atlow / Blue Bird / etc.).

### Counter list (15 entries detailed)

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

Per user instruction : feature Counter non-implémentée Damia, factual tier mention only (pas de détails ability-level).

## AI canon (3-phase NEW Sword Slash + Physical Attack Barrier + HP recovers)

| HP    | Chance | Action                         | Target | Effect                                                        | Notes                                              |
| ----- | ------ | ------------------------------ | ------ | ------------------------------------------------------------- | -------------------------------------------------- |
| Any   | 75%    | ~Sword Slash                   | Single | Inflicts 1× Physical damage                                   | Community approximation (~)                        |
| > 25% | 25%    | **Physical Attack Barrier** ⭐ | Self   | **Reduces physical damage to 0 until next turn** ⚠️ NEW canon | Defensive self-buff ⭐ NEW                         |
| ≤ 25% | 25%    | **HP recovers**                | Self   | **Restores 30% (146) HP**                                     | Cohérent Crystal Golem 30% pattern cross-mob canon |

⚠️ **Pattern AI canon mob 3-phase NEW MAJEUR ⭐** :

- **Phase 1 (any HP, 75% chance)** : ~Sword Slash (1× phys baseline attack)
- **Phase 2 (HP > 25%, 25% chance)** : **Physical Attack Barrier** (self-buff full physical immunity 1 turn) ⭐ NEW
- **Phase 3 (HP ≤ 25%, 25% chance)** : **HP recovers** (30% Max HP = 146 HP self-heal)
- ⚠️ **Pattern**: phase 2 + phase 3 mutually exclusive (HP > 25% → Barrier OR HP ≤ 25% → recovers, both 25% chance)
- ⚠️ **75% Sword Slash baseline** + 25% phase-conditional self-action = aggressive baseline pattern Mob

### ~Sword Slash canon name (community)

- **~Sword Slash** = community approximation baseline ability (1× phys)
- Pattern thematic "knight wielding sword" Dragon Soldier canon
- Pattern 75% baseline + 25% phase-conditional canon NEW (vs Crystal Golem phase-based exclusive)

### Physical Attack Barrier NEW canon ability MAJEUR ⭐⭐⭐

- **Physical Attack Barrier** = NEW canon name officiel (NOT ~ approximation)
- **Effect : reduces physical damage to 0 until next turn** ⚠️ full immunity 1 turn defensive canon
- ⚠️ Pattern Damia : `PhysicalAttackBarrierAbility { type: 'self-buff'; effect: 'physical-damage-zero'; duration: 'next-turn' }` data-model canon NEW
- Pattern thematic "shield up defensive stance" canon Dragon Soldier
- ⚠️ Pattern NEW : full physical immunity ability canon (vs typical % damage reduction)
- Strategy counter canon : utiliser Magic attacks pendant Barrier turn (physique inutile)
- À implémenter ability `physicalAttackBarrier` Damia self-buff full physical immunity 1 turn canon
- Pattern Mob defensive self-buff canon NEW (rare — most Mob aggressive attacks only)
- À cross-référer pattern existing : Magical Attack Barrier symmetric canon ? À investiguer

### HP recovers self-heal canon ✓ cross-mob confirmed cohérent Crystal Golem ⭐⭐

- **HP recovers** = canon name officiel (cohérent Crystal Golem + Commander Seles canon)
- **30% Max HP = 146 HP** (Dragon Soldier US 488 × 30% = 146 ✓)
- ⚠️ Pattern 30% scaling formula canon ✓ confirmed cross-mob :
  - Crystal Golem US 160 × 30% = 48 ✓ / JP 200 × 30% = 60 ✓
  - Dragon Soldier US 488 × 30% = 146 ✓ / JP TBD (probable +25% = 610 × 30% = 183)
- Pattern Damia : `HpRecoversAbility { type: 'self-heal'; healPercent: 0.3 }` data-model canon **shared cross-mob/boss**
- Cohérent thematic "knight regenerates/treats wounds" canon Dragon Soldier
- À implémenter shared ability `hpRecovers` Damia cross-mob/boss

## Encounters canon

### Flanvel Tower (Disc 3) ⭐⭐⭐ NEW location canon

| Encounter Formation (ID)            | Submap IDs | Encounter% | Escape% |
| ----------------------------------- | ---------- | ---------- | ------- |
| Dragon Soldier (171)                | Unused     | N/A        | 30%     |
| Dragon Soldier x2 (176)             | 449, 451   | 20%, 10%   | 30%     |
| Metal Fang x2, Dragon Soldier (177) | 451        | 35%        | 30%     |

⚠️ **Flanvel Tower location NEW canon MAJEUR ⭐⭐⭐** :

- **Flanvel Tower** = NEW location canon Disc 3 Mille Seseau Snowfield area
- À documenter `locations/Flanvel Tower.md` (à créer) — Disc 3 Mille Seseau Snowfield Tower NEW location canon
- Pattern thematic cohérent canon TLoD : Flanvel Tower = Snow Queen / White Silver Dragon Spirit location canon Disc 3
- Cross-référer existing Snowfield + Mille Seseau canon

⚠️ **Metal Fang sibling mob NEW canon ⭐⭐** :

- **Metal Fang** = NEW Mob canon Flanvel Tower fellow encounter
- À documenter `mobs/Metal Fang.md` (à créer) — Disc 3 Flanvel Tower Mob NEW
- Pattern mixed formation canon : Metal Fang x2 + Dragon Soldier (3-entity formation 35%)
- Cohérent pattern mixed mob formations Mob encounter canon

⚠️ **Encounter Formation 171 "Unused" canon ⭐** :

- **Dragon Soldier solo (171)** = Unused encounter canon (cut content / dev placeholder)
- Pattern cut content encounter canon : formation existe data mais N/A spawn
- Cohérent pattern Dark Elf / Bewitching Arrow cut content canon (existing canon)
- À noter : encounter ID 171 reserved data mais non-spawn dans final game

### Escape rate 30% canon

- **30% escape rate** Flanvel Tower canon (all 3 formations)
- Pattern moderate-low escape Disc 3 (cohérent pattern boss area)

### No World Map Road encounters

- Dragon Soldier = **Flanvel Tower exclusive** canon (no World Map spawns)
- Pattern Mob enclosed location exclusive canon (vs Crystal Golem multi-road)

## Combat flow canon

1. Mob spawn Flanvel Tower submaps 449/451 (Disc 3)
2. AI cycle (Damia US HP 488 base, JP TBD) :
   - 75% baseline : ~Sword Slash (1× phys)
   - 25% conditional :
     - HP > 25% (= HP 123+) : Physical Attack Barrier (full physical immunity 1 turn) ⭐ NEW
     - HP ≤ 25% (= HP 122-) : HP recovers (self-heal 146 HP)
3. Counter mechanism (Counter 28 high-density tier)
4. **DF 160 high anti-physical** + **MDF 100 moderate** = magic favored offensive
5. **AT 122 high** = significant physical damage threat to party

### Strategy canon recommandée

- **Earth weak Wind** → Lavitz/Albert Wind Dragoon attacks favored
- **Magic player favored** : exploit MDF 100 moderate (magic less resisted than physical DF 160)
- **Physical Attack Barrier counter** : utiliser Magic attacks pendant Barrier turn (physique inutile)
- **HP recovers ≤ 25%** = burst damage threshold canon (must finish or self-heal undoes progress)
- **Status applicables** : Confuse / Fear / Poison / Stun (4 vulnerables)
  - Stun ⭐ recommended (interrupt AI cycle)
  - Poison DoT vs HP 488 high
  - Confuse / Fear vs aggressive 75% Sword Slash baseline
- **Knight Shield farming** : 2% rate canon ⚠️ rare drop
- **Escape 30%** = moderate-low option Flanvel Tower

## Trivia / References

(Article wiki complet sans Gallery / Trivia / References détaillés — section présente mais vide dans cette ingestion)

## Article complet wiki tier 2 ⭐ canon

Article wiki tier 2 complet (Combat / Encounters / Abilities sections détaillées). Pattern Damia : référence stats + AI + Counter + Encounters canon précis.
