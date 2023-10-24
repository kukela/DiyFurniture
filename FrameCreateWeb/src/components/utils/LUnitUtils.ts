import { Vector3 } from "@babylonjs/core";

export class LUnitUtils {

    static str2ValueAndUnit(t: string | null): { v: number, unit: LUnitType } | null {
        if (!t) return null
        const uList = [LUnitType.Percent, LUnitType.MM, LUnitType.CM, LUnitType.DM, LUnitType.M]
        t = t.toLowerCase()
        for (let i = 0; i < uList.length; i++) {
            const u = uList[i];
            const vI = t.lastIndexOf(u)
            if (vI <= -1) continue
            let cV = Number(t.substring(0, vI))
            if (isNaN(cV)) cV = 0
            return { v: cV, unit: u }
        }
        return null
    }

    static valueAndUnit2Num(v: number, unit: LUnitType): number {
        switch (unit) {
            case LUnitType.MM: {
                return v / 100.0
            }
            case LUnitType.CM: {
                return v / 10.0
            }
            case LUnitType.DM: {
                return v
            }
            case LUnitType.M: {
                return v * 10.0
            }
            default: {
                return v
            }
        }
    }

    static str2Num(t: string | null, def: number | null): number | null {
        const doc = this.str2ValueAndUnit(t)
        let v = doc?.v
        let unit = doc?.unit
        if (!v || !unit || unit == LUnitType.Percent) {
            return def
        }
        return this.valueAndUnit2Num(v, unit)
    }

    static str2NumOrPercent(t: string | null): { v: number, isPercent: boolean } | null {
        const doc = this.str2ValueAndUnit(t)
        let v = doc?.v
        let unit = doc?.unit
        if (!v || !unit) {
            return null
        }
        if (unit == LUnitType.Percent) {
            return { v: v, isPercent: true }
        }
        return { v: this.valueAndUnit2Num(v, unit), isPercent: false }
    }

    static v32FixedUnit(v: Vector3, unit: LUnitType) {
        let fN = 2
        switch (unit) {
            case LUnitType.MM: {
                fN = 3
                break
            }
            case LUnitType.DM: {
                fN = 1
                break
            }
            case LUnitType.M: {
                fN = 0
                break
            }
        }
        v.set(Number(v.x.toFixed(fN)), Number(v.y.toFixed(fN)), Number(v.z.toFixed(fN)))
    }

    static v32FixedAccPosV(v: Vector3, accPos: number) {
        v.set(this.v2FixedAccPosV(v.x, accPos), this.v2FixedAccPosV(v.y, accPos), this.v2FixedAccPosV(v.z, accPos))
    }

    private static v2FixedAccPosV(v: number, accPos: number): number {
        // let pow = Math.pow(10, (accPos.toString().split('.')[1] || '').length);
        return v = Math.round((v + Number.EPSILON) / accPos) * accPos
    }

}

export enum LUnitType {
    Percent = "%",
    MM = "mm",
    CM = "cm",
    DM = "dm",
    M = "m"
}