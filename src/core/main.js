/**
 * @fileoverview Main entry point for the SMILE application that imports core dependencies
 */

/**
 * Core imports for the SMILE application including:
 * - Vue and Vue plugins (Router, Pinia, Google Analytics)
 * - Application configuration (timeline)
 */
import { useRouter, addGuards } from '@/core/router'
import { pinia } from '@/core/stores/createPinia'
import timeline from '@/user/design'
import VueGtag from 'vue-gtag'
import { createApp } from 'vue'
import '@/core/main.css'

/// IMPORTANT: This line is automatically replaced with SmileApp.vue in the vite strip-devtool.js plugin for developer mode
// this is automatically replaced with SmileApp.vue in the vite strip-devtool.js plugin for developer mode
// or PresentationModeApp.vue in the presentation mode
import App from '@/core/MainApp.vue'
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

/*
 * Initialize the Vue application and router
 * @constant {Vue} app - The main Vue application instance
 * @constant {Router} router - The Vue router instance configured with timeline
 * @description Creates the Vue app and configures the router with:
 * - Timeline configuration from user design
 * - Navigation guards for route protection
 * - Full application routing functionality
 */

const app = createApp(App) // create the app
const router = useRouter(timeline) // use the router
addGuards(router) // add guards to the router

/**
 * Register and configure Vue plugins and global components
 * @description Sets up the Vue application with required plugins:
 * - Pinia for state management
 * - Vue Router for navigation
 * - Vue-Gtag for Google Analytics
 *
 * Also registers global components and mounts the app
 */

// Register core plugins
app.use(pinia) // State management
app.use(router) // Routing

// Configure and register Google Analytics
app.use(
  VueGtag,
  {
    disableScriptLoad: import.meta.env.MODE !== 'production', // Disable in dev mode
    pageTrackerExcludedRoutes: ['recruit'], // Exclude recruit route
    config: { id: import.meta.env.VITE_GOOGLE_ANALYTICS },
  },
  router
)

// Mount the application
app.mount('#app')
