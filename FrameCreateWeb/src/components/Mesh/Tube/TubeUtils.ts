import {
    Scene, Plane, PointerInfo, PickingInfo, PointerEventTypes, Vector3, Quaternion, Mesh, Ray, Color4, StandardMaterial
} from "@babylonjs/core";
import { MeshType } from '../../utils/MeshUtils';
import Tube from './Tube';
import Rectangle from './Rectangle';

export default class TubeUtils {
    private _scene!: Scene
    private _groundPlane!: Plane
    private _meshDefNormal = new Vector3(0, -1, 0)

    private _tube: Tube | null = null

    private _datumPlane: Plane | null = null
    private _extrudedPlane: Plane | null = null
    private _extrudedH = 0
    private _tmpVector3_1 = Vector3.Zero()

    onAddMesh?: (m: Mesh) => void

    constructor(scene: Scene) {
        this._scene = scene
        this._groundPlane = Plane.FromPositionAndNormal(Vector3.Zero(), new Vector3(0, 0, 1));
    }

    static type2Tube(_scene: Scene, t: MeshType): Tube {
        var tube: Tube
        switch (t) {
            // case MeshType.TubeEllipse: {
            //     tube = new Rectangle("tube_02")
            //     break
            // }
            default: {
                tube = new Rectangle("tube_01")
                break
            }
        }
        tube.state = t
        return tube
    }

    addMesh(conf: string | null) {
        this._extrudedPlane = null
        this._datumPlane = null
        const tube = TubeUtils.type2Tube(this._scene, MeshType.TubeRectangle)
        tube.setConf(conf)
        tube.toPlaneMesh()
        this._hMesh(tube)
        this._tube = tube
    }

    clearAddMesh() {
        this._extrudedPlane = null
        this._datumPlane = null
        if (this._tube) {
            this._scene.removeMesh(this._tube)
            this._tube = null
        }
    }

    handlePointer({ type, event, pickInfo }: PointerInfo): boolean {
        switch (type) {
            case PointerEventTypes.POINTERDOWN: {
                if (event.buttons != 1) return false
                if (!this._extrudedPlane) {
                    this._datumPlaneMove(pickInfo)
                    this._startPointerExtruded(pickInfo)
                } else {
                    const addJson = this._tube?.metadata
                    this._addExtrudedMesh()
                    this.addMesh(addJson)
                    this._datumPlaneMove(pickInfo)
                }
                return true
            }
            case PointerEventTypes.POINTERMOVE: {
                if (!this._extrudedPlane) {
                    const ray = pickInfo?.ray
                    if (ray) this._datumPlaneMove(this._scene.pickWithRay(ray))
                } else {
                    this._pointerExtruded(pickInfo)
                }
                return true
            }
        }
        return false
    }

    private _datumPlaneMove(pInfo: PickingInfo | null) {
        const tube = this._tube
        const ray = pInfo?.ray
        if (!tube || !ray) return
        const pP = tube.position
        const pickMesh = pInfo.pickedMesh
        const pickPoint = pInfo.pickedPoint
        var datumPlane
        if (pickMesh?.isPickable && pickPoint) {
            pP.copyFrom(pickPoint)
            datumPlane = Plane.FromPositionAndNormal(pickMesh.getFacetPosition(pInfo.faceId), pickMesh.getFacetNormal(pInfo.faceId))
            // console.log(pickMesh.getFacetLocalPartitioning())
            // console.log(pickMesh.getFacetNormal(pInfo.faceId))
        } else {
            const distance = ray?.intersectsPlane(this._groundPlane);
            if (!distance) return
            ray!.direction.scaleToRef(distance, pP)
            pP.addInPlace(ray!.origin)
            datumPlane = this._groundPlane
        }
        this._datumPlane = datumPlane

        // aMesh.alignWithNormal(datumPlane.normal.negate())
        // aMesh.rotation.x -= Math.PI / 2
        const axis = Plane.FromPoints(this._meshDefNormal, datumPlane.normal, Vector3.Zero()).normal
        const angle = Vector3.GetAngleBetweenVectors(this._meshDefNormal, datumPlane.normal, axis)
        tube.rotation = Quaternion.RotationAxis(axis, angle).toEulerAngles()
    }

    private _startPointerExtruded(pInfo: PickingInfo | null) {
        const pP = this._tube?.position
        const datumPlane = this._datumPlane
        const ray = pInfo?.ray
        if (!pP || !datumPlane || !ray) return
        const tP = pP.clone().addInPlace(datumPlane.normal)
        const tRay = Ray.CreateNewFromTo(ray.origin, tP)
        const distance = tRay?.intersectsPlane(datumPlane);
        if (!distance) return
        tRay!.direction.scaleToRef(distance, tP)
        tP.addInPlace(tRay!.origin)
        tP.subtractInPlace(pP)
        this._extrudedPlane = Plane.FromPositionAndNormal(pP, tP);
    }

    private _pointerExtruded(pInfo: PickingInfo | null) {
        const tube = this._tube
        const datumPlane = this._datumPlane
        if (!tube || !datumPlane || !this._extrudedPlane) return
        const ray = pInfo?.ray
        const distance = ray?.intersectsPlane(this._extrudedPlane);
        if (!distance) return
        const tP = this._tmpVector3_1
        ray!.direction.scaleToRef(distance, tP)
        tP.addInPlace(ray!.origin)
        this._extrudedH = datumPlane.signedDistanceTo(tP)
        tube.toExtrudedMesh(this._extrudedH)
        tube.enableEdgesRendering();
    }

    private _addExtrudedMesh() {
        const tube = this._tube
        if (!tube) return
        this._hMesh(tube, false)
        tube.toAddMesh(this._extrudedH)
        this._tube = null
        if (this.onAddMesh) this.onAddMesh(tube)
    }

    private _hMesh(m: Mesh, isH: boolean = true) {
        if (isH) {
            m.edgesColor = Color4.FromHexString("#FFF12C")
            m.edgesWidth = 1;
            // m.edgesShareWithInstances = true;
            var mat = new StandardMaterial(m.name + "Mat", this._scene);
            mat.alpha = 0;
            m.material = mat;
        } else {
            m.edgesWidth = 0;
            m.material = null
        }
        m.isPickable = !isH
        m.enableEdgesRendering();
    }

}