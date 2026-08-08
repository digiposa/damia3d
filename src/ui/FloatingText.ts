/**
 * Spawn a transient damage/heal number at canvas CSS coordinates that pops in, floats up and fades,
 * then removes itself. Plain DOM + the Web Animations API, no pooling — these are cheap and
 * short-lived. `big` gives a punchier pop and larger type (for heavy hits / crits).
 */
export function floatingText(
  x: number,
  y: number,
  text: string,
  color = "#ffd86b",
  big = false,
): void {
  const el = document.createElement("div");
  el.textContent = text;
  Object.assign(el.style, {
    position: "fixed",
    left: `${x}px`,
    top: `${y}px`,
    transform: "translate(-50%, -50%)",
    font: `900 ${big ? 30 : 20}px/1 system-ui, sans-serif`,
    color,
    textShadow: big
      ? "0 0 10px rgba(0,0,0,0.9), 0 3px 4px rgba(0,0,0,0.85)"
      : "0 2px 3px rgba(0,0,0,0.8)",
    pointerEvents: "none",
    userSelect: "none",
    zIndex: "14",
    opacity: "1",
    willChange: "transform, opacity",
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(el);

  // Pop in (overshoot), then float up and fade. WAAPI gives a real multi-stage curve.
  const peak = big ? 1.35 : 1.15;
  const anim = el.animate(
    [
      { transform: "translate(-50%, -50%) scale(0.4)", opacity: 1, offset: 0 },
      { transform: `translate(-50%, -72%) scale(${peak})`, opacity: 1, offset: 0.18 },
      { transform: "translate(-50%, -95%) scale(1)", opacity: 1, offset: 0.34 },
      { transform: "translate(-50%, -185%) scale(1)", opacity: 0, offset: 1 },
    ],
    { duration: big ? 900 : 750, easing: "ease-out", fill: "forwards" },
  );
  anim.onfinish = () => el.remove();
  // Safety net if the animation is interrupted (tab blur, etc.).
  window.setTimeout(() => el.remove(), big ? 950 : 800);
}

/** How long a skill caption lives, in seconds (the caller drives its rise/fade). */
export const CAPTION_LIFE = 1.25;
/** How far a caption climbs over its life, in screen pixels. */
export const CAPTION_RISE = 42;

/**
 * The NAME of an ability, over whoever is using it (Power Up, Burn Out, an Addition, a spell…).
 * Deliberately styled as a *label* — small letter-spaced caps on a dark chip — so it never reads as
 * a damage number.
 *
 * Returns the element WITHOUT animating it: unlike a damage number (a one-off at a point in space),
 * a caption has to stay pinned over its caster while they move — so the caller re-projects the
 * anchor every frame and drives the rise/fade itself (see `updateCaptions` in the arena mode).
 */
export function skillCaptionEl(text: string, color = "#ffe08a"): HTMLDivElement {
  const el = document.createElement("div");
  el.textContent = text.toUpperCase();
  Object.assign(el.style, {
    position: "fixed",
    left: "0",
    top: "0",
    transform: "translate(-50%, -50%)",
    font: "800 11px/1 ui-monospace, monospace",
    letterSpacing: "0.12em",
    color,
    background: "rgba(8,10,16,0.72)",
    border: `1px solid ${color}`,
    borderRadius: "6px",
    padding: "3px 7px",
    whiteSpace: "nowrap",
    textShadow: "0 1px 2px rgba(0,0,0,0.9)",
    pointerEvents: "none",
    userSelect: "none",
    zIndex: "13", // under damage numbers (14) — the number is the payload, this is the context
    willChange: "transform, opacity",
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(el);
  return el;
}
