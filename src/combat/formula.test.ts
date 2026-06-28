import { describe, it, expect } from "vitest";

import {
  lodRound,
  physicalAttack,
  additionAttack,
  dragoonAttack,
  DRAGOON_OUTPUT,
  magicAttack,
  enemyPhysicalAttack,
  enemyMagicalAttack,
  hauntingBolt,
  rareMonsterBasic,
  additionCounter,
  poisonDamage,
} from "./formula";
import {
  DART_ADDITIONS,
  additionHitsPercent,
  additionMultiplier,
} from "../data/additions";

describe("lodRound", () => {
  it("matches the documented worked example (28050 / 100 = 281)", () => {
    expect(lodRound(28050, 100)).toBe(281);
  });

  it("rounds at the half boundary", () => {
    // (60 + 20) / 40 = 2
    expect(lodRound(60, 40)).toBe(2);
  });
});

describe("physicalAttack (Archer)", () => {
  it("Dart Lv1 (AT 2) vs Knight of Sandora DF 40 → 2", () => {
    expect(physicalAttack({ at: 2, lv: 1 }, 40)).toBe(2);
  });

  it("applies Target Fear (×2) with truncation", () => {
    expect(physicalAttack({ at: 2, lv: 1 }, 40, { targetFear: 2 })).toBe(4);
  });
});

describe("additionAttack", () => {
  it("perfect max-level Double Slash inner % equals the DAM% (202)", () => {
    const ds = DART_ADDITIONS.doubleSlash;
    const hits = additionHitsPercent(ds); // 150 (perfect)
    const mult = additionMultiplier(ds, 5); // 135
    expect(Math.floor((hits * mult) / 100)).toBe(202);
  });

  it("computes full damage with the documented nesting", () => {
    const ds = DART_ADDITIONS.doubleSlash;
    const dmg = additionAttack(
      { at: 100, lv: 10 },
      100,
      additionHitsPercent(ds),
      additionMultiplier(ds, 5),
    );
    // inner=202, scaled=202, base=round(202*75/100)=152
    expect(dmg).toBe(152);
  });
});

describe("dragoonAttack (D'Attack)", () => {
  it("output table matches canon inputs→output (1→100 … 5→200)", () => {
    expect(DRAGOON_OUTPUT).toEqual([100, 110, 130, 160, 200]);
  });

  it("non-archer: 5-input D'Attack at DRGNAT% 170", () => {
    // a=floor(200*170/100)=340, scaled=floor(340*100/100)=340,
    // base=round(340*15*5,100)=round(25500,100)=255
    expect(dragoonAttack({ at: 100, lv: 10 }, 100, 200, 170)).toBe(255);
  });

  it("archer: ignores Output, uses AT·DRGNAT% directly", () => {
    // scaled=floor(100*200/100)=200, base=round(200*75,100)=150
    expect(dragoonAttack({ at: 100, lv: 10 }, 100, 999, 200, {}, true)).toBe(150);
  });

  it("applies the Element modifier with truncation", () => {
    // 255 × 1.5 (opposite element) → floor(382.5) = 382
    expect(dragoonAttack({ at: 100, lv: 10 }, 100, 200, 170, { element: 1.5 })).toBe(382);
  });
});

describe("magicAttack (Dragoon Magic)", () => {
  it("applies DRGNMAT%, MDF division and the spell multiplier with truncation", () => {
    // a=floor(100*150/100)=150, b=floor(150*15*5/100)=floor(112.5)=112,
    // c=floor(112*200/100)=224
    expect(magicAttack(100, 100, 150, 200, 10)).toBe(224);
  });

  it("scales with the spell multiplier and applies Element", () => {
    // multiplier 100 → c=floor(112*100/100)=112; ×1.5 element → 168
    expect(magicAttack(100, 100, 150, 100, 10, { element: 1.5 })).toBe(168);
  });
});

describe("enemyPhysicalAttack", () => {
  it("Knight (AT 2) Sword Slash (1×) vs Dart DF 4 → 5", () => {
    expect(enemyPhysicalAttack(2, 4, 1)).toBe(5);
  });

  it("Throw Dagger (0.5×) truncates 2.5 → 2", () => {
    expect(enemyPhysicalAttack(2, 4, 0.5)).toBe(2);
  });
});

describe("enemyMagicalAttack", () => {
  it("MAT 2 vs MDF 4, Burn Out 1.5× → 7 (floor 7.5)", () => {
    expect(enemyMagicalAttack(2, 4, 1.5)).toBe(7);
  });
});

describe("percentage & status formulas", () => {
  it("Haunting Bolt halves current HP", () => {
    expect(hauntingBolt(101)).toBe(50);
  });

  it("Rare Monster basic = floor(MaxHP / 10)", () => {
    expect(rareMonsterBasic(305)).toBe(30);
  });

  it("Poison = floor(MaxHP / 10)", () => {
    expect(poisonDamage(305)).toBe(30);
  });

  it("Addition Counter: AT 50 vs DF 100 → 6", () => {
    // floor(floor(50^2 * 250 / 100) / 100) = floor(floor(625000/100)/100)
    // = floor(6250/100) = floor(62.5) = 62 ... then no mods
    expect(additionCounter(50, 100)).toBe(62);
  });
});

describe("addition data integrity", () => {
  it("each Dart Addition's hits sum to its Perfect total", () => {
    const perfect: Record<keyof typeof DART_ADDITIONS, number> = {
      doubleSlash: 150,
      volcano: 200,
      burningRush: 150,
      crushDance: 150,
      madnessHero: 100,
      moonStrike: 200,
      blazingDynamo: 250,
    };
    for (const key of Object.keys(perfect) as (keyof typeof DART_ADDITIONS)[]) {
      expect(additionHitsPercent(DART_ADDITIONS[key])).toBe(perfect[key]);
    }
  });
});
