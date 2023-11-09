import {
    AbstractMesh, Mesh, Vector3, Vector2, Matrix, Camera, MeshBuilder, Color3, Scene, LinesMesh
} from "@babylonjs/core";
import Tube from "../Mesh/Tube/Tube";

export class MeshUtils {

    static freeze(mesh: AbstractMesh, isMatrix: boolean = true) {
        if (isMatrix) {
            mesh.freezeWorldMatrix()
            mesh.doNotSyncBoundingInfo = true
        }
        mesh.material?.freeze()
        if (mesh instanceof Mesh) {
            mesh.convertToUnIndexedMesh();
        }
    }

    // 在摄像头视图中选择mesh
    static targetInList(sP: Vector2, eP: Vector2, camera: Camera, mList: Mesh[]): Mesh[] {
        const scene = camera.getScene()
        const vp = camera.viewport.toGlobal(
            scene.getEngine().getRenderWidth(), scene.getEngine().getRenderHeight()
        )

        const minX = Math.min(sP.x, eP.x)
        const minY = Math.min(sP.y, eP.y)
        const maxX = Math.max(sP.x, eP.x)
        const maxY = Math.max(sP.y, eP.y)

        return mList.filter((m) => {
            if (m.parent) return false
            const tsP = Vector3.Project(
                m.getAbsolutePosition(), Matrix.IdentityReadOnly, scene.getTransformMatrix(), vp
            )
            return tsP.x >= minX && tsP.x <= maxX && tsP.y >= minY && tsP.y <= maxY
        })
    }

    static isSceneMesh = (mesh?: AbstractMesh | null): mesh is Mesh => {
        const s = mesh?.state
        if (!s) return false
        return s.indexOf(MeshType.Obj) == 0 || s.indexOf(MeshType.Group) == 0
    }

    static isTubeMesh(m: Mesh | null): boolean {
        return m?.state?.indexOf(MeshType.Tube) == 0
    }

    // 计算mesh中心点
    static calcMeshListCenterInPlace(mList: Mesh[], cP: Vector3) {
        cP.setAll(0)
        mList.forEach(m => {
            cP.addInPlace(m.position)
        });
        cP.divideInPlace(Vector3.Zero().setAll(mList.length))
    }

    // 显示mesh所有面的法线
    static showFacetNormals(s: Scene, m: Mesh) {
        m.updateFacetData();
        let positions = m.getFacetLocalPositions();
        let normals = m.getFacetLocalNormals();
        let lines = [];
        for (let i = 0; i < positions.length; i++) {
            let line = [positions[i], positions[i].add(normals[i])];
            lines.push(line);
        }
        this.createMeshLineSystem(s, m, lines).color = Color3.Green();
    }

    // 显示mesh的ads
    static showTubeAllAds(s: Scene, m: Tube) {
        let lines: Vector3[][] = [];
        let nLiens: Vector3[][] = [];
        m.getAdsList().forEach(ads => {
            ads.getPathList().forEach(path => {
                let pathList = path.path
                lines.push(pathList)
                path.getNormals().forEach((n, i) => {
                    let p = pathList[i]
                    let nn = n.multiplyByFloats(0.3, 0.3, 0.3).addInPlace(p)
                    nLiens.push([p, nn])
                });
            });
        });
        this.createMeshLineSystem(s, m, lines).color = Color3.Red();
        this.createMeshLineSystem(s, m, nLiens).color = Color3.Green();
    }

    // 添加线条系统
    static createMeshLineSystem(s: Scene, m: Mesh, lines: Vector3[][]): LinesMesh {
        let lineSystem = MeshBuilder.CreateLineSystem(m.name + "_ls", { lines: lines }, s);
        lineSystem.isPickable = false
        lineSystem.rotation = m.rotation
        lineSystem.position = m.position
        return lineSystem
    }

}

export enum MeshType {
    None = "",
    Obj = "Obj",
    Group = "Group",
    Tube = Obj + "-Tube",
    TubeRectangle = Tube + "-Rectangle",
    TubeEllipse = Tube + "-Ellipse",
    TubeCustom = Tube + "-Custom",
    TubeAluminum = Tube + "-Aluminum",
    TubeAluminumAsYM = Tube + "-AluminumAsYM",
    TubeLean = Tube + "-Lean",
    TubeAngleIron = Tube + "-AngleIron",
}