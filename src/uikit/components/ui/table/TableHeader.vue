<script setup>
import { cn } from '@/uikit/lib/utils'

const props = defineProps({
  class: { type: null, required: false },
})
</script>

<template>
  <thead data-slot="table-header" :class="cn('[&_tr]:border-b', props.class)">
    <slot />
  </thead>
</template>
