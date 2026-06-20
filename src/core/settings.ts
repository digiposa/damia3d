/**
 * Global, mutable game settings edited from the Options menu. A plain shared
 * object keeps it simple at this scale; systems read it live each frame.
 */
export interface GameSettings {
  /** Master sound switch (no audio is wired up yet — placeholder). */
  soundEnabled: boolean;
  /** Music volume, 0–1. */
  musicVolume: number;
  /** Sound-effects volume, 0–1. */
  sfxVolume: number;
  /**
   * Combat-speed multiplier applied to combat time (enemy AI, attack cadence,
   * Addition combo windows). Movement speed is intentionally left untouched.
   */
  combatSpeed: number;
  /** Camera zoom: higher = closer. The iso view height is divided by this. */
  cameraZoom: number;
}

export const settings: GameSettings = {
  soundEnabled: true,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  combatSpeed: 1,
  cameraZoom: 1.25,
};
