<script setup>
import { reactive, computed, ref } from 'vue'
import { DateFormatter, getLocalTimeZone, CalendarDate } from '@internationalized/date'
import { CalendarIcon } from 'lucide-vue-next'

// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import { Calendar } from '@/uikit/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/uikit/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/uikit/components/ui/select'
import { cn } from '@/uikit/lib/utils'
import { TitleTwoCol, ConstrainedPage } from '@/uikit/layouts'

const api = useViewAPI()

api.steps.append([{ id: 'survey_page1' }, { id: 'survey_page2' }, { id: 'survey_page3' }])

const df = new DateFormatter('en-US', {
  dateStyle: 'long',
})

const dateValue = ref()
const isPopoverOpen = ref(false)

// persists the form info in local storage, otherwise initialize
if (!api.persist.isDefined('forminfo')) {
  api.persist.forminfo = reactive({
    dob: '',
    gender: '',
    race: '',
    hispanic: '',
    fluent_english: '',
    normal_vision: '',
    color_blind: '',
    learning_disability: '',
    neurodevelopmental_disorder: '',
    psychiatric_disorder: '',
    country: '',
    zipcode: '',
    education_level: '',
    household_income: '',
  })
}

// Watch for date changes and update the form data
import { watch } from 'vue'
watch(dateValue, (newValue) => {
  if (newValue) {
    const date = newValue.toDate(getLocalTimeZone())
    api.persist.forminfo.dob = date.toISOString().split('T')[0] // Format as YYYY-MM-DD
    isPopoverOpen.value = false // Close popover when date is selected
  }
})

// Watch for form data changes and update the date picker
watch(
  () => api.persist.forminfo.dob,
  (newValue) => {
    if (newValue && newValue !== '') {
      // Parse the date string and create a CalendarDate object
      const [year, month, day] = newValue.split('-').map(Number)
      dateValue.value = new CalendarDate(year, month, day)
    } else {
      dateValue.value = null
    }
  },
  { immediate: true }
)

const page_one_complete = computed(
  () =>
    api.persist.forminfo.dob !== '' &&
    api.persist.forminfo.gender !== '' &&
    api.persist.forminfo.race !== '' &&
    api.persist.forminfo.hispanic !== '' &&
    api.persist.forminfo.fluent_english !== ''
)

const page_two_complete = computed(
  () =>
    api.persist.forminfo.color_blind !== '' &&
    api.persist.forminfo.learning_disability !== '' &&
    api.persist.forminfo.neurodevelopmental_disorder !== '' &&
    api.persist.forminfo.psychiatric_disorder !== ''
)

const page_three_complete = computed(
  () =>
    api.persist.forminfo.country !== '' &&
    api.persist.forminfo.education_level !== '' &&
    api.persist.forminfo.household_income !== ''
)

function autofill() {
  // Set the date value first so the watcher can handle it
  dateValue.value = new CalendarDate(1978, 9, 12)
  api.persist.forminfo.gender = 'Male'
  api.persist.forminfo.race = 'Caucasian/White'
  api.persist.forminfo.hispanic = 'No'
  api.persist.forminfo.fluent_english = 'Yes'
  api.persist.forminfo.normal_vision = 'Yes'
  api.persist.forminfo.color_blind = 'No'
  api.persist.forminfo.learning_disability = 'No'
  api.persist.forminfo.neurodevelopmental_disorder = 'No'
  api.persist.forminfo.psychiatric_disorder = 'No'
  api.persist.forminfo.country = 'United States'
  api.persist.forminfo.zipcode = '12345'
  api.persist.forminfo.education_level = 'Doctorate Degree (PhD/Other)'
  api.persist.forminfo.household_income = '$100,000–$199,999'
}

api.setAutofill(autofill)

function finish() {
  api.recordForm('demographicForm', api.persist.forminfo)
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
          We request some information about you which we can use to understand aggregate differences between
          individuals. Your privacy will be maintained and the data will not be linked to your online identity (e.g.,
          email).
        </p>
      </template>
      <template #left>
        <div v-if="api.pathString === 'survey_page1'" class="text-left text-muted-foreground">
          <h3 class="text-lg font-bold mb-2">Basic Info</h3>
          <p class="text-md font-light text-muted-foreground">
            First, we need some basic, generic information about you.
          </p>
        </div>
        <div v-else-if="api.pathString === 'survey_page2'" class="text-left text-muted-foreground">
          <h3 class="text-lg font-bold mb-2">Basic Info</h3>
          <p class="text-md font-light text-muted-foreground">
            First, we need some basic, generic information about you.
          </p>
        </div>
        <div v-else-if="api.pathString === 'survey_page3'" class="text-left text-muted-foreground">
          <h3 class="text-lg font-bold mb-2">Basic Info</h3>
          <p class="text-md font-light text-muted-foreground">
            First, we need some basic, generic information about you.
          </p>
        </div>
      </template>
      <template #right>
        <div v-if="api.pathString === 'survey_page1'" class="border border-border text-left bg-muted p-6 rounded-lg">
          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2"> Date of Birth </label>
            <Popover v-model:open="isPopoverOpen">
              <PopoverTrigger as-child>
                <Button
                  variant="secondary"
                  :class="
                    cn(
                      'w-full justify-start text-left font-normal text-base border border-input bg-background hover:bg-background',
                      !dateValue && 'text-muted-foreground'
                    )
                  "
                >
                  <CalendarIcon class="mr-2 h-4 w-4" />
                  {{ dateValue ? df.format(dateValue.toDate(getLocalTimeZone())) : 'Pick a date' }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0">
                <Calendar v-model="dateValue" initial-focus />
              </PopoverContent>
            </Popover>
            <p class="text-xs text-muted-foreground mt-1">Enter your birthday (required)</p>
          </div>

          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2"> Gender </label>
            <Select v-model="api.persist.forminfo.gender">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="I prefer not to say">I prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">Enter your self-identified gender (required)</p>
          </div>

          <div class="mb-3">
            <label class="block text-md font-medium text-foreground mb-2"> Race </label>
            <Select v-model="api.persist.forminfo.race">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asian">Asian</SelectItem>
                <SelectItem value="Black/African American">Black/African American</SelectItem>
                <SelectItem value="Caucasian/White">Caucasian/White</SelectItem>
                <SelectItem value="Native American">Native American</SelectItem>
                <SelectItem value="Pacific Islander/Native Hawaiian">Pacific Islander/Native Hawaiian</SelectItem>
                <SelectItem value="Mixed Race">Mixed Race</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="I prefer not to say">I prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">Enter the race that best describes you (required)</p>
          </div>

          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2"> Are you hispanic? </label>
            <Select v-model="api.persist.forminfo.hispanic">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="I prefer not to say">I prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">Do you consider yourself hispanic? (required)</p>
          </div>

          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2"> Are you fluent in English? </label>
            <Select v-model="api.persist.forminfo.fluent_english">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="I prefer not to say">I prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">
              Are you able to speak and understanding English? (required)
            </p>
          </div>

          <hr class="border-border my-6" />

          <div class="flex justify-end">
            <Button variant="outline" :disabled="!page_one_complete" @click="api.goNextStep()">
              Continue
              <i-fa6-solid-arrow-right />
            </Button>
          </div>
        </div>

        <div
          v-else-if="api.pathString === 'survey_page2'"
          class="border border-border text-left bg-muted p-6 rounded-lg"
        >
          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2">
              Do you have normal vision (or corrected to be normal)?
            </label>
            <Select v-model="api.persist.forminfo.normal_vision">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Unsure">Unsure</SelectItem>
                <SelectItem value="I prefer not to say">I prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">Do you have normal vision? (required)</p>
          </div>

          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2"> Are you color blind? </label>
            <Select v-model="api.persist.forminfo.color_blind">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Unsure">Unsure</SelectItem>
                <SelectItem value="I prefer not to say">I prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">Do you have any color blindness? (required)</p>
          </div>

          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2">
              Have you been diagnosed with a learning disability (e.g., dyslexia, dysclaculia)?
            </label>
            <Select v-model="api.persist.forminfo.learning_disability">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Unsure">Unsure</SelectItem>
                <SelectItem value="I prefer not to say">I prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">Do you have a diagnosed learning disability? (required)</p>
          </div>

          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2">
              Have you been diagnosed with a neurodevelopmental disorder (e.g., autism, tic disorder)?
            </label>
            <Select v-model="api.persist.forminfo.neurodevelopmental_disorder">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Unsure">Unsure</SelectItem>
                <SelectItem value="I prefer not to say">I prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">
              Do you have a diagnosis of a neurodevelopmental disorder? (required)
            </p>
          </div>

          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2">
              Have you been diagnosed with a psychiatric disorder (e.g., anxiety, depression, OCD)?
            </label>
            <Select v-model="api.persist.forminfo.psychiatric_disorder">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Unsure">Unsure</SelectItem>
                <SelectItem value="I prefer not to say">I prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">
              Do you have diagnosis of a psychiatric disorder? (required)
            </p>
          </div>

          <hr class="border-border my-6" />

          <div class="flex justify-between">
            <Button variant="outline" @click="api.goPrevStep()">
              <i-fa6-solid-arrow-left />
              Previous
            </Button>
            <Button variant="outline" :disabled="!page_two_complete" @click="api.goNextStep()">
              Continue
              <i-fa6-solid-arrow-right />
            </Button>
          </div>
        </div>

        <div
          v-else-if="api.pathString === 'survey_page3'"
          class="border border-border text-left bg-muted p-6 rounded-lg"
        >
          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2"> Country </label>
            <Select v-model="api.persist.forminfo.country">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Afghanistan">Afghanistan</SelectItem>
                <SelectItem value="Albania">Albania</SelectItem>
                <SelectItem value="Algeria">Algeria</SelectItem>
                <SelectItem value="Andorra">Andorra</SelectItem>
                <SelectItem value="Angola">Angola</SelectItem>
                <SelectItem value="Antigua & Deps">Antigua & Deps</SelectItem>
                <SelectItem value="Argentina">Argentina</SelectItem>
                <SelectItem value="Armenia">Armenia</SelectItem>
                <SelectItem value="Australia">Australia</SelectItem>
                <SelectItem value="Austria">Austria</SelectItem>
                <SelectItem value="Azerbaijan">Azerbaijan</SelectItem>
                <SelectItem value="Bahamas">Bahamas</SelectItem>
                <SelectItem value="Bahrain">Bahrain</SelectItem>
                <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                <SelectItem value="Barbados">Barbados</SelectItem>
                <SelectItem value="Belarus">Belarus</SelectItem>
                <SelectItem value="Belgium">Belgium</SelectItem>
                <SelectItem value="Belize">Belize</SelectItem>
                <SelectItem value="Benin">Benin</SelectItem>
                <SelectItem value="Bhutan">Bhutan</SelectItem>
                <SelectItem value="Bolivia">Bolivia</SelectItem>
                <SelectItem value="Bosnia Herzegovina">Bosnia Herzegovina</SelectItem>
                <SelectItem value="Botswana">Botswana</SelectItem>
                <SelectItem value="Brazil">Brazil</SelectItem>
                <SelectItem value="Brunei">Brunei</SelectItem>
                <SelectItem value="Bulgaria">Bulgaria</SelectItem>
                <SelectItem value="Burkina">Burkina</SelectItem>
                <SelectItem value="Burundi">Burundi</SelectItem>
                <SelectItem value="Cambodia">Cambodia</SelectItem>
                <SelectItem value="Cameroon">Cameroon</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="Cape Verde">Cape Verde</SelectItem>
                <SelectItem value="Central African Rep">Central African Rep</SelectItem>
                <SelectItem value="Chad">Chad</SelectItem>
                <SelectItem value="Chile">Chile</SelectItem>
                <SelectItem value="China">China</SelectItem>
                <SelectItem value="Colombia">Colombia</SelectItem>
                <SelectItem value="Comoros">Comoros</SelectItem>
                <SelectItem value="Congo">Congo</SelectItem>
                <SelectItem value="Congo {Democratic Rep}">Congo {Democratic Rep}</SelectItem>
                <SelectItem value="Costa Rica">Costa Rica</SelectItem>
                <SelectItem value="Croatia">Croatia</SelectItem>
                <SelectItem value="Cuba">Cuba</SelectItem>
                <SelectItem value="Cyprus">Cyprus</SelectItem>
                <SelectItem value="Czech Republic">Czech Republic</SelectItem>
                <SelectItem value="Denmark">Denmark</SelectItem>
                <SelectItem value="Djibouti">Djibouti</SelectItem>
                <SelectItem value="Dominica">Dominica</SelectItem>
                <SelectItem value="Dominican Republic">Dominican Republic</SelectItem>
                <SelectItem value="East Timor">East Timor</SelectItem>
                <SelectItem value="Ecuador">Ecuador</SelectItem>
                <SelectItem value="Egypt">Egypt</SelectItem>
                <SelectItem value="El Salvador">El Salvador</SelectItem>
                <SelectItem value="Equatorial Guinea">Equatorial Guinea</SelectItem>
                <SelectItem value="Eritrea">Eritrea</SelectItem>
                <SelectItem value="Estonia">Estonia</SelectItem>
                <SelectItem value="Ethiopia">Ethiopia</SelectItem>
                <SelectItem value="Fiji">Fiji</SelectItem>
                <SelectItem value="Finland">Finland</SelectItem>
                <SelectItem value="France">France</SelectItem>
                <SelectItem value="Gabon">Gabon</SelectItem>
                <SelectItem value="Gambia">Gambia</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Germany">Germany</SelectItem>
                <SelectItem value="Ghana">Ghana</SelectItem>
                <SelectItem value="Greece">Greece</SelectItem>
                <SelectItem value="Grenada">Grenada</SelectItem>
                <SelectItem value="Guatemala">Guatemala</SelectItem>
                <SelectItem value="Guinea">Guinea</SelectItem>
                <SelectItem value="Guinea-Bissau">Guinea-Bissau</SelectItem>
                <SelectItem value="Guyana">Guyana</SelectItem>
                <SelectItem value="Haiti">Haiti</SelectItem>
                <SelectItem value="Honduras">Honduras</SelectItem>
                <SelectItem value="Hungary">Hungary</SelectItem>
                <SelectItem value="Iceland">Iceland</SelectItem>
                <SelectItem value="India">India</SelectItem>
                <SelectItem value="Indonesia">Indonesia</SelectItem>
                <SelectItem value="Iran">Iran</SelectItem>
                <SelectItem value="Iraq">Iraq</SelectItem>
                <SelectItem value="Ireland {Republic}">Ireland {Republic}</SelectItem>
                <SelectItem value="Israel">Israel</SelectItem>
                <SelectItem value="Italy">Italy</SelectItem>
                <SelectItem value="Ivory Coast">Ivory Coast</SelectItem>
                <SelectItem value="Jamaica">Jamaica</SelectItem>
                <SelectItem value="Japan">Japan</SelectItem>
                <SelectItem value="Jordan">Jordan</SelectItem>
                <SelectItem value="Kazakhstan">Kazakhstan</SelectItem>
                <SelectItem value="Kenya">Kenya</SelectItem>
                <SelectItem value="Kiribati">Kiribati</SelectItem>
                <SelectItem value="Korea North">Korea North</SelectItem>
                <SelectItem value="Korea South">Korea South</SelectItem>
                <SelectItem value="Kosovo">Kosovo</SelectItem>
                <SelectItem value="Kuwait">Kuwait</SelectItem>
                <SelectItem value="Kyrgyzstan">Kyrgyzstan</SelectItem>
                <SelectItem value="Laos">Laos</SelectItem>
                <SelectItem value="Latvia">Latvia</SelectItem>
                <SelectItem value="Lebanon">Lebanon</SelectItem>
                <SelectItem value="Lesotho">Lesotho</SelectItem>
                <SelectItem value="Liberia">Liberia</SelectItem>
                <SelectItem value="Libya">Libya</SelectItem>
                <SelectItem value="Liechtenstein">Liechtenstein</SelectItem>
                <SelectItem value="Lithuania">Lithuania</SelectItem>
                <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                <SelectItem value="Macedonia">Macedonia</SelectItem>
                <SelectItem value="Madagascar">Madagascar</SelectItem>
                <SelectItem value="Malawi">Malawi</SelectItem>
                <SelectItem value="Malaysia">Malaysia</SelectItem>
                <SelectItem value="Maldives">Maldives</SelectItem>
                <SelectItem value="Mali">Mali</SelectItem>
                <SelectItem value="Malta">Malta</SelectItem>
                <SelectItem value="Marshall Islands">Marshall Islands</SelectItem>
                <SelectItem value="Mauritania">Mauritania</SelectItem>
                <SelectItem value="Mauritius">Mauritius</SelectItem>
                <SelectItem value="Mexico">Mexico</SelectItem>
                <SelectItem value="Micronesia">Micronesia</SelectItem>
                <SelectItem value="Moldova">Moldova</SelectItem>
                <SelectItem value="Monaco">Monaco</SelectItem>
                <SelectItem value="Mongolia">Mongolia</SelectItem>
                <SelectItem value="Montenegro">Montenegro</SelectItem>
                <SelectItem value="Morocco">Morocco</SelectItem>
                <SelectItem value="Mozambique">Mozambique</SelectItem>
                <SelectItem value="Myanmar, {Burma}">Myanmar, {Burma}</SelectItem>
                <SelectItem value="Namibia">Namibia</SelectItem>
                <SelectItem value="Nauru">Nauru</SelectItem>
                <SelectItem value="Nepal">Nepal</SelectItem>
                <SelectItem value="Netherlands">Netherlands</SelectItem>
                <SelectItem value="New Zealand">New Zealand</SelectItem>
                <SelectItem value="Nicaragua">Nicaragua</SelectItem>
                <SelectItem value="Niger">Niger</SelectItem>
                <SelectItem value="Nigeria">Nigeria</SelectItem>
                <SelectItem value="Norway">Norway</SelectItem>
                <SelectItem value="Oman">Oman</SelectItem>
                <SelectItem value="Pakistan">Pakistan</SelectItem>
                <SelectItem value="Palau">Palau</SelectItem>
                <SelectItem value="Panama">Panama</SelectItem>
                <SelectItem value="Papua New Guinea">Papua New Guinea</SelectItem>
                <SelectItem value="Paraguay">Paraguay</SelectItem>
                <SelectItem value="Peru">Peru</SelectItem>
                <SelectItem value="Philippines">Philippines</SelectItem>
                <SelectItem value="Poland">Poland</SelectItem>
                <SelectItem value="Portugal">Portugal</SelectItem>
                <SelectItem value="Qatar">Qatar</SelectItem>
                <SelectItem value="Romania">Romania</SelectItem>
                <SelectItem value="Russian Federation">Russian Federation</SelectItem>
                <SelectItem value="Rwanda">Rwanda</SelectItem>
                <SelectItem value="St Kitts & Nevis">St Kitts & Nevis</SelectItem>
                <SelectItem value="St Lucia">St Lucia</SelectItem>
                <SelectItem value="Saint Vincent & the Grenadines">Saint Vincent & the Grenadines</SelectItem>
                <SelectItem value="Samoa">Samoa</SelectItem>
                <SelectItem value="San Marino">San Marino</SelectItem>
                <SelectItem value="Sao Tome & Principe">Sao Tome & Principe</SelectItem>
                <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                <SelectItem value="Senegal">Senegal</SelectItem>
                <SelectItem value="Serbia">Serbia</SelectItem>
                <SelectItem value="Seychelles">Seychelles</SelectItem>
                <SelectItem value="Sierra Leone">Sierra Leone</SelectItem>
                <SelectItem value="Singapore">Singapore</SelectItem>
                <SelectItem value="Slovakia">Slovakia</SelectItem>
                <SelectItem value="Slovenia">Slovenia</SelectItem>
                <SelectItem value="Solomon Islands">Solomon Islands</SelectItem>
                <SelectItem value="Somalia">Somalia</SelectItem>
                <SelectItem value="South Africa">South Africa</SelectItem>
                <SelectItem value="South Sudan">South Sudan</SelectItem>
                <SelectItem value="Spain">Spain</SelectItem>
                <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
                <SelectItem value="Sudan">Sudan</SelectItem>
                <SelectItem value="Suriname">Suriname</SelectItem>
                <SelectItem value="Swaziland">Swaziland</SelectItem>
                <SelectItem value="Sweden">Sweden</SelectItem>
                <SelectItem value="Switzerland">Switzerland</SelectItem>
                <SelectItem value="Syria">Syria</SelectItem>
                <SelectItem value="Taiwan">Taiwan</SelectItem>
                <SelectItem value="Tajikistan">Tajikistan</SelectItem>
                <SelectItem value="Tanzania">Tanzania</SelectItem>
                <SelectItem value="Thailand">Thailand</SelectItem>
                <SelectItem value="Togo">Togo</SelectItem>
                <SelectItem value="Tonga">Tonga</SelectItem>
                <SelectItem value="Trinidad & Tobago">Trinidad & Tobago</SelectItem>
                <SelectItem value="Tunisia">Tunisia</SelectItem>
                <SelectItem value="Turkey">Turkey</SelectItem>
                <SelectItem value="Turkmenistan">Turkmenistan</SelectItem>
                <SelectItem value="Tuvalu">Tuvalu</SelectItem>
                <SelectItem value="Uganda">Uganda</SelectItem>
                <SelectItem value="Ukraine">Ukraine</SelectItem>
                <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="Uruguay">Uruguay</SelectItem>
                <SelectItem value="Uzbekistan">Uzbekistan</SelectItem>
                <SelectItem value="Vanuatu">Vanuatu</SelectItem>
                <SelectItem value="Vatican City">Vatican City</SelectItem>
                <SelectItem value="Venezuela">Venezuela</SelectItem>
                <SelectItem value="Vietnam">Vietnam</SelectItem>
                <SelectItem value="Yemen">Yemen</SelectItem>
                <SelectItem value="Zambia">Zambia</SelectItem>
                <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">Select the country in which you reside. (required)</p>
          </div>

          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2"> Zipcode/Postal Code </label>
            <input
              type="text"
              v-model="api.persist.forminfo.zipcode"
              placeholder="Enter zip or postal code"
              class="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            />
            <p class="text-xs text-muted-foreground mt-1">
              Select zipcode or postal code of your primary residence. (optional)
            </p>
          </div>

          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2"> Highest level of education </label>
            <Select v-model="api.persist.forminfo.education_level">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No Formal Qualifications">No Formal Qualifications</SelectItem>
                <SelectItem value="Secondary Education (ie. GED/GCSE)">Secondary Education (ie. GED/GCSE)</SelectItem>
                <SelectItem value="High School Diploma (A-levels)">High School Diploma (A-levels)</SelectItem>
                <SelectItem value="Technical/Community College">Technical/Community College</SelectItem>
                <SelectItem value="Undergraduate Degree (BA/BS/Other)">Undergraduate Degree (BA/BS/Other)</SelectItem>
                <SelectItem value="Graduate Degree (MA/MS/MPhil/Other)">Graduate Degree (MA/MS/MPhil/Other)</SelectItem>
                <SelectItem value="Doctorate Degree (PhD/Other)">Doctorate Degree (PhD/Other)</SelectItem>
                <SelectItem value="Don't Know/Not Applicable">Don't Know/Not Applicable</SelectItem>
                <SelectItem value="I prefer not to answer">I prefer not to answer</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">
              What is your highest level of schooling that you completed? (required)
            </p>
          </div>

          <div class="mb-3">
            <label class="block text-md font-semibold text-foreground mb-2">
              Enter your approximate household income.
            </label>
            <Select v-model="api.persist.forminfo.household_income">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Less than $20,000">Less than $20,000</SelectItem>
                <SelectItem value="$20,000–$39,999">$20,000–$39,999</SelectItem>
                <SelectItem value="$40,000–$59,999">$40,000–$59,999</SelectItem>
                <SelectItem value="$60,000–$79,999">$60,000–$79,999</SelectItem>
                <SelectItem value="$80,000–$99,999">$80,000–$99,999</SelectItem>
                <SelectItem value="$100,000–$199,999">$100,000–$199,999</SelectItem>
                <SelectItem value="$200,000–$299,999">$200,000–$299,999</SelectItem>
                <SelectItem value="$300,000–$399,999">$300,000–$399,999</SelectItem>
                <SelectItem value="$400,000–$499,999">$400,000–$499,999</SelectItem>
                <SelectItem value="$500,000+">$500,000+</SelectItem>
                <SelectItem value="I don't know">I don't know</SelectItem>
                <SelectItem value="I prefer not to answer">I prefer not to answer</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">What is your approximate household income? (required)</p>
          </div>

          <hr class="border-border my-6" />

          <div class="flex justify-between">
            <Button variant="outline" @click="api.goPrevStep()">
              <i-fa6-solid-arrow-left />
              Previous
            </Button>
            <Button variant="default" :disabled="!page_three_complete" @click="finish()"> That was easy! </Button>
          </div>
        </div>
      </template>
    </TitleTwoCol>
  </ConstrainedPage>
</template>
