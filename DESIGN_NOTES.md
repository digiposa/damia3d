# Design notes / backlog

Living list of agreed design decisions, reworks, and open questions. Not user-facing. The first
part below (**"Decisions log"**) records systems we've built and *why*, so reworking them later
doesn't mean re-reading all of `src/`. The older **"Review queue"** and per-system sections that
follow are the original backlog.

---

# Decisions log (implemented systems)

Each entry: the decision, where it lives in code, and what's still open / tunable. Nothing is final.

## Project framing / positioning

- **Primary goal = fidelity to the PS1 game.** Damia3D is a faithful tribute; canon behaviour wins
  over invention wherever we can manage it.
- **Original assets are only a fallback**, not the goal: if Sony ever objects, the plan is to take it
  down or swap to original assets while staying a love letter to LoD. (This reversed an earlier
  framing where "original game" was the stated aim — it is *not*.)
- Public one-liner used for the Discord preview: *unofficial, non-commercial fan project, not
  affiliated with Sony.*
- **Dev/deploy:** work directly on `main`, every change pushed → GitHub Pages auto-deploys (only
  `main` deploys). See `CLAUDE.md`. The in-game top-left `build <hash>` shows the deployed commit.

## Game modes & the mode-flag pattern

- `ArenaCombatMode` (in `src/modes/TrainingMode.ts`) is the shared combat core; **Training** and
  **Survival** are subclasses that flip behaviour via protected flags:
  `showDebugTools`, `startFullSp`, `reviveOnZero`, `unlockDragoonOnBuild`, `shareXpWithParty`,
  `allowPartyEditing`, `allowAllGear`.
- **Training** = sandbox: all flags permissive (spawn tools, full SP, revive on zero, all gear,
  party editing). A place to test freely.
- **Survival** = roguelite: lean, no revive, earn SP/Dragoon over the run, owned-gear only, party
  fixed at start and grown only via reward cards.
- **Story** *(planned)* — will follow the PS1 scenario, plus an original **prologue set during the
  Dragon Campaign**. Still a stub.

## Equipment ownership (Étape 1 — done)

- **Training = all gear free** (sandbox). **Survival/Story = you can only equip what you actually
  own.** Decided to match LoD's model.
- Model: a shared **`EquipInventory`** stash (`src/data/inventory.ts`) — count per item id, plus a
  `granted` set so party rebuilds don't re-grant loadouts. `grantLoadout(bearer)` gives a member
  their class starting kit once.
- **Weapons are class-bound** (Dart & Zieg share the redEye weapons via each class's
  `equipmentUser` tag) — already worked through the class binding, no data migration needed.
- **Availability is derived, not bookkept:** `available(x) = owned(x) − (party members wearing x)`.
  Owning 1 Bastard Sword → Dart *or* Zieg; owning 2 → both. `slotHolders()` computes who's wearing
  what; the equip menu greys out owned-but-taken items (`EquipOption.enabled`, `SystemMenu`).
- Lives in: `inventory.ts`, `TrainingMode` (`allowAllGear`, `inventory`, `slotHolders`, gated
  `setEquip`), `SurvivalMode` (`allowAllGear = false`), `core/menu.ts` + `ui/SystemMenu.ts`.

## Survival mode design

- **Solo start**, party grows only via recruit reward cards (cap 3). No healing between waves —
  HP/MP/SP persist, so **attrition is the core challenge**. Wipe → Game Over + saved best (waves).
- **Waves:** `knights = min(8, 2 + floor(wave/2))`; a **Commander mini-boss every `BOSS_EVERY` (5)
  waves**. `onEnemiesCleared` → next wave (no breather).
- **Reward cards on level-up** (`RewardCards` UI, 1-of-`CARDS_PER_LEVEL` (3)):
  - Pool: recruit ally, unlock Dragoon Spirit, **run-wide stat bonuses**, full heal, potions.
  - **Stat cards are run-wide** (whole party, present + future recruits inherit via
    `runStatBonuses` / `applyRunBonuses`) — they used to touch only the leader.
  - **Amounts scale** with `rewardTier() = 1 + floor((level−1)/5)` (×1 early → ×8 late), so a flat
    bonus stays relevant.
  - **Weighted draw + light anti-repeat:** `WEIGHT` (dragoon 6, recruit 5, heal 3, stat/potions 2),
    sampled without replacement; a card shown last draw gets a `REPEAT_PENALTY` (0.2) so screens
    don't repeat back-to-back. Situational cards no longer get drowned.
- **Boss loot (Étape 2 — done):** on a boss kill, a 1-of-3 **gear** pick (reuses the card UI).
  Candidates = the *next unowned* rung up each party ladder (`lootCandidates` in `src/data/loot.ts`):
  weapons follow the **canon AT curve**, armour its defence tier, accessories their headline stat;
  class-filtered and deduped. **Manual**: picking banks the item in the stash (equip from the menu),
  no auto-equip. A boss kill that also levels up queues both screens (`pendingOffers`).
- **Enemy scaling** (`SurvivalMode.scaledDef`): tutorial base stats × `(base + perLevel×(avgLevel−1))`,
  driven by the party's **average level** (tracks card/loot power, not raw wave count). `HP_SCALE`
  `{base 1, perLevel 0.6}` is the main lever; `AT_SCALE` `{base 1, perLevel 0.12}` ramps gently
  because there's no between-wave healing (steep AT one-shots the player). DF deliberately **not**
  scaled (base Knight DF 40 already crushes damage; raising it makes sponges).
  - **Open / accepted:** balance is intentionally rough — only the Knight + Commander exist, so
    variety (not stat inflation) is the real fix. Curve is first-pass, expected to be re-tuned.
    Reward-card *content* additions (MDF/SP/MP cards) were paused.

## Combat feel decisions

- **Additions deal their damage at the END of the QTE (canon PS1).** Each landed hit is accumulated
  (`comboDamage`) and the total lands once when the combo ends — complete, break, or lapse — via
  `landComboDamage()` in `finishAction()`. Consequence: **the enemy can't die mid-combo**, so you
  can always finish an Addition even on a 4-HP mob; the big number pops at the end. A broken combo
  still lands the hits you did land. Ranged (single shot, arrow) still lands on arrival.
  - This replaced per-hit damage, which let weak enemies die on hit 1 before the timing window even
    opened (you couldn't perform the Addition). Lives in `TrainingMode` (`applyHit`, `comboDamage`,
    `landComboDamage`, `finishAction`).
- **Attack stance held through an Addition:** the one-shot strike clip is 1–2 s and was restarted on
  every hit, snapping the swing back to its neutral first frame (read as "cut to idle"). Now
  `strike()` won't restart a swing already in progress, and `animate(…, attacking)` keeps a combat
  stance between swings (combat-idle if the model has one, else holds the strike's end pose) instead
  of relaxing to the peaceful idle. Lives in `src/entities/Player.ts`, driven from `TrainingMode`.

## Character models & weapon-mount conventions

- **Shana's bow (Tripo `shana_bow.glb`):** slung on her **back out of combat**, drawn to hand when
  enemies are near (the standard holster: `draw`/`sheathe` by combat stance). Held in the **left
  (bow) hand** (`weaponLeftHand`), stood vertical via `weaponRotation`. Sheathed pose is tuned
  per-weapon via `weaponBack{Rotation,Offset,Scale}` (same clean spine-socket placement as the
  quiver), bypassing the sword-tuned back defaults. Quiver (`shana_quiver.glb`) rides the spine
  permanently (`backModel*`). Death collapse via `deathAnim` (`shana_death`).
- **Most polished models so far:** Damia, Shana, Haschel. Others are still procedural placeholders
  or rougher GLBs.
- Lives in: `src/entities/Player.ts` (holster, hand/back mounts), `src/data/bearers.ts` (per-bearer
  weapon/back/model flags).

---


## Review queue (tick as each point is settled)

We will revisit each of these one at a time and decide what to rework. Nothing here is
final. Details for every item are in the sections below.

- [ ] Dragoon system — SP/MP/stats/spells/transform/D'Attack/Special/Dragoon Space (Phases 1–5 done; see section below)
- [ ] **Status / buff / debuff system — proper general rework needed** (only the Dragoon-magic ones exist, ad-hoc; see section below)
- [ ] ATB / attack-interval model — values & feel (3.0s @ SPD 50, REF_SPEED 50, Speed→recharge)
- [ ] Movement / spacing constants (speeds, reaches, ranges, rooting, auto-approach)
- [ ] Real-time ranged combat (arrows, reach, cadence) — keep / tune / rework
- [ ] Addition timing windows (0.7s, window/perfect bands)
- [ ] Addition leveling rule (+1 per 20 successes, cap Lv5)
- [ ] Addition per-level multiplier tables (our modeling vs canon)
- [ ] SP-per-hit distribution (floor(spMax/presses))
- [ ] Final-Addition unlock rule (currently level 40 vs "prior ×80")
- [ ] Character→class mapping: 7 shared stat tables for 18 bearers (Albert→Lavitz, etc.)
- [ ] Guard durations / cooldown vs ATB; SP cap (flat 100 vs 100×Dragoon level)
- [ ] Items system (currently one Healing Potion in a shared pool)
- [ ] Enemy aggro spread (enemies target only the controlled member)
- [ ] Ally HP bars / death / revive
- [ ] Character models & 2D portraits (procedural placeholders / extrapolations)

## ⚠️ Dragoon system — full rework needed (agreed)

> **UPDATE:** the canon rework was implemented in Phases 1–5 (SP gauge = D'Lv×100,
> per-attack SP by D'Lv, D'level stat multipliers + progression, D'Attack timed combo,
> Dragoon Magic spell menu + formula, status ailments, Special + Dragoon Space, SP-source
> items/accessories). The notes below are the original placeholder description, kept for
> history. Still pending review: the Special command, and remaining SP-on-damage equipment.

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

**Canon reference for the rework** lives in `docs/canon/` (Wiki Project data per character:
SPD + aux stats, Dragoon D'levels & multipliers, Dragoon magic spells). Transcribe from
there when building the real Dragoon system.

## ⚠️ Status / buff / debuff system — proper rework needed (agreed)

The status effects implemented so far were built **ad-hoc, only for Dragoon magic** (Phase
3b) and are NOT a real system. We must design and build a **proper general status framework**,
because statuses come from many sources beyond Dragoon spells:

- **Items** (e.g. cure/heal-status items, attack items that inflict ailments).
- **Certain enemy & player attacks / Additions** that apply ailments.
- **Equipment** (status resistance/immunity; gear that inflicts on hit).
- The full canon ailment roster (Poison, Stun, Fear, Confusion, Bewitchment, Petrification,
  Arm Block, Sleep, Instant Death, stat up/down, etc.) — not just the few we have.

What exists today (to be folded into the real system, treat as throwaway):
- `Enemy.ts`: `fearTimer`/`stunTimer` + `feared`/`stunned`, `inflictFear/Stun`, `kill()`,
  `tickStatus()` (timers + emissive glow). Only Fear (×2 dmg), Stun (skip turn), Instant
  Death are modelled, with second-based durations we invented.
- `Player.ts`: `damageHalveTimer` + `damageHalved` + `applyDamageHalve()` (Rose/Blossom
  Storm only). No other player/ally ailments; **`cure` is a no-op** because allies can't be
  afflicted yet.
- Applied ad-hoc in `TrainingMode` (`FEAR_SECONDS`/`STUN_SECONDS`/`DAMAGE_HALVE_SECONDS`,
  `castSpell`, `applyHit` targetFear, `resolveEnemyAction` halve).

Rework should give: a shared status model on **any combatant** (enemy AND ally/player),
sourced from spells/items/attacks/equipment, with durations expressed in the right unit
(turns vs seconds — reconcile with the real-time ATB), resistances/immunities, cure/cleanse,
and consistent visuals. The Dragoon-magic ailments then become just one source feeding it.

## Per-character Speed (SPD) — DONE

Adding a per-class base SPD so the ATB cadence differs by character (`speed = baseSpeed +
gear SPD`). SPD is fixed (does not level). Calibrate `REF_SPEED` once all values are in
(Dart=50 is the likely reference → 2.8s). Collected so far:

- Red-Eye (Dart/Zieg): **50**
- Jade (Lavitz/Albert/Syuveil/Greham): **40**
- White-Silver (Shana/Miranda): **65**
- Darkness (Rose): **55**
- Violet (Haschel): **60**
- Blue-Sea (Meru): **70**
- Golden (Kongol): **30**

## Non-canon / invented — full audit (any subject)

Canon and correct (for reference): Dart's level table 1–60 (`dart.ts`), enemy stat blocks
(Knight of Sandora, Commander Seles — `enemies.ts`), Addition per-hit `%` values, the LoD
damage formulas (`formula.ts`), element multipliers ×1.5/×0.5 (`element.ts`). The rest below
is ours.

### Real-time combat layer (entirely invented — LoD is turn-based)
- **ATB / attack-interval model**: `ATTACK_INTERVAL`/`BASE_FILL_TIME` 3.0s, `REF_SPEED` 50, per-class SPD,
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
- **Enemy roster is canon-only**: only enemies/creatures that appear in The Legend of Dragoon
  are used — **no invented mobs**. Current enemies (Knights of Sandora, Commander Seles) are
  canon; the training dummy is a practice target. Generic asset-pack monsters (orc/yeti/alien/
  etc. from Quaternius) are **NOT** used — for LoD creatures we approximate with fitting/generic
  humanoid or beast models, or keep bespoke, checking canon per enemy.

## Assets on hand (not yet used)

- `src/assets/icons/lod-icons-sheet.png` — a sprite sheet of in-game LoD icons (ripped):
  weapons (swords/spears/axes), shields, boots, gloves/gauntlets, accessories (rings/
  bracelets), the 8 element orbs, item icons (potions/bags), action/UI icons (magic, crossed
  swords, etc.), and small character portrait headshots. To be sliced/atlased later for
  equipment, element, action and item icons (and maybe HUD portraits). Stored for now.

## Other open items

- **Items** — to be re-discussed (currently a single Healing Potion in a shared pool).
- Enemies still target only the controlled member (no spread aggro).
- Allies have no HP bar / death / revive yet.
