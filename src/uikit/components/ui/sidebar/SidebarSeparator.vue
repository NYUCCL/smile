<script setup>
import { cn } from '@/uikit/lib/utils'
import { Separator } from '@/uikit/components/ui/separator'

const props = defineProps({
  class: { type: null, required: false },
})
</script>

<template>
  <Separator
    data-slot="sidebar-separator"
    data-sidebar="separator"
    :class="cn('bg-sidebar-border mx-2 w-auto', props.class)"
  >
    <slot />
  </Separator>
</template>
