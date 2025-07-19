<script setup>
// Vue composables
import { watch, ref } from 'vue'

// API composable
import useAPI from '@/core/composables/useAPI'

/**
 * API instance for accessing application state and methods
 */
const api = useAPI()

// Props
const props = defineProps(['routeName'])

// Logging store
import useLog from '@/core/stores/log'
const log = useLog()

// Vue Router composables
import { useRoute, useRouter } from 'vue-router'

// UI components
import { DropdownMenuContent, DropdownMenuItem } from '@/uikit/components/ui/dropdown-menu'

/**
 * Hovered route name for UI highlighting
 */
const hoverRoute = ref('')
const router = useRouter()
const route = useRoute()

// Construct routes in order to display
const routerRoutes = router.getRoutes()
const seqtimeline = api.store.browserPersisted.seqtimeline
const routes = api.store.browserPersisted.routes

// Filter routes - only those not in seqtimeline
const filteredRoutes = routes.filter((r) => {
  return !seqtimeline.find((s) => s.name === r.name)
})

// Concatenate seqtimeline and filteredRoutes
const allRoutes = seqtimeline.concat(filteredRoutes)

/**
 * Watches the route and updates the current query
 */
const currentQuery = ref(route.query)
watch(route, async (newRoute, oldRoute) => {
  currentQuery.value = newRoute.query
})

/**
 * Set the currently hovered route
 * @param {string} route - Route name
 */
function setHover(route) {
  hoverRoute.value = route
}

/**
 * Navigate to a given route
 * @param {string} route - Route name
 */
function navigate(route) {
  log.warn(`DEV MODE: user requested to FORCE navigate to ${route}`)
  api.goToView(route, true)
}
</script>
<template>
  <!-- Dropdown menu listing all routes for navigation -->
  <DropdownMenuContent align="end">
    <DropdownMenuItem
      v-for="r in allRoutes"
      :key="r.name"
      @mouseover="hoverRoute = r.name"
      @mouseout="hoverRoute = ''"
      :class="{
        'bg-accent text-accent-foreground': route.name === r.name,
        'bg-muted': hoverRoute === r.name,
      }"
      @click="navigate(r.name)"
      class="cursor-pointer"
    >
      <span class="text-[0.65rem] font-mono">
        <div class="routename font-medium">
          <span v-if="r.meta.level > 0" v-for="i in r.meta.level" style="margin-left: 5px">&nbsp;</span>
          <i-lucide-arrow-down v-if="r.meta.sequential" class="inline mr-1" />
          <i-lucide-presentation v-else-if="r.name === 'presentation_home'" class="inline mr-1" />
          <i-lucide-diamond v-else class="inline mr-1" />
          /{{ r.name }}
        </div>
      </span>
    </DropdownMenuItem>
  </DropdownMenuContent>
</template>
