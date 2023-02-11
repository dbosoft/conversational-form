import { ButtonTag } from "./ButtonTag";
import { CfRobotMessageTag } from "./CfRobotMessageTag";
import { InputTag } from "./InputTag";
import { ITag } from "./ITag";
import { ITagBuilder } from "./ITagBuilder";
import { OptionTag } from "./OptionTag";
import { SelectTag } from "./SelectTag";
import { TagHelper } from "./TagHelper";


export class TagBuilder implements ITagBuilder{

    public createTag(element: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement): ITag{
        if(TagHelper.isTagValid(element)){
            // ignore hidden tags
            let tag: ITag;
            if(element.tagName.toLowerCase() == "input"){
                tag = new InputTag({
                    domElement: element
                });
            }else if(element.tagName.toLowerCase() == "textarea"){
                tag = new InputTag({
                    domElement: element
                });
            }else if(element.tagName.toLowerCase() == "select"){
                tag = new SelectTag({
                    domElement: element
                }, this);
            }else if(element.tagName.toLowerCase() == "button"){
                tag = new ButtonTag({
                    domElement: element
                });
            }else if(element.tagName.toLowerCase() == "option"){
                tag = new OptionTag({
                    domElement: element
                });
            }else if(element.tagName.toLowerCase() == "cf-robot-message"){
                tag = new CfRobotMessageTag({
                    domElement: element
                });
            }

            return tag;
        }else{
            // console.warn("Tag is not valid!: "+ element);
            return null;
        }
    }
}