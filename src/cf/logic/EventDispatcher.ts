import { IConversationalForm } from "../interfaces/IConversationalForm";

	export class EventDispatcher implements EventTarget{
		private target: DocumentFragment;
		
		private _cf: IConversationalForm;
		public get cf(): IConversationalForm{
			return this._cf;
		}

		public set cf(value: IConversationalForm){
			this._cf = value;
		}

		constructor(cfRef: IConversationalForm) {
			this._cf = cfRef;

			this.target = document.createDocumentFragment();
		}

		public addEventListener(type: string, listener?: EventListenerOrEventListenerObject, useCapture?: boolean): void{
			return this.target.addEventListener(type, listener, useCapture);
		}

		public dispatchEvent(event: Event | CustomEvent): boolean{
			return this.target.dispatchEvent(event);
		}

		public removeEventListener(type: string, listener?: EventListenerOrEventListenerObject, useCapture?: boolean): void{
			this.target.removeEventListener(type, listener, useCapture);
		}
	}