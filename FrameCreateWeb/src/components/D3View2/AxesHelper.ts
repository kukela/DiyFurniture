import {
    Scene, Vector3, MeshBuilder, Color3, LinesMesh
} from '@babylonjs/core';
import { MeshUtils } from '../utils/MeshUtils';

export class AxesHelper {

    create(size: number = 100, scene: Scene): LinesMesh[] {
        // f63652, 77b316, 317acd
        const xColor = Color3.FromHexString("#F41F3D")
        const yColor = Color3.FromHexString("#80CA07")
        const zColor = Color3.FromHexString("#1E79DE")

        const xLine = MeshBuilder.CreateLines("xAxes", { points: [Vector3.Zero(), new Vector3(size, 0, 0)] }, scene);
        xLine.color = xColor

        const yLine = MeshBuilder.CreateLines("yAxes", { points: [Vector3.Zero(), new Vector3(0, size, 0)] }, scene);
        yLine.color = yColor

        const zLine = MeshBuilder.CreateLines("zAxes", { points: [Vector3.Zero(), new Vector3(0, 0, size)] }, scene);
        zLine.color = zColor

        const dO = { points: [Vector3.Zero(), new Vector3(-size, 0, 0)], dashNb: size * 5, dashSize: 1, gapSize: 2 }

        const xDLine = MeshBuilder.CreateDashedLines("xDAxes", dO, scene);
        xDLine.color = xColor

        dO.points[1] = new Vector3(0, -size, 0)
        const yDLine = MeshBuilder.CreateDashedLines("yDAxes", dO, scene);
        yDLine.color = yColor

        dO.points[1] = new Vector3(0, 0, -size)
        const zDLine = MeshBuilder.CreateDashedLines("zDAxes", dO, scene);
        zDLine.color = zColor

        const lineList = [xLine, yLine, zLine, xDLine, yDLine, zDLine]
        lineList.forEach(line => {
            line.isPickable = false
            MeshUtils.freeze(line)
        });
        return lineList
    }

}