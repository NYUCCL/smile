<script setup>
// UI components
import { Button } from '@/uikit/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'

// API composable
import useAPI from '@/core/composables/useAPI'
import { computed } from 'vue'

/**
 * API instance for accessing application state and methods
 */
const api = useAPI()

/**
 * Computes the current panel state: 'both', 'none', 'sidebar', or 'console'
 * @returns {string}
 */
const currentState = computed(() => {
  const sideBar = api.store.dev.showSideBar
  const consoleBar = api.store.dev.showConsoleBar

  if (sideBar && consoleBar) return 'both'
  if (!sideBar && !consoleBar) return 'none'
  if (sideBar) return 'sidebar'
  return 'console'
})

/**
 * Tooltip text for the current panel state
 * @returns {string}
 */
const tooltipText = computed(() => {
  switch (currentState.value) {
    case 'both':
      return 'Hide all panels'
    case 'none':
      return 'Show sidebar'
    case 'sidebar':
      return 'Show console'
    case 'console':
      return 'Show all panels'
    default:
      return 'Toggle panels'
  }
})

/**
 * Cycles the panel state between sidebar, console, both, and none
 */
const cycleState = () => {
  switch (currentState.value) {
    case 'both':
      api.store.dev.showSideBar = false
      api.store.dev.showConsoleBar = false
      break
    case 'none':
      api.store.dev.showSideBar = true
      api.store.dev.showConsoleBar = false
      break
    case 'sidebar':
      api.store.dev.showSideBar = false
      api.store.dev.showConsoleBar = true
      break
    case 'console':
      api.store.dev.showSideBar = true
      api.store.dev.showConsoleBar = true
      break
  }
}
</script>

<template>
  <!-- Panel toggle button with tooltip -->
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="menu" variant="outline" @click="cycleState">
          <!-- Both panels visible -->
          <svg
            v-if="currentState === 'both'"
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 15h12" />
            <path d="M15 3v18" />
          </svg>

          <!-- Both panels hidden -->
          <svg
            v-if="currentState === 'none'"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M8 8h.01" />
            <path d="M12 8h.01" />
            <path d="M16 8h.01" />
          </svg>

          <!-- Only sidebar visible -->
          <svg
            v-if="currentState === 'sidebar'"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M15 3v18" />
          </svg>

          <!-- Only console visible -->
          <svg
            v-if="currentState === 'console'"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 15h18" />
          </svg>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom"> {{ tooltipText }} (Ctrl + 1) </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
