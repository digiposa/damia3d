# Items System — Legend of Dragoon (canon reference)

Transcribed from the 2D Damia project's items doc. Stored as the source of truth. The **damage math**
for attack items lives in [`../combat/damage-formulas.md`](../combat/damage-formulas.md) (Item Magic).

## Inventory structure (canon)

| Category | Capacity | Notes |
|---|---|---|
| Used Items | 32 | Consumables (5 sub-categories); discardable |
| Armed Items | 255 | Equipment; sellable |
| Goods | Unlimited | Quest/lore items; non-sellable |

## Used-item categories

- **Recovery** (11): HP (Healing Potion / Fog / Breeze / Rain), MP (Sun Rhapsody, Moon Serenade),
  **Spirit Potion (100 SP)**, revival / status-cure.
- **Random** (2): Recovery Ball (one of 7 healing effects), Attack Ball (random status/damage).
- **Attack** (21): 7 elements × 3 tiers + Non-Elemental. See below.
- **Repeat** (10): post-battle return items — Power Up/Down, Speed mods, shields, Smoke Ball, Pandemonium.
- **Miscellaneous** (7): Charm Potion, Sachet (10 fixed dmg; one-turn Unique-Monster killer), 5 status items.

## Attack items (21) + Non-Elemental

Tiers: **Single-target Multi** (10G, BID 150, has QTE) · **All-target Multi** (20G, BID 100, has QTE)
· **All-target Powerful** (chest/drop, BID 300, no QTE).

| Element | Single Multi | All Multi | All Powerful |
|---|---|---|---|
| Fire | Burn Out | Gushing Magma | Burning Wave |
| Earth | Pellet | Meteor Fall | Gravity Grabber |
| Thunder | Spark Net | Thunderbolt | Flash Hall |
| Wind | Spinning Gale | Rave Twister | Down Burst |
| Water | Spear Frost | Fatal Blizzard | Frozen Jet |
| Darkness | Dark Mist | Black Rain | Night Raid |
| Light | Trans Light | Dancing Ray | Spectral Flash |

**Non-Elemental:** Detonate Rock (BID 100), Psychedelic Bomb, Psychedelic Bomb X (BID 400). No QTE.

## Key mechanics

- **Magical attack items:** the user's element is irrelevant — the **item's** element is used, ×1.5
  vs the opposing target element / ×0.5 vs the same (standard Element modifier). Damage scales with
  the user's MAT/LV and the target's MDF (not a flat value). **Psyche Bomb exception:** ×2 vs all
  non-Non-Elemental enemies.
- **Multi items** carry the **mashing QTE** (spam X → `Multiplier%`); Powerful items and Detonate
  Rock / Psyche Bomb X do not.
- **Power Up (item)** = +50% dmg dealt, −50% received, 3 turns — distinct from the mob/boss Power Up
  ability (1.5× physical + magical).

## Implementation status

- Attack items: **implemented** — `src/data/items.ts` (`ATTACK_ITEMS`, `attack: {element, bid, target, multi}`),
  thrown via `TrainingMode`, damage via `multiItemAttack` / `powerfulItemAttack`.
- BID values from the formula doc are in place. Placeholder: Psyche Bomb (non-X) BID = 300 (not in
  the BID chart).
- **Not built yet:** the mashing QTE (`Multiplier%` defaults to 100), the Psyche Bomb ×2 exception,
  Recovery beyond Healing/Spirit Potion, Random / Repeat / Miscellaneous categories, the 3-category
  inventory screen.
