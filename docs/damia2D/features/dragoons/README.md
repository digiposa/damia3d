# Dragoons

> Documentation de la feature **Dragoon** : obtention, transformation, stats, magic, additions et lore. Couvre les 8 Dragoons canon de _The Legend of Dragoon_ + adaptations Damia.

## Statut par character

| Character | Élément                             | Disc d'obtention | Statut spec |
| --------- | ----------------------------------- | ---------------- | ----------- |
| Dart      | Red-Eye Dragon (fire)               | Disc 1 (Hoax)    | ⚪ à spec   |
| Lavitz    | Jade Dragon (wind)                  | Disc 1           | ⚪ à spec   |
| Rose      | Dark Dragon                         | Disc 1 (Hoax)    | ⚪ à spec   |
| Shana     | White-Silver Dragon (healing)       | Disc 1           | ⚪ à spec   |
| Albert    | Jade Dragon (wind, héritage Lavitz) | Disc 2           | ⚪ à spec   |
| Haschel   | Violet Dragon (thunder)             | Disc 2           | ⚪ à spec   |
| Meru      | Blue-Sea Dragon (water)             | Disc 2           | ⚪ à spec   |
| Kongol    | Golden Dragon (earth)               | Disc 2           | ⚪ à spec   |
| Miranda   | White-Silver Dragon (relais Shana)  | Disc 3           | ⚪ à spec   |

Légende : ⚪ à spec — 🟡 draft — 🟢 validé — 🔵 implémenté

## Aspects de la feature

Les fichiers ci-dessous sont créés au fil de la couverture (création paresseuse).

| Aspect                                                                   | Fichier                  | Statut                     |
| ------------------------------------------------------------------------ | ------------------------ | -------------------------- |
| **Dragons (créatures)**                                                  | **`dragons.md`**         | **🟡 draft (wiki ingéré)** |
| **Dragon Campaign (war foundational lore)**                              | **`dragon-campaign.md`** | **🟡 draft (wiki ingéré)** |
| **Mechanics (wielders + ranks + SP + DLV + D'Attack + Magic + Special)** | **`mechanics.md`**       | **🟡 draft (wiki ingéré)** |
| Obtention (event chains, conditions, locations)                          | `obtention.md`           | ⚪ pas encore créé         |
| Stats (HP/MP/attaques par Dragoon)                                       | `stats.md`               | ⚪ pas encore créé         |
| Transformations (mécanique, jauge MP, durée)                             | `transformations.md`     | ⚪ pas encore créé         |
| Additions Dragoon (combos)                                               | `additions.md`           | ⚪ pas encore créé         |
| Magic Dragoon (sorts par élément)                                        | `magic.md`               | ⚪ pas encore créé         |
| Progression (DLV, level up)                                              | `progression.md`         | ⚪ pas encore créé         |
| Lore (Dragon Campaign, Winglies, history)                                | `lore.md`                | ⚪ pas encore créé         |

## Patterns transverses

> Cette section centralise les archetypes et conventions réutilisables identifiés au fil des specs. Elle sera étoffée à chaque nouveau Dragoon documenté. Si elle grossit trop, elle migrera vers `_patterns.md` dédié.

### Archetypes d'acquisition Dragoon Spirit

_(à remplir au fil — exemples possibles : `native_pre_existing`, `inherited_from_parent`, `chosen_by_spirit`, etc.)_

### Affinité élémentaire par archetype

Chaque Dragoon a un élément attaché ([cf. `combat/elements.md`](../combat/elements.md)) :

| Archetype                               | Élément                                                                                                         | Character(s) canon                           |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Red-Eye Dragon                          | Fire                                                                                                            | Dart                                         |
| Jade Dragon                             | Wind                                                                                                            | Lavitz, Albert                               |
| White-Silver Dragon                     | Light                                                                                                           | Shana, Miranda, (Shirley)                    |
| Darkness Dragon                         | Darkness                                                                                                        | Rose                                         |
| Violet Dragon                           | Thunder                                                                                                         | Haschel                                      |
| Blue-Sea Dragon                         | Water                                                                                                           | Meru, (Damia)                                |
| Gold Dragon                             | Earth                                                                                                           | Kongol                                       |
| Divine Dragoon (Dart late-game upgrade) | Non-Elemental (tag forme) — son Special field boost uniquement Divine DG Cannon + Divine DG Ball (cf. wiki LoD) | Dart (post-acquisition Divine Dragon Spirit) |
| Divine Dragon (boss antagoniste)        | Sorts utilisent élément régulier de chaque sort (e.g. Burning Wave = Fire, cf. Discord DrewUniverse)            | Boss late game (non playable)                |

L'élément du Dragoon détermine :

- L'élément de ses sorts Dragoon Magic
- L'élément de son auto-attack en form Dragoon (en canon : Dragoon Archer Attack via DRGNAT%)
- L'élément de son arme élémentale (Heat Blade, Twister Glaive, etc. — `items/equipment.md` à créer)
- L'Element Dimension invoquée via Special Battle Command (canon, à voir si porté en Damia)

### DLV thresholds & multipliers (canon — à compléter par archetype)

Source de progression DLV = SP lifetime cumulé (cf. [VISION §6.2](../../VISION.md#62-dlv-dragoon-level--progression)). Données canon par archetype, à compléter au fil :

#### Jade Dragon (Lavitz / Albert)

Source : [`../party-members/Albert.md`](../party-members/Albert.md#dlv-thresholds--multipliers-canon).

| DLV | SP lifetime threshold | AT bonus | DF bonus | MAT bonus | MDF bonus |
| --- | --------------------- | -------- | -------- | --------- | --------- |
| 1   | -                     | 150%     | 200%     | 200%      | 200%      |
| 2   | 1,000                 | 155%     | 210%     | 205%      | 210%      |
| 3   | 6,000                 | 160%     | 220%     | 210%      | 220%      |
| 4   | 12,000                | 165%     | 230%     | 215%      | 230%      |
| 5   | 20,000                | 170%     | 250%     | 220%      | 250%      |

#### Red-Eye / White-Silver / Darkness / Violet / Blue-Sea / Gold / Divine Dragon

_(à remplir au fil des pages character ingérées)_

### Flags / état système

_(à remplir — ex : `hasDragoonSpirit.{character}`, `DragoonUnlockState.{element}`)_

### Boss subtypes liés aux events Dragoon

_(à remplir — ex : `trial_judge` pour Shirley, `gatekeeper` pour Drake)_

## Convention par fichier d'aspect

Chaque fichier suit la structure :

```markdown
# {Aspect}

## Canon PS1

{description fidèle au jeu d'origine}

## Vision Damia

{notre approche d'implémentation}

## Décisions & rationale

{tradeoffs}

## Spec technique

{YAML, event chains, flags si pertinent}

## Liens code

{src/... une fois implémenté}

## Questions ouvertes
```
