import { IConversationalFormSettings } from "../options/IConversationalFormSettings";
import { IUserInterfaceOptions } from "./IUserInterfaceOptions";


export interface IConversationalForm {
    el: HTMLElement;
    uiOptions: IUserInterfaceOptions;
    options: IConversationalFormSettings;
    preventSubmitOnEnter: boolean;

    doSubmitForm(): void;
    removeStepFromChatList(index: number): void;
    addUserChatResponse(response: string): void;
}



