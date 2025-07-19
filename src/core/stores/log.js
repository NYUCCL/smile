/**
 * @module log
 * @description Pinia store for managing application logging functionality. Provides methods for:
 * - Logging messages at different levels (debug, info, warn, error)
 * - Capturing stack traces
 * - Formatting log messages
 * - Notifying users of important events
 * - Integrating with the application's global state management
 */
import { defineStore } from 'pinia'
import appconfig from '@/core/config'
import { toast } from 'vue-sonner'
import useSmileStore from '@/core/stores/smilestore'

/**
 * Gets a formatted stack trace string from the current execution context
 * @returns {string} A formatted string containing the file path, line number and column number of the caller,
 *                   or '(could not parse trace)' if parsing fails
 * @example
 * // Returns something like: "src/components/MyComponent.vue (line 42, column 3)"
 * const trace = getLogTrace();
 */
function getLogTrace() {
  // some browsers use 'at ', some use '@'
  const lines = new Error().stack.split('\n').filter((line) => line.includes('at ') || line.includes('@'))
  if (lines.length < 4) {
    return '(could not parse trace)'
  }
  // strip leading 'http://localhost:xxx/.../.../.../' and '?t=xxx' query param, if present
  const regex =
    /(?:at\s|@)(?:.*?\s\()?(http:\/\/localhost:\d+\/\w+\/\w+\/\w+\/)?(?<filePath>.+?)(?:\?.*?)?(?::(?<lineNumber>\d+):(?<columnNumber>\d+))\)?/
  const match = regex.exec(lines[3])
  if (match) {
    return `${match.groups.filePath} (line ${match.groups.lineNumber}, column ${match.groups.columnNumber})`
  } else {
    return '(could not parse trace)'
  }
}

/**
 * Converts an array of arguments into a single string representation
 * @param {Array} args - Array of arguments to convert to string
 * @returns {string} Space-separated string of all arguments, with objects JSON stringified
 * @example
 * // Returns "hello 42 {"foo":"bar"}"
 * argsToString(["hello", 42, {foo: "bar"}])
 */
function argsToString(args) {
  return args
    .map((arg) => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg)
        } catch (e) {
          return ''
        }
      } else {
        return String(arg)
      }
    })
    .join(' ')
}

/**
 * Pinia store for managing application logging functionality
 * @returns {Object} Store instance with state and actions for logging
 * @example
 * const logStore = useLogStore()
 * logStore.log('Hello world') // Logs a message
 * logStore.warn('Warning message') // Logs a warning
 * logStore.debug('Debug info') // Logs debug info in development mode
 */
export default defineStore('log', {
  /**
   * State for the log store
   * @returns {Object} Store state object
   * @property {Array} history - Array containing all log messages across the entire session
   * @property {Array} page_history - Array containing log messages for the current page/route only
   */
  state: () => ({
    history: [],
    page_history: [],
  }),
  actions: {
    /**
     * Adds a message to both the global history and page history arrays
     * @param {Object} msg - The message object to add to history
     */
    addToHistory(msg) {
      this.history.push(msg)
      this.page_history.push(msg)
    },

    /**
     * Clears the page-specific history array while preserving global history
     */
    clearPageHistory() {
      this.page_history = []
    },

    /**
     * Logs a standard message to history
     * @param {...*} args - Arguments to log, will be converted to string
     */
    log(...args) {
      const message = argsToString(args)
      const msg = {
        type: 'log',
        time: new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }),
        message: message,
        trace: getLogTrace(),
      }
      this.addToHistory(msg)
    },

    /**
     * Logs a debug message to history and console in development mode
     * @param {...*} args - Arguments to log, will be converted to string
     */
    debug(...args) {
      const message = argsToString(args)
      const msg = {
        type: 'debug',
        time: new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }),
        message: message,
        trace: getLogTrace(),
      }
      if (appconfig.mode === 'development') {
        console.log(message)
      }
      this.addToHistory(msg)
    },

    /**
     * Logs a warning message to history and optionally shows notification based on settings
     * @param {...*} args - Arguments to log, will be converted to string
     */
    warn(...args) {
      const smilestore = useSmileStore()
      const message = argsToString(args)
      const msg = {
        type: 'warn',
        time: new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }),
        message: message,
        trace: getLogTrace(),
      }
      if (
        smilestore.dev.notificationFilter !== 'None' &&
        (smilestore.dev.notificationFilter == 'Warnings and Errors' ||
          smilestore.dev.notificationFilter == 'Warnings only') &&
        appconfig.mode === 'development'
      ) {
        toast.warning(message)
      }
      console.warn(message)
      this.addToHistory(msg)
    },

    /**
     * Logs an error message to history and optionally shows notification based on settings
     * @param {...*} args - Arguments to log, will be converted to string
     */
    error(...args) {
      const smilestore = useSmileStore()
      const message = argsToString(args)
      const msg = {
        type: 'error',
        time: new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }),
        message: message,
        trace: getLogTrace(),
      }
      if (
        smilestore.dev.notificationFilter !== 'None' &&
        (smilestore.dev.notificationFilter == 'Warnings and Errors' ||
          smilestore.dev.notificationFilter == 'Errors only') &&
        appconfig.mode === 'development'
      ) {
        toast.error(message)
      }
      console.error(message)
      this.addToHistory(msg)
    },

    /**
     * Logs a success message to history and optionally shows notification based on settings
     * @param {...*} args - Arguments to log, will be converted to string
     */
    success(...args) {
      const smilestore = useSmileStore()
      const message = argsToString(args)
      const msg = {
        type: 'success',
        time: new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }),
        message: message,
        trace: getLogTrace(),
      }
      if (
        smilestore.dev.notificationFilter !== 'None' &&
        (smilestore.dev.notificationFilter == 'All' || smilestore.dev.notificationFilter == 'Success only') &&
        appconfig.mode === 'development'
      ) {
        toast.success(message)
      }
      console.log(message)
      this.addToHistory(msg)
    },
  },
})
