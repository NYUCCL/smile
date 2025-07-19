<script setup>
import { computed } from 'vue'
import { getResponsiveWidthClasses } from './layoutUtils.js'

const props = defineProps({
  leftFirst: {
    type: Boolean,
    default: false,
    description: 'Whether left column should appear first on mobile (true) or right column should appear first (false)',
  },
  leftWidth: {
    type: String,
    default: 'w-1/3',
    description: 'Tailwind width class for the left column (e.g., w-1/3, w-1/2, w-2/5)',
  },
  responsiveUI: {
    type: Boolean,
    default: true,
    description: 'Whether to use responsive layout behavior',
  },
  class: {
    type: String,
    default: '',
    description: 'Additional CSS classes to apply to the container',
  },
})

const leftColumnClasses = computed(() => {
  return getResponsiveWidthClasses(props.leftWidth, props.responsiveUI)
})

const containerClasses = computed(() => {
  if (!props.responsiveUI) {
    return 'mt-10 flex gap-6'
  }
  return props.leftFirst
    ? 'mt-10 flex gap-6 flex-col @lg:flex-row'
    : 'mt-10 flex gap-6 flex-col-reverse @lg:flex-row mb-10'
})
</script>

<template>
  <div :class="['w-6/7 select-none mx-auto text-left my-10', props.class]">
    <slot name="title" />

    <div :class="containerClasses">
      <div :class="leftColumnClasses">
        <slot name="left" />
      </div>

      <div class="flex-1" :class="leftFirst ? 'mb-10' : ''">
        <slot name="right" />
      </div>
    </div>
  </div>
</template>
