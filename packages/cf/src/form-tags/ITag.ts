import { IEventTarget } from "../logic/IEventTarget";
import { IFlowManager } from "../logic/IFlowManager";
import { IControlElement } from "../ui/control-elements/IControlElement";


export interface IDomTag extends ITag {
    domElement: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement;
}
export interface ITag {
    type: string,
    name?: string,
    id?: string,
    label: string,
    question: string,
    errorMessage: string,
    setTagValueAndIsValid(dto: FlowDTO): boolean;
    dealloc(): void;
    refresh(): void;
    reset(): void;
    value: string | Array<string>;
    inputPlaceholder?: string;
    required: boolean;
    defaultValue?: string | number;
    disabled: boolean;
    skipUserInput: boolean;
    eventTarget: IEventTarget;
    flowManager?: IFlowManager;
    hasConditions(): boolean;
    hasConditionsFor(tagName: string): boolean;
    checkConditionalAndIsValid(): boolean;

    validationCallback?(dto: FlowDTO, success: () => void, error: (optionalErrorMessage?: string) => void): void;
}

export interface IFlowInput {
    getFlowDTO(): FlowDTO;
}

export interface FlowDTO {
    tag?: IDomTag | ITagGroup,
    text?: string;
    errorText?: string;
    input?: IFlowInput,
    controlElements?: Array<IControlElement>;
}


export interface ITagGroupOptions {
    elements: Array<IDomTag>;
    fieldset?: HTMLFieldSetElement;
}

export interface ITagGroup extends ITag {
    elements: Array<IDomTag>;
    activeElements: Array<IDomTag>;
    getGroupTagType: () => string;
    refresh(): void;
    dealloc(): void;
    required: boolean;
    disabled: boolean;
    skipUserInput: boolean;
    flowManager: IFlowManager;
    inputPlaceholder?: string;
}