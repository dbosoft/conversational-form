---
title: DOM attributes
description: Quidem magni aut exercitationem maxime rerum eos.
---
{% extends "../../layout.twig" %} {% set page\_title = 'DOM element attributes' %} {% set page\_slug = '/dom-element-attributes/' %} {% block page %}

{{page\_title}}
===============

Form-tag attributes
-------------------

### cf-context

If you want to have the ConversationalForm appended to a certain element (when auto-instantiating) then add attribute cf-context to an element, otherwise the ConversationalForm will be appended to the body element.

    <div cf-context>

### cf-prevent-autofocus

If you don't want to have the UserTextInput to auto focus.

    <form id="my-form-element" cf-form cf-prevent-autofocus>

### cf-no-animation

Disables animations completly.

    <form id="my-form-element" cf-form cf-no-animation>

Form-field attributes
---------------------

### cf-questions

Map questions directly to a tag. You can seperate with || to allow for more questions, app will shuffle questions.

    <input type="text" cf-questions="What is your name?||Please tell me your name." />

seperate with && to allow for chained questions.

    <input type="text" cf-questions="Hello?&&Please tell me your name." />

cf-input-placeholder
--------------------

Tag specific, set the placeholder text on the UserTextInput field.

    <input type="text" cf-input-placeholder="Should include http" />

{One way value-binding} with cf-questions
-----------------------------------------

For cui-questions, add {previous-answer} to insert the value from the previous user-answer, you are also able to reference the input ID.

Using the {previous-answer} mapping:

    <input type="text" cf-questions="What is your firstname?" />
    <input type="text" cf-questions="Hello {previous-answer}, what is your lastname?">

Using the ID attribute, this will loop through all submitted tags and map:

    <input type="text" cf-questions="What is your first name?" id="firstname" />
    <input type="text" cf-questions="What is your last name?" id="lastname" />
    <input type="text" cf-questions="Hi {firstname} {lastname}, please tell me your email?" />

previous input could be a select:option list with countries.

    <input type="text" cf-questions="So you want to travel to {previous-answer}" />

cf-label
--------

Add a label to the field. Field must be of type "radio" or "checkbox".

    <input type="radio" cf-label="Subscribe to newsletter" />

cf-validation
-------------

Validate a submitted value before continuing the form flow using javascript.

*   OBS. eval is used.
*   Asyncronous, so a value can be validated through a server
*   three parameters is passed to the method
    *   dto: FlowDTO
    *   success: () => void //callback
    *   error: (optionalErrorMessage?: string) => void //callback

    <input type="text" cf-validation="window.validateFunction" ..

cf-error
--------

Map error messages directly to a tag. The messages can be seperated by | to allow for more error messages. The app will shuffle between given messages.

    <input type="text" cf-error="Text is wrong wrong|Input is not right" />

{% endblock %} {% block toc %}

*   [{{page\_title}}](#dom-element-attributes)
*   [Form-tag attributes](#form-attributes)
    *   [cf-context](#cf-context)
    *   [cf-prevent-autofocus](#cf-prevent-autofocus)
    *   [cf-no-animation](#cf-no-animation)
*   [Form-field attributes](#form-field-attributes)

*   [cf-questions](#cf-questions)
*   [cf-input-placeholder](#cf-input-placeholder)
*   [{One way value-binding} with cf-questions](#one-way-binding)
*   [cf-label](#cf-label)
*   [cf-validation](#cf-validation)
*   [cf-error](#cf-error)

{% endblock %}