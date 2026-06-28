# Shana — White-Silver Dragoon (class `whiteSilver`)

Bearers sharing this class: **Shana, Miranda**.

- Element: **Light**
- Species: Human · Age 18 · Height 160 cm
- Dragoon Spirit: **Silver Dragon**
- Joins at level 4.

## Base / auxiliary stats (fixed — do not level up)

| SPD | A-Hit | M-Hit | A-AV | M-AV |
|----:|------:|------:|-----:|-----:|
| **65** | 100% | 100% | 0 | 0 |

## Level table (1–60)

✅ Verified identical to our implemented `src/data/shana.ts` (L1 24/2/2/3/3 … L60
6000/104/149/255/254). Not duplicated here.

## Additions

**None.** Shana (and Miranda) have **no Additions** — they attack with a bow. Important:
many enemies that react to being hit by an Addition do **not** react to arrows.
(We already model this: `whiteSilver` has `additions: []` and uses the basic bow attack.)

## Dragoon form

### D'levels

The **SP/attack** column is key for Shana/Miranda: with **no Additions**, the SP they gain
per attack is *entirely* determined by their Dragoon Level — 35 at D'Lv 1 up to 150 at D'Lv 5,
so they re-fill (and re-transform) much faster at high D'Lv. Modelled in
`src/entities/Player.ts` (`SP_PER_BASIC_ATTACK`), awarded on each basic attack.

| D'Level | SP to reach | SP/attack | AT | DF | MAT | MDF |
|--:|--:|--:|--:|--:|--:|--:|
| 1 | — | 35 | 200% | 200% | 150% | 200% |
| 2 | 1,000 | 50 | 205% | 210% | 155% | 210% |
| 3 | 6,000 | 75 | 210% | 220% | 160% | 220% |
| 4 | 12,000 | 100 | 215% | 230% | 165% | 230% |
| 5 | 20,000 | 150 | 220% | 250% | 170% | 250% |

### Dragoon Magic — Silver Dragon DS

Shana's kit is support/healing (no plain D'Attack-style nuke until W Silver Dragon).

| Spell | Mult | Target | Effect | MP | Acquisition |
|---|--:|---|---|--:|---|
| Moon Light | — | Single ally | If HP 0 → revive at 50% HP; else cure all status + restore 100% Max HP | 10 | Initial |
| Star Children | 100 | All enemies | Light-elemental magic damage | 20 | D'level 2 |
| Gates of Heaven | — | All allies | If HP 0 → revive at 50% HP; else cure all status + restore 50% Max HP | 30 | D'level 3 |
| W Silver Dragon | 300 | All enemies + all allies | Light damage to enemies; allies (HP>0, not Petrified) restore 100% Max HP | 80 | D'level 5 |
