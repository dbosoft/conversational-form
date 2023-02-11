import { FlowDTO } from "../../form-tags/ITag";
import { IUserInputElement } from "../../interfaces/IUserInputElement";

export interface IUserTextInput extends IUserInputElement {

	active: boolean;
	getInputValue(): string;
}


export interface InputKeyChangeDTO {
	dto: FlowDTO,
	keyCode: number,
	inputFieldActive: boolean
}	