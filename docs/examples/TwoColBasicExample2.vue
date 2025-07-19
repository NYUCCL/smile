<template>
  <div class="@container w-full h-full px-5">
    <TwoCol leftWidth="w-1/4" rightFirst>
      <template #left>
        <!-- Left column content -->
        <div class="bg-emerald-200 rounded-lg h-[200px] p-4">
          <p>Left column content</p>
        </div>
      </template>
      <template #right>
        <!-- Right column content -->
        <div class="bg-red-200 rounded-lg h-[300px] p-4">
          <p>Right column content</p>
        </div>
      </template>
    </TwoCol>
  </div>
</template>

<script setup>
import { TwoCol } from '@/uikit/layouts'
</script>
