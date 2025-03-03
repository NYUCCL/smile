# :ladder: Stepping Through Trials
For some conditions in your experiment, you may want to repeat several trials
of the same event. Smile provides a trial stepper for organizing and managing
sequenced events _within_ a View. This way, you can avoid repeating a 
[View](/views) multiple times in your [timeline](/timeline). 

<img src="/images/steps.png" width="600" alt="steps example" style="margin: auto;">

Here, we introduce the concept of a "step" and how to programmatically advance
through a sequence of steps within a particular View. The same concept is also
used to add sequential build to any type of view (e.g., a sequence of
instructions, a multi-part form, or an animation).

::: tip Steps are like builds in a Keynote/Powerpoint animation

By way of analogy, thing of different [Views](/views) as slides in a
Keynote/Powerpoint presentation while a step is like a build or animation
**within** a slide.

:::

A key feature of stepped Views is that they persist their state in the browswer
using local storage. This means that if the subject reloads the pages, or
navigates to a different site and then returns, the task will resume from the
same step. This is nice because it helps ensure that subjects are always
completing the set of steps/trials assigned to them and are not able to start
the task over (possibly introducing biased data from practice effects or
exposure to manipulations). You can learn more about this feature by reading
about how to [persist stepper state](#persisting-stepper-state)

## Create a stepped View

To create a stepped view, you need to import the SmileAPI, define your trials, 
(which can be adapted later), then use the `useTrialStepper` method to advance 
through the trials. Here, we will walk through the steps of setting up your 
trial stepper. 

### Import the SmileAPI

In your `<script setup>` section, import the SmileAPI and initialize it. This
will give you access to the `useTrialStepper` method which will allow you to
advance through the trials.

```vue
<script setup>
import useAPI from '@/core/composables/useAPI' // [!code highlight]
const api = useAPI() // [!code highlight]
</script>
```

### Define the trials


Next, still in `<script setup>`, you can define your trials. Each trial 
is an object with keys which defines the information displayed for that
trial. In the simplest case, the trials will all exist on one level, and
the stepper will advance through linearly.

```js
var trials = [
  { word: ['SHIP'], color: ['red'] },
  { word: ['WORLD'], color: ['green'] },
  ... // more trials
]
```

You can also define nested trials. Say you have 2 different conditions within
a View. For each condition, you would like to specify a few subconditions and 
repeat that scenario 3 times. You can always name your fields anything you
would like, but make sure to use the field `repeat_for` if you would like to
indicate that you want to loop over a specified condition for some number of
times. Below is an example trial configuration:

```js
var trials = [
  {level1: ['condition_1'], 
   level2: ['subcondition_a', 'subcondition_b'], 
   repeat_for: 3},
  {level1: ['condition_2'], 
   level2: ['subcondition_a', 'subcondition_b', 'subcondition_c'], 
   repeat_for: 3},
  ... // more trials
]
```
The resulting trial structure is represented by the following tree diagram. Note
that the order of fields in each dictionary dictates the nesting order of the trial 
conditions. The next section will detail how the trial stepper navigates this tree 
diagram. 

<img src="/images/nested_steps.png" width="250" alt="nested_steps" style="margin: auto;">


### Use the `useStepper` method

The `useStepper` method to advance through the trials. This method
uses a Vue composable to provide methods to advance and go back through the
trials.

```js
const step = api.useTrialStepper(trials)
```
By default, the trial stepper will always move through the leaf nodes of the trial
tree. Referring to the above image, that means the trial stepper will iterate over 
the numbered trials, while still populating the page with the information given
by the fields in the parent levels. This structure allows you to flexibly set up
multiple conditions, trials, and repeated events for each experiment page with 
minimal code repetition.

The returned stepper object provides:

- `step.next()`: Advance to the next step
- `step.prev()`: Go back to the previous step
- `step.index()`: Get the current trial index
- `step.current()`: Get the current trial data
- `step.reset()`: Reset back to the first step

Each time you want to advance to the next step, you need to call `step.next()`.
You can also step back through the steps by calling `step.prev()`. If
`step.next()` is called when the last step is reached, the callback function
passed to `api.useStepper()` is called.

While you are on a given step you can access the current step number using
`step.index()` (indexed starting at 0). You can also get the current meta-data
of the trials passed as input to `api.useStepper()` by calling `step.current()`.

Call `step.reset()` to reset back to the first step.

::: warning You are responsible detecting when the last step is reached!

You are responsible for detecting when the last step is reached and taking
appropriate action (e.g., saving data, computing a score, etc.). This condition
is met usually when `step.index()` is equal to the number of trials.

:::

Here is a approximate example of the key features for a simple Stroop task.

```vue
<script setup>
// A Basic Stroop Experiment

...

// import and initalize smile API
import useAPI from '@/core/composables/useAPI' // [!code highlight]
const api = useAPI() // [!code highlight]

/*
   Next we need to define the trials for the experiment.  Create
   a list composed of objects where each entry in the list is a trial
   and the keys of the object are the variables that define each trial.
*/
var trials = [
  { word: 'SHIP', color: 'red', condition: 'unrelated' },
  ... // more trials
]

// next we shuffle the trials
trials = api.shuffle(trials)


//  Create the stepper which will advance through the steps.
const step = api.useStepper(trials) // [!code highlight]

var final_score = ref(0)

// Handle the key presses for the task
// onKeyDown is a composable from the VueUse package
const stop = onKeyDown(
  ['r', 'R', 'g', 'G', 'b', 'B'],
  (e) => {
    if (step.index() < trials.length) {
      e.preventDefault()
      if (['r', 'R'].includes(e.key)) {
        // handle red
      } else if (['g', 'G'].includes(e.key)) {
        // handle green
      } else if (['b', 'B'].includes(e.key)) {
        // handle blue
      }
      api.recordTrialData({ // record the data
        trialnum: step.index(),
        word: step.current().word,
        color: step.current().color,
        condition: step.current().condition,
        response: e.key,
      })
      step.next() // [!code highlight] step to next build/trial

      // if we are at the end of the trials, compute a final score
      if (step.index() >= trials.length) { // [!code highlight]
        final_score.value = 100
        stop() // [!code highlight] This removes the keydown listener
      }
    }
  },
  { dedupe: true }
)

// what to when all the trials are completed
function finish() {
  api.goNextView()
}
</script>
```

This is the template code for the view. Notice that the `step.index()` method is
used to get the current step number and the `step.current()` method is used to
get the current trial data (e.g., `step.current().word`).

```vue
<template>
  <div class="page prevent-select">
    <!-- Show this for each trial -->
    <div class="strooptrial" v-if="step.index() < trials.length">
      {{ step.index() + 1 }} / {{ trials.length }}
      <h1 class="title is-1 is-huge" :class="step.current().color">
        {{ step.current().word }}
      </h1>
      <p id="prompt">Type "R" for Red, "B" for blue, "G" for green.</p>
    </div>

    <!-- Show this when you are done with the trials and offer a button
         which will advance to the next route -->
    <div class="endoftask" v-else>
      <p id="prompt">
        Thanks! You are finished with this task and can move on.
      </p>
      <!-- display the final score -->
      <p>Your score was {{ final_score }}</p>
      <button class="button is-success is-light" id="finish" @click="finish()">
        Continue &nbsp;
        <FAIcon icon="fa-solid fa-arrow-right" />
      </button>
    </div>
  </div>
</template>
```

## Persisting stepper state

The stepper state is stored in the application state. This means that if the
subject reloads the pages, or navigates to a different site and then returns,
the task will resume from the same step. This is nice because it helps ensure
that subjects are always completing the set of steps/trials assigned to them and
are not able to start the task over (possibly introducing biased data from
practice effects or exposure to manipulations).
