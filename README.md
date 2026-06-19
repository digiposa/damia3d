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

## Menu principal

Au démarrage, un écran-titre permet de choisir un mode. **Échap** le rouvre en
cours de jeu. Le HUD (boutons de modes, joystick) est masqué tant que le menu
est affiché.

## Modes de jeu

| Mode | Touche | État |
|------|--------|------|
| **Training** | F1 | ✅ Bac à sable de dev : exploration iso + Knight of Sandora + overlay debug |
| **Story** | F2 | 🚧 Stub — campagne fidèle au jeu PS1 |
| **Survival** | F3 | 🚧 Stub — vagues d'ennemis |

Sur tactile, des boutons de modes (coin haut-droit) remplacent les touches F.

### Contrôles

Le jeu est jouable au clavier/souris **et** au tactile (mobile / tablette) :

- **Desktop** : déplacement **WASD** ou **flèches** ; modes via **F1 / F2 / F3**.
- **Mobile / tablette** : **joystick virtuel** (bas-gauche) pour se déplacer ;
  **boutons de modes** (haut-droite) pour basculer entre les modes.

Le rendu s'adapte au pixel ratio de l'appareil et aux zones sûres (encoches),
et la mise en page est responsive sur toutes tailles d'écran.

## Combat

**Hack & slash temps réel** (esprit Diablo II) avec des **attaques fidèles à
*The Legend of Dragoon***.

Les formules de dégâts reproduisent exactement celles du jeu PS1
([`src/combat/formula.ts`](src/combat/formula.ts)) : troncatures `floor` à chaque
étape, `round` spécial `(x + y/2) / y`, et les « modifier wrappers » avec leur
imbrication précise (attaque physique de base, Additions, attaques
physiques/magiques ennemies, attaques en pourcentage, dégâts de statut). Couvert
par des tests (`npm test`).

Les **Additions** sont traduites en **combos temps réel** : chaque coup
([`AdditionRunner`](src/combat/AdditionRunner.ts)) enchaîne le hit suivant de
l'Addition équipée dans une fenêtre de timing ; tout enchaîner = Addition
« parfaite ». Les dégâts par coup proviennent directement de la formule
`additionAttack`, si bien que la somme du combo égale exactement l'Addition
parfaite de LoD.

Dans **Training** (arène) : Dart affronte des **vagues** de Knights of Sandora
qui le poursuivent et ripostent. Attaque = **clic / Espace** (ou bouton **⚔** sur
tactile), à rythmer pour prolonger le combo. Vaincre les ennemis octroie de
l'EXP ; nettoyer une vague en lance une plus grande. Barres de vie flottantes et
nombres de dégâts à l'écran.

## Architecture

```
src/
  main.ts              point d'entrée
  core/
    Game.ts            moteur + boucle de rendu + hotkeys de modes
    GameMode.ts        interface d'un mode
    ModeManager.ts     bascule entre modes (une Scene isolée par mode)
    Input.ts           état clavier
  modes/
    TrainingMode.ts    sandbox jouable (exploration)
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
    AdditionRunner.ts  moteur de combo temps réel (fenêtres de timing)
    *.test.ts          tests des formules et du combo (Vitest)
  data/
    dart.ts            table de niveaux de Dart (1→60) + helpers EXP/niveau
    additions.ts       données d'Additions de Dart (hits + multiplicateurs)
    enemies.ts         définitions d'ennemis (Knight of Sandora : Seles + Black Castle)
  entities/
    Player.ts          Dart : avatar déplaçable + état de combat + Addition équipée
    Enemy.ts           ennemi : HP, IA poursuite/attaque, barre de vie flottante
  world/
    project.ts         projection monde→écran pour les overlays DOM
  ui/
    MainMenu.ts        écran-titre / sélection de mode
    ModeBar.ts         boutons de modes à l'écran (tactile + desktop)
    VirtualJoystick.ts joystick analogique tactile
    ActionButton.ts    bouton d'action tactile (⚔ attaque)
    PlayerHud.ts       barre de vie + indicateur de combo
    FloatingText.ts    nombres de dégâts flottants
    DebugOverlay.ts    HUD debug (FPS, vague, stats Dart)
    VersionTag.ts      hash du commit déployé (coin bas-droite)
```

## Déploiement

Chaque push sur `main` build et déploie automatiquement sur **GitHub Pages**
via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Le hash du
commit déployé est injecté au build et affiché discrètement en jeu (coin
inférieur droit).

URL : `https://digiposa.github.io/damia3d/`
