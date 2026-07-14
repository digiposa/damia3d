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
