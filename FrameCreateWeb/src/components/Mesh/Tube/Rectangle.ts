import {
    PolygonMeshBuilder, VertexData
} from '@babylonjs/core';
import earcut from "earcut";
import Tube from './Tube';
import { VectorUtils } from '../../utils/VectorUtils';

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

    genAdsData() {
        super.genAdsData()
        
        const w = this.shapeW
        const h = this.shapeH
        const o = this._getShapeOffset()
        let pointList = VectorUtils.v2List([0, o.y, w + o.x, 0, 0, h + o.y, o.x, 0])
        let normalList = VectorUtils.v2List([0, -1, 1, 0, 0, 1, -1, 0])
        this._genAdsPathList(pointList, normalList)
        this._genTBAdsPointList(VectorUtils.v2List([0, 0]))
        // this._facetsDeArcPathIndex = [-1, -1, -2, -2, 0, 0, 1, 1, 2, 2, 3, 3]
    }

    private _getEditVertexData(l: number): VertexData {
        return this._getEditPolygonMeshBuilder().buildVertexData(this._getLength(l))
    }

    private _getEditPolygonMeshBuilder(): PolygonMeshBuilder {
        const w = this.shapeW
        const h = this.shapeH
        const o = this._getShapeOffset()
        const shape = VectorUtils.v2List([o.x, o.y, w + o.x, o.y, w + o.x, h + o.y, o.x, h + o.y])
        return new PolygonMeshBuilder("tubeRectanglePMB", shape, this._scene, earcut)
    }

}