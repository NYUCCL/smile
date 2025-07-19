<script setup>
import { reactive, onMounted, watch, onUnmounted } from 'vue'
// import and initalize smile API
import useAPI from '@/core/composables/useAPI'
import { Button } from '@/uikit/components/ui/button'
import { Checkbox } from '@/uikit/components/ui/checkbox'
import { Input } from '@/uikit/components/ui/input'
import { Label } from '@/uikit/components/ui/label'
import { Textarea } from '@/uikit/components/ui/textarea'
import { TitleTwoCol } from '@/uikit/layouts'

/**
 * Component props for WithdrawModal
 * @typedef {Object} WithdrawModalProps
 * @property {boolean} show - Controls modal visibility
 * @property {string} prefillEmail - Pre-filled email address for the form
 */
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  prefillEmail: {
    type: String,
    default: '',
  },
})

/**
 * Component emits for WithdrawModal
 * @typedef {Object} WithdrawModalEmits
 * @property {Function} toggleWithdraw - Emitted when modal should be toggled
 * @property {Function} submitWithdraw - Emitted when withdraw form is submitted
 */
const emit = defineEmits(['toggleWithdraw', 'submitWithdraw'])

// Initialize the API
const api = useAPI()

/**
 * Reactive form data for withdraw information
 * @type {import('vue').Reactive<Object>}
 */
const forminfo = reactive({
  reason_select: [],
  reason_comments: '',
  email: props.prefillEmail || '',
})

/**
 * Available withdraw reason options for participants to select from
 * @type {string[]}
 */
const withdrawOptions = [
  "I couldn't adjust the size of my browser to make everything visible",
  'This task is too hard.',
  'This task is too time consuming.',
  'This task is boring.',
  'I do not understand what I am supposed to do.',
  'I am uncomfortable answering the questions.',
  'The content of the task is upsetting to me.',
  'I am having technical issues.',
]

/**
 * Handles the withdraw submission process
 * Sets withdraw data and saves to API, then emits submit event
 */
function withdraw() {
  api.setWithdrawn(forminfo) // set withdraw data fields
  api.saveData(true) // force a data save
  emit('submitWithdraw')
}

// Disable scrolling on main-content when modal is shown
watch(
  () => props.show,
  (isVisible) => {
    const mainContent = document.querySelector('.main-content')
    if (mainContent) {
      if (isVisible) {
        mainContent.style.overflow = 'hidden'
      } else {
        mainContent.style.overflow = ''
      }
    }
  },
  { immediate: true }
)

// Clean up on component unmount
onUnmounted(() => {
  const mainContent = document.querySelector('.main-content')
  if (mainContent) {
    mainContent.style.overflow = ''
  }
})
</script>

<template>
  <!-- Modal overlay and container -->
  <div class="absolute inset-0 z-50 flex items-center justify-center p-8" :class="{ hidden: !show }">
    <!-- Backdrop overlay -->
    <div class="absolute inset-0 bg-black bg-opacity-50" @click="$emit('toggleWithdraw')"></div>

    <!-- Close button -->
    <Button
      class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
      aria-label="close"
      @click="$emit('toggleWithdraw')"
    >
      <i-fa6-solid-xmark class="text-xl" />
    </Button>

    <!-- Modal content container -->
    <div class="w-[90%] h-[90%] relative bg-background border border-border flex flex-col overflow-hidden">
      <!-- Scrollable content area -->
      <div class="flex-1 overflow-y-auto">
        <TitleTwoCol :responsiveUI="api.config.responsiveUI">
          <!-- Modal header with title -->
          <template #title>
            <h3 class="text-3xl font-semibold">
              <i-ph-hand-withdraw-thin class="text-red-500 inline-block mr-2" />Withdraw from study?
            </h3>
          </template>

          <!-- Left column: Withdrawal information -->
          <template #left>
            <div class="text-left text-muted-foreground">
              <p class="text-sm text-muted-foreground">
                You are free to withdraw from this study at any time. Withdrawing from the study <b>may</b> affect the
                total amount of your compensation. We will follow up with you about partial compensation.
                <b
                  >You do not have to answer any particular question but we appreciate understanding the reasons for
                  your withdraw.</b
                >
              </p>
            </div>
          </template>

          <!-- Right column: Withdrawal form -->
          <template #right>
            <div class="space-y-6">
              <!-- Withdrawal reasons section -->
              <div class="space-y-4">
                <Label class="text-lg font-semibold"> Why are you withdrawing from the study? (Optional) </Label>
                <div class="space-y-3">
                  <div v-for="(option, index) in withdrawOptions" :key="index" class="flex items-center space-x-3">
                    <Checkbox
                      :id="`withdraw-option-${index}`"
                      :checked="forminfo.reason_select.includes(option)"
                      class="border-gray-600 data-[state=checked]:bg-gray-800 data-[state=checked]:border-gray-800"
                      @update:checked="
                        (checked) => {
                          if (checked) {
                            if (!forminfo.reason_select.includes(option)) {
                              forminfo.reason_select.push(option)
                            }
                          } else {
                            const idx = forminfo.reason_select.indexOf(option)
                            if (idx > -1) {
                              forminfo.reason_select.splice(idx, 1)
                            }
                          }
                        }
                      "
                    />
                    <Label :for="`withdraw-option-${index}`" class="text-sm font-normal cursor-pointer">
                      {{ option }}
                    </Label>
                  </div>
                </div>
                <p class="text-xs text-gray-500">Select all that apply.</p>
              </div>

              <!-- Additional comments section -->
              <div class="space-y-3">
                <Label for="comments" class="text-lg font-semibold"> Additional comments. (Optional) </Label>
                <Textarea
                  id="comments"
                  v-model="forminfo.reason_comments"
                  placeholder="Enter your comments here."
                  class="w-full bg-background dark:bg-background text-base resize-vertical"
                  rows="4"
                />
                <p class="text-xs text-gray-500">
                  Please let us know any additional information you would like to share.
                </p>
              </div>

              <!-- Contact email section -->
              <div class="space-y-3">
                <Label for="email" class="text-base font-medium"> Contact email. (Optional) </Label>
                <Input
                  id="email"
                  v-model="forminfo.email"
                  type="email"
                  placeholder="participant@gmail.com"
                  class="w-full text-base bg-background dark:bg-background"
                />
                <p class="text-xs text-gray-500">
                  Please enter your email address so we can follow up with you. This is optional and we otherwise will
                  try to figure out how to reach you. However, this can help avoid any potential problems. Feel free to
                  use an anonymized email like your Prolific contact email, Hide my email (Apple), or create a free
                  alias on SimpleLogin. We will not associate this email with your data nor use it for any purpose other
                  than contacting you to resolve the issue.
                </p>
              </div>
            </div>
          </template>
        </TitleTwoCol>
      </div>

      <!-- Modal footer with action buttons -->
      <div class="border-t bg-muted px-5 py-4 flex justify-end space-x-4 flex-shrink-0">
        <Button variant="outline" @click="$emit('toggleWithdraw')"> Nevermind, take me back to the study! </Button>
        <Button variant="destructive" @click="withdraw"> Withdraw </Button>
      </div>
    </div>
  </div>
</template>
