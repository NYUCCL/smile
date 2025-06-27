<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import appconfig from '@/core/config'
import { useDashboardStore } from '@/core/stores/dashboard'
import { loadDocumentNotes } from './firebase-admin.js'
import { Tabs, TabsList, TabsTrigger } from '@/uikit/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/uikit/components/ui/table'
import { Button } from '@/uikit/components/ui/button'
import { Badge } from '@/uikit/components/ui/badge'
import { Checkbox } from '@/uikit/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/uikit/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/uikit/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/uikit/components/ui/dropdown-menu'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/uikit/components/ui/breadcrumb'
import { RefreshCw, MoreHorizontal, Eye, Download, FileText } from 'lucide-vue-next'

// Initialize dashboard store and router
const dashboardStore = useDashboardStore()
const router = useRouter()

const currentMode = ref(appconfig.mode === 'production' ? 'real' : 'testing')
const selectedUser = ref('all')

// Selection and filtering state
const selectedDocuments = ref(new Set())
const filterStatus = ref('all')
const filterRecruitment = ref('all')

// Pagination state
const currentPage = ref(1)
const itemsPerPage = 10

// Refreshing state
const refreshing = ref(false)

// Notes cache for displaying tags and notes in the table
const notesCache = ref(new Map())

const emit = defineEmits(['document-selected'])

// Computed properties
const currentData = computed(() => {
  return dashboardStore.getCurrentData(currentMode.value)
})

const loading = computed(() => dashboardStore.loading)
const error = computed(() => dashboardStore.error)
const modeCounts = computed(() => dashboardStore.modeCounts)
const projectInfo = computed(() => dashboardStore.projectInfo)

const allFilteredDocuments = computed(() => {
  if (!currentData.value) return []

  let docs = currentData.value.documents || []

  // Filter by user if selected
  if (selectedUser.value !== 'all') {
    docs = docs.filter((doc) => doc.data.firebaseAnonAuthID === selectedUser.value)
  }

  // Filter by status
  if (filterStatus.value !== 'all') {
    switch (filterStatus.value) {
      case 'done':
        docs = docs.filter((doc) => doc.data.done === true)
        break
      case 'withdrawn':
        docs = docs.filter((doc) => doc.data.withdrawn === true)
        break
      case 'consented':
        docs = docs.filter((doc) => doc.data.consented === true)
        break
      case 'incomplete':
        docs = docs.filter((doc) => !doc.data.done && !doc.data.withdrawn)
        break
    }
  }

  // Filter by recruitment service
  if (filterRecruitment.value !== 'all') {
    docs = docs.filter((doc) => doc.data.recruitmentService === filterRecruitment.value)
  }

  return docs
})

// Paginated documents for current page
const filteredDocuments = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return allFilteredDocuments.value.slice(startIndex, endIndex)
})

// Pagination calculations
const totalPages = computed(() => Math.ceil(allFilteredDocuments.value.length / itemsPerPage))
const totalFilteredCount = computed(() => allFilteredDocuments.value.length)

// Get unique recruitment services for filter options
const recruitmentServices = computed(() => {
  if (!currentData.value) return []
  const services = new Set()
  currentData.value.documents.forEach((doc) => {
    if (doc.data.recruitmentService) {
      services.add(doc.data.recruitmentService)
    }
  })
  return Array.from(services).sort()
})

const selectedCount = computed(() => selectedDocuments.value.size)

// Smart select all state
const selectAllState = computed(() => {
  const filteredIds = new Set(allFilteredDocuments.value.map((doc) => doc.id))
  const selectedFilteredCount = Array.from(selectedDocuments.value).filter((id) => filteredIds.has(id)).length

  if (selectedFilteredCount === 0) {
    return false // None selected
  } else if (selectedFilteredCount === allFilteredDocuments.value.length) {
    return true // All selected
  } else {
    return 'indeterminate' // Some selected
  }
})

onMounted(async () => {
  await initializeDashboard()
})

async function initializeDashboard() {
  try {
    await dashboardStore.loadProjectInfo()
    await dashboardStore.loadAllModeCounts()

    // Only load data for current mode and only if not already loaded
    if (!dashboardStore.hasData(currentMode.value)) {
      await dashboardStore.loadModeData(currentMode.value)
    }

    // Load notes for the visible documents
    await loadNotesForVisibleDocuments()
  } catch (err) {
    console.error('Error initializing dashboard:', err)
  }
}

async function refreshData() {
  refreshing.value = true
  try {
    await dashboardStore.refreshAllData()
    // Clear notes cache and reload
    notesCache.value.clear()
    await loadNotesForVisibleDocuments()
  } catch (err) {
    console.error('Error refreshing data:', err)
  } finally {
    refreshing.value = false
  }
}

async function switchMode(mode) {
  currentMode.value = mode
  selectedUser.value = 'all' // Reset user filter when switching modes

  // Reset selection, filters, and pagination when switching modes
  selectedDocuments.value.clear()
  filterStatus.value = 'all'
  filterRecruitment.value = 'all'
  currentPage.value = 1

  // Load data for this mode if not already loaded
  if (!dashboardStore.hasData(mode)) {
    await dashboardStore.loadModeData(mode)
  }

  // Load notes for the new mode's documents
  await loadNotesForVisibleDocuments()
}

// Reset pagination when filters change
function resetPagination() {
  currentPage.value = 1
  selectedDocuments.value.clear()
}

// Watch for filter changes to reset pagination
watch([filterStatus, filterRecruitment, selectedUser], () => {
  resetPagination()
})

// Calculate visible page numbers for pagination
function getVisiblePages() {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2 // Number of pages to show on each side of current page

  if (total <= 7) {
    // Show all pages if total is small
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages = []

  // Always show first page
  if (current > delta + 1) {
    pages.push(1)
    if (current > delta + 2) {
      pages.push('...')
    }
  }

  // Show pages around current page
  const start = Math.max(1, current - delta)
  const end = Math.min(total, current + delta)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  // Always show last page
  if (current < total - delta) {
    if (current < total - delta - 1) {
      pages.push('...')
    }
    pages.push(total)
  }

  return pages
}

function filterDocuments() {
  // Reactive computed property handles this automatically
}

function selectDocument(doc) {
  // Navigate to document viewer route
  const collection = currentMode.value === 'testing' ? 'testing' : 'real'
  router.push({
    name: 'document-viewer',
    params: {
      collection: collection,
      documentId: doc.id,
    },
  })
}

function truncateId(id) {
  return id.length > 20 ? id.substring(0, 20) + '...' : id
}

function formatCreatedDate(data) {
  // Look for common timestamp fields, prioritizing appStartTime
  const timestampFields = ['appStartTime', 'createdAt', 'created', 'timestamp', '_firestore_created']

  for (const field of timestampFields) {
    if (data[field]) {
      const date = new Date(data[field])
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    }
  }

  return 'Unknown'
}

function formatDocumentSize(data) {
  try {
    const jsonString = JSON.stringify(data)
    const sizeInBytes = new Blob([jsonString]).size

    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
    }
  } catch (error) {
    return 'Unknown'
  }
}

function downloadDocument(doc) {
  try {
    // Create a clean copy of the document data (excluding private subcollection)
    const exportData = {
      documentId: doc.id,
      documentPath: doc.ref.path,
      exportedAt: new Date().toISOString(),
      data: doc.data,
    }

    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(exportData, null, 2)

    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    // Generate filename: smile_studyid_docid.json
    const studyId = appconfig.projectRef || 'unknown'
    const docId = doc.id
    const filename = `smile_${studyId}_${docId}.json`

    // Create download link
    const link = document.createElement('a')
    link.href = url
    link.download = filename

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log(`Downloaded document ${doc.id} as ${filename}`)
  } catch (error) {
    console.error('Error downloading document:', error)
    alert('Failed to download document. Please try again.')
  }
}

function toggleDocumentSelection(docId, checked) {
  if (checked) {
    selectedDocuments.value.add(docId)
  } else {
    selectedDocuments.value.delete(docId)
  }
  // Force reactivity by creating a new Set
  selectedDocuments.value = new Set(selectedDocuments.value)
}

function toggleSelectAll(checked) {
  if (checked) {
    // Select all filtered documents (across all pages)
    allFilteredDocuments.value.forEach((doc) => {
      selectedDocuments.value.add(doc.id)
    })
  } else {
    // Deselect all filtered documents
    allFilteredDocuments.value.forEach((doc) => {
      selectedDocuments.value.delete(doc.id)
    })
  }
  // Force reactivity by creating a new Set
  selectedDocuments.value = new Set(selectedDocuments.value)
}

function downloadAllDocuments() {
  downloadBulkDocuments(allFilteredDocuments.value, 'all')
}

function downloadSelectedDocuments() {
  const selectedDocs = allFilteredDocuments.value.filter((doc) => selectedDocuments.value.has(doc.id))
  downloadBulkDocuments(selectedDocs, 'selected')
}

function downloadBulkDocuments(documents, type) {
  try {
    if (documents.length === 0) {
      alert('No documents to download.')
      return
    }

    // Create bulk export data
    const exportData = {
      exportType: type,
      studyId: appconfig.projectRef || 'unknown',
      mode: currentMode.value,
      exportedAt: new Date().toISOString(),
      documentCount: documents.length,
      filters: {
        status: filterStatus.value,
        recruitment: filterRecruitment.value,
        user: selectedUser.value,
      },
      documents: documents.map((doc) => ({
        documentId: doc.id,
        documentPath: doc.ref.path,
        data: doc.data,
      })),
    }

    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(exportData, null, 2)

    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    // Generate filename
    const studyId = appconfig.projectRef || 'unknown'
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const filename = `smile_${studyId}_${type}_${currentMode.value}_${timestamp}.json`

    // Create download link
    const link = document.createElement('a')
    link.href = url
    link.download = filename

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log(`Downloaded ${documents.length} documents as ${filename}`)
  } catch (error) {
    console.error('Error downloading bulk documents:', error)
    alert('Failed to download documents. Please try again.')
  }
}

// Helper functions for tags and notes
function getDocumentTags(documentId) {
  const notesData = notesCache.value.get(documentId)
  return notesData?.tags || []
}

function getDocumentNotes(documentId) {
  const notesData = notesCache.value.get(documentId)
  return notesData?.notes || ''
}

// Load notes for visible documents
async function loadNotesForVisibleDocuments() {
  if (!filteredDocuments.value || filteredDocuments.value.length === 0) return

  console.log('Loading notes for', filteredDocuments.value.length, 'documents')

  // Load notes for all filtered documents (not just current page)
  const loadPromises = allFilteredDocuments.value.map(async (doc) => {
    if (!notesCache.value.has(doc.id)) {
      try {
        const projectRef = appconfig.projectRef
        const mode = currentMode.value === 'testing' ? 'testing' : 'real'
        const documentPath = `${mode}/${projectRef}/data/${doc.id}`

        const notesData = await loadDocumentNotes(documentPath)
        notesCache.value.set(doc.id, notesData)
      } catch (error) {
        console.error('Error loading notes for', doc.id, error)
        // Set empty data for failed loads to avoid retrying
        notesCache.value.set(doc.id, { tags: [], notes: '' })
      }
    }
  })

  await Promise.all(loadPromises)
  console.log('Loaded notes for', notesCache.value.size, 'documents')
}
</script>

<template>
  <div class="p-6">
    <!-- Breadcrumb Navigation -->
    <div class="mb-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>

    <!-- Mode Tabs with Refresh Button -->
    <div class="mb-6 flex items-center justify-between">
      <Tabs :default-value="currentMode" @update:model-value="switchMode">
        <TabsList class="grid w-fit grid-cols-2">
          <TabsTrigger value="testing" class="relative">
            Testing
            <span
              v-if="modeCounts.testing !== null"
              class="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs"
            >
              {{ modeCounts.testing }}
            </span>
          </TabsTrigger>
          <TabsTrigger value="real" class="relative">
            Live
            <span
              v-if="modeCounts.real !== null"
              class="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs"
            >
              {{ modeCounts.real }}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Button
        @click="refreshData"
        variant="outline"
        size="sm"
        :disabled="loading || refreshing"
        class="flex items-center gap-2"
      >
        <RefreshCw :class="{ 'animate-spin': refreshing }" class="h-4 w-4" />
        Refresh
      </Button>
    </div>

    <!-- Summary Bar -->
    <div v-if="currentData" class="bg-muted rounded-lg p-4 mb-6">
      <div class="flex items-center justify-between">
        <div class="grid grid-cols-3 gap-8 text-sm">
          <div>
            <div class="text-gray-600">Total Documents</div>
            <div class="font-medium text-lg">{{ currentData.totalCount }}</div>
          </div>
          <div>
            <div class="text-gray-600">Unique Users</div>
            <div class="font-medium text-lg">{{ Object.keys(currentData.userGroups).length }}</div>
          </div>
          <div>
            <div class="text-gray-600">Loaded</div>
            <div class="font-medium text-lg">{{ currentData.documents.length }} of {{ currentData.totalCount }}</div>
          </div>
        </div>

        <!-- User filter -->
        <div v-if="currentData.uniqueUsers > 1" class="flex items-center space-x-2">
          <label class="text-sm text-gray-600">Filter by user:</label>
          <select v-model="selectedUser" @change="filterDocuments" class="text-sm border rounded px-2 py-1">
            <option value="all">All Users</option>
            <option v-for="(docs, userUid) in currentData.userGroups" :key="userUid" :value="userUid">
              {{ userUid.slice(0, 8) }}... ({{ docs.length }} docs)
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center space-x-2 justify-center py-12">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      <span>Loading {{ currentMode }} data...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <strong>Error:</strong> {{ error }}
    </div>

    <!-- Filter and Bulk Action Controls -->
    <div v-if="currentData && currentData.documents.length > 0" class="bg-muted rounded-lg p-4 mb-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <!-- Filters -->
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium">Status:</label>
            <Select v-model="filterStatus">
              <SelectTrigger class="w-40">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
                <SelectItem value="consented">Consented</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div v-if="recruitmentServices.length > 0" class="flex items-center gap-2">
            <label class="text-sm font-medium">Recruitment:</label>
            <Select v-model="filterRecruitment">
              <SelectTrigger class="w-40">
                <SelectValue placeholder="All services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All services</SelectItem>
                <SelectItem v-for="service in recruitmentServices" :key="service" :value="service">
                  {{ service }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Bulk Actions -->
        <div class="flex items-center gap-2">
          <Button @click="downloadAllDocuments" variant="outline" size="sm" :disabled="totalFilteredCount === 0">
            Download All ({{ totalFilteredCount }})
          </Button>
          <Button @click="downloadSelectedDocuments" variant="outline" size="sm" :disabled="selectedCount === 0">
            Download Selected ({{ selectedCount }})
          </Button>
        </div>
      </div>
    </div>

    <!-- Documents List -->
    <div v-if="filteredDocuments.length === 0" class="text-center py-16">
      <div class="max-w-md mx-auto">
        <h3 class="text-xl font-semibold text-gray-900 mb-3">No Documents Found</h3>
        <p class="text-gray-600 leading-relaxed">
          No data found in {{ currentMode }} mode<span v-if="selectedUser !== 'all'"> for the selected user</span>.
        </p>
        <div class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p class="text-sm text-gray-500">Try adjusting your filters or check back later for new data.</p>
        </div>
      </div>
    </div>

    <div v-else class="space-y-6">
      <!-- Documents Table -->
      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[50px]">
                <Checkbox
                  :model-value="selectAllState === true"
                  :indeterminate="selectAllState === 'indeterminate'"
                  @update:model-value="toggleSelectAll"
                  aria-label="Select all filtered documents"
                  class="rounded-full"
                />
              </TableHead>
              <TableHead class="w-[200px]">Document ID</TableHead>
              <TableHead class="w-[180px]">Created</TableHead>
              <TableHead class="w-[120px]">Size</TableHead>
              <TableHead class="w-[140px]">Status</TableHead>
              <TableHead class="w-[120px]">Recruitment</TableHead>
              <TableHead class="w-[160px]">Tags</TableHead>
              <TableHead class="w-[80px]">Notes</TableHead>
              <TableHead class="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="doc in filteredDocuments" :key="doc.id" class="hover:bg-muted/50">
              <TableCell>
                <Checkbox
                  :model-value="selectedDocuments.has(doc.id)"
                  @update:model-value="(checked) => toggleDocumentSelection(doc.id, checked)"
                  :aria-label="`Select document ${doc.id}`"
                  class="rounded-full"
                />
              </TableCell>
              <TableCell class="font-mono text-sm">
                <div class="flex flex-col">
                  <span class="font-medium">{{ truncateId(doc.id) }}</span>
                  <span class="text-xs text-muted-foreground">
                    User: {{ doc.data.firebaseAnonAuthID?.slice(0, 8) }}...
                  </span>
                </div>
              </TableCell>
              <TableCell class="text-sm text-muted-foreground">
                {{ formatCreatedDate(doc.data) }}
              </TableCell>
              <TableCell class="text-sm text-muted-foreground">
                {{ formatDocumentSize(doc.data) }}
              </TableCell>
              <TableCell>
                <div class="flex flex-wrap gap-1">
                  <Badge v-if="doc.data.done" variant="default" class="bg-green-100 text-green-800 hover:bg-green-200">
                    Done
                  </Badge>
                  <Badge v-if="doc.data.withdrawn" variant="destructive"> Withdrawn </Badge>
                  <Badge
                    v-if="doc.data.consented"
                    variant="default"
                    class="bg-green-100 text-green-800 hover:bg-green-200"
                  >
                    Consented
                  </Badge>
                  <span
                    v-if="!doc.data.done && !doc.data.withdrawn && !doc.data.consented"
                    class="text-xs text-muted-foreground"
                  >
                    No status
                  </span>
                </div>
              </TableCell>
              <TableCell class="text-sm text-muted-foreground">
                {{ doc.data.recruitmentService || 'Not specified' }}
              </TableCell>
              <TableCell>
                <div class="flex flex-wrap gap-1">
                  <Badge v-for="tag in getDocumentTags(doc.id)" :key="tag" variant="secondary" class="text-xs">
                    {{ tag }}
                  </Badge>
                  <span v-if="getDocumentTags(doc.id).length === 0" class="text-xs text-muted-foreground">
                    No tags
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Popover v-if="getDocumentNotes(doc.id)">
                  <PopoverTrigger as-child>
                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                      <FileText class="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-80">
                    <div class="space-y-2">
                      <h4 class="font-medium">Notes</h4>
                      <p class="text-sm text-muted-foreground whitespace-pre-wrap">{{ getDocumentNotes(doc.id) }}</p>
                    </div>
                  </PopoverContent>
                </Popover>
                <span v-else class="text-xs text-muted-foreground"> No notes </span>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <Button @click="selectDocument(doc)" variant="outline" size="sm" class="h-8 px-2">
                    <Eye class="h-3 w-3" />
                  </Button>
                  <Button @click="downloadDocument(doc)" variant="outline" size="sm" class="h-8 px-2">
                    <Download class="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center mt-4">
        <div class="flex items-center gap-2">
          <Button
            @click="currentPage = 1"
            :disabled="currentPage === 1"
            variant="outline"
            size="sm"
            :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
          >
            First
          </Button>
          <Button
            @click="currentPage = currentPage - 1"
            :disabled="currentPage === 1"
            variant="outline"
            size="sm"
            :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
          >
            Previous
          </Button>

          <template v-for="pageNum in getVisiblePages()" :key="pageNum">
            <Button
              v-if="pageNum !== '...'"
              @click="currentPage = pageNum"
              :variant="pageNum === currentPage ? 'default' : 'outline'"
              size="sm"
              class="min-w-10"
            >
              {{ pageNum }}
            </Button>
            <span v-else class="px-2 text-muted-foreground">...</span>
          </template>

          <Button
            @click="currentPage = currentPage + 1"
            :disabled="currentPage >= totalPages"
            variant="outline"
            size="sm"
            :class="{ 'opacity-50 cursor-not-allowed': currentPage >= totalPages }"
          >
            Next
          </Button>
          <Button
            @click="currentPage = totalPages"
            :disabled="currentPage >= totalPages"
            variant="outline"
            size="sm"
            :class="{ 'opacity-50 cursor-not-allowed': currentPage >= totalPages }"
          >
            Last
          </Button>
        </div>
      </div>

      <!-- Results summary -->
      <div class="text-center text-muted-foreground text-sm">
        Showing {{ filteredDocuments.length }} of {{ totalFilteredCount }} documents
        <span v-if="totalPages > 1">(Page {{ currentPage }} of {{ totalPages }})</span>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
