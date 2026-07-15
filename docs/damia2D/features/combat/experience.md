# Experience / Leveling — système EXP canon

> **Système de progression canon TLoD** : EXP awarded en battle, level up auto au seuil, cap level 60.
>
> **Sources** :
>
> - 🥈 [`_sources/lod-wiki-experience.md`](./_sources/lod-wiki-experience.md) — wiki LoD (EXP distribution active/inactive/survivors + tables thresholds canon par character × 60 levels + level cap + speed runner trivia)
> - 🥉 [`_sources/fandom-experience.md`](./_sources/fandom-experience.md) — fandom (Additions level-gated canon + recruitment levels canon par character + DLV SP thresholds canon Table Dragoon Level 2-5 + divergences typos)

## Statut

🟡 **Draft post-ingestion wiki LoD + fandom** — Discord cadors restant à consulter pour formules stats gain par level (HP/AT/DF/MAT/MDF growth rates).

## 1. Système canon haut niveau

### Cap & growth canon

- **Level cap = 60** canon (post-60, no level up)
- **Stats permanents at level up** : Max HP + AT + DF + MAT + MDF + nouveau threshold
- **EXP threshold per-character canon** ⚠️ chaque membre a sa propre courbe XP
- **Level 1 base** : N/A (level de départ par character varie selon recrutement timeline)

### EXP distribution canon

Pattern canon **3 catégories** :

1. **Active survivor** (alive + not Petrified) → reçoit `floor(totalEXP / surviving_active_count)` chacun
2. **Active fallen** (0 HP ou Petrified end of encounter) → reçoit **0 EXP**
3. **Inactive (off-roster)** → reçoit `floor(active_survivor_EXP / 2)` chacun

Remainder integer division = **lost** (e.g. 100 EXP / 3 survivors = 33 + 33 + 33 + 1 lost).

### Pattern exploit canon : "fewer survivors = more EXP total"

Avec single survivor + N inactive, le party reçoit collectivement **plus d'EXP** que tous actifs survivants :

| Survivors / Inactive | 1 inactive | 2 inactive | 3 inactive | 4 inactive |
| -------------------- | ---------- | ---------- | ---------- | ---------- |
| **1 survivor**       | 1.5×       | 2×         | 2.5×       | 3×         |
| **2 survivors**      | 1.25×      | 1.5×       | 1.75×      | 2×         |
| **3 survivors**      | ~1.16×     | ~1.33×     | 1.5×       | ~1.66×     |

→ **Speed runner exploit canon** : sacrifier 2 actifs pour funnel toute l'EXP vers 1 (typiquement Shana/Miranda pour Dragoon level grinding) → over-leveling early game.

## 2. Level thresholds — pattern canon par character

Order croissant difficulté (EXP requis at L60) :

| Character         | EXP L60 | Position         | Pattern canon                                          |
| ----------------- | ------- | ---------------- | ------------------------------------------------------ |
| **Dart**          | 382,000 | 🟢 easiest       | Protagonist baseline                                   |
| **Haschel**       | 385,820 | 🟢🟢 easy        | Martial artist canon                                   |
| **Meru**          | 386,584 | 🟡 medium-easy   | Wingly hybrid                                          |
| **Lavitz/Albert** | 387,730 | 🟡 medium        | Knight noble                                           |
| **Kongol**        | 388,494 | 🟡🟡 medium-hard | Last Giganto                                           |
| **Shana/Miranda** | 389,640 | 🟠 hard          | Healer Dragoon White-Silver                            |
| **Rose**          | 390,786 | 🔴 hardest       | 11k ans Dragoon Black Monster — penalty XP curve canon |

⚠️ **Rose = penalty XP** la plus dure → cohérent character lore "11,000 ans de combat, expérience massive déjà accumulée" (in-fiction justification de l'over-investment requis).

### Pattern thresholds en early game (L2-L10)

- **L2 thresholds canon** : Dart/Rose/Haschel/Meru/Kongol = **20 EXP** (baseline) | Shana/Miranda = **30 EXP** | Lavitz/Albert = **35 EXP** (max)
- **L10 thresholds canon** : Dart = 1,600 / Rose = 1,636 (diff = +36 EXP only at L10)

→ **Divergence character thresholds croît avec level** : à L60, Rose +8,786 EXP de plus que Dart (~2.3% extra). Early game = quasi-équivalent.

### Quasi-symétrie L2-L4 canon

- L4 : Dart 102 / Lavitz/Albert 110 / Shana/Miranda 100 / Rose 104 / Haschel 103 / Meru 103 / Kongol 104
- Variance early ≈ 10 EXP only → **flat early progression** canon

### Cross-check fandom (compléments + divergences)

**Confirmations utiles** :

- ⭐ **MAJEUR : EXP level = ONLY requirement for new Additions** canon — "Experience levels are the only requirement for characters to receive new Additions, except for their Master Level addition." → Pattern canon Additions = level-gated unlocks per-character. À cross-référer `combat/additions.md` (chaque Addition débloquée par level threshold spécifique).
- **Master Level addition exception** : different requirement (probable Addition use counter / mastery). À investiguer.
- **Unique Monsters give EXP under specific conditions** confirmé fandom ("certain unique monsters")

### Recruitment levels canon (fandom NEW info via "-" dashes table)

| Character         | First level  | Disc / Story context                       |
| ----------------- | ------------ | ------------------------------------------ |
| **Dart**          | L2 (initial) | Hometown Seles intro Disc 1                |
| **Lavitz/Albert** | L4           | Hellena Prison Disc 1                      |
| **Shana/Miranda** | L5           | Post-Hellena Disc 1                        |
| **Rose**          | L9           | Marshland Disc 1                           |
| **Haschel**       | L14          | Lohan Disc 1                               |
| **Meru**          | L18          | Donau Disc 2                               |
| **Kongol**        | L20          | Black Castle Kazas Disc 1 (rejoint Disc 2) |

→ Pattern canon : ordering matches story timeline party power curve. **Adopter ces levels comme baseline recruitment Damia**.

### Dragoon Level (DLV) — SP thresholds canon ⭐ MAJEUR fandom-only

| DLV | SP Requirement            | Characters                                         |
| --- | ------------------------- | -------------------------------------------------- |
| 2   | **1000 SP**               | Haschel / Lavitz / Albert / Shana / Miranda / Meru |
| 2   | **1200 SP** (penalty)     | **Dart and Rose** (Fire/Dark Dragoons)             |
| 2   | **2000 SP** (max penalty) | **Kongol** (Golden/Giganto Dragoon)                |
| 3   | **6000 SP** all           |
| 4   | **12000 SP** all          |
| 5   | **20000 SP** all          |

⚠️ **Divergence DLV 2 par character canon** :

- 6 characters baseline = 1,000 SP
- Dart + Rose penalty = 1,200 SP (+20%)
- Kongol max penalty = 2,000 SP (+100%)

DLV 3-5 = uniform pour tous les Dragoons. Pattern canon : "DLV 2 = hardest divergence balance, DLV 3+ = équitable".

À cross-référer [`dragoons/mechanics.md`](../dragoons/mechanics.md) §SP/DLV (potentially déjà documenté via Discord DLV thresholds canon).

### Divergences thresholds wiki vs fandom (probable typos)

| Level / Character | Wiki LoD | Fandom  | Diff    | Notes                         |
| ----------------- | -------- | ------- | ------- | ----------------------------- |
| **L19 Dart**      | 10,974   | 10,947  | 27 EXP  | Typo probable une des sources |
| **L33 Rose**      | 58,821   | 58,321  | 500 EXP | Typo probable                 |
| **L51 Dart**      | 215,302  | 215,303 | 1 EXP   | Probable typo arrondi         |
| **L52 Meru**      | 233,990  | 233,490 | 500 EXP | Typo probable                 |

→ **Wiki tier 2 prévaut probable** (cohérent monotonie courbe + cross-référence Prima Strategy Guide / CCajes Character FAQ). Adopter valeurs wiki canon.

## 3. Vision Damia (implémentation)

### Décisions canon à conserver

1. **Level cap 60** : préserver pour authenticité TLoD (post-60 = soft cap, plus de stats gain)
2. **Per-character XP thresholds** : conserver les 7 courbes distinctes
3. **EXP distribution survivors-only** : tomber = 0 EXP gagné (incentive à survivre)
4. **Petrification = no EXP** : status condition spécifique pénalise XP gain
5. **Inactive 50% rounded down** : pattern canon préservant relevance party rotation
6. **Speed runner exploit** : conserver tel quel (player choice trade-off survive-vs-grind)

### Implémentation tech

- Data-model `LevelThresholds`:
  ```ts
  type Character = 'Dart'|'Lavitz'|'Albert'|'Shana'|'Miranda'|'Rose'|'Haschel'|'Meru'|'Kongol';
  const THRESHOLDS: Record<Character, number[]> = {
    Dart: [0, 20, 43, 102, ..., 382_000],  // L1..L60
    // ...
  };
  ```
- Fonction `awardExp(survivors: ActiveMember[], fallen: ActiveMember[], inactive: PartyMember[], totalExp: number)` qui :
  1. Active survivors split `floor(totalExp / survivors.length)` chacun
  2. Inactive get `floor(activeShare / 2)` chacun
  3. Fallen get 0
  4. Track `lostExp = totalExp - sum_distributed` pour analytics

### Questions ouvertes pour décision

- **Stats growth per level** : formule canon HP/AT/DF/MAT/MDF growth rates ? Pas dans wiki tier 2 — à investiguer Discord cadors / fandom complement
- **EXP gain en Dragoon form** : interaction with regen accessories disabled in Dragoon form ? À cross-référer
- **Survival Mode adapt** : système XP per-run vs persistent ? Cf. [SCOPE §7.2](../../SCOPE.md#72-mode-survival--fun-first)

## 4. Liens transverses

- [`damage-formula.md`](./damage-formula.md) — AT/DF/MAT/MDF stats issu de level up
- [`additions.md`](./additions.md) — Additions level-up = mecca XP-like distinct (Wargod Calling ne le compte pas)
- [`elements.md`](./elements.md) — Petrification status (annule XP gain)
- [`../dragoons/mechanics.md`](../dragoons/mechanics.md) — Dragoon Level (DLV) = système distinct via SP, pas EXP
- [`../party-members/`](../party-members/) — per-character growth curves référencées

## 5. Gaps / TODO

Voir [`docs/TODO.md`](../../TODO.md) section Experience / Leveling.
