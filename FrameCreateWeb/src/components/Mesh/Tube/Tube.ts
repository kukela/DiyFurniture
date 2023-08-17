import { Mesh, Vector3 } from '@babylonjs/core';
import { LUnitUtils, LUnitType } from '../../utils/LUnitUtils';

export default abstract class Tube extends Mesh {
    // config
    shapeCpX: number = 50
    shapeCpXUnit: LUnitType = LUnitType.Percent
    shapeCpY: number = 50
    shapeCpYUnit: LUnitType = LUnitType.Percent
    minHeight: number = 1
    minHeightUnit: LUnitType = LUnitType.MM
    // gen
    path: Vector3[] = []

    abstract toPlaneMesh(): void

    abstract toExtrudedMesh(h: number): void

    abstract toAddMesh(h: number): void

    protected _getHeight(h: number): number {
        if (h < this.minHeight) { h = this.minHeight }
        return h
    }

    setConf(conf: string | null) {
        this.metadata = conf
        let json: any = null
        if (conf) {
            try {
                json = JSON.parse(conf)
            } catch (error) {
            }
        }
        const shapeCpXDoc = LUnitUtils.str2ValueAndUnit(json.shapeCpX)
        const shapeCpYDoc = LUnitUtils.str2ValueAndUnit(json.shapeCpY)
        const minHeightDoc = LUnitUtils.str2ValueAndUnit(json.minHeight)
        let shapeCpX = shapeCpXDoc?.v
        let shapeCpXUnit = shapeCpXDoc?.unit
        let shapeCpY = shapeCpYDoc?.v
        let shapeCpYUnit = shapeCpYDoc?.unit
        let minHeight = minHeightDoc?.v
        let minHeightUnit = minHeightDoc?.unit

        if (!shapeCpX || !shapeCpXUnit) {
            this.shapeCpX = 50
            this.shapeCpXUnit = LUnitType.Percent
        } else {
            this.shapeCpX = shapeCpX
            this.shapeCpXUnit = shapeCpXUnit
        }
        if (!shapeCpY || !shapeCpYUnit) {
            this.shapeCpY = 50
            this.shapeCpYUnit = LUnitType.Percent
        } else {
            this.shapeCpY = shapeCpY
            this.shapeCpYUnit = shapeCpYUnit
        }
        if (!minHeight || !minHeightUnit) {
            this.minHeight = 1
            this.minHeightUnit = LUnitType.MM
        } else {
            this.minHeight = minHeight
            this.minHeightUnit = minHeightUnit
        }
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