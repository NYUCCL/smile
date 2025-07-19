<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <Button variant="primary">Primary Button</Button>
      <Button variant="primary-light">Primary Light Button</Button>
      <Button variant="button-link">Button Link</Button>
      <Button variant="button-link-light">Button Link Light</Button>
      <Button variant="info">Info Button</Button>
      <Button variant="info-light">Info Light Button</Button>
      <Button variant="success">Success Button</Button>
      <Button variant="success-light">Success Light Button</Button>
      <Button variant="warning">Warning Button</Button>
      <Button variant="warning-light">Warning Light Button</Button>
      <Button variant="danger">Danger Button</Button>
      <Button variant="danger-light">Danger Light Button</Button>
    </div>
  </div>
</template>

<script setup>
import { Button } from '@/uikit/components/ui/button'
</script>
