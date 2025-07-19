<script setup>
// Vue composables
import { computed, ref } from 'vue'

// API composable
import useAPI from '@/core/composables/useAPI'

// UI components
import { ButtonGroup, ButtonGroupItem } from '@/uikit/components/ui/button-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/uikit/components/ui/dropdown-menu'

// Local components
import RouteJumper from '@/dev/developer_mode/navbar/RouteJumper.vue'

/**
 * API instance for accessing application state and methods
 */
const api = useAPI()

/**
 * Computed style for the button group based on pinned route state
 *
 * @returns {string} CSS class string for pinned state styling
 */
const buttonstyle = computed(() => {
  let base = ''
  if (api.store.dev.pinnedRoute !== null) {
    return base + ' pinned'
  } else {
    return base
  }
})

/**
 * Handles dropdown menu open/close state changes
 * Only allows opening if no route is pinned
 *
 * @param {boolean} open - Whether the dropdown should be open
 */
const handleDropdownOpenChange = (open) => {
  if (api.store.dev.pinnedRoute == null) {
    api.store.dev.routePanelVisible = open
  }
}

/**
 * Toggles the pin state of the current route
 * If no route is pinned, pins the current route
 * If a route is pinned, unpins it
 */
const togglePin = () => {
  api.store.dev.pinnedRoute = api.store.dev.pinnedRoute === null ? api.currentRouteName() : null
  api.store.dev.routePanelVisible = false
}
</script>

<template>
  <!-- View information button group with tooltips -->
  <TooltipProvider>
    <ButtonGroup variant="outline" size="menu">
      <!-- Autofill button -->
      <Tooltip>
        <TooltipTrigger asChild>
          <ButtonGroupItem v-on:click="api.autofill()" :disabled="!api.hasAutofill()">
            <i-mdi-magic />
          </ButtonGroupItem>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {{ api.hasAutofill() ? 'Autofill (Ctrl + A)' : 'No autofill available' }}
        </TooltipContent>
      </Tooltip>

      <!-- Previous view button -->
      <template v-if="api.hasPrevView()">
        <Tooltip>
          <TooltipTrigger asChild>
            <ButtonGroupItem
              v-on:click="api.goToView(api.route?.meta?.prev)"
              :disabled="api.store.dev.pinnedRoute !== null"
            >
              <i-meteor-icons-angles-left />
            </ButtonGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom"> Previous View (Down Arrow)</TooltipContent>
        </Tooltip>
      </template>
      <template v-else>
        <ButtonGroupItem disabled>
          <i-meteor-icons-angles-left />
        </ButtonGroupItem>
      </template>

      <!-- Next view button -->
      <template v-if="api.hasNextView()">
        <Tooltip>
          <TooltipTrigger asChild>
            <ButtonGroupItem v-on:click="api.goNextView()" :disabled="api.store.dev.pinnedRoute !== null">
              <i-meteor-icons-angles-right />
            </ButtonGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom"> Next View (Up Arrow)</TooltipContent>
        </Tooltip>
      </template>
      <template v-else>
        <ButtonGroupItem disabled>
          <i-meteor-icons-angles-right />
        </ButtonGroupItem>
      </template>

      <!-- Pin route button (development mode only) -->
      <template v-if="api.store.config.mode === 'development'">
        <Tooltip>
          <TooltipTrigger asChild>
            <ButtonGroupItem v-on:click="togglePin()" :class="{ pinned: api.store.dev.pinnedRoute !== null }">
              <i-ic-baseline-pin-off v-if="api.store.dev.pinnedRoute !== null" />
              <i-ic-baseline-push-pin v-else />
            </ButtonGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom"> Pin current route (Ctrl + P) </TooltipContent>
        </Tooltip>
      </template>

      <!-- Route dropdown menu -->
      <DropdownMenu :open="api.store.dev.routePanelVisible" @update:open="handleDropdownOpenChange">
        <DropdownMenuTrigger as-child>
          <ButtonGroupItem :class="buttonstyle">
            <div class="font-mono text-[0.65rem] font-medium min-w-[100px]">
              <!-- Route type icons -->
              <i-lucide-arrow-down v-if="api.currentRouteInfo().meta.sequential" class="inline size-3 mr-1" />
              <i-lucide-presentation
                v-else-if="api.currentRouteName() === 'presentation_home'"
                class="inline size-3 mr-1"
              />
              <i-lucide-diamond v-else class="inline size-3 mr-1" />
              /{{ api.currentRouteName() }}
            </div>
          </ButtonGroupItem>
        </DropdownMenuTrigger>
        <RouteJumper />
      </DropdownMenu>
    </ButtonGroup>
  </TooltipProvider>
</template>

<style scoped>
.pinned {
  background-color: var(--pinned-route);
  color: var(--dev-contrast-text);
}
</style>
