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

}

export enum LUnitType {
    Percent = "%",
    MM = "mm",
    CM = "cm",
    DM = "dm",
    M = "m"
}