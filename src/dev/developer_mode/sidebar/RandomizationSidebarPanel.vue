<script setup>
import { ref, watch } from 'vue'
import useAPI from '@/core/composables/useAPI'
import { useRouter } from 'vue-router'
import useSmileStore from '@/core/stores/smilestore'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/uikit/components/ui/button'
import { Input } from '@/uikit/components/ui/input'
import { Switch } from '@/uikit/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/uikit/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'

/**
 * API instance for logging and navigation
 * @type {import('@/core/composables/useAPI')}
 */
const api = useAPI()

/**
 * Router instance for page navigation
 * @type {import('vue-router').Router}
 */
const router = useRouter()

/**
 * Global Smile store instance
 * @type {import('@/core/stores/smilestore')}
 */
const smilestore = useSmileStore()

/**
 * Current seed value for randomization
 * @type {import('vue').Ref<string>}
 */
const seed = ref(smilestore.getSeedID)

/**
 * Sets the current seed and reloads the page to apply changes
 */
function set_seed() {
  // seed.value = uuidv4()
  //seed = smilestore.randomizeSeed()
  api.log.debug('Setting seed to ', seed.value)
  smilestore.setSeedID(seed.value)
  // Force a reload to resample conditions and variables
  router.go(0)
}

/**
 * Selected conditions from the store
 * @type {Object}
 */
const selected = smilestore.getConditions

/**
 * Changes a condition value and reloads the page to apply changes
 * @param {string} key - The condition key to change
 * @param {*} value - The new value for the condition
 */
function changeCond(key, value) {
  smilestore.setCondition(key, value)
  // Force a reload to resample conditions and variables
  router.go(0)
}

/**
 * Watches for changes in store conditions and updates the selected conditions
 */
watch(
  () => smilestore.data.conditions,
  async (newConds) => {
    // for each key in newConds, update that entry in conditions
    Object.keys(newConds).forEach((key) => {
      selected[key] = newConds[key]
    })
  }
)

/**
 * Gets the appropriate branch type character for tree display
 * @param {number} index - The current index in the list
 * @param {number} total - The total number of items
 * @returns {string} The branch type character
 */
const getBranchType = (index, total) => {
  if (index === 0) {
    return '┌─ '
  } else if (index === total - 1) {
    return '└─ '
  } else {
    return '├─ '
  }
}
</script>

<template>
  <TooltipProvider>
    <!-- Main container -->
    <div class="h-fit p-0 m-0">
      <!-- Random seed section header -->
      <div
        class="text-xs text-muted-foreground font-mono text-left bg-muted px-2 py-1.5 m-0 border-t border-b border-border"
      >
        Random seed
      </div>

      <!-- Random seed configuration section -->
      <div class="bg-background pb-5 border-b border-border">
        <div class="text-xs m-2">
          Toggle to use a fixed seed (off means uses the current time as seed). A specific seed can be set in the input
          field. Press the arrow to reload the view with the new seed.
        </div>

        <div class="mt-0 p-0 z-50 mx-4">
          <div class="grid grid-cols-2 gap-3">
            <!-- Fixed seed toggle row -->
            <div class="col-span-2 flex items-center gap-2">
              <label class="text-xs font-mono">Fixed seed:</label>
              <Tooltip>
                <TooltipTrigger>
                  <Switch
                    :model-value="smilestore.browserPersisted.useSeed"
                    @update:model-value="smilestore.browserPersisted.useSeed = $event"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Use fixed seed</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <!-- Seed input and update button row -->
            <div class="flex-1">
              <Input
                v-model="seed"
                type="text"
                placeholder="Current seed"
                :class="{ 'opacity-50 pointer-events-none': !smilestore.browserPersisted.useSeed }"
              />
            </div>
            <Button
              @click="set_seed"
              :disabled="!smilestore.browserPersisted.useSeed"
              size="sm"
              variant="outline"
              class="font-mono text-xs"
            >
              Update seed
            </Button>
          </div>
        </div>
      </div>

      <!-- Random variables section -->
      <div
        class="subsection"
        v-if="
          smilestore.browserPersisted.possibleConditions &&
          Object.keys(smilestore.browserPersisted.possibleConditions).length > 0
        "
      >
        <!-- Random variables header -->
        <div
          class="text-xs text-left font-mono bg-muted text-muted-foreground px-2 py-1.5 m-0 border-t border-b border-border"
        >
          Random Variables
        </div>

        <!-- Random variables configuration -->
        <div class="bg-background">
          <div class="text-xs m-2">
            Use these dropdowns to force specific values for each variable (see design.js). By default these are choosen
            randomly based on the seed.
          </div>

          <!-- Variables list -->
          <div class="relative m-0 p-0 pt-1.5 mb-3 mt-2">
            <ul class="list-none p-0 m-0 text-left ml-1.5 pb-2">
              <template v-for="(value, key, index) in smilestore.browserPersisted.possibleConditions" :key="key">
                <li class="flex items-center mb-0 ml-0.5 mt-1">
                  <span class="font-mono text-sm text-gray-500 whitespace-pre mr-0">{{
                    getBranchType(index, Object.keys(smilestore.browserPersisted.possibleConditions).length)
                  }}</span>
                  <Select :model-value="selected[key]" @update:model-value="(val) => changeCond(key, val)">
                    <SelectTrigger class="h-7 text-[0.65rem] py-1 px-3 font-mono">
                      <SelectValue :placeholder="`${key}: ${selected[key]}`" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="cond in value" :key="cond" :value="cond"> {{ key }}: {{ cond }} </SelectItem>
                    </SelectContent>
                  </Select>
                </li>
              </template>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </TooltipProvider>
</template>
