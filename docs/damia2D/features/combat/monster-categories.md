# Monster Categories — taxonomy canon TLoD

> ⭐ **Taxonomy officielle canon TLoD** fixée par wiki LoD Bosses master page. Distinction Minor Enemies / Rare Monsters (subset Minor Enemies) / Bosses / Boss Extras canon.
>
> **Sources** :
>
> - 🥈 [`../bosses/_sources/lod-wiki-bosses-master-table.md`](../bosses/_sources/lod-wiki-bosses-master-table.md) — wiki LoD master Bosses page (definition canon Bosses + taxonomy 4 catégories)

## Statut

🟢 **Canon documenté wiki tier 2** — taxonomy fixée officielle.

## ⭐ Décision Damia — adopter stats JP canon ⭐

**Décision projet Damia** : adopter les **stats JP canon** (vs US/EU) pour Damia. Pattern JP +25% HP / ÷3 Gold systématique = **mob/boss plus challenging** = **gameplay action plus intéressant** (cohérent vision Damia action 2D iso PixiJS).

⚠️ **Décision per-mob / per-boss case-by-case** : certains ennemis garderont US si JP problématique balancing. À évaluer ingestion finale + playtest.

### Impact data-model

```ts
type MonsterStats = {
  hp: number; // JP value canon Damia (default)
  hpUS?: number; // US/EU value reference (fallback case-by-case)
  gold: number; // JP value canon Damia
  goldUS?: number; // US/EU reference
  // ... autres stats JP-prioritized
};
```

### Pattern divergences canon JP vs US

- **HP** : JP +25% systematic (Beastie Dragon US 336 / JP 420, Berserk Mouse US 2 / JP 4, Berserker US 400 / JP 500, etc.)
- **HP extrême** : Imago US 12k / JP 20k (+67%), Melbu Frahma US 42k / JP 60k (+43%), Belzac US 18k / JP 25k (+39%)
- **Gold** : JP ÷3 systematic (Berserk Mouse US 3 / JP 1, Berserker US 15 / JP 5)
- **Stats AT/MAT** : occasional fandom higher (probable JP closer)

→ Pattern Damia : **stats JP prioritized** = mob/boss hits harder + HP plus haut + Gold plus rare = **gameplay action plus dur + grind plus rewarding**.

## Definition canon Boss

> Encountered only once through scripted events, Bosses are powerful foes immune to all status ailments and carry enough narrative weight to standout from typical enemies. While most Bosses must be defeated to progress the story, **optional Bosses** instead provide extra side stories or rewards.

### Critères canon Boss

- **Scripted events** (vs random encounter)
- **Immune all 8 status ailments** systematic (Petrify/Bewitch/Arm Block/Dispirit/Confuse/Fear/Poison/Stun)
- **Narrative weight** : standout from typical enemies
- **Required** (story progression) OR **Optional** (side story / reward)

## Taxonomy canon 4 catégories ⭐

| Catégorie              | Encounter type               | Status immunity                | Counter Additions | Susceptible Total Vanishing/Pandemonium ? | Examples canon                                          |
| ---------------------- | ---------------------------- | ------------------------------ | ----------------- | ----------------------------------------- | ------------------------------------------------------- |
| **Minor Enemy**        | Random battle                | 4/4 ou 5/3 ou 6/2 (deviations) | 0 / 9 / 19 / 28   | ✅ **Oui**                                | Assassin Cock, Berserker, Berserk Mouse, Beastie Dragon |
| **Rare Monster** ⭐    | Random battle (subset Minor) | All 8 ✔                        | 28 systematic     | ✅ **Oui** (probable)                     | Blue Bird, Yellow Bird, Red Bird, Rainbow Bird, OOPARTS |
| **Boss**               | Scripted event               | All 8 ✔ systematic             | varies            | ❌ **Non** (probable)                     | Feyrbrand, Lenus, Divine Dragon, Melbu Frahma           |
| **Boss Extras** ⭐ NEW | In Boss encounters           | varies                         | varies            | ?                                         | (à investiguer — Virage Body/Arm pieces ? Adds ?)       |

## Minor Enemies canon

> All random battles, **susceptible to items like Total Vanishing or Pandemonium**.

### Pattern canon

- **Encounter type** : random battles (submap OR World Map road)
- **Counter Opportunities** : 0 / 9 / 19 / 28 tiers (mid Disc 1-4)
- **Status Immunity** : pattern deviations 4/4 standard (Assassin Cock) OU 5/3 (Berserk Mouse Fear+) OU 6/2 (Berserker Confuse+Fear+)
- **Susceptible Erase Attack Items canon** : Total Vanishing / **Pandemonium** ⭐ NEW / Demon's Gate probable

### Rare Monsters = SUBSET canon ⭐ MAJEUR

> For Minor Enemies who appear in random battles but possess special resistances to damage, see **Rare Monsters**.

- **Rare Monster = Minor Enemy with special damage resistances** canonical wiki tier 2
- Pas une catégorie séparée mais une **sous-classe Minor Enemy** avec passives canon
- 5 Rare Monsters confirmés canon (cohérent existing `_sources/lod-wiki-additions.md:154`) : **Blue Bird + OOPARTS + Rainbow Bird + Red Bird + Yellow Bird**

### Rare Monster passive effects canon ⭐

- **Damage Mitigation** : Physical damage → forced to 1 (exceptions : Attacker Fear + Destroyer Mace)
- **Magical Immunity** : Magical damage → forced to 0
- **Status Immunity all 8 ✔** boss-tier (vs Minor Enemy deviations)
- **High SPD** (Blue Bird 120 highest seen)
- **High A-AV** (Blue Bird 50% NEW)
- **EXP-only reward design** (Gold 0, Drops Nothing) — pattern "metal slime" canon

### Rare Monster AI canon

- **Rare Attack** : 10% target Max HP physical, **bypasses defense**, only Guarding + Target Fear modifiers apply
- **Run away!** : self-removes from combat, no EXP/gold/item reward
- **Escape 100% player** : always escapable
- **No location encounters** : World Map road exclusive canon

## Bosses canon

> Encountered only once through scripted events. While most Bosses must be defeated to progress the story, optional Bosses instead provide extra side stories or rewards.

### Pattern canon

- **Encounter type** : scripted (story event OR optional side trigger)
- **Status Immunity** : all 8 ✔ systematic (boss-tier)
- **Escape disabled** ⭐ canon fandom — `Escape command disabled boss fights`
- **No respawn** ⭐ canon fandom — pattern same boss in same circumstances impossible
- **Susceptible Total Vanishing/Pandemonium** : ❌ NO (probable — Bosses immune Erase Attack Items)
- **Narrative weight** : story-relevant entity
- **Reward** : EXP variable (Disc 1 ~300 → Disc 4 final 0 Melbu Frahma to 20k Magician Faust Optional) + Gold + drops parfois 100% boss-locked
- **Multi-part bosses canon** : Virage (Head/Body/Arm), Divine Dragon (Cannon/Ball), Polter (Helm/Armor/Sword), Caterpillar (forme 3-phase), Michael (+ Core)

### Two types canon ⭐ MAJEUR (fandom clarification)

| Type           | Caractéristique canon                                            | Examples                                                            |
| -------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Minor Boss** | Drop Gold (small amount)                                         | Fruegel Hellena Breakout (20 Gold), Sandora Elite (50), Drake (100) |
| **Major Boss** | Big part of story line, more challenging, **lots of Experience** | Faust 20k EXP, Divine Dragon 10k EXP, Zieg Feld 20k EXP             |

⚠️ **Exceptions canon** : **Hero Competition contestants + Crafty Thief = Minor Bosses sans Gold drop** (0 Gold) — pattern exception fandom.

### Required vs Optional canon

- **Required bosses** : progress story (Fruegel, Kongol, Doel, Lloyd, Melbu Frahma, etc.)
- **Optional bosses** : side stories / rewards canon :
  - **Kamuy** (Evergreen Forest Disc 2)
  - **S Virage Kadessa ×3** (Disc 3)
  - **Magician Faust Optional rematch** (Flanvel Tower Disc 3, 20k EXP / 10k Gold)
  - **Polter Helm/Armor/Sword** (Snowfield Disc 3)
  - **Belzac / Damia / Kanzas / Syuveil** (Vellweb Disc 3, 4 Dragoon Knights — Stone drops)
  - **Mayfil Ghost Dragon Spirits ×3 pairs** (Disc 4)
  - **Lavitz's Spirit + Zackwell** (Mayfil Disc 4)

## Boss Extras canon ⭐ NEW MAJEUR — CONFIRMED canonical 4th category ⭐⭐

> For enemies who appear in Boss encounters but are **neither Minor Enemies nor Bosses**, see **Boss Extras**.

⭐ **CONFIRMÉ wiki tier 2 ⭐⭐ MAJEUR** : Crafty Thief (Barrens with Mappi) ingestion wiki dit explicitly :

> "Note: The Crafty Thieves that appear with Mappi are **not Minor Enemies, and instead categorized as Boss Extras**."

→ **Boss Extras = canonical 4th category distinct canon TLoD**. Damia adopt wiki tier 2 strict canonical taxonomy (resout fandom umbrella interpretation "minions = bosses").

### Boss Extras characteristics canon ⭐

- **Companion to main boss** : spawned alongside boss in scripted encounter
- **Status Immunity all 8 ✔ boss-tier** systematic (cohérent boss-tier immunity)
- **EXP 0 / Gold 0** typical (main boss yields rewards)
- **Counter 28** standard high-density tier
- **Escape allowed** parfois (vs Boss Escape 0% strict)
- **Specific passive vulnerabilities possible** : ex. Magic Sig Stone Vulnerability (Crafty Thief Barrens)
- Examples confirmed canon : **Crafty Thief (Barrens with Mappi)** ⭐ first ingestion ; autres bosses multi-part probable (Mappi adds, etc.)

### Pattern adoption Damia

- **Wiki tier 2 prévaut canonical** : Boss Extras 4ème catégorie distincte
- Fandom interpretation "boss minions counted as bosses" = approximative, wiki granular prévaut
- Pattern Damia : `MonsterCategory = 'boss-extras'` distinct des autres 3 categories

### Pattern boss minions canon (fandom umbrella interpretation rejected)

⚠️ Pattern Damia adopt wiki tier 2 strict :

- Boss minions in boss fights = **Boss Extras canonical** (NOT subset Boss)
- Fandom "minions = bosses" interprétation = imprécis, wiki tier 2 distingue Boss Extras separate

## Unique Monsters (Jars) — catégorie SÉPARÉE distincte Rare Monster canon ⭐

⚠️ **Distinction terminology canon Damia** :

- **Rare Monsters** (wiki tier 2) = subset Minor Enemy Counter **28** : Birds + OOPARTS
- **Unique Monsters / Jars** (existing damia canon, Counter **16**) = Lucky Jar + Cursed Jar + Treasure Jar — separate category
- **Fandom terminology** = "Unique Monster" umbrella (inclut Birds + Jars), Damia adopt wiki tier 2 granular

### Jars pattern canon

- **HP minimal** (Lucky Jar 6, Treasure Jar similar)
- **Only vulnerable to specific status** (Lucky Jar Poison only, Rainbow Bird Confusion only)
- **Counter Opportunities 16** (different tier from Rare Monsters 28)
- **EXP-only reward + 1 specific drop** (Lucky Jar Moon Serenade)

## Implémentation Damia

### Data-model `MonsterCategory`

```ts
type MonsterCategory =
  | 'minor-enemy' // standard random mobs
  | 'rare-monster' // subset Minor Enemy with passives canon (Birds, OOPARTS)
  | 'unique-monster-jar' // Jars category (Counter 16, status-only kill)
  | 'boss' // scripted, all 8 status immune
  | 'boss-extras'; // adds in boss encounters

type MonsterClassification = {
  category: MonsterCategory;
  isRequired?: boolean; // for boss : story progression vs optional
  hasPassives?: RareMonsterPassives;
};
```

### Status Immunity per-category data-model

```ts
type StatusImmunityProfile =
  | 'minor-standard-4-4' // Assassin Cock pattern
  | 'minor-deviation-5-3' // Berserk Mouse Fear+
  | 'minor-deviation-6-2' // Berserker Confuse+Fear+
  | 'rare-monster-all-8' // Birds + OOPARTS
  | 'boss-all-8'; // standard boss canon
```

## Questions ouvertes

- **Boss Extras canon scope** : quelles entités exactement ? Adds vs multi-part vs other ? À investiguer wiki tier 2 page Boss Extras si existe.
- **Pandemonium canon item NEW** : Attack Item Erase-type (cohérent Total Vanishing) ? Drop source ? Effect canon précis ? À investiguer items wiki.
- **Lucky Jar Counter 16 vs Rare Monster Counter 28 logic canon** : pourquoi different tier ? Implémentation tier-mapping per-category ?
- **Bosses susceptibility Total Vanishing/Pandemonium** : explicitly susceptible "Minor Enemies" — Bosses likely immune (à confirmer).
- **Halberd source canon revision** : Wiki master Lavitz's Spirit Mayfil Disc 4 (vs existing TODO 1428 Phantom Ship Disc 2) — REVISION needed `items/equipment.md`.

## Liens transverses

- [`../bosses/_sources/lod-wiki-bosses-master-table.md`](../bosses/_sources/lod-wiki-bosses-master-table.md) — master Bosses table canon Damia
- [`../bosses/README.md`](../bosses/README.md) — boss roster Damia per-disc
- [`../mobs/README.md`](../mobs/README.md) — mob roster Damia
- [`../mobs/Blue Bird.md`](../mobs/Blue Bird.md) — first Rare Monster ingestion canon
- [`../combat/damage-formula.md`](../combat/damage-formula.md) — §10 Rare Monster Basic / §11 Mitigation
- [`../combat/additions.md`](../combat/additions.md) — Counter Opportunities tiers (0/9/16/19/28)
- [`../items/consumables.md`](../items/consumables.md) (à créer) — Total Vanishing + Pandemonium ⭐ NEW + Demon's Gate Attack Items canon

## Gaps / TODO

Voir [TODO.md](../../TODO.md) section Monster Categories + Bosses Master Table.
