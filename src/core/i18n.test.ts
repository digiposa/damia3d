import { describe, it, expect, afterEach } from "vitest";

import { t, getLocale, setLocale } from "./i18n";

afterEach(() => setLocale("en"));

describe("i18n", () => {
  it("returns English by default", () => {
    expect(getLocale()).toBe("en");
    expect(t("common.resume")).toBe("Resume");
  });

  it("switches to French", () => {
    setLocale("fr");
    expect(t("common.resume")).toBe("Reprendre");
    expect(t("section.equip")).toBe("Équipement");
  });

  it("interpolates parameters", () => {
    expect(t("log.defeated", { name: "Knight", exp: 2, gold: 3 })).toBe(
      "Knight defeated · +2 EXP · +3 G",
    );
  });

  it("falls back to the key when missing", () => {
    expect(t("does.not.exist")).toBe("does.not.exist");
  });
});
