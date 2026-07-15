# Feature docs

Canon references and design notes for game systems, transcribed from the 2D Damia project and the
LoD Wiki Project. These are the **stored source of truth** the live `src/` code is verified against
(so we don't re-fetch pages). Character-level canon lives in [`../canon/`](../canon/).

- [`combat/damage-formulas.md`](combat/damage-formulas.md) — every LoD damage formula (player,
  enemy, unique, status), the modifier wrapper, and a map to `src/combat/formula.ts` (verified 1:1).
- [`items/items.md`](items/items.md) — inventory structure, the 21 attack items + Non-Elemental,
  and item mechanics (mashing QTE, Power Up, element rules).

## Full 2D reference archive

The complete docs from the 2D project are archived under [`../damia2D/`](../damia2D/) — the richest
canon/stats source we have (per-character stats, Addition tables, elements, experience, the full
bestiary, dragoon mechanics, plus lore). The curated docs above are the **verified-against-`src/`**
subset; reach into the archive for fuller detail or systems not yet ported to 3D. Start at
[`../damia2D/features/combat/`](../damia2D/features/combat/) for the stats core.
