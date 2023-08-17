import {
    Scene, HighlightLayer, Mesh, Color3
} from '@babylonjs/core';
import { InputType } from './MyArcRotateCameraInput.ts'

export class MyHighlightLayout {
    private _highlightLayout!: HighlightLayer
    private _highlightColor = Color3.FromHexString("#ff9f2c")

    create(scene: Scene) {
        const highlightLayout = new HighlightLayer("hlL", scene, {
            isStroke: true,
            mainTextureRatio: 1,
            blurTextureSizeRatio: 1,
        })
        this._highlightLayout = highlightLayout
        // excludedMeshList.forEach(v => highlightLayout.addExcludedMesh(v));
        return highlightLayout
    }

    addExcludedMeshList(list: Mesh[]) {
        list.forEach(v => this._highlightLayout.addExcludedMesh(v));
    }

    addExcludedMesh(m: Mesh) {
        this._highlightLayout.addExcludedMesh(m)
    }

    sel(t: InputType, oldList: Mesh[], sList: Mesh[] | null): Mesh[] {
        switch (t) {
            case InputType.AddSel: {
                if (sList && sList.length > 0) {
                    oldList = oldList.filter(v => sList.findIndex(it => it.uniqueId == v.uniqueId) < 0).concat(sList)
                }
                break
            }
            case InputType.SubSel: {
                if (sList && sList.length > 0) {
                    oldList = oldList.filter(v => sList.findIndex(it => it.uniqueId == v.uniqueId) < 0)
                }
                break
            }
            case InputType.AddSubSel: {
                if (sList && sList.length > 0) {
                    const addIndexList: number[] = []
                    oldList = oldList.filter((v) => {
                        const isSub = sList.findIndex(it => it.uniqueId == v.uniqueId) < 0
                        if (!isSub) addIndexList.push(v.uniqueId)
                        return isSub
                    })
                    oldList = oldList.concat(sList.filter(v => addIndexList.findIndex(it => it == v.uniqueId) < 0))
                }
                break
            }
            default: {
                oldList = sList ? sList : []
                break
            }
        }

        // const mpList: Mesh[] = []
        // oldList.forEach(m => {
        //     if (!m.parent) return
        //     while (m.parent instanceof Mesh) {
        //         m = m.parent
        //     }
        //     mpList.push(m)
        // });

        // mpList.forEach(mp => {
        //     mp.getChildMeshes().forEach(m => {
        //         if (!(m instanceof Mesh) || oldList.indexOf(m) >= 0) return
        //         oldList.push(m)
        //     });
        // });

        const hL = this._highlightLayout
        hL.removeAllMeshes()
        oldList.forEach(m => {
            hL.addMesh(m, this._highlightColor)
        });

        return oldList
    }

}