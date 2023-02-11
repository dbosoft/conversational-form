import { ITag } from "../form-tags/ITag";
import { IBasicElementOptions } from "../ui/BasicElement";
import { IChatList } from "../ui/chat/IChatList";

export interface IChatResponseOptions extends IBasicElementOptions{
    response: string;
    image: string;
    list: IChatList;
    isRobotResponse: boolean;
    tag: ITag;
    container: HTMLElement;
}