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
  <!-- Reset local state button with tooltip -->
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="menu" variant="outline" @click="api.resetLocalState()">
          <i-f7-bolt-fill />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom"> Reset local state (Ctrl + R) </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
