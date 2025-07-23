# Forms and Quizzes

Forms are a critical component of many psychological experiments and research
studies. Smile provides several tools which can make developing quizzes and
forms easy.

## Building a Feedback Survey: TaskFeedbackSurveyView Example

The `TaskFeedbackSurveyView.vue` built-in component demonstrates how to build a
comprehensive feedback form in Smile. Click
[here](https://github.com/NYUCCL/smile/blob/main/src/builtins/instructionsQuiz/InstructionsQuiz.vue)
to see the entire code structure before continuing.

This component collects both quantitative ratings and qualitative feedback about
a participant's experience with a task, representing a common pattern in
experimental research where researchers want both structured and open-ended
responses.

### Component Architecture and State Management

The first thing to note is that it follows a persistence-first approach. Rather
than using temporary component state that could be lost, the form data is stored
in the [persistent API store](/coding/views.html#persisting-data-for-the-view)
from the moment the component initializes:

```javascript
if (!api.persist.isDefined('forminfo')) {
  api.persist.forminfo = reactive({
    difficulty_rating: '',
    enjoyment_rating: '',
    feedback: '',
    issues: '',
  })
}
```

This approach ensures that if a participant accidentally refreshes the page or
navigates away, their form progress is preserved. The reactive wrapper ensures
that Vue's reactivity system can track changes to the form data and update the
UI accordingly.

### Form Validation and User Experience

The component implements comprehensive form validation using Vue's computed
properties. The validation logic checks that all required fields contain
non-empty values, providing immediate feedback to participants about their
progress through the form:

```javascript
const complete = computed(
  () =>
    api.persist.forminfo.difficulty_rating !== '' &&
    api.persist.forminfo.enjoyment_rating !== '' &&
    api.persist.forminfo.feedback !== '' &&
    api.persist.forminfo.issues !== ''
)
```

This validation pattern serves multiple purposes. It prevents incomplete form
submissions, provides clear visual feedback through the disabled state of the
submit button, and ensures data quality by requiring responses to all questions.
The computed property updates reactively as users fill out the form, so the
submit button becomes enabled as soon as all requirements are met.

### Form Field Implementation

The rating scale implementation uses Smile's Select component system, which
provides a consistent dropdown interface with proper accessibility support. Each
rating scale presents a clear range of options with descriptive labels rather
than just numbers:

```vue
<Select v-model="api.persist.forminfo.difficulty_rating">
  <SelectTrigger class="w-full bg-background dark:bg-background text-base">
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="0 - Very Easy">0 - Very Easy</SelectItem>
    <SelectItem value="1 - Easy">1 - Easy</SelectItem>
    <!-- ... more options ... -->
  </SelectContent>
</Select>
```

The text area implementation captures open-ended responses with appropriate
sizing and styling. The resize-vertical class allows participants to expand the
text area if they have lengthy responses, while the placeholder text provides
clear guidance about what kind of response is expected:

```vue
<Textarea
  v-model="api.persist.forminfo.feedback"
  placeholder="Please provide general thoughts, reactions, or ideas here."
  class="w-full bg-background dark:bg-background text-base resize-vertical"
  rows="4"
/>
```

### Data Recording and Navigation

When participants complete the form, the finish function handles the submission
process. This function demonstrates Smile's approach to data recording, which
separates the act of recording form data from the navigation to the next
experimental phase:

```javascript
function finish() {
  api.recordForm('feedbackForm', api.persist.forminfo)
  api.saveData(true) // force a data save
  api.goNextView()
}
```

The recordForm method tags the form data with a specific identifier, making it
easy to locate this data during analysis. The forced data save ensures that the
form responses are immediately persisted to the backend, preventing any data
loss. Only after the data is safely recorded does the function navigate to the
next view in the experimental sequence.

### Development and Testing Support

The component includes an autofill function that demonstrates Smile's support
for development workflows. This function allows developers to quickly test form
submission without manually filling out fields during development:

```javascript
function autofill() {
  api.persist.forminfo.difficulty_rating = '0 - Very Easy'
  api.persist.forminfo.enjoyment_rating = '6 - Very Fun'
  api.persist.forminfo.feedback = 'It was good.'
  api.persist.forminfo.issues = 'Too fun?'
}
api.setAutofill(autofill)
```

This pattern is particularly valuable during iterative development, where
researchers might need to test the experimental flow multiple times. The
autofill function can be triggered during development to bypass manual form
completion while still testing the submission and navigation logic.

## Interactive Quiz Component: InstructionsQuiz

The InstructionsQuiz component provides comprehension checks with multiple
question types, automatic scoring, and retry functionality. It's commonly used
to ensure participants understand experimental instructions before beginning the
main task.

Key features include

- Participants must answer all questions on each page before proceeding
- The quiz automatically scores responses and shows success/failure feedback
- Failed attempts return participants to the specified view for review
- All responses and attempt counts are automatically recorded for analysis

### Adding to Timeline

Add the quiz to your experiment timeline by importing and including it in your
views:

```javascript
import InstructionsQuiz from '@/components/InstructionsQuiz.vue'

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

The component accepts three props to customize its behavior:

- **questions** (required): Object containing the quiz questions and answers
- **returnTo** (optional): View name to return to if participant fails the quiz
  (default: 'instructions')
- **randomizeQandA** (optional): Whether to randomize question and answer order
  (default: true). This happens per-page so questions remain on the same page.

### Question File Structure

Create a separate JavaScript file to define your questions. The file should
export an array of **pages**, where each page contains multiple questions that
are displayed together:

```javascript
// questions/instruction-quiz.js
export const QUIZ_QUESTIONS = [
  {
    id: 'pg1',
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
    id: 'pg2',
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
      {
        id: 'example5',
        question: "Who is in Todd's lab?",
        multiSelect: true,
        answers: ['Pat', 'Ellen', 'Jimbo', 'Roger'],
        correctAnswer: ['Pat', 'Ellen'],
      },
    ],
  },
]
```

**Structure Overview:**

- **Pages**: The top-level array contains page objects. Each page groups related
  questions that are shown together. Each page has an id.
- **Questions per page**: Each page can contain multiple questions. Participants
  must answer all questions on a page before proceeding to the next page.
- **Page navigation**: The quiz automatically handles navigation between pages
  and shows progress.

### Question Properties

Each question object should include:

- **id**: Unique identifier for the question
- **question**: The question text to display
- **answers**: Array of possible answer choices
- **correctAnswer**: Array containing the correct answer(s)
- **multiSelect**: Boolean indicating if multiple answers can be selected
