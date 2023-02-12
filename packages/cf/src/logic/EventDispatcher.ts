import { IConversationalForm } from "../interfaces/IConversationalForm";
import { IEventTarget } from "./IEventTarget";

export class EventDispatcher implements IEventTarget {
	private target: DocumentFragment;

	private _cf: IConversationalForm;
	public get cf(): IConversationalForm {
		return this._cf;
	}

	public set cf(value: IConversationalForm) {
		this._cf = value;
	}

	constructor(cfRef: IConversationalForm) {
		this._cf = cfRef;

		this.target = document.createDocumentFragment();
	}

	private isCustomEvent(event: Event): event is CustomEvent {
		return 'detail' in event;
	}

	public addEventListener(type: string, listener: (e: CustomEvent) => void, useCapture?: boolean): void {
		return this.target.addEventListener(type, listener as (e: Event) => void, useCapture);
	}

	public dispatchEvent(event: CustomEvent): boolean {
		return this.target.dispatchEvent(event);
	}

	public removeEventListener(type: string, listener: (e: CustomEvent) => void, useCapture?: boolean): void {
		this.target.removeEventListener(type, listener as (e: Event) => void, useCapture);
	}
}