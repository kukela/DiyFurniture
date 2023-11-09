import { Vector3, Path3D, Plane } from '@babylonjs/core';

export default class Ads {
    // 0: path数组，1: point数组
    type: number = 0

    private _pathList?: Path3D[]
    private _pointList?: Vector3[]

    private _plane?: Plane

    static initWithPathList(pathList: Path3D[]): Ads {
        let v = new Ads()
        v.type = 0
        v._pathList = pathList
        v._genPathPlane()
        return v
    }

    static initWithPointList(pointList: Vector3[]): Ads {
        let v = new Ads()
        v.type = 1
        v._pointList = pointList
        v._genPointPlane()
        return v
    }

    getPathList(): Path3D[] {
        if (this._pathList) return this._pathList
        return []
    }

    getPointList(): Vector3[] {
        if (this._pointList) return this._pointList
        return []
    }

    // 点到吸附对象的距离
    signedDistanceTo(point: Vector3): number {
        if (!this._plane) return -1
        return this._plane.signedDistanceTo(point)
    }

    getPlaneNormal(): Vector3 | undefined {
        return this._plane?.normal.clone()
    }

    private _genPathPlane() {
        const pList = this.getPathList()
        if (pList.length <= 0) return
        const p1 = pList[0]
        this._plane = Plane.FromPositionAndNormal(p1.getPointAt(0), p1.getNormalAt(0))
    }

    private _genPointPlane() {

    }

}