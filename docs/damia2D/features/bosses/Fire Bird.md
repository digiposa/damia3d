# Fire Bird — Boss canon Volcano Villude Disc 1 (source Red-Eye Stone)

> **Boss volcanique Disc 1** : Fire element, source canon **Red-Eye Stone 100%** (-50% Fire magic damage), pattern Sequential Retaliation + Volcano Ball Boss Extra summons.
>
> **Sources** :
>
> - 🥈 [`_sources/lod-wiki-fire-bird.md`](./_sources/lod-wiki-fire-bird.md) — wiki LoD (stats + 3 retaliations sequential + Volcano Ball boss extra + HP 61% threshold phase swap + Instigate Erupt max 3/4 damage)
> - 🥉 [`_sources/fandom-fire-bird.md`](./_sources/fandom-fire-bird.md) — fandom (JP name Rokkuhāken "rock piton" + Rose's first hand knowledge canon tease + Dabas merchant rescued + Wounded Virage prequel boss + Phoenix resemblance + ability names officiels Volcanic Peck/Presto Fire/Summon/Dive Bomb/Fire Quake + HP color states blue/yellow/red + Volcano Ball HP 50 vs wiki 8 divergence)

## Statut

🟡 **Draft post-ingestion wiki LoD + fandom** — Story Chapter 1 arc canon documenté + Wounded Virage prequel boss canon + Dabas NPC merchant.

## Identity canon

- **Espèce** : Bird canon, Fire element (Red-Eye Dragon lineage symbolic ?)
- **Location canon** : **Volcano Villude (submap 121)** — volcan canon Serdio
- **Disc** : Disc 1 (categorized canon "Disc 1" wiki)
- **Pattern symbolique** : **Drop Red-Eye Stone 100%** ⚠️ stratégique pour Disc 4 Zieg Feld fight (Fire element counter)
- **Counters Additions ? No** : pas de counter mechanism
- **Final Blow passive** : battle ends quand Fire Bird HP=0 (même si Volcano Balls survivent → pattern "main boss = victory trigger")

## Stats canon

| Stat        | Value   |
| ----------- | ------- |
| HP          | 640     |
| AT          | 13      |
| DF          | 80      |
| MAT         | 16      |
| MDF         | 80      |
| SPD         | 45      |
| A-AV / M-AV | 0% / 0% |

→ Pattern boss canon Disc 1 : HP 640 (vs Feyrbrand 480, Doel ~? ), MAT 16 > AT 13 → Fire Bird = magic damage dealer profil canon.

## Status Immunity canon

**All 8 status immune** (pattern boss canon master).

## Yield canon ⭐ MAJEUR

- **EXP : 800 / Gold : 100**
- **Drop : Red-Eye Stone 100%** ⭐ source canon principal Red-Eye Stone (Fire-element damage reduction -50%)
- Cohérent avec [`items/equipment.md`](../items/equipment.md) §6 — pattern 7 stones elemental dropped from bosses canon

## Mécaniques canon spécifiques

### Trait passive : Sequential Retaliation ⭐ MAJEUR NEW pattern

Vs Feyrbrand (single Retaliate type), Fire Bird a **3 retaliates cycliques** :

```
Cycle: (1st) → (2nd) → (3rd) → (1st) → ...
```

**Trigger commun** : **Has a chance to trigger when targeted by an Addition** ⚠️ vs Feyrbrand (magic-trigger), Fire Bird trigger = Addition-targeted.

| Retaliate | Action(s)                                                                                                 | Notes                                      |
| --------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **1st**   | Bind and Peck (single phys) OR Fiery Wing Beat (party phys HP>61%) OR Molten Dive (party Fire mag HP<61%) | Selection conditionnée par HP threshold    |
| **2nd**   | Call Volcano Balls (summon ×4)                                                                            | Active phase 2 du combat (extras summoned) |
| **3rd**   | Instigate Erupt (force 4 Volcano Balls to Erupt, **max 3 hit**) OR Do Nothing si pas de Volcano Ball      | Pattern "tactical AoE setup-payoff"        |

→ **Pattern boss tactical canon** : 2nd Retaliate setup les Volcano Balls, 3rd Retaliate les déchaîne. Player a 1 cycle pour kill les Volcano Balls (HP 8 each = très fragile).

### HP threshold 61% canon (phase swap)

| HP > 61%                              | HP < 61%                                |
| ------------------------------------- | --------------------------------------- |
| **Fiery Wing Beat** (0.5× phys party) | **Molten Dive** (0.5× Fire magic party) |

→ Pattern boss "phase swap canon" : transition phys→magic à low HP. Suggérer player conserver heal magic-tanks low HP phase.

### "Trigger when targeted by Addition" canon ⚠️ NEW vs Feyrbrand

- Feyrbrand : Retaliate triggered **by magic damage** (any magic source)
- **Fire Bird : Retaliate triggered "by Addition"** ⚠️ NEW pattern : Addition action de party trigger Sequential Retaliation cycle

→ Stratégie canon : **Addition spam → Sequential Retaliation cycle deterministic** : player peut prédire cycle 1→2→3 et l'exploiter. Pattern intéressant gameplay.

⚠️ Note "Has a chance to trigger" → non systématique, chance probabiliste (à investiguer % exact).

## Boss Extra : Volcano Ball canon

| Stat       | Value                |
| ---------- | -------------------- |
| HP         | **8** (très fragile) |
| AT         | 12                   |
| DF         | 80                   |
| MAT        | 12                   |
| MDF        | 100                  |
| SPD        | 45                   |
| EXP / Gold | 0 / 0                |

- **4 summoned** par Call Volcano Balls (Fire Bird 2nd Retaliate)
- **Max 3 deal damage** sur Instigate Erupt canon ⚠️ (1 fail/4)
- HP 8 = **One-shot via single Addition typical** Disc 1 (Dart Volcano Villude AT ~25-30 with Heat Blade)
- Pattern Boss Extra : **summons "soft" countering tactical** — player priority kill Volcano Balls AVANT Instigate Erupt

### Erupt ability canon

- Target Single, 1× physical damage
- **Only triggered by Fire Bird's Instigate Erupt** (pas action autonome)

## Combat flow canon

1. Battle start : Fire Bird seul (Volcano Villude submap 121)
2. Pattern alterne base : Bind and Peck / Fiery Wing Beat (HP > 61%) / Molten Dive (HP < 61%)
3. Si player Addition Fire Bird → **chance trigger Retaliate**
4. Cycle Retaliate :
   - Premier Addition trigger → (1st) Retaliate = action HP-conditional
   - Deuxième Addition trigger → (2nd) Retaliate = Summon 4 Volcano Balls
   - Troisième Addition trigger → (3rd) Retaliate = Instigate Erupt (3/4 damage)
   - Quatrième Addition trigger → (1st) Retaliate again (cycle repeat)
5. Player wins quand Fire Bird HP=0 (**Final Blow passive** — Volcano Balls auto-disparaissent)

### Strategy canon recommandée

- **Limit Additions usage** (pour éviter trigger Retaliate) OR exploit cycle deterministic
- **Kill Volcano Balls quickly** entre 2nd Retaliate et 3rd Retaliate (1 turn window)
- **Phase 1 (HP > 61%)** : Fiery Wing Beat physical party damage — equip physical defense
- **Phase 2 (HP < 61%)** : Molten Dive Fire magic party damage — equip Red-Eye Stone (irony: drop reward) + Magic Ego Bell / Spiritual Ring
- Fire Bird = Fire weak to Water → utiliser Meru/Shana water magic OU Sparkle Arrow (Light counters Fire) — à confirmer
- Heat Blade Dart = SAME element Fire → 0.5× resist par Fire Bird probable. Switch back to Bastard Sword ou non-elemental

## Story beats canon — Chapter 1 The Serdian War (fandom enrichi)

### Sequence canon Volcano Villude

1. **Entry Volcano Villude** : party voit Fire Bird "in the distance" — air rougâtre haze + tension reveal
2. ⭐ **Rose's first hand knowledge canon tease** : "recognizes the creature, **as if she has first hand knowledge of it, or as if it were a legend of the past**" → 11k ans lore tease canon (avant reveal Rose Disc 2/3)
3. Fire Bird recognizes group → flies in → party escape par volcanic haze + caverns lava
4. **Wounded Virage boss** (first boss Villude) — combat #1 ⚠️ NEW canon (Wounded Virage = boss precedent)
5. **Dabas merchant travelling rescued** ⚠️ NEW NPC canon
6. Exit volcano → **Fire Bird ambush** (boss #2 consecutive même location) — Fire Bird invoque fire spirits + spray fire/magma
7. Combat Fire Bird → defeat → Red-Eye Stone drop

⭐ **2 bosses consecutive Volcano Villude canon** : pattern unique TLoD Disc 1.

### Phoenix resemblance + JP name canon

- **Fire Bird resembles Phoenix** (legendary bird canon visual)
- **JP name** : ロックハーケン (_Rokkuhāken_) = "**rock piton**" (rock climbing tool) ⚠️ divergence EN/JP completely different metaphor (EN "Fire Bird" vs JP "rock piton"). À investiguer rationale localisation.

### Lore canon tease "known creature in Serdio"

- ⚠️ **Soldier of Hoax warning canon** : après **Battle of Hoax** (event canon Disc 1), un soldat warn Dart group : "beware of Fire Bird in Volcano Villude". Confirme Fire Bird = **legendary local creature Serdio canon**.

## Cross-check fandom (compléments + divergences)

**Confirmations utiles fandom** :

- **Fire Bird location Volcano Villude** confirmé
- **Fire weakness counter canon** : Magical Attack Items effective, particulièrement **Spear Frosts** (Water/Frost Repeat Item, bought Bale) → cohérent Fire↔Water opposing pair
- **Dart Fire element = "easier fight, takes less damage from some attacks"** → confirme **same-element resist 0.5×** canon (Dart Red Dragoon + Fire weapon vs Fire enemy)
- **Lavitz low MDF profile canon** explicit : "Fire Dive and Volcano Ball Summon serious damage to Lavitz low Magical Defense"
- **HP progressive escalation canon general pattern bosses** : "uses progressively stronger attacks as health gets lower" → pattern bosses canon master (multi-phase implicit)
- **2 bosses consecutive Volcano Villude** confirmé (Wounded Virage + Fire Bird) + save game advice canon

**NEW canon fandom-only** ⭐ :

- ⭐ **JP name ロックハーケン (Rokkuhāken)** = "rock piton" — localisation divergence majeure EN/JP
- ⭐ **Rose's first hand knowledge tease** : 11k ans lore foreshadowing canon
- ⭐ **Dabas merchant travelling canon NPC** rescued Volcano Villude
- ⭐ **Wounded Virage boss canon precedent** Volcano Villude (boss #1 avant Fire Bird boss #2)
- ⭐ **Phoenix resemblance canon** visual lore
- ⭐ **Battle of Hoax canon event** + Hoax soldier warns Fire Bird canon
- ⭐ **HP color states canon** : blue (high) / yellow (mid) / red (low) — UI state mapping canon
- ⭐ **Ability names officiels canon** : **Volcanic Peck** / **Presto Fire** / **Summon** / **Dive Bomb** / **Fire Quake** (mentioned indirectly comparative "Peck and Fire Quake")
- **Dive Bomb HP red only canon** : low HP exclusive attack (≤25% probable)
- **Presto Fire blue OR yellow HP canon** : phase swap implicite (mid HP)
- **Summon "1-2 times max especially when red HP" canon** : limited usage canon

**Divergences stats wiki vs fandom** :

| Item / Stat             | Wiki LoD                                                                                    | Fandom                                                                          | Notes                                                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fire Bird P. Attack** | 13                                                                                          | **15**                                                                          | ⚠️ DIVERGENCE — wiki tier 2 prévaut probable (13)                                                                                                                                                               |
| **Fire Bird M. Attack** | 16                                                                                          | **19**                                                                          | ⚠️ DIVERGENCE — wiki tier 2 prévaut probable (16)                                                                                                                                                               |
| **Fire Bird HP JP**     | (silent)                                                                                    | 800                                                                             | Fandom canon JP +25% pattern systématique                                                                                                                                                                       |
| **Volcano Ball HP**     | **8**                                                                                       | **50**                                                                          | ⚠️ DIVERGENCE MAJEURE — facteur 6×. À investiguer Discord. Wiki tier 2 prévaut probable (8)                                                                                                                     |
| **Drop name**           | "Red-Eye Stone"                                                                             | "Red-Eyed Stone"                                                                | Orthographe variant (wiki tier 2 prévaut "Red-Eye Stone")                                                                                                                                                       |
| **Can Counterattack**   | "No" (Counters Additions ?)                                                                 | **"Yes"**                                                                       | ⚠️ DIVERGENCE conceptuelle. **Possible** : Retaliate (wiki) = Counterattack (fandom canon term) — wiki Counter Opportunities = 0 mais Retaliate = counter mechanism different ? À clarifier nomenclature canon. |
| **Ability names**       | "~Bind and Peck / ~Fiery Wing Beat / ~Molten Dive / ~Call Volcano Balls / ~Instigate Erupt" | **"Volcanic Peck / Presto Fire / Dive Bomb / Summon / (Fire Quake mentioned)"** | Fandom donne **noms canon officiels** (vs ~community wiki). Adopter fandom canon.                                                                                                                               |
| **HP threshold**        | "HP > 61% / HP < 61%" exact                                                                 | **"blue / yellow / red"** colors                                                | Fandom = visual UI states (3 zones), wiki = exact 61%. Possible mapping : blue=high / yellow=mid / red=low.                                                                                                     |

→ **Wiki tier 2 prévaut pour stats numériques** + thresholds exacts.
→ **Fandom prévaut pour names canon + UI color states + lore narrative**.

## Vision Damia (implémentation)

### Décisions canon à conserver

1. **HP 640 / stats canon** Disc 1 boss authenticity
2. **Status immunity ALL 8** (pattern master)
3. **Sequential Retaliation 3-cycle** : pattern unique vs Feyrbrand single Retaliate
4. **Addition-trigger Retaliate** (vs magic-trigger Feyrbrand) : design diversity bosses canon
5. **HP 61% threshold phase swap** : 2-phase boss canon explicite
6. **Volcano Ball Boss Extra summons** : pattern "boss + extras"
7. **Instigate Erupt max 3/4 damage** : pattern "imperfect AoE" canon
8. **Final Blow passive** : battle ends Fire Bird HP=0 even with extras alive
9. **Red-Eye Stone 100% drop** : preserve canon strategic reward
10. **HP 8 Volcano Balls** : fragile = player priority kill window

### Implementation tech

- Data-model `BossPassive` extended :
  ```ts
  type BossPassive = {
    name: 'Retaliate' | 'SequentialRetaliation' | 'FinalBlow' | string;
    trigger: 'on_magic_targeted' | 'on_addition_targeted' | 'on_hp_threshold' | ...;
    chance?: number;  // Fire Bird: < 1.0 (probabilistic)
    sequence?: BossAction[];  // for Sequential
    sequenceIndex?: number;  // current cycle position
  };
  ```
- Data-model `BossExtra`:
  ```ts
  type BossExtra = {
    spawnAction: 'Call Volcano Balls';
    spawnCount: number;
    extraEntity: BossEntity; // Volcano Ball stats
  };
  ```
- HP threshold ability swap : `Ability { conditions: { hpPctMin?: number, hpPctMax?: number } }`

### Questions ouvertes

- **% exact "Has a chance to trigger"** : 50% ? 75% ? À investiguer Discord cadors.
- **Instigate Erupt 3/4 fail** : déterministe ou random ? Probable random "1 fail/4" canon.
- **Element resistance Fire Bird** : Water double damage canon ? Light counter ? À investiguer.

## Liens transverses

- [`../locations/Volcano Villude.md`](../locations/Volcano Villude.md) (à créer) — location canon encounter
- [`../items/equipment.md`](../items/equipment.md) — Red-Eye Stone (Fire Bird 100% drop, Disc 4 Zieg Feld counter)
- [`../combat/elements.md`](../combat/elements.md) — Fire element + Fire↔Water opposing pair
- [`../bosses/Feyrbrand.md`](./Feyrbrand.md) — comparable Retaliate boss pattern (single vs sequential)
- [`Zieg.md`](./Zieg.md) (à créer) — Disc 4 final boss Fire element (Red-Eye Stone counter)

## Gaps / TODO

Voir [TODO.md](../../TODO.md) section Fire Bird.
