# Carlo — King of Unified Serdio (lore pré-game)

> **NPC lore pré-game** : **King Carlo of Serdio** = **last king of unified Serdio** before Serdian Civil War. **Father of Albert** (crowned age 6 post-Carlo death) + **brother of Emperor Doel** (assassin). **Murdered by Doel 20 years pre-game** → Serdio split Kingdom Basil (Albert north) + Imperial Sandora (Doel south) + Civil War 2 decades canon.
>
> ⭐ **Reveal canon tragique Disc 4 Moon trials** : Carlo lui-même trustful of Doel + self-doubts king stature + considered Doel most likely throne successor → conflit familial = **misunderstanding tragique** : Doel a tué frère qui aurait été allié canon.
>
> **Sources** :
>
> - 🥈 [`_sources/lod-wiki-carlo.md`](./_sources/lod-wiki-carlo.md) — wiki LoD (last king unified Serdio + Albert father + Doel brother + murdered + Civil War 2 decades)
> - 🥉 [`_sources/fandom-carlo.md`](./_sources/fandom-carlo.md) — fandom (Doel/Albert quotes canon + ⭐ Carlo trustful of Doel + self-doubts king stature + Doel succession expected canon — reveal tragique Disc 4)

## Statut

🟢 **Canon documenté wiki + fandom** — NPC lore pré-game intégré.

## Identity canon

- **Nom** : King Carlo of Serdio
- **Titre** : King of unified Serdio (pre-Civil War)
- **Famille** :
  - **Brother** : (then-Prince) **Doel** → Emperor Doel post-secession
  - **Son** : **Albert** (heir, age 6 lors couronnement post-Carlo death)
  - Épouse : (non-documentée canon — Albert's mother à investiguer)
- **Status canon** : **Mort** (murdered by brother Doel ~20 years pre-game)
- **Pattern symbolique** : ⭐ **"Tragic Carlo" canon** — incompetent king OR loved king, double-perspective tragic family conflict canon

## Timeline canon

| Période                  | Événement canon                                                               |
| ------------------------ | ----------------------------------------------------------------------------- |
| Pre-game ~20 years       | Carlo = King unified Serdio                                                   |
| ⚠️ 20 years pre-game     | **Then-Prince Doel murders brother Carlo** → coup attempt                     |
| 20 years pre-game        | **Albert (age 6) crowned King Bale-Basil** (north Serdio)                     |
| 20 years pre-game        | **Doel secedes south** → founds Imperial Sandora (Kazas capital)              |
| 20 years pre-game → game | **Serdian Civil War 2 decades canon** (Bale-Basil vs Imperial Sandora)        |
| Disc 1 game start        | Imperial Sandora invades → game events                                        |
| Disc 4 Moon trials       | Albert duel Doel → reveal canon tragic Carlo (trustful of Doel + self-doubts) |

## Two views canon ⭐ MAJEUR

### Doel's view canon : Incompetent leader

Doel justified murder canon :

> "save Serdio from an incompetent leader named Carlo"

Reasons Doel cited canon :

- **Overtaxation** (Carlo's rule)
- **Disorder** (Carlo's reign)
- **Corrupt ministers** (under Carlo)

→ Doel = political pragmatist canon, perceived Carlo as weak ruler

### Albert's view canon : Good king loved by people

Albert reply canon :

- King **loved by his people**
- King **loved by his vassals**

→ Albert = filial pious view + popular consensus canon

### Reveal tragique Disc 4 ⭐ NEW MAJEUR

Albert reveals Disc 4 Moon trials during duel Doel :

- ⭐ **Carlo trustful of Doel** — deep respect canon
- ⭐ **Carlo self-doubts king stature** — "didn't quite have the stature to be King"
- ⭐ **"Without Doel, he couldn't do anything"** — Carlo dependence on Doel canon
- ⭐ **Carlo expected Doel succession** — "said that it is you who was most likely to take the throne"
- ⭐ **Carlo trusted Doel** canon

Quote canon Albert (Moon that Never Sets duel) :

> "I'm different from you and I am not alone. My friends have always been at my side during the many occasions when I was dispirited. I've overcome difficulties. When I was young, **my father would often say that he didn't quite have the stature to be King. Without Doel, he couldn't do anything**. He also said that **it is you who was most likely to take the throne**. My father trusted in you. **If you had gotten together and governed the country, this tragedy would never have happened**."

⚠️ **Conclusion canon tragique** :

- **Conflit familial = misunderstanding tragique** : Doel a tué frère qui aurait été allié
- **Carlo would have stepped aside willingly** for Doel canon
- Pattern "miscommunication family tragic" canon
- Doel = killed wrong person → tragic irony canon
- If brothers had cooperated → Civil War never happened (Albert's view)

## Impact canon TLoD

- **Trigger Serdian Civil War** 2 decades (Bale-Basil vs Sandora)
- **Albert crowned age 6** → became "young king" canon
- **Doel founded Imperial Sandora** → setup Disc 1 antagonist canon
- **Albert's character motivation** : reconcile family + restore unified Serdio canon
- **Doel's tragic motivation Disc 4** : reveal canon "killed wrong brother" → guilt canon (cohérent existing `bosses/Emperor Doel.md` Dark Doel guilt Disc 4)

## Vision Damia (implémentation)

### Décisions canon à conserver

1. **Carlo = NPC lore pré-game** (no living character in game timeline)
2. **Tragic family triangle canon** : Carlo / Doel / Albert
3. **Reveal Disc 4 Moon trials canon** : Albert duel Doel → Carlo's trustful Doel quote
4. **Background lore Serdio** : unified → split kingdom 2 decades civil war
5. **No need character data-model** : NPC lore-only (referenced cutscenes/dialogues)

### Implementation tech

- Data-model `LoreNPC` minimal :
  ```ts
  type LoreNPC = {
    name: string;
    titles: string[];
    family: { brother?: NPCRef; son?: PartyMemberRef; spouse?: NPCRef };
    status: 'alive' | 'dead';
    deathEvent?: { killer: NPCRef; yearsPreGame: number };
  };
  // Carlo : { name: 'Carlo', titles: ['King of Unified Serdio'], family: { brother: 'Doel', son: 'Albert' }, status: 'dead', deathEvent: { killer: 'Doel', yearsPreGame: 20 } }
  ```

### Questions ouvertes

- **Carlo's wife / Albert's mother canon** : Documented anywhere ? À investiguer.
- **Carlo's reign duration canon** : Combien de temps roi avant assassinat ? À investiguer.
- **Carlo's age canon** : Documented ? À investiguer.
- **Pattern "Doel's response" Disc 4 boss fight** : Carlo's name uttered = trigger lore mécanique narrative ?

## Liens transverses

- [`README.md`](./README.md) (à créer) — NPCs canon roster
- [`../bosses/Emperor Doel.md`](../bosses/Emperor Doel.md) — Carlo's brother + assassin (existing doc references Carlo)
- [`../party-members/Albert.md`](../party-members/Albert.md) (à créer) — Carlo's son
- [`../locations/Kazas.md`](../locations/Kazas.md) — capital Imperial Sandora (Doel's faction post-secession)
- [`../locations/Bale.md`](../locations/Bale.md) (à créer) — capital Kingdom of Basil (Albert's faction post-secession)
- [`../lore/serdia.md`](../lore/serdia.md) (à créer) — full Serdio lore + Civil War 2 decades canon
- [`../lore/serdian-civil-war.md`](../lore/serdian-civil-war.md) (à créer) — 20 years war canon detailed

## Gaps / TODO

Voir [TODO.md](../../TODO.md) section Carlo + lore Serdia.
