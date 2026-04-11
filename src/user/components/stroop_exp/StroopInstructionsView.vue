<script setup>
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import { ConstrainedTaskWindow } from '@/uikit/layouts'

const api = useViewAPI()

function finish() {
  api.goFirstStep()
  api.goNextView()
}
</script>

<template>
  <ConstrainedTaskWindow
    variant="ghost"
    :responsiveUI="api.config.responsiveUI"
    :width="api.config.windowsizerRequest.width"
    :height="api.config.windowsizerRequest.height"
  >
    <div class="w-[80%] h-[80%]">
      <h1 class="text-2xl font-bold mb-4">
        <i-material-symbols-integration-instructions class="inline-block mr-2 text-3xl" /> Instructions
      </h1>

      <p class="text-left text-lg mb-4">
        In this task, you will see a word displayed in a colored font. Your job is to respond to the
        <strong>color of the font</strong>, not the meaning of the word.
      </p>

      <p class="text-left text-lg mb-4">
        Press <kbd class="px-1.5 py-0.5 rounded border border-gray-400 font-mono text-sm">R</kbd> for
        <span class="font-bold text-red-500">red</span>,&nbsp;
        <kbd class="px-1.5 py-0.5 rounded border border-gray-400 font-mono text-sm">G</kbd> for
        <span class="font-bold text-green-500">green</span>, or&nbsp;
        <kbd class="px-1.5 py-0.5 rounded border border-gray-400 font-mono text-sm">B</kbd> for
        <span class="font-bold text-blue-500">blue</span>.
      </p>

      <p class="text-left text-lg mb-4">
        For example, if you see <span class="font-bold text-green-500">RED</span>, you should press
        <kbd class="px-1.5 py-0.5 rounded border border-gray-400 font-mono text-sm">G</kbd> because
        the font is <span class="font-bold text-green-500">green</span>.
      </p>

      <p class="text-left text-lg mb-4">
        Respond as <strong>quickly and accurately</strong> as you can.
      </p>

      <hr class="border-gray-300 my-4" />

      <div class="flex justify-end">
        <Button variant="default" @click="finish()">
          Start practice quiz
          <i-fa6-solid-arrow-right />
        </Button>
      </div>
    </div>
  </ConstrainedTaskWindow>
</template>
