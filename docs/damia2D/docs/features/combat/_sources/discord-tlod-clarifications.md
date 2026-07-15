# Discord TLoD Community — Clarifications

> **Source** : Discord #legend-of-dragoon (serveur LoD communauté)
> **Fiabilité** : 🥇 **tier 1** (cf. [hiérarchie sources](../../README.md#hiérarchie-de-fiabilité-des-sources-canon-tlod)) — cadors / modders communauté (DrewUniverse, Icarus, NovaDragoon, et al.)
> **Usage** : confirmations et corrections aux sources écrites (notamment fandom 🥉) quand elles sont ambiguës ou divergentes.
>
> **Format** : entrées datées, citations verbatim, contexte de la question + verdict actionnable.

---

## 2026-05-18 — Non-Elemental ×2 vs all (claim fandom debunked)

### Contexte

Suite à l'ingestion de la [page fandom Elements](./fandom-tlod-elements.md), divergence détectée avec Wulves : le fandom prétend que Non-Elemental deal ×2 damage vs all other elements, alors que Wulves n'addresse pas explicitement Non-Elemental dans sa table de modifiers. Junction (auteur Damia) demande clarification.

### Question posée par Junction

> "Hi guys, this line in the fandom is bullshit right? Or perhaps I haven't understood…
>
> **Non-Elemental (Unbased)**
> Non-Elemental, or Unbased, as referred to in some item descriptions, has unique properties. It has no opposite, but deals double damage against characters, monsters and bosses of all other elements[1], yet it does not resist itself. The unique properties of Non-Elemental is the main reason why the magical attacks of the Divine Dragon and the Psychedelic Bomb, among others, are especially devastating."

### Réponses communauté

**Icarus** (17:50) :

> "thats bs lol
> like most other things in fandom
> psy bomb and dd dart just have high damage multipliers"

**NovaDragoon** (17:57) :

> "Doesn't DD dart have the exclusive Divine element too?"

**DrewUniverse** (18:10) — _crédité par Wulves comme contributeur principal de la doc damage formulas_ :

> "Psyche Bomb deals high damage because it has a higher damage multiplier than regular Item Magic. The magic attacks used by Divine Dragon are not 'divine element.' They are their regular element as indicated by the spell - i.e. Burning Wave is Fire element."

### Verdict

| Claim fandom                                                                | Verdict tier 1                                                                                                  |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| "Non-Elemental deals ×2 damage vs all other elements"                       | ❌ **FAUX** — invention/simplification fandom                                                                   |
| "Psyche Bomb is especially devastating because of Non-Elemental properties" | ❌ Faux — c'est juste un **BID élevé** (Psyche Bomb X = 400, le plus haut de la table Wulves)                   |
| "Divine Dragon attacks use a Divine/Non-Elemental special element"          | ❌ Faux — les sorts du Divine Dragon utilisent **l'élément régulier indiqué par le sort** (Burning Wave = Fire) |

### Implications

- **TLoD a bien 8 éléments en jeu** : Fire, Water, Wind, Earth, Light, Darkness, Thunder, **Non-Elemental** (couleur grise en jeu, confirmé user).
- **Non-Elemental** existe comme élément mais **N'A PAS** l'effet "×2 vs tous" prétendu par le fandom. Fonctionnellement, il se comporte comme Thunder : pas d'opposing, donc le modifier Element donne ×1 vs les autres éléments. La résistance à lui-même reste à confirmer (claim fandom dans le même paragraphe BS).
- Le scaling de damage des items "exotiques" (Psyche Bomb, Detonate Rock, etc.) vient **du BID** dans la formule Item Magic (voir [`damage-formula.md`](../damage-formula.md)), pas d'un modifier élémental spécial.
- Les spells du Divine Dragon utilisent l'**élément régulier indiqué par chaque sort** (Burning Wave = Fire, etc.), pas un "élément Divine" exclusif.

### Actions appliquées

- [`elements.md`](../elements.md) : Non-Elemental retiré de la liste des 8 éléments → liste réduite à 7. Section Non-Elemental réécrite comme "descripteur neutre".
- [`fandom-tlod-elements.md`](./fandom-tlod-elements.md) : warning ajouté en tête de la section Non-Elemental pour signaler que le contenu est démenti par tier 1.
- [`damage-formula.md`](../damage-formula.md) : note clarifiant que les items high-damage scalent via BID (pas via un élément spécial).
- [`TODO.md`](../../../TODO.md) : item "Vérifier ×2 Non-Elemental" → marqué **résolu** (BS confirmé).
