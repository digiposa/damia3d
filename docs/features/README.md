# Feature docs

Canon references and design notes for game systems, transcribed from the 2D Damia project and the
LoD Wiki Project. These are the **stored source of truth** the live `src/` code is verified against
(so we don't re-fetch pages). Character-level canon lives in [`../canon/`](../canon/).

- [`combat/damage-formulas.md`](combat/damage-formulas.md) — every LoD damage formula (player,
  enemy, unique, status), the modifier wrapper, and a map to `src/combat/formula.ts` (verified 1:1).
- [`items/items.md`](items/items.md) — inventory structure, the 21 attack items + Non-Elemental,
  and item mechanics (mashing QTE, Power Up, element rules).
