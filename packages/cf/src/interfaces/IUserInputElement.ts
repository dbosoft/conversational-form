import { FlowDTO, IFlowInput } from "../form-tags/ITag";

// general interface for user input, like the default UserTextInput
export interface IUserInputElement extends IFlowInput{
	dealloc():void;
	onFlowStopped():void;
	setFocusOnInput():void;
	reset():void;
	getFlowDTO():FlowDTO;
	visible:boolean;
	disabled:boolean;
	el: HTMLElement;
}
