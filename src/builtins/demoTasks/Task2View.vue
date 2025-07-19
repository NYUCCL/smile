<script setup>
/**
 * @description Task 2 view component for sentence completion trials
 * @author Smile UI
 */

import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import { ConstrainedTaskWindow } from '@/uikit/layouts'

/**
 * @description Initialize the Smile API for navigation and data management
 */
const api = useViewAPI()

/**
 * @description Trial data for sentence completion task
 * @type {Array<{id: string, task: string, sentence: string, options: string[]}>}
 */
const trials = api.steps.append([
  {
    id: 'task2_trial_a',
    task: 'unusual',
    sentence: 'The dog ate the _____.',
    options: ['Meal', 'Bone', 'Food', 'Sun'],
  },
  {
    id: 'task2_trial_b',
    task: 'unusual',
    sentence: 'The cat ate the _____.',
    options: ['Fish', 'Words', 'Food', 'Mouse'],
  },
  {
    id: 'task2_trial_c',
    task: 'unusual',
    sentence: 'The fish ate the _____.',
    options: ['Water', 'Food', 'Car', 'Moon'],
  },
])
//.shuffle()

// const index = ref(0)
// trials = shuffle(trials) // shuffle is not "in place"

// load up the trials including any randomization based on the random see
// initialize the state of the component
// set up the call backs that take you through the task

/**
 * @description Advances to the next step or view in the experiment flow
 * @returns {void}
 */
function next() {
  if (!api.isLastStep()) {
    api.goNextStep()
  } else {
    api.goNextView()
  }
}

/**
 * @description Goes back to the previous step in the experiment flow
 * @returns {void}
 */
function prev() {
  if (api.stepIndex > 0) {
    api.goPrevStep()
  }
}
// custom advance to next route when we finish showing all the trials
// function advance() {
//   if (index.value >= trials.length - 1) {
//     goNextView(finalize())
//   } else {
//     index.value += 1
//   }
// }
</script>

<template>
  <!-- Main task container with responsive constraints -->
  <ConstrainedTaskWindow
    variant="ghost"
    :responsiveUI="api.config.responsiveUI"
    :width="api.config.windowsizerRequest.width"
    :height="api.config.windowsizerRequest.height"
    class="p-8"
  >
    <!-- Task content area with centered layout -->
    <div class="w-[80%] h-[80%] flex flex-col items-center justify-center">
      <!-- Task title -->
      <h1 class="text-2xl font-bold mb-4">Task 2</h1>

      <!-- Trial progress display -->
      <div class="mb-4">{{ api.stepData.sentence }}/{{ api.stepIndex }}</div>

      <!-- Navigation controls -->
      <div class="flex gap-4">
        <Button variant="outline" @click="prev()" v-if="api.stepIndex > 0">
          <i-fa6-solid-arrow-left />
          prev
        </Button>
        <Button variant="default" @click="next()">
          next
          <i-fa6-solid-arrow-right />
        </Button>
      </div>
    </div>
  </ConstrainedTaskWindow>
</template>
