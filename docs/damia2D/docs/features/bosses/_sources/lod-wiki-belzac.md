# Belzac — legendofdragoon.org wiki

> **Source** : [legendofdragoon.org wiki — Belzac](https://legendofdragoon.org/wiki/Belzac)
> **Fiabilité** : 🥈 **tier 2** (cf. [hiérarchie sources](../../README.md#hiérarchie-de-fiabilité-des-sources-canon-tlod))
> **Sauvegardé le** : 2026-05-18.
> **Usage** : référence pour [`bosses/Belzac.md`](../Belzac.md), cross-refs `locations/Vellweb.md` (à créer), `lore/dragon-campaign.md` (à créer — 7 anciens Dragoons), `party-members/Kongol.md` (héritier Gold Dragoon).

> Page catégorisée wiki : **Bosses**, **Disc 4**, Missing Information.

> Light formatting markdown appliqué. Contenu textuel + tables préservés verbatim.

---

## Information

| Attribut            | Valeur                                 |
| ------------------- | -------------------------------------- |
| Element             | **Earth**                              |
| Counters Additions? | **Yes** (group 28 — all opportunities) |

### Stats

| HP     | AT  | DF  | A-AV |
| ------ | --- | --- | ---- |
| 16,000 | 178 | 200 | 0%   |

| SPD | MAT | MDF | M-AV |
| --- | --- | --- | ---- |
| 50  | 71  | 80  | 0%   |

### Status Immunity

| Petrify | Bewitch | Arm Block | Dispirit |
| ------- | ------- | --------- | -------- |
| ✔       | ✔       | ✔         | ✔        |

| Confuse | Fear | Poison | Stun |
| ------- | ---- | ------ | ---- |
| ✔       | ✔    | ✔      | ✔    |

→ **8 statuts canon visibles** (extension de la liste Bale qui en avait 7) : Fear, Confusion, Bewitchment, Dispiriting, Poison, Stun, Arm-Blocking + **Petrify** (nouveau).

### Yield

| EXP   | Gold | Drops                 |
| ----- | ---- | --------------------- |
| 6,000 | 300  | **Golden Stone 100%** |

### Counterattack Opportunities (group 28 — all)

| User    | Addition           | Button Press  |
| ------- | ------------------ | ------------- |
| Dart    | Volcano            | 2             |
| Dart    | Crush Dance        | 2, 3          |
| Dart    | Moon Strike        | 2, 3          |
| Lavitz  | Rod Typhoon        | 2, 3          |
| Lavitz  | Gust of Wind Dance | 2, 5          |
| Lavitz  | Flower Storm       | 2, 3, 4, 5, 6 |
| Rose    | Hard Blade         | 2             |
| Rose    | Demon's Dance      | 3, 4, 5, 6    |
| Meru    | Cool Boogie        | 2, 3          |
| Meru    | Cat's Cradle       | 3, 4          |
| Meru    | Perky Step         | 2             |
| Haschel | Summon 4 Gods      | 2             |
| Haschel | Hex Hammer         | 2             |
| Albert  | Gust of Wind Dance | 2             |
| Albert  | Flower Storm       | 2             |

## Story

_(Page wiki "Read More" non développée ici. À compléter lors de l'ingestion fandom Belzac ou page Vellweb.)_

## Combat

### Encounters

| Formation (ID) | Location (Submap) | Encounter% | Escape% |
| -------------- | ----------------- | ---------- | ------- |
| Belzac (400)   | Vellweb (502)     | Scripted   | 0%      |

### Traits (passives)

> Bosses often possess passive effects which modify standard battle mechanics. None of these are given official names ; community used approximate names.

| Passive                 | Effect                                                                                                                                                   | Requires                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| **Patterned Retaliate** | Ignore turn order and use **Meteor Strike**. On second use, use **D-attack** instead. On third use, use **Golden Dragon** instead. This pattern repeats. | Chance to trigger when targeted by an attack. |

### Abilities

> Boss behavior often changes from player input as most of them use "if → then" rules. Conditions are criteria that must be met for a Boss to take a particular action. With multiple eligible actions, the Boss selects one at random.
>
> - **Auto** (under Conditions) : the Action will be used on the enemy's next turn if other conditions are met.
> - **Ignore Turn Order** : usually paired with Retaliate, current values determining turn order do not change from this action being taken.

| Action        | Target | Effect                                  | Conditions             |
| ------------- | ------ | --------------------------------------- | ---------------------- |
| D-attack      | Single | Inflicts **1× Physical** damage         | —                      |
| Grand Stream  | Party  | Inflicts **1.5× Earth-elemental magic** | —                      |
| Meteor Strike | Party  | Inflicts **2× Earth-elemental magic**   | Only used by Retaliate |
| Golden Dragon | Party  | Inflicts **3× Earth-elemental magic**   | Only used by Retaliate |

> ⚠️ **Attack Multiplier canon confirmation** : les multipliers 1×, 1.5×, 2×, 3× sont **exactement** les valeurs cachées de "Attack Multiplier" mentionnées dans Wulves doc pour les enemy abilities. Belzac = exemple typique. Cf. [`combat/damage-formula.md`](../../combat/damage-formula.md) §Enemy Physical / Enemy Magical.

> **Note** : Grand Stream, Meteor Strike et Golden Dragon sont les **noms canon des Dragoon Magic spells de Kongol (Gold Dragoon)**. Belzac utilise donc ses propres sorts de Gold Dragoon → **Belzac = Gold Dragoon canon** (un des 7 anciens Dragoons de la Dragon Campaign dont Kongol hérite le Spirit). Cf. lore Dragon Campaign + Kongol profile.

## Trivia

No trivia (per wiki).
