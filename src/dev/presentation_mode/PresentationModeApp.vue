<script setup>
/**
 * @fileoverview Main SmileApp component that handles the core application layout and mode-specific components
 */

import { computed } from 'vue'

import PresentationNavBar from '@/dev/presentation_mode/PresentationNavBar.vue'
import MainApp from '@/core/MainApp.vue'

/**
 * Import API and notification components
 * @requires useAPI SMILE API composable
 */
import useAPI from '@/core/composables/useAPI'

/**
 * Initialize SMILE API instance
 * @constant {Object} api Global API instance
 */
const api = useAPI()

/**
 * Computed property for console bar height in pixels
 * @type {import('vue').ComputedRef<string>}
 */
const height_pct = computed(() => `${api.store.dev.consoleBarHeight}px`)

/**
 * Computed property that determines if the app is still loading
 *
 * @returns {boolean} True if the route name is not yet available, false otherwise
 */
const isLoading = computed(() => {
  return api.currentRouteName() === undefined
})
</script>
<template>
  <!-- Main app container for presentation mode -->
  <div class="app-container">
    <!-- Top toolbar with navigation -->
    <div class="toolbar">
      <PresentationNavBar />
    </div>

    <!-- Middle row - content area -->
    <div class="content-wrapper">
      <div class="content-and-console">
        <!-- Main content - scrollable -->
        <div class="main-content bg-background text-foreground">
          <!-- Loading state -->
          <div v-if="isLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading...</p>
          </div>
          <!-- Main app content -->
          <template v-else>
            <MainApp />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main app container layout */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

/* Top toolbar styling */
.toolbar {
  margin-top: auto;
  margin-bottom: auto;
  height: 36px;
  width: full; /* Account for typical scrollbar width */
  background-color: var(--dev-bar-bg);
}

/* Content wrapper layout */
.content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
  width: 100%;
}

/* Content and console container */
.content-and-console {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

/* Main content area */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: auto;
  min-height: 0;
  min-width: 0;
}

/* Loading styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
