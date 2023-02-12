import { CFGlobals } from "../../CFGlobal";
import { ITag, ITagGroup, FlowDTO, IDomTag } from "../../form-tags/ITag";
import { IUserInputElement } from "../../interfaces/IUserInputElement";
import { FlowEvents } from "../../logic/FlowManager";
import { Helpers } from "../../logic/Helpers";
import { BasicElement } from "../BasicElement";
import { ChatListEvents } from "../chat/ChatListEvents";
import { IUserInputOptions } from "./IUserInputOptions";

// interface
export abstract class UserInputElement extends BasicElement implements IUserInputElement {
	public static ERROR_TIME: number = 2000;
	public static preventAutoFocus: boolean = false;
	public static hideUserInputOnNoneTextInput: boolean = false;

	private onChatReponsesUpdatedCallback?: (event: CustomEvent) => void;
	private windowFocusCallback?: (event: Event) => void;
	private inputInvalidCallback?: (event: CustomEvent) => void;
	private flowUpdateCallback?: (event: CustomEvent) => void;
	protected _currentTag?: IDomTag | ITagGroup;
	protected _disabled: boolean = false;
	protected _visible: boolean = false;

	public get currentTag(): IDomTag | ITagGroup | undefined {
		return this._currentTag;
	}

	protected isDomTag(tag: ITag): tag is IDomTag {
		return tag.type != "group";
	}

	public set visible(value: boolean) {
		this._visible = value;

		if (!this.el.classList.contains("animate-in") && value) {
			setTimeout(() => {
				this.el.classList.add("animate-in");
			}, 0);
		} else if (this.el.classList.contains("animate-in") && !value) {
			this.el.classList.remove("animate-in");
		}
	}

	public set disabled(value: boolean) {
		const hasChanged: boolean = this._disabled != value;
		if (hasChanged) {
			this._disabled = value;
			if (value) {
				this.el.setAttribute("disabled", "disabled");
			} else {
				this.setFocusOnInput();
				this.el.removeAttribute("disabled");
			}
		}
	}

	public get disabled(): boolean {
		return this._disabled
	}

	public get height(): number {
		let elHeight: number = 0
		let elMargin: number = 0;
		const el: any = <any>this.el;
		if (Helpers.isInternetExlorer()) {
			// IE
			elHeight = (<any>el).offsetHeight;
			elMargin = parseInt(el.currentStyle.marginTop, 10) + parseInt(el.currentStyle.marginBottom, 10);
			elMargin *= 2;
		} else {
			// none-IE
			if (document.defaultView) {
				elHeight = parseInt(document.defaultView.getComputedStyle(el, '').getPropertyValue('height'), 10);
				elMargin = parseInt(document.defaultView.getComputedStyle(el, '').getPropertyValue('margin-top'))
					+ parseInt(document.defaultView.getComputedStyle(el, '').getPropertyValue('margin-bottom'));
			}
		}
		return (elHeight + elMargin);
	}

	constructor(options: IUserInputOptions) {
		super(options);

		this.onChatReponsesUpdatedCallback = this.onChatReponsesUpdated.bind(this);
		this.eventTarget.addEventListener(ChatListEvents.CHATLIST_UPDATED, this.onChatReponsesUpdatedCallback, false);

		this.windowFocusCallback = this.windowFocus.bind(this);
		window.addEventListener('focus', this.windowFocusCallback, false);

		this.inputInvalidCallback = this.inputInvalid.bind(this);
		this.eventTarget.addEventListener(FlowEvents.USER_INPUT_INVALID, this.inputInvalidCallback, false);

		this.flowUpdateCallback = this.onFlowUpdate.bind(this);
		this.eventTarget.addEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);
	}
	protected onEnterOrSubmitButtonSubmit(event: CustomEvent) {

	}

	protected inputInvalid(event: CustomEvent) {
	}

	/**
	* @name deactivate
	* DEactivate the field
	*/
	public deactivate(): void {
		this.disabled = true;
	}

	/**
	* @name reactivate
	* REactivate the field
	*/
	public reactivate(): void {
		this.disabled = false;
	}

	public abstract getFlowDTO(): FlowDTO;

	public setFocusOnInput() {
	}
	public onFlowStopped() {
	}

	public reset() {
	}

	public dealloc() {

		if (this.onChatReponsesUpdatedCallback)
			this.eventTarget.removeEventListener(ChatListEvents.CHATLIST_UPDATED, this.onChatReponsesUpdatedCallback, false);
		this.onChatReponsesUpdatedCallback = undefined;

		if (this.inputInvalidCallback)
			this.eventTarget.removeEventListener(FlowEvents.USER_INPUT_INVALID, this.inputInvalidCallback, false);

		this.inputInvalidCallback = undefined;

		if (this.windowFocusCallback)
			window.removeEventListener('focus', this.windowFocusCallback, false);
		this.windowFocusCallback = undefined;

		if (this.flowUpdateCallback)
			this.eventTarget.removeEventListener(FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);
		this.flowUpdateCallback = undefined;

		super.dealloc();
	}

	protected onFlowUpdate(event: CustomEvent) {
		CFGlobals.illustrateFlow(this, "receive", event.type, event.detail);
		this._currentTag = <IDomTag>event.detail.tag;
	}

	protected windowFocus(event: Event) {

	}

	private onChatReponsesUpdated(event: CustomEvent) {
		// only show when user response
		if (!(<any>event.detail).currentResponse.isRobotResponse) {
			this.visible = true;
			this.disabled = false;
			this.setFocusOnInput();
		}
	}
}

