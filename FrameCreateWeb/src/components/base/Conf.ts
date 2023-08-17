export class Conf {

    public static isWebGPURenderer(): boolean {
        return localStorage.getItem("isWebGPURenderer") != '0'
    }

    public static setIsWebGPURenderer(v: boolean) {
        localStorage.setItem("isWebGPURenderer", v ? '1' : '0')
    }
}