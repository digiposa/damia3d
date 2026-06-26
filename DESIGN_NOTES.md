# Design notes / backlog

Living list of agreed reworks and open design questions. Not user-facing.

## ⚠️ Dragoon system — full rework needed (agreed)

The whole **Dragoon subsystem is placeholder** and must be completely redesigned for
coherence/canon. Nothing in it is settled — revisit all of:

- **SP generation** — how the Dragoon Spirit gauge fills. Currently ad-hoc: player gains
  a flat `spMax/presses` share per landed Addition hit; AI gains a flat `AI_SP_PER_HIT`
  (20) per auto-attack. Not canon, not tuned.
- **MP** — currently a placeholder number (`BASE_MAX_MP = 60`, starts full so magic is
  usable). No real source/sink, no per-level growth, no canon values.
- **Stats** — transform effect is a made-up `ATK ×1.5`. In LoD, Dragoon form has its own
  stat profile / Dragoon Attack and Dragoon-level scaling. Needs the real model.
- **Spells / magic** — single generic Dragoon spell reusing the enemy magical formula
  (`MAT²·5/MDF × 2`, arbitrary mult). Needs a real per-Dragoon spell catalogue (by
  element + Dragoon level), proper MP costs, and canon damage.
- **Transform duration** — currently 3 of the member's actions (`DRAGOON_TURNS`); LoD uses
  a turn count tied to the Dragoon level / Dragoon gauge. Reconcile with the ATB model.

Where this lives today: `Player.ts` (transform state, `canCastMagic`, `magicCost`,
`DRAGOON_TURNS`, `DRAGOON_ATK_MULT`, MP init), `TrainingMode.ts` (`castMagic`,
`DRAGOON_MAGIC_MULT`, `AI_SP_PER_HIT`, SP gain on hits), `Gambit.ts` (transform/magic
rules). Treat all of these constants/effects as throwaway until the rework.

## Other open items

- **Items** — to be re-discussed (currently a single Healing Potion in a shared pool).
- Enemies still target only the controlled member (no spread aggro).
- Allies have no HP bar / death / revive yet.
