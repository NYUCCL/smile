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
  <!-- Reload browser button with tooltip -->
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="menu" variant="outline" @click="api.reloadBrowser()">
          <i-lucide-rotate-ccw :stroke-width="2.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom"> Reload browser (Cmd + R)</TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
