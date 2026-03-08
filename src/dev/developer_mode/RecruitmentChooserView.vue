<script setup>
/**
 * RecruitmentChooserView.vue
 *
 * A developer mode view that provides access to different recruitment platforms
 * for testing and participant recruitment. This component displays cards for
 * various platforms like Prolific, CloudResearch, Mechanical Turk, etc.
 *
 * @component RecruitmentChooserView
 * @description Developer interface for choosing recruitment platforms
 */

import { Button } from '@/uikit/components/ui/button'
import { ArrowRight } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/uikit/components/ui/card'

/**
 * Import and initialize the SMILE ViewAPI
 * @requires useViewAPI SMILE ViewAPI composable that provides view-specific functionality
 * @constant {ViewAPI} api Global ViewAPI instance for this view
 */
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()
</script>

<template>
  <!-- Main container with responsive padding -->
  <div class="px-4 md:px-8 lg:px-12 pt-10 pb-10 bg-background text-foreground global-color-mode">
    <!-- Header section with title and description -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-4">Welcome to Smile Developer 👩‍💻 Mode</h1>
      <p class="text-lg mb-6">
        You can use this to test your application, read the docs, QA your data, and recruit participants through
        multiple platforms.
      </p>
    </div>

    <!-- Divider line -->
    <hr class="my-4" />

    <!-- Grid of recruitment platform cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Prolific Platform Card -->
      <Card class="flex flex-col">
        <CardHeader>
          <CardTitle>Prolific</CardTitle>
          <CardDescription
            ><a href="https://www.prolific.co">Prolific.ac</a> is a platform for online experiments.</CardDescription
          >
        </CardHeader>
        <CardContent class="flex justify-end flex-1 items-end">
          <Button asChild variant="default" size="xs" class="is-blue" id="prolific_tester">
            <a :href="api.urls['prolific']"
              ><i-lucide-dices /> Prolific User
              <ArrowRight class="inline-block ml-1 w-4 h-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <!-- CloudResearch Platform Card -->
      <Card class="flex flex-col">
        <CardHeader>
          <CardTitle>CloudResearch</CardTitle>
          <CardDescription
            ><a href="https://www.cloudresearch.com/">CloudResearch</a> is a platform that recruits from several
            sources, including Mechanical Turk but includes some screening for bots and server farms.</CardDescription
          >
        </CardHeader>
        <CardContent class="flex justify-end flex-1 items-end">
          <Button asChild variant="default" size="xs" class="is-pink" id="cloudresearch_tester">
            <a :href="api.urls['cloudresearch']"
              ><i-lucide-dices /> CR User
              <ArrowRight class="inline-block ml-1 w-4 h-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <!-- Mechanical Turk Platform Card -->
      <Card class="flex flex-col">
        <CardHeader>
          <CardTitle>Mechanical Turk</CardTitle>
          <CardDescription>
            <a href="https://mturk.com">Amazon Mechanical Turk</a> is the original wild-west 🤠 of online crowd labor
            markets.
          </CardDescription>
        </CardHeader>
        <CardContent class="flex justify-end space-y-2 flex-1 items-end flex-col">
          <Button asChild variant="secondary" size="xs" class="is-light-yellow" id="amt_tester_preview">
            <a
              href="/#/mturk/?assignmentId=ASSIGNMENT_ID_NOT_AVAILABLE&hitId=123RVWYBAZW00EXAMPLE&turkSubmitTo=https://www.mturk.com/&workerId=AZ3456EXAMPLE"
              >AMT Preview Mode
              <ArrowRight class="inline-block ml-1 w-4 h-4" />
            </a>
          </Button>
          <Button asChild variant="default" size="xs" class="is-yellow" id="amt_tester">
            <a :href="api.urls['mturk']"
              ><i-lucide-dices /> AMT User
              <ArrowRight class="inline-block ml-1 w-4 h-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <!-- SONA Platform Card -->
      <Card class="flex flex-col">
        <CardHeader>
          <CardTitle>SONA</CardTitle>
          <CardDescription
            >SONA is a platform for running experiments from the university "for credit" pool of
            students.</CardDescription
          >
        </CardHeader>
        <CardContent class="flex justify-end flex-1 items-end">
          <Button asChild variant="default" size="xs" class="is-orange" id="sona_tester">
            <a :href="api.urls['sona']"
              ><i-lucide-dices /> SONA User
              <ArrowRight class="inline-block ml-1 w-4 h-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <!-- SONA Paid Platform Card -->
      <Card class="flex flex-col">
        <CardHeader>
          <CardTitle>SONA Paid</CardTitle>
          <CardDescription
            >SONA Paid is a platform for running paid experiments from the university pool.</CardDescription
          >
        </CardHeader>
        <CardContent class="flex justify-end flex-1 items-end">
          <Button asChild variant="default" size="xs" class="is-teal" id="sona_paid_tester">
            <a :href="api.urls['sona_paid']"
              ><i-lucide-dices /> SONA Paid User
              <ArrowRight class="inline-block ml-1 w-4 h-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <!-- SPARK Platform Card -->
      <Card class="flex flex-col">
        <CardHeader>
          <CardTitle>SPARK</CardTitle>
          <CardDescription
            >SPARK is a recruitment service from the Hartley Lab for adolescent participants of various
            ages.</CardDescription
          >
        </CardHeader>
        <CardContent class="flex justify-end flex-1 items-end">
          <Button asChild variant="default" size="xs" class="is-red" id="spark_tester">
            <a :href="api.urls['spark']"
              ><i-lucide-dices /> SPARK User
              <ArrowRight class="inline-block ml-1 w-4 h-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <!-- PANDA Platform Card -->
      <Card class="flex flex-col">
        <CardHeader>
          <CardTitle>PANDA</CardTitle>
          <CardDescription
            ><a href="https://www.discoveriesinaction.org">PANDA</a> (Princeton and NYU Discoveries in Action) is a
            recruitment platform for younger participants.</CardDescription
          >
        </CardHeader>
        <CardContent class="flex justify-end flex-1 items-end">
          <Button asChild variant="default" size="xs" class="is-coral" id="panda_tester">
            <a :href="api.urls['panda']"
              ><i-lucide-dices /> PANDA User
              <ArrowRight class="inline-block ml-1 w-4 h-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <!-- Citizen Science Platform Card -->
      <Card class="flex flex-col">
        <CardHeader>
          <CardTitle>Citizen Science</CardTitle>
          <CardDescription
            >Citizen Science is a stand-in for a possible future platform run by the lab.</CardDescription
          >
        </CardHeader>
        <CardContent class="flex justify-end flex-1 items-end">
          <Button asChild variant="default" size="xs" class="is-green" id="citizen_tester">
            <a :href="api.urls['citizensci']"
              ><i-lucide-dices /> Citizen Sci User
              <ArrowRight class="inline-block ml-1 w-4 h-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <!-- Anonymous Web User Card -->
      <Card class="flex flex-col">
        <CardHeader>
          <CardTitle>Anonymous Web User</CardTitle>
          <CardDescription>Anonymous web user is not referred by any recruitment service.</CardDescription>
        </CardHeader>
        <CardContent class="flex justify-end flex-1 items-end">
          <Button asChild variant="default" size="xs" class="is-purple" id="web_tester">
            <a :href="api.urls['web']"
              ><i-lucide-dices /> Anon Web User
              <ArrowRight class="inline-block ml-1 w-4 h-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
/* Platform-specific button color variants */
.is-blue {
  background-color: rgb(102, 209, 255);
  color: #393939;
}

.is-red {
  background-color: rgb(255, 102, 133);
  color: #393939;
}

.is-light-yellow {
  background-color: rgb(245, 213, 138);
  color: #393939;
}

.is-yellow {
  background-color: rgb(255, 183, 15);
  color: #393939;
}

.is-pink {
  background-color: #ffc0cb;
  color: #393939;
}

.is-green {
  background-color: rgb(91, 228, 166);
  color: #393939;
}

.is-teal {
  background-color: rgb(102, 223, 214);
  color: #393939;
}

.is-orange {
  background-color: rgb(255, 179, 102);
  color: #393939;
}

.is-coral {
  background-color: rgb(255, 127, 80);
  color: #393939;
}

.is-purple {
  background-color: #ebaeff;
  color: #393939;
  border: none;
}

/* Responsive text sizing for mobile devices */
@media screen and (max-width: 599px) {
  .text-4xl {
    font-size: 1.5em;
  }
}

@media screen and (max-width: 418px) {
  .text-4xl {
    display: none;
  }
}
</style>
