<script setup>
//import AdvertisementView from '../src/builtins/recruitment/AdvertisementView.vue'
</script>

# Views

[Components](/coding/components) are the basic building blocks of a <SmileText/>
experiment. However, components can play different roles. In <SmileText />, each
major phase of an experiment is associated with its own special
[component](/coding/components) called a "View". (We will refer to Views using a
capital 'V' to distinguish them from ordinary uses of the word "view."). Other
packages might refer to View elements as "pages", "routes", "sections", "parts",
or "phases."

<img src="/images/viewstimeline.png" width="600" alt="timeline example" style="margin: auto;">

To help make clear the distinction between a View and an ordinary component,
consider the following examples:

- A consent form might be one View but be composed of many components (e.g., a
  consent text component, a signature component, a submit button component,
  etc.).
- A welcome page might be one View but be composed of many components (e.g., a
  welcome text component, a start button component, etc.).
- A block of trials in an experiment might be one View but be composed of many
  components (e.g., a trial component, a fixation component, a feedback
  component, etc.).

Each View is associated with one Vue component that is responsible for rendering
the content of that View. A View can, of course, be made up of many smaller
components. By convention, the filename of any component that is treated as a
View should end in `View.vue`, for example, `WelcomeView.vue`,
`ConsentView.vue`, etc.

Views are a useful way of thinking about bigger parts or phases of an
experiment. Views tend to be modular and reusable "sections" of an experiment
that you might use in different experiments or different parts of the same
experiment. The sequencing of different Views is controlled by the
[**Timeline**](/coding/timeline) (and more specifically `@/user/design.js`).

## ViewAPI

Smile provides a custom API for Views called the ViewAPI. This API is available
in the `<script setup>` section of your View component. It is accessed via the
`useViewAPI` composable.

```vue
<script setup>
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()
</script>
```

The ViewAPI is fully documented in the [API](/api) section. It provides a very
large number of methods for controlling Smile applications. However, perhaps the
most important are the methods which help navigate between views.

- `api.goNextView(resetScroll = true)`: Advances to the next View in the
  timeline. The `resetScroll` parameter controls whether to automatically scroll
  to the top of the page after navigation (_The scroll behavior targets the
  `.device-container` element, which is the main content wrapper in Smile
  applications._)
- `api.goPrevView(resetScroll = true)`: Returns to the previous View in the
  timeline. The `resetScroll` parameter controls whether to automatically scroll
  to the top of the page after navigation.
- `api.goToView(view, force = true, resetScroll = true)`: Navigates to a
  specific View (by name). The `force` parameter temporarily disables
  [navigation guards](/coding/timeline.html#navigation-permissions). The
  `resetScroll` parameter controls whether to automatically scroll to the top of
  the page after navigation.
- `api.hasNextView()`: Checks if there's a next View available.
- `api.hasPrevView()`: Checks if there's a previous View available.
- `api.nextView()`: Returns the next view object in the navigation sequence.
- `api.prevView()`: Returns the previous view object in the navigation sequence.

There is more information on view navigation in the
[timeline](/coding/timeline.html#navigating-between-views) section. One
important point is that `goNextView()`, `goPrevView()`, and `goToView()` also
automatically call `saveData()` on the global store prior to View changes. So as
a result, you can trust that your data will be saved/synchronized with the
persistent store (Firestore) whenever you navigated between Views.

## Persisting data for the view

The ViewAPI object provides a `.persist` object that can be used to
[persist](/coding/persistence) data for the view. This data is stored in the
browser's local storage and is available even after the page is reloaded.

```js
api.persist.myVar = 'value'
```

This variable will now be available in the View even after the page is reloaded.
It is also visible in the developer tools side panel.

This can be used to track persistent variables like accuracy/score, etc... in a
view that is not tied to a particular _step_ of a view:

```js
// if hits not defined yet then initialize it and timer.
if (!api.persist.isDefined('hits')) {
  api.persist.hits = 0
  api.persist.attempts = 0
  api.persist.finalScore = 0
}
```

## Timing functions in a view

The ViewAPI provides several timing functions that allow you to track elapsed
time during experiments. These functions are useful for measuring response
times, task duration, and other time-based metrics.

### Basic Timing Functions

The timing functions use persisted variables to store timestamps, so they work
across browser reloads and view navigation:

- `api.startTimer(name)`: Starts a named timer by storing the current timestamp
- `api.isTimerStarted(name)`: Checks if a named timer has been started
- `api.elapsedTime(name)`: Gets elapsed time in milliseconds since timer started
- `api.elapsedTimeInSeconds(name)`: Gets elapsed time in seconds since timer
  started
- `api.elapsedTimeInMinutes(name)`: Gets elapsed time in minutes since timer
  started

### Example Usage

```js
// Start a timer when the view loads
api.startTimer()

// Later, check elapsed time
const seconds = api.elapsedTimeInSeconds()
console.log(`Task has been running for ${seconds} seconds`)

// Check if timer exists before starting
// This starts a timer if it doesn't already
// exit meaning it records from the first page load rather than the most recent
// page load
if (!api.isTimerStarted()) {
  api.startTimer()
}
```

### Timer Names

By default, timers use the name `'default'` if no name is provided. You can use
any string as a timer name to track different events:

```js
// Start multiple named timers
api.startTimer('experimentStart')
api.startTimer('currentBlock')
api.startTimer('currentTrial')

// Check specific timers
const experimentTime = api.elapsedTimeInMinutes('experimentStart')
const blockTime = api.elapsedTimeInSeconds('currentBlock')
```

Timer data is stored in the persisted variables system, so timers will continue
running even if the participant navigates between views or reloads the page.
This makes them ideal for tracking overall experiment duration and other
long-running measurements.

## Designing and Styling Views

In addition to the ViewAPI, Smile provides a number of tools for designing and
styling Views. These are described in the [styling](/styling/styleoverview)
section. The most important of these is the basic UI
[components](/styling/uikit) and [layouts](/styling/layouts) which can be used
to design and style your Views. This can save you a lot of time when developing
tasks and help improve the consistency of the design.

## Built-in Views

When you [setup](/starting) the default <SmileText /> project you automatically
get a number of built-in Views that are useful for most experiments. These
include things like obtaining [informed consent](#informed-consent), presenting
[instructions](#simple-instructions), etc... This section describes these
default built-in Views and provides an overview of how to customize them for
your experiment.

### Props

Each View can be configured with a set of
[props](https://vuejs.org/guide/components/props) (basically input parameters)
that control the behavior of the View. These props will be configured in the
`@/user/design.js`. Examples of all of the props will be shown in the below
examples.

### Metadata options

Each View can also be defined with a set of metadata properties that control
page access. These `meta` property will be configured in the `@/user/design.js`.
Examples on all of the metadata properties will be shown in the below examples,
and more information can be found
[here](https://router.vuejs.org/guide/advanced/meta.html#Route-Meta-Fields).

## Overview of Built-in Views

| Name                                         | Props | Description                                                                                                                               |
| -------------------------------------------- | :---- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| [Recruitment Ad](#recruitment-advertisement) | No    | Landing page for participants                                                                                                             |
| [MTurk Ad](#mturk-recruitment)               | Yes   | Interacts with the MTurk system                                                                                                           |
| [Informed Consent](#simple-informed-consent) | Yes   | Collects informed consent using a simple checkbox                                                                                         |
| [Window Sizer](#window-sizer)                | Yes   | Verifies a given area of the screen is visible (with a more aggressive option that hides page content if the window is resized too small) |
| [Simple Instructions](#simple-instructions)  | No    | A simple sequence of pages for instructions                                                                                               |
| [Instructions Quiz](#instructions-quiz)      | Yes   | A basic instructions quiz                                                                                                                 |
| [Demographic Survey](#demographic-survey)    | No    | A survey which collects some demographic info                                                                                             |
| [Device Survey](#device-survey)              | No    | A survey which collects some self-report about computer/device                                                                            |
| [Withdraw](#withdraw)                        | No    | A survey which processes a participant's request to withdraw from study                                                                   |
| [Debrief](#debrief)                          | Yes   | A simple text View which describes the purpose of study                                                                                   |
| [Feedback](#feedback)                        | No    | A survey for soliciting structured and unstructured feedback on the study                                                                 |
| [Thanks Page](#thanks)                       | No    | A thank you page                                                                                                                          |

These components are located in the `src/builtins` directory. In <SmileText/> a
short-hand for the src folder is '@' so for instance '@/builtins' refers to the
`src/builtins` directory.

## Built-in Views

### Recruitment Advertisement

**Base Component**: `@/builtins/advertisement/AdvertisementView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/advertisement/AdvertisementView.vue)  
**Typical
accessibility**: `{allowAlways: true}`

Before a participant can begin a study, they must first be recruited. The
landing page for your experiment is the Advertisement View. This is the first
thing that participants will see when they visit your experiment. The
Advertisement View is a simple page that contains a title and an invitation to
participate. There is a animated button which will take the participant to the
next View in the timeline.

- The template can be edited to change the text.
- The logo image imports from `@/user/assets/brain.svg`.

<AdvertisementView/>

Example `design.js` entry:

```js
// put this at the top of the file
import AdvertisementView from '@/builtins/advertisement/AdvertisementView.vue'

timeline.pushSeqView({
  path: '/welcome',
  name: 'welcome_anonymous',
  component: AdvertisementView,
  meta: {
    prev: undefined,
    next: 'consent',
    allowAlways: true,
    requiresConsent: false,
  },
})
```

Another `design.js` alternative for studies that use external services like
Prolific:

```js
// put this at the top of the file
import AdvertisementView from '@/builtins/advertisement/AdvertisementView.vue'

timeline.pushSeqView({
  path: '/welcome/:service',
  name: 'welcome_referred',
  component: AdvertisementView,
  meta: {
    prev: undefined,
    next: 'consent',
    allowAlways: true,
    requiresConsent: false,
  },
  beforeEnter: (to) => {
    // processes info to get the service-specific
    // participant info (e.g., Profilic ID)
    processQuery(to.query, to.params.service)
  },
})
```

This will automatically save service-specific participant info to your data
(e.g., Prolific ID), with current built-in support for Prolific, Amazon MTurk,
and CloudResearch.

### MTurk Recruitment

**Base Component**: `@/builtins/mturk/MTurkRecruitView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/mturk/MTurkRecruitView.vue)  
**Typical
accessibility**: `{allowAlways: true}`

On the Mechanical Turk, the platform lists possible HITs (Human Intelligence
Tasks) and workers can choose to complete them. When browsing the listing
participants see one "advertisement" view of the task in an `iframe`. When
browsing in this listing the assignmentId is set to
`ASSIGNMENT_ID_NOT_AVAILABLE`. If they accept the HIT, then the task begins and
a new window opens with the actual task. At this point a valid assignmentId will
be provided.

This View provides the logic to handle these two versions of the recruitment
text. When the assignmentId is not available the participant sees the
"recruitment" text with some information about the study. When they accept the
HIT, they then see a new page with a button which will launch the <SmileText/>
experiment in a new browser window.

- The template can be edited to change the text.
- The logo image imports from `@/user/assets/brain.svg`.

```js
// put this at the top of the file
import MTurkRecruitView from '@/builtins/mturk/MTurkRecruitView.vue'

this.registerView({
  path: '/mturk',
  name: 'mturk',
  component: MTurkRecruitView,
  props: {
    estimated_time: api.getConfig('estimated_time'),
    payrate: api.getConfig('payrate'),
  },
  meta: { allowAlways: true, requiresConsent: false },
  beforeEnter: (to) => {
    processQuery(to.query, 'mturk')
  },
})
```

### Informed Consent

**Base Component**: `@/builtins/informedConsent/InformedConsentView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/informedConsent/InformedConsentView.vue)  
**Typical
accessibility**: `{requiresConsent: false, requiresDone: false}`

Most studies require some type of informed consent from participants. This is
usually a short piece of text describing the study and the participant's rights
and responsibilities. The Informed Consent View is a simple page that displays
this text and asks the participant to agree to participate by clicking a
checkbox. If the participant agrees, then the Informed Consent View sets a flag
in the application state indicating that the participant has consented. Clicking
a button continues to the next View in the timeline.

The text of the informed consent should be updated for each study and placed in
`@/user/components/InformedConsentText.vue`.

After a participant accepts the informed consent (usually the first few steps of
study) they will see a button in the [status bar](#status-bar) that will always
be available allowing them to review the consent form in case they have
questions. Clicking this button pops up a modal with the text of the informed
consent (also `@/builtins/informedConsent/InformedConsentText.vue`).

```js
// put this at the top of the file
import InformedConsentView from '@/builtins/informedConsent/InformedConsentView.vue'

// consent
timeline.pushSeqView({
  name: 'consent',
  component: InformedConsentView,
  meta: {
    requiresConsent: false,
    setConsented: true, // set the status to consented ater this route
  },
})
```

### Window Sizer

**Base Component**: `@/builtins/windowSizer/WindowSizerView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/windowSizer/WindowSizerView.vue)  
**Typical
accessibility**: `{requiresConsent: true, requiresDone: false}`

The window sizer is a small component
`src/builtins/windowSizer/WindowSizerView.vue` that will display a box with a
configured size on the screen and ask the participant to adjust their browser
window to that size so everything is visible. It looks like this:

![Window sizer](/images/windowsizer.png)

The size of the box is configured in `env/.env` file using the
`VITE_WINDOWSIZER_REQUEST` configuration option. The default value is `800x600`
which means 800 pixel wide and 600 pixels tall. You can change these values as
needed. In development mode, you will need to restart the development server
since environment files are only read once when the application first loads.

In addition to a View appearing on the Timeline in a particular place, it is
possible to re-trigger this View when the browser detects the user has adjusted
the browser to no longer make the task viewport the requested size. To enable
this behavior set `VITE_WINDOWSIZER_AGGRESSIVE = true` in the `env/.env` file.

To add it to the timeline just add this in the appropriate place inside
`src/router.js`;

```js
// put this at the top of the file
import WindowSizerView from '@/builtins/windowSizer/WindowSizerView.vue'

// windowsizer
timeline.pushSeqView({
  path: '/windowsizer',
  name: 'windowsizer',
  component: WindowSizerView,
})
```

### Simple Instructions

This page presents the instructions for the experimental task to the
participant. If the experiment contains multiple conditions and each requires a
unique set of instructions, the participant may be randomly assigned a condition
with custom weights so that the Instructions View displays the correct text.
This page is also always accessible such that the user is able to return to it
if they do not pass the instructions quiz.

**Base Component**: `@/builtins/instructions/InstructionsView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/instructions/InstructionsView.vue)  
**Typical
accessibility**: `{requiresConsent: true, requiresDone: false}`

[TO DO: Add info about instructions]

```js
// put this at the top of the file
import InstructionsView from '@/builtins/instructions/InstructionsView.vue'
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

// assign instruction condition
api.randomAssignCondition({
  instructionsVersion: ['1', '2', '3'],
  weights: [2, 1, 1],
})

// instructions
timeline.pushSeqView({
  name: 'instructions',
  component: InstructionsView,
  meta: {
    allowAlways: true,
  },
})
```

### Instructions Quiz

**Base Component**: `@/builtins/instructionsQuiz/InstructionsQuiz.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/instructionsQuiz/InstructionsQuiz.vue)  
**Typical
accessibility**: `{requiresConsent: true, requiresDone: false}`

The instructions quiz is a simple quiz that makes sure the participant has read
and understood the experiment instructions. The user has to answer all the
questions correctly before they can continue. If they get a question wrong, they
are redirected to the timeline at the location specified in the `returnTo` prop,
which is by default the instructions page, and will be asked to try the quiz
again.

The quiz questions are configured in `@/user/components/quizQuestions.js` as an
array of dictionary objects, where each dictionary represents a page of multiple
questions. Each question has an id, a question text, a list of answers, and the
correct answer(s). The field `multiSelect` can be set to true if a question has
multiple correct answers.

```js
export const QUIZ_QUESTIONS = [
  {
    page: 1,
    questions: [
      {
        id: 'example1',
        question: 'What color is the sky?',
        multiSelect: false,
        answers: ['red', 'blue', 'yellow', 'rainbow'],
        correctAnswer: ['blue'],
      },
      {
        id: 'example2',
        question: 'How many days are in a non-leap year?',
        multiSelect: false,
        answers: ['365', '100', '12', '31', '60'],
        correctAnswer: ['365'],
      },
    ],
  },
  {
    page: 2,
    questions: [
      {
        id: 'example3',
        question: 'What comes next: North, South, East, ___',
        multiSelect: false,
        answers: ['Southeast', 'Left', 'West'],
        correctAnswer: ['West'],
      },
      {
        id: 'example4',
        question: "What's 7 x 7?",
        multiSelect: false,
        answers: ['63', '59', '49', '14'],
        correctAnswer: ['49'],
      },
    ],
  },
]
```

The questions from `@/user/components/quizQuestions.js` are then imported and
passed to `InstructionsQuiz` component as a prop (`quizQuestions`). The
`randomizeQuestionsAndAnswers` prop is optional and defaults to `true`. This
will randomize the order of the questions and answers on each page at loading
time (meaning if the subject repeats the quiz multiple times, the order of the
questions and answers will be different each time). If set to `false`, the
questions will be randomized in the same way each time the quiz is taken.

```js
// import the quiz questions
import { QUIZ_QUESTIONS } from './components/quizQuestions'
// instructions quiz
timeline.pushSeqView({
  name: 'quiz',
  component: InstructionsQuiz,
  props: {
    questions: QUIZ_QUESTIONS,
    returnTo: 'instructions',
    randomizeQandA: true,
  },
})
```

### Demographic Survey

**Base Component**: `@/builtins/demographicSurvey/DemographicSurveyView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/demographicSurvey/DemographicSurveyView.vue)  
**Typical
accessibility**: `{requiresConsent: true, requiresDone: false}`

The demographic survey is a simple survey that asks participants to provide some
information about themselves. This is important for many reasons. For example,
it is often important to report information about the demographics of the
participants in a study (age, gender, country, primary language, etc...). In
addition, it is useful to know if a subject is color blind in case the studies
relies on color information.

```js
// put this at the top of the file
import DemographicSurveyView from '@/builtins/demographicSurvey/DemographicSurveyView.vue'

timeline.pushSeqView({
  path: '/demograph',
  name: 'demograph',
  component: DemographicSurveyView,
})
```

### Device Survey

**Base Component**: `@/builtins/deviceSurvey/DeviceSurveyView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/deviceSurvey/DeviceSurveyView.vue)  
**Typical
accessibility**: `{requiresConsent: true, requiresDone: false}`

The device survey askes participants to provide some information about their
computer/tablet/etc... This is important because sometimes the information
obtained automatically from the browser is incorrect. It is also sometimes
impossible to know aspects of a users computer setup. For instance, it might be
important to know what type of pointer device a participant is using (e.g.,
mouse, trackpad, touch screen). This information is useful for debugging and for
understanding the data and analyzing it depending on your research question. The
default survey asks for the following information:

- What type of device are you using? (e.g., desktop, laptop, tablet, phone)
- What type of internet connection are you using? (e.g., wifi, ethernet,
  cellular)
- How good is your internet connection today? (e.g., good, poor)
- What webbrowser are you using? (e.g., Chrome, Firefox, Safari, Edge, other)
- How did you move the cursor? (e.g., mouse, trackpad, touchscreen, other)
- Are you using any assistive technology? (e.g., screen reader, magnifier,
  other)
- Did you use any tools to help you complete the task? (e.g., calculator, notes,
  browser extensions, AI tools, other)

If you want this to be the last View in the study you can set the `setDone` meta
field.

```js
// put this at the top of the file
import DeviceSurveyView from '@/builtins/deviceSurvey/DeviceSurveyView.vue'

timeline.pushSeqView({
  path: '/demograph',
  name: 'demograph',
  component: DeviceSurveyView,
  meta: { setDone: true }, // optional if this is the last form
})
```

### Withdraw

**Base Component**: `@/builtins/withdraw/WithdrawView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/withdraw/WithdrawView.vue)  
**Typical
accessibility**: `{ requiresWithdraw: true }`

As part of most IRB protocols, participants should be able to withdraw from a
study at any time for any reason. Online, this is as simple as closing the
browser window and moving onto something else. However, <SmileText/> provides a
simple and clear way for a participant withdraw at any time from a study, while
also providing feedback about why they are withdrawing.

![Withdraw button](/images/withdraw.png)

When participants click this button (only appears after accepting the informed
consent), then they are presented with a form, including several optional
questions about why they are withdrawing and their contact information (e.g.,
for receiving partial compensation). As a side effect of

When they submit this form, they will be taken to a final page asking them to
return the task/HIT. It is the responsibility of the experimenter to monitor
withdraws and to try to contact the participant if needed for partial
compensation.

```js
// put this at the top of the file
import WithdrawView from '@/builtins/withdraw/WithdrawView.vue'

// withdraw
timeline.registerView({
  name: 'withdraw',
  meta: {
    requiresWithdraw: true,
    resetApp: api.getConfig('allowRepeats'),
  },
  component: WithdrawView,
})
```

### Debrief

**Base Component**: `@/builtins/debrief/DebriefView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/debrief/DebriefView.vue)  
**Typical
accessibility**: `{requiresConsent: true, requiresDone: false}`

The debrief page displays the text that explains the purpose of the experiment
and provides the participant with any additional postfacto information about the
task they just completed. The text can be customized in
`@/user/components/DebriefText.vue`, and this page will transition the user to
their post-experiment surveys.

```js
// put this at the top of the file
import DebriefView from '@/builtins/debrief/DebriefView.vue'

// debrief
import DebriefText from '@/user/components/DebriefText.vue' // get access to the global store
timeline.pushSeqView({
  name: 'debrief',
  component: DebriefView,
  props: {
    debriefText: markRaw(DebriefText),
  },
})
```

### Thanks

**Base Component**: `@/builtins/thanks/ThanksView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/thanks/ThanksView.vue)  
**Typical
accessibility**: `{requiresDone: true}`

```js
// put this at the top of the file
import ThanksView from '@/builtins/thanks/ThanksView.vue'

// thanks
timeline.pushSeqView({
  name: 'thanks',
  component: ThanksView,
  meta: {
    requiresDone: true,
    resetApp: api.getConfig('allowRepeats'),
  },
})
```

### Feedback Survey

**Base Component**: `@/builtins/taskFeedbackSurvey/TaskFeedbackSurveyView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/taskFeedbackSurvey/TaskFeedbackSurveyView.vue)  
**Typical
accessibility**: `{requiresConsent: true, requiresDone: false}`

The task survey asks some simple questions about the participant's experience in
the task. The questions gauge how enjoyable and challenging the task was and
offer a space for the participant to provide general feedback and comments on
issues and improvements.

If you want this to be the last view in the study, you can set the `setDone`
meta field.

```js
// put this at the top of the file
import TaskFeedbackSurveyView from '@/builtins/taskFeedbackSurvey/TaskFeedbackSurveyView.vue'

// feedback
timeline.pushSeqView({
  name: 'feedback',
  component: TaskFeedbackSurveyView,
  meta: { setDone: true }, // optional if this is the last form
})
```

## Navbars and Modals

In addition to these builtin Views, <SmileText/> also provides a few components
that appear on the main App and are thus visible on every View on the timeline.
These provide information that is useful to participants at any moment in the
task. For example, the Status Bar provides a way for participants to withdraw
from a study at any time, report an issue, look at the informed consent form
again. These components are called "Navbars" and are not arranged on the
Timeline but instead are imported in the top level `App.vue` file.

In addition there are a few modals that are used to collect information from
participants when they are withdrawing from a study or reporting an issue.

All these components are includes in the `@/builtins` directory and you can edit
them as needed for your study.

### Status Bar

**Base Component**: `@/builtins/statusBar/StatusBar.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/statusBar/StatusBar.vue)

The Status Bar is a persistent navigation component that appears at the top of
every view throughout the experiment. It provides essential study information
and participant controls that are always accessible such as the lab logo
(`src/user/assets/universitylogo.png`), the study code name, version information
(i.e., the git commit hash for debugging purposes, along with the current mode
(development, testing, presentation)), a shortened user ID. It also provides two
buttons (After the user consents) which allow users to review the informed
consent information, or to withdraw from the study. The Status Bar automatically
adapts to different screen sizes, showing abbreviated labels on smaller screens
and hiding certain information on very narrow displays.

### Withdraw Modal

**Base Component**: `@/builtins/withdraw/WithdrawModal.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/withdraw/WithdrawModal.vue)

The Withdraw Modal is a form that appears when participants click the "Withdraw"
button in the Status Bar. It provides a structured way for participants to
withdraw from the study while collecting valuable feedback about their
experience. It is optional for users to complete but otherwise is automatically
saved in the data store.
