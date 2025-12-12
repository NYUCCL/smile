<script setup>
/**
 * @description Task 1 view component for collecting favorite color
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
 * @description Reactive reference for favorite color
 * @type {import('vue').Ref<string>}
 */
const faveColor = ref('')

/**
 * @description Advances to the next view in the experiment flow
 * @returns {void}
 */
function finish() {
  // do stuff if you want
  // for example, save the data
  api.recordPageData({ favoriteColor: faveColor.value })

  // then go to the next view
  api.goNextView()
}
</script>

<template>
  <!-- Main task container with responsive constraints -->
  <ConstrainedTaskWindow variant="ghost" class="p-8">
    <!-- Task content area -->
    <div class="w-[80%] h-[80%]">
      <!-- Task title -->
      <h1 class="text-2xl font-bold mb-4">Task 1: What is your favorite color?</h1>

      <!-- Form input section -->
      <div class="w-1/2 mx-auto mb-10 pb-52 text-left">
        <!-- Trial count input form -->
        <div class="space-y-2">
          <label for="faveColor" class="text-sm font-medium">Favorite color</label>
          <Input
            id="faveColor"
            v-model="faveColor"
            placeholder="Enter favorite color"
            type="string"
            class="bg-background text-foreground"
          />
          <p class="text-sm text-muted-foreground">What is your favorite color?</p>
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
