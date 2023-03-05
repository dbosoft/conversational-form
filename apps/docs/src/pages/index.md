---
title: Getting started
pageTitle: ConversationalForm - Turn your forms into conversations.
description: With ConversationalForm you can easily turn your form content into conversations. It features conversational replacement of all input elements, reusable variables from previous questions and complete customization and control over the styling.
---

With ConversationalForm you can easily turn your form content into conversations. It features conversational replacement of all input elements, reusable variables from previous questions and complete customization and control over the styling.

Learn how to get ConversationalForm set up in your project. {% .lead %}

{% quick-links %}

{% quick-link title="Installation" icon="installation" href="/" description="Step-by-step guides to setting up your system and installing the library." /%}

{% quick-link title="Architecture guide" icon="presets" href="/" description="Learn how the internals work and contribute." /%}

{% quick-link title="Plugins" icon="plugins" href="/" description="Extend the library with third-party plugins or write your own." /%}

{% quick-link title="API reference" icon="theming" href="/" description="Learn to easily customize and modify your app's visual design to fit your brand." /%}

{% /quick-links %}

Possimus saepe veritatis sint nobis et quam eos. Architecto consequatur odit perferendis fuga eveniet possimus rerum cumque. Ea deleniti voluptatum deserunt voluptatibus ut non iste.

---


## Quickstart

### Installing dependencies

Install package [conversational-form](https://www.npmjs.com/package/@dbosoft/conversational-form) from npm:

```sh
npm install @dbosoft/conversational-form

```

If you’re using a JavaScript bundler (for instance webpack or Vite), you should be able to import it into your JavaScript modules:

```js
import ConversationalForm from '@dbosoft/conversational-form';

```

You can also import from jsDeliver or UNPKG directly in an HTML page:

```html
<script type="module">
    import ConversationalForm from 
    'https://unpkg.com/@dbosoft/conversational-form@2/dist/index.js';
    
</script>

```

### Import styles

When importing the library no styles are loaded by default, as we assume that you will customize the styles to your needs.  
However, to help you getting started we deliver some default styles with the library. 

You can either import these styles with a bundler (e. g. Webpack):

```js
import '@dbosoft/conversational-form/styles/conversational-form.css';

```

or directly into an HTML page:

```html
<link rel="stylesheet" 
href="https://unpkg.com/@dbosoft/conversational-form@2  __
   /styles/conversational-form.css"/>
    
```


### Create a HTML form

The conversational form is build from a standard HTML form that you can declare in plain html.  
Please note the additional tags (cf-placeholder, cf-questions), you will learn later more about their meaning. 

```html
<form id="cf-form" style="visibility: hidden;">

    <input 
        type="text" 
        cf-questions="Hi there&&What is your name?" 
        name="name" 
        cf-placeholder="Your name"
        value="Filippa">

    <input type="text" 
        cf-questions="Awesome, {name}. 
        Would you mind telling me where you live?" 
        name="country"
        value="United States" 
        cf-placeholder="Country of residence">

    <fieldset>
        <label 
            for="tmnj">
            Thank you. Are you ready to 
                learn more about Conversational Form?
        </label>
        <select 
            cf-questions="Thank you. Are you ready 
                to learn more about Conversational Form?" 
            name="tmnj"
            class="form-control">
            <option>Yes</option>
            <option>No</option>
        </select>
    </fieldset>

    <input 
        type="text" 
        cf-questions="Perfect, let's get started." 
        name="getstarted">

</form>
```

{% callout type="note" title="Formless conversations" %}
We also support declaring the conversational form without a html form (formless mode). 
{% /callout %}

### Embed the conversation

In addition to the form you will need a element where the conversational-form will be placed on the page. 

```html
<div id="cf-context" style="position:relative">

</div>
```

And finally you have to call the script that puts the things together: 

```js
<script type="module">
    import ConversationalForm from 
        'https://unpkg.com/@dbosoft/conversational-form@2/dist/index.js';

    window.onload = function () {

        const conversationalForm = new ConversationalForm({
            form: document.getElementById("cf-form"),
            context: document.getElementById("cf-context")
            }
        });
        conversationalForm.start();

    };
</script>
```


**That's it! Your form is now conversational 👍**


### Demo

{% stackblitz projectId="dbosoft-cf-react-sample1" height=400 view="preview" /%}

---

## 

## Getting help

Consequuntur et aut quisquam et qui consequatur eligendi. Necessitatibus dolorem sit. Excepturi cumque quibusdam soluta ullam rerum voluptatibus. Porro illo sequi consequatur nisi numquam nisi autem. Ut necessitatibus aut. Veniam ipsa voluptatem sed.

### Submit an issue

Inventore et aut minus ut voluptatem nihil commodi doloribus consequatur. Facilis perferendis nihil sit aut aspernatur iure ut dolores et. Aspernatur odit dignissimos. Aut qui est sint sint.

Facere aliquam qui. Dolorem officia ipsam adipisci qui molestiae. Error voluptatem reprehenderit ex.

Consequatur enim quia maiores aperiam et ipsum dicta. Quam ut sit facere sit quae. Eligendi veritatis aut ut veritatis iste ut adipisci illo.

### Join the community

Praesentium facilis iste aliquid quo quia a excepturi. Fuga reprehenderit illo sequi voluptatem voluptatem omnis. Id quia consequatur rerum consectetur eligendi et omnis. Voluptates iusto labore possimus provident praesentium id vel harum quisquam. Voluptatem provident corrupti.

Eum et ut. Qui facilis est ipsa. Non facere quia sequi commodi autem. Dicta autem sit sequi omnis impedit. Eligendi amet dolorum magnam repudiandae in a.

Molestiae iusto ut exercitationem dolorem unde iusto tempora atque nihil. Voluptatem velit facere laboriosam nobis ea. Consequatur rerum velit ipsum ipsam. Et qui saepe consequatur minima laborum tempore voluptatum et. Quia eveniet eaque sequi consequatur nihil eos.
