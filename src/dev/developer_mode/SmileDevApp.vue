<script setup>
/**
 * @fileoverview Main SmileApp component that handles the core application layout and mode-specific components
 */

import { ref, computed, onMounted } from 'vue'

/**
 * Import toast notification components and styles
 * @requires Toaster Toast notification component from sonner UI library
 * @requires vue-sonner/style.css Required styles for vue-sonner v2 toast notifications
 */
import { Toaster } from '@/uikit/components/ui/sonner'
import 'vue-sonner/style.css' // vue-sonner v2 requires this import

import SmileDevAppMenu from '@/dev/developer_mode/menu/SmileDevAppMenu.vue'
import { SidebarInset, SidebarProvider } from '@/uikit/components/ui/sidebar'

/**
 * Developer mode components for debugging and development tools
 * @requires SmileDevNavBar Navigation bar component with developer controls and status
 * @requires SmileDevConsole Console component for logs, database browsing and configuration
 * @requires SmileDevSideBar Sidebar component with state tree, randomization and study info
 */
import DevNavBar from '@/dev/developer_mode/navbar/SmileDevNavBar.vue'
import DevConsole from '@/dev/developer_mode/console/SmileDevConsole.vue'
import DevSideBar from '@/dev/developer_mode/sidebar/SmileDevSideBar.vue'

/**
 * Built-in experiment components
 * @requires ResponsiveDeviceContainer Responsive device container component
 */
import ResponsiveDeviceContainer from '@/dev/developer_mode/ResponsiveDeviceContainer.vue'

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
 * Reactive reference for dashboard iframe URL
 * @type {import('vue').Ref<string>}
 */
const dashboardUrl = ref('')

/**
 * Reactive reference for dashboard iframe element
 * @type {import('vue').Ref<HTMLIFrameElement|null>}
 */
const dashboardIframe = ref(null)

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

/**
 * Initialize dashboard URL from localStorage or default
 * Retrieves the saved dashboard URL from localStorage or falls back to the default
 * public URL for the dashboard.html file
 */
function initializeDashboardUrl() {
  const savedUrl = localStorage.getItem('smile-dashboard-url')
  if (savedUrl) {
    dashboardUrl.value = savedUrl
  } else {
    dashboardUrl.value = api.getPublicUrl('dashboard.html')
  }
}

/**
 * Save dashboard URL to localStorage
 * Persists the provided URL to localStorage and updates the reactive dashboardUrl ref
 *
 * @param {string} url The URL to save and set as the current dashboard URL
 */
function saveDashboardUrl(url) {
  localStorage.setItem('smile-dashboard-url', url)
  dashboardUrl.value = url
}

/**
 * Monitor iframe URL changes and persist them
 * Checks if the iframe content is accessible and monitors for URL changes,
 * saving any changes to localStorage. Handles cross-origin restrictions gracefully.
 */
function monitorIframeUrl() {
  if (!dashboardIframe.value) return

  try {
    // Check if iframe content is accessible (same-origin)
    const iframeDoc = dashboardIframe.value.contentDocument || dashboardIframe.value.contentWindow?.document
    if (iframeDoc) {
      const currentUrl = dashboardIframe.value.contentWindow.location.href
      if (currentUrl !== dashboardUrl.value) {
        saveDashboardUrl(currentUrl)
      }
    }
  } catch (error) {
    // Cross-origin restriction, can't access iframe content
    console.log('Cannot access iframe content (cross-origin)')
  }
}

/**
 * Set up iframe monitoring when iframe loads
 * Establishes periodic monitoring of iframe URL changes and sets up focus event listeners
 * to track navigation within the dashboard iframe
 */
function onIframeLoad() {
  if (!dashboardIframe.value) return

  // Monitor URL changes periodically
  const interval = setInterval(() => {
    if (api.store.dev.mainView !== 'dashboard') {
      clearInterval(interval)
      return
    }
    monitorIframeUrl()
  }, 1000)

  // Also monitor on focus events
  if (dashboardIframe.value.contentWindow) {
    dashboardIframe.value.contentWindow.addEventListener('focus', monitorIframeUrl)
  }
}

/**
 * Initialize dashboard URL when component is mounted
 * Calls initializeDashboardUrl() to set up the initial dashboard URL
 * from localStorage or default value
 */
onMounted(() => {
  initializeDashboardUrl()
})
</script>

<template>
  <!-- Toast notification system -->
  <Toaster closeButton position="top-left" :rich-colors="true" class="custom-toaster" />

  <!-- Main sidebar provider for developer tools -->
  <SidebarProvider
    :default-open="false"
    :style="{
      '--sidebar-width': '48px',
    }"
  >
    <!-- Developer app menu sidebar -->
    <SmileDevAppMenu />

    <!-- Main content area -->
    <SidebarInset>
      <!-- Main app container for developer mode -->
      <div class="app-container">
        <!-- Analyze Mode - Clean full-screen dashboard -->
        <div v-if="api.store.dev.mainView === 'dashboard'" class="analyze-container">
          <iframe
            ref="dashboardIframe"
            :src="dashboardUrl"
            class="dashboard-iframe"
            frameborder="0"
            title="Dashboard"
            @load="onIframeLoad"
          ></iframe>
        </div>

        <!-- Recruit Mode - Clean full-screen recruit page -->
        <div v-else-if="api.store.dev.mainView === 'recruit'" class="recruit-container">
          <iframe
            :src="api.getPublicUrl('recruit.html')"
            class="recruit-iframe"
            frameborder="0"
            title="Recruit"
          ></iframe>
        </div>

        <!-- Docs Mode - Clean full-screen documentation -->
        <div v-else-if="api.store.dev.mainView === 'docs'" class="docs-container">
          <iframe
            src="https://smile.gureckislab.org"
            class="docs-iframe"
            frameborder="0"
            title="Documentation"
          ></iframe>
        </div>

        <!-- Developer Mode - Full interface with toolbar, sidebar, console -->
        <template v-else>
          <!-- Top toolbar with navigation controls -->
          <div class="toolbar">
            <DevNavBar />
          </div>

          <!-- Middle row - content and sidebar -->
          <div class="content-wrapper">
            <!-- Main content area with console -->
            <div class="content-and-console">
              <!-- Main content - scrollable experiment container -->
              <div class="main-content bg-background text-foreground">
                <!-- Loading state -->
                <div v-if="isLoading" class="loading-container">
                  <div class="loading-spinner"></div>
                  <p>Loading...</p>
                </div>
                <!-- Experiment content -->
                <template v-else>
                  <ResponsiveDeviceContainer />
                </template>
              </div>

              <!-- Bottom console - can be toggled -->
              <Transition name="console-slide">
                <div v-if="api.config.mode == 'development' && api.store.dev.showConsoleBar" class="console">
                  <DevConsole />
                </div>
              </Transition>
            </div>

            <!-- Sidebar - can be toggled, transitions in/out -->
            <Transition name="sidebar-slide">
              <div v-if="api.config.mode == 'development' && api.store.dev.showSideBar" class="sidebar">
                <DevSideBar />
              </div>
            </Transition>
          </div>
        </template>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<style>
/* Toast notification positioning */
.custom-toaster {
  --toast-offset-x: 60px;
  --toast-offset-y: 50px;
}

.custom-toaster {
  top: var(--toast-offset-y) !important;
  left: var(--toast-offset-x) !important;
}
</style>

<style scoped>
/* Main app container */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

/* Analyze mode containers */
.analyze-container {
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.recruit-container {
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.docs-container {
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

/* Iframe styling */
.dashboard-iframe {
  width: 100%;
  height: 100%;
  border: none;
  overflow: hidden;
}

.recruit-iframe {
  width: 100%;
  height: 100%;
  border: none;
  overflow: hidden;
}

.docs-iframe {
  width: 100%;
  height: 100%;
  border: none;
  overflow: hidden;
}

/* Developer mode layout */
.toolbar {
  margin-top: auto;
  margin-bottom: auto;
  height: 36px;
  width: full; /* Account for typical scrollbar width */
  background-color: var(--dev-bar-bg);
}

.content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
  width: 100%;
}

.content-and-console {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: auto;
  min-height: 0;
  min-width: 0;
}

.sidebar {
  flex: 0 0 300px;
  height: 100%;
  overflow-y: auto;
  border-left: 1px solid var(--border);
  background-color: var(--dev-bg);
}

.console {
  height: v-bind(height_pct);
  width: 100%;
  background-color: #adadad;
  overflow: hidden;
  overflow-x: hidden;
  min-width: 0;
  max-width: 100%;
}

/* Transition effects */
.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: all 0.3s ease-in-out;
}

.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  flex: 0 0 0px;
  width: 0px;
  overflow: hidden;
}

.console-slide-enter-active,
.console-slide-leave-active {
  transition: height 0.3s ease-in-out;
}

.console-slide-enter-from,
.console-slide-leave-to {
  height: 0;
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
