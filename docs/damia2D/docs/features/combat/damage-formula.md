# Damage formula

> Formules de calcul des dégâts — port fidèle du canon TLoD PS1 ("Necessary Terms" de Wulves), étendu pour notre real-time iso.
>
> **Source canonique** : [`_sources/wulves-tlod-damage-formulas.md`](./_sources/wulves-tlod-damage-formulas.md) (sauvegarde locale du doc Wulves, ex-pastebin).

## Statut

🟡 **draft** — implémenté partiellement, gaps vs canon tracés dans [`TODO.md`](../../TODO.md#damage-formula).

## Canon PS1 — vue d'ensemble

TLoD distingue **plusieurs familles de formules**, chacune avec :

- une **formule de base** (wrapperless)
- un **wrapper de modifiers** appliqué après, en cascade avec `floor` à chaque étape
- une **liste de modifiers inapplicables** propre à la formule

### Familles de formules

| Famille                                      | Wrapperless                                                                                    | Notes                                                                                                                                                                                |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1. Archer Attack** (player)                | `round{AT × (LV+5) × 5 / DF}`                                                                  | Auto-attack player basique                                                                                                                                                           |
| **2. Additions** (player)                    | `round{floor[floor{Σhits × Multiplier/100} × AT/100] × (LV+5) × 5 / DF}`                       | **Sum des hits d'abord**, puis Multiplier (hidden per-level), puis AT, puis (LV+5)×5/DF                                                                                              |
| **3. Item Magic — Multi Items**              | `floor{floor[(LV+5) × MAT × 5 / MDF] × BID/100}` (+ wrapper spécial)                           | Multiplier% mashing entre Element et Target Fear. BID = facteur principal de scaling (e.g. All Target Multi=100, Single Target Multi=150)                                            |
| **4. Item Magic — Powerful / Detonate Rock** | `floor{floor[(LV+5) × MAT × 5 / MDF] × BID/100}`                                               | Wrapper standard. **BID = source du high damage** des items "exotiques" : All Target Powerful=300, Psyche Bomb X=400 (cf. Discord clarif : ce n'est PAS un effet "Non-Elemental ×2") |
| **5. Dragoon Archer Attack**                 | `round{floor[AT × DRGNAT%/100] × (LV+5) × 5 / DF}`                                             | DRGNAT% = multiplier Dragoon (% sur menu status)                                                                                                                                     |
| **6. Dragoon Additions**                     | `round{floor[floor{[0.05·Sᵢ² − 0.05·Sᵢ + 1] × 100 × DRGNAT%/100} × AT/100] × (LV+5) × 5 / DF}` | Sᵢ = Successful Inputs (max 5, **Kongol max 4**)                                                                                                                                     |
| **7. Dragoon Magic**                         | `floor[floor{floor[MAT × DRGNMAT%/100] × (LV+5) × 5 / MDF} × Multiplier/100]`                  | Multiplier par spell — table dans doc Wulves §Dragoon Spell Multipliers                                                                                                              |
| **8. Enemy Physical Attack**                 | `floor[AT² × 5 / DF] × Attack Multiplier`                                                      | **Attack Multiplier** = valeur cachée par ability (e.g. Sword Slash = 1×, certains skills 1.5×)                                                                                      |
| **9. Enemy Magical Attack**                  | `floor[MAT² × 5 / MDF] × Attack Multiplier`                                                    | Idem (e.g. Commander Burn Out = 1.5× Fire)                                                                                                                                           |
| **10. Percentage attacks**                   | Voir détails                                                                                   | Ghost Commander Haunting Bolt = `Current HP / 2`, Rare Monster Basic = `Max HP / 10`                                                                                                 |
| **11. Unique** (bosses)                      | Voir détails                                                                                   | Drake's Wire = `1000 / DF`, Addition Counter, Feyrbrand modifier, Rare Monster Mitigation forcée à 1                                                                                 |
| **12. Status damage**                        | Voir [`status-effects.md`](./status-effects.md) (à créer)                                      | Confusion / Bewitchment = `Attacker Max HP / 5`, Poison = `Target Max HP / 10`                                                                                                       |

### Wrapper de modifiers — ordre canonique standard

```
floor[floor{floor[floor{floor[floor{
  [formula] × Target Fear × Attacker Fear
} × Power] × Field} × Element] × Guard} × Destroyer Mace]
```

7 modifiers en cascade, avec `floor` à chaque étape (accumule la troncature — comportement canon).

### Exception — wrapper Multi Items (mashing)

`Multiplier%` (obtenu via mashing pendant l'animation) s'insère **entre Element et Target Fear**, et l'ordre du wrapper diverge :

```
floor[floor{floor[floor{floor[floor{floor[base] × Attacker Fear} × Power] × Field} × Element] × Multiplier% / 100] × Target Fear
```

### Modifiers individuels — référence rapide

Détails Power/Field/Element variables → [`damage-modifiers.md`](./damage-modifiers.md) (à créer).

| Modifier       | Condition                        | Valeur                                            |
| -------------- | -------------------------------- | ------------------------------------------------- |
| Target Fear    | Cible sous Fear                  | × 2 (sinon 1)                                     |
| Attacker Fear  | Attaquant sous Fear              | × ½ (sinon 1)                                     |
| Power          | Power items / Rose Storm         | `1 + (Attacker Power + Target Power)`             |
| Field          | Élément attaque vs Special Field | `1 + (Attack Element)` si match/opposite, sinon 1 |
| Element        | Élément cible vs élément attaque | `1 + (Target Element)` si match/opposite, sinon 1 |
| Guard          | Cible a Guard en dernière action | × ½ (sinon 1)                                     |
| Destroyer Mace | Haschel équipé, HP cible         | Blue=1 / Yellow=3/2 / Red=2                       |

### Modifiers inapplicables par-formule

**Information critique** issue du doc Wulves — chaque formule ignore certains modifiers même s'ils sont actifs. Le code doit savoir lesquels exclure.

| Famille                           | Modifiers inapplicables                              |
| --------------------------------- | ---------------------------------------------------- |
| Archer Attack                     | Guard, Destroyer Mace                                |
| Archer Attack — Field/Element     | Limited Applicable (requiert arme élémentale)        |
| Additions                         | Guard                                                |
| Additions — Field/Element         | Limited Applicable (arme élémentale)                 |
| Item Magic (Multi & Powerful)     | Guard, Destroyer Mace                                |
| Dragoon Archer Attack             | Attacker Fear, Guard, Destroyer Mace                 |
| Dragoon Archer — Field/Element    | Limited Applicable (arme élémentale)                 |
| Dragoon Additions                 | Attacker Fear, Guard, Destroyer Mace                 |
| Dragoon Additions — Field/Element | Limited Applicable (arme élémentale)                 |
| Dragoon Magic                     | Attacker Fear, Guard, Destroyer Mace                 |
| Enemy Physical                    | Field, Element, Destroyer Mace                       |
| Enemy Magical                     | Destroyer Mace                                       |
| Percentage attacks                | Attacker Fear, Power, Field, Element                 |
| Drake's Wire                      | Attacker Fear, Field, Element, Guard                 |
| Addition Counter                  | Field, Element, Guard, Destroyer Mace                |
| Rare Monster Mitigation           | Target Fear, Power, Field, Element, Guard            |
| Confusion / Bewitchment           | Attacker Fear, Power, Field, Element, Destroyer Mace |
| Poison                            | **TOUS** (aucun modifier ne s'applique)              |

### Sémantique `round{}` canon

TLoD utilise un arrondi entier spécifique : `round{x / y} = floor[(x + y/2) / y]` pour `y > 0`. Voir exemple complet dans [doc Wulves §Necessary Terms](./_sources/wulves-tlod-damage-formulas.md#necessary-terms).

## Vision Damia

Implémentation actuelle dans `src/gameplay/damage.ts` — 3 entry points couvrant **3 des 12 familles canon**. Le reste est tracé dans [TODO.md](../../TODO.md).

### Couverture vs canon

| #   | Famille canon         | État Damia                                                     | Fonction code                                                                                                                                       |
| --- | --------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Archer Attack         | ✅ implémenté                                                  | `computePhysicalDamage` (branche player)                                                                                                            |
| 2   | Additions             | 🟡 implémenté avec divergence (per-hit, voir Décisions)        | `computeAdditionDamage`                                                                                                                             |
| 3   | Item Magic Multi      | 🟡 partiel — formule base OK, mashing Multiplier% pas modélisé | `computeMagicalItemDamage` (avec BID approprié)                                                                                                     |
| 4   | Item Magic Powerful   | ✅ implémenté                                                  | `computeMagicalItemDamage`                                                                                                                          |
| 5   | Dragoon Archer Attack | ❌ pas applicable                                              | En Damia, auto-attack Dragoon = splash AoE cône 120° + drain SP — gameplay distinct, pas un port direct (cf. `dragoons/transformations.md` à créer) |
| 6   | Dragoon Additions     | ❌ pas applicable                                              | Additions désactivées en form Dragoon (VISION §6.3)                                                                                                 |
| 7   | Dragoon Magic         | ⏳ à câbler                                                    | À porter dans `SpellSystem` quand on traite `dragoons/magic.md`                                                                                     |
| 8   | Enemy Physical        | 🟡 implémenté avec gap                                         | `computePhysicalDamage` (branche enemy) — **manque le `Attack Multiplier` par-ability**                                                             |
| 9   | Enemy Magical         | ❌ pas câblé                                                   | À ajouter : `computeEnemyMagicalDamage`                                                                                                             |
| 10  | Percentage attacks    | ❌ pas câblé                                                   | À traiter au cas par cas                                                                                                                            |
| 11  | Unique (bosses)       | ❌ pas câblé                                                   | À traiter dans `bosses/` au fil                                                                                                                     |
| 12  | Status damage         | ❌ pas câblé                                                   | À traiter dans `status-effects.md`                                                                                                                  |

### Wrapper actuel vs canon

- ✅ Ordre du wrapper en code matche le canon standard (`targetFear → attackerFear → power → field → element → guard → destroyerMace`)
- ❌ **Pas de gestion per-formule des modifiers inapplicables** — `applyModifiers` applique guard × 0.5 partout si `Defending` présent, ce qui est faux pour Archer Attack (canon : guard inapplicable). À corriger.
- ❌ **Wrapper spécial Multi Items pas modélisé** (mashing Multiplier% absent — décision UX à prendre).

### Points clés d'implémentation

- **Helpers `effective*`** (`src/gameplay/stats.ts`) : `effectiveAtk(world, id)` = `Stats.atk × DragoonMultiplier.atk`. Multiplier Dragoon appliqué **au read-time**, pas persisté dans `Stats` → robuste aux level-ups / upgrades mid-transformation (VISION §6.2). C'est l'équivalent fonctionnel de `DRGNAT%` du canon (canon utilise un % sur menu status ; nous on stocke un multiplicateur scalaire par archetype × DLV).
- **`LV` lu depuis `Progression.level`** ; default `1` pour entité sans `Progression` (mob, prop) → cohérent canon (mobs n'ont pas de courbe de level).
- **`tlodRound(num, div)`** : reproduit `round{num / div}` du canon = `floor((num + div/2) / div)`.
- **Détection player vs enemy** : `world.hasComponent(attackerId, 'Character')` → bascule auto sur Archer Attack vs Enemy Physical.
- **`MIN_DAMAGE = 1`** appliqué en sortie de wrapper. Canon peut produire 0 ; on plancher à 1 pour UX temps réel.

## Décisions & rationale

| Décision                                                        | Pourquoi                                                                                                                                                                                              |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Plancher MIN_DAMAGE = 1** (vs canon 0 possible)               | UX temps réel : "0 dmg" affiché ressent comme un hit broken                                                                                                                                           |
| **Multiplier Dragoon read-time via `effective*`** (vs persisté) | Robuste aux level-ups / upgrades mid-transform (VISION §6.2)                                                                                                                                          |
| **Modifier wrapper unifié pour toutes formules**                | Réduit duplication. Trade-off : pas de gestion per-formule des inapplicables — **gap à corriger** ([TODO](../../TODO.md))                                                                             |
| **Sum addition per-hit ≠ canon `Σhits × Multiplier`**           | Floor truncation accumule, dégâts ±1 vs perfect canon. **Délibéré** pour UX per-hit damage numbers (chaque hit affiche son nombre flottant). Variance minime acceptée.                                |
| **Dragoon Archer Attack non porté tel quel**                    | Damia a une mécanique distincte (splash AoE cône 120° + drain SP). Le DRGNAT% canon n'est pas un simple multiplicateur de l'Archer Attack chez nous. À formaliser dans `dragoons/transformations.md`. |
| **Multi Items mashing pas modélisé**                            | Pas de QTE en real-time. Décision finale à prendre : Multiplier% constant ? Wontfix ? À trancher avec UX combat.                                                                                      |
| **Attack Multiplier enemy pas modélisé**                        | Pas eu la doc canon avant ; gap identifié post-ingestion Wulves. ([TODO](../../TODO.md))                                                                                                              |

## Spec technique

### API publique (`src/gameplay/damage.ts`)

```ts
computePhysicalDamage(world, attackerId, targetId): number
// Player branch : round{AT × (LV+5) × 5 / DF}
// Enemy branch  : floor{AT² × 5 / DF}   ⚠️ Attack Multiplier manquant

computeAdditionDamage(world, attackerId, targetId, hitValue, multiplier): number
// Per-hit (divergence intentionnelle vs canon sum-first)

computeMagicalItemDamage(world, casterId, targetId, bid): number
// Powerful Items / Detonate Rock — formule de base, sans mashing Multiplier%
```

### Helpers internes

```ts
tlodRound(num, div): number          // (num + div/2) / div, div > 0 → reproduit round{} canon
applyModifiers(raw, m): number       // cascade 7-modifier + floor MIN_DAMAGE
readModifiers(world, targetId): m    // currently only `guard` wired (Defending → 0.5)
levelOf(world, entityId): number     // Progression.level ?? 1
effectiveAtk / Def / MagicAtk / MagicDef (gameplay/stats.ts)
```

### Constantes (`src/data/balance.ts`)

```ts
COMBAT = {
  defendingDamageMul: 0.5, // = canon Guard modifier
  minDamage: 1, // plancher UX (vs canon 0 possible)
};
```

### Modifiers actuellement wirés

| Modifier | Source d'activation en code                 | Valeur |
| -------- | ------------------------------------------- | ------ |
| `guard`  | `world.hasComponent(targetId, 'Defending')` | 0.5    |

Les 6 autres (`targetFear`, `attackerFear`, `power`, `field`, `element`, `destroyerMace`) ont leur slot mais ne sont pas activés (pas de système status / element / equipment encore).

## Liens code

- **Formules** : `src/gameplay/damage.ts` (168 lignes, JSDoc complet)
- **Helpers stats** : `src/gameplay/stats.ts`
- **Constantes** : `src/data/balance.ts:3` (`COMBAT`), `src/data/balance.ts:26` (`PLAYER_BASE`)
- **Stats mobs** : `src/data/balance.ts:66` (`MOBS`)
- **Component `Stats`** : `src/gameplay/components/Stats.ts`
- **Component `Progression`** : `src/gameplay/components/Progression.ts`

## Liens doc

- **Source canon (formules)** : [`_sources/wulves-tlod-damage-formulas.md`](./_sources/wulves-tlod-damage-formulas.md) 🥇
- **Source canon (wiki LoD)** : [`_sources/lod-wiki-element.md`](./_sources/lod-wiki-element.md) 🥈 (Element system)
- **Source canon (Discord)** : [`_sources/discord-tlod-clarifications.md`](./_sources/discord-tlod-clarifications.md) 🥇 (corrections fandom)
- **Source fandom (historique)** : [`_sources/fandom-tlod-elements.md`](./_sources/fandom-tlod-elements.md) 🥉
- **Système élémental** : [`elements.md`](./elements.md) — 8 éléments, Field/Element rules ×1.5/×0.5 (Wulves+wiki confirmés)
- **Modifiers détaillés** : [`damage-modifiers.md`](./damage-modifiers.md) (à créer — Power/Fear/Destroyer Mace variables)
- **Status effects** : [`status-effects.md`](./status-effects.md) (à créer — Confusion/Bewitchment/Poison/Fear)
- **Additions** : [`additions.md`](./additions.md) — Hit Data + Multiplier Data par addition × niveau + counter mechanic + Wargod accessories
- **Dragoon spells** : `dragoons/magic.md` (à créer — Multipliers par spell par archetype)
- **Backlog code** : [`TODO.md`](../../TODO.md#damage-formula)

## Questions ouvertes

- **Mode Survival Modern + crits** — hors canon. Plug dans le wrapper (8ᵉ modifier) ou multiplicateur post-wrapper ? À trancher quand on attaquera Survival Modern.
- **Multi Items mashing UX en real-time** — wontfix ? Multiplier% constant ? Décision design à prendre.
- **Attack Multiplier data-model côté ennemi** — où stocker la valeur par ability ? Composant `EnemyAbility` ? Champ sur la définition de mob ? À voir au moment du wiring.
- **Damia DRGNAT% scalaire vs canon %-on-status-menu** — équivalence fonctionnelle OK, mais si on veut un jour exposer le % au joueur (UI menu status), il faudra mapper le scalaire vers le format canon.
