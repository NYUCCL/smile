<template>
  <ConstrainedPage :width="600" :height="400" :responsiveUI="true">
    <div class="bg-blue-100 rounded p-4 h-full w-full flex items-center justify-center">
      <div class="text-blue-800 font-medium">ConstrainedPage (600x400, Responsive)</div>
    </div>
  </ConstrainedPage>
</template>

<script setup>
import { ConstrainedPage } from '@/uikit/layouts'
</script>
