<template>
  <div class="@container w-full h-full px-5">
    <TitleTwoCol leftWidth="w-1/2" leftFirst>
      <template #title>
        <div class="bg-blue-200 rounded-lg p-2">
          <h1>Title</h1>
        </div>
      </template>
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
    </TitleTwoCol>
  </div>
</template>

<script setup>
import { TitleTwoCol } from '@/uikit/layouts'
</script>
