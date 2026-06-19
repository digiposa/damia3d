/**
 * Core combat attributes shared by playable characters and enemies. Mirrors the
 * stat model of *The Legend of Dragoon*.
 */
export interface Stats {
  /** Maximum hit points. */
  maxHp: number;
  /** Physical attack power. */
  at: number;
  /** Physical defense. */
  df: number;
  /** Magical attack power. */
  mat: number;
  /** Magical defense. */
  mdf: number;
}
