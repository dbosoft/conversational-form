import { EventDispatcher } from "../logic/EventDispatcher";
import { IFlowManager } from "../logic/IFlowManager";
import { IControlElement } from "../ui/control-elements/IControlElement";

export interface ITag{
    domElement?: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement,
    type: string,
    name: string,
    id: string,
    label: string,
    question: string,
    errorMessage: string,
    setTagValueAndIsValid(dto: FlowDTO): boolean;
    dealloc(): void;
    refresh(): void;
    reset(): void;
    value:string | Array <string>;
    inputPlaceholder?: string;
    required: boolean;
    defaultValue: string | number;
    disabled: boolean;
    skipUserInput: boolean;
    eventTarget: EventDispatcher;
    flowManager: IFlowManager;
    hasConditions():boolean;
    hasConditionsFor(tagName: string):boolean;
    checkConditionalAndIsValid():boolean;

    validationCallback?(dto: FlowDTO, success: () => void, error: (optionalErrorMessage?: string) => void): void;
}

export interface IFlowInput
{
    getFlowDTO(): FlowDTO;
}

export interface FlowDTO {
    tag?: ITag | ITagGroup,
    text?: string;
    errorText?: string;
    input?: IFlowInput,
    controlElements?: Array <IControlElement>;
}


export interface ITagGroupOptions{
    elements: Array <ITag>;
    fieldset?: HTMLFieldSetElement;
}

export interface ITagGroup extends ITag{
    elements: Array <ITag>;
    activeElements: Array <ITag>;
    getGroupTagType: () => string;
    refresh():void;
    dealloc():void;
    required: boolean;
    disabled: boolean;
    skipUserInput: boolean;
    flowManager: IFlowManager;
    inputPlaceholder?: string;
}