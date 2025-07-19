<script setup>
import { computed } from 'vue'
import { Checkbox } from '@/uikit/components/ui/checkbox'
import { Label } from '@/uikit/components/ui/label'
import { cn } from '@/uikit/lib/utils'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
    required: false,
  },
  options: {
    type: Array,
    required: true,
  },
  variant: {
    type: String,
    default: 'default',
  },
  size: {
    type: String,
    default: 'default',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  class: {
    type: null,
    required: false,
  },
  help: {
    type: String,
    required: false,
  },
  label: {
    type: String,
    required: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const selectedValues = computed(() => {
  return Array.isArray(props.modelValue) ? props.modelValue : []
})

function toggleOption(option) {
  if (props.disabled) return

  // Always start with an array, even if modelValue is undefined
  const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  const index = currentValues.indexOf(option)

  if (index > -1) {
    currentValues.splice(index, 1)
  } else {
    currentValues.push(option)
  }

  // Always emit an array
  emit('update:modelValue', currentValues)
}

function isSelected(option) {
  return selectedValues.value.includes(option)
}
</script>

<template>
  <div :class="cn('space-y-3', props.class)">
    <div
      v-if="label"
      class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {{ label }}
    </div>

    <div v-if="help" class="text-xs text-muted-foreground">
      {{ help }}
    </div>

    <div class="space-y-2">
      <div v-for="(option, index) in options" :key="index" class="flex items-center space-x-2">
        <Checkbox
          :id="`multiselect-${index}`"
          :modelValue="isSelected(option)"
          :disabled="disabled"
          :variant="variant"
          :size="size"
          @update:modelValue="(checked) => toggleOption(option)"
        />
        <Label
          :for="`multiselect-${index}`"
          class="text-sm cursor-pointer"
          :class="{ 'opacity-50 cursor-not-allowed': disabled }"
        >
          {{ option }}
        </Label>
      </div>
    </div>
  </div>
</template>
