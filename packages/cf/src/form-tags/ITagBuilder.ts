import { ITag } from "./ITag";

export interface ITagBuilder{
    createTag(element: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement): ITag
}