<script setup>
import { cn } from '@/uikit/lib/utils'

const props = defineProps({
  class: { type: null, required: false },
})
</script>

<template>
  <div data-slot="sidebar-footer" data-sidebar="footer" :class="cn('flex flex-col gap-2 p-2', props.class)">
    <slot />
  </div>
</template>
