<script setup>
import { computed } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import { ConstrainedTaskWindow } from '@/uikit/layouts'

/**
 * Instructions view component for displaying experiment instructions
 * Handles different instruction versions based on experimental conditions
 */
const api = useViewAPI()

/**
 * Get the instruction version condition from the experiment configuration
 * @type {string} The instruction version condition ('1', '2', '3', or undefined)
 */
const cond = api.getConditionByName('instructionsVersion')

/**
 * Computed property that returns the appropriate instruction text based on the condition
 * @returns {string} The instruction text for the current condition
 */
const instText = computed(() => {
  if (cond === '1') {
    return 'instructions version 1'
  }
  if (cond === '2') {
    return 'instructions version 2'
  }
  if (cond === '3') {
    return 'instructions version 3'
  }
  return 'no condition set'
})

/**
 * Navigate to the next view in the experiment flow
 * @param {boolean} [goto] - Optional parameter for navigation control (unused in current implementation)
 */
function finish(goto) {
  api.goFirstStep() // reset the state in case you loop back (only needed if using stepper)
  api.goNextView()
}
</script>

<template>
  <!-- Main instruction container with responsive layout -->
  <ConstrainedTaskWindow
    variant="ghost"
    :responsiveUI="api.config.responsiveUI"
    :width="api.config.windowsizerRequest.width"
    :height="api.config.windowsizerRequest.height"
  >
    <!-- Instruction content wrapper -->
    <div class="w-[80%] h-[80%]">
      <!-- Instruction header with icon -->
      <h1 class="text-2xl font-bold mb-4">
        <i-material-symbols-integration-instructions class="inline-block mr-2 text-3xl" /> Instructions
      </h1>

      <!-- Dynamic instruction text based on condition -->
      <p class="text-left text-lg mb-4">{{ instText }}</p>

      <!-- Visual separator -->
      <hr class="border-gray-300 my-4" />

      <!-- Navigation button container -->
      <div class="flex justify-end">
        <Button variant="default" @click="finish()">
          next
          <i-fa6-solid-arrow-right />
        </Button>
      </div>
    </div>
  </ConstrainedTaskWindow>
</template>
