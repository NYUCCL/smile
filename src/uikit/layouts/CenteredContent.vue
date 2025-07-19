<script setup>
defineProps({
  class: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div :class="['mx-10 select-none flex flex-col items-center justify-center h-full', $props.class]">
    <slot />
  </div>
</template>
