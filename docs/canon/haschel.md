# Haschel — Violet Dragoon (class `thunder`, "Violet")

Bearers sharing this class: **Haschel** (and the ancient Thunder Dragoon **Kanzas**, mapped
to this class in our roster).

- Element: **Thunder**
- Species: Human · Age 70 · Height 163 cm · Rogue-style martial artist
- Dragoon Spirit: **Violet Dragon**
- Joins at level 13.

## Base / auxiliary stats (fixed — do not level up)

| SPD | A-Hit | M-Hit | A-AV | M-AV |
|----:|------:|------:|-----:|-----:|
| **60** | 100% | 100% | 0 | 0 |

(SPD 60 is genuine — distinct from Rose's 55, so it wasn't part of the page's copy-paste error below.)

## Level table (1–60)

> ⚠️ **The wiki page's Stats table for Haschel is corrupted** — it shows **Rose's** table
> (L1 21/3/5/6/5 … L60 5250/142/142/150/150) and even mis-captions the portrait as "Dart
> Feld". So it is **NOT** transcribed here. Our implemented `src/data/haschel.ts` has a
> different (and plausibly correct) table: **L1 27/3/4/2/2 … L60 6750/188/150/148/148**.
> TODO: re-verify Haschel's real level table from a clean source (official guidebook).

## Additions (genuine — martial-arts moves)

| Name | Inputs | Dmg% (maxed) | SP (maxed) | Acquisition |
|---|--:|--:|--:|---|
| Double Punch | 1 | 150% | 50 | Initial |
| Flurry of Styx | 2 | 202% | 20 | Level 14 |
| Summon 4 Gods | 3 | 100% | 100 | Level 18 |
| 5 Ring Shattering | 4 | 300% | 50 | Level 22 |
| Hex Hammer | 6 | 400% | 15 | Level 27 |
| Omni-Sweep | 7 | 501% | 150 | Perform all prior additions 80× |

## Dragoon form

### D'levels

| D'Level | SP to reach | AT | DF | MAT | MDF |
|--:|--:|--:|--:|--:|--:|
| 1 | — | 150% | 200% | 200% | 200% |
| 2 | 1,000 | 155% | 210% | 205% | 210% |
| 3 | 6,000 | 160% | 220% | 210% | 220% |
| 4 | 12,000 | 165% | 230% | 215% | 230% |
| 5 | 20,000 | 170% | 250% | 220% | 250% |

### Dragoon Magic — Violet Dragon DS (all single-target Thunder)

| Spell | Mult | Target | Effect | MP | Acquisition |
|---|--:|---|---|--:|---|
| Atomic Mind | 100 | Single enemy | Thunder damage | 10 | Initial |
| Thunder Kid | 200 | Single enemy | Thunder damage + 100% chance to Stun | 20 | D'level 2 |
| Thunder God | 300 | Single enemy | Thunder damage | 30 | D'level 3 |
| Violet Dragon | 400 | Single enemy | Thunder damage | 80 | D'level 5 |
