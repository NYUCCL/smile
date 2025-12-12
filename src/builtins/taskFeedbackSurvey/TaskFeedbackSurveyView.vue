<script setup>
import { reactive, computed } from 'vue'

// Import and initialize Smile API for navigation and data management
import useViewAPI from '@/core/composables/useViewAPI'
// Import UI components for form elements
import { Button } from '@/uikit/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/uikit/components/ui/select'
import { Textarea } from '@/uikit/components/ui/textarea'
// Import layout components for page structure
import { TitleTwoCol, ConstrainedPage } from '@/uikit/layouts'

/**
 * Initialize the Smile API for view management
 */
const api = useViewAPI()

// Initialize form data if not already defined
if (!api.persist.isDefined('forminfo')) {
  api.persist.forminfo = reactive({
    difficulty_rating: '', // How difficult the task was
    enjoyment_rating: '', // How enjoyable the task was
    feedback: '', // General feedback for the study team
    issues: '', // Any specific issues to report
  })
}

/**
 * Computed property to check if required form fields are completed
 * @returns {boolean} True if all required fields have values
 */
const complete = computed(
  () => api.persist.forminfo.difficulty_rating !== '' && api.persist.forminfo.enjoyment_rating !== ''
)

/**
 * Autofill function for development/testing purposes
 * Pre-fills all form fields with sample data
 */
function autofill() {
  api.persist.forminfo.difficulty_rating = '0 - Very Easy'
  api.persist.forminfo.enjoyment_rating = '6 - Very Fun'
  api.persist.forminfo.feedback = 'It was good.'
  api.persist.forminfo.issues = 'Too fun?'
}

// Set up autofill for development mode
api.setAutofill(autofill)

/**
 * Handle form submission and navigation to next view
 * Records form data and saves to database before proceeding
 */
function finish() {
  api.recordPageData(api.persist.forminfo)
  api.saveData()
  api.goNextView()
}
</script>

<template>
  <!-- Main page container with responsive layout -->
  <ConstrainedPage
    :responsiveUI="api.config.responsiveUI"
    :width="api.config.windowsizerRequest.width"
    :height="api.config.windowsizerRequest.height"
  >
    <!-- Two-column layout with title and form sections -->
    <TitleTwoCol leftFirst leftWidth="w-1/3" :responsiveUI="api.config.responsiveUI">
      <!-- Page title and description section -->
      <template #title>
        <h3 class="text-3xl font-bold mb-4"><i-fa6-solid-pencil class="inline mr-2" />&nbsp;Give us feedback</h3>
        <p class="text-lg mb-8">
          Please give us feedback about your experience with the study. Your feedback will help us improve our study and
          we appreciate your effort and thoughts.
        </p>
      </template>

      <!-- Left sidebar with important note -->
      <template #left>
        <div class="text-left text-muted-foreground">
          <h3 class="text-lg font-bold mb-2">Important Note</h3>
          <p class="text-md font-light text-muted-foreground">
            If this is a paid study your answers to these questions will have
            <b>no effect on your final payment</b>. We are just interested in your honest answers.
          </p>
        </div>
      </template>

      <!-- Right section containing the feedback form -->
      <template #right>
        <div class="border border-border text-left bg-muted p-6 rounded-lg">
          <!-- Task difficulty rating field -->
          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2">
              How difficult was the task over all?
            </label>
            <Select v-model="api.persist.forminfo.difficulty_rating">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0 - Very Easy">0 - Very Easy</SelectItem>
                <SelectItem value="1 - Easy">1 - Easy</SelectItem>
                <SelectItem value="2 - Somewhat Easy">2 - Somewhat Easy</SelectItem>
                <SelectItem value="3 - Neutral">3 - Neutral</SelectItem>
                <SelectItem value="4 - Somewhat Difficult">4 - Somewhat Difficult</SelectItem>
                <SelectItem value="5 - Difficult">5 - Difficult</SelectItem>
                <SelectItem value="6 - Very Difficult">6 - Very Difficult</SelectItem>
                <SelectItem value="I'd rather not say">I'd rather not say</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">Select your rating</p>
          </div>

          <!-- Task enjoyment rating field -->
          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2">
              How enjoyable/fun was the task over all?
            </label>
            <Select v-model="api.persist.forminfo.enjoyment_rating">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0 - Very Boring">0 - Very Boring</SelectItem>
                <SelectItem value="1 - Boring">1 - Boring</SelectItem>
                <SelectItem value="2 - Somewhat Boring">2 - Somewhat Boring</SelectItem>
                <SelectItem value="3 - Neutral">3 - Neutral</SelectItem>
                <SelectItem value="4 - Somewhat Fun">4 - Somewhat Fun</SelectItem>
                <SelectItem value="5 - Fun">5 - Fun</SelectItem>
                <SelectItem value="6 - Very Fun">6 - Very Fun</SelectItem>
                <SelectItem value="I'd rather not say">I'd rather not say</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">Select your rating</p>
          </div>

          <!-- General feedback textarea (optional) -->
          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2">
              Any general feedback for the study team? <span class="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              v-model="api.persist.forminfo.feedback"
              placeholder="Please provide general thoughts, reactions, or ideas here."
              class="w-full bg-background dark:bg-background text-base resize-vertical"
              rows="4"
            />
            <p class="text-xs text-muted-foreground mt-1">Share your general thoughts and reactions</p>
          </div>

          <!-- Issues reporting textarea (optional) -->
          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2">
              Any specific issues to report that might improve the study?
              <span class="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              v-model="api.persist.forminfo.issues"
              placeholder="Please report any specific issues you had, if any"
              class="w-full bg-background dark:bg-background text-base resize-vertical"
              rows="4"
            />
            <p class="text-xs text-muted-foreground mt-1">Report any specific issues or suggestions</p>
          </div>

          <!-- Form submission section -->
          <hr class="border-border my-6" />
          <div class="flex justify-end">
            <Button variant="default" :disabled="!complete" @click="finish()"> Upload my complete data </Button>
          </div>
        </div>
      </template>
    </TitleTwoCol>
  </ConstrainedPage>
</template>
