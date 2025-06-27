<script setup>
import { ref, onMounted, watch } from 'vue'
import { listDocuments, parseFirestoreFields } from './firebase-admin.js'

const props = defineProps({
  subcollection: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['document-selected'])

const loading = ref(true)
const error = ref(null)
const documents = ref([])

onMounted(async () => {
  await loadDocuments()
})

watch(
  () => props.subcollection,
  async () => {
    await loadDocuments()
  }
)

async function loadDocuments() {
  try {
    loading.value = true
    error.value = null

    const docs = await listDocuments(props.subcollection.path)
    documents.value = docs
  } catch (err) {
    error.value = err.message
    console.error('Error loading subcollection documents:', err)
  } finally {
    loading.value = false
  }
}

function selectDocument(doc) {
  const parsedData = parseFirestoreFields(doc.fields)
  emit('document-selected', {
    raw: doc,
    parsed: parsedData,
    id: getDocumentId(doc.name),
    path: doc.name,
  })
}

function getDocumentId(docPath) {
  return docPath.split('/').pop()
}

function getPreviewFields(fields) {
  const parsed = parseFirestoreFields(fields)
  const preview = {}

  // Show first 3 interesting fields
  let count = 0
  for (const [key, value] of Object.entries(parsed)) {
    if (count >= 3) break
    if (key === 'firebaseAnonAuthID' || key === 'firebaseDocID') continue

    let displayValue = value
    if (typeof value === 'object' && value !== null) {
      displayValue = Array.isArray(value) ? `[${value.length} items]` : '[object]'
    } else if (typeof value === 'string' && value.length > 20) {
      displayValue = value.substring(0, 20) + '...'
    }

    preview[key] = displayValue
    count++
  }

  return preview
}
</script>
<template>
  <div class="subcollection-browser p-6">
    <h2 class="text-2xl font-bold mb-4">{{ subcollection.id }} Collection</h2>

    <div class="mb-4 text-sm text-gray-600">
      <p>Path: {{ subcollection.path }}</p>
      <p>Parent Document: {{ subcollection.parentDocument.id }}</p>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center space-x-2">
      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
      <span>Loading documents...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <strong>Error:</strong> {{ error }}
    </div>

    <!-- Documents list -->
    <div v-else class="space-y-4">
      <div v-if="documents.length === 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p class="text-yellow-800">No documents found in this subcollection.</p>
        <p class="text-sm text-yellow-600 mt-1">
          This could mean the subcollection is empty or the documents are not accessible.
        </p>
      </div>

      <div v-else>
        <div class="mb-4 text-sm text-gray-600">
          Found {{ documents.length }} document{{ documents.length === 1 ? '' : 's' }}
        </div>

        <div class="grid gap-4">
          <div
            v-for="doc in documents"
            :key="doc.name"
            class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            @click="selectDocument(doc)"
          >
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium">{{ getDocumentId(doc.name) }}</h4>
                <p class="text-sm text-gray-500">{{ doc.name }}</p>
              </div>
              <div class="text-xs text-blue-600">View →</div>
            </div>

            <!-- Preview some document fields -->
            <div v-if="doc.fields" class="mt-2 text-xs text-gray-600">
              <span
                v-for="(value, key) in getPreviewFields(doc.fields)"
                :key="key"
                class="inline-block bg-gray-100 rounded px-2 py-1 mr-2 mb-1"
              >
                {{ key }}: {{ value }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.subcollection-browser {
  max-height: 80vh;
  overflow-y: auto;
}
</style>
