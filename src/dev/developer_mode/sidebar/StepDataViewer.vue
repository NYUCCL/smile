<script setup>
import { ref } from 'vue'

/**
 * Props for the StepDataViewer component
 * @typedef {Object} Props
 * @property {Object|Array|String|Number|Boolean|null} data - The data to be displayed in the viewer
 */
const props = defineProps({
  data: {
    type: [Object, Array, String, Number, Boolean, null],
    required: true,
  },
})

/**
 * Set of expanded node paths for tracking which nodes are expanded
 * @type {import('vue').Ref<Set>}
 */
const expandedNodes = ref(new Set())

/**
 * Toggles the expansion state of a node
 * @param {string} path - The path/key of the node to toggle
 */
const toggleNode = (path) => {
  if (expandedNodes.value.has(path)) {
    expandedNodes.value.delete(path)
  } else {
    expandedNodes.value.add(path)
  }
}

/**
 * Formats a value for display in the viewer
 * @param {*} value - The value to format
 * @returns {string} The formatted value string
 */
const formatValue = (value) => {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return `"${value}"`
  return String(value)
}

/**
 * Checks if a value is expandable (object or array)
 * @param {*} value - The value to check
 * @returns {boolean} True if the value is expandable
 */
const isExpandable = (value) => {
  return value !== null && (typeof value === 'object' || Array.isArray(value))
}

/**
 * Checks if a value is a single primitive type
 * @param {*} value - The value to check
 * @returns {boolean} True if the value is a string, number, or boolean
 */
const isSinglePrimitive = (value) => {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
}
</script>

<template>
  <!-- Main data viewer container -->
  <div class="data-path-viewer">
    <!-- Render expandable objects/arrays -->
    <template v-if="isExpandable(data)">
      <div v-for="(value, key) in data" :key="key" class="data-node">
        <!-- Render primitive values directly -->
        <template v-if="isSinglePrimitive(value)">
          <div class="node-content">
            <span class="key">{{ key }}:</span>
            <span class="primitive-value">{{ formatValue(value) }}</span>
          </div>
        </template>
        <!-- Render expandable objects/arrays with toggle functionality -->
        <template v-else>
          <div class="node-content" @click="toggleNode(key)">
            <span class="expand-icon">{{ expandedNodes.has(key) ? '▼' : '▶' }}</span>
            <span class="key">{{ key }}:</span>
            <span v-if="!expandedNodes.has(key)" class="preview">
              {{ Array.isArray(value) ? `[${value.length} items]` : '{...}' }}
            </span>
          </div>
          <!-- Nested content when expanded -->
          <div v-if="expandedNodes.has(key)" class="nested-content">
            <StepDataViewer :data="value" />
          </div>
        </template>
      </div>
    </template>
    <!-- Render primitive values directly -->
    <template v-else>
      <span class="primitive-value">{{ formatValue(data) }}</span>
    </template>
  </div>
</template>

<style scoped>
.data-path-viewer {
  font-family: monospace;
  font-size: 0.7rem;
  line-height: 1.4;
}

.data-node {
  margin: 2px 0;
}

.node-content {
  cursor: pointer;
  padding: 2px 0;
  user-select: none;
}

.node-content:hover {
  background-color: #f0f0f0;
}

.expand-icon {
  display: inline-block;
  width: 16px;
  color: #666;
}

.key {
  color: #0baac3;
  margin-right: 4px;
}

.preview {
  color: #666;
  font-style: italic;
}

.primitive-value {
  color: #dda814;
}

.nested-content {
  padding-left: 20px;
  border-left: 1px dotted #ccc;
}
</style>
