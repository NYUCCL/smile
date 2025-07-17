/**
 * Custom color mode composable for SMILE UI
 * Manages separate color modes for different UI contexts:
 * - 'global': Applies to html element (SmileAppSidebar button)
 * - 'experiment': Applies to experiment containers only (dev tools buttons)
 */

import { ref, computed, watch, nextTick } from 'vue'
import { usePreferredDark } from '@vueuse/core'

// Global state for color modes
const globalColorMode = ref('auto') // For html element (SmileAppSidebar)
const experimentColorMode = ref('auto') // For experiment containers (dev tools)

// Global MutationObserver for portaled elements
let portalObserver = null
const portalSelectors = [
  '[data-slot="popover-content"]',
  '[data-slot="select-content"]',
  '[data-slot="dialog-content"]',
  '[data-slot="tooltip-content"]',
  '[data-slot="dropdown-menu-content"]',
  '[data-slot="context-menu-content"]',
  '[data-slot="menubar-content"]',
]

// Global set to track experiment portal triggers
const experimentPortalTriggers = new Set()

// Function to check if an element is within an experiment context
const isInExperimentContext = (element) => {
  // Check if the element or its ancestors have experiment-related selectors
  const experimentSelectors = [
    '#main-app',
    '.device-container',
    '.fullscreen-container',
    '.dev-color-mode .device-wrapper',
    '[data-experiment-scope]', // We can add this attribute to experiment containers
  ]

  return experimentSelectors.some((selector) => {
    const container = document.querySelector(selector)
    return container && container.contains(element)
  })
}

// Function to apply color mode to experiment-scoped portaled elements only
const applyColorModeToExperimentPortals = (mode) => {
  portalSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      // Only apply to portaled elements that have a data attribute marking them as experiment-scoped
      if (el.hasAttribute('data-experiment-portal')) {
        el.classList.remove('light', 'dark')
        if (mode === 'dark' || mode === 'light') {
          el.classList.add(mode)
        }
      }
    })
  })
}

// Set up MutationObserver for dynamically created portaled elements
const setupPortalObserver = () => {
  if (portalObserver || typeof window === 'undefined') return

  portalObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if the added node or any of its descendants match our portal selectors
          portalSelectors.forEach((selector) => {
            const matchingElements = []

            if (node.matches && node.matches(selector)) {
              matchingElements.push(node)
            }
            // Also check descendants
            if (node.querySelectorAll) {
              matchingElements.push(...node.querySelectorAll(selector))
            }

            matchingElements.forEach((el) => {
              // Check if this portal element should be treated as experiment-scoped
              // We'll look for triggers within experiment containers
              if (shouldBeExperimentPortal(el)) {
                el.setAttribute('data-experiment-portal', 'true')

                // Apply current experiment color mode
                const currentMode =
                  experimentColorMode.value === 'auto'
                    ? usePreferredDark().value
                      ? 'dark'
                      : 'light'
                    : experimentColorMode.value

                el.classList.remove('light', 'dark')
                if (currentMode === 'dark' || currentMode === 'light') {
                  el.classList.add(currentMode)
                }
              }
            })
          })
        }
      })
    })
  })

  portalObserver.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

// Function to determine if a portaled element should use experiment color mode
const shouldBeExperimentPortal = (portalElement) => {
  // Simple approach: check if any experiment containers exist and have focus/active elements
  const experimentContainer = document.querySelector('[data-experiment-scope]')
  if (!experimentContainer) return false

  // Check if there are any open popover/select triggers within the experiment container
  const openTriggers = experimentContainer.querySelectorAll('[data-state="open"], [aria-expanded="true"]')
  return openTriggers.length > 0
}

// Setup click tracking to identify experiment-originating portals
const setupExperimentPortalTracking = () => {
  if (typeof window === 'undefined') return

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target
      const experimentScope = target.closest('[data-experiment-scope]')

      if (experimentScope) {
        // Mark this as a potential experiment portal trigger
        experimentPortalTriggers.add(target)

        // Clean up old triggers after a delay
        setTimeout(() => {
          experimentPortalTriggers.delete(target)
        }, 1000)
      }
    },
    true
  ) // Use capture phase to catch before portal creation
}

/**
 * Creates a color mode manager for different UI contexts
 * @param {string} scope - Either 'global' or 'experiment' to specify which scope to manage
 * @param {Object} options - Configuration options
 * @returns {Object} Color mode management object
 */
export function useSmileColorMode(scope = 'experiment', options = {}) {
  const preferredDark = usePreferredDark()

  // Determine which mode ref to use based on scope
  const modeRef = scope === 'global' ? globalColorMode : experimentColorMode

  // System computed value
  const system = computed(() => (preferredDark.value ? 'dark' : 'light'))

  // Actual resolved state (auto -> system preference)
  const state = computed(() => (modeRef.value === 'auto' ? system.value : modeRef.value))

  // Function to apply color mode to specific selector
  const applyColorMode = (selector, mode) => {
    const el = document.querySelector(selector)
    if (!el) return

    // Remove existing mode classes
    el.classList.remove('light', 'dark')

    // Add the new mode class
    if (mode === 'dark' || mode === 'light') {
      el.classList.add(mode)
    }
  }

  // Watch for changes and apply to appropriate selectors
  watch(
    state,
    (newMode) => {
      nextTick(() => {
        if (scope === 'global') {
          // Apply to html element for global theming
          applyColorMode('html', newMode)
        } else if (scope === 'experiment') {
          // Apply to experiment containers only
          applyColorMode('#main-app', newMode)
          applyColorMode('.device-container', newMode)
          applyColorMode('.fullscreen-container', newMode)
          applyColorMode('.dev-color-mode', newMode)
          applyColorMode('.device-wrapper', newMode)

          // Apply to experiment-scoped portaled UI components and set up observer for new ones
          applyColorModeToExperimentPortals(newMode)
          setupPortalObserver()
          setupExperimentPortalTracking()
        }
      })
    },
    { immediate: true }
  )

  return {
    // Reactive color mode value (can be 'auto', 'light', or 'dark')
    mode: modeRef,

    // System preference
    system,

    // Resolved state (never 'auto', always 'light' or 'dark')
    state,

    // Convenience setter functions
    setLight: () => {
      modeRef.value = 'light'
    },
    setDark: () => {
      modeRef.value = 'dark'
    },
    setAuto: () => {
      modeRef.value = 'auto'
    },

    // Toggle function
    toggle: () => {
      if (modeRef.value === 'auto') {
        modeRef.value = 'light'
      } else if (modeRef.value === 'light') {
        modeRef.value = 'dark'
      } else {
        modeRef.value = 'auto'
      }
    },
  }
}

/**
 * Get the current color mode for a specific scope without creating a new instance
 * @param {string} scope - Either 'global' or 'experiment'
 * @returns {string} Current color mode ('auto', 'light', or 'dark')
 */
export function getColorMode(scope = 'experiment') {
  return scope === 'global' ? globalColorMode.value : experimentColorMode.value
}

/**
 * Set the color mode for a specific scope
 * @param {string} scope - Either 'global' or 'experiment'
 * @param {string} mode - Color mode ('auto', 'light', or 'dark')
 */
export function setColorMode(scope, mode) {
  if (scope === 'global') {
    globalColorMode.value = mode
  } else {
    experimentColorMode.value = mode
  }
}
