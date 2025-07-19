<script setup>
import { computed } from 'vue'

const props = defineProps({
  class: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'ghost', 'game', 'outline'].includes(value),
  },
  responsiveUI: {
    type: Boolean,
    default: true,
    description: 'Whether to use responsive layout behavior',
  },
  width: {
    type: Number,
    default: 800,
    description: 'Width of the task window in pixels',
  },
  height: {
    type: Number,
    default: 600,
    description: 'Height of the task window in pixels',
  },
})

const containerClasses = computed(() => {
  const baseClasses = 'mx-auto m-2 rounded-xl select-none flex flex-col items-center justify-center'
  const variantClasses = {
    default: '',
    ghost: 'bg-muted',
    game: 'bg-green-100',
    outline: 'border-1 border-muted-foreground',
  }

  return [baseClasses, variantClasses[props.variant], props.class].filter(Boolean).join(' ')
})

const containerStyle = computed(() => {
  if (!props.responsiveUI) {
    return {
      width: props.width + 'px',
      height: props.height + 'px',
      minWidth: props.width + 'px',
      minHeight: props.height + 'px',
    }
  } else {
    return {
      width: '90vw',
      height: props.height + 'px',
      maxWidth: props.width + 'px',
      maxHeight: props.height + 'px',
      marginLeft: '20px',
      marginRight: '20px',
      paddingLeft: '30px',
      paddingRight: '30px',
      paddingTop: '20px',
      paddingBottom: '20px',
    }
  }
})
</script>

<template>
  <div class="flex justify-center mt-5">
    <div :class="containerClasses" :style="containerStyle">
      <slot />
    </div>
  </div>
</template>
