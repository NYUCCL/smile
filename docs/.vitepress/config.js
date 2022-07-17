import footnote from 'markdown-it-footnote'
import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en-US',
  title: '🫠 Smile.',
  description: 'a gureckislab joint.',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  markdown: {
    toc: {
      listType: 'ol',
    },
    config: (md) => {
      md.use(footnote)
    },
  },
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/nyuccl/smile/edit/main/docs/:path',
      text: 'Suggest changes to this page on GitHub',
    },
    nav: [{ text: 'gureckislab.org', link: 'https://gureckislab.org' }],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/NYUCCL/smile' },
      { icon: 'twitter', link: 'https://twitter.com/todd_gureckis' },
    ],
    sidebar: [
      {
        text: 'Overview',
        items: [
          { text: '👋 Introduction', link: '/introduction' },
          { text: '👾 Required software', link: '/requirements' },
          { text: '✨ Starting a new project', link: '/starting' },
          { text: '☁️ Deploying', link: '/deploying' },
          { text: '⚙️ Configuring', link: '/configuration' },
          { text: '📦 Data storage', link: '/datastorage' },
          { text: '👩‍💻 Developing', link: '/developing' },
          { text: '🐞 Testing', link: '/testing' },
        ],
      },
      {
        text: 'Experiment Design',
        items: [
          { text: '👩‍🎨 Overview', link: '/experimentdesign' },
          { text: '🧩 Components', link: '/components' },
          {
            text: '🏄‍♂️ Reactivity and Declarative Rendering',
            link: '/reactive',
          },
          { text: '⏱ Routing/timeline', link: '/routing' },
          { text: '🧑‍🎨 Styling, CSS, and icons', link: '/style' },
          { text: '💰 Computing bonuses', link: '/bonuses' },
          { text: '🆘 Errors and other issues', link: '/problems' },
          { text: '🧐 Analyzing data', link: '/analysis' },
        ],
      },
      {
        text: 'Recruiting participants',
        items: [
          { text: '🙋 Overview', link: '/recruitment' },
          { text: '😇 Ethical considerations', link: '/ethics' },
        ],
      },
      {
        text: 'Contributing',
        collapsible: false,
        collapsed: false,
        items: [
          { text: '🙋Getting started contributing', link: '/gettingstarted' },
          { text: '✍️ Contributing to the docs', link: '/contributing' },
          { text: '⚡️ Manifesto', link: '/manifesto' },
          { text: '🥸 Design principles', link: '/principles' },
        ],
      },
      {
        text: 'Misc',
        items: [{ text: '📄 Cheat sheet', link: '/cheatsheet' }],
      },
      {
        text: 'Notes',
        collapsible: true,
        collapsed: true,
        items: [
          { text: 'Overview', link: '/research/overview' },
          { text: 'Use-cases', link: '/research/usecases' },
          { text: 'Backend research', link: '/research/backend' },
          { text: 'Frontend research', link: '/research/frontend' },
          { text: 'Setup', link: '/advanced/notes' },
        ],
      },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2020-present Todd Gureckis',
    },
  },
})
