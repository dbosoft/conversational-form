# Conversational Form by dbosoft

This is a fork of the great - but now unmaintained - Conversational Form made by [SPACE10](https://www.space10.io).

## WIP 
**We are in the process of rewriting the code and documentation pages. Until it is finished, most of the readme still refers to the original Conversational Form.**

&nbsp;
&nbsp;
  

With Conversational Form you can easily turn your form content into conversations. It features conversational replacement of all input elements, reusable variables from previous questions and complete customization and control over the styling.

<p align="center">
	<a href="https://medium.com/@space10/introducing-conversational-form-1-0-922404b2ea2e"><strong>Introducing Conversational Form 1.0</strong></a>
</p>
<p align="center">
	<a href="https://space10-community.github.io/conversational-form/docs/1.0.0/"><strong>Explore Conversational Form docs »</strong></a>
</p>
<p align="center">
	<img src="https://raw.githubusercontent.com/space10-community/conversational-form/master/docs/1.0.0/assets/cf-demo.gif" />
</p>

## Quick Start

Include Conversational Form in your page:

download/install the latest release:
- Clone the repo: ````git clone https://github.com/dbosoft/conversational-form.git````
- Install with npm: ````npm install @dbosoft/conversational-form````
- Install with yarn: ````yarn add  @dbosoft/conversational-form````

Manually instantiating Conversational Form
``` javascript
import { ConversationalForm } from ' @dbosoft/conversational-form';

const cfInstance = new ConversationalForm({
    formEl: formElement,
    context: targetElement,
});
```

Read the [Getting started](https://space10-community.github.io/conversational-form/docs/1.0.0/getting-started/) page for information on the framework contents, options, templates, examples and more.

## Status
[![npm version](https://img.shields.io/npm/v/conversational-form.svg)](https://www.npmjs.com/package/conversational-form)
[![Build Status](https://travis-ci.org/space10-community/conversational-form.svg?branch=develop)](https://travis-ci.org/space10-community/conversational-form)
[![JS gzip size](http://img.badgesize.io/space10-community/conversational-form/master/dist/conversational-form.min.js?compression=gzip&label=JS+gzip+size)](https://github.com/space10-community/conversational-form/blob/master/dist/conversational-form.min.js)
[![CSS gzip size](http://img.badgesize.io/space10-community/conversational-form/master/dist/conversational-form.min.css?compression=gzip&label=CSS+gzip+size)](https://github.com/space10-community/conversational-form/blob/master/dist/conversational-form.min.css)
[![](https://data.jsdelivr.com/v1/package/npm/conversational-form/badge)](https://www.jsdelivr.com/package/npm/conversational-form)


## Bugs and feature requests
If you see a bug, have an issue or a feature request then please submit an issue in the <a href="https://github.com/dbosoft/conversational-form/issues">GitHub issue tracker</a>. For the sake of efficiency we urge you to look through open and closed issues before opening a new issue. Thank you ⭐

## Documentation
Conversational Form's documentation is included in /docs of this repo as well as being <a href="https://space10-community.github.io/conversational-form/docs/">hosted on GitHub Pages</a>.

## Contributing
Pull Requests for bug fixes or new features are always welcome. If you choose to do a Pull Request please keep these guidelines in mind:
- Fork the "main" branch
- If you forked a while ago please get the latest changes from the "main"-branch before submitting a Pull Request
	- Locally merge (or rebase) the upstream development branch into your topic branch:
		- ````git remote add upstream https://github.com/dbosoft/conversational-form.git````
		- ````git checkout main````
		- ````git pull upstream````
		- ````git pull [--rebase] upstream main````
- Always create new Pull Request against the "main" branch
- Add a clear title and description as well as relevant references to open issues in your Pull Request

## Versioning
See the <a href="https://github.com/dbosoft/conversational-form/releases">Releases section of our GitHub project</a> for changelogs for each release version of Conversational Form. We will do our best to summarize noteworthy changes made in each release.

## Acknowledgement
Thank you to everyone who has taken part in the creation of Conversational Form.
- Development by <a href="http://twitter.com/flexmotion" target="_blank">Felix Nielsen</a> and <a href="https://jenssogaard.com/" target="_blank">Jens Soegaard</a> (v0.9.70+)
- Design by <a href="http://www.charlieisslander.com/" target="_blank">Charlie Isslander</a> and <a href="http://norgram.co/" target="_blank">Norgram®</a>
- Concept by <a href="https://space10.io" target="_blank">SPACE10</a>

## Copyright and license
Conversational Form is licensed under <a href="https://github.com/dbosoft/conversational-form/blob/master/LICENSE.md" target="_blank">MIT</a>. Documentation under <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>.
