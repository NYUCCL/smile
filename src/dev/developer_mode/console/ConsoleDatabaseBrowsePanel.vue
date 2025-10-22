<script setup>
/**
 * @fileoverview Database browsing panel component
 * Provides a hierarchical navigation interface for exploring data structures
 */

import { reactive, computed, onMounted } from 'vue'
import DatabaseList from '@/dev/developer_mode/console/DatabaseList.vue'
import useAPI from '@/core/composables/useAPI'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@/uikit/components/ui/breadcrumb'

/**
 * Initialize the API instance for accessing store and data
 */
const api = useAPI()

/**
 * Reactive state for managing the navigation path through the data structure
 * @type {import('vue').Reactive<{path: Array<string|null>}>}
 */
const browse_panels = reactive({ path: ['/', null, null] })

/**
 * Initialize the browse panels path from stored state on component mount
 */
onMounted(() => {
  if (api.store.dev.dataPath !== null) {
    browse_panels.path = JSON.parse(api.store.dev.dataPath) // hydrate from api.store
  }
})

/**
 * Save the current navigation path to the store for persistence
 */
function save_path() {
  api.store.dev.dataPath = JSON.stringify(browse_panels.path)
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
</script>

<template>
  <!-- Database browsing panel with breadcrumb navigation and three-panel layout -->
  <div class="h-full p-0 m-0 flex flex-col">
    <!-- Breadcrumb navigation bar -->
    <Breadcrumb class="bg-muted border-b border-t border-dev-lines px-3 py-2 font-mono">
      <BreadcrumbList>
        <template v-for="(option, index) in browse_panels.path" :key="index">
          <template v-if="option !== null">
            <BreadcrumbItem>
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

    <!-- Three-panel layout for hierarchical data navigation -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Left panel - 25% width -->
      <div class="w-1/4 h-full border-r border-dev-lines p-0 m-0">
        <!-- two from end -->
        <DatabaseList
          :data="panel_path(2)"
          :selected="browse_panels.path[browse_panels.path.length - 2]"
          @selected="panel1_select"
        ></DatabaseList>
      </div>
      <!-- Middle panel - 25% width -->
      <div class="w-1/4 h-full border-r border-dev-lines p-0 m-0 bg-gray-50">
        <!-- one from end -->
        <DatabaseList
          :data="panel_path(1)"
          :selected="browse_panels.path[browse_panels.path.length - 1]"
          @selected="panel2_select"
        ></DatabaseList>
      </div>
      <!-- Right panel - 50% width -->
      <div class="w-1/2 h-full p-0 m-0 bg-gray-50">
        <!-- zero from end -->
        <DatabaseList :data="panel_path(0)" @selected="panel3_select"></DatabaseList>
      </div>
    </div>
  </div>
</template>
