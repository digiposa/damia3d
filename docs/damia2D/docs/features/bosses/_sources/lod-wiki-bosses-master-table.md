# Bosses — wiki LoD master table (verbatim)

> **Source** : [legendofdragoon.org wiki — Bosses](https://legendofdragoon.org/)
> **Fiabilité** : 🥈 **tier 2** (wiki interne communauté Damia/Wulves)
> **Sauvegardé le** : 2026-05-21.
> **Usage** : ⭐ **MASTER TABLE BOSSES CANON DAMIA** ⭐ MAJEUR — 75+ bosses Disc 1-4 stats complète + ⭐ **taxonomy canon officielle clarifiée** (Minor Enemies / **Rare Monsters subset Minor Enemies** / Bosses / **Boss Extras NEW**) + ⭐ **Pandemonium NEW Attack Item canon** (cohérent Total Vanishing pattern).

---

## Taxonomy canon officielle ⭐ MAJEUR

> **Encountered only once through scripted events, Bosses are powerful foes immune to all status ailments and carry enough narrative weight to standout from typical enemies. While most Bosses must be defeated to progress the story, optional Bosses instead provide extra side stories or rewards.**

⚠️ **Definition canon "Boss"** :

- **Scripted events** (vs random encounter)
- **Immune all status ailments** (8/8 ✔ pattern systematic)
- **Narrative weight** (vs typical enemies)
- **Required** (story progression) OR **Optional** (side stories/rewards)

### Catégories canon TLoD ⭐ officielles clarifiées

| Catégorie              | Définition canon                                                                              | Counter   | Examples canon                                          |
| ---------------------- | --------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------- |
| **Minor Enemies**      | All random battles, susceptible to items like **Total Vanishing** or **Pandemonium**          | 0/9/19/28 | Assassin Cock, Berserker, Berserk Mouse, etc.           |
| **Rare Monsters**      | ⭐ **SUBSET of Minor Enemies** with "**special resistances to damage**" (random battles also) | 28        | Blue Bird, Yellow Bird, Red Bird, Rainbow Bird, OOPARTS |
| **Bosses**             | Scripted events, immune all status, narrative weight                                          | varies    | Feyrbrand, Lenus, Divine Dragon, Melbu Frahma, etc.     |
| **Boss Extras** ⭐ NEW | Enemies in Boss encounters but **neither Minor Enemies nor Bosses**                           | varies    | (à investiguer — Virage Body/Arm pieces ? Other adds ?) |

⭐ **Correction terminology canon ⚠️ MAJEUR** :

- **Wiki tier 2 confirme** : Rare Monster = **SUBSET of Minor Enemies** (NOT separate category) — Blue Bird canonical "Minor Enemy with special resistances"
- ⚠️ **Damia adjustment** : revoir Blue Bird classification — c'est un **Minor Enemy / Rare Monster** (subset), pas une category séparée. À refléter `MonsterCategory` data-model.
- Fandom umbrella "Unique Monster" = approximative, wiki canon précise "Rare Monster subset of Minor Enemy".

⭐ **Boss Extras NEW canon ⭐ MAJEUR** :

- Pattern enemies-in-boss-fights non-categorisés Minor/Boss
- Hypothesis : Virage Body/Arm pieces (linked Head), Heart (linked Windigo), Mappi (linked Gehrich), Lenus+Regole pair, Polter pieces — likely Boss Extras (multi-part bosses) ?
- OR : adds spawned by bosses (mobs apparaissant pendant boss fight) ?
- À investiguer Discord/Wulves source tier 1 + ingestion individuelle Boss Extras.

⭐ **Pandemonium NEW canon item ⭐ MAJEUR** :

- **Attack Item canon récurrent Total Vanishing pattern** : tue minor enemies direct (Demon's Gate probable confirm)
- Cohérent pattern Erase Attack Items canon (Total Vanishing + Pandemonium + Demon's Gate ?)
- À documenter `items/consumables.md` (à créer) Pandemonium entry.

### Cross-reference catégories complètes Damia

| Catégorie                 | Source                                      | Counter   | Notes                                                                                                |
| ------------------------- | ------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------- |
| Minor Enemy               | wiki master + per-page wiki                 | 0/9/19/28 | Standard mobs (Berserker, Beastie Dragon, etc.)                                                      |
| **Rare Monster** (subset) | wiki master                                 | 28        | Damage Mitigation + Magical Immunity passives (Birds, OOPARTS)                                       |
| **Unique Monster / Jar**  | `combat/_sources/lod-wiki-additions.md:156` | 16        | Lucky Jar, Cursed Jar, Treasure Jar — only status-vulnerable kill canon (separate from Rare Monster) |
| **Boss**                  | wiki master                                 | varies    | Scripted, all status immune, narrative                                                               |
| **Boss Extras**           | wiki master (NEW canon)                     | varies    | In boss fights, not Minor nor Boss (à investiguer)                                                   |

⚠️ **Damia Lucky Jar TODO existing classifications** :

- TODO 1532 "00PARTS + Red Bird = Unique Monsters Gold farming" — ⚠️ **terminology error** : 00PARTS + Red Bird = **Rare Monsters** (Counter 28 confirmed wiki master) NOT Unique Monsters. Lucky Jar/Cursed Jar/Treasure Jar = Unique Monsters (Counter 16).
- À reconcilier : fandom utilise "Unique Monster" umbrella, wiki tier 2 distingue clairement Rare Monsters (Birds + OOPARTS) vs Unique Monsters (Jars).

---

## Master Table Bosses canon Damia

Sortable table arranged alphabetically par column. Click to toggle highest to lowest sort.

| Name                                            | Element       | HP     | DF  | MDF | PAV | MAV | AT  | MAT | SPD | EXP       | Gold    | Drops                | Location                    |
| ----------------------------------------------- | ------------- | ------ | --- | --- | --- | --- | --- | --- | --- | --------- | ------- | -------------------- | --------------------------- |
| Commander                                       | Darkness      | 14     | 40  | 40  | 0%  | 0%  | 2   | 4   | 40  | 20        | 20      | Burn Out 100%        | Seles                       |
| Fruegel                                         | Earth         | 90     | 100 | 80  | 0%  | 0%  | 5   | 3   | 50  | 300       | 50      | Knight Shield 100%   | Hellena Prison              |
| Urobolus                                        | Earth         | 280    | 80  | 60  | 0%  | 0%  | 8   | 8   | 50  | 400       | 50      | Wargod's Amulet 100% | Limestone Cave              |
| Sandora Elite                                   | Darkness      | 280    | 80  | 120 | 0%  | 0%  | 10  | 11  | 60  | 200       | 50      | Healing Breeze 100%  | Hoax                        |
| Kongol                                          | Earth         | 256    | 100 | 50  | 0%  | 0%  | 10  | 10  | 60  | 300       | 50      | Power Wrist 100%     | Hoax                        |
| Virage Head (with Body and Arm)                 | Non-Elemental | 360    | 80  | 120 | 0%  | 0%  | 16  | 17  | 50  | 600       | 100     | Healing Potion 100%  | Volcano Villude             |
| Virage Body (with Head and Arm)                 | Non-Elemental | 240    | 100 | 100 | 0%  | 0%  | 16  | 9   | 50  | 0         | 0       | Healing Potion 100%  | Volcano Villude             |
| Virage Arm (with Head and Body)                 | Non-Elemental | 48     | 100 | 100 | 0%  | 0%  | 14  | 9   | 50  | 0         | 0       | Mind Purifier 100%   | Volcano Villude             |
| Fire Bird                                       | Fire          | 640    | 80  | 80  | 0%  | 0%  | 13  | 16  | 45  | 800       | 100     | Red-Eye Stone 100%   | Volcano Villude             |
| Greham (with Feyrbrand)                         | Wind          | 350    | 120 | 100 | 0%  | 0%  | 13  | 15  | 60  | 1200      | 100     | Plate Mail 30%       | Nest of Dragon              |
| Feyrbrand (with Greham)                         | Wind          | 480    | 100 | 80  | 0%  | 0%  | 18  | 12  | 50  | 0         | 0       | Down Burst           | Nest of Dragon              |
| Drake the Bandit                                | Wind          | 1,200  | 80  | 80  | 0%  | 0%  | 20  | 17  | 70  | 1500      | 100     | Bandit's Ring 30%    | Shrine of Shirley           |
| Shirley                                         | Light         | 640    | 80  | 120 | 0%  | 0%  | 15  | 15  | 50  | 0 (1,500) | 0 (100) | Silver Stone 100%    | Shrine of Shirley           |
| Gorgaga                                         | Non-Elemental | 160    | 100 | 80  | 0%  | 0%  | 16  | 16  | 50  | 0         | 0       | Nothing              | Lohan                       |
| Serfius                                         | Fire          | 200    | 100 | 100 | 0%  | 0%  | 20  | 20  | 50  | 0         | 0       | Nothing              | Lohan                       |
| Danton                                          | Earth         | 240    | 120 | 80  | 0%  | 0%  | 23  | 8   | 45  | 0         | 0       | Nothing              | Lohan                       |
| Atlow                                           | Darkness      | 266    | 80  | 100 | 0%  | 0%  | 16  | 16  | 55  | 0         | 0       | Nothing              | Lohan                       |
| Lloyd                                           | Non-Elemental | 399    | 100 | 100 | 0%  | 0%  | 20  | 20  | 50  | 0         | 0       | Nothing              | Lohan                       |
| Jiango                                          | Earth         | 1,280  | 160 | 80  | 0%  | 0%  | 23  | 18  | 50  | 2,000     | 100     | Sachet 100%          | Hellena Prison              |
| Fruegel (2nd Visit)                             | Earth         | 1,000  | 100 | 80  | 0%  | 0%  | 25  | 19  | 50  | 2000      | 200     | Gravity Grabber 100% | Hellena Prison              |
| Kongol (Black Castle)                           | Earth         | 1,000  | 140 | 80  | 0%  | 0%  | 32  | 21  | 50  | 2000      | 200     | Wargod Calling 30%   | Black Castle                |
| Emperor Doel                                    | Thunder       | 600    | 100 | 100 | 0%  | 0%  | 30  | 30  | 55  | 3,000     | 200     | Nothing              | Black Castle                |
| Dragoon Doel                                    | Thunder       | 1,800  | 120 | 100 | 0%  | 0%  | 32  | 34  | 55  | 0         | 0       | Nothing              | Black Castle                |
| Mappi                                           | Darkness      | 640    | 110 | 100 | 0%  | 0%  | 30  | 27  | 70  | 2,000     | 150     | Total Vanishing 100% | Barrens                     |
| Virage Head (with Body and Arm ×2)              | Non-Elemental | 1,600  | 100 | 100 | 0%  | 0%  | 30  | 30  | 50  | 4,500     | 200     | Moon Serenade 100%   | Valley of Corrupted Gravity |
| Virage Body (with Head and Arm ×2)              | Non-Elemental | 600    | 100 | 100 | 0%  | 0%  | 37  | 30  | 50  | 0         | 0       | Nothing              | Valley of Corrupted Gravity |
| Virage Arm (with Head and Body)                 | Non-Elemental | 300    | 100 | 100 | 0%  | 0%  | 37  | 30  | 50  | 0         | 0       | Nothing              | Valley of Corrupted Gravity |
| Gehrich (with Mappi)                            | Earth         | 2,000  | 120 | 100 | 0%  | 0%  | 42  | 32  | 50  | 5,000     | 200     | Soul Headband 25%    | Home of Giganto             |
| Mappi (with Gehrich)                            | Darkness      | 1,200  | 110 | 100 | 0%  | 0%  | 37  | 32  | 65  | 0         | 0       | Diamond Claw 25%     | Home of Giganto             |
| Lenus                                           | Water         | 3,500  | 100 | 160 | 0%  | 0%  | 44  | 62  | 50  | 6,000     | 200     | Nothing              | Fletz                       |
| Ghost Commander                                 | Darkness      | 1,700  | 100 | 100 | 0%  | 0%  | 53  | 53  | 60  | 6,000     | 200     | Night Raid 100%      | Phantom Ship                |
| Lenus (with Regole)                             | Water         | 3,000  | 100 | 180 | 0%  | 0%  | 44  | 60  | 55  | 0         | 0       | Jeweled Crown 50%    | Undersea Cavern             |
| Regole (with Lenus)                             | Water         | 3,000  | 120 | 80  | 0%  | 0%  | 59  | 37  | 45  | 7,000     | 250     | Frozen Jet 100%      | Undersea Cavern             |
| Kamuy (Optional)                                | Non-Elemental | 4,000  | 100 | 150 | 0%  | 0%  | 65  | 65  | 70  | 8,000     | 0       | Darkness Stone 100%  | Evergreen Forest            |
| S Virage Head (with Body and Arm) (Optional)    | Non-Elemental | 10,400 | 100 | 100 | 0%  | 0%  | 70  | 110 | 50  | 4,000     | 200     | Healing Rain 100%    | Kadessa                     |
| S Virage Body (with Head and Arm) (Optional)    | Non-Elemental | 10,400 | 100 | 100 | 0%  | 0%  | 70  | 110 | 50  | 0         | 0       | Nothing              | Kadessa                     |
| S Virage Arm (with Head and Body) (Optional)    | Non-Elemental | 5,200  | 100 | 100 | 0%  | 0%  | 80  | 110 | 50  | 0         | 0       | Nothing              | Kadessa                     |
| Grand Jewel                                     | Earth         | 4,500  | 100 | 160 | 0%  | 0%  | 41  | 58  | 70  | 9,000     | 300     | Spectral Flash 100%  | Kadessa                     |
| Divine Dragon (with Cannon and Ball)            | Non-Elemental | 5,000  | 160 | 60  | 0%  | 0%  | 60  | 53  | 60  | 10,000    | 300     | Dragon Shield 20%    | Mountain of Mortal Dragon   |
| Divine Cannon (with Dragon and Ball)            | Non-Elemental | 2,000  | 160 | 60  | 0%  | 0%  | 51  | 60  | 50  | 0         | 0       | Gravity Grabber 100% | Mountain of Mortal Dragon   |
| Divine Ball (with Dragon and Cannon)            | Non-Elemental | 2,000  | 160 | 60  | 0%  | 0%  | 51  | 53  | 50  | 0         | 0       | Flash Hall 100%      | Mountain of Mortal Dragon   |
| Windigo (with Heart)                            | Water         | 10,000 | 100 | 120 | 0%  | 0%  | 80  | 80  | 50  | 11,000    | 250     | Brass Knuckle 100%   | Kashua Glacier              |
| Heart (with Windigo)                            | Water         | 3      | 60  | 60  | 0%  | 0%  | 68  | 68  | 50  | 0         | 0       | Nothing              | Kashua Glacier              |
| Lloyd (Flanvel Tower)                           | Non-Elemental | 6,000  | 100 | 150 | 0%  | 0%  | 80  | 65  | 65  | 12,000    | 300     | Nothing              | Flanvel Tower               |
| Magician Faust (Apparition)                     | Non-Elemental | 25,600 | 50  | 200 | 0%  | 20% | 125 | 125 | 50  | 0         | 0       | Nothing              | Flanvel Tower               |
| Polter Helm (with Armor and Sword) (Optional)   | Darkness      | 2,400  | 100 | 160 | 0%  | 0%  | 71  | 71  | 50  | 6,000     | 200     | Nothing              | Snowfield                   |
| Polter Armor (with Helm and Sword) (Optional)   | Darkness      | 4,000  | 160 | 140 | 0%  | 0%  | 71  | 116 | 50  | 0         | 0       | Smoke Ball 100%      | Snowfield                   |
| Polter Sword (with Helm and Armor) (Optional)   | Darkness      | 3,200  | 120 | 120 | 0%  | 0%  | 134 | 71  | 100 | 0         | 0       | Soul Eater 100%      | Snowfield                   |
| Last Kraken                                     | Water         | 10,000 | 140 | 200 | 0%  | 0%  | 98  | 80  | 50  | 12,000    | 300     | Pretty Hammer 100%   | Aglis                       |
| Magician Faust (Optional)                       | Non-Elemental | 25,600 | 50  | 200 | 0%  | 20% | 125 | 125 | 50  | 20,000    | 10,000  | Phantom Shield 100%  | Flanvel Tower               |
| Belzac (Optional)                               | Earth         | 16,000 | 200 | 80  | 0%  | 0%  | 178 | 71  | 50  | 6,000     | 300     | Golden Stone 100%    | Vellweb                     |
| Damia (Optional)                                | Water         | 9,000  | 100 | 200 | 0%  | 0%  | 116 | 116 | 60  | 6,000     | 300     | Blue Sea Stone 100%  | Vellweb                     |
| Kanzas (Optional)                               | Thunder       | 12,000 | 120 | 150 | 10% | 0%  | 134 | 107 | 70  | 6,000     | 300     | Violet Stone 100%    | Vellweb                     |
| Syuveil (Optional)                              | Wind          | 10,000 | 150 | 120 | 10% | 0%  | 152 | 98  | 50  | 6,000     | 300     | Jade Stone 100%      | Vellweb                     |
| Kubila (with Vector and Selebus)                | Darkness      | 3,500  | 140 | 140 | 0%  | 0%  | 80  | 75  | 55  | 0         | 0       | Nothing              | Zenebatos                   |
| Vector (with Kubila and Selebus)                | Darkness      | 4,000  | 100 | 100 | 0%  | 0%  | 89  | 67  | 50  | 12,000    | 300     | Nothing              | Zenebatos                   |
| Selebus (with Kubila and Vector)                | Darkness      | 3,000  | 120 | 180 | 10% | 0%  | 71  | 95  | 60  | 0         | 0       | Nothing              | Zenebatos                   |
| Dragon Spirit (with Ghost Feyrbrand) (Optional) | Wind          | 8,000  | 100 | 80  | 0%  | 0%  | 89  | 71  | 60  | 0         | 0       | Nothing              | Mayfil                      |
| Ghost Feyrbrand (with Dragon Spirit) (Optional) | Wind          | 8,000  | 100 | 80  | 0%  | 0%  | 89  | 71  | 60  | 4,000     | 200     | Down Burst 100%      | Mayfil                      |
| Dragon Spirit (with Ghost Regole) (Optional)    | Water         | 12,000 | 80  | 120 | 0%  | 0%  | 98  | 71  | 60  | 0         | 0       | Nothing              | Mayfil                      |
| Ghost Regole (with Dragon Spirit) (Optional)    | Water         | 12,000 | 80  | 120 | 0%  | 5%  | 98  | 71  | 60  | 6,000     | 300     | Frozen Jet 100%      | Mayfil                      |
| Dragon Spirit (with Divine Dragon Ghost) (Opt.) | Non-Elemental | 16,000 | 160 | 100 | 0%  | 0%  | 107 | 116 | 60  | 0         | 0       | Nothing              | Mayfil                      |
| Divine Dragon Ghost (with Dragon Spirit) (Opt.) | Non-Elemental | 16,000 | 160 | 100 | 0%  | 0%  | 107 | 116 | 60  | 8,000     | 400     | Flash Hall 100%      | Mayfil                      |
| Lavitz's Spirit (with Zackwell)                 | Wind          | 5,000  | 120 | 80  | 0%  | 0%  | 88  | 88  | 50  | 12,000    | 300     | Halberd 50%          | Mayfil                      |
| Zackwell (with Lavitz's Spirit)                 | Darkness      | 8,000  | 140 | 170 | 0%  | 0%  | 125 | 88  | 60  | 0         | 0       | Healing Rain 100%    | Mayfil                      |
| Caterpillar                                     | Non-Elemental | 6,000  | 120 | 120 | 0%  | 0%  | 110 | 92  | 70  | 13,000    | 300     | Healing Rain 100%    | Divine Tree                 |
| Pupa (Caterpillar Transformed)                  | Non-Elemental | 2,500  | 160 | 160 | 0%  | 0%  | 92  | 92  | 60  | 0         | 0       | Moon Serenade 100%   | Divine Tree                 |
| Imago (Pupa Transformed)                        | Non-Elemental | 12,000 | 120 | 160 | 0%  | 0%  | 100 | 134 | 70  | 0         | 0       | Sun Rhapsody 100%    | Divine Tree                 |
| Death Rose                                      | Non-Elemental | 2,400  | 80  | 140 | 0%  | 0%  | 44  | 44  | 50  | 6,000     | 0       | Nothing              | Moon That Never Sets        |
| Claire                                          | Thunder       | 3,200  | 100 | 100 | 0%  | 0%  | 76  | 76  | 55  | 6,000     | 0       | Nothing              | Moon That Never Sets        |
| Indora                                          | Earth         | 2696   | 160 | 60  | 0%  | 0%  | 93  | 93  | 30  | 6,000     | 0       | Indora's Axe 100%    | Moon That Never Sets        |
| Michael (with Michael's Core)                   | Darkness      | 9,600  | 120 | 160 | 0%  | 0%  | 109 | 109 | 55  | 12,000    | 0       | Nothing              | Moon That Never Sets        |
| Michael's Core (with Michael)                   | Darkness      | 1,280  | 100 | 100 | 0%  | 0%  | 109 | 109 | 50  | 0         | 0       | Nothing              | Moon That Never Sets        |
| Dark Doel                                       | Thunder       | 1,500  | 120 | 120 | 0%  | 0%  | 60  | 70  | 50  | 6,000     | 0       | Nothing              | Moon That Never Sets        |
| Archangel                                       | Light         | 3,000  | 80  | 160 | 5%  | 5%  | 53  | 76  | 50  | 6,000     | 0       | Nothing              | Moon That Never Sets        |
| S Virage Head (with Body and Arm) MTNS          | Non-Elemental | 10,000 | 100 | 100 | 0%  | 0%  | 110 | 75  | 50  | 15,000    | 300     | Nothing              | Moon That Never Sets        |
| S Virage Body (with Head and Arm) MTNS          | Non-Elemental | 15,000 | 180 | 120 | 0%  | 0%  | 90  | 75  | 40  | 0         | 0       | Nothing              | Moon That Never Sets        |
| S Virage Arm (with Head and Body) MTNS          | Non-Elemental | 3,000  | 140 | 120 | 0%  | 0%  | 90  | 75  | 60  | 0         | 0       | Nothing              | Moon That Never Sets        |
| Zieg Feld                                       | Fire          | 12,000 | 120 | 150 | 0%  | 0%  | 152 | 110 | 70  | 20,000    | 400     | Nothing              | Moon That Never Sets        |
| Melbu Frahma                                    | Non-Elemental | 42,000 | 200 | 250 | 0%  | 0%  | 107 | 80  | 50  | 0         | 0       | Nothing              | Moon That Never Sets        |

⚠️ **75 boss entries canon TLoD** : Disc 1 (~20) / Disc 2 (~9) / Disc 3 (~17) / Disc 4 (~29).

### Notes canon majeures

⭐ **NEW canon highlights** :

- **Shirley** : EXP/Gold "0 (1,500)" + "0 (100)" — pattern conditional reward (likely "spare/spare path" canon — à investiguer)
- **Magician Faust 2-versions** : Apparition (Flanvel Tower Disc 3, 0 EXP/Gold) + Optional rematch (20,000 EXP / 10,000 Gold ⚠️ highest Gold reward TLoD)
- **Vellweb 4 Dragoon Knights Optional** : Belzac (Earth, 16k HP, 178 AT highest) / Damia (Water, 200 MDF) / Kanzas (Thunder, 10% PAV) / Syuveil (Wind, 10% PAV, 152 AT) — all 6k EXP / 300 Gold / Stone drop
- **Mayfil Ghost Dragon Spirit fights** : 3 spirit pairs (Feyrbrand / Regole / Divine Dragon Ghost) optional with companion Ghost mob — pattern "haunted Dragon Spirits" canon (Disc 4 Mayfil)
- **Lavitz's Spirit canon Disc 4 Mayfil** : 5,000 HP / 12,000 EXP / drops Halberd 50% — paired with **Zackwell** boss
- **Melbu Frahma final** : **42,000 HP** ⭐ MAJEUR highest HP boss TLoD + 200 DF / 250 MDF / 107 AT (lower than expected for final) — pattern "high HP / mod stats" final boss design
- **Heart (Windigo)** : **HP 3** ⭐ lowest boss HP — pattern Heart canon (must be killed during Windigo fight, instant-kill possible)
- **Polter Sword SPD 100** = highest SPD boss (vs 50 standard) — pattern animated weapon canon
- **Magician Faust 20% MAV** = highest MAV (vs 0% standard) + 50 DF / 200 MDF — magic-focused boss canon
- **Indora SPD 30** = lowest SPD boss — pattern Giganto slow canon

⭐ **Stats patterns canon** :

- **Most bosses A-AV/M-AV 0%** : except Magician Faust (20% MAV), Kanzas/Syuveil (10% PAV), Archangel (5% PAV/MAV), Selebus (10% PAV), Ghost Regole (5% MAV)
- **HP scaling Disc 1 → 4** : 14 (Commander) → 1,200 (Drake) → 5,000 (Divine Dragon Disc 3) → 42,000 (Melbu Frahma)
- **AT scaling Disc 1 → 4** : 2 (Commander) → 32 (Doel) → 134 (Polter Sword Disc 3) → 178 (Belzac Vellweb optional max)

⭐ **Drops canon highlights** :

- **Total Vanishing 100% Mappi (Barrens Disc 2)** ⭐ — boss-drop Attack Item canon (cohérent Beastie Dragon 8% drop)
- **Indora's Axe 100% Indora (Moon That Never Sets Disc 4)** — boss-locked Kongol weapon canon
- **Pretty Hammer 100% Last Kraken (Aglis Disc 4)** — Kongol weapon canon
- **Wargod's Amulet 100% Urobolus (Limestone Cave Disc 1)** ⭐ — earliest accessory canon (cohérent Blue Bird strategy "Wargod's Amulet" recommend)
- **Brass Knuckle 100% Windigo (Kashua Glacier Disc 3)** — Haschel weapon canon
- **Halberd 50% Lavitz's Spirit (Mayfil Disc 4)** — Albert weapon canon (cohérent existing TODO 1428 "Halberd via Lavitz Spirit Phantom Ship Disc 2" — ⚠️ wiki master confirms Mayfil Disc 4 not Phantom Ship Disc 2 — REVISION canon needed)
- **Down Burst Feyrbrand + Ghost Feyrbrand** — pattern recurring drop canon Wind Dragon entities
- **Dragoon Stones** : Silver Stone (Shirley Disc 1) / Red-Eye Stone (Fire Bird Disc 1) / Darkness Stone (Kamuy Disc 2 optional) / Golden Stone (Belzac) / Blue Sea Stone (Damia) / Violet Stone (Kanzas) / Jade Stone (Syuveil) — Vellweb Disc 3 optional bosses

⚠️ **Halberd source canon REVISION** ⭐ : Existing TODO 1428 says "Halberd via Lavitz Spirit Phantom Ship Disc 2" — wiki master canon dit **Lavitz's Spirit at Mayfil (Disc 4)** drops Halberd 50%. Phantom Ship Disc 2 has Ghost Commander (drops Night Raid 100%) — pas Lavitz. À reconcilier `items/equipment.md` Halberd source canon.

⚠️ **Magician Faust Optional Gold 10,000** ⭐ MAJEUR : highest single-encounter Gold reward TLoD canon (vs 400 Divine Dragon Ghost) — pattern Optional Faust = endgame Gold farm.
