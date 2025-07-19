<script setup>
import { reactiveOmit } from '@vueuse/core'
import { Check } from 'lucide-vue-next'
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from 'reka-ui'
import { cn } from '@/uikit/lib/utils'
import { checkboxVariants } from './index.js'

const props = defineProps({
  defaultValue: { type: [Boolean, String], required: false },
  modelValue: { type: [Boolean, String, null], required: false },
  disabled: { type: Boolean, required: false },
  value: { type: null, required: false },
  id: { type: String, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  name: { type: String, required: false },
  required: { type: Boolean, required: false },
  class: { type: null, required: false },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'info', 'success', 'warning', 'danger'].includes(value),
  },
  size: { type: String, default: 'default', validator: (value) => ['xs', 'sm', 'default', 'lg', 'xl'].includes(value) },
})
const emits = defineEmits(['update:modelValue'])

const delegatedProps = reactiveOmit(props, 'class', 'variant', 'size')

const iconSizeClasses = {
  xs: 'size-2',
  sm: 'size-2.5',
  default: 'size-3.5',
  lg: 'size-4',
  xl: 'size-5',
}

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <CheckboxRoot data-slot="checkbox" v-bind="forwarded" :class="cn(checkboxVariants({ variant, size }), props.class)">
    <CheckboxIndicator
      data-slot="checkbox-indicator"
      class="flex items-center justify-center text-current transition-none"
    >
      <slot>
        <Check :class="iconSizeClasses[size]" />
      </slot>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
