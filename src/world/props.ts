import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { MultiMaterial } from "@babylonjs/core/Materials/multiMaterial";
import type { Material } from "@babylonjs/core/Materials/material";
import type { Scene } from "@babylonjs/core/scene";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { ISceneLoaderAsyncResult } from "@babylonjs/core/Loading/sceneLoader";

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

/**
 * Tune imported PBR materials for our stylized scene: cap metalness (fully-metallic shows only
 * the dim env and no diffuse → dark-albedo models read near-black) so direct/ambient lights also
 * shade it, and cap roughness so highlights stay sharp (a polished-metal glint) rather than a
 * dull matte wash. Balances "visible" and "looks like shiny metal".
 */
/**
 * Visit every unique {@link PBRMaterial} on `meshes`, descending into MultiMaterials and
 * de-duplicating shared materials. The three tuning passes below differ only in the body they
 * apply per material, so they share this walker.
 */
function forEachPBRMaterial(meshes: AbstractMesh[], apply: (m: PBRMaterial) => void): void {
  const seen = new Set<Material>();
  const visit = (m: Material | null): void => {
    if (!m || seen.has(m)) return;
    seen.add(m);
    if (m instanceof MultiMaterial) m.subMaterials.forEach(visit);
    else if (m instanceof PBRMaterial) apply(m);
  };
  for (const mesh of meshes) visit(mesh.material);
}

/**
 * Auto-fit a loaded model to a target height with its feet at y=0: scan the meshes' world-space
 * Y bounds and scale/position `root` so it stands the right size regardless of the source's units
 * (AI/Mixamo/AccuRIG exports arrive at wildly different scales). Rotation is set by the caller.
 */
export function fitHeight(meshes: AbstractMesh[], root: TransformNode, targetH: number): void {
  let lo = Infinity;
  let hi = -Infinity;
  for (const mesh of meshes) {
    if (mesh.getTotalVertices() === 0) continue; // skip the empty glTF __root__
    mesh.computeWorldMatrix(true);
    const bb = mesh.getBoundingInfo().boundingBox;
    lo = Math.min(lo, bb.minimumWorld.y);
    hi = Math.max(hi, bb.maximumWorld.y);
  }
  if (hi > lo) {
    const f = targetH / (hi - lo);
    root.scaling.setAll(f);
    root.position.y = -lo * f; // feet on the ground
  }
}

export function tuneImportedMetal(meshes: AbstractMesh[], metalCap = 0.7, roughCap = 0.4): void {
  forEachPBRMaterial(meshes, (m) => {
    if (m.metallic !== null && m.metallic > metalCap) m.metallic = metalCap;
    if (m.roughness !== null && m.roughness > roughCap) m.roughness = roughCap;
  });
}

/**
 * Flatten imported PBR materials to a diffuse "cell-shaded" look: force metallic 0 and roughness 1
 * so the model reads as its painted base-colour texture, lit only softly by ambient + sun (no metal
 * reflection, no env dependence). Use for AI-generated models whose shading is baked into the
 * texture (Tripo/Meshy cartoon exports) — the opposite treatment to {@link tuneImportedMetal},
 * which is for genuinely metallic PBR assets. Without this, a glTF material with no metallicFactor
 * defaults to metallic 1.0 and renders near-black in our dim scene.
 */
export function flattenCellShaded(meshes: AbstractMesh[]): void {
  forEachPBRMaterial(meshes, (m) => {
    m.metallic = 0;
    m.roughness = 1;
    // Brightness comes ONLY from the scene's ambient IBL (soft, physically-based), NEVER from
    // emissive. The GlowLayer (intensity 0.6, 32px blur) turns ANY non-zero emissive into a
    // blurred full-body halo — the "luminescent / translucent ghost" look reported since the
    // self-illumination was first added. Emissive is pinned to pure black so a character feeds
    // the glow buffer nothing at all; readability is bought back purely by lifting the IBL.
    m.environmentIntensity = 1.35;
    m.emissiveColor = Color3.Black();
    m.emissiveTexture = null; // never let an export's own emissive map re-introduce the glow
    m.emissiveIntensity = 0;
    // Force fully opaque at EVERY level. The AI exports are authored OPAQUE with no texture
    // alpha, yet users reported "translucent/ghost" characters — a symptom of a mobile GL path
    // treating the PBR material as alpha-blended. Pin every transparency knob so the body can
    // never render see-through regardless of the device: no blend mode, full alpha, ignore any
    // stray texture alpha, and write depth so nothing shows through.
    m.transparencyMode = PBRMaterial.PBRMATERIAL_OPAQUE;
    m.alpha = 1;
    m.useAlphaFromAlbedoTexture = false;
    if (m.albedoTexture) m.albedoTexture.hasAlpha = false;
    m.forceDepthWrite = true;
    m.needDepthPrePass = false;
    m.backFaceCulling = true;
  });
  // Belt-and-suspenders: reset per-mesh visibility (the arena fades near-side *decor* via
  // mesh.visibility; guarantee a character is never inadvertently dimmed to translucency).
  for (const mesh of meshes) mesh.visibility = 1;
}

/**
 * Tune an imported weapon so it reads in the dim scene instead of vanishing as a dark toothpick:
 * a light metallic glint (steel catches highlights) plus a modest self-illumination driven by its
 * own base texture, so the blade/guard stay visible even in shadow — without the GlowLayer turning
 * it into a neon blade. Use for hand-held weapon models.
 */
export function tuneWeapon(meshes: AbstractMesh[]): void {
  forEachPBRMaterial(meshes, (m) => {
    m.metallic = 0.25;
    m.roughness = 0.4;
    m.environmentIntensity = 0.8;
    if (m.albedoTexture) m.emissiveTexture = m.albedoTexture; // self-lit from its own colours
    m.emissiveColor = new Color3(0.3, 0.3, 0.3);
  });
}

/** All GLB base names currently available in src/assets/models/. */
export function availableModels(): string[] {
  return Object.keys(MODEL_URLS).map((k) => k.replace(/^.*\/(.+)\.glb$/, "$1"));
}

/**
 * Import a GLB by base filename (from src/assets/models/), returning the full loader result
 * (meshes + animationGroups + skeletons). The glTF loader is imported on demand and decodes
 * meshopt/WebP automatically. Returns undefined (logged) if the model file isn't present.
 * Shared by {@link loadProp} (static decor) and rigged entities (enemies/characters).
 */
export async function importModel(scene: Scene, name: string): Promise<ISceneLoaderAsyncResult | undefined> {
  const url = MODEL_URLS[`../assets/models/${name}.glb`];
  if (!url) {
    console.warn(`[props] no model "${name}.glb" in src/assets/models/`);
    return undefined;
  }
  await import("@babylonjs/loaders/glTF"); // on demand → out of the initial bundle
  const { SceneLoader } = await import("@babylonjs/core/Loading/sceneLoader");
  const cut = url.lastIndexOf("/") + 1;
  return SceneLoader.ImportMeshAsync("", url.slice(0, cut), url.slice(cut), scene);
}

/**
 * Load one GLB prop and place it. Returns the parent node and its meshes, or undefined if the
 * model file isn't present (logged, non-fatal — the scene keeps working without it).
 */
export async function loadProp(
  scene: Scene,
  p: PropPlacement,
): Promise<{ root: TransformNode; meshes: AbstractMesh[] } | undefined> {
  const res = await importModel(scene, p.model);
  if (!res) return undefined;

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
