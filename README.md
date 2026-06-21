# damia3d

Hommage spirituel à *The Legend of Dragoon* — un JRPG **3D isométrique** qui tourne dans le navigateur.

> Projet personnel / d'apprentissage. Les noms, personnages et histoire originaux appartiennent à Sony ; ce dépôt vise à terme des assets et un univers originaux.

## Stack

- **[Babylon.js](https://www.babylonjs.com/)** (rendu 3D, caméra orthographique = vue isométrique)
- **TypeScript** + **[Vite](https://vitejs.dev/)**

## Démarrer

```bash
npm install
npm run dev      # serveur de dev sur http://localhost:5173
npm run build    # build de production dans dist/
npm run preview  # prévisualise le build
npm test         # tests unitaires (Vitest) — ex. formules de dégâts
```

## Menu & système

Au démarrage, un écran-titre permet de **choisir un mode**. En jeu, le bouton
**⚙** (haut-droite), **Échap**, ou le **chip d'Addition** de la barre de stats
ouvre le **menu système** (style écran PS1 de LoD) qui **met le jeu en pause**,
avec des sous-sections :

- **Status** : niveau, EXP, HP/SP/MP, AT/DF/MAT/MDF (stats **effectives**, équipement inclus), Gold
- **Équipement** : 5 emplacements (arme / tête / armure / bottes / accessoire) ; choix par emplacement parmi l'attirail équipable par Dart
- **Addition** : détail et équipement des Additions débloquées
- **Config** : son (placeholder), vitesse de combat, **zoom caméra**, plus
  **Reprendre** et **Menu principal**

Le bouton **⚙** est aussi présent sur l'**écran-titre** : il ouvre alors le menu
**limité à Config** (langue, son, vitesse, zoom) — les onglets Status / Addition
/ Équipement n'apparaissent qu'une fois un mode lancé (ils dépendent de l'état du
personnage). Changer de mode passe **obligatoirement** par le menu principal
(Config → Menu principal).

## Modes de jeu

| Mode | État |
|------|------|
| **Training** | ✅ Arène hack & slash : spawn de Knights of Sandora à la demande |
| **Story** | 🚧 Stub — campagne fidèle au jeu PS1 |
| **Survival** | 🚧 Stub — vagues d'ennemis |

### Contrôles

Jouable à la souris **et** au tactile (mobile / tablette) :

- **Desktop** : **clic au sol** pour se déplacer, **clic sur un ennemi** pour
  l'approcher et l'attaquer (re-cliquer en rythme enchaîne le combo).
- **Mobile / tablette** : **joystick virtuel** (bas-gauche) pour se déplacer ;
  bouton **⚔** (bas-droite) pour attaquer.

La vitesse de **déplacement** n'est jamais affectée par le réglage de vitesse de
combat. Le rendu s'adapte au pixel ratio et aux zones sûres (encoches), et la
mise en page est responsive.

## Combat

**Hack & slash temps réel** (esprit Diablo II) avec des **attaques fidèles à
*The Legend of Dragoon***.

Les formules de dégâts reproduisent exactement celles du jeu PS1
([`src/combat/formula.ts`](src/combat/formula.ts)) : troncatures `floor` à chaque
étape, `round` spécial `(x + y/2) / y`, et les « modifier wrappers » avec leur
imbrication précise (attaque physique de base, Additions, attaques
physiques/magiques ennemies, attaques en pourcentage, dégâts de statut). Couvert
par des tests (`npm test`).

Les **Additions** reprennent le **« timing sight » authentique de LoD**
([`AdditionRunner`](src/combat/AdditionRunner.ts) + [`TimingSight`](src/ui/TimingSight.ts)) :
la commande Attaque déclenche l'Addition (le **Hit 1 est gratuit**), puis un
carré extérieur se referme sur un carré cible — il faut **presser pile à
l'alignement** pour valider chaque hit suivant. Un press trop tôt/tard ou laissé
filer **interrompt** l'Addition. Tout réussir = Addition « parfaite ». Les dégâts
par hit viennent de la formule `additionAttack`, donc la somme égale exactement
l'Addition parfaite. Réussir des inputs accumule des **SP** (jauge Dragoon), et
20 réussites font monter l'Addition d'un niveau (max 5), augmentant son
multiplicateur de dégâts.

> **Double Slash** (initiale de Dart) : 1 press, jamais contrée — Hit 1 auto +
> un seul carré à valider pour le « Double ». Parfait = 150 % × multiplicateur.
>
> **Volcano** (apprise au niveau 2 de Dart) : 3 presses (4 hits), parfait
> 200 %. L'Addition équipée s'affiche dans la barre de stats (chip cliquable) ;
> cliquer ouvre le **menu système** sur l'onglet Addition (en pause) pour en
> équiper une autre — comme dans LoD, on ne change pas d'Addition en pleine
> action.

**Défense (Guard)** : bouton **🛡** (tactile) ou touche **Maj** — Dart se met en
garde ~2 s (immobile), **soigne 10 % des PV max** et **réduit de moitié** les
dégâts reçus (modificateur `guard = 1/2` des formules LoD), avec un **cooldown de
6 s**. Un bouclier translucide l'entoure pendant la garde.

Dans **Training** (arène) : un bouton **🐾** (sous l'engrenage ⚙) ouvre un **menu
de spawn** qui **met le jeu en pause** (comme les Options) ; on y fait apparaître
un **Knight of Sandora** ou le **Commander** (boss). Les ennemis poursuivent Dart
et ripostent (physique ou magie) ; vaincre un ennemi octroie EXP et Gold. Barres
de vie flottantes et nombres de dégâts à l'écran. La **vitesse de combat**
(Options) accélère l'IA, la cadence et les fenêtres de timing — sans toucher au
déplacement.

### Boss : Commander (Seles)

Premier boss, fidèle au wiki : élément **Ténèbres**, alterne **Sword Slash** et
**Burn Out** (magie Feu, formule `enemyMagicalAttack`), **se soigne** de 30 %
sous 51 % de PV, et déclenche **Power Up** (usage unique) une fois ses **Knights
escortes vaincus** — Sword Slash devient **Slash Twice** (2×) et Burn Out passe à
1.5×. Pour voir le Power Up, faites aussi apparaître quelques Knights avant de
les battre. Rendu de boss distinct (plus grand, couronne, barre de vie + nom).

## Langues (i18n)

Le jeu est en **anglais par défaut**, avec une **traduction française**
([`src/core/i18n.ts`](src/core/i18n.ts)). La langue se détecte au démarrage
(localStorage puis langue du navigateur), se change dans **Config → Langue**, et
est persistée. Toute autre langue s'ajoute en complétant un dictionnaire ; les
clés manquantes retombent sur l'anglais.

## Architecture

```
src/
  main.ts              point d'entrée
  core/
    Game.ts            moteur + boucle de rendu + navigation (menu/options/pause)
    GameMode.ts        interface d'un mode
    ModeManager.ts     bascule/efface le mode actif (une Scene isolée par mode)
    Input.ts           état d'entrée (axe virtuel + presses)
    settings.ts        réglages partagés (son, vitesse de combat, zoom)
    menu.ts            types du menu système (GameHost, données de mode)
    i18n.ts            traductions (anglais par défaut + français)
    device.ts          détection tactile
  modes/
    TrainingMode.ts    arène hack & slash jouable
    StoryMode.ts       stub
    SurvivalMode.ts    stub
    StubMode.ts        base des modes non implémentés
  world/
    IsoCamera.ts       caméra orthographique iso qui suit le joueur
    Ground.ts          sol en grille
  combat/
    types.ts           interface Stats (maxHp, at, df, mat, mdf)
    modifiers.ts       modificateurs de dégâts (Fear, Power, Field, Element…)
    formula.ts         formules de dégâts LoD fidèles (floor/round + wrappers)
    AdditionRunner.ts  timing-sight des Additions (Hit 1 auto + presses)
    *.test.ts          tests des formules et du timing (Vitest)
  data/
    dart.ts            table de niveaux de Dart (1→60) + helpers EXP/niveau
    additions.ts       données d'Additions de Dart (hits, multiplicateurs, SP)
    equipment.ts       équipements complets (armures tous persos + armes Dart + 49 accessoires)
    enemies.ts         ennemis : Knights of Sandora + Commander (boss Seles)
  entities/
    Player.ts          Dart : avatar déplaçable + état de combat + Addition équipée
    Enemy.ts           ennemi : HP, IA (actions phys/magie/soin), boss, barre de vie
  world/
    project.ts         projection monde→écran pour les overlays DOM
  ui/
    MainMenu.ts        écran-titre / sélection de mode
    SystemMenu.ts      menu système à onglets (Status/Équipement/Addition/Config)
    SpawnMenu.ts       menu de spawn d'ennemis (Training, met en pause)
    Button.ts          bouton HUD réutilisable
    VirtualJoystick.ts joystick analogique tactile
    ActionButton.ts    bouton d'action tactile (⚔ attaque)
    StatsBar.ts        barre de stats (portrait, LV, HP/SP/MP, Gold, EXP)
    TechOverlay.ts     tag de build discret en haut à gauche (hash du commit), visible partout
    TimingSight.ts     carré de visée des Additions (timing LoD)
    FloatingText.ts    nombres de dégâts flottants
```

## Déploiement

Chaque push sur `main` build et déploie automatiquement sur **GitHub Pages**
via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Le hash du
commit déployé est injecté au build et affiché dans l'overlay technique en jeu
(FPS · moteur · build).

URL : `https://digiposa.github.io/damia3d/`
