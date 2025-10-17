<script setup>
// A Basic Stroop Experiment

// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import { ConstrainedTaskWindow } from '@/uikit/layouts'

const api = useViewAPI()

const sad_src = api.getStaticUrl(`sad.png`)
const happy_src = api.getStaticUrl(`happy/happy.png`)

// define the trials for the experiment as a spec
const trials = api.steps.append([
  {
    id: 'stroop',
    rt: () => api.faker.rnorm(500, 50), // add the autofill/expected data fields
    hit: () => api.faker.rbinom(1, 0.8),
    response: () => api.faker.rchoice(['r', 'g', 'b']),
  },
])

trials[0]
  .append([
    { id: 'a', word: 'SHIP', color: 'red', condition: 'unrelated' },
    { id: 'b', word: 'MONKEY', color: 'green', condition: 'unrelated' },
    { id: 'c', word: 'ZAMBONI', color: 'blue', condition: 'unrelated' },
    { id: 'd', word: 'RED', color: 'red', condition: 'congruent' },
    { id: 'e', word: 'GREEN', color: 'green', condition: 'congruent' },
    { id: 'f', word: 'BLUE', color: 'blue', condition: 'congruent' },
    { id: 'g', word: 'GREEN', color: 'red', condition: 'incongruent' },
    { id: 'h', word: 'BLUE', color: 'green', condition: 'incongruent' },
    { id: 'i', word: 'RED', color: 'blue', condition: 'incongruent' },
  ])
  .shuffle()

trials.append([{ id: 'summary' }])

// if hits not defined yet then initialize it and timer.
if (!api.persist.isDefined('hits')) {
  api.persist.hits = 0
  api.persist.attempts = 0
  api.persist.finalScore = 0
}

// this is the persistent timer
// if you want to start timer since last reload then just
// write api.startTimer()
if (!api.isTimerStarted()) {
  api.startTimer()
}

// autofill all the trials
function autofill() {
  while (api.stepIndex < api.nSteps) {
    // api.faker.render() will autofill the trial with the expected data
    // if the trial has already been filled by user it will not be changed
    api.faker.render(api.stepData)
    api.persist.hits = api.persist.hits + api.stepData.hit.val
    api.persist.attempts = api.persist.attempts + 1
    api.recordStep()
    api.goNextStep()
  }
  updateScore()
}

api.setAutofill(autofill)

function updateScore() {
  api.persist.finalScore = (api.persist.hits / api.persist.attempts) * 100
}

// Handle the key presses for the task
const stop = api.onKeyDown(
  ['r', 'R', 'g', 'G', 'b', 'B'], // list of keys to listen for
  (e) => {
    if (api.stepIndex < api.nSteps) {
      e.preventDefault()
      const reactionTime = api.elapsedTime()
      const hit = api.stepData.color[0] === e.key ? 1 : 0
      api.stepData.hit = hit
      api.persist.hits += hit
      api.persist.attempts = api.persist.attempts + 1
      api.stepData.rt = reactionTime
      api.stepData.response = e.key
      api.recordStep()
      api.goNextStep()
      // if we are at the end of the trials, compute a final score
      if (api.path[0] == 'summary') {
        stop() // This removes the keydown listener
        updateScore()
      }
    }
  },
  { dedupe: true }
)

function finish() {
  api.goNextView()
}
</script>

<template>
  <ConstrainedTaskWindow variant="ghost" :responsiveUI="api.config.responsiveUI"
    :width="api.config.windowsizerRequest.width" :height="api.config.windowsizerRequest.height">
    <!-- Show this for each trial -->
    <img :src="sad_src" alt="Sad face" />
    <img :src="happy_src" alt="Happy face" />
    <div class="text-center" v-if="api.path[0] == 'stroop'">
      <h1 class="text-6xl font-bold mb-8" :class="{
        'text-red-500': api.stepData.color === 'red',
        'text-blue-500': api.stepData.color === 'blue',
        'text-green-500': api.stepData.color === 'green',
      }">
        {{ api.stepData.word }}
      </h1>
      <p class="text-lg text-muted-foreground" id="prompt">Type "R" for Red, "B" for blue, "G" for green.</p>
    </div>

    <!-- Show this when you are done with the trials and offer a button
         which will advance to the next route -->
    <div class="text-center" v-else>
      <p class="text-lg text-muted-foreground mb-4" id="prompt">
        Thanks! You are finished with this task and can move on.
      </p>
      <!-- display the final score -->
      <p class="text-xl font-semibold text-muted-foreground mb-6">
        Your score was {{ api.persist.finalScore.toFixed(2) }}%
      </p>
      <Button variant="default" size="lg" id="finish" @click="finish()">
        Continue
        <svg class="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
            clip-rule="evenodd" />
        </svg>
      </Button>
    </div>
  </ConstrainedTaskWindow>
</template>
