<script setup>
import { reactiveOmit } from '@vueuse/core'
import { SwitchRoot, SwitchThumb, useForwardPropsEmits } from 'reka-ui'
import { cn } from '@/uikit/lib/utils'
import { switchVariants } from './index.js'

const props = defineProps({
  defaultValue: { type: Boolean, required: false },
  modelValue: { type: [Boolean, null], required: false },
  disabled: { type: Boolean, required: false },
  id: { type: String, required: false },
  value: { type: String, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  name: { type: String, required: false },
  required: { type: Boolean, required: false },
  class: { type: null, required: false },
  size: { type: String, default: 'default', validator: (value) => ['default', 'sm', 'lg', 'xl'].includes(value) },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'info', 'success', 'warning', 'danger'].includes(value),
  },
})

const emits = defineEmits(['update:modelValue'])

const delegatedProps = reactiveOmit(props, 'class', 'size', 'variant')

const forwarded = useForwardPropsEmits(delegatedProps, emits)

const sizeClasses = {
  sm: {
    root: 'h-[1rem] w-6',
    thumb: 'w-3 h-3',
    translate: 'data-[state=checked]:translate-x-[calc(100%-1px)]',
  },
  default: {
    root: 'h-[1.15rem] w-8',
    thumb: 'w-4 h-4',
    translate: 'data-[state=checked]:translate-x-[calc(100%-2px)]',
  },
  lg: {
    root: 'h-[1.5rem] w-12',
    thumb: 'w-5 h-5',
    translate: 'data-[state=checked]:translate-x-[25px]',
  },
  xl: {
    root: 'h-[1.75rem] w-14',
    thumb: 'w-6 h-6',
    translate: 'data-[state=checked]:translate-x-[32px]',
  },
}
</script>

<template>
  <SwitchRoot
    data-slot="switch"
    v-bind="forwarded"
    :class="cn(switchVariants({ variant, size }), sizeClasses[size].root, props.class)"
  >
    <SwitchThumb
      data-slot="switch-thumb"
      :class="
        cn(
          'bg-background dark:bg-background dark:data-[state=unchecked]:bg-background dark:data-[state=checked]:bg-primary-foreground pointer-events-none block rounded-full ring-0 transition-transform data-[state=unchecked]:translate-x-0 shadow-sm',
          sizeClasses[size].thumb,
          sizeClasses[size].translate
        )
      "
    >
      <slot name="thumb" />
    </SwitchThumb>
  </SwitchRoot>
</template>
