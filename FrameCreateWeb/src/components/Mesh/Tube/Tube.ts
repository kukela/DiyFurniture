import { Mesh } from '@babylonjs/core';
import { LUnitUtils } from '../../utils/LUnitUtils';
import { NullUtils } from '../../utils/NullUtils';

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

    protected length: number = this.minLength

    // 生成形状转mesh
    abstract toShapeMesh(): void

    // 从形状转挤出mesh
    abstract toExtrudedMesh(l: number): void

    abstract getOtherSaveJson(): Object

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
            oY = -this.shapeH * this.shapeCpY * 0.01
        } else {
            oY -= this.shapeCpY
        }
        return { x: oX, y: oY }
    }

}