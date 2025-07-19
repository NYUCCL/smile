<script setup>
import { onMounted, ref } from 'vue'
import StudyPreviewText from '@/builtins/advertisement/StudyPreviewText.vue'

// Import and initialize Smile API
import useAPI from '@/core/composables/useAPI'
import { Button } from '@/uikit/components/ui/button'
import { Input } from '@/uikit/components/ui/input'

/**
 * MTurk recruitment view component for handling Mechanical Turk HIT assignments
 *
 * This component manages the flow between MTurk preview mode and actual assignment mode.
 * In preview mode, it displays study information. In assignment mode, it launches
 * the study in a new window and provides a form for submitting completion codes.
 */

const api = useAPI()

const props = defineProps({
  estimated_time: {
    type: String,
    required: true,
  },
  payrate: {
    type: String,
    required: true,
  },
})

const mturkPreview = ref(true)
const launched = ref(false)
const completionCode = ref('')
const formError = ref('')
let redirectURL = ref('/#/welcome/mturk/?')

/**
 * Initialize component on mount
 *
 * Checks URL parameters to determine if we're in MTurk preview mode or assignment mode.
 * Sets up the redirect URL for launching the study in a new window.
 */
onMounted(() => {
  const urlParams = api.route.query
  let queryStr = api.route.fullPath.split('?')

  if (queryStr.length == 2) {
    redirectURL.value += queryStr[1]
  }
  api.log.debug(`${redirectURL.value}`)
  if (urlParams.assignmentId && urlParams.hitId && urlParams.workerId) {
    if (urlParams.assignmentId === 'ASSIGNMENT_ID_NOT_AVAILABLE') {
      api.log.debug('AMT mode, but no assignment (preview mode)')
      // supposed to show the ad here
      mturkPreview.value = true
    } else {
      api.log.debug('AMT mode, with assignment')
      mturkPreview.value = false
    }
  }
})

/**
 * Handle click to launch study in new window
 *
 * Toggles the launched state and opens the study URL in a new browser window.
 */
function clicked() {
  launched.value = !launched.value
  // open new window
  window.open(redirectURL.value, '_blank')
}

// TODO: Figure out if you are in sandbox mode or not automatically
// if(sandbox) {
//     const turkSubmitTo = 'https://workersandbox.mturk.com/mturk/externalSubmit'
// } else {
//     const turkSubmitTo = 'https://www.mturk.com/mturk/externalSubmit'
// }
const turkSubmitTo = 'https://www.mturk.com/mturk/externalSubmit'

/**
 * Submit completion form to Mechanical Turk
 *
 * Validates the completion code and submits the form to MTurk's external submit endpoint.
 * Saves the completion code to the browser's persisted store.
 *
 * @param {Event} event - The form submission event
 */
function submitForm(event) {
  event.preventDefault()

  // Validate completion code
  if (!completionCode.value.trim()) {
    formError.value = 'Completion code is required'
    return
  }

  formError.value = ''

  // Save to store
  api.store.browserPersisted.completionCode = completionCode.value

  api.log.debug('submitting to AMT')

  // Submit the form
  const form = event.target
  form.submit()
}
</script>

<template>
  <!-- Main container with centered layout -->
  <div class="mt-20 w-4/5 mx-auto">
    <!-- Study preview section - shown when in MTurk preview mode -->
    <StudyPreviewText :estimated_time="props.estimated_time" :payrate="payrate" v-if="mturkPreview"></StudyPreviewText>

    <!-- Assignment mode section - shown when worker has accepted the HIT -->
    <div v-else>
      <!-- Header section -->
      <h1 class="text-2xl font-bold mb-4">Thanks for accepting our HIT</h1>

      <!-- Task completion section - shown after study is launched -->
      <div class="mx-auto" v-if="launched">
        <!-- Instructions for completion -->
        <p class="text-left mb-4">
          Please complete the task in the window that was launched. When you are finished you will be provided with a
          completion code which you should copy and enter here.
        </p>

        <!-- Visual separator -->
        <hr class="border-gray-300 my-4" />

        <!-- Completion code submission form -->
        <form :action="turkSubmitTo" method="post" @submit="submitForm">
          <div class="space-y-4">
            <!-- Completion code input field -->
            <div>
              <label for="completioncode" class="block text-sm font-medium mb-2">Completion Code</label>
              <Input
                id="completioncode"
                name="completioncode"
                v-model="completionCode"
                placeholder="Paste your completion code here"
                :class="{ 'border-red-500': formError }"
              />
              <p v-if="formError" class="text-red-500 text-sm mt-1">{{ formError }}</p>
            </div>

            <!-- Submit button -->
            <Button type="submit" variant="default">Submit to Mechanical Turk</Button>
          </div>
        </form>
      </div>

      <!-- Launch button section - shown before study is launched -->
      <div v-else>
        <Button variant="default" @click="clicked()" target="_new"> Begin Task in New Window </Button>
      </div>
    </div>
  </div>
</template>
