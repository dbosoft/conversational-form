// default options interface for optional parameters for the UI of Conversational Form

import { CreateOptions } from "..";
import { FormOptions } from "../options/IConversationalFormSettings";


export const defaultOptions: FormOptions = {

	behaviour: {
		suppressLog: true,
		noAutoFocus: false,
		noSubmitOnEnter: false
	},

	appearance: {
		scrollAcceleration: 0.5,
		animations: {
			delay: 250,
		},

		robot: {
			responseTime: 0,
			chainedResponseTime: 500
		},
		user: {
			showThinking: false,
			showThumb: false
		}

	},

}

