<script setup>
import { ref, computed, watch } from 'vue'
import StepNode from './StepNode.vue'
import StepDataViewer from '@/dev/developer_mode/sidebar/StepDataViewer.vue'
import useViewAPI from '@/core/composables/useViewAPI'
import { ButtonGroup, ButtonGroupItem } from '@/uikit/components/ui/button-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'
import { Button } from '@/uikit/components/ui/button'

/**
 * API instance for step navigation and data access
 * @type {import('@/core/composables/useViewAPI')}
 */
const api = useViewAPI()

/**
 * Computed state machine visualization data
 * @type {import('vue').ComputedRef<Object>}
 */
const stateMachine = computed(() => api.steps.visualize())

/**
 * Converts array path to string format (e.g., [1, 1] -> "1/1")
 * @param {Array} pathArray - The path array to convert
 * @returns {string} The path as a string
 */
const pathToString = (pathArray) => {
  return Array.isArray(pathArray) ? pathArray.join('/') : ''
}

/**
 * Checks if a node is currently selected
 * @param {string} nodePath - The path of the node to check
 * @returns {boolean} True if the node is selected
 */
const isNodeSelected = (nodePath) => {
  if (!api.path) return false
  const currentPathStr = api.pathString
  return nodePath === currentPathStr
}

/**
 * Formats an object with proper indentation for display
 * @param {*} obj - The object to format
 * @param {number} indent - The indentation level
 * @param {WeakSet} seen - Set to track circular references
 * @returns {string} The formatted object string
 */
const formatObjectWithIndent = (obj, indent = 0, seen = new WeakSet()) => {
  if (obj === null || obj === undefined) return 'null'

  // Handle circular references
  if (typeof obj === 'object' && seen.has(obj)) {
    return '[Circular]'
  }

  const spaces = ' '.repeat(indent * 2) // 2 spaces per indent level

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    seen.add(obj)
    const items = obj.map((item) => formatObjectWithIndent(item, indent + 1, seen)).join(',\n' + spaces + '  ')
    return `[\n${spaces}  ${items}\n${spaces}]`
  }

  if (typeof obj === 'object') {
    const entries = Object.entries(obj)
    if (entries.length === 0) return '{}'
    seen.add(obj)
    const items = entries
      .map(([key, value]) => {
        const formattedValue = formatObjectWithIndent(value, indent + 1, seen)
        return `${key}: ${formattedValue}`
      })
      .join(', ')
    return `{ ${items} }`
  }

  // Handle primitive values
  if (typeof obj === 'string') return `"${obj}"`
  return String(obj)
}

/**
 * Computed formatted root node for display
 * @type {import('vue').ComputedRef<string>}
 */
const formattedRootNode = computed(() => {
  return formatObjectWithIndent(stateMachine.value)
})

/**
 * Formats data for display in the tree
 * @param {*} data - The data to format
 * @returns {string} The formatted data string
 */
const formatData = (data) => {
  if (data === null || data === undefined) return ''

  try {
    if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data)
      if (keys.length > 0) {
        // Show up to 3 key-value pairs
        const previewKeys = keys.slice(0, 3)
        const preview = previewKeys
          .map((k) => {
            const val = data[k]
            const valStr =
              typeof val === 'object'
                ? '{...}'
                : typeof val === 'string'
                  ? `"${val.substring(0, 15)}${val.length > 15 ? '...' : ''}"`
                  : String(val)
            return `${k}: ${valStr}`
          })
          .join(', ')
        return `{${preview}${keys.length > 3 ? ', ...' : ''}}`
      }
      return '{}'
    } else if (Array.isArray(data)) {
      return `[${data.length > 0 ? '...' + data.length + ' items...' : ''}]`
    } else {
      return `(${String(data)})`
    }
  } catch (e) {
    return '(data)'
  }
}

/**
 * Handles node click events for navigation
 * @param {string} path - The path of the clicked node
 */
const handleNodeClick = (path) => {
  console.log('Node clicked with path:', path)
  if (api.steps) {
    api.goToStep(path)
    // Scroll will happen via the watcher
  } else {
    console.warn('Stepper not available for path reset')
  }
}

/**
 * Handles page reload
 */
const handleReload = () => {
  window.location.reload()
}

/**
 * Reference to the tree container for scrolling
 * @type {import('vue').Ref<HTMLElement|null>}
 */
const treeContainer = ref(null)

/**
 * Scrolls to the currently selected node
 */
const scrollToSelectedNode = () => {
  if (!api.path) return

  setTimeout(() => {
    // Use the component's scope to find the selected node
    if (!treeContainer.value) return

    const selectedNode = treeContainer.value.querySelector('.node-selected')
    if (!selectedNode) return

    try {
      // Get the container's scroll position and dimensions
      const container = treeContainer.value
      const containerRect = container.getBoundingClientRect()
      const nodeRect = selectedNode.getBoundingClientRect()

      // Calculate the relative position of the node within the container
      const relativeTop = nodeRect.top - containerRect.top
      const relativeBottom = nodeRect.bottom - containerRect.top

      // Calculate the center position we want
      const targetPosition = relativeTop - containerRect.height / 2 + nodeRect.height / 2

      // Smoothly scroll to the target position
      container.scrollTop += targetPosition
    } catch (e) {
      console.error('Error scrolling to selected node:', e)
    }
  }, 100)
}

/**
 * Watcher for path changes to trigger scroll to selected node
 */
watch(
  () => api.path,
  (newPath) => {
    if (newPath) {
      scrollToSelectedNode()
    }
  }
)
</script>

<template>
  <!-- Main step explorer container -->
  <div class="tree-viewer-container" v-if="api.steps">
    <!-- Navigation controls section -->
    <div :class="{ disabled: api.nSteps === 0 }">
      <div class="path-display-container">
        <!-- Current path display -->
        <div class="path-info">
          <div class="path-display">{{ api.pathString }}</div>
        </div>

        <!-- Navigation buttons -->
        <TooltipProvider>
          <ButtonGroup variant="outline" size="menu">
            <Tooltip>
              <TooltipTrigger asChild>
                <ButtonGroupItem @click="api.goPrevStep()" :disabled="!api.hasSteps()">
                  <i-lucide-chevron-left />
                </ButtonGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom">Previous Step</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ButtonGroupItem @click="api.goNextStep()" :disabled="!api.hasSteps()">
                  <i-lucide-chevron-right />
                </ButtonGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom">Next Step</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ButtonGroupItem @click="api.goFirstStep()" :disabled="!api.hasSteps()">
                  <i-famicons-home />
                </ButtonGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom">First Step</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ButtonGroupItem @click="api.clear()" :disabled="!api.hasSteps()">
                  <i-mdi-trash />
                </ButtonGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom">Clear Steps</TooltipContent>
            </Tooltip>
          </ButtonGroup>
        </TooltipProvider>
      </div>
    </div>

    <!-- Tree structure display -->
    <div class="tree-container" ref="treeContainer">
      <div v-if="api.nSteps > 0">
        <!-- Step index display -->
        <div class="index-display">
          <Tooltip>
            <TooltipTrigger>{{ api.stepIndex }}/{{ api.nSteps }}</TooltipTrigger>
            <TooltipContent side="bottom">Step index</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger class="ml-1 text-teal-500">({{ api.blockIndex }}/{{ api.blockLength }})</TooltipTrigger>
            <TooltipContent side="bottom">Index within block</TooltipContent>
          </Tooltip>
        </div>

        <!-- Tree structure -->
        <ul class="tree-root">
          <li v-if="stateMachine" class="tree-node root-node">
            <ul v-if="stateMachine.rows && stateMachine.rows.length > 0" class="children">
              <StepNode
                v-for="(state, index) in stateMachine.rows"
                :key="index"
                :state="state"
                :index="index"
                :total="stateMachine.rows.length"
                :is-node-selected="isNodeSelected"
                :format-data="formatData"
                :depth="1"
                :max-depth="5"
                :vertical-lines="[]"
                @node-click="handleNodeClick"
              />
            </ul>
          </li>
        </ul>
      </div>
      <!-- Empty state when no steps defined -->
      <div class="tree-viewer-container-empty disabled" v-else>No steps defined</div>
    </div>

    <!-- Global persisted variables section -->
    <div class="data-container-global" :class="{ disabled: Object.keys(api.persist).length === 0 }">
      <div class="section-title">
        <span>Persisted Vars <span class="data-label">(.persist)</span></span>
        <Button
          @click="api.clearPersist()"
          variant="outline"
          size="menu"
          class="has-tooltip-arrow has-tooltip-bottom"
          data-tooltip="Delete Global Variables"
        >
          <i-fa6-solid-trash />
        </Button>
      </div>
      <div class="global-data-display">
        <StepDataViewer :data="api.persist" v-if="Object.keys(api.persist).length !== 0" />
        <div class="italic text-xs" v-else>No variables persisted</div>
      </div>
    </div>

    <!-- Step data section -->
    <div class="data-container" :class="{ disabled: api.nSteps === 0 }">
      <div class="section-title">
        <span>Step Data <span class="data-label">(.stepData)</span></span>
      </div>
      <div class="data-display">
        <!--
        <button
          @click="api.clearCurrentStepData()"
          class="button is-small nav-button-small has-tooltip-arrow has-tooltip-bottom"
          data-tooltip="Delete Nodes"
        >
          <span><i-fa6-solid-trash" /></span>
        </button>
        -->
        <StepDataViewer :data="api.stepData" v-if="api.nSteps !== 0" />
        <div class="italic text-xs" v-else>Data defined on this step</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tree-viewer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0; /* Important for nested flex containers */
  overflow: hidden;
  background-color: var(--background);
  border-top: 1px solid var(--border);
}

.tree-viewer-container-empty {
  flex: 1;
  height: 100%;
  padding-top: 5px;
  padding-left: 10px;
  padding-right: 10px;
  font-size: 0.75rem;
  font-family: monospace;
  font-weight: 200;
  color: var(--muted-foreground);
  text-align: left;
  font-style: italic;
}

.path-display-container {
  background-color: var(--background);
  padding: 0px 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 32px;
  flex-shrink: 0; /* Prevent shrinking */
}

.path-info {
  display: flex;
  align-items: baseline; /* Change from center to baseline */
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 800;
  color: #389e95;
  font-size: 0.9rem;
  line-height: 1; /* Add line-height to control vertical spacing */
}

.path-display {
  margin-left: 5px;
  font-size: clamp(0.5rem, 0.8rem, 0.8rem); /* Shrink font size if needed but not larger than 0.9rem */
  font-family: monospace;
  font-weight: 500;
  color: #246761;
  line-height: 1;
  white-space: nowrap; /* Prevent wrapping */
  overflow: hidden; /* Hide overflow */
  text-overflow: ellipsis; /* Show ellipsis for overflow */
}

.nav-buttons {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-button {
  font-size: 0.6rem;
  border-left: 1px solid #e4e4e4;
}
.nav-button-small {
  font-size: 0.5rem;
  border-left: 1px solid #e4e4e4;
}
.smaller {
  padding-bottom: 11px;
  padding-top: 10px;
}
.topbar {
  background-color: #f8f8f8;
  padding-left: 10px;
}
.topbar-border {
  border-top: 1px solid #e4e4e4;
  padding-top: 4px;
}

.index-display {
  font-size: 0.7rem;
  padding-right: 4px;
  padding-top: 3px;
  font-family: monospace;
  font-weight: 500;
  color: #e49310;
  line-height: 1; /* Add line-height to match */
  text-align: right;
  position: absolute;
  right: 0;
  top: 4px;
  z-index: 50;
}
.content-display {
  font-size: 0.7rem;
  line-height: 1.4;
  font-family: monospace;
  font-weight: 800;
  color: #6a6a6a;
  white-space: pre-wrap;
}

.state-tree-viewer {
  font-family: monospace;
  padding: 1rem;
}

.tree-container {
  flex: 0 1 auto; /* don't grow, can shrink, auto basis */
  overflow: auto;
  font-family: monospace;
  border-top: 1px solid var(--border);
  position: relative;
  scroll-behavior: smooth;
  max-height: 300px;
  min-height: 50px;
  background-color: var(--background);
}

.data-container-global {
  flex: 0 0 auto; /* don't grow, don't shrink, auto basis */
  overflow: visible;
  display: flex;
  flex-direction: column;
  min-height: 120px;
  background-color: var(--background);
  border-top: 1px solid var(--border);
  text-align: left;
}

.data-container {
  flex: 0 0 auto; /* don't grow, don't shrink, auto basis */
  overflow: visible;
  display: flex;
  flex-direction: column;
  background-color: var(--background);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  text-align: left;
}

.data-container.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.data-container-global.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.tree-root {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
  font-family: monospace;
}

.tree-node {
  margin: 3px 0;
  position: relative;
  font-family: monospace;
  font-size: 0.75rem;
}

/* First tree node has no padding */
.tree-root > li.tree-node {
  padding-left: 0;
}

.global-data-display {
  flex: 1;
  overflow: auto;
  padding: 10px;
  font-size: 0.8rem;
  font-weight: 200;
  font-family: monospace;
  color: var(--muted-foreground);
}

.data-display {
  flex: 1;
  overflow: auto;
  padding: 10px;
  min-height: 180px;
  font-size: 0.8rem;
  font-weight: 500;
  font-family: monospace;
  color: var(--muted-foreground);
}

.data-label {
  font-size: 0.7rem;
  font-weight: 500;
  font-family: monospace;
  color: #10a8a2;
  padding-right: 6px;
}

.section-title {
  font-size: 0.75rem;
  color: var(--muted-foreground);
  font-family: monospace;
  text-align: left;
  background-color: var(--muted);
  padding: 0.375rem 0.5rem;
  margin: 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
