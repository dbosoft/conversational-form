import { ITag } from "../../form-tags/ITag"
import { IBasicElementOptions, IBasicElement } from "../BasicElement"

export interface ControlElementVector {
    height: number,
    width: number,
    x: number,
    y: number,
    centerX?: number,
    centerY?: number,
    el: IControlElement
}

export interface IControlElementOptions extends IBasicElementOptions {
    referenceTag: ITag;
}

export interface IControlElement extends IBasicElement {
    el: HTMLElement;
    referenceTag: ITag;
    type: string;
    value: string;
    positionVector: ControlElementVector;
    tabIndex: number;
    visible: boolean;
    focus: boolean;
    highlight: boolean;
    partOfSeveralChoices: boolean;
    hasImage(): boolean;
    calcPosition(): void;
    dealloc(): void;
}

export const ControlElementEvents = {
    SUBMIT_VALUE: "cf-basic-element-submit",
    PROGRESS_CHANGE: "cf-basic-element-progress", // busy, ready
    ON_FOCUS: "cf-basic-element-on-focus", // busy, ready
    ON_LOADED: "cf-basic-element-on-loaded", // busy, loaded
}

export const ControlElementProgressStates = {
    BUSY: "cf-control-element-progress-BUSY",
    READY: "cf-control-element-progress-READY",
}