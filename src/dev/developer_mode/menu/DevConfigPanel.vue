<script setup>
/**
 * @fileoverview Developer configuration panel component for adjusting developer mode settings
 */

/**
 * Import Vue composition API functions
 * Note: No Vue composition API functions are currently used in this component
 */

/**
 * Import SMILE API composable for accessing application state and methods
 * @requires useAPI SMILE API composable
 */
import useAPI from '@/core/composables/useAPI'

/**
 * Import UI components from shadcn-vue
 * @requires ResponsiveDeviceSelect Component for device selection
 * @requires Label Label component for form inputs
 * @requires Switch Switch component for toggles
 * @requires Button Button component for actions
 * @requires Separator Separator component for visual dividers
 * @requires Select Select components for dropdown menus
 * @requires Tooltip Tooltip components for enhanced UX
 */
import ResponsiveDeviceSelect from '@/dev/developer_mode/menu/ResponsiveDeviceSelect.vue'
import { Label } from '@/uikit/components/ui/label'
import { Switch } from '@/uikit/components/ui/switch'
import { Button } from '@/uikit/components/ui/button'
import { Separator } from '@/uikit/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/uikit/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'

/**
 * Import shared device presets
 * @requires devicePresets Shared device presets for responsive testing
 */
import { devicePresets } from '@/dev/developer_mode/devicePresets.js'

/**
 * Initialize SMILE API instance
 * @constant {Object} api Global API instance
 */
const api = useAPI()

/**
 * Check if current dimensions match any preset and update selected device
 *
 * Compares current device dimensions against all presets, checking both
 * normal and rotated orientations. Updates the selected device in the store.
 *
 * @function checkForMatchingPreset
 * @returns {void}
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

/**
 * Toggle rotation by swapping width and height dimensions
 *
 * Swaps the device width and height values and updates the rotation state.
 * Also checks if the new dimensions match any preset.
 *
 * @function toggleRotation
 * @returns {void}
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
 * Reset developer mode settings to default values
 *
 * Removes developer mode settings from localStorage and reloads the page
 * to restore default configuration.
 *
 * @function resetDevState
 * @returns {void}
 */
function resetDevState() {
  localStorage.removeItem(api.config.devLocalStorageKey) // delete the local store
  location.reload()
}
</script>

<template>
  <!-- Main configuration container -->
  <div class="grid gap-4">
    <!-- Header section with title and description -->
    <div class="space-y-2">
      <h4 class="font-medium leading-none">Developer Configurations</h4>
      <p class="text-sm text-muted-foreground">Adjust or reset developer mode settings.</p>
    </div>

    <!-- Visual separator with "Panels" label -->
    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <Separator />
      </div>
      <div class="relative flex justify-center text-xs uppercase">
        <span class="bg-background px-2 text-muted-foreground">Panels</span>
      </div>
    </div>

    <!-- Configuration options grid -->
    <div class="grid gap-2">
      <!-- Sidebar visibility toggle -->
      <div class="grid grid-cols-3 items-center gap-4">
        <Label for="sidebar">Show Sidebar</Label>
        <Switch id="sidebar" v-model="api.store.dev.showSideBar" class="col-span-2" />
      </div>

      <!-- Sidebar tab selection -->
      <div class="grid grid-cols-3 items-center gap-4">
        <Label for="sidebarTab">Sidebar Tab</Label>
        <div class="col-span-2">
          <Select v-model="api.store.dev.sidebarTab">
            <SelectTrigger>
              <SelectValue placeholder="Select tab" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="steps">Steps</SelectItem>
              <SelectItem value="randomization">Random</SelectItem>
              <SelectItem value="db">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Console visibility toggle -->
      <div class="grid grid-cols-3 items-center gap-4">
        <Label for="console">Show Console</Label>
        <Switch id="console" v-model="api.store.dev.showConsoleBar" class="col-span-2" />
      </div>

      <!-- Console tab selection -->
      <div class="grid grid-cols-3 items-center gap-4">
        <Label for="consoleBarTab">Console Tab</Label>
        <div class="col-span-2">
          <Select v-model="api.store.dev.consoleBarTab">
            <SelectTrigger>
              <SelectValue placeholder="Select tab" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="browse">Data Browser</SelectItem>
              <SelectItem value="log">Log</SelectItem>
              <SelectItem value="config">Config</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Visual separator with "Responsive Mode" label -->
      <div class="relative mt-5">
        <div class="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-background px-2 text-muted-foreground">Responsive Mode</span>
        </div>
      </div>

      <!-- Fullscreen toggle -->
      <div class="grid grid-cols-3 items-center gap-4">
        <Label for="width">Full screen</Label>
        <Switch id="width" v-model="api.store.dev.isFullscreen" class="col-span-2" />
      </div>

      <!-- Device selection with rotation button -->
      <div class="grid grid-cols-3 items-center gap-4">
        <Label for="device">Target Device</Label>
        <div class="col-span-2 flex items-center gap-2">
          <ResponsiveDeviceSelect />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="xs" @click="toggleRotation">
                  <i-carbon-rotate-counterclockwise-filled :class="{ 'text-blue-400': api.store.dev.isRotated }" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Rotate device</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>

    <!-- Reset button section -->
    <div class="flex justify-end mt-5">
      <Button variant="outline" size="sm" @click="resetDevState"> Reset to Default </Button>
    </div>
  </div>
</template>
