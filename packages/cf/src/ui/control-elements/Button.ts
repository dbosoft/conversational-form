import { Tag } from "../../form-tags/Tag";
import { ControlElement } from "./ControlElement";
import { IControlElementOptions, ControlElementEvents } from "./IControlElement";

export class Button extends ControlElement {
	private imgEl?: HTMLImageElement;
	private clickCallback?: (event: Event) => void;
	private mouseDownCallback?: (event: Event) => void;
	private imageLoadedCallback?: (event: Event) => void;

	public get type(): string {
		return "Button";
	}

	constructor(options: IControlElementOptions) {
		super(options);

		this.clickCallback = this.onClick.bind(this);
		this.el.addEventListener("click", this.clickCallback, false);

		this.mouseDownCallback = this.onMouseDown.bind(this);
		this.el.addEventListener("mousedown", this.mouseDownCallback, false);

		//image
		this.checkForImage()
	}

	public hasImage(): boolean {
		return (<Tag>this.referenceTag).hasImage;
	}

	/**
	* @name checkForImage
	* checks if element has cf-image, if it has then change UI
	*/
	private checkForImage(): void {
		const hasImage: boolean = this.hasImage();
		if (hasImage) {
			this.el.classList.add("has-image");
			this.imgEl = <HTMLImageElement>document.createElement("img");
			this.imageLoadedCallback = this.onImageLoaded.bind(this);
			this.imgEl.classList.add("cf-image");
			this.imgEl.addEventListener("load", this.imageLoadedCallback, false);
			if (this.referenceTag?.domElement.getAttribute("cf-image"))
				this.imgEl.src = this.referenceTag.domElement.getAttribute("cf-image") ?? "";
			this.el.insertBefore(this.imgEl, this.el.children[0]);
		}
	}

	private onImageLoaded() {
		this.imgEl?.classList.add("loaded");
		this.eventTarget.dispatchEvent(new CustomEvent(ControlElementEvents.ON_LOADED, {}));
	}

	private onMouseDown(event: Event) {
		event.preventDefault();
	}

	protected onClick(event: Event) {
		this.onChoose();
	}

	public dealloc() {
		if (this.clickCallback)
			this.el.removeEventListener("click", this.clickCallback, false);
		this.clickCallback = undefined;

		if (this.imageLoadedCallback) {
			this.imgEl?.removeEventListener("load", this.imageLoadedCallback, false);
			this.imageLoadedCallback = undefined;

		}
		if (this.mouseDownCallback)
			this.el.removeEventListener("mousedown", this.mouseDownCallback, false);
		this.mouseDownCallback = undefined;

		super.dealloc();
	}

	// override
	public getTemplate(): string {
		return `<cf-button class="cf-button">
				` + this.referenceTag?.label + `
			</cf-button>
			`;
	}
}


