<script setup>
/**
 * @fileoverview Responsive device selection component for developer mode
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
 * @requires Select Select components for dropdown menus
 */
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/uikit/components/ui/select'

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
 * Handle device selection from dropdown
 *
 * Updates the device dimensions in the store when a preset is selected.
 * If 'custom' is selected, only updates the selected device without changing dimensions.
 *
 * @function handleDeviceChange
 * @param {string} value - The selected device preset key
 * @returns {void}
 */
const handleDeviceChange = (value) => {
  console.log('handleDeviceChange called with:', value)

  if (value === 'custom') {
    api.store.dev.selectedDevice = 'custom'
    return
  }

  const preset = devicePresets[value]
  console.log('preset found:', preset)

  if (preset) {
    // Update the device dimensions in the store
    api.store.dev.deviceWidth = preset.width
    api.store.dev.deviceHeight = preset.height
    api.store.dev.selectedDevice = value
    console.log('Updated dimensions to:', api.store.dev.deviceWidth, 'x', api.store.dev.deviceHeight)
  } else {
    console.log('No preset found for value:', value)
  }
}
</script>

<template>
  <!-- Device selection dropdown -->
  <Select v-model="api.store.dev.selectedDevice" @update:modelValue="handleDeviceChange">
    <SelectTrigger class="select-small">
      <SelectValue placeholder="Custom size" />
    </SelectTrigger>
    <SelectContent>
      <!-- Mobile devices group -->
      <SelectGroup>
        <SelectLabel class="mt-2">Mobile</SelectLabel>
        <SelectItem value="iphone"> iPhone </SelectItem>
        <SelectItem value="iphone-plus"> iPhone Plus </SelectItem>
        <SelectItem value="iphone-pro"> iPhone Pro </SelectItem>
        <SelectItem value="iphone-pro-max"> iPhone Pro Max </SelectItem>
        <SelectItem value="iphone-se"> iPhone SE </SelectItem>
      </SelectGroup>

      <!-- Tablet devices group -->
      <SelectGroup>
        <SelectLabel class="mt-2">Tablet</SelectLabel>
        <SelectItem value="ipad-11"> iPad 11-inch </SelectItem>
        <SelectItem value="ipad-13"> iPad 13-inch</SelectItem>
      </SelectGroup>

      <!-- Desktop resolutions group -->
      <SelectGroup>
        <SelectLabel class="mt-2">Desktop</SelectLabel>
        <SelectItem value="desktop1"> 800x600</SelectItem>
        <SelectItem value="desktop2"> 1024x768</SelectItem>
        <SelectItem value="desktop3"> 1280x1024</SelectItem>
        <SelectItem value="desktop4"> 1440x900</SelectItem>
        <SelectItem value="desktop5"> 1600x1200</SelectItem>
        <SelectItem value="desktop16"> 1920x1080</SelectItem>
      </SelectGroup>

      <!-- Other options group -->
      <SelectGroup>
        <SelectLabel class="mt-2">Other</SelectLabel>
        <SelectItem value="custom"> Custom size </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>

<style scoped>
/* Make select smaller for compact layout */
:deep(.select-small) {
  height: 28px !important;
  padding: 4px 8px !important;
  font-size: 12px !important;
}

:deep(.select-small svg) {
  width: 12px !important;
  height: 12px !important;
}
</style>
