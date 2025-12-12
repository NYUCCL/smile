<script setup>
import { reactive, computed } from 'vue'

// Import and initialize Smile API for navigation and state management
import useViewAPI from '@/core/composables/useViewAPI'
// Import UI components for form elements and layout
import { Button } from '@/uikit/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/uikit/components/ui/select'
import { TitleTwoCol, ConstrainedPage } from '@/uikit/layouts'

/**
 * Initialize the Smile API for navigation and state management
 */
const api = useViewAPI()

/**
 * Append device survey steps to the navigation flow
 * Creates two pages: device_page1 and device_page2
 */
api.steps.append([{ id: 'device_page1' }, { id: 'device_page2' }])

/**
 * Initialize form data in persistent storage if not already defined
 * Stores device information across page navigation
 */
if (!api.persist.isDefined('forminfo')) {
  api.persist.forminfo = reactive({
    device_type: '', // Type of device (e.g., desktop, laptop, tablet, phone)
    connection: '', // Type of internet connection (e.g., wifi, ethernet, cellular)
    connection_quality: '', // Self-reported connection quality
    browser: '', // Self-reported browser
    pointer: '', // Self-reported pointing device (mouse, trackpad, touchscreen)
    assistive_technology: '', // Self-reported assistive technology
    tools: '', // Self-report of tools
  })
}

/**
 * Computed property to check if all required fields on page 1 are completed
 * @returns {boolean} True if all page 1 fields are filled
 */
const page_one_complete = computed(
  () =>
    api.persist.forminfo.device_type !== '' &&
    api.persist.forminfo.connection !== '' &&
    api.persist.forminfo.connection_quality !== '' &&
    api.persist.forminfo.browser !== ''
)

/**
 * Computed property to check if all required fields on page 2 are completed
 * @returns {boolean} True if all page 2 fields are filled
 */
const page_two_complete = computed(
  () =>
    api.persist.forminfo.pointer !== '' &&
    api.persist.forminfo.assistive_technology !== '' &&
    api.persist.forminfo.tools !== ''
)

/**
 * Autofill function for development/testing purposes
 * Pre-populates all form fields with sample data
 */
function autofill() {
  api.persist.forminfo.device_type = 'Desktop Computer'
  api.persist.forminfo.connection = 'Wifi'
  api.persist.forminfo.connection_quality = 'Fast'
  api.persist.forminfo.browser = 'ARC'
  api.persist.forminfo.pointer = 'Mouse'
  api.persist.forminfo.assistive_technology = 'No'
  api.persist.forminfo.tools = 'No'
}

/**
 * Register the autofill function with the API for development mode
 */
api.setAutofill(autofill)

/**
 * Complete the device survey and proceed to the next view
 * Records form data and navigates to the next view in the experiment flow
 */
function finish() {
  api.recordPageData(api.persist.forminfo)
  api.goNextView()
}
</script>

<template>
  <!-- Main container with responsive layout constraints -->
  <ConstrainedPage
    :responsiveUI="api.config.responsiveUI"
    :width="api.config.windowsizerRequest.width"
    :height="api.config.windowsizerRequest.height"
  >
    <!-- Two-column layout with title and form sections -->
    <TitleTwoCol leftFirst leftWidth="w-1/3" :responsiveUI="api.config.responsiveUI">
      <!-- Title and description section -->
      <template #title>
        <h3 class="text-3xl font-bold mb-4">
          <i-fa6-solid-desktop class="inline mr-2" />&nbsp;Computer/Device Information
        </h3>
        <p class="text-lg mb-8">
          We request some basic information about the computer you are using right now. We also can use this information
          to improve the quality of our experiments in the future.
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

      <!-- Right content area with form pages -->
      <template #right>
        <!-- Page 1: Device and connection information -->
        <div v-if="api.pathString === 'device_page1'" class="border border-border text-left bg-muted p-6 rounded-lg">
          <!-- Device type selection -->
          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2">
              What best describes the computer you are using right now?
            </label>
            <Select v-model="api.persist.forminfo.device_type">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Laptop Computer">Laptop Computer</SelectItem>
                <SelectItem value="Desktop Computer">Desktop Computer</SelectItem>
                <SelectItem value="iPad/Tablet">iPad/Tablet</SelectItem>
                <SelectItem value="Smartphone">Smartphone</SelectItem>
                <SelectItem value="Television">Television</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="I'm not sure">I'm not sure</SelectItem>
                <SelectItem value="I'd rather not say">I'd rather not say</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">Enter your computer type (choose the best match)</p>
          </div>

          <!-- Internet connection type selection -->
          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2">
              What type of Internet connection are you using right now?
            </label>
            <Select v-model="api.persist.forminfo.connection">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ethernet">Ethernet</SelectItem>
                <SelectItem value="Wifi">Wifi</SelectItem>
                <SelectItem value="Cellular (5G)">Cellular (5G)</SelectItem>
                <SelectItem value="Cellular (4G/LTE)">Cellular (4G/LTE)</SelectItem>
                <SelectItem value="Cellular (3G)">Cellular (3G)</SelectItem>
                <SelectItem value="DSL">DSL</SelectItem>
                <SelectItem value="Dialup Modem">Dialup Modem</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="I'm not sure">I'm not sure</SelectItem>
                <SelectItem value="I'd rather not say">I'd rather not say</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">Enter your internet connection type</p>
          </div>

          <!-- Connection quality rating -->
          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2">
              How would you rate you Internet connection quality today?
            </label>
            <Select v-model="api.persist.forminfo.connection_quality">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fast">Fast</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="Slow but reliable">Slow but reliable</SelectItem>
                <SelectItem value="Very slow, unreliable">Very slow, unreliable</SelectItem>
                <SelectItem value="I'm not sure">I'm not sure</SelectItem>
                <SelectItem value="I'd rather not say">I'd rather not say</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">How would you rate your Internet connection</p>
          </div>

          <!-- Browser selection -->
          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2"> What web browser are you using? </label>
            <Select v-model="api.persist.forminfo.browser">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Safari (Mac)">Safari (Mac)</SelectItem>
                <SelectItem value="Chrome">Chrome</SelectItem>
                <SelectItem value="Firefox">Firefox</SelectItem>
                <SelectItem value="Opera">Opera</SelectItem>
                <SelectItem value="Microsoft Edge">Microsoft Edge</SelectItem>
                <SelectItem value="Microsoft Internet Explorer">Microsoft Internet Explorer</SelectItem>
                <SelectItem value="UC Browser">UC Browser</SelectItem>
                <SelectItem value="Samsung Internet">Samsung Internet</SelectItem>
                <SelectItem value="ARC">ARC</SelectItem>
                <SelectItem value="Chromium">Chromium</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="I'm not sure">I'm not sure</SelectItem>
                <SelectItem value="I'd rather not say">I'd rather not say</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">Enter your internet browser type</p>
          </div>

          <!-- Navigation separator -->
          <hr class="border-border my-6" />

          <!-- Continue button for page 1 -->
          <div class="flex justify-end">
            <Button variant="outline" :disabled="!page_one_complete" @click="api.goNextStep()">
              Continue
              <i-fa6-solid-arrow-right />
            </Button>
          </div>
        </div>

        <!-- Page 2: Input devices and assistive technology -->
        <div
          v-else-if="api.pathString === 'device_page2'"
          class="border border-border text-left bg-muted p-6 rounded-lg"
        >
          <!-- Input device selection -->
          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2">
              What best descries how you moved the cursor, clicked, or scrolled things during this experiment?
            </label>
            <Select v-model="api.persist.forminfo.pointer">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mouse">Mouse</SelectItem>
                <SelectItem value="Trackpad">Trackpad</SelectItem>
                <SelectItem value="Scrollwheel">Scrollwheel</SelectItem>
                <SelectItem value="Touchscreen/Finger">Touchscreen/Finger</SelectItem>
                <SelectItem value="Trackpoint/pointing stick">Trackpoint/pointing stick</SelectItem>
                <SelectItem value="Stylus/Pen/Pencil">Stylus/Pen/Pencil</SelectItem>
                <SelectItem value="Keyboard Only">Keyboard Only</SelectItem>
                <SelectItem value="Game Controller">Game Controller</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="I'm not sure">I'm not sure</SelectItem>
                <SelectItem value="I'd rather not say">I'd rather not say</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">Enter your input type</p>
          </div>

          <!-- Assistive technology usage -->
          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2">
              Are you using any assistive technologies?
            </label>
            <Select v-model="api.persist.forminfo.assistive_technology">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="I'm not sure">I'm not sure</SelectItem>
                <SelectItem value="I'd rather not say">I'd rather not say</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">
              Examples include screen readers, screen magnifiers, or voice input systems.
            </p>
          </div>

          <!-- AI/tools usage -->
          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2">
              Did you use any AI or other tools to help you complete this experiment?
            </label>
            <Select v-model="api.persist.forminfo.tools">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="I'm not sure">I'm not sure</SelectItem>
                <SelectItem value="I'd rather not say">I'd rather not say</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">
              Examples include browser extensions that help you fill forms, enter text, or navigate the web or copying
              answers from AI/Large Language Models.
            </p>
          </div>

          <!-- Navigation separator -->
          <hr class="border-border my-6" />

          <!-- Navigation buttons for page 2 -->
          <div class="flex justify-between">
            <Button variant="outline" @click="api.goPrevStep()">
              <i-fa6-solid-arrow-left />
              Previous
            </Button>
            <Button variant="default" :disabled="!page_two_complete" @click="finish()"> I'm done! </Button>
          </div>
        </div>
      </template>
    </TitleTwoCol>
  </ConstrainedPage>
</template>
