# Mesures sur PS1 japonaise — source de vérité pour les dégâts

> **Tier 0.** Ces valeurs sont **relevées manuellement sur la version japonaise du jeu PS1**, pas
> lues sur un wiki. Elles priment sur toutes les autres sources en cas de conflit.
>
> Les deux wikis communautaires documentent la version **US/PAL**. Or ce projet prend les stats
> **JP** dès qu'elles existent. Là où un wiki et une mesure divergent, **c'est la mesure qui gagne**
> — ne « corrige » pas nos valeurs vers le wiki sans avoir remesuré.

Les cas correspondants sont figés dans [`src/combat/ps1jp.test.ts`](../../src/combat/ps1jp.test.ts).

## Méthode

Dart seul, équipement de départ (Broad Sword, Bandana, Leather Armor, bottes de cuir, bracelet).
Les stats sont relevées sur l'écran de statut en jeu, colonne **Total** (corps + équipement) —
jamais la colonne Body seule, que les formules n'utilisent pas.

| état | AT | DF | MAT | MDF |
| ---- | -- | -- | --- | --- |
| Dart LV1 | 4 | 6 | 6 | 6 |
| Dart LV3 | 8 | 9 | 10 | 9 |

## Mesures

| # | situation | mesuré | notre moteur |
| - | --------- | ------ | ------------ |
| 1 | Dart LV1, attaque normale | 3 | 3 ✅ |
| 2 | Dart LV1, Double Slash complet | 5 | 5 ✅ |
| 3 | Dart LV1 encaisse un Throw Dagger (Knight of Sandora) | 1 | 1 ✅ |
| 4 | Dart LV3 encaisse le Pellet d'un Trent | 5 | 5 ✅ |
| 5 | idem, en gardant | 2 | 2 ✅ |
| 6 | Dart LV3 encaisse le Spark Net d'un Hellena Warden | 8 | 8 ✅ (mob pas encore implémenté) |
| 7 | Dart LV1 encaisse le Burn Out du Commander, avant Power Up | 4 | 7 ❌ |
| 8 | idem, après Power Up | 6 | 9 ❌ |
| 9 | Dart LV1 lance un Burn Out (sans QTE) sur un Knight | 1 | 2 ❌ |
| 10 | idem sur le Commander | 4 | 3 ❌ |

## Ce que les mesures ont établi

**Les formules physiques sont exactes.** Mesures 1 à 3 : l'attaque de base, la chaîne d'Addition
complète (pourcentages de coups, multiplicateur de niveau, floors imbriqués) et l'attaque physique
ennemie avec multiplicateur fractionnaire tombent toutes au chiffre près. La garde à ×0,5 est
confirmée (mesure 5).

**Le multiplicateur magique des mobs ordinaires vaut 1, pas 1,5.** Les deux wikis donnent `1.5×`
pour le Pellet du Trent et le Spark Net du Warden — valeur **US/PAL**. Elle est arithmétiquement
impossible en JP : une attaque magique ennemie à ×1,5 part d'une base entière, donc ne peut produire
que `0, 1, 3, 4, 6, 7, 9, 10, 12…`. **5 et 8 sont hors d'atteinte**, quel que soit le MAT et quelle
que soit la variante d'arrondi. Avec `×1` en revanche, tout tombe juste et sur des entiers :

- Trent : `floor(3² × 5 / 9)` = 5 → **MAT 3** (le wiki US dit 2 ; c'est la valeur JP qu'on avait
  extrapolée qui est bonne) ;
- Hellena Warden : `floor(4² × 5 / 9)` = 8 → **MAT 4** (le wiki dit 3, le fandom 4 — c'est le
  fandom qui reflète le JP).

Deux déductions faites **avant** les mesures, confirmées par elles.

## Ce qui reste ouvert

**Le Commander (mesures 7 à 10).** Il a bien un multiplicateur qui varie — 4 puis 6 de part et
d'autre du Power Up. Mais aucune combinaison de la formule documentée et de stats entières ne
reproduit les deux valeurs. Six structures de formule ont été essayées (base tronquée, base
arrondie, multiplicateur avant la division, floor unique en fin de chaîne, MAT non élevé au carré) :
aucune ne passe.

Les mesures 9 et 10 ajoutent que ses MDF et ceux du Knight sont eux aussi douteux — l'objet Burn Out
lancé par Dart fait *plus* de dégâts au boss et *moins* au sbire que nos chiffres ne le prévoient,
donc les erreurs vont en sens opposés et aucun facteur global ne les explique.

**Pour débloquer** : mesurer **le même sort contre un MDF différent** (le Commander contre un Dart
d'un autre niveau). Deux points sur une même courbe donnent la structure ; un point isolé par ennemi
ne fait qu'ajouter des inconnues.

## Valeurs non vérifiées à ce jour

- Le `1,5×` du Trunk Slap (physique) du Trent — jamais mesuré, laissé tel quel.
- Les MDF JP du Trent (on a 120, le wiki US dit 40) et du Knight of Sandora (on a 50).
- Les multiplicateurs physiques des mobs de Forest autres que ceux mesurés.
