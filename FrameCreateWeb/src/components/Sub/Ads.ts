import { Vector3, Path3D, Plane } from '@babylonjs/core';

export default class Ads {
    /**
    * 吸附路径影响级别
    * 0: 只吸附在路径，1: 主要, 2: 次要, 3: 无效
    */
    priority: number = 0

    /**
     * 类型
     * 0: point, 1: path
     */
    private _type: number = 0

    private _pointList?: Vector3[]
    private _pathList?: Path3D[]

    private _plane?: Plane

    static initWithPointList(pointList: Vector3[], normal: Vector3): Ads {
        let v = new Ads()
        v._pointList = pointList
        v._genPointPlane(normal)
        return v
    }

    static initWithPathList(pathList: Path3D[],): Ads {
        let v = new Ads()
        v._pathList = pathList
        v._genPathPlane()
        return v
    }

    getType(): number {
        return this._type
    }

    getPointList(): Vector3[] {
        if (this._pointList) return this._pointList
        return []
    }

    getPathList(): Path3D[] {
        if (this._pathList) return this._pathList
        return []
    }

    // 点到吸附对象的距离
    signedDistanceTo(point: Vector3): number {
        if (!this._plane) return -1
        return Math.abs(this._plane.signedDistanceTo(point))
    }

    // 法线方向是否相同
    isNormalDirComp(n: Vector3): boolean {
        let pn = this._plane?.normal
        if (pn == null) return false
        let u = 0.00001
        return Math.abs((pn.x - n.x)) < u && Math.abs((pn.y - n.y)) < u && Math.abs(pn.z - n.z) < u
    }

    getPlaneNormal(): Vector3 | undefined {
        return this._plane?.normal.clone()
    }

    private _genPointPlane(normal: Vector3) {
        this._type = 0
        const pList = this.getPointList()
        if (pList.length <= 0) return
        this._plane = Plane.FromPositionAndNormal(pList[0], normal)
    }

    private _genPathPlane() {
        this._type = 1
        const pList = this.getPathList()
        if (pList.length <= 0) return
        const p1 = pList[0]
        this._plane = Plane.FromPositionAndNormal(p1.getPointAt(0), p1.getNormalAt(0))
    }

}