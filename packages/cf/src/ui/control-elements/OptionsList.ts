import { CFGlobals } from "../../CFGlobal";
import { IDomTag } from "../../form-tags/ITag";
import { OptionTag } from "../../form-tags/OptionTag";
import { SelectTag } from "../../form-tags/SelectTag";
import { IConversationalForm } from "../../interfaces/IConversationalForm";
import { IEventTarget } from "../../logic/IEventTarget";
import { ControlElementEvents } from "./IControlElement";
import { OptionButton, OptionButtonEvents, IOptionButtonOptions } from "./OptionButton";

export interface IOptionsListOptions {
	context: HTMLElement;
	eventTarget: IEventTarget;
	referenceTag: IDomTag;
	cfReference: IConversationalForm;
}

// class
// builds x OptionsButton from the registered SelectTag
export class OptionsList {

	public elements: Array<OptionButton> = [];
	private eventTarget: IEventTarget;
	private context: HTMLElement;
	private multiChoice: boolean;
	private referenceTag: IDomTag;
	private onOptionButtonClickCallback?: (event: CustomEvent) => void;
	private cfReference: IConversationalForm;

	public get type(): string {
		return "OptionsList";
	}

	constructor(options: IOptionsListOptions) {
		this.context = options.context;
		this.eventTarget = options.eventTarget;
		this.referenceTag = options.referenceTag;
		this.cfReference = options.cfReference;

		// check for multi choice select tag
		this.multiChoice = this.referenceTag.domElement.hasAttribute("multiple");

		this.onOptionButtonClickCallback = this.onOptionButtonClick.bind(this);
		this.eventTarget.addEventListener(OptionButtonEvents.CLICK, this.onOptionButtonClickCallback, false);

		this.createElements();
	}

	public getValue(): Array<OptionButton> {
		let arr: Array<OptionButton> = [];
		for (let i = 0; i < this.elements.length; i++) {
			let element: OptionButton = <OptionButton>this.elements[i];
			if (!this.multiChoice && element.selected) {
				arr.push(element);
				return arr;
			} else if (this.multiChoice && element.selected) {
				arr.push(element);
			}
		}
		return arr;
	}

	private onOptionButtonClick(event: CustomEvent) {
		// if mutiple... then dont remove selection on other buttons
		if (!this.multiChoice) {
			// only one is selectable at the time.

			for (let i = 0; i < this.elements.length; i++) {
				let element: OptionButton = <OptionButton>this.elements[i];
				if (element != event.detail) {
					element.selected = false;
				} else {
					element.selected = true;
				}
			}

			CFGlobals.illustrateFlow(this, "dispatch", ControlElementEvents.SUBMIT_VALUE, this.referenceTag);
			this.eventTarget.dispatchEvent(new CustomEvent(ControlElementEvents.SUBMIT_VALUE, {
				detail: <OptionButton>event.detail
			}));
		} else {
			(<OptionButton>event.detail).selected = !(<OptionButton>event.detail).selected;
		}
	}

	private createElements() {
		this.elements = [];
		var optionTags: Array<OptionTag> = (<SelectTag>this.referenceTag).optionTags;
		for (let i = 0; i < optionTags.length; i++) {
			let tag: OptionTag = optionTags[i];

			const btn: OptionButton = new OptionButton(<IOptionButtonOptions>{
				referenceTag: tag,
				isMultiChoice: (<SelectTag>this.referenceTag).multipleChoice,
				eventTarget: this.eventTarget,
				cfReference: this.cfReference
			});

			this.elements.push(btn);

			this.context.appendChild(btn.el);
		}
	}

	public dealloc() {

		if (this.onOptionButtonClickCallback)
			this.eventTarget.removeEventListener(OptionButtonEvents.CLICK, this.onOptionButtonClickCallback, false);
		this.onOptionButtonClickCallback = undefined;

		while (this.elements.length > 0)
			this.elements.pop()?.dealloc();
		this.elements = [];
	}
}


