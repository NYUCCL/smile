<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { animate } from 'motion'
import appconfig from '@/core/config'
import { Button } from '@/uikit/components/ui/button'
import { Card, CardContent } from '@/uikit/components/ui/card'
import { Input } from '@/uikit/components/ui/input'
import { Switch } from '@/uikit/components/ui/switch'
import { Label } from '@/uikit/components/ui/label'
import { TwoCol, ConstrainedPage } from '@/uikit/layouts'

// Import and initialize Smile API
import useViewAPI from '@/core/composables/useViewAPI'

/**
 * Props for the InformedConsentView component
 * @typedef {Object} Props
 * @property {Object} informedConsentText - The consent text component to display
 */
const props = defineProps({
  informedConsentText: {
    type: Object,
    required: true,
  },
})

const api = useViewAPI()

/**
 * Advances to the next view in the experiment flow
 */
function finish() {
  api.goNextView()
}

// Skip consent form if in anonymous mode
if (appconfig.anonymousMode) {
  finish()
}

/**
 * Animates the button with a wiggle effect when consent is given
 * Sets up a timer to repeat the animation every 2 seconds
 */
function wiggle() {
  if (api.persist.agree) {
    animate(button.value, { rotate: [0, 5, -5, 5, -5, 0] }, { duration: 1.25 }).finished.then(() => {
      timer = setTimeout(wiggle, 2000) // Reinitialize the timer after animation
    })
  }
}

// Reactive references
const name = ref('enter your name')
const button = ref(null)
let timer

// Initialize consent agreement state if not already set
if (!('agree' in api.persist)) {
  api.persist.agree = ref(false)
}

// Watch for changes in consent agreement and trigger wiggle animation
if (api.persist.agree) {
  watch(api.persist.agree, (newVal) => {
    if (newVal) {
      console.log('agree changed')
      timer = setTimeout(wiggle, 3000)
    }
  })
}

// Clean up timer on component unmount
onBeforeUnmount(() => {
  clearTimeout(timer)
})
</script>

<template>
  <!-- Main consent form layout with responsive design -->
  <ConstrainedPage
    :responsiveUI="api.config.responsiveUI"
    :width="api.config.windowsizerRequest.width"
    :height="api.config.windowsizerRequest.height"
  >
    <!-- Two-column layout: consent text on left, form on right -->
    <TwoCol rightFirst leftWidth="w-3/5" class="px-6">
      <!-- Left column: Consent text content -->
      <template #left>
        <div class="text-foreground">
          <component :is="informedConsentText" />
        </div>
      </template>

      <!-- Right column: Consent form and controls -->
      <template #right>
        <Card class="bg-muted">
          <CardContent class="bg-muted">
            <!-- Instructions text -->
            <p class="text-left font-semibold text-foreground mb-4">
              We first must verify that you are participating willingly and know your rights. Please take the time to
              read the consent form (you can scroll the page).
            </p>

            <!-- Visual separator -->
            <div class="border-t border-gray-200 my-4"></div>

            <!-- Consent toggle switch -->
            <div class="flex items-center space-x-2 mb-4">
              <Switch
                variant="success"
                v-model="api.persist.agree"
                id="consent_toggle"
                name="consent_toggle"
                size="lg"
              />
              <Label for="consent_toggle" class="text-left text-sm font-medium">
                I consent and am over 18 years old.
              </Label>
            </div>

            <!-- Hidden name input (currently disabled) -->
            <div class="hidden">
              <Label for="your_name" class="text-sm font-medium text-gray-700 mb-2 block">
                Required! Please enter your name:
              </Label>
              <Input id="your_name" name="your_name" v-model="name" placeholder="Enter your name" class="w-full" />
            </div>

            <!-- Continue button (only shown when consent is given) -->
            <div class="mt-6">
              <Button
                ref="button"
                variant="success"
                size="lg"
                class="w-full"
                v-if="api.persist.agree"
                @click="finish()"
              >
                Let's start
                <svg class="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </Button>
            </div>
          </CardContent>
        </Card>
      </template>
    </TwoCol>
  </ConstrainedPage>
</template>
