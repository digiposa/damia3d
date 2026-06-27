# Rose — Darkness Dragoon (class `darkness`)

Bearers sharing this class: **Rose**.

- Element: **Darkness**
- Species: Human · Appears 26 (actual ~11,000+) · Height 170 cm
- Dragoon Spirit: **Dark Dragon**
- Joins at level 8.

## Base / auxiliary stats (fixed — do not level up)

| SPD | A-Hit | M-Hit | A-AV | M-AV |
|----:|------:|------:|-----:|-----:|
| **55** | 100% | 100% | 0 | 0 |

## Level table (1–60)

✅ Verified identical to our implemented `src/data/rose.ts` (L1 21/3/5/6/5 … L60
5250/142/142/150/150). Not duplicated here.

## Additions

| Name | Inputs | Dmg% (maxed) | SP (maxed) | Acquisition |
|---|--:|--:|--:|---|
| Whip Smack | 1 | 200% | 35 | Initial |
| More & More | 2 | 150% | 102 | Level 14 |
| Hard Blade | 5 | 300% | 35 | Level 19 |
| Demon's Dance | 7 | 500% | 100 | Perform all prior additions 80× |

## Dragoon form

### D'levels

| D'Level | SP to reach | AT | DF | MAT | MDF |
|--:|--:|--:|--:|--:|--:|
| 1 | — | 150% | 200% | 150% | 200% |
| 2 | 1,200 | 155% | 210% | 155% | 210% |
| 3 | 6,000 | 160% | 220% | 160% | 220% |
| 4 | 12,000 | 165% | 230% | 165% | 230% |
| 5 | 20,000 | 170% | 250% | 170% | 250% |

### Dragoon Magic — Dark Dragon DS

| Spell | Mult | Target | Effect | MP | Acquisition |
|---|--:|---|---|--:|---|
| Astral Drain | 200 | Single enemy + all allies | Darkness damage; living/non-Petrified allies heal floor(damage / #living allies) HP | 10 | Initial |
| Death Dimension | 100 | All enemies | Darkness damage + 100% chance to inflict Fear | 20 | D'level 2 |
| Demon's Gate | — | All enemies | 100% chance to inflict Instant Death | 30 | D'level 3 |
| Dark Dragon | 400 | Single enemy | Darkness damage | 80 | D'level 5 |
