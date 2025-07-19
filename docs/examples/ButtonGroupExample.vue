<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-4">
      <ButtonGroup>
        <ButtonGroupItem>Left</ButtonGroupItem>
        <ButtonGroupItem>Middle</ButtonGroupItem>
        <ButtonGroupItem>Right</ButtonGroupItem>
      </ButtonGroup>

      <ButtonGroup variant="outline">
        <ButtonGroupItem>Option 1</ButtonGroupItem>
        <ButtonGroupItem>Option 2</ButtonGroupItem>
        <ButtonGroupItem>Option 3</ButtonGroupItem>
      </ButtonGroup>
    </div>
  </div>
</template>

<script setup>
import { ButtonGroup, ButtonGroupItem } from '@/uikit/components/ui/button-group'
</script>
