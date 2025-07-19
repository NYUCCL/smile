<script setup>
// Vue composables
import { computed } from 'vue'

// UI components
import { Button } from '@/uikit/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'

// Icons
import { Database, RefreshCw } from 'lucide-vue-next'

// API composable
import useAPI from '@/core/composables/useAPI'

// Local components
import CircleProgress from '@/dev/developer_mode/navbar/CircleProgress.vue'

/**
 * API instance for accessing application state and methods
 */
const api = useAPI()

/**
 * Computed tooltip text showing database connection status and data usage
 *
 * @returns {string} Formatted tooltip message with connection status, sync status, and data usage
 */
const database_tooltip = computed(() => {
  var msg = ''
  if (api.store.browserEphemeral.dbConnected == true) {
    msg += 'Database connected | '
  } else {
    msg += 'Database not connected | '
  }
  if (api.store.browserEphemeral.dbChanges == true) {
    msg += 'Unsynced data '
  } else {
    msg += 'Data in sync '
  }
  if (api.store.browserEphemeral.dbConnected == true) {
    msg += '| '
    msg += Math.round((api.store.browserPersisted.approxDataSize / 1048576) * 1000) / 1000 + '% data used'
  }
  return msg
})
</script>

<template>
  <!-- Database connection status button with tooltip -->
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="menu" variant="outline">
          <!-- Database icon with connection status styling -->
          <i-ix-database-filled
            style="font-size: 2em"
            class="disconnected"
            :class="{ connected: api.store.browserEphemeral.dbConnected == true }"
          />

          <!-- Refresh icon with sync status styling -->
          <template v-if="!api.store.browserEphemeral.dbConnected">
            <RefreshCw class="has-text-grey" />
          </template>
          <template v-else-if="api.store.browserEphemeral.dbChanges && api.store.browserEphemeral.dbConnected">
            <RefreshCw class="outofsync" />
          </template>
          <template v-else>
            <RefreshCw class="insync" />
          </template>

          <!-- Progress circle for data usage -->
          <template v-if="!api.store.browserEphemeral.dbConnected">
            <div class="mt-1">
              <CircleProgress
                :percentage="Math.round(api.store.browserPersisted.approxDataSize / 1048576) * 100"
                :size="12"
                :strokeWidth="40"
                slicecolor="#aaa"
                basecolor="#aaa"
              />
            </div>
          </template>
          <template v-else>
            <div class="mt-1">
              <CircleProgress
                :percentage="Math.round(api.store.browserPersisted.approxDataSize / 1048576) * 100"
                :size="12"
                :strokeWidth="40"
                slicecolor="var(--primary-button)"
                basecolor="var(--status-green)"
              />
            </div>
          </template>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {{ database_tooltip }}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>

<style scoped>
.disconnected {
  color: var(--status-red);
}
.connected {
  color: var(--status-green);
}
.outofsync {
  color: var(--status-yellow);
}
.insync {
  color: var(--status-green);
}
</style>
