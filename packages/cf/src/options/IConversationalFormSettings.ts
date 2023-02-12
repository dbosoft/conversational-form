export interface IConversationalFormSettings {
    // prevent auto appending of Conversational Form, append it yourself.
    preventAutoAppend?: boolean;

    // start the form in your own time, {cf-instance}.start(), exclude cf-form from form tag, see examples: manual-start.html
    preventAutoStart?: boolean;

    // prevents the initial auto focus on UserInput
    preventAutoFocus?: boolean;

    // optional horizontal scroll acceleration value, 0-1
    scrollAcceleration?: number;

    // optional, Whenther to suppress console.log, default true
    suppressLog?: boolean;

    // Show progressbar
    showProgressBar?: boolean;

    //base64 || image url // overwrite user image, without overwritting the user dictionary
    userImage?: string;

    // base64 || image url // overwrite robot image, without overwritting the robot dictionary
    robotImage?: string;

    // Prevent submit on Enter keypress
    preventSubmitOnEnter?: boolean;

    animationsEnabled?: boolean;

}