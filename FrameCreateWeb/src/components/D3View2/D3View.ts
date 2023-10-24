import {
    WebGPUEngine, Engine, Scene, Mesh, UtilityLayerRenderer, PointerInfo, EventState, PointerEventTypes,
    MeshBuilder, StandardMaterial
} from '@babylonjs/core';
// import { Inspector } from '@babylonjs/inspector';
import { EngineUtils } from '../utils/EngineUtils.ts';
import { MyArcRotateCameraInput, CameraControlType } from './MyArcRotateCameraInput.ts'
import { MySceneManager } from './MySceneManager.ts';
import { GroundHelper } from './GroundHelper.ts'
import { AxesHelper } from './AxesHelper.ts'
import { MyHighlightLayout } from './MyHighlightLayout.ts'
import { MeshUtils, MeshType } from './../utils/MeshUtils.ts'
import { UiSpriteManager } from './UiSpriteManager.ts';
import { MyGizmoManager } from './MyGizmoManager.ts';
import { MeshManager as TubeMeshManager } from '../Mesh/MeshManager.ts';
import { Conf } from '../base/Conf.ts';

export class D3View {
    private _sceneM = new MySceneManager();
    private _groundHelper = new GroundHelper();
    private _axesHelper = new AxesHelper();
    private _hLayout = new MyHighlightLayout();
    private _uiSM = new UiSpriteManager();
    private _mGizomM = new MyGizmoManager();
    private _arcInput = new MyArcRotateCameraInput()
    private _tubeMeshManager = new TubeMeshManager()

    private _cmdType = CmdType.None
    private _isRender = false
    private _isRenderAndLight = true

    onInputTypeChange: (type: number) => void = () => { }
    onSelectMeshList?: (list: Mesh[]) => void

    constructor(cvs: HTMLCanvasElement | null, selDiv: HTMLElement, initBC: (d3V: D3View | null) => void | null) {
        if (cvs == null) return;
        this._arcInput.mSelDiv = selDiv
        EngineUtils.createEngine(cvs).then(engine => {
            this._defScene(engine, cvs);

            initBC && initBC(this);
            this._initTest();

            this._sceneM.refMeshList()

            this._isRenderAndLight = true
            window.addEventListener("resize", () => {
                engine.resize();
                this._isRenderAndLight = true
            });

            // window.addEventListener("keydown", (ev) => {
            //     // Shift+Ctrl+Alt+I
            //     if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
            //         if (this._scene == null) return;
            //         if (this._scene.debugLayer.isVisible()) {
            //             Inspector.Hide();
            //         } else {
            //             Inspector.Show(this._scene, {});
            //         }
            //     }
            // });

        }).catch((err) => {
            console.log("initD3View error: " + err)
            alert("init error: " + err)
            initBC && initBC(null);
        })

    }

    getScene(): Scene {
        return this._sceneM.scene;
    }

    changeCameraControlType(type: CameraControlType) {
        this._arcInput.controlType = type
        this._uiSM.visibleTargetBox(type == CameraControlType.PTarget)
        this._isRender = true
    }

    fullTarget() {
        this._sceneM.fullTarget()
        this._isRenderAndLight = true
    }

    changeCmdType(t: CmdType) {
        if (this._cmdType == t) return
        switch (this._cmdType) {
            case CmdType.MoveR: {
                this._mGizomM.attachToMeshList(null)
                break
            }
            case CmdType.Add: {
                this._tubeMeshManager.clearAddMesh()
                break
            }
        }
        this._cmdType = t
        switch (t) {
            case CmdType.MoveR: {
                this._gizomSelMesh();
                break
            }
            case CmdType.Add: {
                this._tubeMeshManager.addTubeMesh(null)
                break
            }
        }
        this._isRender = true
    }

    addMesh(m: Mesh) {
        this._sceneM.addMesh(m)
    }

    delSelMesh() {
        this._sceneM.delSelMesh()
        this._selMeshList(null)
        this._isRenderAndLight = true
    }

    private _defScene(engine: Engine | WebGPUEngine, cvs: HTMLCanvasElement) {
        const arcInput = this._arcInput
        const sceneM = this._sceneM
        const scene = sceneM.create(engine, cvs, arcInput)

        const ground = this._groundHelper.create(200, scene)
        const lineMeshList = this._axesHelper.create(100, scene)

        const hLayout = this._hLayout
        hLayout.create(scene)
        hLayout.addExcludedMesh(ground)
        hLayout.addExcludedMeshList(lineMeshList)

        const uiSM = this._uiSM
        uiSM.create(scene)

        const utilLayer = new UtilityLayerRenderer(scene);

        const mGM = this._mGizomM
        mGM.create(scene, utilLayer)

        const tmM = this._tubeMeshManager
        tmM.create(scene)
        tmM.onAddMesh = (m: Mesh) => {
            this.addMesh(m)
            // MeshUtils.showFacetNormals(scene, m)
        }

        var rType = 0
        engine.runRenderLoop(() => {
            rType = 0
            if (arcInput.isAnim || arcInput.isChange || mGM.isRender() || this._isRenderAndLight) {
                arcInput.isChange = false
                this._isRenderAndLight = false
                rType = 1
            } else if (this._isRender) {
                this._isRender = false
                rType = 2
            }
            switch (rType) {
                case 1: {
                    this._reader(true)
                    break
                }
                case 2: {
                    this._reader(false)
                    break
                }
            }
        });

        arcInput.onChangeListener = (type) => {
            this.onInputTypeChange(type)
        }

        arcInput.onStartListener = (_type) => {
            uiSM.visibleTargetBox(true)
        }

        arcInput.onEndListener = (type) => {
            if (arcInput.controlType != CameraControlType.PTarget) {
                uiSM.visibleTargetBox(false)
            }
            this._isRender = true
            this.onInputTypeChange(type)
        }

        arcInput.onSel = (info) => {
            switch (this._cmdType) {
                case CmdType.None:
                case CmdType.MoveR:
                    break
                default:
                    return
            }
            const mesh = info?.pickedMesh
            if (MeshUtils.isSceneMesh(mesh)) {
                this._selMeshList([mesh])
            } else {
                this._selMeshList(null)
            }
            //测试
            console.log("" + mesh?.position)
        }

        arcInput.onMSel = (sP, eP) => {
            switch (this._cmdType) {
                case CmdType.None:
                case CmdType.MoveR:
                    break
                default:
                    return
            }
            this._selMeshList(sceneM.region2MeshList(sP, eP))
        }

        arcInput.onPTarget = (info) => {
            arcInput.changePickingTarget(info, MeshUtils.isSceneMesh(info?.pickedMesh))
        }

        scene.onPointerObservable.add((p: PointerInfo, _s: EventState) => {
            switch (this._cmdType) {
                case CmdType.Add: {
                    this._isRender = this._tubeMeshManager.handlePointer(p)
                    break
                }
                default: {
                    break
                }
            }
        }, PointerEventTypes.POINTERDOWN | PointerEventTypes.POINTERUP | PointerEventTypes.POINTERMOVE)
    }

    private _reader(isCalcLight: Boolean) {
        const sM = this._sceneM
        const cam = sM.camera
        if (isCalcLight) sM.calcLight()
        this._uiSM.changeTargetBox(cam)
        this._groundHelper.changeGridRatio(cam)
        Conf.posAcc = this._groundHelper.getPosAcc()
        sM.scene.render();
    }

    private _selMeshList(sList: Mesh[] | null) {
        const sM = this._sceneM
        sM.selMeshList = this._hLayout.sel(this._arcInput.inputType, sM.selMeshList, sList)
        switch (this._cmdType) {
            case CmdType.MoveR: {
                this._gizomSelMesh()
                break
            }
        }
        if (this.onSelectMeshList) this.onSelectMeshList(sM.selMeshList)
    }

    private _gizomSelMesh() {
        this._mGizomM.attachToMeshList(this._sceneM.selMeshList)
    }

    private _initTest() {
        const scene = this._sceneM.scene

        const oct = MeshBuilder.CreatePolyhedron("oct", { size: 0.5, type: 3 }, scene)
        // const oct = MeshBuilder.CreateCylinder("oct", { height: 3, diameterTop: 1, diameterBottom: 1, tessellation: 6 }, scene)
        oct.rotation.x = Math.PI / 2
        oct.state = MeshType.Obj
        MeshUtils.showFacetNormals(scene, oct)

        const box = MeshBuilder.CreateBox("box", { size: 0.1 }, scene);
        // const sM = new StandardMaterial("boxS", scene)
        // box.material = sM
        box.state = MeshType.Obj
        box.position.set(2, 0, 0)

        // const gm = 3
        // for (var i = 0; i < 10 * gm; i++) {
        //     const boxC = box.clone("box" + i, null, true)
        //     boxC.position.set((Math.random() * 20 - 10) * gm, (Math.random() * 20 - 10) * gm, 0)
        // }
    }

}

export enum CmdType {
    None = 0,
    MoveR = 1,
    Add = 2,
    Conn = 3
}