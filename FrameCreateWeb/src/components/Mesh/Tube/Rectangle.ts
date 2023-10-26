import {
    PolygonMeshBuilder, Vector2, VertexData
} from '@babylonjs/core';
import earcut from "earcut";
import Tube from './Tube';

export default class Rectangle extends Tube {
    minLength: number = 0.3

    toShapeMesh() {
        this.toExtrudedMesh(0)
    }

    toExtrudedMesh(l: number) {
        this._getEditVertexData(l).applyToMesh(this, true)
    }

    getOtherSaveJson(): Object {
        return {}
    }

    private _getEditVertexData(h: number): VertexData {
        return this._getEditPolygonMeshBuilder().buildVertexData(this._getLength(h))
    }

    private _getEditPolygonMeshBuilder(): PolygonMeshBuilder {
        const w = this.shapeW
        const h = this.shapeH
        const o = this._getShapeOffset()
        const shape = [
            new Vector2(0 + o.x, 0 + o.y), new Vector2(w + o.x, 0 + o.y),
            new Vector2(w + o.x, h + o.y), new Vector2(0 + o.x, h + o.y)
        ];
        return new PolygonMeshBuilder("tubeRectanglePMB", shape, this._scene, earcut)
    }

}