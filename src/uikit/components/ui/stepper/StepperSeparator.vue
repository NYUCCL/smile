<script setup>
import { reactiveOmit } from '@vueuse/core'
import { StepperSeparator, useForwardProps } from 'reka-ui'
import { cn } from '@/uikit/lib/utils'

const props = defineProps({
  orientation: { type: String, required: false },
  decorative: { type: Boolean, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: null, required: false },
})

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <StepperSeparator
    v-bind="forwarded"
    :class="
      cn(
        'bg-muted',
        // Disabled
        'group-data-[disabled]:bg-muted group-data-[disabled]:opacity-50',
        // Completed
        'group-data-[state=completed]:bg-accent-foreground',
        props.class
      )
    "
  />
</template>
