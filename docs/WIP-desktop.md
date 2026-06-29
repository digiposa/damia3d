# WIP — Desktop / PC uniquement

Trucs spécifiques au desktop (souris/clavier). Le dev courant se fait sur mobile —
voir `docs/WIP.md` pour l'état général.

## 🔴 Clic-pour-déplacer cassé sur desktop
Sur PC, **Dart ne bouge pas au clic** (les boutons DOM marchent). Diagnostic déployé
(commit `e45c641`) : un marqueur flottant s'affiche au clic sur le canvas.

**Action de reprise : noter QUEL marqueur apparaît au clic sur le sol**, puis corriger :
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

## Contrôles desktop (rappel)
- Déplacer / attaquer : **clic** (façon Diablo) — clic sol = se déplacer, clic ennemi = attaquer.
- Raccourcis : **Espace** (attaque/combo), **G** garde, **R** objet, **F** magie, **T** transfo,
  **X** special, **Tab** changer de perso.
- Tous les boutons d'action s'affichent aussi sur desktop ; le joystick reste tactile uniquement.
