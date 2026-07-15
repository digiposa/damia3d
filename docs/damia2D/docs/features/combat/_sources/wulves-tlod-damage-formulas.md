# Necessary Terms — TLoD Damage Formulas (Wulves)

> **Source** : Wulves et al. (Drew, tfz, Zychronix, Monoxide, Dedspawn), serveur Discord LoD — doc de référence "Necessary Terms".
> **Fiabilité** : 🥇 **tier 1** (cf. [hiérarchie sources](../../README.md#hiérarchie-de-fiabilité-des-sources-canon-tlod)) — testing formel par cadors / modders communauté. **Source de vérité pour formules et nombres exacts**.
> **Origine** : <https://pastebin.com/v1RGE5KD> (volatile, sauvegardé localement).
> **Sauvegardé le** : 2026-05-18.
> **Usage** : référence canonique pour [`damage-formula.md`](../damage-formula.md), [`damage-modifiers.md`](../damage-modifiers.md), [`status-effects.md`](../status-effects.md), [`additions.md`](../additions.md), et `dragoons/magic.md`.
>
> Light formatting markdown appliqué (tableaux, headings). Toutes formules / exemples / notations préservés verbatim.

> _If anything is missing or incorrect, please tag Wulves in the LoD Discord server._

---

## Necessary Terms

- **Floor** — Round a number down to remove decimals.

- **Round** — When the game wants to round, before it divides it applies the formula :
  - `(x + y/2) / y`
  - `y` = divisor
  - `x` = number to be divided
  - Example : `(28050 + 100/2) / 100` → `(28050 + 50) / 100` → `28100 / 100` → `281`

- **Modifiers** — Defined as occurring after all other calculations, Modifiers are the last step before Observed Damage appears on screen. All Modifiers are simply multiplied with the calculated damage, so it does not matter the order in which they occur. The only exception : for **Multi Items**, the Multiplier% obtained through mashing acts like a modifier but its **order matters** (see Player Formulas > Item Magic > Multi Items).

### Modifier definitions

- **Target Fear** — if the Target has the Fear Status then `(2)` otherwise `(1)`
- **Attacker Fear** — if the Attacker has the Fear Status then `(1/2)` otherwise `(1)`
- **Power** — if no Power items used `(1)`, otherwise `[(1) + (Attacker Power + Target Power)]`
- **Field** — if the attack element neither matches nor is the opposite of special field `(1)`, otherwise `[(1) + (Attack Element)]`
- **Element** — if the Target Element neither matches nor is the opposite of attack element `(1)`, otherwise `[(1) + (Target Element)]`
- **Guard** — if the Target's last action was Guard `(1/2)` otherwise `(1)`
- **Destroyer Mace** — if Haschel has Destroyer Mace equipped and HP in the Blue range `(1)`, if in Yellow range `(3/2)`, if in Red range `(2)`

### Modifier Reference Chart

| Modifier Name  | Condition                      | True                                  | False |
| -------------- | ------------------------------ | ------------------------------------- | ----- |
| Target Fear    | Target has Fear                | 2                                     | 1     |
| Attacker Fear  | Attacker has Fear              | 1/2                                   | 1     |
| \*Power        |                                | `1 + (Attacker Power + Target Power)` | N/A   |
| \*Field        |                                | `1 + (Attack Element)`                | N/A   |
| \*Element      |                                | `1 + (Target Element)`                | N/A   |
| Guard          | Target's last action was Guard | 1/2                                   | 1     |
| Destroyer Mace | HPY, HPR                       | 3/2, 2                                | 1     |

\* These modifiers are calculated using the variables in the tables below.

### Power Modifier Variables Chart

| Variable       | \*Condition | Up   | Down |
| -------------- | ----------- | ---- | ---- |
| Attacker Power | set to      | +1/2 | -1/2 |
| Target Power   | set to      | -1/2 | +1/2 |

\* Power Up and Power Down are exclusive, so a target is only affected by the most recently applied.

### Field Modifier Variable Chart

| Variable       | Condition                         | Matches | Opposite |
| -------------- | --------------------------------- | ------- | -------- |
| Attack Element | compared to Special Field Element | +1/2    | -1/2     |

### Element Modifier Variable Chart

| Variable       | Condition                  | Matches | Opposite |
| -------------- | -------------------------- | ------- | -------- |
| Target Element | compared to Attack Element | -1/2    | +1/2     |

---

## Player Formulas

### Archer Attack

- **Wrapperless Formula** : `round{AT * (LV + 5) * 5 / DF}`
- **Formula with Modifier Wrapper** : `floor{floor[floor{floor[round{AT * (LV + 5) * 5 / DF} * Target Fear * Attacker Fear] * Power} * Field] * Element}`

**Known Limited Applicable Modifiers** _(only apply with an elemental weapon)_ :

- Field
- Element

**Known Unapplicable Modifiers** :

- Guard
- Destroyer Mace

### Additions

> _Note : `Multiplier` in the following formula does not refer to addition multi%, and instead each addition has a hidden value as seen in the Addition Multiplier & Hit Data charts below._

- **Wrapperless Formula** : `round{floor[floor{[hit 1 + hit 2 + ... hit n] * Multiplier / 100} * AT / 100] * (LV + 5) * 5 / DF}`
- **Formula with Modifier Wrapper** : `floor[floor{floor[floor{floor[round{floor[floor{[hit 1 + hit 2 + ... hit n] * Multiplier / 100} * AT / 100] * (LV + 5) * 5 / DF} * Target Fear * Attacker Fear] * Power} * Field] * Element} * Destroyer Mace]`

#### Addition Hit Data

**Red-Eye Dragoon (Dart)**

| Addition Name  | Hit 1 | Hit 2 | Hit 3 | Hit 4 | Hit 5 | Hit 6 | Hit 7 | Hit 8 | Perfect |
| -------------- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ------- |
| Double Slash   | 100   | +50   |       |       |       |       |       |       | 150     |
| Volcano        | 50    | +50   | +50   | +50   |       |       |       |       | 200     |
| Burning Rush   | 50    | +50   | +50   |       |       |       |       |       | 150     |
| Crush Dance    | 30    | +30   | +30   | +30   | +30   |       |       |       | 150     |
| Madness Hero   | 20    | +20   | +20   | +20   | +10   | +10   |       |       | 100     |
| Moon Strike    | 30    | +30   | +30   | +30   | +30   | +30   | +20   |       | 200     |
| Blazing Dynamo | 40    | +30   | +30   | +30   | +30   | +30   | +30   | +30   | 250     |

**Jade Dragoon (Lavitz / Albert)**

| Addition Name      | Hit 1 | Hit 2 | Hit 3 | Hit 4 | Hit 5 | Hit 6 | Hit 7 | Hit 8 | Perfect |
| ------------------ | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ------- |
| Harpoon            | 75    | +25   |       |       |       |       |       |       | 100     |
| Spinning Cane      | 50    | +25   | +25   |       |       |       |       |       | 100     |
| Rod Typhoon        | 30    | +30   | +30   | +30   | +30   |       |       |       | 150     |
| Gust of Wind Dance | 30    | +30   | +30   | +30   | +30   | +30   | +20   |       | 200     |
| Flower Storm       | 30    | +30   | +30   | +40   | +40   | +40   | +40   | +50   | 300     |

**Dark Burst Dragoon (Rose)**

| Addition Name | Hit 1 | Hit 2 | Hit 3 | Hit 4 | Hit 5 | Hit 6 | Hit 7 | Hit 8 | Perfect |
| ------------- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ------- |
| Whip Smack    | 75    | +25   |       |       |       |       |       |       | 100     |
| More & More   | 50    | +50   | +50   |       |       |       |       |       | 150     |
| Hard Blade    | 20    | +20   | +20   | +20   | +10   | +10   |       |       | 100     |
| Demon's Dance | 30    | +30   | +30   | +30   | +20   | +20   | +20   | +20   | 200     |

**Violet Dragoon (Haschel)**

| Addition Name     | Hit 1 | Hit 2 | Hit 3 | Hit 4 | Hit 5 | Hit 6 | Hit 7 | Hit 8 | Perfect |
| ----------------- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ------- |
| Double Punch      | 75    | +25   |       |       |       |       |       |       | 100     |
| Flurry of Styx    | 100   | +25   | +25   |       |       |       |       |       | 150     |
| Summon 4 Gods     | 25    | +25   | +25   | +25   |       |       |       |       | 100     |
| 5 Ring Shattering | 30    | +30   | +30   | +30   | +30   |       |       |       | 150     |
| Hex Hammer        | 30    | +30   | +30   | +30   | +30   | +30   | +20   |       | 200     |
| Omni Sweep        | 30    | +30   | +30   | +40   | +40   | +40   | +40   | +50   | 300     |

**Blue-Sea Dragoon (Meru)**

| Addition Name | Hit 1 | Hit 2 | Hit 3 | Hit 4 | Hit 5 | Hit 6 | Hit 7 | Hit 8 | Perfect |
| ------------- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ------- |
| Double Smack  | 75    | +25   |       |       |       |       |       |       | 100     |
| Hammer Spin   | 50    | +50   | +25   | +25   |       |       |       |       | 150     |
| Cool Boogie   | 20    | +20   | +20   | +20   | +20   |       |       |       | 100     |
| Cat's Cradle  | 30    | +20   | +20   | +20   | +20   | +20   | +20   |       | 150     |
| Perky Step    | 30    | +30   | +30   | +30   | +20   | +20   | +20   | +20   | 200     |

**Golden Dragoon (Kongol)**

| Addition Name | Hit 1 | Hit 2 | Hit 3 | Hit 4 | Hit 5 | Hit 6 | Hit 7 | Hit 8 | Perfect |
| ------------- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ------- |
| Pursuit       | 75    | +25   |       |       |       |       |       |       | 100     |
| Inferno       | 40    | +20   | +20   | +20   |       |       |       |       | 100     |
| Bone Crush    | 50    | +30   | +30   | +30   | +30   | +30   |       |       | 200     |

#### Addition Multiplier Data

**Red-Eye (Dart)**

| Addition Name  | Lv 1 | Lv 2 | Lv 3 | Lv 4 | Lv 5 |
| -------------- | ---- | ---- | ---- | ---- | ---- |
| Double Slash   | 100  | 105  | 110  | 120  | 135  |
| Volcano        | 100  | 105  | 110  | 115  | 125  |
| Burning Rush   | 100  | 100  | 100  | 100  | 100  |
| Crush Dance    | 100  | 115  | 130  | 145  | 167  |
| Madness Hero   | 100  | 100  | 100  | 100  | 100  |
| Moon Strike    | 100  | 120  | 140  | 160  | 175  |
| Blazing Dynamo | 100  | 120  | 140  | 160  | 180  |

**Jade (Lavitz / Albert)**

| Addition Name      | Lv 1 | Lv 2 | Lv 3 | Lv 4 | Lv 5 |
| ------------------ | ---- | ---- | ---- | ---- | ---- |
| Harpoon            | 100  | 110  | 120  | 130  | 150  |
| Spinning Cane      | 100  | 125  | 150  | 175  | 200  |
| Rod Typhoon        | 100  | 108  | 116  | 124  | 135  |
| Gust of Wind Dance | 100  | 120  | 140  | 160  | 175  |
| Flower Storm       | 100  | 108  | 116  | 124  | 135  |

**Dark Burst (Rose)**

| Addition Name | Lv 1 | Lv 2 | Lv 3 | Lv 4 | Lv 5 |
| ------------- | ---- | ---- | ---- | ---- | ---- |
| Whip Smack    | 100  | 125  | 150  | 175  | 200  |
| More & More   | 100  | 100  | 100  | 100  | 100  |
| Hard Blade    | 100  | 150  | 200  | 250  | 300  |
| Demon's Dance | 100  | 140  | 180  | 220  | 250  |

**Violet (Haschel)**

| Addition Name     | Lv 1 | Lv 2 | Lv 3 | Lv 4 | Lv 5 |
| ----------------- | ---- | ---- | ---- | ---- | ---- |
| Double Punch      | 100  | 110  | 120  | 130  | 150  |
| Flurry of Styx    | 100  | 108  | 116  | 124  | 135  |
| Summon 4 Gods     | 100  | 100  | 100  | 100  | 100  |
| 5 Ring Shattering | 100  | 125  | 150  | 175  | 200  |
| Hex Hammer        | 100  | 125  | 150  | 175  | 200  |
| Omni Sweep        | 100  | 115  | 130  | 145  | 167  |

**Blue-Sea (Meru)**

| Addition Name | Lv 1 | Lv 2 | Lv 3 | Lv 4 | Lv 5 |
| ------------- | ---- | ---- | ---- | ---- | ---- |
| Double Smack  | 100  | 110  | 120  | 130  | 150  |
| Hammer Spin   | 100  | 108  | 116  | 124  | 135  |
| Cool Boogie   | 100  | 100  | 100  | 100  | 100  |
| Cat's Cradle  | 100  | 130  | 160  | 190  | 234  |
| Perky Step    | 100  | 150  | 200  | 250  | 300  |

**Golden (Kongol)**

| Addition Name | Lv 1 | Lv 2 | Lv 3 | Lv 4 | Lv 5 |
| ------------- | ---- | ---- | ---- | ---- | ---- |
| Pursuit       | 100  | 110  | 120  | 130  | 150  |
| Inferno       | 100  | 125  | 150  | 175  | 200  |
| Bone Crush    | 100  | 110  | 120  | 130  | 150  |

#### Additions — Modifiers

**Known Limited Applicable Modifiers** _(only apply with an elemental weapon)_ :

- Field
- Element

**Known Unapplicable Modifiers** :

- Guard

> _Fun Fact : If hitting a perfect addition that is max level, you can replace `{[hit 1 + hit 2 + ... hit n] * Multiplier / 100}` in the formula with the percent shown in the Additions menu under the DAM% column._

### Item Magic

> _Note : `Multiplier%` in the following formula refers to the % you achieve through mashing, while `BID` refers to the BID Data chart below. Additionally, the Wrapperless Formula cannot work without adding ` * Multiplier% / 100]` to the end of it, but since the Multiplier% acts like a modifier — except that its order in relation to other modifiers matters — it has been excluded to avoid confusion._

#### Multi Items

- **Wrapperless Formula** : `floor[floor{floor[(LV + 5) * MAT * 5 / MDF] * BID / 100}`
- **Formula with Modifier Wrapper** : `floor[floor{floor[floor{floor[floor{floor[(LV + 5) * MAT * 5 / MDF] * BID / 100} * Attacker Fear} * Power] * Field} * Element] * Multiplier% / 100] * Target Fear`

#### Powerful Items and Detonate Rock

- **Wrapperless Formula** : `floor{floor[(LV + 5) * MAT * 5 / MDF] * BID / 100}`
- **Formula with Modifier Wrapper** : `floor{floor[floor{floor[floor{floor[(LV + 5) * MAT * 5 / MDF] * BID / 100} * Target Fear * Attacker Fear] * Power} * Field] * Element}`

#### BID Data

| Item Type           | BID |
| ------------------- | --- |
| Detonate Rock       | 100 |
| All Target Multi    | 100 |
| Single Target Multi | 150 |
| All Target Powerful | 300 |
| Psyche Bomb X       | 400 |

**Known Unapplicable Modifiers** (Item Magic) :

- Guard
- Destroyer Mace

### Dragoon Archer Attack

- **Wrapperless Formula** : `round{floor[(AT * DRGNAT% / 100)] * (LV + 5) * 5 / DF}`
- **Formula with Modifier Wrapper** : `floor[floor{floor[round{floor[(AT * DRGNAT% / 100)] * (LV + 5) * 5 / DF} * Target Fear * Power] * Field} * Element]`

**Known Limited Applicable Modifiers** _(only apply with an elemental weapon)_ :

- Field
- Element

**Known Unapplicable Modifiers** :

- Attacker Fear
- Guard
- Destroyer Mace

### Dragoon Additions

- **Wrapperless Formula** : `round{floor[floor{[0.05(Successful Inputs^2) - 0.05 * Successful Inputs + 1] * 100 * DRGNAT% / 100} * AT / 100] * (LV + 5) * 5 / DF}`
- **Formula with Modifier Wrapper** : `floor[floor{floor[round{floor[floor{[0.05(Successful Inputs^2) - 0.05 * Successful Inputs + 1] * 100 * DRGNAT% / 100} * AT / 100] * (LV + 5) * 5 / DF} * Target Fear * Power] * Field} * Element]`

**Known Limited Applicable Modifiers** _(only apply with an elemental weapon)_ :

- Field
- Element

**Known Unapplicable Modifiers** :

- Attacker Fear
- Guard
- Destroyer Mace

> _Note : While most can achieve a maximum of 5 Successful Inputs, **Kongol is limited as he can only achieve up to 4**._

### Dragoon Magic

> _Note : `DRGNMAT%` refers to the number seen on the status menu under the Dragoon column and on the MAT row. For Multipliers, please use the Dragoon Spell Multipliers chart below._

- **Wrapperless Formula** : `floor[floor{floor[(MAT * DRGNMAT% / 100)] * (LV + 5) * 5 / MDF} * Multiplier / 100]`
- **Formula with Modifier Wrapper** : `floor{floor[floor{floor[floor{floor[(MAT * DRGNMAT% / 100)] * (LV + 5) * 5 / MDF} * Multiplier / 100] * Target Fear * Power} * Field] * Element}`

#### Dragoon Spell Multipliers

**Dart (Red-Eye)**

| Spell            | Multiplier |
| ---------------- | ---------- |
| Flame Shot       | 200        |
| Explosion        | 100        |
| Final Burst      | 300        |
| Red-Eye Dragon   | 300        |
| Divine DG Ball   | 400        |
| Divine DG Cannon | 600        |

**Lavitz / Albert (Jade)**

| Spell        | Multiplier |
| ------------ | ---------- |
| Wing Blaster | 100        |
| Gaspless     | 300        |
| Jade Dragon  | 300        |

**Rose (Dark Burst)**

| Spell           | Multiplier |
| --------------- | ---------- |
| Astral Drain    | 200        |
| Death Dimension | 100        |
| Dark Dragon     | 400        |

**Shana / Miranda (White-Silver)**

| Spell           | Multiplier |
| --------------- | ---------- |
| Star Children   | 100        |
| W Silver Dragon | 300        |

**Haschel (Violet)**

| Spell         | Multiplier |
| ------------- | ---------- |
| Atomic Mind   | 100        |
| Thunder Kid   | 200        |
| Thunder God   | 300        |
| Violet Dragon | 400        |

**Meru (Blue-Sea)**

| Spell           | Multiplier |
| --------------- | ---------- |
| Freezing Ring   | 200        |
| Diamond Dust    | 200        |
| Blue Sea Dragon | 400        |

**Kongol (Golden)**

| Spell         | Multiplier |
| ------------- | ---------- |
| Grand Stream  | 150        |
| Meteor Strike | 200        |
| Golden Dragon | 300        |

**Known Unapplicable Modifiers** (Dragoon Magic) :

- Attacker Fear
- Guard
- Destroyer Mace

---

## Enemy Formulas

### Enemy Physical Attack

> _Note : `Attack Multiplier` refers to a hidden value that cannot be seen in game, but are available here : LoD Combat - Enemy Abilities & Behavior. For example, Knight of Sandora's Sword Slash deals 1x Phys, which means the Attack Multiplier is 1._

- **Wrapperless Formula** : `floor[(AT^2 * 5 / DF)] * Attack Multiplier`
- **Formula with Modifier Wrapper** : `floor{floor[floor{floor[(AT^2 * 5 / DF)] * Attack Multiplier * Target Fear * Attacker Fear} * Power] * Guard}`

**Known Unapplicable Modifiers** :

- Field
- Element
- Destroyer Mace

> _Note : Rose Storm is treated as "Target Power Up," which is why the spell and item do not actually stack for defensive purposes._

### Enemy Magical Attack

> _Note : `Attack Multiplier` refers to a hidden value that cannot be seen in game, but are available here : LoD Combat - Enemy Abilities & Behavior. For example, Commander's Burn Out deals 1.5x Fire, which means the Attack Multiplier is 1.5._

- **Wrapperless Formula** : `floor[(MAT^2 * 5 / MDF)] * Attack Multiplier`
- **Formula with Modifier Wrapper** : `floor{floor[floor{floor[floor{floor[(MAT^2 * 5 / MDF)] * Attack Multiplier * Target Fear * Attacker Fear} * Power] * Field} * Element] * Guard}`

**Known Unapplicable Modifiers** :

- Destroyer Mace

### Enemy Percentage Attacks

#### Ghost Commander's Haunting Bolt

- **Wrapperless Formula** : `floor[(Target's Current HP / 2)]`
- **Formula with Modifier Wrapper** : `floor[floor{floor[(Target's Current HP / 2)] * Target Fear} * Guard]`

**Known Unapplicable Modifiers** :

- Attacker Fear
- Power
- Field
- Element

#### Rare Monster Basic Attack

- **Wrapperless Formula** : `floor[(Target's Max HP / 10)]`
- **Formula with Modifier Wrapper** : `floor[floor{floor[(Target's Max HP / 10)] * Target Fear} * Guard]`

**Known Unapplicable Modifiers** :

- Attacker Fear
- Power
- Field
- Element

---

## Unique Formulas & Modifiers

### Drake's Wire Damage

> _Note : While Drake's Wire deals damage when the player is attacking, to keep from being inconsistent, "Attacker" in this document refers to the one dealing damage. Please keep this in mind : Attacker is Wire and Target is the player character._

- **Wrapperless Formula** : `floor(1000 / DF)`
- **Formula with Modifier Wrapper** : `floor[floor{floor(1000 / DF) * Target Fear} * Power]`

**Known Unapplicable Modifiers** :

- Attacker Fear
- Field
- Element
- Guard

### Addition Counter Damage

> _Note : While Addition Counter deals damage when the player is attacking, to keep from being inconsistent, "Attacker" in this document refers to the one dealing damage. Please keep this in mind : Attacker is the enemy countering and Target is the player character._

- **Wrapperless Formula** : `floor{floor[(AT^2 * 250 / DF)] / 100}`
- **Formula with Modifier Wrapper** : `floor{floor[floor{floor[(AT^2 * 250 / DF)] / 100} * Target Fear * Attacker Fear] * Power}`

**Known Unapplicable Modifiers** :

- Field
- Element
- Guard
- Destroyer Mace

### Feyrbrand's Attacking Power Up Modifier

> _Note : Feyrbrand's moves also have this modifier applied._

- **Formula** : `floor{[formula] * [(10 + Number of Times Attacking Power Up has been used) / 10]}`

### Rare Monster's Damage Mitigation

> _Note : When attacking a Rare Monster, Damage is set to 1 and ignores normal stats and formulas._

- **Wrapperless Formula** : `[1]`
- **Formula with Modifier Wrapper** : `floor{floor[1 * Attacker Fear] * Destroyer Mace}`

**Known Unapplicable Modifiers** :

- Target Fear
- Power
- Field
- Element
- Guard

---

## Status Damage

### Confusion

- **Wrapperless Formula** : `floor(Attacker's Max HP / 5)`
- **Formula with Modifier Wrapper** : `floor[floor{floor(Attacker's Max HP / 5) * Target Fear} * Guard]`

**Known Unapplicable Modifiers** :

- Attacker Fear
- Power
- Field
- Element
- Destroyer Mace

### Bewitchment

- **Wrapperless Formula** : `floor(Attacker's Max HP / 5)`
- **Formula with Modifier Wrapper** : `floor[floor{floor(Attacker's Max HP / 5) * Target Fear} * Guard]`

**Known Unapplicable Modifiers** :

- Attacker Fear
- Power
- Field
- Element
- Destroyer Mace

### Poison

- **Formula** : `floor(Target's Max HP / 10)`

**Known Unapplicable Modifiers** :

- Target Fear
- Attacker Fear
- Power
- Field
- Element
- Guard
- Destroyer Mace

---

## Notes

### General Info — Wrapper for Modifiers

```
floor[floor{floor[floor{floor[floor{

  [Formula without Modifiers goes here]

 * Target Fear * Attacker Fear} * Power] * Field} * Element] * Guard} * Destroyer Mace]
```

### Avoiding Floating Point Errors

LoD's formulas truncate decimals from its math, i.e. instead of `(1.1 x 255 = 280)` LoD does :

```
(110 / 100 x 255)
(255 x 110 / 100)
(28050 / 100)  ← LoD cannot hold onto decimals, so this divides into (280) without rounding.
(When the game wants to round, it moves around decimals by using the round{} formula above.)
```

---

## Credits

Written by **Wulves**, with base formula info and insights provided by **Drew**, **tfz**, **Zychronix**, and **Monoxide**. Special shoutout to **Dedspawn** for extensive testing, uncovering and resolving an error in the Item Magic formula.
