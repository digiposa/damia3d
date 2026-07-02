/**
 * Runtime device-capability helpers. Kept tiny and dependency-free so any UI
 * can branch on input modality (touch vs keyboard/mouse) without guessing.
 */

/** True when the device exposes a touchscreen (phones, tablets, hybrids). */
export function hasTouch(): boolean {
  return (
    typeof navigator !== "undefined" &&
    (navigator.maxTouchPoints > 0 || "ontouchstart" in window)
  );
}

/**
 * HUD magnification factor. The on-screen HUD is tuned in CSS px for phones; on a
 * desktop (mouse/keyboard, no touchscreen) those same px read tiny on a large
 * display, so scale the HUD up. Touch devices keep 1 (already sized for them).
 */
export function hudScale(): number {
  return hasTouch() ? 1 : 1.4;
}

/**
 * Apply {@link hudScale} to a corner-anchored HUD root via CSS `zoom`, which scales
 * the element's size, its position offsets and its hit-testing together — so it grows
 * in place while keeping whatever viewport corner it was anchored to. No-op at scale 1.
 */
export function scaleHud(el: HTMLElement): void {
  const k = hudScale();
  if (k !== 1) el.style.setProperty("zoom", String(k));
}
