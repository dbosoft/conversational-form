import { IDomTag } from "./ITag";

export interface ITagBuilder {
    createTag(element: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement): IDomTag | undefined
}