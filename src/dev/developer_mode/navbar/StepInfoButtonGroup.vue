<script setup>
// API composable for stepper navigation
import useViewAPI from '@/core/composables/useViewAPI'

// UI components
import { ButtonGroup, ButtonGroupItem } from '@/uikit/components/ui/button-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'

// Icons
import { ChevronLeft, ChevronRight, CircleMinus } from 'lucide-vue-next'

/**
 * API instance for accessing stepper state and methods
 */
const api = useViewAPI()
</script>

<template>
  <!-- Step navigation button group with tooltips -->
  <TooltipProvider>
    <ButtonGroup variant="outline" size="menu">
      <!-- Step back button -->
      <Tooltip>
        <TooltipTrigger asChild>
          <ButtonGroupItem
            @click="api.goPrevStep()"
            :disabled="!api.store.dev.viewProvidesStepper || !api.hasPrevStep()"
          >
            <ChevronLeft />
          </ButtonGroupItem>
        </TooltipTrigger>
        <TooltipContent side="bottom"> Step back (Left Arrow) </TooltipContent>
      </Tooltip>

      <!-- Current path display -->
      <Tooltip>
        <TooltipTrigger asChild>
          <ButtonGroupItem :disabled="!api.store.dev.viewProvidesStepper || !api.hasSteps()">
            <span class="counter" v-if="api.pathString">{{ api.pathString }}</span>
            <i-iconoir-remove-empty v-else />
          </ButtonGroupItem>
        </TooltipTrigger>
        <TooltipContent side="bottom"> Current path </TooltipContent>
      </Tooltip>

      <!-- Step forward button -->
      <Tooltip>
        <TooltipTrigger asChild>
          <ButtonGroupItem
            @click="api.goNextStep()"
            :disabled="!api.store.dev.viewProvidesStepper || !api.hasNextStep()"
          >
            <ChevronRight />
          </ButtonGroupItem>
        </TooltipTrigger>
        <TooltipContent side="bottom"> Step forward (Right Arrow) </TooltipContent>
      </Tooltip>
    </ButtonGroup>
  </TooltipProvider>
</template>

<style scoped>
.counter {
  font-size: 0.95em;
  font-family: monospace;
  font-weight: 500;
}
</style>
