import { IChatResponse } from "./IChatResponse";

export interface IChatList
{
    getResponses(): Array<IChatResponse>
}