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
- **Knight of Sandora — review d'IA demandée (à faire).** État constaté :
  - **Black Castle : sélection d'attaque fausse.** Le canon commute sur les **PV** (> 50% → Throw
    Knife 1× ; ≤ 50% → Sword Slash 2×), notre IA « basic » commute sur la **distance** (mêlée →
    Sword Slash, portée → Throw Knife). Résultat : au corps à corps il tape 2× dès le plein régime.
  - **Black Castle : `HP recovers` canon absent** (soigne 30% du max, à n'importe quel PV) — le
    commentaire de la def dit « self-heals » à tort ; le soin 30% dans `Enemy.ts` est celui du
    script du Commander. C'est le même mécanisme que `selfAction()`, mais **répétable** (le Power Up
    du Commander est à usage unique) : il faut lever cette contrainte pour lui.
  - HP JP = **200** (déduit du soin JAP 60 = 30% du max ; on est à 180 US) ; autres stats JP inconnues.
  - **Seles : `~Do nothing` canon non implémenté** — nos ennemis agissent à chaque jauge pleine.
  - **Seles : `Ah, ahhhh!`** (le chevalier quitte le combat quand un autre ennemi de la formation
    tombe, en donnant quand même EXP/gold/objet) — non implémenté, acté.
  - Reste conforme côté Seles : stats JP, 0 contre-attaque, Sword Slash 1× / Throw Dagger 0,5×.
- **Review cohérence des attaques des mobs Forest** (une fois les 4 en place : Berserk Mouse, Trent,
  Goblin, Assassin Cock) : recroiser chaque moveset avec le wiki (noms, multiplicateurs, seuils HP,
  physique vs magie) et vérifier la cohérence de l'ensemble avant de figer.
- **Contre-attaque ennemie sur Additions (`countersAdditions`) — À IMPLÉMENTER.** Le champ
  `EnemyDef.countersAdditions` est renseigné par mob (canon) mais **dormant** : rien ne le lit.
  La formule de dégâts existe déjà et est testée (`additionCounter()` dans `src/combat/formula.ts`).
  Manque le **déclencheur** dans le flux de combat. Canon fidèle = fenêtres de contre par *press*
  d'Additions précises (table « Counterattack Opportunities » du wiki, ex. Dart Volcano press 2) ;
  v1 possible = contre probabiliste quand le joueur touche/rate une Addition vs un mob qui contre.
  Concerne déjà Berserk Mouse + Trent (et la plupart des mobs Forest).
- **Animation de garde manquante — à générer.** L'action existe et fonctionne (`startGuard` :
  soin 10% PV max, dégâts divisés par deux, déplacement bloqué) mais visuellement il n'y a que la
  sphère de bouclier translucide : le perso reste dans son idle de combat. Il faut un clip `guard`
  (`Char__Guard.fbx`), en **boucle** puisqu'il tient toute la durée de la garde. Voir le tier 2 de
  `docs/pipeline/character-assets.md`.
- **Rework du système de statuts/buffs/debuffs** général (les statuts Dragoon actuels sont
  ad-hoc ; il en faut un vrai, alimenté aussi par objets/attaques/équipement).
- Équipement qui donne du SP quand on est touché (Knight Helm, etc.) — pas encore branché.
- Synchro D'Attack/Additions avec de vraies animations.
- **PC** : clic-pour-déplacer cassé (cf. `docs/WIP-desktop.md`).

## Repère
- Branche : `main`. Mode jouable : **Training**. Fichier combat central :
  `src/modes/TrainingMode.ts`. ATB : `src/combat/AtbGauge.ts` + `AdditionRunner.ts`.
