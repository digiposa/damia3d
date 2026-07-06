# 3D models (`.glb`) — low-poly decor & props

Drop `.glb` files here and they become available to the game automatically (Vite globs this
folder — no import lines to write). Reference a model by its **base filename** in a decor
layout; see `src/world/props.ts` and the `decor` list in `src/modes/TrainingMode.ts`.

```ts
// e.g. in a mode's `decor` list:
{ model: "pillar",       position: [0, 0, -6], rotationY: 0,   scale: 1.5, receiveShadows: false }
{ model: "dungeon_floor", position: [0, 0, 0],  scale: 1,       receiveShadows: true }
```

The loader parents the model under a transform, disables picking (decor never eats clicks),
and — via `Atmosphere.addStaticCasters` — lets it cast shadows in the lit scene.

## Where to get assets (you don't need to model anything)

Pick **one** coherent pack so the world reads as a set. Recommended, free, commercial-OK:

- **Quaternius** — https://quaternius.com — CC0 (public domain, no attribution required).
  Look at the *Ultimate Modular Dungeon*, *Cave Kit*, *Nature* packs. Great match for the
  dark-fantasy / low-poly look.
- **Kenney** — https://kenney.nl/assets — CC0. *Tower Defense*, *Dungeon*, *Nature* kits.

Both ship glTF/GLB. If a pack is FBX/OBJ only, convert to `.glb` in Blender (File → Export →
glTF Binary) or with an online converter.

## Format & conventions

- **Format:** `.glb` (single binary file — textures embedded). Preferred over `.gltf`+bin.
- **Scale:** the game's characters are ~1.8 units tall; size props to match (tweak per-placement
  `scale` if a pack uses a different unit).
- **Orientation:** the world faces +Z, up is +Y. Rotate with `rotationY` if a piece faces wrong.
- **Naming:** lowercase, no spaces (`wall_corner.glb`, not `Wall Corner.glb`).

## Performance / repo size (important)

- Keep it **low-poly** and reuse the same few pieces (modular kits) — it's cheap and reads well
  in the iso camera.
- GLBs are **binary and bloat the git repo + the GitHub Pages download**. A handful of small
  props is fine; if you bring in a large pack, tell me and we'll set up lazy-loading and/or host
  the assets separately (or Git LFS) so page-load stays fast on mobile.
