import { CFGlobals } from "./CFGlobal";
import { Dictionary } from "./data/Dictionary";
import { InputTag } from "./form-tags/InputTag";
import { FlowDTO, ITag, ITagGroup } from "./form-tags/ITag";
import { ITagBuilder } from "./form-tags/ITagBuilder";
import { TagBuilder } from "./form-tags/TagBuilder";
import { TagGroup } from "./form-tags/TagGroup";
import { TagHelper } from "./form-tags/TagHelper";
import { IConversationalForm } from "./interfaces/IConversationalForm";
import { IUserInput } from "./interfaces/IUserInput";
import { IUserInterfaceOptions, UserInterfaceDefaultOptions } from "./interfaces/IUserInterfaceOptions";
import { EventDispatcher } from "./logic/EventDispatcher";
import { FlowManager } from "./logic/FlowManager";
import { Helpers } from "./logic/Helpers";
import { ConversationalFormOptions, ConversationalFormlessOptions } from "./options/ConversationalFormOptions";
import { DataTag, TagsParser } from "./parsing/TagsParser";
import { ChatList } from "./ui/chat/ChatList";
import { ChatResponseEvents } from "./ui/chat/ChatResponse";
import { UserInputElement } from "./ui/inputs/UserInputElement";
import { UserTextInput } from "./ui/inputs/UserTextInput";
import { ProgressBar } from "./ui/ProgressBar";
import { ScrollController } from "./ui/ScrollController";

export class ConversationalForm implements IConversationalForm {
	public version: string = "1.0.2";


	private cdnPath: string = "https://cdn.jsdelivr.net/gh/space10-community/conversational-form@{version}/dist/";
	/**
	 * createId
	 * Id of the instance, to isolate events
	 */
	private _createId: string
	public get createId(): string {
		if (!this._createId) {
			this._createId = new Date().getTime().toString();
		}

		return this._createId;
	}

	// instance specific event target
	private _eventTarget: EventDispatcher;
	public get eventTarget(): EventDispatcher {
		if (!this._eventTarget) {
			this._eventTarget = new EventDispatcher(this);
		}

		return this._eventTarget;
	}

	public dictionary: Dictionary;
	public el: HTMLElement;
	public chatList: ChatList;
	public uiOptions: IUserInterfaceOptions;
	public options: ConversationalFormOptions;
	public preventSubmitOnEnter: boolean;

	private context: HTMLElement;
	private formEl: HTMLFormElement;
	private submitCallback: (cf: ConversationalForm) => void | HTMLButtonElement;
	private onUserAnswerClickedCallback: () => void;
	private flowStepCallback: (dto: FlowDTO, success: () => void, error: () => void) => void;
	private tags: Array<ITag | ITagGroup>;
	private flowManager: FlowManager;
	private isDevelopment: boolean = false;
	private loadExternalStyleSheet: boolean = true;
	private theme: String = 'light';
	private preventAutoAppend: boolean = false;
	private preventAutoStart: boolean = false;

	private userInput: UserTextInput;
	private microphoneInputObj: IUserInput;
	private tagBuilder: ITagBuilder;

	constructor(options: ConversationalFormOptions) {
		(<any>window).ConversationalForm = this;

		this.cdnPath = this.cdnPath.split("{version}").join(this.version);

		if (typeof options.suppressLog === 'boolean')
			CFGlobals.suppressLog = options.suppressLog;

		if (typeof options.showProgressBar === 'boolean')
			CFGlobals.showProgressBar = options.showProgressBar;

		if (typeof options.preventSubmitOnEnter === 'boolean')
			this.preventSubmitOnEnter = options.preventSubmitOnEnter;

		if (!CFGlobals.suppressLog) console.log('Conversational Form > version:', this.version);
		if (!CFGlobals.suppressLog) console.log('Conversational Form > options:', options);

		(<any>window).ConversationalForm[this.createId] = this;

		// possible to create your own event dispatcher, so you can tap into the events of the app
		if (options.eventDispatcher)
			this._eventTarget = <EventDispatcher>options.eventDispatcher;

		if (!this.eventTarget.cf)
			this.eventTarget.cf = this;

		// set a general step validation callback
		if (options.flowStepCallback)
			this.flowStepCallback = options.flowStepCallback;

		this.isDevelopment = CFGlobals.illustrateAppFlow = !!document.getElementById("conversational-form-development");

		if (options.loadExternalStyleSheet == false) {
			this.loadExternalStyleSheet = false;
		}

		if (typeof options.theme === 'string')
			this.theme = options.theme;

		if (!isNaN(options.scrollAcceleration))
			ScrollController.acceleration = options.scrollAcceleration;

		this.preventAutoStart = options.preventAutoStart;
		this.preventAutoAppend = options.preventAutoAppend;

		if (!options.formEl)
			throw new Error("Conversational Form error, the formEl needs to be defined.");

		this.formEl = options.formEl;
		this.formEl.setAttribute("cf-create-id", this.createId);

		if (options.hideUserInputOnNoneTextInput === true) {
			UserInputElement.hideUserInputOnNoneTextInput = true;
		}

		this.submitCallback = options.submitCallback;
		if (this.submitCallback && typeof this.submitCallback === "string") {
			// Must be a string on window, rewritten to avoid unsafe eval() calls
			const fn = (window as any)[this.submitCallback];
			this.submitCallback = fn;
		}

		if (this.formEl.getAttribute("cf-no-animation") == "")
			CFGlobals.animationsEnabled = false;

		if (
			typeof options.animationsEnabled === 'boolean'
			&& options.animationsEnabled === false
		) {
			CFGlobals.animationsEnabled = false;
			this.formEl.setAttribute("cf-no-animation", "");
		}

		if (options.preventAutoFocus || this.formEl.getAttribute("cf-prevent-autofocus") == "")
			UserInputElement.preventAutoFocus = true;

		this.dictionary = new Dictionary({
			data: options.dictionaryData,
			robotData: options.dictionaryRobot,
			userImage: options.userImage,
			robotImage: options.robotImage,
			version: this.version
		});

		this.context = options.context ? options.context : document.body;
		this.tags = options.tags;

		if (options.microphoneInput) {
			// validate the user ..... TODO....
			if (!options.microphoneInput.init || !options.microphoneInput.input) {
				console.warn("Conversational Form: microphoneInput is not correctly setup", options.microphoneInput);
				options.microphoneInput = null;
			}
		}

		this.microphoneInputObj = options.microphoneInput;

		// set the ui options
		this.uiOptions = Helpers.extendObject(UserInterfaceDefaultOptions, options.userInterfaceOptions || {});
		// console.log('this.uiOptions:', this.uiOptions);

		this.options = options;
		this.tagBuilder = new TagBuilder();

		this.init();
	}

	public init(): ConversationalForm {
		switch (this.theme) {
			case 'dark':
				this.theme = 'conversational-form-dark.min.css';
				if (!this.options.robotImage) this.updateDictionaryValue('robot-image', 'robot', "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='100' fill='%233A3A3C'/%3E%3Crect x='66' y='66' width='68' height='68' fill='%23E5E6EA'/%3E%3C/svg%3E%0A");
				if (!this.options.userImage) this.updateDictionaryValue('user-image', 'user', "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23E5E6EA'/%3E%3Cpath d='M100 55L138.971 122.5H61.0289L100 55Z' fill='%233A3A3C'/%3E%3C/svg%3E%0A");
				break;
			case 'green':
				this.theme = 'conversational-form-green.min.css';
				if (!this.options.robotImage) this.updateDictionaryValue('robot-image', 'robot', "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23EEEFF0'/%3E%3Crect x='66' y='66' width='68' height='68' fill='%2300BF75'/%3E%3C/svg%3E%0A");
				if (!this.options.userImage) this.updateDictionaryValue('user-image', 'user', "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='100' fill='%2300BF75'/%3E%3Cpath d='M100 55L138.971 122.5H61.0289L100 55Z' fill='%23EEEFF0'/%3E%3C/svg%3E%0A");
				break;
			case 'blue':
				this.theme = 'conversational-form-irisblue.min.css';
				if (!this.options.robotImage) this.updateDictionaryValue('robot-image', 'robot', "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23E8E9EB'/%3E%3Crect x='66' y='66' width='68' height='68' fill='%2300C2DF'/%3E%3C/svg%3E%0A");
				if (!this.options.userImage) this.updateDictionaryValue('user-image', 'user', "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='100' fill='%2300C2DF'/%3E%3Cpath d='M100 55L138.971 122.5H61.0289L100 55Z' fill='%23E8E9EB'/%3E%3C/svg%3E%0A");
				break;
			case 'purple':
				this.theme = 'conversational-form-purple.min.css';
				if (!this.options.robotImage) this.updateDictionaryValue('robot-image', 'robot', "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23EEEFF0'/%3E%3Crect x='66' y='66' width='68' height='68' fill='%235A1DE4'/%3E%3C/svg%3E%0A");
				if (!this.options.userImage) this.updateDictionaryValue('user-image', 'user', "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='100' fill='%235A1DE4'/%3E%3Cpath d='M100 55L138.971 122.5H61.0289L100 55Z' fill='%23EEEFF0'/%3E%3C/svg%3E%0A");
				break;
			case 'red':
				this.theme = 'conversational-form-red.min.css';
				if (!this.options.robotImage) this.updateDictionaryValue('robot-image', 'robot', "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23E8E9EB'/%3E%3Crect x='66' y='66' width='68' height='68' fill='%23FF3233'/%3E%3C/svg%3E%0A");
				if (!this.options.userImage) this.updateDictionaryValue('user-image', 'user', "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23FF3233'/%3E%3Cpath d='M100 55L138.971 122.5H61.0289L100 55Z' fill='%23E8E9EB'/%3E%3C/svg%3E%0A");
				break;
			default:
				this.theme = 'conversational-form.min.css';
		}

		if (this.isDevelopment) {
			// Set path for development
			this.cdnPath = '../build/';

			// strip .min from filename since we do not have minified css in build
			this.theme = this.theme.replace('.min', '');
		}

		if (this.loadExternalStyleSheet) {
			// not in development/examples, so inject production css
			const head: HTMLHeadElement = document.head || document.getElementsByTagName("head")[0];
			const style: HTMLStyleElement = document.createElement("link");
			const githubMasterUrl: string = this.cdnPath + this.theme;
			style.type = "text/css";
			style.media = "all";
			style.setAttribute("rel", "stylesheet");
			style.setAttribute("href", githubMasterUrl);
			head.appendChild(style);
		}

		// set context position to relative, else we break out of the box
		const position: string = window.getComputedStyle(this.context).getPropertyValue("position").toLowerCase();
		if (["fixed", "absolute", "relative"].indexOf(position) == -1) {
			this.context.style.position = "relative";
		}

		// if tags are not defined then we will try and build some tags our selves..
		if (!this.tags || this.tags.length == 0) {
			this.tags = [];

			let fields: Array<HTMLInputElement | HTMLSelectElement | HTMLButtonElement> = [].slice.call(this.formEl.querySelectorAll("input, select, button, textarea, cf-robot-message"), 0);

			for (var i = 0; i < fields.length; i++) {
				const element = fields[i];
				if (TagHelper.isTagValid(element)) {
					// ignore hidden tags
					this.tags.push(this.tagBuilder.createTag(element));
				}
			}
		} else {
			// tags are manually setup and passed as options.tags.
		}

		// remove invalid tags if they've sneaked in.. this could happen if tags are setup manually as we don't encurage to use static Tag.isTagValid
		const indexesToRemove: Array<ITag> = [];
		for (var i = 0; i < this.tags.length; i++) {
			const element = this.tags[i];
			if (!element || !TagHelper.isTagValid(element.domElement)) {
				indexesToRemove.push(element);
			}
		}

		for (var i = 0; i < indexesToRemove.length; i++) {
			var tag: ITag = indexesToRemove[i];
			this.tags.splice(this.tags.indexOf(tag), 1);
		}

		if (!CFGlobals.suppressLog && (!this.tags || this.tags.length == 0)) {
			console.warn("Conversational Form: No tags found or registered.");
		}

		//let's start the conversation
		this.tags = this.setupTagGroups(this.tags);
		this.setupUI();

		return this;
	}

	/**
	* @name updateDictionaryValue
	* set a dictionary value at "runtime"
	*	id: string, id of the value to update
	*	type: string, "human" || "robot"
	*	value: string, value to be inserted
	*/
	public updateDictionaryValue(id: string, type: string, value: string) {
		Dictionary.set(id, type, value);

		// if(["robot-image", "user-image"].indexOf(id) != -1){
		// 	this.chatList.updateThumbnail(id == "robot-image", value);
		// }
	}

	public getFormData(serialized: boolean = false): FormData | any {
		if (serialized) {
			const serialized: any = {}
			for (var i = 0; i < this.tags.length; i++) {
				const element = this.tags[i];
				if (element.value)
					serialized[element.name || "tag-" + i.toString()] = element.value
			}

			return serialized
		} else {
			var formData: FormData = new FormData(this.formEl);
			return formData;
		}
	}

	public addRobotChatResponse(response: string) {
		this.chatList.createResponse(true, null, response);
	}

	public addUserChatResponse(response: string) {
		// add a "fake" user response..
		this.chatList.createResponse(false, null, response);
	}

	public stop(optionalStoppingMessage: string = "") {
		this.flowManager.stop();
		if (optionalStoppingMessage != "")
			this.chatList.createResponse(true, null, optionalStoppingMessage);

		this.userInput.onFlowStopped();
	}

	public start() {
		this.userInput.disabled = false;
		if (!CFGlobals.suppressLog) console.log('option, disabled 3',);
		this.userInput.visible = true;

		this.flowManager.start();
	}

	public getTag(nameOrIndex: string | number): ITag {
		if (typeof nameOrIndex == "number") {
			return this.tags[nameOrIndex];
		} else {
			// TODO: fix so you can get a tag by its name attribute
			return null;
		}
	}

	public removeStepFromChatList(index: number): void {
		this.chatList.clearFrom(index);
	}

	private setupTagGroups(tags: Array<ITag>): Array<ITag | ITagGroup> {
		// make groups, from input tag[type=radio | type=checkbox]
		// groups are used to bind logic like radio-button or checkbox dependencies
		var groups: any = [];
		for (var i = 0; i < tags.length; i++) {
			const tag: ITag = tags[i];
			if (tag.type == "radio" || tag.type == "checkbox") {
				if (!groups[tag.name])
					groups[tag.name] = [];

				groups[tag.name].push(tag);
			}
		}

		if (Object.keys(groups).length > 0) {
			for (let group in groups) {
				if (groups[group].length > 0) {
					// always build groupd when radio or checkbox

					// find the fieldset, if any..
					let isFieldsetValidForCF = (tag: HTMLElement): boolean => { return tag && tag.tagName.toLowerCase() !== "fieldset" && !tag.hasAttribute("cf-questions") };

					let fieldset: HTMLElement = groups[group][0].domElement.parentNode;
					if (fieldset && fieldset.tagName.toLowerCase() !== "fieldset") {
						fieldset = <HTMLElement>fieldset.parentNode;
						if (isFieldsetValidForCF(fieldset)) {
							// not a valid fieldset, we only accept fieldsets that contain cf attr
							fieldset = null;
						}
					}

					const tagGroup: TagGroup = new TagGroup({
						fieldset: <HTMLFieldSetElement>fieldset, // <-- can be null
						elements: groups[group]
					});

					// remove the tags as they are now apart of a group
					for (var i = 0; i < groups[group].length; i++) {
						let tagToBeRemoved: InputTag = groups[group][i];
						if (i == 0)// add the group at same index as the the first tag to be removed
							tags.splice(tags.indexOf(tagToBeRemoved), 1, tagGroup);
						else
							tags.splice(tags.indexOf(tagToBeRemoved), 1);
					}
				}
			}
		}

		return tags;
	}


	private setupUI() {
		// start the flow
		this.flowManager = new FlowManager({
			cfReference: this,
			flowStepCallback: this.flowStepCallback,
			eventTarget: this.eventTarget,
			tags: this.tags
		});

		this.el = document.createElement("div");
		this.el.id = "conversational-form";
		this.el.className = "conversational-form";

		this.addBrowserTypes(this.el);

		if (CFGlobals.animationsEnabled)
			this.el.classList.add("conversational-form--enable-animation");

		// add conversational form to context
		if (!this.preventAutoAppend)
			this.context.appendChild(this.el);

		//hide until stylesheet is rendered
		this.el.style.visibility = "hidden";

		var innerWrap = document.createElement("div");
		innerWrap.className = "conversational-form-inner";
		this.el.appendChild(innerWrap);

		// Conversational Form UI
		this.chatList = new ChatList({
			eventTarget: this.eventTarget,
			cfReference: this
		});

		innerWrap.appendChild(this.chatList.el);

		this.userInput = new UserTextInput({
			microphoneInputObj: this.microphoneInputObj,
			eventTarget: this.eventTarget,
			cfReference: this
		});

		if (CFGlobals.showProgressBar) {
			const progressBar = new ProgressBar(this);
			innerWrap.appendChild(progressBar.el);
		}

		this.chatList.addInput(this.userInput);

		innerWrap.appendChild(this.userInput.el);

		this.onUserAnswerClickedCallback = this.onUserAnswerClicked.bind(this);
		this.eventTarget.addEventListener(ChatResponseEvents.USER_ANSWER_CLICKED, this.onUserAnswerClickedCallback, false);

		this.el.classList.add("conversational-form--show")

		if (!this.preventAutoStart)
			this.flowManager.start();

		if (!this.tags || this.tags.length == 0) {
			// no tags, so just show the input
			this.userInput.visible = true;
		}
	}

	/**
	* @name onUserAnswerClicked
	* on user ChatReponse clicked
	*/
	private onUserAnswerClicked(event: CustomEvent): void {
		const tag: ITag | ITagGroup = event.detail;
		this.flowManager.editTag(tag);
	}

	private addBrowserTypes(el: Element): void {
		if (navigator.userAgent.indexOf('Firefox') > -1) el.classList.add('browser-firefox');
		if (/Edge/.test(navigator.userAgent)) el.classList.add('browser-edge');
	}

	/**
	* @name addTag
	* Add a tag to the conversation. This can be used to add tags at runtime
	* see examples/formless.html
	*/
	public addTags(tagsData: Array<DataTag>, addAfterCurrentStep: boolean = true, atIndex: number = -1): void {
		let tags: Array<ITag | ITagGroup> = [];

		for (let i = 0; i < tagsData.length; i++) {
			let tagData: DataTag = tagsData[i];

			if (tagData.tag === "fieldset") {
				// group ..
				// const fieldSetChildren: Array<DataTag> = tagData.children;
				// parse group tag
				const groupTag: HTMLElement = TagsParser.parseGroupTag(tagData);

				for (let j = 0; j < groupTag.children.length; j++) {
					let tag: HTMLElement = <HTMLElement>groupTag.children[j];
					if (TagHelper.isTagValid(tag)) {
						let tagElement: ITag = this.tagBuilder.createTag(<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>tag);
						// add ref for group creation
						if (!tagElement.name) {
							tagElement.name = "tag-ref-" + j.toString();
						}

						tags.push(tagElement);
					}
				}
			} else {
				let tag: HTMLElement | HTMLInputElement | HTMLSelectElement | HTMLButtonElement = tagData.tag === "select" ? TagsParser.parseGroupTag(tagData) : TagsParser.parseTag(tagData);
				if (TagHelper.isTagValid(tag)) {
					let tagElement: ITag = this.tagBuilder.createTag(<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>tag);
					tags.push(tagElement);
				}
			}
		}

		// map free roaming checkbox and radio tags into groups
		tags = this.setupTagGroups(tags);

		// add new tags to the flow
		this.tags = this.flowManager.addTags(tags, addAfterCurrentStep ? this.flowManager.getStep() + 1 : atIndex);
		//this.flowManager.startFrom ?
	}

	/**
	* @name remapTagsAndStartFrom
	* index: number, what index to start from
	* setCurrentTagValue: boolean, usually this method is called when wanting to loop or skip over questions, therefore it might be usefull to set the value of the current tag before changing index.
	* ignoreExistingTags: boolean, possible to ignore existing tags, to allow for the flow to just "happen"
	*/
	public remapTagsAndStartFrom(index: number = 0, setCurrentTagValue: boolean = false, ignoreExistingTags: boolean = false) {
		if (setCurrentTagValue) {
			this.chatList.setCurrentUserResponse(this.userInput.getFlowDTO());
		}
		// possibility to start the form flow over from {index}
		for (var i = 0; i < this.tags.length; i++) {
			const tag: ITag | ITagGroup = this.tags[i];
			tag.refresh();
		}

		this.flowManager.startFrom(index, ignoreExistingTags);
	}

	/**
	* @name focus
	* Sets focus on Conversational Form
	*/
	public focus() {
		if (this.userInput)
			this.userInput.setFocusOnInput();
	}

	public doSubmitForm() {
		this.el.classList.add("done");

		this.userInput.reset();

		if (this.submitCallback) {
			// remove should be called in the submitCallback
			this.submitCallback(this);
		} else {
			// this.formEl.submit();
			// doing classic .submit wont trigger onsubmit if that is present on form element
			// as described here: http://wayback.archive.org/web/20090323062817/http://blogs.vertigosoftware.com/snyholm/archive/2006/09/27/3788.aspx
			// so we mimic a click.
			var button: HTMLButtonElement = this.formEl.ownerDocument.createElement('button');
			button.style.display = 'none';
			button.type = 'submit';
			this.formEl.appendChild(button);
			button.click();
			this.formEl.removeChild(button);

			// remove conversational
			this.remove();
		}
	}

	public remove() {
		if (this.microphoneInputObj) {
			this.microphoneInputObj = null;
		}

		if (this.onUserAnswerClickedCallback) {
			this.eventTarget.removeEventListener(ChatResponseEvents.USER_ANSWER_CLICKED, this.onUserAnswerClickedCallback, false);
			this.onUserAnswerClickedCallback = null;
		}

		if (this.flowManager)
			this.flowManager.dealloc();
		if (this.userInput)
			this.userInput.dealloc();
		if (this.chatList)
			this.chatList.dealloc();

		this.dictionary = null;
		this.flowManager = null;
		this.userInput = null;
		this.chatList = null;
		this.context = null;
		this.formEl = null;
		this.tags = null;

		this.submitCallback = null;
		this.el.parentNode.removeChild(this.el);
		this.el = null;

		(<any>window).ConversationalForm[this.createId] = null;
	}

	private static hasAutoInstantiated: boolean = false;
	public static startTheConversation(data: ConversationalFormOptions | ConversationalFormlessOptions) {
		let isFormless: boolean = !!(<any>data).formEl === false;
		let formlessTags: any;
		let constructorOptions: ConversationalFormOptions;

		if (isFormless) {
			if (typeof data === "string") {
				// Formless init w. string
				isFormless = true;
				const json: any = JSON.parse(data)
				constructorOptions = (<ConversationalFormlessOptions>json).options;
				formlessTags = (<ConversationalFormlessOptions>json).tags;
			} else {
				// Formless init w. JSON object
				constructorOptions = (<ConversationalFormlessOptions>data).options;
				formlessTags = (<ConversationalFormlessOptions>data).tags;
			}

			// formless, so generate the pseudo tags
			const formEl: HTMLFormElement = TagsParser.parseJSONIntoElements(formlessTags)
			constructorOptions.formEl = formEl;
		} else {
			// keep it standard
			constructorOptions = <ConversationalFormOptions>data;
		}

		return new ConversationalForm(constructorOptions);
	}

	public static autoStartTheConversation() {
		if (ConversationalForm.hasAutoInstantiated)
			return;

		// auto start the conversation
		let formElements: NodeListOf<Element> = document.querySelectorAll("form[cf-form]");

		// no form elements found, look for the old init attribute
		if (formElements.length === 0) {
			formElements = document.querySelectorAll("form[cf-form-element]");
		}

		const formContexts: NodeListOf<Element> = document.querySelectorAll("*[cf-context]");

		if (formElements && formElements.length > 0) {
			for (let i = 0; i < formElements.length; i++) {
				let form: HTMLFormElement = <HTMLFormElement>formElements[i];
				let context: HTMLFormElement = <HTMLFormElement>formContexts[i];
				ConversationalForm.startTheConversation({
					formEl: form,
					context: context
				});
			}

			ConversationalForm.hasAutoInstantiated = true;
		}
	}
}
