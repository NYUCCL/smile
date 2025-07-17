<script setup>
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/uikit/components/ui/resizable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/uikit/components/ui/tabs'
import { Separator } from '@/uikit/components/ui/separator'
import { Button } from '@/uikit/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/uikit/components/ui/toggle-group'
import { Check, Terminal, Monitor, Tablet, Smartphone, Fullscreen } from 'lucide-vue-next'
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { highlighter } from '../config/shiki'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: false,
  },
  rawCode: {
    type: String,
    required: false,
  },
  responsive: {
    type: Boolean,
    default: true,
  },
  height: {
    type: String,
    default: '600px',
  },
  previewClasses: {
    type: String,
    default: '',
  },
  codeClasses: {
    type: String,
    default: '',
  },
})

const tabValue = ref('preview')
const resizableRef = ref(null)
const rawCode = ref('')
const highlightedCode = ref('')

const metadata = reactive({
  description: null,
  iframeHeight: null,
  containerClass: null,
})

const loadCode = async () => {
  if (props.rawCode) {
    rawCode.value = props.rawCode
    if (highlighter.value) {
      highlightedCode.value = highlighter.value.codeToHtml(props.rawCode, {
        lang: 'vue',
        defaultColor: false,
        theme: 'github-dark-default',
      })
    } else {
      highlightedCode.value = props.rawCode
    }
  } else if (props.filePath) {
    try {
      const absolutePath = props.filePath.startsWith('../') ? props.filePath.replace('../', '/') : props.filePath
      const response = await fetch(absolutePath)
      if (response.ok) {
        rawCode.value = await response.text()
        if (highlighter.value) {
          highlightedCode.value = highlighter.value.codeToHtml(rawCode.value, {
            lang: 'vue',
            defaultColor: false,
            theme: 'github-dark-default',
          })
        } else {
          highlightedCode.value = rawCode.value
        }
      }
    } catch (error) {
      console.error('Failed to load component file:', error)
    }
  }
}

onMounted(() => {
  loadCode()
})

// Watch for prop changes and highlighter availability
watch(
  [() => props.rawCode, () => props.filePath, highlighter],
  () => {
    loadCode()
  },
  { immediate: true }
)
</script>

<template>
  <Tabs
    :id="name"
    v-model="tabValue"
    class="group/block-view-wrapper flex min-w-0 flex-col items-stretch gap-4"
    :style="{
      '--height': metadata.iframeHeight ?? '930px',
    }"
  >
    <div class="flex flex-col items-center gap-4 sm:flex-row">
      <div class="hidden items-center gap-2 sm:flex">
        <TabsList class="h-7 items-center rounded-md p-0 px-[calc(theme(spacing.1)_-_2px)] py-[theme(spacing.1)]">
          <TabsTrigger class="h-[1.45rem] rounded-sm px-2 text-xs" value="preview"> Preview </TabsTrigger>
          <TabsTrigger class="h-[1.45rem] rounded-sm px-2 text-xs" value="code"> Code </TabsTrigger>
        </TabsList>

        <Separator orientation="vertical" class="mx-2 hidden h-4 md:flex" />
        <div class="text-sm font-medium underline-offset-2 hover:underline">
          <a :href="`#${name}`">{{ description }}</a>
        </div>
      </div>

      <div v-if="responsive" class="flex items-center gap-2 pr-[14px] sm:ml-auto">
        <Separator orientation="vertical" class="mx-2 hidden h-4 md:flex" />
        <div class="hidden h-7 items-center gap-1.5 rounded-md border p-[2px] shadow-none lg:flex">
          <ToggleGroup
            type="single"
            default-value="100"
            @update:model-value="
              (value) => {
                console.log('Resizing to:', value, resizableRef.value)
                resizableRef?.resize(parseInt(value))
              }
            "
          >
            <ToggleGroupItem value="100" class="h-[22px] w-[22px] rounded-sm p-0 mr-2">
              <Monitor class="h-3.5 w-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="70" class="h-[22px] w-[22px] rounded-sm p-0 mr-2">
              <Tablet class="h-3.5 w-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="40" class="h-[22px] w-[22px] rounded-sm p-0">
              <Smartphone class="h-3.5 w-3.5" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <!-- <BlockCopyButton :code="rawString" /> -->
        <!-- <V0Button
          name="{block.name}"
          description="{block.description" || "Edit in v0"}
          code="{block.code}"
          style="{block.style}"
        /> -->
      </div>
    </div>
    <TabsContent
      v-show="tabValue === 'preview'"
      force-mount
      value="preview"
      class="relative after:absolute after:inset-0 after:right-3 after:z-0 after:rounded-lg after:bg-muted h-[--height] px-0"
    >
      <ResizablePanelGroup
        v-if="responsive"
        id="block-resizable"
        direction="horizontal"
        class="relative z-10 bg-background"
      >
        <ResizablePanel id="block-resizable-panel-1" ref="resizableRef" :default-size="100" :min-size="30" as-child>
          <div :class="['w-full border-1 border-gray-200 rounded-lg', previewClasses]" :style="{ height: height }">
            <slot />
          </div>
        </ResizablePanel>
        <ResizableHandle
          id="block-resizable-handle"
          class="relative hidden w-3 bg-transparent p-0 after:absolute after:right-0 after:top-1/2 after:h-8 after:w-[6px] after:-translate-y-1/2 after:translate-x-[-1px] after:rounded-full after:bg-border after:transition-all after:hover:h-10 sm:block"
        />
        <ResizablePanel id="block-resizable-panel-2" :default-size="0" :min-size="0" />
      </ResizablePanelGroup>
      <div v-else class="relative z-10 bg-background">
        <div :class="['w-full border-1 border-gray-200 rounded-lg', previewClasses]" :style="{ height: height }">
          <slot />
        </div>
      </div>
    </TabsContent>
    <TabsContent value="code" class="h-[--height]">
      <div
        v-if="(filePath || rawCode) && highlightedCode"
        :class="['bg-zinc-950 text-white rounded-lg overflow-hidden h-full', codeClasses]"
      >
        <div
          class="flex h-12 flex-shrink-0 items-center gap-2 border-b border-zinc-700 bg-zinc-900 px-4 text-sm font-medium"
        >
          <Monitor class="size-4" />
          {{ name }}.vue
        </div>
        <div class="relative flex-1 text-[0.85rem] overflow-auto h-[calc(100%-3rem)] p-4">
          <div v-if="highlightedCode && highlightedCode !== rawCode" v-html="highlightedCode"></div>
          <pre v-else><code>{{ rawCode }}</code></pre>
        </div>
      </div>
      <div v-else :class="['bg-muted rounded-lg p-4 overflow-auto h-full', codeClasses]">
        <pre class="text-sm"><code><slot name="code" /></code></pre>
      </div>
    </TabsContent>
  </Tabs>
</template>
