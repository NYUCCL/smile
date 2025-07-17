<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <Button>Default Button</Button>
      <Button variant="destructive">Destructive Button</Button>
      <Button variant="outline">Outline Button</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Button variant="ghost">Ghost Button</Button>
      <Button variant="link">Link Button</Button>
    </div>
  </div>
</template>

<script setup>
import { Button } from '@/uikit/components/ui/button'
</script>
