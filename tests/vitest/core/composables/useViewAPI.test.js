// general testing functions
import { defineComponent, h, markRaw } from 'vue'
import { setActivePinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createTestingPinia } from '@pinia/testing'
import { mount, flushPromises } from '@vue/test-utils'
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest'

// import shared mocks
import '../../setup/mocks' // Import shared mocks
import { setupBrowserEnvironment } from '../../setup/mocks'

/* eslint-disable no-undef */
// Mock the config import before any other imports
vi.mock('@/core/config', () => ({
  default: {
    mode: 'production',
    localStorageKey: 'smile_test',
    devLocalStorageKey: 'smile_dev_test',
  },
}))

// import the composable
import useViewAPI from '@/core/composables/useViewAPI'

// Helper function to set up Pinia
const setupPinia = () => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
  return pinia
}

// Helper function to get mock component and its API
const getMockComponentAndAPI = (wrapper) => {
  const mockComponent = wrapper.findComponent({ name: 'MockComponent' })
  return {
    component: mockComponent,
    api: mockComponent.vm.api,
  }
}

// Create a test component that uses the composable
const TestComponent = defineComponent({
  template: `
<div>
  <router-view></router-view>
</div>
`,
})

// Create a mock component for routes
const MockComponent = (text = 'Mock Component') =>
  defineComponent({
    name: 'MockComponent',
    setup() {
      const api = useViewAPI()
      return { api }
    },
    template: `<div>${text}</div>`,
  })

// Define test routes
const routes = [
  {
    id: '/',
    name: 'welcome_anonymous',
    component: MockComponent('Welcome Anonymous'),
    meta: { next: 'landing', allowAlways: true },
  },
  {
    id: '/landing',
    name: 'landing',
    component: MockComponent('Landing'),
    meta: { prev: 'welcome_anonymous', next: 'test', sequential: true },
  },
  {
    id: '/test',
    name: 'test',
    component: MockComponent('Test'),
    meta: { prev: 'landing', sequential: true },
  },
]

describe('useViewAPI composable', () => {
  let wrapper

  beforeAll(() => {
    setupBrowserEnvironment()
  })

  beforeEach(async () => {
    // Reset the ViewAPI instance
    useViewAPI._reset()
    // Reset mock state
    vi.clearAllMocks()

    // Create pinia instance
    const pinia = setupPinia()

    // Create a fresh router for each test
    const router = createRouter({
      history: createWebHashHistory(),
      routes,
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

    // Navigate to the first route and wait for it to be ready
    await router.push('/')
    await router.isReady()
    await flushPromises()
  })

  afterEach(async () => {
    // Clear any persisted state
    const mockComponent = wrapper.findComponent({ name: 'MockComponent' })
    if (mockComponent && mockComponent.vm.api) {
      mockComponent.vm.api.clear()
      mockComponent.vm.api.clearPersist()
    }

    wrapper.unmount()
  })

  it('should provide all core API functionality plus view-specific features', () => {
    // Get API from the MockComponent instance
    const { api } = getMockComponentAndAPI(wrapper)
    // Check core API functionality
    expect(api.store).toBeDefined()
    expect(api.config).toBeDefined()
    expect(api.data).toBeDefined()
    expect(api.private).toBeDefined()

    // Check view-specific functionality
    expect(api.steps).toBeDefined()
    expect(api.stepData).toBeDefined()
    expect(api.pathString).toBeDefined()
    expect(api.path).toBeDefined()
    expect(api.length).toBeDefined()
    expect(api.nSteps).toBeDefined()
    expect(api.persist).toBeDefined()
    expect(api.blockIndex).toBeDefined()
    expect(api.blockLength).toBeDefined()
    expect(api.isLastStep).toBeDefined()
    expect(api.isLastBlockStep).toBeDefined()

    // Check stepper control methods
    expect(api.goNextStep).toBeInstanceOf(Function)
    expect(api.goPrevStep).toBeInstanceOf(Function)
    expect(api.goFirstStep).toBeInstanceOf(Function)
    expect(api.goToStep).toBeInstanceOf(Function)
    expect(api.hasNextStep).toBeInstanceOf(Function)
    expect(api.hasPrevStep).toBeInstanceOf(Function)
    expect(api.hasSteps).toBeInstanceOf(Function)

    // Check timing methods
    expect(api.startTimer).toBeInstanceOf(Function)
    expect(api.isTimerStarted).toBeInstanceOf(Function)
    expect(api.elapsedTime).toBeInstanceOf(Function)
    expect(api.elapsedTimeInSeconds).toBeInstanceOf(Function)
    expect(api.elapsedTimeInMinutes).toBeInstanceOf(Function)

    // Check data recording methods
    expect(api.recordStep).toBeInstanceOf(Function)
    expect(api.queryStepData).toBeInstanceOf(Function)
    expect(api.clear).toBeInstanceOf(Function)
    expect(api.clearPersist).toBeInstanceOf(Function)
  })

  it('should handle stepper navigation correctly', async () => {
    const { api } = getMockComponentAndAPI(wrapper)
    // Add steps directly using api.steps
    api.steps.append([
      { id: 'step1', test: 'value' },
      { id: 'step2', test: 'value2' },
    ])

    expect(api.nSteps).toBe(2) // appended
    expect(api.pathString).toBe('step1')
    expect(api.stepData).toEqual({ id: 'step1', test: 'value' })

    // Test next step
    expect(api.hasNextStep()).toBe(true)
    api.goNextStep()
    expect(api.pathString).toBe('step2')

    // Test previous step
    expect(api.hasPrevStep()).toBe(true)
    api.goPrevStep()
    expect(api.pathString).toBe('step1')

    // // Test go to specific step
    api.goToStep('step2')
    expect(api.pathString).toBe('step2')

    // Test first step
    api.goFirstStep()
    expect(api.pathString).toBe('step1')
  })

  it('should handle stepIndex and boundary conditions correctly', async () => {
    const { api } = getMockComponentAndAPI(wrapper)

    // Add a sequence of steps
    api.steps.append([
      { id: 'start', test: 'start' },
      { id: 'middle1', test: 'middle1' },
      { id: 'middle2', test: 'middle2' },
      { id: 'end', test: 'end' },
    ])

    // Verify initial state
    expect(api.nSteps).toBe(4)
    expect(api.stepIndex).toBe(0)
    expect(api.pathString).toBe('start')
    expect(api.hasPrevStep()).toBe(false)
    expect(api.hasNextStep()).toBe(true)

    // Walk through the sequence
    api.goNextStep()
    expect(api.stepIndex).toBe(1)
    expect(api.pathString).toBe('middle1')
    expect(api.hasPrevStep()).toBe(true)
    expect(api.hasNextStep()).toBe(true)

    api.goNextStep()
    expect(api.stepIndex).toBe(2)
    expect(api.pathString).toBe('middle2')
    expect(api.hasPrevStep()).toBe(true)
    expect(api.hasNextStep()).toBe(true)

    api.goNextStep()
    expect(api.stepIndex).toBe(3)
    expect(api.pathString).toBe('end')
    expect(api.hasPrevStep()).toBe(true)
    expect(api.hasNextStep()).toBe(false)

    // Walk backwards
    api.goPrevStep()
    expect(api.stepIndex).toBe(2)
    expect(api.pathString).toBe('middle2')
    expect(api.hasPrevStep()).toBe(true)
    expect(api.hasNextStep()).toBe(true)

    api.goPrevStep()
    expect(api.stepIndex).toBe(1)
    expect(api.pathString).toBe('middle1')
    expect(api.hasPrevStep()).toBe(true)
    expect(api.hasNextStep()).toBe(true)

    api.goPrevStep()
    expect(api.stepIndex).toBe(0)
    expect(api.pathString).toBe('start')
    expect(api.hasPrevStep()).toBe(false)
    expect(api.hasNextStep()).toBe(true)

    // Test jumping to specific indices
    api.goToStep('end')
    expect(api.stepIndex).toBe(3)
    expect(api.pathString).toBe('end')

    api.goToStep('start')
    expect(api.stepIndex).toBe(0)
    expect(api.pathString).toBe('start')
  })

  it.skip('should handle complex nested state construction and navigation', async () => {
    const { api } = getMockComponentAndAPI(wrapper)

    // Create initial trial structure
    const trials = api.steps.append([
      {
        id: 'trial',
        rt: 0,
        hit: 0,
        response: '',
      },
      { id: 'summary' },
    ])

    // Create a factorial design with multiple dimensions
    trials[0]
      .outer({
        color: ['red', 'blue'],
        size: ['small', 'large'],
        shape: ['square', 'circle'],
      })
      .forEach((row) => {
        // Create a unique identifier for each combination
        const pathString =
          (row.data.color === 'red' ? 'r' : 'b') +
          (row.data.size === 'small' ? 's' : 'l') +
          (row.data.shape === 'square' ? 's' : 'c')
        row.data.path = pathString
        row.id = pathString
      })

    // Wait for state machine updates to complete
    await new Promise((resolve) => setTimeout(resolve, 100))
    // Verify the structure was created correctly
    expect(api.nSteps).toBe(9) // 8 factorial combinations + 1 summary step
    expect(api.pathString).toBe('trial/rss')

    // Verify we can access the data for each combination
    const allData = api.queryStepData('trial*')
    console.log('All data:', allData) // Debug log
    expect(allData.length).toBe(8) // 8 factorial combinations + 1 summary step

    // Check that each combination has all required properties
    allData.forEach((combo) => {
      expect(combo).toHaveProperty('color')
      expect(combo).toHaveProperty('size')
      expect(combo).toHaveProperty('shape')
      expect(combo).toHaveProperty('rt')
      expect(combo).toHaveProperty('hit')
      expect(combo).toHaveProperty('response')
      // expect(combo).toHaveProperty('id')
    })

    // Verify we can navigate through all combinations
    let visitedPaths = new Set()
    while (api.hasNextStep()) {
      const currentData = api.stepData
      expect(currentData).toHaveProperty('color')
      visitedPaths.add(currentData.path)
      api.goNextStep()
    }

    console.log('visitedPaths', visitedPaths)
    // Verify we visited all combinations
    expect(visitedPaths.size).toBe(8)

    // Verify we end up at the summary step
    expect(api.pathString).toBe('summary')

    // Verify we can go back through all combinations
    while (api.hasPrevStep()) {
      api.goPrevStep()
      const currentData = api.stepData
      expect(currentData).toHaveProperty('color')
    }

    // Verify we're back at the start
    expect(api.pathString).toBe('trial/rss')
    expect(api.stepIndex).toBe(0)
  })

  it('should handle dynamic state addition and navigation', async () => {
    const { api } = getMockComponentAndAPI(wrapper)

    await flushPromises()
    api.clear()

    // Add initial states
    api.steps.append([
      { id: 'initial1', test: 'value1' },
      { id: 'initial2', test: 'value2' },
    ])

    //console.log('api.steps', api.steps._states)

    // Verify initial state
    expect(api.nSteps).toBe(2)
    expect(api.pathString).toBe('initial1')
    expect(api.stepData).toEqual({ id: 'initial1', test: 'value1' })

    // Navigate to the end of initial states
    api.goNextStep()
    expect(api.pathString).toBe('initial2')
    expect(api.stepData).toEqual({ id: 'initial2', test: 'value2' })

    // Add more states while at the end
    api.steps.append([
      { id: 'dynamic1', test: 'value3' },
      { id: 'dynamic2', test: 'value4' },
    ])

    // Verify we can now navigate to the new states
    expect(api.nSteps).toBe(4)
    expect(api.hasNextStep()).toBe(true)

    api.goNextStep()
    expect(api.pathString).toBe('dynamic1')
    expect(api.stepData).toEqual({ id: 'dynamic1', test: 'value3' })

    api.goNextStep()
    expect(api.pathString).toBe('dynamic2')
    expect(api.stepData).toEqual({ id: 'dynamic2', test: 'value4' })

    // Verify we can go back through all states
    api.goPrevStep()
    expect(api.pathString).toBe('dynamic1')

    api.goPrevStep()
    expect(api.pathString).toBe('initial2')

    api.goPrevStep()
    expect(api.pathString).toBe('initial1')
  })

  it('should handle timing methods correctly', async () => {
    const { api } = getMockComponentAndAPI(wrapper)
    // Add steps using api.steps
    api.steps.append([
      { id: 'step1', data: { value: 1 } },
      { id: 'step2', data: { value: 2 } },
    ])

    // Mock Date.now
    const mockNow = 1000000
    vi.spyOn(Date, 'now').mockReturnValue(mockNow)

    // Test timer start
    api.startTimer('test')
    expect(api.persist.startTime_test).toBe(mockNow)

    // Test timer started check
    expect(api.isTimerStarted('test')).toBe(mockNow)
    expect(api.isTimerStarted('nonexistent')).toBe(false)

    // Test elapsed time calculations
    const laterTime = mockNow + 5000 // 5 seconds later
    vi.spyOn(Date, 'now').mockReturnValue(laterTime)

    expect(api.elapsedTime('test')).toBe(5000)
    expect(api.elapsedTimeInSeconds('test')).toBe(5)
    expect(api.elapsedTimeInMinutes('test')).toBe(5 / 60)
  })

  it('should correctly track hierarchical indices and lengths', async () => {
    const { api } = getMockComponentAndAPI(wrapper)

    // Create a hierarchical structure with blocks and steps
    const trials = api.steps.append([
      {
        id: 'practice',
        type: 'block',
        data: { blockType: 'practice' },
      },
      {
        id: 'main',
        type: 'block',
        data: { blockType: 'main' },
      },
    ])

    // Add practice trials with initial data
    trials[0].append([
      {
        id: 'trial1',
        trialType: 'practice1',
        responses: [1, 2, 3],
        difficulty: 'easy',
      },
      {
        id: 'trial2',
        trialType: 'practice2',
        responses: [4, 5, 6],
        difficulty: 'medium',
      },
    ])

    // Add main trials directly
    trials[1].append([
      {
        id: 'A_easy',
        condition: 'A',
        difficulty: 'easy',
        responses: [],
      },
      {
        id: 'A_hard',
        condition: 'A',
        difficulty: 'hard',
        responses: [],
      },
      {
        id: 'B_easy',
        condition: 'B',
        difficulty: 'easy',
        responses: [],
      },
      {
        id: 'B_hard',
        condition: 'B',
        difficulty: 'hard',
        responses: [],
      },
    ])

    // Wait for state machine updates
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Test initial state
    expect(api.pathString).toBe('practice/trial1')
    expect(api.stepIndex).toBe(0) // First step overall
    expect(api.blockIndex).toBe(0) // First trial in practice block
    expect(api.blockLength).toBe(2) // Two trials in practice block
    expect(api.nSteps).toBe(6) // Total steps: 2 practice + 4 main trials

    // Move to second practice trial
    api.goNextStep()
    expect(api.pathString).toBe('practice/trial2')
    expect(api.stepIndex).toBe(1) // Second step overall
    expect(api.blockIndex).toBe(1) // Second trial in practice block
    expect(api.blockLength).toBe(2) // Two trials in practice block
    expect(api.nSteps).toBe(6) // Total steps unchanged

    // Move to first main trial
    api.goNextStep()
    expect(api.pathString).toBe('main/A_easy')
    expect(api.stepIndex).toBe(2) // Third step overall
    expect(api.blockIndex).toBe(0) // First trial in main block
    expect(api.blockLength).toBe(4) // Four trials in main block
    expect(api.nSteps).toBe(6) // Total steps unchanged

    // Move through main trials
    api.goNextStep()
    expect(api.pathString).toBe('main/A_hard')
    expect(api.stepIndex).toBe(3)
    expect(api.blockIndex).toBe(1)
    expect(api.blockLength).toBe(4)

    api.goNextStep()
    expect(api.pathString).toBe('main/B_easy')
    expect(api.stepIndex).toBe(4)
    expect(api.blockIndex).toBe(2)
    expect(api.blockLength).toBe(4)

    api.goNextStep()
    expect(api.pathString).toBe('main/B_hard')
    expect(api.stepIndex).toBe(5)
    expect(api.blockIndex).toBe(3)
    expect(api.blockLength).toBe(4)

    // Verify we can't go further
    expect(api.hasNextStep()).toBe(false)

    // Go back through the trials
    api.goPrevStep()
    expect(api.pathString).toBe('main/B_easy')
    expect(api.stepIndex).toBe(4)
    expect(api.blockIndex).toBe(2)
    expect(api.blockLength).toBe(4)

    api.goPrevStep()
    expect(api.pathString).toBe('main/A_hard')
    expect(api.stepIndex).toBe(3)
    expect(api.blockIndex).toBe(1)
    expect(api.blockLength).toBe(4)

    api.goPrevStep()
    expect(api.pathString).toBe('main/A_easy')
    expect(api.stepIndex).toBe(2)
    expect(api.blockIndex).toBe(0)
    expect(api.blockLength).toBe(4)

    api.goPrevStep()
    expect(api.pathString).toBe('practice/trial2')
    expect(api.stepIndex).toBe(1)
    expect(api.blockIndex).toBe(1)
    expect(api.blockLength).toBe(2)

    api.goPrevStep()
    expect(api.pathString).toBe('practice/trial1')
    expect(api.stepIndex).toBe(0)
    expect(api.blockIndex).toBe(0)
    expect(api.blockLength).toBe(2)

    // Verify we can't go back further
    expect(api.hasPrevStep()).toBe(false)
  })

  it.skip('should handle data recording and persistence correctly', async () => {
    // this test isn't checking the full integration it is just
    // spying on literal function
    const { api } = getMockComponentAndAPI(wrapper)
    // Add steps using api.steps
    api.steps.append([
      { id: 'step1', test: 'value' },
      { id: 'step2', test: 'value2' },
    ])

    // Test step data access
    expect(api.stepData).toEqual({ id: 'step1', test: 'value' })

    // Test data recording
    const recordPageDataSpy = vi.spyOn(api, 'recordPageData')
    api.recordStep()
    expect(recordPageDataSpy).toHaveBeenCalledWith({ id: 'step1', test: 'value' })

    // Test stepper data retrieval
    const data = api.queryStepData()
    expect(data).toEqual([
      { id: 'step1', test: 'value' },
      { id: 'step2', test: 'value2' },
    ])

    // Test clearing data
    const clearSpy = vi.spyOn(api, 'clear')
    api.clear()
    expect(clearSpy).toHaveBeenCalled()

    // Test clearing persistence
    const clearPersistSpy = vi.spyOn(api, 'clearPersist')
    api.clearPersist()
    expect(clearPersistSpy).toHaveBeenCalled()
  })

  it('should ignore keyboard navigation in production mode', async () => {
    const { api } = getMockComponentAndAPI(wrapper)
    // Add steps using api.steps
    api.steps.append([
      { id: 'step1', test: 'value' },
      { id: 'step2', test: 'value2' },
    ])

    expect(api.config.mode).toBe('production')
    // Verify initial state
    expect(api.pathString).toBe('step1')
    expect(api.stepData).toEqual({ id: 'step1', test: 'value' })

    // Simulate right arrow key press
    const rightEvent = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
    })
    document.dispatchEvent(rightEvent)
    await flushPromises()

    // Verify we did not move to next step
    expect(api.pathString).toBe('step1')
    expect(api.stepData).toEqual({ id: 'step1', test: 'value' })

    // Simulate left arrow key press
    const leftEvent = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      bubbles: true,
    })
    document.dispatchEvent(leftEvent)
    await flushPromises()

    // Verify we did not move back to previous step
    expect(api.pathString).toBe('step1')
    expect(api.stepData).toEqual({ id: 'step1', test: 'value' })
  })

  it('should handle dynamic component rendering and navigation', async () => {
    const { api } = getMockComponentAndAPI(wrapper)

    // Create a simple test component
    const TestStepComponent = defineComponent({
      name: 'TestStepComponent',
      props: {
        message: {
          type: String,
          required: true,
        },
      },
      setup() {
        const api = useViewAPI()
        return { api }
      },
      template: `<div class="test-step">{{ message }}</div>`,
    })

    // Add steps with components
    api.steps.append([
      {
        id: 'step1',
        component: markRaw(TestStepComponent),
        props: { message: 'Step 1' },
      },
      {
        id: 'step2',
        component: markRaw(TestStepComponent),
        props: { message: 'Step 2' },
      },
      {
        id: 'step3',
        component: markRaw(TestStepComponent),
        props: { message: 'Step 3' },
      },
    ])

    // Verify initial state
    expect(api.nSteps).toBe(3)
    expect(api.pathString).toBe('step1')
    expect(api.stepData.component).toStrictEqual(TestStepComponent)
    expect(api.stepData.props.message).toBe('Step 1')

    // Navigate through steps
    api.goNextStep()
    expect(api.pathString).toBe('step2')
    expect(api.stepData.component).toStrictEqual(TestStepComponent)
    expect(api.stepData.props.message).toBe('Step 2')

    api.goNextStep()
    expect(api.pathString).toBe('step3')
    expect(api.stepData.component).toStrictEqual(TestStepComponent)
    expect(api.stepData.props.message).toBe('Step 3')

    // Go back
    api.goPrevStep()
    expect(api.pathString).toBe('step2')
    expect(api.stepData.component).toStrictEqual(TestStepComponent)
    expect(api.stepData.props.message).toBe('Step 2')

    // Go to specific step
    api.goToStep('step1')
    expect(api.pathString).toBe('step1')
    expect(api.stepData.component).toStrictEqual(TestStepComponent)
    expect(api.stepData.props.message).toBe('Step 1')
  })

  it('should handle faker functions as data properties', async () => {
    const { api } = getMockComponentAndAPI(wrapper)

    // Mock faker functions
    const mockRnorm = vi.fn().mockReturnValue(450)
    const mockRbinom = vi.fn().mockReturnValue(1)
    const mockRchoice = vi.fn().mockReturnValue('test')

    // Add mock faker to api
    api.faker = {
      rnorm: mockRnorm,
      rbinom: mockRbinom,
      rchoice: mockRchoice,
    }

    // Add steps with faker functions as data properties
    api.steps.append([
      {
        id: 'trial1',
        rt: () => api.faker.rnorm(500, 50),
        hit: () => api.faker.rbinom(1, 0.8),
        response: () => api.faker.rchoice(['a', 'b', 'c']),
      },
      {
        id: 'trial2',
        rt: () => api.faker.rnorm(500, 50),
        hit: () => api.faker.rbinom(1, 0.8),
        response: () => api.faker.rchoice(['a', 'b', 'c']),
      },
    ])

    // Verify initial state
    expect(api.nSteps).toBe(2)
    expect(api.pathString).toBe('trial1')

    // Access and verify faker functions are called
    expect(api.stepData.rt()).toBe(450)
    expect(mockRnorm).toHaveBeenCalledWith(500, 50)

    expect(api.stepData.hit()).toBe(1)
    expect(mockRbinom).toHaveBeenCalledWith(1, 0.8)

    expect(api.stepData.response()).toBe('test')
    expect(mockRchoice).toHaveBeenCalledWith(['a', 'b', 'c'])

    // Step to next trial and verify faker functions are called again
    api.goNextStep()
    expect(api.pathString).toBe('trial2')

    expect(api.stepData.rt()).toBe(450)
    expect(mockRnorm).toHaveBeenCalledTimes(2)

    expect(api.stepData.hit()).toBe(1)
    expect(mockRbinom).toHaveBeenCalledTimes(2)

    expect(api.stepData.response()).toBe('test')
    expect(mockRchoice).toHaveBeenCalledTimes(2)
  })

  it('should handle autofill functionality', async () => {
    const { api } = getMockComponentAndAPI(wrapper)

    // Mock faker functions
    const mockRnorm = vi.fn().mockReturnValue(450)
    const mockRbinom = vi.fn().mockReturnValue(1)
    const mockRchoice = vi.fn().mockReturnValue('test')

    // Add mock faker to api
    api.faker = {
      rnorm: mockRnorm,
      rbinom: mockRbinom,
      rchoice: mockRchoice,
      render: vi.fn().mockImplementation((data) => {
        // Simulate filling in the data
        data.rt = { val: mockRnorm() }
        data.hit = { val: mockRbinom() }
        data.response = { val: mockRchoice() }
      }),
    }

    // Add steps with faker functions as data properties
    api.steps.append([
      {
        id: 'trial1',
        rt: () => api.faker.rnorm(500, 50),
        hit: () => api.faker.rbinom(1, 0.8),
        response: () => api.faker.rchoice(['a', 'b', 'c']),
      },
      {
        id: 'trial2',
        rt: () => api.faker.rnorm(500, 50),
        hit: () => api.faker.rbinom(1, 0.8),
        response: () => api.faker.rchoice(['a', 'b', 'c']),
      },
      { id: 'summary' },
    ])

    // Define autofill function similar to StroopView
    function autofill() {
      while (!api.isLastStep()) {
        // Changed condition to nSteps - 1
        if (api.pathString.includes('trial')) {
          api.faker.render(api.stepData)
          api.goNextStep()
        }
      }
    }

    // Verify initial state
    expect(api.nSteps).toBe(3)
    expect(api.pathString).toBe('trial1')

    // Wait for any pending updates
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Run autofill
    autofill()

    // Verify final state
    expect(api.pathString).toBe('summary')
    expect(api.stepIndex).toBe(api.nSteps - 1) // Changed to nSteps - 1

    // Verify faker was called correctly
    expect(api.faker.render).toHaveBeenCalledTimes(2) // Called for each trial + summary
    expect(mockRnorm).toHaveBeenCalledTimes(2)
    expect(mockRbinom).toHaveBeenCalledTimes(2)
    expect(mockRchoice).toHaveBeenCalledTimes(2)

    // Verify data was recorded
    const recordedData = api.queryStepData()
    expect(recordedData).toHaveLength(3) // 2 trials + summary
    expect(recordedData[0].rt.val).toBe(450)
    expect(recordedData[0].hit.val).toBe(1)
    expect(recordedData[0].response.val).toBe('test')
  })

  it.skip('should support chainable methods and async update', async () => {
    const api = useViewAPI()

    // Test that modifier methods return the stepper instance (not a promise)
    const stepper = api.steps.append([{ data: 'test1' }])
    expect(stepper).toBe(api.steps)
    expect(stepper instanceof Promise).toBe(false)

    // Test that we can await the update
    await updatePromise

    // Test that we can chain after update
    const finalStepper = await stepper.append([{ data: 'test2' }])
    expect(finalStepper).toBe(api.steps)
    expect(finalStepper instanceof Promise).toBe(false)

    // Verify the data was actually written
    expect(api.steps._states.length).toBe(2)
  })

  it('should handle stepData and stepDataLeaf correctly with hierarchical structure', async () => {
    const { api } = getMockComponentAndAPI(wrapper)

    // Create a hierarchical structure with blocks and steps
    const trials = api.steps.append([
      {
        id: 'practice',
        type: 'block',
        blockType: 'practice',
      },
      {
        id: 'main',
        type: 'block',
        blockType: 'main',
      },
    ])

    // Add practice trials with initial data
    trials[0].append([
      {
        id: 'trial1',
        trialType: 'practice1',
        responses: [1, 2, 3],
        difficulty: 'easy',
      },
      {
        id: 'trial2',
        trialType: 'practice2',
        responses: [4, 5, 6],
        difficulty: 'medium',
      },
    ])

    // Add main trials directly
    trials[1].append([
      {
        id: 'A_easy',
        condition: 'A',
        difficulty: 'easy',
        responses: [],
      },
      {
        id: 'A_hard',
        condition: 'A',
        difficulty: 'hard',
        responses: [],
      },
      {
        id: 'B_easy',
        condition: 'B',
        difficulty: 'easy',
        responses: [],
      },
      {
        id: 'B_hard',
        condition: 'B',
        difficulty: 'hard',
        responses: [],
      },
    ])

    // Wait for state machine updates
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Test initial state
    expect(api.pathString).toBe('practice/trial1')

    // Test stepData (includes block data)
    expect(api.stepData.blockType).toBe('practice')
    expect(api.stepData.trialType).toBe('practice1')
    expect(api.stepData.responses).toEqual([1, 2, 3])
    expect(api.stepData.difficulty).toBe('easy')

    // Test stepDataLeaf (only current step data)
    expect(api.stepDataLeaf.trialType).toBe('practice1')
    expect(api.stepDataLeaf.responses).toEqual([1, 2, 3])
    expect(api.stepDataLeaf.difficulty).toBe('easy')
    expect(api.stepDataLeaf.blockType).toBeUndefined()

    // Test modifying data through stepData
    api.stepData.responses[0] = 10
    api.stepData.difficulty = 'hard'
    expect(api.stepData.responses).toEqual([10, 2, 3])
    expect(api.stepData.difficulty).toBe('hard')

    // Test modifying data through stepDataLeaf
    api.stepDataLeaf.responses[1] = 20
    api.stepDataLeaf.difficulty = 'very hard'
    expect(api.stepDataLeaf.responses).toEqual([10, 20, 3])
    expect(api.stepDataLeaf.difficulty).toBe('very hard')

    // Move to next step
    api.goNextStep()
    expect(api.pathString).toBe('practice/trial2')

    // Verify stepData includes block data
    expect(api.stepData.blockType).toBe('practice')
    expect(api.stepData.trialType).toBe('practice2')
    expect(api.stepData.responses).toEqual([4, 5, 6])
    expect(api.stepData.difficulty).toBe('medium')

    // Verify stepDataLeaf only includes current step data
    expect(api.stepDataLeaf.trialType).toBe('practice2')
    expect(api.stepDataLeaf.responses).toEqual([4, 5, 6])
    expect(api.stepDataLeaf.difficulty).toBe('medium')
    expect(api.stepDataLeaf.blockType).toBeUndefined()

    // Move to first main trial
    api.goNextStep()
    expect(api.pathString).toBe('main/A_easy')

    // Verify stepData includes block data
    expect(api.stepData.blockType).toBe('main')
    expect(api.stepData.condition).toBe('A')
    expect(api.stepData.difficulty).toBe('easy')
    expect(api.stepData.responses).toEqual([])

    // Verify stepDataLeaf only includes current step data
    expect(api.stepDataLeaf.condition).toBe('A')
    expect(api.stepDataLeaf.difficulty).toBe('easy')
    expect(api.stepDataLeaf.responses).toEqual([])
    expect(api.stepDataLeaf.blockType).toBeUndefined()

    // Test modifying data through stepData
    api.stepData.responses.push(1)
    api.stepData.difficulty = 'very easy'
    expect(api.stepData.responses).toEqual([1])
    expect(api.stepData.difficulty).toBe('very easy')
    // Verify changes appear in stepDataLeaf
    expect(api.stepDataLeaf.responses).toEqual([1])
    expect(api.stepDataLeaf.difficulty).toBe('very easy')

    // Test modifying data through stepDataLeaf
    api.stepDataLeaf.responses.push(2)
    api.stepDataLeaf.difficulty = 'super easy'
    expect(api.stepDataLeaf.responses).toEqual([1, 2])
    expect(api.stepDataLeaf.difficulty).toBe('super easy')
    // Verify changes appear in stepData
    expect(api.stepData.responses).toEqual([1, 2])
    expect(api.stepData.difficulty).toBe('super easy')

    // Move to next main trial
    api.goNextStep()
    expect(api.pathString).toBe('main/A_hard')

    // Verify data is preserved for previous trial
    const allData = api.queryStepData()
    const previousTrialData = allData.find((d) => d.path === 'main/A_easy')

    // Instead of checking the previous trial directly, let's go back to it
    api.goPrevStep()
    expect(api.pathString).toBe('main/A_easy')
    expect(api.stepData.responses).toEqual([1, 2])
    expect(api.stepData.difficulty).toBe('super easy')
    expect(api.stepDataLeaf.responses).toEqual([1, 2])
    expect(api.stepDataLeaf.difficulty).toBe('super easy')

    // Go forward again to verify current trial
    api.goNextStep()
    expect(api.pathString).toBe('main/A_hard')
    expect(api.stepData.responses).toEqual([])
    expect(api.stepData.difficulty).toBe('hard')
    expect(api.stepDataLeaf.responses).toEqual([])
    expect(api.stepDataLeaf.difficulty).toBe('hard')

    // Test modifying data through stepData again
    api.stepData.responses.push(3)
    api.stepData.difficulty = 'very hard'
    expect(api.stepData.responses).toEqual([3])
    expect(api.stepData.difficulty).toBe('very hard')
    // Verify changes appear in stepDataLeaf
    expect(api.stepDataLeaf.responses).toEqual([3])
    expect(api.stepDataLeaf.difficulty).toBe('very hard')

    // Test modifying data through stepDataLeaf again
    api.stepDataLeaf.responses.push(4)
    api.stepDataLeaf.difficulty = 'extremely hard'
    expect(api.stepDataLeaf.responses).toEqual([3, 4])
    expect(api.stepDataLeaf.difficulty).toBe('extremely hard')
    // Verify changes appear in stepData
    expect(api.stepData.responses).toEqual([3, 4])
    expect(api.stepData.difficulty).toBe('extremely hard')
  })

  it.skip('should persist step state across reloads', async () => {
    // Create a mock storage object to track localStorage operations
    const mockStorage = {}
    const mockLocalStorage = {
      getItem: vi.fn((key) => mockStorage[key] || null),
      setItem: vi.fn((key, value) => {
        mockStorage[key] = value
      }),
      removeItem: vi.fn((key) => {
        delete mockStorage[key]
      }),
      clear: vi.fn(() => {
        Object.keys(mockStorage).forEach((key) => delete mockStorage[key])
      }),
    }

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })

    console.log('api created')
    const { api } = getMockComponentAndAPI(wrapper)

    // Add steps using api.steps
    api.steps.append([
      { id: 'step1', data: { value: 1 } },
      { id: 'step2', data: { value: 2 } },
    ])

    api.persist.simpleValue = 42
    // Navigate to second step
    api.goNextStep()
    expect(api.pathString).toBe('step2')
    expect(api.stepData).toEqual({ id: 'step2', data: { value: 2 } })

    // Verify localStorage was updated
    expect(mockLocalStorage.setItem).toHaveBeenCalled()
    const storedData = JSON.parse(mockStorage['smile_test'] || '{}')
    expect(storedData).toHaveProperty('viewSteppers')
    expect(storedData.viewSteppers).toHaveProperty('welcome_anonymous')
    expect(storedData.viewSteppers.welcome_anonymous).toHaveProperty('data')
    expect(storedData.viewSteppers.welcome_anonymous.data).toHaveProperty('stepperState')
    expect(storedData.viewSteppers.welcome_anonymous.data.stepperState).toHaveProperty('data')
    expect(storedData.viewSteppers.welcome_anonymous.data.stepperState.data).toHaveProperty('gvars')
    expect(storedData.viewSteppers.welcome_anonymous.data.stepperState.data.gvars).toHaveProperty('simpleValue')
    expect(storedData.viewSteppers.welcome_anonymous.data.stepperState.data.gvars.simpleValue).toBe(42)

    // Simulate reload by unmounting and remounting
    wrapper.unmount()

    // Create a fresh router and pinia
    const pinia = setupPinia()
    const router = createRouter({
      history: createWebHashHistory(),
      routes,
    })

    // Remount the component
    wrapper = mount(TestComponent, {
      global: {
        plugins: [router, pinia],
        stubs: {
          RouterLink: true,
        },
      },
    })

    // Wait for router to be ready and navigate to the initial route
    await router.push('/')
    await router.isReady()
    await flushPromises()

    // Wait for the route to be properly initialized
    await new Promise((resolve) => setTimeout(resolve, 10))

    // Get the new API instance
    console.log('newApi being created')
    const { api: newApi } = getMockComponentAndAPI(wrapper)

    // Verify we're still on the second step
    expect(newApi.persist.simpleValue).toBe(42)
    expect(newApi.pathString).toBe('step2')
    expect(newApi.stepData).toEqual({ id: 'step2', data: { value: 2 } })

    // Verify localStorage was read during initialization
    expect(mockLocalStorage.getItem).toHaveBeenCalled()
  })
})
