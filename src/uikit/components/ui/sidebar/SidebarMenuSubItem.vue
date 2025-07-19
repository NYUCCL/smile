<script setup>
import { cn } from '@/uikit/lib/utils'

const props = defineProps({
  class: { type: null, required: false },
})
</script>

<template>
  <li
    data-slot="sidebar-menu-sub-item"
    data-sidebar="menu-sub-item"
    :class="cn('group/menu-sub-item relative', props.class)"
  >
    <slot />
  </li>
</template>
