export class LUnitUtils {

    static str2ValueAndUnit(t?: string): { v: number, unit: LUnitType } | null {
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

}

export enum LUnitType {
    Percent = "%",
    MM = "mm",
    CM = "cm",
    DM = "dm",
    M = "m"
}