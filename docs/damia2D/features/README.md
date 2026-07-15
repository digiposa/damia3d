# Features — documentation fonctionnelle

Documentation par thématique de gameplay. Chaque feature couvre :

1. **Canon PS1** — comment ça marche dans _The Legend of Dragoon_ d'origine
2. **Vision Damia** — comment on l'implémente dans notre projet
3. **Décisions & rationale** — tradeoffs, alternatives écartées
4. **Spec technique** — event chains, flags, structures (quand pertinent)
5. **Liens code** — pointeurs vers `src/` une fois implémenté
6. **Questions ouvertes** — ce qui reste à trancher

## Catégories

| Catégorie                                     | Statut      | Description                                           |
| --------------------------------------------- | ----------- | ----------------------------------------------------- |
| [`dragoons/`](./dragoons/README.md)           | 🟡 en cours | Dragoons : obtention, transformation, stats, magic    |
| [`party-members/`](./party-members/README.md) | 🟡 en cours | Profils characters au-delà du Dragoon                 |
| [`bosses/`](./bosses/README.md)               | 🟡 en cours | Encounters bosses (canon + adaptation Damia)          |
| [`mobs/`](./mobs/README.md)                   | 🟡 en cours | Minor enemies canon (stats + AI + drops + encounters) |
| `combat/`                                     | 🟡 en cours | Additions, auto-attack, defense, damage formula, AI   |
| `magic-system/`                               | ⚪ planifié | Sorts non-Dragoon, MP, éléments                       |
| [`items/`](./items/README.md)                 | 🟡 en cours | Équipement (5 slots), consommables, key items         |
| [`locations/`](./locations/README.md)         | 🟡 en cours | Donjons, villes, dungeons spécifiques                 |
| [`world-map/`](./world-map/README.md)         | 🟡 en cours | Endiness continent + Tesfer Realm + géographie master |
| `quests/`                                     | ⚪ planifié | Story beats, side quests                              |

## Convention

- **Création paresseuse** : un fichier par aspect n'est créé qu'au moment où on traite l'aspect. Pas de fichiers vides.
- **Index par catégorie** : chaque sous-dossier a son propre `README.md` listant le statut détaillé.
- **Liens code** : ajoutés au fur et à mesure de l'implémentation, format `src/path/file.ts:line`.

## Hiérarchie de fiabilité des sources canon TLoD

Quand on documente du canon TLoD, **toutes les sources ne se valent pas**. Ordre de fiabilité décroissant :

1. **🥇 Docs Discord communauté** — Wulves, DrewUniverse, Monoxyde, Zychronix, Dedspawn, et al. Testing formel, modders/cadors reconnus. **Source de vérité** pour formules, nombres exacts, mécaniques précises.
2. **🥈 [legendofdragoon.org](https://legendofdragoon.org/)** — wiki interne de la même communauté. Plus rigoureux que fandom mais moins exhaustif.
3. **🥉 [fandom.com](https://legendofdragoon.fandom.com/)** — vue narrative, parfois simplifications voire erreurs. Utile pour **listings et relations** (qui est de quel élément, listing enemies par zone, lore, etc.), **à vérifier** pour les nombres précis et mécaniques exactes.

### Règles

- **En cas de divergence entre sources**, suivre la hiérarchie : Discord > legendofdragoon.org > fandom.
- Quand un doc s'appuie sur une source de tier 2 ou 3 **sans confirmation par tier 1**, **flagger explicitement** dans la section concernée (note visible) + ajouter au [TODO.md](../TODO.md) pour vérification ultérieure.
- Les sauvegardes verbatim des sources vivent dans `_sources/` du dossier de feature concerné, avec mention de leur tier au top du fichier.
