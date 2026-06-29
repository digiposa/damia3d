# WIP — reprise du dev (handoff)

Dernière session sur PC. Tout est poussé sur `main` (déployé sur GitHub Pages).

## 🔴 Tâche en cours — clic-pour-déplacer cassé sur desktop
Sur PC, **Dart ne bouge pas au clic** (les boutons DOM marchent). On a déployé un
**diagnostic** (commit `e45c641`) : un marqueur flottant s'affiche au clic sur le canvas.

**Action de reprise : me dire QUEL marqueur apparaît au clic sur le sol**, puis on corrige :
- `◎ MOVE` à l'endroit cliqué → clic+pick OK → bug dans le **déplacement** (`navigate`/`move`),
  ou `axis()` non nul qui efface `moveTarget` chaque frame.
- `✖ NO GROUND` au-dessus de Dart → le **pick du sol échoue** (rayon vs caméra ortho) →
  corriger `groundPoint()` dans `src/modes/TrainingMode.ts`.
- `⚔ CLICK` sur un ennemi → ciblage OK.
- **Aucun marqueur** → le canvas ne reçoit pas l'event (overlay capte / listener) →
  corriger l'attache dans `enter()` (`this.canvas.addEventListener("pointerdown", …)`).

➡️ **Une fois corrigé, RETIRER les 3 `popText(... DEBUG)`** ajoutés dans `onPointerDown`
(`src/modes/TrainingMode.ts`, ~ligne 964-980).

Pistes déjà écartées : `hasTouch()` (on branche désormais sur `e.pointerType`), zone du
joystick (passée en `pointer-events:none`, touch-only), CSS/HTML (canvas plein écran propre),
`Player.move()` (OK).

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
- **Contrôles** : desktop = clic-pour-déplacer/attaquer (façon Diablo) + raccourcis
  (Espace, G/R/F/T, X, Tab) ; **tous les boutons d'action s'affichent aussi sur desktop** ;
  joystick = tactile uniquement. (← c'est ce bloc qui est en cours de debug, cf. plus haut.)

## ⏭️ Backlog (voir DESIGN_NOTES.md)
- **Rework du système de statuts/buffs/debuffs** général (les statuts Dragoon actuels sont
  ad-hoc ; il en faut un vrai, alimenté aussi par objets/attaques/équipement).
- Équipement qui donne du SP quand on est touché (Knight Helm, etc.) — pas encore branché.
- Synchro D'Attack/Additions avec de vraies animations.

## Repère
- Branche : `main`. Mode jouable : **Training**. Fichier combat central :
  `src/modes/TrainingMode.ts`. ATB : `src/combat/AtbGauge.ts` + `AdditionRunner.ts`.
