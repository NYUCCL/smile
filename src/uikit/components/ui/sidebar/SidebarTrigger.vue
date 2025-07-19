<script setup>
import { PanelLeft } from 'lucide-vue-next'
import { cn } from '@/uikit/lib/utils'
import { Button } from '@/uikit/components/ui/button'
import { useSidebar } from './utils'

const props = defineProps({
  class: { type: null, required: false },
})

const { toggleSidebar } = useSidebar()
</script>

<template>
  <Button
    data-sidebar="trigger"
    data-slot="sidebar-trigger"
    variant="ghost"
    size="icon"
    :class="cn('h-7 w-7', props.class)"
    @click="toggleSidebar"
  >
    <PanelLeft />
    <span class="sr-only">Toggle Sidebar</span>
  </Button>
</template>
