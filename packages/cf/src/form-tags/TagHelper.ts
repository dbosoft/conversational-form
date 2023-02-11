import { Helpers } from "../logic/Helpers";
import { TagsParser } from "../parsing/TagsParser";
import { ConditionalValue } from "./ConditionalValue";


export class TagHelper
{
    public static testConditions(tagValue: string | string[], condition: ConditionalValue):boolean{
        const testValue = (value: string, conditional: string | RegExp) : boolean => {
            if(typeof conditional === "object"){
                // regex
                return (<RegExp> conditional).test(value);
            }

            // string comparisson
            return <string>tagValue === conditional;
        }

        if(typeof tagValue === "string"){
            // tag value is a string
            const value: string = <string> tagValue;
            let isValid: boolean = false;
            for (var i = 0; i < condition.conditionals.length; i++) {
                var conditional: string | RegExp = condition.conditionals[i];
                isValid = testValue(value, conditional);

                if(isValid) break;
            }
            return isValid;
        }else{
            if(!tagValue){
                return false;
            }else{
                // tag value is an array
                let isValid: boolean = false;
                for (var i = 0; i < condition.conditionals.length; i++) {
                    var conditional: string | RegExp = condition.conditionals[i];
                    if(typeof tagValue !== "string"){
                        for (var j = 0; j < tagValue.length; j++) {
                            isValid = testValue(<string>tagValue[j], conditional);
                            if(isValid) break;
                        }
                    }else{
                        // string comparisson
                        isValid = testValue((<string[]>tagValue).toString(), conditional);
                    }

                    if(isValid) break;
                }

                return isValid;
            }
            // arrays need to be the same
        }
    }

    public static isTagValid(element: HTMLElement):boolean{
        if(element.getAttribute("type") === "hidden")
            return false;

        if(element.getAttribute("type") === "submit")
            return false;

        // ignore buttons, we submit the form automatially
        if(element.getAttribute("type") == "button")
            return false;

        if(element.style){
            // element style can be null if markup is created from DOMParser
            if(element.style.display === "none")
                return false;

            if(element.style.visibility === "hidden")
                return false;
        }

        const isTagFormless: boolean = TagsParser.isElementFormless(element);

        const innerText: string = Helpers.getInnerTextOfElement(element);
        if(element.tagName.toLowerCase() == "option" && (!isTagFormless && innerText == "" || innerText == " ")){
            return false;
        }
    
        if(element.tagName.toLowerCase() == "select" || element.tagName.toLowerCase() == "option")
            return true
        else if(isTagFormless){
            return true;
        }else{
            return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
        }
    }
}