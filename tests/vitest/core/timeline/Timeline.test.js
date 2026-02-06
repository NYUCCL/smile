/* eslint-disable no-undef */
//import axios from 'axios'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHashHistory } from 'vue-router'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import useAPI from '@/core/composables/useAPI'
import Timeline from '@/core/timeline/Timeline'

vi.mock('axios', () => ({
  get: vi.fn(() => Promise.resolve({ data: '127.0.0.1' })),
}))

describe('Timeline tests', () => {
  let router
  let pinia
  let api
  const MockComponent = { template: '<div>Mock Component</div>' }

  beforeEach(() => {
    // Create a router instance
    router = createRouter({
      history: createWebHashHistory(),
      routes: [{ path: '/', component: { template: '<div>Home</div>' } }],
    })

    // Create a test component that uses the API
    const TestComponent = defineComponent({
      setup() {
        api = useAPI()
        // Mock the required API properties
        api.config = {
          mode: 'production', // or 'development' or 'presentation' based on your needs
        }
        api.log = {
          debug: vi.fn(),
          error: vi.fn(),
          warn: vi.fn(),
          log: vi.fn(),
        }
        api.store = {
          getRandomizedRouteByName: vi.fn(),
          setRandomizedRoute: vi.fn(),
          registerStepper: vi.fn(),
          config: { mode: 'production' },
          browserPersisted: {},
        }
        return { api }
      },
      template: '<div>Test Component</div>',
    })

    // Create pinia instance and set it as active
    pinia = createTestingPinia({ stubActions: true })
    setActivePinia(pinia)

    // Mount the test component with router
    mount(TestComponent, {
      global: {
        plugins: [[router], [pinia]],
      },
    })
  })

  // Helper function to add required welcome route
  const addWelcomeRoute = (timeline) => {
    timeline.pushSeqView({
      path: '/welcome',
      name: 'welcome_anonymous',
      component: MockComponent,
    })
  }

  it('should be able to create a timeline', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)
    timeline.build()
    expect(timeline).toBeDefined()
  })

  it('should be able to add a route', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)

    timeline.pushSeqView({
      path: '/test-route',
      name: 'test_route',
      component: MockComponent,
    })

    timeline.build()
    expect(timeline.routes.length).toBe(3) // welcome + test route
  })

  it('should throw error on duplicate path', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)

    timeline.pushSeqView({
      path: '/test-route',
      name: 'test_route1',
      component: MockComponent,
    })

    expect(() => {
      timeline.pushSeqView({
        path: '/test-route',
        name: 'test_route2',
        component: MockComponent,
      })
    }).toThrow('DuplicatePathError:/test-route')
  })

  it('should throw error on duplicate name', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)

    timeline.pushSeqView({
      path: '/test-route1',
      name: 'test_route',
      component: MockComponent,
    })

    expect(() => {
      timeline.pushSeqView({
        path: '/test-route2',
        name: 'test_route',
        component: MockComponent,
      })
    }).toThrow('DuplicateNameError:test_route')
  })

  it('should add a sequential route', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)

    timeline.pushSeqView({
      path: '/test-route1',
      name: 'test_route',
      component: MockComponent,
    })
    expect(timeline.routes.length).toBe(3)
    expect(timeline.seqtimeline.length).toBe(2)
  })

  it('should add a nonsequential route', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)
    timeline.registerView({
      path: '/test-route1',
      name: 'test_route',
      component: MockComponent,
    })
    expect(timeline.routes.length).toBe(3)
    expect(timeline.seqtimeline.length).toBe(1)

    // non sequential routes should be null
    expect(timeline.routes[1].meta.prev).toBe(undefined) // should be null
    expect(timeline.routes[1].meta.next).toBe(undefined) // should be null
  })

  it('should leave next and prev undefined but meta defined if a sequential route', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)
    timeline.pushSeqView({
      path: '/test-route1',
      name: 'test_route',
      component: MockComponent,
      // meta: { prev: 'prev', next: 'next' },
    })
    expect(timeline.routes[1].meta).toBeDefined()
    expect(timeline.routes[1].meta.next).toBe(undefined)
    expect(timeline.routes[1].meta.prev).toBe(undefined)
  })

  it('should leave next or prev undefined if meta is configured for the other', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)
    timeline.pushSeqView({
      path: '/test-route1',
      name: 'test_route1',
      component: MockComponent,
      meta: { next: 'next' },
    })
    expect(timeline.routes[2].meta).toBeDefined()
    expect(timeline.routes[2].meta.next).toBe('next')
    expect(timeline.routes[2].meta.prev).toBe(undefined)

    const timeline2 = new Timeline(api)
    addWelcomeRoute(timeline2)
    timeline2.pushSeqView({
      path: '/test-route2',
      name: 'test_route2',
      component: MockComponent,
      meta: { prev: 'prev' },
    })
    expect(timeline2.routes[2].meta.next).toBe(undefined)
    expect(timeline2.routes[2].meta.prev).toBe('prev')

    const timeline3 = new Timeline(api)
    addWelcomeRoute(timeline3)
    timeline3.pushSeqView({
      path: '/test-route3',
      name: 'test_route3',
      component: MockComponent,
    })
    expect(timeline3.routes[2].meta.next).toBe(undefined)
    expect(timeline3.routes[2].meta.prev).toBe(undefined)
  })

  it('should raise an error if a nonsequential route has prev/next defined', () => {
    const timeline = new Timeline(api)

    const errorTrigger = () => {
      timeline.registerView({
        path: '/',
        name: 'index',
        component: MockComponent,
        meta: { prev: 'prev', next: 'next' }, // this should raise an error because nonsequential route
      })
    }
    expect(errorTrigger).toThrowError()
  })

  it('should add a nonsequential and sequential route', () => {
    const timeline = new Timeline(api)
    timeline.pushSeqView({
      path: '/one',
      name: 'one',
      component: MockComponent,
    })
    timeline.registerView({
      path: '/two',
      name: 'two',
      component: MockComponent,
    })
    expect(timeline.routes.length).toBe(2 + 1)
    expect(timeline.seqtimeline.length).toBe(1)
  })

  it('should not allow the same sequential route to be registered twice', () => {
    const timeline = new Timeline(api)
    timeline.pushSeqView({
      path: '/thanks',
      name: 'thank',
      component: MockComponent,
    })

    const errorTrigger = () => {
      timeline.pushSeqView({
        path: '/thanks',
        name: 'thanks',
        component: MockComponent,
      })
    }
    expect(errorTrigger).toThrowError()
    expect(timeline.routes.length).toBe(2)
    expect(timeline.seqtimeline.length).toBe(1) // only first one should work
  })

  it('should not allow the same non-sequential route to be registered twice', () => {
    const timeline = new Timeline(api)
    timeline.registerView({
      path: '/thanks',
      name: 'thank',
      component: MockComponent,
    })
    const errorTrigger = () => {
      timeline.registerView({
        path: '/thanks',
        name: 'thanks',
        component: MockComponent,
      })
    }
    expect(errorTrigger).toThrowError()
    expect(timeline.routes.length).toBe(2)
    expect(timeline.seqtimeline.length).toBe(0)
  })

  it('should not allow the same route to be registered twice', () => {
    const timeline = new Timeline(api)
    timeline.pushSeqView({
      path: '/thanks',
      name: 'thank',
      component: MockComponent,
    })
    const errorTrigger = () => {
      timeline.registerView({
        path: '/thanks',
        name: 'thanks',
        component: MockComponent,
      })
    }
    expect(errorTrigger).toThrowError()
    expect(timeline.routes.length).toBe(2)
    expect(timeline.seqtimeline.length).toBe(1) // only first one should work
  })

  it('cannot add a timeline to a timeline', () => {
    const timeline = new Timeline(api)
    const timeline2 = new Timeline(api)
    timeline.pushSeqView({
      path: '/first',
      name: 'first',
      component: MockComponent,
    })
    timeline2.registerView({
      path: '/mid1',
      name: 'mid1',
      component: MockComponent,
    })
    const errorTrigger = () => {
      timeline.pushRandomizedTimeline({
        name: timeline2,
      })
    }
    expect(errorTrigger).toThrowError()
  })

  it('build method should correctly configure a doubly linked list', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)
    timeline.pushSeqView({
      path: '/one',
      name: 'one',
      component: MockComponent,
    })
    timeline.pushSeqView({
      path: '/two',
      name: 'two',
      component: MockComponent,
    })
    timeline.pushSeqView({
      path: '/three',
      name: 'three',
      component: MockComponent,
    })
    timeline.pushSeqView({
      path: '/four',
      name: 'four',
      component: MockComponent,
    })
    timeline.build()

    expect(timeline.seqtimeline[0].meta.next).toBe('one')
    expect(timeline.seqtimeline[1].meta.next).toBe('two')
    expect(timeline.seqtimeline[2].meta.next).toBe('three')
    expect(timeline.seqtimeline[3].meta.next).toBe('four')
    expect(timeline.seqtimeline[4].meta.next).toBe(null)

    expect(timeline.seqtimeline[0].meta.prev).toBe(null)
    expect(timeline.seqtimeline[1].meta.prev).toBe('welcome_anonymous')
    expect(timeline.seqtimeline[2].meta.prev).toBe('one')
    expect(timeline.seqtimeline[3].meta.prev).toBe('two')
    expect(timeline.seqtimeline[4].meta.prev).toBe('three')
  })

  it('build method should handle single item timeline correctly', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)
    timeline.build()

    expect(timeline.seqtimeline[0].meta.next).toBe(null)
    expect(timeline.seqtimeline[0].meta.prev).toBe(null)
  })

  it('build method should configure a loop', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)
    timeline.pushSeqView({
      path: '/one',
      name: 'one',
      component: MockComponent,
    })
    timeline.pushSeqView({
      path: '/two',
      name: 'two',
      component: MockComponent,
    })
    timeline.pushSeqView({
      path: '/three',
      name: 'three',
      component: MockComponent,
    })
    timeline.pushSeqView({
      path: '/four',
      name: 'four',
      component: MockComponent,
      meta: { next: 'one' },
    })
    timeline.build()

    expect(timeline.seqtimeline[0].meta.next).toBe('one')
    expect(timeline.seqtimeline[1].meta.next).toBe('two')
    expect(timeline.seqtimeline[2].meta.next).toBe('three')
    expect(timeline.seqtimeline[3].meta.next).toBe('four')
    expect(timeline.seqtimeline[4].meta.next).toBe('one')

    expect(timeline.seqtimeline[0].meta.prev).toBe(null)
    expect(timeline.seqtimeline[1].meta.prev).toBe('welcome_anonymous')
    expect(timeline.seqtimeline[2].meta.prev).toBe('one')
    expect(timeline.seqtimeline[3].meta.prev).toBe('two')
    expect(timeline.seqtimeline[4].meta.prev).toBe('three')
  })

  it('build method should allow complex routes, disconnect sequences', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)
    timeline.pushSeqView({
      path: '/one-a',
      name: 'one',
      component: MockComponent,
      meta: { next: 'two' },
    })
    timeline.pushSeqView({
      path: '/one-b',
      name: 'one-b',
      component: MockComponent,
      meta: { next: 'two' },
    })
    // both flow into node two
    timeline.registerView({
      // this has not implicit successor
      path: '/two',
      name: 'two',
      component: MockComponent,
    }) // leaving this node has to happen with logic inside the component

    // let hand branch
    timeline.pushSeqView({
      path: '/three',
      name: 'three',
      component: MockComponent,
    })
    timeline.pushSeqView({
      path: '/four',
      name: 'four',
      component: MockComponent,
      meta: { next: 'one' },
    })
    timeline.registerView({
      // this has no implicit successor
      path: '/five',
      name: 'five',
      component: MockComponent,
    })

    // right hand branch
    timeline.pushSeqView({
      path: '/six',
      name: 'six',
      component: MockComponent,
    })
    timeline.pushSeqView({
      path: '/seven',
      name: 'seven',
      component: MockComponent,
    })
    timeline.registerView({
      // this has no implicit successor
      path: '/eight',
      name: 'eight',
      component: MockComponent,
    })

    timeline.build()

    // Check the sequence starting from welcome
    expect(timeline.seqtimeline[0].meta.next).toBe('one') // welcome -> one
    expect(timeline.seqtimeline[1].meta.next).toBe('two') // one -> two
    expect(timeline.seqtimeline[2].meta.next).toBe('two') // one-b -> two
    expect(timeline.seqtimeline[3].meta.next).toBe('four') // three -> four
    expect(timeline.seqtimeline[4].meta.next).toBe('one') // four -> one (loop)

    expect(timeline.seqtimeline[0].meta.prev).toBe(null) // welcome has no prev
    expect(timeline.seqtimeline[1].meta.prev).toBe('welcome_anonymous') // one prev is welcome
    expect(timeline.seqtimeline[2].meta.prev).toBe('one') // one-b prev is welcome
    expect(timeline.seqtimeline[3].meta.prev).toBe('one-b') // three prev is two
    expect(timeline.seqtimeline[4].meta.prev).toBe('three') // four prev is three
  })
  describe('Randomized nodes', () => {
    beforeEach(() => {
      // Mock store methods for randomized routes
      api.store.getRandomizedRouteByName = vi.fn().mockReturnValue(null)
      api.store.setRandomizedRoute = vi.fn()
      // Mock sampleWithReplacement to return first option deterministically
      api.sampleWithReplacement = vi.fn().mockImplementation((options) => [options[0]])
    })

    it('should push a randomized node and connect routes in correct order', () => {
      const timeline = new Timeline(api)
      addWelcomeRoute(timeline)

      // Register the views first (not in sequence)
      timeline.registerView({
        name: 'task1',
        component: MockComponent,
      })
      timeline.registerView({
        name: 'task2',
        component: MockComponent,
      })

      const options = [
        ['task1', 'task2'],
        ['task2', 'task1'],
      ]

      // Push the randomized node - will select first option ['task1', 'task2']
      timeline.pushRandomizedNode({
        name: 'randomOrder',
        options,
      })

      timeline.build()

      // Verify sampleWithReplacement was called with correct arguments
      expect(api.sampleWithReplacement).toHaveBeenCalledWith(options, 1, undefined)

      // Verify the selection was persisted
      expect(api.store.setRandomizedRoute).toHaveBeenCalledWith('randomOrder', ['task1', 'task2'])

      // Verify the sequential timeline has correct order
      expect(timeline.seqtimeline.length).toBe(3) // welcome + 2 tasks
      expect(timeline.seqtimeline[0].name).toBe('welcome_anonymous')
      expect(timeline.seqtimeline[1].name).toBe('task1')
      expect(timeline.seqtimeline[2].name).toBe('task2')

      // Verify next/prev links form correct traversal
      expect(timeline.seqtimeline[0].meta.next).toBe('task1')
      expect(timeline.seqtimeline[1].meta.next).toBe('task2')
      expect(timeline.seqtimeline[2].meta.next).toBe(null)

      expect(timeline.seqtimeline[0].meta.prev).toBe(null)
      expect(timeline.seqtimeline[1].meta.prev).toBe('welcome_anonymous')
      expect(timeline.seqtimeline[2].meta.prev).toBe('task1')
    })

    it('should select second option when randomizer returns it', () => {
      // Change mock to return second option
      api.sampleWithReplacement = vi.fn().mockImplementation((options) => [options[1]])

      const timeline = new Timeline(api)
      addWelcomeRoute(timeline)

      timeline.registerView({ name: 'task1', component: MockComponent })
      timeline.registerView({ name: 'task2', component: MockComponent })

      const options = [
        ['task1', 'task2'],
        ['task2', 'task1'],
      ]

      timeline.pushRandomizedNode({
        name: 'randomOrder',
        options,
      })

      timeline.build()

      // Verify sampleWithReplacement was called with correct arguments
      expect(api.sampleWithReplacement).toHaveBeenCalledWith(options, 1, undefined)

      // Verify the second option was persisted
      expect(api.store.setRandomizedRoute).toHaveBeenCalledWith('randomOrder', ['task2', 'task1'])

      // Verify reversed order
      expect(timeline.seqtimeline[1].name).toBe('task2')
      expect(timeline.seqtimeline[2].name).toBe('task1')

      // Verify traversal links
      expect(timeline.seqtimeline[0].meta.next).toBe('task2')
      expect(timeline.seqtimeline[1].meta.next).toBe('task1')
      expect(timeline.seqtimeline[2].meta.next).toBe(null)
    })

    it('should use stored route if already assigned', () => {
      // Mock that route was already assigned
      api.store.getRandomizedRouteByName = vi.fn().mockReturnValue(['task2', 'task1'])

      const timeline = new Timeline(api)
      addWelcomeRoute(timeline)

      timeline.registerView({ name: 'task1', component: MockComponent })
      timeline.registerView({ name: 'task2', component: MockComponent })

      timeline.pushRandomizedNode({
        name: 'randomOrder',
        options: [
          ['task1', 'task2'],
          ['task2', 'task1'],
        ],
      })

      timeline.build()

      // Verify stored route was looked up
      expect(api.store.getRandomizedRouteByName).toHaveBeenCalledWith('randomOrder')

      // Should NOT call sampleWithReplacement when route is already stored
      expect(api.sampleWithReplacement).not.toHaveBeenCalled()

      // Should use stored order
      expect(timeline.seqtimeline[1].name).toBe('task2')
      expect(timeline.seqtimeline[2].name).toBe('task1')
    })

    it('should throw error if randomized option not found', () => {
      const timeline = new Timeline(api)
      addWelcomeRoute(timeline)

      expect(() => {
        timeline.pushRandomizedNode({
          name: 'randomOrder',
          options: [['nonexistent_task']],
        })
      }).toThrow('RandomizedNodeOptionNotFoundError')
    })

    it('should throw error if options and weights length mismatch', () => {
      const timeline = new Timeline(api)
      addWelcomeRoute(timeline)

      timeline.registerView({ name: 'task1', component: MockComponent })

      expect(() => {
        timeline.pushRandomizedNode({
          name: 'randomOrder',
          options: [['task1']],
          weights: [1, 2], // mismatched length
        })
      }).toThrow('OptionsWeightsLengthMismatchError')
    })
  })

  describe('Conditional nodes', () => {
    beforeEach(() => {
      // Mock getConditionByName to return 'AB' condition
      api.getConditionByName = vi.fn().mockReturnValue('AB')
      api.randomAssignCondition = vi.fn().mockReturnValue('AB')
    })

    it('should push conditional node and connect routes based on condition', () => {
      const timeline = new Timeline(api)
      addWelcomeRoute(timeline)

      timeline.registerView({ name: 'taskA', component: MockComponent })
      timeline.registerView({ name: 'taskB', component: MockComponent })

      timeline.pushConditionalNode({
        name: 'conditionalOrder',
        taskOrder: {
          AB: ['taskA', 'taskB'],
          BA: ['taskB', 'taskA'],
        },
      })

      timeline.build()

      // Verify condition was looked up by the correct name (the condition property key)
      expect(api.getConditionByName).toHaveBeenCalledWith('taskOrder')

      // Condition is 'AB', so order should be taskA -> taskB
      expect(timeline.seqtimeline.length).toBe(3)
      expect(timeline.seqtimeline[0].name).toBe('welcome_anonymous')
      expect(timeline.seqtimeline[1].name).toBe('taskA')
      expect(timeline.seqtimeline[2].name).toBe('taskB')

      // Verify traversal links
      expect(timeline.seqtimeline[0].meta.next).toBe('taskA')
      expect(timeline.seqtimeline[1].meta.next).toBe('taskB')
      expect(timeline.seqtimeline[2].meta.next).toBe(null)

      expect(timeline.seqtimeline[0].meta.prev).toBe(null)
      expect(timeline.seqtimeline[1].meta.prev).toBe('welcome_anonymous')
      expect(timeline.seqtimeline[2].meta.prev).toBe('taskA')
    })

    it('should use different order for different condition', () => {
      // Change condition to 'BA'
      api.getConditionByName = vi.fn().mockReturnValue('BA')

      const timeline = new Timeline(api)
      addWelcomeRoute(timeline)

      timeline.registerView({ name: 'taskA', component: MockComponent })
      timeline.registerView({ name: 'taskB', component: MockComponent })

      timeline.pushConditionalNode({
        name: 'conditionalOrder',
        taskOrder: {
          AB: ['taskA', 'taskB'],
          BA: ['taskB', 'taskA'],
        },
      })

      timeline.build()

      // Verify condition was looked up
      expect(api.getConditionByName).toHaveBeenCalledWith('taskOrder')

      // Condition is 'BA', so order should be taskB -> taskA
      expect(timeline.seqtimeline[1].name).toBe('taskB')
      expect(timeline.seqtimeline[2].name).toBe('taskA')

      // Verify traversal links
      expect(timeline.seqtimeline[0].meta.next).toBe('taskB')
      expect(timeline.seqtimeline[1].meta.next).toBe('taskA')
    })

    it('should handle conditional node with explicit path property', () => {
      // This test verifies the fix for the bug where 'path' was being
      // treated as a condition name instead of being ignored
      const timeline = new Timeline(api)
      addWelcomeRoute(timeline)

      timeline.registerView({ name: 'taskA', component: MockComponent })
      timeline.registerView({ name: 'taskB', component: MockComponent })

      // Push conditional node with explicit path - this should NOT throw
      // Before the fix, this would throw TooManyConditionNamesError
      // because 'path' was being counted as a second condition name
      timeline.pushConditionalNode({
        name: 'conditionalOrder',
        path: '/conditional',
        taskOrder: {
          AB: ['taskA', 'taskB'],
          BA: ['taskB', 'taskA'],
        },
      })

      timeline.build()

      // CRITICAL: Verify the condition lookup used 'taskOrder', NOT 'path'
      // This is the key assertion that verifies the bug fix
      expect(api.getConditionByName).toHaveBeenCalledWith('taskOrder')
      expect(api.getConditionByName).not.toHaveBeenCalledWith('path')

      // Should work correctly with condition 'AB'
      expect(timeline.seqtimeline.length).toBe(3)
      expect(timeline.seqtimeline[1].name).toBe('taskA')
      expect(timeline.seqtimeline[2].name).toBe('taskB')

      // Verify traversal is correct
      expect(timeline.seqtimeline[0].meta.next).toBe('taskA')
      expect(timeline.seqtimeline[1].meta.next).toBe('taskB')
    })

    it('should throw error with multiple condition names', () => {
      const timeline = new Timeline(api)
      addWelcomeRoute(timeline)

      timeline.registerView({ name: 'taskA', component: MockComponent })

      // Two condition names should throw - using realistic property names
      // that a developer might accidentally add (e.g., taskOrder AND variation)
      expect(() => {
        timeline.pushConditionalNode({
          name: 'conditionalOrder',
          taskOrder: { AB: ['taskA'], BA: ['taskA'] },
          variation: { X: ['taskA'], Y: ['taskA'] },
        })
      }).toThrow('TooManyConditionNamesError')
    })

    it('should randomly assign condition if not already set', () => {
      api.getConditionByName = vi.fn().mockReturnValue(null)
      api.randomAssignCondition = vi.fn().mockReturnValue('AB')

      const timeline = new Timeline(api)
      addWelcomeRoute(timeline)

      timeline.registerView({ name: 'taskA', component: MockComponent })
      timeline.registerView({ name: 'taskB', component: MockComponent })

      timeline.pushConditionalNode({
        name: 'conditionalOrder',
        taskOrder: {
          AB: ['taskA', 'taskB'],
          BA: ['taskB', 'taskA'],
        },
      })

      timeline.build()

      // Verify getConditionByName was checked first
      expect(api.getConditionByName).toHaveBeenCalledWith('taskOrder')

      // Should have called randomAssignCondition with the possible condition values
      expect(api.randomAssignCondition).toHaveBeenCalledWith({
        conditionname: ['AB', 'BA'],
      })

      // And still produce correct traversal based on randomly assigned 'AB'
      expect(timeline.seqtimeline[1].name).toBe('taskA')
      expect(timeline.seqtimeline[2].name).toBe('taskB')
    })

    it('should connect conditional node between other sequential views', () => {
      const timeline = new Timeline(api)
      addWelcomeRoute(timeline)

      // Push instructions before conditional node
      timeline.pushSeqView({
        name: 'instructions',
        component: MockComponent,
      })

      timeline.registerView({ name: 'taskA', component: MockComponent })
      timeline.registerView({ name: 'taskB', component: MockComponent })

      timeline.pushConditionalNode({
        name: 'conditionalOrder',
        taskOrder: {
          AB: ['taskA', 'taskB'],
          BA: ['taskB', 'taskA'],
        },
      })

      // Push debrief after conditional node
      timeline.pushSeqView({
        name: 'debrief',
        component: MockComponent,
      })

      timeline.build()

      // Verify full sequence: welcome -> instructions -> taskA -> taskB -> debrief
      expect(timeline.seqtimeline.length).toBe(5)
      expect(timeline.seqtimeline.map((r) => r.name)).toEqual([
        'welcome_anonymous',
        'instructions',
        'taskA',
        'taskB',
        'debrief',
      ])

      // Verify complete traversal chain
      expect(timeline.seqtimeline[0].meta.next).toBe('instructions')
      expect(timeline.seqtimeline[1].meta.next).toBe('taskA')
      expect(timeline.seqtimeline[2].meta.next).toBe('taskB')
      expect(timeline.seqtimeline[3].meta.next).toBe('debrief')
      expect(timeline.seqtimeline[4].meta.next).toBe(null)
    })
  })

  /*
  it('should compute the progress correctly', () => {
    const MockComponentOne = { template: '<div>Mock Component One</div>' }
    const MockComponentTwo = { template: '<div>Mock Component Two</div>' }
    const MockComponentThree = { template: '<div>Mock Component Three</div>' }
    const MockComponentFour = { template: '<div>Mock Component Four</div>' }

    const timeline = new Timeline()
    timeline.pushSeqView({
      path: '/one',
      name: 'one',
      component: MockComponentOne,
    })
    timeline.pushSeqView({
      path: '/two',
      name: 'two',
      component: MockComponentTwo,
    })
    timeline.pushSeqView({
      path: '/three',
      name: 'three',
      component: MockComponentThree,
    })
    timeline.buildProgress()
    expect(timeline.seqtimeline[0].meta.progress).toBe((100 * 0) / (3 - 1)) // zero progress
    expect(timeline.seqtimeline[1].meta.progress).toBe((100 * 1) / (3 - 1)) // remaining is split
    expect(timeline.seqtimeline[2].meta.progress).toBe((100 * 2) / (3 - 1))

    timeline.pushSeqView({
      path: '/four',
      name: 'four',
      component: MockComponentFour,
    })

    timeline.buildProgress() // rebuild timeline
    expect(timeline.seqtimeline[0].meta.progress).toBe((100 * 0) / (4 - 1)) // zero progress
    expect(timeline.seqtimeline[1].meta.progress).toBe((100 * 1) / (4 - 1)) // remaining is split
    expect(timeline.seqtimeline[2].meta.progress).toBe((100 * 2) / (4 - 1))
    expect(timeline.seqtimeline[3].meta.progress).toBe((100 * 3) / (4 - 1))
  })
  */
})
