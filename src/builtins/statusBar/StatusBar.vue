<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import useSmileStore from '@/core/stores/smilestore'
import appconfig from '@/core/config'
import useAPI from '@/core/composables/useAPI'
// load sub-components used in this component
import WithdrawModal from '@/builtins/withdraw/WithdrawModal.vue'
import InformedConsentModal from '@/builtins/informedConsent/InformedConsentModal.vue'
import { Button } from '@/uikit/components/ui/button'

const router = useRouter()
const smilestore = useSmileStore() // get the global store
const api = useAPI() // get the api
const email = ref('')

/**
 * Prefills email address based on recruitment service
 * @returns {string} Email address for the current recruitment service
 */
function prefill_email() {
  let emailval = ''
  if (smilestore.data.recruitmentService === 'prolific') {
    emailval = `${smilestore.private.recruitmentInfo.prolific_id}@email.prolific.co`
  }
  return emailval
}
email.value = prefill_email()

/* these just toggle interface elements so are state local to the component */
const showconsentmodal = ref(false) // reactive
/**
 * Toggles the consent modal visibility
 */
function toggleConsent() {
  showconsentmodal.value = !showconsentmodal.value // have to use .value in <script> when using ref()
}

const showwithdrawmodal = ref(false) // reactive
/**
 * Toggles the withdraw modal visibility and updates email prefill
 */
function toggleWithdraw() {
  showwithdrawmodal.value = !showwithdrawmodal.value // have to use .value in <script> when using ref()
  email.value = prefill_email() // update the value
}

const showreportissuemodal = ref(false) // reactive
/**
 * Toggles the report issue modal visibility
 */
function toggleReport() {
  showreportissuemodal.value = !showreportissuemodal.value // have to use .value in <script> when using ref()
}

/**
 * Submits the withdraw form and navigates to withdraw page
 */
function submitWithdraw() {
  // submit the withdraw form and jump to the thanks
  toggleWithdraw()
  router.push('withdraw') // should use
}
</script>

<template>
  <!-- Main navigation bar with study info and action buttons -->
  <div class="flex flex-row items-stretch relative px-5" role="navigation" aria-label="main navigation">
    <!-- Left section: Brand logo and study information -->
    <div class="flex items-stretch flex-shrink-0 min-h-[3.25rem]">
      <a class="flex items-center pt-3" :href="appconfig.labURL" target="_new" v-if="!appconfig.anonymousMode">
        <img :src="api.getStaticUrl(appconfig.brandLogoFn)" width="90" class="dark-aware-img" />
      </a>
      <div class="flex items-center pt-1">
        <p class="text-xs text-left pl-2.5 text-muted-foreground pt-2 @[600px]:block hidden font-mono">
          Study: {{ smilestore.config.codeName }}<br />Version: {{ smilestore.config.github.lastCommitHash
          }}{{
            appconfig.mode === 'testing' || appconfig.mode === 'development' || appconfig.mode === 'presentation'
              ? '-' + appconfig.mode
              : ''
          }}<br />
          <template v-if="smilestore.getShortId != 'N/A'"> User ID: {{ smilestore.getShortId }} </template>
        </p>
      </div>
    </div>

    <!-- Right section: Action buttons -->
    <div id="infobar" class="flex-grow flex-shrink-0 flex items-stretch z-10">
      <div class="flex justify-end ml-auto items-stretch">
        <div class="flex items-center pt-1" v-if="!appconfig.anonymousMode">
          <div class="flex gap-2">
            <Button variant="outline" size="xs" v-if="api.store.browserPersisted.consented" @click="toggleConsent()">
              <i-fa6-solid-magnifying-glass />
              <span class="@[400px]:inline hidden">View consent</span>
            </Button>
            <Button
              variant="danger-light"
              size="xs"
              v-if="
                api.store.browserPersisted.consented &&
                !api.store.browserPersisted.withdrawn &&
                !api.store.browserPersisted.done
              "
              @click="toggleWithdraw()"
            >
              <i-fa6-solid-circle-xmark />
              <span class="@[400px]:inline hidden">Withdraw</span>
            </Button>
            <Button variant="warning-light" size="xs" @click="toggleReport()" v-if="false">
              <i-fa6-solid-hand />
              Report issue
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal components -->
  <!-- Modal for viewing consent form -->
  <InformedConsentModal :show="showconsentmodal" @toggle-consent="toggleConsent()" />

  <!-- Modal for withdrawing from study -->
  <WithdrawModal
    :show="showwithdrawmodal"
    :prefill-email="email"
    @toggle-withdraw="toggleWithdraw()"
    @submit-withdraw="submitWithdraw()"
  />
</template>
