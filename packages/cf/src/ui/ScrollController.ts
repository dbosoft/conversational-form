import { Helpers, TouchVector2d } from "../logic/Helpers";
import { IEventTarget } from "../logic/IEventTarget";

export type ScrollControllerOptions = {
	interactionListener: HTMLElement;
	eventTarget: IEventTarget;
	listToScroll: HTMLElement;
	listNavButtons: HTMLCollectionOf<Element>;
	acceleration: number;
}
export class ScrollController {
	private eventTarget: IEventTarget;
	private interactionListener: HTMLElement;
	private listToScroll: HTMLElement;
	private listWidth: number = 0;
	private prevButton: Element;
	private nextButton: Element;
	private acceleration: number;

	private rAF?: number;
	private visibleAreaWidth: number = 0;
	private max: number = 0;

	private onListNavButtonsClickCallback?: (event: Event) => void;
	private documentLeaveCallback?: (event: Event) => void;
	private onInteractStartCallback?: (event: Event) => void;
	private onInteractEndCallback?: (event: Event) => void;
	private onInteractMoveCallback?: (event: Event) => void;

	private interacting: boolean = false;
	private x: number = 0;
	private xTarget: number = 0;
	private startX: number = 0;
	private startXTarget: number = 0;
	private mouseSpeed: number = 0;
	private mouseSpeedTarget: number = 0;
	private direction: number = 0;
	private directionTarget: number = 0;
	private inputAccerlation: number = 0;
	private inputAccerlationTarget: number = 0;

	constructor(options: ScrollControllerOptions) {
		this.interactionListener = options.interactionListener;
		this.eventTarget = options.eventTarget;
		this.listToScroll = options.listToScroll;
		this.prevButton = options.listNavButtons[0];
		this.nextButton = options.listNavButtons[1];
		this.acceleration = options.acceleration;

		this.onListNavButtonsClickCallback = this.onListNavButtonsClick.bind(this);
		this.prevButton.addEventListener("click", this.onListNavButtonsClickCallback, false);
		this.nextButton.addEventListener("click", this.onListNavButtonsClickCallback, false);

		this.documentLeaveCallback = this.documentLeave.bind(this);
		this.onInteractStartCallback = this.onInteractStart.bind(this);
		this.onInteractEndCallback = this.onInteractEnd.bind(this);
		this.onInteractMoveCallback = this.onInteractMove.bind(this);

		document.addEventListener("mouseleave", this.documentLeaveCallback, false);
		document.addEventListener(Helpers.getMouseEvent("mouseup"), this.documentLeaveCallback, false);
		this.interactionListener.addEventListener(Helpers.getMouseEvent("mousedown"), this.onInteractStartCallback, false);
		this.interactionListener.addEventListener(Helpers.getMouseEvent("mouseup"), this.onInteractEndCallback, false);
		this.interactionListener.addEventListener(Helpers.getMouseEvent("mousemove"), this.onInteractMoveCallback, false);
	}

	private onListNavButtonsClick(event: Event) {
		const dirClick: string = (<HTMLElement>event.currentTarget).getAttribute("direction") ?? "";
		this.pushDirection(dirClick == "next" ? -1 : 1);
	}

	private documentLeave(event: Event) {
		this.onInteractEnd(event);
	}

	private onInteractStart(event: Event) {
		const vector: TouchVector2d = Helpers.getXYFromMouseTouchEvent(event);

		this.interacting = true;
		this.startX = vector.x;
		this.startXTarget = this.startX;
		this.inputAccerlation = 0;

		this.render();
	}

	private onInteractEnd(event: Event) {
		this.interacting = false;
	}

	private onInteractMove(event: Event) {
		if (this.interacting) {
			const vector: TouchVector2d = Helpers.getXYFromMouseTouchEvent(event);
			const newAcc: number = vector.x - this.startX;

			const magnifier: number = 6.2;
			this.inputAccerlationTarget = newAcc * magnifier;

			this.directionTarget = this.inputAccerlationTarget < 0 ? -1 : 1;
			this.startXTarget = vector.x;
		}
	}

	private render() {
		if (this.rAF)
			cancelAnimationFrame(this.rAF);


		// normalise startX
		this.startX += (this.startXTarget - this.startX) * 0.2;

		// animate accerlaration
		this.inputAccerlation += (this.inputAccerlationTarget - this.inputAccerlation) * (this.interacting
			? Math.min(this.acceleration + 0.1, 1)
			: this.acceleration);

		const accDamping: number = 0.25;
		this.inputAccerlationTarget *= accDamping;

		// animate directions
		this.direction += (this.directionTarget - this.direction) * 0.2;

		// extra extra
		this.mouseSpeed += (this.mouseSpeedTarget - this.mouseSpeed) * 0.2;
		this.direction += this.mouseSpeed;

		// animate x
		this.xTarget += this.inputAccerlation * 0.05;

		// bounce back when over
		if (this.xTarget > 0)
			this.xTarget += (0 - this.xTarget) * Helpers.lerp(this.acceleration, 0.3, 0.8);

		if (this.xTarget < this.max)
			this.xTarget += (this.max - this.xTarget) * Helpers.lerp(this.acceleration, 0.3, 0.8);

		this.x += (this.xTarget - this.x) * 0.4;

		// toggle visibility on nav arrows

		const xRounded: number = Math.round(this.x);
		if (xRounded < 0) {
			if (!this.prevButton.classList.contains("active"))
				this.prevButton.classList.add("active");
			if (!this.prevButton.classList.contains("cf-gradient"))
				this.prevButton.classList.add("cf-gradient");
		}

		if (xRounded == 0) {
			if (this.prevButton.classList.contains("active"))
				this.prevButton.classList.remove("active");
			if (this.prevButton.classList.contains("cf-gradient"))
				this.prevButton.classList.remove("cf-gradient");
		}

		if (xRounded > this.max) {
			if (!this.nextButton.classList.contains("active"))
				this.nextButton.classList.add("active");
			if (!this.nextButton.classList.contains("cf-gradient"))
				this.nextButton.classList.add("cf-gradient");
		}

		if (xRounded <= this.max) {
			if (this.nextButton.classList.contains("active"))
				this.nextButton.classList.remove("active");
			if (this.nextButton.classList.contains("cf-gradient"))
				this.nextButton.classList.remove("cf-gradient");
		}

		// set css transforms
		const xx: number = this.x;
		Helpers.setTransform(this.listToScroll, "translateX(" + xx + "px)");

		// cycle render
		if (this.interacting || (Math.abs(this.x - this.xTarget) > 0.02 && !this.interacting))
			this.rAF = window.requestAnimationFrame(() => this.render());
	}

	public setScroll(x: number, y: number) {
		this.xTarget = this.visibleAreaWidth == this.listWidth ? 0 : x;
		this.render();
	}

	public pushDirection(dir: number) {
		this.inputAccerlationTarget += (5000) * dir;
		this.render();
	}

	public dealloc() {

		if (this.onListNavButtonsClickCallback)
			this.nextButton.removeEventListener("click", this.onListNavButtonsClickCallback, false);
		this.onListNavButtonsClickCallback = undefined;

		if (this.documentLeaveCallback)
			document.removeEventListener("mouseleave", this.documentLeaveCallback, false);

		if (this.documentLeaveCallback)
			document.removeEventListener(Helpers.getMouseEvent("mouseup"), this.documentLeaveCallback, false);

		if (this.onInteractStartCallback)
			this.interactionListener.removeEventListener(Helpers.getMouseEvent("mousedown"), this.onInteractStartCallback, false);

		if (this.onInteractEndCallback)
			this.interactionListener.removeEventListener(Helpers.getMouseEvent("mouseup"), this.onInteractEndCallback, false);

		if (this.onInteractMoveCallback)
			this.interactionListener.removeEventListener(Helpers.getMouseEvent("mousemove"), this.onInteractMoveCallback, false);

		this.documentLeaveCallback = undefined;
		this.onInteractStartCallback = undefined;
		this.onInteractEndCallback = undefined;
		this.onInteractMoveCallback = undefined;
	}

	public reset() {
		this.interacting = false;
		this.startX = 0;
		this.startXTarget = this.startX;
		this.inputAccerlation = 0;
		this.x = 0;
		this.xTarget = 0;
		Helpers.setTransform(this.listToScroll, "translateX(0px)");
		this.render();
		this.prevButton.classList.remove("active");
		this.nextButton.classList.remove("active");
	}

	public resize(listWidth: number, visibleAreaWidth: number) {
		this.reset();
		this.visibleAreaWidth = visibleAreaWidth;
		this.listWidth = Math.max(visibleAreaWidth, listWidth);
		this.max = (this.listWidth - this.visibleAreaWidth) * -1;
		this.render();
	}
}
