import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { VertexBuffer } from "@babylonjs/core/Buffers/buffer";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Texture } from "@babylonjs/core/Materials/Textures/texture";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { InstancedMesh } from "@babylonjs/core/Meshes/instancedMesh";
import type { Scene } from "@babylonjs/core/scene";
import "@babylonjs/core/Meshes/instancedMesh";

/**
 * Map kit — mesh helpers shared by every code-built map (the Forest first, Seles and Hellena next):
 * grids from a vertex function, jitter, height-graded vertex colours, merged instance sources,
 * bent limbs (trunks, roots, vines), alpha-tested plant cards, and instance placement.
 */

/** Matte material for the set (the PS1 had no specular to speak of). */
export function matte(name: string, scene: Scene, tex?: Texture, color?: Color3): StandardMaterial {
  const m = new StandardMaterial(name, scene);
  if (tex) m.diffuseTexture = tex;
  if (color) m.diffuseColor = color;
  m.specularColor = Color3.Black();
  return m;
}


/**
 * A grid mesh from a vertex function, rows along v and columns along u. Triangles are wound so
 * the face points towards `facing`.
 */
export function gridMesh(
  name: string,
  scene: Scene,
  rows: number,
  cols: number,
  at: (i: number, j: number) => { x: number; y: number; z: number; tu: number; tv: number },
  facing: Vector3,
): Mesh {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= rows; i++)
    for (let j = 0; j <= cols; j++) {
      const p = at(i, j);
      positions.push(p.x, p.y, p.z);
      uvs.push(p.tu, p.tv);
    }
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) {
      const a = i * (cols + 1) + j;
      const b = a + cols + 1;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  let normals: number[] = [];
  VertexData.ComputeNormals(positions, indices, normals);
  // Wrong way round? Flip every triangle (and the normals with it).
  let dot = 0;
  for (let k = 0; k < normals.length; k += 3) dot += normals[k] * facing.x + normals[k + 1] * facing.y + normals[k + 2] * facing.z;
  if (dot < 0) {
    for (let k = 0; k < indices.length; k += 3) [indices[k + 1], indices[k + 2]] = [indices[k + 2], indices[k + 1]];
    normals = normals.map((n) => -n);
  }
  const vd = new VertexData();
  vd.positions = positions;
  vd.indices = indices;
  vd.uvs = uvs;
  vd.normals = normals;
  const mesh = new Mesh(name, scene);
  vd.applyToMesh(mesh, true);
  return mesh;
}

/** Push every vertex a little, so primitives lose their machine-made regularity. */
export function jitter(mesh: Mesh, amount: number, rand: () => number): void {
  const pos = mesh.getVerticesData(VertexBuffer.PositionKind);
  if (!pos) return;
  // Equal positions must move together or the surface tears: key the offset on the position.
  const moved = new Map<string, [number, number, number]>();
  for (let i = 0; i < pos.length; i += 3) {
    const key = `${pos[i].toFixed(3)},${pos[i + 1].toFixed(3)},${pos[i + 2].toFixed(3)}`;
    let o = moved.get(key);
    if (!o) {
      o = [(rand() - 0.5) * amount, (rand() - 0.5) * amount, (rand() - 0.5) * amount];
      moved.set(key, o);
    }
    pos[i] += o[0];
    pos[i + 1] += o[1];
    pos[i + 2] += o[2];
  }
  mesh.updateVerticesData(VertexBuffer.PositionKind, pos);
}

/**
 * Vertex colours graded by height within the part: shaded underside → sunlit top. That is the read
 * of every bush and crown on the reference screens — dark olive bellies, warm yellow-lit caps.
 * Every part of a merged source needs colours (MergeMeshes keeps only shared vertex kinds), so bark
 * gets a flat `lo = hi`.
 */
export function gradeColors(mesh: Mesh, lo: [number, number, number], hi: [number, number, number]): void {
  const pos = mesh.getVerticesData(VertexBuffer.PositionKind);
  if (!pos) return;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 1; i < pos.length; i += 3) {
    minY = Math.min(minY, pos[i]);
    maxY = Math.max(maxY, pos[i]);
  }
  const span = maxY - minY || 1;
  const c = new Float32Array((pos.length / 3) * 4);
  for (let i = 0, j = 0; i < pos.length; i += 3, j += 4) {
    const t = Math.pow((pos[i + 1] - minY) / span, 1.4);
    c[j] = lo[0] + (hi[0] - lo[0]) * t;
    c[j + 1] = lo[1] + (hi[1] - lo[1]) * t;
    c[j + 2] = lo[2] + (hi[2] - lo[2]) * t;
    c[j + 3] = 1;
  }
  mesh.setVerticesData(VertexBuffer.ColorKind, c, false, 4);
}

export const LEAF_SHADE: [number, number, number] = [0.26, 0.27, 0.2];

export const LEAF_SUN: [number, number, number] = [1.4, 1.28, 0.74];

export const PLAIN: [number, number, number] = [1, 1, 1];

/** Merge parts into one mesh (one sub-mesh per material), flat-shaded, hidden: a source for instances. */
export function mergeSource(name: string, parts: Mesh[], flat = true): Mesh {
  const merged = Mesh.MergeMeshes(parts, true, true, undefined, false, true);
  if (!merged) throw new Error(`forest: could not merge ${name}`);
  merged.name = name;
  if (flat) merged.convertToFlatShadedMesh();
  else merged.createNormals(true); // jittered parts: recompute so the shading follows the lumps
  merged.setEnabled(false);
  return merged;
}

/** Point every normal straight up: foliage cards then light like the ground they grow from,
 *  instead of going black or white depending on which way the card happens to face. */
export function normalsUp(mesh: Mesh): void {
  const n = mesh.getVerticesData(VertexBuffer.NormalKind);
  if (!n) return;
  for (let i = 0; i < n.length; i += 3) {
    n[i] = 0;
    n[i + 1] = 1;
    n[i + 2] = 0;
  }
  mesh.updateVerticesData(VertexBuffer.NormalKind, n);
}

/** Stretch a part's UVs (tubes come out with v in 0…1 over their whole length). */
export function scaleUV(mesh: Mesh, su: number, sv: number): void {
  const uv = mesh.getVerticesData(VertexBuffer.UVKind);
  if (!uv) return;
  for (let i = 0; i < uv.length; i += 2) {
    uv[i] *= su;
    uv[i + 1] *= sv;
  }
  mesh.setVerticesData(VertexBuffer.UVKind, uv);
}

/** A bent, tapering limb along `path`, radius `r0` → `r1` with knotty bulges. */
export function limb(name: string, scene: Scene, path: Vector3[], r0: number, r1: number, rand: () => number): Mesh {
  const knot = rand() * 10;
  const tube = MeshBuilder.CreateTube(
    name,
    {
      path,
      tessellation: 6, // enough for a trunk seen from the iso camera; trees are the scene's bulk
      cap: Mesh.CAP_START,
      radiusFunction: (i, d) => {
        const t = i / (path.length - 1);
        return (r0 + (r1 - r0) * t) * (1 + 0.14 * Math.sin(d * 2.3 + knot));
      },
    },
    scene,
  );
  let len = 0;
  for (let k = 1; k < path.length; k++) len += Vector3.Distance(path[k - 1], path[k]);
  scaleUV(tube, 2, len / 3);
  return tube;
}

/** Crossed alpha-tested cards (three planes at 60°) carrying a painted plant. */
export function cardSource(name: string, scene: Scene, tex: Texture, w: number, h: number): Mesh {
  const mat = matte(`${name}Mat`, scene, tex);
  mat.backFaceCulling = false;
  const parts: Mesh[] = [];
  for (let k = 0; k < 3; k++) {
    const card = MeshBuilder.CreatePlane(`${name}${k}`, { width: w, height: h }, scene);
    card.position.y = h / 2 - 0.02;
    card.rotation.y = (k / 3) * Math.PI;
    card.material = mat;
    parts.push(card);
  }
  const src = mergeSource(name, parts, false);
  normalsUp(src);
  return src;
}

/** Place an instance of `src`, frozen in place. */
export function place(src: Mesh, root: TransformNode, x: number, z: number, scale: number, rotY: number): InstancedMesh {
  const inst = src.createInstance(`${src.name}_${x.toFixed(1)}_${z.toFixed(1)}`);
  inst.parent = root;
  inst.position.set(x, 0, z);
  inst.scaling.setAll(scale);
  inst.rotation.y = rotY;
  return inst;
}
