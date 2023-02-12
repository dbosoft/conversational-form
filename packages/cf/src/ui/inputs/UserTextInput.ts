import { CFGlobals } from "../../CFGlobal";
import { Dictionary } from "../../data/Dictionary";
import { InputTag } from "../../form-tags/InputTag";
import { FlowDTO, IDomTag, ITag, ITagGroup } from "../../form-tags/ITag";
import { SelectTag } from "../../form-tags/SelectTag";
import { TagEvents } from "../../form-tags/Tag";
import { IUserInput } from "../../interfaces/IUserInput";
import { ControlElements } from "../control-elements/ControlElements";
import { ControlElementEvents, ControlElementProgressStates, IControlElement } from "../control-elements/IControlElement";
import { UploadFileUI } from "../control-elements/UploadFileUI";
import { IUserInputOptions } from "./IUserInputOptions";
import { InputKeyChangeDTO, IUserTextInput } from "./IUserTextInput";
import { UserInputElement } from "./UserInputElement";
import { UserInputEvents } from "./UserInputEvents";
import { UserInputSubmitButton, UserInputSubmitButtonEvents } from "./UserInputSubmitButton";



// class
export class UserTextInput extends UserInputElement implements IUserTextInput {
	private inputElement: HTMLInputElement | HTMLTextAreaElement;
	private submitButton: UserInputSubmitButton;

	private onControlElementSubmitCallback?: (event: CustomEvent) => void;
	private onSubmitButtonChangeStateCallback?: (event: CustomEvent) => void;
	private onInputFocusCallback?: (event: Event) => void;
	private onInputBlurCallback?: (event: Event) => void;
	private onOriginalTagChangedCallback?: (event: CustomEvent) => void;
	private onControlElementProgressChangeCallback?: (event: CustomEvent) => void;
	private errorTimer?: ReturnType<typeof setTimeout>;
	private initialInputHeight: number = 0;
	private shiftIsDown: boolean = false;
	private keyUpCallback?: (event: Event) => void;
	private keyDownCallback?: (event: Event) => void;


	protected microphoneObj?: IUserInput;

	private controlElements: ControlElements;

	//acts as a fallback for ex. shadow dom implementation
	private _active: boolean = false;
	public get active(): boolean {
		return this.inputElement === document.activeElement || this._active;
	}

	public set disabled(value: boolean) {
		const hasChanged: boolean = this._disabled != value;
		if (!CFGlobals.suppressLog) console.log('option hasChanged', value);

		if (hasChanged) {
			this._disabled = value;
			if (value) {
				this.el.setAttribute("disabled", "disabled");
				this.inputElement.blur();
			} else {
				this.setFocusOnInput();
				this.el.removeAttribute("disabled");
			}
		}
	}

	constructor(options: IUserInputOptions) {
		super(options);

		this.cfReference = options.cfReference;
		this.eventTarget = options.eventTarget;
		this.inputElement = this.el.getElementsByTagName("textarea")[0];

		this.onInputFocusCallback = this.onInputFocus.bind(this);
		this.onInputBlurCallback = this.onInputBlur.bind(this);
		this.inputElement.addEventListener('focus', this.onInputFocusCallback, false);
		this.inputElement.addEventListener('blur', this.onInputBlurCallback, false);

		if (!CFGlobals.animationsEnabled) {
			this.inputElement.setAttribute('no-animations', '');
		}

		//<cf-input-control-elements> is defined in the ChatList.ts
		this.controlElements = new ControlElements({
			el: <HTMLElement>this.el.getElementsByTagName("cf-input-control-elements")[0],
			cfReference: this.cfReference,
			infoEl: <HTMLElement>this.el.getElementsByTagName("cf-info")[0],
			eventTarget: this.eventTarget
		});

		// setup event listeners

		this.keyUpCallback = this.onKeyUp.bind(this);
		document.addEventListener("keyup", this.keyUpCallback, false);

		this.keyDownCallback = this.onKeyDown.bind(this);
		document.addEventListener("keydown", this.keyDownCallback, false);

		this.onOriginalTagChangedCallback = this.onOriginalTagChanged.bind(this);
		this.eventTarget.addEventListener(TagEvents.ORIGINAL_ELEMENT_CHANGED, this.onOriginalTagChangedCallback, false);

		this.onControlElementSubmitCallback = this.onControlElementSubmit.bind(this);
		this.eventTarget.addEventListener(ControlElementEvents.SUBMIT_VALUE, this.onControlElementSubmitCallback, false);

		this.onControlElementProgressChangeCallback = this.onControlElementProgressChange.bind(this);
		this.eventTarget.addEventListener(ControlElementEvents.PROGRESS_CHANGE, this.onControlElementProgressChangeCallback, false);

		this.onSubmitButtonChangeStateCallback = this.onSubmitButtonChangeState.bind(this);
		this.eventTarget.addEventListener(UserInputSubmitButtonEvents.CHANGE, this.onSubmitButtonChangeStateCallback, false);

		// this.eventTarget.addEventListener(ControlElementsEvents.ON_RESIZE, () => {}, false);

		this.submitButton = new UserInputSubmitButton({
			eventTarget: this.eventTarget
		});

		this.el.querySelector('div')?.appendChild(this.submitButton.el);

		// setup microphone support, audio
		if (options.microphoneInputObj) {
			this.microphoneObj = options.microphoneInputObj;
			if (this.microphoneObj && this.microphoneObj.init) {
				// init if init method is defined
				this.microphoneObj.init();
			}

			this.submitButton.addMicrophone(this.microphoneObj);
		}
	}

	public getInputValue(): string {
		const str: string = this.inputElement.value;

		// Build-in way to handle XSS issues ->
		const div = document.createElement('div');
		div.appendChild(document.createTextNode(str));
		return div.innerHTML;
	}

	public getFlowDTO(): FlowDTO {
		let value: FlowDTO;// = this.inputElement.value;

		// check for values on control elements as they should overwrite the input value.
		if (this.controlElements && this.controlElements.active) {
			value = <FlowDTO>this.controlElements.getDTO();
		} else {
			value = <FlowDTO>{
				text: this.getInputValue()
			};
		}

		// add current tag to DTO if not set
		if (!value.tag)
			value.tag = this.currentTag;

		value.input = this;
		value.tag = this.currentTag;

		return value;
	}

	public reset() {
		if (this.controlElements) {
			this.controlElements.clearTagsAndReset()
		}
	}

	public deactivate(): void {
		super.deactivate();
		if (this.microphoneObj) {
			this.submitButton.active = false;
		}
	}

	public reactivate(): void {
		super.reactivate();

		// called from microphone interface, check if active microphone, and set loading if yes
		if (this.microphoneObj && !this.submitButton.typing) {
			this.submitButton.loading = true;
			// setting typing to false calls the externa interface, like Microphone
			this.submitButton.typing = false;
			this.submitButton.active = true;
		}
	}

	public onFlowStopped() {
		this.submitButton.loading = false;
		if (this.submitButton.typing)
			this.submitButton.typing = false;

		if (this.controlElements)
			this.controlElements.clearTagsAndReset();

		this.disabled = true;
	}

	/**
	* @name onOriginalTagChanged
	* on domElement from a Tag value changed..
	*/
	private onOriginalTagChanged(event: CustomEvent): void {
		if (this.currentTag == event.detail.tag) {
			this.onInputChange();
		}

		if (this.controlElements && this.controlElements.active) {
			this.controlElements.updateStateOnElementsFromTag(event.detail.tag)
		}
	}

	private onInputChange() {
		if (!this.active && !this.controlElements.active)
			return;

		// safari likes to jump around with the scrollHeight value, let's keep it in check with an initial height.
		const oldHeight: number = Math.max(this.initialInputHeight, parseInt(this.inputElement.style.height, 10));
		this.inputElement.style.height = '0px';
		// console.log(this.inputElement.style.height, this.inputElement.style);
		this.inputElement.style.height = (this.inputElement.scrollHeight === 0 ? oldHeight : this.inputElement.scrollHeight) + "px";

		CFGlobals.illustrateFlow(this, "dispatch", UserInputEvents.HEIGHT_CHANGE);
		this.eventTarget.dispatchEvent(new CustomEvent(UserInputEvents.HEIGHT_CHANGE, {
			detail: this.inputElement.scrollHeight
		}));
	}

	private resetInputHeight() {
		if (this.inputElement.getAttribute('rows') === '1') {
			this.inputElement.style.height = this.initialInputHeight + 'px';
		} else {
			this.inputElement.style.height = '0px';
		}
	}

	protected inputInvalid(event: CustomEvent) {
		CFGlobals.illustrateFlow(this, "receive", event.type, event.detail);
		const dto: FlowDTO = event.detail;

		this.inputElement.setAttribute("data-value", this.inputElement.value);
		this.inputElement.value = "";

		this.el.setAttribute("error", "");
		this.disabled = true;
		// cf-error
		this.inputElement.setAttribute("placeholder", dto.errorText || (this._currentTag ? this._currentTag.errorMessage : ""));
		clearTimeout(this.errorTimer);

		// remove loading class
		this.submitButton.loading = false;

		this.errorTimer = setTimeout(() => {
			this.disabled = false;
			if (!CFGlobals.suppressLog) console.log('option, disabled 1',);
			this.el.removeAttribute("error");

			this.inputElement.value = this.inputElement.getAttribute("data-value") ?? "";
			this.inputElement.setAttribute("data-value", "");
			this.setPlaceholder();
			this.setFocusOnInput();

			//TODO: reset submit button..
			this.submitButton.reset();

			if (this.controlElements)
				this.controlElements.resetAfterErrorMessage();

		}, UserInputElement.ERROR_TIME);

	}

	private setPlaceholder() {
		if (this._currentTag) {
			if (this._currentTag.inputPlaceholder) {
				this.inputElement.setAttribute("placeholder", this._currentTag.inputPlaceholder);
			} else {
				this.inputElement.setAttribute("placeholder", this._currentTag.type == "group" ? Dictionary.get("group-placeholder") : Dictionary.get("input-placeholder"));
			}
		} else {
			this.inputElement.setAttribute("placeholder", Dictionary.get("group-placeholder"));
		}
	}

	/**
	 * TODO: handle detect input/textarea in a simpler way - too conditional heavy
	 *
	 * @private
	 * @memberof UserTextInput
	 */
	private checkForCorrectInputTag() {

		if (!this._currentTag || !this.isDomTag(this._currentTag))
			return;

		const tagName: String = this.tagType(this._currentTag);

		// remove focus and blur events, because we want to create a new element
		if (this.inputElement && this.inputElement.tagName !== tagName) {

			if (this.onInputFocusCallback)
				this.inputElement.removeEventListener('focus', this.onInputFocusCallback, false);

			if (this.onInputBlurCallback)
				this.inputElement.removeEventListener('blur', this.onInputBlurCallback, false);
		}

		this.removeAttribute('autocomplete');
		this.removeAttribute('list');

		if (tagName === 'INPUT') {
			// change to input
			const input = document.createElement("input");
			Array.prototype.slice.call(this.inputElement.attributes).forEach((item: any) => {
				input.setAttribute(item.name, item.value);
			});

			if (this.inputElement.type === 'password') {
				input.setAttribute("autocomplete", "new-password");
			}

			if (this._currentTag.domElement.hasAttribute('autocomplete')) {
				input.setAttribute('autocomplete', this._currentTag.domElement.getAttribute('autocomplete') ?? "");
			}

			if (this._currentTag.domElement.hasAttribute('list')) {
				input.setAttribute('list', this._currentTag.domElement.getAttribute('list') ?? "");
			}

			this.inputElement.parentNode?.replaceChild(input, this.inputElement);
			this.inputElement = input;
		} else if (this.inputElement && this.inputElement.tagName !== tagName) {
			// change to textarea
			const textarea = document.createElement("textarea");
			Array.prototype.slice.call(this.inputElement.attributes).forEach((item: any) => {
				textarea.setAttribute(item.name, item.value);
			});
			this.inputElement.parentNode?.replaceChild(textarea, this.inputElement);
			this.inputElement = textarea;
		}

		// add focus and blur events to newly created input element
		if (this.inputElement && this.inputElement.tagName !== tagName) {

			if (this.onInputFocusCallback)
				this.inputElement.addEventListener('focus', this.onInputFocusCallback, false);

			if (this.onInputBlurCallback)
				this.inputElement.addEventListener('blur', this.onInputBlurCallback, false);
		}

		if (this.initialInputHeight == 0) {
			// initial height not set
			this.initialInputHeight = this.inputElement.offsetHeight;
		}

		this.setFocusOnInput();
	}

	/**
	 * Removes attribute on input element if attribute is present
	 *
	 * @private
	 * @param {string} attribute
	 * @memberof UserTextInput
	 */
	private removeAttribute(attribute: string): void {
		if (this.inputElement
			&& this.inputElement.hasAttribute(attribute)) {
			this.inputElement.removeAttribute(attribute);
		}
	}

	tagType(inputElement: IDomTag): String {

		if (
			!inputElement.domElement
			|| !inputElement.domElement.tagName
		) {
			return 'TEXTAREA';
		}

		if (
			inputElement.domElement.tagName === 'TEXTAREA'
			|| (
				inputElement.domElement.hasAttribute('rows')
				&& parseInt(inputElement.domElement.getAttribute('rows') ?? "", 10) > 1
			)
		) return 'TEXTAREA';

		if (inputElement.domElement.tagName === 'INPUT') return 'INPUT';

		return 'TEXTAREA'; // TODO
	}

	protected onFlowUpdate(event: CustomEvent) {
		super.onFlowUpdate(event);

		this.submitButton.loading = false;
		if (this.submitButton.typing)
			this.submitButton.typing = false;

		// animate input field in

		if (!this._currentTag)
			return;

		this.el.setAttribute("tag-type", this._currentTag.type);

		// replace textarea and visa versa
		this.checkForCorrectInputTag()

		// set input field to type password if the dom input field is that, covering up the input
		var isInputSpecificType: boolean = ["password", "number", "email", "tel"].indexOf(this._currentTag.type) !== -1;
		this.inputElement.setAttribute("type", isInputSpecificType ? this._currentTag.type : "input");


		clearTimeout(this.errorTimer);
		this.el.removeAttribute("error");
		this.inputElement.setAttribute("data-value", "");
		this.inputElement.value = "";

		this.submitButton.loading = false;

		this.setPlaceholder();

		this.resetValue();

		this.setFocusOnInput();

		this.controlElements.reset();

		if (this._currentTag.type == "group") {
			this.buildControlElements((<ITagGroup>this._currentTag).elements);
		} else {
			this.buildControlElements([<IDomTag>this._currentTag]);
		}

		if (this._currentTag.defaultValue) {
			this.inputElement.value = this._currentTag.defaultValue.toString();
		}

		if (this._currentTag.skipUserInput === true) {
			this.el.classList.add("hide-input");
		} else {
			this.el.classList.remove("hide-input");
		}

		// Set rows attribute if present
		if ((<InputTag>this._currentTag).rows && (<InputTag>this._currentTag).rows > 1) {
			this.inputElement.setAttribute('rows', (<InputTag>this._currentTag).rows.toString());
		}

		if (UserInputElement.hideUserInputOnNoneTextInput) {
			// toggle userinput hide
			if (this.controlElements.active) {
				this.el.classList.add("hide-input");
				// set focus on first control element
				this.controlElements.focusFrom("bottom");
			} else {
				this.el.classList.remove("hide-input");
			}
		}

		this.resetInputHeight();

		setTimeout(() => {
			this.onInputChange();
		}, 300);
	}

	private onControlElementProgressChange(event: CustomEvent) {
		const status: string = event.detail;
		this.disabled = status == ControlElementProgressStates.BUSY;
		if (!CFGlobals.suppressLog) console.log('option, disabled 2',);
	}

	private buildControlElements(tags: Array<IDomTag>) {
		this.controlElements.buildTags(tags);
	}

	private onControlElementSubmit(event: CustomEvent) {
		CFGlobals.illustrateFlow(this, "receive", event.type, event.detail);

		// when ex a RadioButton is clicked..
		const controlElement: IControlElement = <IControlElement>event.detail;

		this.controlElements.updateStateOnElements(controlElement);

		this.doSubmit();
	}

	private onSubmitButtonChangeState(event: CustomEvent) {
		this.onEnterOrSubmitButtonSubmit(event);
	}

	private isMetaKeyPressed(event: KeyboardEvent): boolean {
		// if any meta keys, then ignore, getModifierState, but safari does not support..
		if (event.metaKey || [91, 93].indexOf(event.keyCode) !== -1)
			return true;
		else
			return false;
	}

	private onKeyDown(event: Event) {

		const keyEvent = event as KeyboardEvent;
		if (!keyEvent) return;

		if (!this.active && !this.controlElements.focus)
			return;

		if (this.isControlElementsActiveAndUserInputHidden())
			return;

		if (this.isMetaKeyPressed(keyEvent))
			return;

		// if any meta keys, then ignore
		if (keyEvent.keyCode == Dictionary.keyCodes["shift"])
			this.shiftIsDown = true;

		// If submit is prevented by option 'preventSubmitOnEnter'
		if (this.cfReference.preventSubmitOnEnter === true && this.inputElement.hasAttribute('rows')
			&& parseInt(this.inputElement.getAttribute('rows') ?? "") > 1) {
			return;
		}

		// prevent textarea line breaks
		if (keyEvent.keyCode == Dictionary.keyCodes["enter"] && !keyEvent.shiftKey) {
			event.preventDefault();
		}
	}

	private isControlElementsActiveAndUserInputHidden(): boolean {
		return this.controlElements && this.controlElements.active && UserInputElement.hideUserInputOnNoneTextInput
	}

	private onKeyUp(event: Event) {

		const keyEvent = event as KeyboardEvent;
		if (!keyEvent) return;

		if ((!this.active && !this.isControlElementsActiveAndUserInputHidden()) && !this.controlElements.focus)
			return;

		if (this.isMetaKeyPressed(keyEvent))
			return;

		if (keyEvent.keyCode == Dictionary.keyCodes["shift"]) {
			this.shiftIsDown = false;
		} else if (keyEvent.keyCode == Dictionary.keyCodes["up"]) {
			event.preventDefault();

			if (this.active && !this.controlElements.focus)
				this.controlElements.focusFrom("bottom");
		} else if (keyEvent.keyCode == Dictionary.keyCodes["down"]) {
			event.preventDefault();

			if (this.active && !this.controlElements.focus)
				this.controlElements.focusFrom("top");
		} else if (keyEvent.keyCode == Dictionary.keyCodes["tab"]) {
			// tab key pressed, check if node is child of CF, if then then reset focus to input element

			var doesKeyTargetExistInCF: boolean = false;
			var node = (<HTMLElement>event.target).parentNode;
			while (node != null) {
				if (node === this.cfReference.el) {
					doesKeyTargetExistInCF = true;
					break;
				}

				node = node.parentNode;
			}

			// prevent normal behaviour, we are not here to take part, we are here to take over!
			if (!doesKeyTargetExistInCF) {
				event.preventDefault();
				if (!this.controlElements.active)
					this.setFocusOnInput();
			}
		}

		if (this.el.hasAttribute("disabled") || !this._currentTag)
			return;

		const value: FlowDTO = this.getFlowDTO();

		if ((keyEvent.keyCode == Dictionary.keyCodes["enter"] && !keyEvent.shiftKey) || keyEvent.keyCode == Dictionary.keyCodes["space"]) {
			if (keyEvent.keyCode == Dictionary.keyCodes["enter"] && this.active) {
				if (this.cfReference.preventSubmitOnEnter === true) return;
				event.preventDefault();
				this.onEnterOrSubmitButtonSubmit();
			} else {
				// either click on submit button or do something with control elements
				if (keyEvent.keyCode == Dictionary.keyCodes["enter"] || keyEvent.keyCode == Dictionary.keyCodes["space"]) {
					event.preventDefault();

					const tagType: string = this._currentTag.type == "group" ? (<ITagGroup>this._currentTag).getGroupTagType() : this._currentTag.type;

					if (tagType == "select" || tagType == "checkbox") {
						const mutiTag: SelectTag | InputTag = <SelectTag | InputTag>this._currentTag;
						// if select or checkbox then check for multi select item
						if (tagType == "checkbox" || (<SelectTag>mutiTag).multipleChoice) {
							if ((this.active || this.isControlElementsActiveAndUserInputHidden()) && keyEvent.keyCode == Dictionary.keyCodes["enter"]) {
								// click on UserTextInput submit button, only ENTER allowed
								this.submitButton.click();
							} else {
								// let UI know that we changed the key
								if (!this.active && !this.controlElements.active && !this.isControlElementsActiveAndUserInputHidden()) {
									// after ui has been selected we RESET the input/filter
									this.resetValue();
									this.setFocusOnInput();
								}

								this.dispatchKeyChange(value, keyEvent.keyCode);
							}
						} else {
							this.dispatchKeyChange(value, keyEvent.keyCode);
						}
					} else {
						if (this._currentTag.type == "group") {
							// let the controlements handle action
							this.dispatchKeyChange(value, keyEvent.keyCode);
						}
					}
				} else if (keyEvent.keyCode == Dictionary.keyCodes["space"] && document.activeElement) {
					this.dispatchKeyChange(value, keyEvent.keyCode);
				}
			}
		} else if (keyEvent.keyCode != Dictionary.keyCodes["shift"] && keyEvent.keyCode != Dictionary.keyCodes["tab"]) {
			this.dispatchKeyChange(value, keyEvent.keyCode)
		}

		this.onInputChange();
	}

	private dispatchKeyChange(dto: FlowDTO, keyCode: number) {
		// typing --->
		this.submitButton.typing = dto.text != undefined && dto.text.length > 0;

		CFGlobals.illustrateFlow(this, "dispatch", UserInputEvents.KEY_CHANGE, dto);
		this.eventTarget.dispatchEvent(new CustomEvent(UserInputEvents.KEY_CHANGE, {
			detail: <InputKeyChangeDTO>{
				dto: dto,
				keyCode: keyCode,
				inputFieldActive: this.active
			}
		}));
	}

	protected windowFocus(event: Event) {
		super.windowFocus(event);
		this.setFocusOnInput();
	}

	private onInputBlur(event: Event) {
		this._active = false;
		this.eventTarget.dispatchEvent(new CustomEvent(UserInputEvents.BLUR));
	}

	private onInputFocus(event: Event) {
		this._active = true;
		this.onInputChange();
		this.eventTarget.dispatchEvent(new CustomEvent(UserInputEvents.FOCUS));
	}

	public setFocusOnInput() {
		if (!UserInputElement.preventAutoFocus && !this.el.classList.contains("hide-input")) {
			this.inputElement.focus();
		}
	}

	protected onEnterOrSubmitButtonSubmit(event: CustomEvent | undefined = undefined) {
		const isControlElementsActiveAndUserInputHidden: boolean = this.controlElements.active && UserInputElement.hideUserInputOnNoneTextInput;
		if ((this.active || isControlElementsActiveAndUserInputHidden) && this.controlElements.highlighted) {
			// active input field and focus on control elements happens when a control element is highlighted
			this.controlElements.clickOnHighlighted();
		} else {
			if (!this._currentTag) {
				// happens when a form is empty, so just play along and submit response to chatlist..
				this.cfReference.addUserChatResponse(this.inputElement.value);
			} else {
				// we need to check if current tag is file
				if (this._currentTag.type == "file" && event) {
					// trigger <input type="file" but only when it's from clicking button
					(<UploadFileUI>this.controlElements.getElement(0)).triggerFileSelect();
				} else {
					// for groups, we expect that there is always a default value set
					this.doSubmit();
				}
			}
		}
	}

	private doSubmit() {
		const dto: FlowDTO = this.getFlowDTO();
		this.submitButton.loading = true;

		this.disabled = true;
		this.el.removeAttribute("error");
		this.inputElement.setAttribute("data-value", "");

		CFGlobals.illustrateFlow(this, "dispatch", UserInputEvents.SUBMIT, dto);
		this.eventTarget.dispatchEvent(new CustomEvent(UserInputEvents.SUBMIT, {
			detail: dto
		}));
	}

	private resetValue() {
		this.inputElement.value = "";
		if (this.inputElement.hasAttribute('rows')) this.inputElement.setAttribute('rows', '1');
		this.onInputChange();
	}

	public dealloc() {

		if (this.onInputBlurCallback)
			this.inputElement.removeEventListener('blur', this.onInputBlurCallback, false);
		this.onInputBlurCallback = undefined;

		if (this.onInputFocusCallback)
			this.inputElement.removeEventListener('focus', this.onInputFocusCallback, false);
		this.onInputFocusCallback = undefined;

		if (this.keyDownCallback)
			document.removeEventListener("keydown", this.keyDownCallback, false);
		this.keyDownCallback = undefined;

		if (this.keyUpCallback)
			document.removeEventListener("keyup", this.keyUpCallback, false);
		this.keyUpCallback = undefined;

		if (this.onControlElementSubmitCallback)
			this.eventTarget.removeEventListener(ControlElementEvents.SUBMIT_VALUE, this.onControlElementSubmitCallback, false);
		this.onControlElementSubmitCallback = undefined;

		// remove submit button instance
		if (this.onSubmitButtonChangeStateCallback)
			this.eventTarget.removeEventListener(UserInputSubmitButtonEvents.CHANGE, this.onSubmitButtonChangeStateCallback, false);
		this.onSubmitButtonChangeStateCallback = undefined;
		this.submitButton.dealloc();

		super.dealloc();
	}

	// override
	public getTemplate(): string {
		return this.customTemplate || `<cf-input>
				<cf-info></cf-info>
				<cf-input-control-elements>
					<cf-list-button direction="prev">
					</cf-list-button>
					<cf-list-button direction="next">
					</cf-list-button>
					<cf-list>
					</cf-list>
				</cf-input-control-elements>
				<div class="inputWrapper">
					<textarea type='input' tabindex="1" rows="1"></textarea>
				</div>
			</cf-input>
			`;
	}
}
