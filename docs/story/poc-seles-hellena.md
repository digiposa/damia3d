# POC — de l'intro de Seles à la fuite vers la Prairie

Objectif : une boucle **jouable de bout en bout**, en mode POC (jouable d'abord, beau ensuite) :
intro → Seles → Forêt → Hellena (1re visite) → fuite vers la Prairie.

> Sources : fiches canon locales (`features/bosses/Commander.md`, `Feyrbrand.md`, `Fruegel.md`,
> `locations/Forest.md`, `locations/Hellena Prison.md`), captures PS1 fournies par le joueur,
> recherche web (wikis fandom / legendofdragoon.org **non accessibles** depuis la session cloud —
> réseau bloqué). ⚠️ = à confirmer par le joueur.

## Déroulé (version de travail — à corriger)

### 0. Intro — la forêt sans nom (canon : `locations/Seles.md`)
1. Cinématique : Seles attaquée de nuit, Shana arrêtée (gemme qui brille, homme encapuchonné).
2. Rose observe le Feyrbrand depuis une falaise (675).
3. Dart lit un **avis de guerre** (676), puis **deux Knights de Sandora l'interrogent** (677).
4. **Le Feyrbrand poursuit Dart** (703) ; **Rose le sauve** au bord d'une falaise (704).
   Pas de vrai combat contre le dragon : course-poursuite jouable + scène.
5. Dart apprend la destruction de Seles et part ; la gemme de Rose brille.

### 1. Seles (village en ruines, crépuscule sépia)
Puits au centre, cimetière en haut, maison/chapelle en pierre en ruine, maisons en bois
calcinées, arbres morts, clôtures.
1. Plateau : Dart voit Seles en cendres et **dévale la pente** (9).
2. Il saute la clôture (est) : **combat 1** — Knight of Sandora ×2 menaçant un villageois (10,
   formation 477). Le villageois meurt : « sauve Shana ». **Save Point** juste là.
3. **Coffre Burn Out** près du Save Point (accessible après le combat 1).
4. Vers l'ouest : **Plos** devant la maison brûlée du centre ; il explique que Shana était la cible.
5. **Combat 2** (725, formation 384) : Commander + Knight ×2 ; il révèle que Shana est à Hellena.
   Power Up quand les Knights tombent (déjà codé).
6. Plos rassure Dart ; **Lowe et Isha** dans la maison où Plos est adossé (optionnel).
7. **Stardust** : 3e tombe à gauche devant l'arbre (12) ; **Master Tasman** : tutoriel optionnel
   (Additions, contre-attaques, garde).
8. Sortie au **nord** → cinématique à Hellena (Shana en cellule, Fruegel vs l'homme
   encapuchonné) → Forêt.

### 2. Forêt — ✅ faite (carte, rencontres canon, marchand, coffres, scène Shana à jouer)

### 3. Hellena Prison — 1re visite
⚠️ Ordre à confirmer (les sous-cartes canon ne sont pas chronologiques) :
1. Chemin côtier + porte (caravane) → arrivée (13-14).
2. Zone de déchargement + 1er point de sauvegarde, une Warden (16).
3. Le pont : **Fruegel jette un garde par-dessus le parapet** (scène, 22).
4. Caserne des gardes (21).
5. 1er bloc de cellules : **Dart rencontre Lavitz** (24) → Lavitz rejoint le groupe.
6. Clé de la tour, 2e bloc : **cellule de Shana** (27 → 643) → Shana rejoint le groupe.
7. À la sortie : **Fruegel** (15) — formation canon 386 : Fruegel + Hellena Warden ×2 +
   Senior Warden ×2. Fruegel est **intouchable / passif tant que des Wardens sont debout**, il
   **siffle** pour appeler 2 Senior Wardens, **Power up** s'il est visé par la magie.
8. Fuite par la porte (56).

### 4. Prairie — écran de fin du POC
Le groupe fuit, poursuivi ; ⚠️ Lavitz touché à la jambe par une flèche. Fin du POC.

## Systèmes à construire (dans l'ordre)
1. **Moteur de scénario** : boîtes de dialogue (style PS1 : cadre bleu, nom en jaune),
   scènes scriptées (déplacer un personnage, attendre, caméra, fondu), drapeaux d'histoire.
2. **Transitions entre cartes** + **état de partie** (équipe, or, objets, coffres ouverts,
   scènes vues) + **sauvegarde** (points de sauvegarde canon).
3. **Combats scriptés** : formation fixe, pas de fuite, conditions de fin, scène après.
4. **Ralliements** : Lavitz puis Shana rejoignent l'équipe.
5. **Mécaniques de boss** : Fruegel (gating par les Wardens, Whistle, Power up anti-magie).

## Cartes à construire (méthode « tout en code » + `src/world/kit`)
- **Intro** : forêt sans nom (réutilise la flore de la Forêt) : falaise, sous-bois, fourche,
  falaise du sauvetage.
- **Seles** : village en ruines (nouveaux éléments : maisons en pierre/bois calcinées, puits,
  tombes, clôtures, arbres morts, fumée).
- **Hellena** : forteresse de pierre (nouveaux : murs, portes, couloirs, cellules, pont, torches —
  proche de l'arène de Lohan).
- **Prairie** : petite carte de fin.

## Assets GLB (Tripo — budgets : `docs/pipeline/character-assets.md`)
| Asset | Classe | Budget | État |
|---|---|---|---|
| Dart | jouable | ~120k | à faire (joueur) |
| Lavitz | jouable | ~120k | à faire |
| Shana / Rose | jouables | — | ✅ existent (Rose : 0/9 animations) |
| Knight of Sandora, Commander | élite / boss | — | ✅ existent |
| Feyrbrand | boss non humanoïde | ≤ 90k | à faire (animation procédurale) |
| Hellena Warden (+ arme) | humanoïde à rigger | ~30k (+3k) | en cours |
| Senior Warden | humanoïde à rigger | ~30k | à faire (ou variante de la Warden) |
| Fruegel | boss | ≤ 90k | à faire |
| Plos, Master Tasman, Lowe, Isha, villageois, marchand | PNJ | ~15k | à faire |

En attendant les GLB : placeholders procéduraux (le jeu reste jouable).

## Ordre de réalisation proposé
1. Moteur de scénario + transitions + état de partie.
2. **Seles** (carte + scène du Commander) — premier test du moteur.
3. Intro (Feyrbrand + Rose).
4. Raccord Seles → Forêt → sortie Hellena.
5. **Hellena** (carte, Lavitz, Shana, Fruegel, fuite).
6. Prairie (fin du POC).
