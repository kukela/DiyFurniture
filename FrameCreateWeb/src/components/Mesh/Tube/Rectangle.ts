import {
    PolygonMeshBuilder, Vector2, VertexData
} from '@babylonjs/core';
import earcut from "earcut";
import Tube from './Tube';

export default class Rectangle extends Tube {
    minHeight: number = 0.3

    toPlaneMesh() {
        this.toExtrudedMesh(0)
    }

    toExtrudedMesh(h: number) {
        this._getEditVertexData(h).applyToMesh(this, true)
    }

    toAddMesh(h: number) {
        this.toExtrudedMesh(h)
    }

    setConfJson(json: any) {
    }

    private _getEditVertexData(h: number): VertexData {
        return this._getEditPolygonMeshBuilder().buildVertexData(this._getHeight(h))
    }

    private _getEditPolygonMeshBuilder(): PolygonMeshBuilder {
        const w = this.shapeW
        const h = this.shapeH
        let oX = 0
        let oY = 0
        if (this.isShapeCpXPercent) {
            oX -= w * this.shapeCpX * 0.01
        } else {
            oX -= this.shapeCpX
        }
        if (this.isShapeCpYPercent) {
            oY = -h * this.shapeCpY * 0.01
        } else {
            oY -= this.shapeCpY
        }
        const shape = [
            new Vector2(0 + oX, 0 + oY), new Vector2(w + oX, 0 + oY),
            new Vector2(w + oX, h + oY), new Vector2(0 + oX, h + oY)
        ];
        return new PolygonMeshBuilder("tubeRectanglePMB", shape, this._scene, earcut)
    }

}