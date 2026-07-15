# Enemies — wiki LoD (verbatim)

> **Source** : [The Legend of Dragoon Wiki — Enemies](https://legendofdragoon.org/wiki/Enemies)
> **Fiabilité** : 🥈 **tier 2** (wiki LoD legendofdragoon.org — foundation page mécaniques + 6 damage formulas + variable multipliers + complete enemies database list).
> **Sauvegardé le** : 2026-05-25.
> **Usage** : référence canon **Enemies meta-page** — foundation canon Damia : (1) Random encounter mechanic + Arrow color indicator NEW canon ; (2) Enemy categories (Minor / Rare Monster subcategory / Bosses / Boss Extras) cohérent existing canon ; (3) **6 Damage Formulas REVEALED MAJEUR** (Physical / Magical / Addition Counter / Rare Monster Attack / Wire Counter / Haunting Bolt) ; (4) **Variable Multipliers REVEALED MAJEUR** (Attack Multiplier / Fear / Power / Field / Element / Guard) ; (5) **Complete enemies database** with reveals NEW bosses canon (Lavitz's Spirit + Zackwell + Indora + Michael + Belzac/Damia/Kanzas/Syuveil 4 legendary Dragoons + Last Kraken + Imago/Pupa Caterpillar transforms + Melbu Frahma Tentacle/Bomb Star/Monster Boss Extras + Magician Faust Apparition vs Optional variants).

---

## Random Encounter mechanic canon ⭐⭐⭐ NEW MAJEUR

### Arrow color indicator canon NEW

> "A spinning triangle above Dart's head acts as an indicator arrow for how many more steps can be taken before a random encounter begins."

| Arrow Color | Steps Until Encounter |
| ----------- | --------------------- |
| **Blue**    | Many                  |
| **Yellow**  | Some                  |
| **Red**     | Few                   |

⚠️ **Arrow color indicator canon NEW MAJEUR ⭐⭐⭐** :

- Pattern Damia : UI indicator canon NEW — spinning triangle above Dart's head 3-tier color
- Pattern : Blue = safe / Yellow = warning / Red = imminent encounter canon
- À documenter `combat/random-encounters.md` (à créer) — arrow color indicator canon NEW + step counter mechanic

### Area-specific step values canon

- "Each area uses a different value for the number of steps that must be reached before triggering a random encounter"
- Pattern Damia : per-area step threshold canon (variable per location)

### ⭐⭐⭐ **Bug : 75% fewer steps when running up/right canon NEW MAJEUR** :

- "A bug causes movement up or right when running to count 75% fewer steps than intended"
- Pattern Damia : known game bug canon (running up/right counts 25% normal steps) — direction-dependent step count bug
- ⚠️ Pattern decision Damia : reproduire OR fixer ce bug ? (à trancher canon vs balance)

### Areas with permanent Red arrow canon NEW

- "In some areas the arrow will remain red indefinitely, and collision with enemies patrolling the environment will initiate battle instead of steps taken"
- Pattern Damia : visible patrolling enemies canon (vs random invisible encounters) — area-specific design choice canon
- Pattern Damia : 2 encounter mechanics canon : random steps + patrolling visible

## Enemy Categories canon ✓ cohérent existing monster-categories.md

3 categories + 1 subcategory canon :

1. **Minor Enemies** — all random battles, **susceptible Total Vanishing / Pandemonium items** canon
   - **Rare Monsters[1]** subcategory — Minor Enemies in random encounters with **special resistances to damage**
2. **Bosses** — powerful, **immune all status ailments**, scripted only once, **narrative weight**
3. **Boss Extras** — appear in Boss encounters, **neither Minor nor Bosses**

⚠️ Pattern canon ✓ cohérent existing `combat/monster-categories.md` canon — page Enemies confirms taxonomy 3+1 catégories canon.

⭐ **Total Vanishing / Pandemonium susceptibility canon NEW** : Minor Enemies (incl. Rare Monsters) susceptible — pattern Damia item Total Vanishing instant-kill canon (cohérent existing canon Death/Death Purger Total Vanishing drops 8%).

## ⭐⭐⭐ Enemy Damage Formulas REVEALED MAJEUR ⭐⭐⭐⭐⭐

> "While there are primarily two damage formulas that enemies use for dealing physical or magical damage, there are four rare formulas for specific attacks : when enemies counter an addition, when Rare Monsters attack, when Wire counters an addition, and when Ghost Commander uses Haunting Bolt."

### Variable Multipliers canon ⭐⭐⭐ MAJEUR

| Variable              | Value canon                                                                          |
| --------------------- | ------------------------------------------------------------------------------------ |
| **Attack Multiplier** | Hidden value per enemy attack (canon per-enemy page combat section)                  |
| **Target Fear**       | Target Fear Status → **×2**, otherwise **×1**                                        |
| **Attacker Fear**     | Attacker Fear Status → **×(1/2)**, otherwise **×1**                                  |
| **Power**             | No Power items used → **×1**, otherwise **(1) + (Attacker Power + Target Power)**    |
| **Attacker Power**    | Attacker Power Up → **×(1/2)**, Power Down → **−(1/2)**                              |
| **Target Power**      | Target Power Up → **−(1/2)**, Power Down → **×(1/2)** (wiki ambiguity ⚠️)            |
| **Field**             | Attack element neutral special field → **×1**, otherwise **(1) + (Attack Element)**  |
| **Attack Element**    | Attack element matches special field → **×(1/2)**, opposite → **−(1/2)**             |
| **Element**           | Target Element neutral attack element → **×1**, otherwise **(1) + (Target Element)** |
| **Target Element**    | Target Element matches attack element → **−(1/2)**, opposite → **×(1/2)**            |
| **Guard**             | Target Guarding → **×(1/2)**, otherwise **×1**                                       |

⚠️ **Pattern Damia : variable multipliers canon MAJEUR ⭐⭐⭐** — 11 variables canon REVEALED définissent toute formule damage cross-attack-type. À documenter `combat/damage-formula.md` (existing — update with formulas).

### 6 Damage Formulas canon ⭐⭐⭐⭐⭐ MAJEUR

| Attack Type             | Formula canon                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Physical**            | `floor{floor[floor{floor[(AT^2 * 5 / DF)] * Attack Multiplier * Target Fear * Attacker Fear} * Power] * Guard}`                                   |
| **Magical**             | `floor{floor[floor{floor[floor{floor[(MAT^2 * 5 / MDF)] * Attack Multiplier * Target Fear * Attacker Fear} * Power] * Field} * Element] * Guard}` |
| **Addition Counter** \* | `floor{floor[floor{floor[(AT^2 * 250 / DF)] / 100} * Target Fear * Attacker Fear...` (wiki incomplete formula ⚠️)                                 |
| **Rare Monster Attack** | `floor[floor{floor[(Target's Max HP / 10)] * Target Fear} * Guard]`                                                                               |
| **Wire Counter** \*     | `floor[floor{floor(1000 / DF) * Target Fear} * Power]`                                                                                            |
| **Haunting Bolt**       | `floor[floor{floor[(Target's Current HP / 2)] * Target Fear} * Guard]`                                                                            |

- For Addition Counter + Wire Counter : **attacker = enemy countering**, **target = character being countered**.

⚠️ **Wire Counter formula ✓ CROSS-SOURCE CONFIRMED Drake Bandit canon ⭐⭐⭐** :

- `1000 / DF` formula ✓ confirme existing canon Drake the Bandit Wire Boss Extra Sharp passive canon
- Pattern Damia : Sharp passive Drake Wire = Wire Counter formula (1000 / attacker DF) cohérent ✓
- ⭐ Cross-source confirmation canon Damia

⚠️ **Rare Monster Attack formula NEW MAJEUR ⭐⭐⭐** :

- **(Target's Max HP / 10)** = 10% Max HP base damage
- Pattern Damia : Rare Monster signature attack = 10% Max HP damage canon NEW
- Pattern canon Rare Monsters Damia (Cursed Jar, Lucky Jar, Treasure Jar, Cute Cat, etc.)
- À documenter `combat/damage-formula.md` Rare Monster Attack formula canon NEW

⚠️ **Haunting Bolt formula NEW MAJEUR ⭐⭐⭐** :

- **(Target's Current HP / 2)** = 50% Current HP damage canon
- Pattern Damia : **Ghost Commander Haunting Bolt** signature ability canon NEW (Phantom Ship boss Disc 2)
- Pattern canon : 50% Current HP scaling damage — strong but cannot kill (always leaves 50% HP min)
- À cross-référer `bosses/Ghost Commander.md` (à créer/vérifier) — Haunting Bolt signature canon NEW

⚠️ **Physical + Magical formulas canon ⭐⭐⭐** :

- Pattern AT²/DF + MAT²/MDF squared canon (vs linear stat comparison)
- × 5 base multiplier canon
- Order operations canon : floor at each step (precision loss canon = balance design)
- Attack Multiplier hidden per-enemy = ability multiplier canon (cohérent existing canon Damia 1× / 1.5× / 2× / 0.5× etc. multipliers)
- Magical has additional Field + Element steps (vs Physical) — elemental magic canon

## List of All Enemies canon — Database complete

> "This list contains all targetable enemies encountered in the game. It does not include graphical entities such as Kamuy's Tree or the four Mazo found with Faust, with the exception of the ghostly variants of the Dragon Spirits since while they cannot be targeted, they still make attacks and are therefore relevant to the combat."

⚠️ **Pattern Damia : graphical-only entities excluded canon NEW** :

- **Kamuy's Tree** — graphical entity NEW reference (cohérent Kamuy boss canon — existing canon Drake Trivia confirms Kamuy + Dragon Spirit Trivia untargetable trick canon)
- **4 Mazo found with Faust** — NEW graphical entities canon Magician Faust battle (4 Mazo Boss Extras canon NEW)
- Pattern : untargetable + non-attacking = graphical-only canon (excluded from database)
- Pattern Damia : untargetable BUT attacking (Dragon Spirits Ghost forms) = included in database canon

### NEW Bosses revealed via database ⭐⭐⭐

⭐⭐⭐ **Bosses NEW canon revealed via Enemies database** :

| Boss canon NEW                                                  | Location             | Notes                                                                         |
| --------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------- |
| **Belzac (Optional)** Earth                                     | Vellweb              | HP 16,000 + Golden Stone 100% drop — Legendary Earth Dragoon canon ⭐         |
| **Damia (Optional)** Water                                      | Vellweb              | HP 9,000 + Blue Sea Stone 100% drop — Legendary Water Dragoon canon ⭐        |
| **Kanzas (Optional)** Thunder                                   | Vellweb              | HP 12,000 + Violet Stone 100% drop — Legendary Thunder Dragoon canon ⭐       |
| **Syuveil (Optional)** Wind                                     | Vellweb              | HP 10,000 + Jade Stone 100% drop — Legendary Wind Dragoon canon ⭐            |
| **Last Kraken** Water + **Cleone**                              | Aglis                | HP 10,000 + Pretty Hammer 100% drop — multi-entity ⭐                         |
| **Windigo + Heart + Snow Cannon** Water                         | Kashua Glacier       | Multi-entity boss Disc 3 + Brass Knuckle 100% drop ⭐                         |
| **Caterpillar / Pupa / Imago** Non-Elemental                    | Divine Tree          | 3-form transformation boss canon Disc 4 ⭐                                    |
| **Magician Faust (Apparition)** Non-Elemental                   | Flanvel Tower        | HP 25,600 + Apparition variant ⭐ (cohérent Drake Trivia Magician Faust Real) |
| **Magician Faust (Optional)** Non-Elemental                     | Flanvel Tower        | HP 25,600 + 20,000 EXP + 10,000 Gold + Phantom Shield 100% ⭐                 |
| **Kubila + Vector + Selebus** Darkness                          | Zenebatos            | Multi-entity boss canon Disc 4 + 12,000 EXP ⭐                                |
| **Lavitz's Spirit + Zackwell** Wind/Darkness                    | Mayfil               | Multi-entity boss Disc 4 + Halberd 50% + Healing Rain 100% ⭐                 |
| **Indora** Earth                                                | Moon That Never Sets | HP 2,696 + Indora's Axe 100% drop ⭐ (cohérent existing Indora's Axe canon)   |
| **Michael + Michael's Core** Darkness                           | Moon That Never Sets | HP 9,600 multi-entity boss canon Disc 4 ⭐                                    |
| **Archangel** Light                                             | Moon That Never Sets | HP 3,000 boss canon Disc 4 ⭐                                                 |
| **Melbu Frahma + Tentacle + Bomb Star + Monster** Non-Elemental | Moon That Never Sets | HP 42,000 final boss + 3 Boss Extras canon Disc 4 ⭐ MAJEUR                   |

⭐⭐⭐ **Belzac + Damia + Kanzas + Syuveil = 4 Legendary 7 Dragoons canon NEW MAJEUR** :

- Cohérent existing canon Dragoons (7 legendary Dragoons Dragon Campaign)
- Pattern Damia : optional fight Vellweb = legendary Dragoons spirits canon Disc 4
- Each drops "Stone" elemental item canon (Golden / Blue Sea / Violet / Jade Stones)
- Pattern thematic Vellweb = Dragoons legendary final resting place canon
- À documenter `bosses/Belzac.md` + `bosses/Damia.md` + `bosses/Kanzas.md` + `bosses/Syuveil.md` (tous à créer) — 4 Legendary Dragoons optional bosses canon

⭐⭐⭐ **Melbu Frahma final boss + 3 Boss Extras canon MAJEUR** :

- Melbu Frahma HP 42,000 = highest HP canon
- 3 Boss Extras : **Tentacle / Bomb Star / Monster** (HP 1,600 each)
- Pattern canon multi-entity final boss canon (cohérent existing Boss Extras pattern)
- À documenter `bosses/Melbu Frahma.md` (à créer/vérifier) — final boss canon Disc 4 + 3 Boss Extras

⭐⭐⭐ **Lavitz's Spirit + Zackwell canon Mayfil Disc 4 MAJEUR** :

- **Lavitz's Spirit** = Lavitz spirit canon NEW MAJEUR (Lavitz died Disc 1 — spirit revisit Disc 4 Mayfil ghost area)
- **Zackwell** = NEW boss canon Mayfil
- Multi-entity battle canon
- Halberd 50% drop Lavitz's Spirit (cohérent Lavitz Halberd weapon canon)
- Pattern thematic : Mayfil = ghost area Disc 4 (cohérent existing Dragon Spirits + Lavitz's Spirit + Zackwell)
- À documenter `bosses/Lavitz's Spirit.md` + `bosses/Zackwell.md` (à créer) — NEW bosses canon Disc 4 Mayfil

⭐⭐⭐ **Magician Faust 2 variants canon CONFIRMED** :

- **Apparition** (Flanvel Tower 0 EXP / 0 Gold / Nothing drop) — story scripted variant
- **Optional** (Flanvel Tower 20,000 EXP / 10,000 Gold / Phantom Shield 100% drop) — post-game optional super-boss
- ⚠️ Cohérent existing Drake Trivia "Magician Faust (Real)" — "Real" probable = "Optional" variant (real fight vs Apparition cutscene)
- Pattern Damia : Faust 2 encounters canon (Apparition story + Optional super-boss)

### NEW Mob Stats reveals via database

Database confirms stats canon Damia déjà documenté pour 30+ mobs/bosses (cohérent ingestions précédentes : Aqua King, Berserker, Berserk Mouse, Crystal Golem, Cursed Jar, Cute Cat, Dragon Soldier, Dragonfly, Earth Shaker, etc.). Pattern Damia : database wiki = master reference cross-check stats canon.

⭐ **Note Stats divergence cross-source possible** : database wiki vs page individuelle wiki — généralement cohérent ✓ (e.g. Earth Shaker HP 200 / AT 33 / DF 140 / etc. ✓ matches individual page wiki).

## References canon

[1] Legend of Dragoon Official Guidebook, (ASCII, 2000), p.15.

⚠️ **Pattern Damia : Rare Monsters terminology source canon ⭐** : citation Guidebook officiel JP p.15 confirme terminology officiel "Rare Monsters" canon (vs community variants "Unique Monsters" fandom).

## Article complet wiki tier 2 ⭐ canon

Foundation page Enemies wiki (random encounters + categories + damage formulas + variable multipliers + complete enemies database 100+ entries). Pattern Damia : référence canon master.
