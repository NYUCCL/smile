<script setup>
import { Button } from '@/uikit/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'
import { Moon, Sun } from 'lucide-vue-next'
import { useSmileColorMode } from '@/core/composables/useColorMode'
import { computed } from 'vue'

// Use global scope for presentation mode (applies to html element, like production mode)
const {
  state: globalColorMode,
  mode: globalColorModeRaw,
  toggle: toggleColorMode,
  system,
} = useSmileColorMode('global')
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="menu" variant="outline" @click="toggleColorMode">
          <i-lucide-moon v-if="globalColorModeRaw === 'light'" />
          <i-lucide-sun-moon v-else-if="globalColorModeRaw === 'dark'" />
          <i-lucide-sun v-else />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p v-if="globalColorModeRaw === 'light'">Switch to Dark Mode</p>
        <p v-else-if="globalColorModeRaw === 'dark'">Switch to System ({{ system }})</p>
        <p v-else>Switch to Light Mode</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
