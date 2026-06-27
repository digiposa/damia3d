# Canon data (Wiki Project)

Faithful canon reference for each character, transcribed from the **Legend of Dragoon
Wiki Project** (not the Fandom wiki). One file per character; bearers that share a Dragoon
class share these values (e.g. Dart = Zieg for Red-Eye).

Purpose: a single stored source so we don't re-fetch pages. Not all of it is wired into
gameplay yet — much of it (Dragoon forms, spells) feeds the upcoming **Dragoon system
rework** (see `../../DESIGN_NOTES.md`). The base stat tables here are the canon the live
`src/data/*` tables are verified against.

Universal aux stats (every character): **A-Hit 100% · M-Hit 100% · A-AV 0 · M-AV 0**; only
**SPD** differs per character and is **fixed** (does not grow with level — equipment only).
