import { FlowDTO } from "../../form-tags/ITag";
import { IConversationalForm } from "../../interfaces/IConversationalForm";
import { IUserInput } from "../../interfaces/IUserInput";
import { FlowEvents } from "../../logic/FlowManager";
import { IEventTarget } from "../../logic/IEventTarget";
import { MicrophoneBridge, MicrophoneBridgeEvent } from "../../logic/MicrophoneBridge";

export interface UserInputSubmitButtonOptions {
	eventTarget: IEventTarget;
	cfReference: IConversationalForm
}

export const UserInputSubmitButtonEvents = {
	CHANGE: "userinput-submit-button-change-value"
}

// class
export class UserInputSubmitButton {
	private onClickCallback?: (event: Event) => void;
	private eventTarget: IEventTarget;
	private cfReference: IConversationalForm;

	private mic?: MicrophoneBridge;
	private _active: boolean = true;
	private onMicrophoneTerminalErrorCallback?: (event: CustomEvent) => void;

	public el: HTMLElement;

	public set typing(value: boolean) {
		if (value) {
			this.el.classList.add("typing");
			this.loading = false;
			if (this.mic) {
				this.mic.cancel();
			}
		} else {
			this.el.classList.remove("typing");
			if (this.mic) {
				this.mic.callInput();
			}
		}
	}

	public get typing(): boolean {
		return this.el.classList.contains("typing");
	}

	public set active(value: boolean) {
		this._active = value;
		if (this.mic) {
			this.mic.active = value;
		}
	}

	public get active(): boolean {
		return this._active;
	}

	public set loading(value: boolean) {
		if (value)
			this.el.classList.add("loading");
		else
			this.el.classList.remove("loading");
	}

	public get loading(): boolean {
		return this.el.classList.contains("loading");
	}

	constructor(options: UserInputSubmitButtonOptions) {
		this.eventTarget = options.eventTarget;
		this.cfReference = options.cfReference;

		var template: HTMLTemplateElement = document.createElement('template');
		template.innerHTML = this.getTemplate();
		this.el = <HTMLElement>template.firstChild || <HTMLElement>template.content.firstChild;

		this.onClickCallback = this.onClick.bind(this);
		this.el.addEventListener("click", this.onClickCallback, false);

		this.onMicrophoneTerminalErrorCallback = this.onMicrophoneTerminalError.bind(this);
		this.eventTarget.addEventListener(MicrophoneBridgeEvent.TERMNIAL_ERROR, this.onMicrophoneTerminalErrorCallback, false);
	}

	public addMicrophone(microphoneObj: IUserInput) {

		this.el.classList.add("microphone-interface");
		var template: HTMLTemplateElement = document.createElement('template');
		template.innerHTML = `<div class="cf-input-icons cf-microphone">
				<div class="cf-icon-audio"></div>
				<cf-icon-audio-eq></cf-icon-audio-eq>
			</div>`;
		const mic: HTMLElement = <HTMLElement>template.firstChild || <HTMLElement>template.content.firstChild;

		this.mic = new MicrophoneBridge({
			el: mic,
			button: this,
			eventTarget: this.eventTarget,
			microphoneObj: microphoneObj,
			cfReference: this.cfReference,
		});

		this.el.appendChild(mic);

		// this.mic = null;
		// this.el.appendChild(this.mic.el);
	}

	public reset() {
		if (this.mic && !this.typing) {
			// if microphone and not typing
			this.mic.callInput();
		}
	}

	public getTemplate(): string {
		return `<cf-input-button class="cf-input-button">
						<div class="cf-input-icons">
							<div class="cf-icon-progress"></div>
							<div class="cf-icon-attachment"></div>
						</div>
					</cf-input-button>`;
	}

	protected onMicrophoneTerminalError(event: CustomEvent) {
		if (this.mic) {
			this.mic.dealloc();
			this.mic = undefined;
			this.el.removeChild(this.el.getElementsByClassName("cf-microphone")[0]);

			this.el.classList.remove("microphone-interface");
			this.loading = false;

			this.eventTarget.dispatchEvent(new CustomEvent(FlowEvents.USER_INPUT_INVALID, {
				detail: <FlowDTO>{
					errorText: event.detail
				} //UserTextInput value
			}));
		}
	}

	private onClick(event: Event) {
		const isMicVisible = this.mic && !this.typing;
		if (isMicVisible) {
			this.mic?.callInput();
		} else {
			this.eventTarget.dispatchEvent(new CustomEvent(UserInputSubmitButtonEvents.CHANGE));
		}
	}

	/**
	* @name click
	* force click on button
	*/
	public click(): void {
		this.el.click();
	}

	/**
	* @name dealloc
	* remove instance
	*/
	public dealloc(): void {
		if (this.onMicrophoneTerminalErrorCallback)
			this.eventTarget.removeEventListener(MicrophoneBridgeEvent.TERMNIAL_ERROR, this.onMicrophoneTerminalErrorCallback, false);

		this.onMicrophoneTerminalErrorCallback = undefined;

		if (this.mic) {
			this.mic.dealloc();
		}
		this.mic = undefined;

		if (this.onClickCallback)
			this.el.removeEventListener("click", this.onClickCallback, false);
		this.onClickCallback = undefined;

	}
}
