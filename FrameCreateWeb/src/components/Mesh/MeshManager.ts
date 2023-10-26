import {
    Scene, Mesh, PointerInfo
} from '@babylonjs/core';
import TubeUtils from './Tube/TubeUtils';
import { MeshType } from '../utils/MeshUtils';
import Tube from './Tube/Tube';

export class MeshManager {
    private _scene!: Scene
    private _addMeshType: AddMeshType = AddMeshType.None
    private _tubeUtils: TubeUtils | null = null

    onAddMesh?: (m: Mesh) => void

    create(scene: Scene) {
        this._scene = scene
    }

    startAddTubeMesh(json: any) {
        this.initTubeUtils()
        this._addMeshType = AddMeshType.Tube
        this._tubeUtils!.startAddMesh(json)
    }

    clearStartAddMesh() {
        if (this._tubeUtils) {
            this._tubeUtils.clearStartAddMesh()
        }
        // this._addMeshType = AddMeshType.None
    }

    addTestTube(): Tube {
        this.initTubeUtils()
        const json = { length: 2 }
        const tube = this._tubeUtils!.addTube(MeshType.TubeRectangle, json)
        return tube
    }

    handlePointer(pi: PointerInfo): boolean {
        switch (this._addMeshType) {
            case AddMeshType.Tube: return this._tubeUtils?.handlePointer(pi) == true
        }
        return false
    }

    private initTubeUtils() {
        if (this._tubeUtils == null) {
            this._tubeUtils = new TubeUtils(this._scene)
        } else {
            this._tubeUtils.clearStartAddMesh()
        }
        this._tubeUtils.onAddMesh = (m) => { if (this.onAddMesh) this.onAddMesh(m) }
    }

}

export enum AddMeshType {
    None = 0,
    Tube = 1,
}