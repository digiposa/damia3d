import type { Vector3 } from "@babylonjs/core/Maths/math.vector";

/**
 * Map kit — solid circles (trunks, rocks, props) that fighters slide round, with a spatial hash
 * so the per-frame push-out only looks at the few nearby. Add while dressing the set, then
 * {@link index} once.
 */
export class Obstacles {
  readonly list: { x: number; z: number; r: number }[] = [];
  private readonly grid = new Map<string, { x: number; z: number; r: number }[]>();
  private static readonly CELL = 4;

  add(x: number, z: number, r: number): void {
    this.list.push({ x, z, r });
  }

  /** Build the spatial hash (call once the set is dressed). */
  index(): void {
    this.grid.clear();
    for (const o of this.list) {
      const key = `${Math.floor(o.x / Obstacles.CELL)},${Math.floor(o.z / Obstacles.CELL)}`;
      let list = this.grid.get(key);
      if (!list) this.grid.set(key, (list = []));
      list.push(o);
    }
  }

  /** Push a ground position out of any obstacle it overlaps (mutates `p`). */
  pushOut(p: Vector3, margin: number): void {
    const cx = Math.floor(p.x / Obstacles.CELL);
    const cz = Math.floor(p.z / Obstacles.CELL);
    for (let ix = cx - 1; ix <= cx + 1; ix++)
      for (let iz = cz - 1; iz <= cz + 1; iz++) {
        const list = this.grid.get(`${ix},${iz}`);
        if (!list) continue;
        for (const o of list) {
          const dx = p.x - o.x;
          const dz = p.z - o.z;
          const d = Math.hypot(dx, dz);
          const rr = o.r + margin * 0.5;
          if (d < rr && d > 1e-4) {
            p.x = o.x + (dx / d) * rr;
            p.z = o.z + (dz / d) * rr;
          }
        }
      }
  }
}
