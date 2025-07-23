# Images and Video

**Static content** refers to files that aren't processed or built using Vite.
This includes binary files like PNG, JPG, MP4 or unprocessed text like JSON, and
so on. Including images, videos, and other content in your experiment is
straightforward. The main issues are where to place the files, how to refer to
them in your components, how to preload them so that the participant doesn't
wait for them to appear, and what to do for very large files that might not be
uploadable in a GitHub repository.

## Assets versus Public folder

There are two main places to put static content in a <SmileText/> project.

### Assets folder

The first place is the assets folder (specifically, `/src/user/assets/` folders
in the project directory). Files in the assets folders are preprocessed in a
helpful way. In particular, when your Smile project is "built" for deployment
images and other files in the assets folder are copied to the `/dist` folder
with a unique hash code appended to the filename (e.g., `logo.png` might be
renamed `logo-139efdf89.png`) and the references to those images are
automatically updated in your code. This is done to ensure that the browser does
not cache the previous version of the image. ==This can be really helpful== to
ensure that participants (and yourself) do not see old versions of images that
you have updated. You refer to these like this:

```html
<img src="@/user/assets/logo.png" alt="logo" />
```

for a `logo.png` file in the `/src/user/assets` folder.

### Public folder

The second place for static content/images is the top-level `/public` folder.
This is where you should put static images that you want to refer to directly in
your HTML or CSS. Content placed in this folder is copied directly into the
`dist` folder in the final build without the random hashing. All files in this
folder are moved even if they are not directly referenced in the code. This can
be useful sometimes as well. For example, if you want to be able to link to a
file in some other context (e.g., include the image in a different webpage) then
you want to use the public folder.

```html
<img src="/logo.png" alt="logo" />
```

You could then be able to link to this image on another website like this:

```html
<img src="https://exps.gureckislab.org/e/xx-xx-xx/logo.png" alt="logo" />
```

where the specific link depends on the final build destination of your
experiment (see
[this](/recruit/deploying#what-url-do-you-send-participants-to)). (If you tried
linking to content in the assets folder, it might change the filename from one
build to the next).

## Referring to static assets using code

The examples above use _static_ references to images (i.e., in the `template`
section of the code). This is fine for most cases. However, sometimes your code
might dynamically determine which image to display based on some other logic.

There are two specific methods in the [Smile API](/api) that can help you here.
The first is `api.getPublicUrl()` which will return the URL of a file in the
public folder. For example, imagine you have a set of images of bees in the
public folder (`public/bees/bees-01.svg`, `public/bees/bees-02.svg`, etc...).
You could dynamically load one of these images like this:

```vue
<script setup>
// load the API
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

// pick a random number
let n = Math.floor(Math.random() * 10)

const bee_public_fn = api.getPublicUrl(`bees/bees-0${n}.svg`) // load that bee
</script>
<template>
  <img :src="bee_public_fn" width="220" />
</template>
```

The path name to `api.getPublicUrl()` should be relative to the public folder
and should _not_ include the initial `/`.

Similarly to access a file in the static folder (`/src/user/assets`) use
`api.getStaticUrl()` again without the initial `/`:

```vue
<script setup>
// load the API
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

// pick a random number
let n = Math.floor(Math.random() * 10)

const bee_static_fn = api.getStaticUrl(`bees/bees-0${n}.svg`) // load that bee
</script>
<template>
  <img :src="bee_static_fn" width="220" />
</template>
```

There is also a `api.getCoreStaticUrl()` method that can be used to access files
as part of the core Smile builtin library (located at `src/assets`).

## Incorporating video files

For example, to embed a YouTube video you can

use the following code:

```html
<video></video>
```

## Dark mode and images

When your experiment supports dark mode, images may need special handling to
ensure they remain visible and appropriate in both light and dark themes. Some
images (like logos, icons, or diagrams) may appear too dark or too light
depending on the current color scheme.

<SmileText/> provides a helper class `dark-aware-img` that automatically applies
a CSS `invert` filter to images when dark mode is active. This is particularly
useful for images that are designed for light backgrounds but need to be visible
in dark mode.

To use this helper class, simply add it to your image elements:

```html
<img src="@/user/assets/logo.png" alt="logo" class="dark-aware-img" />
```

This will automatically invert the image colors when dark mode is enabled,
making dark images appear light and vice versa. This is especially helpful for:

- **Icons and logos** that are designed with dark colors for light backgrounds
- **Simple graphics and diagrams** that need to maintain contrast in both modes
- **UI elements** that should adapt to the current theme

Note that this inversion works best with images that have simple color schemes.
Complex photographs or images with many colors may not look ideal when inverted.
For such cases, consider providing separate light and dark versions of the image
and conditionally displaying them based on the current color mode.

## Preloading

Preloading refers to asking the browser to load an image or video before it is
needed so that the user isn't stuck waiting for it to load. This can be critical
in experiments where the stimuli must display quickly.

<SmileText/> provides an easy way to preload images or videos that are stored in
your project by calling `api.preloadAllImages()` or `api.preloadAllVideos()` at
an appropriate time (say, after the consent form). For example:

```
function finish() {
  api.preloadAllImages() // <-- add this to preload images
  api.stepNextView()
}
```

Note that <SmileText/> expects these files to be stored in `/src/user/assets`

## Dealing with large files

Github has limitations on the size of individual files as well as the total size
of the GitHub repo (including historical commits). As a result, it is a good
idea not to include very large files in your project. This is especially true
for video files which can be very large. Instead, you should host these files on
a service like Github's
[Large File Storage](https://docs.github.com/en/enterprise-cloud@latest/repositories/working-with-files/managing-large-files/about-git-large-file-storage)
system, Dropbox, Google Drive, YouTube or Vimeo and then embed them in your
experiment using the appropriate HTML tags.
