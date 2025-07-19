import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest'
import { flushPromises, mount, shallowMount } from '@vue/test-utils'
import { defineComponent, h, createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
//import { setActivePinia, createPinia } from 'pinia'
import '../setup/mocks' // Import shared mocks
import { setupBrowserEnvironment } from '../setup/mocks'

// Import the actual router (not mocked) after the timeline mock is set up
import useAPI from '@/core/composables/useAPI'
import Timeline from '@/core/timeline/Timeline'
import { useRouter, addGuards } from '@/core/router'
import appconfig from '@/core/config'
import StatusBar from '@/builtins/statusBar/StatusBar.vue'

// Helper function to create a timeline with test routes
function createTestTimeline(mode) {
  // Create a minimal mock API that satisfies Timeline's requirements
  const mockMiniAPI = {
    config: {
      mode: mode,
      localStorageKey: 'test_storage',
    },
    log: {
      debug: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      success: vi.fn(),
    },
    store: {
      getRandomizedRouteByName: vi.fn().mockReturnValue(null),
      setRandomizedRoute: vi.fn(),
      registerStepper: vi.fn(),
      config: {
        mode: 'development',
      },
      browserPersisted: {
        seqtimeline: [],
        routes: [],
      },
    },
    sampleWithReplacement: vi.fn((options) => [options[0]]), // Returns first option by default
    getConditionByName: vi.fn(),
    randomAssignCondition: vi.fn((options) => options.conditionname[0]), // Returns first condition by default
  }

  const timeline = new Timeline(mockMiniAPI)

  // Create a mock component for routes
  const MockComponent = (text = 'Mock Component') =>
    defineComponent({
      template: `<div>${text}</div>`,
    })

  // Add welcome_anonymous route (required by Timeline)
  timeline.pushSeqView({
    path: '/welcome',
    name: 'welcome_anonymous',
    component: MockComponent('Welcome Anonymous'),
    meta: {
      prev: undefined,
      next: 'consent',
      allowAlways: true,
      requiresConsent: false,
    },
  })

  // Add welcome_referred route
  timeline.pushSeqView({
    path: '/welcome/:service',
    name: 'welcome_referred',
    component: MockComponent('Welcome Referred'),
    meta: {
      prev: undefined,
      next: 'consent',
      allowAlways: true,
      requiresConsent: false,
    },
  })

  // Add consent route
  timeline.pushSeqView({
    path: '/consent',
    name: 'consent',
    component: MockComponent('Consent'),
    meta: {
      requiresConsent: false,
      setConsented: true,
    },
  })

  // Add demograph route
  timeline.pushSeqView({
    path: '/demograph',
    name: 'demograph',
    component: MockComponent('Demograph'),
  })

  // Add instructions route
  timeline.pushSeqView({
    path: '/instructions',
    name: 'instructions',
    component: MockComponent('Instructions'),
  })

  // Add quiz route
  timeline.pushSeqView({
    path: '/quiz',
    name: 'quiz',
    component: MockComponent('Quiz'),
  })

  // Add experiment route
  timeline.pushSeqView({
    path: '/experiment',
    name: 'exp',
    component: MockComponent('Experiment'),
  })

  // Add debrief route
  timeline.pushSeqView({
    path: '/debrief',
    name: 'debrief',
    component: MockComponent('Debrief'),
  })

  // Add feedback route
  timeline.pushSeqView({
    path: '/feedback',
    name: 'feedback',
    component: MockComponent('Feedback'),
    meta: {
      setDone: true,
    },
  })

  // Add always allowed route
  timeline.registerView({
    path: '/always_allow',
    name: 'always_allow',
    component: MockComponent('Always Allow'),
    meta: {
      allowAlways: true,
      requiresConsent: false,
    },
  })

  // Add thanks route
  timeline.pushSeqView({
    path: '/thanks',
    name: 'thanks',
    component: MockComponent('Thanks'),
    meta: {
      requiresDone: true,
      resetApp: true,
    },
  })

  // Add thanks route
  timeline.pushSeqView({
    path: '/thanks2',
    name: 'thanks2',
    component: MockComponent('Thanks 2'),
    meta: {
      requiresDone: true,
      resetApp: false,
    },
  })

  // Add withdraw route
  timeline.registerView({
    path: '/withdraw',
    name: 'withdraw',
    component: MockComponent('Withdraw'),
    meta: {
      requiresWithdraw: true,
      //resetApp: api.getConfig('allowRepeats'),
    },
  })

  // Build the timeline
  timeline.build()

  return timeline
}

// Helper function to setup the app for testing
async function setupApp(mode = 'production') {
  // Create timeline first
  const timeline = createTestTimeline(mode)

  // Initialize router
  const router = await useRouter(timeline)

  // Create real pinia instance
  const pinia = createPinia()
  setActivePinia(pinia)

  const InformedConsentText = defineComponent({
    template: `
      <div>Informed Consent Text</div>
    `,
  })

  const TestComponent = defineComponent({
    components: {
      StatusBar,
      InformedConsentText,
    },
    setup() {
      const api = useAPI()
      //api.setAppComponent('informed_consent_text', InformedConsentText)

      return { api }
    },
    template: `
      <div class="test-wrapper">
        <StatusBar></StatusBar>
        <router-view></router-view>
      </div>
    `,
  })

  // Mount the component with both router and pinia
  const wrapper = mount(TestComponent, {
    global: {
      plugins: [router, pinia],
      stubs: {},
      components: {
        FAIcon: {
          name: 'FAIcon',
          render() {
            return h('i', { class: 'mock-icon' }, 'icon')
          },
        },
        FormKit: {
          name: 'FormKit',
          render() {
            return h('i', { class: 'mock-icon' }, 'icon')
          },
        },
      },
    },
  })

  await router.isReady()

  // Get API instance and set mode explicitly
  const api = wrapper.vm.api
  api.config.mode = mode // Add this line to ensure mode is set correctly

  api.resetStore()

  // Add spy on completeConsent
  vi.spyOn(api, 'setDone')
  vi.spyOn(api, 'completeConsent')
  vi.spyOn(api, 'resetApp')

  // Add guards with the API instance from the component
  addGuards(router, api)

  await router.push('/welcome')
  await flushPromises()

  return { wrapper, router, timeline, api } //, completeConsentSpy, resetAppSpy, setDoneSpy }
}

// resets the local storage.  simulates deleting it in the browser
function resetLocalStorage() {
  localStorage.setItem(appconfig.localStorageKey, null)
}

// sets a json version of data in local storage
function setLocalStorage(data) {
  localStorage.setItem(appconfig.localStorageKey, JSON.stringify(data))
}

// returns the local storage as a javascript object
function getLocalStorage() {
  return JSON.parse(localStorage.getItem(appconfig.localStorageKey))
}

describe('useRouter methods', () => {
  describe('Generic virtual browser tests (persists local storage)', () => {
    beforeAll(() => {
      setupBrowserEnvironment()
    })

    beforeEach(() => {
      vi.clearAllMocks()

      // this is commented out because it doesn't nuke local storage
      // Reset the store state by clearing localStorage and recreating pinia
      // window.localStorage.clear()
      // // Create a fresh pinia instance for each test
      // const pinia = createPinia()
      // setActivePinia(pinia)
    })

    afterEach(() => {
      const { wrapper } = this
      if (wrapper) {
        wrapper.unmount()
      }
    })

    /* there are some basic sanity checks */
    it('localstorage is modified by writing to it', () => {
      localStorage.setItem('test', 'test')
      expect(localStorage.getItem('test')).toBe('test')
    })

    // it isn't ideal that state maintains between tests, but
    // it does unless you reset the storage each time in beforeEach()
    // this just test if the key test survived from the previous test
    it('localstorage survives between tests', () => {
      expect(localStorage.getItem('test')).toBe('test')
    })

    it('there should be no smilestore before the app created', () => {
      resetLocalStorage()
      expect(getLocalStorage()).toBe(null)
    })

    it('there should be smilestore state after the app started', async () => {
      const { router } = await setupApp()
      await router.isReady()
      // local storage created here by the import of the useSmileStore in the app
      expect(getLocalStorage()).not.toBe(null)
    })

    it('there should be no localstorage if it is reset', async () => {
      const { router } = await setupApp()
      await router.isReady()
      resetLocalStorage()
      expect(getLocalStorage()).toBe(null)
    })

    it('should render welcome_anonymous when accessing /', async () => {
      const { router, api } = await setupApp()
      resetLocalStorage()
      router.push('/')
      await router.isReady()
      expect(router.currentRoute.value.name).toBe('welcome_anonymous') // have to use .value.name here to unpack reactivity mechanism
    })
  })

  describe('Basic router functions', () => {
    beforeAll(() => {
      setupBrowserEnvironment()
    })

    beforeEach(() => {
      vi.clearAllMocks()

      // this nuckes the local storage and pinia making
      // it like a new user
      // Reset the store state by clearing localStorage and recreating pinia
      window.localStorage.clear()
      // Create a fresh pinia instance for each test
      const pinia = createPinia()
      setActivePinia(pinia)
    })

    afterEach(() => {
      const { wrapper } = this
      if (wrapper) {
        wrapper.unmount()
      }
    })

    it('should render router view', async () => {
      const { wrapper } = await setupApp()
      expect(wrapper.html()).toContain('test-wrapper')
      expect(wrapper.html()).toContain('Welcome Anonymous')
    })

    it('should create a router with the correct routes', async () => {
      const { router, timeline } = await setupApp()
      expect(router).toBeDefined()
      const routes = router.getRoutes()
      expect(routes.length).toBeGreaterThan(0)

      // Check that all routes from the timeline are in the router
      timeline.routes.forEach((route) => {
        const routerRoute = routes.find((r) => r.name === route.name)
        expect(routerRoute).toBeDefined()
        expect(routerRoute.path).toBe(route.path)
      })
    })

    it('should navigate between routes', async () => {
      const { router, api, wrapper } = await setupApp()

      // Start at welcome
      await api.goToView('welcome_anonymous')
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('welcome_anonymous')
      expect(wrapper.html()).toContain('Welcome Anonymous')

      // Navigate to consent
      await api.goToView('consent')
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('consent')
      expect(wrapper.html()).toContain('Consent')
    })
  })

  describe('Basic navigation tests', () => {
    beforeAll(() => {
      setupBrowserEnvironment()
    })

    beforeEach(() => {
      vi.clearAllMocks()

      // this nuckes the local storage and pinia making
      // it like a new user
      // Reset the store state by clearing localStorage and recreating pinia
      window.localStorage.clear()
      // Create a fresh pinia instance for each test
      const pinia = createPinia()
      setActivePinia(pinia)
    })

    afterEach(() => {
      const { wrapper } = this
      if (wrapper) {
        wrapper.unmount()
      }
    })

    // test prolific
    it('should render welcome_referred when accessing a prolific route', async () => {
      const { wrapper, router, api } = await setupApp()

      router.push('/welcome/prolific?test=test')
      await router.isReady()
      await flushPromises() // Add extra wait for redirect
      expect(api.store.browserPersisted.lastRoute).toBe('welcome_referred')
      expect(router.currentRoute.value.name).toBe('welcome_referred') // have to use .value.name here to unpack reactivity mechanism
    })

    // test cloudresearch
    it('should render welcome_referred when accessing a cloudresearch route', async () => {
      const { wrapper, router, api } = await setupApp()
      router.push('/welcome/cloudresearch?test=test')
      await router.isReady()
      await flushPromises() // Add extra wait for redirect
      expect(api.store.browserPersisted.lastRoute).toBe('welcome_referred')
      expect(router.currentRoute.value.name).toBe('welcome_referred') // have to use .value.name here to unpack reactivity mechanism
    })

    // test mturk
    it('should render welcome_referred when accessing a mturk route', async () => {
      const { wrapper, router, api } = await setupApp()
      router.push('/welcome/mturk?test=test')
      await router.isReady()
      await flushPromises() // Add extra wait for redirect
      expect(api.store.browserPersisted.lastRoute).toBe('welcome_referred')
      expect(router.currentRoute.value.name).toBe('welcome_referred') // have to use .value.name here to unpack reactivity mechanism
    })

    // test citizen science site
    it('should render welcome_referred when accessing a citizen science route', async () => {
      const { wrapper, router, api } = await setupApp()
      router.push('/welcome/citizen?test=test')
      await router.isReady()
      await flushPromises() // Add extra wait for redirect
      expect(api.store.browserPersisted.lastRoute).toBe('welcome_referred')
      expect(router.currentRoute.value.name).toBe('welcome_referred') // have to use .value.name here to unpack reactivity mechanism
    })

    it('should navigate through the createTestTimeline sequential timeline', async () => {
      const { router, api } = await setupApp()
      await api.goToView('welcome_anonymous')
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('welcome_anonymous')

      await api.goNextView()
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('consent')

      await api.goNextView()
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('demograph')

      await api.goNextView()
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('instructions')

      await api.goNextView()
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('quiz')

      await api.goNextView()
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('exp')

      await api.goNextView()
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('debrief')

      await api.goNextView()
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('feedback')

      await api.goNextView()
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('thanks') // resets

      await api.goNextView()
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('welcome_anonymous')
    })
  })

  describe('Behavior with different modes', () => {
    beforeAll(() => {
      setupBrowserEnvironment()
    })

    beforeEach(() => {
      vi.clearAllMocks()

      // this nuckes the local storage and pinia making
      // it like a new user
      // Reset the store state by clearing localStorage and recreating pinia
      window.localStorage.clear()
      // Create a fresh pinia instance for each test
      const pinia = createPinia()
      setActivePinia(pinia)
    })

    afterEach(() => {
      const { wrapper } = this
      if (wrapper) {
        wrapper.unmount()
      }
    })

    it('should have landing route in production mode', async () => {
      const { router, api } = await setupApp('production')
      await router.push('/')
      await flushPromises()
      // check mode is production
      expect(api.config.mode).toBe('production')
      expect(router.currentRoute.value.name).toBe('welcome_anonymous')
    })

    it('should have recruit route in development mode', async () => {
      const { router } = await setupApp('development')
      await router.push('/')
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('recruit')
    })

    it('should have presentation_home route in presentation mode', async () => {
      const { router } = await setupApp('presentation')
      await router.push('/')
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('presentation_home')
    })
  })

  describe('Side effects of navigation', () => {
    beforeAll(() => {
      setupBrowserEnvironment()
    })

    beforeEach(() => {
      vi.clearAllMocks()

      // this nuckes the local storage and pinia making
      // it like a new user
      // Reset the store state by clearing localStorage and recreating pinia
      window.localStorage.clear()
      // Create a fresh pinia instance for each test
      const pinia = createPinia()
      setActivePinia(pinia)
    })

    afterEach(() => {
      const { wrapper } = this
      if (wrapper) {
        wrapper.unmount()
      }
    })

    it('should set isConsent and isKnownUser when leaving /consent', async () => {
      const { router, api } = await setupApp()
      expect(api.store.isKnownUser).toBe(false)
      expect(api.store.isConsented).toBe(false)
      await api.goToView('welcome_anonymous')
      await flushPromises()
      expect(api.store.browserPersisted.lastRoute).toBe('welcome_anonymous')

      await api.goNextView()
      await flushPromises()
      expect(api.store.browserPersisted.lastRoute).toBe('consent')

      await api.goNextView()
      await flushPromises()
      expect(api.store.browserPersisted.lastRoute).toBe('demograph')

      expect(api.completeConsent).toHaveBeenCalled()

      expect(api.store.isConsented).toBe(true)
      expect(api.store.isKnownUser).toBe(true)
    })

    it('should set isDone when leaving /feedback', async () => {
      const { router, api } = await setupApp()
      await api.goToView('welcome_anonymous')
      await flushPromises()
      expect(api.store.browserPersisted.lastRoute).toBe('welcome_anonymous')

      await api.goNextView()
      await flushPromises()
      expect(api.store.browserPersisted.lastRoute).toBe('consent')

      await api.goToView('feedback')
      await flushPromises()
      expect(api.store.browserPersisted.lastRoute).toBe('feedback')

      await api.goNextView()
      await flushPromises()
      expect(api.store.browserPersisted.lastRoute).toBe('thanks')

      expect(api.setDone).toHaveBeenCalled()
      expect(api.store.isConsented).toBe(true)
      expect(api.store.isKnownUser).toBe(true)
      expect(api.store.isDone).toBe(true)
    })

    // test reset app and starting over
    it('should reset app when navigating to thanks', async () => {
      const { router, api } = await setupApp()
      await api.goToView('welcome_anonymous')
      await flushPromises()
      expect(api.store.browserPersisted.lastRoute).toBe('welcome_anonymous')

      await api.goNextView()
      await flushPromises()
      expect(api.store.browserPersisted.lastRoute).toBe('consent')

      await api.goToView('feedback')
      await flushPromises()
      expect(api.store.browserPersisted.lastRoute).toBe('feedback')

      await api.goNextView()
      await flushPromises()
      expect(api.store.browserPersisted.lastRoute).toBe('thanks')
      expect(api.resetApp).toHaveBeenCalled()
    })

    it('should not reset app when navigating to thanks 2', async () => {
      const { router, api } = await setupApp()
      await api.goToView('welcome_anonymous')
      await flushPromises()
      expect(api.store.browserPersisted.lastRoute).toBe('welcome_anonymous')

      await api.goNextView()
      await flushPromises()
      expect(api.store.browserPersisted.lastRoute).toBe('consent')

      await api.goToView('feedback')
      await flushPromises()
      expect(api.store.browserPersisted.lastRoute).toBe('feedback')

      await api.goToView('thanks2')
      await flushPromises()
      expect(api.store.browserPersisted.lastRoute).toBe('thanks2')
      expect(api.resetApp).not.toHaveBeenCalled()
    })

    it('should set withdraw when the user has withdrawn', async () => {})

    it('should allow repeats if app has been reset', async () => {})

    it('should not allow repeats if app has not been reset', async () => {})
  })

  describe('Advanced routerguard logic', () => {
    beforeAll(() => {
      setupBrowserEnvironment()
    })

    beforeEach(() => {
      vi.clearAllMocks()

      // this nuckes the local storage and pinia making
      // it like a new user
      // Reset the store state by clearing localStorage and recreating pinia
      window.localStorage.clear()
      // Create a fresh pinia instance for each test
      const pinia = createPinia()
      setActivePinia(pinia)
    })

    afterEach(() => {
      const { wrapper } = this
      if (wrapper) {
        wrapper.unmount()
      }
    })

    it('show allow navigation to routes with allowAlways=true', async () => {
      const { router, api, wrapper } = await setupApp()

      await api.goToView('welcome_anonymous')
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('welcome_anonymous')
      expect(wrapper.html()).toContain('Welcome Anonymous')

      await api.goToView('always_allow')
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('always_allow')
    })

    it('should set user as consented when navigating from a route with setConsented=true', async () => {
      const { router, api, wrapper } = await setupApp()

      await api.goToView('welcome_anonymous')
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('welcome_anonymous')
      expect(wrapper.html()).toContain('Welcome Anonymous')

      await api.goToView('consent')
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('consent')
      expect(wrapper.html()).toContain('Consent')

      // Now navigate away from consent to trigger the guard
      await api.goToView('demograph')
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('demograph')
      expect(wrapper.html()).toContain('Demograph')

      expect(api.isResetApp()).toBe(false)
      expect(api.completeConsent).toHaveBeenCalled()
    })

    it('should mark user as done when navigating from a route with setDone=true', async () => {
      const { router, api, wrapper } = await setupApp()

      await api.goToView('feedback')
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('feedback')
      expect(wrapper.html()).toContain('Feedback')

      await api.goToView('thanks')
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('thanks')
      expect(wrapper.html()).toContain('Thanks')
      expect(api.setDone).toHaveBeenCalled()
      expect(api.store.isDone).toBe(true)
    })

    it('should redirect unknown users to welcome_anonymous', async () => {
      const { router } = await setupApp()

      await router.push({ name: 'demograph' })
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('welcome_anonymous')
    })

    it('should allow known users to navigate to their last route', async () => {
      const { router, api, wrapper } = await setupApp()

      api.setKnown()
      api.store.setLastRoute('demograph')

      await api.goToView('demograph')
      await flushPromises()

      expect(router.currentRoute.value.name).toBe('demograph')
      expect(wrapper.html()).toContain('Demograph')
    })

    it('should redirect known users trying to access unauthorized routes back to their last route in production', async () => {
      const { router, api } = await setupApp('production')

      // Set user as known and set last route
      api.setKnown()
      api.setConsented()
      api.store.setLastRoute('demograph')

      await api.goToView('demograph', false) // this mimics a click rather than a API navigation
      await flushPromises()

      // Try to navigate to a different route
      await api.goToView('instructions', false) // this mimics a click rather than a API navigation
      await flushPromises()

      expect(router.currentRoute.value.name).toBe('demograph')
    })

    it('should redirect unconsented users back to last route in production', async () => {
      const { router, api } = await setupApp('production')

      // Set user as known and set last route
      await api.goToView('welcome_anonymous')
      await flushPromises()
      await api.goToView('consent', false)
      await flushPromises()
      // await api.goToView('consent', false) // this mimics a click rather than a API navigation
      // await flushPromises()

      // Try to navigate to a different route
      await api.goToView('instructions', false) // this mimics a click rather than a API navigation
      await flushPromises()

      expect(router.currentRoute.value.name).toBe('welcome_anonymous')
    })

    it('should redirect unconsented users back to last route in production', async () => {
      const { router, api } = await setupApp('production')

      // Set user as known and set last route
      await api.goToView('welcome_anonymous')
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('welcome_anonymous')
      await api.goNextView()
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('consent')
      expect(api.store.browserPersisted.lastRoute).toBe('consent')
      // await api.goToView('consent', false) // this mimics a click rather than a API navigation
      // await flushPromises()

      // Try to navigate to a different route
      await api.goToView('instructions', false) // this mimics a click rather than a API navigation
      await flushPromises()

      expect(router.currentRoute.value.name).toBe('consent')
    })

    it('should redirect known users trying to access unauthorized routes back to their last route in production', async () => {
      const { router, api } = await setupApp()

      // Set user as known and set last route
      api.config.mode = 'production'
      api.setKnown()
      api.store.setLastRoute('demograph')

      await api.goToView('demograph') // this is an API navigation
      await flushPromises()

      // Try to navigate to a different route
      await api.goToView('instructions') // this is an API navigation
      await flushPromises()

      expect(router.currentRoute.value.name).toBe('instructions')
    })

    it('should redirect to withdraw page if user has withdrawn', async () => {
      const { router, api } = await setupApp()

      api.store.setWithdrawn()

      await api.goToView('demograph', false)
      await flushPromises()

      expect(router.currentRoute.value.name).toBe('withdraw')
    })

    it('should allow navigation to withdraw page if user has withdrawn', async () => {
      const { router, api } = await setupApp()

      api.config.mode = 'todd'
      api.store.setWithdrawn()

      await api.goToView('withdraw', false)
      await flushPromises()
      expect(router.currentRoute.value.name).toBe('withdraw')
    })
  })

  describe('Dev mode logic', () => {
    beforeAll(() => {
      setupBrowserEnvironment()
    })

    beforeEach(() => {
      vi.clearAllMocks()

      // this nuckes the local storage and pinia making
      // it like a new user
      // Reset the store state by clearing localStorage and recreating pinia
      window.localStorage.clear()
      // Create a fresh pinia instance for each test
      const pinia = createPinia()
      setActivePinia(pinia)
    })

    afterEach(() => {
      const { wrapper } = this
      if (wrapper) {
        wrapper.unmount()
      }
    })

    it('should allow known users trying to access any route in dev mode', async () => {
      const { router, api } = await setupApp('development')

      // Set user as known and set last route
      api.setKnown()
      api.store.setLastRoute('demograph')

      await api.goToView('demograph') // this mimics a click rather than a API execution
      await flushPromises()

      // Try to navigate to a different route
      await api.goToView('instructions') // this mimics a click rather than a API execution
      await flushPromises()

      expect(router.currentRoute.value.name).toBe('instructions')
    })
  })
})
