# Quaternius assets — web-ready GLB

Compressed, browser-ready `.glb` versions of the [Quaternius](https://quaternius.com/)
asset library (CC0). One `.glb` per source model, mirroring the original pack
structure.

These are **derived** files, committed so they're available in-repo (incl. to
cloud tooling). The raw multi-format library (FBX/OBJ/glTF/blend, ~1.6 GB) is
kept **local only** and git-ignored (`claudeAiShare/`).

## Pipeline

Each source mesh (kept format priority glTF → FBX → OBJ) was converted and
optimized with [`@gltf-transform`](https://gltf-transform.dev/):

- **Geometry**: meshopt compression (`EXT_meshopt_compression` + quantization)
- **Textures**: recompressed to **WebP**, max **1024 px**
- **Simplify**: disabled (preserves low-poly silhouettes and skinned meshes)
- FBX → glb via `fbx2gltf`; OBJ → glb via `obj2gltf`, then the same optimize pass

Result: **~1.6 GB → 162 MB** (1537 models). Skinned characters keep all their
animations (e.g. the Animated Knight retains its 12 clips).

## Loading in Babylon.js

Babylon supports the extensions used here (`EXT_meshopt_compression`,
`EXT_texture_webp`) out of the box — load a `.glb` directly, no extra config.

## License

CC0 (public domain) — Quaternius. Original `License*.txt` / `Readme` files are
retained in the raw library.
