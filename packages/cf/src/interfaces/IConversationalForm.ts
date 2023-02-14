import { FormOptions } from "../options/FormOptions";


export interface IConversationalForm {
    el: HTMLElement;
    options: FormOptions;

    doSubmitForm(): void;
    removeStepFromChatList(index: number): void;
    addUserChatResponse(response: string): void;
}



