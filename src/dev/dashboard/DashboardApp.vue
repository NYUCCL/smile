<script setup>
import DashboardNavBar from './DashboardNavBar.vue'
import { Toaster } from '@/uikit/components/ui/sonner'
import 'vue-sonner/style.css'
</script>

<template>
  <div class="app-container">
    <!-- Top toolbar -->
    <div class="toolbar">
      <DashboardNavBar />
    </div>
    <!-- Middle row - content and sidebar -->
    <div class="content-and-console">
      <div class="m-10">
        <router-view />
      </div>
    </div>

    <!-- Sonner Toaster for notifications -->
    <Toaster position="bottom-right" :rich-colors="true" theme="light" :close-button="true" :duration="4000" />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.toolbar {
  margin-top: auto;
  margin-bottom: auto;
  height: 36px;
  width: full; /* Account for typical scrollbar width */
  background-color: var(--dev-bar-bg);
}

.content-and-console {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
</style>
