# Dart Feld — Red-Eye Dragoon (class `redEye`)

Bearers sharing this class: **Dart, Zieg**.

- Element: **Fire**
- Species: Human · Age 23 · Height 178 cm
- Dragoon Spirit: **Red-Eyed Dragon** (Dart also wields a 2nd: the **Divine Dragon**)
- Note: Dart cannot be removed from the active party (story).

## Base / auxiliary stats (fixed — do not level up)

| SPD | A-Hit | M-Hit | A-AV | M-AV |
|----:|------:|------:|-----:|-----:|
| **50** | 100% | 100% | 0 | 0 |

(A-Hit/M-Hit/A-AV/M-AV are universal; any change comes from equipment.)

## Level table (1–60)

Verified canon — already implemented in `src/data/dart.ts` (HP / AT / DF / MAT / MDF / EXP).
SPD is the fixed 50 above (not in the per-level table).

## Additions

Implemented in `src/data/additions.ts`. Canon values for cross-check:

| Name | Inputs | Dmg% (maxed) | SP (maxed) | Acquisition |
|---|--:|--:|--:|---|
| Double Slash | 1 | 202% | 35 | Initial |
| Volcano | 3 | 250% | 36 | Level 2 |
| Burning Rush | 2 | 150% | 102 | Level 8 |
| Crush Dance | 4 | 250% | 100 | Level 15 |
| Madness Hero | 5 | 100% | 204 | Level 22 |
| Moon Strike | 6 | 350% | 20 | Level 29 |
| Blazing Dynamo | 7 | 450% | 150 | Perform all prior additions 80× |

(Blazing Dynamo's real unlock is "all prior additions ×80"; we currently gate it at Lv 40.)

## Dragoon form

### D'levels (SP thresholds + stat multipliers in Dragoon form)

| D'Level | SP to reach | AT | DF | MAT | MDF |
|--:|--:|--:|--:|--:|--:|
| 1 | — | 150% | 200% | 150% | 200% |
| 2 | 1,200 | 155% | 210% | 155% | 210% |
| 3 | 6,000 | 160% | 220% | 160% | 220% |
| 4 | 12,000 | 165% | 230% | 165% | 230% |
| 5 | 20,000 | 170% | 250% | 170% | 250% |

Divine Dragon DS forces D'level 5 with corrected stats (status menu shows the wrong values):

| D'Level | AT | DF | MAT | MDF |
|--:|--:|--:|--:|--:|
| 5 (Divine) | 340% | 250% | 170% | 250% |

### Dragoon Magic

All Dragoons may use a **D'Attack** or **Magic** while transformed. `Multiplier` is the real
value used in the damage formula (the in-game "STR %" is unreliable and unused).

**Red Dragon DS**

| Spell | Mult | Target | Element | MP | Acquisition |
|---|--:|---|---|--:|---|
| Flame Shot | 200 | Single | Fire | 10 | Initial |
| Explosion | 100 | All | Fire | 20 | D'level 2 |
| Final Burst | 300 | Single | Fire | 30 | D'level 3 |
| Red-Eye Dragon | 300 | All | Fire | 80 | D'level 5 |

**Divine Dragon DS** (Dart only)

| Spell | Mult | Target | Element | MP | Acquisition |
|---|--:|---|---|--:|---|
| Divine DG Ball | 400 | All | Non-Elemental | 50 | Initial |
| Divine DG Cannon | 600 | Single | Non-Elemental | 50 | Initial |
