import { createApp } from 'vue'
// import with an @ symbol are resolved by vite to ./src directory
import { createRouter, createWebHashHistory } from 'vue-router'

import DashboardApp from '@/dev/dashboard/DashboardApp.vue' // import the main app component
import { pinia } from '@/core/stores/createPinia'

import Overview from '@/dev/dashboard/Overview.vue'
import DocumentViewer from '@/dev/dashboard/DocumentViewer.vue'

import '@/core/main.css'

import { useColorMode } from '@vueuse/core'
useColorMode()

// drag components

// Create the app and the data store
const app = createApp(DashboardApp) // create the app

const routes = [
  {
    path: '/',
    component: Overview,
  },
  {
    path: '/document/:collection/:documentId',
    name: 'document-viewer',
    component: DocumentViewer,
    props: true
  },
]

const router = createRouter({
  history: createWebHashHistory(), // We are using the hash history for now/simplicity
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  },
})

// register plugins
app.use(pinia) // tell the app to use the data store
app.use(router) // tell the app to use the router

// add the ability to drag and resize elements
//app.component('vue-draggable-resizable', VueDraggableResizable)

// you "mount the app starting at the #app element"
app.mount('#app') // start the app!
