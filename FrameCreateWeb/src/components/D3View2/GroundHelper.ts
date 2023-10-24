import {
    Scene, MeshBuilder, Color3, GroundMesh, ArcRotateCamera
} from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials/Grid';
import { MeshUtils } from '../utils/MeshUtils';
import { LUnitType } from "../utils/LUnitUtils";

export class GroundHelper {
    gridMat!: GridMaterial;

    private _tN1: number = 1

    create(size: number = 200, scene: Scene): GroundMesh {
        const ground = MeshBuilder.CreateGround("ground", { width: size, height: size }, scene);
        const gridMaterial = new GridMaterial("GroundMaterial", scene);
        this.gridMat = gridMaterial
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

    changeGridRatio(cam: ArcRotateCamera) {
        const cd = Math.abs(cam.position.z)
        if (cd > 4) {
            this._tN1 = 1
        } else if (cd > 1) {
            this._tN1 = 0.1;
        } else {
            this._tN1 = 0.01;
        }
        if (this._tN1 == this.gridMat.gridRatio) return
        this.gridMat.gridRatio = this._tN1;
    }

    getPosAccUnit(): LUnitType {
        switch (this.gridMat.gridRatio) {
            case 0.01: {
                return LUnitType.MM
            }
            case 0.1: {
                return LUnitType.CM
            }
            default: {
                return LUnitType.DM
            }
        }
    }

    getPosAcc(): number {
        switch (this.gridMat.gridRatio) {
            case 0.01: {
                return 0.001
            }
            case 0.1: {
                return 0.01
            }
            default: {
                return 0.1
            }
        }
    }

}