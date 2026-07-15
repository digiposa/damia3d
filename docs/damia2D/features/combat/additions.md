# Additions

> Système d'attaques chaînées TLoD — QTE-based en canon PS1, adapté real-time en Damia.
>
> **Sources canon** (par tier) :
>
> - 🥇 [`_sources/wulves-tlod-damage-formulas.md`](./_sources/wulves-tlod-damage-formulas.md) — Wulves, formules numériques
> - 🥈 [`_sources/lod-wiki-additions.md`](./_sources/lod-wiki-additions.md) — wiki LoD, source la plus exhaustive (28 additions, formules, counters, groups, tables hit/multiplier)
> - 🥉 [`_sources/fandom-additions.md`](./_sources/fandom-additions.md) — fandom, narratif + lore + trivia + tutorial NPC Tasman

## Statut

🟡 **draft** — partiellement implémenté côté code Damia. Données complètes (28 additions, hit data, multipliers per level) en `src/data/balance.ts`. Système simplifié vs canon (pas de QTE, pas de counterattacks).

## Canon PS1 — résumé

### Définition

**Additions** = attaques nommées chaînant plusieurs hits via **quick time events** successifs. Chaque input réussi :

- Augmente les dégâts (via multiplier per-level)
- Augmente le SP gagné (uniquement pour characters ayant Dragoon Spirit)

**Exceptions** :

- **Shana & Miranda** n'ont **pas** d'Additions
- **Lavitz & Albert** partagent les **mêmes Additions** (différent rhythm + counter opportunities)

Initiated par la **commande "Attack"** en battle.

### QTE — timing sight

Quand une Addition commence :

1. Carré bleu **stationnaire** sur la cible
2. Carré plus grand qui **rotate et collapse** vers le premier
3. **Input** (généralement **X**) au moment de l'overlap
4. **Feedback couleur** :
   - **Blanc** = perfect
   - **Bleu** = too slow
   - **Gris** = too fast
5. **Failure** → fin du chain, dégâts perdus
6. Alternative : icône bouton qui change → presser au bon moment

### Levels

- Démarrent **level 1**, max **level 5**
- **20 successful performances** = +1 level
- Level applied **après la fin du combat** (pas during) — important : entrer en combat à 19 perfs reste level 1 quoi que tu fasses
- Niveau ↑ peut augmenter **dégâts**, **SP gain**, ou **les deux**
- Pas changeable in-battle (uniquement Additions menu en System Screen)

### Accessoires Wargod

| Accessoire          | Effet                                                                             | Prix canon                                     |
| ------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------- |
| **Wargod Calling**  | Auto-complete Addition mais : **½ damage**, **½ SP**, **ne level pas** l'Addition | **1,000 G** (Lohan ou Fletz)                   |
| **Ultimate Wargod** | Auto-complete Addition avec **full damage + SP + leveling** retenus               | **10,000 G** (Lohan) OU rare drop Phantom Ship |

### Counterattacks

Enemies peuvent **counter** une Addition mid-chain :

- Signaux : **flash rouge**, **whooshing sound**, **pause**, timing sight devient **rouge**
- Bouton requis : **O (Circle)** au lieu de X
- **Success** → l'Addition reprend
- **Failure** → l'Addition se termine + character prend les dégâts du counter

**Formule Addition Counter** :

```
floor{floor[floor{floor[(AT² × 250 / DF)] / 100} × Target Fear × Attacker Fear] × Power}
```

(_attacker_ = enemy countering ; _target_ = character countered)

**Règles de comportement** :

- Max **1 counter par Addition**
- **Jamais** sur le first ou last press → Additions ≤ 2 presses ne sont **jamais** counter
- Certains enemies refusent de counter même quand possible
- Certains enemies ne peuvent pas counter du tout

**Additions jamais counterable (canon)** — utile pour design balance Damia :

- **Toutes les additions Kongol** (Pursuit, Inferno, Bone Crush)
- **Madness Hero** (Dart)
- **Blazing Dynamo** (Dart)
- **5-Ring Shattering** (Haschel)
- **Omni-Sweep** (Haschel)
- **Hammer Spin** (Meru)
- Toute addition à 1-2 inputs (corollaire de la règle "jamais first ou last press")

### Groupes de counters

10 groupes : **28** (toutes opportunities), 23, 19, 16, 13, 9, 4, 3, 2, 1. Higher group = superset des lower groups. Détails complets dans [`_sources/lod-wiki-additions.md`](./_sources/lod-wiki-additions.md) (28 opportunités sur 6 characters).

**Mob counters Damia déjà connus** (canon wiki) :

| Mob (Damia)         | Group canon | Counters possibles                                                                                                                                                                       |
| ------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Berserk Mouse       | 28          | Tous                                                                                                                                                                                     |
| Goblin              | 28          | Tous                                                                                                                                                                                     |
| Trent               | 28          | Tous                                                                                                                                                                                     |
| Assassin Cock       | 19          | Subset (Volcano:2, Crush Dance:2, Hard Blade:2, Cool Boogie:2-3, Cat's Cradle:3, Perky Step:2, Summon 4 Gods:2, Gust of Wind Dance:2, Flower Storm:2-3-4-5-6 partial, Demon's Dance:4-5) |
| Fruegel (1st & 2nd) | 28          | Tous (boss)                                                                                                                                                                              |

### Formule de dégâts

```
floor[floor{floor[floor{floor[round{floor[floor{[hit 1 + ... + hit n] × Multiplier / 100} × AT / 100] × (LV + 5) × 5 / DF} × Target Fear × Attacker Fear] × Power} × Field] × Element} × Destroyer Mace]
```

**Variables** :

- `hit n` = valeur per-hit canon (Damia : déjà en `balance.ts`, table complète dans `_sources/`)
- `Multiplier` = valeur cachée per-level (table per archetype × level 1-5)
- `AT`, `DF`, `LV` = stats joueur classiques
- Modifiers wrapper standard ([`elements.md`](./elements.md), [`damage-modifiers.md`](./damage-modifiers.md) à venir)

**Note canon** : pour un perfect addition maxed, on peut remplacer `{[hits] × Multiplier / 100}` par le **DMG%** affiché dans le menu Additions.

### Liste des Additions par character

Les 28 additions canon réparties sur 6 archetypes. **Wulves doc** + **wiki LoD** sont alignés sur :

- Liste exacte
- Number of presses
- Acquisition (per character level threshold)
- DMG% maxed
- SP maxed
- Hit data tables
- Multiplier tables (per level)

Détails complets dans [`_sources/lod-wiki-additions.md`](./_sources/lod-wiki-additions.md).

**Note** : `*` dans le wiki = Addition jamais counter (généralement les 1-2 press qui n'ont pas d'opportunity, OU certaines marquées explicitement). Cette info est utile pour le design Damia (priorisation des additions safe).

### Trivia voice lines + naming (canon)

Certaines additions ont une voice line distincte selon l'avatar qui les exécute, même si l'addition affichée à l'écran a le même nom :

- **Flower Storm** (Lavitz / Albert, Jade Dragon) — version EN : Lavitz dit **"Rose Storm"** vocalement ; Albert dit **"Blossom Storm"** vocalement. Texte affiché : wiki LoD use "Flower Storm" ; fandom écrit "Blossom Storm" pour Albert dans sa table — léger conflit naming entre sources, le **texte affiché in-game est "Flower Storm"** au final, les voice lines diffèrent. Version JP unifie : both say **"Cherry Blossom Blizzard"** (桜の吹雪 _sakura fubuki_).

- **"Flurry of Styx"** (Haschel) — **typo canon**. Vrai nom : **"Ferry of Styx"** (référence à la River Styx + River Sanzu canon japonais). Le combo display name à la fin affiche **"Ferry of Styx"** correctement, mais Haschel **dit "Flurry of Styx"** vocalement. Pattern : Haschel's additions are all named after the number of hits / numerology.

→ Implication Damia : prévoir un **mapping voice clip par avatar × addition** + **gestion display-name vs voice-line** (cf. [`TODO.md`](../../TODO.md)).

### Trivia gameplay & balance (canon)

- **Kongol scripted counter** : aux combats vs Kongol (boss) — Hoax, Black Castle, et phase 1 final boss — un addition raté déclenche un **counter scripté** de Kongol qui inflige des dégâts. À porter si on respecte le canon des boss fights Kongol.
- **Meru = damage cap canon** : Perky Step Lv5 = **600% damage multiplier**, le plus haut du jeu. SP cap : Pretty Hammer + Wargod's Sash + Cool Boogie mastered = **495 SP par addition**.
- **Lavitz = fastest learner** : Spinning Cane Lv5, Rod Typhoon Lv7, Gust of Wind Dance Lv11. Joins at Lv3.
- **Meru = slowest learner** : Cat's Cradle à Lv30.
- **Initial addition guarantee** : chaque character a 150%+ damage et 34+ SP à Lv5 sur son initial addition. Permet de "beat the game" en mode minimal-additions.

### Dragoon Additions (mécanique canon distincte)

Hors-scope du présent fichier (additions player normales), mais brève mention canon car le système est conceptuellement proche :

- En form Dragoon, le character utilise la **Dragoon Addition** comme attaque par défaut (vs normal "Attack")
- Mécanique visuelle canon : **light rotating clockwise dans un cercle** (style horloge), presser X **quand la lumière est au top**
- **Vitesse augmente à chaque input réussi** (chaque press devient plus difficile)
- **Max inputs** :
  - 🥇 **Wulves doc** : 5 Successful Inputs (Kongol limité à 4)
  - 🥉 **Fandom** : 4 correct inputs (général)
  - → **Divergence non-résolue** — wiki LoD n'a pas de section dédiée Dragoon Addition. À vérifier tier 1 (Discord). Hypothèse : "4 correct inputs **après** le strike initial" = 5 presses totales = aligne Wulves. Tracé dans [`TODO.md`](../../TODO.md).
- Formule canon : `round{floor[floor{[0.05·Sᵢ² − 0.05·Sᵢ + 1] × 100 × DRGNAT%/100} × AT/100] × (LV+5) × 5 / DF}` (cf. [`damage-formula.md`](./damage-formula.md))

**Implication Damia (form Dragoon)** : Damia ne porte pas la Dragoon Addition canon (Q1 décision = auto-complete + form Dragoon = splash AoE cône 120°, cf. [`../dragoons/`](../dragoons/)). Donc cette divergence canon est **académique** pour notre impl actuelle, mais à tracer pour cohérence doc.

### Tutorial canon

**Master Tasman à Seles** est le NPC tutorial qui explique le système Additions au joueur. À noter pour `locations/Seles.md` (futur) et `quests/disc1-seles-tutorial.md` (à créer si pertinent). Damia : si on garde le tutorial, c'est l'occasion d'expliquer notre adaptation auto-complete + skill cooldown.

## Vision Damia

### Synthèse — comportement cible Damia

Vision posée 2026-05-18, à respecter à l'impl :

- **Auto-complete des additions** (cf. décision Q1) — pas de QTE, l'addition joue son animation complète et inflige son perfect damage canon
- **Level up jusqu'à 5** suivant le canon :
  - 20 successful uses (performances) = +1 level, max Lv 5
  - Multipliers de dégâts canon par level (tables Wulves/wiki — déjà en `balance.ts`)
  - Gain de SP canon par level (déjà en `balance.ts`)
  - Compteur de performances **cappé à 99** (canon : le compteur affiché s'arrête à 99 même si on continue à utiliser l'addition ; le level est cappé à 5 dès 80 uses)
- **Choix de l'addition active** par character (déjà implémenté code Damia — UI / picker)
- **Unlock progressif** des additions par **character level** en Mode Story (cf. tables d'acquisition par character — Dart Volcano @Lv2, Crush Dance @Lv15, etc.)
- **Final addition** (Master Addition canon) débloquée après avoir **maîtrisé toutes les autres** du character (canon : "Perform all prior additions 80 times")
- **Shana / Miranda** = exception canon :
  - **Pas d'addition** (canon respecté)
  - Utilisent un **arc** comme arme (Archer / Bow)
  - **Gain SP scale avec le DLV** (Dragoon Level) — cohérent VISION §6.2 (35→150 SP par auto-attack entre DLV 1 et 5, source wiki Shana)

### Mode Survival vs Story

| Aspect                  | Story mode                             | Survival mode                            |
| ----------------------- | -------------------------------------- | ---------------------------------------- |
| Unlock additions        | Progressif par character level (canon) | Méta-progression (méta-unlocks via runs) |
| Level up additions      | Performances tracked across runs/saves | Performances reset par run (à confirmer) |
| Final / Master addition | "Maîtriser toutes les autres" (canon)  | Méta-unlock ou drop reward (à voir)      |
| Choix active            | Menu System Screen (canon)             | Quick-pick in-run / loadout              |

### État actuel (impl partielle)

**Déjà en code** (cf. inventaire combat) :

- 28 Additions définies dans `src/data/balance.ts:L246–551` (6 archetypes)
- Component `Addition` : `{ kind, targetId, elapsedMs, totalMs, hitsApplied, hitsLanded, level, dirX/dirY }`
- `AdditionSystem` : drives animation, applique damage à chaque hit timing (~200ms intervals)
- `SkillCooldown` per-skill (mécanique Damia, pas canon)
- Multipliers per level 1-5 + SP gain per level snapshot au trigger
- 20-uses-per-level threshold (aligné canon)
- Voice line à la complétion si final hit landed
- Formule `computeAdditionDamage` per-hit dans `src/gameplay/damage.ts`
- Auto-complete (cf. Q1)
- Level up immediate (cf. Q5)

**À vérifier / compléter** :

- ❓ Cap performances à 99 (canon) — vérifier le comportement actuel du compteur
- ❓ Unlock progressif par character level (Mode Story) — déjà implémenté ?
- ❓ Master Addition gating (debloquée après les autres) — déjà implémenté ?
- ❓ Shana/Miranda : pas d'addition + arc + SP scale DLV — état du code ?
- ❓ Lavitz → Albert inheritance state — déjà géré ?
- ❓ Different damage formula sum-first vs per-hit (acté per-hit pour UX, vs canon sum-first — cf. damage-formula.md §Décisions)

**Pas en code** (gaps acceptés vs canon) :

- ❌ QTE / timing sight (real-time = pas de QTE possible — décision Q1 Option A)
- ❌ Feedback white/blue/gray (sans QTE, sans pertinence)
- ❌ **Counterattacks** (skip pour l'instant, cf. Q2 — idée future à explorer)
- ❌ **Wargod Calling / Ultimate Wargod** canon (à reframer Damia, cf. Q3)
- ❌ Level applied **after battle** (Damia : immediate, cf. Q5)
- ❌ Différenciation gameplay Lavitz vs Albert (acté Q4 : identiques, skins différents)

### Décisions impl (tranchées 2026-05-18)

#### Q1 — QTE timing en real-time : ✅ **Option A retenue — Auto-complete**

Toutes les additions s'auto-complètent en Damia (état actuel du code conservé). Simplification du gameplay, pas de friction QTE en real-time iso.

**Idée d'enrichissement futur** : réfléchir à une **mécanique fun cohérente 2D iso action** d'inputs joueur pendant l'animation, notamment pour le **mode Survival** (potentiellement Modern). Pistes :

- Timing-based key tap pendant la fenêtre d'animation
- Combo direction (flèche / swipe correspondant à la direction du hit)
- Bonus damage / SP scalant sur N inputs réussis (cohérent canon)

→ Tracé dans [`TODO.md`](../../TODO.md) comme idée à explorer.

#### Q2 — Counterattacks : ✅ **Skip pour l'instant**

Pas d'implémentation du counter Addition canon (red flash + circle button + Counter formula). Le système reste simple : Addition lancée = anim joue jusqu'au bout sans interruption ennemie.

**Idée d'enrichissement futur** : réfléchir à une **mécanique fun de risque/récompense** cohérente real-time iso. Pistes :

- "Parry window" : touche dédiée à presser quand l'enemy déclenche un signal visuel pendant l'addition
- "Block press" : maintenir une touche pendant phases vulnérables
- Mob ability "interrupt" qui force le joueur à esquiver
- Mode Modern Survival = perk débloquable

→ Tracé dans [`TODO.md`](../../TODO.md).

#### Q3 — Wargod Calling / Ultimate Wargod : ✅ **Reframer en mécanique différente, liée aux additions**

Les items canon perdent leur sens vu Q1 (auto-complete par défaut). On **garde le concept** "accessoires liés aux additions" mais avec une **mécanique différente Damia** à concevoir.

Pistes (à valider au moment du design `items/equipment.md`) :

- **Ultimate Wargod** → bonus damage multiplier (e.g. ×1.2) OU SP gain bonus (e.g. ×1.5) OU réduction cooldown skill
- **Wargod Calling** → trade-off (e.g. cooldown réduit mais ½ damage)
- Garder les noms canon, redesigner les effets pour rester intéressants en Damia

→ Décision exacte différée au moment d'implémenter l'équipement.

#### Q4 — Lavitz vs Albert (et Shana vs Miranda) : ✅ **Identiques gameplay, héritage narratif**

**Mode Story** :

- Pas de différence gameplay / stats entre Lavitz et Albert (idem Shana / Miranda).
- Albert **hérite** de tout l'état de Lavitz à la mort de ce dernier : niveau d'apprentissage des additions, stats, XP, DLV.
- Idem Miranda hérite de Shana en Disc 3.
- Pattern canon = **inherited_from_predecessor** (cf. archetypes acquisition Dragoon).

**Mode Survival** :

- Lavitz, Albert, **Greham**, **Syuveil**, etc. = **skins différents** du même archetype (**Jade Dragoon**).
- Tous unlockables via méta-progression. Stats / additions identiques (puisque même archetype).
- Greham en mode Story reste un **boss** avec son propre skillset (gameplay distinct du Jade Dragoon archetype joueur).

**Pattern architectural** (cf. [VISION §6.6](../../VISION.md#66-personnages-partagés-skins)) :

- **Archetype** (`DragoonArchetype`) = mécanique partagée (stats curves, additions, magic, élément, DLV)
- **Avatar** (`CharacterAvatar`) = variante perso (sprite, voix, lore) sans impact mécanique
- Story mode : un seul avatar de l'archetype actif à la fois (substitutions canon)
- Survival mode : tous avatars unlockés sélectionnables, peu importe story-canon ou skin

→ Pas d'action design supplémentaire pour Damia : conserver l'archi `Archetype + Avatar` (déjà partiellement implémentée).

#### Q5 — Level up timing : ✅ **Option A — Immediate**

Level up s'applique **immédiatement** quand le seuil de 20 performances est atteint (comme Diablo 2). Pas de logique "applied after battle" du canon PS1.

**Rationale** : cohérent gameplay real-time action-RPG (pas de notion stricte de "fin de combat" en arena/survival), feedback immédiat plus satisfaisant.

#### Q6 — Performances tracked past level cap : ❓ **À clarifier**

> _Question reformulée pour clarté_

**"Performance"** ici = une **utilisation réussie** d'une Addition (i.e. addition complétée avec succès). Le canon compte les performances : **20 performances** = +1 level, jusqu'au max level 5 (donc 100 performances totales pour passer de Lv 1 à Lv 5).

**Question** : une fois l'Addition au max level 5, continue-t-on à compter les uses ?

- **a)** Cap dur à 100 (compteur s'arrête au max level, plus rien tracké)
- **b)** Compteur continue (utile pour stats / achievements / méta-progression Survival ?)

→ À trancher.

#### Q7 — Bug wiki Albert Dmg%/SP colonnes inversées : ✅ **Typo wiki confirmé**

User a confirmé : Albert a **exactement les mêmes stats** que Lavitz (puisque archetype Jade Dragoon partagé). L'inversion Dmg%/SP dans la table Albert wiki est une typo. À utiliser la table Lavitz comme référence pour les deux.

## Décisions & rationale

| Décision                                               | Pourquoi                                                                                                |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Per-hit damage (au lieu de sum-first canon)            | UX temps réel : 1 floating number par hit = feedback visuel meilleur (déjà acté dans damage-formula.md) |
| 28 additions complètes par archetype                   | Respect canon. Données déjà en `balance.ts`.                                                            |
| Skill cooldown per-addition (innovation Damia)         | Pas de canon. Nécessaire en RT pour éviter spam. Pas un nerf, juste un fit avec le gameplay temps réel. |
| Décision QTE / counters / Wargod = à trancher ensemble | Ces 3 mécaniques sont liées au flow d'input — décision atomique recommandée.                            |

## Spec technique (impl actuelle)

### Components

```ts
Addition {
  kind: AdditionKind,  // 28 enum values
  targetId: EntityId,
  elapsedMs: number,
  totalMs: number,
  hitsApplied: number,
  hitsLanded: number,
  level: 1 | 2 | 3 | 4 | 5,
  dirX: number,
  dirY: number,
}

SkillCooldown {
  remainingMs: Partial<Record<AdditionKind, number>>,
}
```

### Systems

- **AdditionSystem** (`src/gameplay/systems/AdditionSystem.ts:L19-117`) : drives animation, applique damage à chaque `hitTiming` checkpoint (~200ms intervals). Per-hit `computeAdditionDamage` call. Tick SkillCooldown. Voice line à la complétion iff final hit landed.

### Data

- **`src/data/balance.ts:L246-551`** : 28 additions × 6 archetypes
  - `hits[]` per addition (table verbatim wiki)
  - `multipliers[1..5]` per addition (table verbatim wiki)
  - `spGains[1..5]` per addition
  - `timings`, `cooldown`, etc.

### Formule (rappel)

```ts
computeAdditionDamage(world, attackerId, targetId, hitValue, multiplier): number
// Per-hit ; somme finale ≈ canon perfect à ±1 (floor truncation)
```

## Liens code

- **Component Addition** : `src/gameplay/components/Addition.ts`
- **AdditionSystem** : `src/gameplay/systems/AdditionSystem.ts`
- **SkillCooldown** : `src/gameplay/components/SkillCooldown.ts`
- **Data** : `src/data/balance.ts:L246` (Addition definitions)
- **Damage formula** : `src/gameplay/damage.ts` (`computeAdditionDamage`)

## Liens doc

- **Source canon wiki** 🥈 : [`_sources/lod-wiki-additions.md`](./_sources/lod-wiki-additions.md)
- **Source canon Wulves** 🥇 : [`_sources/wulves-tlod-damage-formulas.md`](./_sources/wulves-tlod-damage-formulas.md)
- **Damage formula** : [`damage-formula.md`](./damage-formula.md)
- **Elements** : [`elements.md`](./elements.md) (modifier Element & Field)
- **Dragoons** : [`../dragoons/`](../dragoons/) (Dragoon Additions séparées en form Dragoon, autre mécanique)
- **Items / Wargod accessories** : [`../items/equipment.md`](../items/equipment.md) (à créer)
- **Bosses / counter groups** : `../bosses/` (à créer — counter group par boss)

## Questions ouvertes (à trancher pour impl complète)

- [ ] **QTE / timing mechanic en real-time** (option A/B/C/D) — voir §Vision Damia Q1
- [ ] **Counterattacks** — porter (α/β/γ/δ) ou skip ? — voir Q2
- [ ] **Wargod Calling / Ultimate Wargod** — porter, reframer, ou skip ? Dépend Q1.
- [ ] **Lavitz vs Albert différenciation** — si pas de counters → fonctionnellement identiques. Désirable ?
- [ ] **Level applied after battle vs immediate** — vérifier code Damia + acter design
- [ ] **Performances tracked past cap** (level 5) — comportement canon vs Damia ?
- [ ] **Albert Dmg% / SP table** : wiki avait colonnes inversées (Dmg vs SP) — vraisemblablement preserved bug ; à vérifier
