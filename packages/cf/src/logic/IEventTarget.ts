export interface IEventTarget {

    addEventListener(type: string, listener: (e: CustomEvent) => void, options?: AddEventListenerOptions | boolean): void;
    dispatchEvent(event: CustomEvent): boolean;
    removeEventListener(type: string, listener: (e: CustomEvent) => void, options?: EventListenerOptions | boolean): void;
}