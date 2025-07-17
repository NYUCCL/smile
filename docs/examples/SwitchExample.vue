<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-4">
      <Switch />
      <Switch :modelValue="true" />
      <Switch disabled />
      <Switch :modelValue="true" disabled />
      <Switch size="sm" />
      <Switch size="lg" />
      <Switch size="xl" />
      <Switch variant="primary" :modelValue="true" />
      <Switch variant="info" :modelValue="true" />
      <Switch variant="success" :modelValue="true" />
      <Switch variant="warning" :modelValue="true" />
      <Switch variant="danger" :modelValue="true" />
    </div>
  </div>
</template>

<script setup>
import { Switch } from '@/uikit/components/ui/switch'
</script>
