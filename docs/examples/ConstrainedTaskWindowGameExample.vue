<template>
  <div class="@container w-full h-full px-5">
    <ConstrainedTaskWindow variant="game" :responsiveUI="false" :width="500" :height="400">
      <h1>Content</h1>
    </ConstrainedTaskWindow>
  </div>
</template>

<script setup>
import { ConstrainedTaskWindow } from '@/uikit/layouts'
</script>
