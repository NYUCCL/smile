/* eslint-disable no-undef */
// general testing functions
import { defineComponent, h } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createTestingPinia } from '@pinia/testing'
import { mount, flushPromises } from '@vue/test-utils'
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest'

// import shared mocks
import '../../setup/mocks' // Import shared mocks
import { setupBrowserEnvironment } from '../../setup/mocks'

// import the composable
import useAPI from '@/core/composables/useAPI'

// Create a test component that uses the composable
const TestComponent = defineComponent({
  setup() {
    const api = useAPI()
    return { api }
  },
  render() {
    return h('div')
  },
})

// Create mock route components
const MockComponent = defineComponent({
  render() {
    return h('div', 'Mock Page')
  },
})

// Define test routes
const routes = [
  {
    path: '/',
    name: 'welcome_anonymous',
    component: MockComponent,
    meta: { next: 'landing', allowAlways: true },
  },
  {
    path: '/landing',
    name: 'landing',
    component: MockComponent,
    meta: { prev: 'welcome_anonymous', next: 'test', sequential: true },
  },
  {
    path: '/test',
    name: 'test',
    component: MockComponent,
    meta: { prev: 'landing', sequential: true },
  },
]

describe('useAPI composable', () => {
  let router
  let wrapper
  let api

  beforeAll(() => {
    setupBrowserEnvironment()
  })

  beforeEach(() => {
    // Reset mock state
    vi.clearAllMocks()

    // Create a fresh router for each test
    router = createRouter({
      history: createWebHashHistory(),
      routes,
    })

    // Create a fresh pinia for each test with initial state

    // Create pinia instance
    const pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn,
    })

    // Mount the test component
    wrapper = mount(TestComponent, {
      global: {
        plugins: [router, pinia],
        stubs: {
          RouterLink: true,
        },
      },
    })

    // Get API and create spies
    api = wrapper.vm.api

    // Create spies for all methods
    vi.spyOn(api.log, 'debug')
    vi.spyOn(api.log, 'log')
    vi.spyOn(api.log, 'warn')
    vi.spyOn(api.log, 'error')
    vi.spyOn(api.log, 'success')
    vi.spyOn(api.log, 'clearPageHistory')
    vi.spyOn(api.log, 'addToHistory')
    vi.spyOn(api.store, 'resetApp')
    vi.spyOn(api.store, 'resetLocal')
    vi.spyOn(window.localStorage, 'removeItem')
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('should provide the expected properties and methods', () => {
    // Check store access
    expect(api.store).toBeDefined()
    expect(api.config).toBeDefined()
    expect(api.data).toBeDefined()
    expect(api.private).toBeDefined()
    // expect(api.store.browserPersisted).toBeDefined()
    // expect(api.store.browserEphemeral).toBeDefined()
    // expect(api.store.dev).toBeDefined()

    // Check router related methods
    expect(api.route).toBeDefined()
    expect(api.router).toBeDefined()
    expect(api.goNextView).toBeInstanceOf(Function)
    expect(api.goPrevView).toBeInstanceOf(Function)
    expect(api.goToView).toBeInstanceOf(Function)
    expect(api.hasNextView).toBeInstanceOf(Function)
    expect(api.hasPrevView).toBeInstanceOf(Function)

    // Check randomization utilities
    expect(api.faker).toBeDefined()
    expect(api.randomInt).toBeInstanceOf(Function)
    expect(api.shuffle).toBeInstanceOf(Function)
    expect(api.sampleWithReplacement).toBeInstanceOf(Function)
    expect(api.sampleWithoutReplacement).toBeInstanceOf(Function)

    // Check URL helpers
    expect(api.urls).toBeDefined()
    expect(api.getPublicUrl).toBeInstanceOf(Function)
    expect(api.getCoreStaticUrl).toBeInstanceOf(Function)
    expect(api.getStaticUrl).toBeInstanceOf(Function)

    // Check app state management
    expect(api.resetApp).toBeInstanceOf(Function)
    expect(api.isResetApp).toBeInstanceOf(Function)
    expect(api.resetStore).toBeInstanceOf(Function)
    expect(api.resetLocalState).toBeInstanceOf(Function)

    // Check app component management
    expect(api.setAppComponent).toBeInstanceOf(Function)
    expect(api.getAppComponent).toBeInstanceOf(Function)

    // Check config management
    expect(api.setRuntimeConfig).toBeInstanceOf(Function)
    expect(api.getConfig).toBeInstanceOf(Function)

    // Check user state management
    expect(api.setKnown).toBeInstanceOf(Function)
    expect(api.setDone).toBeInstanceOf(Function)
    expect(api.setConsented).toBeInstanceOf(Function)
    expect(api.setWithdrawn).toBeInstanceOf(Function)
    expect(api.recordForm).toBeInstanceOf(Function)
    expect(api.recordProperty).toBeInstanceOf(Function)

    // Check browser checks
    expect(api.isBrowserTooSmall).toBeInstanceOf(Function)
    expect(api.verifyVisibility).toBeInstanceOf(Function)
    expect(api.getVerifiedVisibility).toBeInstanceOf(Function)

    // Check development tools
    expect(api.setAutofill).toBeInstanceOf(Function)
    expect(api.removeAutofill).toBeInstanceOf(Function)

    // Check completion and recruitment
    expect(api.setCompletionCode).toBeInstanceOf(Function)
    expect(api.getRecruitmentService).toBeInstanceOf(Function)

    expect(api.hasAutofill).toBeInstanceOf(Function)
    expect(api.autofill).toBeInstanceOf(Function)
    expect(api.currentRouteName).toBeInstanceOf(Function)
    expect(api.getConditionByName).toBeInstanceOf(Function)
    expect(api.getBrowserFingerprint).toBeInstanceOf(Function)

    // Check event and trial management
    expect(api.recordWindowEvent).toBeInstanceOf(Function)

    // Check data and save methods
    expect(api.saveData).toBeInstanceOf(Function)
    expect(api.recordData).toBeInstanceOf(Function)
    expect(api.recordPageData).toBeInstanceOf(Function)
    expect(api.computeCompletionCode).toBeInstanceOf(Function)

    // Check randomization and conditions
    expect(api.randomSeed).toBeInstanceOf(Function)
    expect(api.randomAssignCondition).toBeInstanceOf(Function)

    // Check image preloading
    expect(api.preloadAllImages).toBeInstanceOf(Function)

    // Check consent management
    expect(api.completeConsent).toBeInstanceOf(Function)
  })

  it('should handle timeline methods correctly', async () => {
    // Create spies for the API methods
    const goNextViewSpy = vi.spyOn(api, 'goNextView')
    const goPrevViewSpy = vi.spyOn(api, 'goPrevView')
    const gotoViewSpy = vi.spyOn(api, 'goToView')

    // Navigate to the landing page
    api.goToView('landing')
    await flushPromises()

    // Check if the route meta is correctly set
    expect(router.currentRoute.value.meta).toBeDefined()
    expect(router.currentRoute.value.meta.next).toBeDefined()

    // Test goNextView
    api.goNextView()
    expect(goNextViewSpy).toHaveBeenCalled()

    // Test goPrevView
    api.goPrevView()
    expect(goPrevViewSpy).toHaveBeenCalled()

    // Test gotoView
    api.goToView('test')
    expect(gotoViewSpy).toHaveBeenCalledWith('test')
  })

  it('should check if next and previous views are available', async () => {
    // Navigate to the landing page
    api.goToView('landing')
    await flushPromises()

    // Check if the route meta is correctly set
    expect(router.currentRoute.value.meta).toBeDefined()
    expect(router.currentRoute.value.meta.next).toBeDefined()
    expect(router.currentRoute.value.meta.prev).toBeDefined()
    expect(router.currentRoute.value.meta.sequential).toBeDefined()

    // Check if next and previous views are available
    expect(api.hasNextView()).toBe(true)
    expect(api.hasPrevView()).toBe(true)

    // Navigate to the test page

    api.goToView('test')
    await flushPromises()

    // Check if only previous view is available
    expect(api.hasNextView()).toBe(false)
    expect(api.hasPrevView()).toBe(true)
  })

  it('should get URL helpers correctly', () => {
    expect(api.getPublicUrl('test.png')).toMatch(/^\/[^/]+\/[^/]+\/[^/]+\/test\.png$/)
    //expect(api.getCoreStaticUrl('test.png')).toContain('test.png')
    //expect(api.getStaticUrl('test.png')).toContain('test.png')
  })

  it('should reset app state correctly', () => {
    // Test resetApp
    api.resetApp()
    expect(api.store.resetApp).toHaveBeenCalled()

    // Test resetStore
    api.resetStore()
    expect(api.store.resetLocal).toHaveBeenCalled()

    // Test resetLocalState
    api.resetLocalState()
    expect(window.localStorage.removeItem).toHaveBeenCalledWith(api.config.localStorageKey)
    expect(api.store.resetLocal).toHaveBeenCalled()
  })

  it('should manage app components correctly', () => {
    api.setAppComponent('test', 'TestComponent')
    expect(api.config.global_app_components.test).toBe('TestComponent')

    expect(api.getAppComponent('test')).toBe('TestComponent')
  })

  it('should manage runtime config correctly', () => {
    // Test setting existing config
    api.setRuntimeConfig('mode', 'testing')
    expect(api.config.mode).toBe('testing')

    // Test setting new runtime config
    api.setRuntimeConfig('newSetting', 'value')
    expect(api.config.runtime.newSetting).toBe('value')

    // Test getting existing config
    expect(api.getConfig('mode')).toBe('testing')

    // Test getting runtime config
    expect(api.getConfig('newSetting')).toBe('value')

    // Test getting non-existent config
    expect(api.getConfig('nonExistent')).toBeNull()
    //expect(errorSpy).toHaveBeenCalled()
  })

  it('should handle logging correctly', () => {
    // Test log methods
    api.log.debug('test debug')
    expect(api.log.debug).toHaveBeenCalledWith('test debug')

    api.log.log('test log')
    expect(api.log.log).toHaveBeenCalledWith('test log')

    api.log.warn('test warn')
    expect(api.log.warn).toHaveBeenCalledWith('test warn')

    api.log.error('test error')
    expect(api.log.error).toHaveBeenCalledWith('test error')

    api.log.success('test success')
    expect(api.log.success).toHaveBeenCalledWith('test success')

    api.log.clearPageHistory()
    expect(api.log.clearPageHistory).toHaveBeenCalled()

    api.log.addToHistory('test history')
    expect(api.log.addToHistory).toHaveBeenCalledWith('test history')
  })

  describe('recordPageData', () => {
    it('should create pageData_<routeName> field with visit_0 structure', async () => {
      // Navigate to landing page so we have a route name
      await router.push('/landing')
      await flushPromises()

      // Simulate route being recorded in routeOrder (first visit)
      api.store.data.routeOrder = [{ route: 'landing', timestamp: Date.now() }]

      api.recordPageData({ response: 'test', rt: 100 })

      expect(api.data.pageData_landing).toBeDefined()
      expect(api.data.pageData_landing.visit_0).toBeDefined()
      expect(api.data.pageData_landing.visit_0.timestamps).toBeInstanceOf(Array)
      expect(api.data.pageData_landing.visit_0.timestamps).toHaveLength(1)
      expect(api.data.pageData_landing.visit_0.data).toBeInstanceOf(Array)
      expect(api.data.pageData_landing.visit_0.data).toHaveLength(1)
      expect(api.data.pageData_landing.visit_0.data[0]).toEqual({ response: 'test', rt: 100 })
    })

    it('should append to same visit on multiple calls within same visit', async () => {
      await router.push('/landing')
      await flushPromises()

      api.store.data.routeOrder = [{ route: 'landing', timestamp: Date.now() }]

      // First call
      api.recordPageData({ trial: 1 })
      // Second call (same visit)
      api.recordPageData({ trial: 2 })

      expect(api.data.pageData_landing.visit_0.timestamps).toHaveLength(2)
      expect(api.data.pageData_landing.visit_0.data).toHaveLength(2)
      expect(api.data.pageData_landing.visit_0.data[0]).toEqual({ trial: 1 })
      expect(api.data.pageData_landing.visit_0.data[1]).toEqual({ trial: 2 })
    })

    it('should create new visit_N structure when route is visited multiple times', async () => {
      await router.push('/landing')
      await flushPromises()

      // First visit
      api.store.data.routeOrder = [{ route: 'landing', timestamp: Date.now() }]
      api.recordPageData({ visit: 'first' })

      expect(api.data.pageData_landing.visit_0).toBeDefined()
      expect(api.data.pageData_landing.visit_0.data[0]).toEqual({ visit: 'first' })

      // Second visit (add another entry to routeOrder)
      api.store.data.routeOrder.push({ route: 'landing', timestamp: Date.now() + 1000 })
      api.recordPageData({ visit: 'second' })

      expect(api.data.pageData_landing.visit_1).toBeDefined()
      expect(api.data.pageData_landing.visit_1.data[0]).toEqual({ visit: 'second' })

      // Verify visit_0 is unchanged
      expect(api.data.pageData_landing.visit_0.data).toHaveLength(1)
    })

    it('should use explicit routeName parameter when provided', async () => {
      await router.push('/landing')
      await flushPromises()

      api.recordPageData({ data: 'test' }, 'custom_page')

      expect(api.data.pageData_custom_page).toBeDefined()
      expect(api.data.pageData_custom_page.visit_0).toBeDefined()
      expect(api.data.pageData_landing).toBeUndefined()
    })

    it('should log error when no route name available', () => {
      const errorSpy = vi.spyOn(api.logStore, 'error')

      // Call with explicit null routeName and ensure current route has no name
      // by not navigating anywhere first (route.name will be undefined at root)
      api.recordPageData({ data: 'test' }, null)

      // Since we're at root with no name and passed null, it should error
      // Actually the root route '/' has name 'welcome_anonymous', so let's test differently
      // Create a mock api with no route name using Object.defineProperty
      const originalRoute = api.route
      Object.defineProperty(api, 'route', {
        value: { name: undefined },
        writable: true,
        configurable: true,
      })

      api.recordPageData({ data: 'test' })

      expect(errorSpy).toHaveBeenCalledWith('SMILE API: recordPageData() - No route name available')

      // Restore
      Object.defineProperty(api, 'route', {
        value: originalRoute,
        writable: true,
        configurable: true,
      })
    })
  })

  describe('deprecated methods', () => {
    it('should log deprecation warning for recordForm', async () => {
      await router.push('/landing')
      await flushPromises()

      const warnSpy = vi.spyOn(api.logStore, 'warn')
      api.store.data.routeOrder = [{ route: 'landing', timestamp: Date.now() }]

      api.recordForm('testForm', { field: 'value' })

      expect(warnSpy).toHaveBeenCalledWith('SMILE API: recordForm() is deprecated. Use recordPageData() instead.')
    })

    it('should log deprecation warning for recordData', async () => {
      await router.push('/landing')
      await flushPromises()

      const warnSpy = vi.spyOn(api.logStore, 'warn')
      api.store.data.routeOrder = [{ route: 'landing', timestamp: Date.now() }]

      api.recordData({ trial: 1 })

      expect(warnSpy).toHaveBeenCalledWith('SMILE API: recordData() is deprecated. Use recordPageData() instead.')
    })

    it('should still record to studyData for backward compatibility', async () => {
      await router.push('/landing')
      await flushPromises()

      api.store.data.routeOrder = [{ route: 'landing', timestamp: Date.now() }]
      api.store.data.studyData = []

      api.recordData({ trial: 1 })

      // Should record to both old and new formats
      expect(api.store.data.studyData).toHaveLength(1)
      expect(api.data.pageData_landing).toBeDefined()
    })

    it('should reject arrays at top level (prevents nested arrays in Firestore)', async () => {
      await router.push('/landing')
      await flushPromises()

      api.store.data.routeOrder = [{ route: 'landing', timestamp: Date.now() }]
      const errorSpy = vi.spyOn(api.logStore, 'error')

      const result = api.recordPageData([1, 2, 3])

      expect(result).toBe(false)
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Data cannot be an array'))
      expect(api.data.pageData_landing).toBeUndefined()
    })

    it('should reject nested arrays within objects', async () => {
      await router.push('/landing')
      await flushPromises()

      api.store.data.routeOrder = [{ route: 'landing', timestamp: Date.now() }]
      const errorSpy = vi.spyOn(api.logStore, 'error')

      const result = api.recordPageData({
        items: [
          [1, 2],
          [3, 4],
        ],
      })

      expect(result).toBe(false)
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Nested arrays are not allowed'))
    })

    it('should reject functions in data', async () => {
      await router.push('/landing')
      await flushPromises()

      api.store.data.routeOrder = [{ route: 'landing', timestamp: Date.now() }]
      const errorSpy = vi.spyOn(api.logStore, 'error')

      const result = api.recordPageData({ callback: () => {} })

      expect(result).toBe(false)
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Functions are not supported'))
    })

    it('should reject invalid key names', async () => {
      await router.push('/landing')
      await flushPromises()

      api.store.data.routeOrder = [{ route: 'landing', timestamp: Date.now() }]
      const errorSpy = vi.spyOn(api.logStore, 'error')

      const result = api.recordPageData({ 'invalid.key': 'value' })

      expect(result).toBe(false)
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid key name'))
    })

    it('should allow valid nested objects with arrays of primitives', async () => {
      await router.push('/landing')
      await flushPromises()

      const result = api.recordPageData({
        responses: ['a', 'b', 'c'],
        nested: { values: [1, 2, 3] },
        meta: { name: 'test', count: 5 },
      })

      expect(result).toBe(true)
      expect(api.data.pageData_landing).toBeDefined()
      expect(api.data.pageData_landing.visit_0.data[0]).toEqual({
        responses: ['a', 'b', 'c'],
        nested: { values: [1, 2, 3] },
        meta: { name: 'test', count: 5 },
      })
    })

    it('should return true on successful recording', async () => {
      await router.push('/landing')
      await flushPromises()

      const result = api.recordPageData({ test: 'value' })

      expect(result).toBe(true)
    })

    it('should return false when no route name available', async () => {
      const originalRoute = api.route

      Object.defineProperty(api, 'route', {
        value: { name: undefined },
        writable: true,
        configurable: true,
      })

      const result = api.recordPageData({ test: 'value' })

      expect(result).toBe(false)

      Object.defineProperty(api, 'route', {
        value: originalRoute,
        writable: true,
        configurable: true,
      })
    })
  })

  describe('computeCompletionCode', () => {
    it('should generate completion code from pageData fields', async () => {
      await router.push('/landing')
      await flushPromises()

      api.store.data.routeOrder = [{ route: 'landing', timestamp: Date.now() }]
      api.recordPageData({ response: 'test' })

      const code = api.computeCompletionCode()

      expect(code).toBeDefined()
      expect(typeof code).toBe('string')
      expect(code.length).toBeGreaterThan(0)
    })

    it('should fall back to studyData when no pageData exists', () => {
      api.store.data.studyData = [{ trial: 1 }]

      const code = api.computeCompletionCode()

      expect(code).toBeDefined()
      expect(typeof code).toBe('string')
    })

    it('should append status suffix based on completion state', () => {
      api.store.data.studyData = [{ trial: 1 }]

      // Test completed state
      api.store.browserPersisted.done = true
      api.store.browserPersisted.withdrawn = false
      const completedCode = api.computeCompletionCode()
      expect(completedCode.endsWith('oo')).toBe(true)

      // Test withdrawn state
      api.store.browserPersisted.done = false
      api.store.browserPersisted.withdrawn = true
      const withdrawnCode = api.computeCompletionCode()
      expect(withdrawnCode.endsWith('xx')).toBe(true)
    })

    it('should be deterministic - same data produces same code', async () => {
      await router.push('/landing')
      await flushPromises()

      // Set up identical data twice
      api.store.data.pageData_landing = {
        visit_0: {
          timestamps: [1000],
          data: [{ response: 'test', rt: 500 }],
        },
      }

      const code1 = api.computeCompletionCode()
      const code2 = api.computeCompletionCode()

      expect(code1).toBe(code2)
    })

    it('should produce different codes for different data', async () => {
      await router.push('/landing')
      await flushPromises()

      // First data set
      api.store.data.pageData_landing = {
        visit_0: {
          timestamps: [1000],
          data: [{ response: 'A' }],
        },
      }
      const code1 = api.computeCompletionCode()

      // Different data set
      api.store.data.pageData_landing = {
        visit_0: {
          timestamps: [1000],
          data: [{ response: 'B' }],
        },
      }
      const code2 = api.computeCompletionCode()

      expect(code1).not.toBe(code2)
    })

    it('should generate code with correct length', () => {
      api.store.data.studyData = [{ trial: 1 }]

      // Without suffix (neither done nor withdrawn)
      api.store.browserPersisted.done = false
      api.store.browserPersisted.withdrawn = false
      const codeNoSuffix = api.computeCompletionCode()
      expect(codeNoSuffix.length).toBe(20)

      // With suffix (completed)
      api.store.browserPersisted.done = true
      const codeWithSuffix = api.computeCompletionCode()
      expect(codeWithSuffix.length).toBe(22) // 20 + 'oo'
    })

    it('should handle empty data gracefully', () => {
      api.store.data.studyData = []
      api.store.browserPersisted.done = false
      api.store.browserPersisted.withdrawn = false

      const code = api.computeCompletionCode()

      expect(code).toBeDefined()
      expect(typeof code).toBe('string')
      expect(code.length).toBe(20)
    })

    it('should prefer pageData over studyData when both exist', async () => {
      await router.push('/landing')
      await flushPromises()

      // Set up studyData
      api.store.data.studyData = [{ oldFormat: 'data' }]

      // Get code with only studyData
      const studyDataCode = api.computeCompletionCode()

      // Now add pageData
      api.store.data.pageData_landing = {
        visit_0: {
          timestamps: [1000],
          data: [{ newFormat: 'data' }],
        },
      }
      const pageDataCode = api.computeCompletionCode()

      // Codes should be different because pageData takes precedence
      expect(pageDataCode).not.toBe(studyDataCode)
    })

    it('should include all pageData fields in hash', async () => {
      await router.push('/landing')
      await flushPromises()

      // Set up one pageData field
      api.store.data.pageData_landing = {
        visit_0: {
          timestamps: [1000],
          data: [{ page: 'landing' }],
        },
      }
      const singleFieldCode = api.computeCompletionCode()

      // Add another pageData field
      api.store.data.pageData_trial = {
        visit_0: {
          timestamps: [2000],
          data: [{ page: 'trial' }],
        },
      }
      const multiFieldCode = api.computeCompletionCode()

      // Codes should be different when more data is added
      expect(multiFieldCode).not.toBe(singleFieldCode)
    })

    it('should prioritize withdrawn status over done status', () => {
      api.store.data.studyData = [{ trial: 1 }]

      // Both withdrawn and done are true
      api.store.browserPersisted.withdrawn = true
      api.store.browserPersisted.done = true

      const code = api.computeCompletionCode()

      // Should use withdrawn suffix, not completed
      expect(code.endsWith('xx')).toBe(true)
      expect(code.endsWith('oo')).toBe(false)
    })
  })
})
