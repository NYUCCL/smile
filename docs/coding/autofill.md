# Autofill

When developing and debugging your experiment, it is useful to have a way to
"fake" data for various components. This serves two purposes:

- It let you quickly jump ahead to test different parts of the code
- It lets you generate fake, but realistic data for your experiment. This can
  help later to test your data analysis scripts.

In <SmileText/> you can autofill forms and other components with fake data. With
this feature you can quickly click through your experiment during testing and
create realistic looking data than you can use to test your data analysis.

## Autofill forms

To autofill a form with fake data we register a function with the [API](/api)
that will be called when the autofill button is clicked. This function should
set the values of the form fields to the desired values. The function is pure
JavaScript and can be as simple or complex as needed. For example in the
[demographic survey View](/coding/views#demographic-survey) we might want to
autofill the form with some common values:

```js
<script setup>
function autofill() {
  forminfo.dob = '1986-09-12'
  forminfo.gender = 'Male'
  forminfo.race = 'Caucasian/White'
  forminfo.hispanic = 'No'
  forminfo.fluent_english = 'Yes'
  forminfo.normal_vision = 'Yes'
  forminfo.color_blind = 'No'
  forminfo.learning_disability = 'No'
  forminfo.neurodevelopmental_disorder = 'No'
  forminfo.psychiatric_disorder = 'No'
  forminfo.country = 'United States'
  forminfo.zipcode = '12345'
  forminfo.education_level = 'Doctorate Degree (PhD/Other)'
  forminfo.household_income = '$100,000–$199,999'
}

api.setAutofill(autofill)
</script>
```

In this example the `autofill()` function sets the values of the form fields to
deterministic "standin" values. Then we call `api.setAutofill(autofill)` to
register this function as available.

When a [View](/coding/views) has an autofill function registered a special
button will appear in the [developer tools](/coding/developing) menu bar that,
when clicked, will autofill the form values using this function.

You can call `api.removeAutofill()` to remove the autofill function from the
developer tools if needed. When you navigate on the timeline to a new View the
autofill function is automatically removed so it must be re-registered within
each view.

## Autofill trials

The above works for simple forms but what about more complex components like
multi-trial Views? In this case several trials might need autofill data. In
addition, each trial might have different types of autofil data. For example,
each trial might have a correct/incorrect field (Boolean) and a reaction time
field (Number). In this case we can register a function that will be called for
to autofill the data. This function should return an object with the autofill
data for that trial. This is best explained with an example.

Imagine you want to make simple Stroop experiment where participants see words
written in different color fonts and respond to the color of the font, not the
word itself. You might configure several trials like this:

```js
const trialTypes = [
  { word: 'SHIP', color: 'red', condition: 'unrelated' },
  {
    word: 'MONKEY',
    color: 'green',
    condition: 'unrelated',
  },
  { word: 'ZAMBONI', color: 'blue', condition: 'unrelated' },
  { word: 'RED', color: 'red', condition: 'congruent' },
  { word: 'GREEN', color: 'green', condition: 'congruent' },
  {
    word: 'BLUE',
    color: 'blue',
    condition: 'congruent',
  },
  { word: 'GREEN', color: 'red', condition: 'incongruent' },
  { word: 'BLUE', color: 'green', condition: 'incongruent' },
  { word: 'RED', color: 'blue', condition: 'incongruent' },
]
```

This could of course be generated programmatically.

Next we'd like to augment this data structure with expected responses. To do
this we will loop through each trial spec and add fields we expect to record in
our experiment including `reactionTime`, `accuracy`, and `response`:

```js
var trials = []

// add the data fields
for (let trialType of trialTypes) {
  trials.addSpec({
    ...trialType,
    reactionTime: () => api.faker.rnorm(500, 50),
    accuracy: () => api.faker.rbinom(1, 0.8),
    response: () => api.faker.rchoice(['r', 'g', 'b']),
  })
}
```

In this example, we are defining the fields `reactionTime`, `accuracy`, and
`response` to be random variables chosen from a specific distribution. The
`api.faker` library (documented below) provides a number of useful functions for
generating data of various types.

At this point these values are not "filled in" to the trials but are just
defined to be functions `() => ...`. To actually fill in the values we need to
'render' the data we can do this for a single trial using the
`api.faker.render()` function. This function will call all the functions in the
template and return the result. For example:

```js
// next we shuffle the trials
trials = api.shuffle(trials)

function autofill() {
  while (step.index() < trials.length) {
    api.debug('auto stepping')

    var t = api.faker.render(trials[step.index()])
    api.debug(t)
    api.recordPageData(t)

    step.next()
  }
}

api.setAutofill(autofill)
```

In this example we first shuffle the abstract trial definitions. Then we define
an `autofill()` function. This function will be called when the autofill button
is clicked after it is registered `api.setAutofill(autofill)`. Inside this
function is steps through each trial, rendering the data for that trial, saving
it to the smilestore database, then advancing to the next step. The rendering
step calls the `api.faker.*()` methods as defined and makes "fake" data for the
trial. This data is then [recorded to the database](/coding/datastorage) using
`api.recordPageData()`.

## The Autofill API

The autofill API is a set of functions that are available to you when you are
developing your app to help you quickly skip forms and generate fake data. The
API is available through the [Smile API](/api) object. The following functions
are available:

### `api.setAutofill(autofillFunction)`

Registers a function to be called when the autofill button is clicked. This is
just a pure JavaScript function that sets the values of the form fields to the
desired values. The function should have no arguments.

### `api.removeAutofill()`

This removes the autofill function from the developer tools menu bar. This
called automatically when each [view](/coding/views) is advanced on the
[timeline](/coding/timeline).

## The Faker API

The faker API provides a set of functions for generating fake data. This is
provided a submodule of the `api` object. The following functions are available:

### `api.faker.rnorm(mean, sd)`

### `api.faker.runif(min, max)`

### `api.faker.rbinom(n, p)`

### `api.faker.rexGuassian(mu, sigma, tau)`

### `api.faker.rchoice(choices)`

### `api.faker.render(object)`

This function takes a javascript option contining functions and trial
descriptors returns a new javascript object with the functions replaced by their
values.
