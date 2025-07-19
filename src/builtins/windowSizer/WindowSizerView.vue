<script setup>
/**
 * Window Sizer View Component
 *
 * This component displays a resizable window interface that guides users to adjust
 * their browser window size until all four edges of the target box are visible.
 * It includes both initial and triggered states for different user scenarios.
 */

import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import { CenteredContent } from '@/uikit/layouts'

const api = useViewAPI()
const props = defineProps(['triggered'])

/**
 * Completes the window sizing process by verifying visibility and advancing to the next view
 * @returns {void}
 */
function finish() {
  api.verifyVisibility(true)
  api.goNextView()
}
</script>

<template>
  <!-- Main container with centered content -->
  <CenteredContent class="m-2 mt-5">
    <!-- Resizable window target box with animated border -->
    <div
      class="bg-window-sizer-bg border-animation flex items-center justify-center"
      :style="{
        width: api.config.windowsizerRequest.width + 'px',
        height: api.config.windowsizerRequest.height + 'px',
        minWidth: api.config.windowsizerRequest.width + 'px',
        minHeight: api.config.windowsizerRequest.height + 'px',
      }"
    >
      <!-- Initial state: Instructions and continue button -->
      <div class="w-2/3 pt-8 mx-auto text-center" v-if="!props.triggered">
        <!-- Resize icon -->
        <div class="text-4xl text-window-sizer-text mb-4 flex justify-center">
          <i-fa6-solid-arrows-up-down-left-right />
        </div>

        <!-- Main instruction text -->
        <h1 class="text-xl font-semibold text-window-sizer-text mb-4">
          Please adjust the size of your browser window until <b>ALL</b> four edges of this box are visible.
        </h1>

        <!-- Warning separator -->
        <hr class="border-window-sizer-border my-4" />

        <!-- Warning message about withdrawal -->
        <div class="text-sm text-left mb-4 text-window-sizer-text">
          <b>Warning</b>: If you can't resize your window and see the entire box please click the red "withdraw" button
          at the top of the page and return the task. You need to be able view the entire page at once.
        </div>

        <!-- Action separator -->
        <hr class="border-window-sizer-border my-4" />

        <!-- Continue button -->
        <div class="mt-8">
          <Button
            size="lg"
            class="bg-window-sizer-text text-window-sizer-bg hover:bg-window-sizer-bg hover:bg-window-sizer-border"
            @click="finish()"
          >
            It is visible now, I'm ready
            <i-fa6-solid-arrow-right />
          </Button>
        </div>
      </div>

      <!-- Triggered state: Re-adjustment instructions -->
      <div class="w-2/3 pt-8 mx-auto text-center" v-else>
        <!-- Resize icon -->
        <span class="text-4xl text-window-sizer-text mb-4 flex justify-center">
          <i-fa6-solid-arrows-up-down-left-right />
        </span>

        <!-- Re-adjustment instruction text -->
        <h1 class="text-xl font-semibold text-window-sizer-text mb-4">
          <b>We don't want you to miss anything!</b><br />Please re-adjust the size of your browser window until
          <b>ALL</b> four edges of this box are visible.
        </h1>

        <!-- Warning separator -->
        <hr class="border-window-sizer-border my-4" />

        <!-- Warning message about withdrawal -->
        <div class="text-sm text-left text-window-sizer-text">
          <b>Warning</b>: If you can't resize your window and see the entire box please click the red "withdraw" button
          at the top of the page and return the task. You need to be able view the entire page at once.
        </div>
      </div>
    </div>
  </CenteredContent>
</template>

<style scoped>
/* Animated border effect for the resizable window target */
.border-animation {
  background-image:
    linear-gradient(90deg, var(--window-sizer-border) 50%, transparent 50%),
    linear-gradient(90deg, var(--window-sizer-border) 50%, transparent 50%),
    linear-gradient(0deg, var(--window-sizer-border) 50%, transparent 50%),
    linear-gradient(0deg, var(--window-sizer-border) 50%, transparent 50%);
  background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
  background-size:
    15px 2px,
    15px 2px,
    2px 15px,
    2px 15px;
  border-radius: 20px;
  background-position:
    left top,
    right bottom,
    left bottom,
    right top;
  animation: border-dance 0.5s infinite linear;
}

/* Keyframe animation for the moving border effect */
@keyframes border-dance {
  0% {
    background-position:
      left top,
      right bottom,
      left bottom,
      right top;
  }

  100% {
    background-position:
      left 15px top,
      right 15px bottom,
      left bottom 15px,
      right top 15px;
  }
}
</style>
