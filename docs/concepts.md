# :walking_man: Key Concepts

Smile introduces a new way to build behavioral experiments which promotes
modularity and reusability. Smile leverages existing open source libraries to
including Vite, Vue, Bulma, and Google Firebase. However it also provide an
**entirely new interface** for specifying and debugging interactive experiments
that goes beyond basic Vue components.

The first concept to introduce is the notion of a [View](./views.md). A View is
a component that represents a single "phase" or part of an experiment. For
example, the part of your experiment that collects informed consent might be one
View. Another View might be the debriefing form. Below we will describe how you
define the sequence of Views in your experiment.

<img src="/images/viewstimeline.png" width="800" alt="timeline example" style="margin: auto;">

Each View is minimally a Vue component which can be written in whatever way you
please. However, Smile provides a custom API for building views. The key idea
behind this API is the concept of 'steps'. A [step](./steps.md) is a sequenced
event that occurs _within_ a view. For example, a view might have a step that
presents a question to the participant, a step that collects a response, and a
step that displays the results.

A useful way to think about it is the Views are like slides in a presentation
software like Powerpoint/Keynote and steps are like "builds" or "animations
steps" that occur within a slide.

## Creating a simple Experiment View

To help make these concepts more concrete, we will walk through the process of
creating a simple experiment view. We will start with a simple view that
presents the user with sequence of words on the screen and collects a response.
We will slowly build this up by adding complexity and features to help
illustrate the key concepts in Smile.

Each View is a Vue component. You can create a new view by creating a new file
in the `src/user/components` folder. For example, if you want to create a new
view called `MyView.vue`, you would create a new file in the
`src/user/components` folder called `MyView.vue`.

A default Vue component has three parts:

- A script (javscript or typescript)
- A template (HTML + Vue syntax)
- A style (CSS)

The script is the JavaScript that is used to control the behavior of the
component. The template is the HTML that is displayed to the user. The style is
the CSS that is used to style the component.

```vue
<script setup></script>

<template>
  <div>
    <h1>My Experiment</h1>
  </div>
</template>

<style scoped></style>
```

This example View component does nothing. It just displays the text "My
Experiment" in a large (h1) font.

To begin using Smile, we need to import the Smile API and use it to define the
steps in the experiment.

```vue{2-4,6-11}
<script setup>
// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()

api.steps.append([
  { word: 'THIS' },
  { word: 'IS' },
  { word: 'A' },
  { word: 'TEST' },
])
</script>

<template>
  <div>
    <h1>My Experiment</h1>
  </div>
</template>

<style scoped></style>
```

This defines four steps in the experiment. Each step has a `word` property that
is displayed to the user. This is incomplete though because it doesn't actually
show the word to the user. We'd like to step through these steps each time the
user presses the spacebar.

```vue{13-15}
<script setup>
// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()

api.steps.append([
  { word: 'THIS' },
  { word: 'IS' },
  { word: 'A' },
  { word: 'TEST' },
])

api.onKeyDown(' ', () => {
  api.goNextStep()
})
</script>

<template>
  <div>
    <h1>My Experiment</h1>
  </div>
</template>

<style scoped></style>
```

This uses on the `api.onKeyDown` method to listen for the spacebar key press and
advance to the next step. You can also go to the previous step with
`api.goPrevStep()` or jump to a specific step with `api.goToStep(pathname)`. We
will talk about paths later.

Now we actually need to display the word to the user. We can do this by updating
the template part of the component.

```vue{20}
<script setup>
// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()

api.steps.append([
  { word: 'THIS' },
  { word: 'IS' },
  { word: 'A' },
  { word: 'TEST' },
])

api.onKeyDown(' ', () => {
  api.goNextStep()
})
</script>

<template>
  <div>
    <h1>{{ api.stepData.word }}</h1>
  </div>
</template>

<style scoped></style>
```

This uses the `api.stepData` object to access the data for the current step. The
`.word` property is defined because we added it to the step data in the
`api.steps.append` method.

When we advance to the next step using the `api.goNextStep()` method, it
automatically changes the `api.stepData` to refer to the next step and
[reactively](components.html#declarative-rendering-and-reactivity) updates the
template to display the new word.

This is already a working View! On first load it will show the word "THIS" since
that is the first step. Then if the user presses the spacebar, it will advance
to the next step and show the word "IS" and so on. When it get to the last step,
subseqent presses of the spacebar will do nothing since there are no more steps
to advance to.

**This covers only part of the Smile API and development approach but we hope is
illustrates how Smile makes it easy to build experiments.**

### Adding a timer to the experiment

The examples so far could be easily done in raw Vue syntax using reactive
properties e.g., `ref()`. Let's go a little bit deeper to explore some unique
functionality provided by Smile's API.

We usually want to record some information about the user. In this example, it
might make sense to record the amount of time it took them to press each
spacebar. We can use Smile's API to add a timer to the View to measure the
reaction time of the user.

```vue{13-16,19-21}
<script setup>
// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()

api.steps.append([
  { word: 'THIS' },
  { word: 'IS' },
  { word: 'A' },
  { word: 'TEST' },
])

// start the timer if it is not already started
if (!api.timerStarted()) {
  api.startTimer()
}

api.onKeyDown(' ', () => {
  const reactionTime = api.elapsedTime()
  api.stepData.reactionTime = reactionTime
  api.recordStep()
  api.goNextStep()
})
</script>

<template>
  <div>
    <h1>{{ api.stepData.word }}</h1>
  </div>
</template>

<style scoped></style>
```

First we start the timer if it is not already started. You might wonder why we
need to check if it is already started since the `<script setup>` section only
runs once. The reason is that Smile _persists_ information across page reloads.
This way if your participant reloads the page in their browser, Smile will
detect the timer was already started and continue measuring time with respect to
first time it was started. Of course, if you don't want that more fancy behavior
you can just call `api.startTimer()` without checking if it was already started,
which will restart it to measure "from the last page load."

This example shows another aspect of Smile's API. We use `api.elapsedTime()` to
measure the time it took the user to press the spacebar. Then we _write_ the
resulting data to a new property in the `api.stepData` object called
`api.stepData.reactionTime`. We are free to make new properties on the current
`api.stepData` or to modify existing ones.

Then we called `api.recordStep()` to record the step data. This persists the
data so that it will be written to the database record for this participant.
It's worth mentioning here that this doesn't mean the data will be immediately
stored in Firebase -- firebase limits the frequency by which we can write to
documents but rest assured `api.recordStep()` will buffer your participants
trial data so that on the next opportunity it is safely written to the database.
In addition even if the subject reloads the browser at this point the data for
that trial will be restored for later syncing to Firebase, limiting data loss.

**What this section reveals it that Smile's API goes beyond basic Vue components
to provide ways to save data to a database, persist data across page loads, and
provides convenient ways to record data typically needed in behavioral
experiments.**

### Transitioning to the next View

The last step is that we need to leave this View and go to the next one. To do
this we should change it so that when there are no more steps we exit to the
next View.

```vue{22-26}
<script setup>
// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()

api.steps.append([
  { word: 'THIS' },
  { word: 'IS' },
  { word: 'A' },
  { word: 'TEST' },
])

// start the timer if it is not already started
if (!api.timerStarted()) {
  api.startTimer()
}

api.onKeyDown(' ', () => {
  const reactionTime = api.elapsedTime()
  api.stepData.reactionTime = reactionTime
  api.recordStep()
  if (api.isLastStep()) {
    api.goNextView()
  } else {
    api.goNextStep()
  }
})
</script>

<template>
  <div>
    <h1>{{ api.stepData.word }}</h1>
  </div>
</template>

<style scoped></style>
```

Here the `api.isLastStep()` method is used to check if the current step is the
last step. There are several equivalent ways to do that as well for example
`api.hasNextStep()` or `api.stepIndex >= api.nSteps`, but part of Smile's API
design principal is to give you very clear, commonly used function names which
can help avoid typos or errors in logic. If it is, we exit to the next View with
`api.goNextView()`. If it is not, we advance to the next step with
`api.goNextStep()`.

The use of `api.goNextView()` means that even if we change the order of our
Views in the overall flow of our experiment we don't need to update our code.
This means it's easy to share your Views with others and to reuse them in
different experiments.

**Hopefully this gives you a sense of how Smile's API can be used to build
experiments. Smile's API provides many more complex features which is introduced
in the rest of the documentation.** But before we get into these advanced
features, we will now walk through the process of placing this View in the
Timeline.

## Placing your new Experiment View in the Timeline

All the files that you regularly need to edit are in the `src/user` folder. The
`design.js` file is the main entry point for your experiment. It is where you
define the overall flow of your experiment.

We recommend you take a look at this file. It is fairly long and starts with
some boilerplate configuration and importing. But the key section is where the
timeline is defined. For example, look for a code section like this:

```js
// demographic survey
timeline.pushSeqView({
  name: 'demograph',
  component: DemographicSurvey,
})

// windowsizer
timeline.pushSeqView({
  name: 'windowsizer',
  component: WindowSizer,
})

// instructions
timeline.pushSeqView({
  name: 'instructions',
  component: Instructions,
})
```

This shows the three Views that are currently defined in the experiment. The
`timeline.pushSeqView` method is used to add a new View to the timeline. The
`name` property is used to identify the View. The `component` property is the
Vue component that is used to display the View.

We can add our new View to the timeline by adding a new `pushSeqView` call. Lets
say we wanted to add it after the windowsizer View. We would add it like this:

```js{1-2,16-20}
// put this up at the top of the design.js file with the other imports
import MyView from '@/user/components/MyView.vue'

// demographic survey
timeline.pushSeqView({
  name: 'demograph',
  component: DemographicSurvey,
})

// windowsizer
timeline.pushSeqView({
  name: 'windowsizer',
  component: WindowSizer,
})

// myview inserted here
timeline.pushSeqView({
  name: 'myview',
  component: MyView,
})

// instructions
timeline.pushSeqView({
  name: 'instructions',
  component: Instructions,
})
```

Here we imported our new View (you should do that up at the top of the
`design.js` file with the other imports). Then we added a new `pushSeqView` call
to add it to the timeline. The `name` property is used to identify the View. The
`component` property is the Vue component that is used to display the View.

You'll notice that there are many other Views in the default timeline including
`WindowSizer`, `Instructions`, and `Consent`. These are all
[built in Views](views.html#built-in-views-1) that are provided by Smile which
are commonly used in experiments. You can of course remove any of these, or edit
them to your liking. Some are quite sophisticated and can save you a lot of time
such as the `InstructionsQuiz` View which can be used to quickly build
comprehension check quizes.

That's it! You can now run the experiment and see your new View appear after the
windowsizer View. Let's see how to test it out.

## Developing and debugging your experiment

A final key concept of Smile is the advanced tools which help you develop and
debug your experiment. You can read more about [development](/developing) in the
remainder of the documentation. However, most simply you type

```sh
npm run dev
```

to start the development server. This will show you something like this:

```sh
> smile@0.0.0 dev
> vite

  ➜  Regenerating local environment file based on git info env/.env.git.local

  VITE v6.3.3  ready in 474 ms

  ➜  Local:   http://localhost:3010/nyuccl/smile/main/
  ➜  Network: use --host to expose
  ➜  Inspect: http://localhost:3010/nyuccl/smile/main/__inspect/
  ➜  press h + enter to show help
  ➜  stripping dev/present mode components from src/core/App.vue
  ➜  stripping dev/present mode components from src/core/SmileApp.vue
```

Then you simply open the URL labeled "Local" in your browser.

Critically, when running in development mode, Smile provides a GUI "overlay"
which allows you to see and explore the current state and flow of the
experiment. The dev mode tools are best explained in this video:

## Next steps
