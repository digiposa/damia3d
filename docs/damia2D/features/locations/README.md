# Locations

> **Lieux** visités dans le jeu — villes, donjons, paysages narratifs. Pour le **mode Story**, ce sont les zones du monde d'Endiness à reproduire. Pour le **mode Survival**, ces lieux servent de **thèmes / arènes** (un lieu = un set d'assets + ambiance + spawn rules).
>
> Cf. [SCOPE §7](../../SCOPE.md#7-modes-de-jeu) pour la distinction Story / Survival.

## Statut par location

Ordre alphabétique. Découpage canon TLoD (4 discs, monde Endiness complet).

### Disc 1

| Location           | Type                                                  | Statut profil |
| ------------------ | ----------------------------------------------------- | ------------- |
| **Bale**           | Capital                                               | 🟡 draft      |
| Black Castle       | Castle/Boss                                           | ⚪ à spec     |
| Forest of Seles    | Village + forest                                      | ⚪ à spec     |
| Hellena Prison     | Prison                                                | ⚪ à spec     |
| Hoax               | Fortress                                              | ⚪ à spec     |
| **Kazas**          | Capital Sandora + Black Castle                        | 🟡 draft      |
| Limestone Cave     | Cave                                                  | ⚪ à spec     |
| Lohan              | City                                                  | ⚪ à spec     |
| Marshlands         | Wilderness                                            | ⚪ à spec     |
| **Nest of Dragon** | **Dungeon (Greham+Feyrbrand bosses, Jade DS unlock)** | 🟡 draft      |
| Prairie            | Wilderness                                            | ⚪ à spec     |
| Seles              | Village                                               | ⚪ à spec     |
| Shrine of Shirley  | Sacred ruin                                           | ⚪ à spec     |
| Volcano Villude    | Volcano                                               | ⚪ à spec     |

### Disc 2

| Location                  | Type                                       | Statut profil |
| ------------------------- | ------------------------------------------ | ------------- |
| Barrens                   | Wilderness                                 | ⚪ à spec     |
| **Donau**                 | **Flower City (peaceful, 0 chests canon)** | 🟡 draft      |
| Home of Gigantos          | Settlement                                 | ⚪ à spec     |
| Kashua Glacier            | Glacier                                    | ⚪ à spec     |
| Mountain of Mortal Dragon | Dungeon                                    | ⚪ à spec     |
| Phantom Ship              | Ship                                       | ⚪ à spec     |
| Queen Fury                | Ship                                       | ⚪ à spec     |
| Snowfield                 | Wilderness                                 | ⚪ à spec     |
| Undersea Cavern           | Dungeon                                    | ⚪ à spec     |

### Disc 3

| Location                    | Type                                      | Statut profil |
| --------------------------- | ----------------------------------------- | ------------- |
| **Deningrad**               | **Capital Mille Seseau + Crystal Palace** | 🟡 draft      |
| Evergreen Forest            | Forest                                    | ⚪ à spec     |
| Forbidden Land              | Wilderness                                | ⚪ à spec     |
| Tower of Flanvel            | Tower                                     | ⚪ à spec     |
| Valley of Corrupted Gravity | Dungeon                                   | ⚪ à spec     |
| Zenebatos                   | Wingly city                               | ⚪ à spec     |

> Disc 3/4 boundary clarif : Aglis = Disc 4 confirmé par fandom + arc narratif "Chapter 4: Moon and Fate". Séquence canonique Rouge→Aglis→Zenebatos est bien Disc 4.

### Disc 4

| Location               | Type                                          | Statut profil |
| ---------------------- | --------------------------------------------- | ------------- |
| **Aglis**              | Wingly dungeon (underwater)                   | 🟡 draft      |
| **Death Frontier**     | **Desert + tunnels (ex-Gloriano)**            | 🟡 draft      |
| **Divine Tree**        | **Sacred Tree of Soa (108 fruits = species)** | 🟡 draft      |
| Mayfil                 | Underworld                                    | ⚪ à spec     |
| Moon (That Never Sets) | Final dungeon                                 | ⚪ à spec     |
| Rouge                  | (location adjacente Aglis)                    | ⚪ à spec     |
| Vellweb                | Ruined city                                   | ⚪ à spec     |

Légende : ⚪ à spec — 🟡 draft — 🟢 validé — 🔵 implémenté

> Liste à compléter / ajuster au fil des pages canon ingérées. Certaines locations sont des sous-zones, d'autres sont des "world map nodes" — distinction à clarifier quand on attaquera la `world map` globale.

## Convention par fichier location

Chaque fichier suit :

```markdown
# {Location}

## Profil

{type, région, ambiance, voisinage canon}

## Story / lore

{event narratifs, NPCs, key beats}

## Services

{save points, hôtel, clinic, shops}

## Collectibles

{goods, stardust, treasure chests}

## Combat

{minor enemies, bosses, encounter rate}

## Maps / submaps

{topology, room list}

## Vision Damia

{adaptation iso, niveau de détail, spawn rules Survival si pertinent}

## Liens code & doc

{src/scenes/..., cross-refs party-members/bosses/items}

## Questions ouvertes
```

## Liens transverses

- [`party-members/`](../party-members/) — NPCs rencontrés (Albert à Bale, etc.)
- [`bosses/`](../bosses/) (à créer) — bosses présents par location
- [`items/`](../items/) (à créer) — shops par location, drops par enemy
- [`quests/`](../quests/) (à créer) — story beats par location
- `world-map/` (à créer ?) — navigation globale Endiness
