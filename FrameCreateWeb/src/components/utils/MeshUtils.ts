import {
    AbstractMesh, Mesh, Vector3, Vector2, Matrix, Camera, MeshBuilder, Color3, Scene,
} from "@babylonjs/core";

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

    static calcMeshListCenterInPlace(mList: Mesh[], cP: Vector3) {
        cP.setAll(0)
        mList.forEach(m => {
            cP.addInPlace(m.position)
        });
        cP.divideInPlace(Vector3.Zero().setAll(mList.length))
    }

    static showFacetNormals(s: Scene, m: Mesh) {
        m.updateFacetData();
        var positions = m.getFacetLocalPositions();
        var normals = m.getFacetLocalNormals();
        var lines = [];
        for (var i = 0; i < positions.length; i++) {
            var line = [positions[i], positions[i].add(normals[i])];
            lines.push(line);
        }
        var lineSystem = MeshBuilder.CreateLineSystem("ls", { lines: lines }, s);
        lineSystem.color = Color3.Green();
        lineSystem.isPickable = false
        lineSystem.rotation = m.rotation
        lineSystem.position = m.position
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