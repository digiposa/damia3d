import { describe, expect, it } from "vitest";

import {
  RED_EYE,
  JADE,
  dragoonClass,
  isClassImplemented,
} from "./dragoonClasses";
import { BEARERS, DEFAULT_BEARER, bearerById, selectableBearers } from "./bearers";
import { statsForLevel, levelForExp, nextLevelExp } from "./dart";
import { LAVITZ_LEVELS } from "./lavitz";

describe("dragoon classes", () => {
  it("resolves implemented classes and reports unimplemented ones", () => {
    expect(dragoonClass("redEye")).toBe(RED_EYE);
    expect(dragoonClass("jade")).toBe(JADE);
    expect(isClassImplemented("redEye")).toBe(true);
    expect(isClassImplemented("thunder")).toBe(false);
    expect(dragoonClass("thunder")).toBeUndefined();
  });

  it("carries the canonical element and equipment user per line", () => {
    expect(RED_EYE.element).toBe("Fire");
    expect(RED_EYE.equipmentUser).toBe("Dart");
    expect(JADE.element).toBe("Wind");
    expect(JADE.equipmentUser).toBe("Lavitz");
  });
});

describe("bearers", () => {
  it("defaults to Dart", () => {
    expect(DEFAULT_BEARER.id).toBe("dart");
    expect(DEFAULT_BEARER.classId).toBe("redEye");
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
    ]);
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
