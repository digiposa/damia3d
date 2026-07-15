# Drake the Bandit — Boss Shrine of Shirley (Disc 1)

> **Boss Disc 1 Wind element Shrine of Shirley** — multi-entity battle canon : **Drake (HP 1,200 US / 1,500 JP ✓) + 3× Bursting Ball/Bombs (HP 64-76 kamikaze bombs) + 1× Wire/Wire Net (HP 100-120 defensive shield)** = 5-entity battle canon. ⭐⭐⭐ **Story canon REVEALED MAJEUR** : Drake = **guardian Shrine of Shirley** canon (NOT bandit per se — defender role) protecting from other bandits + Shirley's loyal lover. Story Disc 1 : party seeks **Dragoni Plant** to cure Shana's **Dragon poisoning** → Drake defeated → Shirley reveals + gives **White Silver Dragoon Spirit** to heal Shana + asks Drake revived.
>
> ⭐⭐⭐ **Multi-entity Boss Extras canon MAJEUR ⭐⭐⭐** — Drake + 2 Boss Extra types (Bursting Ball + Wire) = **5-entity battle**. Boss Extras canonical 4ème instance Damia (cohérent Crafty Thief / Divine Dragon / Dark Doel existing canon).
>
> ⭐⭐⭐ **Final Blow passive Disc 1 canon NEW MAJEUR ⭐⭐⭐** — Battle ends when Drake's HP reaches 0 (Boss Extras inutiles à kill). Cohérent existing Divine Dragon Final Blow canon Disc 3. Pattern Damia : `FinalBlowPassive { trigger: 'main-boss-hp-zero'; effect: 'end-battle' }` data-model canon — Drake confirms Disc 1 instance.
>
> ⭐⭐⭐ **Bomb Trap → Wire Trap → HP recovers chain canon NEW MAJEUR ⭐⭐⭐** — Sequential "Enable" trigger system Drake AI canon NEW : (1) Bomb Trap (within first 3 actions — summons 3× Bursting Ball + enables Wire Trap) → (2) Wire Trap (HP ≤ 50% — summons Wire + enables HP recovers) → (3) HP recovers (HP ≤ 33.3% — single-use 30% Max HP heal = 360 HP). Pattern Damia `EnableChainAI` data-model canon NEW.
>
> ⭐⭐⭐ **Bursting Ball Boss Extra NEW canon ⭐⭐⭐** — Kamikaze self-destruct AoE bomb thematic. HP 64 fragile. AI 2-Roll-Forward → Auto-Detonate (1× phys + self-destructs) Auto. Position-based target "opposite party member" canon (3-position cohérent existing Divine Dragon Cannon).
>
> ⭐⭐⭐ **Wire Boss Extra NEW canon MAJEUR ⭐⭐⭐** — 2 NEW passives MAJEURS defensive shield for Drake : (1) **Impassable** = 0× Physical Damage Multiplier to Drake (full physical immunity via Wire while alive) + (2) **Sharp** = (1,000 / attacker's DF) reactive Physical Damage to attacker when Drake targeted by Addition. Pattern AI Wire = passive-only (~Do nothing offensive). Strategy : kill Wire first to disable Impassable.
>
> ⭐⭐⭐ **Impassable passive canon NEW MAJEUR** — `ImpassablePassive { effect: 'physical-damage-zero-to-protected-entity'; protectedEntity: 'drake-the-bandit' }` data-model canon NEW.
>
> ⭐⭐⭐ **Sharp reactive passive canon NEW MAJEUR** — `SharpReactivePassive { trigger: 'protected-targeted-by-addition'; formula: '1000 / attackerDF'; damageTarget: 'attacker' }` data-model canon NEW. ⚠️ Inverse DF formula (lower DF = higher Sharp damage taken).
>
> ⭐⭐⭐ **Boss Extras canonical 4ème instance confirmed** — Drake the Bandit Disc 1 + Crafty Thief Disc 1 + Divine Dragon Disc 3 + Dark Doel Disc 4 = 4 Boss Extras instances cross-disc canon.
>
> ⭐⭐ **HP recovers single-use chain-gated canon NEW** — 30% Max HP = 360 HP (cohérent existing 30% formula Crystal Golem + Dragon Soldier). ⚠️ **Single use canon** (vs Crystal Golem / Dragon Soldier repeatable) — pattern NEW Drake variant + gated triple-condition (Wire Trap enabled + HP ≤ 33.3% + single use).
>
> ⭐⭐ **Counter 0 No counter tier** all 3 entities (Drake + Bursting Ball + Wire) cohérent existing canon Air Combat/Feyrbrand/Fire Bird/Canbria Dayfly.
>
> ⭐⭐ **Bandit's Ring 30% drop NEW item canon** — high drop rate (vs typical 2-8% Mob). Pattern thematic Drake signature drop. Probable accessory canon (ring).
>
> ⭐⭐ **Shrine of Shirley canon location Disc 1** — cohérent existing Crystal Golem Shrine + **Shirley Light Dragoon Spirit canon Disc 1** (Shana receives Light Dragoon Spirit after Drake defeat thematic).
>
> ⭐⭐ **Status all 8 ✔ Boss-tier** all 3 entities standard pattern Boss canon.
>
> ⭐⭐ **EXP 1,500 / Gold 100 Drake yield + 0/0 Boss Extras yield canon** — Boss Extras = no yield pattern cohérent existing canon.
>
> ⭐⭐⭐ **JP HP 1,500 ✓ +25% systematic CONFIRMED fandom ⭐⭐⭐** (US 1,200 × 1.25 = 1,500 ✓). ⚠️ Gold 100 same US/JP — pattern ÷3 NOT applied Boss canon (anomaly canon vs Mob ÷3 systematic) ⚠️.
>
> ⭐⭐⭐ **Drake = Guardian Shrine of Shirley canon NEW MAJEUR fandom ⭐⭐⭐** — NOT bandit per se. "For a long time, Drake protected Shrine of Shirley from other bandits." Fiercely loyal to Shirley. Origin unknown.
>
> ⭐⭐⭐ **Dragoni Plant + Dragon poisoning canon Disc 1 lore MAJEUR fandom ⭐⭐⭐** — Party seeks Dragoni Plant cure Shana's Dragon poisoning. Pattern Damia : Dragoni Plant = NEW Key Item canon Disc 1. Dragon poisoning Shana = canon status effect Disc 1.
>
> ⭐⭐⭐ **White Silver Dragoon Spirit acquisition canon Disc 1 ⭐⭐⭐** — Shirley gives Spirit to heal Shana (alternative cure Dragoni Plant). Cohérent existing Shana White Silver Dragoon canon.
>
> ⭐⭐⭐ **Canon ability names officiels fandom MAJEUR ⭐⭐⭐** :
>
> - **Dagger Toss** (vs wiki ~Throw Knives) — throws **2 daggers** possible multi-hit
> - **Wire Net** (vs wiki ~Wire Trap + Wire Boss Extra) — barrier invulnerable phys + **100 HP** (vs wiki 120)
> - **Bombs** (vs wiki ~Bomb Trap + ~Bursting Ball) — 3 bombs + **3 rolls** (vs wiki 2) + **76 HP each** (vs wiki 64)
> - **Heal via Healing Potion item canon NEW** (vs wiki HP recovers ability) — heal 360 HP when "yellow or below" UI threshold canon
>
> ⭐⭐⭐ **Kamuy boss CROSS-SOURCE CONFIRMED via Drake Trivia ⭐⭐⭐** — Drake model reused Disc 3 Furni listening Resident Knight Harris' plan about wolf Kamuy. Cohérent existing Dragon Spirit Trivia untargetable trick canon (8 bosses untargetable confirmed). Kamuy = wolf boss Disc 3 canon.
>
> ⭐⭐⭐ **Drake = ONLY boss becoming NPC canon UNIQUE Trivia MAJEUR fandom ⭐⭐⭐** — Post-battle talkable NPC mode (no other boss canon has this).
>
> ⭐⭐⭐ **Drake love Shirley canon NEW lore MAJEUR fandom ⭐⭐⭐** — Post-game dialogue : Drake admits love Shirley + keeps guarding Shrine despite not believing Shirley returns. Pattern thematic tragic devotion canon.
>
> ⭐⭐ **Resident Knight Harris canon NEW NPC Furni Disc 3 ⭐⭐** — Plan about wolf Kamuy. À documenter `npcs/Resident Knight Harris.md` (à créer).
>
> ⭐⭐ **Special Transformation command Dragoons canon reference fandom ⭐⭐** — "Double attacking power of Dragoons for a given time" — Dragoon mechanic canon.
>
> ⭐⭐ **JP name canon 盗賊ドレイク (Tōzoku Doreiku) "Thief Drake"** — terminology US "Bandit" = JP "Thief" localization variant.
>
> ⭐⭐ **HP threshold "yellow or below" UI indicator canon NEW fandom ⭐⭐** — UI HP color threshold indicator (vs wiki HP ≤ 33.3% numeric).
>
> ⭐⭐ **AT 23 + MAT 20 fandom CORRECTION wiki** (20→23 +15% / 17→20 +18% — Damia adopt fandom higher JP probable closer).
>
> ⭐⭐ **Wire HP 100 fandom vs 120 wiki divergence ⚠️** + **Bombs HP 76 fandom vs Bursting Ball 64 wiki divergence ⚠️** + **Roll count 3 fandom vs 2 wiki divergence ⚠️**.
>
> ⭐⭐ **Nest of Dragon "troublesome plant" obstacle canon NEW fandom ⭐⭐** — Disc 1 path canon Nest of Dragon → Shrine of Shirley.
>
> ⭐⭐ **Shrine of Shirley layout canon NEW fandom ⭐⭐** — Traps + messages inside chests (Drake's defenses against intruders).
>
> ⭐⭐ **Dart Explosion Dragoon Magic Spell canon reference fandom ⭐⭐** — Fire-element Dart ability canon strategy vs Drake.
>
> ⭐ **Scripted encounter + Escape 0%** canon Boss standard.
>
> ⭐ **Drake AI ~Throw Knives baseline 1× phys** (wiki community — fandom **Dagger Toss** canon officiel).
>
> **Sources** :
>
> - 🥈 [`_sources/lod-wiki-drake-the-bandit.md`](./_sources/lod-wiki-drake-the-bandit.md) — wiki LoD tier 2 (Drake stats US 1,200 HP / 20 AT / 80 DF / 17 MAT / 80 MDF / 70 SPD + Counter 0 + Status all 8 ✔ + Yield 1,500 EXP / 100 Gold / Bandit's Ring 30% + Final Blow passive + 4-ability AI Throw Knives/Bomb Trap/Wire Trap/HP recovers + Bursting Ball Boss Extra Roll Forward/Detonate kamikaze + Wire Boss Extra Impassable/Sharp passives + Do nothing AI + Shrine of Shirley submap 161 scripted)
> - 🥉 [`_sources/fandom-drake-the-bandit.md`](./_sources/fandom-drake-the-bandit.md) — fandom tier 3 (⭐ **JP HP 1,500 ✓ +25% CONFIRMED** + ⭐ **Drake = Guardian Shrine canon NEW MAJEUR** + ⭐ **Dragoni Plant + Dragon poisoning Disc 1 lore MAJEUR** + ⭐ **White Silver Dragoon Spirit acquisition** + ⭐ **Dagger Toss/Wire Net/Bombs/Heal canon names officiels MAJEURS** + ⭐ **Healing Potion item canon NEW** + ⭐ **Kamuy CROSS-SOURCE CONFIRMED** + ⭐ **Drake = ONLY boss NPC canon UNIQUE** + ⭐ **Drake love Shirley canon NEW MAJEUR** + ⭐ **Resident Knight Harris NEW NPC Furni Disc 3** + ⭐ **Special Transformation command Dragoons** + ⭐ **JP name 盗賊ドレイク "Thief Drake"** + ⭐ **HP threshold "yellow or below" UI canon** + ⭐ **AT 23 / MAT 20 fandom higher divergences** + ⭐ **Wire HP 100 / Bombs HP 76 / Roll 3 divergences** + ⭐ **Nest of Dragon "troublesome plant" + Shrine traps/chests/messages**)

## Statut

🟢 **Canon documenté wiki tier 2 + fandom tier 3 cross-source confirmé** — JP stats CONFIRMED +25% HP + Drake guardian role canon revealed + canon ability names officiels (Dagger Toss/Wire Net/Bombs/Heal) + Kamuy cross-source confirmation + Drake UNIQUE NPC post-battle + Drake love Shirley lore + Dragoni Plant + Dragon poisoning Disc 1 + Healing Potion item canon NEW.

## Identity canon

- **Espèce** : Drake the Bandit (bandit boss humain Disc 1)
- **Element** : **Wind**
- **Category** : **Boss** Disc 1 multi-entity (Drake + 3 Bursting Ball + 1 Wire Boss Extras)
- **Location canon** : **Shrine of Shirley** submap 161 (Disc 1)
- **Disc** : Disc 1
- **Pattern symbolique** : ⭐⭐⭐ **Multi-entity Boss Extras 4ème instance canonical** + **Final Blow passive Disc 1** + **Bomb→Wire→HP recovers chain NEW** + **Bursting Ball kamikaze NEW** + **Wire Impassable+Sharp defensive shield NEW MAJEUR** + **Bandit's Ring 30% drop NEW**

### Story canon ⭐⭐⭐ MAJEUR fandom — Chapter 1 Serdian War Disc 1

⭐⭐⭐ **Drake = guardian Shrine of Shirley canon MAJEUR** :

- **Drake = "guardian of the Shrine of Shirley"** canon role officiel fandom (NOT bandit per se — defender role)
- ⭐ **"For a long time, Drake protected the Shrine of Shirley from other bandits"** — Drake = anti-bandit guardian canon
- ⭐ **"Multitude of traps + messages inside chests"** Drake's defenses to discourage adventurers + bandits intruding (chests + messages canon NEW Shrine layout)
- ⭐ **"Fiercely loyal to Shirley, always putting his life at stake protecting"** canon
- ⚠️ **Origin canon UNKNOWN** : "Never revealed how he came to picking up that task" — pattern thematic mystery canon

⭐⭐⭐ **Dragoni Plant + Dragon poisoning canon Disc 1 lore MAJEUR** :

- Party (Dart, Lavitz, Rose) goes beyond **"troublesome plant" in Nest of Dragon** ⚠️ NEW canon path Disc 1
- Arrive at Shrine of Shirley **in search of Dragoni Plant** as cure for **Shana's Dragon poisoning** ⭐⭐⭐ canon Disc 1
- Pattern Damia : Dragoni Plant = NEW Key Item canon MAJEUR (cure Dragon poisoning Shana Disc 1)
- Dragon poisoning Shana = canon status effect Disc 1 (probable consequence canon — Shana Dragon Spirit canon ?)
- À documenter `items/Dragoni Plant.md` (à créer) — NEW Key Item canon Disc 1
- À documenter `status-effects/dragon-poisoning.md` (à créer) — canon status effect Shana Disc 1

⭐⭐⭐ **Encounter Drake canon** :

- Top of Shrine → Drake attacks party accusing of "trying to steal the Shrine's treasure"
- Dart tries to argue
- **Rose says "it would be easier to kill him"** ⭐ (Rose pragmatic canon cohérent character) → battle begins

⭐⭐⭐ **Post-battle canon MAJEUR** :

- Battle over → Drake **mortally wounded**
- **Shirley reveals herself** ⭐
- Shirley questions why Dragoons appeared at her Shrine
- Dart explains looking for Dragoni Plant
- ⚠️ **Shirley canon reveal** : "there is NONE [Dragoni Plant] in the Shrine" — pattern canon reveal Disc 1
- ⭐⭐⭐ **Shirley offer** : "if they can earn it from her, she will give them the **White Silver Dragoon Spirit** to heal their friend"
- Party receives **White Silver Dragoon Spirit** from Shirley canon Disc 1
- Shirley asks party **heal Drake (revive)** — he was guardian for many years
- Drake **revived** → **irritated at Shirley disappearing into heavens** canon

⭐⭐⭐ **White Silver Dragoon Spirit canon Disc 1** :

- **White Silver Dragoon Spirit** = canon Disc 1 acquisition Shana via Shirley
- Shirley = previous White Silver Dragoon canon → passes Spirit to Shana
- Pattern Damia : Spirit heals Shana's Dragon poisoning canon (vs Dragoni Plant alternative original quest)

### JP name canon ⭐⭐

- **JP** : 盗賊ドレイク (Tōzoku Doreiku) **lit. "Thief Drake"**
- US "Bandit" = JP "Thief" localization variant
- Pattern Damia : adopt **Drake the Bandit** (US official name)

### Shrine of Shirley location canon ⭐⭐

- **Shrine of Shirley** = existing location canon Disc 1 (cohérent Crystal Golem submaps 153/154/156)
- **Drake spawn submap 161** — boss-specific submap (vs Crystal Golem 153/154/156)
- Pattern thematic Light Dragoon Spirit shrine canon
- À cross-référer `locations/Shrine of Shirley.md` (à créer) — Disc 1 Light Dragoon Spirit location canon

## Stats canon multi-entity ⭐ Damia adopt JP — JP CONFIRMED fandom ⭐⭐⭐

### Drake the Bandit stats

| Stat      | Wiki US           | Fandom US/EU      | **Fandom JP** ⭐  | **Damia (JP)** ⭐                          | Notes                                                                               |
| --------- | ----------------- | ----------------- | ----------------- | ------------------------------------------ | ----------------------------------------------------------------------------------- |
| HP        | 1,200             | 1,200             | **1,500** ✓       | **1,500** ✓ JP +25% confirmed              | JP +25% systematic CONFIRMED ✓ (1,200 × 1.25 = 1,500 ✓)                             |
| AT        | 20                | **23** ⚠️         | ?                 | **23** (fandom higher, JP closer probable) | Wiki vs fandom +15% divergence                                                      |
| DF        | 80                | 80                | ?                 | **80**                                     | Same ✓                                                                              |
| MAT       | 17                | **20** ⚠️         | ?                 | **20** (fandom higher, JP closer probable) | Wiki vs fandom +18% divergence                                                      |
| MDF       | 80                | 80                | ?                 | **80**                                     | Same ✓                                                                              |
| SPD       | 70                | 70                | ?                 | **70**                                     | Same ✓                                                                              |
| A-AV/M-AV | 0%/0%             | 0%/0%             | 0%/0%             | **0%/0%**                                  | Standard Boss                                                                       |
| XP        | 1,500             | 1,500             | 1,500             | **1,500**                                  | Same ✓ — Disc 1 boss yield                                                          |
| Gold      | 100               | 100               | 100               | **100**                                    | ⚠️ Same US/JP — pattern ÷3 NOT applied Boss canon anomaly ⚠️ (vs Mob ÷3 systematic) |
| Drop      | Bandit's Ring 30% | Bandit's Ring 30% | Bandit's Ring 30% | **Bandit's Ring 30%** ⭐⭐                 | NEW item canon high drop rate                                                       |

⚠️ **JP HP +25% systematic CONFIRMED Drake the Bandit ⭐⭐⭐** :

- Wiki US 1,200 × 1.25 = 1,500 ✓ matches JP fandom exact
- Pattern Damia +25% HP US→JP systematic canon récurrent CONFIRMED Boss instance (Drake = 1er Boss confirmé +25% pattern Damia)

⚠️ **Gold canon Boss anomaly ⚠️** :

- Drake Gold US 100 = JP 100 (NOT ÷3 systematic)
- Pattern Damia : **Bosses Gold might NOT follow ÷3 systematic** (vs Mobs Gold ÷3 confirmed)
- À investiguer cross-boss : Boss Gold scaling US/JP — pattern anomaly canon ?

### Bursting Ball stats (Boss Extra x3) — NEW

| Stat          | Wiki US     | Notes                           |
| ------------- | ----------- | ------------------------------- |
| HP            | **64**      | Very low HP (fragile bomb)      |
| AT            | 30          |                                 |
| DF            | **150**     | **High DF anti-physical** ⭐    |
| MAT           | 30          |                                 |
| MDF           | 50          | Low MDF (magic favored counter) |
| SPD           | 70          |                                 |
| EXP/Gold/Drop | 0/0/Nothing | Boss Extra no yield canon       |

### Wire stats (Boss Extra x1) — NEW

| Stat          | Wiki US     | Notes                                |
| ------------- | ----------- | ------------------------------------ |
| HP            | **120**     | Low HP                               |
| AT            | 13          | Very low (irrelevant — passive-only) |
| DF            | **120**     | **High DF anti-physical**            |
| MAT           | 13          | Very low                             |
| MDF           | 80          | Moderate                             |
| SPD           | 50          | Low SPD                              |
| EXP/Gold/Drop | 0/0/Nothing | Boss Extra no yield canon            |

⚠️ **JP stats Drake + Boss Extras à confirmer fandom future** — wiki US only ingéré, pattern Damia adopt JP when available (+25% HP typical / ÷3 Gold systematic).

## Status Immunity canon (all 8 ✔ Boss-tier) — all 3 entities

| Petrify | Bewitch | Arm Block | Dispirit | Confuse | Fear | Poison | Stun |
| ------- | ------- | --------- | -------- | ------- | ---- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | ✔       | ✔    | ✔      | ✔    |

Pattern Boss-tier all 8 ✔ standard canon all 3 entities.

## Counter Opportunities (0) — NO COUNTER tier all 3 entities

**(0)** — **No counter** tier all 3 entities (cohérent existing canon Air Combat / Feyrbrand / Fire Bird / Canbria Dayfly).

Pattern Damia tier mapping canon : Drake the Bandit + 2 Boss Extras = Counter 0 tier confirmed cross-entity.

## Final Blow passive Drake canon NEW Disc 1 ⭐⭐⭐

| Passive        | Effect                                           | Requires |
| -------------- | ------------------------------------------------ | -------- |
| **Final Blow** | Battle ends when Drake the Bandit's HP reaches 0 | —        |

⚠️ **Final Blow passive Disc 1 canon NEW MAJEUR ⭐⭐⭐** :

- **Final Blow** = canon passive (cohérent existing Divine Dragon Final Blow canon Disc 3)
- **Effect canon** : battle ends when Drake HP reaches 0 (Boss Extras persist mais battle ends)
- Pattern Damia : `FinalBlowPassive { trigger: 'main-boss-hp-zero'; effect: 'end-battle' }` data-model canon — Drake confirms Disc 1 instance
- ⭐ Pattern canon Damia : Final Blow = canonical recurring passive cross-disc (Disc 1 Drake + Disc 3 Divine Dragon)
- Pattern canon multi-entity boss : **kill main = win battle** (Boss Extras inutiles à kill — strategy focus Drake)
- À documenter `combat/passives.md` (à créer/vérifier) Final Blow passive cross-boss canon

## Drake AI — Bombs → Wire Net → Heal chain canon NEW MAJEUR ⭐⭐⭐ (canon names fandom)

| Action                                                           | Target | Effect                                                                          | Conditions                                                                                      |
| ---------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Dagger Toss** ⭐⭐⭐ canon (~Throw Knives wiki)                | Single | **Throws 2 daggers** + 1× Physical damage ⭐ (possible multi-hit canon ⚠️)      | — (baseline canon)                                                                              |
| **Bombs** ⭐⭐⭐ canon (~Bomb Trap wiki)                         | N/A    | Opens box + Summons **Bursting Ball (x3)** + Enables Wire Net                   | Bursting Ball not in battle. **Will always use within first 3 actions** ⭐                      |
| **Wire Net** ⭐⭐⭐ canon (~Wire Trap wiki)                      | N/A    | Weaves wire net + Summons **Wire** + Enables Heal + invulnerability to physical | Wire not in battle. Must be **Enabled by Bombs**. **HP ≤ 50%**                                  |
| **Heal** ⭐⭐⭐ canon (HP recovers wiki) via Healing Potion item | Self   | **Uses Healing Potion** + Restores **30% (360) HP**                             | Must be **Enabled by Wire Net**. **HP ≤ 33.3% / "yellow or below" UI canon**. **Single use** ⭐ |

⚠️ **Sequential "Enable" trigger system canon NEW MAJEUR ⭐⭐⭐** :

Drake AI cascade canon :

1. **Bomb Trap** (within first 3 actions — guaranteed early-battle) → summons 3× Bursting Ball + enables Wire Trap
2. **Wire Trap** (HP ≤ 50% threshold) → summons Wire + enables HP recovers
3. **HP recovers** (HP ≤ 33.3% threshold + single-use) → 30% Max HP heal = 360 HP

⚠️ **Pattern Damia EnableChainAI data-model canon NEW** :

```ts
type EnableChainAI = {
  phase1: {
    action: 'bomb-trap';
    trigger: 'within-first-3-actions';
    summons: 3;
    enables: 'wire-trap';
  };
  phase2: {
    action: 'wire-trap';
    trigger: 'hp <= 50% + enabled';
    summons: 1;
    enables: 'hp-recovers';
  };
  phase3: {
    action: 'hp-recovers';
    trigger: 'hp <= 33.3% + enabled + single-use';
    healPercent: 0.3;
  };
};
```

### Dagger Toss canon name officiel ⭐⭐⭐ MAJEUR fandom (~Throw Knives wiki community)

- **Dagger Toss** = canon name officiel fandom (vs wiki ~Throw Knives community approximation)
- Effect canon : **"throws 2 daggers from his hand"** ⭐ NEW canon — possible **multi-hit canon** (2 daggers thrown)
- ⚠️ Pattern Damia ambiguity vs wiki "1× phys" — 2-dagger fandom suggère possible 2× phys hits OR 1× phys avec animation 2 daggers
- Pattern thematic "bandit/thief dagger throwing" canon
- Pattern Damia : adopter **Dagger Toss** canon name officiel + flag community ~Throw Knives alias deprecated
- À implémenter ability `daggerToss` Damia (multi-hit canon à valider)

### Bombs canon name officiel ⭐⭐⭐ MAJEUR fandom (~Bomb Trap wiki community)

- **Bombs** = canon name officiel fandom (vs wiki ~Bomb Trap community)
- Effect canon fandom : **"opens box + 3 bombs + each rolls 3 times + after 3 rolls explodes massive damage"** ⭐
- ⚠️ **Roll count 3 fandom vs 2 wiki ⚠️ divergence** — Damia adopt wiki precise (2-roll canon) + flag fandom higher roll count
- ⚠️ **Bombs HP 76 fandom vs Bursting Ball HP 64 wiki ⚠️ divergence** (+12 / +19%) — Damia adopt wiki precise + flag fandom higher HP
- **Within first 3 actions guaranteed** canon — pattern guaranteed early-battle ability
- 3× Bursting Ball summon canon (cohérent wiki precise Boss Extra entity data)
- Pattern thematic "box-bombs opens unloads 3 bombs roll toward party explode" canon

### Wire Net canon name officiel ⭐⭐⭐ MAJEUR fandom (~Wire Trap wiki community)

- **Wire Net** = canon name officiel fandom (vs wiki ~Wire Trap community + Wire Boss Extra entity)
- Effect canon fandom : **"weaves wire net + invulnerable to physical attacks + barrier needs destroyed before Drake attacked"** ⭐
- ⚠️ **Wire HP 100 fandom vs 120 wiki ⚠️ divergence** (-20 / -17%) — Damia adopt wiki precise (120 HP)
- **HP ≤ 50% trigger** canon — pattern HP-threshold ability
- 1× Wire summon canon (cohérent wiki Boss Extra entity data)
- ⭐ "Bandit can still play his bomb tricks while facing the wire net" canon — Drake still uses Bombs while Wire Net active
- ⚠️ Pattern chain enable canon : requires Bombs enabled prior (sequential)
- ⚠️ Pattern ambiguity canon : fandom décrit Wire Net comme **Drake's ability** alors que wiki décrit comme Wire **Boss Extra entity** — pattern Damia adopt wiki canon (more precise data) + flag fandom as alternative narrative description

### Heal canon name officiel via Healing Potion item ⭐⭐⭐ MAJEUR fandom (HP recovers wiki ability)

- **Heal** = canon name officiel fandom
- ⭐⭐⭐ **Item-based heal canon NEW MAJEUR** : Drake **"uses Healing Potion"** item (vs wiki HP recovers ability classification)
- Pattern Damia : **Healing Potion item-based heal canon NEW** (cohérent existing canon Damia Potion = Healing Potion existing canon Commander reference)
- ⚠️ Pattern ambiguity canon : Item vs Ability classification :
  - Wiki : HP recovers = ability
  - Fandom : Heal = uses Healing Potion item
  - Pattern Damia : adopt fandom narrative (Boss consumes item) + mechanic wiki canon (30% Max HP heal)
- **30% Max HP = 360 HP** (Drake US 1,200 × 30% = 360 ✓ — cohérent existing 30% formula cross-mob/boss)
- ⭐⭐ **HP threshold "yellow or below" UI canon NEW** : UI HP color indicator canon (vs wiki "HP ≤ 33.3%" numeric) — same threshold différent representation
- ⚠️ **Single use canon** ⚠️ NEW variant Damia :
  - Vs Crystal Golem repeatable / Dragon Soldier repeatable — Drake = single-use variant
  - Pattern Damia : Heal/HP recovers variants cross-boss canon (repeatable ability vs single-use item)
- ⚠️ **Triple-condition gated** : Wire Net enabled + HP ≤ 33.3% / "yellow" + single-use
- À cross-référer `items/Healing Potion.md` (à créer/vérifier) — existing canon item Damia + Boss consumption canon NEW
- Pattern Damia : Boss using consumable items canon NEW (cohérent existing Commander Healing Potion canon reference)

## Boss Extra (Bursting Ball) — NEW canon ⭐⭐⭐ kamikaze AI

### Identity canon Bursting Ball

- **Boss Extra** summoned by Drake's Bomb Trap (3× simultaneous)
- **Element** : **Non-Elemental**
- **Counter 0** + **Status all 8 ✔** + **EXP/Gold/Drop 0** (Boss Extra no yield canon)

### Bursting Ball kamikaze AI canon NEW MAJEUR ⭐⭐⭐

| Action            | Target                                          | Effect                                              | Conditions                                          |
| ----------------- | ----------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| **~Roll Forward** | Self                                            | Move towards party member opposite of Bursting Ball | —                                                   |
| **~Detonate** ⭐  | Single (party member opposite of Bursting Ball) | 1× Physical damage + **self destructs** ⭐          | **Only used after Roll Forward twice**. **Auto** ⭐ |

⚠️ **Bursting Ball kamikaze AI canon NEW MAJEUR ⭐⭐⭐** :

- Pattern thematic "ball rolls towards target then explodes self-destructs" canon
- **2-Roll-Forward → Auto-Detonate** sequence canon NEW
- Pattern Damia : `BurstingBallKamikazeAI { rollPhases: 2; autoDetonate: true; target: 'opposite-party-member'; selfDestruct: true }` data-model canon NEW
- ⚠️ Pattern position-based target canon : "opposite of Bursting Ball" — 3-position party canon (cohérent existing Divine Dragon Cannon position-based)
- À implémenter Boss Extra summoned entity Damia avec kamikaze AI canon NEW

### Strategy Bursting Ball canon

- **HP 64 very fragile** — kill rapidement avant Detonate (2 turns warning Roll Forward sequence)
- **DF 150 high anti-physical** + **MDF 50 low** → magic favored counter canon
- 3× Bursting Ball simultaneously → AoE pressure 3-direction kamikaze threat canon
- Pattern Damia : magic burst priority canon vs Bursting Ball threat

## Boss Extra (Wire) — NEW canon MAJEUR ⭐⭐⭐ defensive shield

### Identity canon Wire

- **Boss Extra** summoned by Drake's Wire Trap (1× single)
- **Element** : **Non-Elemental**
- **Counter 0** + **Status all 8 ✔** + **EXP/Gold/Drop 0** (Boss Extra canon)

### Wire passives canon NEW MAJEUR ⭐⭐⭐

| Passive               | Effect                                                      | Requires                                                      |
| --------------------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| **Impassable** ⭐⭐⭐ | **0× Physical Damage Multiplier to Drake the Bandit**       | —                                                             |
| **Sharp** ⭐⭐⭐      | **(1,000 / attacker's DF) Physical Damage to the attacker** | **Triggers when Drake the Bandit is targeted by an Addition** |

⚠️ **Impassable passive canon NEW MAJEUR ⭐⭐⭐** :

- **0× Physical Damage Multiplier to Drake** = **full physical immunity via Wire** canon
- Pattern Damia : `ImpassablePassive { effect: 'physical-damage-zero-to-protected-entity'; protectedEntity: 'drake-the-bandit' }` data-model canon NEW
- ⚠️ Pattern Boss Extra defensive shield canon NEW : Wire = shield for Drake (physical attacks deal 0 damage while Wire alive)
- Strategy counter canon : **kill Wire first** to disable Impassable + access physical damage Drake
- À implémenter passive `impassable` Damia (canon NEW Boss Extra defensive)
- À cross-référer pattern existing Boss Extra defensive shield canon (cohérent Lloyd Untargetable passive Dark Doel canon ?)

⚠️ **Sharp passive canon NEW MAJEUR ⭐⭐⭐** :

- **(1,000 / attacker's DF) Physical Damage** reactive to attacker when Drake targeted by Addition
- ⚠️ **Reactive damage formula canon NEW** : 1,000 / DF inverse formula (lower DF = higher damage taken)
- Pattern Damia : `SharpReactivePassive { trigger: 'protected-targeted-by-addition'; formula: '1000 / attackerDF'; damageTarget: 'attacker' }` data-model canon NEW
- ⚠️ Pattern reactive thorns/spikes damage canon NEW (cohérent thematic Wire = sharp barbed wire)
- Pattern canon Damia : attacker DF self-protection vs Sharp counter (higher DF gear = less Sharp damage taken)
- Strategy counter canon : avoid Additions targeting Drake while Wire alive (Magic / Items / non-Addition attacks favored)
- À implémenter passive `sharp` Damia (canon NEW reactive damage)

### Wire passive-only AI ⭐

| Action          | Target | Effect       | Conditions |
| --------------- | ------ | ------------ | ---------- |
| **~Do nothing** | N/A    | Does nothing | —          |

⚠️ **Wire passive-only canon ⭐** :

- Wire's role = **defensive passive shield** for Drake (Impassable + Sharp)
- AI action = **~Do nothing** (no offensive ability)
- Pattern Damia : Boss Extra passive-only entity canon NEW (cohérent thematic Wire = inanimate trap barbed wire)
- À implémenter Boss Extra entity Damia avec passive-only AI canon NEW

### Strategy Wire canon

- **HP 120** → kill Wire rapidly to disable Impassable + Sharp passives
- **DF 120 + MDF 80** → mixed offensive options
- **Priority canon** : kill Wire first before attacking Drake (otherwise physical 0× damage + Sharp reactive)
- Pattern Damia : multi-entity boss priority order canon (Wire > Bursting Ball > Drake — kill order strategy)

## Encounters canon

### Shrine of Shirley (Disc 1)

| Encounter Formation (ID) | Location (Submap ID)    | Encounter | Escape |
| ------------------------ | ----------------------- | --------- | ------ |
| Drake the Bandit (412)   | Shrine of Shirley (161) | Scripted  | 0%     |

⚠️ **Scripted encounter + Escape 0%** canon Boss battle standard.

## Trivia canon ⭐⭐⭐ MAJEUR fandom

### 1. Drake model reuse Disc 3 Furni — Kamuy CROSS-SOURCE CONFIRMED ⭐⭐⭐

⭐⭐⭐ **Trivia canon MAJEUR cross-source CONFIRMATION** :

- **Drake's model is later re-used at the beginning of Disc 3 in Furni** canon fandom
- **Listening to Resident Knight Harris' plan about the wolf, Kamuy** ⭐⭐⭐
- ⚠️ Pattern Damia : **Kamuy CROSS-SOURCE CONFIRMED** boss canon (cohérent existing Dragon Spirit Trivia untargetable trick canon !)
- ⭐⭐⭐ **Resident Knight Harris canon NEW NPC** Furni Disc 3
- Pattern thematic : Kamuy = wolf boss canon Disc 3 (cohérent existing untargetable trick canon Dragon Spirit Trivia 8 bosses confirmed)
- À documenter `bosses/Kamuy.md` (à créer) — wolf boss canon Disc 3 Furni
- À documenter `npcs/Resident Knight Harris.md` (à créer) — NEW NPC Furni Disc 3 + Kamuy plan canon
- À documenter `locations/Furni.md` (à créer/vérifier) — Disc 3 location canon

### 2. Drake = ONLY boss becoming NPC canon UNIQUE ⭐⭐⭐ MAJEUR

⭐⭐⭐ **Drake = only boss becoming NPC canon UNIQUE Trivia MAJEUR** :

- "**Drake the Bandit is the only boss in the game to become a NPC that can freely be talked to after the fight**" canon fandom
- ⚠️ Pattern canon UNIQUE : no other boss canon has post-battle dialogue NPC mode
- Pattern Damia : Drake post-battle NPC UNIQUE canon — special case lore device
- À documenter `combat/boss-mechanics.md` (à créer) — Drake post-battle NPC UNIQUE canon

### 3. Drake love Shirley canon NEW lore MAJEUR ⭐⭐⭐

⭐⭐⭐ **Drake love Shirley canon NEW lore MAJEUR** :

- "When returning to the Shrine of Shirley later in the game and talking to Drake, he will admit that he was **in love with Shirley**" canon fandom
- "**Keeps guarding the Shrine despite not believing that Shirley will return**" canon
- Pattern thematic lore canon : Drake's loyalty motivated by **love + tragic devotion** canon
- Pattern Damia : Drake post-battle dialogue NPC canon Disc 1-2+ continue Shrine guard canon
- Pattern canon : Drake's UNIQUE post-battle NPC status = lore device for love reveal canon

## Combat flow canon

1. Player enters Shrine of Shirley submap 161 → scripted encounter Drake the Bandit
2. Turn 1-3 : Drake **guaranteed** uses **Bomb Trap** → summons 3× Bursting Ball + enables Wire Trap
3. Bursting Ball threat 2-Roll-Forward → Auto-Detonate kamikaze sequence per ball
4. HP ≤ 50% Drake : Drake uses **Wire Trap** → summons Wire + enables HP recovers
5. Wire on field : Impassable (0× phys to Drake) + Sharp ((1,000/DF) reactive when Drake targeted by Addition)
6. HP ≤ 33.3% Drake (single use) : HP recovers heals 360 HP (30% Max)
7. Battle ends when **Drake HP reaches 0** (Final Blow passive — Boss Extras persist mais battle ends)

### Strategy canon recommandée

- **Wind weak Earth** → Albert Earth Dragoon attacks favored vs Drake ⭐
- **Multi-entity priority order canon** :
  1. **Kill Bursting Balls** rapidly (HP 64 fragile + Auto-Detonate threat)
  2. **Kill Wire** if summoned (disable Impassable + Sharp passives)
  3. **Focus Drake** (Final Blow = battle ends at Drake HP 0)
- **Wire active period strategy** :
  - **Magic attacks favored** vs Drake (Impassable = 0× phys / Magic unaffected)
  - **Items / Spell Items favored** vs Drake (no Addition trigger Sharp)
  - **Avoid Additions Drake-targeted** (Sharp reactive damage to attacker)
- **HP recovers timing** : burst Drake to < 33.3% then finish before HP recovers single-use (or after used)
- **Bursting Ball counter** : magic burst (MDF 50 low) — kill before Detonate Auto trigger
- **Status applicables** : NONE all 8 ✔ Boss + Boss Extras immune
- **Counter 0** : no Counter Additions possible all 3 entities
- **Bandit's Ring farming** : 30% rate ⭐⭐ high rate (3 attempts avg cohérent rate)

## Vision Damia (implémentation)

### Décisions canon à conserver

1. **Multi-entity battle canon** : Drake + 3 Bursting Ball + 1 Wire = 5-entity battle Disc 1
2. **Drake stats canon (JP CONFIRMED fandom)** ⭐⭐⭐ : HP **1,500** ✓ JP +25% confirmed + AT **23** (fandom higher) + DF 80 + MAT **20** (fandom higher) + MDF 80 + SPD 70 + Gold 100 (⚠️ same US/JP — pattern Boss ÷3 NOT applied anomaly canon)
3. **Bursting Ball stats US** : HP 64 (wiki precise vs fandom 76 ⚠️) + AT 30 + DF 150 + MAT 30 + MDF 50 + SPD 70 (kamikaze fragile)
4. **Wire stats US** : HP 120 (wiki precise vs fandom 100 ⚠️) + AT 13 + DF 120 + MAT 13 + MDF 80 + SPD 50 (passive-only)
5. **Status all 8 ✔ Boss-tier** all 3 entities
6. **Counter 0 No counter tier** all 3 entities
7. **Final Blow passive Disc 1 canon NEW** : battle ends Drake HP 0 (cohérent Divine Dragon Final Blow canon cross-disc)
8. **Bomb Trap → Wire Trap → HP recovers chain canon NEW MAJEUR** : sequential Enable trigger system AI
9. **Bomb Trap guaranteed within first 3 actions** canon
10. **Wire Trap conditional HP ≤ 50%** canon
11. **HP recovers single-use HP ≤ 33.3% triple-condition gated** canon (Wire Trap enabled + HP threshold + single use)
12. **HP recovers 30% Max HP = 360 HP** : cohérent existing 30% formula cross-mob/boss
13. **HP recovers single-use variant canon NEW** : vs Crystal Golem / Dragon Soldier repeatable
14. **Bursting Ball Boss Extra NEW canon kamikaze** : 2-Roll-Forward → Auto-Detonate self-destruct, position-based target opposite party member
15. **Wire Boss Extra NEW canon MAJEUR defensive shield** : Impassable + Sharp passives + passive-only AI
16. **Impassable passive NEW MAJEUR** : 0× Physical Damage to protected entity (Drake)
17. **Sharp passive NEW MAJEUR** : (1,000/attacker DF) reactive Physical Damage when protected targeted by Addition
18. **Boss Extras canonical 4ème instance** : Drake Disc 1 + Crafty Thief Disc 1 + Divine Dragon Disc 3 + Dark Doel Disc 4
19. **Shrine of Shirley submap 161 scripted encounter** : Boss location canon Disc 1
20. **Drake yield 1,500 EXP / 100 Gold / Bandit's Ring 30% drop** : NEW item canon high drop rate
21. **Bandit's Ring NEW item canon** : probable accessory ring thematic — effect précis à investiguer
22. **Boss Extras 0/0/Nothing yield** : standard Boss Extra no-yield pattern
23. **Wind element Drake** : weak Earth → Albert favored canon strategy
24. **JP HP 1,500 ✓ +25% systematic CONFIRMED** ⭐⭐⭐ : pattern Boss canon JP scaling (Drake = 1er Boss confirmé +25% pattern Damia)
25. **Gold ÷3 NOT applied Boss anomaly ⚠️** : pattern Bosses Gold canon ≠ Mobs ÷3 systematic
26. **Drake = Guardian Shrine of Shirley canon** ⭐⭐⭐ : NOT bandit per se (defender role canon fandom)
27. **JP name canon 盗賊ドレイク (Tōzoku Doreiku) "Thief Drake"** : terminology JP literal
28. **Dragoni Plant + Dragon poisoning canon Disc 1 lore MAJEUR** : Shana cure quest canon
29. **White Silver Dragoon Spirit Shirley acquisition Disc 1** : cohérent existing Shana canon
30. **Canon ability names officiels fandom MAJEUR** :
    - **Dagger Toss** (~Throw Knives wiki) — 2 daggers thrown
    - **Bombs** (~Bomb Trap wiki) — 3 bombs + 3 rolls (fandom) vs 2 rolls (wiki) ⚠️
    - **Wire Net** (~Wire Trap wiki) — barrier invulnerable phys
    - **Heal via Healing Potion item** (HP recovers wiki ability) — Boss item-based heal canon NEW
31. **Healing Potion item-based Boss heal canon NEW** ⭐⭐⭐ : pattern Boss consume consumable items canon (cohérent existing Commander Healing Potion canon)
32. **HP threshold "yellow or below" UI canon NEW** ⭐⭐ : UI HP color indicator canon (vs numeric HP ≤ 33.3%)
33. **Kamuy boss CROSS-SOURCE CONFIRMED via Drake Trivia** ⭐⭐⭐ : wolf boss Disc 3 Furni canon (cohérent existing Dragon Spirit Trivia untargetable trick 8 bosses canon)
34. **Drake = ONLY boss becoming NPC canon UNIQUE** ⭐⭐⭐ : post-battle talkable NPC mode unique canon
35. **Drake love Shirley canon NEW lore MAJEUR** ⭐⭐⭐ : tragic devotion lore canon post-game dialogue
36. **Resident Knight Harris NEW NPC canon Furni Disc 3** : Kamuy plan canon
37. **Special Transformation command Dragoons canon reference** ⭐⭐ : 2× damage timed Dragoon mechanic canon
38. **Nest of Dragon "troublesome plant" obstacle canon Disc 1** : path Nest of Dragon → Shrine of Shirley
39. **Shrine of Shirley layout : traps + messages inside chests** : Drake's defenses canon
40. **Dart Explosion Dragoon Magic Spell canon reference** : Fire-element Dart ability strategy
41. **Wire HP 100 fandom vs 120 wiki divergence** ⚠️ : Damia adopt wiki precise data
42. **Bombs HP 76 fandom vs Bursting Ball 64 wiki divergence** ⚠️ : Damia adopt wiki precise data
43. **Bombs roll count 3 fandom vs 2 wiki divergence** ⚠️ : Damia adopt wiki precise data
44. **AT 23 + MAT 20 fandom CORRECTION wiki** : Damia adopt fandom higher (JP closer probable)

### Implementation tech

- Data-model `MultiEntityBossBattle` Drake the Bandit :
  ```ts
  type DrakeTheBanditBattle = {
    mainBoss: DrakeBoss;
    extras: {
      burstingBalls: BurstingBallExtra[]; // 3× summoned by Bomb Trap
      wires: WireExtra[]; // 1× summoned by Wire Trap
    };
    mainBossPassive: 'final-blow'; // battle ends on Drake HP 0
    aiChain: 'bomb-trap → wire-trap → hp-recovers';
  };
  ```
- Data-model `EnableChainAI` (Drake's sequential AI) :
  ```ts
  type EnableChainAI = {
    phase1: {
      action: 'bomb-trap';
      trigger: 'within-first-3-actions';
      summons: 3;
      enables: 'wire-trap';
    };
    phase2: {
      action: 'wire-trap';
      trigger: 'hp <= 50% + enabled';
      summons: 1;
      enables: 'hp-recovers';
    };
    phase3: {
      action: 'hp-recovers';
      trigger: 'hp <= 33.3% + enabled + single-use';
      healPercent: 0.3;
    };
  };
  ```
- NEW Passive `impassable` (Wire) :
  ```ts
  type ImpassablePassive = {
    type: 'protected-entity-physical-immunity';
    effect: 'physical-damage-zero';
    protectedEntity: 'drake-the-bandit';
  };
  ```
- NEW Passive `sharp` (Wire reactive) :
  ```ts
  type SharpReactivePassive = {
    type: 'reactive-damage-attacker';
    trigger: 'protected-targeted-by-addition';
    formula: '1000 / attackerDF';
    damageTarget: 'attacker';
    damageType: 'physical';
  };
  ```
- NEW AI `BurstingBallKamikaze` :
  ```ts
  type BurstingBallKamikazeAI = {
    rollPhases: 2;
    autoDetonate: true;
    target: 'opposite-party-member';
    detonateEffect: { multiplier: 1; type: 'physical'; selfDestruct: true };
  };
  ```
- Variant ability `hpRecovers` Damia :
  ```ts
  // Drake variant: single-use chain-gated
  type DrakeHpRecoversAbility = {
    type: 'self-heal';
    healPercent: 0.3;
    singleUse: true; // ⚠️ vs Crystal Golem/Dragon Soldier repeatable
    chainGated: ['wire-trap-enabled', 'hp <= 33.3%'];
  };
  ```

### Questions ouvertes

- **JP stats Drake + Boss Extras** : à confirmer fandom future (probable +25% HP / ÷3 Gold pattern systematic)
- **Bandit's Ring effect précis** : NEW accessory canon — à investiguer items wiki + Guidebook (probable stat/elemental bonus)
- **Story Drake the Bandit canon détaillé** : à investiguer fandom future (bandit stealing Shirley's Light Dragoon Spirit)
- **Shrine of Shirley layout canon** : à documenter `locations/Shrine of Shirley.md` (à créer) Disc 1 Light Dragoon Spirit location
- **Drake AI exact button-press priority** : multi-condition AI selection order — à investiguer cross-boss
- **HP recovers variants cross-boss** : single-use Drake vs repeatable Crystal Golem/Dragon Soldier — pattern Damia HP recovers variants canon documentation
- **Sharp reactive damage formula generalization** : 1,000 / DF inverse formula — cross-boss pattern ?
- **Impassable cross-boss/Boss Extra canon** : Wire premier ingestion — autres Boss Extras avec full immunity passive ?
- **Bursting Ball kamikaze pattern cross-boss** : Wire-summoning + bomb-summoning patterns — autres Boss avec ?
- **Bomb Trap "within first 3 actions" guaranteed mechanic** : cross-boss pattern guaranteed early-battle ability ?

## Liens transverses

- [`README.md`](./README.md) — pattern général bosses canon
- [`../locations/Shrine of Shirley.md`](../locations/Shrine of Shirley.md) (à créer) — Disc 1 Light Dragoon Spirit location canon
- [`../mobs/Crystal Golem.md`](../mobs/Crystal Golem.md) — Shrine of Shirley Mob existing canon + HP recovers cross-mob/boss canon
- [`Divine Dragon.md`](./Divine Dragon.md) — Final Blow passive existing canon Disc 3 + Boss Extras canonical pattern
- [`Dark Doel.md`](./Dark Doel.md) (à créer/vérifier) — Boss Extras existing canon Disc 4 + multi-entity pattern
- [`Crafty Thief.md`](./Crafty Thief.md) (à créer/vérifier) — Boss Extras existing canon Disc 1 + cross-disc pattern
- [`../party-members/Shana.md`](../party-members/Shana.md) — Light Dragoon Spirit canon Disc 1 (Drake stealing thematic)
- [`../dragoons/dragons.md`](../dragoons/dragons.md) — Shirley Light Dragoon canon
- [`../combat/passives.md`](../combat/passives.md) (à créer/vérifier) — Final Blow + Impassable + Sharp passives canon NEW
- [`../combat/boss-extras.md`](../combat/boss-extras.md) (à créer/vérifier) — Boss Extras 4ème instance canonical pattern Damia
- [`../combat/mob-abilities.md`](../combat/mob-abilities.md) — HP recovers variants cross-mob/boss canon (single-use vs repeatable)
- [`../combat/elements.md`](../combat/elements.md) — Wind weak Earth canon strategy
- [`../items/equipment.md`](../items/equipment.md) — Bandit's Ring NEW accessory canon

## Gaps / TODO

Voir [TODO.md](../../TODO.md) section Drake the Bandit.
