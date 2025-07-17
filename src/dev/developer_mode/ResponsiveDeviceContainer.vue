<script setup>
import { ref, computed } from 'vue'
import useAPI from '@/core/composables/useAPI'
import MainApp from '@/core/MainApp.vue'
import ResponsiveDeviceSelect from './ResponsiveDeviceSelect.vue'
import { Separator } from '@/uikit/components/ui/separator'
import { Button } from '@/uikit/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'
import { useSmileColorMode } from '@/core/composables/useColorMode'

const api = useAPI()

import { useElementSize } from '@vueuse/core'
const fullScreenDiv = ref(null)
const { width: fullScreenWidth, height: fullScreenHeight } = useElementSize(fullScreenDiv)

const {
  state: experimentColorMode,
  mode: experimentColorModeRaw,
  toggle: toggleColorMode,
  system,
} = useSmileColorMode('experiment')

// Initialize device dimensions based on the selected device from store
const devicePresets = {
  iphone: { width: 393, height: 852, name: 'iPhone' },
  'iphone-plus': { width: 430, height: 932, name: 'iPhone Plus' },
  'iphone-pro': { width: 402, height: 874, name: 'iPhone Pro' },
  'iphone-pro-max': { width: 440, height: 956, name: 'iPhone Pro Max' },
  'iphone-se': { width: 375, height: 667, name: 'iPhone SE' },
  'ipad-11': { width: 1180, height: 820, name: 'iPad 11-inch' },
  'ipad-13': { width: 1366, height: 1024, name: 'iPad 13-inch' },
  desktop1: { width: 800, height: 600, name: '800x600' },
  desktop2: { width: 1024, height: 768, name: '1024x768' },
  desktop3: { width: 1280, height: 1024, name: '1280x1024' },
  desktop4: { width: 1440, height: 900, name: '1440x900' },
  desktop5: { width: 1600, height: 1200, name: '1600x1200' },
  desktop16: { width: 1920, height: 1080, name: '1920x1080' },
}

// Initialize store values if they don't exist
if (!api.store.dev.deviceWidth || !api.store.dev.deviceHeight) {
  const initialPreset = devicePresets[api.store.dev.selectedDevice] || devicePresets.desktop1
  api.store.dev.deviceWidth = initialPreset.width
  api.store.dev.deviceHeight = initialPreset.height
}

const containerStyle = computed(() => ({
  '--device-width': `${api.store.dev.deviceWidth}px`,
  '--device-height': `${api.store.dev.deviceHeight}px`,
}))

// Check if current dimensions match any preset
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

// Resize functionality
const isResizing = ref(false)
const resizeDirection = ref('')
const startX = ref(0)
const startY = ref(0)
const startWidth = ref(0)
const startHeight = ref(0)

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

const stopResize = () => {
  isResizing.value = false
  resizeDirection.value = ''
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)

  // Check if the final dimensions match any preset
  checkForMatchingPreset()
}

// Toggle rotation (swap width and height)
const toggleRotation = () => {
  const tempWidth = api.store.dev.deviceWidth
  api.store.dev.deviceWidth = api.store.dev.deviceHeight
  api.store.dev.deviceHeight = tempWidth
  api.store.dev.isRotated = !api.store.dev.isRotated

  // Check if the new dimensions match any preset
  checkForMatchingPreset()
}

// Toggle fullscreen mode
const toggleFullscreen = () => {
  api.store.dev.isFullscreen = !api.store.dev.isFullscreen
}

// toggleColorMode is now imported from useSmileColorMode above

/**
 * Computed property that determines whether to wrap content in ResponsiveDeviceContainer
 *
 * @returns {boolean} True if ResponsiveDeviceContainer should be used, false otherwise
 * - Returns false if current route is '/' (root route)
 * - Returns true
 */
const shouldUseResponsiveContainer = computed(() => {
  const routeName = api.currentRouteName()
  return routeName !== undefined && routeName !== 'recruit' && api.config.mode == 'development'
})

const colorMode = computed(() => {
  return experimentColorMode.value
})
</script>

<template>
  <!-- Fullscreen mode - just the slot content -->
  <div
    v-if="api.store.dev.isFullscreen || !shouldUseResponsiveContainer || api.config.mode == 'presentation'"
    ref="fullScreenDiv"
    class="fullscreen-container bg-background text-foreground dev-color-mode"
    :class="api.currentRouteName() !== 'recruit' ? colorMode : ''"
  >
    <MainApp :deviceWidth="fullScreenWidth" :deviceHeight="fullScreenHeight" />
  </div>

  <!-- Normal device container mode -->
  <div v-else class="device-container-wrapper" :style="containerStyle">
    <div class="device-content-wrapper">
      <div class="device-info">
        <div class="device-controls">
          <ResponsiveDeviceSelect />
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
          <Separator orientation="vertical" />
          <div class="device-dimensions">{{ api.store.dev.deviceWidth }} x {{ api.store.dev.deviceHeight }}</div>

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
      <div class="device-wrapper dev-color-mode" :class="api.currentRouteName() !== 'recruit' ? colorMode : ''">
        <div class="device-container bg-background text-foreground" ref="containerDiv">
          <MainApp :deviceWidth="api.store.dev.deviceWidth" :deviceHeight="api.store.dev.deviceHeight" />
        </div>

        <!-- Resize handles -->
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

.fullscreen-controls {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background-color: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.resize-handle-corner {
  bottom: -15px;
  right: -15px;
  width: 12px;
  height: 12px;
  cursor: nw-resize;
  border-radius: 50%;
}
</style>
