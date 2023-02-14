import { Dictionary } from "../data/Dictionary";
import { FormOptions } from "../options/FormOptions";


export interface IConversationalForm {
    el: HTMLElement;
    options: FormOptions;
    dictionary: Dictionary;

    doSubmitForm(): void;
    removeStepFromChatList(index: number): void;
    addUserChatResponse(response: string): void;
}



