<script setup>
import { Popover, PopoverContent, PopoverTrigger } from '@/uikit/components/ui/popover'
import { Button } from '@/uikit/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'
import ConsoleDatabaseBrowsePanel from '@/dev/developer_mode/ConsoleDatabaseBrowsePanel.vue'
import ConsoleLogPanel from '@/dev/developer_mode/ConsoleLogPanel.vue'
import ConsoleConfigPanel from '@/dev/developer_mode/ConsoleConfigPanel.vue'
import useAPI from '@/core/composables/useAPI'
const api = useAPI()
</script>

<template>
  <div class="w-full h-full flex border-t border-border overflow-hidden">
    <!-- Left sidebar - 36px wide -->
    <div
      class="w-9 h-full bg-muted border-dev-lines border-r flex flex-col items-center justify-between pt-1 pb-1 flex-shrink-0"
    >
      <!-- Top section with tab buttons -->
      <div class="flex flex-col items-center">
        <!-- Magnifying glass button - Browse tab -->
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                class="w-8 h-8 mb-2 mt-1"
                :class="{
                  'bg-chart-4 hover:!bg-chart-4/80': api.store.dev.consoleBarTab === 'browse',
                  'hover:!bg-sidebar-border': api.store.dev.consoleBarTab !== 'browse',
                }"
                @click="api.store.dev.consoleBarTab = 'browse'"
              >
                <i-tdesign-data-base-filled />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Data Explorer</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <!-- Book button - Log tab -->
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                class="w-8 h-8 mb-2"
                :class="{
                  'bg-chart-4 hover:!bg-chart-4/80': api.store.dev.consoleBarTab === 'log',
                  'hover:!bg-sidebar-border': api.store.dev.consoleBarTab !== 'log',
                }"
                @click="api.store.dev.consoleBarTab = 'log'"
              >
                <i-mdi-console-line class="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Narrative Log</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <!-- Config gear button - Config tab -->
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                class="w-8 h-8 mb-1"
                :class="{
                  'bg-chart-4 hover:!bg-chart-4/80': api.store.dev.consoleBarTab === 'config',
                  'hover:!bg-sidebar-border': api.store.dev.consoleBarTab !== 'config',
                }"
                @click="api.store.dev.consoleBarTab = 'config'"
              >
                <i-fa6-solid-gear class="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Configuration</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <!-- Hide button - anchored to bottom -->
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              class="w-8 h-8 hover:!bg-sidebar-border"
              @click="api.store.dev.showConsoleBar = false"
            >
              <i-uil-down-arrow class="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Hide Console</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>

    <!-- Right column - remaining width -->
    <div class="flex-1 h-full flex flex-col min-w-0 overflow-hidden">
      <!-- Panel content -->
      <div class="flex-1 overflow-hidden">
        <ConsoleDatabaseBrowsePanel v-if="api.store.dev.consoleBarTab === 'browse'" />
        <ConsoleLogPanel v-if="api.store.dev.consoleBarTab === 'log'" />
        <ConsoleConfigPanel v-if="api.store.dev.consoleBarTab === 'config'" />
      </div>
    </div>
  </div>
</template>
