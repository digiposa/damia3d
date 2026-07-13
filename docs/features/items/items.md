# Items System — Legend of Dragoon (canon reference)

Transcribed from the LoD Wiki Project's **Items** page. Stored as the source of truth. Focus is on
**effects and mechanics** (what we reimplement); the wiki's exhaustive per-item shop/chest/drop
locations are omitted here — consult the wiki if we ever need spawn tables. Attack-item **damage
math** is in [`../combat/damage-formulas.md`](../combat/damage-formulas.md) (Item Magic).

## Inventory structure

- **Used items** — consumables (Recovery / Random / Attack / Repeat / Miscellaneous). Cap **32**; a
  full inventory prompts "Cannot carry any more items." (drops offer a swap-or-discard). Usable in
  battle; some also usable/discardable from the Pause Menu (sometimes with a different effect).
- **Armed items** — equipment (armor, weapons, accessories). Cap **255**. See Equipment.
- **Goods** — quest/lore items; no inventory limit, can't sell/discard. Some are gameplay-tied — e.g.
  the ability to become a **Dragoon** depends on the relevant **Dragoon Spirit** being in Goods.

## Recovery items

Restore HP/MP/SP or cure ailments. Most work outside battle (except Spirit Potion, Angel's Prayer,
Depetrifier).

| Item | Effect | Price |
|---|---|---|
| Healing Potion | Restore 50% of one character's max HP (floored) | 10G |
| Healing Fog | Fully restore one character's HP | 30G |
| Healing Breeze | 50% max HP to each active party member (all characters outside battle) | 50G |
| Healing Rain | Fully restore each active party member's HP (all characters outside battle) | 60 Tickets |
| Sun Rhapsody | Fully restore one character's MP | 50G |
| Moon Serenade | Fully restore each active party member's MP (all outside battle) | — (sell 100G) |
| Spirit Potion | +100 SP to one character; counts toward D'Level SP even if the SP bar is full | 20 Tickets |
| Angel's Prayer | Revive one downed character at 50% max HP (floored) | 30G |
| Body Purifier | Remove Poison, Stun, Arm-Blocking from one character | 10G |
| Mind Purifier | Remove Fear, Confusion, Bewitchment, Dispiriting from one character | 20G |
| Depetrifier | Remove Petrification from one character | 30G |

## Random items

Generate one effect from a set on use; battle-only.

- **Recovery Ball** — random one of: Healing Potion, Healing Fog, Healing Breeze, Healing Rain, Sun
  Rhapsody, Moon Serenade, Spirit Potion (can be redundant, e.g. HP heal at full HP). 100G.
- **Attack Ball** — random one of: Poison Needle, Stunning Hammer, Midnight Terror, Panic Bell, or any
  Attack item **except Detonate Rock and Psychedelic Bomb**. 100G.

## Attack items

Inflict **elemental magic damage**; battle-only. Item-description shorthand:

- **S** — single enemy · **A** — all enemies.
- **Multi** — can be boosted **up to 268% damage** by repeatedly tapping **X** when the on-screen
  graphic appears (the mashing QTE).
- **Powerful** — deals more than a Multi item even at 268% — **except** Psyche Bomb / Psyche Bomb X.

| Element | Single (Multi) | All (Multi) | All (Powerful) |
|---|---|---|---|
| Fire | Burn Out | Gushing Magma | Burning Wave |
| Earth | Pellet | Meteor Fall | Gravity Grabber |
| Thunder | Spark Net | Thunderbolt | Flash Hall |
| Wind | Spinning Gale | Rave Twister | Down Burst |
| Water | Spear Frost | Fatal Blizzard | Frozen Jet |
| Darkness | Dark Mist | Black Rain | Night Raid |
| Light | Trans Light | Dancing Ray | Spectral Flash |

**Non-Elemental:**
- **Detonate Rock** — All, **no Multi** (BID 100).
- **Psychedelic Bomb** / **Psychedelic Bomb X** — All, **Multi** (both BID 400). Psyche Bomb X is
  also a Repeat item; at BID 400 it deals ~2.66× a Single-Multi and 4× an All-Multi item.

Prices (elemental): Single ≈ 10G, All-Multi ≈ 20G, All-Powerful ≈ not sold (chest/drop).

### Item damage formulas

Only for **playable characters** using attack items (enemy formulas are separate). Two formulas —
one for Multi (mashing) items, one for Powerful & Detonate Rock — both using each item's hidden
**BID** (Base Item Damage).

**BID chart**

| BID | Item type |
|---|---|
| 100 | Detonate Rock |
| 100 | All Target Multi |
| 150 | Single Target Multi |
| 300 | All Target Powerful |
| 400 | Psyche Bomb, Psyche Bomb X |

**Modifier variables** (see also the combat doc): Attacker Fear (½ if feared), Power (`1 + Attacker
Power + Target Power`, ±½ each from Power Up/Down), Field (`1 + Attack Element` vs special field,
±½), Element (`1 + Target Element` vs attack element: −½ same / +½ opposite), **Multiplier%** (from
mashing, 100→268), Target Fear (2 if feared).

```
Multi:                  floor[floor{floor[floor{floor[floor{floor[(LV+5)·MAT·5/MDF]·BID/100}·AF}·Power]·Field}·Element]·Multiplier%/100]·Target Fear
Powerful & Detonate:    floor{floor[floor{floor[floor{floor[(LV+5)·MAT·5/MDF]·BID/100}·Target Fear·AF]·Power}·Field]·Element}
```

## Repeat items

Used in battle, **return to inventory after the fight** (reusable every battle). Worth 200G, found
once (chest, mostly). Each targets an ally/enemy; effect expires after the target takes **3 turns**
(unless noted).

| Item | Effect |
|---|---|
| Magic Stone of Signet | Minor enemy can't act (3 of its turns). Not bosses / a few named foes. |
| Pandemonium | Forces minor enemies to attack one ally (they may still use party-wide attacks). |
| Material Shield | One ally: immune to physical attacks. |
| Speed Up | One ally: double speed. |
| Power Up | One ally: +50% damage dealt, −½ damage taken. Defensive half doesn't stack with Rose Storm (refreshes duration only). |
| Speed Down | One enemy: half speed. |
| Magic Shield | One ally: immune to magic attacks. |
| Smoke Ball | Immediately escape battles that allow Escape. |
| Power Down | One enemy: −½ damage dealt, +50% damage taken. Mutually exclusive with enemy Power Up (latest wins). |
| Psyche Bomb X | Also an Attack item (see above) — hits all, Non-Elemental, uses the Multi item formula. |

## Miscellaneous items

| Item | Effect | Price |
|---|---|---|
| Charm Potion | In battle: minor enemies can't target the affected character (3 turns); if all are charmed, they can't act. Outside: resets steps-to-encounter. | 4G |
| Sachet | Exactly **10 fixed** Non-Elemental magic damage to one enemy (ignores the formula; 0 vs magic-barrier foes). One-turn sleep on Jiango. | — (sell 200G) |
| Poison Needle | Inflict Poison on a minor enemy | 20G |
| Stunning Hammer | Inflict Stun on a minor enemy | 20G |
| Midnight Terror | Inflict Fear on a minor enemy | 20G |
| Panic Bell | *(status-inflict — transcription truncated in source)* | — |

## Implementation status

- **Attack items — implemented.** `src/data/items.ts` (`ATTACK_ITEMS`, `attack: {element, bid,
  target, multi}`); thrown via `TrainingMode`; damage via `multiItemAttack` / `powerfulItemAttack`.
  BID values, targets and Multi flags match the wiki (Detonate Rock = All/no-Multi; both Psyche
  Bombs = BID 400 / Multi). `ITEM_MULTIPLIER_MIN/MAX = 100 / 268`.
- **Recovery — partial.** Healing Potion (50%) + Spirit Potion (100 SP) exist; the rest (Fog/Breeze/
  Rain, Sun Rhapsody/Moon Serenade, revive, status cures) are not yet added.
- **Not built:** the mashing **QTE** (`Multiplier%` defaults to 100; cap 268 is ready), Random /
  Repeat / Miscellaneous categories, the Sachet fixed-10 special, the Psyche Bomb ×2-vs-elemental
  exception, and the 32-slot inventory / 3-category inventory screen.
