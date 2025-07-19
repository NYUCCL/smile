/**
 * Creates a Vite plugin that switches between MainApp and SmileApp based on build mode
 * @returns {import('vite').Plugin} A Vite plugin object that transforms main.js
 */
export default function stripDevToolPlugin() {
  let config
  return {
    name: 'smile-strip-dev-tool', // name of the plugin
    configResolved(resolvedConfig) {
      // store the resolved config
      config = resolvedConfig
    },

    transform(src, id) {
      if (id.endsWith('main.js')) {
        console.log('  ➜  processing main.js for mode:', config.mode)

        if (config.mode == 'development') {
          // Replace MainApp import with SmileDevApp import for developer mode builds
          const updatedSrc = src.replace(
            /import App from '@\/core\/MainApp\.vue'/g,
            "import App from '@/dev/developer_mode/SmileDevApp.vue'"
          )
          return { code: updatedSrc }
        } else if (config.mode == 'presentation') {
          const updatedSrc = src.replace(
            /import App from '@\/core\/MainApp\.vue'/g,
            "import App from '@/dev/presentation_mode/PresentationModeApp.vue'"
          )
          return { code: updatedSrc }
        }
      }
    },
  }
}
