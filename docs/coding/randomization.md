# Randomization

Most experiments make use of randomization: tasks are presented to participants
in a random order, stimuli are randomly selected from a large pool of possible
stimuli, participants are randomly assigned to conditions, etc.

This page shows how to accomplish each of the above tasks.

## Seeded random number generation

Smile uses <b>seeded</b> random number generation. Setting a seed makes random
number generation reproducible. That is, two random number generators set with
the same seed will produce the same sequence of random numbers.

In the context of an experiment, if we know the seed used to assign a particular
participant to conditions, stimuli, trial orders, etc., we can completely
recreate those conditions, stimuli, trial orders, etc. after the fact. As a
result, we can see our experiment _exactly_ as any given participant saw it.
This makes it easier to find bugs, understand each participant's responses, etc.

Seeding is also useful for testing: we can easily reconstruct the exact same
trials/stimuli/conditions over and over again.

Finally, seeding helps prevent randomization errors that can happen when a
participant accidentally refreshes the page or leaves the page and comes back
later. **Without** seeded random number generation, a View that randomly
presents an image will likely present a different image when the page is
refreshed. **With** participant-specific seeded random number generation, the
View will always present the same image when re-visited by the same participant.

In <SmileText />, seeding happens automatically when the website is first
launched, then again upon entry into each **View** (see
[Timeline](/coding/timeline) for more on Views and navigation between them).
Seeds have two components. The first component is a random character string
we'll call the "seed ID," generated for each participant. The second is the name
of the route that is currently being displayed. Each time a given route is
entered (or re-entered), the random number generator will be seeded with the
route-specific, participant-specific seed. This means that the study will be
fully randomized for each participant with a new, unique seed. As a result,
everything will be fully randomized _across_ participants, but completely
reproducible _within_ a participant's session.

So for example, for a participant with seed ID
`a5c40328-0625-4353-bab1-05612539dcc3` who enters the route `instructions`, the
random number generator will be seeded with the seed
`a5c40328-0625-4353-bab1-05612539dcc3-instructions`. After the seed is set
(which happens automatically when the route is entered), any calls to
`Math.random()` (or built-in randomization functions, which depend on
`Math.random()`) will be fully reproducible with the provided seed.

**Note**: Be careful about using external libraries that depend on
`Math.random()`, such as lodash. To get lodash to respect the seed you've set,
you must import it within the component where you want to use it, then define a
new lodash function. Then you must use that function rather than the default
`_`:

```js
import _ from 'lodash'
const lodash = _.runInContext()

// this will use the seeded Math.random()
lodash.shuffle([1, 2, 3])
```

**Warning:** Be careful with Views that step through multiple trials using the
[stepper](/coding/steps). Generally, if a single View steps through multiple
trials, each of which require a random number, you should generate all random
numbers for that route at the beginning of the View (rather than within each
specific trial). Here's why: If the participant refreshes the page, you want
them to go back to the trial where they left off. If you set all random numbers
at the beginning, the participant can easily pick up from trial 10 with the same
randomization (all random numbers are regenerated upon refresh, and the stepper
will correctly point to the 10th random number for the 10th trial). However, if
you set random numbers within each trial, the participant will get a different
random number on trial 10 before page refresh (the 10th random number after
seeding) and after page refresh (the 1st random number after seeding).

## Random condition assignment

Now that you understand seeded random number generation, we'll show you how
randomization is used in <SmileText />. First, let's look at randomly assigning
conditions. The [API](/api) provides a function to randomly assign participants
to between-subjects conditions. This requires a name for the condition (e.g.,
`taskOrder`) and any number of values that the condition can take (e.g., `AB`
and `BA`).

```js
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

api.randomAssignCondition({ taskOrder: ['AB', 'BA'] })
```

This function can also include weights. Say you want twice as many participants
in variation condition C compared to variation condition D:

```js
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

api.randomAssignCondition({ variation: ['C', 'D'], weights: [2, 1] })
```

Note that the weights are automatically normalized, so [2/3, 1/3] or [4, 2]
would generate the same distribution.

To access the value of the condition elsewhere (e.g., in the instructions
component), you can do:

```js
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

api.getConditionByName('taskOrder')
api.getConditionByName('variation')
```

As long as the condition has already been set, this will return the value
assigned to each condition (e.g., `AB` or `BA` for taskOrder). If the condition
has not already been set, this will return `undefined`. Generally, we recommend
that you assign all conditions at the beginning of the experiment in
`design.js`, to avoid cases where you try to access a condition that doesn't
exist yet.

## Built-in randomization functions

You may also want to do your own custom randomization, outside of condition
assignment. For example, maybe you want to randomize the order of trials that
you give to the [trial stepper](/coding/steps), or only display a subset of
trials.

<SmileText /> [API](/api) includes the following built-in randomization
functions for these situations:

### `api.randomInt(min, max)`

Generates a random integer between min and max (both inclusive).

```js
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

// generate a random integer: 1, 2, 3, 4, or 5
const number = api.randomInt(1, 5)
```

### `api.shuffle(array)`

Randomly shuffles an array. For example, this can be used to present some fixed
stimuli in a random order.

```js
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

const stimuli = [
  'image1.png',
  'image2.png',
  'image3.png',
  'image4.png',
  'image5.png',
]

// shuffle the stimulus array
const stimuli_shuffled = api.shuffle(stimuli)
```

### `api.sampleWithoutReplacement(array, sampleSize)`

Samples **without** replacement from an array. For example, this can be used to
randomly present 3 stimuli from a larger set.

```js
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

const stimuli = [
  'image1.png',
  'image2.png',
  'image3.png',
  'image4.png',
  'image5.png',
]

// sample (without replacement) from array
const stimuli_selected = api.sampleWithoutReplacement(stimuli, 3)
```

### `api.sampleWithReplacement(array, sampleSize)`

Samples **with** replacement from an array. For example, this can be used to
randomly present 3 stimuli from a larger set (with the possibility of presenting
the same stimulus twice).

```js
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

const stimuli = [
  'image1.png',
  'image2.png',
  'image3.png',
  'image4.png',
  'image5.png',
]

// sample (with replacement) from array
const stimuli_selected = api.sampleWithReplacement(stimuli, 3)
```

### `random.expandProduct(...arrays)`

Computes the cartesian product of any number of arrays. For example, this can be
used to get all permutations of three condition variables.

```js
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

const stimuli = [
  'image1.png',
  'image2.png',
  'image3.png',
  'image4.png',
  'image5.png',
]
const prompts = ['click the red button', 'click the blue button']
const backgroundColors = ['purple', 'orange', 'yellow']

// get cartesian product of all arrays -- this will return an array of 5 x 2 x 3 = 30 arrays (each of length 3), each of which contains a stimulus, prompt, and background color
const all_trial_types = api.expandProduct(stimuli, prompts, backgroundColors)
```

### Random timeline routes

It is possible to randomize the order of routes in the timeline. See
[Timeline](/coding/timeline) for further details.

## "Unseeded" random number generation

In rare cases, it may be desirable to generate "true" or "unseeded" random
numbers. To do so, you can use the Smile API:

```js
const api = useAPI()

// randomize seed each time component is loaded
api.randomSeed()
```

This will initialize the component with a random seed each time the View is
loaded. You can also provide a fixed seed using the same function:

```js
const api = useAPI()

// set to a known seed
api.randomSeed(12344)
```

## Override randomization for debugging

As mentioned, <SmileText /> automatically generates a seed ID, which is used to
set all local seeds throughout the experiment. When in dev mode (see
[Developing](/coding/developing)), you can also override the seed ID. By doing
so, you can recreate exactly what a participant saw when they completed the
experiment (or what you yourself saw in a previous run of the experiment). To do
so, go to the "Random" tab in the dev console, then replace the contents of the
seed textbox with the seed ID you'd like to use. Click "Update seed" to the
right of the textbox. You will now be viewing the experiment using randomization
with that seed.

![Seed override](/images/seedoverride.png)

You can also remove seeded random number generation within a component (e.g., if
you'd like to re-randomize the condition assignment without starting over the
entire experiment). To do so, in the same menu shown above, switch off "Fixed
Seed." Now, every time you refresh the page, everything in the View will be
newly randomized.

In the same "Random" menu, you can also override the assigned conditions, by
clicking on the dropdown for each condition:

![Nav bar condition override](/images/conditionoverride.png)

This could be useful, e.g., if you want to preview what different in-View
randomization outputs might look like without re-starting the whole experiment.
For example, if you click on a different instructionsVersion condition in the
example shown above, the page will immediately reload to show the new condition.
