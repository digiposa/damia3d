# Elements

> Système élémental TLoD — gouverne les modifiers `Field` et `Element` du wrapper de dégâts ([`damage-formula.md`](./damage-formula.md)).
>
> **Sources canon** (par tier de fiabilité, cf. [hiérarchie](../README.md#hiérarchie-de-fiabilité-des-sources-canon-tlod)) :
>
> - 🥇 [`_sources/wulves-tlod-damage-formulas.md`](./_sources/wulves-tlod-damage-formulas.md) — Wulves (Discord), formules numériques exactes
> - 🥇 [`_sources/discord-tlod-clarifications.md`](./_sources/discord-tlod-clarifications.md) — Discord communauté (DrewUniverse, Icarus), corrections aux sources
> - 🥈 [`_sources/lod-wiki-element.md`](./_sources/lod-wiki-element.md) — legendofdragoon.org wiki, source la plus exhaustive sur le système élémental
> - 🥉 [`_sources/fandom-tlod-elements.md`](./_sources/fandom-tlod-elements.md) — fandom (plusieurs claims démentis, listing enemies utile)

## Statut

🟡 **draft** — système canon complètement documenté (wiki LoD a tout clarifié). **Pas câblé en code** : modifiers `Field` et `Element` ont un slot dans `DamageModifiers` mais aucun système ne les active. Aucun champ `element` sur les composants.

## Canon PS1

### Les 8 éléments

TLoD a **8 éléments**. Chaque combattant et chaque attaque magique possède **un élément prédéterminé qui ne change jamais**. Certaines armes permettent aussi aux party members d'imbuer leurs attaques physiques d'un élément.

| #   | Élément           | Visuel (couleur UI in-game)                                    |
| --- | ----------------- | -------------------------------------------------------------- |
| 1   | **Fire**          | rouge / orange                                                 |
| 2   | **Water**         | bleu                                                           |
| 3   | **Wind**          | vert                                                           |
| 4   | **Earth**         | jaune / brun                                                   |
| 5   | **Light**         | blanc / or                                                     |
| 6   | **Darkness**      | violet sombre / noir                                           |
| 7   | **Thunder**       | "magenta" officiel, en fait violet (HSL ~273, cf. wiki trivia) |
| 8   | **Non-Elemental** | gris                                                           |

> Détails exacts des couleurs RGB → cf. graphique `Element Colors.webp` du wiki LoD (à intégrer pour mapping UI Damia).

L'élément d'un combattant est révélé in-game par **la couleur du window-frame de son nom** quand sélectionné. C'est l'identification visuelle canon.

### Relations opposées

Avec l'exception de **Thunder** et **Non-Elemental** (qui n'ont aucun opposite), les éléments forment 3 paires opposées :

- **Fire ↔ Water**
- **Wind ↔ Earth**
- **Light ↔ Darkness**

### Variable multipliers — damage

Confirmé par **wiki LoD 🥈 + Wulves 🥇** (la divergence ×2 du fandom est définitivement écartée) :

| Situation                                       | Multiplier | Concerné                                                       |
| ----------------------------------------------- | ---------- | -------------------------------------------------------------- |
| Attack vs target **opposite element**           | **×1.5**   | Tous (sauf Thunder & Non-Elemental qui n'ont pas d'opposite)   |
| Attack vs target **same element**               | **×0.5**   | Tous **sauf Non-Elemental** (qui ne se résiste pas à lui-même) |
| Attack vs target **neither match nor opposite** | ×1         | Default                                                        |

**Point clé Non-Elemental** : il ne résiste **pas** à lui-même (×1 en same-element, pas ×0.5). C'est l'exception. Pas de "×2 vs tous" — c'est un mythe fandom débunké.

### Special Command — Element Field (canon TLoD)

Mécanique canon précise (source wiki LoD) :

- La commande **"Special"** en combat permet aux 3 membres actifs du party de se transformer simultanément en Dragoon.
- **Le Dragoon initiateur de la transformation** établit un **Element Field** correspondant à **son** élément.
- Le field reste actif **tant que l'initiateur reste transformé**.

Effet mécanique du field = un **modifier supplémentaire** dans la formule (= Field modifier de Wulves) :

| Situation                         | Multiplier                                                      |
| --------------------------------- | --------------------------------------------------------------- |
| Attack matches field element      | **×1.5**                                                        |
| Attack opposite to field element  | **×0.5**                                                        |
| Attack neither match nor opposite | ×1                                                              |
| Same-element exception            | Non-Elemental field ne donne pas ×1.5 sur Non-Elemental attacks |

**⚠️ Bidirectionnel** — le field s'applique aux abilities **alliés ET ennemis** :

- Exemple wiki : Meru's Water field actif → enemy's Spear Frost (Water) **GAGNE** un boost ×1.5 sur le party. Le field amplifie **toutes** les attaques de son élément, peu importe qui les lance.
- Exemple wiki : ally cast Spinning Gale (Wind) pendant Kongol's Earth field actif → dégâts **réduits** ×0.5 (Wind opposite Earth).

→ **Le Special n'est pas un buff défensif unilatéral**. C'est un modifier d'environnement qui change la stratégie : choisir l'initiateur dont l'élément maximise tes attaques et minimise celles attendues de l'ennemi.

**Cas spécial — Divine Dragoon** : son Special field applique le ×1.5 **uniquement à ses propres sorts** Divine DG Cannon et Divine DG Ball. Pas aux autres sorts ni attaques même de son élément.

### Sources d'élément d'une attaque

| Type d'attaque                  | Source de l'élément                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Physical Archer Attack          | Élément de l'arme équipée (ou aucun si arme non-élémentale)                                                                                                                                                                                                                                                                                                                                                                                           |
| Physical Addition               | Élément de l'arme équipée                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Dragoon Archer Attack (in form) | Élément du Dragoon                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Dragoon Addition                | Élément du Dragoon                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Dragoon Magic                   | Élément du sort (généralement = élément du Dragoon, exceptions possibles)                                                                                                                                                                                                                                                                                                                                                                             |
| Item Magic                      | Élément de l'item (la plupart sont élémentaux ; Psyche Bomb / Detonate Rock = Non-Elemental)                                                                                                                                                                                                                                                                                                                                                          |
| Enemy Physical                  | **Non-Elemental par défaut**. Le wiki LoD 🥈 (section "Sources of Elemental Damage") liste explicitement les coups élémentaux côté joueur (5 armes) et côté magie (items, dragoon, enemy magical) — **pas** enemy physical. Confirmé user 2026-06-11 : un mob qui tape physique n'a pas d'élément, sauf cas explicité au cas par cas (un esprit de feu dont la morsure EST Fire). Code : `MobDefinition.physicalElement?` opt-in pour les exceptions. |
| Enemy Magic                     | Élément du sort (canon : généralement = élément de l'enemy, exceptions possibles cf. Virages = Light, Last Kraken multi-éléments — fandom)                                                                                                                                                                                                                                                                                                            |

### Armes élémentales physical

| Character       | Arme élémentale | Élément  |
| --------------- | --------------- | -------- |
| Dart            | Heat Blade      | Fire     |
| Lavitz / Albert | Twister Glaive  | Wind     |
| Shana           | Sparkle Arrow   | Light    |
| Rose            | Shadow Cutter   | Darkness |
| Haschel         | Thunder Fist    | Thunder  |
| Kongol          | _(aucune)_      | —        |
| Meru            | _(aucune)_      | —        |

Ces armes infusent les attaques **physical** (Archer Attack + Addition) de leur élément, activant le modifier Element. Sans arme élémentale, le physical reste neutre (modifier Element = ×1).

### Élément du character / Dragoon

| Character                     | Élément Dragoon | Dragoon              |
| ----------------------------- | --------------- | -------------------- |
| Dart                          | Fire            | Red-Eye Dragon       |
| Lavitz / Albert               | Wind            | Jade Dragon          |
| Shana / Miranda               | Light           | White-Silver Dragon  |
| Rose                          | Darkness        | Darkness Dragon      |
| Haschel                       | Thunder         | Violet Dragon        |
| Meru                          | Water           | Blue-Sea Dragon      |
| Kongol                        | Earth           | Gold / Golden Dragon |
| Dart (Divine form, late game) | Non-Elemental\* | Divine Dragoon       |

\* _Selon DrewUniverse, les sorts du Divine Dragon (boss) utilisent les éléments réguliers des sorts (e.g. Burning Wave = Fire). Le statut "Non-Elemental" du Divine Dragoon player-form est nuancé : c'est le tag de la forme, mais les sorts individuels (Divine DG Cannon, Divine DG Ball) sont eux-mêmes les seuls à bénéficier du field Divine._

### Element des enemies

Chaque enemy a un élément. Listing complet (~140 enemies) dans [`_sources/fandom-tlod-elements.md`](./_sources/fandom-tlod-elements.md) (🥉 — à vérifier au cas par cas, le wiki LoD 🥈 a aussi des listings par enemy).

**Pour les mobs déjà présents dans Damia** (`src/data/balance.ts`) :

| Mob (Damia)    | Élément canon (fandom 🥉) | Statut        |
| -------------- | ------------------------- | ------------- |
| Berserk Mouse  | Darkness                  | À vérifier 🥈 |
| Goblin         | Fire                      | À vérifier 🥈 |
| Assassin Cock  | Wind                      | À vérifier 🥈 |
| Trent          | Earth                     | À vérifier 🥈 |
| Fruegel (boss) | ❓ à déterminer           | —             |

## Vision Damia

### À court terme

Le système élémental n'est **pas câblé** côté code aujourd'hui. Décisions à prendre avant câblage :

1. **Data-model `Element`** côté entité — où ?
   - Champ optionnel sur `Stats` (`element?: Element`) ?
   - Composant dédié `Elemental` ?
   - Sur `Character.avatar.archetype` (déjà existant pour les Dragoons) + un nouveau pour les mobs ?
2. **Source de l'élément de l'attaque** — selon le type (voir table "Sources d'élément d'une attaque" plus haut) :
   - Physical → arme équipée
   - Dragoon → archetype
   - Spell / Item → définition statique
3. **Element Field** (Special Battle Command) — comment en Damia (real-time, pas de Battle Command) ?
   - Option A : skip totalement (Field modifier permanent à ×1)
   - Option B : Dragoon form solo = auto-Field correspondant à son élément (simplification : pas besoin de coordonner 3 transforms)
   - Option C : skill / ultimate à activer manuellement
   - Option D : conserver la mécanique 3-transform-simultanée si on a un party-of-3 actif
4. **Couleurs UI** — encoder les 8 couleurs canon pour les UIs (selecteur character, name window, effets visuels)

### Mode Classic vs Modern (Survival)

- **Classic** : respect strict — 8 éléments, ×1.5 / ×0.5, Field bidirectionnel
- **Modern** : potentielles modifications (e.g. crit vs même élément, immunités totales, nouveaux éléments hybrides) — à voir lors du design Survival Modern (cf. [SCOPE §7.2](../../SCOPE.md))

## Décisions & rationale

| Décision                                                               | Pourquoi                                                                                                                                                                |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Suivre **wiki LoD + Wulves** pour les nombres exacts (×1.5 / ×0.5)     | Sources tier 🥈 et 🥇 alignées, fandom (×2) débunké                                                                                                                     |
| Garder 8 éléments (avec Non-Elemental)                                 | Confirmé wiki + user (couleur grise en jeu). Non-Elemental N'EST PAS un 8ᵉ élément spécial avec ×2, c'est juste un élément normal sans opposing et sans self-resistance |
| **Pas** de mécanique "diminution dégâts reçus" séparée pour le Special | Wiki LoD est explicite : seul effet du Special command = Field modifier, bidirectionnel. La "diminution" perçue venait probablement de cette mécanique mal interprétée  |
| Documenter le canon **avant** câbler                                   | Le système est interdépendant (Element + Field + arme + Dragoon-form + items) — design d'abord, code après                                                              |

## Spec technique (proposition)

Pas encore validée. À discuter au moment du câblage.

```ts
// Proposition data-model
export type Element =
  | 'fire'
  | 'water'
  | 'wind'
  | 'earth'
  | 'light'
  | 'darkness'
  | 'thunder'
  | 'non-elemental';

// Opposites table (Thunder & Non-Elemental sans opposite)
const OPPOSITES: Partial<Record<Element, Element>> = {
  fire: 'water',
  water: 'fire',
  wind: 'earth',
  earth: 'wind',
  light: 'darkness',
  darkness: 'light',
  // thunder, non-elemental absent (no opposite)
};

// Element modifier (target vs attack element)
function elementModifier(attackElem: Element, targetElem?: Element): number {
  if (!targetElem) return 1;
  if (OPPOSITES[attackElem] === targetElem) return 1.5; // opposite
  if (attackElem === targetElem && attackElem !== 'non-elemental') return 0.5; // same (sauf NE)
  return 1;
}

// Field modifier (attack vs current Element Field, if any)
function fieldModifier(attackElem: Element, fieldElem?: Element): number {
  if (!fieldElem) return 1;
  if (OPPOSITES[attackElem] === fieldElem) return 0.5; // opposite to field
  if (attackElem === fieldElem && attackElem !== 'non-elemental') return 1.5; // same as field
  return 1;
}

// Couleurs UI (à compléter avec les valeurs exactes du wiki)
const ELEMENT_COLOR: Record<Element, number> = {
  fire: 0xff4422, // approx red
  water: 0x4488ff, // approx blue
  wind: 0x44cc44, // approx green
  earth: 0xddaa44, // approx amber
  light: 0xffffaa, // approx pale yellow
  darkness: 0x553388, // approx deep purple
  thunder: 0xaa55ee, // approx violet (HSL ~273)
  'non-elemental': 0x888888, // gray
};
```

## Liens code

Pas de code encore. Quand câblé, prévoir :

- `src/data/elements.ts` (enum + OPPOSITES + helpers + colors)
- Champ `Stats.element` ou nouveau component `Elemental`
- Extension `damage.ts` `readModifiers` pour incorporer Element et Field
- Items : flag `element` sur weapons / spells / attack items
- État global / scene : tracker du Field actif (si on porte le Special)

## Liens doc

- **Source canon (wiki LoD 🥈)** : [`_sources/lod-wiki-element.md`](./_sources/lod-wiki-element.md)
- **Source canon (Wulves 🥇)** : [`_sources/wulves-tlod-damage-formulas.md`](./_sources/wulves-tlod-damage-formulas.md)
- **Source canon (Discord 🥇)** : [`_sources/discord-tlod-clarifications.md`](./_sources/discord-tlod-clarifications.md)
- **Source fandom (🥉, historique)** : [`_sources/fandom-tlod-elements.md`](./_sources/fandom-tlod-elements.md)
- **Formule de base** : [`damage-formula.md`](./damage-formula.md)
- **Modifiers détaillés** : [`damage-modifiers.md`](./damage-modifiers.md) (à créer)
- **Armes élémentales** : `items/equipment.md` (à créer — Heat Blade, Twister Glaive, etc.)
- **Dragoon par élément** : [`dragoons/README.md`](../dragoons/README.md)
- **Special Battle Command** : à terme dans `dragoons/transformations.md`

## Questions ouvertes

- **Couleurs RGB exactes** des 8 éléments — l'image `Element Colors.webp` du wiki LoD donne les valeurs précises. À récupérer pour mapping UI Damia (ou au pire approximer depuis le wiki).
- **Data-model element côté entité** — Stats.element ? component dédié ? À trancher avant câblage code.
- **Special Battle Command en real-time Damia** — Option A / B / C / D (voir Vision Damia). À trancher avec le design Dragoon form.
- **Tagging élémental des mobs custom Damia** (Fruegel, futurs mobs Damia-exclusive) — décider au cas par cas.
- **Vérifier mob elements canon contre wiki LoD 🥈** plutôt que se baser sur le fandom 🥉 (cf. table mobs Damia).
- **Détails Divine Dragon / Divine Dragoon** — la nuance entre "boss Divine Dragon utilise éléments réguliers de ses sorts" (Drew) et "Divine Dragoon Special field × 1.5 sur Divine DG Cannon/Ball" (wiki) à clarifier. Va dans `dragoons/transformations.md` ou `bosses/Divine Dragon.md` plus tard.
