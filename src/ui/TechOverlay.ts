export interface TechView {
  fps: number;
  /** Render backend, e.g. "WebGL2" / "WebGPU". */
  engine: string;
  /** Deployed build hash. */
  build: string;
  /** Active mode name. */
  mode: string;
  /** Free-form combat / status line (combo state, last event…). */
  info: string;
}

/**
 * Small, separate technical overlay: FPS · backend · build on one line, then the
 * active mode and a combat/status line. Kept compact and out of the way; the
 * player-facing numbers live in the StatsBar.
 */
export class TechOverlay {
  private el: HTMLDivElement;
  private head: HTMLDivElement;
  private mode: HTMLDivElement;
  private info: HTMLDivElement;

  constructor() {
    this.el = document.createElement("div");
    Object.assign(this.el.style, {
      position: "fixed",
      top: "calc(env(safe-area-inset-top, 0px) + 120px)",
      left: "calc(env(safe-area-inset-left, 0px) + 8px)",
      padding: "5px 8px",
      borderRadius: "6px",
      background: "rgba(8,11,17,0.6)",
      border: "1px solid rgba(120,150,200,0.22)",
      font: "11px/1.5 ui-monospace, monospace",
      color: "#9fb3d6",
      pointerEvents: "none",
      whiteSpace: "nowrap",
      zIndex: "12",
    } satisfies Partial<CSSStyleDeclaration>);

    this.head = document.createElement("div");
    this.mode = document.createElement("div");
    this.mode.style.color = "#cfe3ff";
    this.info = document.createElement("div");
    this.info.style.color = "#ffe08a";
    this.el.append(this.head, this.mode, this.info);
    document.body.appendChild(this.el);
  }

  set(v: TechView): void {
    this.head.textContent = `${v.fps} fps · ${v.engine} · ${v.build}`;
    this.mode.textContent = v.mode;
    this.info.textContent = v.info;
    this.info.style.display = v.info ? "block" : "none";
  }

  dispose(): void {
    this.el.remove();
  }
}
