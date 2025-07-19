<script setup>
// UI components
import { Button } from '@/uikit/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'

// API composable
import useAPI from '@/core/composables/useAPI'

/**
 * API instance for accessing application state and methods
 */
const api = useAPI()
</script>

<template>
  <!-- Fullscreen toggle button with tooltip -->
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="menu" variant="outline" @click="api.store.dev.isFullscreen = !api.store.dev.isFullscreen">
          <i-ic-outline-fullscreen :stroke-width="2.5" v-if="!api.store.dev.isFullscreen" />
          <i-ic-outline-fullscreen-exit :stroke-width="2.5" v-else />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p v-if="api.store.dev.isFullscreen">Responsive Mode</p>
        <p v-else>Fullscreen</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
