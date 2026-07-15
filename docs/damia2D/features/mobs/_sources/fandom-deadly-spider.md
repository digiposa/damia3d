# Deadly Spider — fandom (verbatim)

> **Source** : [The Legend of Dragoon Wiki (fandom) — Deadly Spider](https://legendofdragoon.fandom.com/wiki/Deadly_Spider)
> **Fiabilité** : 🥉 **tier 3** (fandom — appearance canon + JP stats confirmation + Arm-Block duration reveal MAJEUR).
> **Sauvegardé le** : 2026-05-23.
> **Usage** : complément/cross-check du wiki LoD `lod-wiki-deadly-spider.md` — ⭐ **JP HP 410 ✓ CONFIRMED** (+25% pattern systematic) + **JP Gold 13 ✓ ÷3 confirmed** + ⭐⭐ **Appearance canon NEW MAJEUR** : "giant spider size of small deer + green/grey/white fur + 8 eyes total (3 large horizontal + 3 small above + 2 below) + 4 large pincers" + ⭐ **Gnaw canon name officiel** (vs wiki ~Bite community) + ⚠️ **Cobweb damage type DIVERGENCE wiki Physical vs fandom MAGIC** + ⭐⭐ **Arm-Block duration 3-5 turns canon REVEALED NEW MAJEUR** + ⭐ **Encounter rate "Very common" canon** + ⭐ **Body Purifier 10 gold any item shop canon** + **Poison immunity confirmed cross-source** + **Mega Sea Dragon cross-source confirmed Mountain of Mortal Dragon partner** + **NEW formation Deadly Spider + Mega Sea Dragon (solo Mega — without Beastie Dragon)** + Stats divergences AT 60→68 / MAT 42→48 wiki vs fandom.

---

## Information

| Location                  | Element |
| ------------------------- | ------- |
| Mountain of Mortal Dragon | Earth   |

| HP                                 | XP  | Gold                             |
| ---------------------------------- | --- | -------------------------------- |
| **328 (US/EU)** / **410 (JP)** ⭐✓ | 90  | **39 (US/EU)** / **13 (JP)** ⭐✓ |

| P. Attack | P. Defense |
| --------- | ---------- |
| **68** ⚠️ | 100        |

| M. Attack | M. Defense | Speed |
| --------- | ---------- | ----- |
| **48** ⚠️ | 60         | 50    |

| Dropped Item(s)        | Can Counterattack |
| ---------------------- | ----------------- |
| **Body Purifier (8%)** | **Yes**           |

⚠️ **JP stats CONFIRMED ⭐⭐ MAJEUR** :

- **HP JP : 410** ✓ vs Wiki US 328 = **+25% pattern systematic confirmé** ⭐ (328 × 1.25 = 410 exact ✓)
- **Gold JP : 13** ✓ vs US 39 = **÷3 pattern systematic confirmé** ⭐ (39 ÷ 3 = 13 ✓)
- Pattern JP/US conversion canon récurrent confirmé (cohérent Bowling/Crocodile/Crescent Bee/Crystal Golem/Cute Cat/Danton)
- Damia adopt JP 410/13 canon

⚠️ **Stats divergences wiki vs fandom ⚠️** :

- AT : wiki **60** vs fandom **68** (+8 / +13%)
- MAT : wiki **42** vs fandom **48** (+6 / +14%)
- HP/DF/MDF/SPD/EXP match ✓
- → Damia adopt fandom higher AT 68 / MAT 48 probable (JP closer pattern récurrent)

Deadly Spider is an **Earth element creature** which is located within the **Mountain of Mortal Dragon**.

## Appearance ⭐⭐ MAJEUR NEW canon

Deadly Spider has **green and grey / white fur** covering its skin. **Three large eyes going horizontally with three small eyes above and two below**, as well it has **four large pincers on its face**. A **giant spider the size of a small deer**.

⚠️ **Appearance canon Deadly Spider ⭐⭐ MAJEUR NEW** :

- **Green and grey/white fur** = visual palette canon
- **8 eyes total** ⭐ : 3 large horizontal + 3 small above + 2 below = arachnid eye configuration canon
- **4 large pincers on face** = predatory canon
- **Giant size = small deer scale** ⭐ = imposing creature canon (vs typical mob spider size)
- À refléter sprite design Damia : green/grey/white fur + 8 eyes + 4 pincers + small deer size
- Pattern thematic predatory giant spider canon

## Battle

> Main article : Battle

This creature deals **medium physical damage** towards single targets, and has the ability to use **arm-block when at low health**. This attack will **prevent your character from attacking physically for 3-5 turns**. Do note that this creature is **immune to poison**.

⚠️ **Arm-Block duration canon REVEALED MAJEUR ⭐⭐⭐** :

- **Arm-Blocking duration : 3-5 turns canon NEW** ⭐
- Effect : prevent character from attacking physically for **3-5 turns**
- Pattern Status Arm-Blocking canon mechanic reveal NEW canon
- À documenter `combat/status-effects.md` (à créer) — Arm-Blocking 3-5 turns duration canon
- À implémenter `ArmBlockingStatus { type: 'physical-attack-block'; duration: { min: 3; max: 5; random: true } }` data-model Damia
- Pattern status proc duration RNG canon NEW (3-5 random range)

⚠️ **Poison immunity confirmed cross-source ⭐** :

- "Immune to poison" canon confirme wiki Status 5/3 deviation Poison immune
- Cohérent thematic "spider venom = poison-resistant" biology canon
- Cross-source confirmation Status 5/3 NEW canon

### Abilities canon

- **Gnaw** - Runs towards a single target, biting them for **medium physical damage** (canon name officiel ⭐)
- **Cobweb** - Spits a cobweb towards a single target dealing **medium MAGIC damage** ⚠️ + inflicting **Arm-Blocking** upon hit

⚠️ **Gnaw canon name officiel ⭐ MAJEUR** :

- **Gnaw** = canon name officiel fandom (vs wiki ~Bite community approximation)
- Description : "Runs towards single target, biting them for medium physical damage"
- Pattern thematic "spider gnaw bite" canon
- Damia adopt fandom canon **Gnaw** > wiki community ~Bite

⚠️ **Cobweb damage type DIVERGENCE wiki vs fandom ⚠️ MAJEUR** :

- Wiki tier 2 : "**1× Physical damage** + 50% chance Arm-Blocking" + "Target's **A-AV** reduces"
- Fandom : "Spits a cobweb...dealing **medium MAGIC damage** + inflicting Arm-Blocking"
- ⚠️ **Damage type divergence : wiki Physical vs fandom Magic** ⭐
- Pattern interpretation :
  - Wiki tier 2 = canonical mechanic (A-AV reduces → physical-tagged ability canon)
  - Fandom = narrative interpretation (cobweb spit = magical-feeling visual)
- ⚠️ **Damia adopt wiki Physical canon** (cohérent A-AV reduction pattern A-AV/M-AV per-ability classification)
- Pattern Cobweb = ranged projectile physical-tagged canon (cohérent Detonate/Petrifying Arrow ranged but classification differs)
- À investiguer Discord pattern précis Cobweb damage type

### Encounter rate

**Encounter rate : Very common** ⭐

⚠️ **Encounter rate "Very common" canon Deadly Spider ⭐** :

- Pattern encounter rate canon : Very common (cohérent Bowling Very common Disc 3 pattern)
- Pattern Mountain of Mortal Dragon Disc 3 mob frequency canon
- Cohérent farming Body Purifier 8% rate viable canon

## Battle pairing / formation

All battle formations in which you will encounter a Deadly Spider :

- **Deadly Spider** (solo)
- **Deadly Spider + Beastie Dragon**
- **Deadly Spider + Mega Sea Dragon** ⭐ NEW (solo Mega — sans Beastie Dragon)
- **Deadly Spider + Mega Sea Dragon ×2**

⚠️ **Formations canon cross-source confirmed + NEW formation reveal ⭐** :

- 4 formations canon fandom (vs wiki tier 2 4 formations) :
  - Deadly Spider solo (formation 153 wiki ✓)
  - Deadly Spider + Beastie Dragon (formation 157 wiki ✓)
  - **Deadly Spider + Mega Sea Dragon** ⭐ NEW (vs wiki formation 155 = Mega Sea Dragon + Deadly Spider OR same different naming)
  - Deadly Spider + Mega Sea Dragon ×2 (formation 158 wiki ✓)
- Pattern Mega Sea Dragon NEW mob canon Mountain of Mortal Dragon partner confirmé cross-source ⭐
- Pattern Beastie Dragon existing partner confirmé cross-source

## Drops

This creature can drop the item **Body Purifier** with a **rare probability of 8%**. This item can be **bought for 10 gold at any item shop**.

⚠️ **Body Purifier shop canon ⭐ MAJEUR** :

- **Body Purifier purchasable 10 gold all item shops canon** ⭐
- Pattern Body Purifier = shop-purchasable item canon (cohérent Pellet 10 gold all shops canon existing Crafty Thief fandom reveal)
- Damia adopt shop pricing canon : **10 gold Body Purifier all shops**
- À documenter `items/consumables.md` Body Purifier shop canon entry
- Pattern Mind Purifier 20 gold + Body Purifier 10 gold + Pellet 10 gold shop pricing canon récurrent

## Gallery

- **Deadly Spider uses Cobweb on Rose** — image canon Cobweb ability visual (cohérent Cobweb ability canon)
- **Deadly Spider uses Gnaw on Dart** — image canon Gnaw ability visual

⚠️ **Gallery confirms abilities cross-source ⭐** :

- Cobweb visual confirmed canon (image attestation)
- Gnaw visual confirmed canon (image attestation)
- Pattern Rose + Dart = Mountain of Mortal Dragon party member context confirmé canon (cohérent existing Disc 3 party composition)
