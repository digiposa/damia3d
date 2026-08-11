/**
 * Damage/heal numbers, thrown out of the point of impact like Diablo's and streamed like WoW's.
 *
 * A number is LAUNCHED, not placed: it gets its own initial velocity and arcs out under gravity.
 * That is what keeps a burst readable — several hits landing on the same victim in the same frame
 * share one anchor, so any static placement scheme just packs them into a block. Motion separates
 * them instead: sides alternate, the arc widens as the burst grows, and each number is held back a
 * few dozen milliseconds so they emerge as a spray rather than appearing all at once.
 */

/** Sideways launch speed of the first pair, px/s. */
const LAUNCH_X = 80;
/** Extra sideways speed for each further pair, so a big burst spreads wider. */
const LAUNCH_X_STEP = 60;
/** Upward launch speed, px/s (screen y grows downward, so this is applied negative). */
const LAUNCH_Y = 180;
/** How much flatter each further pair leaves, px/s — it separates numbers thrown the same way. */
const LAUNCH_Y_STEP = 30;
/** Downward pull, px/s² — what bends the flight into an arc instead of a straight rise. */
const GRAVITY = 320;
/** Delay between two numbers of the same burst: the WoW-style stream. */
const STAGGER_MS = 65;
/** How many distinct trajectories exist before they start being reused. */
const TRAJECTORIES = 8;
/** Keyframes sampled along the parabola — enough for the curve to read as a curve. */
const STEPS = 10;

/** When each trajectory frees up: a number in flight owns its path until it has faded. */
const busyUntil: number[] = [];

/**
 * Initial velocity and stream delay for the `index`-th number of a burst.
 *
 * Sides alternate so consecutive hits fly apart, and each further pair leaves faster and flatter, so
 * a five-hit burst opens into a fan instead of overlapping. `bias` (a unit screen vector toward
 * whoever dealt the hit) only chooses which side the burst opens on — the number still belongs to,
 * and stays over, the actor it is anchored on.
 *
 * Pure so the geometry is testable.
 */
export function launch(index: number, bias?: { x: number; y: number }): { vx: number; vy: number; delayMs: number } {
  const startLeft = bias ? bias.x < 0 : false;
  const side = (index % 2 === 0) === startLeft ? -1 : 1;
  const tier = Math.floor(index / 2);
  return {
    vx: side * (LAUNCH_X + tier * LAUNCH_X_STEP),
    vy: -Math.max(90, LAUNCH_Y - tier * LAUNCH_Y_STEP), // wider pairs leave flatter, so same-side numbers ride different heights
    delayMs: index * STAGGER_MS,
  };
}

/**
 * Claim a free trajectory for a number about to fly, and hold it until that number has faded.
 *
 * The rule that matters: two numbers that can be on screen together must never share a path. A
 * plain "restart the burst after a quiet gap" counter got this wrong — two hits a fifth of a second
 * apart both restarted at 0, so they flew the identical arc a few pixels apart for their whole life.
 * Reserving instead means the lowest free path is always reused, so an isolated hit stays central
 * while a burst opens up.
 */
function claimTrajectory(now: number, holdMs: number): number {
  for (let i = 0; i < TRAJECTORIES; i++) {
    if ((busyUntil[i] ?? 0) <= now) {
      busyUntil[i] = now + holdMs;
      return i;
    }
  }
  return TRAJECTORIES - 1; // saturated: reuse the outermost rather than fling one further out
}

/**
 * Spawn a transient damage/heal number at canvas CSS coordinates: it is thrown out of the anchor
 * along an arc, then fades and removes itself. Plain DOM + the Web Animations API, no pooling —
 * these are cheap and short-lived. `big` gives a punchier pop and larger type (for heavy hits).
 *
 * `bias` is an optional unit screen vector pointing at whatever caused the number (the attacker):
 * it decides which side the burst opens on.
 */
export function floatingText(
  x: number,
  y: number,
  text: string,
  color = "#ffd86b",
  big = false,
  bias?: { x: number; y: number },
): void {
  const life = big ? 1050 : 900;
  const now = performance.now();
  // Hold the path for the whole flight (its stream delay included) so nothing follows it meanwhile.
  const index = claimTrajectory(now, life + TRAJECTORIES * STAGGER_MS);
  const { vx, vy, delayMs } = launch(index, bias);

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
    opacity: "0", // held until its turn in the stream
    willChange: "transform, opacity",
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(el);

  // Sample the ballistic path: constant sideways drift, gravity bending the rise into an arc.
  const peak = big ? 1.35 : 1.15;
  const seconds = life / 1000;
  const frames = [];
  for (let i = 0; i <= STEPS; i++) {
    const k = i / STEPS;
    const t = k * seconds;
    const dx = vx * t;
    const dy = vy * t + 0.5 * GRAVITY * t * t;
    // Pop in with an overshoot over the first tenth, then hold size; fade over the last third.
    const scale = k === 0 ? 0.4 : k <= 0.1 ? peak : 1;
    const opacity = k < 0.65 ? 1 : Math.max(0, (1 - k) / 0.35);
    frames.push({
      transform: `translate(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px)) scale(${scale})`,
      opacity,
      offset: k,
    });
  }

  const anim = el.animate(frames, { duration: life, delay: delayMs, easing: "linear", fill: "forwards" });
  anim.onfinish = () => el.remove();
  // Safety net if the animation is interrupted (tab blur, etc.).
  window.setTimeout(() => el.remove(), delayMs + life + 50);
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
