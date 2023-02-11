import { IConversationalForm } from "../../interfaces/IConversationalForm";
import { IUserInput } from "../../interfaces/IUserInput";
import { IBasicElementOptions } from "../BasicElement";

export interface IUserInputOptions extends IBasicElementOptions {
    cfReference: IConversationalForm;
    microphoneInputObj: IUserInput;
}
