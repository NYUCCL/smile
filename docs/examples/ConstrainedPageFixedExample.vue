<template>
  <ConstrainedPage :width="500" :height="300" :responsiveUI="false">
    <div class="bg-red-100 rounded p-4 h-full w-full flex items-center justify-center">
      <div class="text-red-800 font-medium">ConstrainedPage (500x300, Fixed)</div>
    </div>
  </ConstrainedPage>
</template>

<script setup>
import { ConstrainedPage } from '@/uikit/layouts'
</script>
