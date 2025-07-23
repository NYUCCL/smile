# Dark Mode

Smile supports dark mode in a highly configurable way. Sometimes dark mode is
helpful for people to increase visibility for reading text. Other times though
dark mode might be undesirable because it alters the colors of an experiment in
a perceptually important way.

Smile allows customization of the dark mode settings for your experiment. You
can set it to always prefer light mode, always prefer dark mode, or to fall back
to the user's "system" setting, which is usually passed through by the browser.

## Configuration

You can configure dark mode for your experiment in two ways:

### Runtime Configuration

In your `src/user/design.js` file, you can set the color mode using:

```js
api.setRuntimeConfig('colorMode', 'light') // Always use light mode
api.setRuntimeConfig('colorMode', 'dark') // Always use dark mode
api.setRuntimeConfig('colorMode', 'system') // Use system preference
```

### Environment Variable

Alternatively, you can set the `VITE_COLOR_MODE` variable in your `.env` file:

```
VITE_COLOR_MODE = light    # Always use light mode
VITE_COLOR_MODE = dark     # Always use dark mode
VITE_COLOR_MODE = system   # Use system preference
```

The runtime configuration will override the environment variable if both are
set.

## Experimental Considerations

When designing your experiment, consider whether dark mode is appropriate for
your specific use case:

- **Perceptual Studies**: Dark mode changes the contrast and color properties of
  the entire interface, which could interfere with visual perception
  experiments, color discrimination tasks, or studies involving visual stimuli
  where contrast is important.

- **Reading Studies**: Dark mode can improve readability and reduce eye strain
  for text-heavy experiments or long reading tasks.

- **General Use**: For most standard experiments, either mode works well, but
  consider your specific experimental requirements when making this choice.

## Developer Tools

The developer mode tools have a separate dark mode configuration. You can toggle
dark mode for the developer tools irrespective of what you choose for the
experiment itself. This allows you to use dark mode for development while
keeping your experiment in light mode, or vice versa.

The dark mode button on the sidebar (lower left corner) will toggle the dark
mode for the developer tools. The sidebar on the right has a dropdown for
configuring the dark mode for the experiment. In addition, the developer tools
have a dark mode button in the top toolbar (upper right corner).

In presentation mode, the dark mode button in the top toolbar (upper right
corner) will toggle the dark mode for the presentation mode. These buttons
toggle between light, dark, and system preferences.
