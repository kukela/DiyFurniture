import { IMouseEvent, IPointerEvent, IWheelEvent } from "@babylonjs/core";

export class EventUtils {

    static isIPointerEvent = (event: IMouseEvent): event is IPointerEvent => 'pointerId' in event

    static isIWheelEvent = (event: IMouseEvent): event is IWheelEvent => 'deltaX' in event

}