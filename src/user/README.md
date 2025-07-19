# User config

- design.js
  Defines the overall logic and flow of the experiment through main "phases" (which are called Views). These can include randomized and counter-balanced elements. This is also were we configure preloading of images and other assets.

- PresentationModeView.vue
  The presentation mode webpage

- components/
  A folder where you can put custom Vue components used in your design (E.g., your experimental task)

- assets/
  A folder where you can put images and other assets.

Other elements you might reference are in the /builtins folder. These a common elements like consent forms, instructions, and debriefing pages that are often used in experiments. You can customize these elements to fit your needs by changing the text. See the main docs for more information.
