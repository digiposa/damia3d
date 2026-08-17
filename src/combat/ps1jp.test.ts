import { describe, it, expect } from "vitest";

import {
  physicalAttack,
  additionAttack,
  enemyPhysicalAttack,
  enemyMagicalAttack,
} from "./formula";
import { elementMultiplier } from "./element";
import { TRENT, KNIGHT_OF_SANDORA_SELES, COMMANDER_SELES } from "../data/enemies";

/**
 * Damage measured on the **Japanese PS1 release**, and what our formulas must reproduce.
 *
 * Both community wikis document the US/PAL build; this project takes JP stats wherever they exist.
 * These cases exist so a future "correction" toward a wiki value fails loudly here instead of
 * silently un-matching the real game.
 *
 * Method: Dart, starting equipment, stats read off the in-game status screen (Total column — body
 * plus gear). Each case notes the state Dart was in.
 */

/** Dart LV1, starting equipment: AT 4 · DF 6 · MAT 6 · MDF 6 (status screen, Total). */
const DART_LV1 = { at: 4, df: 6, mat: 6, mdf: 6, lv: 1 };
/** Dart LV3, same equipment: AT 8 · DF 9 · MAT 10 · MDF 9. */
const DART_LV3 = { mdf: 9 };

/** Dart is Fire, so a Fire attack on him is same-element. */
const FIRE_ON_DART = elementMultiplier("Fire", "Fire");

describe("PS1 JP — damage Dart deals", () => {
  it("normal attack at LV1 deals 3", () => {
    expect(physicalAttack({ at: DART_LV1.at, lv: DART_LV1.lv }, 40)).toBe(3);
  });

  it("a complete Double Slash at LV1 deals 5", () => {
    // Double Slash: hits 100% + 50% = 150%, Addition multiplier 100 at level 1.
    expect(additionAttack({ at: DART_LV1.at, lv: DART_LV1.lv }, 40, 150, 100)).toBe(5);
  });
});

describe("PS1 JP — damage Dart takes", () => {
  it("a Knight of Sandora's Throw Dagger deals 1 at LV1", () => {
    const dagger = KNIGHT_OF_SANDORA_SELES.attacks.find((a) => /throw/i.test(a.name))!;
    expect(enemyPhysicalAttack(KNIGHT_OF_SANDORA_SELES.stats.at, DART_LV1.df, dagger.multiplier)).toBe(1);
  });

  it("Trent's Pellet deals 5 at LV3 — MAT 3, multiplier 1", () => {
    // Earth on a Fire target is neither same nor opposite, so no element modifier is in play: this
    // pins MAT and multiplier on their own. The wikis' US ×1.5 cannot produce 5 at all — a ×1.5
    // enemy spell can only ever land on 1, 3, 4, 6, 7, 9, 10, 12…
    const pellet = TRENT.attacks.find((a) => a.name === "Pellet")!;
    expect(pellet.multiplier).toBe(1);
    expect(TRENT.stats.mat).toBe(3);
    expect(enemyMagicalAttack(TRENT.stats.mat, DART_LV3.mdf, pellet.multiplier, { element: 1 })).toBe(5);
  });

  it("a Hellena Warden's Spark Net deals 8 at LV3 — MAT 4, multiplier 1", () => {
    // Not implemented as an enemy yet; recorded here so the measurement survives until it is.
    // Thunder has no opposing element, so this is another modifier-free reading.
    expect(enemyMagicalAttack(4, DART_LV3.mdf, 1, { element: 1 })).toBe(8);
  });

  it("guarding halves what lands (Pellet 5 → 2)", () => {
    expect(enemyMagicalAttack(TRENT.stats.mat, DART_LV3.mdf, 1, { element: 1, guard: 0.5 })).toBe(2);
  });
});

describe("PS1 JP — the Commander's Burn Out, still unexplained", () => {
  it.todo("deals 4 before Power Up and 6 after, on Dart LV1 (MDF 6) — we produce 7 and 9");

  it("keeps our current numbers visible so the gap is not forgotten", () => {
    // Deliberately asserts what we DO produce, not what the game does: no combination of the
    // documented formula and integer stats reproduces both 4 and 6. Whoever picks this up should
    // measure the same spell against a second MDF — two points on one curve beats one point each
    // on several enemies. See docs/canon/ps1-jp-measurements.md.
    const burnOut = COMMANDER_SELES.attacks.find((a) => a.name === "Burn Out")!;
    const pre = enemyMagicalAttack(COMMANDER_SELES.stats.mat, DART_LV1.mdf, burnOut.multiplier, {
      element: FIRE_ON_DART,
    });
    expect(pre).toBe(7); // PS1 JP measured: 4
  });
});
