<script setup>
/**
 * @fileoverview Console log panel component
 * Displays application logs with filtering and search capabilities
 */

import { computed } from 'vue'
import useAPI from '@/core/composables/useAPI'
import useLog from '@/core/stores/log'

// Import shadcn/ui components
import { Input } from '@/uikit/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/uikit/components/ui/select'
import { Switch } from '@/uikit/components/ui/switch'
import { Label } from '@/uikit/components/ui/label'

/**
 * Initialize the API instance for accessing store and configuration
 */
const api = useAPI()

/**
 * Initialize the log store for accessing log history
 */
const log = useLog()

/**
 * Compute the height percentage for the log display area
 * @returns {string} Height in pixels
 */
const height_pct = computed(() => `${api.store.dev.consoleBarHeight - 55}px`)

/**
 * Filter log messages based on search text and log type
 * @param {Object} msg - Log message object
 * @param {string} msg.message - Log message text
 * @param {string} msg.type - Log type (debug, warn, error, etc.)
 * @returns {boolean} Whether the message should be displayed
 */
function filter_log(msg) {
  const search_match = msg.message.toLowerCase().includes(api.store.dev.searchParams.toLowerCase())
  let type_match = true
  switch (api.store.dev.logFilter) {
    case 'All':
      break
    case 'Debug only':
      type_match = msg.type === 'debug'
      break
    case 'Warnings and Errors only':
      type_match = msg.type === 'warn' || msg.type === 'error'
      break
    case 'Warnings only':
      type_match = msg.type === 'warn'
      break
    case 'Errors only':
      type_match = msg.type === 'error'
      break
  }
  return search_match && type_match
}

/**
 * Get the background CSS class for a log message based on its type
 * @param {Object} msg - Log message object
 * @param {string} msg.type - Log type
 * @returns {string} CSS class name for background styling
 */
function getBgClass(msg) {
  switch (msg.type) {
    case 'log':
      return 'bg-background'
    case 'warn':
      return 'bg-yellow-100'
    case 'error':
      return 'bg-red-100'
    case 'debug':
      return 'bg-muted text-muted-foreground'
    case 'success':
      return 'bg-green-100'
    default:
      return 'bg-background'
  }
}
</script>

<template>
  <!-- Console log panel with controls and log display -->
  <div class="h-full p-0 m-0 overflow-hidden">
    <!-- Control bar with filters and search -->
    <div class="bg-muted border-b border-t border-dev-lines px-3 py-2 font-mono">
      <div class="flex items-center justify-end gap-4 text-xs">
        <!-- Since last view toggle -->
        <div class="flex items-center gap-2">
          <Label class="text-xs font-semibold">Since last view:</Label>
          <Switch v-model="api.store.dev.lastViewLimit" size="sm" />
        </div>

        <!-- Search input -->
        <div class="flex items-center gap-2">
          <Label class="text-xs font-semibold">Search:</Label>
          <Input v-model="api.store.dev.searchParams" placeholder="Search..." class="h-6 w-24 text-xs" />
        </div>

        <!-- Log type filter -->
        <div class="flex items-center gap-2">
          <Label class="text-xs font-semibold">Filter:</Label>
          <Select v-model="api.store.dev.logFilter">
            <SelectTrigger class="h-6 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Current page only">Current page only</SelectItem>
              <SelectItem value="Debug only">Debug only</SelectItem>
              <SelectItem value="Warnings and Errors only">Warnings and Errors only</SelectItem>
              <SelectItem value="Warnings only">Warnings only</SelectItem>
              <SelectItem value="Errors only">Errors only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Notification filter -->
        <div class="flex items-center gap-2">
          <Label class="text-xs font-semibold">Notifications:</Label>
          <Select v-model="api.store.dev.notificationFilter">
            <SelectTrigger class="h-6 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="None">None</SelectItem>
              <SelectItem value="Warnings and Errors">Warnings and Errors</SelectItem>
              <SelectItem value="Warnings only">Warnings only</SelectItem>
              <SelectItem value="Errors only">Errors only</SelectItem>
              <SelectItem value="Success only">Success only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <!-- Log display area with scrollable content -->
    <div
      class="w-full overflow-hidden overflow-y-scroll flex flex-col-reverse box-border"
      :style="{ height: height_pct }"
    >
      <div class="w-full min-w-0">
        <!-- Log messages list - filtered by last view setting -->
        <ul v-if="api.store.dev.lastViewLimit" class="w-full min-w-0">
          <template v-for="msg in log.page_history">
            <li
              v-if="filter_log(msg)"
              :class="[
                getBgClass(msg),
                'text-xs font-mono p-2 pr-0 border-b border-border whitespace-pre-wrap break-words break-all min-w-0 w-full',
              ]"
            >
              <div class="flex items-start gap-1 min-w-0">
                <!-- Icon indicator based on message content -->
                <div class="flex-shrink-0 mt-0.5">
                  <i-fa6-solid-code-branch v-if="msg.message.includes('ROUTER GUARD')" />
                  <i-fa6-solid-database v-else-if="msg.message.includes('SMILESTORE')" />
                  <i-fa6-solid-gear v-else-if="msg.message.includes('DEV MODE')" />
                  <i-fa6-solid-clock v-else-if="msg.message.includes('TIMELINE STEPPER')" />
                  <i-fa6-regular-clock v-else-if="msg.message.includes('TRIAL STEPPER')" />
                  <img src="/src/assets/dev/firebase-bw.svg" width="15" v-else-if="msg.message.includes('FIRESTORE')" />
                  <i-fa6-solid-angle-right v-else />
                </div>
                <!-- Message content -->
                <div class="min-w-0 flex-1">
                  <div class="font-semibold break-words break-all">{{ msg.time }} {{ msg.message }}</div>
                  <div class="break-words break-all text-xs opacity-75">{{ msg.trace }}</div>
                </div>
              </div>
            </li>
          </template>
        </ul>
        <!-- Log messages list - full history -->
        <ul v-else class="w-full min-w-0">
          <template v-for="msg in log.history">
            <li
              v-if="filter_log(msg)"
              :class="[
                getBgClass(msg),
                'text-xs font-mono p-2 pr-0 border-b border-border whitespace-pre-wrap break-words break-all min-w-0 w-full',
              ]"
            >
              <div class="flex items-start gap-1 min-w-0">
                <!-- Icon indicator based on message content -->
                <div class="flex-shrink-0 mt-0.5">
                  <i-fa6-solid-code-branch v-if="msg.message.includes('ROUTER GUARD')" />
                  <i-fa6-solid-database v-else-if="msg.message.includes('SMILESTORE')" />
                  <i-fa6-solid-gear v-else-if="msg.message.includes('DEV MODE')" />
                  <i-fa6-solid-clock v-else-if="msg.message.includes('TIMELINE STEPPER')" />
                  <i-fa6-regular-clock v-else-if="msg.message.includes('TRIAL STEPPER')" />
                  <img src="/src/assets/dev/firebase-bw.svg" width="15" v-else-if="msg.message.includes('FIRESTORE')" />
                  <i-fa6-solid-angle-right v-else />
                </div>
                <!-- Message content -->
                <div class="min-w-0 flex-1">
                  <div class="font-semibold break-words break-all">{{ msg.time }} {{ msg.message }}</div>
                  <div class="break-words break-all text-xs opacity-75">{{ msg.trace }}</div>
                </div>
              </div>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar styling for better UX */
.overflow-y-scroll::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-scroll::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
  border-radius: 3px;
}

.overflow-y-scroll::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 3px;
}

.overflow-y-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

/* Theme-aware background colors for log messages */
.bg-background {
  background-color: var(--background);
}

.bg-muted {
  background-color: var(--muted);
}

.text-muted-foreground {
  color: var(--muted-foreground);
}

.border-border {
  border-color: var(--border);
}

/* Keep semantic colors for log types but make them theme-aware */
.bg-yellow-100 {
  background-color: var(--log-yellow);
}

.bg-red-100 {
  background-color: var(--log-red);
}

.bg-green-100 {
  background-color: var(--log-green);
}
</style>
