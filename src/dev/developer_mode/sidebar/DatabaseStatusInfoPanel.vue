<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Button } from '@/uikit/components/ui/button'
import useAPI from '@/core/composables/useAPI'

/**
 * API instance for accessing Smile app state and actions
 * @type {import('@/core/composables/useAPI')}
 */
const api = useAPI()

/**
 * Timer ref for updating last write time
 * @type {import('vue').Ref<number|null>}
 */
var timer = ref(null)

/**
 * Computed Firebase console URL for the current document
 * @type {import('vue').ComputedRef<string>}
 */
const firebase_url = computed(() => {
  const mode = api.config.mode == 'development' ? 'testing' : 'real'
  return `https://console.firebase.google.com/u/0/project/${api.config.firebaseConfig.projectId}/firestore/data/~2F${mode}~2F${api.config.projectRef}~2Fdata~2F${api.store.browserPersisted.docRef}`
})

/**
 * Opens the Firebase console in a new tab
 * @param {string} url - The URL to open
 */
function open_firebase_console(url) {
  window.open(url, '_new')
}

/**
 * Computed sync state for UI display
 * @type {import('vue').ComputedRef<string>}
 */
const sync_state = computed(() => {
  if (api.store.browserEphemeral.dbChanges && api.store.browserEphemeral.dbConnected) {
    return 'is-warning is-completed'
  } else if (!api.store.browserEphemeral.dbChanges && api.store.browserEphemeral.dbConnected) {
    return 'is-success is-completed'
  } else {
    return ''
  }
})

/**
 * Stops the timer interval
 */
const stopTimer = () => {
  clearInterval(timer.value)
  timer.value = null
}

/**
 * Starts the timer interval for updating last write time
 */
const startTimer = () => {
  timer.value = setInterval(() => {
    if (!api.store.browserEphemeral.dbConnected) {
      last_write_time_string.value = `Never happened`
    } else {
      var time = ((Date.now() - api.store.browserPersisted.lastWrite) / 1000).toFixed(1)
      if (time < 60) {
        last_write_time_string.value = `${time} secs ago`
      } else if (time < 180) {
        time = (time / 60).toFixed(2)
        last_write_time_string.value = `${time} mins ago`
      } else if (time < 60 * 10) {
        last_write_time_string.value = `a few mins ago`
      } else {
        last_write_time_string.value = `a long time ago`
      }
    }
  }, 500)
}

/**
 * Last write time string for display
 * @type {import('vue').Ref<string>}
 */
const last_write_time_string = ref('') // default

onMounted(() => {
  startTimer()
})

onBeforeUnmount(() => {
  stopTimer()
})

const showServiceSelect = ref(false)
</script>

<template>
  <!-- Database status info panel -->
  <table class="w-full text-sm table-border-top">
    <tbody>
      <!-- Last route row -->
      <tr class="table-row-base table-row-even hidden sm:table-row">
        <td class="table-cell-base table-cell-left table-cell-small"><b>Last route:</b></td>
        <td class="table-cell-base table-cell-left table-cell-mono table-cell-small">
          {{ '/' + api.store.browserPersisted.lastRoute }}
        </td>
      </tr>
      <!-- Mode row -->
      <tr class="table-row-base table-row-odd hidden sm:table-row">
        <td class="table-cell-base table-cell-left table-cell-small"><b>Mode:</b></td>
        <td class="table-cell-base table-cell-left table-cell-mono table-cell-small">
          {{ api.config.mode }}
        </td>
      </tr>
      <!-- Project row -->
      <tr class="table-row-base table-row-even hidden sm:table-row">
        <td class="table-cell-base table-cell-left table-cell-small"><b>Project:</b></td>
        <td class="table-cell-base table-cell-left table-cell-mono table-cell-small">
          {{ api.config.firebaseConfig.projectId }}
        </td>
      </tr>
      <!-- DocRef row -->
      <tr class="table-row-base table-row-odd">
        <td class="table-cell-base table-cell-left table-cell-small"><b>DocRef:</b></td>
        <td class="table-cell-base table-cell-left table-cell-mono table-cell-small">
          {{ api.store.browserPersisted.docRef }}&nbsp;&nbsp;<a
            v-if="api.store.browserPersisted.docRef"
            @click.prevent="open_firebase_console(firebase_url)"
            ><i-fa6-solid-square-up-right
          /></a>
        </td>
      </tr>
      <!-- Writes row -->
      <tr class="table-row-base table-row-even hidden sm:table-row">
        <td class="table-cell-base table-cell-left table-cell-small"><b>Writes:</b></td>
        <td class="table-cell-base table-cell-left table-cell-mono table-cell-small">
          {{ api.store.browserPersisted.totalWrites }} out of {{ api.config.maxWrites }} max
        </td>
      </tr>
      <!-- Last write row -->
      <tr class="table-row-base table-row-odd hidden sm:table-row">
        <td class="table-cell-base table-cell-left table-cell-small"><b>Last write:</b></td>
        <td class="table-cell-base table-cell-left table-cell-mono table-cell-small">
          {{ last_write_time_string }}
        </td>
      </tr>
      <!-- Auto save row -->
      <tr class="table-row-base table-row-even hidden sm:table-row">
        <td class="table-cell-base table-cell-left table-cell-small"><b>Auto save:</b></td>
        <td class="table-cell-base table-cell-left table-cell-mono table-cell-small">
          {{ api.config.autoSave }}
        </td>
      </tr>
      <!-- Size row -->
      <tr class="table-row-base table-row-odd hidden sm:table-row table-border-bottom">
        <td class="table-cell-base table-cell-left table-cell-small"><b>Size:</b></td>
        <td class="table-cell-base table-cell-left table-cell-mono table-cell-small">
          {{ api.store.browserPersisted.approxDataSize }} / 1,048,576 max ({{
            Math.round((api.store.browserPersisted.approxDataSize / 1048576) * 1000) / 1000
          }}%)
        </td>
      </tr>
    </tbody>
  </table>

  <!-- Firebase browse button -->
  <div class="flex justify-end mt-4 mr-4">
    <Button @click="open_firebase_console(firebase_url)" variant="outline" size="sm" class="text-xs font-mono">
      Browse in Firebase
    </Button>
  </div>
</template>
