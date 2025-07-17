<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-4">
      <Badge>Default Badge</Badge>
      <Badge variant="secondary">Secondary Badge</Badge>
      <Badge variant="destructive">Destructive Badge</Badge>
      <Badge variant="outline">Outline Badge</Badge>
    </div>
  </div>
</template>

<script setup>
import { Badge } from '@/uikit/components/ui/badge'
</script>
