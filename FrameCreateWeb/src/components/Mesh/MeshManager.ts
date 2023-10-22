import {
    Scene, Mesh, Vector3, PointerInfo
} from '@babylonjs/core';
import TubeUtils from './Tube/TubeUtils';
import { LUnitType } from "../utils/LUnitUtils";

export class MeshManager {
    private _scene!: Scene
    private _addMeshType: AddMeshType = AddMeshType.None
    private _tubeUtils: TubeUtils | null = null

    onAddMesh?: (m: Mesh) => void

    create(scene: Scene) {
        this._scene = scene
    }

    addTubeMesh(json: string | null) {
        this._addMeshType = AddMeshType.Tube
        const u = new TubeUtils(this._scene)
        u.addMesh(json)
        u.onAddMesh = (m) => { if (this.onAddMesh) this.onAddMesh(m) }
        this._tubeUtils = u
    }

    clearAddMesh() {
        if (this._tubeUtils) {
            this._tubeUtils.clearAddMesh()
            this._tubeUtils = null
        }
        this._addMeshType = AddMeshType.None
    }

    handlePointer(pi: PointerInfo): boolean {
        switch (this._addMeshType) {
            case AddMeshType.Tube: return this._tubeUtils?.handlePointer(pi) == true
        }
        return false
    }

    changeAllPosAccUnit(ut: LUnitType) {
        if (this._tubeUtils) {
            this._tubeUtils.posAccUnit = ut
        }
    }

}

export enum AddMeshType {
    None = 0,
    Tube = 1,
}