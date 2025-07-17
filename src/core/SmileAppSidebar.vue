<script setup>
import { h, ref, computed } from 'vue'
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

import { Popover, PopoverContent, PopoverTrigger } from '@/uikit/components/ui/popover'
import ConfigDevPanel from '@/dev/developer_mode/ConfigDevPanel.vue'
import { Sun, Moon } from 'lucide-vue-next'
import { useSmileColorMode } from '@/core/composables/useColorMode'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'

const props = defineProps({
  side: { type: String, required: false },
  variant: { type: String, required: false },
  collapsible: { type: String, required: false, default: 'icon' },
  class: { type: null, required: false },
})

import useAPI from '@/core/composables/useAPI'
const api = useAPI()

// Global color mode for the entire application (html element)
const { state: globalColorMode, setLight, setDark } = useSmileColorMode('global')

// Computed property to bind to the switch
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
  <!-- This is the first sidebar -->
  <!-- We disable collapsible and adjust width to icon. -->
  <!-- This will make the sidebar appear as icons. -->
  <Sidebar class="w-[calc(var(--sidebar-width-icon)+1px)]! border-r" v-bind="props">
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
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent class="px-1.5 md:px-0">
          <SidebarMenu>
            <!-- Developer Mode -->
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
    <SidebarFooter>
      <!-- color mode toggle -->
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              class="px-[0.05rem] group-data-[collapsible=icon]:!p-1.5 my-1"
              tooltip="Toggle Dark Mode"
              @click="isDarkMode = !isDarkMode"
            >
              <Sun v-if="isDarkMode" class="!size-5" />
              <Moon v-else class="!size-5" />
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{{ isDarkMode ? 'Switch to Light Mode (Global)' : 'Switch to Dark Mode (Global)' }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <!-- Developer Mode Configuration -->
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
          <ConfigDevPanel />
        </PopoverContent>
      </Popover>
    </SidebarFooter>
  </Sidebar>
</template>

<style scoped>
.mainbutton {
  background-color: rgb(175, 218, 236);
}
.dark .mainbutton {
  background-color: rgb(192, 240, 163);
  color: rgb(0, 0, 0);
}
</style>
