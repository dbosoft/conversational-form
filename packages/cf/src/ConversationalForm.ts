import { CreateOptions, defaultOptions } from ".";
import { CFGlobals } from "./CFGlobal";
import { Dictionary } from "./data/Dictionary";
import { InputTag } from "./form-tags/InputTag";
import { FlowDTO, IDomTag, ITag, ITagGroup } from "./form-tags/ITag";
import { ITagBuilder } from "./form-tags/ITagBuilder";
import { TagBuilder } from "./form-tags/TagBuilder";
import { TagGroup } from "./form-tags/TagGroup";
import { TagHelper } from "./form-tags/TagHelper";
import { IConversationalForm } from "./interfaces/IConversationalForm";
import { IUserInput } from "./interfaces/IUserInput";
import { EventDispatcher } from "./logic/EventDispatcher";
import { FlowManager } from "./logic/FlowManager";
import { IEventTarget } from "./logic/IEventTarget";
import { FormOptions } from "./options/IConversationalFormSettings";
import { DataTag, TagsParser } from "./parsing/TagsParser";
import { ChatList } from "./ui/chat/ChatList";
import { ChatResponseEvents } from "./ui/chat/ChatResponse";
import { UserTextInput } from "./ui/inputs/UserTextInput";
import { ProgressBar } from "./ui/ProgressBar";


export class ConversationalForm implements IConversationalForm {

	/**
	 * createId
	 * Id of the instance, to isolate events
	 */
	private _createId?: string;
	public get createId(): string {
		if (!this._createId) {
			this._createId = new Date().getTime().toString();
		}

		return this._createId;
	}

	// instance specific event target
	private _eventTarget?: IEventTarget;
	public get eventTarget(): IEventTarget {
		if (!this._eventTarget) {
			this._eventTarget = new EventDispatcher();
		}

		return this._eventTarget;
	}

	public dictionary: Dictionary;
	public el: HTMLElement;
	public chatList: ChatList;
	public options: FormOptions;

	private context: HTMLElement;
	private formEl: HTMLFormElement;
	private submitCallback?: (cf: ConversationalForm) => void | HTMLButtonElement;
	private onUserAnswerClickedCallback?: (event: CustomEvent) => void;
	private flowStepCallback?: (dto: FlowDTO, success: () => void, error: () => void) => void;
	private tags: Array<IDomTag | ITagGroup>;
	private flowManager: FlowManager;
	private isDevelopment: boolean = false;

	private textInput: UserTextInput;
	private userInput?: IUserInput;
	private tagBuilder: ITagBuilder;

	constructor({ form, context, ...optionalOptions }: CreateOptions) {

		const {
			tags,
			appearance,
			behaviour,
			onSubmit,
			onFlowStep,
			eventDispatcher,
			userInput } = optionalOptions;

		// initialize form options form create options
		this.options = {
			behaviour: behaviour,
			appearance: appearance
		}

		if ((typeof this.options.appearance.animations) === 'boolean' && this.options.appearance == true) {
			this.options.appearance.animations = defaultOptions.appearance.animations;
		}

		CFGlobals.suppressLog = this.options.behaviour?.suppressLog
			?? defaultOptions.behaviour.suppressLog ?? true;

		if (!CFGlobals.suppressLog) console.log('Conversational Form > options:', this.options);

		// possible to create your own event dispatcher, so you can tap into the events of the app
		this._eventTarget = eventDispatcher;

		// set a general step validation callback
		this.flowStepCallback = onFlowStep;
		this.isDevelopment = CFGlobals.illustrateAppFlow = !!document.getElementById("conversational-form-development");
		if (this.isDevelopment && typeof this.options.behaviour.suppressLog !== 'boolean') {
			CFGlobals.suppressLog = false;
		}

		if (!form)
			throw new Error("Conversational Form error, the formElement needs to be defined.");

		this.formEl = form;
		this.formEl.setAttribute("cf-create-id", this.createId);

		this.submitCallback = onSubmit;

		this.dictionary = new Dictionary({
			data: appearance.user.dictionary,
			robotData: appearance.robot.dictionary,
			userImage: appearance.user.image ?? "",
			robotImage: appearance.robot.image ?? ""
		});

		if (!context)
			throw new Error("Conversational Form error, the context element needs to be defined.");

		this.context = context;

		this.userInput = userInput;
		if (userInput) {
			// validate the user ..... TODO....
			if (!userInput.init || !userInput.input) {
				console.warn("Conversational Form: userInput is not correctly setup", userInput);
				this.userInput = undefined;
			}
		}


		this.tags = tags ?? [];
		this.tagBuilder = new TagBuilder();

		// if tags are not defined then we will try and build some tags our selves..
		if (!this.tags || this.tags.length == 0) {
			this.tags = [];

			let fields: Array<HTMLInputElement | HTMLSelectElement | HTMLButtonElement> = [].slice.call(this.formEl.querySelectorAll("input, select, button, textarea, cf-robot-message"), 0);

			for (var i = 0; i < fields.length; i++) {
				const element = fields[i];
				if (TagHelper.isTagValid(element)) {
					// ignore hidden tags
					const tag = this.tagBuilder.createTag(element);
					if (tag)
						this.tags.push(tag);
				}
			}
		} else {
			// tags are manually setup and passed as options.tags.
		}

		// remove invalid tags if they've sneaked in.. this could happen if tags are setup manually as we don't encurage to use static Tag.isTagValid
		const indexesToRemove: Array<IDomTag | ITagGroup> = [];
		for (var i = 0; i < this.tags.length; i++) {
			const element = this.tags[i];
			if (!element || (this.isDomTag(element) && !TagHelper.isTagValid(element.domElement))) {
				indexesToRemove.push(element);
			}
		}

		for (var i = 0; i < indexesToRemove.length; i++) {
			var tag = indexesToRemove[i];
			this.tags.splice(this.tags.indexOf(tag), 1);
		}

		if (!CFGlobals.suppressLog && (!this.tags || this.tags.length == 0)) {
			console.warn("Conversational Form: No tags found or registered.");
		}

		//let's start the conversation
		this.tags = this.setupTagGroups(this.tags);


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

		if (appearance.animations === true)
			this.el.classList.add("conversational-form--enable-animation");

		// add conversational form to context
		this.context.appendChild(this.el);

		var innerWrap = document.createElement("div");
		innerWrap.className = "conversational-form-inner";
		this.el.appendChild(innerWrap);

		// Conversational Form UI
		this.chatList = new ChatList({
			eventTarget: this.eventTarget,
			cfReference: this
		});

		innerWrap.appendChild(this.chatList.el);

		this.textInput = new UserTextInput({
			userInput: this.userInput,
			eventTarget: this.eventTarget,
			cfReference: this
		});

		if (appearance.showProgressBar === true) {
			const progressBar = new ProgressBar({
				cfReference: this,
				eventTarget: this.eventTarget
			});
			innerWrap.appendChild(progressBar.el);
		}

		this.chatList.addInput(this.textInput);

		innerWrap.appendChild(this.textInput.el);

		this.onUserAnswerClickedCallback = this.onUserAnswerClicked.bind(this);
		this.eventTarget.addEventListener(ChatResponseEvents.USER_ANSWER_CLICKED, this.onUserAnswerClickedCallback, false);

		this.el.classList.add("conversational-form--show")

		if (!this.tags || this.tags.length == 0) {
			// no tags, so just show the input
			this.textInput.visible = true;
		}
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
		this.chatList.createResponse(true, undefined, response);
	}

	public addUserChatResponse(response: string) {
		// add a "fake" user response..
		this.chatList.createResponse(false, undefined, response);
	}

	public stop(optionalStoppingMessage: string = "") {
		this.flowManager.stop();
		if (optionalStoppingMessage != "")
			this.chatList.createResponse(true, undefined, optionalStoppingMessage);

		this.textInput.onFlowStopped();
	}

	public start() {
		this.textInput.disabled = false;
		if (!CFGlobals.suppressLog) console.log('option, disabled 3',);
		this.textInput.visible = true;

		this.flowManager.start();
	}

	public getTag(nameOrIndex: string | number): ITag | undefined {
		if (typeof nameOrIndex == "number") {
			return this.tags[nameOrIndex];
		} else {
			// TODO: fix so you can get a tag by its name attribute
			return undefined;
		}
	}

	public removeStepFromChatList(index: number): void {
		this.chatList.clearFrom(index);
	}

	private setupTagGroups(tags: Array<ITag>): Array<IDomTag | ITagGroup> {
		// make groups, from input tag[type=radio | type=checkbox]
		// groups are used to bind logic like radio-button or checkbox dependencies
		var groups: any = [];
		for (var i = 0; i < tags.length; i++) {
			const tag: ITag = tags[i];
			if (tag.name && (tag.type == "radio" || tag.type == "checkbox")) {

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

					let fieldset: HTMLElement | undefined = groups[group][0].domElement.parentNode;
					if (fieldset && fieldset.tagName.toLowerCase() !== "fieldset") {
						fieldset = <HTMLElement>fieldset.parentNode;
						if (isFieldsetValidForCF(fieldset)) {
							// not a valid fieldset, we only accept fieldsets that contain cf attr
							fieldset = undefined;
						}
					}

					const tagGroup: TagGroup = new TagGroup({
						fieldset: <HTMLFieldSetElement>fieldset, // <-- can be undefined
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

		return <(IDomTag | ITagGroup)[]>tags;
	}

	/**
	* @name onUserAnswerClicked
	* on user ChatReponse clicked
	*/
	private onUserAnswerClicked(event: CustomEvent): void {
		const tag: IDomTag | ITagGroup = event.detail;
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
		let tags: Array<IDomTag | ITagGroup> = [];

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
						let tagElement = this.tagBuilder.createTag(<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>tag);
						// add ref for group creation
						if (tagElement) {
							if (!tagElement.name) {
								tagElement.name = "tag-ref-" + j.toString();
							}

							tags.push(tagElement);
						}
					}
				}
			} else {
				const tag: HTMLElement | HTMLInputElement | HTMLSelectElement | HTMLButtonElement = tagData.tag === "select" ? TagsParser.parseGroupTag(tagData) : TagsParser.parseTag(tagData);
				if (TagHelper.isTagValid(tag)) {
					const tagElement = this.tagBuilder.createTag(<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>tag);

					if (tagElement)
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
			this.chatList.setCurrentUserResponse(this.textInput.getFlowDTO());
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
		if (this.textInput)
			this.textInput.setFocusOnInput();
	}

	public doSubmitForm() {
		this.el.classList.add("done");

		this.textInput.reset();

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
		if (this.userInput) {
			this.userInput = undefined;
		}

		if (this.onUserAnswerClickedCallback) {
			this.eventTarget.removeEventListener(ChatResponseEvents.USER_ANSWER_CLICKED, this.onUserAnswerClickedCallback, false);
			this.onUserAnswerClickedCallback = undefined;
		}

		if (this.flowManager)
			this.flowManager.dealloc();
		if (this.textInput)
			this.textInput.dealloc();
		if (this.chatList)
			this.chatList.dealloc();

		this.el.parentNode?.removeChild(this.el);

	}

	/*
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
	}*/


	private isDomTag(tag: ITag): tag is IDomTag {
		return tag.type != "group";
	}
}
