import {
    PolygonMeshBuilder, Vector2, VertexData
} from '@babylonjs/core';
import earcut from "earcut";
import Tube from './Tube';

// Tube-Rectangle-20,20
export default class Rectangle extends Tube {
    minHeight: number = 1.01;

    toPlaneMesh() {
        this.toExtrudedMesh(0)
    }

    toExtrudedMesh(h: number) {
        this._getEditVertexData(h).applyToMesh(this, true)
    }

    toAddMesh(h: number) {
        this.toExtrudedMesh(h)
    }

    private _getEditVertexData(h: number): VertexData {
        return this._getEditPolygonMeshBuilder().buildVertexData(this._getHeight(h))
    }

    private _getEditPolygonMeshBuilder(): PolygonMeshBuilder {
        const wr = 0.2 * 0.5
        const hr = 0.2 * 0.5
        const shape = [
            new Vector2(wr, -hr), new Vector2(wr, hr), new Vector2(-wr, hr), new Vector2(-wr, -hr),
        ];
        return new PolygonMeshBuilder("tubeRectanglePMB", shape, this._scene, earcut)
    }

}