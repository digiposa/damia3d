# SCOPE — Damia

> **But** : doc opérationnel — qu'est-ce qu'on construit, pour qui, avec quoi, avec quels moyens.
> Complète [VISION.md](VISION.md) (le _pourquoi_ macro) avec le _quoi / quand / comment_.
> Source de vérité partagée entre user et Claude. Évolue au fil des sessions.

---

## 1. Identité du projet

- **Nom** : Damia
- **Nature** : remake **fan-made** de _The Legend of Dragoon_ (TLoD, PS1, 1999)
- **Positionnement** : **fan game**, pas une tentative AAA
- **Monétisation** : **aucune** — le jeu utilise des assets du jeu PS1, donc impossible légalement et hors esprit du projet
- **Distribution** : libre, sur navigateur (et tentative Play Store envisagée — voir §6)

## 2. Rôles & responsabilités

| Rôle                                                         | Tenant                                      | Description                                                                                    |
| ------------------------------------------------------------ | ------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Chef de projet & vision                                      | **User** (seul capitaine à bord)            | Direction projet, vision gameplay, lore TLoD, validation chaque étape                          |
| Dev senior code & archi                                      | **Claude**                                  | Implémentation, choix techniques scalables, refactor proactif, code "digne de l'industrie pro" |
| Génération assets graphiques                                 | **User** (via ChatGPT / Gemini / autres IA) | Sprites, tiles, portraits — partagés via `shareAI/`                                            |
| Intégration assets dans le code                              | **Claude**                                  | Pipeline AssetManager, alias logiques, swap placeholder → asset réel                           |
| Décisions de design                                          | **User tranche**                            | Quand un trade-off touche au feel / canon / vision                                             |
| Data canon TLoD (stats, courbes, additions, dragoons, sorts) | **User**                                    | Source : sources TLoD personnelles (wikis, captures, etc.)                                     |

Voir aussi [VISION §3](VISION.md#3-rôle-de-lassistant-claude--capitaine-code).

## 3. Genre & style

- **Genre** : Action-RPG temps réel — diverge volontairement du JRPG tour-par-tour de l'original
- **Perspective** : 2D **isométrique**
- **Inspirations gameplay** :
  - **Diablo 2** — boucle action-RPG iso, combat direct à la souris
  - **Age of Empires 2 Definitive Edition** — feel clic-to-move / clic-to-attack, lisibilité iso temps réel
- **Fidélité visuelle / narrative à TLoD** : **maximale** (cf. [VISION §4.1](VISION.md#41-mode-story--fidélité-maximale-à-tlod))

## 4. Raisons des choix structurants

| Choix                                    | Pourquoi                                                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Remake TLoD plutôt qu'un jeu original    | Passion personnelle du user, communauté TLoD orpheline d'un vrai remake                                       |
| Web (vs Unity / native)                  | User est dev web business IRL → leverage compétences. Plus facile à coder avec IA. Distribution simple (URL). |
| 2D isométrique (vs 3D)                   | Compatible mobile, lisible, dans l'esprit de revisite TLoD                                                    |
| Action-RPG temps réel (vs tour-par-tour) | Réinterprétation moderne, public habitué aux ARPG iso                                                         |
| Pas de monétisation                      | Assets PS1 → impossible légalement. Esprit fan game gratuit.                                                  |
| Fan game (pas AAA)                       | Tentative honnête, pas d'objectifs commerciaux, respect du matériau source                                    |

**Précédente tentative abandonnée** : éditeur de scénarios AoE2 DE — timers foireux, assets non-fantasy, expérience tedious globalement. Voir [VISION §2](VISION.md#2-genèse--pourquoi-un-projet-web-et-pas-autre-chose).

## 5. Audience cible

- **Public principal** : **communauté TLoD PS1** — fans du jeu original qui attendent un remake qui « ne viendra probablement jamais »
- **Tonalité** : faite par un fan pour les fans, pas un produit grand public
- **Posture assumée** : **fan-only**. Les newcomers découvrant TLoD via Damia ne sont pas une cible prioritaire — on ne sacrifie pas la fidélité canon ni la profondeur pour faciliter leur entrée.

## 6. Plateformes cibles

Toutes en **premier rang** (pas de plateforme privilégiée) :

- **Navigateur PC** — clavier + souris
- **Navigateur Mobile** — tactile (joystick virtuel, gestures, boutons)
- **Play Store** — tentative d'intégration envisagée via **wrapper natif** (Capacitor / Cordova / TWA / équivalent — choix technique exact à valider lors de l'intégration)

Contraintes induites :

- Inputs duals obligatoires (cf. [VISION §5](VISION.md#5-plateformes-cibles))
- Layout responsive (safe-area iOS, portrait/paysage)
- 60 FPS y compris sur mobile milieu de gamme

**Pipeline de dev — contrainte forte** : pendant tout le développement, on **maintient un déploiement web automatisé via GitHub Actions** (preview/staging accessible par URL). Le user code actuellement depuis son mobile et a besoin de tester chaque push sans setup local. Le wrapper natif est un objectif de packaging, **il ne doit jamais casser ni remplacer ce workflow web-deploy**.

## 7. Modes de jeu

Damia se développe sur **2 modes en parallèle**, **base de code unique**.

### 7.1 Mode Story — fidélité maximale TLoD

- Suit la trame du jeu PS1 fidèlement (zones, bosses, cutscenes, dialogues, additions, Dragoons, OST)
- Adaptation forcée du gameplay : tour-par-tour → temps réel iso
- Détails mécaniques verrouillées : [VISION §6](VISION.md#6-mécaniques-verrouillées--forme-dragoon-sp-dlv-mp)

### 7.2 Mode Survival — fun-first

- Inspiration : **Vampire Survivors** (et similaires) — vagues infinies, scaling exponentiel, méta-progression
- Laboratoire de feel : permet de tester en avance des éléments destinés à finir aussi en Story
- Différences assumées avec Story : acquisition (méta-unlocks vs narrative), équilibrage (endless vs canon)

#### Deux sous-modes de Survival

Vision posée 2026-05-18.

- **Survival Classic** — respecte le canon TLoD sur la majorité des mécaniques (formules de dégâts, modifiers, additions, Dragoons, etc.), simplement adapté à une boucle survival. Pas de mécaniques étrangères au jeu d'origine (ex : pas de critical hits).
- **Survival Modern** — modifications plus profondes pour coller au feel Vampire-Survivors-pur. Mécaniques exclusives possibles : critical hits, modifiers spécifiques, scaling agressif, etc. Liberté gameplay assumée.

→ **Implication code** : un **ruleset / mode flag** discriminant Classic vs Modern doit exister côté combat / progression / loot. Les features exclusives à Modern doivent être **gateables proprement** (pas de duplication, juste un opt-in par mode).

### 7.3 Code partagé vs spécifique

Les **mécaniques de combat** (additions, Dragoon transform, SP, magies, items, stats) sont **partagées au niveau code** entre les deux modes.

Ce qui **diffère par mode** :

- **Acquisition** des unlocks (narrative scénarisée vs méta-progression run-based)
- **Équilibrage** (stats canoniques TLoD vs scaling endless)
- **Scènes / orchestration** (Forest / Hellena / WorldMap vs Arena)

**Implication code** : architecture **propre** indispensable — features communes dans des modules réutilisables, mode-specific dans des couches séparées.

## 8. Priorités et long terme

### Ambition de contenu

- **Story mode** : couvrir **TLoD canon complet** — les **4 discs**, monde entier d'Endiness, tous les bosses, toutes les cutscenes, toutes les zones. Pas de sous-ensemble.
- **Survival mode** : contenu généré / vagues infinies — pas de borne narrative

### Court terme (priorités actuelles)

- Focus **solo**, Story + Survival
- Continuer le chantier en cours (cf. [VISION §7](VISION.md#7-état-du-chantier--focus-courant))
- **Note** : [ROADMAP_MVP.md](ROADMAP_MVP.md) est **outdated** — voir §9.1

### Long terme (vision, non priorisé)

- **Multijoueur coop Survival**
- **Multijoueur Story**
- Distribution Play Store (cf. §6)
- Localisation au-delà d'EN/FR (multi-langues prévu, détails à venir)

## 9. Contradictions / zones grises

État après clarifications user (mai 2026) :

1. **MVP vs implémentation actuelle** — ✅ **RÉSOLU**
   - `ROADMAP_MVP.md` est **outdated** (s'arrête à M8 / MVP "Forêt de Seles" alors que le chantier est déjà au-delà)
   - `VISION.md` reste **valable comme cible** — mais tout ce qui y est décrit n'est pas forcément déjà implémenté ; c'est la vision à concrétiser au fil
   - **Conséquence** : `ROADMAP_MVP.md` à reprendre / archiver dans une future passe. La doc qu'on construit dans `features/` peut reprendre des éléments de VISION (redite acceptable)
2. **Exceptions à la fidélité TLoD** — ⏳ **OUVERT (au fil)**
   - La phrase « sauf. » de [VISION §4.1](VISION.md#41-mode-story--fidélité-maximale-à-tlod) n'est pas complétée
   - **Posture user** : pas de liste exhaustive à définir maintenant. On documentera chaque exception **au cas par cas** quand elle se présente (dans la doc de la feature concernée, section "Décisions & rationale")

3. **Critères de "fini" / canon-fidèle** — ⏳ **OUVERT (à définir plus tard)**
   - Pas de définition opérationnelle pour l'instant
   - En attendant : Claude tranche au feeling, user valide à la session de revue

## 10. Hors-scope assumé

- ❌ Monétisation (légalement impossible avec assets PS1, esprit fan game)
- ❌ Tentative AAA / publication commerciale
- ❌ Multijoueur court terme (vision long terme uniquement)

### Statut du repo

- Repo `digiposa/damia` actuellement **public** — peut éventuellement basculer en **privé** plus tard (décision user à venir si besoin)

### Autres hors-scope à clarifier (non priorisé)

- Mods / éditeur de map joueur ?
- Remaster console (Switch, PS5) ?

## 11. Questions — synthèse statut

| Question                     | Statut             | Réponse / suite                                                                                                                 |
| ---------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Audience newcomers ?         | ✅ tranché         | **Fan-only** assumée (§5)                                                                                                       |
| Play Store technique ?       | 🟡 cap posé        | **Wrapper natif** envisagé (Capacitor/Cordova/TWA), choix exact différé. Pipeline web GitHub Actions maintenu pendant dev. (§6) |
| Contradiction MVP/Dragoon ?  | ✅ tranché         | ROADMAP outdated ; VISION valable comme cible. (§9.1)                                                                           |
| Scope canon final ?          | ✅ tranché         | **TLoD canon complet, 4 discs** (§8)                                                                                            |
| Survival sous-modes ?        | ✅ tranché         | **Classic** (canon-fidèle adapté) + **Modern** (Vampire-Survivors-pur, criticals etc.) (§7.2)                                   |
| Exceptions fidélité TLoD ?   | ⏳ ouvert (au fil) | Documenté au cas par cas dans chaque feature concernée (§9.2)                                                                   |
| Critères de canon-fidélité ? | ⏳ ouvert          | À définir plus tard. Entre-temps : Claude tranche, user valide. (§9.3)                                                          |
| Open-source ou repo privé ?  | 🟡 actuel          | **Public** maintenant, peut passer privé plus tard (§10)                                                                        |
| Langues > EN/FR ?            | 🟡 cap posé        | **Multi-langues prévu** au-delà d'EN/FR, détails plus tard (§8)                                                                 |

---

## Liens utiles

- [VISION.md](VISION.md) — vision macro, mécaniques verrouillées Dragoon
- [PROJECT_BLUEPRINT.md](PROJECT_BLUEPRINT.md) — archi technique, stack, conventions code
- [ROADMAP_MVP.md](ROADMAP_MVP.md) — ⚠️ **outdated**, à reprendre / archiver
- [ARCHITECTURE.md](ARCHITECTURE.md) — état fonctionnel à un instant T
- [features/](features/README.md) — doc fonctionnelle par thématique
