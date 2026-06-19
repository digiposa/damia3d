/**
 * Spawn a transient damage/heal number at canvas CSS coordinates that floats up
 * and fades out, then removes itself. Plain DOM, no pooling — these are cheap
 * and short-lived.
 */
export function floatingText(
  x: number,
  y: number,
  text: string,
  color = "#ffd86b",
): void {
  const el = document.createElement("div");
  el.textContent = text;
  Object.assign(el.style, {
    position: "fixed",
    left: `${x}px`,
    top: `${y}px`,
    transform: "translate(-50%, -50%)",
    font: "800 20px/1 system-ui, sans-serif",
    color,
    textShadow: "0 2px 3px rgba(0,0,0,0.8)",
    pointerEvents: "none",
    userSelect: "none",
    zIndex: "14",
    transition: "transform 0.7s ease-out, opacity 0.7s ease-out",
    opacity: "1",
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(el);

  // Kick the animation on the next frame so the transition applies.
  requestAnimationFrame(() => {
    el.style.transform = "translate(-50%, -180%)";
    el.style.opacity = "0";
  });
  window.setTimeout(() => el.remove(), 750);
}
