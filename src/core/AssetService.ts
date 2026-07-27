import type { Scene } from "@babylonjs/core/scene";
import type { AssetContainer } from "@babylonjs/core/assetContainer";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import type { Skeleton } from "@babylonjs/core/Bones/skeleton";

import meshoptDecoderUrl from "../assets/vendor/meshopt_decoder.js?url";

/**
 * Central GLB asset service — the one place models are fetched, parsed and handed out.
 *
 * Two cache levels:
 * 1. **Bytes** (global, survives scene switches): each GLB is downloaded exactly once per page
 *    life, with byte-level progress that loading screens can display. Powers the main-menu
 *    prefetch, which runs before any Scene exists.
 * 2. **AssetContainers** (per Scene): the parsed template a scene clones entities from. N knights
 *    on screen = one download, one parse, N cheap instantiations. Containers die with their scene
 *    (ModeManager disposes the scene on every mode switch), the bytes stay.
 *
 * The meshopt decoder is bundled (vendored UMD build) instead of Babylon's default CDN script, so
 * decoding neither depends on nor waits for a third-party host.
 */

const MODEL_URLS = import.meta.glob("../assets/models/*.glb", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

/** Resolve a model's bundled URL from its base filename (no extension), or undefined if absent. */
export function modelUrl(name: string): string | undefined {
  return MODEL_URLS[`../assets/models/${name}.glb`];
}

/** All GLB base names currently available in src/assets/models/. */
export function availableModels(): string[] {
  return Object.keys(MODEL_URLS).map((k) => k.replace(/^.*\/(.+)\.glb$/, "$1"));
}

// --- Loader plumbing (glTF plugin + meshopt decoder), initialized once on demand ---------------

let loadersReady: Promise<void> | undefined;

/** Load the glTF loader module and point Babylon's meshopt decoder at our bundled copy. Called
 *  automatically by every load; also called by the menu prefetch so the modules download early. */
export function ensureLoaders(): Promise<void> {
  return (loadersReady ??= (async () => {
    const [{ MeshoptCompression }] = await Promise.all([
      import("@babylonjs/core/Meshes/Compression/meshoptCompression"),
      import("@babylonjs/loaders/glTF"), // registers the .glb plugin
    ]);
    MeshoptCompression.Configuration = { decoder: { url: meshoptDecoderUrl } };
  })());
}

// --- Level 1: global byte cache ----------------------------------------------------------------

interface ByteEntry {
  promise: Promise<ArrayBuffer | undefined>;
  /** Bytes received / expected so far (total 0 until the response headers arrive). */
  loaded: number;
  total: number;
  settled: boolean;
  listeners: Set<() => void>;
}

const byteCache = new Map<string, ByteEntry>();

function notifyBytes(e: ByteEntry): void {
  for (const l of e.listeners) l();
}

/** Fetch a model's bytes once (deduplicated), streaming so progress is observable. */
function fetchBytes(name: string): ByteEntry {
  const hit = byteCache.get(name);
  if (hit) return hit;
  const entry: ByteEntry = { loaded: 0, total: 0, settled: false, listeners: new Set(), promise: undefined! };
  entry.promise = (async (): Promise<ArrayBuffer | undefined> => {
    const url = modelUrl(name);
    if (!url) {
      console.warn(`[assets] no model "${name}.glb" in src/assets/models/`);
      return undefined;
    }
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      entry.total = Number(resp.headers.get("content-length") ?? 0);
      if (!resp.body) {
        const buf = await resp.arrayBuffer();
        entry.loaded = buf.byteLength;
        return buf;
      }
      const reader = resp.body.getReader();
      const chunks: Uint8Array[] = [];
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        entry.loaded += value.byteLength;
        notifyBytes(entry);
      }
      const buf = new Uint8Array(entry.loaded);
      let off = 0;
      for (const c of chunks) {
        buf.set(c, off);
        off += c.byteLength;
      }
      return buf.buffer;
    } catch (err) {
      console.warn(`[assets] fetching "${name}.glb" failed`, err);
      return undefined;
    } finally {
      entry.settled = true;
      if (!entry.total) entry.total = entry.loaded;
      notifyBytes(entry);
    }
  })();
  byteCache.set(name, entry);
  return entry;
}

/** Kick off background downloads (bytes only — no Scene needed). Safe to call repeatedly; every
 *  file is fetched at most once per page life. Used by the main-menu prefetch. */
export function prefetchModels(names: string[]): void {
  void ensureLoaders(); // the glTF module + decoder download alongside the first bytes
  for (const name of new Set(names)) fetchBytes(name);
}

// --- Level 2: per-scene AssetContainer cache ---------------------------------------------------

const containerCaches = new WeakMap<Scene, Map<string, Promise<AssetContainer | undefined>>>();
const readySets = new WeakMap<Scene, Set<string>>();

function sceneCache(scene: Scene): Map<string, Promise<AssetContainer | undefined>> {
  let map = containerCaches.get(scene);
  if (!map) {
    map = new Map();
    containerCaches.set(scene, map);
    readySets.set(scene, new Set());
  }
  return map;
}

/** True once a model's container is parsed and ready in this scene — instantiation from it is
 *  then effectively instant (the spawn menu uses this to pick instant vs async spawning). */
export function hasContainer(scene: Scene, name: string): boolean {
  return readySets.get(scene)?.has(name) ?? false;
}

/** Get (or parse) the scene's template container for a model. One parse per scene per model. */
function containerFor(scene: Scene, name: string): Promise<AssetContainer | undefined> {
  const map = sceneCache(scene);
  const hit = map.get(name);
  if (hit) return hit;
  const promise = (async (): Promise<AssetContainer | undefined> => {
    await ensureLoaders();
    const bytes = await fetchBytes(name).promise;
    if (!bytes || scene.isDisposed) return undefined;
    try {
      const { SceneLoader } = await import("@babylonjs/core/Loading/sceneLoader");
      const file = new File([bytes], `${name}.glb`);
      const container = await SceneLoader.LoadAssetContainerAsync("file:", file, scene, null, ".glb");
      readySets.get(scene)?.add(name);
      return container;
    } catch (err) {
      console.warn(`[assets] parsing "${name}.glb" failed`, err);
      return undefined;
    }
  })();
  map.set(name, promise);
  return promise;
}

// --- Instantiation -----------------------------------------------------------------------------

/** A per-entity clone of a model, shaped like the old SceneLoader result so call sites stay
 *  familiar: `meshes` holds the (parentless) clone roots first, then every descendant mesh. */
export interface ModelInstance {
  meshes: AbstractMesh[];
  rootNodes: TransformNode[];
  animationGroups: AnimationGroup[];
  skeletons: Skeleton[];
  /** Free this clone (nodes + its cloned animation groups/skeletons). The template container
   *  and the byte cache are untouched. */
  dispose(): void;
}

/**
 * Clone a model into the scene from its cached container (downloading/parsing it first if needed).
 * Geometry is shared between clones; materials are shared too (our material passes are idempotent).
 * Returns undefined (logged) when the model is missing or failed to load — callers fall back to
 * their procedural placeholder.
 */
export async function instantiateModel(scene: Scene, name: string): Promise<ModelInstance | undefined> {
  const container = await containerFor(scene, name);
  if (!container || scene.isDisposed) return undefined;
  const entries = container.instantiateModelsToScene((n) => n, false, { doNotInstantiate: true });
  const meshes: AbstractMesh[] = [];
  for (const rootNode of entries.rootNodes) {
    if (rootNode instanceof AbstractMesh) meshes.push(rootNode);
    meshes.push(...rootNode.getChildMeshes(false));
  }
  return {
    meshes,
    rootNodes: entries.rootNodes as TransformNode[],
    animationGroups: entries.animationGroups,
    skeletons: entries.skeletons,
    dispose() {
      for (const g of entries.animationGroups) g.dispose();
      for (const s of entries.skeletons) s.dispose();
      for (const r of entries.rootNodes) r.dispose();
    },
  };
}

// --- Bulk loading with progress (the loading-screen driver) ------------------------------------

/**
 * Ensure a set of models is downloaded AND parsed into this scene's container cache, reporting
 * aggregate progress (0..1, byte-weighted). Resolves even if some models fail (they log and later
 * instantiate as undefined) — a broken file must never soft-lock a mode behind its loading screen.
 */
export async function loadModels(
  scene: Scene,
  names: string[],
  onProgress?: (fraction: number) => void,
): Promise<void> {
  const uniq = [...new Set(names)];
  if (!uniq.length) {
    onProgress?.(1);
    return;
  }
  void ensureLoaders();
  const entries = uniq.map(fetchBytes);
  if (onProgress) {
    const report = (): void => {
      let sum = 0;
      for (const e of entries) {
        // Per-file fraction; content-length may be the compressed size, so clamp at 1.
        sum += e.settled ? 1 : e.total > 0 ? Math.min(1, e.loaded / e.total) : 0;
      }
      // Parsing happens after the last byte; hold 95% until the containers resolve.
      onProgress((sum / entries.length) * 0.95);
    };
    for (const e of entries) e.listeners.add(report);
    report();
    try {
      await Promise.all(entries.map((e) => e.promise));
    } finally {
      for (const e of entries) e.listeners.delete(report);
    }
  } else {
    await Promise.all(entries.map((e) => e.promise));
  }
  await Promise.all(uniq.map((n) => containerFor(scene, n)));
  onProgress?.(1);
}
