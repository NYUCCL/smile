<script setup>
/**
 * Props for StepNode component
 * @typedef {Object} StepNodeProps
 * @property {Object} state - The state object for this node
 * @property {number} index - The index of this node among siblings
 * @property {number} total - The total number of siblings
 * @property {Function} isNodeSelected - Function to check if node is selected
 * @property {Function} formatData - Function to format node data
 * @property {number} depth - The current depth in the tree
 * @property {number} maxDepth - The maximum depth to render
 * @property {Array} verticalLines - Array indicating where to draw vertical lines
 */
const props = defineProps({
  state: Object,
  index: Number,
  total: Number,
  isNodeSelected: Function,
  formatData: Function,
  depth: {
    type: Number,
    default: 1,
  },
  maxDepth: {
    type: Number,
    default: 5,
  },
  verticalLines: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['node-click'])

/**
 * Emits node-click event with the node's path
 */
const handleClick = () => {
  emit('node-click', props.state.path)
}

/**
 * Returns the branch type character for tree display
 * @param {number} index - Index of the node
 * @param {number} total - Total siblings
 * @param {number} depth - Current depth
 * @returns {string} Branch type character
 */
const getBranchType = (index, total, depth) => {
  if (index === 0 && depth === 1) {
    return '\u250c\u2500 '
  } else if (index === total - 1) {
    return '\u2514\u2500 '
  } else {
    return '\u251c\u2500 '
  }
}

/**
 * Returns the vertical lines prefix for tree display
 * @param {Array} verticalLines - Array of booleans for vertical lines
 * @returns {string} Vertical line prefix
 */
const getVerticalPrefix = (verticalLines) => {
  if (!verticalLines || !verticalLines.length) return ''
  return verticalLines.map((hasLine) => (hasLine ? '\u2502 ' : '  ')).join('')
}

/**
 * Returns the vertical lines array for children
 * @param {Array} verticalLines - Current vertical lines
 * @param {number} index - Index of this node
 * @param {number} total - Total siblings
 * @returns {Array} New vertical lines array for children
 */
const getChildVerticalLines = (verticalLines, index, total) => {
  const newLines = [...verticalLines]
  newLines.push(index < total - 1)
  return newLines
}
</script>

<template>
  <!-- Tree node item -->
  <li class="tree-node">
    <div
      class="tree-line"
      :class="{
        'node-selected': isNodeSelected(state.path),
      }"
      @click="handleClick"
    >
      <span class="vertical-lines">{{ getVerticalPrefix(verticalLines) }}</span>
      <span class="tree-branch">{{ getBranchType(index, total, depth) }}</span>
      <span class="node-path" :class="{ 'leaf-state': !state.isLeaf }"
        >{{ state.path }} <i-fa6-solid-house-flag class="home-icon inline" v-if="state.isFirstLeaf" />
        <i-fa6-solid-leaf class="text-green-400 dark:text-green-500 inline" v-else-if="state.isLeaf" />
      </span>
    </div>

    <!-- Recursive tree nodes, but limit depth -->
    <ul v-if="state.rows && state.rows.length > 0 && depth < maxDepth" class="children">
      <StepNode
        v-for="(childState, childIndex) in state.rows"
        :key="childIndex"
        :state="childState"
        :index="childIndex"
        :total="state.rows.length"
        :is-node-selected="isNodeSelected"
        :format-data="formatData"
        :depth="depth + 1"
        :max-depth="maxDepth"
        :vertical-lines="getChildVerticalLines(verticalLines, index, total)"
        @node-click="$emit('node-click', $event)"
      />
    </ul>
  </li>
</template>

<style scoped>
.tree-node {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tree-line {
  display: flex;
  align-items: center;
  padding: 2px 0;
  white-space: pre;
  cursor: pointer;
  margin-right: 10px;
  margin-left: 10px;
}

.tree-line:hover {
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 10px;
  margin-right: 70px;
}

.node-selected {
  background-color: rgb(146, 249, 224);
  color: black;
  border-radius: 10px;
  margin-right: 70px;
}

.node-selected:hover {
  background-color: rgba(146, 249, 224, 0.5);
}

.vertical-lines {
  font-family: monospace;
}

.tree-branch {
  font-family: monospace;
}

.node-path {
  margin-left: 4px;
  font-weight: 400;
}

.node-data {
  margin-left: 8px;
  color: #666;
  font-family: monospace;
}

.children {
  margin: 0;
  padding: 0;
  list-style: none;
}

.end-state {
  opacity: 0.4;
  color: #f10e0e;
}

.leaf-state {
  opacity: 0.5;
}

.leaf-icon {
  color: #04a004;
  opacity: 0.35;
}

.dark.leaf-icon {
  color: #c7fbb7;
}

.home-icon {
  color: #0eb6e0;
  opacity: 0.65;
}
</style>
