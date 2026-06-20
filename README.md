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

## Menu & options

Au démarrage, un écran-titre permet de **choisir un mode**. En jeu, le bouton
**⚙** (haut-droite) ou **Échap** ouvre le **menu Options** (qui met le jeu en
pause) : réglages du **son** (placeholder, pas d'audio pour l'instant) et de la
**vitesse de combat**, plus **Reprendre** et **Menu principal**. Changer de mode
passe **obligatoirement** par le menu principal (via Options → Menu principal).

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
> 200 %. Les Additions débloquées s'équipent via le bouton **⚔ Addition** (hors
> Addition en cours, comme dans LoD).

Dans **Training** (arène) : on fait apparaître des Knights of Sandora **un par
un** via le bouton **🛡 Spawn Knight**. Ils poursuivent Dart et ripostent ;
vaincre un ennemi octroie de l'EXP. Barres de vie flottantes et nombres de
dégâts à l'écran. La **vitesse de combat** (réglable dans les Options) accélère
l'IA, la cadence d'attaque et les fenêtres de combo — sans toucher au
déplacement.

## Architecture

```
src/
  main.ts              point d'entrée
  core/
    Game.ts            moteur + boucle de rendu + navigation (menu/options/pause)
    GameMode.ts        interface d'un mode
    ModeManager.ts     bascule/efface le mode actif (une Scene isolée par mode)
    Input.ts           état d'entrée (axe virtuel + presses)
    settings.ts        réglages partagés (son, vitesse de combat)
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
    enemies.ts         définitions d'ennemis (Knight of Sandora : Seles + Black Castle)
  entities/
    Player.ts          Dart : avatar déplaçable + état de combat + Addition équipée
    Enemy.ts           ennemi : HP, IA poursuite/attaque, barre de vie flottante
  world/
    project.ts         projection monde→écran pour les overlays DOM
  ui/
    MainMenu.ts        écran-titre / sélection de mode
    OptionsMenu.ts     menu pause : son, vitesse de combat, retour au menu
    Button.ts          bouton HUD réutilisable
    VirtualJoystick.ts joystick analogique tactile
    ActionButton.ts    bouton d'action tactile (⚔ attaque)
    PlayerHud.ts       barre de vie + indicateur de combo
    TimingSight.ts     carré de visée des Additions (timing LoD)
    FloatingText.ts    nombres de dégâts flottants
    DebugOverlay.ts    HUD debug (FPS, vitesse, stats Dart)
    VersionTag.ts      hash du commit déployé (coin bas-droite)
```

## Déploiement

Chaque push sur `main` build et déploie automatiquement sur **GitHub Pages**
via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Le hash du
commit déployé est injecté au build et affiché discrètement en jeu (coin
inférieur droit).

URL : `https://digiposa.github.io/damia3d/`
