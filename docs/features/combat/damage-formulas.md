# Damage Formulas — Legend of Dragoon (canon reference)

Faithful transcription of the LoD combat **damage formula** reference (Wiki Project; written by
Wulves, base info from Drew, tfz, Zychronix, Monoxide; testing by Dedspawn). Stored here as the
single source of truth so we don't re-fetch it. If anything is missing or incorrect, tag **Wulves**
in the LoD Discord.

**Implementation:** every formula below is implemented in [`src/combat/formula.ts`](../../../src/combat/formula.ts)
and verified 1:1 against this doc (see the [Implementation map](#implementation-map) at the end).
Modifiers live in `src/combat/modifiers.ts`; elemental multipliers in `src/combat/element.ts`.

---

## Conventions

- **Floor** — round a number down (drop decimals). LoD truncates after *every* operation (it cannot
  hold floats), so each documented step applies its own floor.
- **Round** — where the game explicitly rounds a division it uses `(x + y/2) / y` then truncates.
  `y` = divisor, `x` = numerator. Example: `(28050 + 100/2) / 100 = 28100 / 100 = 281`.
- **Avoiding floating-point** — instead of `1.1 × 255 = 280.5`, LoD does `255 × 110 / 100 = 28050 / 100
  = 280` (truncates, no rounding unless the Round formula above is used).
- **Modifiers** — applied **last**, after all other calculation, as the final step before the damage
  shown on screen. They are simply multiplied in, so their order does **not** matter — **except** the
  Multi-item `Multiplier%` (mashing QTE), whose order *does* matter (see [Item Magic](#item-magic)).

### The modifier wrapper

Every formula's "wrapper" nests floors around the wrapperless formula in this fixed order:

```
floor[floor{floor[floor{floor[floor{  <wrapperless formula>
  * Target Fear * Attacker Fear} * Power] * Field} * Element] * Guard} * Destroyer Mace]
```

A given formula only applies the modifiers noted as applicable to it; the rest are neutral (×1).

### Modifier reference

| Modifier | Condition | True | False |
|---|---|---|---|
| Target Fear | Target has Fear | 2 | 1 |
| Attacker Fear | Attacker has Fear | 1/2 | 1 |
| Power* | — | `1 + (Attacker Power + Target Power)` | — |
| Field* | — | `1 + (Attack Element)` | — |
| Element* | — | `1 + (Target Element)` | — |
| Guard | Target's last action was Guard | 1/2 | 1 |
| Destroyer Mace | Haschel w/ Destroyer Mace, HP Yellow / Red | 3/2 / 2 | 1 (Blue) |

\* Computed from these variables:

| Variable | Condition | Up / Matches | Down / Opposite |
|---|---|---|---|
| Attacker Power | Power Up / Down (most recent only) | +1/2 | −1/2 |
| Target Power | Power Up / Down | −1/2 | +1/2 |
| Attack Element | vs Special Field element | +1/2 (matches) | −1/2 (opposite) |
| Target Element | vs Attack element | −1/2 (matches) | +1/2 (opposite) |

So the **Element** modifier is **×1.5 vs the opposite element, ×0.5 vs the same, ×1 otherwise**
(Non-Elemental never scales). This is `elementMultiplier()` in `element.ts`.

---

## Player formulas

### Archer Attack (basic physical)

```
Wrapperless: round{ AT * (LV + 5) * 5 / DF }
Wrapper:     floor{floor[floor{floor[ round{AT*(LV+5)*5/DF} * Target Fear * Attacker Fear] * Power} * Field] * Element}
```
Applicable: Field, Element (only with an elemental weapon). Not applicable: Guard, Destroyer Mace.

### Additions

`Multiplier` below is the Addition's hidden **level multiplier** (not the on-screen combo %).

```
Wrapperless: round{ floor[ floor{ Σhits * Multiplier / 100 } * AT / 100 ] * (LV+5) * 5 / DF }
Wrapper:     floor[floor{floor[floor{floor[ round{...} * TF * AF] * Power} * Field] * Element} * Destroyer Mace]
```
Applicable: Field, Element (elemental weapon only), Destroyer Mace. Not applicable: Guard.

> **Shortcut:** for a *perfect, max-level* Addition, `{Σhits * Multiplier / 100}` equals the **DAM%**
> shown in the Additions menu.

#### Addition hit data (per-hit %, and Perfect total)

| Addition | H1 | H2 | H3 | H4 | H5 | H6 | H7 | H8 | Perfect |
|---|---|---|---|---|---|---|---|---|---|
| Double Slash | 100 | +50 | | | | | | | 150 |
| Volcano | 50 | +50 | +50 | +50 | | | | | 200 |
| Burning Rush | 50 | +50 | +50 | | | | | | 150 |
| Crush Dance | 30 | +30 | +30 | +30 | +30 | | | | 150 |
| Madness Hero | 20 | +20 | +20 | +20 | +10 | +10 | | | 100 |
| Moon Strike | 30 | +30 | +30 | +30 | +30 | +30 | +20 | | 200 |
| Blazing Dynamo | 40 | +30 | +30 | +30 | +30 | +30 | +30 | +30 | 250 |
| Harpoon | 75 | +25 | | | | | | | 100 |
| Spinning Cane | 50 | +25 | +25 | | | | | | 100 |
| Rod Typhoon | 30 | +30 | +30 | +30 | +30 | | | | 150 |
| Gust of Wind Dance | 30 | +30 | +30 | +30 | +30 | +30 | +20 | | 200 |
| Flower Storm | 30 | +30 | +30 | +40 | +40 | +40 | +40 | +50 | 300 |
| Whip Smack | 75 | +25 | | | | | | | 100 |
| More & More | 50 | +50 | +50 | | | | | | 150 |
| Hard Blade | 20 | +20 | +20 | +20 | +10 | +10 | | | 100 |
| Demon's Dance | 30 | +30 | +30 | +30 | +20 | +20 | +20 | +20 | 200 |
| Double Punch | 75 | +25 | | | | | | | 100 |
| Flurry of Styx | 100 | +25 | +25 | | | | | | 150 |
| Summon 4 Gods | 25 | +25 | +25 | +25 | | | | | 100 |
| 5 Ring Shattering | 30 | +30 | +30 | +30 | +30 | | | | 150 |
| Hex Hammer | 30 | +30 | +30 | +30 | +30 | +30 | +20 | | 200 |
| Omni Sweep | 30 | +30 | +30 | +40 | +40 | +40 | +40 | +50 | 300 |
| Double Smack | 75 | +25 | | | | | | | 100 |
| Hammer Spin | 50 | +50 | +25 | +25 | | | | | 150 |
| Cool Boogie | 20 | +20 | +20 | +20 | +20 | | | | 100 |
| Cat's Cradle | 30 | +20 | +20 | +20 | +20 | +20 | +20 | | 150 |
| Perky Step | 30 | +30 | +30 | +30 | +20 | +20 | +20 | +20 | 200 |
| Pursuit | 75 | +25 | | | | | | | 100 |
| Inferno | 40 | +20 | +20 | +20 | | | | | 100 |
| Bone Crush | 50 | +30 | +30 | +30 | +30 | +30 | | | 200 |

#### Addition multiplier by level (Lv 1–5)

| Addition | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Double Slash | 100 | 105 | 110 | 120 | 135 |
| Volcano | 100 | 105 | 110 | 115 | 125 |
| Burning Rush | 100 | 100 | 100 | 100 | 100 |
| Crush Dance | 100 | 115 | 130 | 145 | 167 |
| Madness Hero | 100 | 100 | 100 | 100 | 100 |
| Moon Strike | 100 | 120 | 140 | 160 | 175 |
| Blazing Dynamo | 100 | 120 | 140 | 160 | 180 |
| Harpoon | 100 | 110 | 120 | 130 | 150 |
| Spinning Cane | 100 | 125 | 150 | 175 | 200 |
| Rod Typhoon | 100 | 108 | 116 | 124 | 135 |
| Gust of Wind Dance | 100 | 120 | 140 | 160 | 175 |
| Flower Storm | 100 | 108 | 116 | 124 | 135 |
| Whip Smack | 100 | 125 | 150 | 175 | 200 |
| More & More | 100 | 100 | 100 | 100 | 100 |
| Hard Blade | 100 | 150 | 200 | 250 | 300 |
| Demon's Dance | 100 | 140 | 180 | 220 | 250 |
| Double Punch | 100 | 110 | 120 | 130 | 150 |
| Flurry of Styx | 100 | 108 | 116 | 124 | 135 |
| Summon 4 Gods | 100 | 100 | 100 | 100 | 100 |
| 5 Ring Shattering | 100 | 125 | 150 | 175 | 200 |
| Hex Hammer | 100 | 125 | 150 | 175 | 200 |
| Omni Sweep | 100 | 115 | 130 | 145 | 167 |
| Double Smack | 100 | 110 | 120 | 130 | 150 |
| Hammer Spin | 100 | 108 | 116 | 124 | 135 |
| Cool Boogie | 100 | 100 | 100 | 100 | 100 |
| Cat's Cradle | 100 | 130 | 160 | 190 | 234 |
| Perky Step | 100 | 150 | 200 | 250 | 300 |
| Pursuit | 100 | 110 | 120 | 130 | 150 |
| Inferno | 100 | 125 | 150 | 175 | 200 |
| Bone Crush | 100 | 110 | 120 | 130 | 150 |

### Item Magic

`BID` = Base Item Damage (chart below). `Multiplier%` = the value from **mashing X** during the
throw (the QTE). Item magic scales with the **user's MAT/LV** and the **target's MDF**.

**Multi Items** (Single-target Multi, All-target Multi — these have the mashing QTE):
```
Wrapperless: floor[ floor{ floor[(LV+5) * MAT * 5 / MDF] * BID / 100 } ]   (× Multiplier%/100)
Wrapper:     floor[floor{floor[floor{floor[floor{floor[(LV+5)*MAT*5/MDF] * BID/100} * AF} * Power] * Field} * Element] * Multiplier%/100] * Target Fear
```
`Multiplier%` is applied after Element and **before** the outermost Target Fear — its order matters.
No mash = **100%**; a full mash caps at **268%** (`ITEM_MULTIPLIER_MIN`/`MAX` in `items.ts`).

**Powerful Items and Detonate Rock** (no QTE, no `Multiplier%`):
```
Wrapperless: floor{ floor[(LV+5) * MAT * 5 / MDF] * BID / 100 }
Wrapper:     floor{floor[floor{floor[floor{floor[(LV+5)*MAT*5/MDF] * BID/100} * TF * AF] * Power} * Field] * Element}
```
Not applicable (either kind): Guard, Destroyer Mace.

#### BID chart

| Item type | BID | QTE? |
|---|---|---|
| Single Target Multi | 150 | yes |
| All Target Multi | 100 | yes |
| All Target Powerful | 300 | no |
| Detonate Rock | 100 | no |
| Psyche Bomb / Psyche Bomb X | 400 | yes |

> The 21 elemental attack items are 7 elements × 3 tiers (Single Multi / All Multi / All Powerful).
> Item list + gold/tiers: [`../items/items.md`](../items/items.md).

### Dragoon Archer Attack

```
Wrapperless: round{ floor[AT * DRGNAT% / 100] * (LV+5) * 5 / DF }
Wrapper:     floor[floor{floor[ round{...} * Target Fear * Power] * Field} * Element]
```
Applicable: Field, Element (elemental weapon only). Not applicable: Attacker Fear, Guard, Destroyer Mace.

### Dragoon Additions (D'Attack)

`Successful Inputs` = number of hits landed in the D'Attack (max 5; **Kongol max 4**). The Output
term `[0.05·n² − 0.05·n + 1] × 100` gives **100, 110, 130, 160, 200** for n = 1…5.

```
Wrapperless: round{ floor[ floor{Output * DRGNAT%/100} * AT/100 ] * (LV+5) * 5 / DF }
Wrapper:     floor[floor{floor[ round{...} * Target Fear * Power] * Field} * Element]
```
Applicable: Field, Element (elemental weapon only). Not applicable: Attacker Fear, Guard, Destroyer Mace.

### Dragoon Magic

`DRGNMAT%` = the status-screen MAT value in the Dragoon column. `Multiplier` from the spell chart.

```
Wrapperless: floor[ floor{ floor[MAT * DRGNMAT%/100] * (LV+5) * 5 / MDF } * Multiplier / 100 ]
Wrapper:     floor{floor[floor{floor[floor{floor[MAT*DRGNMAT%/100] * (LV+5)*5/MDF} * Multiplier/100] * TF * Power} * Field] * Element}
```
Not applicable: Attacker Fear, Guard, Destroyer Mace.

#### Dragoon spell multipliers

| Character | Spell | Mult | | Character | Spell | Mult |
|---|---|---|---|---|---|---|
| Dart | Flame Shot | 200 | | Haschel | Atomic Mind | 100 |
| Dart | Explosion | 100 | | Haschel | Thunder Kid | 200 |
| Dart | Final Burst | 300 | | Haschel | Thunder God | 300 |
| Dart | Red-Eye Dragon | 300 | | Haschel | Violet Dragon | 400 |
| Dart | Divine DG Ball | 400 | | Meru | Freezing Ring | 200 |
| Dart | Divine DG Cannon | 600 | | Meru | Diamond Dust | 200 |
| Lavitz/Albert | Wing Blaster | 100 | | Meru | Blue Sea Dragon | 400 |
| Lavitz/Albert | Gaspless | 300 | | Kongol | Grand Stream | 150 |
| Lavitz/Albert | Jade Dragon | 300 | | Kongol | Meteor Strike | 200 |
| Rose | Astral Drain | 200 | | Kongol | Golden Dragon | 300 |
| Rose | Death Dimension | 100 | | Shana/Miranda | Star Children | 100 |
| Rose | Dark Dragon | 400 | | Shana/Miranda | W Silver Dragon | 300 |

---

## Enemy formulas

`Attack Multiplier` = hidden per-ability value (e.g. Knight of Sandora Sword Slash = 1×, Throw
Dagger = 0.5×; Commander Burn Out = 1.5×). See *LoD Combat — Enemy Abilities & Behavior*.

### Enemy Physical Attack
```
Wrapperless: floor[AT² * 5 / DF] * Attack Multiplier
Wrapper:     floor{floor[floor{floor[(AT²*5/DF)] * Attack Multiplier * TF * AF} * Power] * Guard}
```
Not applicable: Field, Element, Destroyer Mace. *(Rose Storm is treated as "Target Power Up", so the
spell and item don't stack defensively.)*

### Enemy Magical Attack
```
Wrapperless: floor[MAT² * 5 / MDF] * Attack Multiplier
Wrapper:     floor{floor[floor{floor[floor{floor[(MAT²*5/MDF)] * Attack Multiplier * TF * AF} * Power] * Field} * Element] * Guard}
```
Not applicable: Destroyer Mace.

### Enemy percentage attacks

- **Ghost Commander's Haunting Bolt** — `floor[Target current HP / 2]`; then Target Fear, Guard.
- **Rare Monster basic** — `floor[Target Max HP / 10]`; then Target Fear, Guard.

---

## Unique formulas

- **Drake's Wire** — `floor(1000 / DF)`; then Target Fear, Power. (Attacker = Wire, Target = the
  player.) Not applicable: Attacker Fear, Field, Element, Guard.
- **Addition Counter** — `floor{ floor[AT² * 250 / DF] / 100 }`; then TF, AF, Power. Not applicable:
  Field, Element, Guard, Destroyer Mace.
- **Feyrbrand's Attacking Power Up** — `floor{ [formula] * [(10 + times Power Up used) / 10] }`.
- **Rare Monster damage mitigation** — when *attacking* a Rare Monster, damage is **set to 1** and
  ignores normal stats/formulas; then Attacker Fear, Destroyer Mace.

## Status damage

- **Confusion** / **Bewitchment** (self-hit) — `floor(Attacker Max HP / 5)`; then Target Fear, Guard.
- **Poison** (tick) — `floor(Target Max HP / 10)`. No modifiers.

---

## Implementation map

Each row maps a formula above to its function in `src/combat/formula.ts` (all verified against this
doc). Modifiers are passed via the `Modifiers` object (default ×1).

| Formula | Function | Notes |
|---|---|---|
| Archer Attack | `physicalAttack` | |
| Additions | `additionAttack` | hit/mult data in `src/data/additions.ts` |
| Item Magic — Multi | `multiItemAttack` | `Multiplier%` = mashing QTE (defaults to 100, caps at 268; mini-game not built yet). Both Psyche Bombs (BID 400). |
| Item Magic — Powerful | `powerfulItemAttack` | All-Powerful items and Detonate Rock (no QTE) |
| Dragoon Archer / D'Attack | `dragoonAttack` | `archer` flag; `DRAGOON_OUTPUT` = the input table |
| Dragoon Magic | `magicAttack` | spell multipliers in `src/data/dragoonSpells.ts` |
| Enemy Physical | `enemyPhysicalAttack` | |
| Enemy Magical | `enemyMagicalAttack` | |
| Haunting Bolt | `hauntingBolt` | |
| Rare Monster basic | `rareMonsterBasic` | |
| Addition Counter | `additionCounter` | |
| Drake's Wire | `drakeWire` | |
| Confusion / Bewitchment | `confusionDamage` | |
| Poison | `poisonDamage` | |

### Not yet implemented
- **Feyrbrand's Attacking Power Up** modifier (needs the boss + a use-counter).
- **Rare Monster damage mitigation** (needs a Rare Monster enemy type).
- The **mashing QTE** that produces `Multiplier%` for Multi items — the formula slot is wired; the
  mini-game (and its mash→% curve) is still to be built.

## Credits
Written by **Wulves**, base formula info & insights from Drew, tfz, Zychronix, Monoxide; extensive
testing by Dedspawn (who uncovered and resolved an error in the Item Magic formula).
