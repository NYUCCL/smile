<script setup>
/**
 * @fileoverview Dark mode toggle button component for presentation mode
 * Provides a tooltip-enabled button to switch between light, dark, and system color modes
 */

// UI component imports
import { Button } from '@/uikit/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'

// Composables
import { useSmileColorMode } from '@/core/composables/useColorMode'

/**
 * Initialize color mode composable for global scope (applies to html element, like production mode)
 * @type {Object} Global color mode state and controls
 */
const {
  state: globalColorMode,
  mode: globalColorModeRaw,
  toggle: toggleColorMode,
  system,
} = useSmileColorMode('global')
</script>

<template>
  <!-- Tooltip provider wrapper -->
  <TooltipProvider>
    <Tooltip>
      <!-- Tooltip trigger button -->
      <TooltipTrigger asChild>
        <Button size="menu" variant="outline" @click="toggleColorMode">
          <!-- Light mode icon -->
          <i-lucide-moon v-if="globalColorModeRaw === 'light'" />
          <!-- Dark mode icon -->
          <i-lucide-sun-moon v-else-if="globalColorModeRaw === 'dark'" />
          <!-- System mode icon -->
          <i-lucide-sun v-else />
        </Button>
      </TooltipTrigger>
      <!-- Tooltip content with dynamic text -->
      <TooltipContent side="bottom">
        <p v-if="globalColorModeRaw === 'light'">Switch to Dark Mode</p>
        <p v-else-if="globalColorModeRaw === 'dark'">Switch to System ({{ system }})</p>
        <p v-else>Switch to Light Mode</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
