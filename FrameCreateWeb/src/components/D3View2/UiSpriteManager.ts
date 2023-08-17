import {
    Scene, SpriteManager, Sprite, ArcRotateCamera
} from '@babylonjs/core';
import cTargetTx from './../../assets/textures/ic_camera_target.png'

export class UiSpriteManager {
    private _targetBox!: Sprite

    create(scene: Scene) {
        const sm = new SpriteManager("uiSpriteManager", cTargetTx, 10, { width: 32, height: 32 }, scene);

        const targetBox = new Sprite("tree", sm);
        this._targetBox = targetBox;
        this.visibleTargetBox(false)
    }

    changeTargetBox(camera: ArcRotateCamera) {
        const tBox = this._targetBox
        if (!tBox.isVisible) return
        tBox.position.copyFrom(camera.target)
        tBox.width = 0.017 * camera.radius
        tBox.height = tBox.width
    }

    visibleTargetBox(isVisible: boolean) {
        this._targetBox.isVisible = isVisible
    }

}