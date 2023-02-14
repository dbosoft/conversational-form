export type FormOptions = {

    behaviour?: {

        // optional, Whenther to suppress console.log, default true
        suppressLog?: boolean;

        // prevents the initial auto focus on UserInput
        noAutoFocus?: boolean;

        // Prevent submit on Enter keypress
        noSubmitOnEnter?: boolean;
    }

    appearance?: {

        // Show progressbar
        showProgressBar?: boolean;

        // optional horizontal scroll acceleration value, 0-1
        scrollAcceleration?: number;

        animations?: {
            enabled: boolean;
            delay?: number
        };

        // optional, hide UserInputField when radio, checkbox, select input is active
        hideUserInputOnNoneTextInput?: boolean;

        // robot bobble
        robot?: {

            // show thinking dots for robot, defaults to 0
            responseTime?: number;

            // the delay inbetween chained robot responses
            chainedResponseTime?: number;
        },

        // user bobble
        user?: {
            // to show thinking state or not, defaults to false;
            showThinking?: boolean

            // to show user thumbnail, defaults to false
            showThumb?: boolean

        }
    },
}

