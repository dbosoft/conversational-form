import { CFGlobals } from "../../CFGlobal";
import { Dictionary } from "../../data/Dictionary";
import { FlowDTO } from "../../form-tags/ITag";
import { FlowEvents } from "../../logic/FlowManager";
import { Helpers } from "../../logic/Helpers";
import { Button } from "./Button";
import { IControlElementOptions, ControlElementEvents, ControlElementProgressStates } from "./IControlElement";

// class
export class UploadFileUI extends Button {
	private maxFileSize: number = 100000000000;
	private onDomElementChangeCallback?: (event: Event) => void;
	private progressBar: HTMLElement;
	private loading: boolean = false;
	private submitTimer: undefined | ReturnType<typeof setTimeout> = undefined;
	private _fileName: string = "";
	private _readerResult: string = "";
	private _files: FileList = new FileList();

	public get value(): string {
		return (<HTMLInputElement>this.referenceTag?.domElement).value;//;this.readerResult || this.fileName;
	}

	public get readerResult(): string {
		return this._readerResult;
	}

	public get files(): FileList {
		return this._files;
	}

	public get fileName(): string {
		return this._fileName;
	}

	public get type(): string {
		return "UploadFileUI";
	}

	constructor(options: IControlElementOptions) {
		super(options);

		if (Helpers.caniuse.fileReader()) {
			const maxFileSizeStr: string = (this.referenceTag?.domElement.getAttribute("cf-max-size")
				|| this.referenceTag?.domElement.getAttribute("max-size")) ?? "";
			if (maxFileSizeStr) {
				const maxFileSize: number = parseInt(maxFileSizeStr, 10);
				this.maxFileSize = maxFileSize;
			}

			this.progressBar = <HTMLElement>this.el.getElementsByTagName("cf-upload-file-progress-bar")[0];

			this.onDomElementChangeCallback = this.onDomElementChange.bind(this);
			this.referenceTag?.domElement.addEventListener("change", this.onDomElementChangeCallback, false);
		} else {
			throw new Error("Conversational Form Error: No FileReader available for client.");
		}
	}

	public getFilesAsString(): string {
		// value is for the chat response -->
		var icon = document.createElement("span");
		icon.innerHTML = this.cfReference.dictionary.get("icon-type-file") + this.fileName;
		return icon.outerHTML;
	}

	private onDomElementChange(event: Event) {
		if (!CFGlobals.suppressLog) console.log("...onDomElementChange");

		var reader: FileReader = new FileReader();
		this._files = (<HTMLInputElement>this.referenceTag?.domElement).files ?? new FileList();

		reader.onerror = (event: any) => {
			if (!CFGlobals.suppressLog) console.log("onerror", event);
		}
		reader.onprogress = (event: ProgressEvent) => {
			if (!CFGlobals.suppressLog) console.log("onprogress", event);

			this.progressBar.style.width = ((event.loaded / event.total) * 100) + "%";
		}
		reader.onabort = (event: any) => {
			if (!CFGlobals.suppressLog) console.log("onabort", event);
		}
		reader.onloadstart = (event: any) => {
			// check for file size
			const file: File = this.files[0];
			const fileSize: number = file ? file.size : this.maxFileSize + 1;// if file is undefined then abort ...
			if (fileSize > this.maxFileSize) {
				reader.abort();
				const dto: FlowDTO = {
					errorText: this.cfReference.dictionary.get("input-placeholder-file-size-error")
				};

				CFGlobals.illustrateFlow(this, "dispatch", FlowEvents.USER_INPUT_INVALID, dto)
				this.eventTarget.dispatchEvent(new CustomEvent(FlowEvents.USER_INPUT_INVALID, {
					detail: dto
				}));
			} else {
				// good to go
				this._fileName = file.name;
				this.loading = true;
				this.animateIn();
				// set text
				let sizeConversion: number = Math.floor(Math.log(fileSize) / Math.log(1024));
				const sizeChart: Array<string> = ["b", "kb", "mb", "gb"];
				sizeConversion = Math.min(sizeChart.length - 1, sizeConversion);
				const humanSizeString: string = Number((fileSize / Math.pow(1024, sizeConversion)).toFixed(2)) * 1 + " " + sizeChart[sizeConversion];

				const text: string = file.name + " (" + humanSizeString + ")";
				this.el.getElementsByTagName("cf-upload-file-text")[0].innerHTML = text;

				this.eventTarget.dispatchEvent(new CustomEvent(ControlElementEvents.PROGRESS_CHANGE, {
					detail: ControlElementProgressStates.BUSY
				}));
			}
		}

		reader.onload = (event: any) => {
			this._readerResult = event.target.result;
			this.progressBar.classList.add("loaded");
			this.submitTimer = setTimeout(() => {
				this.el.classList.remove("animate-in");
				this.onChoose(); // submit the file

				this.eventTarget.dispatchEvent(new CustomEvent(ControlElementEvents.PROGRESS_CHANGE, {
					detail: ControlElementProgressStates.READY
				}));
			}, 0);
		}

		reader.readAsDataURL(this.files[0]);
	}

	public animateIn() {
		if (this.loading)
			super.animateIn();
	}

	protected onClick(event: MouseEvent) {
		// super.onClick(event);
	}

	public triggerFileSelect() {
		// trigger file prompt
		this.referenceTag?.domElement.click();
	}

	// override

	public dealloc() {
		clearTimeout(this.submitTimer);

		if (this.onDomElementChangeCallback) {
			this.referenceTag?.domElement.removeEventListener("change", this.onDomElementChangeCallback, false);
			this.onDomElementChangeCallback = undefined;
		}

		super.dealloc();
	}

	public getTemplate(): string {
		const isChecked: boolean = (this.referenceTag?.value == "1" || this.referenceTag?.domElement.hasAttribute("checked"))
			?? false

		return `<cf-upload-file-ui>
				<cf-upload-file-text></cf-upload-file-text>
				<cf-upload-file-progress>
					<cf-upload-file-progress-bar></cf-upload-file-progress-bar>
				</cf-upload-file-progress>
			</cf-upload-file-ui>
			`;
	}
}
