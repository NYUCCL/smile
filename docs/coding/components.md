<script setup>
import SimpleButton from '/coding/components/SimpleButton.vue'
import TextInput from '/coding/components/TextInput.vue'
</script>

# Components

A key to making development faster and more enjoyable in <SmileText/> is to
organize parts of the overall experiment into smaller, modular units called
**components**. Using components, the meaningful parts of a complex webpage or
application are broken down into smaller elements, which are then built up into
a hierarchy. The code for these smaller elements can, in many cases, be
developed completely independently from the rest of the project or webpage.

![components](/images/components.png)

[Component development](https://www.componentdriven.org) speeds up the process
of designing a new experiment or web application because you don't have to
understand every part of the code to begin adding new interface elements and
logic. Components can show/hide content, verify that input to a form is valid,
collect data from a participant and save it to a database, animate elements of a
page, etc...

Well-designed components are reuseable across projects so that if someone else
develops a useful component you can easily import it into your project.
Component libraries exist which define the logic and behavior of common elements
on a page. For example, [Radix Vue](https://www.radix-vue.com/) and
[PrimeVue](https://primevue.org/) provide libraries of components that provide
functionality like calendar
[date pickers](https://www.radix-vue.com/components/date-picker.html),
[navigation menus](https://www.radix-vue.com/components/navigation-menu), and
hoverable [tooltips](https://www.radix-vue.com/components/tooltip.html). In
addition, novel components are easily built up out of other components
leveraging modularity and code reuse.

Components are somewhat similar to the role that
["plugins"](https://www.jspsych.org/7.2/overview/plugins/) play in a library
like [JSPsych](https://www.jspsych.org/7.2/). However, JSPsych plugins often
handle single trials of an experiment, whereas a Vue.js component might be as
small as a button or as big as an entire webpage or even application. In
addition, components leverage some other concepts in modern web design such as
[reactivity and declarative rendering](/reactive) that make your development and
debugging much easier.

### How are components used in <SmileText/>?

Typically in <SmileText/>, components are used to define
[phases of an experiment](/coding/views) (e.g., consent, instructions, etc.),
Smile provides several [built-in components](/coding/views#built-in-views)
(which we refer to as "Views") that implement nicely designed components that
collect informed consent or show instructions. Components are also used to
define the individual trials of an experiment (i.e., the logic and flow of what
is shown in a given trial). Some trials might be complex and composed of other
components that define the look and layout of stimuli, buttons, etc. In
addition, Smile provides a simple API which makes it easy to
[step through sequences of trials](/coding/steps).

## Vue.js components

There are many frameworks which utilize the concept of components on the web
including [React](https://reactjs.org/), [Angular](https://angular.io/), and
[Svelte](https://svelte.dev/). In <SmileText/>, we use the
[Vue.js](https://vuejs.org) framework.

::: info Why Vue.js?

<div class="m-4">
<a href="https://vuejs.org"><img src="/images/vuelogo.png" width="150" align="right"></a>
</div>

Vue.js was chosen for <SmileText/> because it is easy to learn, opensource and
free, has a large and active community, and is one of the few web frameworks not
associated with a major company. In addition, the Vue community has developed
strong international representation (e.g., it is the most popular web framework
in China) with docs in many languages. There's a nice documentary about the
leader of the Vue project [here](https://www.youtube.com/watch?v=OrxmtDw4pVI).

:::

### Single File Components

The preferred way to develop Vue components is using a special file format known
as SFC (Single File Component). These files end with an extension `.vue`. The
SFC files combine elements of Javascript, HTML, and CSS/SCSS into a single
modular element that defines your component. These files can be edited best
using the [Vue](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
extension for [VSCode](https://code.visualstudio.com) (i.e., it provides syntax
highlighting and other code formatting hints).

Here is an example Vue 3 SFC file called `SimpleButton.vue`, which is using the
Vue 3.0 composition API:

```vue
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <button class="button" @click="count++">Count is: {{ count }}</button>
</template>

<style scoped>
button {
  font-weight: bold;
  background-color: lightblue;
}
</style>
```

Look closely at this example and notice how this example has a `<script>`
section, a `<template>` section, and a `<style>` section. These sections define
the javascript behavior (script), the HTML rendering (template), and the
look/feel of the component (style). These three factors are typical for
interactive websites (e.g., you typically import your javascript code (.js), and
style sheet (.css) code into your basic HTML document (.html)). However,
normally you define these for the entire page—not separately for individual
pieces of a larger page. The SFC file format highlights the value of modularity
since it helps you group the code for a particular part of the page together
with its HTML and CSS styling.

#### Templates

If we look more closely, the template for this component looks like basic HTML:

```vue
<template>
  <button class="button" @click="count++">Count is: {{ count }}</button>
</template>
```

It has a simple `<button>` element that when clicked (`@click`) increments a
variable called `count`. The current value of `count` is rendered into the
template using the <span v-pre>`{{ count }}`</span> syntax. The `@click` event
handler is not normal HTML, but is a Vue directive/shorthand for adding the
`onclick()` event listener. Similarly, the <span v-pre>`{{ count }}`</span> is
template syntax for text interpolation which essentially converts the value of
`count` to a string and inserts it into the HTML template. You can read more
about Vue's template syntax
[here](https://vuejs.org/guide/essentials/template-syntax.html).

#### Scripts

Now lets look closer at the `<script>` section:

```vue
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>
```

The script has the special word `setup` and initializes the `count` variable to
zero and makes it reactive (more on that below, but here is Vue's
[documentation](https://v3.vuejs.org/guide/reactivity.html)).

#### Styles

Finally, the `<style>` section defines how elements of the template should look.

```vue
<style scoped>
button {
  font-weight: bold;
  background-color: lightblue;
}
</style>
```

Here we are specifying that the text in the button for this component should be
bold and the button light blue. Since the style section has the word `scoped` in
it, the styles will only apply to this component and not to other components on
the page (i.e., only this button will be bolded). In other words, even if
elsewhere on the page, if a different component has a `<button>` tag, this style
will not apply to it.

#### Using a component

This documentation website is itself built using Vue.js components. As a result,
we can render the above Vue component directly into this page to see how it
works. Here is the button component in action:

::: raw

<SimpleButton />

:::

The way this worked was that at the top of this page we imported the component

```
import SimpleButton from '@/components/SimpleButton.vue'
```

and then in the main text wrote

```
<SimpleButton />
```

Vue replaced the custom `<SimpleButton/>` tag with the rendered HTML for the
template and the logic for the button.

Try clicking the button and see how the counter is incremented! All the logic
for this was self-contained in the small SFC file above and could be easily
moved into another project just by copying the SFC file and importing it where
needed. In addition, it can be applied multiple times on the same page. Each
instance of the component will have its own state and behavior.

For example, writing

```
<SimpleButton />
<SimpleButton />
```

will result in:

::: raw

<SimpleButton /><br /><br /> <SimpleButton />

:::

each with a self-contained counter.

Importantly, components can include and use other components. For example, the
following component imports the `SimpleButton` component and a new `TextInput`
component:

```vue
<script setup>
import SimpleButton from '@/components/SimpleButton.vue'
import TextInput from '@/components/TextInput.vue'
</script>

<template>
  <div>
    <SimpleButton />
    <TextInput />
  </div>
</template>
```

This way more complex elements can be composed out of simpler elements.

## Declarative Rendering and Reactivity

A core concept in Vue.js is the idea of **reactivity** and **declarative
rendering**. There are many useful guides to this, including the excellent
[Vue tutorial](https://vuejs.org/tutorial/#step-1) and the
[Vue documentation](https://vuejs.org/guide/introduction.html). However, here is
a quick summary.

**Declarative rendering** is the idea that you define the structure of your
webpage in a template. The template can refer to variables and functions that
are defined in the script section of the component. When the value of the
variable changes the template automatically is updated. This is in contrast to
the traditional approach of web development such as JQuery or JSPsych where you
write **imperative** code to update the page when the state changes. Imperative
code is code that explicitly tells the computer how to do something. For
example, in the imperative style you might write code that says "when the button
is clicked, increment the count variable and update the text of the button to
reflect the new count". In the declarative style you would just say "the text of
the button should be the value of the count variable" and Vue would
automatically update the button when the count variable changes.

::: tip Excel is Declarative+Reactive

Even if the term is unfamiliar to you, you probably have experience with
declarative programming if you have ever used a functions in Excel/Google
Sheets. Here you **define** the value of a cell to be the `=AVERAGE()` of some
other cells. When the value of the other cells is updated the average
**automatically** recomputes. In fact, the declarative style of Excel is one of
the reasons people find it so easy to work with. Why not borrow some of that
magic for your online web developmenet?

:::

In the SFC code listing above, try to find where the displayed value of the
count variable is updated in the template. You'll notice there is no such code
because it is **implicitly** updated according to the
<span v-pre>`{{ count }}`</span> declaration in the template. This is the core
idea of declarative rendering -- you define how the page should look based on
underlying state data and the page automatically updates when the state data
changes.

Of course, the question is how does the page know when the state data changes?
In Vue.js this is handled by the concept of **reactivity**. In the SFC file
above we imported the `ref` function from Vue and used it to define the `count`
variable. This function makes the variable reactive. This means that when the
value of the variable changes, Vue automatically updates the template to reflect
the new value. Any variable you want to have automatically update its displayed
value should be made reactive. Behind the scenes, this is done using a system of
message passing and notifications where Vue keeps track of which parts of the
template depend on which variables and updates them when the variables change.
It's actually quite sophisticated to ensure the system works quickly even on
complex websites (think Facebook news feed or the NYTimes) but amazingly you
don't _need_ know how it works under the hood. **The important point from the
perspective of a developer is that you don't have to write code to update the
template when the underlying state changes.**

#### Two-way binding

An even more interesting version of this can create two-way binding between
elements in a form. For example, this component defines a reactive value called
`text`. The template defines a text input element `input` which is "bound" to
the value of `text` using the `v-model` directive. This means that when the the
value of the input changes, it automatically updates the value of `text` and
vice versa. This is a powerful feature of Vue.js that can save a lot of time and
code.

```vue
<script setup>
import { ref } from 'vue'
const text = ref('')
</script>

<template>
  <input class="input" v-model="text" placeholder="Type here" />
  <p><b>You typed: </b>{{ text }}</p>
</template>

<style scoped>
.input {
  font-weight: bold;
}
</style>
```

An example rendering of this component is here:

<TextInput />

As you can see as you type the value of `text` is updated in real time (due to
the onChange event) and since this variable is reactive it also renders into the
template in real time. In this case both retrieving the value of the input field
and setting the value of the HTML template are done **implicitly** due to
reactivity and declarative rendering.

### Comparison to traditional Javascript development

This development model is strikingly different than most Javascript development
where you would have to write code to update the text of the button each time
the count variable changes. For example, when writing custom JSPsych plugins the
code for a similar effect might look like this:

```js
plugin.trial = function (display_element, trial) {
  var text = ''

  var html = `<input class="input" name="text" id="myinput" placeholder="Type here" />`
  html += `<p id="message"><b>You typed: </b>${text}</p>`
  display_element.innerHTML = html

  display_element
    .querySelector('#myinput')
    .addEventListener('onchange', function () {
      handle_change()
    })

  function handle_change() {
    let new_text = display_element.querySelector('#myinput').value
    display_element.querySelector('#message').innerHTML =
      `<b>You typed: </b>${new_text}`
  }
}
```

with an additional entry in the global CSS definition like this to style the
input:

```css
#myinput {
  font-weight: bold;
  background-color: lightgray;
}
```

Unpacking this code, first we add the input and text to the page:

```js
var html = `<input class="input" name="text" id="myinput" placeholder="Type here" />`
html += `<p id="message"><b>You typed: </b>${text}</p>`
display_element.innerHTML = html
```

This looks similar to the `<template>` section of the Vue component. However, we
still need to add the event handler to the JSPsych plugin example. We do this by
selecting the `#myinput` element and adding an event listener to to the click
for `onchange` events.

```js
display_element
  .querySelector('#myinput')
  .addEventListener('onchange', function () {
    handle_change()
  })
```

In the Vue component, the event handler which listens to changes was implicitly
registered using the `v-model="text"` directive. Finally in the JSPsych example
we have to handle the change by running a function that reads the current value
of the input field and sets the HTML of the message to the new value.

```js
function handle_change() {
  let new_text = display_element.querySelector('#myinput').value
  display_element.querySelector('#message').innerHTML =
    `<b>You typed: </b>${new_text}`
}
```

This is also implicitly accomplished using the declarative rendering in the Vue
template.

Conceptually, these are not radically different—in both cases we have to think
about how our program reacts to inputs from the user. However, the JSPsych
version, besides being more verbose, requires the programmer to manually
coordinate more of the updating process (retrieving values and setting them in
the display). This can be error-prone. As the complexity of a plugin/component
grows, the savings from declarative rendering and reactivity become more and
more apparent. For example, if the same component was extended to include
multiple form elements, each of a highly specialized type (e.g., date pickers,
etc.) then the JSPsych version would require a lot of manual code to handle the
updating of the display.

In addition, this example didn't use it, but the CSS styling for a JSPsych
plugin is defined in a different file from the plugin itself which can make it
harder to update (e.g., you have to be careful to not call any other element
`#myinput` if you applied a style to it because CSS classes apply globally,
where as in Vue they can be, optionally, scoped to apply to the current
component only).

## Building Vue components

Components are a powerful way to organize and develop web applications. However,
currently browsers do not natively know how to read and process .vue (Vue SFC)
files (although there are proposals for native component support in browsers).
How do they work then?

Vue applications use a build system that sort of "compiles" and "bundles" the
code in the SFC into one or more .html, .js, and .css files that work in the way
that browsers can understand. This is the role that Vite plays in <SmileText/>.
Vite is a super-optimized build tool that can take the SFC files and turn them
into a webpage that can be loaded in a browser. This aspect of Vite is similar
to other build tools you might have heard of including Webpack, Parcel, or
Rollup. It takes in the .vue file and outputs a .html, .js, and .css file you
can load in a browser.

Building a website might seem like an unnecessary complexity, but is fairly
common (if you've used Overleaf to write a paper you are familiar with letting a
program "build" your paper into a PDF). It even offers several unique
advantages.

- First, the build process can optimize the code for quick loading (e.g., when
  Vite processes the SFC files it can remove comments and whitespace, a process
  called "minifying", making the imported code smaller and faster to load over
  the web).
- Second, the build process can strip out unused functions from the libraries
  you use. In the
  [simplest method](https://www.jspsych.org/7.3/tutorials/hello-world/#step-3-create-a-script-element-and-initialize-jspsych)
  of using JSPsych, you import entire JSPsych library, which includes all the
  functions of JSPsych even if you never use them. In contrast, Vite's build
  function can analyze your code and only include the parts of the library that
  you actually use. This is called **tree-shaking** and is a powerful way to
  reduce the size of your website.
- Third, the build process can **code-split** your website. This means that the
  build process can break your website into smaller pieces that can be loaded on
  demand or in parallel (breaking the code into multiple .js file "chunks").
  This has a huge impact on the speed of your website/experiment and is
  especially important for collecting data from populations with slow internet
  connections.
- Finally, the Vite build process can be configured with plugins which do
  additional processing and manipulation of the input code. This is used in
  several key areas in this project.

## Learning Vue

Teaching the internals of Vue.js is beyond this particular guide. However,
luckily Vue has a rich ecosystem of documentation and guides which can help (and
also excellent documentation). The following are some useful pointers:

The main resources you will find helpful are to first step through this
interactive tutorial to get some experience with Vue:

- Official Vue.js [tutorial](https://vuejs.org/tutorial/#step-1)

Then read through the main docs (this is actually quite readable and
informative):

- The Vue.js [documentation](https://vuejs.org/guide/introduction.html)

Here are some additional resources:

- If you are coming to Vue with experience in jQuery this guide
  [comparing the two is interesting](https://www.smashingmagazine.com/2018/02/jquery-vue-javascript/).
- Vue.js explained in [100 seconds](https://www.youtube.com/watch?v=nhBVL41-_Cw)
- Vue.js documentary about the
  [lead developer](https://www.youtube.com/watch?v=OrxmtDw4pVI)
- Online school for learning [Vue](https://learnvue.co)
- [LearnVue](https://www.youtube.com/LearnVue) a YouTube channel devoted to
  teaching Vue
- Long video with a guy walking through the
  [code while developing a simple game in Vue](https://www.youtube.com/watch?v=WQa9-4K3me4&t=1652s)

Finally, one very useful tool for learning about components is the
[Vue Single File Component Playground](https://sfc.vuejs.org/). On this page,
you can write simple components, see how they will render in real-time, and even
build slightly larger components that include sub-components. It can be useful
for learning without setting up <SmileText/> on your computer, and it even can
help engage students in the research process.

## Component organization

When you start developing your own components there are a few guidelines. First,
components should be named using Pascal Case names (e.g., `StatusBar.vue` or
`InformedConsentButton.vue` as opposed to `statusbar.vue` (lowercase),
`statusBar.vue` (camel case) or `status-bar.vue` (kebab case)). This is the
official recommendation of the
[Vue documentation](https://vuejs.org/guide/components/registration.html#component-name-casing).

Second, new components should be placed in your `src/user/components` folder.
This will help you stay organized and help other users of your code know where
to look to find an element they might like to reuse in their projects.
