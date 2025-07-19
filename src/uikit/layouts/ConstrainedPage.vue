<script setup>
import { computed } from 'vue'

const props = defineProps({
  class: {
    type: String,
    default: '',
  },
  responsiveUI: {
    type: Boolean,
    default: true,
    description: 'Whether to use responsive layout behavior',
  },
  width: {
    type: Number,
    default: 800,
    description: 'Width of the page in pixels',
  },
  height: {
    type: Number,
    default: 600,
    description: 'Height of the page in pixels',
  },
})

const containerClasses = computed(() => {
  const baseClasses = 'mx-auto select-none flex flex-col items-center mt-5 mb-10'

  return [baseClasses, props.class].filter(Boolean).join(' ')
})

const containerStyle = computed(() => {
  if (!props.responsiveUI) {
    return {
      width: props.width + 'px',
      minWidth: props.width + 'px',
      height: props.height + 'px',
      minHeight: props.height + 'px',
    }
  } else {
    return {
      width: '90vw',
      minHeight: props.height + 'px',
      maxWidth: props.width + 'px',
      maxHeight: props.height + 'px',
    }
  }
})
</script>

<template>
  <div class="flex justify-center">
    <div :class="containerClasses" :style="containerStyle">
      <slot />
    </div>
  </div>
</template>
