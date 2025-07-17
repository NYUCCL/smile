<script setup>
import { SplitterPanel, useForwardPropsEmits } from 'reka-ui'
import { ref } from 'vue'

const props = defineProps({
  collapsedSize: { type: Number, required: false },
  collapsible: { type: Boolean, required: false },
  defaultSize: { type: Number, required: false },
  id: { type: String, required: false },
  maxSize: { type: Number, required: false },
  minSize: { type: Number, required: false },
  order: { type: Number, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
})
const emits = defineEmits(['collapse', 'expand', 'resize'])

const forwarded = useForwardPropsEmits(props, emits)

const splitterPanelRef = ref()

const resize = (size) => {
  splitterPanelRef.value?.resize(size)
}

const collapse = () => {
  splitterPanelRef.value?.collapse()
}

const expand = () => {
  splitterPanelRef.value?.expand()
}

const getSize = () => {
  return splitterPanelRef.value?.getSize()
}

const isCollapsed = () => {
  return splitterPanelRef.value?.isCollapsed
}

defineExpose({
  resize,
  collapse,
  expand,
  getSize,
  isCollapsed,
})
</script>

<template>
  <SplitterPanel ref="splitterPanelRef" data-slot="resizable-panel" v-bind="forwarded">
    <slot />
  </SplitterPanel>
</template>
