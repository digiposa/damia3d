# VISION — Damia

> Document canonique de la vision du projet. Source de vérité unique.
> Capté au fil des explications de l'auteur — chaque section reprend
> exhaustivement et fidèlement ce qui a été énoncé, sans extrapolation.

---

## 1. Identité du projet

**Damia** est un remake du JRPG **The Legend of Dragoon (TLoD)**, sorti
à l'origine sur PlayStation 1.

- **Plateforme cible** : navigateur web, rendu **WebGL**.
- **Pourquoi le web** :
  - **Simplicité** — déploiement direct, pas de pipeline d'installation.
  - **Accessibilité** — n'importe qui peut lancer le jeu sans setup
    préalable.
- **Genre revisité** : **Action-RPG temps réel**.
  - Diverge volontairement du JRPG tour-par-tour de l'original.
- **Perspective** : **2D isométrique**.
- **Inspirations gameplay** :
  - **Age of Empires 2 Definitive Edition (AoE2 DE)** — pour le feel
    clic-to-move / clic-to-attack et la lisibilité iso temps réel.
  - **Diablo 2** — pour la boucle action-RPG iso, le combat direct,
    l'engagement à la souris.
- **Fidélité à l'œuvre** : **la plus canon et fidèle possible à TLoD**
  (lore, personnages, zones, classes Dragoon, additions, magies, OST,
  ambiance visuelle).

---

## 2. Genèse — pourquoi un projet web et pas autre chose

### Tentative #1 — éditeur de scénarios AoE2 DE (abandonnée)

L'auteur a initialement tenté de monter le projet dans l'**éditeur de
scénarios d'AoE2 DE**.

Raisons de l'abandon :

- **Timers foireux** — pas assez fiables pour la logique d'un Action-RPG.
- **Assets non-fantasy** — la bibliothèque d'AoE2 DE ne couvre pas
  l'univers heroic-fantasy nécessaire à TLoD (Dragoons, monstres,
  zones d'Endiness, etc.).
- **Et d'autres limites de l'éditeur** (à compléter si besoin).

### Tentative #2 — projet web dédié (en cours)

Devant les limites de la voie AoE2 DE, l'auteur est passé sur un
développement web custom, avec mon assistance (Claude) sur la partie
code.

---

## 3. Rôle de l'assistant (Claude) — capitaine code

L'auteur me confie le **lead sur l'organisation du code**. Je dois me
comporter comme un **architecte / développeur Senior** :

- **Code propre** — conventions strictes, lisibilité d'abord, zéro
  bricolage qui dette technique demain.
- **Code scalable** — chaque ajout doit s'intégrer au modèle data-driven
  existant (ECS pur, AssetManager centralisé, archétypes + avatars
  séparés, etc.) sans forker la moitié du moteur.
- **Refactor sans hésiter** — si je vois un truc foireux ou qui va
  bloquer une évolution, je propose le refactor (et je l'applique
  après validation). Pas de respect aveugle de l'existant si l'existant
  est mauvais.

Ce que l'auteur garde côté lui :

- **Validation** de chaque étape avant qu'elle parte en main / soit
  considérée comme actée.
- **Lore TLoD** — jamais inventé. Si une décision narrative est
  ambiguë, je demande.
- **Data canoniques** (stats, courbes XP, additions, dragoons, sorts,
  sprites, OST) fournies par l'auteur depuis ses sources TLoD.
- **Décisions de design** — quand un trade-off touche au feel ou à la
  vision, l'auteur tranche.

---

## 4. Périmètre fonctionnel — les deux modes de jeu

Damia se développe **sur deux modes en parallèle**, avec des objectifs
distincts mais une base de code unique.

### 4.1 Mode Story — fidélité maximale à TLoD

- **Trame** : suit le jeu TLoD original de la PS1 **fidèlement**, mais
  rendu en **2D isométrique** et **temps réel**.
- **Fidélité visée à 100% sur** (liste donnée par l'auteur) :
  - **Acquisition des additions** — courbes de uses, ordres d'unlock,
    Master Additions, etc.
  - **Acquisition des Dragoon Spirits** — points de bascule narratifs,
    transformations.
  - **Cutscenes** — toutes les séquences scénarisées.
  - **Dialogues** — texte intégral des PNJ et boss.
  - **Stats** — courbes par level canoniques (HP/ATK/DEF/M.ATK/M.DEF,
    XP cumulé, etc.).
  - **Etc.** — tout le reste suit aussi (équipement, items, magies,
    boss, zones, OST…).
- **Position courante** : on reste fidèle au max. _(Note : l'auteur a
  amorcé une exception en disant "sauf." sans préciser — point à
  clarifier ; rien n'est à dévier tant que ça n'est pas explicité.)_

### 4.2 Mode Survival — Vampire-Survivors-like

- **Inspiration** : **Vampire Survivors** (vagues infinies, scaling
  exponentiel, méta-progression).
- **Pourquoi ce mode** (raisons données par l'auteur) :
  - **Parce que c'est fun**.
  - **Laboratoire de feel** — permet de tester en avance des éléments
    de gameplay qui finiront aussi en Story.
- **Différences assumées avec le Story** :
  - **Méthodes d'acquisition** différentes (méta-unlocks via runs, pas
    progression scénarisée).
  - **Équilibrage** différent (le Story doit rester canon TLoD ; le
    Survival peut être tuné pour le fun et le challenge endless).

### 4.3 Relation entre les deux modes

Les **mécaniques de combat** (additions, Dragoon transform, SP, magies,
etc.) sont **partagées** au niveau code — c'est tout l'intérêt de la
double cible. Ce qui diffère par mode :

- **Acquisition** (story narrative vs survival meta-unlock).
- **Équilibrage** (stats canoniques vs scaling endless).
- **Scènes / orchestration** (Forest/Hellena/WorldMap vs Arena).

---

## 5. Plateformes cibles

Le jeu doit tourner **aussi bien sur navigateur PC que mobile**. Pas de
plateforme privilégiée — les deux sont des cibles de premier rang.

Conséquences directes :

- **Inputs duals obligatoires** : clavier+souris ET tactile (joystick
  virtuel, boutons d'action, gestures).
- **Layout responsive** : safe-area iOS, redimensionnement dynamique
  des HUD, viewport portrait vs paysage.
- **Performance** : 60 FPS cible y compris sur mobile milieu de gamme.

**Contexte de développement** : l'auteur code actuellement **depuis son
mobile** (pas d'accès à son PC fixe pour le moment). Implication
pratique : la collaboration passe par échanges texte / images, je dois
être autonome côté lecture-de-code et anticiper ce que l'auteur ne peut
pas vérifier rapidement à l'œil.

---

## 6. Mécaniques verrouillées — forme Dragoon, SP, DLV, MP

Décisions de design captées au fil des discussions, à respecter strictement
côté code. Tout ce qui est marqué **à définir** reste ouvert et sera
complété au fil des sessions.

### 6.1 Forme Dragoon — déclenchement et durée

- **Pré-requis pour transformer** : la jauge **SP** atteint au moins
  **100** points (valeur de base au DLV 1).
- **Pas de timer séparé pendant la transformation.** La jauge SP **EST**
  le timer : chaque action en forme Dragoon draine la jauge, et la
  transformation prend fin automatiquement quand `SP = 0` (retour
  forme humaine).
- **Drain passif** : **2 SP par seconde**, en continu, **idle ou en
  mouvement** (pas de distinction pour l'instant). S'additionne aux
  drains d'action ci-dessous.
- → **Implication code** : `Dragoon.timerMs` + les champs
  `durationMsBase` / `durationMsPerLevel` / `drainPerActionMs` du
  `DragoonConfig` actuel **deviennent obsolètes**. Le seul compteur
  vivant pendant la form, c'est `SpGauge.current` qui descend.

### 6.2 DLV (Dragoon Level) — progression

- **Plage** : DLV 1 → DLV 5 (5 paliers, canon TLoD).
- **Effets cumulés par palier de DLV** :
  - **Cap de SP augmenté de +100** par DLV : 100 (DLV 1) → 200 → 300
    → 400 → **500** (DLV 5). Plus le DLV est haut, plus on peut rester
    longtemps en form (et plus la transformation dure quand on l'engage).
  - **Multiplicateurs de stats en forme Dragoon** (ATK / DEF / M.ATK /
    M.DEF) qui montent par palier — voir tableau Shana / White-Silver
    en exemple (déjà fourni par l'auteur) ; les 6 autres archétypes
    sont **à définir**.
  - **SP gagné par action** (auto-attack ou addition) qui monte par
    palier — confirmé par le wiki sur Shana (35 → 150 SP par auto-attack
    entre DLV 1 et 5).
  - **Sorts Dragoon supplémentaires débloqués** par seuils de DLV
    (déjà capturé en data via `archetype.dragoon.additionUnlocksByLevel`
    — clé "level" à reinterpréter comme DLV, pas character level).
- **Source de progression du DLV** : **fonction du total de SP généré
  lifetime** (en Story). Seuils par palier à fournir par l'auteur
  (data en cours d'envoi).
- **Portée du DLV** : **per-archetype**. Quand un avatar meurt et qu'un
  autre hérite du Spirit (Lavitz → Albert, Shana → Miranda), le DLV
  est **carry-over** — comme dans TLoD PS1.
- **Survival** : le DLV est **reset à chaque run** pour l'instant.
  Évolution possible plus tard : méta-perks hors-run qui débloqueraient
  un DLV de départ supérieur à 1 (à voir, hors scope court terme).

### 6.3 Actions en forme Dragoon

En forme Dragoon, **les actions sont restreintes à deux** (canon TLoD
adapté temps réel) :

1. **Auto-attack — splash AoE avec effet élémentaire.**
   - **Élément** = celui de l'archetype Dragoon (Red-Eye = feu, Jade =
     vent, etc.).
   - L'attaque physique TLoD PS1 est un QTE ; chez nous on simplifie
     en boostant les dégâts et en appliquant l'effet élémentaire +
     splash AoE autour de la cible.
   - **Forme de l'AoE** : **cône de 120°** devant le personnage.
   - **Radius du cône** : à définir (l'auteur attend une proposition
     équilibrée — à creuser au moment de l'implémentation).
   - **Drain SP** : **-10 SP par swing**.
   - **Single-target** (cas où une seule cible est dans le cône) :
     léger boost de dégâts par rapport au baseline, sans rendre le
     comportement OP. Valeur exacte à calibrer.
2. **Magie Dragoon.**
   - **Drain SP** : **-60 SP par cast** (uniforme). Pré-requis :
     `SpGauge.current ≥ 60` pour pouvoir caster (sinon le sort est
     bloqué, comme un cooldown matériel).
   - **Coût MP** : variable selon le spell, à définir avec la liste
     des sorts par archétype (data à venir).

**Désactivés en forme Dragoon** :

- **Additions** — interdites en form Dragoon. → Le picker doit basculer
  sur la liste des sorts Dragoon dispo selon DLV, et `tryTriggerAddition`
  doit refuser quand `Dragoon` est présent.
- **Items consommables** (Burn Out, Gushing Magma, potions, etc.).
- **Défense** — **interdite** en forme Dragoon. La posture défensive
  n'a pas de sens en Dragoon (auteur).

### 6.4 MP — magies Dragoon

- **Pool MP** : ressource séparée de SP, consommée à chaque sort
  Dragoon casté.
- **Cap MP par défaut** : **20 MP × DLV courant** (au sens de l'auteur,
  référencé au jeu PS1). Soit 20 / 40 / 60 / 80 / 100 MP de DLV 1 à 5.
  Valeur exacte à valider contre les sources TLoD si besoin.
- **Régénération MP** : aucune régen passive par défaut. La récupération
  passe par **certains items et équipements** (canon TLoD : Mana Sphere,
  Spirit Potion, etc.).
- **Buffs d'équipement** : certains items / équipements TLoD **doublent
  le cap MP** ou permettent une **regen** active. À détailler dans la
  data items quand elle sera reprise.
- → **Implication code** : un nouveau composant `MpGauge` calqué sur
  `SpGauge`, attaché à spawn, alimenté par les items inventaire.

### 6.5 Acquisition de la forme Dragoon — Story vs Survival

#### Story (canon TLoD)

- **Dart** débloque sa transformation à **Hoax** (early game).
- **Lavitz** débloque la sienne après la **mort de Graham** (boss).
- **Albert** hérite du Jade Dragoon Spirit à la mort de Lavitz (Disc 2).
  Stats / XP / additions / DLV (per-archetype) carry-over.
- **Shana → Miranda** : substitution similaire en Disc 3.
- → **Bug à corriger** signalé par l'auteur : actuellement en Story,
  la jauge SP se remplit dès que le joueur utilise des additions, alors
  qu'elle ne devrait commencer à se remplir **qu'après le déblocage
  scénarisé de la forme Dragoon**. Comportement à gater par un **flag
  sur le `Character` component** (ex : `dragoonUnlocked: boolean`).
  Quand un avatar est remplacé scénaristiquement (Lavitz → Albert,
  Shana → Miranda), le flag est **hérité** avec le reste — Albert
  arrive donc déjà avec la Dragoon débloquée s'il succède à Lavitz
  après son unlock.

#### Survival

- La forme Dragoon se débloque **via un upgrade tiré dans le
  LevelUpChoiceModal**, **disponible après la mort du premier boss**
  (proposition de départ, peut évoluer).
- Tant que pas débloqué, SP gauge cachée / inactive — même règle qu'en
  Story.

### 6.6 Personnages partagés (skins)

Vision déjà partiellement implémentée dans le code (`DragoonArchetype` +
`CharacterAvatar`), à dérouler côté avatars manquants :

- **Lavitz / Albert / Greham / Syuveil** partagent le **Jade Dragoon**
  archetype. Mêmes stats, additions, courbe XP, DLV (per-archetype).
  Différences : sprite, voix, lore.
- **Shana / Miranda / Shirley** partagent **White-Silver Dragoon**.
- **Meru / Damia / Lenus** partagent **Blue-Sea Dragoon**.
- **Haschel / Kanzas / Doel** partagent **Violet Dragon**.
- **Kongol / Belzav** partagent **Gold Dragon**.
- **Dart / Zieg** partagent **Red-Eyed Dragon**.
- **Rose** = unique wielder Darkness Dragon (pas de skin partagé).
- En Story : seuls les avatars canon de l'arc en cours sont jouables
  (substitutions narratives).
- En Survival : tous les avatars unlockés sont sélectionnables,
  qu'ils soient "canon principal" ou "skin" (Shirley / Damia / Lenus /
  Greham / Syuveil / Zieg / Kanzas / Doel / Belzav). Méta-progression
  via runs.

#### Principe **dual-data : skin ≠ boss**

Un character peut exister sous **2 datasets distincts** dans le code
selon le mode de jeu :

1. **Skin Survival** → référence vers `DragoonArchetype` (stats / additions
   / courbe XP / DLV partagées avec les autres wielders du même archetype) +
   overrides cosmétiques (sprite + voix + lore).
2. **Boss / NPC Story** → entrée indépendante dans `bosses/` ou `npcs/` avec
   **stats + moveset propres**, non liés à l'archetype Dragoon. C'est ce
   qu'on rencontre en combat scripté narratif.

> Exemple **Lenus** : en Survival = skin Blue-Sea Dragoon (joue le kit Meru).
> En Story = boss Disc 2 Undersea Cavern avec razor fans + Wingly magic +
> Sea Dragoon Regole partenaire (kit boss unique, jamais joué par le joueur).
>
> Exemple **Zieg** : en Survival = skin Red-Eyed Dragoon (joue le kit Dart).
> En Story = boss final avec son propre kit (jamais jouable canon).

**Implication impl** : un même personnage peut alimenter à la fois :

- une entrée `characters/<name>.skin.ts` (data archetype-référencée),
- une entrée `bosses/<name>.ts` (data boss-tier propre),
  selon que le contexte de jeu est Survival ou Story. Les 2 datasets sont
  **totalement disjoints** côté stats/skills — seuls sprite/voix/lore peuvent
  être réutilisés en commun.

Avatars unlockables en survival qui sont aussi bosses canon Story (donc
double-dataset) : **Zieg**, **Lenus**, **Greham**, **Doel**, **Shirley**
(boss-trial Shrine of Shirley), **Lloyd** si éventuellement skinifié, etc.
Avatars unlockables survival qui sont uniquement lore NPC (pas combat
canon, donc dataset unique skin) : **Damia**, **Syuveil**, **Kanzas**,
**Belzav**.

---

## 7. État du chantier — focus courant

L'auteur précise qu'**une part substantielle du code est déjà
implémentée** (avant un `/clear` accidentel qui m'a fait perdre le
contexte en cours de session — cette doc en est en partie la
reconstruction).

Ce qui est posé à ce jour, d'après l'auteur :

- **Système d'items** — en place.
- **Personnages, additions et Dragoons** — **chantier actif en cours**
  d'implémentation. C'est le focus actuel du développement.

> Le détail technique de l'existant (modules livrés, schémas data,
> hooks, etc.) sera reconsigné dans `ARCHITECTURE.md` lors de la passe
> de re-documentation suivante. Cette doc-ci (VISION) reste au niveau
> macro / direction.

---

## 8. Sections à venir

> Cette doc grossira à mesure que l'auteur précise sa vision. Sections
> attendues (à compléter ensemble) :
>
> - **Cible joueur** — public visé, durée de session, niveau d'expérience
>   attendu (fans TLoD vs nouveaux venus).
> - **Roadmap macro** — phases / jalons revus post-MVP (le `ROADMAP_MVP.md`
>   actuel s'arrête à M8 alors qu'on a livré bien plus).
> - **Critères de "fini"** — quand est-ce qu'une feature est considérée
>   canon-fidèle / acceptable pour merge.
> - **Hors-scope assumé** — multiplayer ? mods ? remaster console ?
> - **Monétisation / distribution** — gratuit / open-source / autre.
> - **Exceptions à la fidélité TLoD** — la phrase "sauf." de §4.1
>   reste à compléter.

---

_Dernière mise à jour : 2026-05-13 — sections 1-7 captées. §6 affinée
avec drains SP / cap MP par DLV / portée DLV per-archetype._
