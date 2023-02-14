import { IConversationalForm } from "../interfaces/IConversationalForm";
import { IEventTarget } from "./IEventTarget";

export class EventDispatcher implements IEventTarget {
	private target: DocumentFragment;

	constructor() {
		this.target = document.createDocumentFragment();
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