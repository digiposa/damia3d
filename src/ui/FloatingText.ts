/** Horizontal step between two numbers that would otherwise land on top of each other. */
const SPREAD = 30;
/** Centre-to-centre distance below which two numbers are considered stacked. */
const MIN_GAP = 26;
/** How far a number leans toward whoever caused it, in screen px. */
const LEAN = 22;
/** How far a number climbs over its life — matches the keyframes below (135% of ~20px type). */
const RISE = 27;
/** Keep the fan inside the window: numbers pushed sideways must not leave the view. */
const EDGE = 24;

/** A number currently on screen, for the anti-overlap pass. */
export interface LiveNumber {
  x: number;
  y: number;
  born: number;
  life: number;
}
const live: LiveNumber[] = [];

/**
 * Find a spot near (x, y) that no number in `live` already occupies.
 *
 * Two enemies striking on the same frame anchor their numbers on the SAME world point, so without
 * this they are superimposed to the pixel — and with equal damage you simply cannot tell there were
 * two hits.
 *
 * The candidate slots stay **centred on (x, y)**: a number must read as belonging to the actor it
 * is anchored on, so it never wanders far enough to look like someone else's. `bias` (a unit screen
 * vector toward whoever dealt the hit) only decides which free slot is *preferred* — with attackers
 * on either side, each number takes the slot on its own side; with a whole pack bunched up on one
 * side, the numbers still fan out over their victim instead of migrating onto the pack.
 *
 * Pure on purpose (`now` and `viewportWidth` passed in, no globals) so the geometry is testable.
 */
export function fanOut(
  x: number,
  y: number,
  live: readonly LiveNumber[],
  now: number,
  viewportWidth: number,
  bias?: { x: number; y: number },
): { x: number; y: number } {
  const clear = (px: number, py: number): boolean =>
    live.every((l) => {
      if (now - l.born > l.life) return true; // already gone from the screen
      const ly = l.y - RISE * Math.min(1, (now - l.born) / l.life); // where it has risen to by now
      return Math.hypot(px - l.x, py - ly) >= MIN_GAP;
    });

  const inView = (px: number): number => Math.min(Math.max(px, EDGE), Math.max(EDGE, viewportWidth - EDGE));
  // Where the number would ideally sit if nothing else were on screen: leaning toward its source.
  const idealX = bias ? x + bias.x * LEAN : x;
  const idealY = bias ? y + bias.y * LEAN : y;

  const slots: { x: number; y: number }[] = [];
  for (const dy of [0, -MIN_GAP]) {
    for (const dx of [0, SPREAD, -SPREAD, 2 * SPREAD, -2 * SPREAD, 3 * SPREAD, -3 * SPREAD]) {
      slots.push({ x: inView(x + dx), y: y + dy });
    }
  }
  // Closest to the ideal first. Sort is stable, so with no bias the order stays centre-out.
  slots.sort((a, b) => Math.hypot(a.x - idealX, a.y - idealY) - Math.hypot(b.x - idealX, b.y - idealY));
  for (const s of slots) if (clear(s.x, s.y)) return s;
  return slots[0]; // too crowded to separate: accept the overlap rather than fling it away
}

/** {@link fanOut} against the numbers actually on screen, pruning the expired ones first. */
function placeClear(x: number, y: number, bias?: { x: number; y: number }): { x: number; y: number } {
  const now = performance.now();
  for (let i = live.length - 1; i >= 0; i--) if (now - live[i].born > live[i].life) live.splice(i, 1);
  return fanOut(x, y, live, now, window.innerWidth, bias);
}

/**
 * Spawn a transient damage/heal number at canvas CSS coordinates that pops in, floats up and fades,
 * then removes itself. Plain DOM + the Web Animations API, no pooling — these are cheap and
 * short-lived. `big` gives a punchier pop and larger type (for heavy hits / crits).
 *
 * `bias` is an optional unit screen vector pointing at whatever caused the number (the attacker):
 * the number leans that way, and is nudged clear of any number already on screen.
 */
export function floatingText(
  x: number,
  y: number,
  text: string,
  color = "#ffd86b",
  big = false,
  bias?: { x: number; y: number },
): void {
  const life = big ? 900 : 750;
  const at = placeClear(x, y, bias);
  live.push({ x: at.x, y: at.y, born: performance.now(), life });

  const el = document.createElement("div");
  el.textContent = text;
  Object.assign(el.style, {
    position: "fixed",
    left: `${at.x}px`,
    top: `${at.y}px`,
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
    { duration: life, easing: "ease-out", fill: "forwards" },
  );
  anim.onfinish = () => el.remove();
  // Safety net if the animation is interrupted (tab blur, etc.).
  window.setTimeout(() => el.remove(), life + 50);
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
