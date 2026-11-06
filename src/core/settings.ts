/**
 * Global, mutable game settings edited from the Options menu. A plain shared object keeps it
 * simple at this scale; systems read it live each frame. It is remembered in localStorage (best
 * effort): every assignment saves, and the saved values are read back on the next visit.
 */
export interface GameSettings {
  /** Master sound switch. Off until the player turns it on (a page that starts making noise on
   *  its own is unwelcome): the 🔊 button or M, remembered from then on. */
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
  /**
   * Camera on Story maps: 0 = ISO (from above, everywhere), 1 = third person (low behind the hero;
   * the map's own scenic shot where it has one). Arena modes ignore it.
   */
  cameraStyle: number;
}

/** The retro presets offered in Options: off, a softer "CRT-era" look, and the real thing. */
export const RETRO_LEVELS = [0, 420, 280] as const;

const DEFAULTS: GameSettings = {
  soundEnabled: false,
  musicVolume: 0.25,
  sfxVolume: 0.5,
  combatSpeed: 1,
  cameraZoom: 1,
  retroLines: 0, // off by default: the PS1 MOOD lives in the arena and lighting, not in pixels
  cameraStyle: 0,
};

const STORAGE_KEY = "damia3d.settings";

/** The saved settings merged over the defaults: only known keys, only values of the right type. */
function load(): GameSettings {
  const out: GameSettings = { ...DEFAULTS };
  try {
    const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(STORAGE_KEY);
    if (!raw) return out;
    const saved = JSON.parse(raw) as Record<string, unknown>;
    for (const key of Object.keys(DEFAULTS) as (keyof GameSettings)[]) {
      const v = saved[key];
      if (typeof v === typeof DEFAULTS[key] && (typeof v !== "number" || Number.isFinite(v))) {
        (out as unknown as Record<string, unknown>)[key] = v;
      }
    }
  } catch {
    /* localStorage may be unavailable, or hold junk */
  }
  return out;
}

function save(value: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* a private window just won't remember */
  }
}

export const settings: GameSettings = new Proxy(load(), {
  set(target, key, value) {
    (target as unknown as Record<string | symbol, unknown>)[key] = value;
    save(target);
    return true;
  },
});
