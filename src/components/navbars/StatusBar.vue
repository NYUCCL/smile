<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import useSmileStore from '@/stores/smiledata'
import appconfig from '@/config'

// load sub-components used in this compomnents
import WithdrawFormModal from '@/components/errors_withdraw/WithdrawFormModal.vue'
import InformedConsentModal from '@/components/consent/InformedConsentModal.vue'
import ReportIssueModal from '@/components/errors_withdraw/ReportIssueModal.vue'

const router = useRouter()
const smilestore = useSmileStore() // get the global store
const withdrawform = ref(null) // this uses the ref="withdrawform" in the template
const email = ref('')

// IF OTHER SERVICES PROVIDE EASY EMAIL ADDRESSES, ADD THEM HERE
function prefill_email() {
  let emailval = ''
  if (smilestore.data.recruitment_service === 'prolific') {
    emailval = `${smilestore.data.recruitment_info.prolific_id}@email.prolific.co`
  }
  return emailval
}
email.value = prefill_email()

/* these just toggle interface elements so are state local to the component */
const showconsentmodal = ref(false) // reactive
function toggleConsent() {
  showconsentmodal.value = !showconsentmodal.value // have to use .value in <script> when using ref()
}

const showwithdrawmodal = ref(false) // reactive
function toggleWithdraw() {
  showwithdrawmodal.value = !showwithdrawmodal.value // have to use .value in <script> when using ref()
  email.value = prefill_email() // update the value
}

const showreportissuemodal = ref(false) // reactive
function toggleReport() {
  showreportissuemodal.value = !showreportissuemodal.value // have to use .value in <script> when using ref()
}

function submitWithdraw() {
  // submit the withdraw form and jump to the thanks
  toggleWithdraw()
  router.push('withdraw') // should use
}
</script>

<template>
  <div class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item" href="https://gureckislab.org">
        <img src="@/assets/nyu.png" width="90" />
      </a>
      <div class="navbar-item">
        <p class="is-size-7 studyinfo">
          Study: {{ smilestore.config.code_name }}<br />Version: {{ smilestore.config.github.last_commit_hash
          }}{{
            appconfig.mode === 'testing' || appconfig.mode === 'development' || appconfig.mode === 'presentation'
              ? '-' + appconfig.mode
              : ''
          }}
        </p>
      </div>
    </div>
    <div id="navbarBasicExample" class="navbar-menu is-active">
      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons" v-if="smilestore.data.withdraw !== true">
            <button class="button is-info is-small is-light" v-if="smilestore.isConsented" @click="toggleConsent()">
              <FAIcon icon="magnifying-glass" />&nbsp;&nbsp;View consent
            </button>
            <button
              class="button is-danger is-small is-light"
              v-if="smilestore.isConsented && !smilestore.isDone"
              @click="toggleWithdraw()"
            >
              <FAIcon icon="circle-xmark" />&nbsp;&nbsp;Withdraw
            </button>
            <button class="button is-warning is-small is-light" @click="toggleReport()" v-if="false">
              <FAIcon icon="hand" />&nbsp;&nbsp;Report issue
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- modal for viewing consent form -->
  <div class="modal" :class="{ 'is-active': showconsentmodal }">
    <div class="modal-background" @click="toggleConsent()"></div>
    <div class="modal-content">
      <div class="modaltext">
        <InformedConsentModal @toggle-consent="toggleConsent()" />
      </div>
    </div>
    <button class="modal-close is-large" aria-label="close" @click="toggleConsent()"></button>
  </div>

  <!-- modal for withdrawing from study -->
  <div class="modal" :class="{ 'is-active': showwithdrawmodal }">
    <div class="modal-background" @click="toggleWithdraw()"></div>
    <div class="modal-content">
      <div class="modaltext">
        <WithdrawFormModal
          :prefill-email="email"
          ref="withdrawform"
          @toggle-withdraw="toggleWithdraw()"
          @submit-withdraw="submitWithdraw()"
        />
      </div>
    </div>
    <button class="modal-close is-large" aria-label="close" @click="toggleWithdraw()"></button>
  </div>

  <!-- modal for reporting issues -->
  <div class="modal" :class="{ 'is-active': showreportissuemodal }">
    <div class="modal-background" @click="toggleReport()"></div>
    <div class="modal-content">
      <div class="modaltext">
        <ReportIssueModal @toggle-report="toggleReport()" />
      </div>
    </div>
    <button class="modal-close is-large" aria-label="close" @click="toggleReport()"></button>
  </div>
</template>

<style scoped>
/* scoped css for this component */
.modaltext {
  background-color: #fff;
  padding: 30px;
}
.navbar {
  z-index: 10;
  background-color: v-bind(smilestore.global.status_bar_bg_color);
  color: v-bind(smilestore.global.status_bar_text_color);
}

.modal-content {
  width: 80%;
}
.studyinfo {
  text-align: left;
  color: v-bind(smilestore.global.status_bar_text_color);
}
.navbar-start {
  margin-right: 10px;
}
.navbar-end {
  margin-left: auto;
}
</style>
