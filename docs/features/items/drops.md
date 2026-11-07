# Butin des ennemis (drops)

Ce que chaque ennemi peut laisser en tombant : **une tentative par entrée**, au taux PS1. Source :
les tables de nos fiches de lieux ([Seles](../../damia2D/features/locations/Seles.md),
[Forest](../../damia2D/features/locations/Forest.md),
[Hellena Prison](../../damia2D/features/locations/Hellena%20Prison.md)), recoupées avec le wiki LoD.
Code : `drops` de chaque `EnemyDef` (`src/data/enemies.ts`), tirage et résolution dans
`src/data/drops.ts` (test : `drops.test.ts`).

| Ennemi | Drop | Taux | Note |
|---|---|---|---|
| Knight of Sandora (Seles) | Healing Potion | 100 % | |
| Commander (Seles, boss) | Burn Out | 100 % | Fandom ajoute 2 Healing Potion ; on suit le wiki |
| Berserk Mouse | Healing Potion | 10 % | |
| Assassin Cock | Healing Potion | 10 % | |
| Trent | Pellet | 10 % | |
| Goblin | Detonate Rock | 10 % | |
| Fruegel (1re visite, boss) | Knight Shield | 100 % | équipement |
| Fruegel (2e visite, boss) | Gravity Grabber | 100 % | |
| Hellena Warden (1re visite) | — | | wiki : Nothing |
| Hellena Warden (avec Fruegel) | Healing Potion | 100 % | wiki ; c'est l'unité dont Fandom attribue la potion à « la » Hellena Warden |
| Hellena Warden (2e visite) | Morning Star | 2 % | équipement (arme de Meru) |
| Senior Warden (avec Fruegel) | Healing Potion | 100 % | wiki |

## Rendu (choix Damia)

Sur PS1 les drops s'affichent à l'écran de fin de combat. Ici, l'objet **tombe au sol** : il jaillit
du corps, puis attend sous forme de petite gemme tournante, sur un anneau et sous une colonne de
lumière, dans la couleur de ce qu'il est (vert soin, couleur de l'élément pour un objet d'attaque,
or pour un équipement). Il se ramasse en marchant dessus (« + Healing Potion ») et rejoint le stock
commun du groupe, ou la réserve d'équipement.
