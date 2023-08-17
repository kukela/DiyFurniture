import {
    Scene, MeshBuilder, Color3, GroundMesh
} from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials/Grid';
import { MeshUtils } from '../utils/MeshUtils';

export class GroundHelper {

    create(size: number = 200, scene: Scene): GroundMesh {
        const ground = MeshBuilder.CreateGround("ground", { width: size, height: size }, scene);
        const gridMaterial = new GridMaterial("GroundMaterial", scene);
        gridMaterial.disableDepthWrite = true
        // gridMaterial.disableLighting = true
        gridMaterial.mainColor = Color3.FromHexString("#82adcd")
        // gridMaterial.gridRatio = 200;
        // gridMaterial.majorUnitFrequency = 0
        // gridMaterial.minorUnitVisibility = 0
        // gridMaterial.disableDepthWrite = true
        gridMaterial.lineColor = Color3.FromHexString("#B8D2E6")
        gridMaterial.majorUnitFrequency = 10;
        gridMaterial.minorUnitVisibility = 0.2;
        gridMaterial.gridRatio = 1;
        gridMaterial.useMaxLine = true;
        ground.material = gridMaterial
        // ground.rotate(Axis.X, Math.PI / 2, Space.WORLD);
        ground.rotation.x = Math.PI / 2
        ground.isPickable = false
        MeshUtils.freeze(ground)
        return ground
    }

}