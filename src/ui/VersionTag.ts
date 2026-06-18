/**
 * Discreet build identifier pinned to the bottom-right corner. Shows the git
 * commit the running build was compiled from (injected at build time), so the
 * deployed version is always identifiable in-game.
 */
export function mountVersionTag(): void {
  const tag = document.createElement("div");
  tag.textContent = `build ${__COMMIT__}`;
  Object.assign(tag.style, {
    position: "fixed",
    bottom: "6px",
    right: "8px",
    font: "11px/1 ui-monospace, monospace",
    color: "rgba(180,200,230,0.45)",
    pointerEvents: "none",
    userSelect: "none",
    zIndex: "20",
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(tag);
}
