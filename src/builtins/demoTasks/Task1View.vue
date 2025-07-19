<script setup>
/**
 * @description Task 1 view component for collecting trial count input
 * @author Smile UI
 */

import { ref } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import { Input } from '@/uikit/components/ui/input'
import { ConstrainedTaskWindow } from '@/uikit/layouts'

/**
 * @description Initialize the Smile API for navigation and data management
 */
const api = useViewAPI()

/**
 * @description Reactive reference for number of trials
 * @type {import('vue').Ref<string>}
 */
const ntrials = ref('1')

/**
 * @description Advances to the next view in the experiment flow
 * @returns {void}
 */
function finish() {
  // do stuff if you want
  api.goNextView()
}
</script>

<template>
  <!-- Main task container with responsive constraints -->
  <ConstrainedTaskWindow variant="ghost" class="p-8">
    <!-- Task content area -->
    <div class="w-[80%] h-[80%]">
      <!-- Task title -->
      <h1 class="text-2xl font-bold mb-4">Task 1</h1>

      <!-- Form input section -->
      <div class="w-1/4 mx-auto mb-10 pb-52 text-left">
        <!-- Trial count input form -->
        <div class="space-y-2">
          <label for="ntrials" class="text-sm font-medium">Number of trials</label>
          <Input id="ntrials" v-model="ntrials" placeholder="Enter number of trials" type="number" />
          <p class="text-sm text-muted-foreground">How many trials do you want to do?</p>
        </div>

        <!-- Navigation controls -->
        <div class="mt-4 pt-2.5 text-right">
          <Button variant="default" @click="finish()">
            next
            <i-fa6-solid-arrow-right />
          </Button>
        </div>
      </div>
    </div>
  </ConstrainedTaskWindow>
</template>
