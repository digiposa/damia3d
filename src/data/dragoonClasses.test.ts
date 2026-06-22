import { describe, expect, it } from "vitest";

import {
  RED_EYE,
  JADE,
  WHITE_SILVER,
  DARKNESS,
  VIOLET,
  BLUE_SEA,
  GOLDEN,
  dragoonClass,
  isClassImplemented,
} from "./dragoonClasses";
import { BEARERS, DEFAULT_BEARER, bearerById, selectableBearers } from "./bearers";
import { statsForLevel, levelForExp, nextLevelExp } from "./dart";
import { LAVITZ_LEVELS } from "./lavitz";
import { SHANA_LEVELS } from "./shana";
import { ROSE_LEVELS } from "./rose";
import { HASCHEL_LEVELS } from "./haschel";
import { MERU_LEVELS } from "./meru";
import { KONGOL_LEVELS } from "./kongol";
import {
  ROSE_ADDITION_LIST,
  HASCHEL_ADDITION_LIST,
  MERU_ADDITION_LIST,
  KONGOL_ADDITION_LIST,
} from "./additions";

describe("dragoon classes", () => {
  it("resolves implemented classes and reports unimplemented ones", () => {
    expect(dragoonClass("redEye")).toBe(RED_EYE);
    expect(dragoonClass("jade")).toBe(JADE);
    expect(dragoonClass("whiteSilver")).toBe(WHITE_SILVER);
    expect(dragoonClass("darkness")).toBe(DARKNESS);
    expect(dragoonClass("thunder")).toBe(VIOLET);
    expect(dragoonClass("blueSea")).toBe(BLUE_SEA);
    expect(dragoonClass("golden")).toBe(GOLDEN);
    // All eight party archetypes are now implemented.
    expect(isClassImplemented("redEye")).toBe(true);
    expect(isClassImplemented("golden")).toBe(true);
  });

  it("carries the canonical element and equipment user per line", () => {
    expect(RED_EYE.element).toBe("Fire");
    expect(RED_EYE.equipmentUser).toBe("Dart");
    expect(JADE.element).toBe("Wind");
    expect(JADE.equipmentUser).toBe("Lavitz");
    expect(WHITE_SILVER.element).toBe("Light");
    expect(WHITE_SILVER.equipmentUser).toBe("Shana");
    expect(DARKNESS.element).toBe("Darkness");
    expect(DARKNESS.equipmentUser).toBe("Rose");
    expect(DARKNESS.additions).toBe(ROSE_ADDITION_LIST);
    expect(VIOLET.element).toBe("Thunder");
    expect(VIOLET.equipmentUser).toBe("Haschel");
    expect(VIOLET.additions).toBe(HASCHEL_ADDITION_LIST);
    expect(BLUE_SEA.element).toBe("Water");
    expect(BLUE_SEA.equipmentUser).toBe("Meru");
    expect(BLUE_SEA.additions).toBe(MERU_ADDITION_LIST);
    expect(GOLDEN.element).toBe("Earth");
    expect(GOLDEN.equipmentUser).toBe("Kongol");
    expect(GOLDEN.additions).toBe(KONGOL_ADDITION_LIST);
  });

  it("models the White-Silver line as Additionless (Shana / Miranda)", () => {
    expect(WHITE_SILVER.additions).toEqual([]);
  });
});

describe("bearers", () => {
  it("defaults to Dart", () => {
    expect(DEFAULT_BEARER.id).toBe("dart");
    expect(DEFAULT_BEARER.classId).toBe("redEye");
  });

  it("gives every bearer a distinct placeholder colour", () => {
    const keys = BEARERS.map((b) => b.color.join(","));
    expect(new Set(keys).size).toBe(BEARERS.length);
  });

  it("looks bearers up by id", () => {
    expect(bearerById("lavitz")?.classId).toBe("jade");
    expect(bearerById("nobody")).toBeUndefined();
  });

  it("exposes reskins (non-story bearers) of implemented classes as selectable", () => {
    const ids = selectableBearers().map((b) => b.id);
    expect(ids).toContain("dart");
    expect(ids).toContain("zieg"); // Red-Eye reskin
    expect(ids).toContain("albert"); // Jade story
    expect(ids).toContain("greham"); // Jade reskin
    // Every selectable bearer's class is implemented.
    for (const b of selectableBearers()) expect(isClassImplemented(b.classId)).toBe(true);
  });

  it("reskins share their class's mechanics with the base bearer", () => {
    const lavitz = bearerById("lavitz")!;
    const albert = bearerById("albert")!;
    expect(lavitz.classId).toBe(albert.classId);
    expect(dragoonClass(lavitz.classId)).toBe(dragoonClass(albert.classId));
  });

  it("lists exactly the configured bearers", () => {
    expect(BEARERS.map((b) => b.id)).toEqual([
      "dart",
      "zieg",
      "lavitz",
      "albert",
      "greham",
      "syuveil",
      "shana",
      "miranda",
      "rose",
      "haschel",
      "meru",
      "kongol",
    ]);
  });

  it("treats Shana and Miranda as White-Silver bearers", () => {
    const shana = bearerById("shana")!;
    const miranda = bearerById("miranda")!;
    expect(shana.classId).toBe("whiteSilver");
    expect(miranda.classId).toBe("whiteSilver");
    expect(dragoonClass(shana.classId)).toBe(dragoonClass(miranda.classId));
    // Both are selectable now that the class is implemented.
    const ids = selectableBearers().map((b) => b.id);
    expect(ids).toContain("shana");
    expect(ids).toContain("miranda");
  });
});

describe("generic leveling over the Jade table", () => {
  it("reads stats by level (clamped)", () => {
    expect(statsForLevel(LAVITZ_LEVELS, 1).maxHp).toBe(35);
    expect(statsForLevel(LAVITZ_LEVELS, 60).maxHp).toBe(8250);
    expect(statsForLevel(LAVITZ_LEVELS, 999).level).toBe(60);
  });

  it("maps cumulative EXP to a level", () => {
    expect(levelForExp(LAVITZ_LEVELS, 0)).toBe(1);
    expect(levelForExp(LAVITZ_LEVELS, 34)).toBe(1);
    expect(levelForExp(LAVITZ_LEVELS, 35)).toBe(2);
    expect(levelForExp(LAVITZ_LEVELS, 1_000_000)).toBe(60);
  });

  it("reports the next level's EXP requirement", () => {
    expect(nextLevelExp(LAVITZ_LEVELS, 1)).toBe(35);
    expect(nextLevelExp(LAVITZ_LEVELS, 59)).toBe(387730);
    expect(nextLevelExp(LAVITZ_LEVELS, 60)).toBe(387730);
  });
});

describe("growth tables", () => {
  for (const [name, table] of [
    ["Jade (Lavitz)", LAVITZ_LEVELS],
    ["White-Silver (Shana)", SHANA_LEVELS],
    ["Darkness (Rose)", ROSE_LEVELS],
    ["Violet (Haschel)", HASCHEL_LEVELS],
    ["Blue-Sea (Meru)", MERU_LEVELS],
    ["Golden (Kongol)", KONGOL_LEVELS],
  ] as const) {
    describe(name, () => {
      it("covers levels 1-60 in order", () => {
        expect(table).toHaveLength(60);
        expect(table.map((r) => r.level)).toEqual(
          Array.from({ length: 60 }, (_, i) => i + 1),
        );
      });

      it("has non-decreasing cumulative EXP and Max HP", () => {
        for (let i = 1; i < table.length; i++) {
          expect(table[i].exp).toBeGreaterThanOrEqual(table[i - 1].exp);
          expect(table[i].maxHp).toBeGreaterThanOrEqual(table[i - 1].maxHp);
        }
      });
    });
  }

  it("White-Silver is a magic archetype: MAT outgrows AT", () => {
    const lv60 = statsForLevel(SHANA_LEVELS, 60);
    expect(lv60.mat).toBeGreaterThan(lv60.at);
    expect(lv60.maxHp).toBe(6000);
  });

  it("Golden is the tank: highest HP, AT >> MAT", () => {
    const lv60 = statsForLevel(KONGOL_LEVELS, 60);
    expect(lv60.maxHp).toBe(9750);
    expect(lv60.at).toBeGreaterThan(lv60.mat);
    // Beefiest party member at max level.
    for (const table of [LAVITZ_LEVELS, SHANA_LEVELS, ROSE_LEVELS, HASCHEL_LEVELS, MERU_LEVELS]) {
      expect(lv60.maxHp).toBeGreaterThan(statsForLevel(table, 60).maxHp);
    }
  });
});
