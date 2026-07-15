# Mobs

> **Minor enemies canon TLoD** — per-mob detailed stats + abilities + encounters + drops + lore.
>
> Cf. [`locations/`](../locations/) pour les listings par zone et `combat/` pour les mécaniques générales (damage formulas, status effects).

## Statut

Catégorie créée. Documentation incrémentale au fil de l'ingestion canon wiki + fandom.

## Vue d'ensemble système canon (vs bosses)

**Pattern canon mobs distincts vs bosses** :

| Aspect                | Bosses                                                                    | Mobs (minor enemies)                                                                            |
| --------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Status Immunity       | **All 8 ✔** (Petrify/Bewitch/Arm Block/Dispirit/Confuse/Fear/Poison/Stun) | **4 ✔ / 4 ✗** : immune Petrify+Bewitch+Arm Block+Dispirit / vulnerable Confuse+Fear+Poison+Stun |
| AI behavior           | Complex "if→then" rules + Retaliate + traits                              | HP-conditional chance-based actions (75%/25% etc.)                                              |
| Counter Opportunities | Often 0 (some have specific Addition counters)                            | Usually 0                                                                                       |
| Escape Rate           | Often 0% (scripted) ou 30% (random)                                       | 30% standard (rare exceptions)                                                                  |
| EXP/Gold drop         | Variable significant (e.g., 800/100 Fire Bird)                            | Variable per mob (e.g., 456/33 Air Combat)                                                      |
| Drop rate items       | Variable (10-100%)                                                        | Typiquement 8% (Repeat Items)                                                                   |

## Pattern AI canon mobs

> **Minor enemies act on their turn based primarily on their current HP. Additional criteria, if any, is annotated on the table. Minor enemies have an equal chance to perform any eligible action unless otherwise indicated.**

→ AI HP-conditional + chance-weighted actions canon.

## Liens transverses

- [`combat/elements.md`](../combat/elements.md) — 8 éléments canon (mob elements)
- [`combat/damage-formula.md`](../combat/damage-formula.md) — formules damage application
- [`combat/status-effects.md`](../combat/status-effects.md) (à créer) — status ailments applicables aux mobs
- [`locations/`](../locations/) — listings par zone (e.g., Evergreen Forest = 5 mobs canon)
- [`bosses/`](../bosses/) — comparaison mob vs boss patterns
- [`items/consumables.md`](../items/consumables.md) (à créer) — Repeat Items dropped 8%
