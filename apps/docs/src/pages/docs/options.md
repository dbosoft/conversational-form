---
title: Architecture guide
description: Quidem magni aut exercitationem maxime rerum eos.
---
|Option|Type|Default|Description|
|--- |--- |--- |--- |
|formEl|HTMLFormElement||Required. The Form element.|
|context|HTMLElement|document.body|Context (HTMLElement) of where to append the ConversationalForm (see also cf-context attribute)|
|tags|Array||Pass in custom tags (when auto-instantiation of ConversationalForm is disabled)|
|theme|string|light|Can be either: light, dark, red, green, blue, purple|
|dictionaryData|Object||Overwrite the default user Dictionary items|
|dictionaryRobot|boolean|true|Can be set to false to allow for loading and packaging of Conversational Form styles within a larger project.|
|userImage|base64, image url or a string beginning with "text:" (eg. "text:JD") (max 3 characters)||Add a custom user image or short text string, without overwritting the user dictionary.|
|robotImage|base64, image url or a string beginning with "text:" (eg. "text:JD") (max 3 characters)||Add a custom robot image or short text string, without overwritting the robot dictionary.|
|submitCallback|Object|void|Custom submit callback if button[type=submit] || form.submit() is not wanted.|
|loadExternalStyleSheet|boolean|true|If set to false, the default Conversational Form stylesheet will not be loaded.|
|preventAutoAppend|boolean|false|Prevent auto appending of Conversational Form, append it yourself.|
|preventAutoStart|boolean|false|Start the form in your own time, {cf-instance}.start(), exclude cf-form from form tag|
|preventAutoFocus|boolean|false|Prevents the initial auto focus set on the UserInput.|
|scrollAcceleration|number|0.1|Optional horizontal scroll acceleration value, 0-1|
|flowStepCallback|Object|(dto: FlowDTO, success: () => void, error: () => void) => void|Allow for a global validation method, asyncronous, so a value can be validated through a server, call success() or error()|
|eventDispatcher|cf.EventDispatcher||Optional event dispatcher, has to be an instance of cf.EventDispatcher, see Events for more info.|
|microphoneInput|IUserInput||Optional, set microphone input, future, add other custom inputs, ex. VR, see voice-section and examples.|
|hideUserInputOnNoneTextInput|boolean|false|Optional, hide UserInputField when radio, checkbox, select input fields are active.|
|userInterfaceOptions|cf.UserInterfaceOptions||Optional, parameters for the User Interface of Conversational Form, set here to show thinking dots or not, set delay time in-between robot responses.
                    userInterfaceOptions:{
    controlElementsInAnimationDelay: 250,
    robot: {
        robotResponseTime: 0,
        chainedResponseTime: 400
    },
    user:{
        showThinking: true,
        showThumb: true
    }
}|
|suppressLog|Boolean|true|By default log messages form CF is suppressed. Set to true and get some additional info. Recommended for development.|
|showProgressBar|Boolean|false|Shows thin progressbar in the top of the chat container.|
|animationsEnabled|Boolean|true|Set to false to disable animations.|
