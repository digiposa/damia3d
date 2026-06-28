# Dragoon system — canon mechanics

Source: LoD Wiki "Dragoon" page (mechanics) + Official Guidebook. This is the shared
mechanics reference; per-character D'level stat tables and spell lists also live in each
character's file (dart.md, shana.md, …). Our game is a **real-time ATB ARPG**, so a LoD
"turn" maps to **one action** (one ATB spend) — see the mapping notes per section.

## Spirit Points (SP)

- It takes **100 SP** to fill the meter once → the character may transform.
- Each **Dragoon Level** adds **+100** of meter capacity → **maxSP = D'Lv × 100**.
- Taking a turn while transformed **drains 100 SP**; reaching 0 → **auto de-transform**.
  So **each 100-SP block = one turn in Dragoon form**.
- On transform, SP that isn't a multiple of 100 is **lost** (180 → 100). So at transform:
  `turns = floor(SP / 100)`, and the meter is set to `turns × 100`.
- SP keeps accumulating toward **D'level-up even when the meter is maxed** — you never need
  to actually transform to raise D'level (the lifetime total drives it; see Dragoon Level).

### Sources of SP
- **Additions** award varying amounts (our `AdditionDef.spMax`).
- **Shana / Miranda** earn SP per successful attack, amount scales with D'level
  (35/50/75/100/150 — implemented, see shana.md).
- **Spirit Potion** item: +100 SP. **Recovery Ball**: +100 SP at random chance.
- **Spirit Ring** (accessory): +20 SP at the start of each turn.
- Equipment that grants SP **when damaged** (magically: Knight Helm, Giganto Helm, Jeweled
  Crown, Soul Headband, Robe, Ruby Ring · physically: Sparkle Dress, Master's Vest, Giganto
  Armor, Saint Armor), or that **increases SP gained** from Additions/attacks (Fairy Sword,
  Pretty Hammer, Energy Girdle, Wargod's Sash).

## Dragoon Level (D'Lv)

- Starts at **1**, caps at **5**.
- In Dragoon form, **AT / DF / MAT / MDF gain a multiplier that rises with D'Lv** (per-character
  tables — see each character's `## Dragoon form → ### D'levels`). Replaces our flat 1.5×.
- Learn **1 spell at start + 1 per level except level 4**. Exceptions: **Kongol** learns none
  at level 2 either.
- A **hidden accumulated-SP threshold** raises D'Lv by 1. SP accumulates toward it even when
  the meter is maxed (no need to transform). Per-character thresholds (cumulative SP to reach):
  most characters 1,000 / 6,000 / 12,000 / 20,000 for D'Lv 2/3/4/5 (Dart: 1,200 / 6,000 /
  12,000 / 20,000 — see dart.md). Verify per character.

## Transformation

- Once transformed, **cannot de-transform** except by SP→0 or HP→0. (Note: our current build
  has a manual "Revert" (⮌) button — non-canon; decide whether to keep it.)
- While transformed, **Item / Defend / Escape are disabled**; gain **D'Attack** and **Magic**.

## D'Attack

- Non-archers: a timed "Spirit Meter" minigame — press X each time the revolving light returns
  to start. Up to **5 strikes** (Kongol: **4**). A perfect D'Attack shows an elemental flourish
  but only deals elemental damage if an elemental weapon is equipped.
  → Maps onto our existing timing-combo system (TimingSight / AdditionRunner): a "Dragoon
  combo" of up to 5 inputs.
- Inputs → damage Output (replaces the `0.05·n² − 0.05·n + 1` term ×100):

  | Inputs | 1 | 2 | 3 | 4 | 5 |
  |--|--:|--:|--:|--:|--:|
  | Output | 100 | 110 | 130 | 160 | 200 |

- Damage formula (AT = status-screen total, already includes DRGNAT%):
  - **Non-archers:** `floor[ floor{ floor[ round{ floor[ floor{Output · DRGNAT%/100} · AT/100 ] · (LV+5)·5 / DF } · Fear · Power ] · Field } · Element ]`
  - **Archers:** `floor[ floor{ floor[ round{ floor[(AT · DRGNAT%/100)] · (LV+5)·5 / DF } · Fear · Power ] · Field } · Element ]`

## Magic

- Opens a spell menu; spells cost **MP**. Per-character spell lists with D'level unlocks.
- Spell damage formula (DRGNMAT% = status-menu Dragoon MAT%; the in-menu "STR %" is **not**
  used and is sometimes wrong):
  `floor{ floor[ floor{ floor[ floor{ floor[(MAT · DRGNMAT%/100)] · (LV+5)·5 / MDF } · Multiplier/100 ] · Fear · Power } · Field ] · Element }`

### Dragoon spells (canonical list)

| Char | Spell | Mult | Target | Effect | MP | Acq. |
|---|---|--:|---|---|--:|---|
| **Dart (Red)** | Flame Shot | 200 | 1 enemy | Fire magic dmg | 10 | Init |
| | Explosion | 100 | All enemies | Fire magic dmg | 20 | D2 |
| | Final Burst | 300 | 1 enemy | Fire magic dmg | 30 | D3 |
| | Red-Eye Dragon | 300 | All enemies | Fire magic dmg | 80 | D5 |
| **Dart (Divine)** | Divine DG Ball | 400 | All enemies | Non-elem magic dmg | 50 | Init |
| | Divine DG Cannon | 600 | 1 enemy | Non-elem magic dmg | 50 | Init |
| **Lavitz/Albert** | Wing Blaster | 100 | All enemies | Wind magic dmg | 20 | Init |
| | Blossom/Rose Storm | — | All allies | Halve most incoming dmg (Power-Up); lasts 3 turns/target, survives death | 20 | D2 |
| | Gaspless | 300 | 1 enemy | Wind magic dmg | 30 | D3 |
| | Jade Dragon | 300 | All enemies | Wind magic dmg | 80 | D5 |
| **Rose** | Astral Drain | 200 | 1 enemy / all allies | Darkness dmg; heal allies by floor(dmg / #alive-non-petrified) | 10 | Init |
| | Death Dimension | 100 | All enemies | Darkness dmg + 100% Fear | 20 | D2 |
| | Demon's Gate | — | All enemies | 100% Instant Death | 30 | D3 |
| | Dark Dragon | 400 | 1 enemy | Darkness dmg | 80 | D5 |
| **Shana/Miranda** | Moon Light | — | 1 | HP0→revive 50%; else cure status + full HP | 10 | Init |
| | Star Children | 100 | All enemies | Light magic dmg | 20 | D2 |
| | Gates of Heaven | — | All allies | HP0→revive 50%; else cure status + 50% HP | 30 | D3 |
| | W Silver Dragon | 300 | All enemies + allies | Light dmg to foes; allies (HP>0, not petrified) full HP | 80 | D5 |
| **Haschel** | Atomic Mind | 100 | 1 enemy | Thunder dmg | 10 | Init |
| | Thunder Kid | 200 | 1 enemy | Thunder dmg + 100% Stun | 20 | D2 |
| | Thunder God | 300 | 1 enemy | Thunder dmg | 30 | D3 |
| | Violet Dragon | 400 | 1 enemy | Thunder dmg | 80 | D5 |
| **Meru** | Freezing Ring | 200 | 1 enemy | Water dmg | 10 | Init |
| | Rainbow Breath | — | All allies | Cure status + 50% HP (if HP>0) | 20 | D2 |
| | Diamond Dust | 200 | All enemies | Water dmg | 30 | D3 |
| | Blue Sea Dragon | 400 | 1 enemy | Water dmg | 80 | D5 |
| **Kongol** | Grand Stream | 150 | All enemies | Earth dmg | 20 | Init |
| | Meteor Strike | 200 | All enemies | Earth dmg | 20 | D3 (no D2 spell) |
| | Golden Dragon | 300 | All enemies | Earth dmg | 80 | D5 |

## Special (all-party transform)

- The "Special" command appears only when **all 3 members' SP meters are full and none are
  transformed**. It transforms **all three** and opens **Dragoon Space** matching the
  initiator's element. The initiator's D'Attacks auto-complete (no minigame). Dragoon Space
  ends when the initiator de-transforms.

## Dragoon Space (Field multiplier)

- The **Field** multiplier in the damage formulas applies **only while Dragoon Space is active**
  (and **not** for spells with "Dragon" in their name, despite the visuals).
- Field ≈ **+50% damage for the matching element, −50% for the opposite element**, for all
  allies and enemies. So opposite-element party members weaken each other in their Spaces.
  - `Field = 1` unless attack element matches/opposes the Space, else `1 + AttackElement`
  - `AttackElement = +1/2` if it matches the Space, `−1/2` if opposite.

## Variable multipliers (shared by D'Attack & Magic)

- **Fear**: target has Fear → ×2, else ×1.
- **Power**: no power items → 1; else `1 + (AttackerPower + TargetPower)` where each power-up is
  ±1/2. (Blossom/Rose Storm = a persistent Power-Up on allies; doesn't stack with Power-Up item;
  ignored by attacks that don't use Power, e.g. Rare Attacks / Haunting Bolt.)
- **Element**: target element matches/opposes attack → `1 ± 1/2` as above, else 1.
