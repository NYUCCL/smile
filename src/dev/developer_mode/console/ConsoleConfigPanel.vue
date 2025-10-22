<script setup>
/**
 * @fileoverview Configuration panel component
 * Provides a hierarchical navigation interface for exploring configuration settings
 */

import { reactive, computed, onMounted } from 'vue'
import ConfigList from '@/dev/developer_mode/console/ConfigList.vue'
import useAPI from '@/core/composables/useAPI'

// shadcn/ui components
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@/uikit/components/ui/breadcrumb'
import { Button } from '@/uikit/components/ui/button'

/**
 * Initialize the API instance for accessing store and configuration
 */
const api = useAPI()

/**
 * Reactive state for managing the navigation path through the configuration structure
 * @type {import('vue').Reactive<{path: Array<string|null>}>}
 */
const browse_panels = reactive({ path: ['/', null, null] })

/**
 * Initialize the browse panels path from stored state on component mount
 */
onMounted(() => {
  if (api.store.dev.configPath !== null) {
    browse_panels.path = JSON.parse(api.store.dev.configPath) // hydrate from api.store
  }
})

/**
 * Save the current navigation path to the store for persistence
 */
function save_path() {
  api.store.dev.configPath = JSON.stringify(browse_panels.path)
}

/**
 * Compute the number of active panels in the navigation path
 * @returns {number} Count of non-null path segments
 */
const n_active_panels = computed(() => {
  var count = 0
  for (var i = 0; i < browse_panels.path.length; i++) {
    if (browse_panels.path[i] !== null) {
      count++
    }
  }
  return count
})

/**
 * Generate a path string for a specific panel based on cutoff index
 * @param {number} cutoff - Number of segments to exclude from the end
 * @returns {string|null} Path string or null if invalid
 */
function panel_path(cutoff) {
  var path = ''
  if (browse_panels.path[browse_panels.path.length - cutoff - 1] == null) {
    return null
  } else {
    for (var i = 0; i < browse_panels.path.length - cutoff; i++) {
      path += String(browse_panels.path[i])
      if (i < browse_panels.path.length - cutoff - 1) {
        path += '.'
      }
    }
    return path
  }
}

/**
 * Handle selection in the first panel (leftmost)
 * @param {string} option - Selected option key
 */
function panel1_select(option) {
  browse_panels.path.pop()
  browse_panels.path.pop()
  browse_panels.path.push(String(option))
  if (browse_panels.path.length < 3) {
    browse_panels.path.push(null)
  }
  save_path()
}

/**
 * Handle selection in the second panel (middle)
 * @param {string} option - Selected option key
 */
function panel2_select(option) {
  browse_panels.path.pop()
  browse_panels.path.push(String(option))
  save_path()
}

/**
 * Handle selection in the third panel (rightmost)
 * @param {string} option - Selected option key
 */
function panel3_select(option) {
  browse_panels.path.push(String(option))
  save_path()
}

/**
 * Jump to a specific panel in the navigation path
 * @param {number} index - Index of the panel to jump to
 */
function panel_jump(index) {
  // for everything after index set to null
  for (var i = index + 1; i < browse_panels.path.length; i++) {
    browse_panels.path[i] = null
  }
  // trim browse_panels to length three
  browse_panels.path = browse_panels.path.slice(0, 3)
}

/**
 * Reset the developer state by clearing localStorage and reloading the page
 */
function resetDevState() {
  localStorage.removeItem(api.config.devLocalStorageKey) // delete the local store
  location.reload()
}
</script>

<template>
  <!-- Configuration panel with breadcrumb navigation and three-panel layout -->
  <div class="h-full m-0 p-0 flex flex-col">
    <!-- Breadcrumb navigation bar -->
    <Breadcrumb class="bg-muted border-b border-t border-dev-lines px-3 py-2 font-mono">
      <BreadcrumbList>
        <template v-for="(option, index) in browse_panels.path">
          <template v-if="option !== null">
            <BreadcrumbItem :key="index">
              <BreadcrumbLink as="button" @click="panel_jump(index)" class="flex items-center text-xs">
                <template v-if="option == '/'">
                  <i-fa6-solid-house />
                </template>
                <template v-else>{{ option }}</template>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator v-if="index < n_active_panels - 1" />
          </template>
        </template>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Main content area with sidebar and three-panel layout -->
    <div class="flex flex-row flex-1 overflow-hidden">
      <!-- Left sidebar with documentation link -->
      <div class="flex flex-col w-1/6 min-w-[120px] border-r border-l border-dev-lines bg-muted p-2 gap-2">
        <div class="text-xs text-left mb-2 font-mono">
          Read more about configuration options
          <a href="https://smile.gureckislab.org/configuration.html" class="text-blue-600 underline ml-1">in the docs</a
          >.
        </div>
      </div>
      <!-- Three-panel configuration browser -->
      <div class="flex-1 grid grid-cols-3 gap-0 bg-gray-50 overflow-hidden">
        <!-- Left panel -->
        <div class="border-r border-dev-lines h-full overflow-hidden">
          <ConfigList
            :data="panel_path(2)"
            :selected="browse_panels.path[browse_panels.path.length - 2]"
            @selected="panel1_select"
          />
        </div>
        <!-- Middle panel -->
        <div class="border-r border-dev-lines h-full overflow-hidden">
          <ConfigList
            :data="panel_path(1)"
            :selected="browse_panels.path[browse_panels.path.length - 1]"
            @selected="panel2_select"
          />
        </div>
        <!-- Right panel -->
        <div class="bg-gray-50 h-full overflow-hidden">
          <ConfigList :data="panel_path(0)" @selected="panel3_select" />
        </div>
      </div>
    </div>
  </div>
</template>
