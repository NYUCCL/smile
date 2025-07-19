<script setup>
/**
 * Study preview component that displays study information and lab details
 * Provides participants with information about the study, compensation, and researchers
 */

import useAPI from '@/core/composables/useAPI'
import appconfig from '@/core/config'
import { TwoCol } from '@/uikit/layouts'

const api = useAPI()

/**
 * Component props for study information
 */
const props = defineProps({
  estimated_time: {
    type: String,
    required: true,
  },
  payrate: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <!-- Two-column layout for study preview -->
  <TwoCol leftWidth="w-3/5" leftFirst :responsiveUI="api.config.responsiveUI">
    <!-- Left column: Study description and summary -->
    <template #left>
      <!-- Main study title -->
      <h1 class="text-3xl font-bold mb-4">Welcome to our study!</h1>

      <!-- Study description with compensation and time details -->
      <p class="text-lg text-left mb-4">
        We are offering a paid research study looking at how people learn and make decisions. In this study you will
        look at various shapes and pictures and make decisions similar to a video game. You may earn points for making
        good decisions that will convert to money that we will pay you at the end of the study ({{ payrate }}). The
        study should take about {{ estimated_time }} of your time. You'll be asked to digitally sign a constent form and
        (optionally) provide some non-identifiable demographic information during the study. Your data will be kept
        anonymous.
      </p>

      <!-- Visual separator -->
      <hr class="border-gray-300 my-4" />

      <!-- Study summary -->
      <p>
        <b>Summary:</b> This study is like a game, is mentally challenging, requires concentration, can only be played
        once, and requires a desktop browser.
      </p>
    </template>

    <!-- Right column: Lab information and branding -->
    <template #right>
      <!-- Lab logo (hidden on smaller screens) -->
      <img src="@/user/assets/brain.svg" width="220" class="mb-4 hidden @xl:block" />

      <!-- Lab information card -->
      <article class="border border-gray-300 rounded-lg shadow-lg">
        <!-- Card header -->
        <div class="bg-gray-100 px-3 py-2 text-xs font-medium border-b border-gray-300 rounded-t-lg">
          <p><i-fa6-solid-bahai class="inline" />&nbsp;&nbsp;Who are we?</p>
        </div>

        <!-- Card content with lab details -->
        <div class="p-3 text-xs text-left">
          <div v-if="!appconfig.anonymousMode">
            We are the
            <a href="http://gureckislab.org" target="_blank" class="text-green-500 hover:text-green-600"
              >Computation and Cognition Lab</a
            >
            at New York University under the direction to
            <a href="http://todd.gureckislab.org" target="_blank" class="text-green-500 hover:text-green-600"
              >Dr. Todd Gureckis</a
            >. Our lab uses games and other fun tasks to study human intellience. Our research is funded in the public
            interest by the United States
            <a href="https://nsf.gov" target="_new" class="text-green-500 hover:text-green-600"
              >National Science Foundation</a
            >
            among other organizations and non-profit foundations and we publish our work, code, and results for the
            public. We very much appreciate research participants in our studies and have a public
            <a
              href="http://gureckislab.org/research-code-of-ethics.html"
              target="_new"
              class="text-green-500 hover:text-green-600"
              >code of ethics</a
            >
            we strive to uphold in all our studies.
          </div>
          <div v-else>You can try our experiment here.</div>
        </div>
      </article>
    </template>
  </TwoCol>
</template>
