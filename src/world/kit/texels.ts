/**
 * Texel density of the maps — one standard so every map reads alike (docs/pipeline/map-textures.md).
 *
 * - Walkable ground (trails, squares, slopes) and anything seen close: {@link GROUND_PPU}.
 * - Far or out-of-reach scenery (cliff faces, sea, ledges): {@link FAR_PPU} is enough.
 * - No single texture over {@link MAX_TEX} pixels a side (many phones refuse more, and memory
 *   climbs fast): a bigger painted layer is cut into chunks.
 */
export const GROUND_PPU = 20;
export const FAR_PPU = 10;
export const MAX_TEX = 2048;
