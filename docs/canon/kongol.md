# Kongol — Golden Dragoon (class `golden`)

Bearers sharing this class: **Kongol** (and the ancient Earth/Golden Dragoon **Belzac** in
our roster).

- Element: **Earth**
- Species: **Giganto** · Age 37 · Height 250 cm
- Dragoon Spirit: **Golden Dragon**
- Joins at level 19.

## Base / auxiliary stats (fixed — do not level up)

| SPD | A-Hit | M-Hit | A-AV | M-AV |
|----:|------:|------:|-----:|-----:|
| **30** | 100% | 100% | 0 | 0 |

(Slowest in the party — heavy hitter.)

## Level table (1–60)

✅ Verified identical to our implemented `src/data/kongol.ts` (L1 45/4/4/2/3 … L60
9750/254/254/75/80). Not duplicated here.

## Additions (only 3)

| Name | Inputs | Dmg% (maxed) | SP (maxed) | Acquisition |
|---|--:|--:|--:|---|
| Pursuit | 1 | 150% | 50 | Initial |
| Inferno | 3 | 200% | 20 | Level 23 |
| Bone Crush | 5 | 300% | 100 | Perform all prior additions 80× |

## Dragoon form

### D'levels

| D'Level | SP to reach | AT | DF | MAT | MDF |
|--:|--:|--:|--:|--:|--:|
| 1 | — | 150% | 200% | 200% | 200% |
| 2 | 1,000 | 155% | 210% | 205% | 210% |
| 3 | 6,000 | 160% | 220% | 210% | 220% |
| 4 | 12,000 | 165% | 230% | 215% | 230% |
| 5 | 20,000 | 170% | 250% | 220% | 250% |

### Dragoon Magic — Gold Dragon DS (all AoE Earth; note: no D'level-2 spell)

| Spell | Mult | Target | Effect | MP | Acquisition |
|---|--:|---|---|--:|---|
| Grand Stream | 150 | All enemies | Earth damage | 20 | Initial |
| Meteor Strike | 200 | All enemies | Earth damage | 20 | D'level 3 |
| Golden Dragon | 300 | All enemies | Earth damage | 80 | D'level 5 |

## Boss encounters (enemy data — bonus, for later)

Kongol is also fought as a boss twice. Status immunity (both): Petrify, Bewitch, Arm Block,
Dispirit, Confuse, Fear, Poison, Stun. Addition Counter: 0.5× physical to attacker on an
imperfect Addition.

**Hoax** — HP 256 · AT 10 · DF 100 · SPD 60 · MAT 10 · MDF 50 · EXP 300 · Gold 50 · drop
Power Wrist (100%). Abilities (community names): Axe Slash (1×), Lariat (1.5×), Double Combo
(2×, centre+right); "Need no Weapon" (self, at HP<70%) swaps Axe Slash for Lariat/Double Combo.

**Black Castle** — HP 1,000 · AT 32 · DF 140 · SPD 50 · MAT 21 · MDF 80 · EXP 2,000 · Gold
200 · drop Wargod Calling (30%). Also has Retaliate (chance to act off-turn on a physical
hit) and Magic Barrier (negates the next Dragoon spell targeting him).
