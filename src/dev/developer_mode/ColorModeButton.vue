<script setup>
import { Button } from '@/uikit/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'
import { useSmileColorMode } from '@/core/composables/useColorMode'

const { mode: experimentColorMode, toggle: toggleColorMode, system } = useSmileColorMode('experiment')
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="menu" variant="outline" @click="toggleColorMode()">
          <i-lucide-moon v-if="experimentColorMode === 'light'" />
          <i-lucide-sun-moon v-else-if="experimentColorMode === 'dark'" />
          <i-lucide-sun v-else />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p v-if="experimentColorMode === 'light'">Switch to Dark Mode</p>
        <p v-else-if="experimentColorMode === 'dark'">Switch to System ({{ system }})</p>
        <p v-else>Switch to Light Mode</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
