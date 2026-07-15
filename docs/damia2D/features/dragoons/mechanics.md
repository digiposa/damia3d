# Dragoon Mechanics (wielders)

> **Master canon mechanics page** — couvre **Dragoon wielders + Ranks + Spirit Points + Dragoon Level + Transformation + D'Attack + Magic + Special Battle Command**. Complete spells list pour 8 Dragoons canon. **Dragoon Ranks 1-7 canon** (Official Guidebook) avec eye count. **DLV SP thresholds par character canon** (Meru/Kongol 2,000 DLV 3 outliers). **8 Dragoon Elements + Colors canon** (Darkness=Indigo, Divine=Grey). **Dragoons immune to Status Ailments canon**. **Anti-Dragoon boss mechanics canon** (Lloyd Dragon Buster, Grand Jewel/Melbu 4th/Divine Dragon Block Staff debuff). Foundational mécanique TLoD pour Damia (le code).
>
> **Rose quote canon foundational** : _"When Dragoons meet, blood will flow and as they leave, time does slow."_
>
> **Sources canon** :
>
> - 🥈 [`_sources/lod-wiki-dragoon.md`](./_sources/lod-wiki-dragoon.md) — wiki LoD (mechanics master, Ranks, spells, formulas)
> - 🥉 [`_sources/fandom-dragoon.md`](./_sources/fandom-dragoon.md) — fandom (Rose quote canon, DLV SP thresholds par character, Elements+Colors table, Dispirit prevents SP, Dart DS-loss Gehrich gang, Spirit Potion sources, anti-Dragoon boss mécaniques, Kongol Special +25% canon, Meru fastest DLV strategy, unique DS variations Greham/Doel/Lenus, Unnamed 7-eye fate unknown)

## Statut

🟡 **draft** — mécanique canon ingérée master.

## Concept canon : "Dragon Knight"

**Dragoons = "Dragon Knights" canon** — Humans recognized by Dragoon Spirit, fuse with it, gain :

- **Fly** (canon flight speed 1,200 km/h — just break sound barrier ; some teleport)
- **Cast powerful spells** (Dragoon Magic per element)
- **Command Dragons** (sameElement + higher rank, cf. dragons.md hierarchy)
- **Equipment magically potent** when transformed

### Mécanique fusion canon (consciousness)

> "When transforming into a Dragoon the **consciousness of the Dragon and wielder also fuse, resulting in a battle of wills for control**."

- **Soa gave Dragons low intelligence + urge to destroy** (cf. dragons.md fandom)
- → **Dragon dominated Dragoon wreaks indiscriminate havoc** canon
- Pattern narrative : "**insanity** is source of power Dragoon" (cohérent Rose monologue Deningrad)

### Spell categories canon

3 categories broad :

1. **Attacks** (damage + status effects)
2. **Recovery** (healing + cure ailments)
3. **Protection** (reduce damage)

### Variation entre wielders canon

- "**Sometimes powers differ even between two wielders of the same Dragoon Spirit**" canon
- → Cohérent **Lavitz vs Albert** (Jade Dragon DS) — pourraient avoir différences subtiles ?
- → Pattern Damia (le code) : `DragoonWielder.spellOverrides?: SpellId[]` possible variation per character

---

## Dragoon Ranks canon (Official Guidebook)

🆕 **Ranks 1-7 canon** (Official Guidebook only — pas in-game) : eye count détermine rank + naming canon de certains ranks.

| Eyes  | Rank    | Named "..." (canon)   | Known Dragons/Spirits canon                                                                                                                 |
| ----- | ------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **7** | **1st** | (top tier, unnamed)   | **Divine Dragon, Divine Dragon DS**                                                                                                         |
| **6** | **2nd** | **"God Dragon"**      | **Red Dragon DS, Dark Dragon DS, Jade Dragon DS, Silver Dragon DS, Violet Dragon DS, Gold Dragon DS, Blue Dragon DS** (7 elemental anciens) |
| **5** | **3rd** | (unnamed)             | **Michael** (Rose's vassal)                                                                                                                 |
| **4** | **4th** | **"Ultimate Dragon"** | **Regole** (Disc 2 sea Dragon)                                                                                                              |
| **3** | **5th** | **"Dragon King"**     | **Feyrbrand** (Disc 1 forest Dragon)                                                                                                        |
| **2** | **6th** | (unnamed)             | (unknown canon)                                                                                                                             |
| **1** | **7th** | (unnamed, lowest)     | **Pseudo Dragons** (probable minor mobs canon Dragons Mountain of Mortal Dragon)                                                            |

> 🆕 **Confirmations canon majeures** :
>
> - **Divine Dragon = 7-eye** confirmed (king of Dragons rank canon, cohérent fandom "7 wings")
> - **7 anciens 6-eye = "God Dragon" rank** canon
> - **Regole = 4-eye Rank 4 "Ultimate Dragon"** canon (lower than 7 anciens)
> - **Feyrbrand = 3-eye Rank 5 "Dragon King"** canon (paradoxal naming — "King" mais rank 5/7)
> - **Pseudo Dragons 1-eye** = minor mobs Dragons (Sea Dragon, Dragonfly, Baby Dragon, Wyvern, etc. cf. dragons.md fandom)
> - **6-eye Rank ?** = inconnu in-game / officiel

### Command rule rappel (cf. [dragons.md](./dragons.md))

- **Element match** requis (Dragoon Darkness commande Darkness Dragons only)
- **Dragoon Spirit eye count > target Dragon eye count** (strict inequality)
- Exemple : Rose 6-eye Darkness → command Michael 5-eye Darkness ✅

---

## Dragoon Spirits canon

### Acquisition mécanique

- Listed under **Goods** in-game
- **Exclusively awarded for story progression**
- **Exception canon** : **Gold Dragon DS purchasable in Lohan after defeating Gehrich** ⚠️ (cf. Lohan/Mr. Pelpee hint canon)
- Implication data-model Damia : `Item.acquisition: "story" | "shop" | "boss_drop"` per DS

### Mécanisme eye-merge canon (cf. dragon-campaign.md)

- Dragon dies → **eyes (1-7) merge into singular gem**
- **Harvested at moment of death** uniquement
- Used by **sentient wielders** who "tame the beast within"
- → DS gem = représentation visuelle eyes Dragon (probable design Damia)

---

## Spirit Points (SP) canon

### Mécanique de base

- **100 SP fills meter once** = enables transformation (1 turn at minimum)
- **Each DLV adds +100 SP capacity** (DLV 1 = 100 max, DLV 2 = 200, ... DLV 5 = 500)
- **Transforming drains 100 SP per turn** → de-transform at 0
- **SP level meter = remaining turns in Dragoon form**
- ⚠️ **Stored SP non-multiple of 100 lost at transform** (e.g., 180 → 100 on transform)

### Sources de SP canon

| Source                                                                                                   | Amount canon                  |
| -------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **Additions** (varying amounts per addition)                                                             | Variable selon addition+level |
| **Shana + Miranda** (per successful attack, scales with DLV)                                             | Increasing with DLV           |
| **Spirit Potion** (item)                                                                                 | **100 SP**                    |
| **Recovery Ball** (item, random chance)                                                                  | 100 SP (random)               |
| **Spirit Ring** (accessory)                                                                              | **20 SP per turn passive**    |
| Equipment magic damage SP : **Knight Helm, Giganto Helm, Jeweled Crown, Soul Headband, Robe, Ruby Ring** | Variable                      |
| Equipment physical damage SP : **Sparkle Dress, Master's Vest, Giganto Armor, Saint Armor**              | Variable                      |
| Equipment SP+ Additions/attacks : **Fairy Sword, Pretty Hammer, Energy Girdle, Wargod's Sash**           | Variable                      |

> 🆕 **Items SP-related canon** : Spirit Potion, Recovery Ball, Spirit Ring + multiples équipements à documenter `items/` (à créer).

### SP accumulation continue canon

- **SP continues accumulating beyond max meter** for DLV progression
- → **Never necessary to actually transform to level up DLV**
- Implication Damia : `Character.totalSpEarned` separate from `Character.currentSp` (DLV progression independent of transformation usage)

### 🆕 Dispirit status prevents SP gain canon (fandom)

- **Dispirit status effect → SP gain IMPOSSIBLE** until cured
- **3 cures canon** :
  1. **Become Dragoon** (if enough SP avant being dispirited)
  2. **Mind Purifier** item
  3. **Clinic visit**
- Implication tactique canon : Dispirit = grave threat to Dragoon-build characters
- Data-model Damia : `Status.dispirit.preventsSpGain = true`

### 🆕 Spirit Potion sources canon (fandom)

- **Drop 8% canon** : **Icicle Ball, Will-O-Wisp, Mermaid, Sandworm** (4 mobs canon)
- **Arena minigames Lohan** : won OR indirectly bought (**200G for 20 tickets**) → canon Arena economy
- **00PARTS Unique Monster** = **100% Spirit Potion drop** ⚠️ NEW canon (Unique Monster pattern)
- À documenter `items/consumables.md` (à créer) + `bosses/00PARTS.md` (à créer ?)

### 🆕 DS Goods + SP tracking canon (Dart Gehrich gang case)

- **Dart MP+SP zero quand DS in Gehrich gang's hands** canon
- **DLV + total SP accumulated preserved** (save editor confirmed) — pas reset
- **Pas d'accumulation SP pendant DS-loss period** canon
- Implication : **DS presence in Goods = trigger for SP tracking** canon
- Data-model Damia : `Character.spTracking.enabled = (DS in Goods)` — tracking starts when DS obtained, pauses if DS lost

---

## Dragoon Level (DLV) canon

### Mécanique

- **Start DLV 1, max DLV 5**
- **Stats AT/DF/MAT/MDF gain multiplier** scaling per DLV (cf. tables stats par character)
- **+1 spell per DLV** sauf **DLV 4** (no new spell pour aucun character canon)
- **Kongol exception** : no new spell at **DLV 2** (3 spells total only au lieu de 4)
- DLV threshold = **hidden accumulated SP threshold** per character
- Stats + spells viewable from **"Status" menu System Screen**
- **MP scaling canon (fandom)** : **MP minimum 20 at DLV 1, maximum 100 at DLV 5** (linear scaling) — same pour tous les Dragoons
- **SP bars visual canon** : bar 1 = blue, bar 2 = turquoise, bar 3 = yellow, bar 4 = orange, bar 5 = red (cumulative)

### Spell unlock timing canon

| DLV   | Spell unlocked                                                                                      |
| ----- | --------------------------------------------------------------------------------------------------- |
| 1     | Initial spell (always)                                                                              |
| 2     | New spell (sauf Kongol exception)                                                                   |
| 3     | New spell                                                                                           |
| **4** | **NO new spell** (canon — pour all chars)                                                           |
| 5     | New spell (DLV 5 = signature dragon-named Spell, e.g. Red-Eye Dragon, Jade Dragon, Blue Sea Dragon) |

### 🆕 DLV SP thresholds per character canon (fandom)

⚠️ **TABLE CRITIQUE** — chaque character a un threshold SP **différent** pour DLV up (vs assumption uniform pre-fandom) :

| Character         | Lv 1 → Lv 2  | Lv 2 → Lv 3    | Lv 3 → Lv 4 | Lv 4 → Lv 5 |
| ----------------- | ------------ | -------------- | ----------- | ----------- |
| **Dart**          | **1,200** ⚠️ | 6,000          | 12,000      | 20,000      |
| **Lavitz/Albert** | 1,000        | 6,000          | 12,000      | 20,000      |
| **Shana/Miranda** | 1,000        | 6,000          | 12,000      | 20,000      |
| **Rose**          | **1,200** ⚠️ | 6,000          | 12,000      | 20,000      |
| **Haschel**       | 1,000        | 6,000          | 12,000      | 20,000      |
| **Meru**          | 1,000        | **2,000** ⚠️🆕 | 12,000      | 20,000      |
| **Kongol**        | 1,000        | **2,000** ⚠️🆕 | 12,000      | 20,000      |

> 🆕 **Outliers canon majeurs** :
>
> - **Dart + Rose = 1,200 SP DLV 2** (higher threshold, +20% vs autres) → cohérent canon avec rôle leader-Dragoons
> - **Meru + Kongol = 2,000 SP DLV 3** (vs 6,000 autres = **3× faster**) — **rebalance Disc 2 catch-up canon** pour party members joining late
> - **DLV 4 + 5 = 12,000 / 20,000 SP** uniform pour tous

> Implication data-model Damia : `DragoonWielder.dlvThresholds: [number, number, number, number]` per character (pas global).

### MP canon (Magic Points)

| DLV | MP minimum canon | MP maximum canon |
| --- | ---------------- | ---------------- |
| 1   | **20**           | 20               |
| 2   | ?                | ?                |
| 3   | ?                | ?                |
| 4   | ?                | ?                |
| 5   | **100**          | 100              |

> Linear scaling canon (probable 20/40/60/80/100 par DLV). À reconfirmer per character.

---

## Transformation canon

### Règles

- **Cannot de-transform** sauf :
  1. **SP runs out** (0 SP)
  2. **HP reduced to 0**
- **Disabled commands in Dragoon form** :
  - Item
  - Defend
  - Escape (cannot run away canon)
- **New commands available** :
  - **D'Attack**
  - **Magic**

### 🆕 Dragoons immune to Status Ailments canon

- **Dragoons immune to all 8 Status Ailments** in Dragoon form canon
- **Transformation cures existing status** : si afflicted normal form → transform Dragoon = removes
- **Implication tactique** : Dragoon Transformation = **replacement Body/Mind Purifiers** canon
- Pattern Damia (le code) : `DragoonForm.statusImmunity = true` + cure on transform

### DS recognition mécanique canon

- DS = **crystallized colored stone** canon
- When obtaining new wielder : **stone glows brightly + levitates toward owner** canon
- Wielder **"recognized by the Spirit"** (DS chooses canon — cf. Nest of Dragon Greham→Lavitz)
- Implication visual Damia : DS pickup cinematic glow+levitation pattern (cohérent Jade DS Nest of Dragon)

### Animation toggle canon

- **Transformation animations toggleable between short and long in Menu** canon ⚠️ NEW
- UX option player choose canon
- Pattern Damia (le code) : Settings UI `Animations.length: "short" | "long"`

### 🆕 Drawback Dragoon form canon

- **Fighting Dragoon form** : **normal EXP** mais **no SP gain + no Addition level up** (Additions tracked only in normal form attacks)
- → **Trade-off Dragoon use vs DLV/Addition progression**
- → Pattern : optimal play = transform when needed only, normal form for grinding

---

## D'Attack canon (Dragoon physical attack)

### Mécanique non-Archers (Dart, Lavitz, Albert, Rose, Haschel, Meru, Kongol)

- **Spirit Meter UI** : compass + light revolving clockwise
- Press X → light begins revolving
- **Time each X press** to hit starting position
- **Up to 5 strikes** (Kongol max 4 strikes canon)
- **Perfect D'Attack** = elemental visual effect ; **no actual elemental damage unless elemental weapon equipped**

### Mécanique Archers (Shana, Miranda)

- **No timed input** — automatic
- Simpler damage formula (no inputs polynomial)

### Successful Inputs canon table

| Inputs | Output |
| ------ | ------ |
| 1      | 100    |
| 2      | 110    |
| 3      | 130    |
| 4      | 160    |
| 5      | 200    |

→ Pattern : **Diminishing returns décroissants (110/130/160/200)** vs inputs. Last input most rewarding canon.

### D'Attack damage formula canon (Non-Archers, abbreviated)

```
floor[floor{floor[round{floor[floor{Output * DRGNAT% / 100} * AT / 100] * (LV + 5) * 5 / DF} * Target Fear * Power] * Field} * Element]
```

### Variable Multipliers canon

| Modifier        | Conditions canon                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------- |
| **Target Fear** | Target Fear status → ×2 ; else ×1                                                               |
| **Power**       | No Power items used → ×1 ; otherwise [1 + (Attacker Power + Target Power)]                      |
| Attacker Power  | Attacker power up → +0.5 ; power down → -0.5                                                    |
| Target Power    | Target power up → -0.5 ; power down → +0.5                                                      |
| **Field**       | Attack element neither matches nor opposite of Special Field → ×1 ; else [1 + (Attack Element)] |
| Attack Element  | Matches Field → +0.5 ; opposite → -0.5                                                          |
| **Element**     | Target Element neither matches nor opposite of attack → ×1 ; else [1 + (Target Element)]        |
| Target Element  | Matches attack → -0.5 ; opposite → +0.5                                                         |

> **Cross-ref** : [`../combat/damage-formula.md`](../combat/damage-formula.md) (formulas master) + [`../combat/elements.md`](../combat/elements.md) (Element + Field).

---

## 🆕 Dragoon Elements + Colors canon (fandom)

Table canon complète **8 Dragoons** :

| Dragoon                  | Color canon   | Element        | Opposing canon         |
| ------------------------ | ------------- | -------------- | ---------------------- |
| **Red-Eyed Dragoon**     | Red           | Fire           | Water                  |
| **Jade Dragoon**         | Green         | Wind           | Earth                  |
| **White Silver Dragoon** | White Silver  | Light          | Dark                   |
| **Darkness Dragoon**     | **Indigo** ⚠️ | Dark           | Light                  |
| **Violet Dragoon**       | Violet        | Thunder        | **— (no opposing)** ⚠️ |
| **Blue Sea Dragoon**     | Blue          | Water          | Fire                   |
| **Golden Dragoon**       | Gold          | Earth          | Wind                   |
| **Divine Dragoon**       | **Grey** ⚠️   | **No Element** | **— (no opposing)** ⚠️ |

> 🆕 **Réveils canon majeurs** :
>
> - **Darkness Dragoon = Indigo color** (vs typical "Black/Dark") — important UI design Damia
> - **Divine Dragoon = Grey color** — neutral Non-Elemental
> - **Thunder + No Element NO opposing canon** ✅ confirme [`../combat/elements.md`](../combat/elements.md) (3 pairs opposing : Fire↔Water, Wind↔Earth, Light↔Dark ; Thunder + Non-Elemental standalone)

### Dragoon Spirit eye count canon (fandom enrichi)

- **All 8 in-game DS = 6-eye (Rank 2 "God Dragon")** sauf **Divine DS = 7-eye (Rank 1)**
- **Eye count reflected on Dragoon headbands** canon visual design ⚠️ (some discrepancies between in-game art and FMVs)
- **Pseudo Dragons** (lowest rank 1-eye) = canon Moon That Never Sets minor mobs
- **Two top-rank 7-eye Dragons canon** : Divine Dragon + **unnamed Dragon fate unknown** (cohérent dragons.md "Unnamed Dragon fought Divine Dragon, defeated")
- **"Eyes are dragged together" form DS** canon — fandom precise expression (vs wiki "merge into singular gem")
- **Must be claimed right away or power expires** canon = mécanique "harvest at moment of death" wiki confirmed

### Variations per wielder canon (Trivia fandom enrichi)

🆕 **DS hosts identique élément mais variations canon** (specialties + weapons-of-choice) :

| Dragoon Spirit       | Host canon Disc 1-4   | Weapon canon      | Variation spell canon                                 |
| -------------------- | --------------------- | ----------------- | ----------------------------------------------------- |
| **Jade Dragoon**     | Lavitz/Albert (party) | Spear             | Standard Wing Blaster/Rose Storm                      |
| **Jade Dragoon**     | Greham (boss Disc 1)  | (à confirmer)     | **"Dragon Crucification"** ⚠️ NEW spell variant canon |
| **Violet Dragoon**   | Haschel (party)       | Knuckles          | Standard Atomic Mind/Thunder Kid                      |
| **Violet Dragoon**   | Doel (boss Disc 1)    | **Two swords** ⚠️ | **"Judgment Storm"** ⚠️ NEW spell variant canon       |
| **Blue Sea Dragoon** | Meru (party)          | Hammer            | Standard Freezing Ring/Rainbow Breath                 |
| **Blue Sea Dragoon** | Lenus (boss Disc 2)   | **Chakrams** ⚠️   | **"Pillar Break"** ⚠️ NEW spell variant canon         |

> 🆕 **Pattern canon "same DS, different wielder, unique variations"** — implications data-model :
>
> ```ts
> DragoonWielder {
>   archetypeId: ArchetypeId;
>   weaponClass: WeaponClass; // Spear, Knuckles, Hammer, Sword, Chakram, etc.
>   spellOverrides?: Map<SpellSlot, SpellId>; // boss variants
> }
> ```
>
> "Original Seven Dragoons coincidentally same weapon and fighting style as Dart's group" canon — Lavitz/Syuveil = Spear, Haschel/Kanzas = Knuckles, Meru/Damia = Hammer, etc.

## Magic canon (Dragoon Magic)

### Mécanique

- **Opens spell menu**
- Costs **MP** (Magic Points)
- Cannot cast without MP

### Spell damage formula canon

```
floor{floor[floor{floor[floor{floor[(MAT * DRGNMAT% /100)] * (LV + 5) * 5 / MDF} * Multiplier / 100] * Target Fear * Power} * Field] * Element}
```

> **DRGNMAT%** = number on Status menu under Dragoon column / MAT row. Per-character canon.

### STR% vs Multiplier canon

- **STR% shown in-game = NOT used in damage calc** ⚠️
- **Multiplier (table below) = actual damage variable canon**
- STR% utile pour gauge spell strength relative pour un character, mais **certaines values contiennent errors** → unreliable
- Damia (le code) : utiliser **Multiplier** canon, UI éventuellement afficher STR% style

### Spells canon (8 Dragoons, 26 spells totaux + status effects)

#### 🔥 Dart (Red Dragon DS) — Fire

| Spell          | Mult | Target       | Effect                 | MP  | DLV |
| -------------- | ---- | ------------ | ---------------------- | --- | --- |
| Flame Shot     | 200  | Single Enemy | Fire magic             | 10  | 1   |
| Explosion      | 100  | All Enemies  | Fire magic AoE         | 20  | 2   |
| Final Burst    | 300  | Single Enemy | Fire magic high        | 30  | 3   |
| Red-Eye Dragon | 300  | All Enemies  | Fire magic AoE (DLV 5) | 80  | 5   |

#### ⚪ Dart (Divine Dragon DS — Disc 4 unlock)

| Spell            | Mult    | Target       | Effect                     | MP  | DLV  |
| ---------------- | ------- | ------------ | -------------------------- | --- | ---- |
| Divine DG Ball   | **400** | All Enemies  | Non-Elemental magic AoE    | 50  | Init |
| Divine DG Cannon | **600** | Single Enemy | Non-Elemental magic single | 50  | Init |

#### 🌬️ Lavitz / Albert (Jade Dragon DS) — Wind

| Spell                        | Mult | Target       | Effect                                                                                                        | MP  | DLV |
| ---------------------------- | ---- | ------------ | ------------------------------------------------------------------------------------------------------------- | --- | --- |
| Wing Blaster                 | 100  | All Enemies  | Wind magic AoE                                                                                                | 20  | 1   |
| **Blossom Storm/Rose Storm** | -    | All Allies   | **Halves most incoming damage 3 turns** (persists death, applies revive) — Power Up state, no stack with item | 20  | 2   |
| Gaspless                     | 300  | Single Enemy | Wind magic high                                                                                               | 30  | 3   |
| Jade Dragon                  | 300  | All Enemies  | Wind magic AoE (DLV 5)                                                                                        | 80  | 5   |

> ⚠️ **Blossom Storm vs Rose Storm naming** = **Albert dit "Blossom Storm"** / **Lavitz dit "Rose Storm"** canon voice line (cf. [Albert.md](../party-members/Albert.md)) — **same spell mécanique**.
>
> ⚠️ **Rare attacks ignore Power Up state** → Blossom Storm/Rose Storm shield bypass-able par Rare Monster's Rare Attack + Ghost Commander's Haunting Bolt.

#### ⚫ Rose (Dark Dragon DS) — Darkness

| Spell            | Mult | Target                             | Effect                                                                 | MP  | DLV |
| ---------------- | ---- | ---------------------------------- | ---------------------------------------------------------------------- | --- | --- |
| **Astral Drain** | 200  | Single Enemy + **All Allies heal** | Darkness magic + **heal allies based on damage / alive party members** | 10  | 1   |
| Death Dimension  | 100  | All Enemies                        | Darkness magic + **100% Fear**                                         | 20  | 2   |
| **Demon's Gate** | -    | All Enemies                        | **100% Instant Death** ⚠️                                              | 30  | 3   |
| Dark Dragon      | 400  | Single Enemy                       | Darkness magic high (DLV 5)                                            | 80  | 5   |

> 🆕 **Demon's Gate canon = 100% Instant Death AoE** ! Spell ultime debuff Rose canon. Probable boss immune (status immunity 8/8).

#### ✨ Shana / Miranda (White-Silver Dragon DS) — Light + Healing

| Spell           | Mult | Target                            | Effect                                                                      | MP  | DLV |
| --------------- | ---- | --------------------------------- | --------------------------------------------------------------------------- | --- | --- |
| **Moon Light**  | -    | Single                            | If HP 0 → **revive at 50% HP** ; else **cure all Status + restore 100% HP** | 10  | 1   |
| Star Children   | 100  | All Enemies                       | Light magic AoE                                                             | 20  | 2   |
| Gates of Heaven | -    | All Allies                        | If HP 0 → **revive 50% HP** ; else **cure all Status + heal 50% HP**        | 30  | 3   |
| W Silver Dragon | 300  | All Enemies + **All Allies heal** | Light magic AoE + **restore 100% HP** allies (cure all Status + revive 50%) | 80  | 5   |

> Pattern healer Shana/Miranda canon = **Light element + heal/revive utility focus**. **Cohérent White Silver Dragon DS healing role canon** (cf. dragons.md).

#### ⚡ Haschel (Violet Dragon DS) — Thunder

| Spell         | Mult | Target       | Effect                           | MP  | DLV |
| ------------- | ---- | ------------ | -------------------------------- | --- | --- |
| Atomic Mind   | 100  | Single Enemy | Thunder magic                    | 10  | 1   |
| Thunder Kid   | 200  | Single Enemy | Thunder magic + **100% Stun** ⚠️ | 20  | 2   |
| Thunder God   | 300  | Single Enemy | Thunder magic high               | 30  | 3   |
| Violet Dragon | 400  | Single Enemy | Thunder magic ultimate (DLV 5)   | 80  | 5   |

> Notable Haschel : **all spells Single Enemy target** (vs autres dragoons mixed). Profile single-target burst canon.

#### 💧 Meru (Blue Sea Dragon DS) — Water

| Spell              | Mult | Target       | Effect                                        | MP  | DLV |
| ------------------ | ---- | ------------ | --------------------------------------------- | --- | --- |
| Freezing Ring      | 200  | Single Enemy | Water magic                                   | 10  | 1   |
| **Rainbow Breath** | -    | All Allies   | **Cure all Status + heal 50% HP** (no revive) | 20  | 2   |
| Diamond Dust       | 200  | All Enemies  | Water magic AoE                               | 30  | 3   |
| Blue Sea Dragon    | 400  | Single Enemy | Water magic ultimate (DLV 5)                  | 80  | 5   |

> Pattern Meru canon = **hybrid offensive Water + utility heal**. Cohérent canon mi-fighter mi-healer.

#### 🟫 Kongol (Gold Dragon DS) — Earth — **EXCEPTION pattern 3 spells**

| Spell             | Mult | Target      | Effect                           | MP  | DLV (canon)           |
| ----------------- | ---- | ----------- | -------------------------------- | --- | --------------------- |
| Grand Stream      | 150  | All Enemies | Earth magic AoE                  | 20  | 1                     |
| **Meteor Strike** | 200  | All Enemies | Earth magic AoE                  | 20  | **3** (skip DLV 2) ⚠️ |
| Golden Dragon     | 300  | All Enemies | Earth magic AoE ultimate (DLV 5) | 80  | 5                     |

> 🆕 **Kongol canon exception** : **3 spells total** (vs 4 autres dragoons). **Skip DLV 2** spell unlock. Pattern unique canon — implication data-model `DragoonWielder.spellUnlockOverrides: Map<DLV, SpellId>`.

---

## Special Battle Command canon

### Conditions canon

- **All 3 party members SP meters at maximum**
- **None in Dragoon form**
- → "Special" command appears in battle menu

### Effet canon

1. **All party members transform** into Dragoon form
2. **Background → Dragoon Space** (matching instigator's element)
3. **Instigator's D'attacks auto-completed** (bypass spirit meter)
4. When **instigator de-transforms** → Dragoon Space ends

### Dragoon Space mécanique canon (Field modifier)

- **Field multiplier only applies in Dragoon Space**
- **Same element as Field** → **+50% damage** (×1.5)
- **Opposite element to Field** → **-50% damage** (×0.5)
- **Applies to allies AND enemies** (cohérent canon)
- Example : **Dart's Dragoon Space** = Fire field → Fire ×1.5 ; Water ×0.5

### ⚠️ Exception canon importante

**Dragon-named spells (Red-Eye Dragon, Jade Dragon, etc.) DON'T apply Field multiplier** despite Dragoon Space graphical effect ! Implications data-model :

```ts
DragoonSpell {
  ...
  ignoresField?: boolean; // true pour dragon-named spells
}
```

### 🆕 Kongol Special canon bonus (fandom)

- **Kongol Special transforms his Dragoon Attack from 4-hit to 5-hit** canon
- → **+25% damage bonus** unique à Kongol Special
- Pattern data-model : `DragoonWielder.specialBonus?: { kongolFiveHit: true }` ou similaire override

---

## 🆕 Anti-Dragoon Boss Mechanics canon (fandom)

Mécaniques spéciales canon utilisées par certains bosses pour neutraliser/diminuer les Dragoons :

### 1. Lloyd 2nd fight — Dragon Buster 1-shot kill canon

- **Dragon Buster** = ancient Wingly anti-Dragon weapon (cf. dragons.md/dragon-campaign.md)
- **Used by Lloyd in his 2nd fight** canon → **kills a Dragoon in single strike**
- **Talisman canon item** : protect up to **2 characters** from Dragon Buster attack ⚠️ NEW item canon
- **Tactical canon** : 2 protected → Lloyd attacks invulnerable Dragoons → fight much easier
- Implications data-model : `BossAbility.instantKillDragoonForm?: boolean` + `Item.dragoonProtection?: number` (Talisman = 2 chars)

### 2. Grand Jewel — Dragon Block Staff debuff canon

- **Grand Jewel boss** guards/wields the **Dragon Block Staff**
- → **Weakens Dragoon below base form** when used
- **Magic still works** : Healing Spells, Albert's Rose Storm fonctionnent normalement
- **Boss won't use Dragon Block Staff if player only uses 1 Dragoon turn** — conditional AI canon
- Implications data-model : `BossAbility.dragoonDebuff?: { trigger: "use_dragoon_form_turns", threshold: number }`

### 3. Melbu Frahma 4th form — similar reduce Dragoon canon

- **Final boss form 4 canon** : similar Dragoon power reduction ability
- Pattern boss endgame canon

### 4. Divine Dragon fight — Dragon Block Staff self-debuff canon

- **Party uses Dragon Block Staff** vs Divine Dragon (recovered Forest of Winglies Disc 3)
- → **Weakens own Dragoon forms in process** canon
- **Rose Storm + Miranda healing unaffected** canon (cohérent Lavitz/Albert Blossom Storm + White-Silver heal)

> Pattern canon : **Healing Magic + Shield Magic immune to Dragoon debuffs** = important data-model rule. Damia (le code) : `Spell.bypassesDragoonDebuff = true` for healing/shield categories.

### Implications design Damia

- **Tactical depth** : Dragon Buster + Dragon Block Staff = boss-specific counters
- **Talisman item** = anti-Dragon Buster gear (2-character slot canon)
- **Healing/shield magic bypass canon** = preserve core utility even debuffed

---

## Trivia canon

- **H.R. Giger influence** for Dragoons art style
- Earlier dev concept = Dragoons **grotesque appearance** (later abandoned)
- **Miranda's torso armor in Dragoon form** = remnant grotesque style canon
- **All Dragoons max flight speed = 1,200 km/h** = just barely break sound barrier
- **Some Dragoons have teleport ability** canon
- → Implications design Damia : Dragoon transformation = sprite stylé Giger-esque possible accent ; Miranda design = embrace grotesque element canon

---

## Vision Damia

### Mode Story canon-fidèle

- **8 Dragoons playables canon** : Dart (Red-Eye + Divine DS) / Lavitz (Jade Disc 1) / Albert (Jade Disc 2 héritage) / Rose / Shana / Miranda (héritage Shana) / Haschel / Meru / Kongol
- **8 archetypes canon** (cf. README dragoons + dragons.md) :
  1. Red-Eye Dragon (Fire) — Dart
  2. Jade Dragon (Wind) — Lavitz / Albert
  3. White-Silver Dragon (Light) — Shana / Miranda
  4. Darkness Dragon — Rose
  5. Violet Dragon (Thunder) — Haschel
  6. Blue-Sea Dragon (Water) — Meru
  7. Gold Dragon (Earth) — Kongol
  8. Divine Dragon (Non-Elemental, Disc 4) — Dart upgrade
- Mécanique canon : SP / DLV / D'Attack / Magic / Special — à implémenter fidèle
- Variable multipliers Power/Field/Element + Target Fear — à wirer formules

### Adaptations Damia Vision (cf. VISION §6)

- **Q1 décision** : auto-complete additions (pas QTE) ✅ — pour D'Attack possible aussi auto-complete (à trancher si différent), ou conserver inputs en real-time
- **Q5 immediate level-up** (Diablo 2-style) — DLV unlock instant quand seuil franchi
- **Performance cap 99 / Level 5 cap** (Q6) — same pour DLV ?
- **Lavitz/Albert identiques mécaniquement** (Q4) ✅
- **Q3 Wargod's Sash + Energy Girdle** (SP+ accessories) → reframer mécanique différente

### Data-model Damia critique

```ts
interface DragoonArchetype {
  id: ArchetypeId;
  element: Element;
  rank: 1-7;
  eyes: 1-7;
  spells: DragoonSpell[];  // 3-4 selon archetype
}

interface DragoonWielder {
  characterId: CharacterId;
  archetypeId: ArchetypeId;
  dlv: 1-5;
  sp: { current: number; max: number; lifetimeTotal: number };
  spellsUnlocked: SpellId[];  // depends on DLV
  spellUnlockOverrides?: Map<DLV, SpellId>; // Kongol exception
}

interface DragoonSpell {
  id: SpellId;
  multiplier: number; // not STR%
  target: "single_enemy" | "all_enemies" | "all_allies" | "single";
  element: Element;
  mpCost: number;
  unlockDLV: number;
  statusInflict?: { status: StatusEffect; chance: number };
  ignoresField?: boolean; // dragon-named spells
  heal?: { kind: "fixed" | "percent_hp" | "damage_share"; amount: number };
  revive?: { atHpPercent: number };
}

interface BattleState {
  specialActive?: { instigator: CharacterId; dragoonSpace: Element };
}
```

### À implémenter (impact code)

- **Data-model Dragoon mechanic** (cf. above)
- **SP meter UI** real-time (cf. Damia iso 2D adaptation)
- **DLV progression** : SP threshold per archetype (cf. Albert + Dart canon stats)
- **D'Attack input system** OU auto-complete (Q1 cohérent additions)
- **Magic spell system** : 26+ spells canon à implémenter avec multipliers + status + heal/revive
- **Special Battle Command** : 3-way SP max trigger + Dragoon Space field
- **Variable multipliers** : Power, Field, Element wired in damage formulas
- **DRGNAT% / DRGNMAT% per character** = data canon à reproduire
- **Kongol spell exception** (DLV 2 skip)
- **Dragon-named ignore Field** flag
- **Equipment SP-grant logic** (Spirit Ring +20/turn passive, Fairy Sword SP+ on hit, etc.)
- **Animation/sprite Dragoon form** = inspired Giger style (Miranda grotesque embrace)
- **Flight + teleport** abilities Survival mode possibilité

## Liens code & doc

- **Source canon** : [`_sources/lod-wiki-dragoon.md`](./_sources/lod-wiki-dragoon.md)
- **Dragons (créatures)** : [`./dragons.md`](./dragons.md)
- **Dragon Campaign (war lore)** : [`./dragon-campaign.md`](./dragon-campaign.md)
- **README catégorie Dragoons** : [`./README.md`](./README.md)
- **Damage formulas master** : [`../combat/damage-formula.md`](../combat/damage-formula.md)
- **Elements + Field** : [`../combat/elements.md`](../combat/elements.md)
- **Additions** : [`../combat/additions.md`](../combat/additions.md)
- **Status effects** : `../combat/status-effects.md` (à créer) — 8 statuts + cure mechanics
- **Party members** : [`../party-members/Dart.md`](../party-members/Dart.md) + [`../party-members/Albert.md`](../party-members/Albert.md) + autres
- **Items SP-related** : `../items/accessories.md` (à créer) — Spirit Ring + Wargod's Sash + Energy Girdle + Fairy Sword + Pretty Hammer + Sparkle Dress + etc.

## Questions ouvertes

- **DLV 5 max canon** — cohérent VISION Damia + canon match. À reproduire fidèle.
- **DRGNAT% / DRGNMAT% per character** — Status menu values canon. À retrouver par character (cf. tables stats).
- **6-eye Rank 2 = "God Dragon"** + 5/4 ranks named ("Ultimate Dragon" / "Dragon King") — Rank 1, 3, 6, 7 unnamed canon. Pourquoi ?
- **Gold Dragon DS purchase canon Lohan post-Gehrich** — Mr. Pelpee hint canon cohérent. À documenter `locations/Lohan.md` (à créer) + `items/goods.md`.
- **"Sometimes powers differ between two wielders of same DS"** — cohérent canon. Lavitz vs Albert Jade differences ? Shana vs Miranda White-Silver differences ? À investiguer ingestion future characters.
- **Demon's Gate 100% Instant Death canon** — boss immune via 8/8 status immunity probable (Petrify/Bewitch/Arm Block/Dispirit/Confuse/Fear/Poison/Stun ne couvre pas Instant Death... à clarifier). Boss probable resist anyway.
- **STR% errors in canon spell descriptions** — wiki note "some values contain errors". Implications : Damia (le code) doit utiliser Multiplier authoritative.
- **Field multiplier ignored par Dragon-named spells** — implementation flag canon. Important balance.
- **Pseudo Dragons 1-eye = minor mobs** — confirmation : Sea Dragon / Dragonfly / Baby Dragon / Wyvern / Triceratops / etc. (cf. dragons.md fandom liste minor enemies Mountain of Mortal Dragon + Marshlands).
- **Spirit Potion vs Recovery Ball SP** — Spirit 100% / Recovery random chance. Items canon balance.
- **Teleport ability canon** — quels Dragoons ? À investiguer (cf. trivia).
- **H.R. Giger influence design** — embrace possible Damia (le code) art direction Dragoon transformation cinematics.
- **Backwash distort nature 1000s years canon** — Dragon Campaign clashes residue. Implication world map Damia : zones still affected by Dragon-Virage clashes Disc 1-4 ?
- **Special command 3 party SP max** — restriction Damia (le code) à implémenter (require 3 party = mode Story team composition).
