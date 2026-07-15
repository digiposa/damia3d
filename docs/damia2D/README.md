# Damia 2D — imported docs archive

The full documentation from our earlier **2D Damia** project (`digiposa/damia`), kept here as a
**reference archive** for the 3D project. It's the richest canon/stats source we have; the live 3D
code is verified against the curated subset in [`../features/`](../features/), and this archive is
where that subset is drawn from and extended.

## Layout

- **[`features/`](features/)** — the game-systems reference (stats, mechanics, canon):
  - `combat/` — **the stats core**: `damage-formula.md`, `additions.md`, `elements.md`,
    `experience.md`, `enemies.md`, `monster-categories.md`.
  - `party-members/` — per-character stats & growth (Dart, Lavitz, Albert, Haschel, Kongol, Meru).
  - `dragoons/` — `mechanics.md`, `dragons.md`, `dragon-campaign.md`.
  - `items/` — items, equipment.
  - `mobs/` (~60) & `bosses/` (~33) — individual enemy stat pages (the full canon bestiary).
  - `locations/`, `npcs/`, `quests/`, `world-map/` — lore/world reference.
  - `_assets/` — the original sprite sheets / screenshots the pages link to.
  - `_sources/` — the raw wiki/fandom scrapes the pages were transcribed from.
- **[`project/`](project/)** — the 2D project's planning docs (VISION, SCOPE, ROADMAP, ARCHITECTURE,
  BLUEPRINT, TODO). 2D-specific — kept for reference, not a spec for the 3D build.

## Notes

- This archive is **not built or served** — it lives in the repo only (GitHub Pages serves the Vite
  build, not `docs/`), so it doesn't affect the game's load time.
- File names keep the 2D convention (`Meru.md`, `Knight of Sandora.md`). The curated 3D docs use
  lowercase; that's intentional — this is the untouched source.
- When a system is implemented in 3D, its canon is distilled into [`../features/`](../features/)
  (verified 1:1 against `src/`); reach here for the fuller detail or systems not yet ported.
