<script setup>
// import and initalize smile API
import useAPI from '@/core/composables/useAPI'
import { ConstrainedTaskWindow } from '@/uikit/layouts'
import { Card, CardHeader, CardContent } from '@/uikit/components/ui/card'
import { computed } from 'vue'

// Initialize the API
const api = useAPI()

// Force a data save when component mounts
api.saveData(true)

/**
 * Card content configuration for different recruitment services
 * Provides appropriate messaging based on the recruitment platform used
 * @type {Object.<string, {title: string, message: string}>}
 */
const cardContent = {
  prolific: {
    title: 'Notice about withdraw from our Prolific study',
    message:
      'You have indicated that you withdrew from the study. Please return the task and we will contact you for partial payment if you are eligible.',
  },
  cloudresearch: {
    title: 'Notice about withdraw from our CloudResearch study',
    message:
      'You have indicated that you withdrew from the study. Please return the task and we will contact you for partial payment if you are eligible.',
  },
  mturk: {
    title: 'Notice about withdraw from our Mechanical Turk study',
    message:
      'You have indicated that you withdrew from the study. Please return the task and we will contact you for partial payment if you are eligible.',
  },
  citizensci: {
    title: 'Notice about withdraw from our study',
    message: 'You have indicated that you withdrew from the study. Feel free to close this window.',
  },
  web: {
    title: 'Notice about withdraw from our web study',
    message: 'You have indicated that you withdrew from the study. Feel free to close this window.',
  },
}

/**
 * Computed property to get the current recruitment service
 * @type {import('vue').ComputedRef<string>}
 */
const currentService = computed(() => api.getRecruitmentService())

/**
 * Computed property to get the appropriate content based on recruitment service
 * Falls back to default content if service is not recognized
 * @type {import('vue').ComputedRef<{title: string, message: string}>}
 */
const content = computed(() => {
  return (
    cardContent[currentService.value] || {
      title: 'Notice about withdraw from our study',
      message: 'You have indicated that you withdrew from the study. Feel free to close this window.',
    }
  )
})
</script>

<template>
  <!-- Main container with responsive task window -->
  <ConstrainedTaskWindow
    variant="ghost"
    :responsiveUI="api.config.responsiveUI"
    :width="api.config.windowsizerRequest.width"
    :height="api.config.windowsizerRequest.height"
  >
    <!-- Content wrapper with sizing constraints -->
    <div class="w-[60%] h-[80%]">
      <!-- Withdrawal confirmation card - shown when user has withdrawn -->
      <Card
        v-if="api.store.browserPersisted.withdrawn && content"
        class="border-withdraw-border bg-withdraw-bg text-withdraw-text"
      >
        <CardHeader>
          <p class="text-xl font-semibold text-center">
            <i-icon-park-outline-bye class="text-withdraw-text inline-block text-5xl mb-2" />
            <br />{{ content.title }}
          </p>
        </CardHeader>
        <CardContent>
          {{ content.message }}
        </CardContent>
      </Card>

      <!-- Error card - shown when user accesses page without withdrawing -->
      <Card v-else class="border-warning-border bg-warning-bg text-warning-text">
        <CardHeader>
          <p class="text-xl font-semibold text-center">
            <i-icon-park-outline-attention class="text-warning-text inline-block text-5xl mb-2" />
            <br />Access Error
          </p>
        </CardHeader>
        <CardContent>
          <p class="text-center">
            You have accessed the withdrawal page, but our records show you have not withdrawn from the study. This may
            be due to an error or you may have accessed this page by mistake. Please contact the researchers if you
            believe this is an error.
          </p>
        </CardContent>
      </Card>
    </div>
  </ConstrainedTaskWindow>
</template>
