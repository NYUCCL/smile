<script setup>
import { reactiveOmit } from '@vueuse/core'
import { StepperIndicator, useForwardProps } from 'reka-ui'
import { cn } from '@/uikit/lib/utils'

const props = defineProps({
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: null, required: false },
})

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <StepperIndicator
    v-bind="forwarded"
    :class="
      cn(
        'inline-flex items-center justify-center rounded-full text-muted-foreground/50 w-8 h-8',
        // Disabled
        'group-data-[disabled]:text-muted-foreground group-data-[disabled]:opacity-50',
        // Active
        'group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground',
        // Completed
        'group-data-[state=completed]:bg-accent group-data-[state=completed]:text-accent-foreground',
        props.class
      )
    "
  >
    <slot />
  </StepperIndicator>
</template>
