import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { GridMaterial } from "@babylonjs/materials/grid/gridMaterial";
import type { Scene } from "@babylonjs/core/scene";

/**
 * A flat tiled ground. The grid lines make the isometric tile layout readable,
 * which is exactly what we want while building and debugging movement.
 */
export function createGround(scene: Scene, size = 40): void {
  const ground = MeshBuilder.CreateGround("ground", { width: size, height: size }, scene);

  const grid = new GridMaterial("grid", scene);
  grid.majorUnitFrequency = 5;
  grid.minorUnitVisibility = 0.45;
  grid.gridRatio = 1; // 1 world unit per tile
  grid.mainColor = new Color3(0.09, 0.11, 0.16);
  grid.lineColor = new Color3(0.35, 0.45, 0.6);
  grid.opacity = 0.99;
  ground.material = grid;
}
