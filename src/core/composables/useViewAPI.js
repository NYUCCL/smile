/**
 * @module useViewAPI
 * @description Creates a view-specific API instance that combines core API functionality with stepper controls
 * @returns {Object} A reactive object containing:
 * - All methods and properties from the core API
 * - All methods and properties from the stepper
 */
import { ref, reactive, computed, watch } from 'vue'
import { SmileAPI } from '@/core/composables/useAPI'
import useSmileStore from '@/core/stores/smilestore'
import { useStepper } from '@/core/composables/useStepper'
import { onKeyDown, onKeyPressed, onKeyUp, useMouse, useMousePressed } from '@vueuse/core'
import useTimeline from '@/core/composables/useTimeline'
import { useRoute, useRouter } from 'vue-router'
import useLog from '@/core/stores/log'
import config from '@/core/config'

// Singleton instance
let viewAPIInstance = null

/**
 * ViewAPI class extends SmileAPI with view-specific functionality
 * @class
 * @extends SmileAPI
 * @description Extends the core SmileAPI with additional view-specific functionality including:
 * - Stepper controls and state management
 * - Data recording capabilities
 * - Mouse and keyboard event handlers
 */
class ViewAPI extends SmileAPI {
  constructor(store, logStore, route, router, timeline) {
    super(store, logStore, route, router, timeline)

    // Store route as a class property
    this._route = route

    // Make page reactive using computed
    this._page = computed(() => this._route.name)
    this._stepper = computed(() => {
      const stepper = useStepper(this._route.name, this.update)
      stepper.setOnModify(() => this.updateStepper())
      return stepper
    })

    // Internal reactive refs
    this._dataAlongPath = ref(null)
    this._path = ref(null)
    this._pathString = ref('')
    this._index = ref(null)
    this._stateMachine = ref(null)
    this._gvars = ref({})

    // Component registry
    this.componentRegistry = new Map()

    // Watch for stepper changes and update internal state
    watch(
      this._stepper,
      (newStepper) => {
        this._updateStepperState(newStepper, false) // don't save because it will trigger recursive updates
      },
      { immediate: true, deep: true }
    )

    // Add keyboard event handlers from VueUse
    this.onKeyDown = onKeyDown
    this.onKeyPressed = onKeyPressed
    this.onKeyUp = onKeyUp

    // Add mouse event handlers from VueUse
    this.useMouse = useMouse
    this.useMousePressed = useMousePressed
  }

  /**
   * The underlying state machine instance
   * @name steps
   * @memberof ViewAPI
   * @instance
   * @type {Stepper}
   * @description Provides direct access to the underlying Stepper state machine instance.
   * This allows advanced manipulation of the state machine when needed.
   */
  get steps() {
    if (!this._stepper.value) return null
    return this._stepper.value
  }

  /**
   * Checks if there is a next step available in the stepper.
   * @returns {boolean} True if there is a next step available, false otherwise.
   * @memberof ViewAPI
   * @instance
   */
  hasNextStep() {
    return this._stepper.value.hasNext()
  }

  /**
   * Checks if there is a previous step available in the stepper.
   * @returns {boolean} True if there is a previous step available, false otherwise.
   * @memberof ViewAPI
   * @instance
   */
  hasPrevStep() {
    return this._stepper.value.hasPrev()
  }

  /**
   * Checks if there are any steps in the stepper.
   * Calls on the root stepper to check for steps, avoiding leaf node checks if none exist.
   * @returns {boolean} True if there are steps in the stepper, false otherwise.
   * @memberof ViewAPI
   * @instance
   */
  hasSteps() {
    // has steps calls on the root to find if it has steps
    // if not then no need to check for leafs
    return this._stepper.value.hasSteps()
  }

  /**
   * Advances to the next step in the stepper.
   * Updates the stepper state if a next step exists.
   * @param {boolean} [resetScroll=true] - Whether to reset scroll position to top after navigation
   * @returns {Object|null} The next state object if one exists, null otherwise
   * @memberof ViewAPI
   * @instance
   */
  goNextStep(resetScroll = true) {
    let next = this._stepper.value.next()
    if (resetScroll) {
      this.scrollToTop()
    }
    if (next !== null) {
      this._updateStepperState(next)
    }
    return next
  }

  /**
   * Returns to the previous step in the stepper.
   * Updates the stepper state if a previous step exists.
   * @param {boolean} [resetScroll=true] - Whether to reset scroll position to top after navigation
   * @returns {Object|null} The previous state object if one exists, null otherwise
   * @memberof ViewAPI
   * @instance
   */
  goPrevStep(resetScroll = true) {
    let prev = this._stepper.value.prev()
    if (resetScroll) {
      this.scrollToTop()
    }
    if (prev !== null) {
      this._updateStepperState(prev)
    }
    return prev
  }

  /**
   * Resets the stepper to its first step.
   * Updates the stepper state after resetting to the initial position.
   * @param {boolean} [resetScroll=true] - Whether to reset scroll position to top after navigation
   * @returns {void}
   * @memberof ViewAPI
   * @instance
   */
  goFirstStep(resetScroll = true) {
    this._stepper.value.reset()
    if (resetScroll) {
      this.scrollToTop()
    }
    this._updateStepperState(this._stepper.value)
  }

  /**
   * Navigates to a specific step by path.
   * Updates the stepper state after navigating to the specified path.
   * @param {string} path - The path of the step to navigate to (e.g. "trial/block1/step2")
   * @param {boolean} [resetScroll=true] - Whether to reset scroll position to top after navigation
   * @returns {void}
   * @memberof ViewAPI
   * @instance
   */
  goToStep(path, resetScroll = true) {
    this._stepper.value.goTo(path)
    if (resetScroll) {
      this.scrollToTop()
    }
    this._updateStepperState(this._stepper.value)
  }

  /**
   * Gets the current step index among leaf nodes in the stepper.
   * The step index represents the position of the current path string
   * within the flattened array of leaf nodes.
   * @returns {number} The zero-based index of the current step, or -1 if not found
   * @memberof ViewAPI
   * @instance
   */
  get stepIndex() {
    const leafNodes = this._stepper.value.leafNodes
    return leafNodes.indexOf(this._pathString.value)
  }

  /**
   * Gets the current block index in the stepper.
   * The block index represents the position within the current block of steps.
   * @returns {number} The zero-based index within the current block
   * @memberof ViewAPI
   * @instance
   */
  get blockIndex() {
    return this._stepper.value.blockIndex
  }

  /**
   * Gets the current path as a string representation.
   * The path string is a forward-slash delimited string of step names representing
   * the current location in the stepper (e.g. "trial/block1/step2").
   * @returns {string} The current path string
   * @memberof ViewAPI
   * @instance
   */
  get pathString() {
    return this._pathString.value
  }

  /**
   * Gets the current path as an array.
   * The path array contains the sequence of step names representing the current
   * location in the stepper (e.g. ['trial', 'block1', 'step2']).
   * @returns {string[]} The current path array
   * @memberof ViewAPI
   * @instance
   */
  get path() {
    return this._path.value
  }

  /**
   * Gets the total number of leaf nodes in the stepper.
   * This represents the total number of steps in the sequence, excluding any parent/container nodes.
   * @returns {number} The total number of leaf nodes
   * @memberof ViewAPI
   * @instance
   */
  get length() {
    return this._stepper.value.countLeafNodes
  }

  /**
   * Checks if the current step is the last step in the sequence.
   * This compares the current step index against the total number of steps.
   * @returns {boolean} True if this is the last step, false otherwise
   * @memberof ViewAPI
   * @instance
   */
  isLastStep() {
    return this.stepIndex === this.nSteps - 1
  }

  /**
   * Checks if the current step is the last step in the current block.
   * This compares the current block index against the total length of the block.
   * @returns {boolean} True if this is the last step in the block, false otherwise
   * @memberof ViewAPI
   * @instance
   */
  isLastBlockStep() {
    return this.blockIndex === this.blockLength - 1
  }

  /**
   * Gets the number of steps in the current block.
   * This represents the total number of steps at the current level in the stepper hierarchy.
   * @returns {number} The number of steps in the current block
   * @memberof ViewAPI
   * @instance
   */
  get blockLength() {
    return this._stepper.value.blockLength
  }

  /**
   * Gets the total number of leaf nodes in the stepper.
   * This is an alias for nSteps that represents the total number of steps in the sequence.
   * @returns {number} The total number of leaf nodes
   * @memberof ViewAPI
   * @instance
   * @see nSteps
   */
  get stepLength() {
    return this._stepper.value.countLeafNodes
  }

  /**
   * Alias for stepLength.
   * Returns the total number of leaf nodes in the stepper.
   * @returns {number} The total number of leaf nodes
   * @memberof ViewAPI
   * @instance
   * @see stepLength
   */
  get nSteps() {
    return this.stepLength
  }

  /**
   * Persistence Methods
   *
   * These methods provide functionality for storing and accessing variables that persist across browser reloads.
   * Persistence is handled through the stepper's root data store and variables are accessible via the `persist` getter.
   *
   * Available persistence methods:
   * - persist: Getter that provides access to persisted variables stored in stepper root data
   * - persist.isDefined(key): Checks if a persisted variable exists
   * - clearPersist(): Clears all persisted variables
   *
   * Example usage:
   * ```js
   * // Set a persisted value
   * api.persist.myVar = 'some value'
   *
   * // Check if variable exists
   * if (api.persist.isDefined('myVar')) {
   *   // Access persisted value
   *   console.log(api.persist.myVar)
   * }
   *
   * // Clear all persisted values
   * api.clearPersist()
   * ```
   */
  // Getter for persisted variable that provides access to gvars from stepper root data
  /**
   * Getter that provides access to persisted variables stored in the stepper's root data.
   * Creates a recursive proxy to handle nested object access and updates.
   *
   * @returns {Proxy} A proxy object that provides access to persisted variables with:
   *   - get: Returns persisted values and the isDefined() helper method
   *   - set: Updates persisted values and triggers stepper update
   * @memberof ViewAPI
   * @instance
   *
   * @example
   * // Set a persisted value
   * api.persist.myVar = 'value'
   *
   * // Get a persisted value
   * const value = api.persist.myVar
   *
   * // Check if variable exists
   * if (api.persist.isDefined('myVar')) {
   *   // Variable exists
   * }
   */
  get persist() {
    if (!this._stepper.value.root.data.gvars) {
      this._stepper.value.root.data.gvars = {}
    }
    const self = this // capture the outer this context

    const isDefined = (key) => key in this._stepper.value.root.data.gvars

    const createRecursiveProxy = (target) => {
      return new Proxy(target, {
        get: (target, prop) => {
          if (prop === 'isDefined') {
            return isDefined
          }
          const value = target[prop]
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            return createRecursiveProxy(value)
          }
          return value
        },
        set: (target, prop, value) => {
          target[prop] = value
          setTimeout(() => {
            self.updateStepper()
          }, 2)
          return true
        },
      })
    }

    return createRecursiveProxy(this._stepper.value.root.data.gvars)
  }

  /**
   * Clears all persisted variables stored in the stepper's root data.
   * This resets both the internal gvars ref and the stepper's root data gvars to empty objects.
   * @method clearPersist
   * @memberof ViewAPI
   * @instance
   * @returns {void}
   * @example
   * // Clear all persisted variables
   * api.clearPersist()
   */
  clearPersist() {
    this._gvars.value = reactive({})
    this._stepper.value.root.data.gvars = {}
    this._saveStepperState()
  }

  /**
   * Timing Methods
   *
   * These methods provide functionality for tracking elapsed time during the experiment.
   * Times are stored in the persisted variables (gvars) and can be accessed across steps.
   * Multiple named timers can be running simultaneously.
   *
   * Available timing methods:
   * - startTimer(name): Starts a named timer
   * - isTimerStarted(name): Checks if a timer exists
   * - elapsedTime(name): Gets elapsed time in milliseconds
   * - elapsedTimeInSeconds(name): Gets elapsed time in seconds
   * - elapsedTimeInMinutes(name): Gets elapsed time in minutes
   *
   * @memberof ViewAPI
   */

  /**
   * Starts a named timer by storing the current timestamp in persisted variables
   * @param {string} [name='default'] - The name of the timer to start
   * @returns {void}
   * @memberof ViewAPI
   * @instance
   */
  startTimer(name = 'default') {
    this.persist[`startTime_${name}`] = Date.now()
  }

  /**
   * Checks if a named timer has been started
   * @param {string} [name='default'] - The name of the timer to check
   * @returns {boolean} True if the timer exists and has been started, false otherwise
   * @memberof ViewAPI
   * @instance
   */
  isTimerStarted(name = 'default') {
    const timerKey = `startTime_${name}`
    return this.persist.isDefined(timerKey) ? this.persist[timerKey] : false
  }

  /**
   * Gets the elapsed time in milliseconds since a named timer was started
   * @param {string} [name='default'] - The name of the timer to check
   * @returns {number} Elapsed time in milliseconds
   * @memberof ViewAPI
   * @instance
   */
  elapsedTime(name = 'default') {
    return Date.now() - this.persist[`startTime_${name}`]
  }

  /**
   * Gets the elapsed time in seconds since a named timer was started
   * @param {string} [name='default'] - The name of the timer to check
   * @returns {number} Elapsed time in seconds
   * @memberof ViewAPI
   * @instance
   */
  elapsedTimeInSeconds(name = 'default') {
    return (Date.now() - this.persist[`startTime_${name}`]) / 1000
  }

  /**
   * Gets the elapsed time in minutes since a named timer was started
   * @param {string} [name='default'] - The name of the timer to check
   * @returns {number} Elapsed time in minutes
   * @memberof ViewAPI
   * @instance
   */
  elapsedTimeInMinutes(name = 'default') {
    return (Date.now() - this.persist[`startTime_${name}`]) / 60000
  }

  /**
   * Data Methods
   *
   * These methods provide functionality for storing and retrieving data associated with each step in a view.
   * Data is persisted with each step and can be accessed later when revisiting steps.
   *
   * The data methods include:
   * - stepData: Gets/sets merged data from all steps in the current path (parent blocks + current step)
   * - stepDataLeaf: Gets/sets data for only the current step (leaf node)
   * - dataAlongPath: Gets raw data array for all steps in the current path
   * - queryStepData(): Gets data for all steps, optionally filtered by path pattern
   * - clearCurrentStepData(): Clears data for the current step
   * - clear(): Clears all step data for the current view
   *
   * Data can be accessed and modified through stepData (merged) or stepDataLeaf (current step only):
   * @example
   * // Get merged data from current path (includes parent block data)
   * const data = api.stepData
   *
   * // Get data from only current step
   * const leafData = api.stepDataLeaf
   *
   * // Set data on current step
   * api.stepDataLeaf.response = 'some value'
   *
   * // Get data from all steps matching a path pattern
   * const allData = api.queryStepData('trial/block*')
   *
   * // Clear current step data
   * api.clearCurrentStepData()
   *
   * @memberof ViewAPI
   */

  /**
   * Gets merged data from all steps in the current path (parent blocks + current step)
   * @returns {Object|null} Merged data object containing properties from all steps in current path, or null if no path data exists
   * @memberof ViewAPI
   * @instance
   * @example
   * // Get merged data including parent block data
   * const data = api.stepData
   * console.log(data.blockType) // Access block-level property
   * console.log(data.response) // Access step-level property
   *
   * // Modify data (changes are saved to current step)
   * api.stepData.response = 'new value'
   */
  get stepData() {
    if (!this._dataAlongPath.value) return null

    const mergedData = computed(() => {
      return this._dataAlongPath.value.reduce((merged, item) => {
        return { ...merged, ...item }
      }, {})
    })

    const createRecursiveProxy = (obj, path = []) => {
      if (obj === null || typeof obj !== 'object') {
        return obj
      }

      if (Array.isArray(obj)) {
        return new Proxy(obj, {
          get: (target, prop) => {
            const value = target[prop]
            if (typeof prop === 'string' && !isNaN(prop)) {
              return createRecursiveProxy(value, [...path, prop])
            }
            return value
          },
          set: (target, prop, value) => {
            if (this._stepper.value.currentData) {
              // Navigate to the correct nested location in currentData
              let current = this._stepper.value.currentData
              for (let i = 0; i < path.length; i++) {
                if (current[path[i]] === undefined) {
                  current[path[i]] = {}
                }
                current = current[path[i]]
              }
              current[prop] = value
              this._saveStepperState()
            }
            return true
          },
        })
      }

      return new Proxy(obj, {
        get: (target, prop) => {
          const value = target[prop]
          return createRecursiveProxy(value, [...path, prop])
        },
        set: (target, prop, value) => {
          if (this._stepper.value.currentData) {
            // Navigate to the correct nested location in currentData
            let current = this._stepper.value.currentData
            for (let i = 0; i < path.length; i++) {
              if (current[path[i]] === undefined) {
                current[path[i]] = {}
              }
              current = current[path[i]]
            }
            current[prop] = value
            this._saveStepperState()
          }
          return true
        },
      })
    }

    return createRecursiveProxy(mergedData.value)
  }

  /**
   * Gets the data only from the current leaf node of the current path.
   * This is similar to stepData but only includes data from the current leaf node,
   * not the entire path. Works with nested objects and arrays through a proxy.
   * @returns {Proxy|null} A proxy object for the current leaf node's data, or null if no data exists
   * @memberof ViewAPI
   * @instance
   * @example
   * // Get a value from the current leaf node
   * const value = api.stepDataLeaf.myVariable
   *
   * // Set a value in the current leaf node
   * api.stepDataLeaf.myVariable = 'new value'
   *
   * // Work with nested objects
   * api.stepDataLeaf.nested.obj.prop = 123
   *
   * // Work with arrays
   * api.stepDataLeaf.myArray[0] = 'first item'
   */
  get stepDataLeaf() {
    if (!this._stepper.value?.currentData) return null

    const createRecursiveProxy = (obj) => {
      if (obj === null || typeof obj !== 'object') {
        return obj
      }

      if (Array.isArray(obj)) {
        return new Proxy(obj, {
          get: (target, prop) => {
            const value = target[prop]
            if (typeof prop === 'string' && !isNaN(prop)) {
              return createRecursiveProxy(value)
            }
            return value
          },
          set: (target, prop, value) => {
            target[prop] = value
            this._stepper.value.currentData[prop] = value
            this._saveStepperState()
            return true
          },
        })
      }

      return new Proxy(obj, {
        get: (target, prop) => {
          const value = target[prop]
          return createRecursiveProxy(value)
        },
        set: (target, prop, value) => {
          target[prop] = value
          this._stepper.value.currentData[prop] = value
          this._saveStepperState()
          return true
        },
      })
    }

    return createRecursiveProxy(this._stepper.value.currentData)
  }

  /**
   * Gets the path data for the current step, with component types resolved from the registry
   * @returns {Array|null} Array of path data objects with resolved component types, or null if no path data exists
   */
  get dataAlongPath() {
    if (this._dataAlongPath.value === null) return null

    return this._dataAlongPath.value.map((item) => {
      if (item?.type?.__vueComponent) {
        return {
          ...item,
          type: this.componentRegistry.get(item.type.componentName) || {
            template: `<div>Component ${item.type.componentName} not found</div>`,
          },
        }
      }
      return item
    })
  }

  /**
   * Gets data for all leaf nodes in the stepper, optionally filtered by path pattern.
   * Returns only the data directly associated with each leaf node, without merging parent block data.
   * @param {string|null} [pathFilter=null] - Optional path pattern to filter nodes (e.g. 'trial/block*')
   * @returns {Array<Object>} Array of data objects for each matching leaf node
   * @memberof ViewAPI
   * @instance
   * @example
   * // Get data for all leaf nodes
   * const allLeafData = api.queryStepDataLeaf()
   *
   * // Get data for nodes matching a pattern
   * const trialData = api.queryStepDataLeaf('trial/block*')
   */
  queryStepDataLeaf(pathFilter = null) {
    const matchesFilter = (path, filter) => {
      if (!filter) return true

      let pattern = filter.replace(/\*/g, '.*')
      pattern = pattern.replace(/[+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`^${pattern}`)
      return regex.test(path)
    }

    const getLeafData = (state) => {
      if (state.isLeaf) {
        if (matchesFilter(state.pathString, pathFilter)) {
          return state.data
        }
        return []
      }
      return state.states.flatMap(getLeafData)
    }

    return getLeafData(this._stepper.value)
  }

  /**
   * Gets data for all leaf nodes in the stepper, optionally filtered by path pattern.
   * Returns only the data directly associated with each leaf node, excluding global variables.
   * @param {string|null} pathFilter - Optional path pattern to filter nodes (e.g. 'trial/block*')
   * @returns {Array} Array of data objects for each matching leaf node, with gvars removed
   * @memberof ViewAPI
   * @instance
   * @example
   * // Get data for all leaf nodes
   * const allData = api.queryStepData()
   *
   * // Get data for nodes matching a pattern
   * const trialData = api.queryStepData('trial/block*')
   */
  queryStepData(pathFilter = null) {
    const matchesFilter = (path, filter) => {
      if (!filter) return true

      let pattern = filter.replace(/\*/g, '.*')
      pattern = pattern.replace(/[+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`^${pattern}`)
      return regex.test(path)
    }

    const getLeafData = (state) => {
      if (state.isLeaf) {
        if (matchesFilter(state.pathString, pathFilter)) {
          // Only return the node's own data, not including root properties
          const { gvars, ...nodeData } = state.data
          return nodeData
        }
        return []
      }
      return state.states.flatMap(getLeafData)
    }

    return getLeafData(this._stepper.value)
  }

  /**
   * Clears all data for the current view's stepper
   * @method clear
   * @memberof ViewAPI
   * @instance
   * @description Removes the stepper state from browser storage, clears the stepper's data subtree,
   * clears the component registry, and saves the cleared state
   * @returns {void}
   * @example
   * // Clear all data for current view
   * api.clear()
   */
  clear() {
    if (this.store.browserPersisted.viewSteppers[this._page.value]) {
      const pageData = this.store.browserPersisted.viewSteppers[this._page.value].data || {}
      delete pageData.stepperState
      this.store.browserPersisted.viewSteppers[this._page.value].data = pageData

      this._stepper.value.clearSubTree()
      this.componentRegistry.clear()
    }
    this._saveStepperState()
  }

  /**
   * Clears the data for the current step in the stepper
   * @method clearCurrentStepData
   * @memberof ViewAPI
   * @instance
   * @description Clears only the data for the current step, leaving other step data intact,
   * then saves the updated stepper state
   * @returns {void}
   * @example
   * // Clear data for current step
   * api.clearCurrentStepData()
   */
  clearCurrentStepData() {
    this._stepper.value.clearCurrentStepData()
    this._saveStepperState()
  }

  /**
   * Records the current step data to the experiment data store
   * @method recordStep
   * @memberof ViewAPI
   * @instance
   * @description Logs the current step data and records it to the experiment data store using recordPageData
   * @returns {void}
   */
  recordStep() {
    this.recordPageData(this.stepData)
  }

  /**
   * Utility Functions
   *
   * These methods handle updating and saving the reactive state properties of the view:
   * - _updateStepperState: Updates internal reactive refs from stepper data
   * - updateStepper: Public method to trigger stepper state update
   * - _visualizeStateMachine: Creates clean visualization of state machine
   * - _saveStepperState: Persists current stepper state to store
   *
   * The utility functions maintain consistency between the stepper state machine
   * and the reactive view properties that components depend on.
   *
   * @memberof ViewAPI
   */

  /**
   * Saves the current stepper state to persistent storage
   * @private
   * @method _saveStepperState
   * @memberof ViewAPI
   * @instance
   * @description Persists the current stepper state to storage using the current page name as the key.
   * Only saves if there is an active stepper instance.
   * @returns {void}
   */
  _saveStepperState() {
    if (this._stepper.value) {
      this._stepper.value.save(this._page.value)
    }
  }

  /**
   * Updates the internal stepper state with new data
   * @private
   * @param {Object} data - The new stepper state data
   * @param {Object} data.dataAlongPath - Data collected along the current path
   * @param {string} data.currentPathString - String representation of current path
   * @param {string[]} data.currentPath - Array of steps in current path
   * @param {number} data.index - Current step index
   * @param {Object} data.data - Stepper data object
   * @param {Object} data.data.gvars - Global variables object
   * @param {boolean} [save=true] - Whether to persist state changes
   * @memberof ViewAPI
   * @instance
   */
  _updateStepperState(data, save = true) {
    this._dataAlongPath.value = data.dataAlongPath
    this._pathString.value = data.currentPathString
    this._path.value = data.currentPath
    this._index.value = data.index
    this._gvars.value = reactive(data.data?.gvars || {})
    this._stateMachine.value = this._visualizeStateMachine()
    if (save) {
      this._saveStepperState()
    }
  }

  /**
   * Triggers an update of the stepper state
   * @method updateStepper
   * @memberof ViewAPI
   * @instance
   */
  updateStepper() {
    this._updateStepperState(this._stepper.value)
  }

  /**
   * Creates a clean visualization of the state machine structure
   * @private
   * @returns {Object} Processed state machine representation
   * @memberof ViewAPI
   * @instance
   */
  _visualizeStateMachine() {
    const processState = (state, level = 0) => {
      const cleanState = {
        data: state.data,
        path: state.pathString,
        index: state.index,
        isLeaf: state.isLeaf,
        isFirstLeaf: state.isFirstLeaf,
        rows: [],
      }

      if (state.rows) {
        state.rows.forEach((childState) => {
          cleanState.rows.push(processState(childState, level + 1))
        })
      }

      return cleanState
    }

    return processState(this._stepper.value)
  }
}

/**
 * Creates and returns a reactive ViewAPI instance
 * @returns {ViewAPI} A reactive ViewAPI instance with all view-specific functionality
 */
export default function useViewAPI() {
  if (!viewAPIInstance) {
    const { goNextView, goPrevView, goToView, nextView, prevView } = useTimeline()
    const route = useRoute()
    const router = useRouter()
    const store = useSmileStore()
    const logStore = useLog()
    const timeline = { goNextView, goPrevView, goToView, nextView, prevView }
    viewAPIInstance = new ViewAPI(store, logStore, route, router, timeline)

    // Add shortcuts for arrow keys
    if (config.mode == 'development') {
      /**
       * Handle right arrow key press to advance to next step
       * @listens keydown.ArrowRight
       * @param {KeyboardEvent} e - The keyboard event
       */
      onKeyDown(['ArrowRight'], (e) => {
        e.preventDefault()
        viewAPIInstance.goNextStep()
      })

      /**
       * Handle left arrow key press to go back to previous step
       * @listens keydown.ArrowLeft
       * @param {KeyboardEvent} e - The keyboard event
       */
      onKeyDown(['ArrowLeft'], (e) => {
        e.preventDefault()
        viewAPIInstance.goPrevStep()
      })
    }
  }

  return viewAPIInstance
}

/**
 * Resets the ViewAPI instance to null. Used for testing purposes.
 * @private
 * @function _reset
 * @memberof useViewAPI
 */
useViewAPI._reset = () => {
  viewAPIInstance = null
}
