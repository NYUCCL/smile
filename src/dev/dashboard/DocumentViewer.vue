<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getDocument,
  listSubcollections,
  parseFirestoreFields,
  saveDocumentNotes,
  loadDocumentNotes,
  loadAllIpAddresses,
  listDocuments,
} from './firebase-admin.js'
import appconfig from '@/core/config'
import { useDashboardStore } from '@/core/stores/dashboard'
import ValueRenderer from './ValueRenderer.vue'
import { Button } from '@/uikit/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/uikit/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/uikit/components/ui/tabs'
import { Badge } from '@/uikit/components/ui/badge'
import { Label } from '@/uikit/components/ui/label'
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
} from '@/uikit/components/ui/tags-input'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/uikit/components/ui/breadcrumb'
import { Copy, RefreshCw, ExternalLink } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = defineProps({
  collection: {
    type: String,
    required: false,
  },
  documentId: {
    type: String,
    required: false,
  },
})

const emit = defineEmits(['subcollection-selected'])

const route = useRoute()
const router = useRouter()
const dashboardStore = useDashboardStore()
const document = ref(null)
const loading = ref(true)
const error = ref(null)
const viewMode = ref('parsed')
const subcollections = ref([])
const refreshing = ref(false)

const currentCollection = computed(() => props.collection || route.params.collection)
const currentDocumentId = computed(() => props.documentId || route.params.documentId)

// Quality Assurance state
const duplicateDocuments = ref([])
const isCheckingDuplicates = ref(false)
const duplicateIpDocuments = ref([])
const isCheckingIpDuplicates = ref(false)

// Private Data state
const privateData = ref({})
const isLoadingPrivateData = ref(false)

// Notes state
const selectedTags = ref([])
const notes = ref('')
const saveStatus = ref('')
const presetTags = ref(['bot', 'likely bot', 'inattentive subject', 'cheating', 'repeat', 'good example'])

onMounted(async () => {
  await loadDocument()
})

watch(
  () => [currentCollection.value, currentDocumentId.value],
  async () => {
    await loadDocument()
  }
)

function toggleView() {
  viewMode.value = viewMode.value === 'parsed' ? 'raw' : 'parsed'
}

async function loadDocument() {
  if (!currentCollection.value || !currentDocumentId.value) return

  try {
    loading.value = true
    error.value = null

    // Construct document path based on collection and documentId
    const projectRef = appconfig.projectRef
    const documentPath = `${currentCollection.value}/${projectRef}/data/${currentDocumentId.value}`

    const docData = await getDocument(documentPath)

    if (docData) {
      document.value = {
        id: docData.id,
        raw: docData,
        parsed: parseFirestoreFields(docData.data),
        path: documentPath,
      }
      await loadSubcollections(documentPath)
      checkForDuplicateParticipants()
      await loadPrivateData(documentPath)
      await loadNotesFromFirebase()
    } else {
      error.value = 'Document not found'
    }
  } catch (err) {
    console.error('Error loading document:', err)
    error.value = 'Failed to load document'
  } finally {
    loading.value = false
  }
}

async function refreshDocument() {
  await loadDocument()
}

async function loadSubcollections(docPath) {
  try {
    const collections = await listSubcollections(docPath)
    subcollections.value = collections
  } catch (error) {
    console.error('Error loading subcollections:', error)
    subcollections.value = []
  }
}

function browseSubcollection(subcollectionId) {
  const fullPath = `${document.value.path}/${subcollectionId}`
  emit('subcollection-selected', {
    id: subcollectionId,
    path: fullPath,
    parentDocument: document.value,
  })
}

function getValueType(value) {
  if (value === null) return 'null'
  if (value instanceof Date) return 'timestamp'
  if (Array.isArray(value)) return `array[${value.length}]`
  if (typeof value === 'object') return 'object'
  return typeof value
}

function formatDate(date) {
  if (!date) return null
  if (typeof date === 'string') date = new Date(date)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

function formatBooleanValue(value) {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return 'Not set'
}

function formatTimestamp(timestamp) {
  if (!timestamp) return 'Not set'
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return 'Invalid date'
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch (error) {
    return 'Invalid date'
  }
}

function formatHumanReadableTime(timestamp) {
  if (!timestamp) return 'Not set'
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return 'Invalid date'

    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return 'Today ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  } catch (error) {
    return 'Invalid date'
  }
}

function getBadgeVariant(field, value) {
  if (value === true) {
    // Positive states
    if (field === 'done' || field === 'consented' || field === 'verifiedVisibility') {
      return 'default' // Green-ish
    }
    // Negative states (withdrawn is bad)
    if (field === 'withdrawn') {
      return 'destructive' // Red
    }
  }

  if (value === false) {
    // For withdrawn, false is good
    if (field === 'withdrawn') {
      return 'secondary' // Gray/neutral
    }
    // For others, false might be concerning
    return 'secondary' // Gray/neutral
  }

  // Not set/undefined
  return 'outline' // Outlined/subtle
}

function calculateSessionDuration(startTime, endTime) {
  if (!startTime || !endTime) return 'N/A'

  try {
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'N/A'

    const durationMs = end.getTime() - start.getTime()

    if (durationMs < 0) return 'Invalid'

    // Convert to human readable format
    const totalSeconds = Math.floor(durationMs / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  } catch (error) {
    return 'N/A'
  }
}

function getFieldCount() {
  if (!document.value) return 0
  return Object.keys(document.value.parsed).length
}

function getDocumentSize() {
  if (!document.value) return '0 chars'

  try {
    const rawJson = JSON.stringify(document.value.raw)
    const sizeInChars = rawJson.length
    const sizeInBytes = new Blob([rawJson]).size
    const sizeInMB = sizeInBytes / (1024 * 1024)

    if (sizeInMB >= 0.1) {
      return `${sizeInMB.toFixed(2)} MB (${sizeInChars.toLocaleString()} chars)`
    } else {
      const sizeInKB = sizeInBytes / 1024
      if (sizeInKB >= 1) {
        return `${sizeInKB.toFixed(1)} KB (${sizeInChars.toLocaleString()} chars)`
      } else {
        return `${sizeInBytes} bytes (${sizeInChars.toLocaleString()} chars)`
      }
    }
  } catch (error) {
    return 'Unknown size'
  }
}

function getFilteredParsedData() {
  if (!document.value) return {}

  // Fields to exclude from the parsed view since they're already in the summary
  const excludedFields = [
    'firebaseDocID',
    'firebaseAnonAuthID',
    'recruitmentService',
    'withdrawn',
    'startTime',
    'starttime',
    'consented',
    'appStartTime',
    'verifiedVisibility',
    'done',
    'endTime',
    'endtime',
    'browserData',
    'routeOrder',
    'smileConfig',
  ]

  const filtered = {}
  for (const [key, value] of Object.entries(document.value.parsed)) {
    if (!excludedFields.includes(key)) {
      filtered[key] = value
    }
  }

  return filtered
}

function truncateFirebaseId(id) {
  if (!id) return 'Not set'
  if (id.length <= 8) return id
  return id.substring(0, 8) + '...'
}

async function copyToClipboard(text, label) {
  if (!text || text === 'Not set') return

  try {
    await navigator.clipboard.writeText(text)
    toast(`${label} copied to clipboard!`, {
      description: text.length > 50 ? `${text.substring(0, 50)}...` : text,
    })
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast(`${label} copied to clipboard!`, {
        description: text.length > 50 ? `${text.substring(0, 50)}...` : text,
      })
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError)
      toast.error('Failed to copy to clipboard')
    }
  }
}

function getBrowserTelemetrySummary() {
  if (!document.value || !document.value.parsed.browserData) return null

  const browserData = document.value.parsed.browserData
  if (!Array.isArray(browserData) || browserData.length === 0) return null

  const eventCounts = {}

  browserData.forEach((event) => {
    const eventType = event.event_type
    if (eventType) {
      eventCounts[eventType] = (eventCounts[eventType] || 0) + 1
    }
  })

  // Sort by count (descending) then by event type name
  const sortedEvents = Object.entries(eventCounts).sort(([a, countA], [b, countB]) => {
    if (countB !== countA) return countB - countA
    return a.localeCompare(b)
  })

  return Object.fromEntries(sortedEvents)
}

function getTotalBrowserEvents() {
  if (!document.value || !document.value.parsed.browserData) return 0

  const browserData = document.value.parsed.browserData
  if (!Array.isArray(browserData)) return 0

  return browserData.length
}

function getViewFlowData() {
  if (!document.value || !document.value.parsed.routeOrder) return []

  const routeOrder = document.value.parsed.routeOrder
  if (!Array.isArray(routeOrder) || routeOrder.length === 0) return []

  return routeOrder.map((step) => ({
    route: step.route || 'Unknown',
    timeDelta: step.timeDelta || 0,
  }))
}

function getTotalViewTime() {
  const viewFlowData = getViewFlowData()
  if (!viewFlowData || viewFlowData.length === 0) return 0

  return viewFlowData.reduce((total, step) => total + (step.timeDelta || 0), 0)
}

function formatTimeDelta(milliseconds) {
  if (!milliseconds || milliseconds === 0) return '0s'

  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}

async function copyRawDataToClipboard() {
  if (!document.value) return

  try {
    const rawJsonString = JSON.stringify(document.value.raw, null, 2)
    await navigator.clipboard.writeText(rawJsonString)

    // Show neutral Sonner toast notification
    toast('Raw data copied to clipboard!')
  } catch (error) {
    console.error('Failed to copy raw data to clipboard:', error)

    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea')
      textArea.value = JSON.stringify(document.value.raw, null, 2)
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)

      toast('Raw data copied to clipboard!')
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError)
      toast.error('Failed to copy to clipboard')
    }
  }
}

function goToDashboard() {
  router.push('/')
}

function truncateDocumentId(id) {
  if (!id) return ''
  return id.length > 20 ? id.substring(0, 20) + '...' : id
}

function openInFirebaseConsole() {
  if (!document.value || !currentCollection.value || !currentDocumentId.value) return

  try {
    // Get Firebase project ID from the Firebase config (not projectRef)
    const projectId = appconfig.firebaseConfig?.projectId || appconfig.projectID || 'unknown'
    const collection = currentCollection.value
    const docId = currentDocumentId.value
    const projectRef = appconfig.projectRef || 'unknown'

    // The document path should match what we see in the document viewer
    // Based on the document path shown: collection/projectRef/data/docId
    const documentPath = `${collection}/${projectRef}/data/${docId}`

    // Firebase Console URL format based on your example:
    // https://console.firebase.google.com/u/0/project/{projectId}/firestore/databases/-default-/data/~2F{encodedPath}
    const encodedPath = documentPath.split('/').join('~2F')
    const firebaseUrl = `https://console.firebase.google.com/u/0/project/${projectId}/firestore/databases/-default-/data/~2F${encodedPath}`

    console.log('Firebase Console URL:', firebaseUrl)
    console.log('Document path:', documentPath)
    console.log('Firebase Project ID:', projectId)
    console.log('Project Ref:', projectRef)

    // Open in new tab
    window.open(firebaseUrl, '_blank', 'noopener,noreferrer')

    toast('Opening document in Firebase Console...', {
      description: `Path: ${documentPath}`,
    })
  } catch (error) {
    console.error('Error opening Firebase console:', error)
    toast.error('Failed to open Firebase Console', {
      description: 'Please check your configuration',
    })
  }
}

function getSmileConfigData() {
  if (!document.value || !document.value.parsed.smileConfig) return null

  const smileConfig = document.value.parsed.smileConfig
  if (!smileConfig || typeof smileConfig !== 'object') return null

  return smileConfig
}

function formatConfigKey(key) {
  // Convert camelCase to readable format
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

function renderConfigData(data, depth = 0) {
  if (!data || typeof data !== 'object') return ''

  let html = ''
  const indent = '  '.repeat(depth)
  const maxDepth = 3 // Prevent infinite recursion

  for (const [key, value] of Object.entries(data)) {
    html += `<div class="border-b border-gray-100 pb-2 mb-2 last:border-b-0">`
    html += `<div class="font-medium text-gray-700 mb-1">${escapeHtml(key)}</div>`
    html += `<div class="ml-3">${renderConfigValue(value, depth)}</div>`
    html += `</div>`
  }

  return html
}

function renderConfigValue(value, depth = 0) {
  const maxDepth = 3

  if (value === null || value === undefined) {
    return `<span class="text-gray-400 italic">null</span>`
  }

  if (typeof value === 'boolean') {
    return `<span class="font-medium ${value ? 'text-green-600' : 'text-red-600'}">${value ? 'true' : 'false'}</span>`
  }

  if (typeof value === 'number') {
    return `<span class="font-medium text-blue-600">${value}</span>`
  }

  if (typeof value === 'string') {
    // Handle URLs
    if (value.startsWith('http://') || value.startsWith('https://')) {
      const displayUrl = value.length > 60 ? value.substring(0, 60) + '...' : value
      return `<a href="${escapeHtml(value)}" target="_blank" class="text-blue-600 hover:text-blue-800 underline break-all text-xs" title="${escapeHtml(value)}">${escapeHtml(displayUrl)}</a>`
    }

    // Handle long strings
    if (value.length > 100) {
      return `<span class="text-gray-600 break-words">${escapeHtml(value.substring(0, 100))}<span class="text-gray-400">... (+${value.length - 100} chars)</span></span>`
    }

    return `<span class="text-gray-600 break-words">${escapeHtml(value)}</span>`
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return `<span class="text-gray-400 italic">empty array</span>`
    }

    let html = `<div class="text-gray-500 text-xs mb-1">Array (${value.length} items):</div>`
    html += `<div class="border-l-2 border-gray-200 pl-3 space-y-1">`

    value.slice(0, 5).forEach((item, index) => {
      html += `<div class="text-xs">`
      html += `<span class="text-gray-400">[${index}]</span> `
      html += renderConfigValue(item, depth + 1)
      html += `</div>`
    })

    if (value.length > 5) {
      html += `<div class="text-xs text-gray-400">... and ${value.length - 5} more items</div>`
    }

    html += `</div>`
    return html
  }

  if (typeof value === 'object' && depth < maxDepth) {
    const keys = Object.keys(value)
    if (keys.length === 0) {
      return `<span class="text-gray-400 italic">empty object</span>`
    }

    let html = `<div class="text-gray-500 text-xs mb-1">Object (${keys.length} properties):</div>`
    html += `<div class="border-l-2 border-gray-200 pl-3 space-y-1">`

    keys.slice(0, 10).forEach((key) => {
      html += `<div class="text-xs">`
      html += `<span class="font-medium text-gray-600">${escapeHtml(key)}:</span> `
      html += renderConfigValue(value[key], depth + 1)
      html += `</div>`
    })

    if (keys.length > 10) {
      html += `<div class="text-xs text-gray-400">... and ${keys.length - 10} more properties</div>`
    }

    html += `</div>`
    return html
  }

  // Fallback for deep objects
  if (typeof value === 'object') {
    const keys = Object.keys(value)
    return `<span class="text-gray-500 italic">Object (${keys.length} properties, max depth reached)</span>`
  }

  return `<span class="text-gray-600">${escapeHtml(String(value))}</span>`
}

function escapeHtml(text) {
  if (typeof text !== 'string') return String(text)
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function getGithubInfo() {
  if (!document.value || !document.value.parsed.smileConfig) return null

  const smileConfig = document.value.parsed.smileConfig
  return smileConfig.github || null
}

function getRepositoryUrl() {
  const githubInfo = getGithubInfo()
  if (!githubInfo || !githubInfo.owner || !githubInfo.repoName) return '#'

  return `https://github.com/${githubInfo.owner}/${githubInfo.repoName}`
}

function getCommitUrl() {
  const githubInfo = getGithubInfo()
  if (!githubInfo || !githubInfo.owner || !githubInfo.repoName || !githubInfo.lastCommitHash) return '#'

  return `https://github.com/${githubInfo.owner}/${githubInfo.repoName}/commit/${githubInfo.lastCommitHash}`
}

function truncateCommitHash(hash) {
  if (!hash) return ''
  return hash.length > 7 ? hash.substring(0, 7) : hash
}

function truncateCommitMessage(message) {
  if (!message) return ''
  return message.length > 80 ? message.substring(0, 80) + '...' : message
}

function checkForDuplicateParticipants() {
  if (!document.value || !document.value.parsed.firebaseAnonAuthID) {
    duplicateDocuments.value = []
    return
  }

  isCheckingDuplicates.value = true

  try {
    const currentAnonAuthID = document.value.parsed.firebaseAnonAuthID
    const currentDocId = document.value.id
    const currentCollectionValue = currentCollection.value

    // Get all documents from the dashboard store cache
    const currentData = dashboardStore.getCurrentData(currentCollectionValue)

    if (!currentData || !currentData.documents) {
      duplicateDocuments.value = []
      return
    }

    // Find documents with the same firebaseAnonAuthID but different document ID
    const duplicates = currentData.documents.filter((doc) => {
      return doc.data.firebaseAnonAuthID === currentAnonAuthID && doc.id !== currentDocId
    })

    duplicateDocuments.value = duplicates
  } catch (error) {
    console.error('Error checking for duplicate participants:', error)
    duplicateDocuments.value = []
  } finally {
    isCheckingDuplicates.value = false
  }
}

function navigateToDocument(duplicate) {
  const collectionValue = currentCollection.value
  router.push({
    name: 'document-viewer',
    params: {
      collection: collectionValue,
      documentId: duplicate.id,
    },
  })
}

function getCurrentIpAddress() {
  if (!privateData.value || !privateData.value.browserFingerprint) return null
  return privateData.value.browserFingerprint.ip || null
}

function getWebDriverStatus() {
  if (!privateData.value || !privateData.value.browserFingerprint) return null
  return privateData.value.browserFingerprint.webdriver
}

async function checkForDuplicateIpAddresses() {
  const currentIp = getCurrentIpAddress()

  if (!currentIp) {
    duplicateIpDocuments.value = []
    return
  }

  isCheckingIpDuplicates.value = true

  try {
    // Since we can't list all documents due to Firebase permissions,
    // we'll show a warning that this feature requires broader access
    // For now, we'll always show as unique until permissions are fixed

    duplicateIpDocuments.value = []

    // Log for admin to see the issue
    console.warn('IP duplicate checking requires collection-level read permissions. Current IP:', currentIp)
  } catch (error) {
    console.error('Error checking for duplicate IP addresses:', error)
    duplicateIpDocuments.value = []
  } finally {
    isCheckingIpDuplicates.value = false
  }
}

async function loadPrivateData(documentPath) {
  if (!documentPath) return

  isLoadingPrivateData.value = true

  try {
    // Try to get the private_data document directly
    const privateDataDocPath = `${documentPath}/private/private_data`

    console.log('Loading private data from path:', privateDataDocPath)

    const privateDocData = await getDocument(privateDataDocPath)

    if (privateDocData && privateDocData.data) {
      console.log('Private data found:', privateDocData.data)
      privateData.value = parseFirestoreFields(privateDocData.data)
      // Check for IP duplicates after private data is loaded
      checkForDuplicateIpAddresses()
    } else {
      console.log('No private data document found at:', privateDataDocPath)
      privateData.value = {}
    }
  } catch (error) {
    console.error('Error loading private data:', error)
    privateData.value = {}
  } finally {
    isLoadingPrivateData.value = false
  }
}

// Debounced save functions for notes
let saveNotesTimeout = null
let saveTagsTimeout = null

function debouncedSaveNotes() {
  if (saveNotesTimeout) clearTimeout(saveNotesTimeout)
  saveNotesTimeout = setTimeout(async () => {
    await saveNotesToFirebase()
  }, 1000)
}

function debouncedSaveTags() {
  if (saveTagsTimeout) clearTimeout(saveTagsTimeout)
  saveTagsTimeout = setTimeout(async () => {
    await saveNotesToFirebase()
  }, 1000)
}

async function saveNotesToFirebase() {
  if (!document.value) return

  try {
    saveStatus.value = 'Saving...'

    // Save to Firebase using the real function
    const success = await saveDocumentNotes(document.value.path, selectedTags.value, notes.value)

    if (success) {
      saveStatus.value = 'Saved'
      console.log('Successfully saved notes and tags:', {
        documentId: document.value.id,
        tags: selectedTags.value,
        notes: notes.value,
      })
    } else {
      saveStatus.value = 'Error saving - check console for details'
    }

    setTimeout(() => {
      saveStatus.value = ''
    }, 2000)
  } catch (error) {
    console.error('Error saving notes:', error)
    saveStatus.value = 'Error saving'
    setTimeout(() => {
      saveStatus.value = ''
    }, 3000)
  }
}

async function loadNotesFromFirebase() {
  if (!document.value) return

  try {
    // Load from Firebase using the real function
    const notesData = await loadDocumentNotes(document.value.path)

    selectedTags.value = notesData.tags || []
    notes.value = notesData.notes || ''

    console.log('Loaded notes for document:', {
      documentId: document.value.id,
      tags: selectedTags.value,
      notes: notes.value,
      lastModified: notesData.lastModified,
    })
  } catch (error) {
    console.error('Error loading notes:', error)
    // Initialize with empty values on error
    selectedTags.value = []
    notes.value = ''
  }
}
</script>

<template>
  <div class="document-viewer p-6">
    <!-- Breadcrumb Navigation -->
    <div class="mb-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink @click="goToDashboard" class="cursor-pointer">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{{
              currentDocumentId ? truncateDocumentId(currentDocumentId) : 'Loading...'
            }}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>

    <div v-if="!document" class="text-gray-500">Select a document to view its contents.</div>

    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="border-b pb-4">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-sm text-muted-foreground">Anon Auth ID:</span>
            <span
              class="text-xs font-mono cursor-pointer hover:bg-muted px-1 rounded transition-colors"
              :title="document.parsed.firebaseAnonAuthID"
              @click="copyToClipboard(document.parsed.firebaseAnonAuthID, 'Firebase Auth ID')"
            >
              {{ document.parsed.firebaseAnonAuthID }}
            </span>
            <h2
              class="text-2xl font-bold font-mono cursor-pointer hover:bg-muted px-2 rounded transition-colors"
              :title="document.id"
              @click="copyToClipboard(document.id, 'Document ID')"
            >
              {{ document.id }}
            </h2>
            <p class="text-sm text-gray-600">{{ document.path }}</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-3">
            <Button
              @click="refreshDocument"
              variant="outline"
              size="sm"
              :disabled="loading"
              class="flex items-center gap-2"
            >
              <RefreshCw :class="{ 'animate-spin': loading }" class="h-4 w-4" />
              Refresh Document
            </Button>

            <Button
              @click="openInFirebaseConsole"
              variant="outline"
              size="sm"
              :disabled="!document"
              class="flex items-center gap-2"
            >
              <ExternalLink class="h-4 w-4" />
              View in Firebase Console
            </Button>
          </div>
        </div>
      </div>

      <!-- Three Summary Cards (1/3 each) -->
      <div class="flex gap-6 mb-6">
        <!-- Document Summary Card (1/3 width) -->
        <div class="w-1/3">
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Document Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between items-center">
                  <span class="text-muted-foreground">Done:</span>
                  <Badge :variant="getBadgeVariant('done', document.parsed.done)">
                    {{ formatBooleanValue(document.parsed.done) }}
                  </Badge>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-muted-foreground">Verified Visibility:</span>
                  <Badge :variant="getBadgeVariant('verifiedVisibility', document.parsed.verifiedVisibility)">
                    {{ formatBooleanValue(document.parsed.verifiedVisibility) }}
                  </Badge>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Recruitment Service:</span>
                  <span class="font-medium">{{ document.parsed.recruitmentService || 'Not specified' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-muted-foreground">Consented:</span>
                  <Badge :variant="getBadgeVariant('consented', document.parsed.consented)">
                    {{ formatBooleanValue(document.parsed.consented) }}
                  </Badge>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-muted-foreground">Withdrawn:</span>
                  <Badge :variant="getBadgeVariant('withdrawn', document.parsed.withdrawn)">
                    {{ formatBooleanValue(document.parsed.withdrawn) }}
                  </Badge>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Start Time:</span>
                  <span class="font-medium text-xs">{{ formatHumanReadableTime(document.parsed.startTime) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">End Time:</span>
                  <span class="font-medium text-xs">{{ formatHumanReadableTime(document.parsed.endTime) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Duration:</span>
                  <span class="font-medium">{{
                    calculateSessionDuration(document.parsed.startTime, document.parsed.endTime)
                  }}</span>
                </div>
                <div class="border-t pt-3 mt-3">
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Field Count:</span>
                    <span class="font-medium">{{ getFieldCount() }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Size:</span>
                    <span class="font-medium">{{ getDocumentSize() }}</span>
                  </div>
                </div>

                <!-- Data Provenance Subsection -->
                <div v-if="getGithubInfo()" class="border-t pt-3 mt-3">
                  <div class="text-sm font-medium text-muted-foreground mb-3">Data Provenance</div>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between items-start">
                      <span class="text-muted-foreground">Repository:</span>
                      <div class="ml-4 text-right">
                        <a
                          v-if="getGithubInfo().repoName"
                          :href="getRepositoryUrl()"
                          target="_blank"
                          class="text-blue-600 hover:text-blue-800 underline font-medium"
                        >
                          {{ getGithubInfo().repoName }}
                        </a>
                        <span v-else class="font-medium text-gray-600">Not specified</span>
                      </div>
                    </div>

                    <div class="flex justify-between items-start">
                      <span class="text-muted-foreground">Branch:</span>
                      <span class="font-medium ml-4 text-right">{{ getGithubInfo().branch || 'Not specified' }}</span>
                    </div>

                    <div class="flex justify-between items-start">
                      <span class="text-muted-foreground">Commit:</span>
                      <div class="ml-4 text-right">
                        <a
                          v-if="getGithubInfo().lastCommitHash"
                          :href="getCommitUrl()"
                          target="_blank"
                          class="text-blue-600 hover:text-blue-800 underline font-mono text-xs"
                        >
                          {{ truncateCommitHash(getGithubInfo().lastCommitHash) }}
                        </a>
                        <span v-else class="font-medium text-gray-600">Not specified</span>
                      </div>
                    </div>

                    <div v-if="getGithubInfo().lastCommitMsg" class="border-t pt-2 mt-2">
                      <div class="text-muted-foreground text-xs mb-1">Commit Message:</div>
                      <div class="font-medium text-xs leading-relaxed break-words">
                        {{ truncateCommitMessage(getGithubInfo().lastCommitMsg) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Quality Assurance Card (1/3 width) -->
        <div class="w-1/3 space-y-6">
          <!-- Quality Assurance Card -->
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Quality Assurance</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between items-start">
                  <span class="text-muted-foreground">Participant ID:</span>
                  <div class="ml-4 text-right">
                    <div v-if="isCheckingDuplicates" class="flex items-center gap-2">
                      <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                      <span class="text-xs text-muted-foreground">Checking...</span>
                    </div>
                    <div v-else-if="duplicateDocuments.length > 0" class="space-y-2">
                      <Badge variant="destructive" class="mb-2"> Repeated ({{ duplicateDocuments.length }}) </Badge>
                      <div class="space-y-1">
                        <div v-for="duplicate in duplicateDocuments.slice(0, 3)" :key="duplicate.id" class="text-xs">
                          <a
                            @click="navigateToDocument(duplicate)"
                            class="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                          >
                            {{ truncateDocumentId(duplicate.id) }}
                          </a>
                        </div>
                        <div v-if="duplicateDocuments.length > 3" class="text-xs text-muted-foreground">
                          +{{ duplicateDocuments.length - 3 }} more
                        </div>
                      </div>
                    </div>
                    <div v-else>
                      <Badge variant="secondary" class="bg-green-100 text-green-800"> Unique </Badge>
                    </div>
                  </div>
                </div>

                <div class="flex justify-between items-start">
                  <span class="text-muted-foreground">IP Address:</span>
                  <div class="ml-4 text-right">
                    <div v-if="isCheckingIpDuplicates" class="flex items-center gap-2">
                      <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                      <span class="text-xs text-muted-foreground">Checking...</span>
                    </div>
                    <div v-else-if="!getCurrentIpAddress()" class="text-xs text-muted-foreground">No IP data found</div>
                    <div v-else-if="duplicateIpDocuments.length > 0" class="space-y-2">
                      <Badge variant="destructive" class="mb-2"> Repeated ({{ duplicateIpDocuments.length }}) </Badge>
                      <div class="text-xs font-mono text-gray-600 mb-2">{{ getCurrentIpAddress() }}</div>
                      <div class="space-y-1">
                        <div v-for="duplicate in duplicateIpDocuments.slice(0, 3)" :key="duplicate.id" class="text-xs">
                          <a
                            @click="navigateToDocument(duplicate)"
                            class="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                          >
                            {{ truncateDocumentId(duplicate.id) }}
                          </a>
                        </div>
                        <div v-if="duplicateIpDocuments.length > 3" class="text-xs text-muted-foreground">
                          +{{ duplicateIpDocuments.length - 3 }} more
                        </div>
                      </div>
                    </div>
                    <div v-else>
                      <Badge variant="secondary" class="bg-green-100 text-green-800"> Unique </Badge>
                      <div class="text-xs font-mono text-gray-600 mt-1">{{ getCurrentIpAddress() }}</div>
                    </div>
                  </div>
                </div>

                <div class="flex justify-between items-start">
                  <span class="text-muted-foreground">WebDriver Detected:</span>
                  <div class="ml-4 text-right">
                    <div v-if="!privateData || !privateData.browserFingerprint" class="text-xs text-muted-foreground">
                      No fingerprint data
                    </div>
                    <div v-else-if="getWebDriverStatus() === true" class="space-y-1">
                      <Badge variant="destructive"> Yes </Badge>
                      <div class="text-xs text-muted-foreground">Automated browser detected</div>
                    </div>
                    <div v-else-if="getWebDriverStatus() === false" class="space-y-1">
                      <Badge variant="secondary" class="bg-green-100 text-green-800"> No </Badge>
                      <div class="text-xs text-muted-foreground">Normal browser</div>
                    </div>
                    <div v-else class="text-xs text-muted-foreground">Status unknown</div>
                  </div>
                </div>

                <!-- Browser Telemetry Subsection -->
                <div class="border-t pt-3 mt-3">
                  <div class="text-sm font-medium text-muted-foreground mb-3">Browser Telemetry</div>
                  <div v-if="getBrowserTelemetrySummary()" class="space-y-2 text-sm">
                    <div
                      v-for="(count, eventType) in getBrowserTelemetrySummary()"
                      :key="eventType"
                      class="flex justify-between"
                    >
                      <span class="text-muted-foreground capitalize">{{ eventType }}:</span>
                      <span class="font-medium">{{ count.toLocaleString() }}</span>
                    </div>
                    <div class="border-t pt-2 mt-2">
                      <div class="flex justify-between">
                        <span class="text-muted-foreground">Total Events:</span>
                        <span class="font-medium">{{ getTotalBrowserEvents().toLocaleString() }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-sm text-muted-foreground">No data recorded</div>
                </div>

                <!-- View Flow Subsection -->
                <div class="border-t pt-3 mt-3">
                  <div class="text-sm font-medium text-muted-foreground mb-3">View Flow</div>
                  <div v-if="getViewFlowData() && getViewFlowData().length > 0" class="text-sm">
                    <!-- Subway Map Style Timeline -->
                    <div class="relative">
                      <div
                        v-for="(step, index) in getViewFlowData()"
                        :key="index"
                        class="relative flex items-center mb-4 last:mb-0"
                      >
                        <!-- Timeline line (vertical connector) -->
                        <div
                          v-if="index < getViewFlowData().length - 1"
                          class="absolute left-3 top-6 w-0.5 h-8 bg-gradient-to-b from-blue-400 to-blue-500"
                        ></div>

                        <!-- Station node -->
                        <div class="relative z-10 flex items-center">
                          <!-- Station circle -->
                          <div
                            class="flex-shrink-0 w-6 h-6 rounded-full border-2 border-blue-500 bg-white flex items-center justify-center"
                          >
                            <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                          </div>

                          <!-- Station info -->
                          <div class="ml-4 flex-1 min-w-0">
                            <div class="flex items-center justify-between">
                              <div class="flex-1 min-w-0">
                                <div class="font-medium text-foreground truncate">{{ step.route }}</div>
                                <div class="text-xs text-muted-foreground">Step {{ index + 1 }}</div>
                              </div>
                              <div class="ml-4 flex-shrink-0">
                                <div class="font-medium text-blue-600">{{ formatTimeDelta(step.timeDelta) }}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Total time summary -->
                    <div v-if="getTotalViewTime() > 0" class="mt-6 pt-4 border-t border-gray-200">
                      <div class="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                        <div class="flex items-center">
                          <div class="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                          <span class="font-medium text-blue-900">Total Journey Time</span>
                        </div>
                        <span class="font-bold text-blue-700">{{ formatTimeDelta(getTotalViewTime()) }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-sm text-muted-foreground">No data recorded</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Private Data Card (1/3 width) -->
        <div class="w-1/3">
          <!-- Private Data Card -->
          <Card class="bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle class="text-lg text-amber-800 flex items-center gap-2">
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                Private Data
              </CardTitle>
            </CardHeader>
            <CardContent class="bg-amber-50">
              <div v-if="isLoadingPrivateData" class="flex items-center gap-2 py-4">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                <span class="text-sm text-amber-700">Loading private data...</span>
              </div>
              <div v-else-if="privateData && Object.keys(privateData).length > 0" class="text-sm">
                <div class="space-y-3">
                  <div
                    v-for="(value, key) in privateData"
                    :key="key"
                    class="border-b border-amber-200 pb-2 last:border-b-0"
                  >
                    <div class="font-medium text-amber-800 mb-1">{{ key }}</div>
                    <div class="ml-3">
                      <ValueRenderer :value="value" />
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-sm text-amber-700 py-2">No private data found</div>
            </CardContent>
          </Card>
        </div>

        <!-- Notes Card (1/3 width) -->
        <div class="w-1/3">
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <!-- Tags Section -->
                <div>
                  <Label class="text-sm font-medium text-muted-foreground mb-2 block">Tags</Label>
                  <TagsInput
                    v-model="selectedTags"
                    :predefined-tags="presetTags"
                    placeholder="Add tags..."
                    @update:model-value="debouncedSaveTags"
                  >
                    <TagsInputItem v-for="item in selectedTags" :key="item" :value="item">
                      <TagsInputItemText />
                      <TagsInputItemDelete />
                    </TagsInputItem>
                    <TagsInputInput />
                  </TagsInput>
                </div>

                <!-- Notes Section -->
                <div>
                  <Label class="text-sm font-medium text-muted-foreground mb-2 block">Notes</Label>
                  <textarea
                    v-model="notes"
                    placeholder="Add notes about this data record..."
                    class="w-full h-24 px-3 py-2 text-sm border border-input bg-background rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    @input="debouncedSaveNotes"
                  />
                </div>

                <!-- Save Status -->
                <div v-if="saveStatus" class="text-xs text-muted-foreground">
                  {{ saveStatus }}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Configuration and Field Explorer -->
      <div class="flex gap-6">
        <!-- Configuration Card (1/3 width) -->
        <div class="w-1/3">
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div v-if="getSmileConfigData()" class="text-sm">
                <div class="space-y-2" v-html="renderConfigData(getSmileConfigData())"></div>
              </div>
              <div v-else class="text-sm text-muted-foreground">No configuration data recorded</div>
            </CardContent>
          </Card>
        </div>

        <!-- Field Explorer (2/3 width) -->
        <div class="flex-1">
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Field Explorer</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs default-value="parsed" class="w-full">
                <TabsList class="grid w-full grid-cols-2">
                  <TabsTrigger value="parsed">Parsed View</TabsTrigger>
                  <TabsTrigger value="raw">Raw View</TabsTrigger>
                </TabsList>

                <TabsContent value="parsed" class="mt-4">
                  <div class="space-y-4">
                    <div
                      v-for="(value, key) in getFilteredParsedData()"
                      :key="key"
                      class="border-b pb-3 last:border-b-0"
                    >
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <div class="font-medium text-foreground">{{ key }}</div>
                          <div class="mt-1">
                            <ValueRenderer :value="value" />
                          </div>
                        </div>
                        <div class="text-xs text-muted-foreground ml-4">
                          {{ getValueType(value) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="raw" class="mt-4">
                  <div class="relative">
                    <Button
                      @click="copyRawDataToClipboard"
                      variant="outline"
                      size="sm"
                      class="absolute top-2 right-6 z-10"
                    >
                      <Copy class="h-4 w-4" />
                    </Button>
                    <div class="font-mono text-sm">
                      <pre class="whitespace-pre-wrap bg-muted p-4 rounded overflow-x-auto">{{
                        JSON.stringify(document.raw, null, 2)
                      }}</pre>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
