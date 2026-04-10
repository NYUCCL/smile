<script setup>
import { reactive, computed } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import { TitleTwoCol, ConstrainedPage } from '@/uikit/layouts'

const api = useViewAPI()

if (!api.persist.isDefined('forminfo')) {
  api.persist.forminfo = reactive({
    age: '',
    gender: '',
  })
}

const complete = computed(() => api.persist.forminfo.age !== '' && api.persist.forminfo.gender !== '')

function autofill() {
  api.persist.forminfo.age = '32'
  api.persist.forminfo.gender = 'Female'
}
api.setAutofill(autofill)

function finish() {
  api.recordPageData(api.persist.forminfo)
  api.goNextView()
}
</script>

<template>
  <ConstrainedPage
    :responsiveUI="api.config.responsiveUI"
    :width="api.config.windowsizerRequest.width"
    :height="api.config.windowsizerRequest.height"
  >
    <TitleTwoCol leftFirst leftWidth="w-1/3" :responsiveUI="api.config.responsiveUI">
      <template #title>
        <h3 class="text-3xl font-bold mb-4"><i-fa6-solid-person class="inline mr-2" />Demographic Information</h3>
        <p class="text-lg mb-8">
          We request some basic information about you. Your privacy will be maintained and the data will not be linked
          to your online identity.
        </p>
      </template>

      <template #left>
        <div class="text-left text-muted-foreground">
          <h3 class="text-lg font-bold mb-2">Basic Info</h3>
          <p class="text-md font-light">Please answer both questions to continue.</p>
        </div>
      </template>

      <template #right>
        <div class="border border-border text-left bg-muted p-6 rounded-lg">
          <div class="mb-4">
            <label class="block text-md font-semibold text-foreground mb-2">Age</label>
            <input
              type="text"
              v-model="api.persist.forminfo.age"
              placeholder="Enter your age"
              class="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            />
          </div>

          <div class="mb-4">
            <label class="block text-md font-semibold text-foreground mb-2">Gender</label>
            <input
              type="text"
              v-model="api.persist.forminfo.gender"
              placeholder="Enter your gender"
              class="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            />
          </div>

          <hr class="border-border my-6" />
          <div class="flex justify-end">
            <Button variant="default" :disabled="!complete" @click="finish()">
              Continue <i-fa6-solid-arrow-right />
            </Button>
          </div>
        </div>
      </template>
    </TitleTwoCol>
  </ConstrainedPage>
</template>
