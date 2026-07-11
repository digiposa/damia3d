import { scaleHud, hasTouch } from "../core/device";

/** Color-independent gloss laid over each button's solid colour: a soft top
 *  highlight + a darker bottom, giving the flat disc some depth. */
const GLOSS =
  "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.30), rgba(255,255,255,0) 55%)," +
  "radial-gradient(circle at 50% 122%, rgba(0,0,0,0.45), rgba(0,0,0,0) 60%)";

/** Resting shadow stack: an inset rim (light top / dark bottom) + an outer drop. */
const BASE_SHADOW =
  "inset 0 2px 3px rgba(255,255,255,0.30)," +
  "inset 0 -5px 10px rgba(0,0,0,0.40)," +
  "0 4px 12px rgba(0,0,0,0.45)";

/** Same stack with the gold "ATB ready" halo prepended. */
const READY_SHADOW = "0 0 16px 2px rgba(255,216,107,0.95)," + BASE_SHADOW;

/**
 * Round on-screen action button, anchored bottom-right by default (clear of the
 * build tag). Primarily for touch, but also clickable with a mouse. Fires
 * `onPress` on pointer-up.
 */
export class ActionButton {
  private el: HTMLButtonElement;
  private label: HTMLSpanElement;
  /** Desktop-only keyboard-shortcut pill (created lazily by setShortcut). */
  private shortcutEl?: HTMLSpanElement;

  /** Ordered sprite frames (≥2 → animated icon); empty for an emoji/text label. */
  private frames: string[] = [];
  /** Frame shown while idle (last frame = the resting pose). */
  private restFrame = 0;
  private frameTimer = 0;
  private frameIndex = 0;
  /** Whether the icon is currently cycling (ATB ready). */
  private animating = false;
  /** Last-written HUD state, so the per-frame setters skip redundant style writes. */
  private _available?: boolean;
  private _visible?: boolean;
  private _ready?: boolean;

  constructor(
    label: string,
    onPress: () => void,
    style?: Partial<CSSStyleDeclaration>,
    iconFrames?: string[],
    restFrameIndex = 0,
  ) {
    this.el = document.createElement("button");
    Object.assign(this.el.style, {
      position: "fixed",
      right: "calc(env(safe-area-inset-right, 0px) + 26px)",
      bottom: "calc(env(safe-area-inset-bottom, 0px) + 40px)",
      width: "84px",
      height: "84px",
      borderRadius: "50%",
      // Flex-centre the label so emoji and sprite icons sit dead-centre.
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      font: "700 16px/1 system-ui, sans-serif",
      color: "#ffe6e6",
      // Solid colour lives in backgroundColor so the GLOSS image survives style overrides.
      backgroundColor: "rgba(150,40,50,0.85)",
      backgroundImage: GLOSS,
      border: "1px solid rgba(255,160,160,0.55)",
      boxShadow: BASE_SHADOW,
      cursor: "pointer",
      touchAction: "manipulation",
      overflow: "hidden",
      zIndex: "16",
    } satisfies Partial<CSSStyleDeclaration>);
    Object.assign(this.el.style, style ?? {});
    // Re-apply the gloss in case a caller's style override cleared it.
    if (!this.el.style.backgroundImage) this.el.style.backgroundImage = GLOSS;
    this.el.style.setProperty("-webkit-tap-highlight-color", "transparent");

    this.label = document.createElement("span");
    Object.assign(this.label.style, {
      position: "relative",
      zIndex: "1",
    } satisfies Partial<CSSStyleDeclaration>);
    if (iconFrames && iconFrames.length > 0) {
      // Pixel-art sprite icon: show it crisp (no smoothing) and centred. With several
      // frames the icon animates while ready and freezes on the rest pose otherwise —
      // see setReady(). The rest frame (default 0) is the idle pose; the others play out
      // the action (sword raising, eye opening, …) so the loop reads as "ready to act".
      this.frames = iconFrames;
      this.restFrame = Math.min(restFrameIndex, iconFrames.length - 1);
      this.frameIndex = this.restFrame;
      Object.assign(this.label.style, {
        display: "block",
        // Scale with the button so the sprite fills it nicely whatever the size.
        width: "60%",
        height: "60%",
        backgroundImage: `url(${iconFrames[this.restFrame]})`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        imageRendering: "pixelated",
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))",
      } satisfies Partial<CSSStyleDeclaration>);
    } else {
      this.label.textContent = label;
    }

    this.el.append(this.label);
    this.el.addEventListener("pointerup", (e) => {
      e.preventDefault();
      onPress();
    });
    scaleHud(this.el); // desktop: enlarge the phone-tuned HUD (scales size + corner offset)
    document.body.appendChild(this.el);
  }

  /** Enable/disable the button: dims and blocks taps when unavailable. */
  setAvailable(enabled: boolean): void {
    if (this._available === enabled) return; // called every HUD frame — skip if unchanged
    this._available = enabled;
    this.el.style.opacity = enabled ? "1" : "0.35";
    this.el.style.pointerEvents = enabled ? "auto" : "none";
  }

  /** Show or hide the button entirely (e.g. actions only valid in one form). */
  setVisible(visible: boolean): void {
    if (this._visible === visible) return;
    this._visible = visible;
    this.el.style.display = visible ? "flex" : "none";
  }

  /** Highlight the button with a gold "ready to act" glow (ATB full), and — for a
   *  multi-frame sprite icon — cycle the frames while ready, freezing on the rest pose. */
  setReady(ready: boolean): void {
    if (this._ready === ready) return;
    this._ready = ready;
    this.el.style.boxShadow = ready ? READY_SHADOW : BASE_SHADOW;
    if (this.frames.length > 1) {
      if (ready) this.startAnim();
      else this.stopAnim();
    }
  }

  /** Begin cycling sprite frames (idempotent — safe to call every HUD refresh). */
  private startAnim(): void {
    if (this.animating) return;
    this.animating = true;
    this.frameIndex = 0;
    this.showFrame(0);
    this.frameTimer = window.setInterval(() => {
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
      this.showFrame(this.frameIndex);
    }, 130);
  }

  /** Stop cycling and settle on the rest pose. */
  private stopAnim(): void {
    if (!this.animating) return;
    this.animating = false;
    window.clearInterval(this.frameTimer);
    this.frameTimer = 0;
    this.showFrame(this.restFrame);
  }

  private showFrame(i: number): void {
    this.label.style.backgroundImage = `url(${this.frames[i]})`;
  }

  /** Swap the sprite frame set at runtime (e.g. attack sword by form, transform eye by
   *  archetype). Keeps animating if currently ready; otherwise settles on the rest pose. */
  setFrames(frames: string[], restFrameIndex = 0): void {
    if (frames.length === 0) return;
    this.frames = frames;
    this.restFrame = Math.min(restFrameIndex, frames.length - 1);
    this.frameIndex = Math.min(this.frameIndex, frames.length - 1);
    this.showFrame(this.animating ? this.frameIndex : this.restFrame);
  }

  /** Update the button's solid colour (the gloss image stays on top). */
  setColor(backgroundColor: string): void {
    this.el.style.backgroundColor = backgroundColor;
  }

  /**
   * Show a discreet keyboard-shortcut pill at the bottom of the button (desktop only — touch
   * devices have no keyboard, so it's a no-op there). Pass e.g. "Space", "G", "Tab".
   */
  setShortcut(key: string): void {
    if (hasTouch()) return;
    if (!this.shortcutEl) {
      const el = document.createElement("span");
      Object.assign(el.style, {
        position: "absolute",
        bottom: "-3px",
        left: "50%",
        transform: "translateX(-50%)",
        font: "700 9px/1 ui-monospace, monospace",
        color: "rgba(235,240,255,0.82)",
        background: "rgba(0,0,0,0.6)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: "4px",
        padding: "1px 4px",
        pointerEvents: "none",
        whiteSpace: "nowrap",
        zIndex: "3",
      } satisfies Partial<CSSStyleDeclaration>);
      this.el.appendChild(el);
      this.shortcutEl = el;
    }
    this.shortcutEl.textContent = key;
  }

  dispose(): void {
    if (this.frameTimer) window.clearInterval(this.frameTimer);
    this.el.remove();
  }
}
