import { useRoute, useRouter } from 'vue-router'
import useSmileStore from '@/core/stores/smiledata'
import useTimelineStepper from '@/core/composables/timelinestepper'
// import seeded randomization function for this component/route
// random seeding is unique to each component/route
import { shuffle } from '@/core/randomization'

// import the trial stepper functionality which advances linearly through
// a set of trials
import { useTrialStepper } from '@/core/composables/trialstepper'

export default function useSmileAPI() {
  const { stepNextRoute, stepPrevRoute } = useTimelineStepper()
  const route = useRoute()
  const router = useRouter()
  const smilestore = useSmileStore()
  const api = {
    config: smilestore.config,
    data: smilestore.data,
    local: smilestore.local,
    global: smilestore.global,
    dev: smilestore.dev,
    route: route,
    router: router,
    stepNextRoute: stepNextRoute,
    stepPrevRoute: stepPrevRoute,
    hasNextRoute: () => route.meta.next && route.meta.sequential,
    hasPrevRoute: () => route.meta.prev && route.meta.sequential,
    shuffle: shuffle,
    useTrialStepper: useTrialStepper,
    isKnownUser: smilestore.isKnownUser,
    urls: smilestore.global.urls,
    resetStore: () => {
      smilestore.resetLocal()
    },
    resetLocalState() {
      localStorage.removeItem(api.config.local_storage_key) // delete the local store
      // localStorage.removeItem(`${appconfig.local_storage_key}-seed_id`)
      // localStorage.removeItem(`${appconfig.local_storage_key}-seed_set`)
      smilestore.resetLocal() // reset all the data even

      // go back to the landing page (don't use router because it won't refresh the page and thus won't reset the app)
      const url = window.location.href
      window.location.href = url.substring(0, url.lastIndexOf('#/'))
    },
    setKnown: () => {
      smilestore.setKnown()
    },
    setDone: () => {
      smilestore.setDone()
    },
    setConsented: () => {
      smilestore.setConsented()
    },
    setWithdraw: (forminfo) => {
      smilestore.setWithdraw(forminfo)
    },
    saveDemographicForm: (data) => {
      smilestore.saveDemographicForm(data)
    },
    verifyVisibility: (value) => {
      smilestore.verifyVisibility(value)
    },
    getVerifiedVisibility: () => {
      return smilestore.verifiedVisibility
    },
    isBrowserTooSmall: () => {
      let val = false
      if(smilestore.config.windowsizer_aggressive && smilestore.verifiedVisibility) {
        val = window.innerWidth < smilestore.config.windowsizer_request.width+40 || window.innerHeight < smilestore.config.windowsizer_request.height+40
        
      }
      return val
    },
    setPageAutofill: (autofill) => {
      console.log('setting autofil')
      if (smilestore.config.mode === 'development') smilestore.setPageAutofill(autofill)
    },
    setCompletionCode: (code) => {
      smilestore.setCompletionCode(code)
    },
    getRecruitmentService: () => {
      return smilestore.data.recruitment_service
    },
    getPageTracker: (routeName) => {
      return smilestore.getPageTracker(routeName)
    },
    hasAutofill: () => {
      return smilestore.hasAutofill
    },
    autofill: () => {
      return smilestore.autofill()
    },
    currentRouteName: () => {
      return route.name
    },
    getCurrentTrial: () => {
      return smilestore.getPage[route.name]
    },
    getBrowserFingerprint: () => {
      return smilestore.getBrowserFingerprint()
    },
    recordWindowEvent: (type, event_data = null) => {
      smilestore.recordWindowEvent(type, event_data)
    },
    incrementTrial: () => {
      smilestore.incrementPageTracker(route.name)
    },
    decrementTrial: () => {
      smilestore.decrementPageTracker(route.name)
    },
    resetTrial: () => {
      smilestore.resetPageTracker(route.name)
    },
    saveData: (force) => {
      smilestore.saveData(force)
    },
    setStreamingData: (data, subcollection) => {
      smilestore.setStreamingData(data, subcollection)
    },
    saveTrialData: (data) => {
      smilestore.saveTrialData(data)
      console.log('data ', smilestore.data.study_data)
    },
  }

  return api
}
