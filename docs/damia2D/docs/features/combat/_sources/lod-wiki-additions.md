# Additions — legendofdragoon.org wiki

> **Source** : [legendofdragoon.org wiki — Additions](https://legendofdragoon.org/wiki/Additions)
> **Fiabilité** : 🥈 **tier 2** (cf. [hiérarchie sources](../../README.md#hiérarchie-de-fiabilité-des-sources-canon-tlod)) — wiki interne communauté, source la plus exhaustive sur les Additions.
> **Sauvegardé le** : 2026-05-18.
> **Usage** : référence canon pour [`additions.md`](../additions.md), [`damage-formula.md`](../damage-formula.md) (formule Addition + Counter), `items/equipment.md` (Wargod accessories), `bosses/` (counter groups), `dragoons/additions.md`.
>
> Light formatting markdown appliqué, contenu textuel + tables préservés verbatim.

---

## Définition

**Additions** are named attacks that chain multiple hits together through successive **quick time events** where each successful input increases the attack damage and Spirit Points (SP) gained ; SP is only awarded for characters who possess a Dragoon Spirit.

**Exception** : Shana and Miranda do **not** have Additions.

Initiated by the **Attack command**. Additions vary in number of inputs, rhythm, pattern, damage, and SP gain. Each is specific to one party member, with the exception of **Lavitz and Albert** whose Additions are identical except for differing **rhythm** and **counterattack opportunities**.

## Appearance

When an Addition begins, a **"timing sight"** appears :

- A stationary blue square overlaid on the attack target
- Another larger square that rotates and collapses toward the first square

The objective is to press the indicated button (**usually the X button**) when the larger square overlaps the smaller square.

**Feedback color** of the square when pressing the button :

- **White** → perfect
- **Blue** → too slow
- **Gray** → too fast

Failure ends the chain of attacks and the opportunity to deal more damage is lost.

A **button icon** also appears that can be used instead of the timing sight by pressing the button when the icon changes.

## Levels

- Beginning at **level 1**, Additions increase in level after being successfully performed **20 times** up to a **maximum level of 5**.
- Leveling up an Addition can **increase its damage**, **SP gain**, or **both**.
- ⚠️ Important : the level up does **not** come into effect from crossing the threshold **until after the battle ends**.
  - Example : entering a battle with an Addition at **19 performances** means it will **remain level 1** for that battle no matter how many times it is performed despite only needing 1 more to reach level 2.
  - While the level itself only updates after battle ends, performances are **still recorded** past the threshold to level up.
- Additions **cannot be changed during battle** — only equipable in the **Additions menu of the System Screen**.

## Accessory Interactions

| Accessory           | Effect                                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| **Wargod Calling**  | Auto-completes Additions but : **deals half damage**, **half SP gain**, does NOT level the Addition |
| **Ultimate Wargod** | Auto-completes Additions, **full damage + SP + leveling** retained                                  |

## Counterattacks

Sometimes enemies respond to Additions by **"counterattacking"**, indicated by :

- A **red flash**
- A **whooshing sound**
- A **brief pause**
- The **timing sight becomes red**

The next input must still be **timed correctly**, but requires the **circle button** instead of the X button :

- **Success** → Addition proceeds normally, timing sight reverts to blue
- **Failure** → Addition ends, attacking character receives damage via the **Counter formula**

### Variable Multipliers (Counter formula)

- **Target Fear** — if the Target has the Fear Status then `(2)` otherwise `(1)`
- **Attacker Fear** — if the Attacker has the Fear Status then `(1 / 2)` otherwise `(1)`
- **Power** — if no Power items used `(1)`, otherwise `[(1) + (Attacker Power + Target Power)]`
- **Attacker Power** — if the Attacker has power up then `(1 / 2)` or if power down then `-(1 / 2)`
- **Target Power** — if the Target has power up then `-(1 / 2)` or if power up then `(1 / 2)`

### Addition Counter Formula

```
floor{floor[floor{floor[(AT² * 250 / DF)] / 100} * Target Fear * Attacker Fear] * Power}
```

> _For clarity, the **attacker** in the Addition Counter formula refers to the **enemy** countering the addition, and **target** refers to the **character being countered**._

### Counterattack Behavior — Rules

- A counterattack **can only occur once per Addition** (the circle button will never need to be input more than once per attack)
- Counterattacks **never occur on the first or last** timed button press
  - Consequence : Additions that possess 2 or fewer presses **will never be counterattacked**
- Sometimes enemies will **not** counterattack even if given an opportunity
- Some enemies **cannot** counterattack at all

### Counterattack Opportunities

Most enemies capable of counterattacking can use any of the **28 possible opportunities** showcased in the chart below. There are 37 enemies who do not have some of these opportunities and are sorted into groups : **23, 19, 16, 13, 9, 4, 3, 2, 1**.

Enemies in a group have identical counterattack opportunities. Higher numbered groups possess all the opportunities of lower numbered groups. Example : if a group-13 enemy can counter Crush Dance press 2, so can all higher groups (16, 19, 23, 28).

| User    | Addition           | Button Press | 28  | 23  | 19  | 16  | 13  | 9   | 4   | 3   | 2   | 1   |
| ------- | ------------------ | ------------ | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Dart    | Volcano            | 2            | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Dart    | Crush Dance        | 2            | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No  |
| Dart    | Crush Dance        | 3            | Yes | Yes | Yes | Yes | Yes | Yes | No  | No  | No  | No  |
| Dart    | Moon Strike        | 2            | Yes | Yes | No  | No  | No  | No  | No  | No  | No  | No  |
| Dart    | Moon Strike        | 3            | Yes | Yes | No  | No  | No  | No  | No  | No  | No  | No  |
| Lavitz  | Rod Typhoon        | 2            | Yes | No  | No  | No  | No  | No  | No  | No  | No  | No  |
| Lavitz  | Rod Typhoon        | 3            | Yes | No  | No  | No  | No  | No  | No  | No  | No  | No  |
| Lavitz  | Gust of Wind Dance | 2            | Yes | Yes | Yes | Yes | Yes | Yes | No  | No  | No  | No  |
| Lavitz  | Gust of Wind Dance | 5            | Yes | No  | No  | No  | No  | No  | No  | No  | No  | No  |
| Lavitz  | Flower Storm       | 2            | Yes | Yes | Yes | Yes | Yes | Yes | No  | No  | No  | No  |
| Lavitz  | Flower Storm       | 3            | Yes | Yes | Yes | Yes | No  | No  | No  | No  | No  | No  |
| Lavitz  | Flower Storm       | 4            | Yes | Yes | Yes | Yes | No  | No  | No  | No  | No  | No  |
| Lavitz  | Flower Storm       | 5            | Yes | Yes | Yes | Yes | Yes | No  | No  | No  | No  | No  |
| Lavitz  | Flower Storm       | 6            | Yes | Yes | Yes | Yes | Yes | No  | No  | No  | No  | No  |
| Rose    | Hard Blade         | 2            | Yes | Yes | Yes | Yes | Yes | No  | No  | No  | No  | No  |
| Rose    | Demon's Dance      | 3            | Yes | Yes | No  | No  | No  | No  | No  | No  | No  | No  |
| Rose    | Demon's Dance      | 4            | Yes | Yes | Yes | Yes | Yes | Yes | No  | No  | No  | No  |
| Rose    | Demon's Dance      | 5            | Yes | Yes | Yes | Yes | Yes | Yes | No  | No  | No  | No  |
| Rose    | Demon's Dance      | 6            | Yes | Yes | Yes | No  | No  | No  | No  | No  | No  | No  |
| Meru    | Cool Boogie        | 2            | Yes | Yes | No  | No  | No  | No  | No  | No  | No  | No  |
| Meru    | Cool Boogie        | 3            | Yes | Yes | Yes | Yes | No  | No  | No  | No  | No  | No  |
| Meru    | Cat's Cradle       | 3            | Yes | Yes | Yes | No  | No  | No  | No  | No  | No  | No  |
| Meru    | Cat's Cradle       | 4            | Yes | No  | No  | No  | No  | No  | No  | No  | No  | No  |
| Meru    | Perky Step         | 2            | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No  | No  | No  |
| Haschel | Summon 4 Gods      | 2            | Yes | Yes | Yes | No  | No  | No  | No  | No  | No  | No  |
| Haschel | Hex Hammer         | 2            | Yes | No  | No  | No  | No  | No  | No  | No  | No  | No  |
| Albert  | Gust of Wind Dance | 2            | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No  | No  |
| Albert  | Flower Storm       | 2            | Yes | Yes | Yes | Yes | Yes | No  | No  | No  | No  | No  |

### Minor Enemies by Group

**28** : Aqua King, Baby Dragon, Basilisk, Beastie Dragon, Berserk Mouse, Berserker, Commander (Marshland), Crafty Thief (Home of Giganto), Crescent Bee, Crocodile, Cute Cat, Death, Death Purger, Dragon Soldier, Earth Shaker, Erupting Chick, Fairy, Flying Rat, Forest Runner, Freeze Knight, Frilled Lizard, Gangster, Gargoyle, Goblin, Guftas, Guillotine, Harpy, Hell Hound, Hellena Warden (1st visit), Hellena Warden (with Fruegel), Hellena Warden (2nd visit), Human Hunter, Hyper Skeleton, Icicle Ball, Killer Bird, Knight of Sandora (Black Castle), Land Skater, Living Statue, Mad Skull, Mandrake, Mantis, Maximum Volt, Mega Sea Dragon, Mermaid, Merman, Metal Fang, Minotaur, Mole, Moss Dresser, Mountain Ape, Mr. Bone, Myconido, Orc, Piggy, Plague Rat, Potbelly, Professor, Psyche Druid, Puck, Rodriguez, Run Fast, Salamander, Sandora Elite (Black Castle), Sandora Soldier (Hoax), Sandora Soldier (Marshland & Fire Element), Sandora Soldier (Marshland & Water Element), Screw Shell, Sea Dragon, Senior Warden (2nd visit), Skeleton, Spider Urchin, Spiky Beetle, Stinger, Strong Man, Succubus, Swift Dragon, Terminator, Toad Stool, Trent, Ugly Balloon, Vampire Kiwi, White Ape, Wildman, Windy Weasel, Wounded Bear

**23** : Scissorhands, Scorpion, Dark Elf, Gnome, Loner Knight, Magician Bogy, Rocky Turtle

**19** : Assassin Cock, Fowl Fighter, Fire Spirit, Specter, Glare, Slug, Unicorn

**16** : Deadly Spider, Evil Spider, Madman, Red Hot, Slime, Magma Fish, Sea Piranha, Cactus, Undead

**13** : Lizard Man, Jelly

**9** : Arrow Shooter, Will-o'-Wisp

**4** : Bowling, Dragonfly

**3** : Crystal Golem, Screaming Bat, Tricky Bat

**2** : Witch

**1** : Spring Hitter

### Rare Monsters by Group

**28** : Blue Bird, OOPARTS, Rainbow Bird, Red Bird, Yellow Bird

**16** : Cursed Jar, Lucky Jar, Treasure Jar

### Bosses by Group

**28** : Archangel, Atlow, Belzac, Caterpillar, Claire, Damia, Danton, Dark Doel, Dragon Spirit (Divine Dragon), Dragon Spirit (Feyrbrand), Dragon Spirit (Regole), Emperor Doel, Fruegel (1st visit), Fruegel (2nd visit), Gehrich, Ghost Commander, Gorgaga, Imago, Kamuy, Kanzas, Kubila, Magician Faust (Real), Mappi (Barrens), Mappi (with Gehrich), Polter Armor, Polter Helm, Polter Sword, Sandora Elite (Hoax), Selebus, Serfius, Syuveil, Vector, Zieg Feld

### Boss Extras by Group

**28** : Cleone, Crafty Thief (with Mappi), Ghost Knight, Senior Warden (with Fruegel)

## Party Member Additions

> _Additions marked with a `*` are **never countered**. The Dmg% shown in the Additions menu is the combination of the "hit" and "Multiplier" variables when assuming the Addition is performed perfectly._

### Dart

| Name             | Presses | Dmg% (Maxed) | SP (Maxed) | Acquisition                          |
| ---------------- | ------- | ------------ | ---------- | ------------------------------------ |
| \*Double Slash   | 1       | 202%         | 35         | Initial                              |
| Volcano          | 3       | 250%         | 36         | Level 2                              |
| \*Burning Rush   | 2       | 150%         | 102        | Level 8                              |
| Crush Dance      | 4       | 250%         | 100        | Level 15                             |
| \*Madness Hero   | 5       | 100%         | 204        | Level 22                             |
| Moon Strike      | 6       | 350%         | 20         | Level 29                             |
| \*Blazing Dynamo | 7       | 450%         | 150        | Perform all prior additions 80 times |

### Lavitz

| Name               | Presses | Dmg% (Maxed) | SP (Maxed) | Acquisition                          |
| ------------------ | ------- | ------------ | ---------- | ------------------------------------ |
| \*Harpoon          | 1       | 150%         | 50         | Initial                              |
| \*Spinning Cane    | 2       | 200%         | 35         | Level 5                              |
| Rod Typhoon        | 4       | 202%         | 100        | Level 7                              |
| Gust of Wind Dance | 6       | 350%         | 35         | Level 11                             |
| Flower Storm       | 7       | 405%         | 202        | Perform all prior additions 80 times |

### Albert

| Name               | Presses | SP (Maxed)\* | Dmg% (Maxed)\* | Acquisition                          |
| ------------------ | ------- | ------------ | -------------- | ------------------------------------ |
| \*Harpoon          | 1       | 150%         | 50             | Initial                              |
| \*Spinning Cane    | 2       | 200%         | 35             | Level 5                              |
| \*Rod Typhoon      | 4       | 202%         | 100            | Level 7                              |
| Gust of Wind Dance | 6       | 350%         | 35             | Level 11                             |
| Flower Storm       | 7       | 405%         | 202            | Perform all prior additions 80 times |

\* _Note : wiki columns Dmg/SP semblent inversées dans la table Albert — préservé verbatim. Vraisemblablement Dmg = 150/200/202/350/405 et SP = 50/35/100/35/202 (cohérent Lavitz)._

### Rose

| Name          | Presses | Dmg% (Maxed) | SP (Maxed) | Acquisition                          |
| ------------- | ------- | ------------ | ---------- | ------------------------------------ |
| \*Whip Smack  | 1       | 200%         | 35         | Initial                              |
| \*More & More | 2       | 150%         | 102        | Level 14                             |
| Hard Blade    | 5       | 300%         | 35         | Level 19                             |
| Demon's Dance | 7       | 500%         | 100        | Perform all prior additions 80 times |

### Haschel

| Name                | Presses | Dmg% (Maxed) | SP (Maxed) | Acquisition                          |
| ------------------- | ------- | ------------ | ---------- | ------------------------------------ |
| \*Double Punch      | 1       | 150%         | 50         | Initial                              |
| \*Flurry of Styx    | 2       | 202%         | 20         | Level 14                             |
| Summon 4 Gods       | 3       | 100%         | 100        | Level 18                             |
| \*5 Ring Shattering | 4       | 300%         | 50         | Level 22                             |
| Hex Hammer          | 6       | 400%         | 15         | Level 27                             |
| Omni-Sweep          | 7       | 501%         | 150        | Perform all prior additions 80 times |

### Meru

| Name           | Presses | Dmg% (Maxed) | SP (Maxed) | Acquisition                          |
| -------------- | ------- | ------------ | ---------- | ------------------------------------ |
| \*Double Smack | 1       | 150%         | 34         | Initial                              |
| \*Hammer Spin  | 3       | 202%         | 70         | Level 21                             |
| Cool Boogie    | 4       | 100%         | 200        | Level 26                             |
| Cat's Cradle   | 6       | 351%         | 20         | Level 30                             |
| Perky Step     | 7       | 600%         | 100        | Perform all prior additions 80 times |

### Kongol

| Name         | Presses | Dmg% (Maxed) | SP (Maxed) | Acquisition                          |
| ------------ | ------- | ------------ | ---------- | ------------------------------------ |
| \*Pursuit    | 1       | 150%         | 50         | Initial                              |
| \*Inferno    | 3       | 200%         | 20         | Level 23                             |
| \*Bone Crush | 5       | 300%         | 100        | Perform all prior additions 80 times |

## Attack Command Damage Formulas

Variable multipliers applying to Additions damage formula and Archer attack damage formula :

- **Target Fear** — Target has Fear → `(2)` else `(1)`
- **Attacker Fear** — Attacker has Fear → `(1 / 2)` else `(1)`
- **Power** — no Power items → `(1)` else `[(1) + (Attacker Power + Target Power)]`
- **Attacker Power** — power up → `(1 / 2)`, power down → `-(1 / 2)`
- **Target Power** — power up → `-(1 / 2)`, power down → `(1 / 2)`
- **Field** — attack element matches/opposite special field
- **Attack Element** — match → `(1 / 2)`, opposite → `-(1 / 2)`
- **Element** — target element matches/opposite attack
- **Target Element** — match → `-(1 / 2)`, opposite → `(1 / 2)`
- **Destroyer Mace** — Haschel HP : Blue → `(1)`, Yellow → `(3 / 2)`, Red → `(2)`

### Formulas

| Type      | Damage Formula                                                                                                                                                                                                   |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Additions | `floor[floor{floor[floor{floor[round{floor[floor{[hit 1 + hit 2 + ... hit n] * Multiplier / 100} * AT / 100] * (LV + 5) * 5 / DF} * Target Fear * Attacker Fear] * Power} * Field] * Element} * Destroyer Mace]` |
| \*Archers | `floor{floor[floor{floor[round{AT * (LV + 5) * 5 / DF} * Target Fear * Attacker Fear] * Power} * Field] * Element}`                                                                                              |

> _While Shana and Miranda do not have Additions, an important distinction for enemies who have abilities triggered when hit by Additions — this is often unclear at a casual glance since both Additions and their attacks are performed using the "Attack" command._

## Addition Hit Data

> Hidden values for each hit's damage. Assuming the addition does not "miss" entirely, the **first hit is guaranteed even with no input**. Each successful input adds one more hit and adds to the running total. Example : with two successful inputs, Crush Dance = `30 + 30 + 30 = 90`. The "Perfect" column shows the combined value if all inputs succeed.

### Dart Additions

| Addition       | Hit 1 | Hit 2 | Hit 3 | Hit 4 | Hit 5 | Hit 6 | Hit 7 | Hit 8 | Perfect |
| -------------- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ------- |
| Double Slash   | 100   | +50   |       |       |       |       |       |       | 150     |
| Volcano        | 50    | +50   | +50   | +50   |       |       |       |       | 200     |
| Burning Rush   | 50    | +50   | +50   |       |       |       |       |       | 150     |
| Crush Dance    | 30    | +30   | +30   | +30   | +30   |       |       |       | 150     |
| Madness Hero   | 20    | +20   | +20   | +20   | +10   | +10   |       |       | 100     |
| Moon Strike    | 30    | +30   | +30   | +30   | +30   | +30   | +20   |       | 200     |
| Blazing Dynamo | 40    | +30   | +30   | +30   | +30   | +30   | +30   | +30   | 250     |

### Lavitz / Albert Additions

| Addition           | Hit 1 | Hit 2 | Hit 3 | Hit 4 | Hit 5 | Hit 6 | Hit 7 | Hit 8 | Perfect |
| ------------------ | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ------- |
| Harpoon            | 75    | +25   |       |       |       |       |       |       | 100     |
| Spinning Cane      | 50    | +25   | +25   |       |       |       |       |       | 100     |
| Rod Typhoon        | 30    | +30   | +30   | +30   | +30   |       |       |       | 150     |
| Gust of Wind Dance | 30    | +30   | +30   | +30   | +30   | +30   | +20   |       | 200     |
| Flower Storm       | 30    | +30   | +30   | +40   | +40   | +40   | +40   | +50   | 300     |

### Rose Additions

| Addition      | Hit 1 | Hit 2 | Hit 3 | Hit 4 | Hit 5 | Hit 6 | Hit 7 | Hit 8 | Perfect |
| ------------- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ------- |
| Whip Smack    | 75    | +25   |       |       |       |       |       |       | 100     |
| More & More   | 50    | +50   | +50   |       |       |       |       |       | 150     |
| Hard Blade    | 20    | +20   | +20   | +20   | +10   | +10   |       |       | 100     |
| Demon's Dance | 30    | +30   | +30   | +30   | +20   | +20   | +20   | +20   | 200     |

### Haschel Additions

| Addition          | Hit 1 | Hit 2 | Hit 3 | Hit 4 | Hit 5 | Hit 6 | Hit 7 | Hit 8 | Perfect |
| ----------------- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ------- |
| Double Punch      | 75    | +25   |       |       |       |       |       |       | 100     |
| Flurry of Styx    | 100   | +25   | +25   |       |       |       |       |       | 150     |
| Summon 4 Gods     | 25    | +25   | +25   | +25   |       |       |       |       | 100     |
| 5 Ring Shattering | 30    | +30   | +30   | +30   | +30   |       |       |       | 150     |
| Hex Hammer        | 30    | +30   | +30   | +30   | +30   | +30   | +20   |       | 200     |
| Omni-Sweep        | 30    | +30   | +30   | +40   | +40   | +40   | +40   | +50   | 300     |

### Meru Additions

| Addition     | Hit 1 | Hit 2 | Hit 3 | Hit 4 | Hit 5 | Hit 6 | Hit 7 | Hit 8 | Perfect |
| ------------ | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ------- |
| Double Smack | 75    | +25   |       |       |       |       |       |       | 100     |
| Hammer Spin  | 50    | +50   | +25   | +25   |       |       |       |       | 150     |
| Cool Boogie  | 20    | +20   | +20   | +20   | +20   |       |       |       | 100     |
| Cat's Cradle | 30    | +20   | +20   | +20   | +20   | +20   | +20   |       | 150     |
| Perky Step   | 30    | +30   | +30   | +30   | +20   | +20   | +20   | +20   | 200     |

### Kongol Additions

| Addition   | Hit 1 | Hit 2 | Hit 3 | Hit 4 | Hit 5 | Hit 6 | Hit 7 | Hit 8 | Perfect |
| ---------- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ------- |
| Pursuit    | 75    | +25   |       |       |       |       |       |       | 100     |
| Inferno    | 40    | +20   | +20   | +20   |       |       |       |       | 100     |
| Bone Crush | 50    | +30   | +30   | +30   | +30   | +30   |       |       | 200     |

## Addition Multipliers (per level)

### Dart Additions

| Addition       | Lv 1 | Lv 2 | Lv 3 | Lv 4 | Lv 5 |
| -------------- | ---- | ---- | ---- | ---- | ---- |
| Double Slash   | 100  | 105  | 110  | 120  | 135  |
| Volcano        | 100  | 105  | 110  | 115  | 125  |
| Burning Rush   | 100  | 100  | 100  | 100  | 100  |
| Crush Dance    | 100  | 115  | 130  | 145  | 167  |
| Madness Hero   | 100  | 100  | 100  | 100  | 100  |
| Moon Strike    | 100  | 120  | 140  | 160  | 175  |
| Blazing Dynamo | 100  | 120  | 140  | 160  | 180  |

### Lavitz / Albert Additions

| Addition           | Lv 1 | Lv 2 | Lv 3 | Lv 4 | Lv 5 |
| ------------------ | ---- | ---- | ---- | ---- | ---- |
| Harpoon            | 100  | 110  | 120  | 130  | 150  |
| Spinning Cane      | 100  | 125  | 150  | 175  | 200  |
| Rod Typhoon        | 100  | 108  | 116  | 124  | 135  |
| Gust of Wind Dance | 100  | 120  | 140  | 160  | 175  |
| Flower Storm       | 100  | 108  | 116  | 124  | 135  |

### Rose Additions

| Addition      | Lv 1 | Lv 2 | Lv 3 | Lv 4 | Lv 5 |
| ------------- | ---- | ---- | ---- | ---- | ---- |
| Whip Smack    | 100  | 125  | 150  | 175  | 200  |
| More & More   | 100  | 100  | 100  | 100  | 100  |
| Hard Blade    | 100  | 150  | 200  | 250  | 300  |
| Demon's Dance | 100  | 140  | 180  | 220  | 250  |

### Haschel Additions

| Addition          | Lv 1 | Lv 2 | Lv 3 | Lv 4 | Lv 5 |
| ----------------- | ---- | ---- | ---- | ---- | ---- |
| Double Punch      | 100  | 110  | 120  | 130  | 150  |
| Flurry of Styx    | 100  | 108  | 116  | 124  | 135  |
| Summon 4 Gods     | 100  | 100  | 100  | 100  | 100  |
| 5 Ring Shattering | 100  | 125  | 150  | 175  | 200  |
| Hex Hammer        | 100  | 125  | 150  | 175  | 200  |
| Omni Sweep        | 100  | 115  | 130  | 145  | 167  |

### Meru Additions

| Addition     | Lv 1 | Lv 2 | Lv 3 | Lv 4 | Lv 5 |
| ------------ | ---- | ---- | ---- | ---- | ---- |
| Double Smack | 100  | 110  | 120  | 130  | 150  |
| Hammer Spin  | 100  | 108  | 116  | 124  | 135  |
| Cool Boogie  | 100  | 100  | 100  | 100  | 100  |
| Cat's Cradle | 100  | 130  | 160  | 190  | 234  |
| Perky Step   | 100  | 150  | 200  | 250  | 300  |

### Kongol Additions

| Addition   | Lv 1 | Lv 2 | Lv 3 | Lv 4 | Lv 5 |
| ---------- | ---- | ---- | ---- | ---- | ---- |
| Pursuit    | 100  | 110  | 120  | 130  | 150  |
| Inferno    | 100  | 125  | 150  | 175  | 200  |
| Bone Crush | 100  | 110  | 120  | 130  | 150  |
