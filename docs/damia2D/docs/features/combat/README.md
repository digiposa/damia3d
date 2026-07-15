# Combat

> Documentation de la feature **Combat** : système de combat temps réel iso de Damia, adapté du tour-par-tour TLoD PS1.
> Couvre auto-attack, defense, additions, formules de dégâts, AI mobs, death/level-up.
>
> **Note d'état** : le système combat est largement implémenté côté code et **fonctionne en jeu**. Cette doc capture la réalité actuelle (canon TLoD + impl Damia + décisions prises), pas une cible future.

## Hors-scope de cette section (couvert ailleurs)

| Aspect                                                      | Doc                                           |
| ----------------------------------------------------------- | --------------------------------------------- |
| Combat en forme Dragoon (auto-attack splash, magie Dragoon) | [`dragoons/`](../dragoons/README.md)          |
| Sorts non-Dragoon, MP, items magic                          | [`magic-system/`](../magic-system/) (à venir) |
| Vagues Survival, spawn rules                                | [`survival/`](../survival/) (à venir)         |
| Random encounters Story                                     | [`locations/`](../locations/) (à venir)       |
| Pickup items, inventaire                                    | [`items/`](../items/) (à venir)               |

## Aspects de la feature (création paresseuse)

| Aspect             | Fichier                                    | Statut                     | Description                                                                    |
| ------------------ | ------------------------------------------ | -------------------------- | ------------------------------------------------------------------------------ |
| Formules de dégâts | [`damage-formula.md`](./damage-formula.md) | 🟡 draft                   | Formules TLoD-canon (physical, addition, item magic)                           |
| Elements           | [`elements.md`](./elements.md)             | 🟡 draft                   | Système élémental (8 éléments, Field/Element)                                  |
| Auto-attack        | `basic-attack.md`                          | ⚪ pas encore créé         | Click-to-attack, range, swing, cooldown                                        |
| Defense / guard    | `defense.md`                               | ⚪ pas encore créé         | Touche S, lock-in 3s, CD 10s, heal 10% HP                                      |
| Additions          | [`additions.md`](./additions.md)           | 🟡 draft                   | 28 combos sur 6 archetypes, levels 1-5, SP gains, counters, Wargod accessories |
| Cooldowns          | `cooldowns.md`                             | ⚪ pas encore créé         | AttackCooldown, SkillCooldown                                                  |
| Mob AI             | `mob-ai.md`                                | ⚪ pas encore créé         | Per-behavior (mouse flee, cock hit-run, standard)                              |
| Death & level-up   | `death-and-xp.md`                          | ⚪ pas encore créé         | Death pipeline, XP awards, level-up effects                                    |
| Damage modifiers   | `damage-modifiers.md`                      | ⚪ pas encore créé         | Guard, Fear, Power, Element, Field, Destroyer Mace                             |
| Status effects     | `status-effects.md`                        | ⚪ pas encore créé (futur) | Burn, poison, stun (canon TLoD, non wiré)                                      |

Légende : ⚪ pas encore créé — 🟡 draft — 🟢 validé — 🔵 implémenté

## Convention par fichier d'aspect

Chaque fichier suit la structure standard `features/` :

```markdown
# {Aspect}

## Canon PS1

{description fidèle au jeu d'origine}

## Vision Damia

{notre approche d'implémentation}

## Décisions & rationale

{tradeoffs, exceptions à la fidélité TLoD}

## Spec technique

{formules, paramètres, flags}

## Liens code

{src/path/file.ts:line}

## Questions ouvertes
```

## Patterns transverses

> Étoffé au fil des aspects documentés.

### Architecture ECS

Combat = data dans des **components** (Health, Stats, CombatIntent, Defending, AttackCooldown, AttackSwing, Addition, Dying, AI, Faction, Progression) + logique dans des **systems** (CombatSystem, AutoAttackSystem, DefenseSystem, AdditionSystem, CooldownSystem, AISystem, DeathSystem, DyingSystem, AttackSwingSystem).

Ordre d'exécution des systems (extrait de `src/engine/gameplay/GameplayController.ts`) :

```
CooldownSystem
→ AISystem
→ AutoAttackSystem  (aggro avant Combat)
→ CombatSystem  (chase + attack)
→ PathfindingSystem → MovementSystem
→ ProjectileSystem
→ DefenseSystem
→ DragoonSystem  (avant Death pour ne pas garder boosts)
→ DeathSystem → DyingSystem
→ AdditionSystem  (anim combos)
→ SpellSystem
→ AttackSwingSystem  (avant Render pour offset visuel)
→ RenderSystem
→ FloatingTextSystem
```

### Formules TLoD-canon (référence rapide)

| Source            | Formule                                                              |
| ----------------- | -------------------------------------------------------------------- |
| Physical (player) | `round[AT × (LV + 5) × 5 / DF]`                                      |
| Physical (enemy)  | `floor[AT² × 5 / DF]`                                                |
| Addition per-hit  | `round[floor[floor[hitValue × Mul/100] × AT/100] × (LV+5) × 5 / DF]` |
| Item Magic        | `floor[(LV+5) × MAT × 5 / MDF] × BID/100`                            |

Implémentation : `src/gameplay/damage.ts`

### Modifiers (wrapper appliqué au calcul de base)

- `guard: 0.5` — Defending actif → divise dégâts par 2
- `fear`, `power`, `element`, `field`, `destroyerMace` — infrastructure prête, **non wirées** (status effects futur)
