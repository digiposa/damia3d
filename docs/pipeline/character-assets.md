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
- **Feet FLAT on the ground** — the character must read as *standing planted*, soles parallel to the
  floor, NOT floating. ⚠️ Image-to-3D tends to generate a "floating" figure with **relaxed, pointed
  toes** (plantarflexed). That pointed-foot pose bakes into the rig's rest pose, so **every**
  animation then shows the character on tiptoe — the clips can't fix it. Show her on a visible
  ground line, flat-footed, in the source sprite.
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

## Shortcut — skin transfer from a same-archetype donor (skip Mixamo entirely)

When a new character shares an archetype with one that is **already rigged** (Shana↔Miranda are both
whiteSilver archers; Damia↔Meru↔Lenus are all blueSea), you can skip steps 4–5 completely: reuse the
donor's skeleton **and** its full clip set, and only move the geometry across. No FBX round-trip, no
Mixamo, no waiting on the user. All of this is Claude-side, offline (`@gltf-transform` + `meshoptimizer`
in a scratchpad; the scripts are ephemeral by the same convention as the rest of the toolchain).

Two flavours, pick by inspecting the target's skin:

1. **Clip graft (cheapest)** — target already carries a **compatible `mixamorig` skeleton**. Just copy
   the donor's animation channels onto it **by node name** (the `merge_char` pattern) — no weight work.
   Only possible when the bone names match.

2. **Skin transfer (what we actually used)** — target is un-rigged or on a *different* skeleton
   (Miranda came from Tripo with no skin; Meru was on a Character-Creator `CC_Base_*` rig, so its bone
   names share nothing with Damia's `mixamorig`). Replace the target's rig with the donor's:
   - normalise both meshes into one frame, then **transfer skin weights by nearest-neighbour** (a
     spatial-hash grid keeps 70–80 k verts fast),
   - keep the donor's skeleton + `inverseBindMatrices` + **all clips**, swap in the target's geometry,
     `JOINTS_0`/`WEIGHTS_0` from the transfer, and the target's texture,
   - finish with the standard WebP + meshopt optimise.

   Aligning the two meshes has two sub-cases:
   - **POSITION-space** (Shana→Miranda): both are clean Tripo T-poses in the **same** orientation, so
     normalise straight off the `POSITION` accessor and map the new mesh into the donor's POSITION space.
   - **World-space bind eval** (Damia→Meru): the bind poses differ in orientation (Meru's mesh was
     authored along Z, Damia along Y) and skeleton, so evaluate each vertex's **bind-pose world**
     position (`Σ wⱼ · worldMatrix(jointⱼ) · IBMⱼ · pos`, via `Node.getWorldMatrix()`), which makes both
     upright and comparable automatically. Match there, then reproject the geometry back into the
     donor's skin space per vertex: `A = Σ w'ⱼ · worldⱼ · IBMⱼ` (the same weighted matrix the donor's
     own skinning uses), so `POSITION_out = A⁻¹ · targetWorld`.

**Where it shines / where it doesn't.** The body (torso, limbs, face) comes out clean and animates on
the donor's full clip set — Miranda was flawless. The failure modes are exactly the two you'd predict:
- **Costume/hair with no dedicated bones** — verts far from any donor vertex get weighted rigidly to the
  nearest body bone, so Meru's dancer skirt and ponytail move in a block (fine at idle/walk, stiff on a
  hard attack). This is the same "fixed humanoid skeleton" limit noted below, just surfaced by proximity.
- **Proportion mismatch** — if the target is a different build than the donor (Meru is smaller than
  Damia), extremities (hands/feet) can stretch. Same-proportion donors (Shana/Miranda) avoid it.

A high `far` ratio in the transfer log (fraction of target verts with no close donor match — ~25 % for
Meru vs ~0 % for Miranda) predicts how much of this you'll see. Always render idle/walk/attack/back in
`pose.html` before committing, and keep the original model as a backup so a bad transfer is a one-file
rollback.

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

## Known limitations & future "beauty pass"

We currently rig on **Mixamo** (free, zero-setup) and accept its weaknesses for now:
- **Crude shoulder/arm weights** — the deltoid flares into a "bell" when arms rest down; Mixamo gives
  no control over bone placement or weight painting.
- **Fixed humanoid skeleton only** — no bones for hair/ponytails, accessories, wings or props, so
  characters like **Meru** can't be rigged fully.
- **Limited animation library** — fine for locomotion/idle, thin for signature/combat moves.

When we do a quality pass, the upgrade path (keep FBX/GLB export so the graft pipeline is unchanged):
- **Rig quality + custom bones** → **Auto-Rig Pro** (Blender addon, paid) — clean shoulders, add
  bones for hair/props, and *Remap* retargets any library onto the rig. Free lighter option:
  **AccuRIG** (Reallusion) — better shoulders/fingers than Mixamo out of the box.
- **Animation choice** → **ActorCore** (paid, quality) or **Truebones** (cheap, many `mixamorig`-
  compatible packs that graft directly onto the current rig).
- **Signature moves (Dragoon Additions, bow attack)** → AI mocap from video: **DeepMotion**,
  **Plask**, **Rokoko Vision**, **Move.ai**; or hand-key with **Cascadeur**.

## Roster status

| Character | Archetype | Model | Notes |
|---|---|---|---|
| Damia | blueSea | ✅ base + dragoon + weapon | most complete (animation reference); skin-transfer donor for blueSea |
| Meru | blueSea | ✅ base + weapon | skin-transferred from Damia (world-space); skirt/ponytail stiff on hard attacks |
| Shana | whiteSilver | ✅ base + weapon | rigged via Mixamo; skin-transfer donor for whiteSilver |
| Miranda | whiteSilver | ✅ base + weapon | skin-transferred from Shana (POSITION-space), reuses Shana's bow/quiver |
| Haschel | thunder | ✅ base | |
| Lenus | blueSea | ❌ portrait only | completes the blueSea trio — skin-transfer from Damia (same as Meru) |
| others | — | ❌ procedural | |
