import {
    Engine, WebGPUEngine, Scene, ArcRotateCamera, Vector3, ICameraInput, DirectionalLight, Mesh, Color4, Color3,
    Vector2
} from '@babylonjs/core';
import { MeshUtils, MeshType } from './../utils/MeshUtils.ts'

export class MySceneManager {
    scene!: Scene;
    camera!: ArcRotateCamera;
    meshList: Mesh[] = []
    selMeshList: Mesh[] = []

    private _cameraLight!: DirectionalLight;

    create(engine: Engine | WebGPUEngine, cvs: HTMLCanvasElement, input: ICameraInput<ArcRotateCamera>): Scene {
        const scene = new Scene(engine);
        this.scene = scene;
        scene.useRightHandedSystem = true
        scene.clearColor = Color4.FromHexString("#F0F7FF")
        scene.fogMode = Scene.FOGMODE_LINEAR;
        scene.fogColor = Color3.FromHexString("#F0F7FF");
        scene.fogEnd = 100;
        scene.fogStart = 30;

        const camera = new ArcRotateCamera(
            "camera",
            (75.0 / 180) * Math.PI, (68.0 / 180) * Math.PI, 18, new Vector3(0, 0, 0),
            scene
        );
        this.camera = camera
        // camera.allowUpsideDown = false
        camera.inputs.clear();
        camera.inputs.add(input)
        camera.panningInertia = 0;
        camera.minZ = 0.001
        camera.mapPanning = false
        camera.attachControl(cvs, false);
        camera.upVector = new Vector3(0, 0, 1)
        camera.attachControl(cvs, true);
        camera.target.set(3, 3, 0)

        const cameraLight = new DirectionalLight("cameraLight", new Vector3(0, 0, -1), scene)
        this._cameraLight = cameraLight
        cameraLight.intensity = 1.25

        return scene
    }

    calcLight() {
        const camera = this.camera
        this._cameraLight.direction.copyFrom(camera.getDirection(camera.upVector.negate()))
    }

    refMeshList() {
        this.meshList = []
        this.scene.meshes.forEach(item => {
            if (MeshUtils.isSceneMesh(item)) this.meshList.push(item)
        });
    }

    addMesh(m: Mesh) {
        m.state = MeshType.Obj
        this.meshList.push(m)
    }

    delSelMesh() {
        const scene = this.scene
        this.selMeshList.forEach(m => scene.removeMesh(m))
        this.selMeshList = []
        this.refMeshList()
    }

    fullTarget() {
        var mList = this.selMeshList.length > 0 ? this.selMeshList : this.meshList
        const camera = this.camera
        if (mList.length == 0) {
            camera.target.set(3, 3, 0)
        } else {
            camera.zoomOn(mList, true)
        }
    }

    region2MeshList(sP: Vector2, eP: Vector2): Mesh[] {
        return MeshUtils.targetInList(sP, eP, this.camera, this.meshList)
    }
}