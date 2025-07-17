<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-4">
      <Checkbox />
      <Checkbox :modelValue="true" />
      <Checkbox disabled />
      <Checkbox :modelValue="true" disabled />
      <Checkbox variant="primary" :modelValue="true" />
      <Checkbox variant="info" :modelValue="true" />
      <Checkbox variant="success" :modelValue="true" />
      <Checkbox variant="warning" :modelValue="true" />
      <Checkbox variant="danger" :modelValue="true" />
      <Checkbox size="xs" :modelValue="true" />
      <Checkbox size="sm" :modelValue="true" />
      <Checkbox size="lg" :modelValue="true" />
      <Checkbox size="xl" :modelValue="true" />
    </div>
  </div>
</template>

<script setup>
import { Checkbox } from '@/uikit/components/ui/checkbox'
</script>
