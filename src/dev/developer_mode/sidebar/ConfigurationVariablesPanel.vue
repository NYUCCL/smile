<script setup>
import { Switch } from '@/uikit/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/uikit/components/ui/select'
import { Input } from '@/uikit/components/ui/input'
import useAPI from '@/core/composables/useAPI'
import { Checkbox } from '@/uikit/components/ui/checkbox'
import { computed } from 'vue'
import { useSmileColorMode } from '@/core/composables/useColorMode'

/**
 * API instance for accessing Smile app state and actions
 * @type {import('@/core/composables/useAPI')}
 */
const api = useAPI()

/**
 * Color mode composable for experiment color mode
 * @type {ReturnType<typeof useSmileColorMode>}
 */
const { system, mode: experimentColorMode } = useSmileColorMode('experiment')

/**
 * Computed property that syncs the dropdown with the actual color mode
 * @type {import('vue').ComputedRef<string>}
 */
const colorModeSelect = computed({
  get: () => experimentColorMode.value,
  set: (value) => {
    experimentColorMode.value = value
    // Also update the API config to keep it in sync
    api.config.colorMode = value
  },
})

/**
 * Computed property for the display text in the SelectTrigger
 * @type {import('vue').ComputedRef<string>}
 */
const colorModeDisplayText = computed(() => {
  switch (colorModeSelect.value) {
    case 'light':
      return 'Light'
    case 'dark':
      return 'Dark'
    case 'auto':
      return `System (${system.value})`
    default:
      return colorModeSelect.value
  }
})
</script>

<template>
  <!-- Configuration variables panel -->
  <div class="bg-muted">
    <table class="w-full">
      <tbody>
        <!-- Consent, Known, Done, Withdrew, Viz toggles -->
        <tr class="table-row-base">
          <td class="table-cell-base table-cell-left table-cell-small font-mono" colspan="4">
            <div class="flex flex-wrap gap-4">
              <div class="flex flex-col items-center">
                <span>Consent</span>
                <div class="field">
                  <Switch v-model="api.store.browserPersisted.consented" class="mt-1" />
                </div>
              </div>
              <div class="flex flex-col items-center">
                <span>Known</span>
                <div class="field">
                  <Switch v-model="api.store.browserPersisted.knownUser" class="mt-1" />
                </div>
              </div>
              <div class="flex flex-col items-center">
                <span>Done</span>
                <div class="field">
                  <Switch v-model="api.store.browserPersisted.done" class="mt-1" />
                </div>
              </div>
              <div class="flex flex-col items-center">
                <span>Withdrew</span>
                <div class="field">
                  <Switch v-model="api.store.browserPersisted.withdrawn" class="mt-1" />
                </div>
              </div>
              <div class="flex flex-col items-center">
                <span>Viz</span>
                <div class="field">
                  <Switch v-model="api.store.data.verifiedVisibility" class="mt-1" />
                </div>
              </div>
            </div>
          </td>
        </tr>
        <!-- Window size and aggressive mode -->
        <tr class="table-row-base table-row-base-bottom">
          <td
            class="table-cell-base table-cell-left table-cell-small font-mono"
            :class="{
              'bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-400': api.store.browserEphemeral.tooSmall,
            }"
            colspan="4"
          >
            <div class="flex flex-wrap gap-4 items-center">
              <div class="flex flex-col items-left">
                <span>Min Window Size Request (WxH):</span>
                <div class="flex items-center gap-2 mt-1">
                  <Input
                    v-model="api.config.windowsizerRequest.width"
                    type="number"
                    class="h-5 w-20 text-[1.0em] font-mono"
                    :placeholder="api.config.windowsizerRequest.width"
                  />
                  <span class="text-[1.2em] font-mono">x</span>
                  <Input
                    v-model="api.config.windowsizerRequest.height"
                    type="number"
                    class="h-5 w-20 text-[1.0em] font-mono"
                    :placeholder="api.config.windowsizerRequest.height"
                  />
                </div>
              </div>
              <div class="flex flex-col items-center">
                <span>Aggressive</span>
                <div class="field">
                  <Checkbox v-model="api.config.windowsizerAggressive" class="mt-1" />
                </div>
              </div>
            </div>
          </td>
        </tr>
        <!-- Responsive UI and color mode -->
        <tr class="table-row-base table-row-base-bottom">
          <td class="table-cell-base table-cell-left table-cell-small font-mono" colspan="4">
            <div class="flex flex-wrap gap-4 items-center">
              <div class="flex flex-col items-center">
                <span>Resp. UI</span>
                <div class="field">
                  <Checkbox v-model="api.config.responsiveUI" class="mt-1" />
                </div>
              </div>
              <div class="flex flex-col items-left">
                <span>Color Mode</span>
                <Select v-model="colorModeSelect" class="mt-1 h-8">
                  <SelectTrigger size="sm" class="h-6 text-[1.1em] font-mono">
                    <SelectValue>{{ colorModeDisplayText }}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light" key="light">Light</SelectItem>
                    <SelectItem value="dark" key="dark">Dark</SelectItem>
                    <SelectItem value="auto" key="auto">System ({{ system }})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </td>
        </tr>
        <!-- Recruitment service select -->
        <tr class="table-row-base table-row-base-bottom">
          <td class="table-cell-base table-cell-left table-cell-small font-mono" colspan="4">
            <div class="flex flex-wrap gap-4 items-center">
              <div class="flex flex-col items-left">
                Service<br />
                <Select v-model="api.store.data.recruitmentService" class="mt-1 h-8">
                  <SelectTrigger size="sm" class="h-8 text-[1.2em] font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="(cond, key) in api.store.browserEphemeral.urls" :key="cond" :value="key">
                      {{ key }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-cell-small {
  font-size: 0.6em;
}

/* Ensure consistent spacing between table cells */
table {
  border-collapse: collapse;
  border-spacing: 0;
}

td {
  border: none;
  padding: 0.5rem 0.85rem;
}
</style>
