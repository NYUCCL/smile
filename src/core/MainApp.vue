<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import WindowSizerView from '@/builtins/window_sizer/WindowSizerView.vue'
import StatusBar from '@/builtins/navbars/StatusBar.vue'

import useAPI from '@/core/composables/useAPI'
const api = useAPI()

import { useSmileColorMode } from '@/core/composables/useColorMode'

// Use global scope for production and presentation modes (applies to html/body), experiment scope for development
const colorModeScope = api.config.mode === 'production' || api.config.mode === 'presentation' ? 'global' : 'experiment'
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

// The effective color mode logic depends on the mode
const effectiveColorMode = computed(() => {
  if (api.config.mode === 'presentation') {
    // In presentation mode, use the color mode control state (set by DarkModeButton)
    return systemColorMode.value
  } else {
    // In other modes, respect the API config setting
    if (api.config.colorMode === 'system' || api.config.colorMode === 'auto') {
      return systemColorMode.value
    } else {
      return api.config.colorMode
    }
  }
})

// Define props
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

// Reactive window dimensions
const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)

// Update window dimensions on resize
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

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowDimensions)
})

// Computed properties that use props when provided, otherwise fall back to window dimensions
const effectiveDeviceWidth = computed(() => {
  return props.deviceWidth !== undefined ? props.deviceWidth : windowWidth.value
})

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

// Pure computed property without side effects
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
