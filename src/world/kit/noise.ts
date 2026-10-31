/** A repeatable random value in [0, 1) for an integer lattice point. */
export function hash01(i: number, j: number): number {
  const n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

/** Smooth 2D value noise in [0, 1] (hash lattice, smoothstep blend). */
export function noise2(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash01(xi, yi) + (hash01(xi + 1, yi) - hash01(xi, yi)) * sx;
  const b = hash01(xi, yi + 1) + (hash01(xi + 1, yi + 1) - hash01(xi, yi + 1)) * sx;
  return a + (b - a) * sy;
}
