import {
    Scene, Vector3, MeshBuilder, Color3,
} from '@babylonjs/core';

export class GridHelper {

    create(size: number = 100, scene: Scene) {
        const mainColor = Color3.FromHexString("#2A5E85")
        const auxColor = Color3.FromHexString("#B8D2E6")

        const gridUnit = 1
        const mainCount = 10
        const halfSize = size / 2.0;

        const mainLines = [];
        const auxLines = [];
        for (let i = 0, k = 0; i <= halfSize; i += gridUnit, k++) {
            if (i == 0) continue
            const l1 = [new Vector3(-halfSize, i, 0), new Vector3(halfSize, i, 0)]
            const l2 = [new Vector3(-halfSize, -i, 0), new Vector3(halfSize, -i, 0)]
            const l3 = [new Vector3(i, -halfSize, 0), new Vector3(i, halfSize, 0)]
            const l4 = [new Vector3(-i, -halfSize, 0), new Vector3(-i, halfSize, 0)]
            if (k % mainCount == 0) { // main
                mainLines.push(l1, l2, l3, l4)
            } else { // aux
                auxLines.push(l1, l2, l3, l4)
            }
        }

        const mainGrid = MeshBuilder.CreateLineSystem("mianGrid", { lines: mainLines }, scene);
        mainGrid.color = mainColor

        const auxGrid = MeshBuilder.CreateLineSystem("mianGrid", { lines: auxLines }, scene);
        auxGrid.color = auxColor

    }

}