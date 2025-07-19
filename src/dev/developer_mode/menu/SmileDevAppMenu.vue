<script setup>
/**
 * @fileoverview Sidebar component for the Smile application with navigation and configuration options
 */

/**
 * Import Vue composition API functions
 * @requires computed Vue computed for derived state
 */
import { computed } from 'vue'

/**
 * Import sidebar UI components from shadcn-vue
 * @requires Sidebar Main sidebar container component
 * @requires SidebarContent Content area of the sidebar
 * @requires SidebarFooter Footer area of the sidebar
 * @requires SidebarGroup Group container for sidebar items
 * @requires SidebarGroupContent Content within a sidebar group
 * @requires SidebarHeader Header area of the sidebar
 * @requires SidebarMenu Menu container for sidebar items
 * @requires SidebarMenuButton Button component for sidebar menu items
 * @requires SidebarMenuItem Individual menu item in the sidebar
 */
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/uikit/components/ui/sidebar'

/**
 * Import popover components for configuration panel
 * @requires Popover Popover container component
 * @requires PopoverContent Content area of the popover
 * @requires PopoverTrigger Trigger element for the popover
 */
import { Popover, PopoverContent, PopoverTrigger } from '@/uikit/components/ui/popover'

/**
 * Import configuration panel component
 * @requires DevConfigPanel Developer configuration panel component
 */
import DevConfigPanel from '@/dev/developer_mode/menu/DevConfigPanel.vue'

/**
 * Import color mode composable
 * @requires useSmileColorMode Composable for managing color theme
 */
import { useSmileColorMode } from '@/core/composables/useColorMode'

/**
 * Import tooltip components for enhanced UX
 * @requires Tooltip Tooltip container component
 * @requires TooltipContent Content area of the tooltip
 * @requires TooltipProvider Provider for tooltip context
 * @requires TooltipTrigger Trigger element for the tooltip
 */
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'

/**
 * Import and initialize SMILE API
 * @requires useAPI SMILE API composable
 */
import useAPI from '@/core/composables/useAPI'

/**
 * Component props for sidebar configuration
 * @typedef {Object} Props
 * @property {string} [side] - Side of the sidebar ('left' or 'right')
 * @property {string} [variant] - Variant of the sidebar styling
 * @property {string} [collapsible] - Collapsible behavior ('icon' or 'none')
 * @property {string} [class] - Additional CSS classes
 */
const props = defineProps({
  side: { type: String, required: false },
  variant: { type: String, required: false },
  collapsible: { type: String, required: false, default: 'icon' },
  class: { type: null, required: false },
})

/**
 * Initialize SMILE API instance
 * @constant {Object} api Global API instance
 */
const api = useAPI()

/**
 * Initialize global color mode for the entire application (html element)
 * Uses global scope to apply color mode to the entire application
 * @type {Object}
 * @property {import('vue').Ref<string>} globalColorMode Current global color mode state
 * @property {Function} setLight Function to set light mode
 * @property {Function} setDark Function to set dark mode
 */
const { state: globalColorMode, setLight, setDark } = useSmileColorMode('global')

/**
 * Computed property that provides two-way binding for dark mode toggle
 *
 * Provides a boolean interface for the color mode toggle switch.
 * When set to true, enables dark mode; when false, enables light mode.
 *
 * @type {import('vue').ComputedRef<boolean>}
 * @returns {boolean} True if dark mode is active, false for light mode
 */
const isDarkMode = computed({
  get: () => globalColorMode.value === 'dark',
  set: (value) => {
    if (value) {
      setDark()
    } else {
      setLight()
    }
  },
})
</script>

<template>
  <!-- Main sidebar container with icon-only layout -->
  <Sidebar class="w-[calc(var(--sidebar-width-icon)+1px)]! border-r" v-bind="props">
    <!-- Sidebar header with main logo button -->
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child class="md:h-8 md:p-0">
            <a href="#">
              <div class="mainbutton text-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <i-lucide-smile />
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <!-- Sidebar content with navigation menu -->
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent class="px-1.5 md:px-0">
          <SidebarMenu>
            <!-- Developer Mode navigation item -->
            <SidebarMenuItem>
              <SidebarMenuButton
                class="px-[0.05rem] group-data-[collapsible=icon]:!p-1.5 my-1"
                :class="{
                  'bg-chart-4 hover:!bg-chart-4/80': api.store.dev.mainView === 'devmode',
                  'hover:!bg-sidebar-border': api.store.dev.mainView !== 'devmode',
                }"
                tooltip="Developer Mode"
                @click="api.store.dev.mainView = 'devmode'"
              >
                <i-lucide-bug-play class="!size-5" />
              </SidebarMenuButton>
            </SidebarMenuItem>

            <!-- Analyze 
            <SidebarMenuItem>
              <SidebarMenuButton
                class="px-[0.05rem] group-data-[collapsible=icon]:!p-1.5 my-1"
                :class="{ 
                  'bg-chart-4 hover:!bg-chart-4/80': api.store.dev.mainView === 'dashboard',
                  'hover:!bg-sidebar-border': api.store.dev.mainView !== 'dashboard'
                }"
                tooltip="Analyze Data"
                @click="api.store.dev.mainView = 'dashboard'"
              >
                <i-ix-analyze class="!size-5" />
              </SidebarMenuButton>
            </SidebarMenuItem>
            -->

            <!-- Recruit 
            <SidebarMenuItem>
              <SidebarMenuButton
                class="px-[0.05rem] group-data-[collapsible=icon]:!p-1.5 my-1"
                tooltip="Recruit Participants"
                :isActive="api.store.dev.mainView === 'recruit'"
                @click="api.store.dev.mainView = 'recruit'"
              >
                <i-bxs-megaphone class="!size-5" :class="{ 'text-chart-1': api.store.dev.mainView === 'recruit' }" />
              </SidebarMenuButton>
            </SidebarMenuItem>
            -->

            <!-- Docs -->
            <SidebarMenuItem>
              <SidebarMenuButton
                class="px-[0.05rem] group-data-[collapsible=icon]:!p-1.5 my-1"
                :class="{
                  'bg-chart-4 hover:!bg-chart-4/80': api.store.dev.mainView === 'docs',
                  'hover:!bg-sidebar-border': api.store.dev.mainView !== 'docs',
                }"
                tooltip="Documentation"
                @click="api.store.dev.mainView = 'docs'"
              >
                <i-lucide-book-marked class="!size-5" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <!-- Sidebar footer with utility buttons -->
    <SidebarFooter>
      <!-- Color mode toggle button -->
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              class="px-[0.05rem] group-data-[collapsible=icon]:!p-1.5 my-1"
              tooltip="Toggle Dark Mode"
              @click="isDarkMode = !isDarkMode"
            >
              <i-lucide-moon v-if="isDarkMode" class="!size-5" />
              <i-lucide-sun v-else class="!size-5" />
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{{ isDarkMode ? 'Switch to Light Mode (Global)' : 'Switch to Dark Mode (Global)' }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <!-- Developer configuration popover -->
      <Popover>
        <PopoverTrigger>
          <SidebarMenuButton
            class="px-[0.05rem] group-data-[collapsible=icon]:!p-1.5 my-1"
            asChild
            tooltip="Configuration"
          >
            <i-lucide-settings class="!size-5" />
          </SidebarMenuButton>
        </PopoverTrigger>
        <PopoverContent side="right" align="end">
          <DevConfigPanel />
        </PopoverContent>
      </Popover>
    </SidebarFooter>
  </Sidebar>
</template>

<style scoped>
/* Main button styling with light theme */
.mainbutton {
  background-color: rgb(175, 218, 236);
}

/* Main button styling with dark theme */
.dark .mainbutton {
  background-color: rgb(192, 240, 163);
  color: rgb(0, 0, 0);
}
</style>
