# Smile Framework Reference

Smile is a Vue 3 experiment framework for online research. User code goes in `src/user`.

**For detailed docs, read files in `docs/` folder** (e.g., `docs/coding/steps.md`, `docs/styling/layouts.md`).

## Using Builtins as Starting Points

The `src/builtins/` folder contains ready-made Views (consent forms, instructions, debriefs, quizzes, etc.). Two approaches:

1. **Use directly** in `design.js` (e.g., `import ConsentView from '@/builtins/consent/ConsentView.vue'`)
2. **Copy and customize**: Copy a builtin to `src/user/` and modify it for your needs

Copying is effective when you need custom logic or styling. For example, copy `src/builtins/instructions/` to `src/user/components/instructions/` and customize the content, add experiment-specific examples, or modify the flow.

## Code Style

- JavaScript (not TypeScript), Vue 3 Composition API with `<script setup>`
- Directories: lowercase-dashes. Components: PascalCase.vue. Composables: camelCase.js
- Order: script → template → style
- Use Tailwind CSS (see `docs/styling/tailwind.md`), Shadcn Vue (`@/uikit/components/ui/`), VueUse composables

## API Import

```js
// In Views (files ending in View.vue)
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()

// In other components
import useAPI from '@/core/composables/useAPI'
const api = useAPI()
```

## Steps (Trial Sequences)

Steps are animation frames/trials within a View. Define with `api.steps`. See `docs/coding/steps.md` for details.

```js
// Simple steps
const trials = api.steps.append([
  { id: 'a', word: 'SHIP', color: 'red' },
  { id: 'b', word: 'MONKEY', color: 'green' },
])

// Nested steps (block structure)
const blocks = api.steps.append([{ id: 'stroop' }, { id: 'summary' }])
blocks[0]
  .append([
    { id: 'a', word: 'SHIP', color: 'red' },
    { id: 'b', word: 'MONKEY', color: 'green' },
  ])
  .shuffle()

// Dynamic steps (add incrementally during task)
const trials = api.steps.append({ id: 'trial0', val: 0 })
// Later, after user response:
trials.append({ id: 'trial1', val: 1 })
api.goNextStep()
```

The `id` field controls the node path identifier (e.g., `"stroop/a"` instead of `"0/0"`). Without `id`, steps use sequential numbers. Use unique `id` values when dynamically adding steps.

### Step Methods

- `api.steps.append([...])` - Add steps
- `api.steps.zip({ shape: [...], color: [...] })` - Pair arrays by position
- `api.steps.zip({...}, { method: 'loop'|'pad'|'last' })` - Handle unequal lengths
- `api.steps.outer({ shape: [...], color: [...] })` - All combinations (limit: 5000)
- `.shuffle()` - Randomize order
- `.forEach((row, i) => row)` - Transform each step

### Step Data & Navigation

```js
api.stepData // Current step data (merged from parents)
api.stepDataLeaf // Current step data only (no parent merge)
api.stepIndex // Current step index
api.blockIndex // Index within current block
api.blockLength // Steps in current block
api.length // Total steps

api.goNextStep() // Advance (returns index or null)
api.goPrevStep() // Go back
api.isLastStep() // Boolean
api.isLastBlockStep() // Boolean

api.stepData.response = 'r' // Record data
api.recordStep() // Save step (local storage, syncs on View change)
```

### Persistent Data

```js
api.persist.myVar = 'value' // Survives page reload
api.persist.isDefined('myVar') // Check if defined
```

## Timelines (View Sequence)

Define in `src/user/design.js`. See `docs/coding/timeline.md` for details.

```js
import Timeline from '@/core/timeline'
const timeline = new Timeline()

timeline.pushSeqView({ name: 'welcome', component: WelcomeView })
timeline.pushSeqView({ name: 'task', component: TaskView })
timeline.pushSeqView({ name: 'thanks', component: ThanksView, meta: { setDone: true } })
timeline.registerView({ name: 'config', component: ConfigView }) // Non-sequential
timeline.build()
```

### Meta Options

```js
meta: {
  next: 'view_name',        // Override next view
  prev: 'view_name',        // Override prev view
  allowAlways: true,        // Allow direct navigation
  requiresConsent: true,    // Block until consented
  requiresDone: true,       // Only after completion
  setConsented: true,       // Mark consent on leave
  setDone: true,            // Mark done on leave
}
```

### Randomized/Conditional Flows

```js
// Register views first
timeline.registerView({ name: 'taskA', component: TaskA })
timeline.registerView({ name: 'taskB', component: TaskB })

// Random order
timeline.pushRandomizedNode({
  name: 'randomOrder',
  options: [
    ['taskA', 'taskB'],
    ['taskB', 'taskA'],
  ],
  weights: [2, 1], // optional
})

// Condition-based
api.randomAssignCondition({ taskOrder: ['AB', 'BA'] })
timeline.pushConditionalNode({
  name: 'conditional',
  taskOrder: { AB: ['taskA', 'taskB'], BA: ['taskB', 'taskA'] },
})
```

## Layouts

Import from `@/uikit/layouts`. See `docs/styling/layouts.md` for all options.

```vue
<script setup>
import { TwoCol, TitleTwoCol, ConstrainedTaskWindow, ConstrainedPage, CenteredContent } from '@/uikit/layouts'
</script>

<template>
  <TwoCol leftWidth="w-1/2" leftFirst>
    <template #left>Left</template>
    <template #right>Right</template>
  </TwoCol>

  <ConstrainedTaskWindow variant="ghost" :width="800" :height="600" :responsiveUI="true">
    Content
  </ConstrainedTaskWindow>
</template>
```

Props:

- **TwoCol/TitleTwoCol**: `leftWidth` (`w-1/3`, `w-1/2`), `leftFirst`, `responsiveUI`
- **ConstrainedTaskWindow**: `width`, `height`, `variant` (`default`|`ghost`|`game`|`outline`), `responsiveUI`
- **ConstrainedPage**: `width`, `height`, `responsiveUI`

## UI Components

See `docs/styling/uikit.md` for all components, `docs/styling/forms.md` for form elements.

```js
import { Button } from '@/uikit/components/ui/button'
import { Badge } from '@/uikit/components/ui/badge'
import { Checkbox } from '@/uikit/components/ui/checkbox'
import { Switch } from '@/uikit/components/ui/switch'
```

## Forms & Saving Form Data

Use `api.persist` for form state (survives page reload), then `api.recordPageData()` to save:

```js
// Initialize form state (check if defined first)
if (!api.persist.isDefined('forminfo')) {
  api.persist.forminfo = reactive({
    difficulty: '',
    feedback: '',
  })
}

// Bind to form elements with v-model="api.persist.forminfo.difficulty"

// On submit:
function finish() {
  api.recordPageData(api.persist.forminfo) // Saves as pageData_[routeName]
  api.saveData(true) // Force immediate save
  api.goNextView()
}
```

## InstructionsQuiz Builtin

Comprehension check with auto-scoring. Participants must pass to continue; failures return to instructions.

```js
// In design.js
import InstructionsQuiz from '@/builtins/instructionsQuiz/InstructionsQuiz.vue'
import { QUIZ_QUESTIONS } from './components/quizQuestions'

timeline.pushSeqView({
  name: 'quiz',
  component: InstructionsQuiz,
  props: {
    questions: QUIZ_QUESTIONS, // required
    returnTo: 'instructions', // view to return on failure
    randomizeQandA: true, // randomize order
  },
})
```

Question file structure (`quizQuestions.js`):

```js
export const QUIZ_QUESTIONS = [
  {
    id: 'pg1',
    questions: [
      {
        id: 'q1',
        question: 'What color is the sky?',
        answers: ['red', 'blue', 'green'],
        correctAnswer: ['blue'],
        multiSelect: false,
      },
      {
        id: 'q2',
        question: 'Select all prime numbers',
        answers: ['2', '3', '4', '5'],
        correctAnswer: ['2', '3', '5'],
        multiSelect: true,
      },
    ],
  },
  { id: 'pg2', questions: [...] }, // Additional pages
]
```

## Icons (Iconify via UnoCSS)

See `docs/styling/icons.md` for more examples.

```vue
<i-lucide-home />
<i-mdi-arrow-right />
<i-fa6-solid-check />
```

## Animation

Use [Motion](https://motion.dev/) library. See `docs/styling/animations.md` for examples.

## Images & Video

See `docs/styling/imagesvideo.md` for displaying images and video.

## Timer & Input

```js
api.startTimer()
api.elapsedTime()        // ms since startTimer()
api.isTimerStarted()

api.onKeyDown(['a', 'b'], (e) => { ... }, { dedupe: true })
```

## Navigation

```js
api.goNextView() // Next view in timeline
api.goToView('name') // Jump to specific view (programmatic nav always allowed)
```
