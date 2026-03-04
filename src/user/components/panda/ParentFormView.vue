<script setup>
/**
 * ParentFormView Component
 *
 * End-of-study parent form for PANDA studies collecting:
 * - Video privacy consent (PANDA vs Public)
 * - Digital signature via vue-signature-pad
 * - How-did-you-find-us checkboxes
 * - Primary language
 * - Comments
 *
 * This is typically the route with `setDone: true` in the timeline.
 * Optional — researchers import and add to their timeline only if needed.
 */

import { reactive, computed, ref, onMounted, onUnmounted } from 'vue'

import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import { Checkbox } from '@/uikit/components/ui/checkbox'
import { Label } from '@/uikit/components/ui/label'
import { Input } from '@/uikit/components/ui/input'
import { Textarea } from '@/uikit/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/uikit/components/ui/select'
import { TitleTwoCol, ConstrainedPage } from '@/uikit/layouts'
import { VueSignaturePad } from 'vue-signature-pad'

const api = useViewAPI()

// Initialize form data if not already defined
if (!api.persist.isDefined('parentForm')) {
  api.persist.parentForm = reactive({
    videoConsent: '', // 'panda' or 'public'
    signature: null, // base64 signature data
    howFoundUs: {
      socialMedia: false,
      wordOfMouth: false,
      flyer: false,
      school: false,
      other: false,
    },
    howFoundUsOther: '',
    primaryLanguage: '',
    comments: '',
  })
}

const signaturePad = ref(null)

const complete = computed(() => {
  return api.persist.parentForm.videoConsent !== '' && api.persist.parentForm.signature !== null
})

function clearSignature() {
  if (signaturePad.value) {
    signaturePad.value.clearSignature()
    api.persist.parentForm.signature = null
  }
}

function saveSignature() {
  if (signaturePad.value) {
    const { isEmpty, data } = signaturePad.value.saveSignature()
    if (!isEmpty) {
      api.persist.parentForm.signature = data
    }
  }
}

function autofill() {
  api.persist.parentForm.videoConsent = 'panda'
  api.persist.parentForm.signature = 'data:image/png;base64,AUTOFILL'
  api.persist.parentForm.howFoundUs.socialMedia = true
  api.persist.parentForm.primaryLanguage = 'English'
  api.persist.parentForm.comments = 'Test comment'
}

api.setAutofill(autofill)

function finish() {
  saveSignature()
  api.recordPageData(api.persist.parentForm)
  api.saveData(true)
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
        <h3 class="text-3xl font-bold mb-4">
          <i-fa6-solid-clipboard-list class="inline mr-2" />&nbsp;Parent/Guardian Form
        </h3>
        <p class="text-lg mb-8">
          Please complete this form before finishing the study. Your responses help us improve our research.
        </p>
      </template>

      <template #left>
        <div class="text-left text-muted-foreground">
          <h3 class="text-lg font-bold mb-2">About This Form</h3>
          <p class="text-md font-light text-muted-foreground">
            This form collects information about video privacy preferences and helps us understand how families find our
            studies.
          </p>
        </div>
      </template>

      <template #right>
        <div class="border border-border text-left bg-muted p-6 rounded-lg">
          <!-- Video Privacy Consent -->
          <div class="mb-6">
            <label class="block text-md font-semibold text-foreground mb-3"> Video Privacy Consent </label>
            <p class="text-sm text-muted-foreground mb-3">
              How would you like your child's video recording to be used?
            </p>
            <Select v-model="api.persist.parentForm.videoConsent">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select a privacy option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="panda">PANDA only — video used for research purposes only</SelectItem>
                <SelectItem value="public">Public — video may be used in presentations or publications</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Digital Signature -->
          <div class="mb-6">
            <label class="block text-md font-semibold text-foreground mb-3">
              Digital Signature <span class="text-red-500">*</span>
            </label>
            <p class="text-sm text-muted-foreground mb-3">Please sign below to confirm your consent.</p>
            <div class="border border-border rounded-md bg-background p-1">
              <VueSignaturePad ref="signaturePad" width="100%" height="150px" :options="{ penColor: '#000' }" />
            </div>
            <div class="flex gap-2 mt-2">
              <Button variant="outline" size="sm" @click="clearSignature"> Clear </Button>
              <Button variant="outline" size="sm" @click="saveSignature"> Save Signature </Button>
            </div>
            <p v-if="api.persist.parentForm.signature" class="text-xs text-green-600 mt-1">Signature saved</p>
          </div>

          <!-- How Did You Find Us -->
          <div class="mb-6">
            <label class="block text-md font-semibold text-foreground mb-3">
              How did you find out about this study?
              <span class="font-normal text-muted-foreground">(check all that apply)</span>
            </label>
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <Checkbox v-model:checked="api.persist.parentForm.howFoundUs.socialMedia" id="socialMedia" />
                <Label for="socialMedia">Social media</Label>
              </div>
              <div class="flex items-center gap-2">
                <Checkbox v-model:checked="api.persist.parentForm.howFoundUs.wordOfMouth" id="wordOfMouth" />
                <Label for="wordOfMouth">Word of mouth</Label>
              </div>
              <div class="flex items-center gap-2">
                <Checkbox v-model:checked="api.persist.parentForm.howFoundUs.flyer" id="flyer" />
                <Label for="flyer">Flyer or poster</Label>
              </div>
              <div class="flex items-center gap-2">
                <Checkbox v-model:checked="api.persist.parentForm.howFoundUs.school" id="school" />
                <Label for="school">School or community center</Label>
              </div>
              <div class="flex items-center gap-2">
                <Checkbox v-model:checked="api.persist.parentForm.howFoundUs.other" id="otherCheckbox" />
                <Label for="otherCheckbox">Other</Label>
              </div>
              <Input
                v-if="api.persist.parentForm.howFoundUs.other"
                v-model="api.persist.parentForm.howFoundUsOther"
                placeholder="Please specify"
                class="bg-background dark:bg-background text-base"
              />
            </div>
          </div>

          <!-- Primary Language -->
          <div class="mb-6">
            <label class="block text-md font-semibold text-foreground mb-2">
              What is the primary language spoken at home?
              <span class="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Input
              v-model="api.persist.parentForm.primaryLanguage"
              placeholder="e.g., English"
              class="bg-background dark:bg-background text-base"
            />
          </div>

          <!-- Comments -->
          <div class="mb-6">
            <label class="block text-md font-semibold text-foreground mb-2">
              Any additional comments?
              <span class="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              v-model="api.persist.parentForm.comments"
              placeholder="Please share any thoughts or feedback"
              class="w-full bg-background dark:bg-background text-base resize-vertical"
              rows="4"
            />
          </div>

          <!-- Submit -->
          <hr class="border-border my-6" />
          <div class="flex justify-end">
            <Button variant="default" :disabled="!complete" @click="finish()"> Submit and Continue </Button>
          </div>
        </div>
      </template>
    </TitleTwoCol>
  </ConstrainedPage>
</template>
