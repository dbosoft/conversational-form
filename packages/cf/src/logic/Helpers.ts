export interface TouchVector2d {
	x: number,
	y: number,
	touches?: Array<any>,
}

// class
export class Helpers {
	public static lerp(norm: number, min: number, max: number): number {
		return (max - min) * norm + min;
	}

	public static norm(value: number, min: number, max: number): number {
		return (value - min) / (max - min);
	}

	public static getXYFromMouseTouchEvent(event: Event | MouseEvent | TouchEvent): TouchVector2d {
		var touches: Array<any> | undefined;
		if ((<any>event).originalEvent)
			touches = (<any>event).originalEvent.touches || (<any>event).originalEvent.changedTouches;
		else if ((<TouchEvent>event).changedTouches)
			touches = <any>(<TouchEvent>event).changedTouches;

		if (touches) {
			return { x: touches[0].pageX, y: touches[0].pageY, touches: touches[0] };
		} else {
			return { x: (<MouseEvent>event).pageX, y: (<MouseEvent>event).pageY };
		}
	}

	public static getInnerTextOfElement(element: Element): string {
		const tmp = document.createElement("DIV");
		tmp.innerHTML = element.innerHTML;
		// return 
		let text: string = tmp.textContent || tmp.innerText || "";
		// text = String(text).replace('\t','');
		text = String(text).replace(/^\s+|\s+$/g, '');

		return text;
	}

	public static getMouseEvent(eventString: string): string {
		let mappings: any = [];
		mappings["click"] = "ontouchstart" in window ? "touchstart" : "click";
		mappings["mousedown"] = "ontouchstart" in window ? "touchstart" : "mousedown";
		mappings["mouseup"] = "ontouchstart" in window ? "touchend" : "mouseup";
		mappings["mousemove"] = "ontouchstart" in window ? "touchmove" : "mousemove";

		return <string>mappings[eventString];
	}

	public static isInternetExlorer() {
		var ua = window.navigator.userAgent;
		var msie = ua.indexOf("MSIE ");
		return msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./);
	}

	public static caniuse = {
		fileReader: () => {
			if ((<any>window).File && (<any>window).FileReader && (<any>window).FileList && window.Blob)
				return true;

			return false;
		}
	}

	public static getValuesOfBars(str: string): Array<string> {

		let strs: Array<string> = str.split("||");

		// TODO: remove single |
		// fallback to the standard
		if (strs.length <= 1)
			strs = str.split("|");

		return strs;
	}

	public static setTransform(el: any, transformString: string) {
		el.style["-webkit-transform"] = transformString;
		el.style["-moz-transform"] = transformString;
		el.style["-ms-transform"] = transformString;
		el.style["transform"] = transformString;
	}
}


type Head<T> = T extends [infer I, ...infer _Rest] ? I : never
type Tail<T> = T extends [infer _I, ...infer Rest] ? Rest : never

type Zip_DeepMergeTwoTypes<T, U> = T extends []
	? U
	: U extends []
	? T
	: [
		DeepMergeTwoTypes<Head<T>, Head<U>>,
		...Zip_DeepMergeTwoTypes<Tail<T>, Tail<U>>
	]


/**
 * Take two objects T and U and create the new one with uniq keys for T a U objectI
 * helper generic for `DeepMergeTwoTypes`
 */
type GetObjDifferentKeys<
	T,
	U,
	T0 = Omit<T, keyof U> & Omit<U, keyof T>,
	T1 = { [K in keyof T0]: T0[K] }
	> = T1
/**
 * Take two objects T and U and create the new one with the same objects keys
 * helper generic for `DeepMergeTwoTypes`
 */
type GetObjSameKeys<T, U> = Omit<T | U, keyof GetObjDifferentKeys<T, U>>

type MergeTwoObjects<
	T,
	U,
	// non shared keys are optional
	T0 = Partial<GetObjDifferentKeys<T, U>>
	// shared keys are recursively resolved by `DeepMergeTwoTypes<...>`
	& { [K in keyof GetObjSameKeys<T, U>]: DeepMergeTwoTypes<T[K], U[K]> },
	T1 = { [K in keyof T0]: T0[K] }
	> = T1

// it merge 2 static types and try to avoid of unnecessary options (`'`)
export type DeepMergeTwoTypes<T, U> =
	// ----- 2 added lines ------
	[T, U] extends [any[], any[]]
	? Zip_DeepMergeTwoTypes<T, U>
	// check if generic types are objects
	: [T, U] extends [{ [key: string]: unknown }, { [key: string]: unknown }]
	? MergeTwoObjects<T, U>
	: T | U


