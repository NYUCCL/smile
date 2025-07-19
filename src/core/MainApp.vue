<script setup>
/**
 * @fileoverview Main application component that handles core functionality and layout
 */

/**
 * Import Vue composition API functions and built-in components
 * @requires ref Vue ref for reactive references
 * @requires computed Vue computed for derived state
 * @requires watch Vue watch for reactive effects
 * @requires onMounted Vue lifecycle hook for mounted phase
 * @requires onUnmounted Vue lifecycle hook for cleanup
 */
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

/**
 * Import built-in view components
 * @requires WindowSizerView Component for handling window sizing
 * @requires StatusBar Component for displaying status information
 */
import WindowSizerView from '@/builtins/windowSizer/WindowSizerView.vue'
import StatusBar from '@/builtins/statusBar/StatusBar.vue'

/**
 * Import and initialize SMILE API
 * @requires useAPI SMILE API composable
 */
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

/**
 * Import color mode composable
 * @requires useSmileColorMode Composable for managing color theme
 */
import { useSmileColorMode } from '@/core/composables/useColorMode'

/**
 * Configure color mode scope based on application mode
 * Uses global scope for production/presentation, experiment scope for development
 * @type {string}
 */
const colorModeScope = api.config.mode === 'production' || api.config.mode === 'presentation' ? 'global' : 'experiment'

/**
 * Initialize color mode state and control
 * @type {Object}
 * @property {import('vue').Ref<string>} systemColorMode Current system color mode
 * @property {import('vue').Ref<string>} colorModeControl Color mode control value
 */
const { state: systemColorMode, mode: colorModeControl } = useSmileColorMode(colorModeScope)

// In presentation mode, prioritize the color mode control over API config
// In other modes, sync API config to color mode control
if (api.config.mode !== 'presentation') {
  // Watch for changes to API config and sync with color mode control (development/production modes)
  watch(
    () => api.config.colorMode,
    (newMode) => {
      if (newMode !== 'system' && newMode !== 'auto') {
        // Explicitly set mode when not using system
        colorModeControl.value = newMode
      } else {
        // Use auto for system preference
        colorModeControl.value = 'auto'
      }
    },
    { immediate: true }
  )
}

/**
 * Component props for device dimensions
 * @typedef {Object} Props
 * @property {number} [deviceWidth] - Override for device width (optional)
 * @property {number} [deviceHeight] - Override for device height (optional)
 */
const props = defineProps({
  deviceWidth: {
    type: Number,
    default: undefined,
  },
  deviceHeight: {
    type: Number,
    default: undefined,
  },
})

/**
 * Initialize global store
 * @requires useSmileStore Store composable
 * @constant {Object} smilestore - Global state store instance
 */
import useSmileStore from '@/core/stores/smilestore'
const smilestore = useSmileStore()

/**
 * Creates a snapshot of the current smilestore data state and subscribes to changes
 *
 * Tracks changes to smilestore.data by:
 * 1. Taking an initial snapshot of the data state
 * 2. Subscribing to store mutations
 * 3. Comparing new state with snapshot for changes
 * 4. Logging any detected changes
 * 5. Updating the snapshot
 *
 * @type {Object} snapshot - Copy of current smilestore data state
 * @listens smilestore.$subscribe - Subscribes to store mutations
 * @fires api.log.log - Logs detected changes to store data
 * @mutates smilestore.browserEphemeral.dbChanges - Sets flag when changes detected
 */
var snapshot = { ...smilestore.$state.data }
smilestore.$subscribe((mutation, newstate) => {
  Object.keys(newstate.data).forEach((key) => {
    if (snapshot[key] !== newstate.data[key]) {
      // test if newstate.data[key] is an Object
      let oldv = snapshot[key]
      let newv = newstate.data[key]
      if (typeof newstate.data[key] === 'object') {
        oldv = JSON.stringify(snapshot[key])
        newv = JSON.stringify(newstate.data[key])
      }

      api.log.log(`SMILESTORE: smilestore.data value changed for ${key}: from ${oldv} to ${newv}`)
      smilestore.browserEphemeral.dbChanges = true
    }
  })
  snapshot = { ...newstate.data }
})

/**
 * Reactive reference to current window width
 * @type {import('vue').Ref<number>}
 */
const windowWidth = ref(window.innerWidth)

/**
 * Reactive reference to current window height
 * @type {import('vue').Ref<number>}
 */
const windowHeight = ref(window.innerHeight)

/**
 * Updates the reactive window dimension references with current window size
 *
 * Sets windowWidth and windowHeight to the current window.innerWidth and window.innerHeight
 * values respectively.
 */
const updateWindowDimensions = () => {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
}

/**
 * Sets up window event listeners when component is mounted
 *
 * Adds event listeners for:
 * - resize: Records window dimensions
 * - focus: Records when window gains focus
 * - blur: Records when window loses focus
 *
 * All events are logged via api.recordWindowEvent()
 * All listeners use passive mode for better performance
 */
onMounted(() => {
  api.log.log('MainApp.vue initialized')

  window.addEventListener(
    'resize',
    (event) => {
      updateWindowDimensions()
      api.recordWindowEvent('resize', { width: window.innerWidth, height: window.innerHeight })
    },
    { passive: true }
  )

  window.addEventListener(
    'focus',
    (event) => {
      api.recordWindowEvent('focus')
    },
    { passive: true }
  )

  window.addEventListener(
    'blur',
    (event) => {
      api.recordWindowEvent('blur')
    },
    { passive: true }
  )
})

/**
 * Cleanup function called when component is unmounted
 *
 * Removes the resize event listener to prevent memory leaks
 */
onUnmounted(() => {
  window.removeEventListener('resize', updateWindowDimensions)
})

/**
 * Computed property that determines the effective device width
 *
 * Uses the deviceWidth prop if provided, otherwise falls back to the current window width.
 * This allows for testing with specific device dimensions or using actual window size.
 *
 * @returns {number} The effective device width in pixels
 */
const effectiveDeviceWidth = computed(() => {
  return props.deviceWidth !== undefined ? props.deviceWidth : windowWidth.value
})

/**
 * Computed property that determines the effective device height
 *
 * Uses the deviceHeight prop if provided, otherwise falls back to the current window height.
 * This allows for testing with specific device dimensions or using actual window size.
 *
 * @returns {number} The effective device height in pixels
 */
const effectiveDeviceHeight = computed(() => {
  return props.deviceHeight !== undefined ? props.deviceHeight : windowHeight.value
})

/**
 * Computed property that determines whether to show the status bar
 *
 * @returns {boolean} True if status bar should be shown, false otherwise
 * - Returns false if current route is 'data' or 'recruit'
 * - Returns false if app is in presentation mode
 * - Returns true otherwise
 */
const showStatusBar = computed(() => {
  return api.currentRouteName() !== 'recruit' && api.currentRouteName() !== 'presentation_home'
})

/**
 * Computed property that checks if the device is too small for the application
 *
 * Calls api.isBrowserTooSmall() with the effective device dimensions and stores
 * the result in the browser ephemeral state. Returns false if there's an error
 * during the check.
 *
 * @returns {boolean} True if device is too small, false otherwise
 * @throws {Error} May throw if api.isBrowserTooSmall() fails
 */
const deviceTooSmall = computed(() => {
  try {
    const val = api.isBrowserTooSmall(effectiveDeviceWidth.value, effectiveDeviceHeight.value)
    api.store.browserEphemeral.tooSmall = val
    return val
  } catch (error) {
    console.warn('Error in deviceTooSmall computed:', error)
    return false
  }
})
</script>

<template>
  <div
    id="main-app"
    class="@container bg-background text-foreground"
    :data-experiment-scope="api.config.mode !== 'presentation' ? '' : null"
    ref="containerDiv"
  >
    <StatusBar v-if="showStatusBar" />
    <WindowSizerView triggered="true" v-if="deviceTooSmall"></WindowSizerView>
    <router-view v-else />
  </div>
</template>
