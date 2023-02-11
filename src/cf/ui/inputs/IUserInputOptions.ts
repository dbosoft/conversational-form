import { IConversationalForm } from "@/cf/interfaces/IConversationalForm";
import { IUserInput } from "@/cf/interfaces/IUserInput";
import { IBasicElementOptions } from "../BasicElement";

export interface IUserInputOptions extends IBasicElementOptions{
    cfReference: IConversationalForm;
    microphoneInputObj: IUserInput;
}
