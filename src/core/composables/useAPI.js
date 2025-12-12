/**
 * @module useAPI
 * @description Creates and returns a reactive SmileAPI instance that provides core functionality for SMILE experiments.
 * Combines access to:
 * - Store management (Pinia store)
 * - Logging capabilities
 * - Routing and navigation
 * - Timeline management
 * - Randomization utilities
 *
 * This composable serves as the main entry point for components to interact with the SMILE framework's
 * core functionality. It initializes all required dependencies and returns a reactive API object
 * that maintains reactivity when used in components.
 *
 * @returns {Object} A reactive SmileAPI instance with all core framework capabilities
 */

import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useSmileStore from '@/core/stores/smilestore'
import useLog from '@/core/stores/log'
import useTimeline from '@/core/composables/useTimeline'
import seedrandom from 'seedrandom'
import { v4 as uuidv4 } from 'uuid'
import sha256 from 'crypto-js/sha256'
import Base64url from 'crypto-js/enc-base64'
import stringify from 'json-stable-stringify'

import {
  randomInt,
  shuffle,
  sampleWithReplacement,
  sampleWithoutReplacement,
  fakerDistributions,
} from '@/core/utils/randomization'

/**
 * SmileAPI class provides core functionality for SMILE experiments
 * @class
 * @description Main API class that provides access to store data, logging, routing, timeline management,
 * and other core functionality needed for running SMILE experiments. It serves as the primary interface
 * between experiment components and the underlying application infrastructure.
 *
 * @property {Object} store - Smile store instance containing application state
 * @property {Object} logStore - Logging store for application logging
 * @property {Object} route - Vue Router route object for current route
 * @property {Object} router - Vue Router instance for navigation
 * @property {Object} timeline - Timeline instance for managing view sequence
 * @property {Object} config - Application configuration from store
 * @property {Object} data - Application data from store
 * @property {Object} private - Private data from store
 * @property {Object} all_data - Combined private and public data
 * @property {Object} all_config - Combined bro, dev, github and main configs
 * @property {Object} urls - Global URL configurations
 * @property {Object} log - Logging methods interface
 */
export class SmileAPI {
  /**
   * Creates a new SmileAPI instance
   * @param {Object} store - The Smile store instance containing application state
   * @param {Object} logStore - The logging store for application logging
   * @param {Object} route - Vue Router route object for current route
   * @param {Object} router - Vue Router instance for navigation
   * @param {Object} timeline - Timeline instance for managing view sequence
   */
  constructor(store, logStore, route, router, timeline) {
    this.store = store
    this.logStore = logStore
    this.route = route
    this.router = router
    this.timeline = timeline

    // Store data access
    this.config = store.config
    this.data = store.data
    this.private = store.private
    this.all_data = { private: store.private, data: store.data }
    this.all_config = {
      browserPersisted: store.browserPersisted,
      dev: store.dev,
      code: store.config.github,
      config: store.config,
    }
    this.urls = store.browserEphemeral.urls
  }

  // Logging methods
  /**
   * Logging methods for the application
   * @property {Object} log - Object containing logging methods
   * @property {Function} log.debug - Log debug level messages
   * @property {Function} log.log - Log standard messages
   * @property {Function} log.warn - Log warning messages
   * @property {Function} log.error - Log error messages
   * @property {Function} log.success - Log success messages
   * @property {Function} log.clearPageHistory - Clear the page history log
   * @property {Function} log.addToHistory - Add an entry to the page history log
   */
  log = {
    debug: (...args) => this.logStore.debug(...args),
    log: (...args) => this.logStore.log(...args),
    warn: (...args) => this.logStore.warn(...args),
    error: (...args) => this.logStore.error(...args),
    success: (...args) => this.logStore.success(...args),
    clearPageHistory: () => this.logStore.clearPageHistory(),
    addToHistory: (...args) => this.logStore.addToHistory(...args),
  }

  // Router related methods
  /**
   * Navigate to the next view in the timeline sequence
   * @param {boolean} [resetScroll=true] - Whether to reset scroll position to top after navigation
   * @returns {void}
   * @memberof SmileAPI
   * @instance
   */
  goNextView = (resetScroll = true) => {
    this.timeline.goNextView(() => {
      if (resetScroll) {
        this.scrollToTop()
      }
    })
  }
  /**
   * Navigate to the previous view in the timeline sequence
   * @param {boolean} [resetScroll=true] - Whether to reset scroll position to top after navigation
   * @returns {void}
   * @memberof SmileAPI
   * @instance
   */
  goPrevView = (resetScroll = true) => {
    this.timeline.goPrevView(() => {
      if (resetScroll) {
        this.scrollToTop()
      }
    })
  }
  /**
   * Navigate to a specific view in the application
   * @param {string} view - The name of the view to navigate to
   * @param {boolean} [force=true] - Whether to force navigation by temporarily disabling navigation guards
   * @param {boolean} [resetScroll=true] - Whether to reset scroll position to top after navigation
   * @returns {Promise<void>}
   * @memberof SmileAPI
   * @instance
   */
  goToView = async (view, force = true, resetScroll = true) => {
    if (force) {
      this.store.browserEphemeral.forceNavigate = true
      await this.router.push({ name: view })
      this.store.browserEphemeral.forceNavigate = false
    } else {
      await this.router.push({ name: view })
    }
    if (resetScroll) {
      this.scrollToTop()
    }
  }

  /**
   * Check if there is a next view available in the sequential navigation
   * @returns {boolean} True if there is a next view and sequential navigation is enabled
   */
  hasNextView = () => !!this.route.meta.next && this.route.meta.sequential

  /**
   * Check if there is a previous view available in the sequential navigation
   * @returns {boolean} True if there is a previous view and sequential navigation is enabled
   */
  hasPrevView = () => !!this.route.meta.prev && this.route.meta.sequential

  /**
   * Get the next view in the navigation sequence
   * @returns {Object|null} Route object with name and query params, or null if no next view
   */
  nextView = () => this.timeline.nextView()

  /**
   * Get the previous view in the navigation sequence
   * @returns {Object|null} Route object with name and query params, or null if no previous view
   */
  prevView = () => this.timeline.prevView()

  /**
   * Scrolls the main content container to the top
   * @returns {void}
   */
  scrollToTop() {
    const mainContent = document.querySelector('.device-container')
    if (mainContent) {
      mainContent.scrollTop = 0
    }
  }
  // Randomization utilities
  /**
   * Collection of faker distributions for generating random data
   * @type {Object} fakerDistributions
   */
  faker = fakerDistributions

  /**
   * Generate a random integer between min and max (inclusive)
   * @param {number} min - The minimum value
   * @param {number} max - The maximum value
   * @returns {number} A random integer between min and max
   */
  randomInt = randomInt

  /**
   * Randomly reorder elements in an array
   * @param {Array} array - The array to shuffle
   * @returns {Array} A new array with elements in random order
   */
  shuffle = shuffle

  /**
   * Sample elements from an array with replacement
   * @param {Array} array - The array to sample from
   * @param {number} n - Number of elements to sample
   * @returns {Array} Array of n randomly sampled elements
   */
  sampleWithReplacement = sampleWithReplacement

  /**
   * Sample elements from an array without replacement
   * @param {Array} array - The array to sample from
   * @param {number} n - Number of elements to sample
   * @returns {Array} Array of n unique randomly sampled elements
   */
  sampleWithoutReplacement = sampleWithoutReplacement

  // URL helpers

  /**
   * Eagerly import all user assets using Vite's glob import
   * This allows dynamic path resolution for nested directories
   * @private
   */
  #userAssets = import.meta.glob('../../user/assets/**/*', { eager: true, query: '?url', import: 'default' })

  /**
   * Eagerly import all core assets using Vite's glob import
   * This allows dynamic path resolution for nested directories
   * @private
   */
  #coreAssets = import.meta.glob('../../assets/**/*', { eager: true, query: '?url', import: 'default' })

  /**
   * Get the URL for a public asset using the deployment base path
   * @param {string} name - The name/path of the public asset
   * @returns {string} The complete URL for the public asset
   */
  getPublicUrl = (name) => import.meta.env.VITE_DEPLOY_BASE_PATH + name

  /**
   * Get the URL for a core static asset from the core assets directory
   * @param {string} name - The name/path of the core static asset
   * @returns {string} The complete URL for the core static asset
   */
  getCoreStaticUrl = (name) => {
    const assetKey = `../../assets/${name}`
    if (this.#coreAssets[assetKey]) {
      return this.#coreAssets[assetKey]
    }
    // Fallback to original method if glob doesn't find it
    console.warn(`Core asset not found in glob imports: ${name}`)
    return new URL(`../../assets/${name}`, import.meta.url).href
  }

  /**
   * Get the URL for a user static asset from the user assets directory
   * @param {string} name - The name/path of the user static asset
   * @returns {string} The complete URL for the user static asset
   */
  getStaticUrl = (name) => {
    const assetKey = `../../user/assets/${name}`
    if (this.#userAssets[assetKey]) {
      return this.#userAssets[assetKey]
    }
    // Fallback to original method if glob doesn't find it
    console.warn(`User asset not found in glob imports: ${name}`)
    return new URL(`../../user/assets/${name}`, import.meta.url).href
  }

  /**
   * Reset the entire application state
   * @returns {void}
   */
  resetApp = () => this.store.resetApp()

  /**
   * Check if the application is in reset state
   * @returns {boolean} True if app is reset, false otherwise
   */
  isResetApp = () => this.store.browserPersisted.reset

  /**
   * Reset just the store state
   * @returns {void}
   */
  resetStore = () => this.store.resetLocal()

  /**
   * Reset local storage state and reload the application
   * Removes local storage data, resets store state, and refreshes page
   * @returns {void}
   */
  resetLocalState() {
    localStorage.removeItem(this.config.localStorageKey)
    this.store.resetLocal()
    const url = window.location.href
    window.location.href = url.substring(0, url.lastIndexOf('#/'))
  }

  /**
   * Reloads the current browser window/page
   * Forces a fresh reload of the current page by calling window.location.reload()
   * @returns {void}
   */
  reloadBrowser() {
    window.location.reload()
  }

  // App component management
  /**
   * Set a global app component that can be accessed throughout the application
   * @param {string} key - The key/identifier for the component
   * @param {Object} value - The component to store globally
   * @returns {void}
   */
  setAppComponent(key, value) {
    if (!this.store.config.global_app_components) {
      this.store.config.global_app_components = {}
    }
    this.store.config.global_app_components[key] = value
  }

  /**
   * Get a global app component by its key identifier
   * @param {string} key - The key/identifier of the component to retrieve
   * @returns {Object|undefined} The component if found, undefined otherwise
   */
  getAppComponent(key) {
    if (!this.store.config.global_app_components || !(key in this.store.config.global_app_components)) {
      this.logStore.error('SMILE API: getAppComponent() key not found:', key)
      return undefined
    }
    return this.store.config.global_app_components[key]
  }

  // Config management
  /**
   * Sets a runtime configuration value. If the key exists in the main config,
   * updates it there. Otherwise stores it in the runtime config object.
   * Also updates the smileConfig in store data without global components.
   * @param {string} key - The configuration key to set
   * @param {*} value - The value to set for the configuration key
   * @returns {void}
   */
  setRuntimeConfig(key, value) {
    if (key in this.store.config) {
      this.store.config[key] = value
    } else {
      if (!this.store.config.runtime) {
        this.store.config.runtime = {}
      }
      this.store.config.runtime[key] = value
    }
    const { global_app_components, ...configWithoutComponents } = this.store.config
    this.store.data.smileConfig = configWithoutComponents
  }

  /**
   * Gets a configuration value by key, checking both main config and runtime config
   * @param {string} key - The configuration key to retrieve
   * @returns {*|null} The configuration value if found, null otherwise
   */
  getConfig(key) {
    if (key in this.store.config) {
      return this.store.config[key]
    } else if (key in this.store.config.runtime) {
      return this.store.config.runtime[key]
    } else {
      this.logStore.error('SMILE API: getConfig() key not found', key)
      return null
    }
  }

  // User state management
  /**
   * Sets the user as known in the store. This is typically called when a user first visits the site.
   * @returns {Promise<void>} A promise that resolves when the known status is set
   */
  async setKnown() {
    return await this.store.setKnown()
  }

  /**
   * Marks the current task/experiment as completed in the store
   * @returns {void}
   */
  setDone() {
    this.store.setDone()
  }

  /**
   * Records that the user has provided consent in the store
   * @returns {void}
   */
  setConsented() {
    this.store.setConsented()
  }

  /**
   * Connects to the database by ensuring the user is known and has consented.
   * If the user is not known, sets them as known and records their consent.
   * @returns {Promise<void>} A promise that resolves when the database connection is established
   */
  async connectDB() {
    if (!this.store.browserPersisted.knownUser) {
      await this.store.setKnown()
      this.store.setConsented()
    }
  }

  /**
   * Records that the user has withdrawn from the study and stores their withdrawal form info
   * @param {Object} forminfo - The withdrawal form information provided by the user
   * @returns {void}
   */
  setWithdrawn(forminfo) {
    this.store.setWithdrawn(forminfo)
  }

  /**
   * Sets whether the browser window visibility has been verified
   * @param {boolean} value - True if visibility is verified, false otherwise
   * @returns {void}
   */
  verifyVisibility(value) {
    this.store.verifyVisibility(value)
  }

  /**
   * Records a form submission in the store
   * @deprecated Use recordPageData() instead. This method will be removed in a future version.
   * @param {string} name - The name/identifier of the form
   * @param {*} data - The form data to store
   * @returns {void}
   */
  recordForm(name, data) {
    this.logStore.warn('SMILE API: recordForm() is deprecated. Use recordPageData() instead.')
    this.store.recordProperty(name, data) // Keep for backward compat
    this.recordPageData(data) // Also record to new format
  }

  /**
   * Records a named property in the store
   * @param {string} name - The name of the property
   * @param {*} data - The property value to store
   * @returns {void}
   */
  recordProperty(name, data) {
    this.store.recordProperty(name, data)
  }

  /**
   * Validates data for Firestore compatibility.
   * Firestore does not support:
   * - Nested arrays (arrays containing arrays)
   * - Functions or Symbols
   * - Keys containing ".", "/", "[", "]", or "*"
   *
   * @param {*} value - The value to validate
   * @param {string} [path=''] - Current path for error messages
   * @returns {{valid: boolean, error: string|null}} Validation result
   * @private
   */
  validateFirestoreData(value, path = '') {
    // Null/undefined are valid
    if (value === null || value === undefined) {
      return { valid: true, error: null }
    }

    // Primitives are valid
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value instanceof Date) {
      return { valid: true, error: null }
    }

    // Check for unsupported types
    if (typeof value === 'function') {
      return { valid: false, error: `Functions are not supported at path: ${path || 'root'}` }
    }
    if (typeof value === 'symbol') {
      return { valid: false, error: `Symbols are not supported at path: ${path || 'root'}` }
    }

    // Check arrays
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        // Check for nested arrays
        if (Array.isArray(value[i])) {
          return {
            valid: false,
            error: `Nested arrays are not allowed in Firestore at path: ${path}[${i}]`,
          }
        }
        // Recursively validate array elements
        const result = this.validateFirestoreData(value[i], `${path}[${i}]`)
        if (!result.valid) {
          return result
        }
      }
      return { valid: true, error: null }
    }

    // Check objects
    if (typeof value === 'object') {
      for (const [key, val] of Object.entries(value)) {
        // Check for invalid key characters
        if (/[.\/\[\]*]/.test(key)) {
          return {
            valid: false,
            error: `Invalid key name "${key}" at path: ${path || 'root'}. Keys cannot contain ".", "/", "[", "]", or "*"`,
          }
        }
        // Recursively validate object values
        const result = this.validateFirestoreData(val, path ? `${path}.${key}` : key)
        if (!result.valid) {
          return result
        }
      }
      return { valid: true, error: null }
    }

    return { valid: false, error: `Unsupported data type at path: ${path || 'root'}` }
  }

  /**
   * Records data associated with a specific page/route.
   * Data is organized by visit number using visit_N keys (visit_0, visit_1, etc.).
   * Multiple calls within the same visit append to that visit's timestamps and data arrays.
   *
   * Note: Data must be Firestore-compatible. Arrays at the top level are not allowed
   * because they would create nested arrays when stored. Use an object wrapper instead.
   *
   * @param {Object} data - The data to record for this page (must be an object, not an array)
   * @param {string} [routeName] - Optional route name override. Uses current route if not provided
   * @returns {boolean} True if data was recorded successfully, false if validation failed
   *
   * @example
   * // Record data for current page (uses current route name)
   * api.recordPageData({ response: 'yes', rt: 1234 })
   *
   * // Record data with explicit route name
   * api.recordPageData({ response: 'no' }, 'custom_page')
   *
   * // Data structure after multiple visits:
   * // pageData_trial: {
   * //   visit_0: { timestamps: [...], data: [...] },
   * //   visit_1: { timestamps: [...], data: [...] }
   * // }
   *
   * // WRONG: Don't pass arrays directly (will be rejected)
   * api.recordPageData([1, 2, 3]) // Error: use { items: [1, 2, 3] } instead
   */
  recordPageData(data, routeName = null) {
    const pageName = routeName || this.route.name
    if (!pageName) {
      this.logStore.error('SMILE API: recordPageData() - No route name available')
      return false
    }

    // Validate that data is not an array (would create nested arrays)
    if (Array.isArray(data)) {
      this.logStore.error(
        'SMILE API: recordPageData() - Data cannot be an array (would create nested arrays in Firestore). ' +
          'Wrap your array in an object, e.g., { items: [...] }'
      )
      return false
    }

    // Validate Firestore compatibility
    const validation = this.validateFirestoreData(data)
    if (!validation.valid) {
      this.logStore.error(`SMILE API: recordPageData() - Invalid data: ${validation.error}`)
      return false
    }

    const fieldName = `pageData_${pageName}`

    // Calculate current visit index from routeOrder
    const visitCount = this.store.data.routeOrder
      ? this.store.data.routeOrder.filter((entry) => entry.route === pageName).length
      : 0
    const currentVisitIndex = Math.max(0, visitCount - 1) // -1 because current visit is already in routeOrder
    const visitKey = `visit_${currentVisitIndex}`

    // Initialize pageData field if it doesn't exist
    if (!this.store.data[fieldName]) {
      this.store.data[fieldName] = {}
    }

    // Initialize visit structure if it doesn't exist
    if (!this.store.data[fieldName][visitKey]) {
      this.store.data[fieldName][visitKey] = {
        timestamps: [],
        data: [],
      }
    }

    // Append timestamp and data to the current visit
    this.store.data[fieldName][visitKey].timestamps.push(Date.now())
    this.store.data[fieldName][visitKey].data.push(JSON.parse(JSON.stringify(data)))

    this.logStore.debug(`SMILE API: recordPageData() recorded to ${fieldName}.${visitKey}`, data)

    return true
  }

  /**
   * Gets whether browser window visibility has been verified
   * @returns {boolean} True if visibility is verified, false otherwise
   */
  getVerifiedVisibility() {
    return this.store.verifiedVisibility
  }

  // Browser checks
  /**
   * Checks if the browser window dimensions are smaller than the required dimensions
   * @param {number} width - The current width to check against minimum requirements
   * @param {number} height - The current height to check against minimum requirements
   * @returns {boolean} True if browser window is too small, false otherwise
   */
  isBrowserTooSmall(width, height) {
    let val = false
    if (
      this.store.config.windowsizerAggressive === true &&
      this.store.data.verifiedVisibility === true &&
      !this.store.browserPersisted.withdrawn
    ) {
      val =
        width < this.store.config.windowsizerRequest.width + 10 ||
        height < this.store.config.windowsizerRequest.height + 85 // margin for status bar
    }
    return val
  }

  // Development tools
  /**
   * Sets an autofill function for development mode
   * @param {Function} autofill - The autofill function to register
   * @returns {void}
   */
  setAutofill(autofill) {
    this.logStore.debug('SMILEAPI: registering autofill function')
    if (this.store.config.mode === 'development' || this.store.config.mode === 'presentation')
      this.store.setAutofill(autofill)
  }

  /**
   * Removes the registered autofill function in development mode
   * @returns {void}
   */
  removeAutofill() {
    this.logStore.debug('SMILEAPI: removing autofill')
    if (this.store.config.mode === 'development' || this.store.config.mode === 'presentation')
      this.store.removeAutofill()
  }

  // Completion and recruitment
  /**
   * Sets the completion code for the study
   * @param {string} code - The completion code to set
   * @returns {void}
   */
  setCompletionCode(code) {
    this.store.setCompletionCode(code)
  }

  /**
   * Computes a unique completion code based on study data.
   * Creates a hash of all pageData_* fields and appends status indicators.
   * Falls back to studyData for backward compatibility if no pageData fields exist.
   *
   * @returns {string} A unique completion code with status suffix
   */
  computeCompletionCode() {
    // Collect all pageData_* fields
    const pageDataFields = {}
    for (const key in this.store.data) {
      if (key.startsWith('pageData_')) {
        pageDataFields[key] = this.store.data[key]
      }
    }

    // Use pageData if available, fallback to studyData for backward compat
    let dataToHash
    if (Object.keys(pageDataFields).length > 0) {
      dataToHash = stringify(pageDataFields)
    } else {
      dataToHash = stringify(this.store.data.studyData)
    }

    const hashDigest = Base64url.stringify(sha256(dataToHash))

    const codes = {
      withdrew: 'xx',
      completed: 'oo',
    }
    let endCode = ''
    if (this.store.browserPersisted.withdrawn) {
      endCode = codes['withdrew']
    } else if (this.store.browserPersisted.done) {
      endCode = codes['completed']
    }
    return hashDigest.slice(0, 20) + endCode
  }

  /**
   * Gets the recruitment service being used (e.g. Prolific, MTurk)
   * @returns {string} The name of the recruitment service
   */
  getRecruitmentService() {
    return this.store.data.recruitmentService
  }

  // dev tools
  /**
   * Checks if an autofill function is registered
   * @returns {boolean} True if autofill function exists, false otherwise
   */
  hasAutofill() {
    return this.store.hasAutofill
  }

  /**
   * Executes the registered autofill function
   * @returns {*} The result of the autofill function
   */
  autofill() {
    return this.store.autofill()
  }

  // routes
  /**
   * Gets the name of the current route
   * @returns {string} The current route name
   */
  currentRouteName() {
    return this.route.name
  }

  // routes
  /**
   * Gets the info of the current route
   * @returns {Object} The current route info
   */
  currentRouteInfo() {
    return this.route
  }

  /**
   * Gets the name of the current view
   * @returns {string} The current view name
   */
  currentViewName() {
    return this.route.name
  }

  /**
   * Gets a condition by its name
   * @param {string} name - The name of the condition to get
   * @returns {*} The condition value
   */
  getConditionByName(name) {
    return this.store.getConditionByName(name)
  }

  /**
   * Gets the browser fingerprint
   * @returns {string} The browser fingerprint
   */
  getBrowserFingerprint() {
    return this.store.getBrowserFingerprint()
  }

  // Event and trial management
  /**
   * Records a window event
   * @param {string} type - The type of window event
   * @param {*} event_data - Additional event data (optional)
   * @returns {void}
   */
  recordWindowEvent(type, event_data = null) {
    this.store.recordWindowEvent(type, event_data)
  }

  /**
   * Saves the current data
   * @param {boolean} force - Whether to force save
   * @returns {void}
   */
  saveData(force) {
    this.store.saveData(force)
  }

  /**
   * Records trial data and increments trial counter
   * @deprecated Use recordPageData() instead. The studyData array will be maintained for backward compatibility but is deprecated.
   * @param {*} data - The trial data to record
   * @returns {void}
   */
  recordData(data) {
    this.logStore.warn('SMILE API: recordData() is deprecated. Use recordPageData() instead.')
    this.store.data.trialNum += 1
    this.store.recordData(data) // Keep for backward compat
    this.recordPageData(data) // Also record to new format
  }

  // Randomization and conditions
  /**
   * Sets a random seed for the random number generator
   * @param {string} [seed=uuidv4()] - The seed to use, defaults to a random UUID
   * @returns {void}
   */
  randomSeed(seed = uuidv4()) {
    seedrandom(seed, { global: true })
  }

  /**
   * Randomly assigns a condition from a set of possible conditions
   * @param {Object} conditionObject - Object containing condition name and possible values
   * @param {string[]} conditionObject[name] - Array of possible condition values
   * @param {number[]} [conditionObject.weights] - Optional weights for sampling conditions
   * @returns {string|null} The assigned condition value, or null if error
   */
  randomAssignCondition(conditionObject) {
    const keys = Object.keys(conditionObject)
    const conditionNames = keys.filter((key) => key !== 'weights')

    if (conditionNames.length > 1) {
      this.logStore.error('SMILE API: randomAssignCondition() only accepts one condition name at a time')
      return null
    }

    const [name] = conditionNames
    const currentCondition = this.store.getConditionByName(name)
    if (currentCondition) {
      this.logStore.debug('SMILE API: condition already assigned', name, currentCondition)
      return currentCondition
    }

    const possibleConditions = conditionObject[name]
    this.store.browserPersisted.possibleConditions[name] = possibleConditions

    const hasWeights = keys.includes('weights')
    const weights = hasWeights ? conditionObject.weights : undefined

    if (hasWeights && weights.length !== possibleConditions.length) {
      this.logStore.error(
        'SMILE API: randomAssignCondition() weights must be the same length as the condition possibilities'
      )
      return null
    }

    const randomCondition = sampleWithReplacement(possibleConditions, 1, weights)[0]
    this.store.setCondition(name, randomCondition)
    this.logStore.debug('SMILE API: assigned condition', name, randomCondition)
    return randomCondition
  }

  /**
   * Preloads all images from the user assets directory
   * @returns {void}
   */
  preloadAllImages() {
    this.logStore.debug('Preloading images')
    setTimeout(() => {
      Object.values(
        import.meta.glob('@/user/assets/**/*.{png,jpg,jpeg,svg,SVG,JPG,PNG,JPEG}', {
          eager: true,
          query: '?url',
          import: 'default',
        })
      ).forEach((url) => {
        const image = new Image()
        image.src = url
      })
    }, 1)
  }

  /**
   * Preloads all videos from the user assets directory
   * @returns {void}
   */
  preloadAllVideos() {
    this.logStore.debug('Preloading videos')
    setTimeout(() => {
      Object.values(
        import.meta.glob('@/user/assets/**/*.{mp4,mov,avi,m4v}', {
          eager: true,
          query: '?url',
          import: 'default',
        })
      ).forEach((url) => {
        const video = document.createElement('video')
        video.src = url
      })
    }, 1)
  }

  /**
   * Completes the consent process by setting consented status and known user if needed
   * @returns {Promise<void>}
   */
  async completeConsent() {
    this.setConsented()
    if (!this.store.browserPersisted.knownUser) {
      await this.setKnown()
    }
  }
}

/**
 * Creates and returns a reactive SmileAPI instance with necessary dependencies
 * @returns {SmileAPI} A reactive SmileAPI instance with timeline, routing and store functionality
 */
export default function useAPI() {
  const timeline = useTimeline()
  const route = useRoute()
  const router = useRouter()
  const store = useSmileStore()
  const logStore = useLog()

  //const timeline = useTimeline()
  const api = new SmileAPI(store, logStore, route, router, timeline)
  return reactive(api)
}
