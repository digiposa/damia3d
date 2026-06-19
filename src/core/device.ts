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
