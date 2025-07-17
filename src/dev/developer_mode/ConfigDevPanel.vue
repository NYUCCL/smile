<script setup>
import useAPI from '@/core/composables/useAPI'
import ResponsiveDeviceSelect from './ResponsiveDeviceSelect.vue'
import { Label } from '@/uikit/components/ui/label'
import { Switch } from '@/uikit/components/ui/switch'
import { Button } from '@/uikit/components/ui/button'
import { Separator } from '@/uikit/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/uikit/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'

import { computed } from 'vue'

const api = useAPI()

// Device presets for rotation logic
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

// Toggle rotation (swap width and height) - same logic as ResponsiveDeviceContainer
const toggleRotation = () => {
  const tempWidth = api.store.dev.deviceWidth
  api.store.dev.deviceWidth = api.store.dev.deviceHeight
  api.store.dev.deviceHeight = tempWidth
  api.store.dev.isRotated = !api.store.dev.isRotated

  // Check if the new dimensions match any preset
  checkForMatchingPreset()
}

// Reset developer mode settings to default
function resetDevState() {
  localStorage.removeItem(api.config.devLocalStorageKey) // delete the local store
  location.reload()
}
</script>
<template>
  <div class="grid gap-4">
    <div class="space-y-2">
      <h4 class="font-medium leading-none">Developer Configurations</h4>
      <p class="text-sm text-muted-foreground">Adjust or reset developer mode settings.</p>
    </div>
    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <Separator />
      </div>
      <div class="relative flex justify-center text-xs uppercase">
        <span class="bg-background px-2 text-muted-foreground">Panels</span>
      </div>
    </div>
    <div class="grid gap-2">
      <div class="grid grid-cols-3 items-center gap-4">
        <Label for="sidebar">Show Sidebar</Label>
        <Switch id="sidebar" v-model="api.store.dev.showSideBar" class="col-span-2" />
      </div>
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
      <div class="grid grid-cols-3 items-center gap-4">
        <Label for="console">Show Console</Label>
        <Switch id="console" v-model="api.store.dev.showConsoleBar" class="col-span-2" />
      </div>
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
      <div class="relative mt-5">
        <div class="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-background px-2 text-muted-foreground">Responsive Mode</span>
        </div>
      </div>
      <div class="grid grid-cols-3 items-center gap-4">
        <Label for="width">Full screen</Label>
        <Switch id="width" v-model="api.store.dev.isFullscreen" class="col-span-2" />
      </div>
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
    <div class="flex justify-end mt-5">
      <Button variant="outline" size="sm" @click="resetDevState"> Reset to Default </Button>
    </div>
  </div>
</template>
