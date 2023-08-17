<script setup lang="ts">
import { ref, onMounted, markRaw } from 'vue'
import { EngineUtils } from './utils/EngineUtils.ts';
import { D3View, CmdType } from './D3View2/D3View.ts'
import { InputType, CameraControlType } from './D3View2/MyArcRotateCameraInput.ts'
import {
    Menu as IconMenu, Pointer, Plus, Connection, Rank, Aim, Refresh, ZoomIn, FullScreen, Delete
} from '@element-plus/icons-vue'

type stringKey = Record<string, any>

const threeRef = ref()
const mSelDivRef = ref()
var _d3V!: D3View

const topMenu = ref()
const menu = ref({
    isWebGPUAvailable: false,
    isWebGPURenderer: false,
})

const lgbSelectType = ref("sel")
const oldLgbSelectType = ref('sel')
const lbgList = ref([
    {
        list: [
            createLBItem(Pointer, "选择", "sel"), createLBItem(Rank, "移动、旋转", "move_r"), createLBItem(Plus, "添加", "add"),
            createLBItem(Connection, "连接", "conn", true), createLBItem(Delete, "删除", "del", true)
        ]
    },
    {
        list: [
            createLBItem(Aim, "视图焦点", "c_target"),
            createLBItem(Refresh, "视图旋转", "c_rotate"), createLBItem(Rank, "视图平移", "c_move"), createLBItem(ZoomIn, "视图缩放", "c_zoom"),
            createLBItem(FullScreen, "内容居中", "c_cC")
        ]
    }
]);

const bottomMenu = ref({
    info: InputType.type2Title(InputType.None)
})

onMounted(() => {
    _d3V = new D3View(threeRef.value, mSelDivRef.value, (d3V) => {
        if (!d3V) return
        menu.value.isWebGPUAvailable = false
        menu.value.isWebGPURenderer = EngineUtils.rendererType == 2
    });

    var tT = InputType.None
    _d3V.onInputTypeChange = (t) => {
        if (tT == t) return
        switch (tT = t) {
            case InputType.Rotate: {
                lgbSelectType.value = 'c_rotate'
                break;
            }
            case InputType.Zoom: {
                lgbSelectType.value = 'c_zoom'
                break;
            }
            case InputType.Move: {
                lgbSelectType.value = 'c_move'
                break;
            }
            default: {
                lgbSelectType.value = oldLgbSelectType.value
                break
            }
        }
        bottomMenu.value.info = InputType.type2Title(t)
    }

    _d3V.onSelectMeshList = (mList) => {
        changeLgb("del", "isDisabled", mList.length <= 0)
    }

});

function handleSelect(key: string, _keyPath: string[]) {
    console.log(key)
    switch (key) {
        case "": {
            break
        }
    }
}

function leftBarBtnSel(type: string) {
    var isSel = true
    var controlType = CameraControlType.Def
    var cmdType = CmdType.None
    switch (type) {
        case "c_target": {
            controlType = CameraControlType.PTarget
            break
        }
        case "c_rotate": {
            controlType = CameraControlType.Rotate
            break
        }
        case "c_zoom": {
            controlType = CameraControlType.Zoom
            break
        }
        case "c_move": {
            controlType = CameraControlType.Move
            break
        }
        case "c_cC": {
            isSel = false
            _d3V.fullTarget()
            break
        }
        case "move_r": {
            cmdType = CmdType.MoveR
            break
        }
        case "add": {
            cmdType = CmdType.Add
            // controlType = CameraControlType.None
            break
        }
        case "conn": {
            cmdType = CmdType.Conn
            break
        }
        case "del": {
            isSel = false
            _d3V.delSelMesh()
            break
        }
        default: {
            break
        }
    }
    if (isSel) {
        lgbSelectType.value = type
        oldLgbSelectType.value = type
        _d3V.changeCmdType(cmdType)
        _d3V.changeCameraControlType(controlType)
    }
}

function webgpuSwitch(_v: boolean) {
    // _d3V.initRenderer(threeRef.value, v)
    // _d3V.reader(true)
}

function createLBItem(icon: any, tip: string, type: any, isDisabled: boolean = false): stringKey {
    return {
        icon: markRaw(icon),
        tip: tip,
        type: type,
        isDisabled: isDisabled
    }
}

function changeLgb(type: string, key: string, v: any) {
    lbgList.value.forEach((gV, gK) => {
        gV.list.forEach((bD, bK) => {
            if (bD.type != type) return
            lbgList.value[gK].list[bK][key] = v
        });
    });
}

</script>

<template>
    <canvas id="container" ref="threeRef"></canvas>

    <div id="m_sel_div" ref="mSelDivRef"></div>

    <el-menu ref="topMenu" class="top_bar top_menu def_card_bg" mode="horizontal" @select="handleSelect" :ellipsis="false">
        <el-sub-menu index="1" popper-class="def_popper_type">
            <template #title>
                <el-icon>
                    <IconMenu />
                </el-icon>
            </template>
            <el-menu-item index="webgpu"><el-checkbox label="WebGPU" v-model="menu.isWebGPURenderer"
                    :disabled="!menu.isWebGPUAvailable" style="width: 100%;" @change="webgpuSwitch" /></el-menu-item>
            <el-menu-item index="1-2">保存</el-menu-item>
            <el-menu-item index="1-3">新建</el-menu-item>
            <el-sub-menu index="1-4" popper-class="def_popper_type">
                <template #title>打开</template>
                <el-menu-item index="1-4-1">item one</el-menu-item>
                <el-menu-item index="1-4-2">item two</el-menu-item>
                <el-menu-item index="1-4-3">item three</el-menu-item>
            </el-sub-menu>
        </el-sub-menu>
        <el-menu-item index="2">项目名称</el-menu-item>
        <el-sub-menu index="3" popper-class="def_popper_type">
            <template #title>编辑</template>
            <el-menu-item index="3-1">撤销</el-menu-item>
            <el-menu-item index="3-2">恢复</el-menu-item>
        </el-sub-menu>
    </el-menu>

    <div class="left_bar">
        <div class="group_btn def_card_bg" v-for="lbg in lbgList">
            <el-tooltip placement="right" v-for="item in lbg.list" :content="item.tip" :show-after="800">
                <el-button text size="large" :class="lgbSelectType == item.type ? 'is_active' : ''" :icon="item.icon"
                    :disabled="item.isDisabled" @click="leftBarBtnSel(item.type.toString())" />
            </el-tooltip>
        </div>
    </div>

    <div class="bottom_bar">
        <el-text>{{ bottomMenu.info }}</el-text>
    </div>
</template>

<style lang="scss" scoped>
#container {
    outline: none !important;
}

#m_sel_div {
    position: absolute;
    border: 1.5px dashed #e6a23ce6;
    background-color: #0000001a;
    visibility: hidden;
    left: 200px;
    top: 200px;
    width: 200px;
    height: 200px;
}

.def_card_bg {
    background-color: #FAFCFF;
    box-shadow: var(--el-box-shadow-light);
}

.top_bar {
    position: absolute;
    left: 0;
    top: 0;
}

.top_menu {
    height: 2.5rem;

    :deep(.el-sub-menu__title) {
        padding-right: var(--el-menu-base-level-padding) !important;
    }

    :deep(.el-sub-menu .el-sub-menu__icon-arrow) {
        display: none !important;
    }

    :deep(.el-sub-menu__title),
    :deep(.el-menu-item) {
        border-bottom: none !important;
    }

    :deep(.el-sub-menu.is-active .el-sub-menu__title),
    :deep(.el-menu-item.is-active) {
        color: var(--el-menu-color) !important;
    }

}

.left_bar {
    position: absolute;
    left: 0.4rem;
    top: 2.8rem;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .group_btn {
        display: flex;
        flex-direction: column;
        justify-content: center;

        &+.group_btn {
            margin-top: 1rem;
        }

        .el-button {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 0 !important;
            padding: 0 !important;
            background-color: var(--el-menu-hover-color);

            &+.el-button {
                margin-left: 0;
            }

            :deep(.el-icon) {
                color: var(--el-menu-text-color);
            }

            &.is_active,
            &:hover {
                border-left: 0.25rem outset var(--el-menu-active-color);
                background-color: var(--el-color-primary-light-9);
            }

            &.is-disabled {
                border-left: none;

                :deep(.el-icon) {
                    color: var(--el-disabled-text-color);
                }
            }
        }
    }

}

.bottom_bar {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2rem;
    background-color: #FAFCFF;
    display: flex;
    flex-direction: row;
    padding: 0 1rem;
}
</style>
