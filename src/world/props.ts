import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

/**
 * GLB prop pipeline. Drop `.glb` files into `src/assets/models/` and reference them by base
 * filename — no per-file import lines (Vite globs them as URLs). A scene's decor is then a
 * data list of placements ({@link PropPlacement}), so swapping procedural boxes for a real
 * low-poly pack is a config change, not a rewrite. See `src/assets/models/README.md`.
 */
const MODEL_URLS = import.meta.glob("../assets/models/*.glb", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

/** One placed instance of a GLB model. */
export interface PropPlacement {
  /** Base filename in src/assets/models/ without the .glb extension (e.g. "wall_corner"). */
  model: string;
  /** World position (default origin). */
  position?: [number, number, number];
  /** Yaw in radians (default 0). */
  rotationY?: number;
  /** Uniform scale (default 1). */
  scale?: number;
  /** Whether this prop's meshes catch cast shadows (floors/large surfaces — default false). */
  receiveShadows?: boolean;
}

/** All GLB base names currently available in src/assets/models/. */
export function availableModels(): string[] {
  return Object.keys(MODEL_URLS).map((k) => k.replace(/^.*\/(.+)\.glb$/, "$1"));
}

/**
 * Load one GLB prop and place it. Returns the parent node and its meshes, or undefined if the
 * model file isn't present (logged, non-fatal — the scene keeps working without it).
 */
export async function loadProp(
  scene: Scene,
  p: PropPlacement,
): Promise<{ root: TransformNode; meshes: AbstractMesh[] } | undefined> {
  const url = MODEL_URLS[`../assets/models/${p.model}.glb`];
  if (!url) {
    console.warn(`[props] no model "${p.model}.glb" in src/assets/models/`);
    return undefined;
  }
  // Load the glTF loader on demand so it stays out of the initial bundle.
  await import("@babylonjs/loaders/glTF");
  const { SceneLoader } = await import("@babylonjs/core/Loading/sceneLoader");
  const cut = url.lastIndexOf("/") + 1;
  const res = await SceneLoader.ImportMeshAsync("", url.slice(0, cut), url.slice(cut), scene);

  const root = new TransformNode(`prop:${p.model}`, scene);
  for (const mesh of res.meshes) {
    if (!mesh.parent) mesh.parent = root; // re-parent the top-level nodes under our transform
    mesh.isPickable = false; // decor never swallows clicks (enemies/ground handle picking)
    if (p.receiveShadows) mesh.receiveShadows = true;
  }
  if (p.position) root.position = new Vector3(p.position[0], p.position[1], p.position[2]);
  if (p.rotationY !== undefined) root.rotation.y = p.rotationY;
  if (p.scale !== undefined) root.scaling.setAll(p.scale);
  return { root, meshes: res.meshes };
}

/**
 * Load a whole decor layout (list of placements). Returns every loaded mesh, so the caller can
 * register them as static shadow casters via {@link Atmosphere.addStaticCasters}.
 */
export async function loadEnvironment(scene: Scene, layout: PropPlacement[]): Promise<AbstractMesh[]> {
  const all: AbstractMesh[] = [];
  for (const placement of layout) {
    const loaded = await loadProp(scene, placement);
    if (loaded) all.push(...loaded.meshes);
  }
  return all;
}
