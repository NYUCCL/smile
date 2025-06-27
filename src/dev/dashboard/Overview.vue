<script setup>
import { ref } from 'vue'
import CollectionBrowser from './CollectionBrowser.vue'
import DocumentViewer from './DocumentViewer.vue'
import SubcollectionBrowser from './SubcollectionBrowser.vue'
import AdminSetup from './AdminSetup.vue'

const selectedDocument = ref(null)
const selectedSubcollection = ref(null)
const viewMode = ref('collections') // 'collections', 'document', 'subcollection'

function onDocumentSelected(doc) {
  selectedDocument.value = doc
  selectedSubcollection.value = null
  viewMode.value = 'document'
}

function onSubcollectionSelected(subcol) {
  selectedSubcollection.value = subcol
  viewMode.value = 'subcollection'
}

function goBack() {
  if (viewMode.value === 'subcollection') {
    viewMode.value = 'document'
    selectedSubcollection.value = null
  } else if (viewMode.value === 'document') {
    viewMode.value = 'collections'
    selectedDocument.value = null
  }
}
</script>

<template>
  <div>
    <!-- Admin setup (remove after setting up admin)
    <AdminSetup />
 -->
    <!-- Header with navigation (only show when not in collections view) -->
    <div v-if="viewMode !== 'collections'" class="flex items-center justify-between mb-6 mt-6">
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2 text-sm text-gray-600">
          <button @click="goBack" class="text-blue-600 hover:underline">← Back</button>
          <span v-if="selectedDocument">/ {{ selectedDocument.id }}</span>
          <span v-if="selectedSubcollection">/ {{ selectedSubcollection.id }}</span>
        </div>
      </div>
    </div>

    <!-- Main content area -->
    <div class="w-full">
      <!-- Document list view -->
      <div v-if="viewMode === 'collections'">
        <CollectionBrowser @document-selected="onDocumentSelected" />
      </div>

      <!-- Document detail view -->
      <div v-else-if="viewMode === 'document'">
        <DocumentViewer :document="selectedDocument" @subcollection-selected="onSubcollectionSelected" />
      </div>

      <!-- Subcollection view -->
      <div v-else-if="viewMode === 'subcollection'">
        <SubcollectionBrowser :subcollection="selectedSubcollection" @document-selected="onDocumentSelected" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
