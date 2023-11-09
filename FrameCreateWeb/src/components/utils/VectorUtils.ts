import { Vector2, Vector3, Quaternion } from "@babylonjs/core";

export class VectorUtils {

    static v2List(n2VList: number[]): Vector2[] {
        let vList: Vector2[] = []
        for (let i = 0; i < n2VList.length; i += 2) {
            if (i + 1 >= n2VList.length) continue
            vList.push(new Vector2(n2VList[i], n2VList[i + 1]))
        }
        return vList
    }

    static v3List(n3VList: number[]): Vector3[] {
        let vList: Vector3[] = []
        for (let i = 0; i < n3VList.length; i += 3) {
            if (i + 2 >= n3VList.length) continue
            vList.push(new Vector3(n3VList[i], n3VList[i + 1], n3VList[i + 2]))
        }
        return vList
    }

    // v3偏移
    static v3OffsetInPlace(o: Vector3, position: Vector3, q: Quaternion): Vector3 {
        o.addInPlace(position)
        o.rotateByQuaternionAroundPointToRef(q, position, o)
        return o
    }

    // v3逆向偏移
    static v3ROffsetInPlace(o: Vector3, position: Vector3, q: Quaternion): Vector3 {
        o.rotateByQuaternionAroundPointToRef(q.invert(), position, o)
        o.subtractInPlace(position)
        return o
    }

}