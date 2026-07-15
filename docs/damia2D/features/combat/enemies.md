# Enemies — foundation meta-page canon TLoD

> **Page meta-foundation canon TLoD** : (1) Random encounter mechanic + Arrow color indicator NEW canon ; (2) Enemy categories 3+1 (Minor Enemies / Rare Monsters subcategory / Bosses / Boss Extras) cohérent existing `monster-categories.md` canon ; (3) ⭐⭐⭐ **6 Damage Formulas REVEALED MAJEUR** (Physical / Magical / Addition Counter / Rare Monster Attack / Wire Counter / Haunting Bolt) ; (4) ⭐⭐⭐ **11 Variable Multipliers REVEALED MAJEUR** ; (5) Complete enemies database 100+ entries révèle 14 NEW bosses canon Damia.
>
> ⭐⭐⭐ **6 Damage Formulas canon REVEALED MAJEUR ⭐⭐⭐⭐⭐** — Physical / Magical / Addition Counter / Rare Monster Attack / Wire Counter (✓ Drake Bandit Sharp passive cross-source confirmed) / Haunting Bolt (Ghost Commander signature).
>
> ⭐⭐⭐ **Variable Multipliers 11 canon REVEALED MAJEUR** — Attack Multiplier (hidden per-enemy) / Target Fear ×2 / Attacker Fear ×0.5 / Power / Field / Element / Guard ×0.5.
>
> ⭐⭐⭐ **Arrow color indicator canon NEW MAJEUR** — Blue (Many steps) / Yellow (Some) / Red (Few) — UI spinning triangle above Dart's head.
>
> ⭐⭐⭐ **Bug 75% fewer steps running up/right canon NEW** — Direction-dependent step count bug canon (à décider Damia : reproduire OR fixer).
>
> ⭐⭐⭐ **Patrolling visible enemies areas canon NEW** — Some areas arrow permanent red + visible patrolling enemies collision = battle (vs random invisible).
>
> ⭐⭐⭐ **Rare Monster Attack formula = 10% Max HP canon NEW MAJEUR** — Rare Monsters signature attack canon (Cursed Jar/Lucky Jar/Treasure Jar/Cute Cat).
>
> ⭐⭐⭐ **Haunting Bolt formula = 50% Current HP canon NEW MAJEUR** — Ghost Commander Phantom Ship signature ability canon Disc 2.
>
> ⭐⭐⭐ **Wire Counter formula ✓ CROSS-SOURCE CONFIRMED Drake Bandit Sharp passive** — `1000 / attacker DF` formula match.
>
> ⭐⭐⭐ **14 NEW Bosses revealed via database** — Belzac/Damia/Kanzas/Syuveil (4 Legendary 7 Dragoons Vellweb optional) + Last Kraken (Aglis) + Windigo + Imago/Pupa/Caterpillar transforms + Magician Faust Apparition vs Optional variants + Kubila/Vector/Selebus (Zenebatos) + Lavitz's Spirit + Zackwell (Mayfil) + Indora + Michael/Michael's Core + Archangel + Melbu Frahma + Tentacle/Bomb Star/Monster (3 Boss Extras final boss).
>
> ⭐⭐ **Enemy categories 3+1 ✓ confirmed** — Minor Enemies / Rare Monsters subcategory / Bosses / Boss Extras (cohérent existing `monster-categories.md`).
>
> ⭐⭐ **Total Vanishing / Pandemonium susceptibility Minor Enemies canon ✓ confirmed**.
>
> ⭐⭐ **Graphical-only entities excluded canon NEW** — Kamuy's Tree + 4 Mazo Faust = untargetable non-attacking entities excluded database (Dragon Spirits Ghost forms included = untargetable but attacking).
>
> **Sources** :
>
> - 🥈 [`_sources/lod-wiki-enemies.md`](./_sources/lod-wiki-enemies.md) — wiki LoD tier 2 (foundation meta-page Enemies — random encounters + 3+1 categories + 6 damage formulas + 11 variable multipliers + complete 100+ enemies database + Guidebook 2000 p.15 reference Rare Monsters terminology)

## Statut

🟡 **Canon documenté wiki tier 2** — meta-foundation page (fandom équivalent à investiguer future ?).

## Random Encounter Mechanic canon ⭐⭐⭐ NEW

### Arrow Color Indicator canon NEW MAJEUR

| Arrow Color | Steps Until Encounter | UI signal             |
| ----------- | --------------------- | --------------------- |
| **Blue**    | Many                  | Safe (few encounters) |
| **Yellow**  | Some                  | Warning (moderate)    |
| **Red**     | Few                   | Imminent encounter    |

Pattern Damia : UI indicator canon NEW — spinning triangle above Dart's head 3-tier color system.

### Mechanics canon

- **Each area uses different step value** canon (variable per location)
- **Bug 75% fewer steps when running up/right** canon NEW MAJEUR ⚠️ (direction-dependent bug)
- **Some areas permanent Red + visible patrolling enemies collision = battle** canon NEW

### Decision Damia (implementation)

- ⚠️ **Reproduire OR fixer bug 75% fewer steps running up/right ?** : pattern Damia respect canon vs balance design — à trancher
- Pattern Damia : 3-tier arrow color UI canon respecté
- Pattern Damia : 2 encounter mechanics canon (random steps + patrolling visible) à supporter

## Enemy Categories canon ✓ cohérent existing

3 categories + 1 subcategory canon (cohérent existing `monster-categories.md`) :

1. **Minor Enemies**
   - All random battles
   - ⭐ **Susceptible Total Vanishing / Pandemonium items** canon (instant-kill items)
   - **Rare Monsters[1]** subcategory : Minor Enemies with special damage resistances
2. **Bosses**
   - Powerful enemies
   - **Immune all status ailments** (all 8 ✔ pattern Damia confirmed)
   - Encountered only once scripted events
   - Narrative weight canon
3. **Boss Extras**
   - Appear in Boss encounters
   - **Neither Minor Enemies nor Bosses** canon
   - Pattern Damia : Boss Extras canonical 4+ instances (Crafty Thief / Drake Bandit Disc 1 + Divine Dragon Disc 3 + Dark Doel Disc 4 + Melbu Frahma final boss confirmed)

⚠️ **Pattern Damia foundation canon** : Enemies wiki page meta-foundation confirms taxonomy 3+1 categories canon Damia.

## ⭐⭐⭐ Damage Formulas canon REVEALED MAJEUR ⭐⭐⭐⭐⭐

### 6 Formulas canon

| Attack Type             | Formula canon (wiki tier 2)                                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Physical**            | `floor{floor[floor{floor[(AT^2 * 5 / DF)] * AttackMult * TargetFear * AttackerFear} * Power] * Guard}`                                   |
| **Magical**             | `floor{floor[floor{floor[floor{floor[(MAT^2 * 5 / MDF)] * AttackMult * TargetFear * AttackerFear} * Power] * Field} * Element] * Guard}` |
| **Addition Counter** \* | `floor{floor[floor{floor[(AT^2 * 250 / DF)] / 100} * TargetFear * AttackerFear...` (wiki incomplete ⚠️)                                  |
| **Rare Monster Attack** | `floor[floor{floor[(Target MaxHP / 10)] * TargetFear} * Guard]`                                                                          |
| **Wire Counter** \*     | `floor[floor{floor(1000 / DF) * TargetFear} * Power]`                                                                                    |
| **Haunting Bolt**       | `floor[floor{floor[(Target CurrentHP / 2)] * TargetFear} * Guard]`                                                                       |

\* Addition Counter + Wire Counter : attacker = enemy countering, target = character countered

### Key formula insights canon ⭐⭐⭐

⚠️ **Pattern AT²/DF + MAT²/MDF squared canon MAJEUR** :

- Physical = `AT² × 5 / DF` base
- Magical = `MAT² × 5 / MDF` base
- Pattern Damia : **squared attacker stat / linear defender stat × 5 base** canon — non-linear scaling design canon
- À documenter `combat/damage-formula.md` (existing — update with revealed formulas)

⚠️ **Wire Counter formula ✓ CROSS-SOURCE CONFIRMED Drake Bandit Sharp passive canon ⭐⭐⭐** :

- `1000 / DF` formula ✓ confirme Sharp passive Wire Boss Extra Drake canon (existing canon)
- Pattern Damia : Sharp passive Drake Wire = Wire Counter formula cohérent ✓
- Cross-source confirmation canon Damia consolidée

⚠️ **Rare Monster Attack formula NEW MAJEUR ⭐⭐⭐** :

- **(Target MaxHP / 10)** = 10% Max HP scaling damage
- Pattern Damia : **Rare Monsters signature attack = 10% Max HP** canon NEW
- Cohérent existing Rare Monsters canon (Cursed Jar / Lucky Jar / Treasure Jar / Cute Cat) — pattern Rare Monster gimmick damage canon
- À documenter pattern Rare Monster Attack canon Damia

⚠️ **Haunting Bolt formula NEW MAJEUR ⭐⭐⭐** :

- **(Target CurrentHP / 2)** = 50% Current HP scaling damage
- **Ghost Commander Phantom Ship Disc 2 signature ability** canon NEW
- Pattern canon : 50% Current HP scaling damage — **strong but cannot kill** (always leaves 50% HP min)
- À cross-référer `bosses/Ghost Commander.md` (à créer/vérifier) — Haunting Bolt signature canon NEW

### Variable Multipliers canon ⭐⭐⭐ 11 canon

| Variable                    | Value canon                                                          |
| --------------------------- | -------------------------------------------------------------------- |
| **Attack Multiplier**       | Hidden per-enemy attack value (canon per-enemy page combat section)  |
| **Target Fear**             | Target Fear → ×2, otherwise ×1                                       |
| **Attacker Fear**           | Attacker Fear → ×(1/2), otherwise ×1                                 |
| **Power**                   | No Power items → ×1, otherwise (1) + (Attacker Power + Target Power) |
| **Attacker Power Up**       | ×(1/2) damage dealt                                                  |
| **Attacker Power Down**     | −(1/2) damage dealt                                                  |
| **Target Power Up**         | −(1/2) damage received                                               |
| **Target Power Down**       | ×(1/2) damage received (wiki ambiguity ⚠️)                           |
| **Field**                   | Attack neutral special field → ×1, otherwise (1) + Attack Element    |
| **Attack Element match**    | ×(1/2) magic boost                                                   |
| **Attack Element opposite** | −(1/2) magic reduction                                               |
| **Target Element match**    | −(1/2) damage received (resistance)                                  |
| **Target Element opp.**     | ×(1/2) damage received (weakness)                                    |
| **Guard**                   | Target Guarding → ×(1/2), otherwise ×1                               |

Pattern Damia : **11 variable multipliers canon MAJEUR** définissent toute formule damage cross-attack-type.

## List of All Enemies canon — Database master

⭐⭐⭐ **Database wiki = master reference cross-check stats canon Damia** :

- 100+ enemies entries complete with stats (HP / DF / MDF / PAV / MAV / AT / MAT / SPD / EXP / Gold / Drops / Location)
- Cohérent ingestions précédentes Damia (Crystal Golem / Cursed Jar / Cute Cat / Dragon Soldier / Dragonfly / Drake Bandit / Earth Shaker / etc.)
- Pattern Damia : database = master reference future cross-source validation

### Excluded graphical-only entities canon NEW

- **Kamuy's Tree** — graphical entity Kamuy boss canon (cohérent existing Drake Trivia + Dragon Spirit Trivia canon)
- **4 Mazo found with Faust** — graphical entities Magician Faust battle canon NEW
- Pattern Damia : untargetable + non-attacking = graphical-only canon (excluded)
- Pattern Damia : untargetable BUT attacking (Dragon Spirits Ghost forms) = included canon

### 14 NEW Bosses canon revealed via database ⭐⭐⭐

⭐⭐⭐ **Bosses NEW canon revealed via Enemies database** :

| Boss canon NEW                                                  | Location             | HP     | Drop signature                               |
| --------------------------------------------------------------- | -------------------- | ------ | -------------------------------------------- |
| **Belzac (Optional)** Earth                                     | Vellweb              | 16,000 | Golden Stone 100%                            |
| **Damia (Optional)** Water                                      | Vellweb              | 9,000  | Blue Sea Stone 100%                          |
| **Kanzas (Optional)** Thunder                                   | Vellweb              | 12,000 | Violet Stone 100%                            |
| **Syuveil (Optional)** Wind                                     | Vellweb              | 10,000 | Jade Stone 100%                              |
| **Last Kraken + Cleone** Water                                  | Aglis                | 10,000 | Pretty Hammer 100%                           |
| **Windigo + Heart + Snow Cannon** Water                         | Kashua Glacier       | 10,000 | Brass Knuckle 100%                           |
| **Caterpillar / Pupa / Imago** Non-Elemental (3-form)           | Divine Tree          | 6,000  | Healing Rain/Moon Serenade/Sun Rhapsody 100% |
| **Magician Faust (Apparition)** Non-Elemental                   | Flanvel Tower        | 25,600 | Nothing (story scripted)                     |
| **Magician Faust (Optional)** Non-Elemental                     | Flanvel Tower        | 25,600 | Phantom Shield 100% + 20K EXP / 10K Gold ⭐  |
| **Kubila + Vector + Selebus** Darkness multi-entity             | Zenebatos            | 4,000  | Nothing                                      |
| **Lavitz's Spirit + Zackwell** Wind/Darkness multi-entity       | Mayfil               | 8,000  | Halberd 50% + Healing Rain 100%              |
| **Indora** Earth                                                | Moon That Never Sets | 2,696  | Indora's Axe 100%                            |
| **Michael + Michael's Core** Darkness multi-entity              | Moon That Never Sets | 9,600  | Nothing                                      |
| **Archangel** Light                                             | Moon That Never Sets | 3,000  | Nothing                                      |
| **Melbu Frahma + Tentacle + Bomb Star + Monster** Non-Elemental | Moon That Never Sets | 42,000 | Nothing (final boss) ⭐⭐⭐                  |

⭐⭐⭐ **Belzac + Damia + Kanzas + Syuveil = 4 Legendary 7 Dragoons canon NEW MAJEUR** :

- Cohérent existing canon Dragoons (7 legendary Dragoons Dragon Campaign)
- Pattern Damia : optional fight Vellweb = legendary Dragoons spirits canon Disc 4
- Each drops "Stone" elemental item canon (Golden / Blue Sea / Violet / Jade Stones)
- Pattern thematic Vellweb = Dragoons legendary final resting place canon

⭐⭐⭐ **Melbu Frahma final boss + 3 Boss Extras canon MAJEUR** :

- Melbu Frahma HP 42,000 = **highest HP canon TLoD**
- 3 Boss Extras : Tentacle / Bomb Star / Monster (HP 1,600 each)
- Pattern canon multi-entity final boss canon

⭐⭐⭐ **Lavitz's Spirit + Zackwell canon Mayfil Disc 4 MAJEUR** :

- Lavitz's Spirit = Lavitz revisit ghost form Disc 4 Mayfil canon NEW MAJEUR (Lavitz died Disc 1)
- Pattern thematic Mayfil = ghost area Disc 4 (cohérent existing Dragon Spirits + Lavitz's Spirit + Zackwell)

## Vision Damia (implémentation)

### Décisions canon à conserver

1. **Random encounter mechanic canon** : arrow color 3-tier (Blue/Yellow/Red) + step counter per-area + bug 75% running up/right + patrolling visible enemies subset
2. **Enemy categories 3+1 canon** ✓ cohérent existing
3. **6 Damage Formulas canon REVEALED MAJEUR** ⭐⭐⭐⭐⭐ : Physical / Magical / Addition Counter / Rare Monster Attack / Wire Counter (✓ Drake cross-source) / Haunting Bolt
4. **11 Variable Multipliers canon REVEALED MAJEUR** ⭐⭐⭐
5. **Total Vanishing / Pandemonium susceptibility Minor Enemies canon** ✓
6. **Graphical-only entities excluded canon NEW** (Kamuy's Tree + 4 Mazo Faust)
7. **Untargetable but attacking included canon** (Dragon Spirits Ghost forms)
8. **14 NEW Bosses canon revealed** : 4 Legendary Dragoons Vellweb + Last Kraken + Windigo + Caterpillar transforms + Magician Faust 2 variants + Kubila trio + Lavitz's Spirit + Zackwell + Indora + Michael + Archangel + Melbu Frahma + 3 Boss Extras
9. **AT²/DF squared damage scaling canon** : non-linear design
10. **Rare Monster Attack 10% Max HP signature canon NEW**
11. **Haunting Bolt 50% Current HP Ghost Commander signature canon NEW**

### Questions ouvertes

- **Addition Counter formula complete** : wiki incomplete formula ⚠️ — à investiguer / Discord
- **Power formula ambiguity** : Target Power Up vs Down inverse wiki ambiguity ⚠️
- **Bug 75% fewer steps reproduire OR fixer Damia ?** : balance vs canon décision
- **4 Legendary Dragoons stats canon** : à ingérer wiki + fandom future (Belzac/Damia/Kanzas/Syuveil)
- **Melbu Frahma final boss canon détaillé** : à ingérer wiki + fandom future
- **Lavitz's Spirit lore canon Disc 4 Mayfil** : à investiguer story canon
- **Magician Faust Apparition vs Optional variants** : 2 encounters canon — story canon ?
- **Indora story canon** : à investiguer Moon That Never Sets Disc 4
- **Michael + Michael's Core canon** : à investiguer
- **Archangel canon** : à investiguer
- **Last Kraken + Cleone canon** : à investiguer Aglis Disc 4
- **Windigo + Heart + Snow Cannon canon** : à investiguer Kashua Glacier Disc 3
- **Caterpillar/Pupa/Imago 3-form canon** : à compléter (existing partial canon)
- **Kubila/Vector/Selebus trio canon** : à investiguer Zenebatos Disc 4

## Liens transverses

- [`README.md`](./README.md) — combat canon
- [`monster-categories.md`](./monster-categories.md) — taxonomy 3+1 ✓ confirmed Enemies meta-page
- [`damage-formula.md`](./damage-formula.md) — update with 6 formulas + 11 variable multipliers revealed
- [`random-encounters.md`](./random-encounters.md) (à créer) — arrow color indicator NEW canon + step counter + bug + patrolling enemies
- [`additions.md`](./additions.md) — Addition Counter formula link
- [`elements.md`](./elements.md) — Field + Element variable multipliers
- [`../bosses/Belzac.md`](../bosses/Belzac.md) (à créer) — Legendary Earth Dragoon Vellweb optional canon NEW
- [`../bosses/Damia.md`](../bosses/Damia.md) (à créer) — Legendary Water Dragoon Vellweb optional canon NEW
- [`../bosses/Kanzas.md`](../bosses/Kanzas.md) (à créer) — Legendary Thunder Dragoon Vellweb optional canon NEW
- [`../bosses/Syuveil.md`](../bosses/Syuveil.md) (à créer) — Legendary Wind Dragoon Vellweb optional canon NEW
- [`../bosses/Last Kraken.md`](../bosses/Last Kraken.md) (à créer) — Aglis boss canon NEW
- [`../bosses/Windigo.md`](../bosses/Windigo.md) (à créer) — Kashua Glacier boss multi-entity canon NEW
- [`../bosses/Magician Faust.md`](../bosses/Magician Faust.md) (à créer) — Flanvel Tower Apparition + Optional canon variants NEW
- [`../bosses/Kubila.md`](../bosses/Kubila.md) (à créer) — Zenebatos trio boss canon NEW
- [`../bosses/Lavitz's Spirit.md`](../bosses/Lavitz's Spirit.md) (à créer) — Mayfil ghost canon NEW MAJEUR
- [`../bosses/Zackwell.md`](../bosses/Zackwell.md) (à créer) — Mayfil boss canon NEW
- [`../bosses/Indora.md`](../bosses/Indora.md) (à créer) — Moon That Never Sets boss canon NEW
- [`../bosses/Michael.md`](../bosses/Michael.md) (à créer) — Moon That Never Sets multi-entity boss canon NEW
- [`../bosses/Archangel.md`](../bosses/Archangel.md) (à créer) — Moon That Never Sets Light boss canon NEW
- [`../bosses/Melbu Frahma.md`](../bosses/Melbu Frahma.md) (à créer/vérifier) — final boss canon Disc 4 + 3 Boss Extras
- [`../bosses/Ghost Commander.md`](../bosses/Ghost Commander.md) (à créer/vérifier) — Haunting Bolt signature canon NEW
- [`../dragoons/dragons.md`](../dragoons/dragons.md) — 7 Legendary Dragoons cross-reference canon

## Gaps / TODO

Voir [TODO.md](../../TODO.md) section Enemies.
