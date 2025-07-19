<script setup>
// import Vue functions
import { onMounted, ref, onBeforeUnmount } from 'vue'

// import and initialize smile API
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()

// import UIkit components
import { Button } from '@/uikit/components/ui/button'
import { ConstrainedTaskWindow } from '@/uikit/layouts'

// animation library
import { animate } from 'motion'

let timer // waits before doing animation
let clicked = false // has the button been clicked?
const button = ref(null) // reference to button

/**
 * Wiggles the button with a rotation animation if it hasn't been clicked yet
 * This provides a fun interactive element to draw attention to the button
 */
function wiggle() {
  if (!clicked && button.value) {
    animate(button.value.$el, { rotate: [0, 60, -60, 60, -60, 0] }, { duration: 0.75 }).finished.then(() => {
      timer = setTimeout(wiggle, 15000) // Reinitialize the timer after animation
    })
  }
}

/**
 * Lifecycle hook: Sets up the initial wiggle timer when component mounts
 */
onMounted(() => {
  timer = setTimeout(wiggle, 3000)
})

/**
 * Handles the completion of the advertisement view
 * Preloads all media assets and navigates to the next view
 */
function finish() {
  clicked = true
  api.preloadAllImages()
  api.preloadAllVideos()
  api.goNextView()
}

/**
 * Lifecycle hook: Cleans up the timer when component unmounts
 */
onBeforeUnmount(() => {
  clearTimeout(timer)
})
</script>

<template>
  <!-- Main advertisement container with responsive task window -->
  <ConstrainedTaskWindow
    variant="ghost"
    :responsiveUI="api.config.responsiveUI"
    :width="api.config.windowsizerRequest.width"
    :height="api.config.windowsizerRequest.height"
  >
    <!-- Study logo/branding image -->
    <img ref="logo" src="@/user/assets/brain.svg" width="220" class="dark-aware-img" />

    <!-- Main heading -->
    <h1 ref="title" class="text-3xl font-bold mb-4">Please help us understand the mind!</h1>

    <!-- Study description -->
    <p>Take part in a short experiment where you play some games.</p>
    <br />

    <!-- Call-to-action button -->
    <Button ref="button" id="begintask" @click="finish()" size="lg">
      I'm ready!
      <i-lucide-arrow-right />
    </Button>
  </ConstrainedTaskWindow>
</template>
