# WIP — reprise du dev (mobile)

État général du projet. Tout est poussé sur `main` (déployé sur GitHub Pages).
Soucis spécifiques **PC/souris** → voir `docs/WIP-desktop.md`.

## 🟡 Refonte combat ATB ↔ Additions ↔ temps réel (en test)
- **`COMBO_TIME_SCALE = 0.2`** (`src/modes/TrainingMode.ts`) : pendant le combo du joueur, le
  monde (ennemis/alliés/jauges) tourne à 20 % ; le timing du combo reste en temps réel. Le
  but : la durée d'un combo ne coûte ~rien en temps de jeu → longues additions plus pénalisées,
  fenêtres confortables. **À tester/régler à la sensation** : 0 (gel/tour-par-tour parfait)
  vs 0.2 (ralenti) vs 0.3-0.4. (Réglage en une constante.)
- Fenêtres de timing **revenues à 0.7 s fixe** (on a annulé le scaling-sur-fill qui rendait
  Perky Step injouable). `ACTION_RECOVERY = 0.5` (souffle post-action).
- Objectif long terme noté : **chorégraphie par addition** (rythme variable par coup, calé
  sur les anims) au lieu d'une fenêtre uniforme — données dans `AdditionDef` + runner.

## 🟢 Fait et stable
- **Système Dragoon Phases 1-5** complet (canon dans `docs/canon/dragoon.md`) :
  jauge SP = D'Lv×100, SP/attaque par D'Lv, multiplicateurs de stats par D'Lv + progression,
  D'Attack (combo timé), Magie (menu de sorts + formule + dégâts/soins), statuts
  (Fear/Stun/Mort) + Rose Storm, Special + Dragoon Space, sources de SP (Spirit Potion/Ring,
  Wargod's Sash). Transfo & Special **gardent le tour ATB** ; revert Dragoon à la **fin** de
  l'action ; pas de de-transfo manuelle (canon).
- **Icônes** d'actions extraites de la planche LoD (épée bleue/rouge animée, bouclier, coffre,
  baguette, œil par élément, yin-yang du Special) — `src/assets/icons/`, animées quand ATB plein.
- **Barre SP segmentée** par tranches de 100 (PartyPanel).

## ⏭️ Backlog (voir DESIGN_NOTES.md)
- **Rework du système de statuts/buffs/debuffs** général (les statuts Dragoon actuels sont
  ad-hoc ; il en faut un vrai, alimenté aussi par objets/attaques/équipement).
- Équipement qui donne du SP quand on est touché (Knight Helm, etc.) — pas encore branché.
- Synchro D'Attack/Additions avec de vraies animations.
- **PC** : clic-pour-déplacer cassé (cf. `docs/WIP-desktop.md`).

## Repère
- Branche : `main`. Mode jouable : **Training**. Fichier combat central :
  `src/modes/TrainingMode.ts`. ATB : `src/combat/AtbGauge.ts` + `AdditionRunner.ts`.
