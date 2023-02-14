import { FormOptions } from "../options/IConversationalFormSettings";


export interface IConversationalForm {
    el: HTMLElement;
    options: FormOptions;

    doSubmitForm(): void;
    removeStepFromChatList(index: number): void;
    addUserChatResponse(response: string): void;
}



