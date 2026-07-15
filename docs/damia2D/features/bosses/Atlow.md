# Atlow — Boss canon Hero Competition Lohan (Disc 1, Darkness archer)

> **Boss tournament Hero Competition Lohan Disc 1** : Darkness element archer, 33 ans / 179 cm canon. Poison-coated arrows (disqualification si Dart perd → cause Fear status). **Counter Opportunities (28)** = même table que Aqua King/Archangel = **pattern 28 multi-disc canon**.
>
> **Sources** :
>
> - 🥈 [`_sources/lod-wiki-atlow.md`](./_sources/lod-wiki-atlow.md) — wiki LoD (stats + Scripted Shot first-turn trait + 5-sense-blocker after 4 Keen Shots + HP recovers 30% < 30% HP + Hero Competition story + character stats 33yo/179cm + model reused mercenary Kamuy hunt)
> - 🥉 [`_sources/fandom-hero-competition.md`](./_sources/fandom-hero-competition.md) — fandom Hero Competition master page (appearance détaillée + 5-sense-blocker visual canon "3 apples + arrow pierce + 5 hexagons explode" + "came 2nd place previous tournament" + healing items on self + HP stats 270 US / 333 JP)

## Statut

🟡 **Draft post-ingestion wiki LoD** — fandom à ingérer pour cross-check.

## Identity canon

- **Espèce** : Human archer participant tournament
- **Element** : Darkness
- **Location canon** : **Lohan** (Hero Competition tournament Disc 1, submap 638)
- **Disc** : Disc 1 (Lohan = trade city Serdio, Hero Competition canon event)
- **Age canon** : **33 ans** ⚠️ NEW character stat
- **Height canon** : **179 cm (5'7")** ⚠️ NEW character stat
- **Motivation canon** : "Joined Hero Competition **purely to show off his power**, did not care about the prize money"
- **Disqualification trait canon** : **Coats arrows in poison** → disqualifié si Dart perd. Probable cause Fear status effect (poison-induced visual)
- **Model reuse canon** : "**A mercenary joining the hunt for Kamuy re-uses Atlow's model**" — pattern asset reuse Disc 3 Evergreen Forest (Bulgus / Harris mercenaries probable)
- **Came 2nd place previous tournament canon** ⭐ (fandom) — Atlow = veteran tournament fighter
- **Appearance canon détaillée** (fandom) : **reddish-brown hair + bare-chested + metal plate legs + spikes knees + brown tattered cape + matching gloves + longbow**
- **5-sense-blocker visual canon** (fandom) : **throws 3 apples in air + spins + arrow pierces all 3 + strikes Dart in the heart** → 5 hexagons appear on head/arms/knees + explode blue light → Fear status
- **Targeting reticle canon** : Atlow's normal aim outlined **light blue hexagons** on opponent's points

## Stats canon

| Stat | Value |
| ---- | ----- |
| HP   | 266   |
| AT   | 16    |
| DF   | 80    |
| MAT  | 16    |
| MDF  | 100   |
| SPD  | 55    |
| A-AV | 0%    |
| M-AV | 0%    |

→ Pattern boss Disc 1 tournament : HP 266 modéré (vs Feyrbrand 480, Fire Bird 640) — boss "défi" pas "wall". MAT=AT 16 = balanced physical/magic.

## Status Immunity canon

**All 8 status immune** (pattern boss canon master).

## Yield canon

- **EXP : 0 / Gold : 0 / Drops : Nothing** ⚠️ pattern tournament canon
- Hero Competition reward probable = **prize money** (mais Atlow loses → forfait disqualification poison)
- Pas de drop direct car contexte sportif/tournoi

## ⭐ Counterattack Opportunities (28) — pattern multi-disc canon

**Atlow Disc 1 partage exactement la même table 28 Counter Opportunities que Aqua King + Archangel Disc 4** :

| Distribution | Dart 5 | Lavitz 9 | Rose 5 | Meru 5 | Haschel 2 | Albert 2 | Shana/Miranda/Kongol 0 |
| ------------ | ------ | -------- | ------ | ------ | --------- | -------- | ---------------------- |

⚠️ **Hypothesis revisé** : **28 = pattern Counter table "standard" canon** (multi-disc, multi-context), partagé par Atlow (Disc 1 tournament) + Aqua King (Disc 4 mob) + Archangel (Disc 4 boss). **Distinct des "reduced" tiers** : Arrow Shooter (9 — Disc 2 mob), Assassin Cock (19 — Disc 1 mob).

→ Pattern canon Counter Opportunities **4 tiers** (revisé) :

- **Standard (28)** : Atlow, Aqua King, Archangel — pattern commun
- **Mid (19)** : Assassin Cock
- **Low (9)** : Arrow Shooter
- **None (0)** : Air Combat, Feyrbrand, Fire Bird

À investiguer mapping complet enemies canon.

## Mécaniques canon spécifiques

### Trait passive : Scripted Shot ⭐ NEW canon pattern

**"At the start of combat, ignore turn order and use Keen Shot"** → pattern boss "first-turn scripted opener".

- Atlow attaque immédiatement combat start (avant turn order normal)
- Pas un Retaliate (pas conditionnel à player action) — proactive
- Pattern canon distinct des Retaliate (Feyrbrand magic / Fire Bird Addition / etc.)

→ NEW pattern canon `BossPassive { trigger: 'on_battle_start', action: keenShot, ignoreTurnOrder: true }`.

### Abilities canon

| Action                | Target | Effect                                            | Notes                                                                                               |
| --------------------- | ------ | ------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| ~Keen Shot            | Single | 1× Physical damage                                | Basic ranged attack archer                                                                          |
| **5-sense-blocker!!** | Single | **3× Physical damage + 100% Fear** (A-AV reduces) | **Trigger : after 4th use of Keen Shot, ignore turn order + single use** ⚠️ count-based pattern NEW |
| **HP recovers**       | Self   | Restores **30% (79) HP**                          | HP < 30% condition — self-heal canon                                                                |

### 5-sense-blocker!! canon ⭐ MAJEUR pattern

⚠️ **Pattern unique canon** : **trigger after Nth use of basic ability** (4 Keen Shots → 5-sense-blocker)

- Compteur d'utilisations Keen Shot canon
- 4ème Keen Shot terminé → 5-sense-blocker auto-cast (ignore turn order)
- **Single use** seulement (pas répétable)
- **3× damage + 100% Fear** (mitigated by A-AV)
- Pattern lore : "5-sense-blocker" = arrow poison-coated overwhelming senses (cohérent trivia "coating arrows in poison → cause of Fear")

→ NEW pattern canon `Ability { triggerAfterUseCount: { ability: 'KeenShot', count: 4 }, singleUse: true, ignoreTurnOrder: true }`.

### HP recovers canon ⭐ self-heal boss

- **30% HP restored = 79 HP exact** (math : 30% × 266 HP = 79.8 ≈ 79 — integer division)
- **HP < 30% condition** triggers self-heal
- Pattern self-recovery boss canon distinct des Aqua King heals Meru (Heal Meru target) vs Atlow heal self
- À implémenter `Ability { target: 'self', hpRecoveryPct: 0.3, condition: { hpBelow: 0.3 } }`

## Story canon Hero Competition Lohan Disc 1

- **Hero Competition** = tournament canon Lohan Disc 1 (probable multi-round structure à investiguer)
- Atlow = participant champion canon
- Motivation : **"show off power, did not care about prize money"** → character canon arrogant
- **Disqualification mechanic canon** : si Dart perd → Atlow disqualifié pour **poison-coated arrows** (cheating)
- Pattern lore : tournament has rules + Atlow cheats with poison → caught even if Dart loses
- Implication design canon : **player win OR lose = Dart progresses storywise** (Atlow disqualifié soit par défaite soit par cheating)

## Combat flow canon

1. Battle start Lohan submap 638 (scripted, 0% escape)
2. **Scripted Shot trait** : Atlow ignore turn order + Keen Shot first turn (free action)
3. Pattern alterne : Keen Shot (1× phys)
4. **HP < 30%** : HP recovers self-heal +79 HP (30% max HP restore)
5. **After 4th Keen Shot use** : auto-cast 5-sense-blocker!! (3× phys + Fear 100%) ignore turn order, single use
6. Standard win condition HP=0 (pas Final Verdict comme Archangel)

### Strategy canon recommandée

- **Darkness weak Light** → Shana/Miranda Sparkle Arrow Light damage 1.5×
- **Status applicables NONE** (boss immune all 8)
- **Equip Darkness Stone** Rose / Light Dragoons (-50% Darkness magic damage) → but Atlow uses physical only canon
- **Count Keen Shot uses** : after 3 Keen Shots, prepare for 5-sense-blocker!! (3× phys + Fear)
- **Equip Bravery Amulet** all party — counter Fear 100% from 5-sense-blocker
- **High A-AV** = reduce Fear chance from 5-sense-blocker
- **Avoid risky Additions** : counter table 28 (Lavitz Flower Storm 5 presses risky)
- **Burst damage HP < 30%** = avoid self-heal cycle

## Vision Damia (implémentation)

### Décisions canon à conserver

1. **Stats canon exacts** : HP 266 / AT 16 / DF 80 / MAT 16 / MDF 100 / SPD 55
2. **Scripted Shot first-turn trait** : new canon pattern `BossPassive { trigger: 'on_battle_start' }`
3. **5-sense-blocker!! count-based trigger** : after 4th Keen Shot, single use
4. **HP recovers self-heal** : 30% HP at HP < 30% threshold
5. **Counter Opportunities 28** : "standard" pattern multi-disc
6. **No drop / 0 EXP / 0 Gold** : tournament context
7. **Story disqualification mechanic** : Atlow loses by poison rule (regardless Dart outcome)
8. **Character canon stats** : 33yo / 179cm preserve identity
9. **Model reused mercenary Kamuy hunt** : asset sharing canon Disc 3

### Implementation tech

- Data-model `BossPassive` étendu :
  ```ts
  type BossPassive = {
    trigger: 'on_battle_start' | 'on_magic_targeted' | 'on_addition_targeted' | 'on_hp_threshold' | ...;
    action: Ability;
    ignoreTurnOrder: boolean;
  };
  ```
- Data-model `Ability` count-based trigger :
  ```ts
  type AbilityTrigger = {
    afterUseCount?: { abilityName: string; count: number }; // Atlow 5-sense-blocker after 4 Keen Shots
    onlySingleUse?: boolean;
    selfHeal?: { pct: number; hpBelowThreshold: number }; // HP recovers
  };
  ```

### Questions ouvertes

- **Hero Competition Lohan canon structure** : combien rounds ? Autres participants canon ? Multi-boss tournament ?
- **5-sense-blocker mechanic precise** : "5 senses blocked" = exact effect canon ? OR just Fear status ?
- **Counter table 28 = boss default OR specific tier** : à investiguer autres bosses Disc 2-3 canon

## Liens transverses

- [`../locations/Lohan.md`](../locations/Lohan.md) (à créer) — Lohan trade city + Hero Competition canon
- [`../quests/disc1-hero-competition.md`](../quests/disc1-hero-competition.md) (à créer) — Hero Competition tournament Lohan canon
- [`../mobs/Aqua King.md`](../mobs/Aqua King.md) — Counter Opportunities (28) tier comparison Disc 4
- [`Archangel.md`](./Archangel.md) — Counter Opportunities (28) tier comparison Disc 4
- [`../combat/elements.md`](../combat/elements.md) — Darkness weak Light
- [`../items/equipment.md`](../items/equipment.md) — Bravery Amulet (Fear prevention), Darkness Stone counter (mais Atlow physical-only)

## Gaps / TODO

Voir [TODO.md](../../TODO.md) section Atlow.
