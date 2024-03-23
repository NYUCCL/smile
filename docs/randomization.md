# :game_die: Randomization

Most experiments make use of randomization: tasks are presented to participants in a random order, stimuli are randomly selected from a large pool of possible stimuli, participants are randomly assigned to conditions, etc.

This page shows how to generate random numbers in <SmileText />, and how to use random numbers to accomplish each of the above tasks. This page also shows how to assign participants to conditions in a <i>balanced</i> way, so you end up with roughly the same number of participants in each condition.

## Seeded random number generation

<SmileText /> uses <b>seeded</b> random number generation. Setting a seed makes random number generation reproducible. That is, two random number generators set with the same seed will produce the same sequence of random numbers.

In the context of an experiment, if we know the seed used to assign a particular participant to conditions, stimuli, trial orders, etc., we can completely recreate those conditions, stimuli, trial orders, etc. after the fact. As a result, we can see our experiment _exactly_ as any given participant saw it. This makes it easier to find bugs, understand each participant's responses, etc.

Seeding is also useful for testing: we can easily reconstruct the exact same trials/stimuli/conditions over and over again.

In <SmileText />, seeding happens automatically upon entry into a **route** (see [Timeline](/timeline) for more on routes). Seeds have two components. The first component is a random character string we'll call the "seed ID," generated for each participant. The second is the name of the route that is currently being displayed. Each time a given route is entered (or re-entered), the random number generator will be seeded with the route-specific, participant-specific seed.

So for example, for a participant with seed ID `a5c40328-0625-4353-bab1-05612539dcc3` who enters the route `instructions`, the random number generator will be seeded with the seed `a5c40328-0625-4353-bab1-05612539dcc3-instructions`. After the seed is set (which happens automatically when the route is entered), any calls to `Math.random()` (or built-in randomization functions, which depend on `Math.random()`) will be fully reproducible with the provided seed.

**Note**: Be careful about using external libraries that depend on `Math.random()`, such as lodash. To get lodash to respect the seed you've set, you must import it within the component where you want to use it, then define a new lodash function. Then you must use that function rather than the default `_`:

```js
import _ from 'lodash'
const lodash = _.runInContext()

// this will use the seeded Math.random()
lodash.shuffle([1, 2, 3])
```

Why is the random number generator re-seeded upon entry to each route? Why can't we just seed it once? If the participant accidentally refreshes a page, we want the _same_ random number to be generated on each refresh. For example, if a random number generator controls which of two images is presented to that participant, we don't want the participant to see image 1, accidentally refresh, then be re-randomized to see image 2. If the random number generator was seeded at the beginning of the study, this is exactly what could happen when the page is refreshed (because the code for the beginning of the study won't be re-run). However, if the random number generator is seeded within the route where randomization occurs, the seed will be reset each time the page reloads. As a result, we will always generate the same random numbers for that participant within that route.

**Warning:** Be careful with routes that step through multiple trials. Generally, if a single route steps through multiple views, each of which require a random number (e.g., multiple trials), you should generate all random numbers for that route at the beginning of the route (rather than within each specific trial). Here's why: If the participant refreshes the page, you want them to go back to the trial where they left off (see `pageTracker` in `stores/smiledata.js` for more on this). If you set all random numbers at the beginning, the participant can easily pick up from trial 10 with the same randomization (all random numbers are regenerated upon refresh, and the `pageTracker` will correctly point to the 10th random number for the 10th trial). However, if you set random numbers within each trial, the partcipant will get a different random number on trial 10 before page refresh (the 10th random number after seeding) and after page refresh (the 1st random number after seeding).

## Built-in randomization functions

<SmileText /> includes the following built-in randomization functions:

### `random.randomInt(min, max)`

Generates a random integer between min and max (both inclusive). For example, this can be used to assign a participant to a (numbered) condition.

```js
import * as random from '@/randomization'

// generate a random integer: 1, 2, 3, 4, or 5
const condition = random.randomInt(1, 5)
```

### `random.shuffle(array)`

Randomly shuffles an array. For example, this can be used to present some fixed stimuli in a random order.

```js
import * as random from '@/randomization'

const stimuli = ['image1.png', 'image2.png', 'image3.png', 'image4.png', 'image5.png']

// shuffle the stimulus array
const stimuli_shuffled = random.shuffle(stimuli)
```

### `random.sampleWithoutReplacement(array, sampleSize)`

Samples **without** replacement from an array. For example, this can be used to randomly present 3 stimuli from a larger set.

```js
import * as random from '@/randomization'

const stimuli = ['image1.png', 'image2.png', 'image3.png', 'image4.png', 'image5.png']

// sample (without replacement) from array
const stimuli_selected = random.sampleWithoutReplacement(stimuli, 3)
```

### `random.sampleWithReplacement(array, sampleSize)`

Samples **with** replacement from an array. For example, this can be used to randomly present 3 stimuli from a larger set (with the possibility of presenting the same stimulus twice).

```js
import * as random from '@/randomization'

const stimuli = ['image1.png', 'image2.png', 'image3.png', 'image4.png', 'image5.png']

// sample (with replacement) from array
const stimuli_selected = random.sampleWithReplacement(stimuli, 3)
```

### `random.expandProduct(...arrays)`

Computes the cartesian product of any number of arrays. For example, this can be used to get all permutations of three condition variables.

```js
import * as random from '@/randomization'

const stimuli = ['image1.png', 'image2.png', 'image3.png', 'image4.png', 'image5.png']
const prompts = ['click the red button', 'click the blue button']
const backgroundColors = ['purple', 'orange', 'yellow']

// get cartesian product of all arrays -- this will return an array of 5 x 2 x 3 = 30 arrays (each of length 3), each of which contains a stimulus, prompt, and background color
const all_trial_types = random.expandProduct(stimuli, prompts, backgroundColors)
```

### Random timeline routes

It is possible to randomize the order of routes in the timeline. See [Timeline](/timeline) for further details.

## "Unseeded" random number generation

In rare cases, it may be desirable to generate "true" or "unseeded" random numbers (by default `Math.random()` actually does set a seed, but it's set automatically using other random stuff). To do so, you can make a local instance of a random number generator using the `seedrandom` library:

```js
import seedrandom from 'seedrandom'

const rng = seedrandom()

// number will not be reproducible
rng()
```

## Balanced condition assignment

Sometimes, it is desirable to <i>balance</i> condition assignment, so that roughly even numbers of participants are assigned to each condition. Note that balanced condition assignment is <b>NOT</b> (completely) random. In addition, it doesn't take into account whether participants leave the experiment early&mdash;so each condition will have an equal number of participants who <i>start</i> the experiment, but not necessarily who <i>finish</i> the experiment.

### Assigning conditions

To balance condition assignment, all you need to do is add a field called `possibleConditions` to the local state (in `src/smiledata.js`):

```js
export default defineStore('smilestore', {
state: () => ({
    local: useStorage(appconfig.local_storage_key, {
      // other fields here,
      possibleConditions: {cond2: ["X", "Y"]},
    }
```

`possibleConditions` should include any named conditions that you want to balance. For example, the above experiment will balance condition assignment between two conditions: `X` and `Y`. This distinction between `X` and `Y` is named `cond2`.

You can also balance assignment between multiple conditions. For example, let's say you want to assign two conditions: the order in which some tasks are presented, and which instructions are presented. You can set `possibleConditions` as follows:

```js
export default defineStore('smilestore', {
state: () => ({
    local: useStorage(appconfig.local_storage_key, {
      // other fields here,
      possibleConditions: {taskOrder: ["AFirst", "BFirst"], instructions: ["version1", "version2", "version3"]},
    }
```

When you have multiple condition variables, assignment will be balanced across all combinations of all variables. In the above example, that means equal numbers of participants will be assigned to AFirst-version1, AFirst-version2, AFirst-version3, BFirst-version1, BFirst-version2, and BFirst-verstion3.

Random condition assignment occurs when the global data store is first connected to the Firestore database. By default, this occurs after the participant signs the consent form, in `src/ConsentPage.vue`, using the `smilestore.setKnown()` function. If you need access to the assigned condition before the consent page (or immediately after, since condition assignment happens asynchronously), you may need to adjust when this function is called.

### How does it work?

In the Firestore database, <SmileText /> maintains a collection called `counters` for each experiment. One of the counters is a document called `conditions`, which stores the number of participants assigned to each condition (or combination of conditions).

![ConditionCounter](/images/conditioncounter.png)

Every time a new participant connects to the Firestore database, <SmileText /> looks at these condition counts and finds which condition(s) have the lowest count. If there is only one condition/combination with the lowest count, the participant is assigned to that condition/combination. If there are multiple conditions/combinations with the lowest count, the participant is assigned at random to one of those conditions/combinations.

**WARNING**: If the local store `possibleConditions` is changed (e.g., if you add a condition, rename one of the conditions, or even switch the order of multiple named condition groups), the condition counter in Firestore will completely reset when the next participant begins the study. All existing counts will be set to zero, and any conditions that are no longer in `possibleConditions` will be erased from the counter.

### Accessing the assigned conditions

By default, the assigned conditions will be saved to the global store, in a field called `conditions`. They can be accessed within a component using a getter called `getConditions`.

```js
import useSmileStore from '@/stores/smiledata' // get access to the global store

const smilestore = useSmileStore()

const conds = smilestore.getConditions
console.log(conds.taskOrder)
```

If you want to use these conditions in a component (for example, displaying different instructions based on the assigned condition), you need to use a [Vue computed property](https://vuejs.org/guide/essentials/computed.html). This is because the conditions are reactive. If you just try to access `smilestore.getConditions` directly, the component will not update when the conditions change. Here is an example of defining a computed property based on the conditions:

```js
import { computed } from 'vue'
import useSmileStore from '@/stores/smiledata'

const smilestore = useSmileStore()

const instText = computed(() => {
  if (smilestore.getConditions.instructions === 'version1') {
    return 'instructions version 1'
  }
  if (smilestore.getConditions.instructions === 'version2') {
    return 'instructions version 2'
  }
  if (smilestore.getConditions.instructions === 'version3') {
    return 'instructions version 3'
  }
  return 'no condition set'
})
```

If you then refer to `instText` in your `<template>` section, the component will display the correct instructions based on the assigned condition (or "no condition set" if no condition has been assigned yet).

## Override randomization for debugging

As mentioned, <SmileText /> automatically generates a seed ID, which is used to set all local seeds throughout the experiment. When in dev mode (see [Developing](/developing)), you can also override the seed ID. By doing so, you can recreate exactly what a participant saw when they completed the experiment (or what you yourself saw in a previous run of the experiment). To do so, on the developer mode landing page, replace the contents of the textbox with the seed ID you'd like to use. Then click the green refresh button to the right of the textbox. Finally, proceed with choosing a platform. The following run of the experiment will use random numbers determined by the seed ID you entered.

**Note**: You must choose a platform for the seed to work properly. Make sure you choose the same platform when trying to re-run the same seed.

![Seed override](/images/seedoverride.png)

You can also override the seed within a component (e.g., if you'd like to re-randomize the condition assignment without starting over the entire experiment). To do so, uncheck the box labeled "Seed" in the developer mode navigation bar (see below). Now, every time you refresh the page, a new random seed will be set (at random---you cannot choose which seed is set). To re-enable the initial seed, check the box and refresh the page.

![Nav bar randomization override](/images/navbaroverride.png)

As shown in the image above, you can also override the assigned condition using the developer mode navigation bar. Hover over the dropdown menu for any named condition (pulled from `possibleConditions` in the local store). You can then select a condition to override the assigned condition. This could be useful e.g. if you want to preview the instructions shown to participants in each condition without restarting the entire experiment.
