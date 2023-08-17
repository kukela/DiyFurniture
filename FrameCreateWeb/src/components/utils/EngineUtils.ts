import { WebGPUEngine, Engine } from "@babylonjs/core";

export class EngineUtils {
    // 0: 不支持，1：WebGL, 2: WebGPU
    static rendererType = 0

    static async createEngine(cvs: HTMLCanvasElement): Promise<WebGPUEngine | Engine> {
        this.rendererType = 0
        if (await WebGPUEngine.IsSupportedAsync) {
            this.rendererType = 2
            const engine = new WebGPUEngine(cvs, { antialias: true, stencil: true });
            await engine.initAsync();
            return engine;
        }
        this.rendererType = 1
        const engine = new Engine(cvs, true, { stencil: true })
        return engine;
    }

}