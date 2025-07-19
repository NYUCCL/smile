<script setup>
import { computed } from 'vue'
import useAPI from '@/core/composables/useAPI'

/**
 * API instance for accessing Smile app state and actions
 * @type {import('@/core/composables/useAPI')}
 */
const api = useAPI()

/**
 * Computed study info HTML string for display
 * @type {import('vue').ComputedRef<string>}
 */
const studyinfo = computed(() => {
  return `<b>Study:</b> ${api.store.config.codeName}<br /><b>Version:</b> ${api.store.config.github.lastCommitHash}${
    api.store.config.mode === 'testing' ||
    api.store.config.mode === 'development' ||
    api.store.config.mode === 'presentation'
      ? '-' + api.store.config.mode
      : ''
  }<br />${api.store.getShortId != 'N/A' ? `<b>User ID:</b> ${api.store.getShortId}` : ''}`
})
</script>

<template>
  <!-- Study info panel -->
  <div class="w-full bg-muted border-b border-border">
    <p class="text-xs font-mono py-2 px-3 border-t border-border" v-html="studyinfo"></p>
  </div>
</template>
