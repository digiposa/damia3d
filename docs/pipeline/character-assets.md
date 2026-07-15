# Character asset pipeline (model → rig → animations)

How we turn a Legend of Dragoon character into a rigged, animated, in-game model. The goal is a
**cell-shaded low-poly** look faithful to the PS1 canon, produced with **free** tools. Roles are
split: the **user** generates/animates the raw assets; **Claude** integrates them into the engine.

> This is the durable process + conventions. The exact CLIs Claude uses (fbx2gltf, assimp,
> gltf-transform/meshopt, sharp) are re-installed in a scratchpad each session — they are a means,
> not part of the repo.

## Overview

```
(1) ChatGPT        (2) ChatGPT         (3) Tripo3D         (4) Claude          (5) Mixamo → Claude
 reference    →     T/A-pose sprite →   image→3D (GLB)  →   integrate + FBX →   animate + integrate
 art pass                                (Legacy/free)      (rig-ready mesh)     (per-Addition clips)
```

## Step 1 — Reference art pass (user, ChatGPT)

Generate a reworked, coherent character sheet from references: the **PS1 in-game model**, **official
artwork**, the **portrait we already generated**, and general **fanart**. Aim for a style that
matches our cell-shaded look (readable silhouette, clean colours, not photoreal).

## Step 2 — T-pose sprite (user, ChatGPT)

If the sheet is good enough, ask for the **same character in a clean T-pose** (or A-pose). This one
image feeds Tripo, so it decides mesh + rig quality. Make it count:

- **Front-facing, full body, plain/neutral background** (detoured is even better).
- **ALL four limbs clearly separated** — arms out ~45°+ with hands open, AND **legs apart with a
  visible gap between the thighs and between the ankles**. This is what lets Mixamo's auto-rigger
  place the skeleton correctly. ⚠️ If limbs are too close, image-to-3D **webs the gap with
  geometry** (a "palmure") that stays hidden in the static pose but stretches into an ugly sheet
  once the rig spreads the limbs in animation. Legs-too-close is the most common offender — give
  them a clear A-stance.
- Symmetric pose, neutral expression, no props overlapping the body (weapons come separately).
- **Non-humanoids** (creatures, quadrupeds): Mixamo can't auto-rig these. Plan for a manual Blender
  rig or in-engine procedural motion — flag it early.

## Step 3 — Image → 3D (user, Tripo3D)

Push the T-pose image through **Tripo3D, Legacy system** (free, exports **GLB**). Prefer the cleanest
single front image; a back view too if the tool accepts it. Export **GLB**.

## Step 4 — Integrate the mesh + hand back a rig-ready FBX (Claude)

Given the raw GLB, Claude:

1. **Optimizes** it (WebP textures + meshopt quantization) so it stays small for the mobile Pages
   build, and **auto-fits height** (~1.8 units) and orientation to the game's conventions.
2. Applies **cell-shading** (`flattenCellShaded` in `src/world/props.ts`) so it matches the world.
3. Drops the `.glb` into `src/assets/models/` and wires the bearer's `model` field in
   `src/data/bearers.ts` (see conventions below).
4. **Exports an FBX** of the T-pose mesh (GLB→FBX) for the user to upload to Mixamo. Mixamo re-rigs
   from scratch, so this FBX is the clean mesh, not a pre-rigged one.

## Step 5 — Animate + integrate clips (user Mixamo → Claude)

The user auto-rigs + picks animations on **Mixamo** and downloads one **FBX per clip**. Claude then:

1. Converts each FBX→GLB and **grafts its animation channels onto the character's base skeleton by
   node name** (so every clip drives the one in-game skeleton).
2. Names the clips and wires them into the Player animation state (idle / walk / run — combat vs
   exploration — draw/sheathe, and eventually **one clip per Addition hit**).

The Addition-animation work (mapping each Addition's hits to clips, starting with the **blueSea**
archetype — Damia, Meru, Lenus — and Damia first) is the phase this pipeline feeds.

## Conventions

### File naming (`src/assets/models/`, lowercase, no spaces)

| File | Purpose |
|---|---|
| `<id>.glb` | base (human-form) rigged model — `id` matches the bearer id |
| `<id>_dragoon.glb` | Dragoon-form model (optional) |
| `<id>_weapon.glb` | held weapon (optional; holstered on hand/back sockets) |

Animation FBXs (uploads, not committed): `Character__Clip.fbx` — e.g. `Damia__Attack.fbx`,
`Damia__Walk_C.fbx` (combat), `Damia__Walk_NC.fbx` (non-combat).

### Bearer wiring (`src/data/bearers.ts`)

```ts
{ id: "damia", …, model: "damia", dragoonModel: "damia_dragoon",
  weaponModel: "damia_weapon", weaponGrip: 0.85 }
```

- `model` / `dragoonModel` / `weaponModel` — base filenames (no `.glb`).
- `weaponGrip?` / `weaponScale?` — per-bearer weapon placement tuning on the holster socket.
- Bearers with **no** `model` fall back to the procedural humanoid (still fine as a placeholder).

### Scale / orientation / weapon

- Characters are **~1.8 units** tall; `fitHeight` normalizes automatically.
- World faces **+Z**, up is **+Y**. `MODEL_YAW` is the game's authored facing — verify a new model
  faces the right way when moving "down" (this bit us on Damia's Dragoon form).
- Weapons mount on a **hand socket** (drawn/combat) and a **back socket** (sheathed/exploration);
  placement offsets go on the weapon node, **below** the bone's scale-cancel.

### Performance / repo size

GLBs are binary and inflate the git repo + the Pages download. Keep meshes **low-poly**, always run
the WebP + meshopt optimization, and if the roster grows large, switch to lazy-loading / Git LFS so
mobile page-load stays fast.

## Roster status

| Character | Archetype | Model | Notes |
|---|---|---|---|
| Damia | blueSea | ✅ base + dragoon + weapon | most complete (animation reference) |
| Meru | blueSea | ✅ base + weapon | |
| Haschel | thunder | ✅ base | |
| Lenus | blueSea | ❌ portrait only | next candidate to complete the blueSea trio |
| others | — | ❌ procedural | |
