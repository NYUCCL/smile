<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-4">
      <ButtonGroup size="xs">
        <ButtonGroupItem>XS</ButtonGroupItem>
        <ButtonGroupItem>Extra Small</ButtonGroupItem>
      </ButtonGroup>

      <ButtonGroup size="sm">
        <ButtonGroupItem>SM</ButtonGroupItem>
        <ButtonGroupItem>Small</ButtonGroupItem>
      </ButtonGroup>

      <ButtonGroup size="default">
        <ButtonGroupItem>Default</ButtonGroupItem>
        <ButtonGroupItem>Normal</ButtonGroupItem>
      </ButtonGroup>

      <ButtonGroup size="lg">
        <ButtonGroupItem>LG</ButtonGroupItem>
        <ButtonGroupItem>Large</ButtonGroupItem>
      </ButtonGroup>

      <ButtonGroup size="xl">
        <ButtonGroupItem>XL</ButtonGroupItem>
        <ButtonGroupItem>Extra Large</ButtonGroupItem>
      </ButtonGroup>
    </div>
  </div>
</template>

<script setup>
import { ButtonGroup, ButtonGroupItem } from '@/uikit/components/ui/button-group'
</script>
