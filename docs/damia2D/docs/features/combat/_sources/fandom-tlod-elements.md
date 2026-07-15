# Elements — TLoD (Fandom Wiki)

> **Source** : [The Legend of Dragoon Wiki — Element](https://legendofdragoon.fandom.com/wiki/Element).
> **Fiabilité** : 🥉 **tier 3** (cf. [hiérarchie sources](../../README.md#hiérarchie-de-fiabilité-des-sources-canon-tlod)) — vue narrative, **plusieurs claims démentis par tier 1/2** (×2 opposing, ×2 Non-Elemental vs all, Divine Dragon "divine element").
>
> ⚠️ **Préférer** [`lod-wiki-element.md`](./lod-wiki-element.md) (🥈) ou [`wulves-tlod-damage-formulas.md`](./wulves-tlod-damage-formulas.md) (🥇) pour les **nombres et formules**.
>
> Le fandom reste utile pour les **listings** (enemies par élément, lore narratif) — à recouper avec tier 1/2 quand possible.
> **Sauvegardé le** : 2026-05-18.
> **Usage** : référence pour [`elements.md`](../elements.md), [`damage-modifiers.md`](../damage-modifiers.md), [`damage-formula.md`](../damage-formula.md) (modifiers Field/Element), `dragoons/` (affinité par archetype), `items/` (armes élémentales), `bosses/` (éléments des bosses).

> Light formatting markdown appliqué. Toutes informations / tables préservées.

---

## Aperçu

In _The Legend of Dragoon_, there are **eight elements** for characters, enemies and magical attacks that influence the amount of damage dealt or taken by an elemental attack in battles :

1. Fire
2. Water
3. Wind
4. Earth
5. Light
6. Darkness
7. Thunder
8. Non-Elemental (Unbased)

---

## How Elements Work

For magical attacks (Dragoon Magic, Magical Attack Items, magical attacks by monsters/bosses), **three pairs of elements are opposed** to each other and deal **double damage** to each other, whereas if a character/monster/boss is hit with a magic of the **same element as themselves**, the damage dealt is **cut in half**.

As a general rule, enemies and bosses use magical attacks of their own element against the heroes. Exceptions exist :

- **Virages** — Laser is a light elemental attack
- **Last Kraken** — uses Thunder, Light and Water attacks

### Opposing Elements (×2 damage)

- **Fire ↔ Water**
- **Wind ↔ Earth**
- **Light ↔ Darkness**

All of these elements **resist magical attacks of their own element** with damage cut in half (×0.5).

### Thunder Element

Thunder has the **unique property of having no opposing element**. This means thunder magical attacks cannot deal double damage to any other element. It also has no weaknesses on its own (except Non-Elemental, see below) and resists itself.

### Non-Elemental (Unbased)

> ⚠️ **CETTE SECTION EST EN PARTIE DÉMENTIE PAR TIER 1** (Discord communauté, 2026-05-18). Voir [`discord-tlod-clarifications.md`](./discord-tlod-clarifications.md). Résumé :
>
> - **Non-Elemental existe** comme élément en jeu (couleur grise, confirmé user)
> - ❌ Le claim **"deals double damage against all other elements"** est **FAUX** (BS confirmé par Icarus et DrewUniverse, cador crédité chez Wulves)
> - ❌ Le claim que Psyche Bomb / Divine Dragon sont devastating à cause de Non-Elemental est **FAUX** : Psyche Bomb scale via BID élevé (400), Divine Dragon attacks utilisent les éléments réguliers indiqués par chaque sort (Burning Wave = Fire, etc.)
> - ❓ "Does NOT resist itself" : provient du même paragraphe démenti, **à vérifier** indépendamment via tier 1
>
> **Conserver cette section uniquement à titre historique** pour expliquer les divergences. Ne pas utiliser comme source.

Unique properties :

- **No opposite**
- **Deals double damage against characters/monsters/bosses of all other elements**
- **Does NOT resist itself** (so vs other Non-Elemental, normal damage)

The unique properties of Non-Elemental is the main reason why the magical attacks of the **Divine Dragon** and the **Psychedelic Bomb**, among others, are especially devastating.

---

## Elemental Weapons

For each character **except Kongol and Meru**, there is a weapon dealing physical damage with an element. Inflicted damage to an enemy of the **opposing element is doubled**. Visual effect : "sparks" of the attacking element appear around the enemy upon each hit.

Examples :

- Albert with Twister Glaive in the Barrens (Disc 2, several Earth-element monsters)
- Dart with Heat Blade in Undersea Cavern or Kashua Glacier

When damage is dealt to an enemy of the same element with an elemental weapon, **damage is cut in half**.

### Elemental Weapons per Character

| Character       | Weapon         | Element  |
| --------------- | -------------- | -------- |
| Dart            | Heat Blade     | Fire     |
| Lavitz / Albert | Twister Glaive | Wind     |
| Shana           | Sparkle Arrow  | Light    |
| Rose            | Shadow Cutter  | Darkness |
| Haschel         | Thunder Fist   | Thunder  |
| Kongol          | _(none)_       | —        |
| Meru            | _(none)_       | —        |

---

## Elements détaillés

> _Les sections d'éléments suivent l'ordre canonique d'apparition des Dragoons / characters qui deviendront Dragoons de cet élément._

### Fire

- Strong vs Water ; vice versa
- Resists itself (×0.5)
- Weak to Non-Elemental
- **Group character** : Dart — Red-Eye Dragoon

#### Fire Enemies

All non-boss enemies in the **second visit of Hellena** are Fire element. 19 fire-element enemies total (excluding bosses), 15 of which are encountered before Meru joins (Disc 2).

> _Stats in parentheses are from the Japanese version (if they differ from the American/European release)._

| Name              | HP         | EXP | Gold   | AT  | DF  | MAT | MDF | SPD | Location               |
| ----------------- | ---------- | --- | ------ | --- | --- | --- | --- | --- | ---------------------- |
| Fire Spirit       | 26 (33)    | 13  | 12     | 11  | 100 | 15  | 160 | 60  | Volcano Villude        |
| Fowl Fighter      | 100        | 16  | 9 (3)  | 17  | 80  | 22  | 120 | 60  | Hellena Prison         |
| Goblin            | 4 (5)      | 6   | 4      | 2   | 120 | 3   | 120 | 40  | Forest                 |
| Hell Hound        | 150        | 20  | 9 (3)  | 20  | 80  | 33  | 160 | 60  | Black Castle           |
| Hellena Warden    | 9 (12)     | 6   | 9 (3)  | 4   | 100 | 4   | 100 | 50  | Hellena Prison         |
| Hellena Warden    | 120 (150)  | 20  | 15     | 19  | 100 | 19  | 100 | 50  | Hellena Prison         |
| Knight of Sandora | 5 (4)      | 2   | 3      | 2   | 40  | 4   | 50  | 40  | Seles                  |
| Knight of Sandora | 180 (200)  | 24  | 15     | 24  | 100 | 24  | 100 | 50  | Black Castle           |
| Magma Fish        | 26 (30)    | 10  | 6      | 9   | 80  | 13  | 120 | 80  | Volcano Villude        |
| Mega Sea Dragon   | 176 (220)  | 80  | 21     | 48  | 120 | 68  | 120 | 70  | Mountain Mortal Dragon |
| Red Hot           | 40 (50)    | 14  | 6      | 11  | 100 | 11  | 100 | 60  | Volcano Villude        |
| Salamander        | 41 (40)    | 17  | 9 (3)  | 13  | 140 | 12  | 60  | 50  | Volcano Villude        |
| Sea Dragon        | 33 (45)    | 14  | 8      | 9   | 80  | 13  | 120 | 70  | Marshlands             |
| Senior Warden     | 150        | 24  | 18 (6) | 23  | 130 | 19  | 80  | 60  | Hellena Prison         |
| Swift Dragon      | 968 (1111) | 228 | 24     | 74  | 120 | 86  | 120 | 80  | Moon                   |
| Will-O-Wisp       | 160 (200)  | 48  | 12     | 34  | 80  | 48  | 180 | 80  | Phantom Ship           |

### Wind

- Strong vs Earth ; vice versa
- Resists itself
- Weak to Non-Elemental
- **Group characters** : Lavitz, Albert — Jade Dragoon

#### Wind Enemies

| Name           | HP          | EXP | Gold    | AT  | DF  | MAT | MDF | SPD | Location                    |
| -------------- | ----------- | --- | ------- | --- | --- | --- | --- | --- | --------------------------- |
| Air Combat     | 1080 (1350) | 456 | 33 (11) | 105 | 160 | 86  | 120 | 50  | Moon That Never Sets        |
| Assassin Cock  | 3 (4)       | 5   | 6 (2)   | 2   | 100 | 3   | 120 | 50  | Forest                      |
| Beastie Dragon | 363 (420)   | 110 | 33 (11) | 80  | 130 | 48  | 90  | 50  | Mountain of Mortal Dragon   |
| Canbria Dayfly | 520 (650)   | 112 | 30 (10) | 65  | 100 | 86  | 140 | 70  | Death Frontier              |
| Crescent Bee   | 9 (20)      | 10  | 6 (2)   | 6   | 100 | 6   | 100 | 60  | Prairie                     |
| Erupting Chick | 120 (150)   | 32  | 15      | 26  | 80  | 26  | 30  | 80  | Valley of Corrupted Gravity |
| Flying Rat     | 260 (300)   | 64  | 24      | 43  | 80  | 61  | 120 | 60  | Evergreen Forest            |
| Forest Runner  | 360 (450)   | 88  | 30      | 50  | 80  | 50  | 120 | 80  | Evergreen Forest            |
| Harpy          | 600 (750)   | 192 | 48      | 85  | 120 | 80  | 160 | 60  | Zenebatos                   |
| Professor      | 869 (999)   | 176 | 54      | 65  | 100 | 93  | 180 | 70  | Zenebatos                   |
| Roc            | 220 (260)   | 44  | 24      | 37  | 100 | 31  | 30  | 60  | Valley of Corrupted Gravity |
| Sky Chaser     | 680 (850)   | 128 | 30      | 76  | 100 | 76  | 100 | 60  | Zenebatos                   |
| Stinger        | 64 (80)     | 38  | 12      | 31  | 70  | 31  | 120 | 70  | Barrens                     |
| Tricky Bat     | 33 (40)     | 12  | 6       | 9   | 80  | 17  | 120 | 70  | Nest of Dragon              |
| Ugly Balloon   | 36 (45)     | 10  | 9       | 7   | 70  | 7   | 200 | 60  | Limestone Cave              |
| Windy Weasel   | 320 (400)   | 96  | 31      | 56  | 80  | 79  | 100 | 70  | Snowfield                   |
| Wyvern         | 594 (680)   | 120 | 45      | 80  | 160 | 69  | 100 | 80  | Mountain of Mortal Dragon   |

### Light

- Strong vs Darkness ; vice versa
- Resists itself
- Weak to Non-Elemental
- **Group characters** : Shana, Miranda — White-Silver Dragoon
- **Note** : Light is tied with Non-Element for the **least amount of non-boss enemies** in the game (5 total).

#### Light Enemies

| Name          | HP          | EXP | Gold   | AT  | DF  | MAT | MDF | SPD | Location          |
| ------------- | ----------- | --- | ------ | --- | --- | --- | --- | --- | ----------------- |
| Crystal Golem | 160 (200)   | 22  | 27 (9) | 20  | 120 | 21  | 160 | 80  | Shrine of Shirley |
| Fairy         | 320 (400)   | 82  | 24     | 45  | 80  | 64  | 150 | 70  | Forbidden Land    |
| Psyche Druid  | 2000 (2500) | 638 | 84     | 60  | 100 | 121 | 160 | 60  | Moon              |
| Unicorn       | 1280 (1600) | 380 | 51     | 86  | 140 | 121 | 160 | 60  | Moon              |
| Witch         | 360 (450)   | 104 | 34     | 58  | 80  | 96  | 200 | 60  | Vellweb           |

### Darkness

- Strong vs Light ; vice versa
- Resists itself
- Weak to Non-Elemental
- **Group character** : Rose — Darkness Dragoon

#### Darkness Enemies

| Name           | HP         | EXP   | Gold    | AT  | DF  | MAT | MDF | SPD | Location                    |
| -------------- | ---------- | ----- | ------- | --- | --- | --- | --- | --- | --------------------------- |
| Berserk Mouse  | 2 (4)      | 3 (1) | 3 (1)   | 2   | 80  | 2   | 120 | 50  | Forest                      |
| Berserker      | 400 (500)  | 55    | 15 (5)  | 55  | 30  | 36  | 50  | 60  | Home of Gigantos            |
| Crafty Thief   | 200 (250)  | 50    | 18 (6)  | 36  | 100 | 31  | 80  | 80  | Home of Gigantos            |
| Dark Elf       | 450 (500)  | 80    | 36 (12) | 50  | 70  | 50  | 120 | 70  | Evergreen Forest            |
| Death          | 200 (250)  | 66    | 30      | 56  | 120 | 40  | 60  | 50  | Phantom Ship                |
| Death Purger   | 583 (666)  | 134   | 22      | 93  | 120 | 65  | 100 | 50  | Zenebatos                   |
| Gargoyle       | 100 (120)  | 17    | 15      | 17  | 80  | 18  | 160 | 70  | Shrine of Shirley           |
| Guillotine     | 622 (777)  | 160   | 41      | 110 | 150 | 93  | 120 | 60  | Zenebatos                   |
| Hyper Skeleton | 960 (1200) | 187   | 48      | 114 | 180 | 81  | 80  | 60  | Mayfil                      |
| Killer Bird    | 140 (200)  | 36    | 12      | 26  | 80  | 31  | 120 | 80  | Valley of Corrupted Gravity |
| Loner Knight   | 720 (900)  | 204   | 54      | 99  | 140 | 81  | 140 | 60  | Mayfil                      |
| Magician Bogey | 800 (1000) | 72    | 24      | 56  | 120 | 40  | 60  | 50  | Phantom Ship                |
| Man Eating Bud | 132 (160)  | 20    | 24      | 14  | 100 | 14  | 100 | 80  | Nest of Dragon              |
| Manticore      | 960 (1200) | 216   | 60      | 90  | 150 | 102 | 160 | 50  | Divine Tree                 |
| Mr Bone        | 450 (440)  | 108   | 30 (10) | 65  | 120 | 65  | 120 | 60  | Snowfield                   |
| Orc            | 26 (30)    | 10    | 6       | 8   | 120 | 6   | 4   | 60  | Limestone Cave              |
| Roulette Face  | 3000       | 360   | 42 (14) | 80  | 120 | 105 | 200 | 60  | Moon                        |
| Sandora Elite  | 336 (420)  | 30    | 30      | 27  | 100 | 29  | 120 | 80  | Black Castle                |
| Screaming Bat  | 12 (15)    | 8     | 6       | 6   | 80  | 8   | 120 | 70  | Limestone Cave              |
| Skeleton       | 200 (250)  | 60    | 21      | 40  | 100 | 40  | 100 | 60  | Phantom Ship                |
| Specter        | 286 (333)  | 120   | 30      | 81  | 100 | 120 | 250 | 75  | Mayfil                      |
| Succubus       | 484 (550)  | 130   | 42      | 68  | 100 | 68  | 150 | 60  | Vellweb                     |
| Undead         | 616 (711)  | 203   | 39      | 90  | 100 | 81  | 60  | 70  | Mayfil                      |
| Vampire Kiwi   | 13 (20)    | 8     | 9       | 5   | 80  | 7   | 120 | 70  | Prairie                     |

### Thunder

- Not strong against any other element, but no opposing element
- Resists itself
- Weak to Non-Elemental
- **Group character** : Haschel — Violet Dragoon

#### Thunder Enemies

| Name          | HP        | EXP | Gold    | AT  | DF  | MAT | MDF | SPD | Location                    |
| ------------- | --------- | --- | ------- | --- | --- | --- | --- | --- | --------------------------- |
| Baby Dragon   | 240 (300) | 100 | 27 (9)  | 56  | 140 | 56  | 80  | 60  | Mountain of Mortal Dragon   |
| Cute Cat      | 704 (800) | 162 | 51 (17) | 80  | 140 | 102 | 180 | 70  | Divine Tree                 |
| Dragonfly     | 319 (370) | 36  | 21      | 35  | 120 | 35  | 150 | 80  | Valley of Corrupted Gravity |
| Mad Skull     | 799 (999) | 400 | 51      | 120 | 250 | 105 | 100 | 65  | Moon                        |
| Maximum Volt  | 700       | 156 | 51 (17) | 96  | 160 | 83  | 60  | 60  | Vellweb                     |
| Metal Fang    | 715 (820) | 135 | 42      | 83  | 80  | 118 | 120 | 70  | Tower of Flanvel            |
| Run Fast      | 66 (80)   | 16  | 12      | 14  | 100 | 14  | 80  | 60  | Nest of Dragon              |
| Spider Urchin | 100 (150) | 40  | 18      | 31  | 180 | 31  | 100 | 60  | Valley of Corrupted Gravity |
| Wildman       | 720 (900) | 120 | 36      | 79  | 100 | 65  | 60  | 50  | Snowfield                   |

### Water

- Strong vs Fire ; vice versa
- Resists itself
- Weak to Non-Elemental
- **Group character** : Meru — Blue Sea Dragoon

#### Water Enemies

| Name          | HP          | EXP | Gold    | AT  | DF  | MAT | MDF | SPD | Location                     |
| ------------- | ----------- | --- | ------- | --- | --- | --- | --- | --- | ---------------------------- |
| Aqua King     | 640 (800)   | 135 | 30 (10) | 76  | 120 | 73  | 160 | 70  | Aglis                        |
| Crocodile     | 33 (40)     | 17  | 6 (2)   | 12  | 160 | 11  | 50  | 50  | Marshlands                   |
| Freeze Knight | 360 (450)   | 110 | 57      | 63  | 120 | 77  | 160 | 50  | Kashua Glacier               |
| Glare         | 320 (400)   | 70  | 18      | 38  | 80  | 53  | 120 | 70  | Undersea Cavern / Queen Fury |
| Icicle Ball   | 160 (200)   | 121 | 21      | 77  | 160 | 54  | 100 | 60  | Kashua Glacier               |
| Jelly         | 640 (800)   | 120 | 24      | 51  | 80  | 89  | 250 | 70  | Aglis                        |
| Land Skater   | 341 (390)   | 88  | 33      | 58  | 100 | 63  | 120 | 60  | Kashua Glacier               |
| Mandrake      | 99 (120)    | 15  | 9       | 12  | 60  | 17  | 120 | 60  | Nest of Dragon               |
| Mermaid       | 400 (500)   | 77  | 33 (11) | 50  | 80  | 65  | 140 | 60  | Undersea Cavern / Queen Fury |
| Merman        | 48 (60)     | 15  | 12      | 11  | 100 | 13  | 80  | 60  | Marshlands                   |
| Screw Shell   | 160 (200)   | 63  | 24      | 50  | 200 | 53  | 50  | 60  | Undersea Cavern / Queen Fury |
| Scud Shark    | 400 (500)   | 150 | 39      | 73  | 130 | 73  | 100 | 60  | Aglis                        |
| Sea Piranha   | 280 (350)   | 56  | 15      | 40  | 60  | 50  | 100 | 80  | Undersea Cavern              |
| Stern Fish    | 935 (1070)  | 165 | 54      | 89  | 160 | 73  | 100 | 80  | Aglis                        |
| Trap Plant    | 1680 (2100) | 304 | 42      | 90  | 100 | 86  | 180 | 60  | Moon                         |

### Earth

- Strong vs Wind ; vice versa
- Resists itself
- Weak to Non-Elemental
- **Group character** : Kongol — Gold Dragoon

#### Earth Enemies

| Name           | HP          | EXP  | Gold    | AT  | DF  | MAT | MDF | SPD | Location                  |
| -------------- | ----------- | ---- | ------- | --- | --- | --- | --- | --- | ------------------------- |
| Arrow Shooter  | 176 (210)   | 32   | 24 (8)  | 37  | 100 | 37  | 100 | 60  | Barrens                   |
| Basilisk       | 715 (820)   | 150  | 51 (17) | 97  | 100 | 97  | 100 | 50  | Tower of Flanvel          |
| Cactus         | 320 (400)   | 126  | 36 (12) | 75  | 150 | 75  | 150 | 60  | Death Frontier            |
| Deadly Spider  | 328 (410)   | 90   | 39 (13) | 68  | 100 | 48  | 60  | 50  | Mountain of Mortal Dragon |
| Dragon Soldier | 528 (610)   | 180  | 60      | 137 | 160 | 97  | 100 | 50  | Tower of Flanvel          |
| Earth Shaker   | 200 (250)   | 48   | 15      | 31  | 140 | 31  | 60  | 50  | Barrens                   |
| Evil Spider    | 30 (50)     | 12   | 12      | 9   | 80  | 7   | 60  | 60  | Limestone Cave            |
| Flabby Troll   | 560 (700)   | 84   | 30      | 65  | 60  | 38  | 60  | 50  | Undersea Cavern           |
| Frilled Lizard | 132 (160)   | 36   | 21      | 6   | 100 | 31  | 120 | 80  | Barrens                   |
| Gangster       | 280 (350)   | 60   | 18      | 50  | 120 | 36  | 100 | 70  | Home of Gigantos          |
| Gnome          | 256 (320)   | 108  | 42      | 60  | 160 | 53  | 70  | 50  | Forbidden Land            |
| Living Statue  | 51 (64)     | 20   | 12      | 15  | 160 | 15  | 80  | 50  | Shrine of Shirley         |
| Lizard Man     | 40 (50)     | 18   | 15      | 17  | 160 | 14  | 40  | 50  | Nest of Dragon            |
| Madman         | 1040 (1300) | 165  | 24      | 97  | 100 | 83  | 80  | 60  | Tower of Flanvel          |
| Mammoth        | 1280 (1600) | 132  | 45      | 89  | 80  | 63  | 60  | 50  | Kashua Glacier            |
| Mantis         | 20 (26)     | 12   | 6       | 8   | 150 | 6   | 75  | 50  | Prairie                   |
| Minotaur       | 960 (1200)  | 180  | 48      | 103 | 160 | 73  | 100 | 50  | Aglis                     |
| Mole           | 16 (20)     | 11   | 9       | 7   | 160 | 6   | 80  | 50  | Prairie                   |
| Moss Dresser   | 300 (400)   | 72   | 18      | 61  | 120 | 50  | 80  | 50  | Evergreen Forest          |
| Mountain Ape   | 1000 (1800) | 198  | 42      | 118 | 120 | 72  | 60  | 50  | Divine Tree               |
| Myconido       | 36 (45)     | 11   | 8       | 7   | 80  | 15  | 180 | 80  | Marshlands                |
| Piggy          | 160 (200)   | 40   | 21      | 31  | 140 | 44  | 60  | 60  | Home of Gigantos          |
| Plague Rat     | 64 (80)     | 14   | 6       | 13  | 60  | 18  | 120 | 80  | Shrine of Shirley         |
| Pot Belly      | 560 (700)   | 144  | 24      | 85  | 120 | 102 | 100 | 60  | Divine Tree               |
| Puck           | 330 (380)   | 45   | 18      | 53  | 100 | 53  | 120 | 60  | Forbidden Land            |
| Rocky Turtle   | 560 (700)   | 99   | 39      | 60  | 200 | 63  | 80  | 50  | Kashua Glacier            |
| Sandworm       | 1440 (1800) | 161  | 51      | 100 | 80  | 71  | 80  | 50  | Death Frontier            |
| Scissorhands   | 80 (100)    | 40   | 18      | 37  | 200 | 26  | 50  | 60  | Barrens                   |
| Scorpion       | 280 (350)   | 154  | 21      | 86  | 220 | 61  | 100 | 60  | Death Frontier            |
| Slime          | 20 (25)     | 11   | 6       | 7   | 80  | 6   | 60  | 50  | Limestone Cave            |
| Slug           | 1200 (1500) | 180  | 33      | 100 | 100 | 90  | 100 | 60  | Divine Tree               |
| Spiky Beetle   | 480 (600)   | 130  | 42      | 86  | 160 | 71  | 120 | 60  | Death Frontier            |
| Strong Man     | 80 (100)    | 18   | 9       | 21  | 120 | 15  | 80  | 60  | Shrine of Shirley         |
| Toad Stool     | 128 (160)   | 72   | 18      | 45  | 80  | 64  | 120 | 80  | Forbidden Land            |
| Trent          | 5 (6)       | 4    | 9       | 3   | 160 | 3   | 120 | 30  | Forest                    |
| Triceratops    | 3200 (4000) | 2000 | 120     | 150 | 160 | 60  | 60  | 80  | Moon                      |
| White Ape      | 500 (600)   | 144  | 51      | 91  | 120 | 65  | 80  | 50  | Snowfield                 |
| Wounded Bear   | 560 (700)   | 96   | 60      | 70  | 140 | 50  | 40  | 60  | Evergreen Forest          |

### Non-Elemental (Unbased)

- Deals double damage against all other elements
- Does not resist itself
- Not weak to any element
- **No Unbased element weapon**
- **Magical attack items** : Psychedelic Bomb, Psychedelic Bomb X (Repeat Item variant)
- Tied with Light for **lowest number of non-boss enemies**

#### Non-Elemental Enemies

| Name          | HP        | EXP | Gold    | AT  | DF  | MAT | MDF | SPD | Location       |
| ------------- | --------- | --- | ------- | --- | --- | --- | --- | --- | -------------- |
| Bowling       | 400 (500) | 132 | 42 (14) | 79  | 160 | 56  | 80  | 60  | Snowfield      |
| Human Hunter  | 355 (444) | 136 | 24      | 110 | 160 | 81  | 100 | 70  | Mayfil         |
| Spinninghead  | 384 (480) | 99  | 30      | 45  | 80  | 64  | 160 | 60  | Forbidden Land |
| Spring Hitter | 400 (500) | 117 | 21      | 72  | 150 | 68  | 80  | 70  | Vellweb        |
| Terminator    | 432 (540) | 143 | 31      | 80  | 120 | 58  | 80  | 80  | Vellweb        |

---

## Element Dimensions

Main article : Special (Battle Command)

A particular visual effect in battles : "Element Dimensions" appear when using the "Special" Battle Command. The surroundings transform into a dimension filled with the color and visual effects of the corresponding element.

**Effects of the Special command** :

- Grants more power to the Dragoon that summoned it
- All Dragoon Magic **and** Dragoon Additions damage **doubled**
- Dragoon Additions **automatically completed**

Element Dimensions also temporarily appear when using **Level 5 Dragoon Magic** (the corresponding Dragon is summoned). However, this is **only a visual effect** for the time of the attack animation — **no damage effect**.
