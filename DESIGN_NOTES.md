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

## Non-canon / invented — full audit (any subject)

Canon and correct (for reference): Dart's level table 1–60 (`dart.ts`), enemy stat blocks
(Knight of Sandora, Commander Seles — `enemies.ts`), Addition per-hit `%` values, the LoD
damage formulas (`formula.ts`), element multipliers ×1.5/×0.5 (`element.ts`). The rest below
is ours.

### Real-time combat layer (entirely invented — LoD is turn-based)
- **ATB / attack-interval model**: `ATTACK_INTERVAL` 2.8s, `REF_SPEED` 40, `BASE_FILL_TIME`,
  Speed→recharge. The whole per-character real-time gauge is an adaptation.
- **Movement / spacing**: player `SPEED` 6 u/s, enemy `SPEED` 3.2, enemy `ATTACK_INTERVAL`
  1.4s, `ATTACK_RANGE` 1.7, `PLAYER_REACH` 2.3, `ACQUIRE_RANGE` 20. All invented.
- **Rooting while attacking/guarding**, **auto-approach on Attack** — real-time conveniences.
- **Ranged combat** for bow bearers (flying arrows, `RANGED_REACH` 9, `RANGED_COOLDOWN` 0.7,
  `ARROW_SPEED` 26) — the whole real-time ranged mechanic is invented (Shana is turn-based).
- **Gambit/AI brains, party of 3, control switching** — our systems, not LoD UI.

### Addition timing & leveling (tuned by us)
- Timing windows: `SIGHT_DURATION` 0.7s, `WINDOW_LO/HI` 0.8/1.1, `PERFECT` 0.93/1.05 — tuned.
- **Addition leveling**: +1 level per 20 successful performances, cap Lv5 — threshold invented.
- **Per-level multiplier arrays** (e.g. Double Slash 100/105/110/120/135): our modeling of
  level scaling. The `hits[]` %s are canon; the `multiplier[5]` tables are approximations.
- **SP per landed hit** = `floor(spMax/presses)` — distribution invented (spMax values ~canon).
- Final Additions gated at `acquireLevel` 40 instead of the real "perform all prior 80×" rule.

### Character → class mapping (simplification)
- Only 7 stat tables + Addition lists exist (Dart, Lavitz, Shana, Rose, Haschel, Meru,
  Kongol). All 18 bearers map onto these 7 archetypes: e.g. **Albert uses Lavitz's** table,
  **Miranda uses Shana's**, **Zieg uses Dart's**, and the ancient Dragoons (Shirley, Kanzas,
  Doel, Damia, Lenus, Belzac, Syuveil, Greham) each reuse one of the 7. Same-line Additions
  is semi-canon; **shared stat tables are not** (each character has its own in LoD).

### Guard / resources
- Guard: `GUARD_DURATION` 2s, old `GUARD_COOLDOWN` 6s (now superseded by ATB),
  `GUARD_HEAL_FRACTION` 10%. The ½-damage and ~10% heal are roughly canon; durations invented.
- `maxSp` flat 100 (LoD: 100 per Dragoon level, up to 500) — simplified. (Plus the MP/SP
  issues already listed under the Dragoon rework.)

### Visuals
- All character **models and 2D portraits are procedural placeholders / extrapolations**
  (notably Shirley, never seen in human form in canon).

## Other open items

- **Items** — to be re-discussed (currently a single Healing Potion in a shared pool).
- Enemies still target only the controlled member (no spread aggro).
- Allies have no HP bar / death / revive yet.
