export class NullUtils {

    static num(v: any, def: number = 0): number {
        if (isNaN(v)) {
            return def
        }
        return v
    }

}