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
  /**
   * Retro (PS1) rendering: the 3D scene is drawn at this many horizontal lines and blown up with
   * hard pixel edges, then dithered down to 15-bit colour like the console did. 0 = off (native
   * resolution, smooth). The HUD is DOM and stays sharp whatever this is.
   */
  retroLines: number;
}

/** The retro presets offered in Options: off, a softer "CRT-era" look, and the real thing. */
export const RETRO_LEVELS = [0, 420, 280] as const;

export const settings: GameSettings = {
  soundEnabled: true,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  combatSpeed: 1,
  cameraZoom: 1.25,
  retroLines: 280,
};
