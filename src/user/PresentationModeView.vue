<script setup>
import { computed } from 'vue'
import { Button } from '@/uikit/components/ui/button'
import { Separator } from '@/uikit/components/ui/separator'
import { ArrowRight, ExternalLink, Calendar, Users, Building } from 'lucide-vue-next'
import useAPI from '@/core/composables/useAPI'
const api = useAPI()
// setup the info for the page here

// main title
const title = 'This is my default title for a project'
//subtitle
const subtitle = 'This is a subtitle for my project which makes it seem interesting and relevant to a wide audience.'

// access today's date
const lastupdated = __BUILD_TIME__

// site author (who is publishing this or made the present mode site?)
const siteauthor = {
  name: 'Todd Gureckis',
  link: 'https://gureckislab.org',
}

// project authors (who made the project?)
const projectauthors = [
  {
    name: 'Todd Gureckis',
    link: 'https://todd.gureckislab.org',
    affiliation: 'New York University',
  },
  {
    name: 'Guy Davidson',
    link: 'https://guydavidson.me/',
    affiliation: ['New York University', 'Meta AI Labs'],
  },
]

// a list of project info include urls to prprints
// the link field is optional
const info = [
  {
    title: 'DOI',
    data: '10.23915/distill.00032',
    link: 'https://doi.org/10.23915/distill.00032',
  },
  {
    title: 'Project Site',
    data: 'gureckislab.org',
    link: 'https://gureckislab.org',
  },
  {
    title: 'arxiv Preprint',
    data: 'link',
    link: 'https://gureckislab.org',
  },
]

const uniqueAffiliations = computed(() => {
  const affiliations = projectauthors.flatMap((author) =>
    Array.isArray(author.affiliation) ? author.affiliation : [author.affiliation]
  )
  return [...new Set(affiliations)]
})

function getUniqueAffiliations(affiliation) {
  return Array.isArray(affiliation) ? affiliation : [affiliation]
}
function getAffiliationIndex(affiliation) {
  return uniqueAffiliations.value.indexOf(affiliation) + 1
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header Section -->
    <header class="bg-muted/50 border-b py-6">
      <div class="w-2/3 mx-auto px-6 py-8">
        <h1 class="text-5xl font-bold text-foreground mb-4 leading-tight">
          {{ title }}
        </h1>
        <p class="text-2xl text-muted-foreground leading-relaxed">
          {{ subtitle }}
        </p>
      </div>
    </header>

    <!-- Author Information Section -->
    <section class="border-b bg-background">
      <div class="w-2/3 mx-auto px-6 py-8">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
          <!-- Authors -->
          <div class="md:col-span-2">
            <h3 class="text-[0.65rem] font-extralight uppercase tracking-widest text-muted-foreground mb-4">Authors</h3>
            <div class="space-y-2">
              <div v-for="(author, index) in projectauthors" :key="index" class="text-[0.9rem]">
                <template v-if="author.link">
                  <a
                    :href="author.link"
                    class="text-foreground hover:text-primary transition-colors font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ author.name }}
                  </a>
                </template>
                <template v-else>
                  <span class="text-foreground font-medium">{{ author.name }}</span>
                </template>
                <sup class="text-xs text-muted-foreground">
                  <template v-for="(aff, affIndex) in getUniqueAffiliations(author.affiliation)" :key="affIndex">
                    {{ getAffiliationIndex(aff)
                    }}{{ affIndex < getUniqueAffiliations(author.affiliation).length - 1 ? ',' : '' }}
                  </template>
                </sup>
              </div>
            </div>
          </div>

          <!-- Affiliations -->
          <div class="md:col-span-3">
            <h3 class="text-[0.65rem] font-extralight uppercase tracking-widest text-muted-foreground mb-4">
              Affiliations
            </h3>
            <div class="space-y-3">
              <div v-for="(aff, index) in uniqueAffiliations" :key="index" class="text-[0.9rem]">
                <sup class="text-xs">{{ index + 1 }}</sup
                >&nbsp;{{ aff }}
              </div>
            </div>
          </div>

          <!-- Last Updated -->
          <div class="md:col-span-2">
            <h3 class="text-[0.65rem] font-extralight uppercase tracking-widest text-muted-foreground mb-4">
              Last Updated
            </h3>
            <p class="text-[0.9rem] text-foreground">{{ lastupdated }}</p>
          </div>

          <!-- Project Info -->
          <div class="md:col-span-4">
            <div class="space-y-4">
              <div v-for="item in info" :key="item.title">
                <h3 class="text-[0.65rem] font-extralight uppercase tracking-widest text-muted-foreground mb-2">
                  {{ item.title }}
                </h3>
                <div class="text-[0.9rem]">
                  <a
                    v-if="item.link"
                    :href="item.link"
                    class="text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ item.data }}
                    <i-lucide-external-link class="w-3 h-3" />
                  </a>
                  <span v-else class="text-foreground">{{ item.data }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="w-2/3 mx-auto px-6 py-12">
      <!-- Project Description -->
      <div class="prose prose-gray max-w-none mb-12">
        <p class="text-lg text-muted-foreground leading-relaxed mb-4">
          This is a description of this project. It was a project that took many years to set up. The purpose of this
          site is to document the project and to allow people to experience the task first hand. Presentation mode is a
          nice way to share the experiment with the world. In addition you can use presentation mode a simple
          interface/viewer for your task. It's actually pretty fun.
        </p>
        <p class="text-lg text-muted-foreground leading-relaxed mb-4">
          Maybe someday we can make this like a full featured scientific writing tool with support for math equations
          and stuff but for now this is just a starter template with a design inspired by the Distill.pub website.
        </p>
        <p class="text-lg text-muted-foreground leading-relaxed mb-4">
          You can write as much as you want here and then you can include links and other elements from your experiment.
        </p>
        <p class="text-lg text-muted-foreground leading-relaxed">
          Use the links below to navigate to different parts of the experiment, or use the navigation bar at the top of
          the page.
        </p>
      </div>

      <Separator class="my-8" />

      <!-- Navigation Sections -->
      <div class="space-y-8">
        <!-- Start from beginning -->
        <div>
          <h3 class="text-xl font-semibold text-foreground mb-3">Start from beginning</h3>
          <p class="text-lg text-muted-foreground mb-4">
            Start the experiment from the very beginning as if you were a real participant. Your data will not be saved,
            though some local storage may be used while you are on the page.
          </p>
          <Button size="sm" asChild>
            <a :href="api.urls['web']">
              Start
              <i-lucide-arrow-right class="w-4 h-4 ml-2 inline" />
            </a>
          </Button>
        </div>

        <Separator />

        <!-- Instructions -->
        <div>
          <h3 class="text-xl font-semibold text-foreground mb-3">Instructions</h3>
          <p class="text-lg text-muted-foreground mb-4">
            Go to the task instructions to learn about how to play the game. After several pages of instructions, you
            can try out the comprehension quiz that real participants must pass to continue.
          </p>
          <Button size="sm" @click="api.goToView('instructions')">
            Instructions
            <i-lucide-arrow-right class="w-4 h-4 ml-2 inline" />
          </Button>
        </div>

        <Separator />

        <!-- stoop example game -->
        <div>
          <h3 class="text-xl font-semibold text-foreground mb-3">Play Stoop</h3>
          <p class="text-lg text-muted-foreground mb-4">Try out the stroop task.</p>
          <Button size="sm" @click="api.goToView('stroop')">
            Stroop
            <ArrowRight class="w-4 h-4 ml-2 inline" />
          </Button>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-muted/50 border-t mt-16">
      <div class="w-2/3 mx-auto px-6 py-8 text-center">
        <p class="text-sm text-muted-foreground">
          Created by
          <a
            :href="siteauthor.link"
            class="text-primary hover:text-primary/80 transition-colors font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ siteauthor.name }}
          </a>
          using 🫠
          <a
            href="https://smile.gureckislab.org"
            class="text-primary hover:text-primary/80 transition-colors font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            Smile </a
          >.
        </p>
      </div>
    </footer>
  </div>
</template>
