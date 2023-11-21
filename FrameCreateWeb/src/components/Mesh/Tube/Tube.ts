import { Mesh, Vector2, Vector3, Path3D, Quaternion, PickingInfo, Plane } from '@babylonjs/core';
import { LUnitUtils } from '../../utils/LUnitUtils';
import { NullUtils } from '../../utils/NullUtils';
import Ads from '../../Sub/Ads';
import Temp from '../../Sub/Temp';
import { VectorUtils } from '../../utils/VectorUtils';

export default abstract class Tube extends Mesh {
    // config
    shapeW: number = 0.15
    shapeH: number = 0.15
    minLength: number = 0.1
    hInterval: number = 0.01

    shapeCpX: number = 50
    isShapeCpXPercent: boolean = true
    shapeCpY: number = 50
    isShapeCpYPercent: boolean = true

    length: number = this.minLength

    // 吸附辅助相关
    // protected _facetsDeAdsPathIndex?: number[]
    protected _adsList: Ads[] = []

    // 生成形状转mesh
    abstract toShapeMesh(): void

    // 从形状转挤出mesh
    abstract toExtrudedMesh(l: number): void

    // 获取其他保存起来的数据
    protected abstract getOtherSaveJson(): Object

    setConfStr(conf: string) {
        let json: any = {}
        if (conf) {
            try {
                json = JSON.parse(conf)
            } catch (error) {
            }
        }
        this.setConf(json)
    }

    setConf(conf: any) {
        if (conf == null) { conf = {} }
        this.metadata = JSON.stringify(conf)

        let shapeW = LUnitUtils.str2Num(conf.shapeW, null)
        if (shapeW) this.shapeW = shapeW
        let shapeH = LUnitUtils.str2Num(conf.shapeH, null)
        if (shapeH) this.shapeH = shapeH
        let minLength = LUnitUtils.str2Num(conf.minLength, null)
        if (minLength) this.minLength = minLength
        let hInterval = LUnitUtils.str2Num(conf.hInterval, null)
        if (hInterval) this.hInterval = hInterval

        const shapeCpXDoc = LUnitUtils.str2NumOrPercent(conf.shapeCpX)
        if (!shapeCpXDoc) {
            this.shapeCpX = 50
            this.isShapeCpXPercent = true
        } else {
            this.shapeCpX = shapeCpXDoc.v
            this.isShapeCpXPercent = shapeCpXDoc.isPercent
        }
        const shapeCpYDoc = LUnitUtils.str2NumOrPercent(conf.shapeCpY)
        if (!shapeCpYDoc) {
            this.shapeCpY = 50
            this.isShapeCpYPercent = true
        } else {
            this.shapeCpY = shapeCpYDoc.v
            this.isShapeCpYPercent = shapeCpYDoc.isPercent
        }

        this.length = NullUtils.num(conf.length)
        if (this.length < this.minLength) {
            this.length = this.minLength
        }
    }

    conf2Mesh(conf: any) {
        this.setConf(conf)
        this.toExtrudedMesh(this.length)
    }

    // 生成吸附辅助线数据
    genAdsData(): void {
        this.updateFacetData()
        this._adsList = []
        // for (let i = 0; i < this.facetNb; i++) {
        // }
    }

    // 点吸附到辅助线上
    pickAds(pInfo: PickingInfo, point: Vector3, normal: Vector3): { datumPlane: Plane } | null {
        const pickPoint = pInfo.pickedPoint
        if (pickPoint == null) return null

        let v1 = Temp.tV1.copyFrom(pickPoint)
        const p = this.position
        const q = Quaternion.FromEulerVector(this.rotation)
        VectorUtils.v3ROffsetInPlace(v1, p, q)

        let minDis = Number.MAX_VALUE
        let dis = 0
        let adsIndex = -1
        let nN = normal.clone()
        nN.rotateByQuaternionToRef(q.invert(), nN)
        this._adsList.forEach((ads, i) => {
            if (!ads.isNormalDirComp(nN)) return
            dis = ads.signedDistanceTo(v1)
            if (dis < 0) return
            if (dis < minDis) {
                minDis = dis
                adsIndex = i
            }
        });
        if (adsIndex == -1) return null
        let sAds = this._adsList[adsIndex]

        // console.log("-- " + v1)
        let path = sAds.getPathList()[0]
        // console.log("- " + this.name)

        point.copyFrom(path.getPointAt(path.getClosestPositionTo(v1)))
        VectorUtils.v3OffsetInPlace(point, p, q)

        // console.log(this._adsList[0].signedDistanceTo(Temp.tV1))
        // console.log(v1)
        // console.log("----- " + sAds)
        let tn = sAds.getPlaneNormal()!
        tn.rotateByQuaternionToRef(q, tn)

        return { datumPlane: Plane.FromPositionAndNormal(point, tn) }
    }

    getAdsList(): Ads[] {
        return this._adsList
    }

    getSaveJson(): Object {
        return {
            ...{
                id: this.id,
                state: this.state,
                name: this.name,
                position: this.position,
                rotation: this.rotation,
                // shapeCpX: this.shapeCpX,
                // shapeCpY: this.shapeCpY,
                minLength: this.minLength,
            }, ...this.getOtherSaveJson()
        }
    }

    protected _getLength(h: number): number {
        h = Math.round(h / this.hInterval) * this.hInterval
        if (h < this.minLength) { h = this.minLength }
        return h
    }

    protected _getShapeOffset(): { x: number, y: number } {
        let oX = 0
        let oY = 0
        if (this.isShapeCpXPercent) {
            oX -= this.shapeW * this.shapeCpX * 0.01
        } else {
            oX -= this.shapeCpX
        }
        if (this.isShapeCpYPercent) {
            oY -= this.shapeH * this.shapeCpY * 0.01
        } else {
            oY -= this.shapeCpY
        }
        return { x: oX, y: oY }
    }

    protected _genAdsPathList(pointList: Vector2[], normalList: Vector2[]) {
        for (let i = 0; i < pointList.length; i++) {
            const p2 = pointList[i]
            let s = new Vector3(p2.x, 0, p2.y)
            let e = new Vector3(p2.x, -this.length, p2.y)
            const n2 = normalList[i]
            let n = new Vector3(n2.x, 0, n2.y)
            this._adsList.push(Ads.initWithPathList([new Path3D([s, e], n)]))
        }
    }

    protected _genTBAdsPointList(pointList: Vector2[]) {
        let tList: Vector3[] = []
        let bList: Vector3[] = []
        pointList.forEach(p2 => {
            tList.push(new Vector3(p2.x, -this.length, p2.y))
            bList.push(new Vector3(p2.x, 0, p2.y))
        });
        this._adsList.push(Ads.initWithPointList(tList, new Vector3(0, -1, 0)))
        this._adsList.push(Ads.initWithPointList(bList, new Vector3(0, 1, 0)))
    }

}