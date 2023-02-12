import { FlowDTO, IDomTag, ITag, ITagGroup } from "../form-tags/ITag";
import { IUserInput } from "../interfaces/IUserInput";
import { IUserInterfaceOptions } from "../interfaces/IUserInterfaceOptions";
import { EventDispatcher } from "../logic/EventDispatcher";
import { IConversationalFormSettings } from "./IConversationalFormSettings";


export interface ConversationalFormOptions extends IConversationalFormSettings {
    // HTMLFormElement
    formEl: HTMLFormElement;

    // context (HTMLElement) of where to append the ConversationalForm (see also cf-context attribute)
    context?: HTMLElement;

    // pass in custom tags (when prevent the auto-instantiation of ConversationalForm)
    tags?: Array<IDomTag | ITagGroup>;

    // overwrite the default user Dictionary items
    dictionaryData?: Object;

    // overwrite the default robot Dictionary items
    dictionaryRobot?: Object;

    // custom submit callback if button[type=submit] || form.submit() is not wanted..
    submitCallback?: () => void | HTMLButtonElement;


    // allow for a global validation method, asyncronous, so a value can be validated through a server, call success || error
    flowStepCallback?: (dto: FlowDTO, success: () => void, error: () => void) => void;

    // optional event dispatcher, has to be an instance of cf.EventDispatcher
    eventDispatcher?: EventDispatcher;

    // optional, set microphone nput, future, add other custom inputs, ex. VR
    microphoneInput?: IUserInput;

    // optional, hide ÜserInputField when radio, checkbox, select input is active
    hideUserInputOnNoneTextInput?: boolean;

    // optional, parameters for the User Interface of Conversational Form, set here to show thinking dots or not, set delay time in-between robot responses
    userInterfaceOptions?: IUserInterfaceOptions;


}

// CUI formless options
export interface ConversationalFormlessOptions {
    options: any;
    tags: any;
}