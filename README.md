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
```

## Modes de jeu

| Mode | Touche | État |
|------|--------|------|
| **Training** | F1 | ✅ Bac à sable de dev : exploration isométrique + overlay debug |
| **Story** | F2 | 🚧 Stub — campagne fidèle au jeu PS1 |
| **Survival** | F3 | 🚧 Stub — vagues d'ennemis |

Déplacement : **WASD** ou **flèches**.

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
  entities/
    Player.ts          avatar placeholder déplaçable
  ui/
    DebugOverlay.ts    HUD debug (FPS, position)
    VersionTag.ts      hash du commit déployé (coin bas-droite)
```

## Déploiement

Chaque push sur `main` build et déploie automatiquement sur **GitHub Pages**
via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Le hash du
commit déployé est injecté au build et affiché discrètement en jeu (coin
inférieur droit).

URL : `https://digiposa.github.io/damia3d/`
