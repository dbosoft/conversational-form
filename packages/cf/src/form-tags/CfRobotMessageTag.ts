import { Tag, ITagOptions } from "./Tag";

// class
export class CfRobotMessageTag extends Tag {
	constructor(options: ITagOptions){
		super(options);
		this.skipUserInput = true;
	}

	public dealloc(){
		super.dealloc();
	}
}


