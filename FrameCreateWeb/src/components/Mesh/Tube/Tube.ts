import { Mesh, Vector3 } from '@babylonjs/core';
import { LUnitUtils } from '../../utils/LUnitUtils';

export default abstract class Tube extends Mesh {
    // config
    shapeW: number = 0.15
    shapeH: number = 0.15
    minHeight: number = 0.1
    hInterval: number = 0.01

    shapeCpX: number = 50
    isShapeCpXPercent: boolean = true
    shapeCpY: number = 50
    isShapeCpYPercent: boolean = true
    // gen
    path: Vector3[] = []

    abstract toPlaneMesh(): void

    abstract toExtrudedMesh(h: number): void

    abstract toAddMesh(h: number): void

    protected abstract setConfJson(json: any): void

    protected _getHeight(h: number): number {
        h = Math.round(h / this.hInterval) * this.hInterval
        if (h < this.minHeight) { h = this.minHeight }
        return h
    }

    setConf(conf: string | null) {
        this.metadata = conf
        let json: any = {}
        if (conf) {
            try {
                json = JSON.parse(conf)
            } catch (error) {
            }
        }
        let shapeW = LUnitUtils.str2Num(json.shapeW, null)
        if (shapeW) this.shapeW = shapeW
        let shapeH = LUnitUtils.str2Num(json.shapeH, null)
        if (shapeH) this.shapeH = shapeH
        let minHeight = LUnitUtils.str2Num(json.minHeight, null)
        if (minHeight) this.minHeight = minHeight
        let hInterval = LUnitUtils.str2Num(json.hInterval, null)
        if (hInterval) this.hInterval = hInterval

        const shapeCpXDoc = LUnitUtils.str2NumOrPercent(json.shapeCpX)
        if (!shapeCpXDoc) {
            this.shapeCpX = 50
            this.isShapeCpXPercent = true
        } else {
            this.shapeCpX = shapeCpXDoc.v
            this.isShapeCpXPercent = shapeCpXDoc.isPercent
        }
        const shapeCpYDoc = LUnitUtils.str2NumOrPercent(json.shapeCpY)
        if (!shapeCpYDoc) {
            this.shapeCpY = 50
            this.isShapeCpYPercent = true
        } else {
            this.shapeCpY = shapeCpYDoc.v
            this.isShapeCpYPercent = shapeCpYDoc.isPercent
        }

        this.setConfJson(json)
    }

    getSaveJson(): Object {
        var path: number[] = []
        this.path.forEach(v => {
            path.push(v.x)
            path.push(v.y)
            path.push(v.z)
        });
        return {
            id: this.id,
            state: this.state,
            name: this.name,
            position: this.position,
            rotation: this.rotation,
            // shapeCpX: this.shapeCpX,
            // shapeCpY: this.shapeCpY,
            minHeight: this.minHeight,
            path: path,
        }
    }

}