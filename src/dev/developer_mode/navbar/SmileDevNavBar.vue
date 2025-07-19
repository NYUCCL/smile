<script setup>
// Component imports
import StepInfoButtonGroup from '@/dev/developer_mode/navbar/StepInfoButtonGroup.vue'
import ViewInfoButtonGroup from '@/dev/developer_mode/navbar/ViewInfoButtonGroup.vue'
import ResetButton from '@/dev/developer_mode/navbar/ResetButton.vue'
import ReloadButton from '@/dev/developer_mode/navbar/ReloadButton.vue'
import ColorModeButton from '@/dev/developer_mode/navbar/ColorModeButton.vue'
import DatabaseButtonGroup from '@/dev/developer_mode/navbar/DatabaseButtonGroup.vue'
import FullScreenButton from '@/dev/developer_mode/navbar/FullScreenButton.vue'
import ViewButton from '@/dev/developer_mode/navbar/ViewButton.vue'
import KeyCommandNotification from '@/dev/developer_mode/navbar/KeyCommandNotification.vue'

// Icon imports
import { BugPlay } from 'lucide-vue-next'

// Vue composables
import { ref } from 'vue'
import { onKeyDown } from '@vueuse/core'

// API composable
import useAPI from '@/core/composables/useAPI'

/**
 * API instance for accessing application state and methods
 */
const api = useAPI()

/**
 * Reactive refs for notification system
 */
const showNotification = ref(false)
const notificationCommand = ref('')
const notificationAction = ref('')
const notificationType = ref('default')

/**
 * Shows a temporary notification with a command and action that automatically hides after 1.5 seconds
 *
 * @param {string} command - The command text to display in the notification
 * @param {string} action - The action text to display in the notification
 * @param {string} type - The type of notification ('default' or 'error')
 */
const showTemporaryNotification = (command, action, type = 'default') => {
  notificationCommand.value = command
  notificationAction.value = action
  notificationType.value = type
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 1500) // Hide after 1.5 seconds
}

/**
 * Developer mode keyboard shortcuts
 * These shortcuts are only active when developer mode is enabled
 *
 * Navigation:
 * - ArrowUp: Go to previous view
 * - ArrowDown: Go to next view
 *
 * Panel Controls:
 * - Ctrl+1: Toggle sidebar/console panels
 * - Ctrl+2: Cycle through sidebar tabs (Steps -> Random -> DB Info)
 * - Ctrl+3: Cycle through console tabs (Browse -> Log -> Config)
 * - Ctrl+R: Reset local state
 * - Ctrl+D: Connect to database
 * - Ctrl+A: Autofill current view (if available)
 * - Ctrl+P: Pin/unpin current route
 */

/**
 * Navigate to previous view on ArrowUp key press
 */
onKeyDown((e) => {
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    api.goToView(api.prevView()?.name, true)
  }
})

/**
 * Navigate to next view on ArrowDown key press
 */
onKeyDown((e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    api.goToView(api.nextView()?.name, true)
  }
})

/**
 * Toggle sidebar/console panels on Ctrl+1 key press
 */
onKeyDown((e) => {
  if (e.ctrlKey && e.key === '1') {
    e.preventDefault()

    const sideBar = api.store.dev.showSideBar
    const consoleBar = api.store.dev.showConsoleBar

    if (!sideBar && !consoleBar) {
      api.store.dev.showSideBar = true
      api.store.dev.showConsoleBar = false
      showTemporaryNotification('Ctrl + 1', 'Showing Sidebar')
    } else if (sideBar && !consoleBar) {
      api.store.dev.showSideBar = false
      api.store.dev.showConsoleBar = true
      showTemporaryNotification('Ctrl + 1', 'Showing Console')
    } else if (!sideBar && consoleBar) {
      api.store.dev.showSideBar = true
      api.store.dev.showConsoleBar = true
      showTemporaryNotification('Ctrl + 1', 'Showing Both Panels')
    } else {
      api.store.dev.showSideBar = false
      api.store.dev.showConsoleBar = false
      showTemporaryNotification('Ctrl + 1', 'Hiding All Panels')
    }
  }
})

/**
 * Cycle through sidebar tabs on Ctrl+2 key press
 */
onKeyDown((e) => {
  if (e.ctrlKey && e.key === '2') {
    e.preventDefault()

    if (!api.store.dev.showSideBar) {
      showTemporaryNotification('Ctrl + 2', 'Sidebar is hidden', 'error')
      return
    }

    const currentTab = api.store.dev.sideBarTab

    if (currentTab === 'steps') {
      api.store.dev.sideBarTab = 'randomization'
      showTemporaryNotification('Ctrl + 2', 'Switched to Random Tab')
    } else if (currentTab === 'randomization') {
      api.store.dev.sideBarTab = 'db'
      showTemporaryNotification('Ctrl + 2', 'Switched to DB Info Tab')
    } else {
      api.store.dev.sideBarTab = 'steps'
      showTemporaryNotification('Ctrl + 2', 'Switched to Steps Tab')
    }
  }
})

/**
 * Cycle through console tabs on Ctrl+3 key press
 */
onKeyDown((e) => {
  if (e.ctrlKey && e.key === '3') {
    e.preventDefault()

    if (!api.store.dev.showConsoleBar) {
      showTemporaryNotification('Ctrl + 3', 'Console is hidden', 'error')
      return
    }

    const currentTab = api.store.dev.consoleBarTab

    if (currentTab === 'browse') {
      api.store.dev.consoleBarTab = 'log'
      showTemporaryNotification('Ctrl + 3', 'Switched to Log Tab')
    } else if (currentTab === 'log') {
      api.store.dev.consoleBarTab = 'config'
      showTemporaryNotification('Ctrl + 3', 'Switched to Config Tab')
    } else {
      api.store.dev.consoleBarTab = 'browse'
      showTemporaryNotification('Ctrl + 3', 'Switched to Browse Tab')
    }
  }
})

/**
 * Reset local state on Ctrl+R key press
 */
onKeyDown((e) => {
  if (e.ctrlKey && e.key === 'r') {
    e.preventDefault()
    showTemporaryNotification('Ctrl + R', 'Resetting Local State')
    setTimeout(() => {
      api.resetLocalState()
    }, 200)
  }
})

/**
 * Connect to database on Ctrl+D key press
 */
onKeyDown((e) => {
  if (e.ctrlKey && e.key === 'd') {
    e.preventDefault()
    if (!api.store.browserPersisted.knownUser) {
      api.setKnown()
      api.setConsented()
      showTemporaryNotification('Ctrl + D', 'Connected to Database')
    }
  }
})

/**
 * Autofill current view on Ctrl+A key press
 */
onKeyDown((e) => {
  if (e.ctrlKey && e.key === 'a') {
    e.preventDefault()
    if (api.hasAutofill()) {
      api.autofill()
      showTemporaryNotification('Ctrl + A', 'Autofilled Current View')
    } else {
      showTemporaryNotification('Ctrl + A', 'No Autofill Available', 'error')
    }
  }
})

/**
 * Pin/unpin current route on Ctrl+P key press
 */
onKeyDown((e) => {
  if (e.ctrlKey && e.key === 'p') {
    e.preventDefault()
    const currentRoute = api.currentRouteName()
    const isCurrentlyPinned = api.store.dev.pinnedRoute === currentRoute

    if (isCurrentlyPinned) {
      api.store.dev.pinnedRoute = null
      showTemporaryNotification('Ctrl + P', 'Unpinned Route')
    } else {
      api.store.dev.pinnedRoute = currentRoute
      showTemporaryNotification('Ctrl + P', 'Pinned Current Route')
    }
  }
})
</script>

<template>
  <!-- Main navigation bar container -->
  <nav class="flex items-center justify-between w-full border-b min-h-[36px] max-h-[36px] text-sm px-2">
    <!-- Left section - Developer mode indicator -->
    <div class="flex items-center flex-shrink-0 px-2 py-1 rounded">
      <div class="flex items-center">
        <!-- Desktop version -->
        <div class="hidden sm:block">
          <div class="flex items-center text-xs font-normal">
            <BugPlay class="size-4 mr-1" />
            <b>DEVELOPER MODE</b>
          </div>
        </div>
        <!-- Mobile version -->
        <div class="block sm:hidden">
          <div class="flex items-center text-xs font-normal">
            <BugPlay class="size-4 mr-1" />
            <b>DEV</b>
          </div>
        </div>
      </div>
    </div>

    <!-- Middle section - Centered content area -->
    <div class="flex items-center justify-center flex-1 min-w-0 px-2 py-1 rounded">
      <div class="flex items-center space-x-2">
        <div class="text-xs text-gray-600">
          <!-- Middle content placeholder -->
        </div>
      </div>
    </div>

    <!-- Right section - Control buttons -->
    <div class="flex items-center flex-shrink-0 px-1 py-1 rounded">
      <div class="flex items-center space-x-2.5 border-gray-300 pl-4 rounded-l">
        <!-- Reload button -->
        <div class="flex items-center">
          <ReloadButton />
        </div>

        <!-- Reset button -->
        <div class="flex items-center">
          <ResetButton />
        </div>

        <!-- Color mode button (only in fullscreen mode and not on recruit page) -->
        <div class="flex items-center" v-if="api.store.dev.isFullscreen && api.currentRouteName() !== 'recruit'">
          <ColorModeButton />
        </div>

        <!-- Fullscreen button (not on recruit page) -->
        <div class="flex items-center" v-if="api.currentRouteName() !== 'recruit'">
          <FullScreenButton />
        </div>

        <!-- Database info button group -->
        <DatabaseButtonGroup />

        <!-- Step info buttons (responsive - hidden on small screens) -->
        <div class="items-center">
          <StepInfoButtonGroup />
        </div>

        <!-- View info buttons (hidden on medium screens and below) -->
        <div class="hidden md:flex items-center">
          <ViewInfoButtonGroup />
        </div>

        <!-- View button -->
        <div class="flex items-center">
          <ViewButton />
        </div>
      </div>
    </div>
  </nav>

  <!-- Keyboard command notification overlay -->
  <KeyCommandNotification
    :show="showNotification"
    :command="notificationCommand"
    :action="notificationAction"
    :type="notificationType"
  />
</template>

<style scoped>
/* No custom styles needed - all styling handled by Tailwind classes */
</style>
