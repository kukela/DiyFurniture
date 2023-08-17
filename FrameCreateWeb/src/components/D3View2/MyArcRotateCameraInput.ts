import {
    ArcRotateCamera,
    EventState,
    ICameraInput,
    IPointerEvent,
    Nullable, Observer,
    PickingInfo,
    Plane,
    PointerEventTypes,
    PointerInfo,
    Tools,
    Vector3,
    Animation,
    Ray,
    Vector2,
    KeyboardInfo,
    KeyboardEventTypes
} from '@babylonjs/core';
import { EventUtils } from '../utils/EventUtils';

export class MyArcRotateCameraInput implements ICameraInput<ArcRotateCamera> {
    camera!: ArcRotateCamera;

    controlType = CameraControlType.Def
    inputType = InputType.None
    isChange = false
    isAnim = false
    mSelDiv?: HTMLElement

    private _pointerObserver: Nullable<Observer<PointerInfo>> = null;
    private _keyObserver: Nullable<Observer<KeyboardInfo>> = null;

    private _rotateSpeed = 500.0
    private _moveSpeed = 100.0
    private _zoomSpeed = 5.0
    private _zoomWheelSpeed = 0.9025

    private _mSelStartPoint?: Vector2

    private _tmpVector3_1 = Vector3.Zero()
    private _tmpVector3_2 = Vector3.Zero()
    private _tmpVector3_3 = Vector3.Zero()
    private _moveRay?: Ray | null = null;
    private _hitPlane: Plane | null = null;
    private _pickOrigin: Vector3 | null = null

    onChangeListener?: (type: number) => void;
    onStartListener?: (type: number) => void;
    onEndListener?: (type: number) => void;
    onSel?: (pInfo: PickingInfo | null) => void;
    onMSel?: (startPoint: Vector2, endPoint: Vector2) => void;
    onPTarget?: (pInfo: PickingInfo | null) => void;

    getClassName() { return 'MyArcRotateCameraInput' }

    getSimpleName() { return 'my_arc_rotate_camera_input' }

    // 绑定
    attachControl(noPreventDefault?: boolean): void {
        noPreventDefault = Tools.BackCompatCameraNoPreventDefault(arguments)
        const scene = this.camera.getScene()

        this._pointerObserver = scene.onPointerObservable.add((p: PointerInfo, _s: EventState) => {
            if (!noPreventDefault) {
                p.event.preventDefault()
            }
            this._handlePointers(p)
        }, PointerEventTypes.POINTERDOWN | PointerEventTypes.POINTERUP | PointerEventTypes.POINTERMOVE | PointerEventTypes.POINTERWHEEL)

        this._keyObserver = scene.onKeyboardObservable.add((k: KeyboardInfo, _s: EventState) => {
            if (!noPreventDefault) {
                k.event.preventDefault()
            }
            this._handleKeyboard(k)
        }, KeyboardEventTypes.KEYDOWN | KeyboardEventTypes.KEYUP)
    }

    // 注销方法
    detachControl(): void {
        const scene = this.camera.getScene()
        if (this._pointerObserver) {
            scene.onPointerObservable.remove(this._pointerObserver)
            this._pointerObserver = null
        }
        if (this._keyObserver) {
            scene.onKeyboardObservable.remove(this._keyObserver)
            this._keyObserver = null
        }
    }

    changePickingTarget(info: PickingInfo | null, isObjMesh: boolean) {
        if (this.isAnim) return

        const camera = this.camera
        var pickedPoint
        if (isObjMesh) {
            pickedPoint = info?.pickedPoint
        } else {
            const ray = this._moveRay
            const distance = ray?.intersectsPlane(Plane.FromPositionAndNormal(Vector3.Zero(), camera.upVector))
            if (distance) {
                pickedPoint = ray!.direction.scale(distance).addInPlace(ray!.origin);
            }
        }
        if (!pickedPoint) return

        this.isAnim = true
        Animation.CreateAndStartAnimation("cTarget", camera, "target", 60, 20, camera.target, pickedPoint, 0, undefined, () => {
            setTimeout(() => { this.isAnim = false }, 17 * 2);
        })

        // var radius = cD.length()
        // var beta = Math.acos(cD.z / radius)
        // var alpha = Math.PI * 2 - Angle.BetweenTwoPoints(Vector2.Zero(), new Vector2(cD.x, cD.y)).radians()
    }

    private _handlePointers({ type, event, pickInfo }: PointerInfo) {
        switch (type) {
            case PointerEventTypes.POINTERDOWN: {
                if (!EventUtils.isIPointerEvent(event)) return
                const { buttons } = event

                this.inputType = InputType.None
                switch (this.controlType) {
                    case CameraControlType.Def:
                    case CameraControlType.PTarget: {
                        if (buttons == 1) {
                            if (this.controlType == CameraControlType.Def) {
                                this._onSelStart(event)
                            } else {
                                if (this.onPTarget) this.onPTarget(pickInfo)
                            }
                        } else if (buttons == 4) {
                            if (event.shiftKey) {
                                this._onMoveStart(pickInfo)
                            } else if (event.ctrlKey) {
                                this._onZoomStart()
                            } else {
                                this._onRotateStart()
                            }
                        }
                        break
                    }
                    case CameraControlType.Rotate: {
                        if (buttons == 1 || buttons == 4) {
                            this._onRotateStart()
                        }
                        break
                    }
                    case CameraControlType.Move: {
                        if (buttons == 1 || buttons == 4) {
                            this._onMoveStart(pickInfo)
                        }
                        break
                    }
                    case CameraControlType.Zoom: {
                        if (buttons == 1 || buttons == 4) {
                            this._onZoomStart()
                        }
                        break
                    }
                }
                if (this.inputType != InputType.None) {
                    this._onStart()
                }
                break
            }
            case PointerEventTypes.POINTERUP: {
                switch (this.inputType) {
                    case InputType.Sel:
                    case InputType.AddSel:
                    case InputType.SubSel:
                    case InputType.AddSubSel: {
                        var isPI = false
                        if (this._mSelStartPoint) {
                            const eP = new Vector2(event.clientX, event.clientY)
                            isPI = !eP.equals(this._mSelStartPoint)
                            if (isPI && this.onMSel) this.onMSel(this._mSelStartPoint, eP)
                        }
                        if (!isPI && this.onSel) this.onSel(pickInfo)
                        break
                    }
                }
                this.inputType = InputType.None
                this._hitPlane = null
                this._pickOrigin = null
                this._onMSelEnd()
                this._onEnd()
                break
            }
            case PointerEventTypes.POINTERMOVE: {
                if (!EventUtils.isIPointerEvent(event)) return
                this._moveRay = pickInfo?.ray
                switch (this.inputType) {
                    case InputType.Sel:
                    case InputType.AddSel:
                    case InputType.SubSel:
                    case InputType.AddSubSel:
                        this._onMSel(event)
                        break
                    case InputType.Move:
                        this._onMove(pickInfo, event.movementX, event.movementY, this._moveSpeed)
                        break
                    case InputType.Zoom:
                        this._onZoom(pickInfo, event.movementY, this._zoomSpeed)
                        break
                    case InputType.Rotate:
                        this._onRotate(event.movementX, event.movementY, this._rotateSpeed)
                        break
                }
                break
            }
            case PointerEventTypes.POINTERWHEEL: {
                if (!EventUtils.isIWheelEvent(event) || event.deltaY == 0 || event.shiftKey || event.ctrlKey) return
                if (this.inputType != InputType.None) return
                // this._onStart()
                this._onWheelZoom(pickInfo, event.deltaY, this._zoomWheelSpeed)
                // this._onEnd()
                break
            }
        }
    }

    private _handleKeyboard({ type, event }: KeyboardInfo) {
        var it = this.inputType
        switch (it) {
            case InputType.None:
            case InputType.Sel:
            case InputType.AddSel:
            case InputType.AddSubSel:
            case InputType.SubSel:
                break
            default:
                return
        }
        this.inputType = this._event2SelInputType(event.ctrlKey, event.shiftKey)

        switch (type) {
            case KeyboardEventTypes.KEYDOWN: {
                break
            }
            case KeyboardEventTypes.KEYUP: {
                break
            }
        }

        this._onEnd()
    }

    private _onRotateStart() {
        this.inputType = InputType.Rotate
    }

    private _onMoveStart(_pInfo: PickingInfo | null) {
        this.inputType = InputType.Move
        this._updateHitPlane()
        // if (!this._hitPlane) return
        // var ray = _pInfo?.ray
        // const distance = ray?.intersectsPlane(this._hitPlane);
        // if (!distance) return
        // this._pickOrigin = ray!.direction.scale(distance).addInPlace(ray!.origin);
    }

    private _onZoomStart() {
        this.inputType = InputType.Zoom
    }

    private _onSelStart(event: IPointerEvent) {
        var it = this._event2SelInputType(event.ctrlKey, event.shiftKey)
        if (it == InputType.None) {
            it = InputType.Sel
        }
        this.inputType = it
        this._mSelStartPoint = new Vector2(event.clientX, event.clientY)
    }

    private _onRotate(offsetX: number, offsetY: number, speed: number) {
        const { lowerAlphaLimit, upperAlphaLimit, lowerBetaLimit, upperBetaLimit, alpha, beta } = this.camera
        offsetX /= speed
        offsetY /= speed
        var targetAlpha = alpha + offsetX
        var targetBeta = beta - offsetY
        if (lowerAlphaLimit && targetAlpha < lowerAlphaLimit) {
            targetAlpha = lowerAlphaLimit
        }
        if (upperAlphaLimit && targetAlpha > upperAlphaLimit) {
            targetAlpha = upperAlphaLimit
        }
        if (lowerBetaLimit && targetBeta < lowerBetaLimit) {
            targetBeta = lowerBetaLimit
        }
        if (upperBetaLimit && targetBeta > upperBetaLimit) {
            targetBeta = upperBetaLimit
        }
        this.camera.alpha = targetAlpha
        this.camera.beta = targetBeta

        this._onChange()
    }

    private _onMove(pInfo: PickingInfo | null, offsetX: number, offsetY: number, speed: number) {
        const camera = this.camera
        var isRay = false
        if (this._pickOrigin && this._hitPlane) {
            const ray = pInfo?.ray
            let distance = ray?.intersectsPlane(this._hitPlane);
            if (distance) {
                var tP = this._tmpVector3_2
                ray!.direction.scaleToRef(distance, tP)
                tP.addInPlace(ray!.origin).subtractInPlace(this._pickOrigin)
                camera.target.subtractInPlace(tP);
                isRay = true
            }
        }
        if (!isRay) {
            camera.inertialPanningX -= offsetX / speed
            camera.inertialPanningY += offsetY / speed
        }
        this._onChange()
    }

    private _onZoom(pInfo: PickingInfo | null, delta: number, speed: number) {
        delta = delta / speed
        const camera = this.camera
        const ORadius = camera.radius

        camera.radius += delta;
        this._onZoomCameraRadius(pInfo, ORadius)
        this._onChange()
    }

    private _onWheelZoom(pInfo: PickingInfo | null, delta: number, speed: number) {
        const camera = this.camera
        const ORadius = camera.radius

        if (delta < 0) {
            camera.radius *= speed;
        } else {
            camera.radius /= speed;
        }
        this._onZoomCameraRadius(pInfo, ORadius)
        this._updateHitPlane()
        this._onChange()
    }

    private _onZoomCameraRadius(pInfo: PickingInfo | null, oldRadius: number) {
        const camera = this.camera
        const minRadius = 0.3
        if (camera.radius < minRadius) {
            var offsetR = minRadius - camera.radius
            if (offsetR < 0.2) offsetR = 0.2
            camera.radius = minRadius
            const ray = pInfo?.ray
            if (ray) camera.target.subtractInPlace(ray.direction.scale(-offsetR));
            return
        }
        var hitPlane = this._hitPlane
        if (!hitPlane) hitPlane = this._updateHitPlane()
        const ray = pInfo?.ray
        const distance = ray?.intersectsPlane(hitPlane);
        if (distance) {
            const tP = this._tmpVector3_3
            ray!.direction.scaleToRef(distance, tP)
            tP.addInPlace(ray!.origin).subtractInPlace(camera.target)
            tP.scaleInPlace((oldRadius - camera.radius) / oldRadius);
            camera.target.addInPlace(tP);
        }
    }

    private _onMSel(event: IPointerEvent) {
        const sP = this._mSelStartPoint
        const style = this.mSelDiv?.style
        if (!sP || !style) return
        const x = event.clientX
        const y = event.clientY

        const minX = Math.min(sP.x, x)
        const minY = Math.min(sP.y, y)
        const maxX = Math.max(sP.x, x)
        const maxY = Math.max(sP.y, y)

        style.left = minX + "px"
        style.top = minY + "px"
        style.width = maxX - minX + "px"
        style.height = maxY - minY + "px"
        style.visibility = "visible"
    }

    private _onMSelEnd() {
        if (this._mSelStartPoint) {
            this._mSelStartPoint = undefined
            const style = this.mSelDiv?.style
            if (style) style.visibility = "hidden"
        }
    }

    private _updateHitPlane(): Plane {
        const camera = this.camera;
        const tP = this._tmpVector3_1
        camera.target.subtractToRef(camera.position, tP)
        this._hitPlane = Plane.FromPositionAndNormal(camera.target, tP);
        return this._hitPlane
    }

    private _onChange() {
        this.isChange = true
        if (this.onChangeListener) this.onChangeListener(this.inputType)
    }

    private _onStart() {
        if (this.onStartListener) this.onStartListener(this.inputType)
    }

    private _onEnd() {
        if (this.onEndListener) this.onEndListener(this.inputType)
    }

    private _event2SelInputType(isCtrl: boolean, isShift: boolean): number {
        if (isCtrl && isShift) {
            return InputType.SubSel
        } else if (isCtrl) {
            return InputType.AddSel
        } else if (isShift) {
            return InputType.AddSubSel
        } else {
            return InputType.None
        }
    }

}

export enum CameraControlType {
    None = 0,
    Def = 1,
    Rotate = 2,
    Move = 3,
    Zoom = 4,
    PTarget = 5,
}

export class InputType {
    static readonly None = 0
    static readonly Rotate = 1
    static readonly Move = 2
    static readonly Zoom = 3
    static readonly Sel = 4
    static readonly AddSel = 5
    static readonly AddSubSel = 6
    static readonly SubSel = 7

    static type2Title(t: number): string {
        switch (t) {
            case this.Rotate:
                return "旋转"
            case this.Move:
                return "移动"
            case this.Zoom:
                return "缩放"
            case this.Sel:
                return "选择"
            case this.AddSel:
                return "选择（加）"
            case this.AddSubSel:
                return "选择（加减）"
            case this.SubSel:
                return "选择（减）"
            default:
                return "无"
        }
    }
}