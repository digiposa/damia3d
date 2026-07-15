# Belzac

> Boss canon Disc 4 à **Vellweb** — **un des 7 anciens Dragoons** servant Emperor Diaz pendant la Dragon Campaign. **Gold Dragoon** (élément Earth) dont **Kongol héritera le Spirit**.
>
> **Sources canon** :
>
> - 🥈 [`_sources/lod-wiki-belzac.md`](./_sources/lod-wiki-belzac.md) — wiki LoD (stats, immunities, abilities table, counter group)
> - 🥉 [`_sources/fandom-belzac.md`](./_sources/fandom-belzac.md) — fandom (quote canon, story Disc 2+4, Gloriano royalty, Official Guidebook trivia)

## Statut

🟡 **draft** — data canon ingérée. Aucune impl Damia. Premier boss documenté (premier de la catégorie `bosses/`).

## Profil

| Attribut          | Valeur                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| Type              | Boss canon (un des **4 anciens Dragoons morts** pendant Dragon Campaign — souls à Vellweb)                         |
| Archetype Dragoon | **Gold Dragon** (Earth) — Kongol's predecessor                                                                     |
| Élément           | **Earth** (cf. [`../combat/elements.md`](../combat/elements.md))                                                   |
| Location canon    | **Vellweb (submap 502)** — cf. [`../locations/`](../locations/) (Vellweb à créer)                                  |
| Encounter         | **Scripted** (0% escape)                                                                                           |
| Counter group     | **28** (all opportunities)                                                                                         |
| Disc              | Disc 4 (Chapter 4: Moon & Fate)                                                                                    |
| Identity canon    | **Human**, **31 ans** (à la Dragon Campaign), **210 cm / 6'11"**, **royal family of Gloriano**                     |
| Quote signature   | _"Children...I will realize the freedom you wished, and the future I promised to you. Children. Please watch us."_ |

## Stats canon

### Stats de base

| HP     | AT  | DF  | A-AV | SPD | MAT | MDF | M-AV |
| ------ | --- | --- | ---- | --- | --- | --- | ---- |
| 16,000 | 178 | 200 | 0%   | 50  | 71  | 80  | 0%   |

> ⚠️ **Divergence stats vs fandom 🥉** :
>
> - **HP** : wiki LoD 16,000 / fandom 18,000 (US/EU) ou 25,000 (JP)
> - **AT** : 178 / 200
> - **MAT** : 71 / 80
> - **SPD** : 50 / 70
>
> **Wiki LoD prime** (🥈 > 🥉). À vérifier tier 1 (Discord) pour les valeurs canon exactes (JP vs US/EU peut expliquer une partie).

### Status Immunity

✅ **Immunisé à tous les 8 statuts canon** :

| Petrify | Bewitch | Arm Block | Dispirit | Confuse | Fear | Poison | Stun |
| ------- | ------- | --------- | -------- | ------- | ---- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | ✔       | ✔    | ✔      | ✔    |

> Pattern boss canon : **status immunity totale** (8 statuts). Important pour data-model boss vs minor mob.

## Yield

| EXP   | Gold | Drops                   |
| ----- | ---- | ----------------------- |
| 6,000 | 300  | **Golden Stone (100%)** |

> **Golden Stone** = item à documenter dans `items/` futur. Probable lien Dragoon Spirit related (Kongol acquires Spirit after Belzac defeat ?).

## Abilities & Traits

### Abilities

Toutes les valeurs canon — confirmant le système **Attack Multiplier per ability** Wulves :

| Action        | Target | Damage           | Attack Multiplier | Conditions         |
| ------------- | ------ | ---------------- | ----------------- | ------------------ |
| D-attack      | Single | 1× Physical      | **1.0**           | —                  |
| Grand Stream  | Party  | 1.5× Earth magic | **1.5**           | —                  |
| Meteor Strike | Party  | 2× Earth magic   | **2.0**           | **Retaliate only** |
| Golden Dragon | Party  | 3× Earth magic   | **3.0**           | **Retaliate only** |

→ **Grand Stream / Meteor Strike / Golden Dragon** = les **trois Dragoon Magic spells canon de Kongol (Gold Dragoon)**. Belzac utilise ses propres sorts. Lien lore direct.

> Confirmation Wulves : **Enemy Magical formula** = `floor[MAT² × 5 / MDF] × Attack Multiplier`. Pour Belzac vs allié niveau X :
>
> - D-attack physique : Enemy Physical formula = `floor[178² × 5 / DF] × 1.0`
> - Grand Stream : `floor[71² × 5 / MDF] × 1.5`
> - Meteor Strike : `floor[71² × 5 / MDF] × 2.0`
> - Golden Dragon : `floor[71² × 5 / MDF] × 3.0`

### Trait passive

| Passive name (community) | Effect                                                                                                                 | Trigger                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| **Patterned Retaliate**  | **Ignore turn order** + Meteor Strike. **2nd trigger** = D-attack. **3rd trigger** = Golden Dragon. **Cycle repeats**. | Chance to trigger when targeted by attack |

> Pattern AI canon boss → cycle 3 abilities en réponse aux attaques. À porter en Damia avec data-model :
>
> - `boss.retaliate.chance: number` (probabilité par hit)
> - `boss.retaliate.cycle: Ability[]` (séquence d'abilities)
> - `boss.retaliate.cycleIndex: number` (état interne, persiste pendant le combat)
> - `boss.retaliate.ignoresTurnOrder: boolean`
>
> En real-time Damia : "turn order" → notion de cooldown / animation queue. À adapter.

## Counter opportunities (group 28)

Belzac peut counter **toutes** les opportunities d'addition non-protégées (group 28).

| User    | Addition           | Button Press counterable |
| ------- | ------------------ | ------------------------ |
| Dart    | Volcano            | 2                        |
| Dart    | Crush Dance        | 2, 3                     |
| Dart    | Moon Strike        | 2, 3                     |
| Lavitz  | Rod Typhoon        | 2, 3                     |
| Lavitz  | Gust of Wind Dance | 2, 5                     |
| Lavitz  | Flower Storm       | 2, 3, 4, 5, 6            |
| Rose    | Hard Blade         | 2                        |
| Rose    | Demon's Dance      | 3, 4, 5, 6               |
| Meru    | Cool Boogie        | 2, 3                     |
| Meru    | Cat's Cradle       | 3, 4                     |
| Meru    | Perky Step         | 2                        |
| Haschel | Summon 4 Gods      | 2                        |
| Haschel | Hex Hammer         | 2                        |
| Albert  | Gust of Wind Dance | 2                        |
| Albert  | Flower Storm       | 2                        |

Counter formula canon : `floor{floor[floor{floor[(AT² × 250 / DF)] / 100} × Target Fear × Attacker Fear] × Power}` (cf. [`../combat/additions.md`](../combat/additions.md)).

## Story / lore

### Contexte canon Dragon Campaign

(cf. [Bale folklore Noish](../locations/Bale.md#story--lore) — Emperor Diaz + 7 Dragon incarnations)

- Belzac est **un des 7 Dragon incarnations** servant Emperor Diaz pendant la Dragon Campaign (~11k ans avant les événements du jeu).
- Spécifiquement : Belzac = **Gold Dragoon** (Earth).
- **Human**, **31 ans** à l'époque, **210cm (geant)**, **royal family of Gloriano**.
- Après sa mort, le **Gold Dragoon Spirit** reste à Vellweb (mausolée des 4 Dragoons morts) jusqu'à ce que **Kongol** en hérite (Disc 2/3).

### Mort de Belzac (Chapter 2 flashback — Rose memory à Lidiera)

> Disc 2 cutscene canon — Rose se souvient du final battle de la Dragon Campaign :

1. Belzac **sauve Shirley** d'un **collapsing roof** (herculean strength pour soulever le toit)
2. Un **Virage** pierce Belzac avec sa griffe → mortellement blessé
3. Shirley promet que sa mort ne sera pas en vain, tire une flèche au Virage
4. Le Virage tire son **laser beam** simultanément → presumably kills both Belzac and Shirley

### Rencontre Vellweb (Chapter 4 — Disc 4)

Le party retourne à Vellweb pour **libérer les âmes des 4 anciens Dragoons morts** :

1. Belzac **mistakes Dart for Zieg** (initial reaction)
2. Rose révèle à Belzac qu'il est déjà mort
3. Belzac remembers Virage attack + Shirley sacrifice
4. **Frenzy of disbelief and denial** apprenant la mort de Shirley
5. **Forces le party à fight**
6. Upon defeat : "death is not as sad as I imagined", **thanks Rose**
7. Son âme est **freed → goes to Mayfil** (city of dead)

### Contradiction canon (non-résolue in-game)

⚠️ Multiple sources contradictoires sur **comment exactement Belzac meurt** :

- **Cutscene Disc 2 Rose memory** : Virage (classique) pierce Belzac + laser kills both
- **Forbidden Land Rose** : "this must be the Virage that killed Belzac" pointing at **Scarred Super Virage** (donc Super Virage = killer ?)
- **Belzac himself (Vellweb)** : "took the attack of **Super Virage** with my own body, to be the shield for Shirley" (confirme Super Virage)
- **Mais** la cutscene Disc 2 ne montre **pas** Super Virage — c'est **Kanzas qui combat Super Virage et se sacrifie** par self-destruct attack canon

→ Contradiction never resolved in-game. À noter dans `lore/dragon-campaign.md` futur. Pour Damia, prendre la version qu'on préfère (e.g. la plus cohérente cinématique : Virage standard).

### Clarification "7 anciens Dragoons" → "4 morts + 3 autres"

Fandom précise : **4 anciens Dragoons morts** pendant Dragon Campaign (souls à Vellweb). Donc les 7 anciens se répartissent en :

| Catégorie                      | Anciens Dragoons                                                                                                                         |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **4 morts (Vellweb souls)**    | Belzac (Gold), Damia (Blue-Sea), Syuveil (Jade), **Kanzas** (élément à confirmer — possiblement Violet/Thunder vu son self-destruct)     |
| **Survivants Dragon Campaign** | Zieg (Red-Eye, devient antagoniste), Rose (Dark, immortelle), Shirley (White-Silver, morte avec Belzac mais spirit au Shrine of Shirley) |
| **7ᵉ**                         | À confirmer — peut-être un de **Atlow** ou autre (wiki LoD listait Atlow à Vellweb). Possible que Shirley soit le 7ᵉ.                    |

> Notable : **Shirley meurt à la même bataille que Belzac** mais son spirit ne reste pas à Vellweb — elle a son propre **Shrine of Shirley** (Disc 1). Donc Vellweb = 4 souls (Belzac, Damia, Syuveil, Kanzas) + Shrine = 1 (Shirley) + Zieg/Rose vivants.

## Vision Damia

### Mode Story

- Boss fight Vellweb (Disc 4) — fidèle canon
- **Pré-combat** : cutscene Belzac mistakes Dart for Zieg + Rose reveals death + frenzy denial about Shirley → triggers fight
- **Trait Patterned Retaliate** = mécanique unique → data-model retaliate cycle réutilisable pour d'autres bosses
- **Scripted encounter** (0% escape)
- **Drop 100%** : Golden Stone (item canon)
- **Status immunity total** (8 statuts)
- **Post-defeat** : cutscene Belzac thanks Rose, soul freed → goes to Mayfil
- **Strategy hint canon** : haute MAT recommandée, **low MDF** côté Belzac → magie efficace. Mais **strong physical** côté Belzac → high physical defense crucial party.

### Backstory cutscene (Chapter 2 - Lidiera/Rose flashback)

Avant le fight Disc 4, le joueur voit déjà Belzac dans une **cutscene Disc 2 (Rose flashback)** : Belzac protégeant Shirley du collapsing roof + Virage attack. Donc Belzac apparaît dans le scenario Damia bien avant son boss fight Disc 4 — important pour la cohérence narrative.

### Mode Survival

- Belzac peut servir de **boss arena** dans une vague avancée
- Mécanique Retaliate cycle = signature visuelle / boss "telegraphe" ses 3 attacks → joueur apprend pattern
- En Modern Survival : possibles variations (élément différent, abilities supplémentaires, scaling)

### À implémenter (impact code)

- **Boss data-model** :
  - `BossDefinition extends EnemyDefinition` avec stats étendus
  - **Status immunity flags** (8 booleans, ou bitmask)
  - **Retaliate trait** (chance, cycle, ignoresTurnOrder)
  - **Scripted encounter** flag (0% escape)
  - **Counter group** field (1-28)
- **Attack Multiplier per ability** (déjà tracé en TODO — voir §Belzac confirmation)
- **Element abilities** distinct du boss element (Belzac=Earth, abilities = Earth ; cohérent canon)
- **Drop 100% items** (vs % drops pour minors)

## Liens code & doc

- **Source canon** : [`_sources/lod-wiki-belzac.md`](./_sources/lod-wiki-belzac.md)
- **Vellweb** (location) : `../locations/Vellweb.md` (à créer)
- **Kongol** (héritier Gold Dragoon) : `../party-members/Kongol.md` (à créer)
- **Dragon Campaign lore** : `../lore/dragon-campaign.md` (à créer) — 7 anciens Dragoons originaux
- **Damage formula** : [`../combat/damage-formula.md`](../combat/damage-formula.md) (Attack Multiplier per ability)
- **Elements** : [`../combat/elements.md`](../combat/elements.md) (Earth element)
- **Additions** : [`../combat/additions.md`](../combat/additions.md) (counter group 28)
- **Status effects** : `../combat/status-effects.md` (à créer — 8 statuts canon)
- **Items** : `../items/` (à créer — Golden Stone)

## Questions ouvertes

- ✅ **Belzac vivant ou esprit ?** — **RÉSOLU** : esprit. Belzac mort ~11k ans pre-game. À Vellweb, son **âme se manifeste** comme boss spectre (mistakes Dart for Zieg, denial sur Shirley). Post-defeat, **soul freed → goes to Mayfil**.
- **Golden Stone** — item canon (drop 100%). Effet ? Lien avec Dragoon Spirit Kongol ? À documenter dans `items/` futur.
- **Retaliate cycle real-time adaptation** — comment porter "ignore turn order" en Damia real-time ? Idée : boss execute retaliate ability **immédiatement** après être touché (interrupt sa propre animation/cooldown courante).
- **Patterned Retaliate trigger chance** — wiki ne précise pas le % exact. À confirmer source tier 1.
- **Lien Kongol-Belzac** — moment exact du transfer Gold Spirit canon ? Lien narratif disc 2/3 (probablement Disc 2 Kongol join party post-Doel fight).
- **Divergence stats wiki LoD vs fandom** — HP 16k vs 18k(US)/25k(JP), AT 178 vs 200, MAT 71 vs 80, SPD 50 vs 70. Quelle est la source canon exacte ? Possible que JP version ait des stats différentes.
- **Contradiction canon mort de Belzac** — Virage standard vs Super Virage. Pour Damia, choisir une version (cohérence narrative). Recommandation : Virage standard (cohérent cinématique Disc 2).
- **7ᵉ ancien Dragoon identity** — Belzac/Damia/Syuveil/Kanzas + Shirley/Rose/Zieg = 7. Atlow (wiki LoD boss Vellweb) = quoi ? Confirmation tier 1 + ingestion pages Vellweb/Atlow.
- **Lore Gloriano nation** — Belzac de la royal family de Gloriano. Nation à documenter dans `lore/`. Lien possible avec Mille Seseau ou autre nation Disc 3 ?
- **Soul mechanic canon** — Dragoons morts → souls à Vellweb → libérées → Mayfil. Mécanique narrative à orchestrer (cf. Lavitz spirit at Mayfil aussi). Cohérent pattern "deceased Dragoons gather at Mayfil".
