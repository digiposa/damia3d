import { describe, expect, it } from "vitest";
import { resolveDrop, rollDrops } from "./drops";
import * as ENEMIES from "./enemies";
import type { EnemyDef } from "./enemies";

const defs = Object.values(ENEMIES).filter((v): v is EnemyDef => !!v && typeof v === "object" && "stats" in v && "id" in v);

describe("enemy drop tables", () => {
  it("only name items and gear that exist, at a real rate", () => {
    for (const def of defs)
      for (const d of def.drops ?? []) {
        expect(resolveDrop(d.item), `${def.id} → ${d.item}`).toBeDefined();
        expect(d.chance).toBeGreaterThan(0);
        expect(d.chance).toBeLessThanOrEqual(1);
      }
  });

  it("match the canon tables (docs: Seles, Forest, Hellena Prison)", () => {
    const table = (def: EnemyDef) => (def.drops ?? []).map((d) => `${d.item}@${d.chance}`).join(",");
    expect(table(ENEMIES.KNIGHT_OF_SANDORA_SELES)).toBe("healingPotion@1");
    expect(table(ENEMIES.COMMANDER_SELES)).toBe("burnOut@1");
    expect(table(ENEMIES.BERSERK_MOUSE)).toBe("healingPotion@0.1");
    expect(table(ENEMIES.ASSASSIN_COCK)).toBe("healingPotion@0.1");
    expect(table(ENEMIES.TRENT)).toBe("pellet@0.1");
    expect(table(ENEMIES.GOBLIN)).toBe("detonateRock@0.1");
    expect(table(ENEMIES.FRUEGEL)).toBe("knight_shield@1");
    expect(table(ENEMIES.FRUEGEL_2)).toBe("gravityGrabber@1");
    expect(table(ENEMIES.HELLENA_WARDEN)).toBe(""); // wiki: Nothing
    expect(table(ENEMIES.HELLENA_WARDEN_BOSS)).toBe("healingPotion@1");
    expect(table(ENEMIES.HELLENA_WARDEN_2)).toBe("morning_star@0.02");
    expect(table(ENEMIES.SENIOR_WARDEN_BOSS)).toBe("healingPotion@1");
  });

  it("roll each entry against its rate", () => {
    const drops = [{ item: "healingPotion", chance: 1 }, { item: "pellet", chance: 0.1 }];
    expect(rollDrops(drops, () => 0.5).map((t) => t.def.id)).toEqual(["healingPotion"]);
    expect(rollDrops(drops, () => 0.05).map((t) => t.def.id)).toEqual(["healingPotion", "pellet"]);
    expect(rollDrops(undefined)).toEqual([]);
  });
});
