<script setup>
/**
 * @description Experiment view component for basic experiment flow
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
 * @description Advances to the next view in the experiment flow
 * @returns {void}
 */
function finish() {
  // smilestore.saveData()
  api.goNextView()
}
</script>

<template>
  <!-- Main experiment container with responsive constraints -->
  <ConstrainedTaskWindow
    variant="ghost"
    class="p-8"
    :responsiveUI="api.config.responsiveUI"
    :width="api.config.windowsizerRequest.width"
    :height="api.config.windowsizerRequest.height"
  >
    <!-- Experiment content area -->
    <div class="w-[80%] h-[80%]">
      <!-- Experiment title -->
      <h1 class="text-2xl font-bold mb-4">Experiment</h1>

      <!-- Visual separator -->
      <hr class="border-gray-300 my-4" />

      <!-- Navigation controls -->
      <div class="flex justify-end">
        <Button variant="default" @click="finish()">
          next
          <i-fa6-solid-arrow-right />
        </Button>
      </div>
    </div>
  </ConstrainedTaskWindow>
</template>
