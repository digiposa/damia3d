import type { Vector3 } from "@babylonjs/core/Maths/math.vector";

/**
 * Map kit — solid circles (trunks, rocks, props) and boxes (walls, houses) that fighters slide
 * round, with a spatial hash so the per-frame push-out only looks at the few nearby circles. Add
 * while dressing the set, then {@link index} once.
 */
export class Obstacles {
  readonly list: { x: number; z: number; r: number }[] = [];
  private readonly grid = new Map<string, { x: number; z: number; r: number }[]>();
  private static readonly CELL = 4;

  /** Oriented boxes: centre, half-extents, and rotation about Y. */
  readonly boxes: { x: number; z: number; hw: number; hd: number; c: number; s: number }[] = [];

  add(x: number, z: number, r: number): void {
    this.list.push({ x, z, r });
  }

  /** A solid box (a wall, a house) `2·hw` × `2·hd`, turned `rotY` about Y. */
  addBox(x: number, z: number, hw: number, hd: number, rotY = 0): void {
    this.boxes.push({ x, z, hw, hd, c: Math.cos(rotY), s: Math.sin(rotY) });
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
    for (const b of this.boxes) {
      // Into the box's frame (local x along its width, z along its depth).
      const dx = p.x - b.x;
      const dz = p.z - b.z;
      const lx = dx * b.c - dz * b.s;
      const lz = dx * b.s + dz * b.c;
      const ex = b.hw + margin * 0.5;
      const ez = b.hd + margin * 0.5;
      if (Math.abs(lx) >= ex || Math.abs(lz) >= ez) continue;
      // Out through the nearest side.
      let nx = lx;
      let nz = lz;
      if (ex - Math.abs(lx) < ez - Math.abs(lz)) nx = Math.sign(lx || 1) * ex;
      else nz = Math.sign(lz || 1) * ez;
      p.x = b.x + nx * b.c + nz * b.s;
      p.z = b.z - nx * b.s + nz * b.c;
    }
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
