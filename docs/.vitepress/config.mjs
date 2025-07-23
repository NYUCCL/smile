import footnote from 'markdown-it-footnote'
import Mark from 'markdown-it-mark'
import { sub } from '@mdit/plugin-sub'
import { defineConfig } from 'vitepress'
import { version } from '../../package.json'
import tailwindcss from '@tailwindcss/vite'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import IconsResolver from 'unplugin-icons/resolver'
import path from 'path'
import { fileURLToPath } from 'node:url'
import fs from 'fs'
const nodeVersion = fs.readFileSync(new URL('../../.node_version', import.meta.url), 'utf-8').trim()
const resolve = (dir) => (dir ? path.resolve(__dirname, '../', dir) : __dirname)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

function movePlugin(plugins, pluginAName, order, pluginBName) {
  const pluginBIndex = plugins.findIndex((p) => p.name === pluginBName)
  if (pluginBIndex === -1) return

  const pluginAIndex = plugins.findIndex((p) => p.name === pluginAName)
  if (pluginAIndex === -1) return

  if (order === 'before' && pluginAIndex > pluginBIndex) {
    const pluginA = plugins.splice(pluginAIndex, 1)[0]
    plugins.splice(pluginBIndex, 0, pluginA)
  }

  if (order === 'after' && pluginAIndex < pluginBIndex) {
    const pluginA = plugins.splice(pluginAIndex, 1)[0]
    plugins.splice(pluginBIndex, 0, pluginA)
  }
}

export default defineConfig({
  lang: 'en-US',
  title: 'Smile',
  description: 'a gureckislab joint.',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  lastUpdated: true,
  markdown: {
    toc: {
      listType: 'ol',
    },
    config: (md) => {
      md.use(sub)
      md.use(footnote)
      md.use(Mark)
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
      Components({
        dirs: [resolve('.vitepress/theme/components')],
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        resolvers: [IconsResolver({ prefix: 'i' })],
      }),
      Icons({
        compiler: 'vue3',
        autoInstall: true,
      }),
      {
        name: 'vp-plugin-order-fix',
        configResolved(c) {
          movePlugin(c.plugins, 'tailwindcss:scan', 'after', 'vitepress')
          movePlugin(c.plugins, 'unplugin-icons', 'after', 'tailwindcss:scan')
          movePlugin(c.plugins, 'unplugin-vue-components', 'after', 'unplugin-icons')
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../../src'),
      },
    },
  },
  themeConfig: {
    nodeVersion: nodeVersion,
    outline: {
      level: 'deep',
    },
    search: {
      provider: 'local',
    },
    editLink: {
      pattern: 'https://github.com/nyuccl/smile/edit/main/docs/:path',
      text: 'Suggest changes to this page on GitHub',
    },
    nav: [
      { text: 'gureckislab.org', link: 'https://gureckislab.org' },
      {
        text: `v${version}`,
        items: [{ text: 'Release Notes', link: 'https://github.com/nyuccl/smile/releases' }],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/NYUCCL/smile' },
      { icon: 'twitter', link: 'https://twitter.com/todd_gureckis' },
    ],
    sidebar: [
      {
        text: 'Overview',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Key Concepts', link: '/concepts' },
          { text: 'Required software', link: '/requirements' },
          { text: 'Setup a new lab', link: '/labconfig' },
          { text: 'Adding a new user', link: '/adduser' },
          { text: 'Starting a new project', link: '/starting' },
          { text: 'Getting help', link: '/help' },
        ],
      },
      {
        text: 'Coding and Testing',
        items: [
          { text: 'Overview', link: '/coding/overview' },
          { text: 'Developing', link: '/coding/developing' },
          { text: 'Configuring', link: '/coding/configuration' },
          { text: 'Components', link: '/coding/components' },
          { text: 'Views', link: '/coding/views' },
          { text: 'Timeline and Design File', link: '/coding/timeline' },
          { text: 'Stepping Views', link: '/coding/steps' },
          { text: 'Autofill', link: '/coding/autofill' },

          { text: 'Randomization', link: '/coding/randomization' },
          { text: 'Persistence', link: '/coding/persistence' },
          { text: 'Data storage', link: '/coding/datastorage' },

          //{ text: '💰 Computing bonuses', link: '/bonuses' },
          //{ text: '🆘 Dealing with Errors', link: '/problems' },
          //{ text: 'Automated Testing', link: '/coding/testing' },
          //{ text: '🔌 Server-side Computations', link: '/server' },
        ],
      },
      {
        text: 'Style and Design',
        items: [
          { text: 'Overview', link: '/styling/styleoverview' },
          { text: 'Tailwind CSS', link: '/styling/tailwind' },
          { text: 'Dark Mode', link: '/styling/darkmode' },
          { text: 'Layouts', link: '/styling/layouts' },
          { text: 'UI Components', link: '/styling/uikit' },
          { text: 'Icons', link: '/styling/icons' },
          { text: 'Forms and Quizes', link: '/styling/forms' },
          { text: 'Images and Videos', link: '/styling/imagesvideo.md' },
          //{ text: 'Animations', link: '/styling/animations' },
        ],
      },
      {
        text: 'Recruiting participants',
        items: [
          { text: 'Deploying', link: '/recruit/deploying' },
          { text: 'Recruitment Services', link: '/recruit/recruitment' },
          //{ text: '📈 Dashboard', link: '/dashboard' },
          //{ text: '😇 Ethical considerations', link: '/ethics' },
        ],
      },
      {
        text: 'Analyzing data',
        items: [
          { text: 'Analyzing data', link: '/analysis' },
          //{ text: '🤖 Quality control', link: '/qualitycontrol' },
          { text: 'Presentation mode', link: '/presentation' },
        ],
      },
      {
        text: 'APIs and Advanced Documentation',
        items: [{ text: 'API', link: '/api' }],
      },

      {
        text: 'Contributing',
        items: [
          { text: 'Getting started contributing', link: '/gettingstarted' },
          { text: 'Contributing to the docs', link: '/contributing' },
          { text: 'Design Philosophy', link: '/philosophy' },
        ],
      },
      {
        text: 'Misc',
        items: [{ text: 'Cheat sheet', link: '/cheatsheet' }],
      },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2022-present Todd Gureckis',
    },
  },
})
