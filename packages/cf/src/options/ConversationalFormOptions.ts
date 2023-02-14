import { IDictionaryOptions } from "../data/Dictionary";
import { FlowDTO, IDomTag, ITagGroup } from "../form-tags/ITag";
import { IUserInput } from "../interfaces/IUserInput";
import { IEventTarget } from "../logic/IEventTarget";
import { FormOptions } from "./IConversationalFormSettings";


export type CreateOptions = FormOptions & {
    // HTMLFormElement
    form: HTMLFormElement;

    // context (HTMLElement) of where to append the ConversationalForm (see also cf-context attribute)
    context: HTMLElement;

    appearance?: {

        // overwrite the default user words
        user: {
            // base64 || image url // overwrite robot image, without overwritting the robot dictionary
            image?: string;

            dictionary?: IDictionaryOptions;
        },

        robot?: {
            //base64 || image url // overwrite user image, without overwritting the user dictionary
            image?: string;

            // overwrite the default robot Dictionary items
            dictionary?: IDictionaryOptions;
        }

    }

    // custom submit callback if button[type=submit] || form.submit() is not wanted..
    onSubmit?: () => void | HTMLButtonElement;

    // allow for a global validation method, asyncronous, so a value can be validated through a server, call success || error
    onFlowStep?: (dto: FlowDTO, success: () => void, error: () => void) => void;

    // optional, pass in custom tags
    tags?: Array<IDomTag | ITagGroup>;

    // optional event dispatcher, has to be an instance of IEventTarget
    eventDispatcher?: IEventTarget;

    // optional, set microphone input, or in future, add other custom inputs, e.g. VR
    userInput?: IUserInput;

}
