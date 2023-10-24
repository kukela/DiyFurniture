import {
    Scene, UtilityLayerRenderer, GizmoManager, Color3, Mesh, MeshBuilder
} from '@babylonjs/core';
import { MeshUtils } from '../utils/MeshUtils';
import { Conf } from '../base/Conf';
import { LUnitUtils } from '../utils/LUnitUtils';

// 位移、旋转、缩放 控制器
export class MyGizmoManager {
    private _gizmoManager!: GizmoManager
    private _isDrag = false
    private _isHover = false
    private _hoverNum = 0

    private _gizmoTMesh!: Mesh
    private _aMeshList: Mesh[] = []

    create(scene: Scene, utilLayer: UtilityLayerRenderer): GizmoManager {
        const gizmoManager = new GizmoManager(scene, 1, utilLayer);
        this._gizmoManager = gizmoManager
        gizmoManager.positionGizmoEnabled = true;
        gizmoManager.rotationGizmoEnabled = true;
        gizmoManager.usePointerToAttachGizmos = false

        const xColor = Color3.FromHexString("#F41F3D")
        const yColor = Color3.FromHexString("#80CA07")
        const zColor = Color3.FromHexString("#1E79DE")

        const posGizom = gizmoManager.gizmos.positionGizmo
        if (posGizom) {
            posGizom.updateGizmoRotationToMatchAttachedMesh = false
            posGizom.xGizmo.coloredMaterial.diffuseColor = xColor
            posGizom.yGizmo.coloredMaterial.diffuseColor = yColor
            posGizom.zGizmo.coloredMaterial.diffuseColor = zColor
            posGizom.planarGizmoEnabled = true
            posGizom.xPlaneGizmo.coloredMaterial.diffuseColor = xColor
            posGizom.yPlaneGizmo.coloredMaterial.diffuseColor = yColor
            posGizom.zPlaneGizmo.coloredMaterial.diffuseColor = zColor

            posGizom.onDragStartObservable.add(() => {
                posGizom.snapDistance = Conf.posAcc
            })

            const gList = [
                posGizom.xGizmo, posGizom.yGizmo, posGizom.zGizmo, posGizom.xPlaneGizmo, posGizom.yPlaneGizmo, posGizom.zPlaneGizmo
            ]
            gList.forEach(g => {
                g.dragBehavior.onDragStartObservable.add(() => {
                    this._isDrag = true
                })
                // g.dragBehavior.onDragObservable.add((ev) => {
                // })
                g.dragBehavior.onDragEndObservable.add(() => {
                    this._isDrag = false
                    this._aMeshList.forEach((m) => {
                        LUnitUtils.v32FixedAccPosV(m.position, Conf.posAcc)
                    });
                })
            });
        }

        const rGizom = gizmoManager.gizmos.rotationGizmo
        if (rGizom) {
            rGizom.xGizmo.coloredMaterial.diffuseColor = xColor
            rGizom.yGizmo.coloredMaterial.diffuseColor = yColor
            rGizom.zGizmo.coloredMaterial.diffuseColor = zColor

            rGizom.snapDistance = Math.PI / 180 * 5

            const gList = [
                rGizom.xGizmo, rGizom.yGizmo, rGizom.zGizmo
            ]
            gList.forEach(g => {
                g.dragBehavior.onDragStartObservable.add(() => {
                    this._isDrag = true
                })
                // g.dragBehavior.onDragObservable.add(() => {
                // })
                g.dragBehavior.onDragEndObservable.add(() => {
                    this._isDrag = false
                })
            });
        }

        const gtMesh = MeshBuilder.CreateDisc("gizmoTMesh", { tessellation: 3 }, scene);
        this._gizmoTMesh = gtMesh
        gtMesh.isVisible = false

        return gizmoManager
    }

    attachToMeshList(mList: Mesh[] | null) {
        const gTM = this._gizmoTMesh
        this._aMeshList.forEach(m => {
            gTM.removeChild(m)
        });
        gTM.rotation.setAll(0)

        var aMesh: Mesh | null = null
        if (mList && mList.length > 0) {
            this._aMeshList = mList
            if (mList.length == 1) {
                aMesh = mList[0]
            } else {
                this._calcGizmoTMesh(mList)
                aMesh = gTM
            }
        } else {
            this._aMeshList = []
        }
        this._gizmoManager.attachToMesh(aMesh)
    }

    isRender(): boolean {
        if (this._isDrag) return true
        const gm = this._gizmoManager
        if (gm.isHovered != this._isHover) {
            this._isHover = gm.isHovered
            return true
        }
        if (!this._isHover) return false
        const posGizom = gm.gizmos.positionGizmo
        const rGizom = gm.gizmos.rotationGizmo
        var hN = 0
        if (posGizom) {
            if (posGizom.xGizmo.isHovered) hN += 1
            if (posGizom.yGizmo.isHovered) hN += 1 << 1
            if (posGizom.zGizmo.isHovered) hN += 1 << 2
            if (posGizom.xPlaneGizmo.isHovered) hN += 1 << 3
            if (posGizom.yPlaneGizmo.isHovered) hN += 1 << 4
            if (posGizom.zPlaneGizmo.isHovered) hN += 1 << 5
        }
        if (rGizom) {
            if (rGizom.xGizmo.isHovered) hN += 1 << 6
            if (rGizom.yGizmo.isHovered) hN += 1 << 7
            if (rGizom.zGizmo.isHovered) hN += 1 << 8
        }
        if (hN != this._hoverNum) {
            this._hoverNum = hN
            return true
        }
        return false
    }

    private _calcGizmoTMesh(mList: Mesh[]) {
        const gTM = this._gizmoTMesh
        MeshUtils.calcMeshListCenterInPlace(mList, gTM.position)
        mList.forEach(m => gTM.addChild(m))
    }

}