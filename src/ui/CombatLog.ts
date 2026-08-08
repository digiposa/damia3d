import { hasTouch } from "../core/device";

/** How long a line stays before it fades out. */
const LIFE_MS = 3800;

/**
 * A discreet running combat log, bottom-left: the last few actions ("Commander — Power Up"), each
 * line fading on its own. Deliberately small, translucent and NON-interactive (`pointerEvents:
 * none`) so it never fights the controls: the joystick zone shares this corner on touch devices,
 * and the action buttons own the opposite one. Touch keeps 2 lines (screen real estate), desktop 3.
 *
 * It complements the {@link import("./FloatingText").skillCaption} over the caster: the caption says
 * what is happening *right now, there*; the log says what just happened, in order.
 */
export class CombatLog {
  private readonly root: HTMLDivElement;
  private readonly max: number;
  private timers = new Set<number>();

  constructor() {
    this.max = hasTouch() ? 2 : 3;
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      left: "calc(env(safe-area-inset-left, 0px) + 10px)",
      bottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)",
      display: "flex",
      flexDirection: "column",
      gap: "3px",
      maxWidth: "min(52vw, 300px)",
      pointerEvents: "none",
      userSelect: "none",
      zIndex: "9", // above the arena, below menus/overlays
    } satisfies Partial<CSSStyleDeclaration>);
    document.body.appendChild(this.root);
  }

  /** Append one line ("who — what"), tinted by the action (element colour, buff gold…). */
  push(text: string, color = "#dfe7f2"): void {
    const line = document.createElement("div");
    line.textContent = text;
    Object.assign(line.style, {
      font: "700 11px/1.25 ui-monospace, monospace",
      color,
      background: "rgba(6,9,14,0.62)",
      borderLeft: `2px solid ${color}`,
      borderRadius: "3px",
      padding: "3px 6px",
      textShadow: "0 1px 2px rgba(0,0,0,0.9)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      opacity: "0",
    } satisfies Partial<CSSStyleDeclaration>);
    this.root.appendChild(line);
    // Oldest first: drop from the top once the stack is full.
    while (this.root.childElementCount > this.max) this.root.firstElementChild?.remove();

    line.animate(
      [
        { opacity: 0, transform: "translateX(-8px)" },
        { opacity: 1, transform: "translateX(0)" },
      ],
      { duration: 140, easing: "ease-out", fill: "forwards" },
    );
    const fade = window.setTimeout(() => {
      const out = line.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, fill: "forwards" });
      out.onfinish = () => line.remove();
      this.timers.delete(fade);
    }, LIFE_MS);
    this.timers.add(fade);
  }

  dispose(): void {
    for (const t of this.timers) window.clearTimeout(t);
    this.timers.clear();
    this.root.remove();
  }
}
