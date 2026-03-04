<script setup>
/**
 * UploadVideoView Component
 *
 * Final screen for PANDA studies with an auto-playing instructional video
 * telling parents how to upload their video recording. Calls api.saveData(true)
 * to force-save. Uses `resetApp: true` meta.
 *
 * Optional — researchers import and add to their timeline only if needed.
 */

import { onMounted } from 'vue'

import useViewAPI from '@/core/composables/useViewAPI'
import { ConstrainedPage, TitleTwoCol } from '@/uikit/layouts'

const api = useViewAPI()

onMounted(() => {
  api.saveData(true) // force save on mount
})
</script>

<template>
  <ConstrainedPage
    :responsiveUI="api.config.responsiveUI"
    :width="api.config.windowsizerRequest.width"
    :height="api.config.windowsizerRequest.height"
  >
    <TitleTwoCol leftFirst leftWidth="w-1/3" :responsiveUI="api.config.responsiveUI">
      <template #title>
        <h3 class="text-3xl font-bold mb-4"><i-fa6-solid-video class="inline mr-2" />&nbsp;Upload Your Video</h3>
        <p class="text-lg mb-8">
          Thank you for completing the study! Please watch the short video below for instructions on how to upload your
          video recording.
        </p>
      </template>

      <template #left>
        <div class="text-left text-muted-foreground">
          <h3 class="text-lg font-bold mb-2">Important</h3>
          <p class="text-md font-light text-muted-foreground">
            Your study data has been saved. Please follow the video instructions to upload your recording. You may close
            this window after uploading.
          </p>
        </div>
      </template>

      <template #right>
        <div class="border border-border text-left bg-muted p-6 rounded-lg">
          <div class="aspect-video bg-background rounded-md flex items-center justify-center mb-4">
            <p class="text-muted-foreground text-center p-4">
              Instructional video placeholder — replace with your video URL using a
              <code>&lt;video&gt;</code> or <code>&lt;iframe&gt;</code> element.
            </p>
          </div>
          <p class="text-sm text-muted-foreground">
            If you have any questions about uploading your video, please contact the research team.
          </p>
        </div>
      </template>
    </TitleTwoCol>
  </ConstrainedPage>
</template>
