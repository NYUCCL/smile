<script setup>
import { ref, computed } from 'vue'
import useAPI from '@/core/composables/useAPI'
import MainApp from '@/core/MainApp.vue'
import ResponsiveDeviceSelect from '@/dev/developer_mode/menu/ResponsiveDeviceSelect.vue'
import { Separator } from '@/uikit/components/ui/separator'
import { Button } from '@/uikit/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'
import { useSmileColorMode } from '@/core/composables/useColorMode'
import { useElementSize } from '@vueuse/core'

/**
 * Import shared device presets
 * @requires devicePresets Shared device presets for responsive testing
 */
import { devicePresets } from '@/dev/developer_mode/devicePresets.js'

/**
 * API instance for accessing store and configuration
 */
const api = useAPI()

/**
 * Reference to the fullscreen container element
 */
const fullScreenDiv = ref(null)

/**
 * Reactive element size tracking for fullscreen mode
 */
const { width: fullScreenWidth, height: fullScreenHeight } = useElementSize(fullScreenDiv)

/**
 * Color mode composable for experiment theme management
 */
const {
  state: experimentColorMode,
  mode: experimentColorModeRaw,
  toggle: toggleColorMode,
  system,
} = useSmileColorMode('experiment')

/**
 * Global color mode for recruit route
 */
const { state: globalColorMode } = useSmileColorMode('global')

// Initialize store values if they don't exist
if (!api.store.dev.deviceWidth || !api.store.dev.deviceHeight) {
  const initialPreset = devicePresets[api.store.dev.selectedDevice] || devicePresets.desktop1
  api.store.dev.deviceWidth = initialPreset.width
  api.store.dev.deviceHeight = initialPreset.height
}

/**
 * Computed style object for device container dimensions
 */
const containerStyle = computed(() => ({
  '--device-width': `${api.store.dev.deviceWidth}px`,
  '--device-height': `${api.store.dev.deviceHeight}px`,
}))

/**
 * Checks if current dimensions match any preset and updates selectedDevice accordingly
 */
const checkForMatchingPreset = () => {
  for (const [key, preset] of Object.entries(devicePresets)) {
    // Check both normal orientation and rotated orientation
    const matchesNormal = api.store.dev.deviceWidth === preset.width && api.store.dev.deviceHeight === preset.height
    const matchesRotated = api.store.dev.deviceWidth === preset.height && api.store.dev.deviceHeight === preset.width

    if (matchesNormal || matchesRotated) {
      api.store.dev.selectedDevice = key
      return
    }
  }
  // If no match found, keep as custom
  api.store.dev.selectedDevice = 'custom'
}

// Resize functionality state
const isResizing = ref(false)
const resizeDirection = ref('')
const startX = ref(0)
const startY = ref(0)
const startWidth = ref(0)
const startHeight = ref(0)

/**
 * Initiates resize operation
 * @param {string} direction - The resize direction ('left', 'right', 'bottom')
 * @param {MouseEvent} event - The mouse event that triggered the resize
 */
const startResize = (direction, event) => {
  isResizing.value = true
  resizeDirection.value = direction
  startX.value = event.clientX
  startY.value = event.clientY
  startWidth.value = api.store.dev.deviceWidth
  startHeight.value = api.store.dev.deviceHeight

  // Switch to custom size when starting to resize
  api.store.dev.selectedDevice = 'custom'

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  event.preventDefault()
}

/**
 * Handles mouse movement during resize operation
 * @param {MouseEvent} event - The mouse move event
 */
const handleResize = (event) => {
  if (!isResizing.value) return

  const deltaX = event.clientX - startX.value
  const deltaY = event.clientY - startY.value

  // Ensure we're in custom mode when resizing
  api.store.dev.selectedDevice = 'custom'

  if (resizeDirection.value.includes('right')) {
    api.store.dev.deviceWidth = Math.max(200, startWidth.value + deltaX)
  }
  if (resizeDirection.value.includes('left')) {
    api.store.dev.deviceWidth = Math.max(200, startWidth.value - deltaX)
  }
  if (resizeDirection.value.includes('bottom')) {
    api.store.dev.deviceHeight = Math.max(400, startHeight.value + deltaY)
  }
}

/**
 * Stops the resize operation and checks for matching presets
 */
const stopResize = () => {
  isResizing.value = false
  resizeDirection.value = ''
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)

  // Check if the final dimensions match any preset
  checkForMatchingPreset()
}

/**
 * Toggles device rotation by swapping width and height
 */
const toggleRotation = () => {
  const tempWidth = api.store.dev.deviceWidth
  api.store.dev.deviceWidth = api.store.dev.deviceHeight
  api.store.dev.deviceHeight = tempWidth
  api.store.dev.isRotated = !api.store.dev.isRotated

  // Check if the new dimensions match any preset
  checkForMatchingPreset()
}

/**
 * Toggles fullscreen mode
 */
const toggleFullscreen = () => {
  api.store.dev.isFullscreen = !api.store.dev.isFullscreen
}

/**
 * Computed property that determines whether to wrap content in ResponsiveDeviceContainer
 *
 * @returns {boolean} True if ResponsiveDeviceContainer should be used, false otherwise
 * - Returns false if current route is '/' (root route)
 * - Returns true for development mode
 */
const shouldUseResponsiveContainer = computed(() => {
  const routeName = api.currentRouteName()
  return routeName !== undefined && routeName !== 'recruit' && api.config.mode == 'development'
})

/**
 * Computed color mode for the experiment
 */
const colorMode = computed(() => {
  return experimentColorMode.value
})
</script>

<template>
  <!-- Fullscreen mode - displays just the slot content without device container -->
  <div
    v-if="api.store.dev.isFullscreen || !shouldUseResponsiveContainer || api.config.mode == 'presentation'"
    ref="fullScreenDiv"
    class="fullscreen-container bg-background text-foreground"
    :class="api.currentViewName() !== 'recruit' ? colorMode : globalColorMode"
  >
    <MainApp :deviceWidth="fullScreenWidth" :deviceHeight="fullScreenHeight" />
  </div>

  <!-- Normal device container mode with responsive controls -->
  <div v-else class="device-container-wrapper" :style="containerStyle">
    <div class="device-content-wrapper">
      <!-- Device information and control panel -->
      <div class="device-info">
        <div class="device-controls">
          <!-- Device selection dropdown -->
          <ResponsiveDeviceSelect />

          <!-- Rotation toggle button -->
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="xs" @click="toggleRotation">
                  <i-carbon-rotate-counterclockwise-filled :class="{ 'text-blue-400': api.store.dev.isRotated }" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Rotate device</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <!-- Separator between controls -->
          <Separator orientation="vertical" />

          <!-- Current device dimensions display -->
          <div class="device-dimensions">{{ api.store.dev.deviceWidth }} x {{ api.store.dev.deviceHeight }}</div>

          <!-- Color mode toggle button -->
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="xs" @click="toggleColorMode">
                  <i-lucide-moon v-if="experimentColorModeRaw === 'light'" />
                  <i-lucide-sun-moon v-else-if="experimentColorModeRaw === 'dark'" />
                  <i-lucide-sun v-else />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p v-if="experimentColorModeRaw === 'light'">Switch to Dark Mode</p>
                <p v-else-if="experimentColorModeRaw === 'dark'">Switch to System ({{ system }})</p>
                <p v-else>Switch to Light Mode</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <!-- Fullscreen toggle button -->
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="xs" @click="toggleFullscreen">
                  <i-ic-outline-fullscreen />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Fullscreen Mode</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <!-- Device container with resize handles -->
      <div
        class="device-wrapper dev-color-mode"
        :class="api.currentRouteName() !== 'recruit' ? colorMode : globalColorMode"
      >
        <!-- Main device container -->
        <div class="device-container bg-background text-foreground" ref="containerDiv">
          <MainApp :deviceWidth="api.store.dev.deviceWidth" :deviceHeight="api.store.dev.deviceHeight" />
        </div>

        <!-- Resize handles for interactive resizing -->
        <div class="resize-handle resize-handle-left" @mousedown="startResize('left', $event)"></div>
        <div class="resize-handle resize-handle-right" @mousedown="startResize('right', $event)"></div>
        <div class="resize-handle resize-handle-bottom" @mousedown="startResize('bottom', $event)"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fullscreen-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.device-container-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100%;
  max-width: 100%;
  background-image:
    linear-gradient(color-mix(in srgb, var(--border) 70%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--border) 70%, transparent) 1px, transparent 1px);
  background-size: 20px 20px;
  background-position: -1px 0px;
  overflow-y: auto;
  overflow-x: auto;
  container-type: inline-size; /* Enable container queries */
}

.device-content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center; /* Default: center everything */
  justify-content: flex-start;
  padding: 20px;
  background-color: var(--test-background);
}

/* When container is wide enough, use normal centered layout */
@container (min-width: 800px) {
  .device-content-wrapper {
    align-items: center;
    padding: 20px;
  }

  .device-wrapper {
    justify-content: center;
    margin-left: 15px;
  }
}

/* When container is too narrow, switch to left-anchored layout */
@container (max-width: 799px) {
  .device-content-wrapper {
    align-items: flex-start; /* Left-aligned */
    margin-left: 0;
  }

  .device-wrapper {
    justify-content: flex-start; /* Left align the device container */
    margin-left: 15px; /* Space for left handle */
  }

  .device-info {
    margin-left: 15px; /* Align with device-wrapper's left margin */
  }
}

.device-info {
  text-align: center;
  margin-bottom: 10px;
  font-family: monospace;
  font-size: 14px;
  background-color: var(--background);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 5px;
}

.device-controls {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
}

.device-controls > * {
  display: flex;
  align-items: center;
  gap: 16px;
}

.device-dimensions {
  font-family: monospace;
  font-size: 0.8em;
  color: var(--muted-foreground);
}

/* Make select smaller */
.device-controls :deep(.select-small) {
  height: 28px !important;
  padding: 4px 8px !important;
  font-size: 12px !important;
}

.device-controls :deep(.select-small svg) {
  width: 12px !important;
  height: 12px !important;
}

.device-wrapper {
  position: relative;
  display: flex;
  justify-content: flex-start; /* Left align the device container */
  align-items: center;
  background-color: var(--background); /* Use theme-aware background color */
}

.device-container {
  display: inline-block;
  width: var(--device-width);
  height: var(--device-height);
  overflow-x: auto;
  overflow-y: auto;
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.15),
    0 3px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid var(--border);
  border-radius: 12px;
}

.resize-handle {
  position: absolute;
  background: #8f8f8f;
  border-radius: 20px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transform-origin: center;
}

.resize-handle:hover {
  background: #90b7e5;
  transform: scale(1.1);
}

.resize-handle:active {
  background: #90b7e5;
  transform: scale(1.05);
}

.resize-handle-left {
  top: 50%;
  left: -15px;
  width: 8px;
  height: 40px;
  cursor: ew-resize;
  transform: translateY(-50%);
}

.resize-handle-left:hover {
  transform: translateY(-50%) scale(1.1);
}

.resize-handle-left:active {
  transform: translateY(-50%) scale(1.05);
}

.resize-handle-right {
  top: 50%;
  right: -15px;
  width: 8px;
  height: 40px;
  cursor: ew-resize;
  transform: translateY(-50%);
}

.resize-handle-right:hover {
  transform: translateY(-50%) scale(1.1);
}

.resize-handle-right:active {
  transform: translateY(-50%) scale(1.05);
}

.resize-handle-bottom {
  bottom: -15px;
  left: 50%;
  width: 40px;
  height: 8px;
  cursor: ns-resize;
  transform: translateX(-50%);
}

.resize-handle-bottom:hover {
  transform: translateX(-50%) scale(1.1);
}

.resize-handle-bottom:active {
  transform: translateX(-50%) scale(1.05);
}
</style>
