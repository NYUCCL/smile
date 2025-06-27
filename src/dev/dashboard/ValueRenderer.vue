<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  value: {
    required: true,
  },
})

const expanded = ref(false)

const isString = computed(() => typeof props.value === 'string')
const isNumber = computed(() => typeof props.value === 'number')
const isBoolean = computed(() => typeof props.value === 'boolean')
const isDate = computed(() => props.value instanceof Date)
const isArray = computed(() => Array.isArray(props.value))
const isObject = computed(
  () =>
    typeof props.value === 'object' &&
    props.value !== null &&
    !Array.isArray(props.value) &&
    !(props.value instanceof Date)
)

function formatDate(date) {
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

function formatRelativeTime(date) {
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`

  return 'More than a month ago'
}
</script>

<template>
  <div class="value-renderer">
    <!-- String values -->
    <div v-if="isString" class="text-gray-900">
      <span v-if="value.length <= 100">{{ value }}</span>
      <div v-else>
        <div v-if="!expanded" class="cursor-pointer" @click="expanded = true">
          {{ value.substring(0, 100) }}...
          <span class="text-blue-600 hover:underline ml-1">[Show More]</span>
        </div>
        <div v-else>
          <div class="whitespace-pre-wrap">{{ value }}</div>
          <button @click="expanded = false" class="text-blue-600 hover:underline text-sm mt-1">[Show Less]</button>
        </div>
      </div>
    </div>

    <!-- Number values -->
    <div v-else-if="isNumber" class="text-purple-600 font-mono">
      {{ value }}
    </div>

    <!-- Boolean values -->
    <div v-else-if="isBoolean" class="font-mono">
      <span :class="value ? 'text-green-600' : 'text-red-600'">
        {{ value }}
      </span>
    </div>

    <!-- Date/Timestamp values -->
    <div v-else-if="isDate" class="text-blue-600">
      <div class="font-medium">{{ formatDate(value) }}</div>
      <div class="text-xs text-gray-500">{{ formatRelativeTime(value) }}</div>
    </div>

    <!-- Array values -->
    <div v-else-if="isArray" class="space-y-1">
      <div class="text-sm text-gray-600 font-medium">Array ({{ value.length }} items)</div>
      <div v-if="!expanded && value.length > 3" class="cursor-pointer" @click="expanded = true">
        <div v-for="(item, index) in value.slice(0, 3)" :key="index" class="ml-4 border-l-2 border-gray-200 pl-2">
          <ValueRenderer :value="item" />
        </div>
        <div class="text-blue-600 hover:underline text-sm ml-4">... and {{ value.length - 3 }} more [Show All]</div>
      </div>
      <div v-else>
        <div v-for="(item, index) in value" :key="index" class="ml-4 border-l-2 border-gray-200 pl-2">
          <div class="text-xs text-gray-500">[{{ index }}]</div>
          <ValueRenderer :value="item" />
        </div>
        <button
          v-if="value.length > 3"
          @click="expanded = false"
          class="text-blue-600 hover:underline text-sm ml-4 mt-1"
        >
          [Show Less]
        </button>
      </div>
    </div>

    <!-- Object values -->
    <div v-else-if="isObject" class="space-y-1">
      <div class="text-sm text-gray-600 font-medium">Object ({{ Object.keys(value).length }} fields)</div>
      <div v-if="!expanded && Object.keys(value).length > 3" class="cursor-pointer" @click="expanded = true">
        <div v-for="key in Object.keys(value).slice(0, 3)" :key="key" class="ml-4 border-l-2 border-gray-200 pl-2">
          <div class="text-sm font-medium text-gray-700">{{ key }}:</div>
          <ValueRenderer :value="value[key]" />
        </div>
        <div class="text-blue-600 hover:underline text-sm ml-4">
          ... and {{ Object.keys(value).length - 3 }} more fields [Show All]
        </div>
      </div>
      <div v-else>
        <div v-for="(val, key) in value" :key="key" class="ml-4 border-l-2 border-gray-200 pl-2">
          <div class="text-sm font-medium text-gray-700">{{ key }}:</div>
          <ValueRenderer :value="val" />
        </div>
        <button
          v-if="Object.keys(value).length > 3"
          @click="expanded = false"
          class="text-blue-600 hover:underline text-sm ml-4 mt-1"
        >
          [Show Less]
        </button>
      </div>
    </div>

    <!-- Null values -->
    <div v-else-if="value === null" class="text-gray-400 italic font-mono">null</div>

    <!-- Undefined values -->
    <div v-else-if="value === undefined" class="text-gray-400 italic font-mono">undefined</div>

    <!-- Unknown types -->
    <div v-else class="text-red-600 font-mono">[{{ typeof value }}] {{ String(value) }}</div>
  </div>
</template>

<style scoped>
.value-renderer {
  word-break: break-word;
}
</style>
