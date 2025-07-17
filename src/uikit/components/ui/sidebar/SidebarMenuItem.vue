<script setup>
import { cn } from '@/uikit/lib/utils'

const props = defineProps({
  class: { type: null, required: false },
})
</script>

<template>
  <li data-slot="sidebar-menu-item" data-sidebar="menu-item" :class="cn('group/menu-item relative', props.class)">
    <slot />
  </li>
</template>
