<script setup>
import { useRouter, useRoute } from 'vue-router'
import useSmileStore from '@/stores/smiledata'
import { onMounted, watch, ref } from 'vue'
// load sub-components used in this compomnents
import DeveloperNavBar from '@/components/navbars/DeveloperNavBar.vue'
import StatusBar from '@/components/navbars/StatusBar.vue'
import PresenationNavBar from '@/components/navbars/PresentationNavBar.vue'
import ProgressBar from './components/navbars/ProgressBar.vue'

// imports the global config object
const router = useRouter()
const route = useRoute()
const smilestore = useSmileStore()

// monitor events on the main window
onMounted(() => {
  window.addEventListener('resize', (event) => {
    smilestore.recordWindowEvent('resize', { width: window.innerWidth, height: window.innerHeight })
  })

  window.addEventListener('focus', (event) => {
    smilestore.recordWindowEvent('focus')
  })

  window.addEventListener('blur', (event) => {
    smilestore.recordWindowEvent('blur')
  })

  smilestore.getBrowserFingerprint()
})
</script>

<template>
  <DeveloperNavBar v-if="smilestore.config.mode == 'development'"></DeveloperNavBar>
  <PresenationNavBar v-if="smilestore.config.mode == 'presentation'"></PresenationNavBar>
  <StatusBar
    v-if="$route.name !== 'config' && $route.name !== 'recruit' && smilestore.config.mode != 'presentation'"
  ></StatusBar>

  <div class="router">
    <router-view></router-view>
    <!-- the router loads here -->
  </div>
  <ProgressBar
    v-if="$route.name !== 'config' && $route.name !== 'recruit' && smilestore.config.show_progress_bar == 'true'"
  ></ProgressBar>
</template>

<style>
/* global fonts **/
:root {
  --vp-font-family-base: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  --vp-font-family-mono: Menlo, Monaco, Consolas, 'Courier New', monospace;
  /* fontkit overrides */
  --fk-color-primary: #48c78e;
}

.router {
  height: 100vh;
  background-color: v-bind(smilestore.global.page_bg_color);
}

#app {
  font-family: var(--vp-font-family-base);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
